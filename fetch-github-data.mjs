import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Get GitHub token
const envContent = readFileSync('.env.local', 'utf-8');
const tokenMatch = envContent.match(/GITHUB_TOKEN=(.+)/);
const GITHUB_TOKEN = tokenMatch ? tokenMatch[1].trim() : '';
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN found'); process.exit(1); }

// Load tools.ts
const toolsRaw = readFileSync('./src/data/tools.ts', 'utf-8');
// Load ai-topics.json
const topicsData = JSON.parse(readFileSync('./data/ai-topics.json', 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// Extract GitHub repos from tools.ts - find url: "https://github.com/owner/repo"
const repoRegex = /url:\s*"https:\/\/github\.com\/([^"]+)"/g;
const repoSet = new Set();
let m;
while ((m = repoRegex.exec(toolsRaw)) !== null) {
  const repo = m[1].replace(/\/$/, ''); // remove trailing slash
  if (repo) repoSet.add(repo);
}

const repos = [...repoSet];
console.log(`Found ${repos.length} GitHub repos`);

// AI keyword list for topic filtering
const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-model',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t.includes(kw));
}

// Fetch GitHub API with rate limiting
async function fetchRepoInfo(repo) {
  const url = `https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`;
  try {
    const resp = await fetch(url, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ai-master-site' }
    });
    if (!resp.ok) {
      console.error(`  ❌ ${repo}: HTTP ${resp.status}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error(`  ❌ ${repo}: ${e.message}`);
    return null;
  }
}

const results = [];
const allTopics = new Map(); // topic -> count of repos using it

for (let i = 0; i < repos.length; i++) {
  const repo = repos[i];
  console.log(`[${i+1}/${repos.length}] Fetching ${repo}...`);
  const data = await fetchRepoInfo(repo);
  if (data) {
    results.push({ repo, data });
    // Collect topics
    if (data.topics && Array.isArray(data.topics)) {
      for (const topic of data.topics) {
        allTopics.set(topic, (allTopics.get(topic) || 0) + 1);
      }
    }
  }
  // Rate limit: 1s between requests
  if (i < repos.length - 1) await new Promise(r => setTimeout(r, 1000));
}

console.log(`\n✅ Fetched ${results.length} repos successfully`);
console.log(`📊 Collected ${allTopics.size} unique topics`);

// Save results
writeFileSync('./tmp/github-data.json', JSON.stringify({
  results: results.map(r => ({
    repo: r.repo,
    stargazers_count: r.data.stargazers_count,
    pushed_at: r.data.pushed_at,
    forks_count: r.data.forks_count,
    language: r.data.language,
    topics: r.data.topics || []
  })),
  allTopics: Object.fromEntries(allTopics)
}, null, 2));

console.log('💾 Saved to tmp/github-data.json');
