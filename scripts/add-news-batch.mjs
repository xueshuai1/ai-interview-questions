import { readFileSync, writeFileSync } from 'fs';

const file = 'src/data/news.ts';
let content = readFileSync(file, 'utf-8');

// Remove trailing ] as NewsItem[];
content = content.replace(/\]\s*as\s+NewsItem\[\]\s*;?\s*$/, '');

const newEntries = `  {
    id: "news-994",
    tag: "Agent",
    title: "Anthropic Code w/ Claude 2026 大会：Claude 学会\"做梦\"，Agent 任务完成率暴涨 6 倍",
    summary: "Anthropic 首届开发者大会 Code w/ Claude 2026 上发布多项重磅功能，包括 Claude Dreaming、多 Agent 协作和自动评分官，AI 任务完成率实现 6 倍增长。",
    content: \`Anthropic 的首届开发者大会 Code w/ Claude 2026 正式开幕，带来了一系列让开发者兴奋的新功能。

- **Claude Dreaming**：Agent 在任务间隙自动"做梦"——反刍记忆、自我进化，无需人类干预
- **多 Agent 兵团作战**：多个 Claude Agent 可协同工作，分工处理复杂任务
- **自动评分官（Auto Grader）**：AI 自动评估 Agent 输出质量，形成闭环优化
- **任务完成率暴涨 6 倍**：新功能组合让 Agent 在复杂场景下的成功率大幅提升
- Simon Willison 现场做了全程 Live Blog 记录

这标志着 Claude 正在从"单次对话助手"进化为"持续工作的智能体"。

**来源：** Anthropic + Simon Willison's Weblog + 36 氪
**链接：** https://www.anthropic.com/news\`,
    date: "2026-05-07 20:00",
    source: "Anthropic + Simon Willison + 36 氪",
    sourceUrl: "https://www.anthropic.com/news",
    href: "/news/news-994",
  },
  {
    id: "news-995",
    tag: "行业",
    title: "DeepSeek 首轮融资曝光：国家队领投，估值直奔 450 亿美元",
    summary: "TechCrunch 和新浪科技报道，国家集成电路产业投资基金被曝与 DeepSeek 洽谈首轮融资，估值可能达到 450 亿美元，成为中国 AI 赛道最大单笔投资之一。",
    content: \`中国 AI 赛道迎来历史性融资事件。

- 国家集成电路产业投资基金（大基金）被曝与 DeepSeek 洽谈首轮融资
- 估值可能达到 450 亿美元（约 3000 亿元人民币）
- 这是中国 AI 领域迄今最大规模的单笔融资之一
- DeepSeek 凭借开源模型和极致性价比策略在全球 AI 竞赛中异军突起
- 此前印度 GenAI 独角兽也因商业化压力转向云服务模式

**来源：** TechCrunch + 新浪科技 + 36 氪
**链接：** https://techcrunch.com/2026/05/06/deepseek-could-hit-45b-valuation-from-its-first-investment-round/\`,
    date: "2026-05-07 20:00",
    source: "TechCrunch + 新浪科技 + 36 氪",
    sourceUrl: "https://techcrunch.com/2026/05/06/deepseek-could-hit-45b-valuation-from-its-first-investment-round/",
    href: "/news/news-995",
  },
  {
    id: "news-996",
    tag: "行业",
    title: "xAI 正式并入 SpaceX，更名为 SpaceXAI，马斯克 AI 帝国成型",
    summary: "The Verge 和 TechCrunch 报道，xAI 作为独立公司被正式解散，并入 SpaceX 后更名为 SpaceXAI，马斯克宣布 xAI 将成为 SpaceX 的 AI 产品线。",
    content: \`马斯克的 AI 版图发生了重大变化。

- xAI 作为独立公司被正式解散，并入 SpaceX
- 新名称为 **SpaceXAI**（首次出现）
- 马斯克在 X 上确认："xAI 将作为独立公司被解散，它将只是 SpaceXAI"
- 此前 xAI 已与 Anthropic 达成算力合作伙伴关系
- 与此同时，xAI 正在转向"AI 卖水人"模式，提供算力租赁服务
- 估值约 2300 亿美元的 xAI 在 5 月 6 日"终结"其独立身份

**来源：** The Verge + 36 氪
**链接：** https://www.theverge.com/ai-artificial-intelligence/925469/xai-is-becoming-spacexai\`,
    date: "2026-05-07 20:00",
    source: "The Verge + 36 氪",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence/925469/xai-is-becoming-spacexai",
    href: "/news/news-996",
  },
  {
    id: "news-997",
    tag: "行业",
    title: "Musk v. Altman 庭审持续：Greg Brockman 证词揭秘马斯克离开 OpenAI 的幕后故事",
    summary: "TechCrunch 报道，OpenAI 联创 Greg Brockman 出庭作证，详细讲述了马斯克离开 OpenAI 的过程，包括他发送的不祥短信和 300 亿美元股份争议。",
    content: \`一场牵动全球 AI 界的世纪庭审正在展开。

- Greg Brockman 出庭作证，讲述马斯克离开 OpenAI 的完整经过
- 马斯克曾向 Brockman 和 Sam Altman 发送"不祥短信"
- 争议焦点：马斯克是否曾要求 OpenAI 以 300 亿美元价格回购其股份
- Helen Toner（前 OpenAI 董事）称"制造 AI 模型更像炼金术而非化学"
- Shivon Zilis 的名言："不在我的神经元里"替代"我不记得了"
- Microsoft 律师反复强调"微软不在场"成为庭审最大笑点
- 这场诉讼可能重塑整个 AI 行业的治理格局

**来源：** TechCrunch + The Verge
**链接：** https://techcrunch.com/2026/05/06/how-elon-musk-left-openai-according-to-greg-brockman/\`,
    date: "2026-05-07 20:00",
    source: "TechCrunch + The Verge",
    sourceUrl: "https://techcrunch.com/2026/05/06/how-elon-musk-left-openai-according-to-greg-brockman/",
    href: "/news/news-997",
  },
  {
    id: "news-998",
    tag: "开源项目",
    title: "OpenAI 联合五大巨头发布 MRC 超算网络协议，GPU 训练集群性能迎来飞跃",
    summary: "OpenAI 联合 AMD、Broadcom、Intel、Microsoft 和 NVIDIA 共同开发 MRC 协议，通过开放计算项目（OCP）公开发布规范。",
    content: \`AI 基础设施领域迎来重要突破。

- OpenAI 联合五大芯片和科技巨头发布 **MRC 协议**
- 全称：Multipath Reliable Connection（多路径可靠连接）
- 显著提升大规模 GPU 训练集群的网络性能和弹性
- 一级核心交换机可直接重启而不影响模型训练
- 完整规范已通过开放计算项目（OCP）公开发布
- 英伟达、AMD、英特尔、博通均从中受益
- 中国产业链中谁将受益成为热议话题

**来源：** OpenAI + The Verge + 智东西
**链接：** https://openai.com/index/mrc-supercomputer-networking/\`,
    date: "2026-05-07 20:00",
    source: "OpenAI + The Verge + 智东西",
    sourceUrl: "https://openai.com/index/mrc-supercomputer-networking/",
    href: "/news/news-998",
  },
  {
    id: "news-999",
    tag: "行业",
    title: "Simon Willison 质疑 AI 自主经营咖啡店实验伦理",
    summary: "Simon Willison 撰文批评 Andon Labs 的 AI 管理咖啡店实验——AI 向供应商发出紧急邮件、向警方提交手绘图纸申请户外座位许可。",
    content: \`一个看似有趣的 AI 实验引发了严肃的伦理讨论。

- Andon Labs 在斯德哥尔摩经营一家由 AI（Mona）管理的咖啡店
- AI 曾订购 120 个鸡蛋但店里没有炉灶
- AI 订购了 22.5 公斤罐装番茄用于鲜三明治
- 员工建立了"耻辱墙"展示 AI 的奇葩订单：6000 张餐巾纸、3000 只丁腈手套
- AI 自行向警方申请户外座位许可，附带自己生成的从未见过的街道图纸
- Simon Willison 指出：**不应在无人监督的情况下让 AI 影响真实世界**

**来源：** Simon Willison's Weblog
**链接：** https://simonwillison.net/2026/May/5/our-ai-started-a-cafe-in-stockholm/\`,
    date: "2026-05-07 20:00",
    source: "Simon Willison's Weblog",
    sourceUrl: "https://simonwillison.net/2026/May/5/our-ai-started-a-cafe-in-stockholm/",
    href: "/news/news-999",
  },
  {
    id: "news-1000",
    tag: "Agent",
    title: "Anthropic 发布 10 个金融 AI 智能体，华尔街震动",
    summary: "Anthropic 宣布推出面向金融服务的 AI Agent 套装，包含 10 个专业智能体，覆盖合规、风控、投研等金融核心场景。",
    content: \`AI 正在加速渗透金融行业。

- Anthropic 发布 **10 个金融 AI 智能体**，覆盖合规、风控、投研等核心场景
- 这是 Anthropic 企业级 AI 战略的重要一步
- 金融从业者正在切实感受到来自 AI 的威胁
- 对万得、同花顺等传统金融数据服务商构成直接挑战
- 此前 Tinder 母公司 Match Group 也因增加 AI 工具使用而放缓招聘
- PayPal 宣布"正在重新成为一家技术公司"，核心也是 AI

**来源：** Anthropic + 36 氪 + TechCrunch
**链接：** https://www.anthropic.com/news/finance-agents\`,
    date: "2026-05-07 20:00",
    source: "Anthropic + 36 氪 + TechCrunch",
    sourceUrl: "https://www.anthropic.com/news/finance-agents",
    href: "/news/news-1000",
  },
  {
    id: "news-1001",
    tag: "行业",
    title: "SAP 斥资 11.6 亿美元收购 18 个月历史的德国 AI 实验室",
    summary: "TechCrunch 报道，德国软件巨头 SAP 以 11.6 亿美元收购一家成立仅 18 个月的德国 AI 实验室，并同时宣布采用 NemoClaw AI 框架。",
    content: \`传统软件巨头正在用真金白银拥抱 AI。

- SAP 以 **11.6 亿美元**收购一家成立仅 18 个月的德国 AI 实验室
- 同时宣布采用 **NemoClaw** AI 框架
- 这显示出传统企业软件公司正在加速 AI 转型
- 欧洲 AI 创业生态正在吸引全球巨头重金布局

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/05/sap-bets-1-16b-on-18-month-old-german-ai-lab-and-says-yes-to-nemoclaw/\`,
    date: "2026-05-07 20:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/05/sap-bets-1-16b-on-18-month-old-german-ai-lab-and-says-yes-to-nemoclaw/",
    href: "/news/news-1001",
  },
  {
    id: "news-1002",
    tag: "行业",
    title: "AI 热潮推动三星市值突破 1 万亿美元大关",
    summary: "TechCrunch 报道，在 AI 芯片需求持续爆发的推动下，三星电子市值首次突破 1 万亿美元。",
    content: \`AI 热潮正在重塑全球半导体产业格局。

- 三星电子市值首次突破 **1 万亿美元**
- 主要受 AI 芯片和 HBM（高带宽内存）需求爆发推动
- 英伟达、AMD 等 AI 芯片巨头持续加大订单
- AI 算力需求正从云端向边缘扩展

**来源：** TechCrunch + 新浪财经
**链接：** https://techcrunch.com/2026/05/06/ai-boom-pushes-samsung-to-1t/\`,
    date: "2026-05-07 20:00",
    source: "TechCrunch + 新浪财经",
    sourceUrl: "https://techcrunch.com/2026/05/06/ai-boom-pushes-samsung-to-1t/",
    href: "/news/news-1002",
  },
  {
    id: "news-1003",
    tag: "政策",
    title: "Apple 同意支付 2.5 亿美元和解 Siri AI 功能延迟诉讼",
    summary: "TechCrunch 报道，苹果公司同意支付 2.5 亿美元，和解因 Siri AI 功能更新严重延迟而引发的集体诉讼。",
    content: \`Apple Intelligence 的推进速度引发了用户不满。

- Apple 同意支付 **2.5 亿美元**和解 Siri AI 功能延迟诉讼
- 原告指控 Apple 过度承诺 AI 功能但交付严重滞后
- 与此同时，Apple 计划在 iOS 27 中允许用户自选第三方 AI 模型
- 从封闭到开放，Apple 的 AI 策略正在发生根本性转变

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/06/apple-to-pay-250m-to-settle-lawsuit-over-siris-delayed-ai-features/\`,
    date: "2026-05-07 20:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/06/apple-to-pay-250m-to-settle-lawsuit-over-siris-delayed-ai-features/",
    href: "/news/news-1003",
  },
  {
    id: "news-1004",
    tag: "行业",
    title: "月之暗面完成 20 亿美元新融资，估值约 1400 亿元",
    summary: "新浪科技报道，月之暗面即将完成 20 亿美元新一轮融资，估值约 1400 亿元人民币。",
    content: \`中国大模型融资潮继续升温。

- 月之暗面（Moonshot AI）将完成 **20 亿美元**新融资
- 估值约 **1400 亿元人民币**
- 与 DeepSeek 450 亿美元融资形成呼应，中国 AI 估值体系正在重塑
- 国产大模型正在加速融资节奏
- 老股暗流涌动：谁在从中国大模型公司悄悄套现？

**来源：** 新浪科技 + 36 氪
**链接：** https://finance.sina.com.cn/tech/shenji/2026-05-07/doc-inhwzrtk7789989.shtml\`,
    date: "2026-05-07 20:00",
    source: "新浪科技 + 36 氪",
    sourceUrl: "https://finance.sina.com.cn/tech/shenji/2026-05-07/doc-inhwzrtk7789989.shtml",
    href: "/news/news-1004",
  },
  {
    id: "news-1005",
    tag: "大语言模型",
    title: "腾讯混元 Hy3 preview 上线两周 Token 调用量暴增 10 倍",
    summary: "新浪科技报道，腾讯混元 Hy3 preview 版本上线仅两周，Token 调用量增长 10 倍。",
    content: \`腾讯在 AI 大模型赛道上正在加速追赶。

- 腾讯混元 **Hy3 preview** 上线两周
- Token 调用量暴增 **10 倍**
- 显示出国内开发者/企业对腾讯大模型的强烈需求
- Token 经济红利背后，中转站生意成为隐秘的赢家

**来源：** 新浪科技
**链接：** https://finance.sina.com.cn/tech/shenji/2026-05-07/doc-inhwzrtp8521239.shtml\`,
    date: "2026-05-07 20:00",
    source: "新浪科技",
    sourceUrl: "https://finance.sina.com.cn/tech/shenji/2026-05-07/doc-inhwzrtp8521239.shtml",
    href: "/news/news-1005",
  },
  {
    id: "news-1006",
    tag: "芯片",
    title: "半导体板块史诗级暴涨：AMD 飙升 6800 亿，英伟达 218 亿投资光纤",
    summary: "36 氪和智东西报道，受 AI 算力需求持续爆发驱动，AMD 市值暴涨 6800 亿元人民币，英伟达斥资 218 亿元投资光纤基础设施。",
    content: \`AI 芯片赛道正迎来历史性行情。

- **AMD 市值暴涨 6800 亿元人民币**，中国产业链谁是受益者成热议
- **英伟达投资 218 亿元**押注光纤基础设施
- 英伟达、AMD、英特尔、博通联合发布 MRC 超算网络协议
- 台积电已将人形机器人写入财报，数据端竞争暗战升级
- ASML CEO 直言："没有人能来挑战我们的垄断地位"

**来源：** 36 氪 + 智东西 + TechCrunch
**链接：** https://36kr.com/p/3798934859062275\`,
    date: "2026-05-07 20:00",
    source: "36 氪 + 智东西 + TechCrunch",
    sourceUrl: "https://36kr.com/p/3798934859062275",
    href: "/news/news-1006",
  },
  {
    id: "news-1007",
    tag: "开源项目",
    title: "arXiv 前沿：AgentTrust 提出 AI Agent 工具使用运行时安全评估框架",
    summary: "最新 arXiv 论文提出 AgentTrust 框架，可在 AI Agent 使用外部工具时进行实时安全评估和拦截。",
    content: \`随着 AI Agent 越来越多地调用外部工具，安全性成为核心挑战。

- **AgentTrust** 框架针对 AI Agent 工具使用场景
- 提供 **运行时安全评估和拦截** 能力
- 31 页论文，含 2 张图和 15 张表
- 同一期 arXiv 还发布了 DTap 红队平台（279 页，148 张图）
- Embodied AI 隐私-效用权衡论文被 ICML 2026 接收

**来源：** arXiv
**链接：** https://arxiv.org/abs/2605.04785\`,
    date: "2026-05-07 20:00",
    source: "arXiv",
    sourceUrl: "https://arxiv.org/abs/2605.04785",
    href: "/news/news-1007",
  },
  {
    id: "news-1008",
    tag: "行业",
    title: "ElevenLabs 引入 BlackRock、Jamie Foxx、Eva Longoria 等新投资者",
    summary: "TechCrunch 报道，AI 语音合成公司 ElevenLabs 宣布引入 BlackRock 等重量级投资者。",
    content: \`AI 语音技术赛道正在吸引主流资本入场。

- **ElevenLabs** 宣布引入 BlackRock（贝莱德）等新投资者
- 好莱坞明星 **Jamie Foxx** 和 **Eva Longoria** 也加入投资行列
- 显示出 AI 语音技术正从科技圈走向主流社会
- ElevenLabs 是全球领先的 AI 语音合成平台

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/05/elevenlabs-lists-blackrock-jamie-foxx-and-eva-longoria-as-new-investors/\`,
    date: "2026-05-07 20:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/05/elevenlabs-lists-blackrock-jamie-foxx-and-eva-longoria-as-new-investors/",
    href: "/news/news-1008",
  },
] as NewsItem[];
`;

content += newEntries;
writeFileSync(file, content, 'utf-8');
console.log('✅ Added 15 news entries (news-994 ~ news-1008)');
