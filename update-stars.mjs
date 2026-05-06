import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Load GitHub token
const envContent = readFileSync('.env.local', 'utf-8');
const githubToken = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!githubToken) {
  console.error('GITHUB_TOKEN not found');
  process.exit(1);
}

// Load tools.ts - extract repo URLs
const toolsContent = readFileSync('src/data/tools.ts', 'utf-8');
const repoMatches = toolsContent.match(/url:\s*"https:\/\/github\.com\/([^"]+)"/g) || [];
const repos = [...new Set(repoMatches.map(m => m.match(/github\.com\/([^"]+)"/)[1]))];
console.log(`Found ${repos.length} unique GitHub repos`);

// Load existing topics
const topicsData = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// AI keyword list
const aiKeywords = ['ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language','neural','learning','generative','prompt','chatbot','deep-learning','machine-learning','transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops','mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal','speech','text-to-speech','image-generation','video-generation','code-generation','autonomous','embodied-ai','world-models','foundation-models','large-language-model','retrieval-augmented','instruction-tuning','rlhf','alignment'];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => t.includes(kw) || kw.includes(t));
}

// Results storage
const results = [];
const allDiscoveredTopics = new Map(); // topic -> count

// Fetch each repo with 1s delay
async function fetchRepo(ownerRepo) {
  const [owner, repo] = ownerRepo.split('/');
  if (!owner || !repo) return null;
  
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'ai-master-site-updater'
      }
    });
    
    if (res.status === 404) {
      console.log(`  ⚠️  Not found: ${ownerRepo}`);
      return null;
    }
    if (res.status === 403) {
      const resetTime = res.headers.get('x-ratelimit-reset');
      console.log(`  ⛔ Rate limited, reset at: ${new Date(resetTime * 1000).toISOString()}`);
      return null;
    }
    if (!res.ok) {
      console.log(`  ⚠️ HTTP ${res.status}: ${ownerRepo}`);
      return null;
    }
    
    const data = await res.json();
    
    // Track topics
    if (data.topics && Array.isArray(data.topics)) {
      data.topics.forEach(t => {
        const normalized = t.toLowerCase().replace(/\s+/g, '-');
        allDiscoveredTopics.set(normalized, (allDiscoveredTopics.get(normalized) || 0) + 1);
      });
    }
    
    return {
      ownerRepo,
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      language: data.language || null,
      pushedAt: data.pushed_at || null,
      topics: data.topics || []
    };
  } catch (e) {
    console.log(`  ❌ Error: ${ownerRepo} - ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('Fetching repo data (1s between requests)...');
  
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    const result = await fetchRepo(repo);
    if (result) {
      results.push(result);
    }
    if (i % 10 === 9) {
      console.log(`  Progress: ${i + 1}/${repos.length}`);
    }
    // 1s delay between requests
    if (i < repos.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  console.log(`\nFetched ${results.length}/${repos.length} repos successfully`);
  
  // Find new AI topics
  const newTopics = [];
  for (const [topic, count] of allDiscoveredTopics) {
    if (existingTopics.has(topic)) continue;
    if (!isAITopic(topic)) continue;
    
    let minStars = 5000;
    if (count >= 3) minStars = 2000;
    else if (count >= 2) minStars = 3000;
    else if (count === 1 && results.some(r => r.topics.map(t => t.toLowerCase().replace(/\s+/g, '-')).includes(topic) && r.stars < 1000)) {
      // Only 1 repo using it and that repo has < 1000 stars → skip
      console.log(`  Skipping cold topic: ${topic} (only ${count} repo, low stars)`);
      continue;
    }
    
    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic}`
    });
  }
  
  // Save results for next step
  writeFileSync('update-results.json', JSON.stringify({ results, newTopics }, null, 2));
  
  console.log(`\nNew AI topics found: ${newTopics.length}`);
  newTopics.forEach(t => console.log(`  - ${t.topic} (${allDiscoveredTopics.get(t.topic)} repos)`));
  
  // Summary of star changes
  let changesCount = 0;
  for (const r of results) {
    // We'll compare in the next step
    changesCount++;
  }
  console.log(`\nReady to update ${results.length} tools with GitHub data`);
}

main();
