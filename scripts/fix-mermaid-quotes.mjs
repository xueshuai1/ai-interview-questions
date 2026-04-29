/**
 * 将 mermaid: "..." 转为 mermaid: `...`
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const files = [
  'src/data/articles/cv-002.ts',
  'src/data/articles/genai-004.ts',
  'src/data/articles/genai-006.ts',
  'src/data/articles/ml-021.ts',
];

for (const relPath of files) {
  const fullPath = resolve(ROOT, relPath);
  let content = readFileSync(fullPath, 'utf-8');
  
  // 匹配 mermaid: "..." 模式（单行字符串）
  const result = content.replace(/mermaid:\s*"((?:[^"\\]|\\.)*)"(?=\s*[,}\n])/g, (match, inner) => {
    // 反转义：\" → ", \n → 实际换行, \t → 制表符
    let converted = inner
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t');
    return `mermaid: \`${converted}\``;
  });
  
  if (result !== content) {
    writeFileSync(fullPath, result, 'utf-8');
    const count = (result.match(/mermaid:\s*`/g) || []).length;
    console.log(`✅ ${relPath}: 引号→反引号 (共 ${count} 个 mermaid)`);
  } else {
    console.log(`⚠️ ${relPath}: 未匹配到需要转换的模式`);
  }
}
