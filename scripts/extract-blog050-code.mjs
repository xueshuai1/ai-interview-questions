/**
 * 从 blog-050.ts 的 body 中提取 \`\`\`python 代码块，
 * 移到 section.code 数组中。
 */
import { readFileSync, writeFileSync } from 'fs';

const file = 'src/data/blogs/blog-050.ts';
let src = readFileSync(file, 'utf-8');

// 匹配每个 section 里的 \`\`\`python ... \`\`\` 块（含缩进）
// 注意：在 blog-050 中用的是 \`\`\`（反斜杠转义），因为嵌在模板字符串里
const codeBlockRegex = /\\`\\`\\`python\n([\s\S]*?)\\`\\`\\`/g;

// 找到所有 content 数组里的 section，逐一处理
// 策略：找到 body 反引号字符串中的代码块，提取并注入 code 字段

// 先找出所有 section 的边界
// 每个 section 大致格式：
//   {
//     title: "...",
//     body: `...`,
//     ...
//   },

// 简单方案：逐段处理，匹配每个 { title, body: `...` } 块
// 在 body 的模板字符串内查找 \`\`\`python ... \`\`\`

let result = src;
let sectionIdx = 0;

// 找到 content: [ 之后的大括号块
const contentStart = result.indexOf('content: [');
if (contentStart === -1) {
  console.error('找不到 content: [');
  process.exit(1);
}

// 提取 content 数组部分（从 [ 到对应的 ]）
let bracketDepth = 0;
let contentEnd = -1;
for (let i = contentStart; i < result.length; i++) {
  if (result[i] === '[') bracketDepth++;
  if (result[i] === ']') {
    bracketDepth--;
    if (bracketDepth === 0) {
      contentEnd = i;
      break;
    }
  }
}

const before = result.slice(0, contentStart + 1); // content: [
const contentPart = result.slice(contentStart + 1, contentEnd);
const after = result.slice(contentEnd);

// 拆分 section：匹配 { 开头的对象
// 简单做法：按 },\n    { 分割
const sections = [];
let depth = 0;
let start = 0;
for (let i = 0; i < contentPart.length; i++) {
  if (contentPart[i] === '{') {
    if (depth === 0) start = i;
    depth++;
  } else if (contentPart[i] === '}') {
    depth--;
    if (depth === 0) {
      sections.push(contentPart.slice(start, i + 1));
    }
  }
}

console.log(`找到 ${sections.length} 个 section`);

const processedSections = sections.map((section, idx) => {
  // 检查是否有 body 字段
  const bodyMatch = section.match(/body:\s*`([\s\S]*?)`[\s,}]/);
  if (!bodyMatch) return section;

  const fullBody = bodyMatch[1];
  
  // 在 body 中查找 \`\`\`python 代码块
  const codeBlocks = [];
  let newBody = fullBody;
  
  // 匹配 \`\`\`python 到 \`\`\`（独立行）
  const codeRegex = /\n\\`\\`\\`python\n([\s\S]*?)\n\\`\\`\\`\n/g;
  let match;
  while ((match = codeRegex.exec(fullBody)) !== null) {
    codeBlocks.push(match[1]);
  }
  
  if (codeBlocks.length === 0) {
    // 也尝试不带前导换行的格式
    const codeRegex2 = /\\`\\`\\`python\n([\s\S]*?)\\`\\`\\`/g;
    while ((match = codeRegex2.exec(fullBody)) !== null) {
      codeBlocks.push(match[1]);
    }
  }

  if (codeBlocks.length === 0) return section;

  console.log(`  Section ${idx}: 提取到 ${codeBlocks.length} 个代码块`);

  // 从 body 中移除代码块（替换为空字符串）
  let cleanedBody = fullBody
    .replace(/\n\\`\\`\\`python\n[\s\S]*?\n\\`\\`\\`\n/g, '\n')
    .replace(/\\`\\`\\`python\n[\s\S]*?\\`\\`\\`/g, '');

  // 清理多余空行
  cleanedBody = cleanedBody.replace(/\n{3,}/g, '\n\n');

  // 构建 code 数组
  const codeArray = codeBlocks.map((code, ci) => {
    const escaped = code
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '  ');
    return `{ lang: 'python', code: '${escaped}' }`;
  }).join(',\n        ');

  // 在 section 中插入 code 字段（在 body 之后）
  const bodyEndIdx = section.lastIndexOf('`');
  // 找到 body: `...` 后面的位置
  const bodyFullMatch = section.match(/(body:\s*`[\s\S]*?`)([\s,}]*)/);
  if (!bodyFullMatch) return section;

  const afterBody = bodyFullMatch[2]; // 逗号或换行
  const newSection = section.replace(
    /(body:\s*`[\s\S]*?`)([\s,}]*)/,
    `$1,\n      code: [\n        ${codeArray}\n      ],\n    `
  );

  // 用清理后的 body 替换
  const oldBodyTemplate = bodyFullMatch[0].split('`')[1]; // 不包括反引号
  // 更简单：直接替换 body 内容
  const bodyStartIdx = newSection.indexOf('body: `');
  if (bodyStartIdx === -1) return section;
  
  const bodyContentStart = bodyStartIdx + 7; // body: `
  // 找到匹配的结尾反引号（处理转义）
  let backtickIdx = -1;
  for (let i = bodyContentStart; i < newSection.length; i++) {
    if (newSection[i] === '`') {
      // 检查是否被转义
      let slashCount = 0;
      for (let j = i - 1; j >= 0 && newSection[j] === '\\'; j--) slashCount++;
      if (slashCount % 2 === 0) {
        backtickIdx = i;
        break;
      }
    }
  }
  
  if (backtickIdx === -1) return section;

  const finalSection = newSection.slice(0, bodyContentStart) + 
    cleanedBody + 
    newSection.slice(backtickIdx);

  return finalSection;
});

const newContent = processedSections.join(',\n');
const finalResult = before + '\n' + newContent + '\n  ' + after;

// 写回
writeFileSync(file, finalResult);
console.log('\n✅ 已写入', file);
console.log('请检查并运行 TypeScript 编译验证');
