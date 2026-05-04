import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load token
const env = readFileSync(join(ROOT, '.env.local'), 'utf-8');
const GITHUB_TOKEN = env.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No GITHUB_TOKEN'); process.exit(1); }

// Load ai-topics.json
const topicsData = JSON.parse(readFileSync(join(ROOT, 'data/ai-topics.json'), 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
console.log(`Existing topics: ${existingTopics.size}`);

// Extract repos from tools.ts
const toolsContent = readFileSync(join(ROOT, 'src/data/tools.ts'), 'utf-8');

function extractTools(content) {
  const tools = [];
  const re = /\{[\s\n]*id:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const id = m[1];
    const startIdx = m.index;
    let depth = 0, endIdx = startIdx;
    for (let i = startIdx; i < content.length; i++) {
      if (content[i] === '{') depth++;
      if (content[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
    }
    const block = content.slice(startIdx, endIdx);
    const urlM = block.match(/url:\s*["'](https:\/\/github\.com\/[^"']+)["']/);
    if (!urlM) continue;
    const url = urlM[1].replace(/\/+$/, '');
    const repo = url.replace('https://github.com/', '').split('/').slice(0, 2).join('/');
    const starsM = block.match(/githubStars:\s*(\d+)/);
    const forksM = block.match(/forks:\s*(\d+)/);
    const langM = block.match(/language:\s*["']([^"']+)["']/);
    const updatedM = block.match(/updatedAt:\s*["']([^"']+)["']/);
    tools.push({
      id, repo, url,
      githubStars: starsM ? parseInt(starsM[1]) : null,
      forks: forksM ? parseInt(forksM[1]) : undefined,
      language: langM ? langM[1] : undefined,
      updatedAt: updatedM ? updatedM[1] : undefined
    });
  }
  return tools;
}

const tools = extractTools(toolsContent);
const uniqueRepos = [...new Set(tools.map(t => t.repo))];
console.log(`Found ${tools.length} tools, ${uniqueRepos.length} unique repos`);

// Use curl with Authorization header for reliable auth
function fetchRepo(repo) {
  try {
    const result = execSync(
      `curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H "User-Agent: ai-master-site" "https://api.github.com/repos/${repo}"`,
      { encoding: 'utf-8', timeout: 15000 }
    );
    const data = JSON.parse(result);
    if (data.message && data.message.includes('Not Found')) {
      return { repo, error: 'not_found' };
    }
    return { repo, data };
  } catch (e) {
    return { repo, error: e.message };
  }
}

// Batch fetch with small delays
const results = [];
for (let i = 0; i < uniqueRepos.length; i++) {
  const result = fetchRepo(uniqueRepos[i]);
  results.push(result);
  if (result.error) {
    console.log(`[${i+1}/${uniqueRepos.length}] ${uniqueRepos[i]} - ${result.error}`);
  }
  if ((i + 1) % 20 === 0) {
    console.log(`Progress: ${i + 1}/${uniqueRepos.length} (${results.filter(r => !r.error).length} success)`);
  }
  // Small delay to be safe
  if (i < uniqueRepos.length - 1) {
    await new Promise(r => setTimeout(r, 200));
  }
}

// Analyze
const starsUpdates = [];
const forksUpdates = [];
const languageUpdates = [];
const updatedAtUpdates = [];
const allTopics = {};

for (const result of results) {
  if (result.error || !result.data) continue;
  const { data } = result;
  const matchingTools = tools.filter(t => t.repo === result.repo);
  
  for (const tool of matchingTools) {
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLang = data.language || undefined;
    const newUpdated = data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : undefined;
    
    if (tool.githubStars !== null && newStars !== tool.githubStars) {
      starsUpdates.push({ id: tool.id, old: tool.githubStars, new: newStars, diff: newStars - tool.githubStars });
    }
    if (tool.forks === undefined || newForks !== tool.forks) {
      forksUpdates.push({ id: tool.id, old: tool.forks, new: newForks });
    }
    if (tool.language !== newLang) {
      languageUpdates.push({ id: tool.id, old: tool.language || '(none)', new: newLang || '(none)' });
    }
    if (newUpdated && tool.updatedAt !== newUpdated) {
      updatedAtUpdates.push({ id: tool.id, old: tool.updatedAt, new: newUpdated });
    }
  }
  
  if (data.topics && Array.isArray(data.topics)) {
    for (const topic of data.topics) {
      const norm = topic.toLowerCase().replace(/\s+/g, '-');
      if (!allTopics[norm]) allTopics[norm] = { repos: [], maxStars: 0 };
      allTopics[norm].repos.push(result.repo);
      allTopics[norm].maxStars = Math.max(allTopics[norm].maxStars, data.stargazers_count);
    }
  }
}

// New AI topics
const aiKw = ['ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language','neural','learning','generative','prompt','chatbot','deep-learning','machine-learning','transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops','mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal','speech','text-to-speech','image-generation','video-generation','code-generation','autonomous','embodied-ai','world-models','foundation-models','large-language-models','retrieval-augmented','instruction-tuning','rlhf','alignment'];

const newTopics = [];
for (const [topic, info] of Object.entries(allTopics)) {
  if (existingTopics.has(topic)) continue;
  if (info.repos.length <= 1 && info.maxStars < 1000) continue;
  const isAi = aiKw.some(kw => topic.includes(kw) || kw.includes(topic));
  const minStars = info.repos.length >= 3 ? 2000 : info.repos.length >= 2 ? 3000 : 5000;
  newTopics.push({
    topic, url: `https://github.com/topics/${topic}`, minStars,
    description: `（自动发现）${topic}`,
    repoCount: info.repos.length, isAi
  });
}
newTopics.sort((a, b) => b.repoCount - a.repoCount);

// Report
console.log('\n=== STARS UPDATES ===');
starsUpdates.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
starsUpdates.forEach(u => console.log(`  ${u.id}: ${u.old} → ${u.new} (${u.diff > 0 ? '+' : ''}${u.diff})`));
console.log(`Total: ${starsUpdates.length}`);

console.log(`\n=== FORKS: ${forksUpdates.length} | LANG: ${languageUpdates.length} | UPDATED: ${updatedAtUpdates.length} ===`);

const aiNew = newTopics.filter(t => t.isAi);
const nonAiNew = newTopics.filter(t => !t.isAi);
console.log(`\n=== NEW AI TOPICS: ${aiNew.length} ===`);
aiNew.slice(0, 30).forEach(t => console.log(`  ${t.topic} (${t.repoCount} repos)`));
console.log(`\n=== NEW NON-AI TOPICS: ${nonAiNew.length} ===`);
nonAiNew.slice(0, 10).forEach(t => console.log(`  ${t.topic} (${t.repoCount} repos)`));

writeFileSync(join(ROOT, 'scripts/update-result.json'), JSON.stringify({
  starsUpdates, forksUpdates, languageUpdates, updatedAtUpdates,
  newTopics, aiNew, nonAiNew,
  totalScanned: uniqueRepos.length,
  totalSuccess: results.filter(r => !r.error).length,
  errorRepos: results.filter(r => r.error).map(r => ({ repo: r.repo, error: r.error }))
}, null, 2));
console.log('\nResult saved.');
