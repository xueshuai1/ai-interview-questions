import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// --- Setup ---
const TOKEN = readFileSync('.env.local','utf8').split('\n').find(l=>l.startsWith('GITHUB_TOKEN='))?.split('=')[1]?.trim();
if(!TOKEN){console.error('No GITHUB_TOKEN');process.exit(1);}

// --- Extract GitHub repos from tools.ts ---
const toolsRaw = readFileSync('src/data/tools.ts','utf8');
const repoUrls = [...toolsRaw.matchAll(/url:\s*"https:\/\/github\.com\/([^"]+)"/g)].map(m=>m[1].replace(/\/$/,''));
const uniqueRepos = [...new Set(repoUrls)];
console.log(`Found ${uniqueRepos.length} unique GitHub repos`);

// --- Load existing topics ---
const topicsData = JSON.parse(readFileSync('data/ai-topics.json','utf8'));
const existingTopicsSet = new Set(topicsData.topics.map(t=>t.topic.toLowerCase()));

// --- AI keywords for topic matching ---
const AI_KW = ['ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning','transformer',
  'gpt','diffusion','rag','embedding','inference','fine-tuning','llmops','mlops','model-serving',
  'vector-search','semantic-search','knowledge-graph','multimodal','speech','text-to-speech',
  'image-generation','video-generation','code-generation','autonomous','embodied-ai','world-models',
  'foundation-models','large-language-model','retrieval-augmented','instruction-tuning','rlhf','alignment'];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return AI_KW.some(kw => t.includes(kw));
}

// --- Build current data map from tools.ts ---
const toolDataMap = new Map(); // url -> { id, stars, forks, language, updatedAt }
const toolsArr = [];
// Parse tools array - find each tool block
const toolBlocks = [...toolsRaw.matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?url:\s*"https:\/\/github\.com\/([^"]+)"[\s\S]*?githubStars:\s*(\d+)/g)];
for (const tb of toolBlocks) {
  const [full, id, repo, starsStr] = tb;
  // Find forks
  const forksMatch = full.match(/forks:\s*(\d+)/);
  const langMatch = full.match(/language:\s*"(.*?)"/);
  const upMatch = full.match(/updatedAt:\s*"([^"]+)"/);
  toolDataMap.set(repo, {
    id,
    repo,
    githubStars: parseInt(starsStr),
    forks: forksMatch ? parseInt(forksMatch[1]) : undefined,
    language: langMatch ? (langMatch[1]==='null'||langMatch[1]==='N/A'? undefined : langMatch[1]) : undefined,
    updatedAt: upMatch ? upMatch[1] : undefined
  });
}
console.log(`Parsed ${toolDataMap.size} tools with githubStars`);

// --- Fetch GitHub API ---
async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}`;
  try {
    const resp = await fetch(url, {
      headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ai-master-site' }
    });
    if (resp.status === 404) return null;
    if (!resp.ok) {
      console.warn(`  HTTP ${resp.status} for ${repo}`);
      return null;
    }
    return await resp.json();
  } catch(e) { console.warn(`  Error ${repo}: ${e.message}`); return null; }
}

const fetchedData = new Map(); // repo -> { stars, pushed_at, forks_count, language, topics }
const allTopics = new Map(); // topic -> count

for (let i = 0; i < uniqueRepos.length; i++) {
  const repo = uniqueRepos[i];
  const data = await fetchRepo(repo);
  if (data) {
    fetchedData.set(repo, {
      stars: data.stargazers_count,
      pushed_at: data.pushed_at,
      forks_count: data.forks_count,
      language: data.language,
      topics: data.topics || []
    });
    if (data.topics) data.topics.forEach(t => allTopics.set(t, (allTopics.get(t)||0)+1));
  }
  if (i < uniqueRepos.length - 1) await new Promise(r => setTimeout(r, 1000));
}

console.log(`\n✅ Fetched ${fetchedData.size}/${uniqueRepos.length} repos`);
console.log(`📊 Collected ${allTopics.size} unique topics`);

// --- Compute changes ---
const starChanges = [];
const forkChanges = [];
const langChanges = [];
const updatedTools = [];

for (const [repo, current] of toolDataMap) {
  const gh = fetchedData.get(repo);
  if (!gh) { console.log(`  ⚠️ No data for ${repo}`); continue; }
  
  let changed = false;
  
  // Stars
  if (gh.stars !== current.githubStars) {
    starChanges.push({ repo, old: current.githubStars, new: gh.stars, diff: gh.stars - current.githubStars, id: current.id });
    changed = true;
  }
  
  // Forks
  if (gh.forks_count !== undefined && gh.forks_count !== current.forks) {
    forkChanges.push({ repo, old: current.forks ?? 'none', new: gh.forks_count, id: current.id });
    changed = true;
  }
  
  // Language
  const ghLang = (gh.language && gh.language !== 'null') ? gh.language : undefined;
  if (ghLang !== current.language) {
    langChanges.push({ repo, old: current.language ?? 'none', new: ghLang ?? 'none', id: current.id });
    changed = true;
  }
  
  // updatedAt
  if (gh.pushed_at) {
    const newDate = gh.pushed_at.split('T')[0];
    if (newDate !== current.updatedAt) {
      changed = true;
    }
  }
  
  if (changed) updatedTools.push(repo);
}

console.log(`\n📝 Stars changes: ${starChanges.length}`);
console.log(`📝 Forks changes: ${forkChanges.length}`);
console.log(`📝 Language changes: ${langChanges.length}`);

// --- Find new AI topics ---
const newTopics = [];
const topicRepoCount = new Map(); // for computing minStars

for (const [topic, count] of allTopics) {
  const normalized = topic.toLowerCase().replace(/\s+/g, '-');
  if (existingTopicsSet.has(normalized)) continue;
  
  // Check if AI related
  if (!isAITopic(topic)) continue;
  
  // Check threshold: if only 1 repo uses it, check if that repo has >= 1000 stars
  if (count === 1) {
    // Find the repo(s) using this topic
    let maxStars = 0;
    for (const [repo, gh] of fetchedData) {
      if (gh.topics?.map(t=>t.toLowerCase()).includes(normalized)) {
        maxStars = Math.max(maxStars, gh.stars);
      }
    }
    if (maxStars < 1000) continue;
  }
  
  // Compute minStars based on repo count
  let minStars;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  else minStars = 5000;
  
  // Generate description
  const desc = `（自动发现）${topic.replace(/-/g, ' ')}`;
  
  newTopics.push({ topic: normalized, url: `https://github.com/topics/${normalized}`, minStars, description: desc, count });
}

newTopics.sort((a,b) => b.count - a.count);
console.log(`\n🆕 New AI topics discovered: ${newTopics.length}`);

// --- Save results ---
mkdirSync('tmp', { recursive: true });
writeFileSync('tmp/github-results.json', JSON.stringify({
  starChanges, forkChanges, langChanges, updatedTools,
  newTopics,
  totalFetched: fetchedData.size,
  totalTopics: allTopics.size,
  existingTopics: existingTopicsSet.size,
}, null, 2));

// --- Generate edits for tools.ts ---
let toolsContent = readFileSync('src/data/tools.ts', 'utf8');
let editCount = 0;

// Update stars
for (const sc of starChanges) {
  // Find the tool block and update githubStars
  // Pattern: githubStars: <number> within the tool that has url: "https://github.com/<repo>"
  // We need to find the right tool by repo URL first
  const urlPattern = new RegExp(`(url:\\s*"https://github\\.com/${sc.repo.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')}")[\\s\\S]*?githubStars:\\s*\\d+`);
  const match = toolsContent.match(urlPattern);
  if (match) {
    const oldStars = match[0].match(/githubStars:\s*(\d+)/);
    if (oldStars && parseInt(oldStars[1]) === sc.old) {
      const newStr = match[0].replace(/githubStars:\s*\d+/, `githubStars: ${sc.new}`);
      toolsContent = toolsContent.replace(match[0], newStr);
      editCount++;
    }
  }
}

// Update forks
for (const fc of forkChanges) {
  // Find the tool by repo
  // We need to find within the correct tool block
  const repo = fc.repo;
  // Find the tool block starting with the repo url
  const blocks = [...toolsContent.matchAll(/\{[\s\S]*?url:\s*"https:\/\/github\.com\/([^"]+)"[\s\S]*?\n\s*\}/g)];
  // Actually let's use a simpler approach: find githubStars near the repo url, then add forks
  // Find the line with the repo URL, then look for where to add/update forks
  const urlRegex = new RegExp(`url:\\s*"https://github\\.com/${repo.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')}"`);
  const urlMatch = toolsContent.match(urlRegex);
  if (!urlMatch) continue;
  
  const urlIdx = urlMatch.index;
  // Find the tool block boundaries
  let blockStart = toolsContent.lastIndexOf('{', urlIdx);
  let blockEnd = toolsContent.indexOf('}', urlIdx);
  
  // Check if forks already exists in this block
  const blockContent = toolsContent.substring(blockStart, blockEnd + 1);
  const hasForks = blockContent.match(/forks:\s*\d+/);
  
  if (hasForks) {
    // Update existing forks
    const newContent = toolsContent.substring(0, blockStart) + 
      blockContent.replace(/forks:\s*\d+/, `forks: ${fc.new}`) + 
      toolsContent.substring(blockEnd + 1);
    toolsContent = newContent;
    editCount++;
  } else {
    // Add forks after language or createdAt line
    const insertAfter = blockContent.match(/(language:\s*"[^"]*"|createdAt:\s*"[^"]*")/);
    if (insertAfter) {
      const insertPos = blockStart + insertAfter.index + insertAfter[0].length;
      const newContent = toolsContent.substring(0, insertPos) + 
        `\n    forks: ${fc.new},` + 
        toolsContent.substring(insertPos);
      toolsContent = newContent;
      editCount++;
    }
  }
}

// Update language
for (const lc of langChanges) {
  const repo = lc.repo;
  const urlRegex = new RegExp(`url:\\s*"https://github\\.com/${repo.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')}"`);
  const urlMatch = toolsContent.match(urlRegex);
  if (!urlMatch) continue;
  
  const urlIdx = urlMatch.index;
  let blockStart = toolsContent.lastIndexOf('{', urlIdx);
  let blockEnd = toolsContent.indexOf('}', urlIdx);
  const blockContent = toolsContent.substring(blockStart, blockEnd + 1);
  
  const hasLang = blockContent.match(/language:\s*"[^"]*"/);
  const langValue = lc.new === 'none' ? 'null' : lc.new;
  
  if (hasLang) {
    const newContent = toolsContent.substring(0, blockStart) +
      blockContent.replace(/language:\s*"[^"]*"/, `language: "${langValue}"`) +
      toolsContent.substring(blockEnd + 1);
    toolsContent = newContent;
    editCount++;
  } else {
    // Add language field
    const insertAfter = blockContent.match(/(createdAt:\s*"[^"]*"|githubStars:\s*\d+)/);
    if (insertAfter) {
      const insertPos = blockStart + insertAfter.index + insertAfter[0].length;
      const newContent = toolsContent.substring(0, insertPos) +
        `\n    language: "${langValue}",` +
        toolsContent.substring(insertPos);
      toolsContent = newContent;
      editCount++;
    }
  }
}

// Update updatedAt (pushed_at dates)
for (const repo of updatedTools) {
  const gh = fetchedData.get(repo);
  if (!gh || !gh.pushed_at) continue;
  const newDate = gh.pushed_at.split('T')[0];
  
  const urlRegex = new RegExp(`url:\\s*"https://github\\.com/${repo.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')}"`);
  const urlMatch = toolsContent.match(urlRegex);
  if (!urlMatch) continue;
  
  const urlIdx = urlMatch.index;
  let blockStart = toolsContent.lastIndexOf('{', urlIdx);
  let blockEnd = toolsContent.indexOf('}', urlIdx);
  const blockContent = toolsContent.substring(blockStart, blockEnd + 1);
  
  const hasUpdated = blockContent.match(/updatedAt:\s*"[^"]*"/);
  if (hasUpdated) {
    const newContent = toolsContent.substring(0, blockStart) +
      blockContent.replace(/updatedAt:\s*"[^"]*"/, `updatedAt: "${newDate}"`) +
      toolsContent.substring(blockEnd + 1);
    toolsContent = newContent;
    editCount++;
  }
}

// --- Update ai-topics.json ---
const updatedTopicsData = {
  ...topicsData,
  lastUpdated: new Date().toISOString(),
  topics: [...topicsData.topics, ...newTopics.map(t => ({
    topic: t.topic,
    url: t.url,
    minStars: t.minStars,
    description: t.description
  }))]
};

writeFileSync('data/ai-topics.json', JSON.stringify(updatedTopicsData, null, 2));
console.log(`\n✅ Updated ai-topics.json: ${newTopics.length} new topics`);

// Save updated tools.ts
writeFileSync('src/data/tools.ts', toolsContent);
console.log(`✅ Updated tools.ts: ${editCount} edits`);

// --- Print summary ---
console.log('\n=== STARS CHANGES ===');
for (const sc of starChanges.slice(0, 20)) {
  const sign = sc.diff > 0 ? '+' : '';
  console.log(`  ${sc.id} (${sc.repo}): ${sc.old} → ${sc.new} (${sign}${sc.diff})`);
}
if (starChanges.length > 20) console.log(`  ... and ${starChanges.length - 20} more`);

console.log('\n=== TOP CHANGES ===');
const topChanges = starChanges.sort((a,b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 5);
for (const tc of topChanges) {
  const sign = tc.diff > 0 ? '+' : '';
  console.log(`  ${tc.id}: ${sign}${tc.diff}`);
}

console.log('\n=== NEW TOPICS ===');
for (const t of newTopics.slice(0, 15)) {
  console.log(`  ${t.topic} (${t.count} repos, minStars: ${t.minStars})`);
}
if (newTopics.length > 15) console.log(`  ... and ${newTopics.length - 15} more`);

// Save edit count
writeFileSync('tmp/edit-count.txt', String(editCount));
writeFileSync('tmp/star-changes-count.txt', String(starChanges.length));
writeFileSync('tmp/new-topics-count.txt', String(newTopics.length));

console.log('\n✅ Done!');
