import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');
const BT = '`';

// Step 1: Restore from backup to start fresh
c = readFileSync(f + '.bak', 'utf8');

// Step 2: Fix double backticks at field starts
c = c.replace(/body: \u0060\u0060/g, 'body: ' + BT);
c = c.replace(/mermaid: \u0060\u0060\u0060\u0060mermaid\u0060,/g, 'mermaid: ' + BT);

// Step 3: Inside template literals, markdown code fences break TS parsing.
// Strategy: Replace ``` with escaped version ONLY when it's inside body text (not mermaid field)
// The approach: process the file section by section

const lines = c.split('\n');
const out = [];
let state = 'normal'; // normal, in-body, in-mermaid

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (state === 'normal') {
    // Detect body field start
    if (/^\s*body:\s*\u0060/.test(line)) {
      state = 'in-body';
      out.push(line);
      continue;
    }
    // Detect mermaid field start  
    if (/^\s*mermaid:\s*\u0060/.test(line)) {
      state = 'in-mermaid';
      out.push(line);
      continue;
    }
    out.push(line);
    continue;
  }
  
  if (state === 'in-body') {
    // Inside body template literal: escape any code fences
    // A code fence line starts with ```
    if (trimmed.startsWith(BT + BT + BT)) {
      // Replace all backticks on this line with escaped versions
      out.push(line.replace(/`/g, '\\`'));
      continue;
    }
    // Check for body field end: line with just `,` or `,<spaces>
    // Actually the body field ends with `,` at the end of a line
    // But we can't easily detect this. Instead, look for the next field.
    if (/^\s*(title|tip|warning|mermaid|table|code|list|body2|code2):\s*/.test(trimmed)) {
      // Previous line should have had a closing backtick+comma
      // If it didn't, we need to close it
      state = 'normal';
      out.push(line);
      continue;
    }
    // Detect end: line ending with `,<spaces>
    if (/`,\s*$/.test(line)) {
      state = 'normal';
      out.push(line);
      continue;
    }
    out.push(line);
    continue;
  }
  
  if (state === 'in-mermaid') {
    // Inside mermaid field: just copy until closing `,
    if (/^\s*`,?\s*$/.test(line)) {
      state = 'normal';
      out.push(line);
      continue;
    }
    out.push(line);
    continue;
  }
}

c = out.join('\n');

// Step 4: After each mermaid block, check if there's body text without `body:` prefix
const lines2 = c.split('\n');
const out2 = [];
for (let i = 0; i < lines2.length; i++) {
  const line = lines2[i];
  const trimmed = line.trim();
  
  // If this is a closing backtick of mermaid field
  if (/^\s*`,?\s*$/.test(line)) {
    out2.push(line);
    // Look ahead for body text
    let j = i + 1;
    let emptyLines = [];
    while (j < lines2.length && lines2[j].trim() === '') {
      emptyLines.push(lines2[j]);
      j++;
    }
    if (j < lines2.length) {
      const nextLine = lines2[j];
      const nextTrimmed = nextLine.trim();
      // If next non-empty line doesn't start with a known field name and isn't },
      if (!/^\s*(title|tip|warning|mermaid|table|code|list|body|body2|code2):\s*/.test(nextTrimmed) && 
          !/^\s*},?\s*$/.test(nextTrimmed)) {
        // This is body text without field name - add body: prefix
        for (const el of emptyLines) out2.push(el);
        out2.push('      body: ' + nextLine.trim());
        i = j;
        continue;
      }
    }
    continue;
  }
  out2.push(line);
}

c = out2.join('\n');

writeFileSync(f, c);
console.log('Comprehensive fix applied to agent-047.ts');
