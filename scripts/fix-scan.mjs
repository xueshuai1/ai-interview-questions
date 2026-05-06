import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');
const lines = c.split('\n');

console.log('=== Scanning for issues ===');
lines.forEach((l, i) => {
  const n = i + 1;
  // Escaped backticks (literal \`)
  if (l.includes('\\`')) {
    console.log(n + ': ESCAPED BT: ' + l.trim().substring(0, 60));
  }
  // 3+ consecutive backticks (not at start of field)
  if (/```.+```/.test(l)) {
    console.log(n + ': INLINE 3+BT: ' + l.trim().substring(0, 60));
  }
  // Stray lines with just ``` (not part of field)
  if (/^\s*```/.test(l)) {
    console.log(n + ': STANDALONE ```: ' + l.trim().substring(0, 60));
  }
});

console.log('\n=== Applying fixes ===');

// Fix all escaped backticks - remove them (they're broken code fences)
c = c.replace(/\\`/g, '');

// Fix tip without comma
c = c.replace(/(tip:\s*".*?")(\n\s+warning:)/g, '$1,$2');
c = c.replace(/(tip:\s*".*?")(\n\s+body:)/g, '$1,$2');
c = c.replace(/(tip:\s*".*?")(\n\s+table:)/g, '$1,$2');
c = c.replace(/(tip:\s*".*?")(\n\s+code:)/g, '$1,$2');
c = c.replace(/(tip:\s*".*?")(\n\s+list:)/g, '$1,$2');
c = c.replace(/(tip:\s*".*?")(\n\s+mermaid:)/g, '$1,$2');

// Fix warning without comma before closing brace
c = c.replace(/(warning:\s*".*?")(\n\s+})/g, '$1,$2');

writeFileSync(f, c);
console.log('Fixed');
