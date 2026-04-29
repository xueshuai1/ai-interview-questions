#!/usr/bin/env node
/**
 * 批量修复所有文章中 mermaid 块内的 % 字符 → 全角 ％
 * mermaid 中 % 是注释标记，会导致解析错误
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

function getAllTsFiles(dir) {
  let results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getAllTsFiles(fullPath));
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('-types.ts')) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

const files = [
  ...getAllTsFiles(join(ROOT, 'src/data/articles')),
  ...getAllTsFiles(join(ROOT, 'src/data/blogs')),
];

let fixedCount = 0;
let totalReplacements = 0;

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf-8');
  let changed = false;

  // 只替换 mermaid 块内的 %（不在 \\% 转义中，也不是全角 ％）
  // 使用正则匹配 mermaid: `...` 块内的 %
  const newContent = content.replace(
    /mermaid:\s*`([\s\S]*?)`/g,
    (match, mermaidContent) => {
      // 替换 % 为 ％，但排除 \\%（已在 JS 中不会生效，但还是跳过）
      const fixed = mermaidContent.replace(/(?<!\\)%/g, '％');
      if (fixed !== mermaidContent) {
        changed = true;
        const count = (fixed.match(/％/g) || []).length - (mermaidContent.match(/％/g) || []).length;
        totalReplacements += count;
      }
      return `mermaid: \`${fixed}\``;
    }
  );

  if (changed) {
    writeFileSync(filePath, newContent, 'utf-8');
    const relPath = filePath.replace(ROOT + '/', '');
    console.log(`✅ ${relPath}`);
    fixedCount++;
  }
}

console.log(`\n批量修复完成：${fixedCount} 个文件，共 ${totalReplacements} 处 % → ％`);
