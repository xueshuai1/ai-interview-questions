# AI 知识库文章管理机制

> 完整的文章存储、读取、更新机制设计文档

---

## 📊 系统架构

### 1. 文件存储结构

```
content/knowledge/
├── LLM/
│   ├── 001_Transformer.md              # 文章文件
│   ├── 001_Transformer.history.md      # 历史版本（可选）
│   ├── 002_Self-Attention.md
│   └── README.md                       # 分类说明
├── ML/
├── DL/
└── ...
```

### 2. 文章元数据规范

```markdown
# 文章标题

> **分类**: 大语言模型 | **编号**: LLM-001 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐⭐
> **版本**: v1.2 | **作者**: AI Team | **审核状态**: ✅

`标签 1` `标签 2` `标签 3`

**摘要**: 50-100 字的摘要内容...

---

## 更新日志

- **v1.2** (2026-03-30) - 更新 Self-Attention 代码示例
- **v1.1** (2026-03-28) - 添加 Mermaid 图表
- **v1.0** (2026-03-25) - 初始版本
```

### 3. 元数据字段说明

| 字段 | 说明 | 格式 | 必填 |
|------|------|------|------|
| **分类** | 文章所属分类 | 中文名称 | ✅ |
| **编号** | 唯一标识符 | CATEGORY-XXX | ✅ |
| **更新时间** | 最后修改日期 | YYYY-MM-DD | ✅ |
| **难度** | 学习难度 | ⭐/⭐⭐/⭐⭐⭐ | ✅ |
| **版本** | 文章版本号 | vX.X | ✅ |
| **作者** | 文章作者 | 文本 | ❌ |
| **审核状态** | 内容审核 | ✅/⏳/❌ | ❌ |

---

## 🔄 文章生命周期

### 1. 创建文章

```bash
# 1. 创建文件
touch content/knowledge/LLM/003_Multi-Head_Attention.md

# 2. 添加标准头部
cat > content/knowledge/LLM/003_Multi-Head_Attention.md << 'EOF'
# Multi-Head Attention

> **分类**: 大语言模型 | **编号**: LLM-003 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐⭐
> **版本**: v1.0 | **作者**: AI Team | **审核状态**: ⏳

`Transformer` `Attention` `深度学习`

**摘要**: Multi-Head Attention 是 Transformer 的核心组件...

---

## 更新日志

- **v1.0** (2026-03-30) - 初始版本

---

[文章内容]
EOF

# 3. 提交并推送
git add -A
git commit -m "docs: 新增 Multi-Head Attention 文章"
git push origin main
```

### 2. 更新文章

```bash
# 1. 修改文章内容
vim content/knowledge/LLM/001_Transformer.md

# 2. 更新头部信息
# 更新时间：2026-03-30
# 版本：v1.2

# 3. 添加更新日志
## 更新日志

- **v1.2** (2026-03-30) - 更新 Self-Attention 代码示例
- **v1.1** (2026-03-28) - 添加 Mermaid 图表
- **v1.0** (2026-03-25) - 初始版本

# 4. 提交并推送
git add -A
git commit -m "docs(Transformer): 更新代码示例和图表

- 添加完整的 Python 实现
- 添加位置编码示例
- 更新 Mermaid 流程图

版本：v1.1 → v1.2"
git push origin main
```

### 3. 删除文章

```bash
# 1. 移动文件到归档目录（不直接删除）
git mv content/knowledge/LLM/old-001_Transformer.md \
       content/.archived/LLM/001_Transformer.md

# 2. 提交并推送
git add -A
git commit -m "docs: 归档过时的 Transformer 文章"
git push origin main
```

---

## 📝 版本控制策略

### 1. 版本号规范

```
v主版本。次版本。修订版本

例如：v1.2.3
- 主版本：重大更新（架构变化）
- 次版本：功能更新（添加内容）
- 修订版本：小幅修改（错别字、格式）
```

### 2. 更新类型

| 类型 | 版本号变化 | 说明 | 示例 |
|------|-----------|------|------|
| **重大更新** | v1.x.x → v2.0.0 | 重构文章结构 | 完全重写 |
| **功能更新** | v1.1.x → v1.2.0 | 添加新内容 | 添加代码示例 |
| **小幅修改** | v1.1.1 → v1.1.2 | 修正错误 | 修改错别字 |

### 3. 更新日志格式

```markdown
## 更新日志

- **v1.2.0** (2026-03-30) - 添加代码示例
  - 添加 Python 实现
  - 添加使用示例
  
- **v1.1.0** (2026-03-28) - 添加图表
  - 添加架构图
  - 添加流程图
  
- **v1.0.0** (2026-03-25) - 初始版本
```

---

## 🔍 文章质量检查

### 1. 自动检查脚本

```bash
#!/bin/bash
# scripts/check-articles.sh

echo "检查文章元数据..."

for file in content/knowledge/*/*.md; do
  # 检查是否有标题
  if ! grep -q "^# " "$file"; then
    echo "❌ $file: 缺少标题"
  fi
  
  # 检查是否有分类信息
  if ! grep -q "\*\*分类\*\*:" "$file"; then
    echo "❌ $file: 缺少分类信息"
  fi
  
  # 检查是否有更新时间
  if ! grep -q "\*\*更新时间\*\*:" "$file"; then
    echo "❌ $file: 缺少更新时间"
  fi
  
  # 检查是否有版本号
  if ! grep -q "\*\*版本\*\*:" "$file"; then
    echo "❌ $file: 缺少版本号"
  fi
  
  # 检查是否有更新日志
  if ! grep -q "## 更新日志" "$file"; then
    echo "⚠️  $file: 缺少更新日志"
  fi
done

echo "检查完成！"
```

### 2. Git Hooks

```bash
#!/bin/bash
# .git/hooks/pre-commit

# 检查文章元数据
scripts/check-articles.sh

# 如果有错误，阻止提交
if [ $? -ne 0 ]; then
  echo "❌ 文章元数据检查失败，请修复后重新提交"
  exit 1
fi
```

---

## 📊 统计与监控

### 1. 文章统计脚本

```bash
#!/bin/bash
# scripts/article-stats.sh

echo "=== 文章统计 ==="
echo ""

# 总计
total=$(find content/knowledge -name "*.md" | wc -l)
echo "📚 文章总数：$total"
echo ""

# 按分类统计
echo "📊 按分类统计:"
for dir in content/knowledge/*/; do
  category=$(basename "$dir")
  count=$(find "$dir" -name "*.md" | wc -l)
  echo "  - $category: $count 篇"
done
echo ""

# 按版本统计
echo "🔄 版本分布:"
v1=$(grep -r "\*\*版本\*\*: v1" content/knowledge | wc -l)
v2=$(grep -r "\*\*版本\*\*: v2" content/knowledge | wc -l)
v3=$(grep -r "\*\*版本\*\*: v3" content/knowledge | wc -l)
echo "  - v1.x: $v1 篇"
echo "  - v2.x: $v2 篇"
echo "  - v3.x: $v3 篇"
echo ""

# 最近更新
echo "🕐 最近 7 天更新:"
find content/knowledge -name "*.md" -mtime -7 -exec basename {} \; | head -10
```

### 2. 质量报告

```bash
#!/bin/bash
# scripts/quality-report.sh

echo "=== 文章质量报告 ==="
echo ""

# 有更新日志的文章
with_changelog=$(grep -r "## 更新日志" content/knowledge | wc -l)
total=$(find content/knowledge -name "*.md" | wc -l)
percentage=$((with_changelog * 100 / total))
echo "📝 有更新日志：$with_changelog/$total ($percentage%)"

# 有版本号的文章
with_version=$(grep -r "\*\*版本\*\*:" content/knowledge | wc -l)
percentage=$((with_version * 100 / total))
echo "🔄 有版本号：$with_version/$total ($percentage%)"

# 有审核状态的文章
with_review=$(grep -r "\*\*审核状态\*\*:" content/knowledge | wc -l)
percentage=$((with_review * 100 / total))
echo "✅ 有审核状态：$with_review/$total ($percentage%)"
```

---

## 🎯 内容更新流程

### 1. 定期审查

```markdown
## 月度审查清单

- [ ] 检查所有文章的更新时间
- [ ] 更新过时的技术内容
- [ ] 补充新的代码示例
- [ ] 修复错误链接
- [ ] 优化 SEO 关键词

## 审查记录

### 2026-03

- 审查日期：2026-03-30
- 审查人：AI Team
- 审查文章：10 篇
- 更新文章：3 篇
- 发现问题：5 个
- 已修复：5 个
```

### 2. 用户反馈

```markdown
## 反馈收集

### 问题反馈

- **文章**: Transformer 架构详解
- **问题**: 代码示例有误
- **反馈时间**: 2026-03-30
- **状态**: ✅ 已修复
- **修复版本**: v1.2

### 内容建议

- **文章**: Self-Attention 机制
- **建议**: 添加可视化图表
- **反馈时间**: 2026-03-29
- **状态**: ⏳ 处理中
- **计划版本**: v1.3
```

---

## 📈 数据分析

### 1. 访问统计

```typescript
// 在文章页面添加访问统计
interface ArticleStats {
  views: number;        // 浏览次数
  likes: number;        // 点赞数
  shares: number;       // 分享数
  avgReadTime: number;  // 平均阅读时长
  lastViewed: string;   // 最后浏览时间
}
```

### 2. 热门搜索

```typescript
// 记录搜索关键词
interface SearchStats {
  keyword: string;
  count: number;
  results: number;
  clickedArticle: string | null;
}
```

---

## 🔐 权限管理

### 1. 作者权限

```markdown
## 作者角色

- **创作者**: 可以创建新文章
- **编辑者**: 可以修改现有文章
- **审核者**: 可以审核文章内容
- **管理员**: 所有权限
```

### 2. 审核流程

```
创建文章 → 编辑者修改 → 审核者审核 → 发布上线
   ↓           ↓           ↓          ↓
  draft     review      approved    published
```

---

## 📋 最佳实践

### 1. 文章命名

```
✅ 推荐：
- 001_Transformer.md
- 002_Self-Attention.md

❌ 不推荐：
- transformer.md
- 01.md
- 文章 1.md
```

### 2. 提交信息

```
✅ 推荐：
docs(Transformer): 更新代码示例

- 添加 Python 实现
- 添加使用示例

版本：v1.1 → v1.2

❌ 不推荐：
更新文章
修改内容
```

### 3. 更新频率

```
- 新文章：每周 1-2 篇
- 更新文章：每月审查一次
- 技术跟进：及时更新最新进展
```

---

## 🚀 自动化脚本

### 1. 创建文章模板

```bash
#!/bin/bash
# scripts/create-article.sh

CATEGORY=$1
TITLE=$2
NUMBER=$3

if [ -z "$CATEGORY" ] || [ -z "$TITLE" ] || [ -z "$NUMBER" ]; then
  echo "用法：$0 <分类> <标题> <编号>"
  echo "示例：$0 LLM \"Transformer 架构\" 001"
  exit 1
fi

FILE="content/knowledge/$CATEGORY/${NUMBER}_${TITLE}.md"

cat > "$FILE" << 'EOF'
# {{TITLE}}

> **分类**: {{CATEGORY_NAME}} | **编号**: {{CATEGORY}}-{{NUMBER}} | **更新时间**: {{DATE}} | **难度**: ⭐⭐⭐
> **版本**: v1.0 | **作者**: AI Team | **审核状态**: ⏳

`标签 1` `标签 2` `标签 3`

**摘要**: 50-100 字的摘要内容...

---

## 更新日志

- **v1.0** ({{DATE}}) - 初始版本

---

## 一、核心概念

### 1.1 什么是 {{TITLE}}

[内容]

---

**下一篇**: [下一篇文章](./{{NEXT}})

**上一篇**: [返回目录](../README.md)
EOF

# 替换变量
sed -i "s/{{TITLE}}/$TITLE/g" "$FILE"
sed -i "s/{{CATEGORY}}/$CATEGORY/g"
sed -i "s/{{NUMBER}}/$NUMBER/g"
sed -i "s/{{DATE}}/$(date +%Y-%m-%d)/g"

echo "✅ 文章模板已创建：$FILE"
echo "📝 请编辑文件添加内容"
```

### 2. 批量更新

```bash
#!/bin/bash
# scripts/bulk-update.sh

# 批量更新所有文章的更新时间
for file in content/knowledge/*/*.md; do
  if grep -q "\*\*更新时间\*\*:" "$file"; then
    sed -i "s/\*\*更新时间\*\*:.*|/\*\*更新时间\*\*: $(date +%Y-%m-%d) |/" "$file"
    echo "✅ 更新：$file"
  fi
done

# 提交更改
git add -A
git commit -m "chore: 批量更新文章时间戳"
git push origin main
```

---

## 📊 监控仪表板

### 1. 实时统计

```typescript
// 在管理后台显示
interface Dashboard {
  totalArticles: number;      // 总文章数
  thisMonthNew: number;       // 本月新增
  thisMonthUpdated: number;   // 本月更新
  avgVersion: number;         // 平均版本
  qualityScore: number;       // 质量评分
}
```

### 2. 更新提醒

```typescript
// 检查需要更新的文章
const articlesNeedUpdate = articles.filter(article => {
  const lastUpdate = new Date(article.updateTime);
  const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > 90; // 超过 90 天未更新
});
```

---

**文档版本**: v1.0  
**最后更新**: 2026-03-30  
**维护人**: AI Team
