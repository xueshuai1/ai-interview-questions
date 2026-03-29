# 知识库导航与学习进度系统

## 功能概述

本文档介绍知识库的上一篇/下一篇导航功能和学习进度追踪系统。

## 功能特性

### 1. 上一篇/下一篇导航

在每篇知识库文章详情页底部，显示上一篇和下一篇文章的导航卡片：

- **动态获取**：根据文章索引文件自动计算相邻文章
- **信息丰富**：显示文章标题、摘要、学习要点和预计阅读时间
- **美观设计**：使用渐变背景和悬停效果，提升用户体验
- **按分类组织**：每个分类（ML/DL/NLP 等）独立导航

### 2. 学习进度系统

#### 侧边栏进度面板

在文章详情页侧边栏显示：

- **总体进度条**：显示已完成文章占比
- **统计卡片**：
  - 已完成文章数
  - 学习连续天数
  - 剩余文章数
- **本节进度**：当前文章的阅读进度
- **标记为已读按钮**：一键标记文章完成

#### 学习进度页面

访问 `/learning-progress` 查看：

- 总体学习进度统计
- 按分类显示每篇文章的学习状态
- 快速跳转到未完成的 artikel

### 3. 数据存储

- 使用浏览器 localStorage 本地存储
- 无需后端数据库，保护用户隐私
- 数据格式：
  ```json
  {
    "ML": {
      "ml-001": {
        "completed": true,
        "completedAt": "2026-03-29",
        "progress": 1,
        "lastReadAt": "2026-03-29"
      }
    },
    "stats": {
      "totalArticles": 5,
      "completedArticles": 1,
      "learningStreak": 1,
      "lastStudyDate": "2026-03-29"
    }
  }
  ```

## 文件结构

```
ai-interview-questions/
├── content/
│   ├── ML/
│   │   └── index.json          # 机器学习分类索引
│   ├── DL/
│   │   └── index.json          # 深度学习分类索引
│   └── NLP/
│       └── index.json          # 自然语言处理分类索引
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── knowledge/
│   │   │       └── index/
│   │   │           └── route.ts  # 文章索引 API
│   │   ├── learning-progress/
│   │   │   └── page.tsx          # 学习进度页面
│   │   └── knowledge/
│   │       └── [category]/
│   │           └── [articleId]/
│   │               └── page.tsx  # 文章详情页（已集成导航和进度）
│   ├── components/
│   │   ├── ArticleNav.tsx        # 上一篇/下一篇导航组件
│   │   └── ProgressPanel.tsx     # 学习进度面板组件
│   └── lib/
│       └── learningProgress.ts   # 学习进度管理工具
```

## 添加新分类

### 步骤 1：创建分类目录

```bash
mkdir -p content/[CATEGORY]
```

### 步骤 2：创建索引文件

在 `content/[CATEGORY]/index.json` 中定义文章列表：

```json
{
  "category": "CATEGORY",
  "name": "分类名称",
  "articles": [
    {
      "id": "article-001",
      "title": "文章标题",
      "order": 1,
      "summary": "文章摘要",
      "keyPoints": ["要点 1", "要点 2", "要点 3"],
      "estimatedTime": "15 分钟"
    }
  ]
}
```

### 步骤 3：创建文章页面

为每篇文章创建对应的页面文件或动态路由。

## API 接口

### 获取相邻文章

**请求：**
```
GET /api/knowledge/index?category=ML&articleId=ml-001
```

**响应：**
```json
{
  "prev": {
    "id": "ml-001",
    "title": "什么是机器学习？",
    "summary": "机器学习的基础概念和分类",
    "keyPoints": ["监督学习", "无监督学习", "强化学习"],
    "estimatedTime": "10 分钟"
  },
  "next": {
    "id": "ml-003",
    "title": "梯度下降算法详解",
    "summary": "深入理解梯度下降及其变体",
    "keyPoints": ["批量梯度下降", "随机梯度下降", "小批量梯度下降"],
    "estimatedTime": "20 分钟"
  }
}
```

## 使用示例

### 访问文章详情页

```
http://localhost:3000/knowledge/ML/ml-001
```

- 查看文章内容
- 点击"标记为已读"按钮
- 使用上一篇/下一篇导航
- 查看侧边栏学习进度

### 访问学习进度页面

```
http://localhost:3000/learning-progress
```

- 查看总体学习进度
- 查看各分类学习状态
- 点击"继续学习"跳转到文章

## 注意事项

1. **客户端存储**：学习进度存储在浏览器 localStorage，清除浏览器数据会丢失进度
2. **连续学习天数**：基于本地日期计算，跨设备不共享
3. **文章顺序**：按 `order` 字段排序，确保唯一性
4. **文章 ID**：在分类内必须唯一

## 未来扩展

- [ ] 添加学习时长统计
- [ ] 支持导出学习进度
- [ ] 添加学习目标和提醒
- [ ] 支持多设备同步（需要后端）
- [ ] 添加学习成就系统
