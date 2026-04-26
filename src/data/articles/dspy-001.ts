// DSPy 2.x 全面指南：从 Prompt Engineering 到 Programmatic LLM 编程的范式转移

import { Article } from '../knowledge';

export const article: Article = {
  id: "dspy-001",
  title: "DSPy 2.x 全面指南：用 Python 编程替代 Prompt Engineering，让 LLM 自动优化自己的提示词",
  category: "aieng",
  tags: ["DSPy", "Stanford", "LLM 编程", "Prompt 优化", "自动化", "RAG", "Few-shot", "签名编程", "2026 前沿"],
  summary: "DSPy（DSP for You）是斯坦福大学提出的 LLM 编程框架，正在改变我们与 LLM 交互的方式。它不让你写 prompt，而是让你用 Python 签名（Signature）声明输入输出，然后自动编译（Compile）出最优的 prompt。本文从核心理念、架构原理、Python 实战到与 LangChain/LangGraph 的全面对比，带你掌握这一范式转移。",
  date: "2026-04-26",
  readTime: "45 min",
  level: "进阶",
  content: [
    {
      title: "一、为什么需要 DSPy？Prompt Engineering 的根本性缺陷",
      body: `在 2026 年的 AI 工程中，Prompt Engineering 仍然是大多数 LLM 应用的核心开发方式。但这种方法存在几个根本性缺陷：

### 1. 手动调优不可扩展
每个 prompt 都需要反复试验：改措辞、调整示例顺序、测试边界情况。当系统有 10 个以上 prompt 时，维护成本呈指数级增长。

### 2. 脆弱且难以调试
一个词的改动可能让输出质量从 90% 暴跌到 30%。当 prompt 失效时，很难定位是格式问题、示例选择问题还是模型本身的变化。

### 3. 无法自动适应模型变化
当从 GPT-4 切换到 Claude Opus，或从 OpenAI 切换到本地部署的 Llama 时，所有 prompt 需要重新调优。

### 4. 无法利用数据驱动的优化
人类写 prompt 是基于直觉，而不是基于对大量输入输出数据的统计分析。

**DSPy 的核心洞察**：与其让开发者手动写 prompt，不如让开发者声明「我想让 LLM 做什么」（Signature），然后由框架自动编译出最优的 prompt。

### Prompt Engineering vs DSPy 编程范式对比

| 维度 | Prompt Engineering | DSPy 编程范式 |
|------|-------------------|--------------|
| 开发方式 | 手写 prompt 文本 | 声明 Signature（输入→输出类型） |
| 优化方式 | 人工反复试验 | 自动编译优化 |
| 示例选择 | 人工挑选 few-shot 示例 | 自动从训练数据中选择最优示例 |
| 模型切换 | 需要重新调优 prompt | 重新编译即可 |
| 可维护性 | prompt 散落在代码各处 | 统一的模块化管理 |
| 可复现性 | 低（依赖个人经验） | 高（确定性编译流程） |

### DSPy 工作流程

\`\`\`mermaid
graph LR
    A["定义 Signature\\n输入→输出类型声明"] --> B["组装 Module/Program\\n组合多个 Signature"]
    B --> C["准备训练数据\\n输入 + 期望输出"]
    C --> D["选择 Optimizer\\nBootstrapFewShot / MIPRO / COPRO"]
    D --> E["编译 Compile\\n自动优化 prompt + 示例"]
    E --> F["部署运行\\nevaluate + iterate"]
    F -.-> C
`,
    },
    {
      title: "二、DSPy 核心概念：Signature、Module、Optimizer",
      body: `DSPy 的编程模型围绕三个核心概念构建：

### 2.1 Signature：声明式接口

Signature 是 DSPy 的核心抽象，它声明了任务的输入和输出类型，而不是具体的 prompt 文本：

\`\`\`python
import dspy

# 方式一：字符串签名（简洁）
qa_signature = dspy.Signature(
    "question -> answer",
    "回答用户的问题，基于提供的上下文"
)

# 方式二：类定义（更灵活，推荐）
class GenerateAnswer(dspy.Signature):
    """根据上下文回答问题。如果上下文不足以回答，请说明不确定性。"""
    context = dspy.InputField(desc="相关文档片段")
    question = dspy.InputField(desc="用户的问题")
    answer = dspy.OutputField(desc="简洁准确的回答")
    confidence = dspy.OutputField(desc="对回答的置信度，0-1 之间")
`,
      tip: "Signature 的关键：用清晰的自然语言描述任务目标，但不要写具体 prompt。让 Optimizer 决定如何最好地表达这个任务。"
    },
    {
      title: "三、Module 与 Program 构建",
      body: `Module 是 DSPy 中的可组合组件，类似于 PyTorch 中的 nn.Module。你可以将多个 Signature 组合成复杂的处理流程。

### 3.1 基本 Module 使用

\`\`\`python
import dspy

# 配置 LLM
llm = dspy.LM('openai/gpt-4o', api_key='your-key')
dspy.configure(lm=llm)

# 创建可调用模块
class RAGAnswer(dspy.Module):
    def __init__(self, passages_per_hop=3):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=passages_per_hop)
        self.generate = dspy.Predict(GenerateAnswer)
    
    def forward(self, question):
        # 检索相关文档
        context = self.retrieve(question).passages
        # 基于上下文生成回答
        prediction = self.generate(
            context=context,
            question=question
        )
        return prediction

# 使用
rag = RAGAnswer()
result = rag("DSPy 相比 LangChain 有什么优势？")
print(result.answer)
print(f"置信度: {result.confidence}")
`,
    },
    {
      title: "四、自动编译：DSPy 的杀手级特性",
      body: `DSPy 最强大的功能是 **自动编译（Auto-Compilation）**。你不需要手写 few-shot 示例或优化 prompt 格式——框架会基于训练数据自动完成。

### 4.1 Optimizer 类型对比

DSPy 提供多种优化器，适用于不同场景：

| Optimizer | 原理 | 适用场景 | 计算成本 | 效果提升 |
|-----------|------|---------|---------|---------|
| BootstrapFewShot | 从训练数据中自动生成 few-shot 示例 | 简单任务、快速原型 | 低 | 10-20% |
| COPRO | 优化 prompt 指令文本 | 需要精确输出格式 | 中 | 15-25% |
| MIPRO v2 | 同时优化 prompt 和示例，使用 bandit 搜索 | 复杂任务、追求极致效果 | 高 | 20-40% |
| MIPRO v2 (zero-shot) | 无需训练数据，仅优化 prompt 文本 | 没有标注数据时 | 中 | 10-20% |
| KNNFewShot | 基于 KNN 从训练数据中选择最相关示例 | 检索增强场景 | 低 | 15-25% |

### 4.2 编译实战：从 baseline 到优化

\`\`\`python
import dspy
from dspy.teleprompt import BootstrapFewShot, MIPROv2

# 1. 创建基线系统（未编译）
rag = RAGAnswer()

# 2. 评估基线性能
from dspy.evaluate import Evaluate

def validate_answer(example, pred, trace=None):
    """评估函数：判断回答是否正确"""
    # 简单匹配关键字
    keywords = set(example.answer.lower().split())
    pred_words = set(pred.answer.lower().split())
    overlap = len(keywords & pred_words) / max(len(keywords), 1)
    return overlap > 0.3

evaluator = Evaluate(
    devset=train_data[:100],
    metric=validate_answer,
    num_threads=4,
    display_progress=True,
    display_table=5
)

print(f"基线准确率: {evaluator(rag):.2%}")

# 3. 使用 BootstrapFewShot 编译
optimizer = BootstrapFewShot(
    metric=validate_answer,
    max_bootstrapped_demos=4,  # 最多生成 4 个 few-shot 示例
    max_labeled_demos=8,       # 最多使用 8 个标注示例
    max_rounds=3               # 最多迭代 3 轮
)

compiled_rag = optimizer.compile(
    student=rag,
    teacher=rag,  # 自举：用未编译版本作为 teacher
    trainset=train_data[:50]
)

print(f"编译后准确率: {evaluator(compiled_rag):.2%}")

# 4. 保存编译结果
compiled_rag.save('compiled_rag.json')
`,
      warning: "编译过程会消耗 LLM API 调用。建议在开发阶段使用较小的 trainset（10-50 条），确定流程后再用完整数据集编译。"
    },
    {
      title: "五、MIPRO v2 深度解析",
      body: `MIPRO v2（Mixed Integer Programming with PRopagation Optimization）是 DSPy 最强大的优化器，也是 2025-2026 年 Stanford 团队的主要贡献。

### 5.1 MIPRO v2 工作原理

\`\`\`mermaid
sequenceDiagram
    participant D as 开发者
    participant O as MIPROv2 Optimizer
    participant L as LLM API
    participant E as Evaluator
    
    D->>O: 提供 Module + trainset + metric
    O->>O: 采样 prompt 候选方案
    loop 每轮迭代 (bandit search)
        O->>L: 用候选 prompt 运行 trainset
        L-->>O: 获取输出
        O->>E: 评估输出质量
        E-->>O: 返回 metric 分数
        O->>O: 更新 bandit 权重
    end
    O->>O: 选择最优 prompt + 示例组合
    O-->>D: 返回编译后的 Module
`,
    },
    {
      title: "六、实战：构建智能客服系统",
      body: `让我们用一个完整的案例来展示 DSPy 的威力。假设我们要构建一个智能客服系统，需要处理意图分类、知识库检索和个性化回复三个环节。

\`\`\`python
import dspy
from typing import Literal

# ==================== 1. 定义各个组件的 Signature ====================

class IntentClassifier(dspy.Signature):
    """判断用户消息的意图类别"""
    message = dspy.InputField(desc="用户消息")
    history = dspy.InputField(desc="最近 3 条对话历史", format=lambda x: "\\n".join(x))
    intent = dspy.OutputField(desc=f"意图类别: {Literal['咨询', '投诉', '建议', '求助', '闲聊']}")
    urgency = dspy.OutputField(desc=f"紧急程度: {Literal['低', '中', '高', '紧急']}")

class KnowledgeRetriever(dspy.Signature):
    """从知识库中检索相关信息"""
    query = dspy.InputField(desc="检索查询")
    intent = dspy.InputField(desc="用户意图")
    results = dspy.OutputField(desc="最相关的 3 条知识条目，以 JSON 数组格式返回")

class ResponseGenerator(dspy.Signature):
    """生成客服回复"""
    message = dspy.InputField(desc="用户原始消息")
    intent = dspy.InputField(desc="分类的意图")
    knowledge = dspy.InputField(desc="检索到的知识")
    user_profile = dspy.InputField(desc="用户画像（会员等级、历史问题等）")
    reply = dspy.OutputField(desc="友好、专业的客服回复")
    follow_up = dspy.OutputField(desc="建议的跟进操作")

# ==================== 2. 组装完整流程 ====================

class CustomerServiceAgent(dspy.Module):
    def __init__(self):
        super().__init__()
        self.classify = dspy.Predict(IntentClassifier)
        self.retrieve = dspy.Predict(KnowledgeRetriever)
        self.generate = dspy.Predict(ResponseGenerator)
    
    def forward(self, message, history=None, user_profile=None):
        history = history or []
        user_profile = user_profile or "普通会员"
        
        # 步骤 1：意图分类
        intent_result = self.classify(
            message=message,
            history=history[-3:] if len(history) >= 3 else history
        )
        
        # 步骤 2：知识检索
        knowledge = self.retrieve(
            query=message,
            intent=intent_result.intent
        )
        
        # 步骤 3：生成回复
        reply = self.generate(
            message=message,
            intent=intent_result.intent,
            knowledge=knowledge.results,
            user_profile=user_profile
        )
        
        return dspy.Prediction(
            intent=intent_result.intent,
            urgency=intent_result.urgency,
            reply=reply.reply,
            follow_up=reply.follow_up
        )

# ==================== 3. 编译优化 ====================

# 准备训练数据
train_data = [
    dspy.Example(
        message="我的订单超过 7 天了还没到，怎么回事？",
        history=[],
        user_profile="VIP 会员",
        intent="投诉",
        urgency="高",
        reply="非常抱歉给您带来不便。我查到您的订单号 #12345 正在物流途中，预计明天送达。作为 VIP 会员，我已为您申请了延迟补偿优惠券。",
        follow_up="物流跟踪 + 补偿发放"
    ),
    dspy.Example(
        message="你们的产品有没有手机端的 App？",
        history=[],
        user_profile="普通会员",
        intent="咨询",
        urgency="低",
        reply="您好！我们已上线手机 App，支持 iOS 和 Android 系统。您可以在应用商店搜索「XXX」下载，或使用网页版享受完整功能。",
        follow_up="无"
    ),
]

def evaluate_cs(example, pred, trace=None):
    intent_match = pred.intent == example.intent
    reply_has_keywords = any(
        kw in pred.reply.lower() 
        for kw in example.reply.lower().split()
        if len(kw) > 2
    )
    return intent_match and reply_has_keywords

# 编译
agent = CustomerServiceAgent()
optimizer = BootstrapFewShot(
    metric=evaluate_cs,
    max_bootstrapped_demos=3,
    max_rounds=2
)

compiled_agent = optimizer.compile(
    student=agent,
    trainset=train_data
)

# 测试
result = compiled_agent("我想退货，衣服尺码不对")
print(f"意图: {result.intent}")
print(f"紧急度: {result.urgency}")
print(f"回复: {result.reply}")
print(f"跟进: {result.follow_up}")
`,
    },
    {
      title: "七、DSPy vs LangChain/LangGraph 全面对比",
      body: `很多开发者会问：「我已经在用 LangChain 了，为什么还要学 DSPy？」这是一个非常好的问题。让我从多个维度进行对比。

### 7.1 定位差异

| 维度 | DSPy | LangChain | LangGraph |
|------|------|-----------|-----------|
| 核心理念 | 自动优化 LLM prompt | 组合 LLM 调用的工具链 | 有状态的 Agent 图 |
| 编程范式 | 声明式（Signature） | 命令式（Chain） | 状态机图 |
| Prompt 管理 | 自动编译 | 手动编写模板 | 手动编写 |
| 学习曲线 | 中等（新概念） | 较低 | 中等 |
| 适合场景 | RAG、分类、提取 | 工具链、工作流 | 多轮 Agent 交互 |
| 模型无关性 | 极高（换模型重新编译） | 高 | 高 |
| 生态成熟度 | 发展中 | 成熟 | 成熟 |

### 7.2 何时选择 DSPy？

**选择 DSPy 的场景：**
- 你需要构建大量类似的 LLM 调用（如批量分类、提取）
- 你希望减少手动调 prompt 的时间
- 你需要频繁切换 LLM 后端
- 你有标注数据可以用来优化
- 你追求可复现、可度量的 LLM 效果

**选择 LangChain 的场景：**
- 你需要快速搭建包含多种工具的 pipeline
- 你的应用需要集成大量外部 API
- 你已经有成熟的 prompt 体系
- 你需要丰富的内置工具和社区支持

**选择 LangGraph 的场景：**
- 你需要复杂的多轮 Agent 对话
- 你需要 Agent 间的状态共享和循环
- 你的人类在循环（Human-in-the-loop）审批流程
- 你需要可视化的 Agent 流程调试

### 7.3 混合使用：最佳实践

实际上，**三者可以混合使用**：

\`\`\`python
# LangGraph 管理 Agent 流程
# LangChain 管理工具集成
# DSPy 管理核心的 LLM 调用优化

from langgraph.graph import StateGraph
import dspy
from langchain_core.tools import tool

# DSPy 编译的核心能力
rag_module = dspy.compile(RAGAnswer(), trainset=rag_data)

# LangChain 封装为工具
@tool
def smart_search(query: str) -> str:
    \"\"\"使用 DSPy 优化的 RAG 搜索\"\"\"
    return rag_module(query).answer

# LangGraph 编排 Agent 流程
graph = StateGraph(AgentState)
graph.add_node("search", smart_search)
graph.add_node("generate", llm_call)
graph.add_edge("search", "generate")
`,
    },
    {
      title: "八、DSPy 2.x 新特性（2026 年更新）",
      body: `DSPy 在 2026 年持续迭代，2.x 版本带来了多项重要改进：

### 8.1 核心新特性

| 特性 | 说明 | 价值 |
|------|------|------|
| MIPRO v2 | 新一代优化器，支持 zero-shot 优化 | 无需训练数据即可优化 |
| 多 LM 支持 | 原生支持 Anthropic Claude、Gemini、本地部署模型 | 不再绑定 OpenAI |
| 异步执行 | 支持 async/await | 高并发场景性能提升 |
| 更好的可观测性 | 内置 tracing 和调试 | 更容易理解编译过程 |
| DSPy Assert | 编译时约束验证 | 确保输出符合预期格式 |
| 模块化评估 | 可组合的 metric 系统 | 更灵活的评估体系 |

### 8.2 DSPy Assert：确保编译质量

\`\`\`python
import dspy

class SafeAnswer(dspy.Signature):
    question = dspy.InputField()
    answer = dspy.OutputField()

# 定义编译约束
@dspy.assert_output
def validate_safe_answer(output):
    \"\"\"确保回答不包含有害信息\"\"\"
    harmful_keywords = ["我不能说", "不确定", "不知道"]
    return not any(kw in output.answer for kw in harmful_keywords)

# 编译时自动验证
optimizer = BootstrapFewShot(
    metric=validate_safe_answer,
    max_bootstrapped_demos=4
)
`,
    },
    {
      title: "九、总结与学习路线",
      body: `### 9.1 为什么 DSPy 值得学？

1. **范式转移**：从「手写 prompt」到「声明式编程」，代表了 LLM 开发的未来方向
2. **斯坦福出品**：学术严谨，持续更新，论文引用量快速增长
3. **实际效果**：在多个基准测试中，DSPy 编译后的 prompt 质量超过人类工程师手写的 prompt
4. **模型无关**：换模型不需要重写 prompt，只需重新编译
5. **与现有生态兼容**：可以和 LangChain、LangGraph 混合使用

### 9.2 学习路线

\`\`\`mermaid
graph TD
    A["理解 DSPy 核心理念"] --> B["学会定义 Signature"]
    B --> C["构建简单 Module"]
    C --> D["使用 BootstrapFewShot 编译"]
    D --> E["评估和调优"]
    E --> F["掌握 MIPRO v2"]
    F --> G["构建复杂 Program"]
    G --> H["集成到生产环境"]
    H --> I["持续监控和再编译"]
`,
      tip: "建议从 DSPy 官方教程开始（https://dspy.ai），先用他们的 Colab notebook 体验基本流程，再应用到自己的项目中。",
    },
    {
      title: "十、参考资源",
      body: `- **官方文档**：https://dspy.ai
- **GitHub 仓库**：https://github.com/stanfordnlp/dspy
- **学术论文**：「DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines」（ICLR 2024）
- **斯坦福课程**：CS 224U - Natural Language Understanding
- **社区**：DSPy Discord 社区活跃，有大量教程和示例
- **对比研究**：2025-2026 年多篇论文比较 DSPy 与传统 prompt engineering 的效果，一致显示 DSPy 在结构化任务上优势明显`,
    },
  ],
};
