#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const TOKEN = execSync(`grep GITHUB_TOKEN /Users/xueshuai/.openclaw/workspace/ai-master-site/.env.local | cut -d= -f2`).toString().trim();

function fetchRepo(repo) {
  try {
    const output = execSync(
      `curl -s -H "Authorization: Bearer ${TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${repo}"`,
      { timeout: 15000 }
    ).toString();
    const data = JSON.parse(output);
    if (data.message && data.message.includes('rate limit')) {
      console.log(`  Rate limited, waiting 65s...`);
      execSync('sleep 65');
      return fetchRepo(repo);
    }
    if (data.message && (data.message.includes('Not Found') || data.message.includes('404'))) return null;
    return data;
  } catch (e) {
    console.log(`  Error fetching ${repo}: ${e.message.substring(0, 80)}`);
    return null;
  }
}

const toolsRaw = readFileSync('src/data/tools.ts', 'utf-8');

// Extract repos more carefully - find url: "..." or url: '...' patterns
// Clean up any trailing punctuation
const urlRegex = /url:\s*["']https:\/\/github\.com\/([^"']+)["']/g;
const reposSet = new Set();
let m;
while ((m = urlRegex.exec(toolsRaw)) !== null) {
  let repo = m[1].trim();
  // Clean trailing punctuation
  repo = repo.replace(/[/,;'`\s]+$/, '');
  if (repo.split('/').length === 2) {
    reposSet.add(repo);
  }
}

const repos = [...reposSet];
console.log(`Total repos to check: ${repos.length}`);

// Load existing topics
const aiTopics = JSON.parse(readFileSync('data/ai-topics.json', 'utf-8'));
const existingTopicNames = new Set(aiTopics.topics.map(t => t.topic.toLowerCase()));

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

function isAiRelated(topic) {
  const lower = topic.toLowerCase();
  return aiKeywords.some(kw => lower.includes(kw));
}

const allTopics = new Map();
const repoDataMap = new Map();

for (let i = 0; i < repos.length; i++) {
  const repo = repos[i];
  const data = fetchRepo(repo);
  
  if (!data || !data.stargazers_count) {
    console.log(`  [${i+1}/${repos.length}] ${repo} → no data`);
    continue;
  }
  
  repoDataMap.set(repo, {
    stars: data.stargazers_count,
    pushed_at: data.pushed_at,
    forks: data.forks_count,
    language: data.language,
    topics: data.topics || []
  });
  
  for (const t of (data.topics || [])) {
    allTopics.set(t, (allTopics.get(t) || 0) + 1);
  }
  
  if ((i + 1) % 10 === 0) {
    console.log(`  Progress: ${i+1}/${repos.length} (${repoDataMap.size} fetched)`);
  }
  
  // Rate limit: ~1s between requests
  if (i < repos.length - 1) {
    execSync('sleep 1.1');
  }
}

console.log(`\nFetched ${repoDataMap.size} repos`);
console.log('Repos that returned data:', [...repoDataMap.keys()].join(', '));

// --- Update tools.ts ---
let toolsContent = toolsRaw;

// Find each tool's githubStars line and update it
const starChanges = [];
let starsUpdated = 0;
let forksUpdated = 0;
let langUpdated = 0;
let datesUpdated = 0;

// Parse tool blocks: find id + url pairs and their githubStars
const toolEntries = [];
const blockRegex = /id:\s*["']([^"']+)["'][\s\S]{0,500}?url:\s*["']https:\/\/github\.com\/([^"']+)["'][\s\S]{0,300}?githubStars:\s*(\d+)/g;
let bm;
while ((bm = blockRegex.exec(toolsRaw)) !== null) {
  let repo = bm[2].trim().replace(/[/,;'`\s]+$/, '');
  if (repo.split('/').length === 2) {
    toolEntries.push({
      id: bm[1],
      repo,
      currentStars: parseInt(bm[3]),
      matchStart: bm.index,
      matchEnd: bm.index + bm[0].length,
      fullMatch: bm[0]
    });
  }
}

console.log(`\nFound ${toolEntries.length} tool entries with stars`);

// Collect all replacements (position -> new text), apply from end to start
const replacements = []; // {start, end, newText}

for (const tool of toolEntries) {
  const data = repoDataMap.get(tool.repo);
  if (!data) continue;
  
  // Find githubStars within the matched block
  const relativeStarsIdx = tool.fullMatch.indexOf('githubStars:');
  if (relativeStarsIdx < 0) continue;
  
  const globalStarsIdx = tool.matchStart + relativeStarsIdx;
  const starsValueMatch = toolsContent.substring(globalStarsIdx).match(/githubStars:\s*(\d+)/);
  if (!starsValueMatch) continue;
  
  const oldValue = parseInt(starsValueMatch[1]);
  const valueStart = globalStarsIdx + starsValueMatch[0].indexOf(starsValueMatch[1]);
  const valueEnd = valueStart + starsValueMatch[1].length;
  
  if (data.stars !== oldValue) {
    replacements.push({ start: valueStart, end: valueEnd, newText: String(data.stars) });
    starsUpdated++;
    starChanges.push({
      tool: tool.id,
      old: oldValue,
      new: data.stars,
      diff: data.stars - oldValue
    });
  }
  
  // Find forks within the block and update
  const blockContent = toolsContent.substring(tool.matchStart, tool.matchStart + tool.fullMatch.length + 2000);
  const forksMatch = blockContent.match(/forks:\s*(\d+)/);
  if (forksMatch) {
    const forksGlobalStart = tool.matchStart + blockContent.indexOf('forks:');
    const forksValMatch = toolsContent.substring(forksGlobalStart).match(/forks:\s*(\d+)/);
    if (forksValMatch) {
      const fvStart = forksGlobalStart + forksValMatch[0].indexOf(forksValMatch[1]);
      const fvEnd = fvStart + forksValMatch[1].length;
      replacements.push({ start: fvStart, end: fvEnd, newText: String(data.forks || 0) });
      forksUpdated++;
    }
  }
  
  // Find language within the block and update
  if (data.language && data.language !== 'null' && data.language !== 'None' && data.language !== 'N/A') {
    const langMatch = blockContent.match(/language:\s*["']([^"']+)["']/);
    if (langMatch) {
      const langGlobalStart = tool.matchStart + blockContent.indexOf('language:');
      const lvMatch = toolsContent.substring(langGlobalStart).match(/language:\s*["']([^"']+)["']/);
      if (lvMatch && lvMatch[1] !== data.language) {
        const lvStart = langGlobalStart + lvMatch[0].indexOf(`"${lvMatch[1]}"`);
        const lvEnd = lvStart + lvMatch[0].length;
        replacements.push({ start: lvStart, end: lvEnd, newText: `language: "${data.language}"` });
        langUpdated++;
      }
    }
  }
  
  // Find updatedAt within the block
  if (data.pushed_at) {
    const date = data.pushed_at.split('T')[0];
    const utMatch = blockContent.match(/updatedAt:\s*["'](\d{4}-\d{2}-\d{2})["']/);
    if (utMatch && utMatch[1] !== date) {
      const utGlobalStart = tool.matchStart + blockContent.indexOf('updatedAt:');
      const uvMatch = toolsContent.substring(utGlobalStart).match(/updatedAt:\s*["'](\d{4}-\d{2}-\d{2})["']/);
      if (uvMatch) {
        const uvStart = utGlobalStart + uvMatch[0].indexOf(uvMatch[1]);
        const uvEnd = uvStart + uvMatch[1].length;
        replacements.push({ start: uvStart, end: uvEnd, newText: date });
        datesUpdated++;
      }
    }
  }
}

// Apply replacements from end to start
replacements.sort((a, b) => b.start - a.start);
for (const r of replacements) {
  toolsContent = toolsContent.substring(0, r.start) + r.newText + toolsContent.substring(r.end);
}

writeFileSync('src/data/tools.ts', toolsContent);
console.log('\ntools.ts written');

// --- Topic Discovery ---
const newTopics = [];

for (const [topic, count] of allTopics) {
  const normalized = topic.toLowerCase().replace(/\s+/g, '-');
  if (existingTopicNames.has(normalized)) continue;
  if (!isAiRelated(normalized)) continue;
  
  const relatedRepos = [...repoDataMap.entries()].filter(([, d]) => 
    d.topics && d.topics.includes(topic)
  );
  const maxStars = Math.max(...relatedRepos.map(([, d]) => d.stars), 0);
  if (count === 1 && maxStars < 1000) continue;
  
  let minStars;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  else minStars = 5000;
  
  newTopics.push({
    topic: normalized,
    url: `https://github.com/topics/${normalized}`,
    minStars,
    description: `（自动发现）${normalized}`
  });
}

console.log(`New AI topics: ${newTopics.length}`);

if (newTopics.length > 0) {
  aiTopics.topics.push(...newTopics);
  aiTopics.lastUpdated = new Date().toISOString();
  writeFileSync('data/ai-topics.json', JSON.stringify(aiTopics, null, 2));
  console.log('ai-topics.json updated');
}

// Summary
const summary = {
  reposChecked: repoDataMap.size,
  starsUpdated,
  forksUpdated,
  langUpdated,
  datesUpdated,
  newTopicsCount: newTopics.length,
  totalTopics: aiTopics.topics.length,
  starChanges: starChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 10),
  newTopics: newTopics.slice(0, 20)
};

writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));

console.log('\n=== SUMMARY ===');
console.log(`Repos checked: ${summary.reposChecked}`);
console.log(`Stars updated: ${summary.starsUpdated}`);
console.log(`Forks updated: ${summary.forksUpdated}`);
console.log(`Languages updated: ${summary.langUpdated}`);
console.log(`Dates updated: ${summary.datesUpdated}`);
console.log(`New topics: ${summary.newTopicsCount}`);
console.log(`Total topics: ${summary.totalTopics}`);

if (starChanges.length > 0) {
  console.log('\nTop star changes:');
  for (const c of starChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 10)) {
    console.log(`  ${c.tool}: ${c.old} → ${c.new} (${c.diff > 0 ? '+' : ''}${c.diff})`);
  }
}

if (newTopics.length > 0) {
  console.log('\nNew topics:');
  for (const t of newTopics.slice(0, 20)) {
    console.log(`  ${t.topic} (${t.minStars}★)`);
  }
}
