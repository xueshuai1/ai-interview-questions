/**
 * 去重脚本：移除 news.ts 中重复的 news 条目
 * 保留每个 id 的第一次出现，删除后续重复项
 */

const fs = require('fs');
const path = require('path');

const newsFile = path.join(__dirname, '..', 'src', 'data', 'news.ts');
const content = fs.readFileSync(newsFile, 'utf-8');

// 解析每条 news 对象的起始位置（通过 id: "news-XXX"）
const idRegex = /\{\s*\n\s*id:\s*"news-\d+"/g;
const matches = [];
let match;

while ((match = idRegex.exec(content)) !== null) {
  matches.push({
    id: match[0].match(/news-\d+/)[0],
    index: match.index,
  });
}

console.log(`共找到 ${matches.length} 条 news 条目`);

// 找出重复的 id
const idCounts = {};
matches.forEach(m => {
  idCounts[m.id] = (idCounts[m.id] || 0) + 1;
});

const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1);
console.log(`重复的 ID 数量：${duplicates.length}`);
duplicates.forEach(([id, count]) => {
  console.log(`  ${id} 重复 ${count} 次`);
});

if (duplicates.length === 0) {
  console.log('没有重复项，无需处理');
  process.exit(0);
}

// 对每个重复的 ID，保留第一个，标记后续的起始位置为待删除
const seenIds = new Set();
const toRemove = []; // 存储待删除条目的起始 index

matches.forEach(m => {
  if (seenIds.has(m.id)) {
    toRemove.push(m.index);
  } else {
    seenIds.add(m.id);
  }
});

console.log(`将删除 ${toRemove.length} 个重复条目`);

// 从后往前删除，避免索引偏移
// 需要找到每条 news 对象的结束位置（下一个 { 或文件末尾）
function findObjectEnd(startIndex) {
  let braceCount = 0;
  let started = false;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      started = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (started && braceCount === 0) {
        // 找到对象结束后的逗号或换行
        let end = i + 1;
        while (end < content.length && (content[end] === ',' || content[end] === ' ' || content[end] === '\n')) {
          end++;
        }
        return end;
      }
    }
  }
  return content.length;
}

// 构建删除范围
const removeRanges = toRemove.map(start => ({
  start,
  end: findObjectEnd(start),
}));

// 从后往前拼接
let result = '';
let lastEnd = content.length;

// 按起始位置排序
removeRanges.sort((a, b) => b.start - a.start);

for (const range of removeRanges) {
  result = content.slice(range.end, lastEnd) + result;
  lastEnd = range.start;
}

result = content.slice(0, lastEnd) + result;

// 写回文件
fs.writeFileSync(newsFile, result, 'utf-8');

// 验证
const newContent = fs.readFileSync(newsFile, 'utf-8');
const newIdRegex = /id:\s*"(news-\d+)"/g;
const newIds = [];
let newMatch;
while ((newMatch = newIdRegex.exec(newContent)) !== null) {
  newIds.push(newMatch[1]);
}
const uniqueIds = new Set(newIds);
console.log(`\n去重后：${newIds.length} 条（唯一 ID：${uniqueIds.size} 个）`);

if (newIds.length === uniqueIds.size) {
  console.log('✅ 去重完成，无重复 ID');
} else {
  console.log('⚠️ 仍有重复，请检查');
}
