import { readFileSync, writeFileSync } from 'fs';

const f = 'src/data/articles/agent-047.ts';
let c = readFileSync(f, 'utf8');

// Fix 1: Remove escaped code fences inside body text
// Pattern: \`\`\`mermaid or just \`\`\` on their own line
c = c.replace(/\\\`\u0060\\\`mermaid\n/g, '');
c = c.replace(/^\s*\\\`\u0060\\\`\s*$/gm, '');

// Fix 2: tip line missing trailing comma
// Pattern: tip: "..."\n      warning:
c = c.replace(/(tip:\s*".*?")(\n\s+warning:)/g, '$1,$2');

// Fix 3: Same for warning lines that might be missing commas
c = c.replace(/(warning:\s*".*?")(\n\s+})/g, '$1,$2');

writeFileSync(f, c);
console.log('All fixes applied');
