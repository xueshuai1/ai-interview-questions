#!/usr/bin/env node
// Update GitHub stars, forks, language, updatedAt for tools.ts
// Also discover new AI topics from repo topics

import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.argv[2];
if (!GITHUB_TOKEN) { console.error('Usage: node update-github-data.mjs <token>'); process.exit(1); }

// AI topic keywords for filtering
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

// Read tools.ts
const toolsPath = path.join('src/data/tools.ts');
const topicsPath = path.join('data/ai-topics.json');

const toolsContent = fs.readFileSync(toolsPath, 'utf8');
const existingTopics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
const existingTopicNames = new Set(existingTopics.topics.map(t => t.topic.toLowerCase()));

// Extract repos and their current data
const urlRegex = /url:\s*['"]https:\/\/github\.com\/([^'"]+)['"]/g;
const repos = [];
let match;
while ((match = urlRegex.exec(toolsContent)) !== null) {
  repos.push(match[1]);
}
const uniqueRepos = [...new Set(repos)];

console.error(`Total unique repos: ${uniqueRepos.length}`);

// Fetch data with rate limiting
const results = [];
let errors = 0;

for (let i = 0; i < uniqueRepos.length; i++) {
  const repo = uniqueRepos[i];
  if ((i + 1) % 20 === 0) console.error(`  Fetching ${i + 1}/${uniqueRepos.length}...`);
  
  try {
    const url = `https://api.github.com/repos/${repo}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'ai-master-site-data-updater',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    });
    
    if (resp.status === 200) {
      const data = await resp.json();
      results.push({
        repo,
        stargazers_count: data.stargazers_count,
        pushed_at: data.pushed_at,
        forks_count: data.forks_count,
        language: data.language,
        topics: data.topics || [],
        fetched: true
      });
    } else if (resp.status === 404) {
      console.error(`  404: ${repo}`);
      errors++;
    } else if (resp.status === 403) {
      console.error(`  403 rate limit for ${repo}, waiting 60s...`);
      await new Promise(r => setTimeout(r, 60000));
      i--; // retry
      continue;
    } else {
      console.error(`  HTTP ${resp.status}: ${repo}`);
      errors++;
    }
  } catch (e) {
    console.error(`  Error fetching ${repo}: ${e.message}`);
    errors++;
  }
  
  // Rate limit: 1 second between requests
  if (i < uniqueRepos.length - 1) {
    await new Promise(r => setTimeout(r, 1000));
  }
}

console.error(`\nFetched: ${results.length}, Errors: ${errors}`);

// Process updates
const updates = []; // {repo, oldStars, newStars, oldForks, newForks, oldLang, newLang, oldUpdated, newUpdated}
const allTopics = new Set();

for (const r of results) {
  const pushedDate = r.pushed_at ? new Date(r.pushed_at).toISOString().split('T')[0] : null;
  updates.push({
    repo: r.repo,
    newStars: r.stargazers_count,
    newForks: r.forks_count,
    newLanguage: r.language || null,
    newUpdatedAt: pushedDate,
    topics: r.topics
  });
  r.topics.forEach(t => allTopics.add(t.toLowerCase()));
}

// Find new AI topics
const newTopics = [];
for (const topic of allTopics) {
  if (existingTopicNames.has(topic)) continue;
  
  // Check if AI-related
  const isAI = AI_KEYWORDS.some(kw => {
    const t = topic.toLowerCase();
    return t === kw || t.includes(kw) || kw.includes(t.replace(/-/g, ''));
  });
  
  if (!isAI) continue;
  
  // Estimate minStars based on repo count using this topic
  const repoCount = results.filter(r => r.topics.map(t => t.toLowerCase()).includes(topic)).length;
  let minStars;
  if (repoCount >= 3) minStars = 2000;
  else if (repoCount >= 2) minStars = 3000;
  else minStars = 5000;
  
  // Generate description
  const desc = topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `${desc}（自动发现）`,
    repoCount
  });
}

console.error(`New AI topics found: ${newTopics.length}`);

// Output as JSON for further processing
const output = {
  updates,
  newTopics,
  totalTopics: existingTopics.topics.length + newTopics.length
};

fs.writeFileSync('/tmp/github-data-update.json', JSON.stringify(output, null, 2));
console.error('Data saved to /tmp/github-data-update.json');
