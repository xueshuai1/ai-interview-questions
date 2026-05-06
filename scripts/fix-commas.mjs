import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');

// Find tip/warning lines missing trailing comma
const lines = c.split('\n');
let changed = false;

lines.forEach((l, i) => {
  // tip: "..."  (no comma)
  if (/tip:\s*".*"$/.test(l.trim())) {
    lines[i] = l.replace(/(")\s*$/, '$1,');
    console.log((i+1) + ': Added comma to tip');
    changed = true;
  }
  // warning: "..."  (no comma, next line is })
  if (/warning:\s*".*"$/.test(l.trim())) {
    lines[i] = l.replace(/(")\s*$/, '$1,');
    console.log((i+1) + ': Added comma to warning');
    changed = true;
  }
});

if (changed) {
  c = lines.join('\n');
  writeFileSync(f, c);
}
console.log('Done');
