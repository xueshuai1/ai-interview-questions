# 文章路由修复总结

## 问题
点击文章时提示"文章不存在"

## 根本原因
分类页面 (`src/app/knowledge/[category]/page.tsx`) 使用硬编码的示例数据 (`SAMPLE_ARTICLES`)，而不是从 API 加载实际的文章列表。

- 页面显示的文章链接：`/knowledge/ML/ml-001`
- 实际文件名：`ML-001-⭐⭐⭐-bias-variance-tradeoff.md`
- 结果：API 找不到 `ml-001` 文件，返回 404

## 修复内容

### 1. 分类页面修复 (`src/app/knowledge/[category]/page.tsx`)
- ✅ 添加 `useEffect` 和 `useState` 导入
- ✅ 从 API 动态加载文章列表：`fetch(/api/knowledge/${categorySlug})`
- ✅ 添加加载状态和错误处理
- ✅ 使用 `encodeURIComponent(article.id)` 生成正确的链接
- ✅ 从文件名中提取难度（⭐数量）
- ✅ 删除硬编码的 `SAMPLE_ARTICLES`

### 2. API 路由优化 (`src/app/api/knowledge/[category]/route.ts`)
- ✅ 优化 `getArticle` 函数的匹配逻辑
- ✅ 优化 `getAdjacentArticles` 函数的匹配逻辑
- ✅ 支持编码和未编码的 articleId
- ✅ 添加异常处理防止解码错误

## 测试验证
```bash
# ML 分类：31 篇文章 ✓
# LLM 分类：4 篇文章 ✓
# 原始 ID 匹配：成功 ✓
# 编码 ID 匹配：成功 ✓
```

## 文件变更
1. `src/app/knowledge/[category]/page.tsx` - 从静态数据改为动态 API 加载
2. `src/app/api/knowledge/[category]/route.ts` - 优化文章匹配逻辑

## 验证步骤
1. 启动开发服务器：`npm run dev`
2. 访问知识库：`http://localhost:3000/knowledge`
3. 点击任意分类（如 ML）
4. 点击任意文章
5. 验证文章正常显示
6. 验证相邻文章导航正常工作
