import { readFileSync, writeFileSync } from 'fs';

const resultsData = JSON.parse(readFileSync('update-results.json', 'utf-8'));
const resultsMap = new Map();
for (const r of resultsData.results) {
  resultsMap.set(r.ownerRepo, r);
}

let content = readFileSync('src/data/tools.ts', 'utf-8');
const originalContent = content;
const changes = [];

// Build URL -> repo mapping from tools.ts
const urlRegex = /url:\s*"https:\/\/github\.com\/([^"]+)"/g;
let match;
const urlToRepo = new Map();
while ((match = urlRegex.exec(content)) !== null) {
  urlToRepo.set(match[1], match[1]);
}

// For each known repo, do targeted replacements
for (const [repoKey] of urlToRepo) {
  const apiData = resultsMap.get(repoKey);
  if (!apiData) continue;
  
  // Find the tool block containing this URL
  const urlIndex = content.indexOf(`"https://github.com/${repoKey}"`);
  if (urlIndex === -1) continue;
  
  // Find the tool object boundaries
  // Look backward for the opening {
  let startIdx = urlIndex;
  let braceCount = 0;
  while (startIdx >= 0) {
    if (content[startIdx] === '}') braceCount++;
    if (content[startIdx] === '{') {
      if (braceCount === 0) break;
      braceCount--;
    }
    startIdx--;
  }
  
  // Look forward for the closing }
  let endIdx = urlIndex;
  braceCount = 0;
  while (endIdx < content.length) {
    if (content[endIdx] === '{') braceCount++;
    if (content[endIdx] === '}') {
      if (braceCount === 0) break;
      braceCount--;
    }
    endIdx++;
  }
  
  const block = content.substring(startIdx, endIdx + 1);
  const idMatch = block.match(/id:\s*"([^"]+)"/);
  if (!idMatch) continue;
  const toolId = idMatch[1];
  
  let blockModified = false;
  let newBlock = block;
  
  // Update githubStars
  const starsMatch = newBlock.match(/githubStars:\s*(\d+)/);
  if (starsMatch && parseInt(starsMatch[1]) !== apiData.stars) {
    const oldVal = parseInt(starsMatch[1]);
    newBlock = newBlock.replace(/githubStars:\s*\d+/, `githubStars: ${apiData.stars}`);
    changes.push({ toolId, repo: repoKey, field: 'stars', old: oldVal, new: apiData.stars, diff: apiData.stars - oldVal });
    blockModified = true;
  }
  
  // Update forks
  const forksMatch = newBlock.match(/,\s*\n\s*forks:\s*(\d+)/);
  if (forksMatch && parseInt(forksMatch[1]) !== apiData.forks) {
    newBlock = newBlock.replace(/,\s*\n\s*forks:\s*\d+/, `,\\n    forks: ${apiData.forks}`);
    changes.push({ toolId, repo: repoKey, field: 'forks', old: parseInt(forksMatch[1]), new: apiData.forks });
    blockModified = true;
  }
  
  // Update language
  const langMatch = newBlock.match(/language:\s*"([^"]+)"/);
  if (langMatch && apiData.language && apiData.language !== 'None' && langMatch[1] !== apiData.language) {
    newBlock = newBlock.replace(/language:\s*"[^"]+"/, `language: "${apiData.language}"`);
    changes.push({ toolId, repo: repoKey, field: 'language', old: langMatch[1], new: apiData.language });
    blockModified = true;
  }
  
  // Update updatedAt
  if (apiData.pushedAt) {
    const dateStr = apiData.pushedAt.split('T')[0];
    const updateMatch = newBlock.match(/updatedAt:\s*"([^"]+)"/);
    if (updateMatch && updateMatch[1] !== dateStr) {
      newBlock = newBlock.replace(/updatedAt:\s*"[^"]+"/, `updatedAt: "${dateStr}"`);
      changes.push({ toolId, repo: repoKey, field: 'updatedAt', old: updateMatch[1], new: dateStr });
      blockModified = true;
    }
  }
  
  if (blockModified) {
    content = content.substring(0, startIdx) + newBlock + content.substring(endIdx + 1);
  }
}

// Sort tools within each category by stars (descending)
// Extract all tools with their blocks
const allToolsPattern = /\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"[\s\S]*?githubStars:\s*(\d+)[\s\S]*?\n\s*\}(?=\s*,\s*\{|\s*\n\s*\])/g;

const sortedTools = [];
let m;
const tempContent = content;

// Simple approach: find all tool blocks, sort, rebuild
const toolPattern = /\{[\s\S]*?\n\s*\}/g;
const allMatches = [];
let idx = 0;
let searchFrom = content.indexOf('export const tools: Tool[] = [') + 'export const tools: Tool[] = ['.length;

// Use a manual parser to find tool objects
function findToolObjects(str) {
  const results = [];
  let i = str.indexOf('export const tools: Tool[] = [');
  if (i === -1) return results;
  i = str.indexOf('[', i);
  i++;
  
  let depth = 0;
  let blockStart = -1;
  
  while (i < str.length) {
    const ch = str[i];
    if (ch === '{') {
      if (depth === 0) blockStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && blockStart >= 0) {
        const block = str.substring(blockStart, i + 1);
        results.push(block);
        blockStart = -1;
      }
    } else if (ch === ',' && depth === 0) {
      // skip commas between tools
    } else if (ch === ']' && depth === 0) {
      break;
    }
    i++;
  }
  
  return results;
}

const toolBlocks = findToolObjects(content);
console.log(`Found ${toolBlocks.length} tool blocks`);

if (toolBlocks.length > 0) {
  // Parse each block
  const parsed = toolBlocks.map(block => {
    const id = block.match(/id:\s*"([^"]+)"/)?.[1] || '';
    const cat = block.match(/category:\s*"([^"]+)"/)?.[1] || '';
    const stars = parseInt(block.match(/githubStars:\s*(\d+)/)?.[1] || '0');
    return { id, cat, stars, block };
  });
  
  // Group by category and sort
  const categories = {};
  for (const t of parsed) {
    if (!categories[t.cat]) categories[t.cat] = [];
    categories[t.cat].push(t);
  }
  
  const catOrder = ['llm','agent','framework','cli','plugin','data','multimodal','search','security','devops','education','cv','aieng','finance'];
  
  const sorted = [];
  for (const cat of catOrder) {
    if (categories[cat]) {
      categories[cat].sort((a, b) => b.stars - a.stars);
      sorted.push(...categories[cat].map(t => t.block));
    }
  }
  
  // Rebuild the file
  const beforeTools = content.substring(0, content.indexOf('export const tools: Tool[] = [') + 'export const tools: Tool[] = ['.length);
  const afterTools = content.substring(content.indexOf('export const tools: Tool[] = [') + content.indexOf('export const tools: Tool[] = [') + 'export const tools: Tool[] = ['.length);
  
  // Find where tools array ends
  let toolsStartIdx = content.indexOf('export const tools: Tool[] = [');
  let bracketDepth = 0;
  let toolsEndIdx = -1;
  let inString = false;
  let escapeNext = false;
  
  for (let i = content.indexOf('[', toolsStartIdx); i < content.length; i++) {
    const ch = content[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\') { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') bracketDepth++;
    if (ch === '}' || ch === ']') bracketDepth--;
    if (bracketDepth === 0 && ch === ']') {
      toolsEndIdx = i;
      break;
    }
  }
  
  const beforeArr = content.substring(0, toolsStartIdx + 'export const tools: Tool[] = ['.length);
  const afterArr = content.substring(toolsEndIdx + 1);
  
  const finalContent = beforeArr + '\n' + sorted.join(',\n') + '\n' + afterArr;
  
  writeFileSync('src/data/tools.ts', finalContent);
  console.log('File updated and sorted');
} else {
  writeFileSync('src/data/tools.ts', content);
}

// Report changes
const starChanges = changes.filter(c => c.field === 'stars').sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
console.log(`\n=== Stars Updates: ${starChanges.length} tools changed ===`);
for (const c of starChanges.slice(0, 15)) {
  const sign = c.diff > 0 ? '+' : '';
  console.log(`  ${c.toolId}: ${c.old.toLocaleString()} → ${c.new.toLocaleString()} (${sign}${c.diff.toLocaleString()})`);
}

const forkChanges = changes.filter(c => c.field === 'forks');
console.log(`\nForks updates: ${forkChanges.length}`);

const langChanges = changes.filter(c => c.field === 'language');
console.log(`Language updates: ${langChanges.length}`);
for (const c of langChanges) {
  console.log(`  ${c.toolId}: "${c.old}" → "${c.new}"`);
}

if (starChanges.length === 0 && forkChanges.length === 0 && langChanges.length === 0) {
  console.log('\n✅ No changes detected');
}
