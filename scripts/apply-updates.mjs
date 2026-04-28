import fs from 'fs';

// Load data
const topicUsage = JSON.parse(fs.readFileSync('/tmp/topic-usage.json', 'utf8'));
const toolsContent = fs.readFileSync('src/data/tools.ts', 'utf8');
const topicsData = JSON.parse(fs.readFileSync('data/ai-topics.json', 'utf8'));
const existingTopics = new Map(topicsData.topics.map(t => [t.topic.toLowerCase(), t]));

// GitHub token for fetching detailed repo data
const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envContent.match(/GITHUB_TOKEN=["']?([^"'\n\r]+)/);
const GITHUB_TOKEN = tokenMatch[1].trim();

// Extract all GitHub repo URLs from tools.ts
const urlRegex = /url:\s*['"]https:\/\/github\.com\/([^'"]+)['"]/g;
const repos = [];
let m;
while ((m = urlRegex.exec(toolsContent)) !== null) {
  repos.push(m[1]);
}

console.log(`Processing ${repos.length} repos for data updates...`);

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
  // Also skip single-repo topics with count=1 that are brand-specific
  'comfy', 'comfyui', 'chineseocr', 'pp-ocr', 'ocr-engine', 'tesseract',
  'tesseract-ocr', 'yolov3', 'yolov5', 'yolo-world', 'yolo11', 'yolo26',
  'yolov8', 'face-recognition', 'deepfakes', 'claude-code-plugin',
  'claude-code-best-practices', 'claude-code-commands', 'claude-code-hooks',
  'claude-code-plugins', 'claude-code-skill', 'claude-cowork',
  'awesome-claude-code', 'deepseek-v3', 'bloomberg-terminal',
  'evaluation-framework', 'terminal-automation', 'autogen-extension',
  'autogen-ecosystem',
]);

// AI keyword patterns for topic validation
const aiPatterns = [
  /ai/, /ml$/, /dl$/, /llm/, /nlp/, /cv$/, /agent/, /robot/, /vision/,
  /neural/, /learning/, /generative/, /prompt/, /chatbot/, /deep-/,
  /machine-learning/, /transformer/, /gpt/, /diffusion/, /rag/,
  /embedding/, /inference/, /fine-tuning|finetuning|fine_tuning/, /llmops/,
  /mlops/, /model-serving/, /vector-search/, /semantic/, /knowledge-graph/,
  /multimodal/, /speech/, /text-to-speech/, /image-generation/,
  /video-generation/, /code-generation/, /autonomous/, /embodied/,
  /world-model/, /foundation-model/, /retrieval-augmented/,
  /instruction-tuning/, /rlhf/, /alignment/, /deepfake/, /deep-fake/,
  /deep-research/, /graphrag/, /agent-/, /multi-agent/, /multiagent/,
  /agentic/, /coding-agent|coding-agents/, /voice-clone/, /deepseek/,
  /claude-code/, /claude-skill/,
];

function isAITopic(topic) {
  if (skipTopics.has(topic)) return false;
  return aiPatterns.some(p => p.test(topic));
}

// Build new topics list
const newTopics = [];
for (const [topic, count] of Object.entries(topicUsage)) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  
  // Calculate minStars based on count
  let minStars;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  else minStars = 5000;
  
  // Generate description
  const descMap = {
    'deepseek': 'DeepSeek 大模型生态',
    'ultralytics': 'Ultralytics YOLO 生态',
    'yolo': 'YOLO 目标检测生态',
    'voice-clone': '语音克隆',
    'deepfake': 'Deepfake 换脸技术',
    'real-time-deepfake': '实时 Deepfake',
    'video-deepfake': '视频换脸',
  };
  
  const desc = descMap[topic] || topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${desc}`
  });
}

// Sort by count (usage frequency)
newTopics.sort((a, b) => {
  const ca = topicUsage[a.topic] || 0;
  const cb = topicUsage[b.topic] || 0;
  return cb - ca;
});

console.log(`New AI topics to add: ${newTopics.length}`);
for (const t of newTopics) {
  console.log(`  + ${t.topic} (${topicUsage[t.topic]} repos) → ${t.description}`);
}

// Update ai-topics.json
const updatedTopics = [...topicsData.topics, ...newTopics];
const now = new Date().toISOString();
topicsData.topics = updatedTopics;
topicsData.lastUpdated = now;

fs.writeFileSync('data/ai-topics.json', JSON.stringify(topicsData, null, 2) + '\n');
console.log(`\nai-topics.json updated: ${topicsData.topics.length} topics → ${updatedTopics.length}`);
console.log(`lastUpdated: ${now}`);

// Save summary for the report
const summary = {
  totalScanned: repos.length,
  newTopicsCount: newTopics.length,
  newTopics: newTopics.map(t => ({
    topic: t.topic,
    repos: topicUsage[t.topic],
    description: t.description
  }))
};
fs.writeFileSync('/tmp/update-summary.json', JSON.stringify(summary, null, 2));

console.log('\n✅ Topics update complete. Stars/forks/language update skipped (no sequential fetch needed for that).');
console.log('Summary saved to /tmp/update-summary.json');
