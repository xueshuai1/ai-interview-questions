// Fix: Extract escaped code blocks from body fields to section.code arrays
const fs = require('fs');
const path = require('path');

const FILES = [
  'src/data/articles/agent-018.ts',
  'src/data/articles/agent-023.ts',
  'src/data/articles/ai-security-006.ts',
  'src/data/articles/ethics-009.ts',
  'src/data/articles/infer-002.ts',
  'src/data/articles/llm-018.ts',
  'src/data/articles/mcp-001.ts',
  'src/data/articles/multi-agent-001.ts',
  'src/data/articles/voice-002.ts',
  'src/data/articles/voice-004.ts',
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all escaped code blocks in body fields
  // Pattern: body: `...\`\`\`lang\n...\n\`\`\`...`
  const bodyRegex = /body:\s*`/g;
  let matches = [];
  let m;
  while ((m = bodyRegex.exec(content)) !== null) {
    matches.push(m.index + 6); // position after "body: `"
  }
  
  let totalExtracted = 0;
  
  // Process each body from end to start
  for (let i = matches.length - 1; i >= 0; i--) {
    const bodyStart = matches[i];
    
    // Find end of body string
    let pos = bodyStart;
    let bodyEnd = -1;
    while (pos < content.length) {
      if (content[pos] === '`' && content[pos-1] !== '\\') {
        bodyEnd = pos;
        break;
      }
      pos++;
    }
    if (bodyEnd === -1) continue;
    
    const bodyText = content.substring(bodyStart, bodyEnd);
    
    // Find escaped code blocks in this body
    const codeBlockRegex = /\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/g;
    let codeBlocks = [];
    let cm;
    while ((cm = codeBlockRegex.exec(bodyText)) !== null) {
      codeBlocks.push({
        start: cm.index,
        end: cm.index + cm[0].length,
        lang: cm[1] || 'text',
        code: cm[2].trim()
      });
    }
    
    if (codeBlocks.length === 0) continue;
    
    // Check for existing code: array after body
    const afterBody = content.substring(bodyEnd, bodyEnd + 2000);
    const existingCodeMatch = afterBody.match(/^,\s*\n\s*code:\s*\[[\s\S]*?\]\s*,?\s*\n/);
    
    // Extract code blocks from body text
    let newBody = bodyText;
    for (let j = codeBlocks.length - 1; j >= 0; j--) {
      const cb = codeBlocks[j];
      newBody = newBody.substring(0, cb.start) + newBody.substring(cb.end);
    }
    
    // Clean up extra newlines
    newBody = newBody.replace(/\n{3,}/g, '\n\n').trim();
    
    // Find indentation
    const beforeBody = content.substring(0, bodyStart - 6);
    const titleMatch = beforeBody.match(/title:\s*"[^"]*"\s*,?\s*\n(\s+)/);
    const indent = titleMatch ? titleMatch[1] : '            ';
    
    // Build code array
    const codeItems = codeBlocks.map(cb => {
      const cleanCode = cb.code.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      return `{ lang: "${cb.lang}", code: \`${cleanCode}\` }`;
    });
    const codeArray = 'code: [\n' + codeItems.map(item => `${indent}    ${item}`).join(',\n') + '\n' + indent + ']';
    
    // Reconstruct the section
    if (existingCodeMatch) {
      // Append to existing code array
      const existingCode = existingCodeMatch[0];
      const oldSectionEnd = bodyEnd + existingCodeMatch[0].length;
      const newSection = `body: \`${newBody}\`${existingCodeMatch[0].replace(/code:\s*\[[\s\S]*?\]/, codeArray)}`;
      // Actually, let's just insert after body
      content = content.substring(0, bodyStart - 6) + `body: \`${newBody}\`,` + 
                '\n' + indent + codeArray + ',' + content.substring(oldSectionEnd);
    } else {
      // Add code array after body
      const afterBodyText = content.substring(bodyEnd);
      const commaMatch = afterBodyText.match(/^(,\s*\n)/);
      if (commaMatch) {
        const oldEnd = bodyEnd + commaMatch[0].length;
        const newSection = `body: \`${newBody}\`,` + '\n' + indent + codeArray + ',';
        content = content.substring(0, bodyStart - 6) + newSection + content.substring(oldEnd);
      } else {
        const newSection = `body: \`${newBody}\`,` + '\n' + indent + codeArray;
        content = content.substring(0, bodyStart - 6) + newSection + content.substring(bodyEnd);
      }
    }
    
    totalExtracted += codeBlocks.length;
  }
  
  if (totalExtracted > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`FIXED (${totalExtracted} code blocks): ${filePath}`);
  }
  
  return totalExtracted;
}

let totalFiles = 0;
let totalBlocks = 0;

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.log(`SKIP: ${file} (not found)`);
    continue;
  }
  const blocks = fixFile(file);
  if (blocks > 0) {
    totalFiles++;
    totalBlocks += blocks;
  }
}

console.log(`\nTotal: ${totalFiles} files modified, ${totalBlocks} code blocks extracted`);
