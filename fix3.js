#!/usr/bin/env node
/**
 * Extract escaped backtick code blocks from body template literals into code: arrays.
 * 
 * In the TS files, code blocks are written as:
 *   \`\`\`python
 *   code here
 *   \`\`\`
 * 
 * This is three pairs of backslash+backtick.
 * We extract these into code: [{ lang: "python", code: `...` }]
 */
const fs = require('fs');

const filepath = process.argv[2];
if (!filepath) { console.error('Usage: node fix3.js <file>'); process.exit(1); }

let content = fs.readFileSync(filepath, 'utf-8');
let totalBlocks = 0;
let changed = false;

// Regex to match \`\`\`lang\ncode\n\`\`\`
// In regex literal: \\` matches literal \`, so \\`\\`\\` matches \`\`\`
const codeBlockRegex = /\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/;

// Test
const testMatch = codeBlockRegex.exec('test \\`\\`\\`python\ncode here\n\\`\\`\\` end');
console.log('Regex test:', testMatch ? 'OK - matched "' + testMatch[1] + '" lang' : 'FAILED');

// Process iteratively
for (let iter = 0; iter < 100; iter++) {
  // Find body: ` pattern
  const bodyMatch = content.match(/(body\s*:\s*)`/);
  if (!bodyMatch) break;
  
  const bodyOpenPos = bodyMatch.index + bodyMatch[0].length;
  
  // Find closing backtick (not preceded by \)
  let closePos = -1;
  for (let i = bodyOpenPos; i < content.length; i++) {
    if (content[i] === '`' && (i === 0 || content[i-1] !== '\\')) {
      closePos = i;
      break;
    }
  }
  if (closePos === -1) break;
  
  const bodyText = content.substring(bodyOpenPos, closePos);
  
  // Find all code blocks in this body
  const blocks = [];
  let searchBody = bodyText;
  let offset = 0;
  while (true) {
    const m = codeBlockRegex.exec(searchBody);
    if (!m) break;
    blocks.push({
      full: m[0],
      lang: m[1] || '',
      code: m[2].trimEnd(),
    });
    searchBody = searchBody.substring(m.index + m[0].length);
    offset += m.index + m[0].length;
  }
  
  if (blocks.length === 0) {
    // Mark this body as processed by replacing the opening backtick
    content = content.substring(0, bodyOpenPos - 1) + '\u0000' + content.substring(bodyOpenPos);
    continue;
  }
  
  // Detect language
  function detectLang(lang, code) {
    const map = {py:'python', js:'javascript', ts:'typescript', sh:'bash', yml:'yaml'};
    if (lang && map[lang.toLowerCase()]) return map[lang.toLowerCase()];
    if (lang) return lang;
    const c = code.trimStart();
    if (/^import |^from |^def |^class |^import torch|^import numpy|^import os|^import json|^import requests|^import transformers|^import torch/.test(c)) return 'python';
    if (/^#!\/|^pip |^npm |^apt |^docker |^git |^curl |^sudo |^conda |^trtllm|^vllm |^mpirun /.test(c)) return 'bash';
    if (/^[\[{]/.test(c) && /"/.test(c)) return 'json';
    if (/^</.test(c) && /<(html|div|body)/i.test(c)) return 'html';
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
  
  // Restore null byte and continue
  content = content.replace('\u0000', '`');
}

if (changed) {
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`${filepath}: ${totalBlocks} code blocks extracted`);
} else {
  console.log(`${filepath}: no changes`);
}
