import fs from 'fs';
import path from 'path';

const newsFile = path.resolve('src/data/news.ts');
let content = fs.readFileSync(newsFile, 'utf-8');

const newNews = [
{
  id: "news-592",
  tag: "行业",
  tagColor: "bg-red-500/10 text-red-300",
  title: "Anthropic 正洽谈 500 亿美元新融资，估值将达 9000 亿美元",
  summary: "据 TechCrunch 报道，Anthropic 正在谈判一轮高达 500 亿美元的新融资，估值可能达到 9000 亿美元。这将成为 AI 行业历史上最大规模的融资之一，反映出投资者对 Claude 平台和 Anthropic 技术路线的强烈信心。",
  content: `## Anthropic 9000 亿美元估值倒计时

**2026 年 4 月 29 日**，TechCrunch 独家报道，Anthropic 正在谈判新一轮融资，规模可能高达 **500 亿美元**，投后估值预计达到 **9000 亿美元**。

### 融资规模创行业纪录

如果达成，这将是 AI 行业历史上最大规模的单笔融资之一：

- **500 亿美元**：超过大多数科技巨头的单轮融资记录
- **9000 亿美元估值**：接近 Google 母公司 Alphabet 当前市值
- **投资者阵容**：预计包括现有投资方 Amazon、Google，以及新的战略投资者

### 为什么需要这么多资金？

Anthropic 的资本需求反映了 AI 竞赛的几个关键趋势：

1. **算力军备竞赛**：Anthropic 与 Amazon 扩展合作至 5 吉瓦新算力，与 Google 和 Broadcom 合作多吉瓦下一代算力
2. **模型研发投入**：Claude Opus 4.7 已发布，下一代 Mythos 模型在研发中
3. **全球扩张**：新开设悉尼办公室，与 NEC 合作建设日本最大 AI 工程团队

### 行业影响

9000 亿美元的估值意味着 Anthropic 正式跻身全球最具价值科技公司行列，与 OpenAI、Google DeepMind 形成三足鼎立格局。

**来源：** TechCrunch + Anthropic News
**链接：** https://techcrunch.com/2026/04/29/sources-anthropic-could-raise-a-new-50b-round-at-a-valuation-of-900b/`,
  date: "2026-04-30 20:00",
  source: "TechCrunch + Anthropic",
  sourceUrl: "https://techcrunch.com/2026/04/29/sources-anthropic-could-raise-a-new-50b-round-at-a-valuation-of-900b/",
  href: "/news/news-592",
},
{
  id: "news-593",
  tag: "开源项目",
  tagColor: "bg-green-500/10 text-green-300",
  title: "Zig 实施最严格反 LLM 政策：Bun 因 AI 禁令无法上游 4 倍性能改进",
  summary: "Simon Willison 报道，Zig 语言实施了主要开源项目中最严格的反 LLM 政策——禁止在 issue、PR 和评论中使用 LLM。Bun（被 Anthropic 收购）在分叉 Zig 中实现了 4 倍编译性能提升，但因 LLM 禁令无法上游化，引发「贡献者扑克」讨论。",
  content: `## Zig 的反 LLM 政策：开源社区的分水岭

**2026 年 4 月 30 日**，Simon Willison 详细报道了 Zig 编程语言的反 LLM 政策及其深远影响。

### 最严格的开源 AI 禁令

Zig 的 Code of Conduct 规定：
- ❌ 禁止在 issue 中使用 LLM
- ❌ 禁止在 PR 中使用 LLM
- ❌ 禁止在 bug tracker 评论中使用 LLM（包括翻译）

### Bun 的 4 倍性能改进无法上游化

Bun JavaScript 运行时（2025 年 12 月被 Anthropic 收购）在其 Zig 分叉中实现了：
- **并行语义分析**
- **多个代码生成单元**
- **LLVM 后端 4 倍编译性能提升**

但 Bun 表示「目前不计划上游化，因为 Zig 对 LLM 贡献有严格禁令」。

### 「贡献者扑克」理论

Zig 基金会社区副总裁 Loris Cro 提出「贡献者扑克」概念：开源项目赌的是**贡献者**而非**单次 PR 的内容**。LLM 辅助打破了这个模型——即使 PR 完美，审查时间也无法帮助项目培养新的可信贡献者。

### 行业意义

这是开源社区面对 AI 时代的核心困境：**效率 vs 社区建设**。如果 LLM 能写出完美代码，维护者为什么要花时间审查和讨论，而不是自己用 LLM 解决？

**来源：** Simon Willison's Weblog
**链接：** https://simonwillison.net/2026/Apr/30/zig-anti-ai/`,
  date: "2026-04-30 20:00",
  source: "Simon Willison",
  sourceUrl: "https://simonwillison.net/2026/Apr/30/zig-anti-ai/",
  href: "/news/news-593",
},
{
  id: "news-594",
  tag: "行业",
  tagColor: "bg-red-500/10 text-red-300",
  title: "微软 Copilot 付费用户突破 2000 万，确认企业 AI 工具真实落地",
  summary: "微软宣布 Copilot 付费用户超过 2000 万，并确认这些用户「真的在使用」。这是企业 AI 工具 adoption 的重要里程碑，证明 AI 辅助编程和办公已从尝鲜走向日常。同时微软 AI 业务季度增长 123%。",
  content: `## 微软 Copilot：2000 万付费用户，真的在用

**2026 年 4 月 29 日**，微软在季度财报中宣布 Copilot 付费用户突破 **2000 万**。

### 关键数据

- **2000 万+ 付费用户**：不是免费试用，是持续付费
- 「他们真的在使用」：微软强调活跃度而非仅用户数
- **AI 业务季度增长 123%**：远超市场预期
- **下一财年预期营收 867-878 亿美元**

### 为什么这个数字重要？

2000 万付费用户意味着 AI 辅助工具已经从「有趣但可选」变成了「工作中不可或缺的部分」。这包括：

- **Copilot for Microsoft 365**：Word、Excel、PowerPoint 中的 AI 辅助
- **GitHub Copilot**：编码助手
- **Azure OpenAI Service**：企业级 AI 基础设施

### 行业对比

- Anthropic：Claude 订阅用户快速增长（ChatGPT 卸载暴涨 413%）
- Google：Gemini 消费者用户突破 3.5 亿
- OpenAI：ChatGPT 仍是最多用户的 AI 产品

微软的独特优势在于**企业渠道**——通过 Office 套件直接将 AI 送到每个办公桌。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/04/29/microsoft-copilot-20m-paid-users/`,
  date: "2026-04-30 20:00",
  source: "TechCrunch",
  sourceUrl: "https://techcrunch.com/2026/04/29/microsoft-says-it-has-over-20m-paid-copilot-users-and-they-really-are-using-it/",
  href: "/news/news-594",
},
{
  id: "news-595",
  tag: "AI Agent",
  tagColor: "bg-green-500/10 text-green-300",
  title: "DeepMind 联合创始人大卫·西尔弗融资 11 亿美元，构建无需人类数据的 AI 系统",
  summary: "DeepMind 联合创始人、AlphaGo 设计者 David Silver 创办的公司刚刚完成 11 亿美元融资，目标是构建不需要人类训练数据就能学习的 AI 系统。这代表了从监督学习向自监督/强化学习范式的重大转变。",
  content: `## David Silver 的 AI 新愿景：不需要人类数据

**2026 年 4 月 27 日**，TechCrunch 报道了 David Silver 的最新创业项目。

### 11 亿美元融资

- **金额**：11 亿美元（约 80 亿人民币）
- **创始人**：David Silver，DeepMind 联合创始人，AlphaGo 首席设计师
- **目标**：构建不需要人类标注数据就能学习的 AI 系统

### 技术方向：从人类数据中解放

当前主流 LLM 的训练依赖海量人类产生的文本数据。Silver 的愿景是：

1. **自我监督学习**：AI 从环境反馈中学习，而非人类标注
2. **强化学习规模化**：将 AlphaGo/AlphaZero 的成功模式推广到通用 AI
3. **合成数据训练**：AI 生成自己的训练数据

### 行业意义

如果成功，这将解决 AI 行业的一个核心瓶颈：**高质量人类数据正在耗尽**。Silver 的方法可能开辟一条不依赖互联网文本数据的 AI 发展路径。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/04/27/deepminds-david-silver-raises-1-1b/`,
  date: "2026-04-30 20:00",
  source: "TechCrunch",
  sourceUrl: "https://techcrunch.com/2026/04/27/deepminds-david-silver-just-raised-1-1b-to-build-an-ai-that-learns-without-human-data/",
  href: "/news/news-595",
},
{
  id: "news-596",
  tag: "大语言模型",
  tagColor: "bg-blue-500/10 text-blue-300",
  title: "DeepSeek V4 与美团 LongCat 同时「破万亿」参数，中国 AI 走出独立技术路线",
  summary: "DeepSeek 发布 V4 系列（V4-Pro 和 V4-Flash 双版本），美团同时发布 LongCat 大模型，两者参数规模均突破万亿。这标志着中国 AI 企业开始铺设自己的技术轨道，不再简单跟随美国模型。DeepSeek V4 还实现成本大降和华为昇腾适配。",
  content: `## 中国 AI 万亿参数时代：DeepSeek V4 + 美团 LongCat

**2026 年 4 月 30 日**，中国 AI 行业迎来重要里程碑。

### DeepSeek V4 系列

- **V4-Pro**：高质量推理版本
- **V4-Flash**：高速推理版本
- **参数规模突破万亿**
- **成本大幅下降**
- **华为昇腾适配**：国产芯片生态完善

### 美团 LongCat

- 美团自研大模型，参数规模同样破万亿
- 聚焦本地生活和商业场景

### 行业信号

国内 AI 企业开始尝试**铺设自己的轨道**：
- 不再简单复制 GPT/Claude 架构
- 针对中国市场和算力环境优化
- 国产芯片（昇腾）适配成为核心竞争力
- 成本控制成为差异化优势

### 黄仁勋的担忧

黄仁勋曾警告 AI 行业可能出现的「灾难」——当模型变得足够好且足够便宜时，专用硬件（GPU）的价值会被稀释。DeepSeek V4 的低成本路线正在印证这一趋势。

**来源：** 36 氪 + 机器之心
**链接：** https://36kr.com/p/3789145559473152`,
  date: "2026-04-30 20:00",
  source: "36 氪 + 机器之心",
  sourceUrl: "https://36kr.com/p/3789145559473152",
  href: "/news/news-596",
},
{
  id: "news-597",
  tag: "AI Agent",
  tagColor: "bg-green-500/10 text-green-300",
  title: "图灵奖得主炮轰 AI Agent：最后全是数据库问题，不建议学计算机",
  summary: "数据库领域「祖师爷」级图灵奖得主发表惊人观点：AI Agent 最终绕不开数据库的老问题，大模型写 SQL 还远不够格。他甚至表示「可能不再建议学计算机」，引发行业广泛讨论。",
  content: `## 图灵奖得主给 AI Agent 泼冰水

**2026 年 4 月 30 日**，一位数据库领域的图灵奖得主发表了引发热议的观点。

### 核心论点

1. **Agent 最后全是数据库问题**：无论 AI Agent 多么智能，最终都要处理数据存储、查询和一致性问题
2. **大模型写 SQL 还不够格**：当前 LLM 生成的 SQL 在复杂场景下可靠性不足
3. **可能不再建议学计算机**：如果 AI 能替代大部分编程工作，传统计算机科学教育的价值需要重新评估

### 行业回应

这一观点触及了 AI Agent 行业的一个核心挑战：**Agent 的能力上限取决于它操作的基础设施**。如果底层数据库系统不支持 Agent 友好的接口，再强的模型也难以发挥。

这也呼应了 data catalog 等基础设施正在被 AI Agent 重新定义的趋势——数据目录终于派上用场了，因为 AI Agent 会读取它。

**来源：** 极客邦科技 InfoQ + 36 氪
**链接：** https://36kr.com/p/3788895533095937`,
  date: "2026-04-30 20:00",
  source: "InfoQ + 36 氪",
  sourceUrl: "https://36kr.com/p/3788895533095937",
  href: "/news/news-597",
},
{
  id: "news-598",
  tag: "行业",
  tagColor: "bg-red-500/10 text-red-300",
  title: "陶哲轩：数学进入「证明过剩」时代，只会解题没用了",
  summary: "菲尔兹奖得主陶哲轩最新判断：数学正在从「证明稀缺」进入「证明过剩」时代。数学家最有价值的工作不再是做出证明，而是验证、消化 AI 生成的「生肉证明」，并将其转化为人类真正能理解的知识。",
  content: `## 陶哲轩：证明过剩时代来临

**2026 年 4 月 30 日**，陶哲轩在 GitHub 上引发热议的判断被广泛传播。

### 核心观点

- **证明稀缺 → 证明过剩**：AI 能批量生成数学证明
- **新价值**：验证 AI 证明、理解其结构、转化为人类可读知识
- **数学家角色转变**：从「证明制造者」变成「知识策展人」

### AI 在数学中的影响

GitHub 上涌现大量「AI 生肉证明」项目——AI 生成的正确但不可读的证明。陶哲轩的观点是：

1. AI 能做出证明，但人类需要理解它
2. 理解和消化证明比生成证明更难
3. 数学教育的目标需要重新定义

### 行业意义

这不仅是数学领域的问题，也是整个 AI 行业面临的挑战：**AI 能产出内容，但人类需要判断其价值**。从代码到论文到创意内容，「生成」变得越来越便宜，「理解」和「筛选」变得越来越重要。

**来源：** 新智元 + 36 氪
**链接：** https://36kr.com/p/3788953374121224`,
  date: "2026-04-30 20:00",
  source: "新智元 + 36 氪",
  sourceUrl: "https://36kr.com/p/3788953374121224",
  href: "/news/news-598",
},
{
  id: "news-599",
  tag: "芯片",
  tagColor: "bg-amber-500/10 text-amber-300",
  title: "寒武纪首季盈利 10 亿、摩尔线程首次盈利、沐曦仍亏损：国产 GPU 三强对比",
  summary: "最新财报显示，中国 GPU 三强企业中，寒武纪首季盈利 10 亿元，摩尔线程首次实现盈利，沐曦仍在亏损。三家放在一起对比，技术差距和商业化能力已经可以量化。",
  content: `## 国产 GPU 三强：谁先跑通商业模式？

**2026 年 4 月 30 日**，三家中国 GPU 企业的最新财务数据出炉。

### 三强对比

| 公司 | 季度盈利 | 状态 |
|------|---------|------|
| **寒武纪** | 10 亿元 | 持续盈利 |
| **摩尔线程** | 首次盈利 | 刚刚转正 |
| **沐曦** | 仍亏损 | 追赶中 |

### 行业分析

- **寒武纪**：最早实现商业化，AI 芯片在数据中心和边缘计算领域广泛应用
- **摩尔线程**：通用 GPU 路线，首次盈利标志着从「研发烧钱」到「商业变现」的转折
- **沐曦**：仍在投入期，但在特定场景有技术优势

### 国际竞争

在国际层面，NVIDIA、AMD 继续主导高端 GPU 市场。但中国企业在特定场景（AI 推理、国产化替代）中的竞争力正在增强。DeepSeek V4 的昇腾适配也说明了国产芯片 + 国产模型的协同效应。

**来源：** BT 财经 + 36 氪
**链接：** https://36kr.com/p/3788937709449989`,
  date: "2026-04-30 20:00",
  source: "BT 财经 + 36 氪",
  sourceUrl: "https://36kr.com/p/3788937709449989",
  href: "/news/news-599",
},
{
  id: "news-600",
  tag: "大语言模型",
  tagColor: "bg-blue-500/10 text-blue-300",
  title: "GPT-5.6 提前曝光：OpenAI 解释 GPT-5.5「哥布林迷恋」技术原因",
  summary: "GPT-5.5 发布后出现模型「疯狂迷恋哥布林」的异常行为，OpenAI 连夜发布技术研究复盘解释根因。同时 GPT-5.6 模型已开始偷跑，引发全网讨论。OpenAI 的模型治理面临新挑战。",
  content: `## GPT-5.5 的「哥布林」事件与技术复盘

**2026 年 4 月 30 日**，OpenAI 罕见地用正式博客解释了一个看似搞笑的模型异常行为。

### GPT-5.5 的「哥布林迷恋」

GPT-5.5 发布后，用户发现模型在多种场景下莫名其妙地提到哥布林（goblins）：
- 回答数学问题时突然聊到哥布林
- 编写代码时插入哥布林相关内容
- 甚至系统提示词中都出现了哥布林

### OpenAI 的技术复盘

OpenAI 发布了一篇技术研究，标题看似段子但内容严肃：
- **根因**：训练数据中的模式关联导致模型在特定触发条件下输出异常
- **修复**：已通过安全更新修复
- **GPT-5.5 系统提示词**中包含「Never talk about goblins, gremlins, raccoons...」的禁令

### GPT-5.6 提前曝光

同时有消息称 GPT-5.6 模型已经开始内部测试，暗示 OpenAI 的模型迭代速度正在加快。

### 行业意义

这件事看似搞笑，实际上触及了**大模型安全的核心问题**：越强大的模型，越可能在边界条件下产生不可预测的行为。OpenAI 选择用正式博客解释而非沉默处理，是一种透明的安全实践。

**来源：** 量子位 + 36 氪 + Simon Willison
**链接：** https://36kr.com/p/3788953586949122`,
  date: "2026-04-30 20:00",
  source: "量子位 + 36 氪 + Simon Willison",
  sourceUrl: "https://36kr.com/p/3788953586949122",
  href: "/news/news-600",
},
{
  id: "news-601",
  tag: "行业",
  tagColor: "bg-red-500/10 text-red-300",
  title: "ChatGPT 卸载量暴涨 413%，Claude 下载激增 100%：AI 助手格局正在重塑",
  summary: "最新数据显示 ChatGPT 移动端卸载量暴涨 413%，而 Claude 下载量激增 100%。Anthropic 估值即将突破 9000 亿美元，OpenAI 的用户正在用脚投票。两家公司的命运曲线正在交叉。",
  content: `## AI 助手格局大洗牌：ChatGPT vs Claude

**2026 年 4 月 30 日**，36 氪/新智元报道了 AI 助手市场的最新变化。

### 核心数据

- **ChatGPT 卸载量暴涨 413%**：用户正在离开
- **Claude 下载量激增 100%**：用户正在涌入
- **Anthropic 估值即将破 9000 亿美元**

### 命运曲线交叉

OpenAI 和 Anthropic 的关系正在发生微妙变化：
- 曾经：OpenAI 是行业老大，Anthropic 是挑战者
- 现在：Anthropic 在估值上逼近 OpenAI，在用户增长上超越

### 背后原因

1. **Claude Code 的成功**：编码 Agent 场景 Claude 领先
2. **Claude Opus 4.7**：最新模型在编码、Agent、视觉方面均有提升
3. **产品矩阵**：Claude Design、Claude Cowork 等新产品线
4. **用户疲劳**：ChatGPT 用户对产品迭代方向不满

### 行业意义

这不是简单的「用户迁移」，而是**AI 助手市场从垄断走向竞争**的标志。多强并立的格局对消费者和行业都是好事。

**来源：** 新智元 + 36 氪
**链接：** https://36kr.com/p/3789105070873856`,
  date: "2026-04-30 20:00",
  source: "新智元 + 36 氪",
  sourceUrl: "https://36kr.com/p/3789105070873856",
  href: "/news/news-601",
},
{
  id: "news-602",
  tag: "行业",
  tagColor: "bg-red-500/10 text-red-300",
  title: "Anthropic 与 NEC 合作建设日本最大 AI 工程团队，全球化扩张加速",
  summary: "Anthropic 宣布与日本 NEC 公司合作，建设日本最大的 AI 工程团队。这是 Anthropic 亚洲扩张的重要一步，与其悉尼办公室开业、澳洲 MOU 签署形成全球布局。",
  content: `## Anthropic 全球化：日本 AI 工程团队

**2026 年 4 月 24 日**，Anthropic 宣布与 NEC 合作。

### 合作内容

- **建设日本最大 AI 工程团队**：NEC 在日本有深厚的企业客户基础
- **Claude 在日本的企业级落地**：借助 NEC 的渠道推广 Claude
- **技术本地化**：日语模型优化和日本市场定制化

### Anthropic 的全球布局

最近一个月内 Anthropic 的国际扩张动作密集：
- **4 月 27 日**：悉尼办公室开业，Theo Hourmouzis 任澳洲总经理
- **4 月 24 日**：与 NEC 合作，进入日本市场
- **3 月 31 日**：与澳大利亚政府签署 AI 安全 MOU

### 行业意义

Anthropic 正在从「美国 AI 公司」转型为「全球 AI 基础设施提供商」。这与 Google Cloud、AWS 的全球化路径一致——AI 不仅是技术产品，更是需要本地化服务的基础设施。

**来源：** Anthropic News
**链接：** https://www.anthropic.com/news/anthropic-nec`,
  date: "2026-04-30 20:00",
  source: "Anthropic",
  sourceUrl: "https://www.anthropic.com/news/anthropic-nec",
  href: "/news/news-602",
},
{
  id: "news-603",
  tag: "AI Agent",
  tagColor: "bg-green-500/10 text-green-300",
  title: "Simon Willison 发布 LLM 0.32：大规模向后兼容重构，CLI 工具持续进化",
  summary: "Simon Willison 发布 LLM Python 库和 CLI 工具的 0.32a0 版本，这是一个大规模向后兼容重构。修复了工具调用对话从 SQLite 恢复的 bug，架构改进为未来功能奠定基础。LLM 工具已成为 AI 开发者最常用的 CLI 工具之一。",
  content: `## LLM 0.32：大规模向后兼容重构

**2026 年 4 月 29 日**，Simon Willison 发布了 LLM 0.32a0。

### 核心变更

- **大规模重构**：向后兼容的架构升级
- **Bug 修复**：修复了 0.32a0 中工具调用对话无法从 SQLite 正确恢复的问题（#1426）
- **0.32a1 快速修复**：发布后一天即推出修复版本

### 关于 LLM 工具

LLM 是 Simon Willison 开发的 Python 库和 CLI 工具：
- 支持多种 LLM 提供商（OpenAI、Anthropic、本地模型等）
- SQLite 存储对话历史
- 插件系统扩展能力
- 已成为 AI 开发者的标准工具之一

### 行业意义

LLM 工具的持续进化反映了 AI 开发者工具市场的成熟。从简单的 API 封装到完整的对话管理、工具调用、插件生态——开发者需要的是**可靠的工具链**，而不仅仅是模型。

**来源：** Simon Willison's Weblog
**链接：** https://simonwillison.net/2026/Apr/29/llm/`,
  date: "2026-04-30 20:00",
  source: "Simon Willison",
  sourceUrl: "https://simonwillison.net/2026/Apr/29/llm/",
  href: "/news/news-603",
},
];

// Insert new news before the closing ];
const insertMarker = '];';
const insertPos = content.lastIndexOf(insertMarker);

if (insertPos === -1) {
  console.error('Could not find closing ];');
  process.exit(1);
}

const newsStr = newNews.map(n => `{
    id: "${n.id}",
    tag: "${n.tag}",
    tagColor: "${n.tagColor}",
    title: "${n.title}",
    summary: '${n.summary}',
    content: \` ${n.content}\`,
    date: "${n.date}",
    source: "${n.source}",
    sourceUrl: "${n.sourceUrl}",
    href: "${n.href}",
  },`).join('\n');

const newContent = content.slice(0, insertPos) + newsStr + '\n' + content.slice(insertPos);
fs.writeFileSync(newsFile, newContent, 'utf-8');
console.log(`Added ${newNews.length} news items (news-592 to news-603)`);
