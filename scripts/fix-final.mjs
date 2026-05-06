import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
const backup = readFileSync(f + '.bak', 'utf8');

// The article has sections like:
// {
//   title: "...",
//   body: `...text...
//
//   ```mermaid
//   graph LR
//   ...
//   ```
//
//   ...more body text...`,
//   tip: "...",
// }
//
// The problem: ``` inside the body template literal breaks TS parsing.
// Fix: split into body (before mermaid) + mermaid field + body (after mermaid)

// Strategy:
// 1. Find each section's body content
// 2. Within body, replace ``` with special markers
// 3. Reconstruct with separate mermaid fields

// Actually, simpler approach: just escape ALL backticks inside body/mermaid template literals
// except the opening and closing ones.

// Even simpler: just fix the specific patterns we know about.

let c = backup;

// Pattern 1: ````mermaid`,\n      mermaid\n → remove entirely (the mermaid graph follows on next lines)
c = c.replace(/\u0060\u0060\u0060\u0060mermaid\u0060,\s*\u0060\w+\s*\n/g, '\u0060');

// Wait, this is still not right. Let me try a completely different approach.
// Read the file, find all the problem areas, and fix them manually.

const lines = c.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Fix: body: ``** → body: `**
  if (line.includes('body: \u0060\u0060**')) {
    fixedLines.push(line.replace('body: \u0060\u0060', 'body: \u0060'));
    continue;
  }
  
  // Fix: mermaid: ````mermaid`, → mermaid: `
  if (/mermaid:\s*\u0060{4}mermaid\u0060,/.test(line)) {
    fixedLines.push(line.replace(/\u0060{4}mermaid\u0060,/, '\u0060'));
    // Also skip next line if it's just "      mermaid"
    if (i + 1 < lines.length && lines[i + 1].trim() === 'mermaid') {
      i++;
    }
    continue;
  }
  
  // Fix: lines that are just ``` (markdown fence) → `
  if (/^\s*\u0060\u0060\u0060\s*,?\s*$/.test(line)) {
    fixedLines.push(line.replace(/\u0060\u0060\u0060/g, '\u0060'));
    continue;
  }
  
  // Fix: lines that start with ``` inside body (code fences)
  // These need to be escaped
  if (/^\s*\u0060\u0060\u0060/.test(line) && !/mermaid:/.test(line)) {
    fixedLines.push(line.replace(/\u0060/g, '\\\u0060'));
    continue;
  }
  
  fixedLines.push(line);
}

let result = fixedLines.join('\n');

// Fix: stray body text after mermaid closing
// Find patterns where a line ends with `,\n then non-field text
const lines2 = result.split('\n');
const finalLines = [];
let prevWasMermaidClose = false;

for (let i = 0; i < lines2.length; i++) {
  const line = lines2[i];
  const trimmed = line.trim();
  
  // Check if previous line closed a mermaid field
  if (/^\s*\u0060,?\s*$/.test(line)) {
    prevWasMermaidClose = true;
    finalLines.push(line);
    continue;
  }
  
  if (prevWasMermaidClose) {
    prevWasMermaidClose = false;
    // Skip empty lines, then check for body text
    if (trimmed === '') {
      finalLines.push(line);
      continue;
    }
    // If this line doesn't start with a known field, add body: prefix
    if (!/^\s*\w+:\s*/.test(line) && !/^\s*},?\s*$/.test(line)) {
      finalLines.push('      body: ' + trimmed);
      continue;
    }
  }
  
  finalLines.push(line);
}

result = finalLines.join('\n');

// Final fix: tip lines missing trailing comma
result = result.replace(/(tip:\s*".*?")(\n\s+(?:warning|body|table|code|mermaid|list))/g, '$1,$2');
result = result.replace(/(warning:\s*".*?")(\n\s+})/g, '$1,$2');

writeFileSync(f, result);
console.log('All fixes applied');
