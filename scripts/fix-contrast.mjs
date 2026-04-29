import { readFileSync, writeFileSync } from 'fs';

// Contrast fixes: light fill colors → dark 800-900 shades
const fixes = [
  // agent-018
  { file: 'src/data/articles/agent-018.ts', from: 'fill:#4d6a8f', to: 'fill:#1e3a5f' },
  // aieng-010
  { file: 'src/data/articles/aieng-010.ts', from: 'fill:#d97706', to: 'fill:#92400e' },
  // genai-009
  { file: 'src/data/articles/genai-009.ts', from: 'fill:#ffa94d', to: 'fill:#c2410c' },
  // blog-027 (3 issues)
  { file: 'src/data/blogs/blog-027.ts', from: 'fill:#f9a825', to: 'fill:#a16207' },
  { file: 'src/data/blogs/blog-027.ts', from: 'fill:#4caf50', to: 'fill:#166534' },
  { file: 'src/data/blogs/blog-027.ts', from: 'fill:#ff9800', to: 'fill:#c2410c' },
  // blog-036 (3 instances of same color)
  { file: 'src/data/blogs/blog-036.ts', from: 'fill:#6c5ce7', to: 'fill:#4338ca' },
  // blog-041
  { file: 'src/data/blogs/blog-041.ts', from: 'fill:#8b6914', to: 'fill:#713f12' },
  // blog-047
  { file: 'src/data/blogs/blog-047.ts', from: 'fill:#ffd43b', to: 'fill:#a16207' },
  // blog-075
  { file: 'src/data/blogs/blog-075.ts', from: 'fill:#d97706', to: 'fill:#92400e' },
];

let totalReplacements = 0;
for (const fix of fixes) {
  const content = readFileSync(fix.file, 'utf-8');
  const count = (content.match(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const newContent = content.replaceAll(fix.from, fix.to);
  writeFileSync(fix.file, newContent);
  console.log(`${fix.file}: ${fix.from} → ${fix.to} (${count} replacements)`);
  totalReplacements += count;
}
console.log(`\nTotal: ${totalReplacements} replacements across ${fixes.length} fix entries`);
