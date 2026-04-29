#!/usr/bin/env node
/**
 * V3: Proper tool block parsing to avoid cross-tool contamination
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.join(__dirname, '..', 'data', 'ai-topics.json');

const AI_KEYWORDS = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
  'alignment'
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function githubFetch(repoPath, redirects = 0) {
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${repoPath}`;
    https.get(url, {
      headers: {
        'User-Agent': 'ai-master-site-bot',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(data));
        else if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (loc) {
            const m = loc.match(/repos\/([^\/]+\/[^\/\s?]+)/);
            if (m) { resolve(githubFetch(m[1], redirects + 1)); return; }
          }
          reject(new Error('301 no location'));
        }
        else if (res.statusCode === 404) resolve(null);
        else if (res.statusCode === 403) reject(new Error('Rate limited'));
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    }).on('error', reject);
  });
}

function extractOwnerRepo(url) {
  const m = url.match(/github\.com\/([^\/]+)\/([^\/\s#?]+)/);
  return m ? `${m[1]}/${m[2]}` : null;
}

function parseToolBlocks(content) {
  // Split content into: header + tool blocks
  const blocks = [];
  // Find each tool by id pattern and extract its block
  // A tool block starts with { and ends with },
  const idRegex = /\{\s*\n\s*id:\s*["']([^"']+)["']/g;
  let m;
  while ((m = idRegex.exec(content)) !== null) {
    const id = m[1];
    const blockStart = m.index;
    
    // Find matching closing brace + comma or closing brace
    // Count braces to find the end
    let depth = 0;
    let blockEnd = -1;
    let inString = false;
    let escape = false;
    let i = blockStart;
    
    for (; i < content.length; i++) {
      const ch = content[i];
      
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"' || ch === "'") {
        // Check for backtick template literals too
        if (!inString) inString = ch;
        else if (inString === ch) inString = false;
        continue;
      }
      
      if (inString) continue;
      
      // Skip template literals
      if (ch === '`') {
        if (!inString) inString = '`';
        else if (inString === '`') inString = false;
        continue;
      }
      if (inString === '`') continue;
      
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          blockEnd = i + 1;
          // Include trailing comma
          while (blockEnd < content.length && (content[blockEnd] === ',' || content[blockEnd] === ' ' || content[blockEnd] === '\n')) {
            blockEnd++;
          }
          break;
        }
      }
    }
    
    if (blockEnd === -1) continue;
    
    // Extract fields from block
    const block = content.substring(blockStart, blockEnd);
    const urlMatch = block.match(/url:\s*["'](https:\/\/github\.com\/[^"']+)["']/);
    const starsMatch = block.match(/githubStars:\s*(\d+)/);
    const forksMatch = block.match(/forks:\s*(\d+)/);
    const langMatch = block.match(/language:\s*["']([^"']*)["']/);
    const updatedMatch = block.match(/updatedAt:\s*["']([^"']*)["']/);
    
    blocks.push({
      id,
      block,
      startPos: blockStart,
      endPos: blockEnd,
      url: urlMatch ? urlMatch[1] : null,
      stars: starsMatch ? parseInt(starsMatch[1]) : null,
      hasForks: forksMatch !== null,
      hasLang: langMatch !== null,
      updatedAt: updatedMatch ? updatedMatch[1] : null
    });
  }
  
  return { header: content.substring(0, blocks[0] ? blocks[0].startPos : 0), blocks };
}

async function main() {
  console.log('🔍 Starting GitHub stars update (v3)...');
  
  const content = fs.readFileSync(TOOLS_PATH, 'utf-8');
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
  
  const { header, blocks } = parseToolBlocks(content);
  console.log(`📦 Found ${blocks.length} tools with githubStars`);
  
  const allTopics = new Map();
  const results = [];
  let fetchErrors = [];
  
  for (const b of blocks) {
    const ownerRepo = extractOwnerRepo(b.url);
    if (!ownerRepo) {
      console.log(`⏭️  ${b.id} - no GitHub URL`);
      continue;
    }
    
    console.log(`🔄 ${ownerRepo}...`);
    
    try {
      const repo = await githubFetch(ownerRepo);
      if (!repo) {
        console.log(`  ❌ Not found`);
        continue;
      }
      
      const newStars = repo.stargazers_count;
      const newForks = repo.forks_count;
      const newLanguage = repo.language;
      const newPushedAt = repo.pushed_at ? new Date(repo.pushed_at).toISOString().split('T')[0] : null;
      const repoTopics = repo.topics || [];
      
      results.push({
        id: b.id,
        ownerRepo,
        oldStars: b.stars,
        newStars,
        newForks,
        newLanguage,
        newPushedAt,
        hasForks: b.hasForks,
        hasLang: b.hasLang
      });
      
      repoTopics.forEach(t => {
        const n = t.toLowerCase().replace(/\s+/g, '-');
        allTopics.set(n, (allTopics.get(n) || 0) + 1);
      });
      
      const diff = newStars - b.stars;
      const s = diff > 0 ? `+${diff}` : diff === 0 ? '=' : `${diff}`;
      console.log(`  ✅ ${newStars} (${s}) forks:${newForks} lang:${newLanguage}`);
      
    } catch (err) {
      fetchErrors.push({ id: b.id, ownerRepo, error: err.message });
      console.log(`  ❌ ${err.message}`);
    }
    
    await sleep(1000);
  }
  
  // Update each block
  let starsUp = 0, forksUp = 0, langUp = 0, dateUp = 0;
  let starChanges = [];
  let oldestUpdated = null;
  
  for (const r of results) {
    const block = blocks.find(b => b.id === r.id);
    if (!block) continue;
    
    let newBlock = block.block;
    
    // Update stars
    if (r.newStars !== r.oldStars) {
      newBlock = newBlock.replace(
        /(githubStars:\s*)\d+/,
        `$1${r.newStars}`
      );
      starsUp++;
      starChanges.push({ id: r.id, old: r.oldStars, new: r.newStars, diff: r.newStars - r.oldStars });
    }
    
    // Update forks
    if (r.newForks !== undefined) {
      if (r.hasForks) {
        newBlock = newBlock.replace(
          /(forks:\s*)\d+/,
          `$1${r.newForks}`
        );
      } else {
        // Add forks after updatedAt or githubStars
        newBlock = newBlock.replace(
          /(updatedAt:\s*["'][^"']*["'],?\s*\n)/,
          `$1    forks: ${r.newForks},\n`
        );
      }
      forksUp++;
    }
    
    // Update language
    if (r.newLanguage && r.newLanguage !== 'null') {
      if (r.hasLang) {
        newBlock = newBlock.replace(
          /(language:\s*["'])[^"']*["']/,
          `$1${r.newLanguage}"`
        );
      } else {
        // Add language after forks or updatedAt
        newBlock = newBlock.replace(
          /(updatedAt:\s*["'][^"']*["'],?\s*\n(?:\s*forks:\s*\d+,\s*\n)?)/,
          `$1    language: "${r.newLanguage}",\n`
        );
      }
      langUp++;
    }
    
    // Update updatedAt
    if (r.newPushedAt) {
      newBlock = newBlock.replace(
        /(updatedAt:\s*["'])[^"']*["']/,
        `$1${r.newPushedAt}"`
      );
      dateUp++;
      
      const d = new Date(r.newPushedAt);
      if (!oldestUpdated || d < oldestUpdated.date) {
        oldestUpdated = { id: r.id, date: d, pushedAt: r.newPushedAt };
      }
    }
    
    block.block = newBlock;
  }
  
  // Rebuild content
  let newContent = header;
  for (const b of blocks) {
    newContent += b.block;
  }
  
  // Find new AI topics
  const newTopics = [];
  for (const [topic, count] of allTopics) {
    if (existingTopics.has(topic) || topic.length <= 1) continue;
    const isAI = AI_KEYWORDS.some(kw => topic.includes(kw) || kw.includes(topic));
    if (!isAI) continue;
    
    let minStars = count >= 3 ? 2000 : count >= 2 ? 3000 : 5000;
    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic}`
    });
  }
  
  // Write
  if (starsUp + forksUp + langUp + dateUp > 0) {
    fs.writeFileSync(TOOLS_PATH, newContent);
    console.log(`\n📝 tools.ts: ${starsUp}★ ${forksUp}forks ${langUp}lang ${dateUp}dates`);
  } else {
    console.log('\n✅ No changes to tools.ts');
  }
  
  if (newTopics.length > 0) {
    topicsData.topics.push(...newTopics);
    topicsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2));
    console.log(`📝 +${newTopics.length} new topics`);
  }
  
  // Summary
  const sorted = starChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  console.log(`\n=== ${results.length} scanned | ${starsUp}★ | ${fetchErrors.length} err | ${newTopics.length} topics ===`);
  if (sorted.length > 0) {
    console.log('\nTop changes:');
    sorted.slice(0, 15).forEach(t => console.log(`  ${t.id}: ${t.old}→${t.new} (${t.diff>0?'+':''}${t.diff})`));
  }
  
  // Result
  const output = {
    scanned: results.length, errors: fetchErrors.length,
    starsUpdated: starsUp, forksUpdated: forksUp, langUpdated: langUp, dateUpdated: dateUp,
    newTopicsCount: newTopics.length, totalTopics: topicsData.topics.length,
    starChanges: sorted.slice(0, 15),
    newTopics: newTopics.slice(0, 20),
    oldestUpdated,
    errorDetails: fetchErrors.slice(0, 10)
  };
  fs.writeFileSync(path.join(__dirname, 'update-result.json'), JSON.stringify(output, null, 2));
  console.log('\n✅ Done.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
