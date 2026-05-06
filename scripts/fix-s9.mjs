import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
const BT = '`';
let lines = readFileSync(f, 'utf8').split('\n');

// Fix line 789: body: ** -> body: `**
if (lines[788] && lines[788].includes('body: **')) {
  lines[788] = lines[788].replace('body: ', 'body: ' + BT);
  console.log('Fixed opening backtick at line 789');
}

// Find closing backtick for this body field (before tip:)
for (let i = 789; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t.startsWith('tip:') || t.startsWith('warning:')) {
    // Find previous non-empty line
    let k = i - 1;
    while (k >= 0 && lines[k].trim() === '') k--;
    if (k >= 0 && !lines[k].trim().endsWith(BT + ',') && !lines[k].trim().endsWith(BT)) {
      lines[k] = lines[k].trim() + BT + ',';
      console.log('Added closing backtick at line ' + (k+1));
    }
    break;
  }
}

writeFileSync(f, lines.join('\n'));
console.log('Done');
