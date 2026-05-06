import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');
const lines = c.split('\n');

// Find all places where a mermaid closing backtick is followed by body text without field name
const out = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Check if this line is just a backtick (closing mermaid)
  if (/^\s*`\s*$/.test(line)) {
    // Look ahead: skip empty lines, check if next non-empty line starts with ** (body text)
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length) {
      const nextLine = lines[j];
      // If next non-empty line starts with ** but has no field name, add body: prefix
      if (/^\s+\*\*/.test(nextLine) && !/^\s+\w+:/.test(nextLine)) {
        out.push(line);
        // Add empty lines as-is
        for (let k = i + 1; k < j; k++) {
          out.push(lines[k]);
        }
        // Add body: prefix to the content line
        out.push(nextLine.replace(/^(\s+)/, '$1body: '));
        i = j; // Skip to after the content line
        continue;
      }
    }
  }
  out.push(line);
}

c = out.join('\n');
writeFileSync(f, c);
console.log('Fixed stray body text lines');
