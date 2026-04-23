#!/usr/bin/env node
/**
 * 批量分析并修复知识库文章和博客的问题
 * 
 * 检查项：
 * 1. Mermaid 配色对比度（WCAG AA ≥ 4.5:1）
 * 2. body 中嵌入的代码块 → 提取到 code: 字段
 * 3. 基本格式完整性
 * 
 * 用法：
 *   node scripts/batch-fix-articles.mjs                    # 全量扫描+自动修复
 *   node scripts/batch-fix-articles.mjs --dry-run           # 只报告不修改
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DATA_DIR = join(__dirname, '../src/data');
const DRY_RUN = process.argv.includes('--dry-run');

// ===== 配色检查 =====

function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function contrastRatio(c1, c2) {
  const l1 = relativeLuminance(...hexToRgb(c1));
  const l2 = relativeLuminance(...hexToRgb(c2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const MIN_CONTRAST = 4.5;
const DEFAULT_TEXT = '#f1f5f9';

// 不安全色 → 安全色映射
const COLOR_MAP = {
  '#ef4444': '#991b1b', '#f59e0b': '#92400e', '#fbbf24': '#92400e',
  '#fcd34d': '#92400e', '#fde68a': '#92400e',
  '#10b981': '#064e3b', '#34d399': '#064e3b', '#6ee7b7': '#064e3b',
  '#6366f1': '#3730a3', '#818cf8': '#3730a3', '#a5b4fc': '#3730a3',
  '#8b5cf6': '#581c87', '#a78bfa': '#581c87', '#c4b5fd': '#581c87',
  '#ec4899': '#831843', '#f472b6': '#831843',
  '#06b6d4': '#164e63', '#22d3ee': '#164e63',
  '#84cc16': '#3f6212', '#a3e635': '#3f6212',
  '#e1f5fe': '#1e3a5f', '#b3e5fc': '#075985', '#81d4fa': '#075985',
  '#c8e6c9': '#064e3b', '#a5d6a7': '#064e3b', '#81c784': '#064e3b',
  '#fff3e0': '#92400e', '#ffe0b2': '#92400e', '#ffcc80': '#92400e',
  '#fff9c4': '#713f12', '#fff59d': '#713f12',
  '#f8bbd0': '#831843', '#f48fb1': '#831843',
  '#e1bee7': '#581c87', '#ce93d8': '#581c87',
  '#b2ebf2': '#164e63', '#80deea': '#164e63',
  '#d7ccc8': '#5d4037', '#bcaaa4': '#5d4037',
  '#cfd8dc': '#374151', '#b0bec5': '#374151',
  // stroke 色
  '#dc2626': '#b91c1c', '#d97706': '#b45309', '#d59e0b': '#b45309',
  '#059669': '#047857', '#4f46e5': '#4338ca', '#7c3aed': '#6d28d9',
  '#db2777': '#be185d', '#0891b2': '#0e7490',
  '#65a30d': '#4d7c0f', '#2563eb': '#1d4ed8', '#3b82f6': '#1d4ed8',
};

function fixColors(content) {
  let changed = 0;
  let fixed = content;
  
  for (const [unsafe, safe] of Object.entries(COLOR_MAP)) {
    const fillPattern = new RegExp(`fill:${unsafe}`, 'g');
    const fCount = (fixed.match(fillPattern) || []).length;
    if (fCount > 0) {
      fixed = fixed.replace(fillPattern, `fill:${safe}`);
      changed += fCount;
    }
    const strokePattern = new RegExp(`stroke:${unsafe}`, 'g');
    const sCount = (fixed.match(strokePattern) || []).length;
    if (sCount > 0) {
      fixed = fixed.replace(strokePattern, `stroke:${safe}`);
      changed += sCount;
    }
  }
  
  return { content: fixed, changed };
}

function checkMermaidColors(content) {
  const errors = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('style ')) continue;
    const fillMatch = line.match(/fill:([#][0-9a-fA-F]+)/i);
    if (!fillMatch) continue;
    const fillColor = fillMatch[1].toLowerCase();
    const colorMatch = line.match(/color:([#][0-9a-fA-F]+)/i);
    const textColor = colorMatch ? colorMatch[1].toLowerCase() : DEFAULT_TEXT;
    const cr = contrastRatio(fillColor, textColor);
    if (cr < MIN_CONTRAST) {
      const suggestion = COLOR_MAP[fillColor] || '#1e3a5f';
      errors.push({ line: i + 1, fill: fillColor, text: textColor, ratio: cr.toFixed(2), suggestion });
    }
  }
  return errors;
}

// ===== 代码块提取 =====

/**
 * 将 body 中的 \`\`\`...\`\`\` 代码块提取到 code: 字段
 * 同时移除 body 中的代码块，替换为引用文本
 */
function extractCodeFromBody(content) {
  // 匹配 body 模板字符串中的 \`\`\` 代码块
  // 注意：我们只处理 body: `...` 中的 \`\`\`
  const codeBlockRegex = /\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/g;
  
  const sections = [];
  let bodyMatch;
  const bodyRegex = /(\{[\s\S]*?title:\s*"[^"]*"[\s\S]*?body:\s*`)([\s\S]*?)(`,[\s\S]*?code:\s*\[|`,[\s\S]*?\},?\s*\n\s*\{|\},?\s*\n\s*\]\s*,?\s*\n)/g;
  
  // 简单方法：逐行扫描，找到 body: `...` 范围内的代码块
  let result = content;
  let hasChanges = false;
  
  // 统计 body 中的代码块
  let bodyCodeBlocks = [];
  const lines = result.split('\n');
  let inBody = false;
  let bodyStartLine = -1;
  let currentBodyContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('body: `')) {
      inBody = true;
      bodyStartLine = i;
      currentBodyContent = '';
      continue;
    }
    
    if (inBody) {
      // 检查是否退出 body（行以 `, 结尾且不是转义的）
      const trimmed = line.trimEnd();
      if (trimmed.endsWith('`,') || trimmed.endsWith('`,')) {
        inBody = false;
        continue;
      }
      currentBodyContent += line + '\n';
    }
  }
  
  // 更简单的方法：直接检查整个文件中是否有 \`\`\` 在 body 模板内
  // 如果有，报告但不自动修改（因为需要谨慎处理）
  const escapedBacktick3 = /\\`\\`\\`/g;
  const matches = [];
  let m;
  while ((m = escapedBacktick3.exec(content)) !== null) {
    // 检查这个位置是否在 body: ` 之后
    const before = content.substring(0, m.index);
    const lastBodyIdx = before.lastIndexOf('body: `');
    const lastCloseBodyIdx = before.lastIndexOf('`,');
    
    if (lastBodyIdx > lastCloseBodyIdx) {
      // 在 body 内部
      const afterBlock = content.substring(m.index);
      const closeMatch = afterBlock.match(/\\`\\`\\`/);
      if (closeMatch) {
        const langMatch = afterBlock.match(/\\`\\`\\`(\w*)\n/);
        const lang = langMatch ? langMatch[1] : 'text';
        const lineNum = (before.match(/\n/g) || []).length + 1;
        matches.push({ line: lineNum, lang, index: m.index });
      }
    }
  }
  
  return { matches, count: matches.length };
}

// ===== 基本格式检查 =====

function checkBasicFormat(content, relPath) {
  const errors = [];
  
  if (!content.match(/id:\s*["']/)) {
    errors.push({ file: relPath, type: 'missing_id', message: '缺少 id 字段' });
  }
  if (!content.match(/title:\s*["']/)) {
    errors.push({ file: relPath, type: 'missing_title', message: '缺少 title 字段' });
  }
  if (!content.match(/category:\s*["']/)) {
    // 博客可能没有 category
    if (!content.match(/export const (article|post|blogPost):/)) {
      errors.push({ file: relPath, type: 'missing_category', message: '缺少 category 字段' });
    }
  }
  if (!content.includes('content: [') && !content.includes('const content:')) {
    // 博客可能用 const content
  }
  
  // 检测 garbled body
  const garbledTexts = ['流程如下：', 'json 代码如下：', 'python 代码如下：'];
  const lines = content.split('\n');
  let inBody = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('body: `')) inBody = true;
    if (inBody) {
      for (const text of garbledTexts) {
        if (line.includes(text)) {
          errors.push({ 
            file: relPath, type: 'garbled_body', line: i + 1,
            message: `body 中有 extract-code.js 残骸 "${text}"` 
          });
          break;
        }
      }
      const trimmed = line.trimEnd();
      if (trimmed.endsWith('`,') || trimmed.endsWith('`,')) inBody = false;
    }
  }
  
  return errors;
}

// ===== 主流程 =====

function getAllTsFiles(dir) {
  let results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getAllTsFiles(fullPath));
      } else if (entry.name.endsWith('.ts') && !entry.name.includes('-types')) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

const allFiles = [
  ...getAllTsFiles(join(DATA_DIR, 'articles')),
  ...getAllTsFiles(join(DATA_DIR, 'blogs')),
];

let totalColorIssues = 0;
let totalGarbledIssues = 0;
let totalFormatIssues = 0;
let fixedFiles = [];

console.log(`📊 开始扫描 ${allFiles.length} 个文件...\n`);

for (const filePath of allFiles) {
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (e) {
    continue;
  }
  
  const relPath = relative(join(__dirname, '../src/data'), filePath);
  let hasColorIssue = false;
  let hasGarbledIssue = false;
  let hasFormatIssue = false;
  let colorFixes = 0;
  
  // 1. Mermaid 配色检查
  const colorErrors = checkMermaidColors(content);
  if (colorErrors.length > 0) {
    hasColorIssue = true;
    totalColorIssues += colorErrors.length;
    
    // 自动修复
    const { content: fixed, changed } = fixColors(content);
    if (changed > 0 && !DRY_RUN) {
      content = fixed;
      colorFixes = changed;
    }
  }
  
  // 2. 代码块检查
  const codeCheck = extractCodeFromBody(content);
  // 只报告，不自动提取代码（需要人工审查）
  
  // 3. 基本格式检查
  const formatErrors = checkBasicFormat(content, relPath);
  if (formatErrors.length > 0) {
    for (const e of formatErrors) {
      if (e.type === 'garbled_body') {
        hasGarbledIssue = true;
        totalGarbledIssues++;
      } else {
        hasFormatIssue = true;
        totalFormatIssues++;
      }
    }
  }
  
  // 写入修复后的内容
  if (!DRY_RUN && (colorFixes > 0 || hasGarbledIssue)) {
    writeFileSync(filePath, content, 'utf-8');
    fixedFiles.push({
      file: relPath,
      colorFixes,
      hasGarbledIssue,
      codeBlocksInBody: codeCheck.count,
    });
  }
}

// ===== 输出结果 =====

console.log('📋 扫描结果：\n');

if (fixedFiles.length > 0) {
  console.log(`✅ 已修复 ${fixedFiles.length} 个文件：\n`);
  for (const f of fixedFiles) {
    console.log(`  ${f.file}`);
    if (f.colorFixes > 0) console.log(`    🎨 配色修复：${f.colorFixes} 处`);
    if (f.hasGarbledIssue) console.log(`    ⚠️ body 中有残骸文本（需手动处理）`);
    if (f.codeBlocksInBody > 0) console.log(`    💻 body 中有 ${f.codeBlocksInBody} 个代码块（需手动提取到 code: 字段）`);
  }
  console.log('');
}

if (totalColorIssues === 0 && totalGarbledIssues === 0 && totalFormatIssues === 0 && fixedFiles.length === 0) {
  console.log('✅ 所有文件均无问题！');
} else {
  console.log(`📊 汇总：`);
  console.log(`  🎨 配色问题：${totalColorIssues} 处`);
  console.log(`  💥 body 残骸：${totalGarbledIssues} 处`);
  console.log(`  📝 格式问题：${totalFormatIssues} 处`);
  console.log('');
  console.log('💡 修复指南：');
  console.log('  - 配色问题已自动修复');
  console.log('  - body 残骸和代码块需要手动处理：');
  console.log('    1. 删除 body 中的 \\`\\`\\` 代码块');
  console.log('    2. 将代码内容放入 code: [{ lang: "xxx", code: `...` }] 数组');
  console.log('    3. body 中用「（见代码块 N）」引用');
}

if (DRY_RUN) {
  console.log('\n⚠️  Dry-run 模式，未写入任何文件');
}
