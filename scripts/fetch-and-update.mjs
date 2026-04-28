import fs from 'fs';

// Load GitHub token
const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envContent.match(/GITHUB_TOKEN=["']?([^"'\n\r]+)/);
const GITHUB_TOKEN = tokenMatch[1].trim();

// Read current tools.ts
let toolsContent = fs.readFileSync('src/data/tools.ts', 'utf8');

// Parse all tool objects - extract id, url, githubStars, forks, language, updatedAt
const toolBlocks = [];
const toolRegex = /\{\s*id:\s*["']([^"']+)["'][^}]*?url:\s*["']https:\/\/github\.com\/([^"']+)["'][^}]*?\}/gs;
let tb;
while ((tb = toolRegex.exec(toolsContent)) !== null) {
  const block = tb[0];
  const id = tb[1];
  const repo = tb[2];
  
  const starsMatch = block.match(/githubStars:\s*(\d+)/);
  const forksMatch = block.match(/forks:\s*(\d+)/);
  const langMatch = block.match(/language:\s*["']([^"']+)["']/);
  const updatedMatch = block.match(/updatedAt:\s*["']([^"']+)["']/);
  
  toolBlocks.push({
    id,
    repo,
    fullMatch: tb[0],
    startIndex: tb.index,
    endIndex: tb.index + tb[0].length,
    currentStars: starsMatch ? parseInt(starsMatch[1]) : null,
    currentForks: forksMatch ? parseInt(forksMatch[1]) : null,
    currentLanguage: langMatch ? langMatch[1] : null,
    currentUpdatedAt: updatedMatch ? updatedMatch[1] : null,
  });
}

console.log(`Found ${toolBlocks.length} tools with GitHub URLs`);

// Fetch data from GitHub API
const results = [];
const topicUsage = {};
const starsUpdates = [];
const forksUpdates = [];
const languageUpdates = [];

for (let i = 0; i < toolBlocks.length; i++) {
  const tool = toolBlocks[i];
  
  try {
    const res = await fetch(`https://api.github.com/repos/${tool.repo}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'ai-master-site-data-updater'
      }
    });
    
    if (!res.ok) {
      if (res.status === 404) continue;
      if (res.status === 403) {
        console.error(`Rate limited! Remaining calls exhausted.`);
        break;
      }
      console.warn(`  ${tool.repo}: HTTP ${res.status}`);
      continue;
    }
    
    const data = await res.json();
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLanguage = data.language;
    const pushedAt = data.pushed_at;
    const topics = data.topics || [];
    
    // Track topics
    for (const topic of topics) {
      const normalized = topic.toLowerCase().replace(/\s+/g, '-');
      topicUsage[normalized] = (topicUsage[normalized] || 0) + 1;
    }
    
    // Check for updates
    let updated = false;
    const updates = {};
    
    if (tool.currentStars !== null && newStars !== tool.currentStars) {
      updates.githubStars = newStars;
      starsUpdates.push({ id: tool.id, name: tool.id, old: tool.currentStars, new: newStars, diff: newStars - tool.currentStars });
      updated = true;
    }
    
    if (tool.currentForks !== null && newForks !== tool.currentForks) {
      updates.forks = newForks;
      forksUpdates.push({ id: tool.id, name: tool.id, old: tool.currentForks, new: newForks });
      updated = true;
    }
    
    if (tool.currentLanguage && newLanguage && tool.currentLanguage.toLowerCase() !== 'null' && newLanguage !== tool.currentLanguage) {
      updates.language = newLanguage;
      languageUpdates.push({ id: tool.id, name: tool.id, old: tool.currentLanguage, new: newLanguage });
      updated = true;
    }
    
    // Update updatedAt from pushed_at
    if (pushedAt) {
      const pushedDate = pushedAt.split('T')[0];
      if (tool.currentUpdatedAt !== pushedDate) {
        updates.updatedAt = pushedDate;
      }
    }
    
    if (updated) {
      results.push({ tool, data: updates });
    }
    
    if (i % 20 === 0) {
      console.log(`[${i+1}/${toolBlocks.length}] ${tool.repo} → stars:${newStars} forks:${newForks}`);
    }
    
    // Rate limit: 0.5s between requests (authenticated = 5000/hr)
    await new Promise(r => setTimeout(r, 500));
    
  } catch (err) {
    console.error(`  ${tool.repo}: ${err.message}`);
  }
}

console.log(`\n=== Update Summary ===`);
console.log(`Stars updates: ${starsUpdates.length}`);
for (const s of starsUpdates) {
  console.log(`  ${s.id}: ${s.old} → ${s.new} (${s.diff > 0 ? '+' : ''}${s.diff})`);
}
console.log(`Forks updates: ${forksUpdates.length}`);
console.log(`Language updates: ${languageUpdates.length}`);

// Apply updates to tools.ts
for (const result of results) {
  const { tool, data } = result;
  
  // We need to do targeted text replacements within each tool block
  // Since the blocks overlap in the original string, we process from end to start
  let blockText = tool.fullMatch;
  
  for (const [field, value] of Object.entries(data)) {
    if (field === 'updatedAt') continue; // handled separately
    
    const fieldRegex = new RegExp(`(\\s*)${field}:\\s*[^,\\n]+`, 'g');
    if (fieldRegex.test(blockText)) {
      // Field exists, replace value
      blockText = blockText.replace(
        new RegExp(`(${field}:\\s*)([^,\\n\\}]+)`),
        `$1${typeof value === 'string' ? `"${value}"` : value}`
      );
    } else {
      // Field doesn't exist, add it before createdAt or at end
      const formatted = typeof value === 'string' ? `"${value}"` : value;
      if (blockText.includes('createdAt')) {
        blockText = blockText.replace(/(\s+)(createdAt)/, `$1${field}: ${formatted},$2`);
      } else {
        // Add before closing brace
        blockText = blockText.replace(/(\s*\})$/, `\n    ${field}: ${formatted},$1`);
      }
    }
  }
  
  // Replace in the original content
  toolsContent = toolsContent.substring(0, tool.startIndex) + blockText + toolsContent.substring(tool.endIndex);
  
  // Recalculate positions for remaining blocks
  const diff = blockText.length - tool.fullMatch.length;
  for (const other of toolBlocks) {
    if (other.startIndex > tool.startIndex) {
      other.startIndex += diff;
      other.endIndex += diff;
    }
  }
}

// Write updated tools.ts
if (results.length > 0) {
  fs.writeFileSync('src/data/tools.ts', toolsContent);
  console.log('\n✅ tools.ts updated');
} else {
  console.log('\n✅ No changes needed for tools.ts');
}

// Now process topics
console.log(`\n=== Topic Discovery ===`);
console.log(`Total unique topics found: ${Object.keys(topicUsage).length}`);

// Load ai-topics.json
const topicsData = JSON.parse(fs.readFileSync('data/ai-topics.json', 'utf8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// Generic/boring topics to skip
const skipTopics = new Set([
  'framework', 'assistant', 'database', 'ui', 'api', 'skill', 'skills',
  'application', 'development', 'workflow', 'web', 'pdf', 'security',
  'torch', 'markdown', 'research', 'memory', 'model', 'interface', 'interfaces',
  'context', 'image', 'chat', 'models', 'agents', 'vector', 'r', 'html',
  'ide', 'yaml', 'ts', 'c', 'datasets', 'evaluation', 'mistral', 'webui',
  'llamacpp', 'mcp', 'search', 'robotic', 'embodied', 'video-processing',
  'image-processing', 'image-recognition', 'object-detection', 'segmentation',
  'tensorrt', 'video-analytics', 'voice-cloneai', 'chatchat', 'chatglm',
  'faiss', 'fastchat', 'streamlit', 'xinference', 'ollama', 'llama', 'autogen',
  'gemini', 'wechat', 'wechaty', 'llama3', 'pgvector', 'llama2', 'llamaindex',
  'smolagents', 'emnlp2024', 'vertex-ai', 'vertexai',
  'vertex-ai-gemini-api', 'modelcontextprotocol', 'go', 'app',
  'distributed', 'whisper', 'system', 'data', 'gateway', 'gui',
  'acp', 'work', 'sse', 'ci', 'cpp', 'coding',
  'harness', 'engineering', 'spec', 'systems', 'monitoring',
  'webcam', 'deepseek-api', 'llama-api',
  'comfy', 'comfyui', 'chineseocr', 'pp-ocr', 'ocr-engine', 'tesseract',
  'tesseract-ocr', 'yolov3', 'yolov5', 'yolo-world', 'yolo11', 'yolo26',
  'yolov8', 'face-recognition', 'deepfakes', 'claude-code-plugin',
  'claude-code-best-practices', 'claude-code-commands', 'claude-code-hooks',
  'claude-code-plugins', 'claude-code-skill', 'claude-cowork',
  'awesome-claude-code', 'deepseek-v3', 'bloomberg-terminal',
  'evaluation-framework', 'terminal-automation', 'autogen-extension',
  'autogen-ecosystem',
  // Additional generic ones
  'deepseek', 'ultralytics', 'yolo',
]);

// AI keyword patterns
const aiPatterns = [
  /ai$/, /^ai-/, /-ai$/, /-ai-/, /ml$/, /^ml-/, /dl$/, /^dl-/, /llm/, /nlp/,
  /cv$/, /^cv-/, /agent/, /robot/, /vision/, /neural/, /learning/, /generative/,
  /prompt/, /chatbot/, /deep-/, /machine-learning/, /transformer/, /gpt/,
  /diffusion/, /rag$/, /embedding/, /inference/, /fine-tuning|finetuning/,
  /llmops/, /mlops/, /model-serving/, /vector-search/, /semantic/,
  /knowledge-graph/, /multimodal/, /speech/, /text-to-speech/,
  /image-generation/, /video-generation/, /code-generation/, /autonomous/,
  /embodied/, /world-model/, /foundation-model/, /retrieval-augmented/,
  /instruction-tuning/, /rlhf/, /alignment/, /deepfake|deep-fake/,
  /deep-research/, /graphrag/, /agentic/, /coding-agent|coding-agents/,
  /voice-clone/,
];

function isAITopic(topic) {
  if (skipTopics.has(topic)) return false;
  return aiPatterns.some(p => p.test(topic));
}

const newTopics = [];
for (const [topic, count] of Object.entries(topicUsage)) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  
  let minStars;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  else minStars = 5000;
  
  const name = topic.replace(/-/g, ' ');
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${name}`
  });
}

newTopics.sort((a, b) => (topicUsage[b.topic] || 0) - (topicUsage[a.topic] || 0));

console.log(`New AI topics to add: ${newTopics.length}`);
for (const t of newTopics) {
  console.log(`  + ${t.topic} (${topicUsage[t.topic]} repos)`);
}

// Update ai-topics.json
if (newTopics.length > 0) {
  topicsData.topics = [...topicsData.topics, ...newTopics];
  topicsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync('data/ai-topics.json', JSON.stringify(topicsData, null, 2) + '\n');
  console.log(`\nai-topics.json: ${topicsData.topics.length} topics`);
}

// Save summary for Feishu report
const summary = {
  starsUpdates,
  forksUpdates,
  languageUpdates,
  newTopics: newTopics.map(t => ({ topic: t.topic, repos: topicUsage[t.topic] })),
  totalScanned: toolBlocks.length,
};
fs.writeFileSync('/tmp/update-summary.json', JSON.stringify(summary, null, 2));

console.log('\n✅ All updates complete');
console.log('Summary saved to /tmp/update-summary.json');
