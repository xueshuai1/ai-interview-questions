#!/usr/bin/env node
/**
 * Simple refactoring: extract \`\`\` code blocks from body fields into code: arrays.
 * Processes one file at a time.
 */
const fs = require('fs');

const filepath = process.argv[2];
if (!filepath) {
  console.error('Usage: node fix.js <filepath>');
  process.exit(1);
}

let content = fs.readFileSync(filepath, 'utf-8');

// Find all body template literals with code blocks
// The pattern: body:` or body: \n    ` etc.
let changed = false;
let totalBlocks = 0;

// Find body: followed by template literal
const bodyStartRegex = /(body\s*:\s*)`/g;

function processBody(startIndex) {
  const match = bodyStartRegex.exec(content);
  if (!match) return 0;
  
  const prefixEnd = startIndex + match.index + match[0].length;
  
  // Find closing backtick (not escaped)
  let closeIdx = -1;
  for (let i = prefixEnd; i < content.length; i++) {
    if (content[i] === '`' && (i === 0 || content[i-1] !== '\\')) {
      closeIdx = i;
      break;
    }
  }
  
  if (closeIdx === -1) return 0;
  
  const bodyText = content.substring(prefixEnd, closeIdx);
  
  // Find code blocks
  const codeRegex = /\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/g;
  const blocks = [];
  let m;
  while ((m = codeRegex.exec(bodyText)) !== null) {
    blocks.push({ full: m[0], lang: m[1] || '', code: m[2].trimEnd() });
  }
  
  if (blocks.length === 0) {
    bodyStartRegex.lastIndex = closeIdx + 1;
    return processBody(closeIdx + 1);
  }
  
  // Check for existing code: array
  const afterBody = content.substring(closeIdx + 1, closeIdx + 300);
  const existingCode = afterBody.match(/^(\s*,\s*\n\s*code\s*:)(\s*\[)/);
  
  // Clean body text
  let cleanBody = bodyText;
  for (const b of blocks) {
    cleanBody = cleanBody.replace(b.full, '');
  }
  cleanBody = cleanBody.replace(/\n{3,}/g, '\n\n').trim();
  
  // Detect language
  function detectLang(lang, code) {
    const map = {py:'python',js:'javascript',ts:'typescript',sh:'bash',yml:'yaml'};
    if (lang && map[lang.toLowerCase()]) return map[lang.toLowerCase()];
    if (lang) return lang;
    const c = code.trim().toLowerCase();
    if (/^(import |from |def |class )/.test(c)) return 'python';
    if (/^#!\/|^pip |^npm |^apt |^docker |^git |^curl |^sudo /m.test(c)) return 'bash';
    if (c.startsWith('{') && /"/.test(c)) return 'json';
    if (c.startsWith('<') && /<(html|div|body)/i.test(c)) return 'html';
    return 'python';
  }
  
  // Build code entries
  const entries = blocks.map(b => {
    const lang = detectLang(b.lang, b.code);
    const escaped = b.code.replace(/\$\{/g, '\\${');
    return `{\n          lang: "${lang}",\n          code: \`${escaped}\`,\n        }`;
  });
  
  const codeArray = `[\n        ${entries.join(',\n        ')}\n        ],`;
  
  let newSection;
  if (cleanBody) {
    newSection = `body: \`${cleanBody}\`,\n        code: ${codeArray}`;
  } else {
    newSection = `body: \`\`,\n        code: ${codeArray}`;
  }
  
  if (existingCode) {
    // Merge with existing code array
    const codeContent = afterBody.substring(existingCode[0].length);
    // Find end of existing code array
    let depth = 1;
    let endIdx = existingCode[0].length;
    for (let i = endIdx; i < afterBody.length && depth > 0; i++) {
      if (afterBody[i] === '[') depth++;
      if (afterBody[i] === ']') depth--;
      if (depth === 0) endIdx = i + 1;
    }
    const existingInner = afterBody.substring(existingCode[0].length, endIdx).trim().slice(1, -1);
    const combined = existingInner + ',\n        ' + entries.join(',\n        ');
    
    if (cleanBody) {
      newSection = `body: \`${cleanBody}\`,\n        code: [\n        ${combined}\n        ],`;
    }
    
    const oldFull = content.substring(startIndex + match.index, closeIdx + 1 + endIdx);
    content = content.substring(0, startIndex + match.index) + newSection + content.substring(startIndex + match.index + oldFull.length);
  } else {
    const oldStart = startIndex + match.index;
    // Find comma after closing backtick
    const afterClose = content.substring(closeIdx + 1);
    const commaM = afterClose.match(/^(\s*,)/);
    if (commaM) {
      content = content.substring(0, oldStart) + newSection + content.substring(closeIdx + 1 + commaM[1].length);
    } else {
      content = content.substring(0, oldStart) + newSection + content.substring(closeIdx + 1);
    }
  }
  
  changed = true;
  totalBlocks += blocks.length;
  bodyStartRegex.lastIndex = 0; // Reset for next iteration
  return blocks.length;
}

let iterations = 0;
const maxIterations = 50;
let lastContent = '';
while (iterations < maxIterations) {
  bodyStartRegex.lastIndex = 0;
  const count = processBody(0);
  iterations++;
  if (count === 0) break;
  if (content === lastContent) break;
  lastContent = content;
}

if (changed) {
  fs.writeFileSync(filepath, content, 'utf-8');
}
console.log(`Processed ${filepath}: ${totalBlocks} code blocks extracted, ${changed ? 'CHANGED' : 'no change'}`);
