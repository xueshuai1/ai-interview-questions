import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/data/tools.ts', 'utf-8');

// Find tools array boundaries
const toolsStart = content.indexOf('export const tools: Tool[] = [');
const bracketStart = content.indexOf('[', toolsStart);

let depth = 0;
let toolsEnd = -1;
let inString = false;
let escapeNext = false;

for (let i = bracketStart; i < content.length; i++) {
  const ch = content[i];
  if (escapeNext) { escapeNext = false; continue; }
  if (ch === '\\') { escapeNext = true; continue; }
  if (ch === '"') { inString = !inString; continue; }
  if (inString) continue;
  if (ch === '{') depth++;
  if (ch === '}') depth--;
  if (ch === '[') depth++;
  if (ch === ']' && depth > 0) { depth--; continue; }
  if (ch === ']' && depth === 0) {
    toolsEnd = i;
    break;
  }
}

const beforeArr = content.substring(0, bracketStart + 1);
const afterArr = content.substring(toolsEnd);
const arrContent = content.substring(bracketStart + 1, toolsEnd);

// Find tool objects within the array
function findObjects(str) {
  const results = [];
  let depth = 0;
  let blockStart = -1;
  let inStr = false;
  let esc = false;
  
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (esc) { esc = false; continue; }
    if (ch === '\\') { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') {
      if (depth === 0) blockStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && blockStart >= 0) {
        results.push(str.substring(blockStart, i + 1));
        blockStart = -1;
      }
    }
  }
  return results;
}

const blocks = findObjects(arrContent);
console.log(`Found ${blocks.length} tool blocks`);

// Parse each block
const parsed = blocks.map(block => {
  const id = block.match(/id:\s*"([^"]+)"/)?.[1] || '';
  const cat = block.match(/category:\s*"([^"]+)"/)?.[1] || '';
  const stars = parseInt(block.match(/githubStars:\s*(\d+)/)?.[1] || '0');
  return { id, cat, stars, block };
});

// Group by category
const categories = {};
for (const t of parsed) {
  if (!categories[t.cat]) categories[t.cat] = [];
  categories[t.cat].push(t);
}

// Sort within each category
const catOrder = ['llm','agent','framework','cli','plugin','data','multimodal','search','security','devops','education','cv','aieng','finance'];
const sorted = [];

for (const cat of catOrder) {
  if (categories[cat]) {
    categories[cat].sort((a, b) => b.stars - a.stars);
    sorted.push(...categories[cat].map(t => t.block));
  }
}

// Write sorted file
const final = beforeArr + '\n' + sorted.join(',\n') + '\n' + afterArr;
writeFileSync('src/data/tools.ts', final);
console.log('Sorted successfully');

// Verify ordering
for (const cat of catOrder) {
  if (categories[cat] && categories[cat].length > 1) {
    const items = categories[cat];
    const sorted_check = items.map(t => `${t.id}(${t.stars})`).join(' → ');
    console.log(`\n${cat} (${items.length} tools):`);
    console.log(sorted_check);
  }
}
