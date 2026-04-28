const fs = require('fs');
const https = require('https');

// Read current data
const toolsContent = fs.readFileSync('src/data/tools.ts', 'utf8');
const topicsData = JSON.parse(fs.readFileSync('data/ai-topics.json', 'utf8'));

// Extract tools with GitHub URLs and current data
const idRegex = /id:\s*['"]([^'"]+)['"]/g;
const urlRegex = /url:\s*['"](https:\/\/github\.com\/([^'"]+))['"]/g;
const starsRegex = /githubStars:\s*(\d+)/g;
const forksRegex = /forks:\s*(\d+)/g;
const langRegex = /language:\s*['"]([^'"]+)['"]/g;

// Parse tools in order
const lines = toolsContent.split('\n');
const tools = [];
let currentTool = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
  if (idMatch) {
    if (currentTool) tools.push(currentTool);
    currentTool = { id: idMatch[1], lineIndex: i, url: null, ownerRepo: null, githubStars: null, forks: null, language: null };
    continue;
  }
  
  if (!currentTool) continue;
  
  const urlMatch = line.match(/url:\s*['"](https:\/\/github\.com\/([^'"]+))['"]/);
  if (urlMatch) {
    currentTool.url = urlMatch[1];
    currentTool.ownerRepo = urlMatch[2];
    continue;
  }
  
  const starsMatch = line.match(/githubStars:\s*(\d+)/);
  if (starsMatch) {
    currentTool.githubStars = parseInt(starsMatch[1]);
    continue;
  }
  
  const forksMatch = line.match(/forks:\s*(\d+)/);
  if (forksMatch) {
    currentTool.forks = parseInt(forksMatch[1]);
    continue;
  }
  
  const langMatch = line.match(/language:\s*['"]([^'"]+)['"]/);
  if (langMatch) {
    currentTool.language = langMatch[1];
  }
}
if (currentTool) tools.push(currentTool);

const githubTools = tools.filter(t => t.ownerRepo);
console.log(`Found ${githubTools.length} tools with GitHub repos`);

// AI Topic keywords
const aiKeywords = [
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

// Existing topics
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// Sleep helper
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Fetch with auth
function fetchRepo(ownerRepo, token) {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${ownerRepo}`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'ai-master-site/1.0',
        'Authorization': `token ${token}`
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else if (res.statusCode === 404) {
          resolve(null); // repo not found
        } else {
          resolve({ error: `HTTP ${res.statusCode}`, body: data.substring(0, 200) });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN not set');
    process.exit(1);
  }

  const results = [];
  const allTopics = new Map(); // topic -> { count, repos }

  for (let i = 0; i < githubTools.length; i++) {
    const tool = githubTools[i];
    if (i > 0 && i % 20 === 0) {
      console.log(`Progress: ${i}/${githubTools.length} (${Math.round(i/githubTools.length*100)}%)`);
    }

    const data = await fetchRepo(tool.ownerRepo, token);
    await sleep(800); // rate limit protection (auth: 5000/hr)

    if (!data || data.error) {
      results.push({ ...tool, status: data ? 'error' : 'not_found' });
      continue;
    }

    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLang = data.language || null;
    const pushedAt = data.pushed_at ? data.pushed_at.split('T')[0] : null;
    const topics = data.topics || [];

    results.push({
      ...tool,
      status: 'ok',
      newStars,
      newForks,
      newLang,
      pushedAt,
      topics
    });

    // Collect topics
    for (const topic of topics) {
      const normalized = topic.toLowerCase().replace(/\s+/g, '-');
      if (!allTopics.has(normalized)) {
        allTopics.set(normalized, { count: 0, repos: [] });
      }
      const entry = allTopics.get(normalized);
      entry.count++;
      entry.repos.push(tool.id);
    }
  }

  console.log(`\nFetched ${results.filter(r => r.status === 'ok').length} repos successfully`);

  // Analyze changes
  const starsChanges = results.filter(r => r.status === 'ok' && r.newStars !== r.githubStars);
  const forksChanges = results.filter(r => r.status === 'ok' && r.newForks !== (r.forks || 0));
  const langChanges = results.filter(r => r.status === 'ok' && r.newLang !== r.language);

  console.log(`Stars changes: ${starsChanges.length}`);
  console.log(`Forks changes: ${forksChanges.length}`);
  console.log(`Language changes: ${langChanges.length}`);

  // Find new AI topics
  const newAiTopics = [];
  for (const [topic, info] of allTopics) {
    if (existingTopics.has(topic)) continue;
    
    // Check if AI-related
    const isAiRelated = aiKeywords.some(kw => topic.includes(kw) || kw.includes(topic));
    if (!isAiRelated) continue;

    // Skip if too niche (only 1 repo and that repo has <1000 stars)
    if (info.count === 1) {
      const repo = results.find(r => r.id === info.repos[0]);
      if (repo && repo.newStars < 1000) continue;
    }

    // Determine minStars
    let minStars = 5000;
    if (info.count >= 3) minStars = 2000;
    else if (info.count >= 2) minStars = 3000;

    newAiTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic.replace(/-/g, ' ')}`
    });
  }

  // Save results for update script
  const output = {
    results: results.map(r => ({
      id: r.id,
      ownerRepo: r.ownerRepo,
      status: r.status,
      oldStars: r.githubStars,
      newStars: r.newStars,
      oldForks: r.forks,
      newForks: r.newForks,
      oldLang: r.language,
      newLang: r.newLang,
      pushedAt: r.pushedAt,
    })),
    newAiTopics,
    existingTopicsCount: existingTopics.size,
    allTopics: Object.fromEntries(allTopics),
    stats: {
      totalScanned: results.length,
      starsChanges: starsChanges.length,
      forksChanges: forksChanges.length,
      langChanges: langChanges.length,
      newAiTopics: newAiTopics.length,
    }
  };

  fs.writeFileSync('/tmp/github-update-results.json', JSON.stringify(output, null, 2));
  console.log(`\nResults saved to /tmp/github-update-results.json`);
  console.log(`New AI topics found: ${newAiTopics.length}`);
  if (newAiTopics.length > 0) {
    newAiTopics.forEach((t, i) => console.log(`  ${i+1}. ${t.topic} (${t.minStars}+ stars, ${allTopics.get(t.topic)?.count} repos)`));
  }

  // Show top star changes
  const biggestChanges = starsChanges.sort((a, b) => Math.abs(b.newStars - b.githubStars) - Math.abs(a.newStars - a.githubStars)).slice(0, 5);
  if (biggestChanges.length > 0) {
    console.log('\nBiggest star changes:');
    biggestChanges.forEach(c => {
      const diff = c.newStars - c.githubStars;
      console.log(`  ${c.id}: ${c.githubStars} → ${c.newStars} (${diff > 0 ? '+' : ''}${diff})`);
    });
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
