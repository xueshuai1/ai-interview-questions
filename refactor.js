#!/usr/bin/env node
/**
 * Refactor code blocks from body fields into section.code arrays.
 * 
 * Handles TypeScript files where body uses template literals with escaped backticks:
 *   body: `text\n\n\\`\\`\\`python\ncode\n\\`\\`\\`\n\nmore text`
 * 
 * Transforms to:
 *   body: `text\n\nmore text`,
 *   code: [
 *     { lang: "python", code: `code` },
 *   ],
 */

const fs = require('fs');
const path = require('path');

const LANG_MAP = {
  'py': 'python',
  'js': 'javascript',
  'ts': 'typescript',
  'sh': 'bash',
  'yml': 'yaml',
  'md': 'markdown',
  'toml': 'toml',
  'rb': 'ruby',
  'rs': 'rust',
  'go': 'go',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'cs': 'csharp',
  'sql': 'sql',
};

function detectLang(langHint, code) {
  if (langHint && LANG_MAP[langHint.toLowerCase()]) {
    return LANG_MAP[langHint.toLowerCase()];
  }
  if (langHint) return langHint;
  
  const c = code.trim().toLowerCase();
  if (c.startsWith('import ') || c.startsWith('from ') || c.startsWith('def ') || c.startsWith('class ')) return 'python';
  if (c.startsWith('#!') || c.startsWith('pip ') || c.startsWith('npm ') || c.startsWith('apt ') || c.startsWith('docker ') || c.startsWith('git ') || c.startsWith('curl ') || c.startsWith('sudo ')) return 'bash';
  if (c.startsWith('{') && c.includes('"')) return 'json';
  if (c.startsWith('<') && (c.includes('html') || c.includes('div') || c.includes('body'))) return 'html';
  return 'python';
}

function processFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  let totalCodeBlocks = 0;
  let sectionsModified = 0;
  
  // Pattern to find body template literals that contain escaped backtick code blocks
  // body: `...\`...\`` where \`\`\` appears inside
  // The backtick opens the template literal, and the closing backtick is not escaped
  
  // We process the content looking for body: ` patterns
  const bodyPattern = /(body\s*:\s*)`/g;
  
  let result = content;
  let searchStart = 0;
  
  while (true) {
    // Find next body: ` after searchStart
    const bodyMatch = content.substring(searchStart).match(bodyPattern);
    if (!bodyMatch) break;
    
    const absolutePos = searchStart + bodyMatch.index;
    const prefixEnd = absolutePos + bodyMatch[0].length; // Position after opening backtick
    
    // Find the closing backtick (not escaped)
    let closePos = -1;
    let pos = prefixEnd;
    while (pos < content.length) {
      if (content[pos] === '`' && (pos === 0 || content[pos - 1] !== '\\')) {
        closePos = pos;
        break;
      }
      pos++;
    }
    
    if (closePos === -1) {
      searchStart = prefixEnd;
      continue;
    }
    
    const bodyContent = content.substring(prefixEnd, closePos);
    
    // Check for code blocks: \`\`\`lang\ncode\n\`\`\`
    const codeBlockPattern = /\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/g;
    const codeBlocks = [];
    let codeMatch;
    
    while ((codeMatch = codeBlockPattern.exec(bodyContent)) !== null) {
      codeBlocks.push({
        full: codeMatch[0],
        lang: codeMatch[1] || '',
        code: codeMatch[2].trimEnd(),
        index: codeMatch.index,
      });
    }
    
    if (codeBlocks.length === 0) {
      searchStart = closePos + 1;
      continue;
    }
    
    // Check if section already has code: array after this body
    const afterBody = content.substring(closePos + 1, closePos + 500);
    const hasExistingCode = /^\s*,\s*\n\s*code\s*:\s*\[/.test(afterBody);
    
    // Build cleaned body (remove code blocks)
    let cleanedBody = bodyContent;
    for (const cb of codeBlocks) {
      cleanedBody = cleanedBody.replace(cb.full, '');
    }
    // Clean up excessive newlines
    cleanedBody = cleanedBody.replace(/\n{3,}/g, '\n\n').trim();
    
    // Build code array entries
    const codeEntries = codeBlocks.map(cb => {
      const lang = detectLang(cb.lang, cb.code);
      // Escape ${} in template literal
      const escapedCode = cb.code.replace(/\$\{/g, '\\${');
      return `{
          lang: "${lang}",
          code: \`${escapedCode}\`,
        }`;
    });
    
    // Build replacement
    let newBodySection;
    if (cleanedBody) {
      newBodySection = `body: \`${cleanedBody}\`,\n        code: [\n        ${codeEntries.join(',\n        ')}\n        ],`;
    } else {
      newBodySection = `body: \`\`,\n        code: [\n        ${codeEntries.join(',\n        ')}\n        ],`;
    }
    
    // Replace the old body section
    const oldSectionStart = absolutePos;
    
    if (hasExistingCode) {
      // Find the existing code array and merge
      const existingCodeMatch = afterBody.match(/^(\s*,\s*\n\s*code\s*:)(\s*\[[\s\S]*?\])/);
      if (existingCodeMatch) {
        const existingCodeArray = existingCodeMatch[2];
        const afterCodeEnd = closePos + 1 + existingCodeMatch[0].length;
        
        // Insert new entries before the closing ]
        const innerCode = existingCodeArray.trim().slice(1, -1); // Remove [ and ]
        const combinedCode = innerCode + ',\n        ' + codeEntries.join(',\n        ');
        
        if (cleanedBody) {
          newBodySection = `body: \`${cleanedBody}\`,\n        code: [\n        ${combinedCode}\n        ],`;
        }
        
        result = result.substring(0, oldSectionStart) + newBodySection + result.substring(afterCodeEnd);
        sectionsModified++;
        totalCodeBlocks += codeBlocks.length;
        searchStart = oldSectionStart + newBodySection.length;
        content = result; // Update content for next iteration
        continue;
      }
    }
    
    // No existing code array - just replace
    // Check what's after the closing backtick
    const afterClose = content.substring(closePos + 1);
    const commaMatch = afterClose.match(/^(\s*,)/);
    
    if (commaMatch) {
      // There's a comma after, meaning more fields follow
      // Replace from body: to including the comma
      result = result.substring(0, oldSectionStart) + newBodySection + result.substring(closePos + 1 + commaMatch[0].length);
    } else {
      result = result.substring(0, oldSectionStart) + newBodySection + result.substring(closePos + 1);
    }
    
    sectionsModified++;
    totalCodeBlocks += codeBlocks.length;
    searchStart = oldSectionStart + newBodySection.length;
    content = result; // Update content for next iteration
  }
  
  if (sectionsModified > 0) {
    fs.writeFileSync(filepath, result, 'utf-8');
  }
  
  return { sectionsModified, totalCodeBlocks };
}

const files = [
  'src/data/articles/agent-018.ts',
  'src/data/articles/agent-023.ts',
  'src/data/articles/ethics-009.ts',
  'src/data/articles/multi-agent-001.ts',
  'src/data/articles/voice-004.ts',
  'src/data/blogs/blog-042.ts',
  'src/data/blogs/blog-043.ts',
];

const baseDir = '/Users/xueshuai/.openclaw/workspace/ai-master-site';

let totalFilesModified = 0;
let totalBlocksExtracted = 0;

for (const f of files) {
  const full = path.join(baseDir, f);
  if (!fs.existsSync(full)) {
    console.log(`  ❌ ${f}: not found`);
    continue;
  }
  
  const { sectionsModified, totalCodeBlocks } = processFile(full);
  if (sectionsModified > 0) {
    console.log(`  ✅ ${f}: ${sectionsModified} sections, ${totalCodeBlocks} code blocks`);
    totalFilesModified++;
    totalBlocksExtracted += totalCodeBlocks;
  } else {
    console.log(`  -- ${f}: no changes needed`);
  }
}

console.log(`\n📊 Total: ${totalFilesModified} files modified, ${totalBlocksExtracted} code blocks extracted`);
