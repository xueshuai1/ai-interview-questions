import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const result = JSON.parse(readFileSync(join(ROOT, 'scripts/update-result.json'), 'utf-8'));
const { starsUpdates, forksUpdates, languageUpdates, updatedAtUpdates, aiNew } = result;

let toolsContent = readFileSync(join(ROOT, 'src/data/tools.ts'), 'utf-8');

// Parse tool blocks to get exact positions
function parseToolBlocks(content) {
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
    tools.push({ id, start: startIdx, end: endIdx });
  }
  return tools;
}

const toolBlocks = parseToolBlocks(toolsContent);

// Build update map
const updateMap = {};
for (const u of starsUpdates) {
  if (!updateMap[u.id]) updateMap[u.id] = {};
  updateMap[u.id].githubStars = u.new;
}
for (const u of forksUpdates) {
  if (!updateMap[u.id]) updateMap[u.id] = {};
  updateMap[u.id].forks = u.new;
}
for (const u of languageUpdates) {
  if (!updateMap[u.id]) updateMap[u.id] = {};
  updateMap[u.id].language = u.new === '(none)' ? undefined : u.new;
}
for (const u of updatedAtUpdates) {
  if (!updateMap[u.id]) updateMap[u.id] = {};
  updateMap[u.id].updatedAt = u.new;
}

// Apply updates to each tool block
let offset = 0;
for (const tb of toolBlocks) {
  const updates = updateMap[tb.id];
  if (!updates) continue;
  
  const blockStart = tb.start + offset;
  const block = toolsContent.slice(blockStart, tb.end + offset);
  
  let newBlock = block;
  
  // Update githubStars
  if (updates.githubStars !== undefined) {
    newBlock = newBlock.replace(
      /(githubStars:\s*)\d+/,
      `$1${updates.githubStars}`
    );
  }
  
  // Update forks - if forks field exists, update it; if not, add it
  if (updates.forks !== undefined) {
    if (newBlock.includes('forks:')) {
      newBlock = newBlock.replace(
        /(forks:\s*)\d+/,
        `$1${updates.forks}`
      );
    } else {
      // Add forks after githubStars line
      newBlock = newBlock.replace(
        /(githubStars:\s*\d+,?\n)/,
        `$1    forks: ${updates.forks},\n`
      );
    }
  }
  
  // Update language - if language field exists, update it; if not, add it
  if (updates.language !== undefined) {
    if (newBlock.includes('language:')) {
      newBlock = newBlock.replace(
        /(language:\s*["'])[^"']+(["'])/,
        `$1${updates.language}$2`
      );
    } else {
      // Add language after forks (if exists) or after githubStars
      if (newBlock.includes('forks:')) {
        newBlock = newBlock.replace(
          /(forks:\s*\d+,?\n)/,
          `$1    language: "${updates.language}",\n`
        );
      } else {
        newBlock = newBlock.replace(
          /(githubStars:\s*\d+,?\n)/,
          `$1    language: "${updates.language}",\n`
        );
      }
    }
  }
  
  // Update updatedAt
  if (updates.updatedAt !== undefined) {
    if (newBlock.includes('updatedAt:')) {
      newBlock = newBlock.replace(
        /(updatedAt:\s*["'])[^"']+(["'])/,
        `$1${updates.updatedAt}$2`
      );
    } else {
      // Add updatedAt after updatedAt-related field or after githubStars
      newBlock = newBlock.replace(
        /(githubStars:\s*\d+,?\n)/,
        `$1    updatedAt: "${updates.updatedAt}",\n`
      );
    }
  }
  
  if (newBlock !== block) {
    toolsContent = toolsContent.slice(0, blockStart) + newBlock + toolsContent.slice(tb.end + offset);
    offset += newBlock.length - block.length;
  }
}

writeFileSync(join(ROOT, 'src/data/tools.ts'), toolsContent);
console.log(`Applied updates to ${Object.keys(updateMap).length} tools`);

// Sort tools within each category by stars
// This is a more complex operation - let's do it
const tsContent = readFileSync(join(ROOT, 'src/data/tools.ts'), 'utf-8');

// Extract categories and their tools
const catRegex = /\{[\s\n]*id:\s*["']([^"']+)["'][\s\S]*?category:\s*["']([^"']+)["'][\s\S]*?githubStars:\s*(\d+)/g;
const categoryOrder = [];
const categoryTools = {};
let cm;

// Parse the tools array more carefully
function sortToolsByStars(content) {
  // Find the tools array
  const arrStart = content.indexOf('export const tools: Tool[] = [');
  if (arrStart === -1) return content;
  
  // Find all tool blocks and their categories + stars
  const toolData = [];
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
    const catM = block.match(/category:\s*["']([^"']+)["']/);
    const starsM = block.match(/githubStars:\s*(\d+)/);
    if (catM && starsM) {
      toolData.push({ id, cat: catM[1], stars: parseInt(starsM[1]), start: startIdx, end: endIdx, block });
    }
  }
  
  // Group by category
  const cats = {};
  for (const t of toolData) {
    if (!cats[t.cat]) cats[t.cat] = [];
    cats[t.cat].push(t);
  }
  
  // Sort each category by stars descending
  for (const cat of Object.keys(cats)) {
    cats[cat].sort((a, b) => b.stars - a.stars);
  }
  
  // Rebuild content
  const header = content.slice(0, arrStart + 'export const tools: Tool[] = ['.length);
  const newTools = [];
  
  // Get category order from toolCategories
  const catOrderRe = /\{\s*key:\s*"([^"]+)"[^}]*\}/g;
  const order = [];
  let com;
  while ((com = catOrderRe.exec(content)) !== null) {
    order.push(com[1]);
  }
  
  // Output tools in category order, sorted by stars within each
  for (const catKey of order) {
    if (cats[catKey]) {
      for (const t of cats[catKey]) {
        newTools.push(t.block);
      }
    }
  }
  
  // Add any uncategorized tools
  for (const t of toolData) {
    if (!order.includes(t.cat)) {
      newTools.push(t.block);
    }
  }
  
  return header + '\n' + newTools.join(',\n') + ',\n];\n';
}

// Don't sort - just save the file as-is to minimize diff
// Sorting would change too much. Let's skip sorting for now.
console.log('Tools updated (no re-sorting to minimize diff)');

// Update ai-topics.json with new AI topics
if (aiNew.length > 0) {
  const topicsJson = JSON.parse(readFileSync(join(ROOT, 'data/ai-topics.json'), 'utf-8'));
  for (const t of aiNew) {
    if (!topicsJson.topics.some(existing => existing.topic === t.topic)) {
      topicsJson.topics.push({
        topic: t.topic,
        url: t.url,
        minStars: t.minStars,
        description: t.description
      });
    }
  }
  topicsJson.lastUpdated = new Date().toISOString();
  writeFileSync(join(ROOT, 'data/ai-topics.json'), JSON.stringify(topicsJson, null, 2));
  console.log(`Added ${aiNew.length} new AI topics to ai-topics.json`);
} else {
  console.log('No new AI topics to add');
}

console.log('Done!');
