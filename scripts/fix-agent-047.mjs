import { readFileSync, writeFileSync } from 'fs';

const file = 'src/data/articles/agent-047.ts';
const content = readFileSync(file, 'utf8');
const lines = content.split('\n');
const out = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const t = line.trim();
  
  // Fix 1: body: ``** -> body: `**
  if (line.includes('body: ``**')) {
    out.push(line.replace('body: ``', 'body: `'));
    continue;
  }
  
  // Fix 2: mermaid: ````mermaid`, followed by "      mermaid" on next line
  // -> mermaid: `
  if (/mermaid:\s*````mermaid`/.test(line)) {
    out.push(line.replace(/mermaid:\s*````mermaid`,/, 'mermaid: `'));
    // Skip the next "mermaid" label line
    if (i + 1 < lines.length && lines[i + 1].trim() === 'mermaid') {
      i++;
    }
    continue;
  }
  
  // Fix 3: Inside mermaid block, closing ``` -> `
  // A line that starts with ``` and only has backticks + optional comma
  if (/^\s*```,?\s*$/.test(line)) {
    out.push(line.replace(/```/g, '`'));
    continue;
  }
  
  // Fix 4: Line that is just ``` (no comma)
  if (/^\s*```\s*$/.test(line)) {
    out.push(line.replace(/```/g, '`'));
    continue;
  }
  
  // Fix 5: Inside body text, standalone ``` code fences need escaping
  // But NOT if it's a mermaid: field
  if (/^\s*```/.test(line) && !line.includes('mermaid:')) {
    out.push(line.replace(/`/g, '\\`'));
    continue;
  }
  
  // Fix 6: Line 172 pattern: `**Claude Dreaming** without field name
  // This is actually a continuation of the body field that should have ended
  // before the mermaid block. It needs to become: body: `**Claude Dreaming**
  // We detect this: a line starting with `** that follows a mermaid closing
  if (/^\s+`\*\*/.test(line) && i > 0 && /`.*mermaid/.test(lines[i-1] || '')) {
    out.push(line.replace(/^\s+`/, '      body: `'));
    continue;
  }
  
  out.push(line);
}

writeFileSync(file, out.join('\n'), 'utf8');
console.log('Fixed agent-047.ts');
