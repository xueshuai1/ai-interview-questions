# 🔄 ai-master.cc 流水线编排机制

> v3 — 2026-04-28 定稿。4 角色每 4 小时轮换，通过文档传递上下文。

---

## 一、执行时间表

```
:00 🔍 内容研究员（Stage1）—— 收集 + 直接更新新闻
:01 📝 PM/内容生产（Stage2）—— 写知识库 + 技术博客
:02 🛠️ 开发（Stage3）—— 开发 → 测试 → 修 bug → 再测 → 清零 → 部署
:03 🧪 QA（Stage4）—— 独立验证整体质量
:04 🔍 内容研究员（新周期）
:05 📝 PM
:06 🛠️ 开发
:07 🧪 QA
...每 4 小时一个完整周期，每天 6 轮
```

---

## 二、文档流转

```
Stage1 研究员 ──写 findings.md──→ Stage2 PM
  │ 直接更新 news.ts
  │
Stage2 PM ──写 production.md──→ Stage3 开发
  │ 只写知识库 + 博客，不处理新闻
  │
Stage3 开发 ──写 dev-log.md──→ Stage4 QA
  │ bug-hash 清零后才 push
  │
Stage4 QA ──写 qa-report.md──→ 下一轮 Stage3 读
```

### 文件清单

| 文件 | 谁写 | 谁读 | 说明 |
|------|------|------|------|
| `reports/latest-content-findings.md` | Stage1 | Stage2 | 研究员发现 + 写作建议 |
| `reports/latest-production-report.md` | Stage2 | Stage3 | PM 写了什么文章 |
| `reports/latest-dev-log.md` | Stage3 | Stage4 | 开发改了什么 |
| `reports/latest-qa-report.md` | Stage4 | Stage3（下一轮）| QA 发现的 bug |
| `reports/pipeline-status.md` | 所有阶段 | 所有阶段 | 读 24 行 = 24h 历史 |
| `reports/bug-hash-{ts}.md` | Stage3 | Stage3 | 开发自测 bug 表 |

---

## 三、各阶段职责

### 🔍 Stage1：内容研究员

**职责：** 广泛收集 AI 动态（国外+国内），直接更新新闻动态，为 PM 提供素材。

1. **同步**：git pull
2. **读 2 个文件**：pipeline-status 24 行 + news.ts 最后 20 条
3. **内容收集（⛔ 至少 10 来源，国外≥5 + 国内≥3）**：
   - 国外：GitHub Trending/Topics/API、arXiv、Simon Willison、OpenAI/Anthropic/Google AI Blog、TechCrunch、The Verge、Hacker News、MIT Tech Review
   - 国内：今日头条 AI 热门、新浪科技、凤凰网科技、36 氪、机器之心、量子位
4. **AI Topic 自生长**
5. **直接更新新闻**：clean-old-news.mjs → 选 10-15 条写入 news.ts → 校验
6. **写 findings.md** + 追加 pipeline-status
7. **提交推送** + **飞书汇报** → 结束

### 📝 Stage2：PM

**职责：** 写知识库文章 + 技术博客（新闻已由研究员处理）。

1. **同步**：git pull
2. **读 3 个文件**：findings.md + pipeline-status 24 行 + KNOWLEDGE-BASE-PLAN.md
3. **⛔ 每轮必须产出**：
   - ≥ 1 篇知识库（≥ 4000 字/7 章/2 代码块）→ 知识体系建设
   - ≥ 1 篇技术博客（≥ 5000 字/8 章/2 代码块/1 图表）→ 前沿热点
   - **不得省略、不得跳过、不得只写一种**
4. **深度校验**：validate-article-depth.mjs
5. **提交前检查**：build + tsc
6. **提交推送** + 写报告 + 飞书汇报 → 结束

### 🛠️ Stage3：开发

**职责：** 修 bug + 功能开发，自测闭环后部署。

1. **同步**：git pull
2. **读 3 个文件**：production-report + qa-report（过期→自己跑 QA）+ pipeline-status
3. **初始化 bug-hash**
4. **开发循环**：开发 → 测试 → 修 bug → 针对场景再验证 → bug-hash 清零
5. **最终检查**：build + tsc
6. **提交推送**（bug-hash 清零后才推）+ 写报告 + 飞书汇报 → 结束

### 🧪 Stage4：QA

**职责：** 独立验证整体质量。

1. **同步**：git pull
2. **读 2 个文件**：dev-log + pipeline-status
3. **脚本扫描**：qa-scan.mjs
4. **Browser 验证**：首页 → 知识库 → 工具页 → 博客页 → 交互压力 → 控制台
5. **修 bug**：P0 立即修，P1 修
6. **提交前检查**：build + tsc
7. **提交推送** + 写 qa-report + 飞书汇报 → 结束

---

## 四、设计原则

1. 每个阶段 prompt < 3.5KB，不复现之前 16KB 的 token 爆炸
2. 每个阶段只读 2-3 个文件
3. 开发自测闭环：bug-hash 清零 → 推送
4. 研究员直接更新新闻，PM 专注知识库 + 博客
5. 新闻来源广泛：国外 + 国内，覆盖全面
6. pipeline-status 读 24 行 = 24h 历史，保留 48 行 = 2 天
