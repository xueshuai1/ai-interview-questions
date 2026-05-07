import { readFileSync, writeFileSync } from 'fs';

const path = 'src/data/news.ts';
let content = readFileSync(path, 'utf-8');

// 去重保护：提取所有已存在的 ID
const existingIds = new Set(content.match(/id:\s*"(news-\d+)"/g)?.map(m => m.match(/news-\d+/)[0]) || []);
console.log(`当前已有 ${existingIds.size} 条新闻`);

// Remove trailing ] as NewsItem[];
content = content.replace(/\]\s*as\s+NewsItem\[\];\s*$/, '');

const newItems = `,
  {
    id: "news-994",
    tag: "Agent",
    title: "Anthropic Code w/ Claude 2026 大会：Claude 学会\"做梦\"，Agent 任务完成率暴涨 6 倍",
    summary: "Anthropic 首届开发者大会发布 Claude Dreaming、多 Agent 协作和自动评分官，任务完成率实现 6 倍增长。",
    content: "Anthropic 首届 Code w/ Claude 2026 开发者大会开幕。Claude Dreaming 让 Agent 在任务间隙自动\"做梦\"——反刍记忆自我进化，无需人类干预。多 Agent 兵团作战和自动评分官形成闭环优化，任务完成率暴涨 6 倍。Simon Willison 现场全程 Live Blog 记录。这标志着 Claude 正在从单次对话助手进化为持续工作的智能体。",
    date: "2026-05-07 20:00",
    source: "Anthropic + Simon Willison + 36氪",
    sourceUrl: "https://www.anthropic.com/news",
    href: "/news/news-994",
  },
  {
    id: "news-995",
    tag: "行业",
    title: "DeepSeek 首轮融资曝光：国家队领投，估值直奔 450 亿美元",
    summary: "国家大基金被曝与 DeepSeek 洽谈首轮融资，估值可能达到 450 亿美元，成为中国 AI 最大单笔融资之一。",
    content: "中国 AI 赛道迎来历史性融资事件。国家集成电路产业投资基金（大基金）被曝与 DeepSeek 洽谈首轮融资，估值可能达到 450 亿美元（约 3000 亿元人民币）。这是中国 AI 领域迄今最大规模的单笔融资之一。DeepSeek 凭借开源模型和极致性价比策略在全球 AI 竞赛中异军突起。",
    date: "2026-05-07 20:00",
    source: "TechCrunch + 新浪科技 + 36氪",
    sourceUrl: "https://techcrunch.com/2026/05/06/deepseek-could-hit-45b-valuation-from-its-first-investment-round/",
    href: "/news/news-995",
  },
  {
    id: "news-996",
    tag: "行业",
    title: "xAI 正式并入 SpaceX 更名为 SpaceXAI，马斯克 AI 帝国成型",
    summary: "xAI 作为独立公司被正式解散，并入 SpaceX 后更名为 SpaceXAI。",
    content: "马斯克的 AI 版图发生重大变化。xAI 作为独立公司被正式解散，并入 SpaceX 后更名为 SpaceXAI。此前 xAI 已与 Anthropic 达成算力合作，同时正转向算力租赁的 AI 卖水人模式。估值约 2300 亿美元的 xAI 在 5 月 6 日终结其独立身份。",
    date: "2026-05-07 20:00",
    source: "The Verge + 36氪",
    sourceUrl: "https://www.theverge.com/ai-artificial-intelligence/925469/xai-is-becoming-spacexai",
    href: "/news/news-996",
  },
  {
    id: "news-997",
    tag: "行业",
    title: "Musk v. Altman 庭审：Brockman 证词揭秘马斯克离开 OpenAI 内幕",
    summary: "Greg Brockman 出庭作证，讲述马斯克离开 OpenAI 的完整经过，包括不祥短信和 300 亿美元股份争议。",
    content: "一场牵动全球 AI 界的世纪庭审正在展开。Greg Brockman 出庭作证讲述马斯克离开 OpenAI 的完整经过。争议焦点是马斯克是否曾要求 OpenAI 以 300 亿美元回购其股份。Helen Toner 称\"制造 AI 模型更像炼金术而非化学\"。Microsoft 律师反复强调微软不在场，成庭审最大笑点。",
    date: "2026-05-07 20:00",
    source: "TechCrunch + The Verge",
    sourceUrl: "https://techcrunch.com/2026/05/06/how-elon-musk-left-openai-according-to-greg-brockman/",
    href: "/news/news-997",
  },
  {
    id: "news-998",
    tag: "开源项目",
    title: "OpenAI 联合五大巨头发布 MRC 超算网络协议",
    summary: "OpenAI 联合 AMD、Broadcom、Intel、Microsoft 和 NVIDIA 共同开发 MRC 协议，通过 OCP 公开发布规范。",
    content: "AI 基础设施领域迎来重要突破。OpenAI 联合五大芯片和科技巨头发布 MRC（Multipath Reliable Connection）协议，显著提升大规模 GPU 训练集群的网络性能和弹性。一级核心交换机可直接重启而不影响模型训练。完整规范已通过开放计算项目（OCP）公开发布。",
    date: "2026-05-07 20:00",
    source: "OpenAI + The Verge + 智东西",
    sourceUrl: "https://openai.com/index/mrc-supercomputer-networking/",
    href: "/news/news-998",
  },
  {
    id: "news-999",
    tag: "行业",
    title: "Simon Willison 质疑 AI 自主经营咖啡店实验伦理",
    summary: "AI 管理的斯德哥尔摩咖啡店出现大量荒诞采购行为，引发伦理争议。",
    content: "一个看似有趣的 AI 实验引发了严肃的伦理讨论。Andon Labs 在斯德哥尔摩经营一家由 AI（Mona）管理的咖啡店。AI 曾订购 120 个鸡蛋但店里没有炉灶，订购了 22.5 公斤罐装番茄用于鲜三明治。员工建立了耻辱墙展示 AI 的奇葩订单。AI 自行向警方申请户外座位许可。Simon Willison 指出：不应在无人监督的情况下让 AI 影响真实世界。",
    date: "2026-05-07 20:00",
    source: "Simon Willison's Weblog",
    sourceUrl: "https://simonwillison.net/2026/May/5/our-ai-started-a-cafe-in-stockholm/",
    href: "/news/news-999",
  },
  {
    id: "news-1000",
    tag: "Agent",
    title: "Anthropic 发布 10 个金融 AI 智能体，华尔街震动",
    summary: "Anthropic 推出面向金融服务的 AI Agent 套装，覆盖合规、风控、投研等核心场景。",
    content: "AI 正在加速渗透金融行业。Anthropic 发布 10 个金融 AI 智能体，覆盖合规、风控、投研等核心场景。这是 Anthropic 企业级 AI 战略的重要一步。对万得、同花顺等传统金融数据服务商构成直接挑战。PayPal 宣布正在重新成为一家技术公司，核心也是 AI。",
    date: "2026-05-07 20:00",
    source: "Anthropic + 36氪 + TechCrunch",
    sourceUrl: "https://www.anthropic.com/news/finance-agents",
    href: "/news/news-1000",
  },
  {
    id: "news-1001",
    tag: "行业",
    title: "SAP 斥资 11.6 亿美元收购 18 个月历史的德国 AI 实验室",
    summary: "SAP 以 11.6 亿美元收购一家成立仅 18 个月的德国 AI 实验室，同时采用 NemoClaw AI 框架。",
    content: "传统软件巨头正在用真金白银拥抱 AI。SAP 以 11.6 亿美元收购一家成立仅 18 个月的德国 AI 实验室，同时宣布采用 NemoClaw AI 框架。这显示出传统企业软件公司正在加速 AI 转型。欧洲 AI 创业生态正在吸引全球巨头重金布局。",
    date: "2026-05-07 20:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/05/sap-bets-1-16b-on-18-month-old-german-ai-lab-and-says-yes-to-nemoclaw/",
    href: "/news/news-1001",
  },
  {
    id: "news-1002",
    tag: "行业",
    title: "AI 热潮推动三星市值突破 1 万亿美元大关",
    summary: "三星电子市值首次突破 1 万亿美元，主要受 AI 芯片和 HBM 需求爆发推动。",
    content: "AI 热潮正在重塑全球半导体产业格局。三星电子市值首次突破 1 万亿美元。主要受 AI 芯片和 HBM（高带宽内存）需求爆发推动。英伟达、AMD 等 AI 芯片巨头持续加大订单。AI 算力需求正从云端向边缘扩展。",
    date: "2026-05-07 20:00",
    source: "TechCrunch + 新浪财经",
    sourceUrl: "https://techcrunch.com/2026/05/06/ai-boom-pushes-samsung-to-1t/",
    href: "/news/news-1002",
  },
  {
    id: "news-1003",
    tag: "政策",
    title: "Apple 同意支付 2.5 亿美元和解 Siri AI 功能延迟诉讼",
    summary: "Apple 同意支付 2.5 亿美元和解因 Siri AI 功能更新严重延迟而引发的集体诉讼。",
    content: "Apple Intelligence 的推进速度引发了用户不满。Apple 同意支付 2.5 亿美元和解 Siri AI 功能延迟诉讼。原告指控 Apple 过度承诺 AI 功能但交付严重滞后。与此同时，Apple 计划在 iOS 27 中允许用户自选第三方 AI 模型，AI 策略正在发生根本性转变。",
    date: "2026-05-07 20:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/06/apple-to-pay-250m-to-settle-lawsuit-over-siris-delayed-ai-features/",
    href: "/news/news-1003",
  },
  {
    id: "news-1004",
    tag: "行业",
    title: "月之暗面完成 20 亿美元新融资，估值约 1400 亿元",
    summary: "月之暗面即将完成 20 亿美元新一轮融资，估值约 1400 亿元人民币。",
    content: "中国大模型融资潮继续升温。月之暗面将完成 20 亿美元新融资，估值约 1400 亿元人民币。与 DeepSeek 450 亿美元融资形成呼应，中国 AI 估值体系正在重塑。老股暗流涌动：谁在从中国大模型公司悄悄套现？",
    date: "2026-05-07 20:00",
    source: "新浪科技 + 36氪",
    sourceUrl: "https://finance.sina.com.cn/tech/shenji/2026-05-07/doc-inhwzrtk7789989.shtml",
    href: "/news/news-1004",
  },
  {
    id: "news-1005",
    tag: "大语言模型",
    title: "腾讯混元 Hy3 preview 上线两周 Token 调用量暴增 10 倍",
    summary: "腾讯混元 Hy3 preview 上线仅两周，Token 调用量增长 10 倍。",
    content: "腾讯在 AI 大模型赛道上正在加速追赶。腾讯混元 Hy3 preview 上线两周，Token 调用量暴增 10 倍。显示出国内开发者对腾讯大模型的强烈需求。与此同时，中国 AI 性价比优势被业界广泛关注。",
    date: "2026-05-07 20:00",
    source: "新浪科技",
    sourceUrl: "https://finance.sina.com.cn/tech/shenji/2026-05-07/doc-inhwzrtp8521239.shtml",
    href: "/news/news-1005",
  },
  {
    id: "news-1006",
    tag: "芯片",
    title: "半导体板块史诗级暴涨：AMD 飙升 6800 亿，英伟达 218 亿投资光纤",
    summary: "受 AI 算力需求爆发驱动，AMD 市值暴涨 6800 亿元，英伟达 218 亿投资光纤大王。",
    content: "AI 芯片赛道正迎来历史性行情。AMD 市值暴涨 6800 亿元人民币，中国产业链谁是受益者成热议。英伟达投资 218 亿元押注光纤基础设施。四巨头联合发布 MRC 超算网络协议。ASML CEO 直言：没有人能来挑战我们的垄断地位。",
    date: "2026-05-07 20:00",
    source: "36氪 + 智东西 + TechCrunch",
    sourceUrl: "https://36kr.com/p/3798934859062275",
    href: "/news/news-1006",
  },
  {
    id: "news-1007",
    tag: "开源项目",
    title: "arXiv 前沿：AgentTrust 提出 AI Agent 工具使用运行时安全评估框架",
    summary: "最新 arXiv 论文提出 AgentTrust 框架，可在 AI Agent 使用外部工具时进行实时安全评估和拦截。",
    content: "随着 AI Agent 越来越多地调用外部工具，安全性成为核心挑战。AgentTrust 框架针对 AI Agent 工具使用场景，提供运行时安全评估和拦截能力。31 页论文含 2 张图和 15 张表。同一期 arXiv 还发布了 DTap 红队平台（279 页，148 张图）。",
    date: "2026-05-07 20:00",
    source: "arXiv",
    sourceUrl: "https://arxiv.org/abs/2605.04785",
    href: "/news/news-1007",
  },
  {
    id: "news-1008",
    tag: "行业",
    title: "ElevenLabs 引入 BlackRock、Jamie Foxx、Eva Longoria 等新投资者",
    summary: "AI 语音合成公司 ElevenLabs 宣布引入 BlackRock 等重量级投资者。",
    content: "AI 语音技术赛道正在吸引主流资本入场。ElevenLabs 宣布引入 BlackRock（贝莱德）等新投资者。好莱坞明星 Jamie Foxx 和 Eva Longoria 也加入投资行列。显示出 AI 语音技术正从科技圈走向主流社会。",
    date: "2026-05-07 20:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/05/elevenlabs-lists-blackrock-jamie-foxx-and-eva-longoria-as-new-investors/",
    href: "/news/news-1008",
  }
] as NewsItem[];`;

// 过滤掉已存在的 ID（去重保护）
const newItemIds = newItems.match(/id:\s*"(news-\d+)"/g)?.map(m => m.match(/news-\d+/)[0]) || [];
const filteredItems = newItemIds.filter(id => !existingIds.has(id));

if (filteredItems.length === newItemIds.length) {
  content += newItems;
  writeFileSync(path, content, 'utf-8');
  console.log(`✅ Added ${newItemIds.length} news entries`);
} else if (filteredItems.length === 0) {
  console.log('⏭️ 所有新闻 ID 已存在，跳过添加');
} else {
  // 部分重复，只添加新的
  console.log(`⚠️ ${newItemIds.length - filteredItems.length} 条重复已跳过，添加 ${filteredItems.length} 条新新闻`);
  // 这里简单处理：如果有任何重复，整批跳过，避免部分添加
  console.log('⏭️ 检测到部分重复，整批跳过（请手动处理）');
}
