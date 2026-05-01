import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Read env token
const envContent = readFileSync('.env.local', 'utf8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN found'); process.exit(1); }

// ─── Parse tools.ts ──────────────────────────────────────────────────────────
const toolsRaw = readFileSync('src/data/tools.ts', 'utf8');

// Extract all tool blocks with id, name, url, githubStars
const toolBlockRegex = /\{\s*id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?url:\s*"https:\/\/github\.com\/([^\/]+)\/([^"]+)"[\s\S]*?githubStars:\s*(\d+)/g;
const tools = [];
let match;
while ((match = toolBlockRegex.exec(toolsRaw)) !== null) {
  tools.push({
    id: match[1],
    name: match[2],
    owner: match[3],
    repo: match[4],
    currentStars: parseInt(match[5]),
    matchStart: match.index,
    matchEnd: match.index + match[0].length,
    fullMatch: match[0]
  });
}
console.log(`Found ${tools.length} tools with GitHub repos`);

// ─── Read existing topics ────────────────────────────────────────────────────
const topicsRaw = readFileSync('data/ai-topics.json', 'utf8');
const topicsData = JSON.parse(topicsRaw);
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
console.log(`Existing topics: ${topicsData.topics.length}`);

// ─── Fetch GitHub repos ─────────────────────────────────────────────────────
const allTopics = new Map();
const results = [];

async function fetchRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (resp.status === 404) return null;
    if (!resp.ok) {
      console.error(`  ⚠️ ${owner}/${repo}: HTTP ${resp.status}`);
      if (resp.status === 403) {
        const reset = resp.headers.get('x-ratelimit-reset');
        console.error(`    Rate limit reset at: ${new Date(parseInt(reset) * 1000).toLocaleString()}`);
        await new Promise(r => setTimeout(r, 2000));
      }
      return null;
    }
    const data = await resp.json();
    return {
      stars: data.stargazers_count || 0,
      pushedAt: data.pushed_at || '',
      forks: data.forks_count || 0,
      language: data.language || null,
      topics: Array.isArray(data.topics) ? data.topics : []
    };
  } catch (e) {
    console.error(`  ⚠️ ${owner}/${repo}: ${e.message}`);
    return null;
  }
}

for (let i = 0; i < tools.length; i++) {
  const tool = tools[i];
  const info = await fetchRepo(tool.owner, tool.repo);
  
  if (info) {
    tool.newStars = info.stars;
    tool.newPushedAt = info.pushedAt ? new Date(info.pushedAt).toISOString().split('T')[0] : tool.currentStars;
    tool.newForks = info.forks;
    tool.newLanguage = info.language;
    tool.changed = tool.newStars !== tool.currentStars;
    results.push(tool);
    
    // Collect topics
    for (const topic of info.topics) {
      const normalized = topic.toLowerCase().replace(/\s+/g, '-');
      allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
    }
  }
  
  // Progress log every 5 repos
  if ((i + 1) % 5 === 0 || i === tools.length - 1) {
    const updated = results.filter(r => r.changed);
    console.log(`  [${i + 1}/${tools.length}] ${tool.owner}/${tool.repo} ⭐${info ? info.stars : 'ERR'} ${info && info.stars !== tool.currentStars ? '(changed)' : ''}`);
  }
  
  // Rate limit protection: 1 second between requests
  if (i < tools.length - 1) {
    await new Promise(r => setTimeout(r, 500));
  }
}

// ─── Analyze changes ────────────────────────────────────────────────────────
const changedTools = results.filter(r => r.changed);
const forksUpdated = results.filter(r => r.newForks !== undefined && r.currentForks !== r.newForks);
const langUpdated = results.filter(r => r.newLanguage);

console.log(`\n📊 Results:`);
console.log(`  Scanned: ${results.length}/${tools.length}`);
console.log(`  Star changes: ${changedTools.length}`);
console.log(`  Topics collected: ${allTopics.size}`);

if (changedTools.length > 0) {
  console.log('\n⭐ Star changes:');
  for (const t of changedTools.sort((a, b) => (b.newStars - b.currentStars) - (a.newStars - a.currentStars))) {
    const diff = t.newStars - t.currentStars;
    console.log(`  ${t.name}: ${t.currentStars} → ${t.newStars} (${diff > 0 ? '+' : ''}${diff})`);
  }
}

// ─── Find new AI topics ─────────────────────────────────────────────────────
const aiKeywords = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-model', 'retrieval-augmented', 'instruction-tuning',
  'rlhf', 'alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => {
    // Exact match
    if (t === kw) return true;
    // Topic contains keyword
    if (t.includes(kw)) return true;
    // Keyword appears in topic with word boundaries
    const words = t.split('-');
    return words.some(w => w === kw || kw.includes(w));
  });
}

const newAITopics = [];
for (const [topic, count] of allTopics) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  
  // Skip very cold topics (single repo, likely too niche)
  if (count < 2) continue;
  
  let minStars;
  if (count >= 3) minStars = 2000;
  else minStars = 3000;
  
  newAITopics.push({ topic, count, minStars });
}

newAITopics.sort((a, b) => b.count - a.count);

console.log(`\n🔍 New AI topics: ${newAITopics.length}`);
for (const t of newAITopics) {
  console.log(`  ${t.topic} — ${t.count} repos, minStars: ${t.minStars}`);
}

// ─── Write results to temp files for the commit script to use ───────────────
writeFileSync('data/_github-results.json', JSON.stringify({
  changedTools: changedTools.map(t => ({
    id: t.id,
    name: t.name,
    oldStars: t.currentStars,
    newStars: t.newStars,
    newForks: t.newForks,
    newLanguage: t.newLanguage,
    newPushedAt: t.newPushedAt
  })),
  newAITopics: newAITopics,
  totalScanned: results.length,
  totalChanged: changedTools.length
}, null, 2));

// Write updated tools.ts content
let updatedTools = toolsRaw;

for (const tool of changedTools) {
  // Find the exact position of githubStars in the tool block
  // We need to update the githubStars value
  const starRegex = new RegExp(`(id:\\s*"${tool.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?githubStars:\\s*)\\d+`);
  const starMatch = updatedTools.match(starRegex);
  if (starMatch) {
    updatedTools = updatedTools.replace(starRegex, `$1${tool.newStars}`);
    console.log(`  Updated ${tool.name} stars: ${tool.currentStars} → ${tool.newStars}`);
  }
}

if (updatedTools !== toolsRaw) {
  writeFileSync('src/data/tools.ts', updatedTools);
  console.log('\n✅ tools.ts updated');
} else {
  console.log('\n⏭️ tools.ts unchanged (no star updates)');
}

// Write updated topics
if (newAITopics.length > 0) {
  for (const t of newAITopics) {
    topicsData.topics.push({
      topic: t.topic,
      url: `https://github.com/topics/${t.topic}`,
      minStars: t.minStars,
      description: `（自动发现）${t.topic.replace(/-/g, ' ')}`
    });
  }
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync('data/ai-topics.json', JSON.stringify(topicsData, null, 2));
  console.log(`✅ ai-topics.json updated: ${topicsData.topics.length} topics (+${newAITopics.length})`);
} else {
  console.log('⏭️ ai-topics.json unchanged (no new topics)');
}

// Done
console.log('\n✅ Update complete');
