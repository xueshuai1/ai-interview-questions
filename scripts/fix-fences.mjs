import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');
const lines = c.split('\n');

// Find and fix all code fences inside template literals
// These are lines starting with ``` that are NOT field declarations
const BT = '`';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Code fence inside body: ```mermaid or just ```
  if (trimmed.startsWith(BT + BT + BT) && !trimmed.includes(':') && !trimmed.startsWith('mermaid:')) {
    // Replace the entire line with empty (remove the code fence)
    // The body text will still render correctly without markdown fences
    // since the body IS already rendered as markdown
    lines[i] = '';
    console.log('Removed code fence at line ' + (i+1) + ': ' + trimmed.substring(0, 40));
  }
}

c = lines.join('\n');
writeFileSync(f, c);
console.log('All code fences removed');
