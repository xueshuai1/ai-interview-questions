/**
 * 从 blog-050.ts 的 body 中提取 ```python 代码块，移到 section.code 数组中。
 * 直接读取文件、用 AST-ish 方式处理、写回。
 */
import { readFileSync, writeFileSync } from 'fs';

const file = 'src/data/blogs/blog-050.ts';
const src = readFileSync(file, 'utf-8');

// 找到 content: [ 的起始位置
const contentStartIdx = src.indexOf('content: [');
const contentOpen = contentStartIdx + 'content: ['.length;

// 找到匹配的 ]
let depth = 0;
let contentClose = -1;
for (let i = contentStartIdx; i < src.length; i++) {
  if (src[i] === '[') depth++;
  if (src[i] === ']') {
    depth--;
    if (depth === 0) { contentClose = i; break; }
  }
}

const before = src.slice(0, contentOpen);
const content = src.slice(contentOpen, contentClose);
const after = src.slice(contentClose);

// 拆分 content 为多个 section 对象（按顶级 { } 拆分）
const sections = [];
let d = 0, start = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') { if (d === 0) start = i; d++; }
  if (content[i] === '}') {
    d--;
    if (d === 0) sections.push(content.slice(start, i + 1));
  }
}

console.log(`找到 ${sections.length} 个 section`);

// 处理每个 section：提取 body 中的 ```python ... ``` 代码块
function processSection(section, idx) {
  // 找 body: `...` 的范围（处理模板字符串中的反引号）
  const bodyKeyIdx = section.indexOf('body: `');
  if (bodyKeyIdx === -1) return section;

  // 找到匹配的结束反引号（不在转义序列中）
  const bodyContentStart = bodyKeyIdx + 'body: `.length';
  let bodyEnd = -1;
  for (let i = bodyContentStart; i < section.length; i++) {
    if (section[i] === '`') {
      // 检查前面的反斜杠数量（奇数 = 转义）
      let slashes = 0;
      for (let j = i - 1; j >= 0 && section[j] === '\\'; j--) slashes++;
      if (slashes % 2 === 0) { bodyEnd = i; break; }
    }
  }

  if (bodyEnd === -1) return section;

  const bodyContent = section.slice(bodyContentStart, bodyEnd);

  // 在 body 中找 ```python ... ``` 代码块
  // 模式：\n```python\n...code...\n```\n  或  ```python...（不带换行前缀）
  const codeBlocks = [];
  let newBody = bodyContent;

  // 反复匹配直到没有更多代码块
  let found = true;
  while (found) {
    found = false;
    const fenceStart = newBody.indexOf('```python');
    if (fenceStart === -1) break;

    // 找到结束的反引号
    let fenceEnd = -1;
    for (let i = fenceStart + 9; i < newBody.length - 2; i++) {
      if (newBody[i] === '`' && newBody[i+1] === '`' && newBody[i+2] === '`') {
        fenceEnd = i + 3;
        break;
      }
    }
    if (fenceEnd === -1) break;

    found = true;
    const code = newBody.slice(fenceStart + 9, fenceEnd);
    codeBlocks.push(code);

    // 从 body 中移除代码块，同时移除前后的多余空行
    let beforeCode = newBody.slice(0, fenceStart);
    let afterCode = newBody.slice(fenceEnd);

    // 移除代码块前的空行和尾随换行
    beforeCode = beforeCode.replace(/\n\s*\n$/, '\n');
    // 如果代码块前没有换行，不加空行
    if (!beforeCode.endsWith('\n')) beforeCode += '\n';

    // 移除代码块后的前导换行
    afterCode = afterCode.replace(/^\n+/, '');

    newBody = beforeCode + afterCode;
  }

  if (codeBlocks.length === 0) return section;

  console.log(`  Section ${idx}: 提取 ${codeBlocks.length} 个代码块`);

  // 构建 code 数组字符串
  const codeEntries = codeBlocks.map(c => {
    // 转义：反斜杠、单引号、换行
    const escaped = c
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n');
    return `      { lang: 'python', code: '${escaped}' }`;
  }).join(',\n');

  // 在 body 反引号后插入 code 字段
  const bodyEndInSection = bodyEnd + 1; // 包括反引号本身

  // 检查 body 后面是逗号、换行还是其他
  const afterBody = section.slice(bodyEndInSection);
  const trimmedAfter = afterBody.trimStart();

  let codeField = `\n    code: [\n${codeEntries}\n    ],`;

  if (trimmedAfter.startsWith(',')) {
    // body 后面有逗号：去掉逗号，插入 code 字段，再加逗号
    const commaIdx = bodyEndInSection + afterBody.indexOf(',');
    return section.slice(0, commaIdx) + codeField + section.slice(commaIdx + 1);
  } else {
    return section.slice(0, bodyEndInSection) + codeField + afterBody;
  }
}

const processed = sections.map((s, i) => processSection(s, i));
const newContent = '\n    ' + processed.join(',\n    ') + '\n  ';
const newSrc = before + newContent + after;

writeFileSync(file, newSrc);
console.log('✅ 已写入', file);
console.log('运行 npx tsc --noEmit 验证 TypeScript');
