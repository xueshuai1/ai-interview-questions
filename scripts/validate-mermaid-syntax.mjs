#!/usr/bin/env node
/**
 * Mermaid 语法深度校验 — 发布前拦截器 v5
 * 
 * 目标：在文章推送前捕获所有导致 "Syntax error in text" 的 Mermaid 致命错误
 * 
 * 覆盖的致命错误类型：
 *   1. graph TD TB — 双方向声明
 *   2. \n 字面量（反斜杠+n 而非实际换行）
 *   3. 未闭合的括号/引号/花括号（智能多行合并后检查）
 *   4. subgraph/loop/alt/opt/par/rect 块未闭合
 *   5. 缺少方向声明 / 非法方向
 *   6. classDef 颜色格式非法
 *   7. 连续箭头 / 含空格箭头
 * 
 * 用法：
 *   node scripts/validate-mermaid-syntax.mjs                    # 全量检查
 *   node scripts/validate-mermaid-syntax.mjs src/data/articles/xxx.ts  # 单文件
 */

import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DATA_DIR = join(__dirname, '../src/data');

// ===== 工具函数 =====

function extractMermaidBlocks(content) {
  const blocks = [];
  const regex = /mermaid:\s*`([\s\S]*?)`/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const startLine = (content.substring(0, match.index).match(/\n/g) || []).length + 1;
    blocks.push({ content: match[1], startLine });
  }
  return blocks;
}

/**
 * 检查字符串中引号和括号的平衡状态。
 */
function getBracketState(str) {
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let depth = { paren: 0, square: 0, curly: 0 };
  
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    
    // 转义处理
    if (i > 0 && str[i-1] === '\\') continue;
    
    if (ch === '"' && !inSingleQuote) { inDoubleQuote = !inDoubleQuote; continue; }
    if (ch === "'" && !inDoubleQuote) { inSingleQuote = !inSingleQuote; continue; }
    
    if (inDoubleQuote || inSingleQuote) continue;
    
    if (ch === '(') depth.paren++;
    if (ch === ')') depth.paren--;
    if (ch === '[') depth.square++;
    if (ch === ']') depth.square--;
    if (ch === '{') depth.curly++;
    if (ch === '}') depth.curly--;
  }
  
  return { quotesOpen: inDoubleQuote || inSingleQuote, depth };
}

function totalDepth(state) {
  return state.depth.paren + state.depth.square + state.depth.curly;
}

/**
 * 智能合并跨行标签。
 */
function mergeMultilineLabels(rawContent) {
  const rawLines = rawContent.split('\n');
  const merged = [];
  let buffer = '';
  let state = { quotesOpen: false, depth: { paren: 0, square: 0, curly: 0 } };
  
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();
    
    if (trimmed === '' || trimmed.startsWith('%%')) {
      if (buffer) { merged.push(buffer); buffer = ''; state = { quotesOpen: false, depth: { paren: 0, square: 0, curly: 0 } }; }
      if (trimmed) merged.push(line);
      continue;
    }
    
    const isKeyword = /^(classDef|class|style|linkStyle|click|init|subgraph\b|end\b|note|activate|deactivate|autonumber|loop|alt|else\b|opt|rect|par|and)\b/.test(trimmed);
    const isDecl = /^(graph|flowchart|sequenceDiagram)\s/.test(trimmed);
    
    if (isKeyword || isDecl) {
      if (buffer) { merged.push(buffer); buffer = ''; state = { quotesOpen: false, depth: { paren: 0, square: 0, curly: 0 } }; }
      merged.push(line);
      continue;
    }
    
    buffer = buffer ? buffer + ' ' + trimmed : trimmed;
    state = getBracketState(buffer);
    
    if (!state.quotesOpen && totalDepth(state) === 0) {
      merged.push(buffer);
      buffer = '';
      state = { quotesOpen: false, depth: { paren: 0, square: 0, curly: 0 } };
    }
  }
  
  if (buffer) merged.push(buffer);
  return merged;
}

function skipLine(line) {
  if (!line) return true;
  const t = line.trim();
  return t === '' || t.startsWith('%%');
}

// ===== 致命错误检查 =====

/** 1. graph TD TB — 双方向声明 */
function checkDoubleDirection(lines, blockStart, filePath) {
  const firstLine = lines[0]?.trim() || '';
  const dirMatch = firstLine.match(/^(?:graph|flowchart)\s+(TD|LR|BT|RL)\s+(TD|LR|BT|RL)/i);
  if (dirMatch) {
    return [{
      file: filePath, line: blockStart, type: 'double_direction', severity: 'error',
      message: `Mermaid 双方向声明 "${dirMatch[1]} ${dirMatch[2]}" 会导致语法错误。只保留一个方向（如 graph TD）。`
    }];
  }
  return [];
}

/** 2. 缺少或非法方向声明 */
function checkDirection(lines, blockStart, filePath) {
  const firstLine = lines[0]?.trim() || '';
  
  if (/^(?:graph|flowchart)\s*$/i.test(firstLine)) {
    return [{
      file: filePath, line: blockStart, type: 'missing_direction', severity: 'error',
      message: `Mermaid 缺少方向声明。应为 "graph TD" 或 "flowchart LR" 等。`
    }];
  }
  
  const illegalDir = firstLine.match(/^(?:graph|flowchart)\s+([A-Z]+)/i);
  if (illegalDir && !new Set(['TD','LR','BT','RL']).has(illegalDir[1])) {
    return [{
      file: filePath, line: blockStart, type: 'invalid_direction', severity: 'error',
      message: `Mermaid 非法方向 "${illegalDir[1]}"。合法方向: TD, LR, BT, RL。`
    }];
  }
  
  return [];
}

/** 3. \n 字面量 */
function checkLiteralNewline(rawLines, blockStart, filePath) {
  const errors = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (line.endsWith('\\')) continue;
    if (skipLine(line)) continue;
    if (line.includes('\\n')) {
      errors.push({
        file: filePath, line: blockStart + i, type: 'literal_newline', severity: 'error',
        message: `Mermaid 中包含字面量 \\n（应使用实际换行）。行: ${line.trim().slice(0, 80)}`
      });
    }
  }
  return errors;
}

/** 4. 括号/引号/花括号不闭合（合并多行后检查）*/
function checkBalanced(mergedLines, blockStart, filePath) {
  const errors = [];
  
  for (let i = 0; i < mergedLines.length; i++) {
    const line = mergedLines[i];
    const trimmed = line.trim();
    if (skipLine(line)) continue;
    if (/^(classDef|class|style|linkStyle|click|init)\b/.test(trimmed)) continue;
    if (/^(graph|flowchart|sequenceDiagram)\s/.test(trimmed)) continue;
    if (/^(subgraph\b|end\b)/.test(trimmed)) continue;
    if (/^(note|activate|deactivate|autonumber|loop|else\b|opt|rect|par|and)\b/.test(trimmed)) continue;
    
    // 去掉引号内的内容后检查括号
    const stripped = trimmed
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''");
    
    // 圆括号 — 但要排除 sequenceDiagram 箭头语法中的 )
    // sequenceDiagram 中 A-->>B 和 A--)B 是合法语法，其中的 ) 不是括号
    // 先把这些箭头语法替换掉
    const noArrows = stripped
      .replace(/--\)/g, '')   // --) 叉箭头
      .replace(/-->>/g, '')   // -->> 实线箭头
      .replace(/-->/g, '')    // --> 箭头
      .replace(/--x/g, '')    // --x 叉箭头
      .replace(/-\)/g, '')    // -) 
      .replace(/>>/g, '')     // >>
      .replace(/->/g, '')     // ->
      .replace(/\.->/g, '')   // .->
      .replace(/==>/g, '');   // ==>
    
    const openP = (noArrows.match(/\(/g) || []).length;
    const closeP = (noArrows.match(/\)/g) || []).length;
    if (openP !== closeP) {
      errors.push({
        file: filePath, line: blockStart + i, type: 'unbalanced_paren', severity: 'error',
        message: `Mermaid 行圆括号不闭合 (开${openP} )闭${closeP}。行: ${trimmed.slice(0, 120)}`
      });
    }
    
    // 方括号
    const openS = (stripped.match(/\[/g) || []).length;
    const closeS = (stripped.match(/\]/g) || []).length;
    if (openS !== closeS) {
      errors.push({
        file: filePath, line: blockStart + i, type: 'unbalanced_square', severity: 'error',
        message: `Mermaid 行方括号不闭合 [开${openS} ]闭${closeS}。行: ${trimmed.slice(0, 120)}`
      });
    }
    
    // 花括号
    const openC = (stripped.match(/\{/g) || []).length;
    const closeC = (stripped.match(/\}/g) || []).length;
    if (openC !== closeC) {
      errors.push({
        file: filePath, line: blockStart + i, type: 'unbalanced_curly', severity: 'error',
        message: `Mermaid 行花括号不闭合 {开${openC} }闭${closeC}。行: ${trimmed.slice(0, 120)}`
      });
    }
  }
  
  return errors;
}

/** 5. subgraph/loop/alt/opt/par/rect 块未闭合 */
function checkBlockBalance(rawLines, blockStart, filePath) {
  const errors = [];
  // 所有需要 end 关闭的块
  const BLOCK_OPENERS = /^(subgraph|loop|alt|opt|par|rect)\b/i;
  let depth = 0;
  
  for (let i = 0; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();
    if (BLOCK_OPENERS.test(trimmed)) depth++;
    if (trimmed === 'end') depth--;
    if (depth < 0) {
      errors.push({
        file: filePath, line: blockStart + i, type: 'block_imbalance', severity: 'error',
        message: `Mermaid "end" 过多，块（subgraph/loop/alt/opt/par/rect）与 end 不配对。`
      });
      depth = 0;
    }
  }
  
  if (depth > 0) {
    errors.push({
      file: filePath, line: blockStart, type: 'block_imbalance', severity: 'error',
      message: `Mermaid 块未闭合（缺少 ${depth} 个 "end"）。`
    });
  }
  
  return errors;
}

/** 6. 非法箭头语法 */
function checkInvalidArrows(mergedLines, blockStart, filePath) {
  const errors = [];
  
  for (let i = 0; i < mergedLines.length; i++) {
    const line = mergedLines[i].trim();
    if (skipLine(mergedLines[i])) continue;
    if (/^(classDef|class|style|linkStyle|click)\b/.test(line)) continue;
    if (/^(graph|flowchart|sequenceDiagram)\s/.test(line)) continue;
    if (/^(subgraph\b|end\b)/.test(line)) continue;
    if (/^(note|activate|deactivate|autonumber|loop|else\b|opt|rect|par|and)\b/.test(line)) continue;
    
    // 连续两个 -->
    if (/-->\s*-->/.test(line)) {
      errors.push({
        file: filePath, line: blockStart + i, type: 'invalid_arrow', severity: 'error',
        message: `Mermaid 连续两个 "-->" 语法错误。行: ${line.slice(0, 120)}`
      });
    }
    
    // 箭头中间有空格：- - > 
    if (/-\s+-\s*>/.test(line)) {
      errors.push({
        file: filePath, line: blockStart + i, type: 'invalid_arrow', severity: 'error',
        message: `Mermaid 箭头 "-->" 含空格。行: ${line.slice(0, 120)}`
      });
    }
    
    // == > 空格
    if (/=\s+=\s*>/.test(line)) {
      errors.push({
        file: filePath, line: blockStart + i, type: 'invalid_arrow', severity: 'error',
        message: `Mermaid 箭头 "==>" 含空格。行: ${line.slice(0, 120)}`
      });
    }
    
    // . - > 虚线箭头含空格
    if (/\.\s+-\s*>/.test(line)) {
      errors.push({
        file: filePath, line: blockStart + i, type: 'invalid_arrow', severity: 'error',
        message: `Mermaid 虚线箭头 ".->" 含空格。行: ${line.slice(0, 120)}`
      });
    }
  }
  
  return errors;
}

/** 7. classDef 颜色格式非法 */
function checkClassDefColors(rawLines, blockStart, filePath) {
  const errors = [];
  
  for (let i = 0; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();
    if (!trimmed.startsWith('classDef')) continue;
    
    const fillMatch = trimmed.match(/fill:\s*([^;,]+)/);
    if (fillMatch) {
      const color = fillMatch[1].trim();
      if (!color.match(/^#[0-9a-fA-F]{3,8}$/)) {
        errors.push({
          file: filePath, line: blockStart + i, type: 'invalid_color', severity: 'error',
          message: `Mermaid classDef 颜色值不合法: "${color}"。应为 #RGB 或 #RRGGBB 格式。`
        });
      }
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
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('-types.ts')) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

const targetFile = process.argv[2];
let filesToCheck = [];

if (targetFile) {
  filesToCheck = [targetFile];
} else {
  filesToCheck = [
    ...getAllTsFiles(join(DATA_DIR, 'articles')),
    ...getAllTsFiles(join(DATA_DIR, 'blogs')),
  ];
}

let allErrors = [];
let checkedCount = 0;
let mermaidBlockCount = 0;

for (const filePath of filesToCheck) {
  let content;
  try { content = readFileSync(filePath, 'utf-8'); } catch (e) { continue; }
  
  const relPath = relative(join(__dirname, '../src/data'), filePath);
  checkedCount++;
  
  const blocks = extractMermaidBlocks(content);
  mermaidBlockCount += blocks.length;
  
  for (const block of blocks) {
    const rawLines = block.content.split('\n');
    const mergedLines = mergeMultilineLabels(block.content);
    
    allErrors.push(...checkDoubleDirection(rawLines, block.startLine, relPath));
    allErrors.push(...checkDirection(rawLines, block.startLine, relPath));
    allErrors.push(...checkLiteralNewline(rawLines, block.startLine, relPath));
    allErrors.push(...checkBalanced(mergedLines, block.startLine, relPath));
    allErrors.push(...checkBlockBalance(rawLines, block.startLine, relPath));
    allErrors.push(...checkInvalidArrows(mergedLines, block.startLine, relPath));
    allErrors.push(...checkClassDefColors(rawLines, block.startLine, relPath));
  }
}

// ===== 输出 =====

console.log(`🔍 Mermaid 语法校验: ${checkedCount} 个文件, ${mermaidBlockCount} 个 mermaid 块\n`);

if (allErrors.length === 0) {
  console.log('✅ 全部通过 — 无 Mermaid 语法错误');
  process.exit(0);
}

console.error(`❌ 发现 ${allErrors.length} 个错误:\n`);

const byFile = {};
for (const e of allErrors) {
  if (!byFile[e.file]) byFile[e.file] = [];
  byFile[e.file].push(e);
}

for (const [file, fileErrors] of Object.entries(byFile)) {
  console.error(`📄 ${file}:`);
  for (const e of fileErrors) {
    console.error(`  L${e.line}: ❌ [${e.type}] ${e.message}`);
  }
  console.error('');
}

process.exit(1);
