import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
const BT = '`';
const FIELDS = ['title','body','body2','tip','warning','mermaid','table','code','code2','list'];

// Start fresh from backup
let lines = readFileSync(f + '.bak', 'utf8').split('\n');

console.log('Original line count:', lines.length);

// Fix 1: Line 152 (index 151): mermaid: ````mermaid`, -> mermaid: `
lines[151] = lines[151].replace('````mermaid`,', '`');
console.log('Fix 1: mermaid opening');

// Fix 2: Remove line 153 (index 152): stray "mermaid" label
if (lines[152].trim() === 'mermaid') {
  lines.splice(152, 1);
  console.log('Fix 2: removed stray mermaid label');
}

// Fix 3: Line 171 (was 172, now 171 after splice): ``````, -> `,
lines[170] = lines[170].replace('````', '`');
console.log('Fix 3: mermaid closing');

// Fix 4: Remove duplicate body text (lines 172-244, old 173-245)
// The duplicate starts at index 171 and ends around index 243
// Find the exact end: look for the tip: line after the duplicate
let dupStart = 171;
let dupEnd = dupStart;
for (let i = dupStart; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t.startsWith('tip:') || t.startsWith('warning:')) {
    dupEnd = i;
    break;
  }
}
// Remove lines from dupStart to dupEnd-1 (exclusive of tip/warning)
lines.splice(dupStart, dupEnd - dupStart);
console.log('Fix 4: removed', dupEnd - dupStart, 'duplicate lines (indices ' + dupStart + '-' + (dupEnd-1) + ')');

// Fix 5: body: ``** -> body: `**
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('body: ``**')) {
    lines[i] = lines[i].replace('body: ``', 'body: `');
  }
}
console.log('Fix 5: double backticks at body start');

// Fix 6: Second mermaid block
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('````mermaid`,')) {
    lines[i] = lines[i].replace('````mermaid`,', '`');
    if (i + 1 < lines.length && lines[i+1].trim() === 'mermaid') {
      lines.splice(i+1, 1);
    }
    console.log('Fix 6: second mermaid opening at line ' + (i+1));
    break;
  }
}

// Fix 7: Second mermaid closing ````
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('````,') || lines[i].trim() === '````') {
    lines[i] = lines[i].replace('````', '`');
    console.log('Fix 7: second mermaid closing at line ' + (i+1));
    break;
  }
}

// Fix 8: Remove code fences inside body text
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t.startsWith('```') && !t.includes(':')) {
    lines[i] = '';
  }
}
console.log('Fix 8: code fences inside body');

// Fix 9: Add missing commas to tip/warning
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (/^tip:\s*".*"$/.test(t)) {
    lines[i] = lines[i].replace(/"\s*$/, '",');
  }
  if (/^warning:\s*".*"$/.test(t)) {
    lines[i] = lines[i].replace(/"\s*$/, '",');
  }
}
console.log('Fix 9: missing commas');

// Fix 10: Add body: prefix to stray template literals
for (let i = 0; i < lines.length - 1; i++) {
  if (/`\s*,\s*$/.test(lines[i].trim())) {
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length) {
      const t = lines[j].trim();
      if (t.startsWith(BT) && !FIELDS.some(f => t.startsWith(f + ':')) && !/^\s*},?\s*$/.test(t)) {
        if (t.startsWith('`**') || t.startsWith('`-') || /^`[^\`\s]/.test(t)) {
          lines[j] = '      body: ' + lines[j].trim();
          console.log('Fix 10: added body: at line ' + (j+1));
        }
      }
    }
  }
}

writeFileSync(f, lines.join('\n'));
console.log('Final line count:', lines.length);
console.log('All fixes complete');
