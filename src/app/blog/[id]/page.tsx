import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const blogPosts = [
  {
    id: "blog-001",
    title: "2026 年 AI 领域十大趋势预测",
    summary: "从多模态大模型到 AI Agent 普及，从边缘 AI 到具身智能，盘点今年最值得关注的技术方向",
    date: "2026-04-10",
    author: "AI Master 团队",
    readTime: "10 min",
    category: "行业洞察",
    tags: ["趋势", "2026", "多模态"],
    cover: "🔮",
    content: [
      { title: "1. 多模态大模型成为标配", body: "2026 年，多模态不再是加分项而是必选项。GPT-5、Claude 4、Gemini 2.0 等主流模型全部支持文本、图像、音频、视频的跨模态理解和生成。多模态能力的普及将推动 AI 在内容创作、教育、医疗等领域的深度应用。" },
      { title: "2. AI Agent 走向企业生产环境", body: "AI Agent 从实验阶段正式进入企业生产环境。Anthropic 的 Claude Cowork、Nvidia 的 Agent Toolkit 等平台让企业能够规模化部署自主 AI 工作流。从客服到开发，从数据分析到决策支持，AI Agent 正在重塑工作方式。" },
      { title: "3. 边缘 AI 加速落地", body: "随着端侧芯片算力的提升，AI 推理越来越多地在设备端完成。Google AI Edge Eloquent 等离线 AI 应用的出现，标志着边缘 AI 从概念走向实用。隐私保护、低延迟、无网络依赖成为核心优势。" },
      { title: "4. 具身智能爆发", body: "机器人与 AI 的深度融合正在催生新一代具身智能系统。从家务机器人到工业协作机器人，从自动驾驶到无人机，物理世界中的 AI 应用正在快速扩展。" },
      { title: "5. AI 安全与治理成为焦点", body: "Anthropic Project Glasswing、OpenAI 儿童保护计划等安全框架的推出，标志着 AI 安全从学术研究走向行业共识。各国 AI 监管政策也在加速落地。" },
      { title: "6. 开源模型持续缩小差距", meta: "Meta 新一代开源模型、Mistral、Qwen 等开源项目正在快速追赶闭源模型。开源 AI 的民主化趋势不可逆转。" },
      { title: "7. AI 基础设施军备竞赛", body: "Anthropic 与 Google 签订多 GW 级 TPU 协议，Nvidia 持续扩大 GPU 产能。AI 基础设施建设进入新一轮军备竞赛。" },
      { title: "8. AI 商业化加速", body: "Anthropic 年化营收突破 300 亿美元，AI 公司 IPO 窗口正在打开。从技术竞争走向商业竞争。" },
      { title: "9. RAG 与 Fine-tuning 融合", body: "检索增强生成和模型微调不再是二选一，而是互补方案。混合架构成为企业 AI 应用的标准实践。" },
      { title: "10. AI 教育普惠化", body: "AI 学习资源越来越丰富和易获取。从在线课程到 AI 辅助编程，从知识库到交互式教程，学习 AI 的门槛持续降低。" },
    ],
  },
  {
    id: "blog-002",
    title: "GPT-5 技术报告深度解读",
    summary: "OpenAI 最新发布的 GPT-5 在多模态推理、长上下文理解和代码生成方面实现了显著突破",
    date: "2026-04-08",
    author: "AI Master 团队",
    readTime: "15 min",
    category: "论文解读",
    tags: ["GPT-5", "OpenAI", "多模态"],
    cover: "📄",
    content: [
      { title: "概述", body: "OpenAI 发布的 GPT-5 技术报告揭示了其在多模态推理、上下文理解和代码生成方面的重大进展。本文从技术架构、训练方法、性能评估三个维度进行深入解读。" },
      { title: "多模态架构升级", body: "GPT-5 采用统一的 Transformer 架构处理文本、图像、音频和视频输入。关键改进包括：跨模态注意力机制的优化、模态间信息融合的效率提升、以及统一的输出生成框架。" },
      { title: "推理能力突破", body: "在数学推理、代码生成、逻辑推理等基准测试中，GPT-5 相比 GPT-4 提升了约 40%。关键因素包括更大规模的训练数据、改进的推理链训练方法、以及更强的自我修正能力。" },
      { title: "长上下文处理", body: "GPT-5 支持 200K token 的上下文窗口，在长文档理解、多轮对话、代码库理解等场景中表现优异。采用了改进的位置编码和注意力稀疏化技术。" },
      { title: "安全与对齐", body: "GPT-5 在安全对齐方面投入了大量资源，包括改进的 RLHF 流程、对抗性测试框架、以及多层次的安全护栏。" },
    ],
  },
  {
    id: "blog-003",
    title: "AI Agent 在软件开发中的最佳实践",
    summary: "从代码审查到自动修复，从需求分析到架构设计，AI Agent 正在重塑软件开发流程",
    date: "2026-04-05",
    author: "AI Master 团队",
    readTime: "12 min",
    category: "实战经验",
    tags: ["AI Agent", "开发效率", "自动化"],
    cover: "🤖",
    content: [
      { title: "概述", body: "AI Agent 在软件开发中的应用已经从实验性工具变为生产力工具。本文总结了在实际项目中使用 AI Agent 的最佳实践和常见陷阱。" },
      { title: "代码生成与补全", body: "AI 辅助编程工具（如 GitHub Copilot、Claude Code）已经能够理解项目上下文，生成高质量的代码片段。关键在于提供清晰的上下文和约束条件。" },
      { title: "代码审查", body: "AI Agent 可以作为第一道代码审查关卡，检查代码风格、潜在 bug、安全漏洞和性能问题。但最终的审查仍然需要人类开发者的专业判断。" },
      { title: "自动修复", body: "对于常见的代码问题（如类型错误、未处理的异常、内存泄漏），AI Agent 可以自动提供修复建议甚至直接生成修复代码。" },
      { title: "架构设计辅助", body: "AI Agent 可以帮助分析系统架构、识别设计模式、评估技术选型。在系统设计初期，AI 的多方案对比能力特别有价值。" },
      { title: "最佳实践总结", body: "1) 始终审查 AI 生成的代码 2) 提供充分的项目上下文 3) 设定明确的约束和边界 4) 建立人机协作的工作流程 5) 持续评估和优化 Agent 表现。" },
    ],
  },
  {
    id: "blog-004",
    title: "RAG vs Fine-tuning：如何选择？",
    summary: "检索增强生成和微调是增强 LLM 能力的两大主流方案，本文对比它们的适用场景和优缺点",
    date: "2026-04-02",
    author: "AI Master 团队",
    readTime: "14 min",
    category: "技术对比",
    tags: ["RAG", "Fine-tuning", "LLM"],
    cover: "⚖️",
    content: [
      { title: "概述", body: "RAG（检索增强生成）和 Fine-tuning（微调）是增强大语言模型领域知识的两大主流方案。它们各有优劣，适用场景也不尽相同。" },
      { title: "RAG 方案", body: "RAG 通过外部知识库检索来增强模型回答的准确性和时效性。优势：无需重新训练模型、知识更新方便、可追溯信息来源。劣势：依赖检索质量、延迟较高、上下文窗口有限。" },
      { title: "Fine-tuning 方案", body: "Fine-tuning 通过在特定领域数据上微调模型来提升其专业表现。优势：推理速度快、风格一致性好、适合特定任务优化。劣势：训练成本高、知识更新需要重新微调、可能遗忘通用能力。" },
      { title: "如何选择", body: "如果知识频繁更新、需要信息可追溯、预算有限 → 选择 RAG。如果需要极致性能、风格统一、处理特定任务 → 选择 Fine-tuning。最佳实践：混合使用 RAG + Light Fine-tuning。" },
    ],
  },
  {
    id: "blog-005",
    title: "从 0 到 1：用 LangChain 构建你的第一个 AI 应用",
    summary: "手把手教你使用 LangChain 框架搭建一个完整的 RAG 应用，包含文档加载、向量存储和问答接口",
    date: "2026-03-28",
    author: "AI Master 团队",
    readTime: "20 min",
    category: "实战教程",
    tags: ["LangChain", "RAG", "实战"],
    cover: "🛠️",
    content: [
      { title: "概述", body: "LangChain 是最流行的 AI 应用开发框架之一。本文将带你从零开始搭建一个基于 RAG 架构的文档问答系统。" },
      { title: "环境准备", body: "安装必要的依赖：langchain、openai/chromadb 等。设置 API key 和基本的配置。推荐使用虚拟环境管理依赖。" },
      { title: "文档加载与分割", body: "使用 LangChain 的 Document Loaders 加载 PDF/网页/文本文件，然后通过文本分割器（RecursiveCharacterTextSplitter）将文档切分为合适的 chunk。" },
      { title: "向量存储", body: "将文档 chunk 通过 Embedding 模型转换为向量，存储到向量数据库（如 Chroma、Pinecone）中。这是 RAG 的核心基础设施。" },
      { title: "检索与生成", body: "当用户提问时，先将问题转换为向量，在向量数据库中检索最相关的文档 chunk，然后连同问题一起发送给 LLM 生成回答。" },
      { title: "部署与优化", body: "使用 FastAPI 或 Streamlit 快速部署为 Web 应用。优化方向包括：改进检索策略、增加对话历史、添加引用来源等。" },
    ],
  },
  {
    id: "blog-006",
    title: "AI 安全与伦理：不可忽视的议题",
    summary: "随着 AI 能力的飞速提升，安全性、偏见、隐私保护等伦理问题变得越来越重要",
    date: "2026-03-25",
    author: "AI Master 团队",
    readTime: "10 min",
    category: "行业洞察",
    tags: ["安全", "伦理", "治理"],
    cover: "🛡️",
    content: [
      { title: "概述", body: "AI 技术的快速发展带来了前所未有的安全和伦理挑战。从深度伪造到算法偏见，从隐私泄露到自主武器，AI 安全问题已经上升到全球治理层面。" },
      { title: "当前主要挑战", body: "1) 生成式 AI 的滥用（深度伪造、虚假信息）2) 算法偏见与歧视 3) 隐私保护与数据滥用 4) AI 自主性与可控性 5) 就业影响与社会公平。" },
      { title: "行业应对措施", body: "Anthropic 的 Constitution AI、OpenAI 的安全团队、Google 的 AI Principles 等。行业正在从自发治理走向协作治理。" },
      { title: "监管动态", body: "欧盟 AI Act、中国生成式 AI 管理办法、美国行政令等监管框架正在快速成型。合规将成为 AI 企业的必修课。" },
      { title: "开发者责任", body: "作为 AI 开发者，我们需要：1) 在设计和开发中嵌入安全考量 2) 进行偏见测试和公平性评估 3) 保持透明度和可解释性 4) 关注用户的真实需求而非仅追求技术指标。" },
    ],
  },
  {
    id: "blog-007",
    title: "MoE 混合专家架构详解：从原理到实践",
    summary: "深入解析 Mixture of Experts 架构如何通过稀疏激活实现模型规模与推理效率的双赢，附 PyTorch 实战代码",
    date: "2026-04-12",
    author: "AI Master 团队",
    readTime: "18 min",
    category: "论文解读",
    tags: ["MoE", "稀疏激活", "架构设计"],
    cover: "🧬",
    content: [
      { title: "1. MoE 的核心思想：稀疏激活打破参数瓶颈", body: "传统稠密模型的每个 token 都需要激活全部参数，导致推理成本随模型规模线性增长。MoE（Mixture of Experts）的核心突破在于：将模型参数划分为多个独立的专家网络（Expert），每个 token 只激活其中少数专家（通常 1-2 个）。这意味着模型总参数量可以极大（万亿级），但每次前向传播的活跃参数量保持不变。Google 的 Switch Transformer 和 Mixtral 8x7B 都采用了这一架构。关键公式：Output = Σ g_i(x) * E_i(x)，其中 g_i(x) 是门控权重，E_i(x) 是第 i 个专家的输出。通过 top-k 路由机制，只有得分最高的 k 个专家被激活，实现了参数规模与计算量的解耦。" },
      { title: "2. 门控路由机制：专家选择的核心", body: "MoE 的性能高度依赖于路由（Routing）策略。最常见的路由方式是 Top-K Gating：首先通过一个可学习的门控网络计算每个专家的得分，然后选择得分最高的 K 个专家。但简单 Top-K 路由存在负载不均衡问题——某些专家可能被过度使用，而其他专家形同虚设。解决方案包括：Auxiliary Loss（辅助损失函数）强制负载均衡、Noise 注入增加路由的探索性、以及 Dropless Token Choice 确保每个专家都能被充分训练。DeepSeek-V3 和 Qwen2.5-MoE 在此基础上进一步优化了路由的效率和稳定性。" },
      { title: "3. 训练 MoE 的关键挑战", body: "MoE 训练面临三大核心挑战：第一，通信开销。分布式训练中，token 需要在不同 GPU 间路由到对应专家，All-to-All 通信成为瓶颈。解决方案包括专家并行（Expert Parallelism）和分层路由。第二，训练不稳定性。路由权重的突变可能导致梯度爆炸，需要通过辅助损失和梯度裁剪来稳定。第三，收敛速度。MoE 通常比稠密模型需要更多训练步数才能收敛，因为每个专家只能接触到部分数据分布。实践中建议使用 warmup 阶段逐步增加路由的确定性（从 soft routing 过渡到 hard routing）。" },
      { title: "4. MoE vs 稠密模型：性能与效率对比", body: "MoE 架构在同等活跃参数下，可以用更少的 FLOPs 达到与稠密模型相当甚至更好的性能。Mixtral 8x7B（467 亿总参数，129 亿活跃参数）在多数基准上超越了 LLaMA 2 70B（700 亿稠密参数），推理速度快 4-6 倍。但 MoE 也有明显劣势：显存占用随总参数线性增长（所有专家都需要加载到显存），对硬件内存带宽要求更高；部署时需要专门的推理引擎支持稀疏激活；在小 batch size 下可能因负载不均衡导致性能抖动。" },
      { title: "5. PyTorch 实战：从零实现 Mini MoE", body: "我们用 PyTorch 实现一个简化版的 MoE 层，包含 4 个专家、Top-2 路由和辅助负载均衡损失。每个专家是一个简单的 Feed-Forward Network，门控网络计算路由权重。关键实现细节：使用 torch.topk 选择 top-k 专家，通过 einsum 实现加权组合，添加 auxiliary loss 防止专家退化。这个实现可以直接替换 Transformer 中的 FFN 层。" },
      { title: "6. MoE 的未来方向", body: "MoE 架构仍在快速演进中。几个重要方向包括：更精细的路由策略（如基于 token 类型和难度的自适应路由）、动态专家数量（训练过程中自动增减专家）、跨模态 MoE（不同模态使用不同专家子集）、以及 MoE 与量化/蒸馏的结合。随着推理引擎的优化，MoE 有望成为大模型的主流架构范式。" },
    ],
  },
  {
    id: "blog-008",
    title: "Speculative Decoding：LLM 推理加速新范式",
    summary: "用小模型草稿 + 大模型验证的策略，实现 LLM 推理 2-3 倍加速，深入理解其原理与实现细节",
    date: "2026-04-11",
    author: "AI Master 团队",
    readTime: "16 min",
    category: "技术对比",
    tags: ["推理加速", "投机解码", "LLM优化"],
    cover: "⚡",
    content: [
      { title: "1. 为什么 LLM 推理这么慢？", body: "LLM 的自回归生成特性决定了它必须逐个 token 生成：每生成一个 token 都需要一次完整的前向传播。这意味着生成 1000 个 token 需要 1000 次前向传播，而每次前向传播中，KV Cache 的读取是内存带宽受限的（Memory-Bound），GPU 算力远未饱和。以 LLaMA-70B 为例，在 A100 上生成速度大约只有 20-30 token/s，远低于 GPU 的理论算力上限。这就是 speculative decoding 要解决的根本问题：如何让每次前向传播产出更多 token。" },
      { title: "2. Speculative Decoding 的核心原理", body: "Speculative Decoding 的思路非常巧妙：用一个小的草稿模型（Draft Model，如 LLaMA-7B）快速生成 K 个候选 token，然后用大模型（Target Model，如 LLaMA-70B）一次性验证这 K 个 token。验证过程只需一次前向传播——大模型并行计算这 K 个位置的概率分布，然后通过拒绝采样（Rejection Sampling）决定接受哪些 token。如果草稿模型猜对了，就省下了 K-1 次大模型的前向传播；如果猜错了，从拒绝位置重新生成。关键是：即使接受率只有 50-70%，整体加速比也能达到 2-3 倍。" },
      { title: "3. 理论加速比分析", body: "设草稿模型的接受率为 γ（每个 token 被大模型接受的概率），每次验证 K 个 token。理想情况下，每次验证能接受的 token 数为 (1 - γ^(K+1)) / (1 - γ) - 1。当 γ = 0.6, K = 4 时，平均每次验证接受约 2.1 个 token，加速比约为 2.1 倍。接受率 γ 取决于草稿模型与大模型的能力差距：两者越接近，γ 越高，加速效果越好。实际中，7B 草稿模型配 70B 目标模型的 γ 约在 0.5-0.7 之间。" },
      { title: "4. 实现细节与工程优化", body: "工程实现中有几个关键优化点：第一，Draft 模型可以是同一模型的不同层（Early Exit），无需额外加载模型，节省显存。第二，自适应 K 值：根据当前接受率动态调整每次验证的 token 数量，避免在低接受率时浪费计算。第三，Batch Speculative Decoding：在批量推理场景下，不同序列可能有不同的接受率，需要对齐到最短序列的接受长度。vLLM 和 TensorRT-LLM 都已内置 speculative decoding 支持，生产环境可直接使用。" },
      { title: "5. 与其他加速方法的对比", body: "Speculative Decoding 与其他推理加速方法的对比：量化（Quantization）通过降低精度减少计算量和显存占用，加速 1.5-3 倍，但可能轻微损失质量；KV Cache 优化通过 PagedAttention 减少显存碎片，提升吞吐量但不降低延迟；投机解码通过验证机制实现无损加速，且可以与量化叠加使用（量化后的模型同样可以做 speculative decoding）。最佳实践：量化 + Speculative Decoding 组合使用，在保持质量的同时实现 3-5 倍加速。" },
      { title: "6. Python 实现示例", body: "下面用一个简化的 Python 实现展示 speculative decoding 的核心逻辑。我们模拟一个草稿模型和目标模型，展示拒绝采样过程。实际部署时，这两个模型都是真实的 LLM，使用 vLLM 等推理引擎执行。" },
    ],
  },
  {
    id: "blog-009",
    title: "DPO vs RLHF：大模型对齐方法全面对比",
    summary: "从 PPO-RLHF 到 Direct Preference Optimization，对比两大对齐范式的技术原理、优劣势与选型指南",
    date: "2026-04-10",
    author: "AI Master 团队",
    readTime: "15 min",
    category: "技术对比",
    tags: ["DPO", "RLHF", "模型对齐"],
    cover: "🎯",
    content: [
      { title: "1. 为什么需要对齐（Alignment）？", body: "预训练的大语言模型虽然能生成流畅的文本，但往往会输出有害、偏见或无用的内容。对齐的目标是让模型的输出符合人类价值观和偏好。传统的对齐方法是 RLHF（Reinforcement Learning from Human Feedback）：先训练一个奖励模型（Reward Model），然后用强化学习（通常是 PPO）优化语言模型以最大化奖励。RLHF 效果显著，但实现复杂、训练不稳定、计算开销大。2023 年提出的 DPO（Direct Preference Optimization）绕过了奖励模型和强化学习，直接从人类偏好数据中优化模型，大幅简化了对齐流程。" },
      { title: "2. RLHF 的完整流程与痛点", body: "RLHF 包含三个阶段：第一阶段，收集人类对模型输出的偏好数据（A 比 B 好）；第二阶段，训练一个奖励模型来预测人类偏好；第三阶段，用 PPO 算法优化语言模型，使其输出的奖励值最大化，同时用 KL 散度约束防止偏离参考模型太远。痛点在于：需要训练和维护三个模型（语言模型、奖励模型、价值模型），内存开销巨大；PPO 训练极不稳定，超参数敏感；奖励模型可能存在奖励黑客（Reward Hacking）问题，模型学会钻奖励函数的漏洞。" },
      { title: "3. DPO 的数学原理", body: "DPO 的核心洞察是：RLHF 的最优策略可以解析地表达为 π*(y|x) ∝ π_ref(y|x) * exp(r(x,y)/β)。这意味着我们不需要显式地训练奖励模型和运行 PPO，而是可以直接用偏好数据优化语言模型。DPO 的损失函数为：L_DPO = -log σ(β log(π_θ(y_w|x)/π_ref(y_w|x)) - β log(π_θ(y_l|x)/π_ref(y_l|x)))，其中 y_w 是偏好的回答，y_l 是拒绝的回答。这个损失函数只涉及语言模型和参考模型的前向传播，无需奖励模型，无需强化学习，实现简洁且训练稳定。" },
      { title: "4. DPO vs RLHF 全方位对比", body: "实现复杂度：DPO 只需训练一个模型，RLHF 需要三个模型。训练稳定性：DPO 是监督式训练，非常稳定；RLHF 的 PPO 阶段容易崩溃。计算效率：DPO 训练速度快 2-3 倍，显存占用减少一半。效果对比：在多数 benchmark 上 DPO 与 RLHF 相当，某些场景（如创意写作）RLHF 略优，但 DPO 在对话质量上往往更好。数据需求：两者都需要高质量的人类偏好数据，但 DPO 对数据质量更敏感。可复现性：DPO 更容易复现，超参数更少。" },
      { title: "5. DPO 的局限性与改进方向", body: "DPO 虽然简洁，但也有局限：第一，它假设偏好数据是成对的（y_w, y_l），但在实际中可能只有单个标注或排序数据。第二，DPO 对参考模型的依赖较强，如果参考模型质量差，对齐效果受限。第三，DPO 只能优化已知偏好，难以处理分布外的输入。改进方向包括：IPO（Identity Preference Optimization）通过调整损失函数的形状提升稳定性；KTO（Kahneman-Tversky Optimization）支持非配对偏好数据；ORPO（Odds Ratio Preference Optimization）将偏好优化与 SFT 合并为一个阶段，进一步简化流程。" },
      { title: "6. 实战建议：如何选择对齐方案", body: "如果你的目标是快速获得可用的对齐模型，且有有限算力 → 选择 DPO。如果你追求极致质量且不介意工程复杂度 → 选择 RLHF。如果你有大量非配对偏好数据 → 选择 KTO。如果你想一步到位（SFT + 对齐合并）→ 选择 ORPO。实际生产中，Zephyr-7B 使用 DPO 取得了与 RLHF 相当的效果，Llama 3 使用 ORPO 简化了对齐流程。对于大多数团队，DPO 是性价比最高的选择。" },
    ],
  },
];

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const post = blogPosts.find((p) => p.id === params.id);

  if (!post) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold mb-2">文章不存在</h1>
          <p className="text-slate-400 mb-6">该文章可能已被删除或链接有误</p>
          <Link href="/blog" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium transition-all">
            返回博客列表
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/blog" />

      {/* Article Header */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">首页</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">博客</Link>
            <span>/</span>
            <span className="text-slate-400 truncate">{post.title}</span>
          </div>

          {/* Cover */}
          <div className="text-center mb-6">
            <span className="text-6xl">{post.cover}</span>
          </div>

          {/* Category badge */}
          <div className="flex items-center gap-3 mb-4 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-center">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-white/5">
            <span>✍️ {post.author}</span>
            <span>📅 {post.date}</span>
            <span>📖 {post.readTime} 阅读</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Summary block */}
          <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20 mb-12">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-brand-300 mb-2">文章摘要</h3>
                <p className="text-slate-300 leading-relaxed">{post.summary}</p>
              </div>
            </div>
          </div>

          {/* Content sections */}
          {post.content.map((section, i) => (
            <div key={i} className="mb-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                {section.body}
              </p>
            </div>
          ))}

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">标签</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm text-slate-300 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">📚 相关文章推荐</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {blogPosts
              .filter((p) => p.id !== post.id && p.category === post.category)
              .slice(0, 2)
              .map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.id}`}
                  className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
                >
                  <div className="text-2xl mb-2">{rel.cover}</div>
                  <span className="inline-block px-2 py-0.5 bg-brand-500/10 text-brand-300 rounded-full text-xs font-medium mb-2">
                    {rel.category}
                  </span>
                  <h3 className="text-base font-semibold group-hover:text-brand-300 transition-colors leading-snug line-clamp-2 mb-2">
                    {rel.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{rel.summary}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 border border-brand-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              继续探索更多 AI 内容
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              浏览更多博客文章，或者深入学习 AI 核心知识
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/blog" className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5">
                📝 浏览更多博客
              </Link>
              <Link href="/knowledge" className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:-translate-y-0.5">
                📚 探索知识库
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
