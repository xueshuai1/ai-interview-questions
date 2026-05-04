// 追加 12 条新闻到 news.ts
import fs from 'fs';
import path from 'path';

const filePath = path.join(import.meta.dirname, '../src/data/news.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 替换最后的 ]; 为新的条目 + ];
const newEntries = `,
{
    id: "news-783",
    tag: "开源项目",
    tagColor: "bg-purple-500/10 text-purple-300",
    title: "OpenAI 发布 Symphony：开源 AI Agent 编排规范，定义多 Agent 协作统一标准",
    summary: 'OpenAI 于 4 月 27 日发布 Symphony，一个用于 AI Agent 编排的开源规范。该规范旨在标准化多 Agent 协作的接口和协议，解决当前 AI Agent 生态中的碎片化和互操作性问题，被称为可能成为 AI Agent 领域的「HTTP 协议」。',
    content: \`## Symphony：AI Agent 编排的开放标准

**2026 年 4 月 27 日**，OpenAI 发布 Symphony，一个用于 AI Agent 编排的开源规范。

### 核心功能

- **标准化接口**：定义多 Agent 协作的统一接口和协议
- **完全开源**：任何开发者和公司都可以使用和扩展
- **目标**：解决当前 AI Agent 生态中的碎片化和互操作性问题

### 为什么重要

Symphony 的发布可能成为 AI Agent 领域的「HTTP 协议」——为多 Agent 协作提供统一标准，降低开发者的集成成本。这与 OpenAI 同时宣布与 Microsoft 进入合作新阶段、将模型和 Codex 带上 AWS 的战略方向一致。

### 与 Codex on AWS 的关系

OpenAI 同日宣布 Codex on AWS（通过 Amazon Bedrock 提供服务），以及 OpenAI 模型登陆 AWS。Symphony 编排规范为这些企业级 Agent 部署场景提供了标准化的协作框架。

**来源：** OpenAI Blog
**链接：** https://openai.com/index/open-source-codex-orchestration-symphony/\`,
    date: "2026-05-04 16:00",
    source: "OpenAI Blog",
    sourceUrl: "https://openai.com/index/open-source-codex-orchestration-symphony/",
    href: "/news/news-783",
  },
{
    id: "news-784",
    tag: "行业",
    tagColor: "bg-orange-500/10 text-orange-300",
    title: "OpenAI 模型、Codex 和 Managed Agents 全面上线 AWS：企业级 AI 部署的新选择",
    summary: 'OpenAI 与 AWS 扩展战略合作，GPT-5.5 等前沿模型正式登陆 Amazon Bedrock，Codex 编码助手可通过 AWS 企业环境使用，同时推出 Amazon Bedrock Managed Agents。企业用户现在可以在 AWS 基础设施内使用 OpenAI 全栈 AI 能力。',
    content: \`## OpenAI × AWS：企业 AI 的新范式

**2026 年 4 月 28 日**，OpenAI 宣布与 AWS 扩展战略合作。

### 三大能力同步上线

1. **OpenAI 模型 on AWS**：包括 GPT-5.5 等前沿模型，通过 Amazon Bedrock 提供服务
2. **Codex on AWS**：每周 400 万+用户使用的编码助手，现可通过 Bedrock 在企业环境内部署
3. **Amazon Bedrock Managed Agents**：由 OpenAI 驱动的托管 Agent 服务

### 企业级属性

- **安全合规**：所有数据处理通过 Amazon Bedrock，符合企业安全控制
- **身份集成**：与 AWS 现有身份系统、安全协议和工作流程无缝集成
- **成本优化**：符合条件的客户可将 Codex 使用量计入 AWS 云承诺

### 战略意义

此前 OpenAI 与 Microsoft 的合作关系占主导，此次大规模登陆 AWS 标志着 OpenAI 正在走向多云平台战略。同时，OpenAI 宣布与 Microsoft 进入「合作新阶段」，暗示双方关系正在重新定义。

**来源：** OpenAI Blog + TechCrunch
**链接：** https://openai.com/index/openai-on-aws/\`,
    date: "2026-05-04 16:00",
    source: "OpenAI + TechCrunch",
    sourceUrl: "https://openai.com/index/openai-on-aws/",
    href: "/news/news-784",
  },
{
    id: "news-785",
    tag: "AI 应用",
    tagColor: "bg-green-500/10 text-green-300",
    title: "哈佛研究：AI 在急诊室诊断中准确率超过两名人类医生",
    summary: '哈佛大学的最新研究测试了大语言模型在真实急诊场景中的表现。研究结果显示，至少有一个 AI 模型在急诊诊断的准确性上超越了两名人类医生。这是 AI 在临床医疗领域最有说服力的实证研究之一。',
    content: \`## AI vs 人类医生：急诊室的较量

**2026 年 5 月 3 日**，据 TechCrunch 报道，哈佛大学发布了一项关于大语言模型在医疗场景中表现的重要研究。

### 研究设计

- 在真实急诊室环境中测试多个 LLM 模型
- 对比 AI 诊断与两名人类医生的诊断准确性
- 涵盖多种急诊病例类型

### 核心发现

- 至少有一个 AI 模型在诊断准确率上**超过了两名人类医生**
- AI 在复杂病例中的表现尤为突出
- 研究为 AI 在临床医疗中的实际应用提供了强有力的实证支持

### 行业意义

这是 AI 医疗领域最有说服力的真实世界研究之一。随着 AI 诊断能力持续超越人类医生，医疗行业的角色分工和监管框架将面临深刻变革。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/03/in-harvard-study-ai-offered-more-accurate-diagnoses-than-emergency-room-doctors/\`,
    date: "2026-05-04 16:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/03/in-harvard-study-ai-offered-more-accurate-diagnoses-than-emergency-room-doctors/",
    href: "/news/news-785",
  },
{
    id: "news-786",
    tag: "AI 版权",
    tagColor: "bg-red-500/10 text-red-300",
    title: "奥斯卡新规：AI 生成的演员和剧本不再具备参评资格，学院保留审查权",
    summary: '美国电影艺术与科学学院发布第 99 届奥斯卡新规则，明确规定只有「由人类表演」的角色才有资格获得表演类奖项，剧本也必须「由人类创作」。学院保留要求电影提供 AI 使用情况信息的权力。这一规定回应了 AI 生成演员 Tilly Norwood 和 Val Kilmer AI 版本电影引发的争议。',
    content: \`## 奥斯卡说「不」：AI 不能拿小金人

**2026 年 5 月 2 日**，美国电影艺术与科学学院发布了第 99 届奥斯卡新规则。

### 核心规定

- **表演奖项**：只有「在电影法律演职员表中署名且由人类在其同意下真实表演」的角色才有资格
- **剧本奖项**：剧本必须「由人类创作」才有资格
- **审查权**：学院有权要求电影提供更多关于 AI 使用和「人类创作」的信息

### 背景事件

新规出台正值多个 AI 生成内容引发争议：
- **Tilly Norwood**：AI 生成的「女演员」持续引发关注，甚至发了一首歌
- **Val Kilmer AI 版电影**：独立电影计划使用 AI 生成 Val Kilmer 的版本
- **Seedance 2.0**：新一代视频生成模型引发电影人担忧

### 行业影响

这是好莱坞对 AI 生成内容最明确的规则制定。继 SAG-AFTRA 与制片厂达成包含 AI 保护条款的新协议后，奥斯卡新规进一步划定了 AI 与人类创作的边界。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/02/ai-generated-actors-and-scripts-are-now-ineligible-for-oscars/\`,
    date: "2026-05-04 16:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/02/ai-generated-actors-and-scripts-are-now-ineligible-for-oscars/",
    href: "/news/news-786",
  },
{
    id: "news-787",
    tag: "具身智能",
    tagColor: "bg-indigo-500/10 text-indigo-300",
    title: "Meta 收购人形机器人创业公司 ARI：加强具身智能 AI 布局",
    summary: 'Meta 宣布收购人形机器人初创公司 Assured Robot Intelligence（ARI），以加强其在机器人 AI 模型方面的能力。这是 Meta 在具身智能领域的重要布局，表明其人形 AI 战略正在加速推进。',
    content: \`## Meta 的人形 AI 野心

**2026 年 5 月 1 日**，据 TechCrunch 报道，Meta 完成了对人形机器人初创公司 ARI 的收购。

### ARI 是谁

Assured Robot Intelligence（ARI）是一家人形机器人领域的创业公司，专注于为机器人开发先进的 AI 模型。

### Meta 的战略意图

- **具身智能布局**：Meta 正在从纯软件 AI 扩展到物理世界的 AI 应用
- **机器人 AI 模型**：ARI 的技术将增强 Meta 在机器人感知、决策和控制方面的能力
- **长远目标**：可能服务于 Meta 的 AR/VR 硬件生态和元宇宙愿景

### 行业背景

人形机器人正在成为 AI 行业的下一个前沿领域。Figure AI、Boston Dynamics、Tesla Optimus 等公司都在这个赛道上竞争。Meta 的入局意味着这个领域正在获得顶级科技公司的关注。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/01/meta-buys-robotics-startup-to-bolster-its-humanoid-ai-ambitions/\`,
    date: "2026-05-04 16:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/01/meta-buys-robotics-startup-to-bolster-its-humanoid-ai-ambitions/",
    href: "/news/news-787",
  },
{
    id: "news-788",
    tag: "AI 军事",
    tagColor: "bg-red-500/10 text-red-300",
    title: "五角大楼与 Nvidia、Microsoft 和 AWS 签署协议：在机密网络部署 AI",
    summary: '美国国防部与 Nvidia、Microsoft 和 AWS 签署协议，在机密网络上部署 AI 能力。此举发生在国防部与 Anthropic 就 AI 模型使用条款发生争议之后，反映了 Pentagon 在 AI 供应商多元化方面的决心。',
    content: \`## 五角大楼的 AI 多供应商战略

**2026 年 5 月 1 日**，据 TechCrunch 报道，美国国防部（DoD）与三家科技巨头签署 AI 部署协议。

### 合作内容

- **Nvidia**：提供 GPU 算力和 AI 推理基础设施
- **Microsoft**：提供 Azure 云服务和 AI 工具链
- **AWS**：提供机密级云基础设施

### 背景：与 Anthropic 的争议

这些协议是在 DoD 与 Anthropic 就 AI 模型使用条款发生争议之后签署的。DoD 正在加倍推进 AI 供应商的多元化策略，避免对单一供应商的依赖。

### 行业意义

这是美国国防 AI 战略的重要里程碑。随着 AI 在军事应用中的角色日益重要，国防部需要确保拥有多个可靠的 AI 供应商，以降低供应链风险。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/01/pentagon-inks-deals-with-nvidia-microsoft-and-aws-to-deploy-ai-on-classified-networks/\`,
    date: "2026-05-04 16:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/01/pentagon-inks-deals-with-nvidia-microsoft-and-aws-to-deploy-ai-on-classified-networks/",
    href: "/news/news-788",
  },
{
    id: "news-789",
    tag: "AI 应用",
    tagColor: "bg-cyan-500/10 text-cyan-300",
    title: "AI 生成音乐涌入流媒体平台：39% 的新播客可能是 AI 生成，播客行业面临冲击",
    summary: 'Bloomberg 和 The Verge 报道，AI 生成音乐正在涌入 Spotify 等流媒体平台，同时约 39% 的新播客可能是 AI 生成的。Inception Point AI 据报道每周发布 3000 集播客，AI 音频内容正在以指数级速度增长，引发内容质量和创作者生态的深度担忧。',
    content: \`## AI 音频海啸：音乐和播客的双重冲击

**2026 年 5 月 3 日**，The Verge 和 Bloomberg 报道了 AI 音频内容对行业的冲击。

### 播客行业的数据

- **39% 的新播客可能是 AI 生成**：据 Podcast Index 数据，在过去 9 天内创建了 10,871 个新播客 feed，其中约 4,243 个可能是 AI 生成的
- **Inception Point AI**：据报道每周发布 3,000 集播客，用低质量内容充斥播客应用
- **行业反应**：平台既没有禁止也没有拥抱——处于「不知道怎么办」的灰色地带

### 音乐行业

- AI 生成音乐正在涌入 Spotify 等流媒体平台
- 「谁想要这些内容？」——流媒体平台面临内容审核难题
- 不仅是音乐，AI 也在威胁人类播客创作者

### 深层问题

AI 音频生成的低成本和大规模生产能力正在打破内容生态的平衡。当 AI 能以近乎零成本生成海量内容时，如何保护人类创作者的价值成为行业必须回答的问题。

**来源：** The Verge + Bloomberg
**链接：** https://www.theverge.com/column/921599/ai-music-is-flooding-streaming-services-but-who-wants-it\`,
    date: "2026-05-04 16:00",
    source: "The Verge + Bloomberg",
    sourceUrl: "https://www.theverge.com/column/921599/ai-music-is-flooding-streaming-services-but-who-wants-it",
    href: "/news/news-789",
  },
{
    id: "news-790",
    tag: "行业",
    tagColor: "bg-violet-500/10 text-violet-300",
    title: "Cursor 据传正被 SpaceX 以 600 亿美元收购：Replit 创始人表示宁愿不卖",
    summary: 'TechCrunch 报道，AI 编码工具 Cursor 据传正在与 SpaceX 谈判，可能以 600 亿美元被收购。Replit 创始人 Amjad Masad 在 StrictlyVC 活动上回应了这一消息，表示 Replit 宁愿不出售，继续独立发展。',
    content: \`## 编码工具收购战：Cursor vs Replit

**2026 年 5 月 1 日**，TechCrunch 在 StrictlyVC 活动上报道了 AI 编码工具领域的最新动态。

### Cursor 的 600 亿收购

- 据报道，AI 编码工具 Cursor 正在与 SpaceX 谈判收购事宜
- 估值高达 600 亿美元，是 AI 工具领域最大的收购之一
- 如果成交，将成为科技行业最具标志性的 AI 收购

### Replit 的态度

Replit 创始人 Amjad Masad 在活动中明确表示：
- **宁愿不卖**：Replit 希望保持独立发展
- **与 Apple 竞争**：Replit 正在与 Apple 的应用生态竞争中寻求突破
- **独立路线**：不跟随 Cursor 的收购路径

### 行业格局

AI 编码工具市场正在经历快速整合。从 Cursor、Replit、GitHub Copilot 到 Claude Code 和 Gemini CLI，谁能在这个赛道中胜出，将决定未来十年软件开发的基本范式。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/01/replits-amjad-masad-on-the-cursor-deal-fighting-apple-and-why-hed-rather-not-sell/\`,
    date: "2026-05-04 16:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/01/replits-amjad-masad-on-the-cursor-deal-fighting-apple-and-why-hed-rather-not-sell/",
    href: "/news/news-790",
  },
{
    id: "news-791",
    tag: "AI 法律",
    tagColor: "bg-rose-500/10 text-rose-300",
    title: "\\"This is fine\\" 漫画创作者指控 AI 初创公司 Artisan 盗用其作品",
    summary: '互联网上最知名的漫画之一 "This is fine"（火中狗）的创作者 KC Green 指控 AI 初创公司 Artisan 在广告中盗用了他的作品。Artisan 是一家因 "停止雇佣人类" 广告牌而备受争议的 AI 公司。',
    content: \`## 当 AI 广告偷走人类艺术家的作品

**2026 年 5 月 3 日**，据 TechCrunch 报道，"This is fine" 漫画创作者指控 AI 公司盗用其作品。

### 事件经过

- **"This is fine"**：互联网上最具标志性的漫画之一，描绘一只狗坐在着火的房间里说 "This is fine"
- **Artisan 公司**：一家 AI 初创公司，因 "停止雇佣人类" 广告牌引发广泛争议
- **指控**：Artisan 在其广告中使用了 "This is fine" 漫画的图像，未获授权

### 深层意义

这起事件是 AI 时代艺术家权益保护的一个缩影。随着 AI 公司越来越激进地使用互联网上已有的艺术内容进行训练和营销，创作者的版权保护成为了一个紧迫的法律和道德问题。

### 行业背景

此前 Taylor Swift 已尝试通过商标法保护声音和图像，好莱坞也通过奥斯卡新规划定 AI 与人类创作的边界。AI 与创作者之间的冲突正在多个领域同时爆发。

**来源：** TechCrunch
**链接：** https://techcrunch.com/2026/05/03/this-is-fine-creator-says-ai-startup-stole-his-art/\`,
    date: "2026-05-04 16:00",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2026/05/03/this-is-fine-creator-says-ai-startup-stole-his-art/",
    href: "/news/news-791",
  },
{
    id: "news-792",
    tag: "大语言模型",
    tagColor: "bg-blue-500/10 text-blue-300",
    title: "AI 大模型的「中文税」：为什么中文比英文更费 Token？",
    summary: '极客公园发文深度分析了 AI 大模型中的「中文税」现象——中文内容比英文需要更多 Token 来处理。文章指出，模型不是中性的，它内置了语言偏好，这对中文用户的应用成本和使用体验产生直接影响。',
    content: \`## 中文税：AI 模型的语言偏好

**2026 年 5 月 3 日**，据极客公园报道，AI 大模型中的「中文税」问题引发行业讨论。

### 什么是「中文税」

- 同样的信息量，中文比英文需要**更多 Token** 来表达
- 这意味着中文用户的 API 调用成本更高
- 模型输出的中文质量和流畅度也可能逊于英文

### 根因分析

- **训练数据比例**：主流 LLM 的训练数据中英文占比远超中文
- **分词器设计**：基于英文优化的分词器对中文效率较低
- **模型架构偏好**：模型内部的语言表征空间对英文更友好

### 行业影响

1. **成本差异**：中文用户的 Token 消耗可能比英文用户高出 30-50%
2. **质量差距**：中文输出的准确性和流畅度仍有提升空间
3. **公平性问题**：模型的「语言偏好」是否在无形中加剧了数字鸿沟？

### 解决方案方向

- 改进分词器对中文的支持
- 增加中文训练数据比例
- 开发针对中文优化的模型变体

**来源：** 极客公园（via 36 氪）
**链接：** https://36kr.com/p/3793050208984071\`,
    date: "2026-05-04 16:00",
    source: "极客公园 + 36 氪",
    sourceUrl: "https://36kr.com/p/3793050208984071",
    href: "/news/news-792",
  },
{
    id: "news-793",
    tag: "AI 行业",
    tagColor: "bg-yellow-500/10 text-yellow-300",
    title: "CTO 不香了？百亿公司高管集体转身，去 Anthropic 当工程师",
    summary: '机器之心报道，多位百亿市值公司的高管选择离开 CTO 职位，加入 Anthropic 担任工程师。这反映了 AI 行业人才流动的新趋势——谁距离一线模型更近，谁就拥有更多的权力和影响力。',
    content: \`## 从 CTO 到工程师：AI 时代的人才迁徙

**2026 年 5 月 3 日**，据机器之心报道，多位百亿公司高管选择加入 Anthropic 担任工程师。

### 现象

- **高位转身**：百亿市值公司的 CTO 级别高管，选择离开舒适区
- **加入 Anthropic**：目标公司不是传统科技巨头，而是 AI 原生公司
- **角色降级？**：从「管理数百人」到「写代码的工程师」

### 深层逻辑

> 「谁距离一线模型更近，谁就拥有更多更大的权力。」

- **AI 原生公司的吸引力**：在 Anthropic 这样的公司，工程师直接参与最前沿的 AI 模型开发
- **传统 CTO 的局限**：在传统公司，CTO 更多是管理者而非技术实践者
- **技术话语权转移**：AI 时代，技术领导力从「管理规模」转向「技术深度」

### 行业信号

这是 AI 行业人才市场的结构性变化。当最优秀的技术人员选择在 AI 原生公司做工程师而非传统公司做高管时，整个科技行业的人才格局正在重新洗牌。

**来源：** 机器之心（via 36 氪）
**链接：** https://36kr.com/p/3793138446179585\`,
    date: "2026-05-04 16:00",
    source: "机器之心 + 36 氪",
    sourceUrl: "https://36kr.com/p/3793138446179585",
    href: "/news/news-793",
  },
{
    id: "news-794",
    tag: "AI 应用",
    tagColor: "bg-emerald-500/10 text-emerald-300",
    title: "Anthropic 发布 Claude for Creative Work：面向创意工作者的专业 AI 工具",
    summary: 'Anthropic 于 4 月 28 日发布 Claude for Creative Work，专为创意工作者设计的 AI 工具。结合 Anthropic Labs 推出的 Claude Design 产品，Claude 正在从通用 AI 助手扩展到垂直专业场景。',
    content: \`## Claude 进入创意工作场景

**2026 年 4 月 28 日**，Anthropic 发布 Claude for Creative Work。

### 产品定位

Claude for Creative Work 是 Anthropic 面向创意行业推出的专业 AI 解决方案，目标用户包括：
- 设计师和视觉创作者
- 内容创作者和营销人员
- 文案策划和编剧
- 产品经理和用户体验设计师

### 与 Claude Design 的关系

Anthropic Labs 此前推出了 Claude Design——一个让用户与 Claude 协作创建 polished visual work 的产品，支持设计、原型、幻灯片、单页文档等。Claude for Creative Work 可能是这一能力的行业化扩展。

### 战略意义

Anthropic 正在从「通用 AI 助手」走向「垂直专业工具」：
- **Claude Code**：面向开发者
- **Claude Design**：面向视觉创作者
- **Claude for Creative Work**：面向整个创意行业

这与 OpenAI 将模型、Codex 和 Managed Agents 带上 AWS 的策略形成呼应——AI 巨头们正在将能力下沉到具体的行业和场景中。

**来源：** Anthropic
**链接：** https://www.anthropic.com/news/claude-for-creative-work\`,
    date: "2026-05-04 16:00",
    source: "Anthropic",
    sourceUrl: "https://www.anthropic.com/news/claude-for-creative-work",
    href: "/news/news-794",
  }
];`;

// 替换末尾的 ];
content = content.replace(/];\s*$/, newEntries);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ 已追加 12 条新闻 (news-783 ~ news-794)');
