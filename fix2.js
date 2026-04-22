#!/usr/bin/env node
/**
 * Extract escaped backtick code blocks from body template literals into code: arrays.
 */
const fs = require('fs');

const filepath = process.argv[2];
if (!filepath) { console.error('Usage: node fix2.js <file>'); process.exit(1); }

let content = fs.readFileSync(filepath, 'utf-8');
let totalBlocks = 0;
let changed = false;

// Process iteratively: find body template literals, extract code blocks, replace
for (let iter = 0; iter < 50; iter++) {
  // Find body: ` pattern
  const bodyMatch = content.match(/(body\s*:\s*)\`/);
  if (!bodyMatch) break;
  
  const bodyOpenPos = bodyMatch.index + bodyMatch[0].length;
  
  // Find closing backtick (not preceded by \)
  let closePos = -1;
  for (let i = bodyOpenPos; i < content.length; i++) {
    if (content[i] === '`' && content[i-1] !== '\\') {
      closePos = i;
      break;
    }
  }
  if (closePos === -1) break;
  
  const bodyText = content.substring(bodyOpenPos, closePos);
  
  // Find code blocks: \`\`\`lang\ncode\n\`\`\`
  // In regex: \\`\\`\\` matches literal \`\`\`
  const codeRegex = /\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/g;
  const blocks = [];
  let codeMatch;
  while ((codeMatch = codeRegex.exec(bodyText)) !== null) {
    blocks.push({
      full: codeMatch[0],
      lang: codeMatch[1] || '',
      code: codeMatch[2].trimEnd(),
    });
  }
  
  if (blocks.length === 0) {
    // Remove this body from search by moving past it
    content = content.substring(0, bodyOpenPos) + '\u0000' + content.substring(bodyOpenPos);
    continue;
  }
  
  // Detect language
  function detectLang(lang, code) {
    const map = {py:'python',js:'javascript',ts:'typescript',sh:'bash',yml:'yaml'};
    if (lang && map[lang.toLowerCase()]) return map[lang.toLowerCase()];
    if (lang) return lang;
    const c = code.trimStart().toLowerCase();
    if (/^import |^from |^def |^class |^import torch|^import numpy|^import os/.test(c)) return 'python';
    if (/^#!\/|^pip |^npm |^apt |^docker |^git |^curl |^sudo |^conda /.test(c)) return 'bash';
    if (/^[\[{]/.test(c) && /"/.test(c)) return 'json';
    return 'python';
  }
  
  // Clean body
  let cleanBody = bodyText;
  for (const b of blocks) {
    cleanBody = cleanBody.replace(b.full, '');
  }
  cleanBody = cleanBody.replace(/\n{3,}/g, '\n\n').trim();
  
  // Build code entries
  const entries = blocks.map(b => {
    const lang = detectLang(b.lang, b.code);
    const escaped = b.code.replace(/\$\{/g, '\\${');
    return `{\n          lang: "${lang}",\n          code: \`${escaped}\`,\n        }`;
  });
  
  const codeArray = `code: [\n        ${entries.join(',\n        ')}\n        ],`;
  
  const newBody = cleanBody ? `body: \`${cleanBody}\`,\n        ${codeArray}` : `body: \`\`,\n        ${codeArray}`;
  
  // Check for existing code: after this body
  const afterClose = content.substring(closePos + 1);
  const existingCodeMatch = afterClose.match(/^(\s*,\s*\n\s*code\s*:)(\s*\[)/);
  
  let newSection;
  let replaceEnd;
  
  if (existingCodeMatch) {
    // Merge with existing code array
    let depth = 1;
    let endIdx = existingCodeMatch[0].length;
    for (let i = endIdx; i < afterClose.length && depth > 0; i++) {
      if (afterClose[i] === '[') depth++;
      if (afterClose[i] === ']') depth--;
      if (depth === 0) endIdx = i + 1;
    }
    const existingInner = afterClose.substring(existingCodeMatch[0].length, endIdx).trim().slice(1, -1);
    const combined = existingInner + ',\n        ' + entries.join(',\n        ');
    newSection = cleanBody ? `body: \`${cleanBody}\`,\n        code: [\n        ${combined}\n        ],` : `body: \`\`,\n        code: [\n        ${combined}\n        ],`;
    replaceEnd = closePos + 1 + endIdx;
  } else {
    // Check for comma after closing backtick
    const commaMatch = afterClose.match(/^(\s*,)/);
    if (commaMatch) {
      replaceEnd = closePos + 1 + commaMatch[1].length;
    } else {
      replaceEnd = closePos + 1;
    }
    newSection = newBody;
  }
  
  content = content.substring(0, bodyMatch.index) + newSection + content.substring(replaceEnd);
  changed = true;
  totalBlocks += blocks.length;
}

if (changed) {
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`${filepath}: ${totalBlocks} code blocks extracted`);
} else {
  console.log(`${filepath}: no changes`);
}
