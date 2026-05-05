#!/usr/bin/env node
// Update GitHub stars, forks, language for all tools and discover new AI topics
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

const TOOLS_PATH = path.join(__dirname, '../src/data/tools.ts');
const TOPICS_PATH = path.join(__dirname, '../data/ai-topics.json');

const AI_KEYWORDS = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
  'alignment', 'mcp', 'coding', 'harness'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t === kw || t.includes(kw));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    'Authorization': `token ${TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'ai-master-site-updater'
  };
  
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`  ❌ ${owner}/${repo}: HTTP ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`  ❌ ${owner}/${repo}: ${e.message}`);
    return null;
  }
}

async function main() {
  let content = fs.readFileSync(TOOLS_PATH, 'utf8');

  // Extract repo URLs - find all unique github.com/owner/repo from url fields
  const urlRegex = /https:\/\/github\.com\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_.-]+)/g;
  const repos = new Set();
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    if (m[1] !== 'features') { // skip github.com/features/copilot
      repos.add(`${m[1]}/${m[2]}`);
    }
  }
  const repoList = [...repos];
  console.log(`Found ${repoList.length} GitHub repos to check`);

  // Read existing topics
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

  const repoDataMap = new Map();
  let totalScanned = 0;

  for (let i = 0; i < repoList.length; i++) {
    const repo = repoList[i];
    const [owner, name] = repo.split('/');

    if (i % 10 === 0 && i > 0) {
      console.log(`Progress: ${i}/${repoList.length}`);
    }

    const data = await fetchRepo(owner, name);
    if (data) {
      repoDataMap.set(repo, data);
      totalScanned++;
    }
    await sleep(1100);
  }

  console.log(`\nFetched ${totalScanned}/${repoList.length} repos successfully`);

  // --- Update tools.ts ---
  let toolsContent = content;
  const starsUpdates = [];
  const forksUpdates = [];
  const languageUpdates = [];
  const allTopics = new Map();
  const topicRepoMap = new Map();
  let oldestUpdate = { tool: '', date: '', days: 0 };

  for (const [repo, data] of repoDataMap) {
    const [owner, name] = repo.split('/');
    const stars = data.stargazers_count || 0;
    const forks = data.forks_count || 0;
    const language = data.language || '';
    const pushedAt = data.pushed_at || '';
    const topics = (data.topics || []);

    // Collect topics
    for (const topic of topics) {
      const normalized = topic.toLowerCase().replace(/\s+/g, '-');
      allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
      if (!topicRepoMap.has(normalized)) topicRepoMap.set(normalized, []);
      topicRepoMap.get(normalized).push(repo);
    }

    // Find the tool for this repo in tools.ts
    const escapedRepo = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const urlPattern = new RegExp(`https://github\\.com/${escapedRepo}`);
    const urlIdx = toolsContent.search(urlPattern);
    if (urlIdx === -1) continue;

    // Find id and name before URL
    const before = toolsContent.substring(Math.max(0, urlIdx - 500), urlIdx);
    const idMatches = [...before.matchAll(/id:\s*"([^"]+)"/g)];
    const nameMatches = [...before.matchAll(/name:\s*"([^"]+)"/g)];
    const toolId = idMatches.length ? idMatches[idMatches.length - 1][1] : repo;
    const toolName = nameMatches.length ? nameMatches[nameMatches.length - 1][1] : repo;

    // Update githubStars
    const starsRegex = /githubStars:\s*(\d+)/;
    const starsMatch = toolsContent.substring(urlIdx, urlIdx + 800).match(starsRegex);
    if (starsMatch) {
      const oldStars = parseInt(starsMatch[1]);
      if (stars !== oldStars) {
        const absIdx = urlIdx + starsMatch.index;
        const oldStr = starsMatch[0];
        const newStr = `githubStars: ${stars}`;
        toolsContent = toolsContent.substring(0, absIdx) + newStr + toolsContent.substring(absIdx + oldStr.length);
        starsUpdates.push({ tool: toolName, repo, old: oldStars, new: stars, diff: stars - oldStars });
      }
    }

    // Update forks
    const forksRegex = /forks:\s*(\d+)/;
    const forksMatch = toolsContent.substring(urlIdx, urlIdx + 800).match(forksRegex);
    if (forksMatch) {
      const oldForks = parseInt(forksMatch[1]);
      if (forks !== oldForks) {
        const absIdx = urlIdx + forksMatch.index;
        const oldStr = forksMatch[0];
        const newStr = `forks: ${forks}`;
        toolsContent = toolsContent.substring(0, absIdx) + newStr + toolsContent.substring(absIdx + oldStr.length);
        forksUpdates.push({ tool: toolName, repo, old: oldForks, new: forks });
      }
    }

    // Update language
    const langRegex = /language:\s*"([^"]*)"/;
    const langMatch = toolsContent.substring(urlIdx, urlIdx + 800).match(langRegex);
    if (langMatch) {
      const oldLang = langMatch[1];
      if (language && language !== oldLang) {
        const absIdx = urlIdx + langMatch.index;
        const oldStr = langMatch[0];
        const newStr = `language: "${language}"`;
        toolsContent = toolsContent.substring(0, absIdx) + newStr + toolsContent.substring(absIdx + oldStr.length);
        languageUpdates.push({ tool: toolName, repo, old: oldLang, new: language });
      }
    }

    // Track oldest update
    if (pushedAt) {
      const days = Math.floor((Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (days > oldestUpdate.days) {
        oldestUpdate = { tool: toolName, date: pushedAt.split('T')[0], days };
      }
    }
  }

  fs.writeFileSync(TOOLS_PATH, toolsContent);
  console.log('tools.ts updated');

  console.log('\n=== Results ===');
  console.log(`Scanned: ${totalScanned} repos`);
  console.log(`Stars updates: ${starsUpdates.length}`);
  console.log(`Forks updates: ${forksUpdates.length}`);
  console.log(`Language updates: ${languageUpdates.length}`);

  if (starsUpdates.length > 0) {
    console.log('\nTop star changes:');
    starsUpdates.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    starsUpdates.slice(0, 10).forEach(s => {
      const sign = s.diff > 0 ? '+' : '';
      console.log(`  ${s.tool} (${s.repo}): ${s.old} → ${s.new} (${sign}${s.diff})`);
    });
  }

  // Find new AI topics
  const newTopics = [];
  for (const [topic, count] of allTopics) {
    if (existingTopics.has(topic)) continue;
    if (!isAITopic(topic)) continue;

    let minStars;
    if (count >= 3) minStars = 2000;
    else if (count >= 2) minStars = 3000;
    else minStars = 5000;

    if (count === 1 && topic.length < 3) continue;

    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic}`
    });
  }

  console.log(`\nNew AI Topics found: ${newTopics.length}`);
  if (newTopics.length > 0) {
    newTopics.slice(0, 20).forEach(t => {
      console.log(`  ${t.topic} (${allTopics.get(t.topic)} repos)`);
    });
    if (newTopics.length > 20) console.log(`  ... and ${newTopics.length - 20} more`);
  }

  // Update ai-topics.json if new topics
  if (newTopics.length > 0) {
    topicsData.topics.push(...newTopics);
    topicsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2));
    console.log(`\nai-topics.json updated: ${topicsData.topics.length - newTopics.length} → ${topicsData.topics.length} topics`);
  }

  if (oldestUpdate.tool) {
    console.log(`\nOldest update: ${oldestUpdate.tool} (${oldestUpdate.date}, ${oldestUpdate.days} days ago)`);
  }

  const results = {
    starsUpdates,
    forksUpdates,
    languageUpdates,
    newTopics,
    totalScanned,
    totalRepos: repoList.length,
    oldestUpdate,
    currentTopicCount: topicsData.topics.length,
    hasChanges: starsUpdates.length > 0 || forksUpdates.length > 0 || languageUpdates.length > 0 || newTopics.length > 0
  };

  fs.writeFileSync(path.join(__dirname, '../scripts/update-results.json'), JSON.stringify(results, null, 2));
  console.log('\nDone.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
