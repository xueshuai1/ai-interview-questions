import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');
const lines = c.split('\n');

const out = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if this line is just a backtick (closing a template literal field)
  if (/^\s*`\s*$/.test(line)) {
    let j = i + 1;
    // Skip empty lines
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length) {
      const nextLine = lines[j];
      // If next non-empty line starts with ** or - or plain text (no field name)
      // and doesn't start with a field keyword (title, body, tip, warning, mermaid, table, code, list)
      if (!/^\s*\w+:/.test(nextLine) && !/^\s*},?\s*$/.test(nextLine)) {
        // This is stray content - add body: prefix
        out.push(line);
        for (let k = i + 1; k < j; k++) {
          out.push(lines[k]);
        }
        out.push('      body: ' + nextLine);
        i = j;
        continue;
      }
    }
  }
  out.push(line);
}

c = out.join('\n');
writeFileSync(f, c);
console.log('Fixed all stray content lines');
