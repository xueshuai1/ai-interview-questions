#!/usr/bin/env node
// 缩短导览文章中的 ASCII 绘图，适配移动端（最大约 35 字符宽）
import { readFileSync, writeFileSync } from 'fs';

const DIR = 'src/data/articles';
const files = [
  'ai-000.ts', 'prompt-guide.ts', 'llm-app-guide.ts', 'agent-guide.ts',
  'aieng-guide.ts', 'math-ml-guide.ts', 'dl-guide.ts', 'rl-guide.ts',
  'nlp-guide.ts', 'cv-guide.ts', 'mm-guide.ts', 'genai-guide.ts', 'security-guide.ts'
];

for (const file of files) {
  let content = readFileSync(`${DIR}/${file}`, 'utf-8');
  
  // 缩短所有长的 ASCII 框图行
  // Pattern: long lines with ─ or │ characters that exceed ~40 chars
  // Replace the long horizontal lines with shorter versions
  
  // General approach: find the longest box diagram lines and shorten them
  // The boxes use patterns like "┌─ ... ─┐" or "├─ ... ─┤"
  
  // Shorten all the long divider lines
  content = content.replace(/─{20,}/g, '─'.repeat(28));
  content = content.replace(/═{20,}/g, '═'.repeat(28));
  content = content.replace(/━{20,}/g, '━'.repeat(28));
  
  // Truncate content lines that are too long (keep ~35 chars inside the box)
  // Pattern: │ followed by long text then │
  content = content.replace(/\│([^│]{40,})\│/g, (match, inner) => {
    const truncated = inner.substring(0, 26).trim();
    return `│${truncated.padEnd(28)}│`;
  });
  
  writeFileSync(`${DIR}/${file}`, content, 'utf-8');
  console.log(`✅ ${file}`);
}

console.log('Done');
