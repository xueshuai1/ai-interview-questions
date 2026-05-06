import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');
const lines = c.split('\n');

// Find all places where a template literal closes (`,) and the next non-empty line
// doesn't start with a field name - add body: prefix

const BT = '`';
const FIELD_NAMES = ['title', 'body', 'body2', 'tip', 'warning', 'mermaid', 'table', 'code', 'code2', 'list'];

for (let i = 0; i < lines.length - 1; i++) {
  const line = lines[i];
  
  // Check if this line closes a template literal (ends with `,)
  if (/`\s*,\s*$/.test(line.trim())) {
    // Find next non-empty line
    let j = i + 1;
    let emptyLines = [];
    while (j < lines.length && lines[j].trim() === '') {
      emptyLines.push(j);
      j++;
    }
    if (j < lines.length) {
      const nextLine = lines[j];
      const trimmed = nextLine.trim();
      
      // If next line starts with BT but no field name, add body: prefix
      // Pattern: `**text** or `text
      if (trimmed.startsWith(BT) && !FIELD_NAMES.some(fn => trimmed.startsWith(fn + ':'))) {
        // Check it's not a closing }, or a field value
        if (!/^\s*},?\s*$/.test(trimmed) && !trimmed.includes(':') && trimmed !== BT + ',') {
          // Check if this looks like body content (starts with `** or `- or just `text)
          if (/^\u0060\*\*/.test(trimmed) || /^\u0060-/.test(trimmed) || /^\u0060[^\u0060\s]/.test(trimmed)) {
            lines[j] = '      body: ' + nextLine.trim();
            console.log('Added body: at line ' + (j+1));
          }
        }
      }
    }
  }
}

c = lines.join('\n');
writeFileSync(f, c);
console.log('Done');
