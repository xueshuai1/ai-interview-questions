import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const GITHUB_TOKEN = readFileSync(join(root, '.env.local'), 'utf-8').match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN'); process.exit(1); }

const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics',
  'vision','language','neural','learning','generative','prompt','chatbot',
  'deep-learning','machine-learning','transformer','gpt','diffusion','rag',
  'embedding','inference','fine-tuning','llmops','mlops','model-serving',
  'vector-search','semantic-search','knowledge-graph','multimodal','speech',
  'text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models',
  'large-language-models','retrieval-augmented','instruction-tuning','rlhf',
  'alignment','genai','llama','mcp','claude','codex','deep-research',
  'agentic','harness','memory','self-evolution','code-execution'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => {
    const tParts = t.split('-');
    return t === kw || t.includes(kw) || kw.includes(t) ||
      tParts.some(p => p === kw || p.includes(kw) || kw.includes(p));
  });
}

function normalizeTopic(topic) { return topic.toLowerCase().replace(/\s+/g, '-'); }

function fetchRepoViaCurl(repo) {
  try {
    const result = execFileSync('curl', [
      '-s', '--connect-timeout', '15', '--max-time', '30',
      '-H', `Authorization: token ${GITHUB_TOKEN}`,
      '-H', 'Accept: application/vnd.github+json',
      `https://api.github.com/repos/${repo}`
    ], { encoding: 'utf-8' });
    const data = JSON.parse(result);
    if (data.message && data.message.includes('rate limit')) return null;
    return data;
  } catch (e) {
    console.warn(`  Error fetching ${repo}: ${e.message?.slice(0, 80)}`);
    return null;
  }
}

// Read files
let toolsContent = readFileSync(join(root, 'src/data/tools.ts'), 'utf-8');
const topicsData = JSON.parse(readFileSync(join(root, 'data/ai-topics.json'), 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// Extract repos
const urlRegex = /url:\s*"https:\/\/github\.com\/([^"]+)"/g;
const repos = new Set();
let m;
while ((m = urlRegex.exec(toolsContent)) !== null) {
  const r = m[1].trim();
  if (r.includes('/')) repos.add(r);
}

console.log(`Found ${repos.size} repos, ${existingTopics.size} existing topics`);

// Parse tool blocks
function parseToolBlocks(content) {
  const blocks = [];
  const lines = content.split('\n');
  let inToolsArray = false;
  let depth = 0;
  let blockStart = -1;
  let blockDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('export const tools:')) { inToolsArray = true; continue; }
    if (!inToolsArray) continue;

    let inStr = false, strChar = '';
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (inStr) {
        if (ch === strChar && line[j-1] !== '\\') inStr = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strChar = ch; continue; }
      if (ch === '{') {
        if (depth === 0) { blockStart = i; blockDepth = 0; }
        depth++; blockDepth++;
      }
      if (ch === '}') {
        depth--; blockDepth--;
        if (blockDepth <= 0 && blockStart >= 0) {
          blocks.push({ startLine: blockStart, endLine: i, text: lines.slice(blockStart, i + 1).join('\n') });
          blockStart = -1;
        }
        if (depth < 0) { inToolsArray = false; break; }
      }
    }
  }
  return blocks;
}

async function main() {
  const repoData = [];
  const allTopicCounts = new Map();
  const repoArray = [...repos];

  console.log(`Fetching ${repoArray.length} repos via curl...`);
  for (let i = 0; i < repoArray.length; i++) {
    const data = fetchRepoViaCurl(repoArray[i]);
    if (data && data.stargazers_count !== undefined) {
      repoData.push({
        repo: repoArray[i],
        stars: data.stargazers_count,
        pushed_at: data.pushed_at,
        forks: data.forks_count,
        language: data.language,
        topics: data.topics || []
      });
      for (const t of data.topics) {
        const nt = normalizeTopic(t);
        allTopicCounts.set(nt, (allTopicCounts.get(nt) || 0) + 1);
      }
      if ((i + 1) % 15 === 0) console.log(`  ${i+1}/${repoArray.length}`);
    } else {
      console.warn(`  ⚠ Failed: ${repoArray[i]}`);
    }
    if (i < repoArray.length - 1) await new Promise(r => setTimeout(r, 1100));
  }

  console.log(`Got data for ${repoData.length}/${repoArray.length} repos`);

  const repoMap = new Map();
  for (const r of repoData) repoMap.set(r.repo, r);

  const blocks = parseToolBlocks(toolsContent);
  console.log(`Parsed ${blocks.length} tool blocks`);

  let starsUpdated = 0, forksUpdated = 0, langUpdated = 0, dateUpdated = 0;
  const starChanges = [];
  const replacements = [];

  for (const block of blocks) {
    const urlMatch = block.text.match(/url:\s*"https:\/\/github\.com\/([^"]+)"/);
    if (!urlMatch) continue;
    const repo = urlMatch[1].trim();
    const data = repoMap.get(repo);
    if (!data) continue;

    let newText = block.text;
    let changed = false;

    // githubStars
    const starsM = newText.match(/githubStars:\s*(\d+)/);
    if (starsM) {
      const oldVal = parseInt(starsM[1]);
      if (oldVal !== data.stars) {
        newText = newText.replace(/githubStars:\s*\d+/, `githubStars: ${data.stars}`);
        starsUpdated++;
        starChanges.push({ repo, old: oldVal, new: data.stars, delta: data.stars - oldVal });
        changed = true;
      }
    }

    // forks
    const forksM = newText.match(/forks:\s*(\d+)/);
    if (forksM) {
      const oldVal = parseInt(forksM[1]);
      if (oldVal !== data.forks) {
        newText = newText.replace(/forks:\s*\d+/, `forks: ${data.forks}`);
        forksUpdated++;
        changed = true;
      }
    } else if (data.forks && !isNaN(data.forks)) {
      newText = newText.replace(/(githubStars:\s*\d+,?\s*\n)/, `$1    forks: ${data.forks},\n`);
      forksUpdated++;
      changed = true;
    }

    // language
    const langM = newText.match(/language:\s*"([^"]+)"/);
    if (langM) {
      if (data.language && langM[1] !== data.language) {
        newText = newText.replace(/language:\s*"[^"]+"/, `language: "${data.language}"`);
        langUpdated++;
        changed = true;
      }
    } else if (data.language) {
      if (newText.includes('forks:')) {
        newText = newText.replace(/(forks:\s*\d+,?\s*\n)/, `$1    language: "${data.language}",\n`);
      } else {
        newText = newText.replace(/(githubStars:\s*\d+,?\s*\n)/, `$1    language: "${data.language}",\n`);
      }
      langUpdated++;
      changed = true;
    }

    // updatedAt
    if (data.pushed_at) {
      const newDate = data.pushed_at.split('T')[0];
      const dateM = newText.match(/updatedAt:\s*"([^"]+)"/);
      if (dateM && dateM[1] !== newDate) {
        newText = newText.replace(/updatedAt:\s*"[^"]+"/, `updatedAt: "${newDate}"`);
        dateUpdated++;
        changed = true;
      }
    }

    if (changed) {
      replacements.push({ startLine: block.startLine, endLine: block.endLine, newLines: newText.split('\n') });
    }
  }

  if (replacements.length > 0) {
    replacements.sort((a, b) => b.startLine - a.startLine);
    const lines = toolsContent.split('\n');
    for (const r of replacements) {
      lines.splice(r.startLine, r.endLine - r.startLine + 1, ...r.newLines);
    }
    const newContent = lines.join('\n');
    writeFileSync(join(root, 'src/data/tools.ts'), newContent);
    console.log(`\ntools.ts updated: stars=${starsUpdated}, forks=${forksUpdated}, language=${langUpdated}, dates=${dateUpdated}`);
  } else {
    console.log(`\nNo changes in tools.ts`);
  }

  // Topics
  const newTopics = [];
  for (const [topic, count] of allTopicCounts.entries()) {
    if (existingTopics.has(topic)) continue;
    if (!isAITopic(topic)) continue;
    if (count === 1) {
      const maxStars = Math.max(...repoData
        .filter(r => r.topics.map(t => normalizeTopic(t)).includes(topic))
        .map(r => r.stars), 0);
      if (maxStars < 1000) continue;
    }
    let minStars = count >= 3 ? 2000 : count >= 2 ? 3000 : 5000;
    newTopics.push({ topic, url: `https://github.com/topics/${topic}`, minStars, description: `（自动发现）${topic}` });
  }

  if (newTopics.length > 0) {
    newTopics.sort((a, b) => a.topic.localeCompare(b.topic));
    topicsData.topics.push(...newTopics);
    topicsData.lastUpdated = new Date().toISOString();
    writeFileSync(join(root, 'data/ai-topics.json'), JSON.stringify(topicsData, null, 2));
    console.log(`\nAdded ${newTopics.length} topics: ${newTopics.map(t => t.topic).join(', ')}`);
  } else {
    console.log(`\nNo new topics`);
  }

  const summary = {
    reposScanned: repoData.length,
    starsUpdated, forksUpdated, langUpdated, dateUpdated,
    newTopicsCount: newTopics.length,
    totalTopics: topicsData.topics.length,
    starChanges: starChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10)
  };
  writeFileSync(join(root, '.update-summary.json'), JSON.stringify(summary, null, 2));
  console.log(`\nDone:`, JSON.stringify(summary, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
