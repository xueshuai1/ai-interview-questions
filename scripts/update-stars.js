#!/usr/bin/env node
/**
 * 批量更新 tools.ts 中的 GitHub stars、forks、language
 * 同时收集 topics 用于 ai-topics.json 自生长
 * 
 * 修复：使用 Authorization header 而非 ?access_token= 查询参数（已废弃）
 */

const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.join(__dirname, '..', 'data', 'ai-topics.json');

// AI 相关关键词
const AI_KEYWORDS = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning',
  'rlhf', 'alignment'
];

function extractReposFromToolsTS(content) {
  const urlRegex = /url:\s*["']https:\/\/github\.com\/([^"']+)["']/g;
  const repos = [];
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const full = match[1];
    const parts = full.split('/').filter(Boolean);
    if (parts.length >= 2) {
      repos.push(`${parts[0]}/${parts[1]}`);
    }
  }
  return [...new Set(repos)];
}

function extractExistingStars(content) {
  const starsMap = {};
  const lines = content.split('\n');
  let currentRepo = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const urlMatch = line.match(/url:\s*["']https:\/\/github\.com\/([^"']+)["']/);
    if (urlMatch) {
      const parts = urlMatch[1].split('/').filter(Boolean);
      if (parts.length >= 2) {
        currentRepo = `${parts[0]}/${parts[1]}`;
      }
    }
    if (currentRepo) {
      const starsMatch = line.match(/githubStars:\s*(\d+)/);
      const forksMatch = line.match(/forks:\s*(\d+)/);
      const langMatch = line.match(/language:\s*["']([^"']+)["']/);
      
      if (starsMatch || forksMatch || langMatch) {
        if (!starsMap[currentRepo]) {
          starsMap[currentRepo] = { oldStars: null, oldForks: null, oldLanguage: null };
        }
        if (starsMatch) starsMap[currentRepo].oldStars = parseInt(starsMatch[1]);
        if (forksMatch) starsMap[currentRepo].oldForks = parseInt(forksMatch[1]);
        if (langMatch) starsMap[currentRepo].oldLanguage = langMatch[1];
      }
    }
    if (line.includes('id:') && line.includes('"') && !line.includes('url:')) {
      currentRepo = null;
    }
  }
  return starsMap;
}

async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ai-master-site-bot/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (resp.status === 404) {
      console.log(`  ⚠️  404: ${repo}`);
      return null;
    }
    if (resp.status === 403) {
      const body = await resp.text();
      console.log(`  ⛔ Rate limited: ${repo} - ${body.substring(0, 100)}`);
      return null;
    }
    if (resp.status !== 200) {
      const body = await resp.text();
      console.log(`  ⚠️  HTTP ${resp.status}: ${repo} - ${body.substring(0, 100)}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.log(`  ❌ Error: ${repo} - ${e.message}`);
    return null;
  }
}

function isAIKeyword(topic) {
  const lower = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => lower === kw || lower.includes(kw) || kw.includes(lower));
}

function normalizeTopic(topic) {
  return topic.toLowerCase().replace(/\s+/g, '-');
}

async function main() {
  console.log('🔍 读取 tools.ts...');
  const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf8');
  const repos = extractReposFromToolsTS(toolsContent);
  const existingStars = extractExistingStars(toolsContent);
  
  console.log(`📋 找到 ${repos.length} 个 GitHub 仓库`);
  
  // Load existing topics
  console.log('📋 读取 ai-topics.json...');
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
  
  console.log(`📋 已有 ${existingTopics.size} 个 AI Topic`);
  
  // Fetch all repos sequentially
  const results = {};
  let successCount = 0;
  let failCount = 0;
  let consecutiveFails = 0;
  
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    process.stdout.write(`  [${i + 1}/${repos.length}] ${repo}... `);
    const data = await fetchRepo(repo);
    if (data) {
      results[repo] = data;
      successCount++;
      consecutiveFails = 0;
      console.log(`⭐ ${data.stargazers_count.toLocaleString()} | 🍴 ${data.forks_count} | 📅 ${data.pushed_at?.substring(0, 10)} | 🏷️ ${(data.topics || []).length}`);
    } else {
      failCount++;
      consecutiveFails++;
      console.log('');
      
      // If 10+ consecutive failures, likely rate limited - stop
      if (consecutiveFails >= 5) {
        console.log(`  ⛔ 连续 ${consecutiveFails} 次失败，可能限流，停止请求`);
        break;
      }
    }
    // Rate limit protection: 1.5 second delay
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log(`\n📊 成功获取 ${successCount}/${repos.length} 个仓库`);
  
  // Analyze changes
  let starsUpdated = 0;
  let forksUpdated = 0;
  let languageUpdated = 0;
  const starChanges = [];
  const topicUsageCount = {};
  
  for (const [repo, data] of Object.entries(results)) {
    const old = existingStars[repo] || {};
    const newStars = data.stargazers_count || 0;
    const newForks = data.forks_count || 0;
    const newLanguage = data.language || null;
    
    if (old.oldStars !== null && newStars !== old.oldStars) {
      starsUpdated++;
      starChanges.push({
        repo,
        old: old.oldStars,
        new: newStars,
        delta: newStars - old.oldStars
      });
    }
    
    if (old.oldForks !== null && newForks !== old.oldForks && newForks > 0) {
      forksUpdated++;
    }
    
    if (old.oldLanguage && newLanguage && old.oldLanguage !== newLanguage) {
      languageUpdated++;
    }
    
    // Collect topics
    if (data.topics && data.topics.length > 0) {
      for (const topic of data.topics) {
        const normalized = normalizeTopic(topic);
        if (!topicUsageCount[normalized]) {
          topicUsageCount[normalized] = { count: 0, repos: [] };
        }
        topicUsageCount[normalized].count++;
        topicUsageCount[normalized].repos.push(repo);
      }
    }
  }
  
  // Find new AI topics
  const allNewTopics = [];
  for (const [topic, info] of Object.entries(topicUsageCount)) {
    if (existingTopics.has(topic)) continue;
    
    if (isAIKeyword(topic)) {
      allNewTopics.push({
        topic,
        url: `https://github.com/topics/${topic}`,
        repos: info.repos,
        count: info.count,
        maxStars: Math.max(...info.repos.map(r => (results[r]?.stargazers_count) || 0))
      });
    }
  }
  
  // Filter out very cold topics
  const validNewTopics = allNewTopics.filter(t => {
    if (t.count === 1 && t.maxStars < 1000) return false;
    return true;
  });
  
  // Descriptions mapping
  const descriptions = {
    'self-evolving': '自进化 AI 系统',
    'self-evolution': '自进化机制',
    'ai-coding': 'AI 编程辅助',
    'agentic-coding': 'Agentic 编程',
    'coding-agents': '编程智能体',
    'agentic-code': 'Agentic 代码生成',
    'deepresearch': '深度研究自动化',
    'deep-research': '深度研究',
    'browser-automation': '浏览器自动化',
    'task-automation': '任务自动化',
    'context-engineering': '上下文工程',
    'agent-memory': 'Agent 记忆系统',
    'llm-memory': 'LLM 记忆管理',
    'memory-agent': '记忆 Agent',
    'agent-development': 'Agent 开发',
    'agent-skills': 'Agent 技能',
    'autonomous-agent': '自主 Agent',
    'multi-agent-systems': '多智能体系统',
    'agents-sdk': 'Agents SDK',
    'multi-agents-collaboration': '多 Agent 协作',
    'agentscope': 'AgentScope 框架',
    'agentscope-runtime': 'AgentScope 运行时',
    'background-agents': '后台 Agent',
    'codex-cli': 'Codex CLI',
    'voice-clone': '声音克隆',
    'distributed-training': '分布式训练',
    'model-parallelism': '模型并行',
    'langchain4j': 'LangChain Java 版',
    'azure-openai': 'Azure OpenAI',
    'litellm': 'LiteLLM 生态',
    'openai-proxy': 'OpenAI 代理',
    'multi-agents': '多智能体',
    'aiagentframework': 'AI Agent 框架',
    'claude-code-agents': 'Claude Code Agent',
    'agency-agents': 'Agency Agent',
    'chatgpt-on-wechat': 'ChatGPT 微信',
    'linkai': 'LinkAI 生态',
    'gpt-5': 'GPT-5 生态',
    'chinese-language': '中文语言处理',
    'interactive-learning': '交互式学习',
    'mlx': 'Apple MLX 框架',
    'long-term-memory': '长期记忆',
    'memory-system': '记忆系统',
    'memory-engine': '记忆引擎',
    'supermemory': 'SuperMemory 生态',
    'nous-research': 'NousResearch 生态',
    'ollama-webui': 'Ollama WebUI',
    'openmemory': 'OpenMemory 项目',
    'claude-code-best-practices': 'Claude Code 最佳实践',
    'claude-code-commands': 'Claude Code 命令',
    'code-execution': '代码执行',
    'code-interpreter': '代码解释器',
    'harness': 'AI Harness 框架',
    'remote-mcp-server': '远程 MCP 服务',
    'anti-bot': '反机器人检测',
    'claude-3': 'Claude 3 生态',
    'claude-cowork': 'Claude 协作',
    'claude-skills': 'Claude 技能',
    'dall-e': 'DALL-E 生态',
    'discord-bot': 'Discord 机器人',
    'investment-research': '投资研究',
    'llama-api': 'Llama API',
    'multi-speaker-tts': '多说话人语音合成',
    'self-hosted': '自托管',
    'slack-bot': 'Slack 机器人',
    'telegram-bot': 'Telegram 机器人',
    'trae-ide': 'Trae IDE',
    'scikit-learn': 'scikit-learn 生态',
    'research-paper': '研究论文',
    'memory-management': '记忆管理',
    'deep-face-swap': '深度换脸',
    'semantic-kernel': '语义内核',
    'real-time-deepfake': '实时深度伪造',
    'realtime-deepfake': '实时深度伪造',
    'video-deepfake': '视频深度伪造',
    'deepfakes': '深度伪造',
    'deepfake-webcam': '深度伪造摄像头',
    'creative-tools': '创意工具',
    'image2image': '图生图',
    'text2image': '文生图',
    'wan-video': 'Wan 视频生成',
    'image-to-video': '图生视频',
    'vector-index': '向量索引',
    'enterprise-search': '企业搜索',
    'hybrid-search': '混合搜索',
    'search-as-you-type': '即时搜索',
    'typo-tolerance': '容错搜索',
    'code-free': '无代码开发',
    'quant-models': '量化模型',
    'image-classification': '图像分类',
    'yolo-world': 'YOLO-World 目标检测',
    'deepface': 'DeepFace 人脸识别',
    'gigapixel-images': '十亿像素图像',
    'image-upscaling': '图像超分辨率',
    'torchaudio': 'TorchAudio 音频处理',
    'image-search': '图像搜索',
    'nearest-neighbor-search': '最近邻搜索',
    'vector-similarity': '向量相似度',
    'vector-store': '向量存储',
    'code-analysis': '代码分析',
    'web-search': '网络搜索',
    'text-generation': '文本生成',
    'audio-generation': '音频生成',
    'job-search': '求职搜索',
    'model-hub': '模型中心',
    'codegenerator': '代码生成器',
    'big-model': '大模型',
    'torch': 'Torch 框架',
    'no-code': '无代码',
    'low-code': '低代码',
    'low-code-platform': '低代码平台',
    'tts-model': 'TTS 模型',
    'developer-tools': '开发者工具',
    'deepseek-api': 'DeepSeek API',
    'workflow-automation': '工作流自动化',
    'chat-ui': 'AI 对话界面',
    'multi-model': '多模型统一接入',
    'multi-platform': '跨平台支持',
    'deepseek-v3': 'DeepSeek V3',
    'autogen-ecosystem': 'AutoGen 生态扩展',
    'copilot-chat': 'Copilot 聊天',
    'codebase-generation': '代码库生成',
    'codegen': '代码生成',
    'claude-code-hooks': 'Claude Code 钩子',
    'claude-code-plugins': 'Claude Code 插件',
    'claude-code-skill': 'Claude Code 技能',
    'context-mode': '上下文模式',
    'claude-code-plugin': 'Claude Code 插件',
    'tokens': 'Token 优化',
    'awesome-claude-code': 'Awesome Claude Code',
    'codex-skills': 'Codex 技能',
    'context-database': '上下文数据库',
    'code-search': '语义代码搜索',
    'terminal-automation': '终端自动化',
    'brain-computer-interface': '脑机接口',
    'opencode': 'OpenCode 开源项目',
    'cli-tool': 'CLI 工具',
    'desktop-automation': '桌面自动化',
    'headless-browser': '无头浏览器',
    'computer-use-agent': '计算机使用 Agent',
    'gui-agents': 'GUI 智能体',
    'agent-computer-interface': 'Agent 计算机界面',
    'mllm': '多模态大语言模型',
    'embodied': '具身智能',
    'robotic': '机器人技术',
    'reinforcement-learning-algorithms': '强化学习算法',
    'search-engine': '搜索引擎',
    'sentence-embeddings': '句子嵌入',
    'txtai': 'TxtAI 生态',
    'text-semantic-similarity': '文本语义相似度',
    'chat-gpt': 'ChatGPT 生态',
    'chatgpt3': 'ChatGPT-3 生态',
    'chatgpt35-turbo': 'ChatGPT-3.5 Turbo',
    'claude': 'Claude AI 生态',
    'mcp-gateway': 'MCP 网关',
    'model-router': '模型路由',
    'image-processing': '图像处理',
    'spatial-ai': '空间 AI',
    'in-context-reinforcement-learning': '上下文内强化学习',
    'memory-retrieval': '记忆检索',
    'mistral': 'Mistral 生态',
    'webui': 'Web UI',
    'retrieval-systems': '检索系统',
    'robot-learning': '机器人学习',
    'multimodal-learning': '多模态学习',
    'speech-processing': '语音处理',
    'agent-infrastructure': 'Agent 基础设施',
    'ai-infrastructure': 'AI 基础设施',
    'context-retrieval': '上下文检索',
    'search-api': '搜索 API',
    'firecrawl-ai': 'Firecrawl AI',
    'ai-native': 'AI 原生',
    'model-context-protocol-servers': 'MCP 服务器',
    'coreml': 'Apple CoreML',
    'ide': '集成开发环境',
    'omo': 'OmO 生态',
    'multiagent-systems': '多智能体系统',
    'distributed-training': '分布式训练',
    'langchain4j': 'LangChain Java 版',
    'openai-codex': 'OpenAI Codex 生态',
    'antigravity-ide': '反重力 IDE',
    'assistant-chat-bots': '助手聊天机器人',
    'auto-quant': '自动量化',
    'bot-detection': '机器人检测',
    'research': '学术研究',
    'memory': '记忆系统',
    'deepfake': '深度伪造',
    'realtime-deepfake': '实时深度伪造',
    'video-deepfake': '视频深度伪造',
    'image-search': '图像搜索',
    'nearest-neighbor-search': '最近邻搜索',
    'vector-similarity': '向量相似度',
    'vector-store': '向量存储',
    'code-execution': '代码执行',
    'code-interpreter': '代码解释器',
    'harness': 'AI Harness',
    'self-evolution': '自进化',
    'code-free': '无代码开发',
    'quant-models': '量化模型',
    'image2image': '图生图',
    'text2image': '文生图',
    'image-classification': '图像分类',
    'yolo-world': 'YOLO-World',
    'deepface': 'DeepFace',
    'deepfakes': '深度伪造',
    'gigapixel-images': '超高分辨率图像',
    'image-upscaling': '图像超分辨率',
    'topaz': 'Topaz 图像处理',
    'torchaudio': 'TorchAudio',
    'creative-tools': '创意工具',
    'image-to-video': '图生视频',
    'wan-video': 'Wan 视频生成',
    'vector-index': '向量索引',
    'app-search': '应用搜索',
    'enterprise-search': '企业搜索',
    'full-text-search': '全文搜索',
    'fuzzy-search': '模糊搜索',
    'hybrid-search': '混合搜索',
    'search-as-you-type': '即时搜索',
    'site-search': '站内搜索',
    'typo-tolerance': '容错搜索',
    'claude-code-best-practices': 'Claude Code 最佳实践',
    'claude-code-commands': 'Claude Code 命令',
    'remote-mcp-server': '远程 MCP 服务器',
    'anti-bot': '反机器人',
    'dall-e': 'DALL-E',
    'discord-bot': 'Discord 机器人',
    'llama-api': 'Llama API',
    'multi-speaker-tts': '多说话人 TTS',
    'slack-bot': 'Slack 机器人',
    'telegram-bot': 'Telegram 机器人',
    'scikit-learn-python': 'scikit-learn Python',
    'research-paper': '研究论文',
    'memory-management': '记忆管理',
    'memory-system': '记忆系统',
    'deep-face-swap': '深度换脸',
    'semantic-kernel': '语义内核',
    'deepfake-webcam': '深度伪造摄像头',
  };
  
  // Update tools.ts
  let newContent = toolsContent;
  let toolsModified = false;
  
  for (const [repo, data] of Object.entries(results)) {
    const old = existingStars[repo] || {};
    const newStars = data.stargazers_count || 0;
    const newForks = data.forks_count || 0;
    const newLanguage = data.language || null;
    
    if (old.oldStars !== null && newStars !== old.oldStars) {
      const oldStr = `githubStars: ${old.oldStars}`;
      const newStr = `githubStars: ${newStars}`;
      if (newContent.includes(oldStr)) {
        newContent = newContent.replace(oldStr, newStr);
        toolsModified = true;
      }
    }
    
    if (old.oldForks !== null && newForks !== old.oldForks && newForks > 0) {
      const oldFStr = `forks: ${old.oldForks}`;
      const newFStr = `forks: ${newForks}`;
      if (newContent.includes(oldFStr)) {
        newContent = newContent.replace(oldFStr, newFStr);
        toolsModified = true;
      }
    }
    
    if (old.oldLanguage && newLanguage && old.oldLanguage !== newLanguage) {
      const oldLStr = `language: "${old.oldLanguage}"`;
      const newLStr = `language: "${newLanguage}"`;
      if (newContent.includes(oldLStr)) {
        newContent = newContent.replace(oldLStr, newLStr);
        toolsModified = true;
      }
    }
  }
  
  if (toolsModified) {
    fs.writeFileSync(TOOLS_PATH, newContent, 'utf8');
    console.log('✅ tools.ts 已更新');
  } else {
    console.log('ℹ️  tools.ts 无变化');
  }
  
  // Update ai-topics.json
  const newTopicEntries = validNewTopics.map(t => {
    let minStars = 5000;
    if (t.count >= 3) minStars = 2000;
    else if (t.count >= 2) minStars = 3000;
    else minStars = 5000;
    
    const desc = descriptions[t.topic] || `（自动发现）${t.topic}`;
    
    return {
      topic: t.topic,
      url: t.url,
      minStars,
      description: desc
    };
  });
  
  if (newTopicEntries.length > 0) {
    topicsData.topics.push(...newTopicEntries);
    topicsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2), 'utf8');
    console.log(`✅ ai-topics.json 已更新，新增 ${newTopicEntries.length} 个 Topic`);
  } else {
    console.log('ℹ️  未发现新的 AI Topic');
  }
  
  // Summary
  console.log('\n📊 ===== 更新摘要 =====');
  console.log(`扫描仓库: ${repos.length} 个`);
  console.log(`成功获取: ${successCount} 个`);
  console.log(`Stars 更新: ${starsUpdated} 个`);
  console.log(`Forks 更新: ${forksUpdated} 个`);
  console.log(`Language 更新: ${languageUpdated} 个`);
  console.log(`收集 Topics: ${Object.keys(topicUsageCount).length} 个`);
  console.log(`新增 AI Topics: ${validNewTopics.length} 个`);
  
  if (starChanges.length > 0) {
    console.log('\n📈 Stars 变化:');
    starChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    for (const c of starChanges.slice(0, 10)) {
      const arrow = c.delta > 0 ? '↑' : '↓';
      console.log(`  ${c.repo}: ${c.old.toLocaleString()} → ${c.new.toLocaleString()} (${arrow}${Math.abs(c.delta)})`);
    }
  }
  
  if (validNewTopics.length > 0) {
    console.log('\n🔍 新增 AI Topics:');
    for (const t of validNewTopics) {
      const desc = descriptions[t.topic] || t.topic;
      console.log(`  ${t.topic} — ${desc} (${t.count} 个仓库使用)`);
    }
  }
  
  const output = {
    reposScanned: repos.length,
    reposFetched: successCount,
    starsUpdated,
    forksUpdated,
    languageUpdated,
    topicsCollected: Object.keys(topicUsageCount).length,
    newTopicsCount: validNewTopics.length,
    toolsModified,
    starChanges: starChanges.slice(0, 10),
    newTopics: validNewTopics.map(t => ({
      topic: t.topic,
      description: descriptions[t.topic] || t.topic,
      count: t.count
    })),
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync(path.join(__dirname, 'update-summary.json'), JSON.stringify(output, null, 2));
  console.log('\n✅ 完成');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
