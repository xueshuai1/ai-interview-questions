import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');
const BT = '`';

// Fix: lines with \`\`\`\`, -> just `,
// The previous script escaped the backticks in ``````,`` lines
// resulting in \`\`\`\`, which is 4 escaped backticks
c = c.replace(/\\\u0060\\\u0060\\\u0060\\\u0060,/g, BT + ',');

// Fix: line starting with whitespace + `**Claude Dreaming -> add body: prefix  
c = c.replace(/^(\s+)\u0060\*\*Claude Dreaming/m, '$1body: ' + BT + '**Claude Dreaming');

// Fix: same for any other standalone template literal starting with \`**
c = c.replace(/^(\s+)\u0060\*\*(?!.*?:\s*\u0060)/m, '$1body: ' + BT + '**');

writeFileSync(f, c);
console.log('Applied fixes');

// Verify - show problem lines
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('\\`') || (l.includes(BT) && /^\s+\u0060\*\*/.test(l) && !l.includes('body:'))) {
    console.log('ISSUE line ' + (i+1) + ': ' + l.substring(0, 60));
  }
});
