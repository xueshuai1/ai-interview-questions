"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface RoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  icon: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  steps: { title: string; desc: string; tags: string[] }[];
}

interface RouteDef {
  id: string;
  name: string;
  emoji: string;
  duration: string;
  description: string;
  target: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  phases: RoadmapPhase[];
}

const stepLink = (tag: string) => `/knowledge?search=${encodeURIComponent(tag)}`;

// ==================== 路线定义 ====================

// 🚀 速成路线
const fastRoute: RouteDef = {
  id: "fast",
  name: "速成路线",
  emoji: "🚀",
  duration: "2-4 周",
  description: "先学会用，再补基础 — 适合想快速上手 AI 应用的开发者",
  target: "适合有编程基础，想快速使用 AI 工具提高工作效率的人",
  color: "from-cyan-500/20 to-blue-500/20",
  borderColor: "border-cyan-500/30",
  badgeColor: "bg-cyan-500/10 text-cyan-300",
  phases: [
    {
      phase: 1,
      title: "认识 AI",
      duration: "30 分钟",
      icon: "🌍",
      color: "from-white/10 to-slate-500/10",
      borderColor: "border-white/20",
      badgeColor: "bg-white/10 text-white",
      steps: [
        { title: "AI 是什么？", desc: "从概念到实践的全景导览", tags: ["AI 入门"] },
        { title: "2026 年 AI 能做什么", desc: "编程、创作、研究、工作流的真实案例", tags: ["应用场景"] },
      ],
    },
    {
      phase: 2,
      title: "Prompt Engineering",
      duration: "1-2 天",
      icon: "✏️",
      color: "from-cyan-500/20 to-teal-500/20",
      borderColor: "border-cyan-500/30",
      badgeColor: "bg-cyan-500/10 text-cyan-300",
      steps: [
        { title: "认识提示词", desc: "理解什么是 Prompt，为什么好的提示词能显著提升 AI 输出", tags: ["Prompt"] },
        { title: "结构化提示词", desc: "角色设定 + 任务描述 + 输出格式 + 约束条件的四段式写法", tags: ["结构化"] },
        { title: "进阶技巧", desc: "CoT 思维链、Few-shot 示例、ReAct 推理-行动模式", tags: ["CoT", "Few-shot"] },
      ],
    },
    {
      phase: 3,
      title: "大语言模型应用",
      duration: "3-5 天",
      icon: "🤖",
      color: "from-blue-500/20 to-indigo-500/20",
      borderColor: "border-blue-500/30",
      badgeColor: "bg-blue-500/10 text-blue-300",
      steps: [
        { title: "LLM 原理入门", desc: "Transformer 架构、Token 机制、上下文窗口", tags: ["Transformer"] },
        { title: "API 调用实战", desc: "用 OpenAI/Anthropic API 完成第一个 AI 应用", tags: ["API"] },
        { title: "RAG 系统搭建", desc: "向量数据库 + 检索 + 生成，构建基于私有知识的问答系统", tags: ["RAG"] },
      ],
    },
    {
      phase: 4,
      title: "AI Agent 实战",
      duration: "1 周",
      icon: "🦾",
      color: "from-purple-500/20 to-violet-500/20",
      borderColor: "border-purple-500/30",
      badgeColor: "bg-purple-500/10 text-purple-300",
      steps: [
        { title: "Agent 基础组件", desc: "感知、规划、记忆、工具调用四大核心组件", tags: ["Agent"] },
        { title: "工具调用实战", desc: "Function Calling、MCP 协议", tags: ["MCP"] },
        { title: "Multi-Agent 协作", desc: "多角色 Agent 分工协作", tags: ["Multi-Agent"] },
      ],
    },
  ],
};

// 📚 基础路线
const foundationRoute: RouteDef = {
  id: "foundation",
  name: "基础路线",
  emoji: "📚",
  duration: "6-12 月",
  description: "循序渐进，系统学习 — 适合想深入理解 AI 原理的学习者",
  target: "适合零基础或转行学习 AI，想建立完整知识体系的人",
  color: "from-emerald-500/20 to-teal-500/20",
  borderColor: "border-emerald-500/30",
  badgeColor: "bg-emerald-500/10 text-emerald-300",
  phases: [
    { phase: 1, title: "认识 AI", duration: "30 分钟", icon: "🌍", color: "from-white/10 to-slate-500/10", borderColor: "border-white/20", badgeColor: "bg-white/10 text-white", steps: [
      { title: "AI 是什么？", desc: "AI 的三次浪潮、AI/ML/DL 的关系", tags: ["AI 入门"] },
    ]},
    { phase: 2, title: "入门基础", duration: "4-6 周", icon: "🌱", color: "from-emerald-500/20 to-teal-500/20", borderColor: "border-emerald-500/30", badgeColor: "bg-emerald-500/10 text-emerald-300", steps: [
      { title: "Python 编程基础", desc: "语法、数据结构、函数、面向对象", tags: ["Python"] },
      { title: "数学基础", desc: "线性代数、概率论、微积分", tags: ["数学"] },
      { title: "机器学习概述", desc: "监督/无监督学习、基本流程", tags: ["ML"] },
    ]},
    { phase: 3, title: "机器学习进阶", duration: "6-8 周", icon: "📊", color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-500/30", badgeColor: "bg-blue-500/10 text-blue-300", steps: [
      { title: "经典算法", desc: "线性回归、决策树、随机森林、SVM", tags: ["算法"] },
      { title: "模型评估与优化", desc: "交叉验证、正则化、超参数调优", tags: ["评估"] },
      { title: "集成学习", desc: "Bagging、Boosting、XGBoost", tags: ["XGBoost"] },
    ]},
    { phase: 4, title: "深度学习", duration: "8-10 周", icon: "🧠", color: "from-violet-500/20 to-purple-500/20", borderColor: "border-violet-500/30", badgeColor: "bg-violet-500/10 text-violet-300", steps: [
      { title: "神经网络基础", desc: "感知机、反向传播、激活函数", tags: ["神经网络"] },
      { title: "CNN 与 RNN", desc: "LeNet、ResNet、LSTM", tags: ["CNN", "RNN"] },
      { title: "Transformer", desc: "Self-Attention、Multi-Head、编码器-解码器", tags: ["Transformer"] },
    ]},
    { phase: 5, title: "专业方向", duration: "8-12 周", icon: "🎯", color: "from-amber-500/20 to-orange-500/20", borderColor: "border-amber-500/30", badgeColor: "bg-amber-500/10 text-amber-300", steps: [
      { title: "NLP 方向", desc: "词嵌入、BERT 微调、文本分类", tags: ["NLP"] },
      { title: "CV 方向", desc: "目标检测、图像分割", tags: ["CV"] },
      { title: "强化学习", desc: "Q-Learning、策略梯度、DQN", tags: ["RL"] },
    ]},
    { phase: 6, title: "大语言模型", duration: "6-8 周", icon: "🤖", color: "from-rose-500/20 to-pink-500/20", borderColor: "border-rose-500/30", badgeColor: "bg-rose-500/10 text-rose-300", steps: [
      { title: "LLM 训练管线", desc: "预训练、SFT、RLHF", tags: ["LLM"] },
      { title: "RAG 架构", desc: "向量数据库、检索策略", tags: ["RAG"] },
      { title: "Fine-tuning", desc: "LoRA/QLoRA 微调", tags: ["LoRA"] },
    ]},
    { phase: 7, title: "AI Agent 与前沿", duration: "持续学习", icon: "🚀", color: "from-brand-500/20 to-accent-500/20", borderColor: "border-brand-500/30", badgeColor: "bg-brand-500/10 text-brand-300", steps: [
      { title: "AI Agent", desc: "感知、规划、记忆、工具调用", tags: ["Agent"] },
      { title: "Multi-Agent", desc: "角色分工、通信协议", tags: ["Multi-Agent"] },
    ]},
  ],
};

// 👨‍💻 AI 应用开发工程师
const aiDevRoute: RouteDef = {
  id: "ai-dev",
  name: "AI 应用开发工程师",
  emoji: "👨‍💻",
  duration: "3-6 月",
  description: "掌握 AI API 集成、RAG 系统、Agent 开发 — 构建 AI 驱动的应用",
  target: "有后端/前端基础，想转 AI 应用开发的工程师",
  color: "from-blue-500/20 to-indigo-500/20",
  borderColor: "border-blue-500/30",
  badgeColor: "bg-blue-500/10 text-blue-300",
  phases: [
    { phase: 1, title: "LLM 基础", duration: "1-2 周", icon: "🤖", color: "from-blue-500/20 to-indigo-500/20", borderColor: "border-blue-500/30", badgeColor: "bg-blue-500/10 text-blue-300", steps: [
      { title: "Transformer 架构", desc: "理解 LLM 的核心架构、Token 机制、上下文窗口", tags: ["Transformer"] },
      { title: "主流模型对比", desc: "GPT-4、Claude、Qwen 等模型能力对比", tags: ["LLM"] },
      { title: "Prompt Engineering", desc: "结构化提示词、CoT、Few-shot", tags: ["Prompt"] },
    ]},
    { phase: 2, title: "API 集成实战", duration: "2-3 周", icon: "🔌", color: "from-cyan-500/20 to-teal-500/20", borderColor: "border-cyan-500/30", badgeColor: "bg-cyan-500/10 text-cyan-300", steps: [
      { title: "OpenAI / Anthropic API", desc: "聊天补全、流式输出、函数调用", tags: ["API"] },
      { title: "流式响应处理", desc: "SSE 流式输出、打字机效果", tags: ["流式"] },
      { title: "成本优化", desc: "Token 计数、缓存、模型选择策略", tags: ["成本"] },
    ]},
    { phase: 3, title: "RAG 系统开发", duration: "3-4 周", icon: "📚", color: "from-emerald-500/20 to-green-500/20", borderColor: "border-emerald-500/30", badgeColor: "bg-emerald-500/10 text-emerald-300", steps: [
      { title: "向量数据库", desc: "Milvus、Chroma、Pinecone 选型与使用", tags: ["向量库"] },
      { title: "Embedding 模型", desc: "文本向量化、相似度计算", tags: ["Embedding"] },
      { title: "检索策略", desc: "Hybrid Search、重排序、上下文窗口管理", tags: ["检索"] },
      { title: "RAG 实战", desc: "构建基于私有知识的问答系统", tags: ["RAG"] },
    ]},
    { phase: 4, title: "AI Agent 开发", duration: "4-6 周", icon: "🦾", color: "from-purple-500/20 to-violet-500/20", borderColor: "border-purple-500/30", badgeColor: "bg-purple-500/10 text-purple-300", steps: [
      { title: "Agent 基础组件", desc: "感知、规划、记忆、工具调用", tags: ["Agent"] },
      { title: "Function Calling", desc: "工具定义、参数校验、执行结果处理", tags: ["Function Calling"] },
      { title: "MCP 协议", desc: "Model Context Protocol 工具集成", tags: ["MCP"] },
      { title: "Multi-Agent", desc: "角色分工、协作编排", tags: ["Multi-Agent"] },
    ]},
    { phase: 5, title: "工程化与部署", duration: "2-4 周", icon: "🚀", color: "from-amber-500/20 to-orange-500/20", borderColor: "border-amber-500/30", badgeColor: "bg-amber-500/10 text-amber-300", steps: [
      { title: "服务化部署", desc: "FastAPI、Docker、负载均衡", tags: ["部署"] },
      { title: "监控与评估", desc: "日志、指标、A/B 测试", tags: ["MLOps"] },
    ]},
  ],
};

// 🧠 算法工程师
const algoRoute: RouteDef = {
  id: "algo",
  name: "AI 算法工程师",
  emoji: "🧠",
  duration: "6-12 月",
  description: "深入 ML/DL 理论，掌握模型训练与调优 — 成为 AI 算法专家",
  target: "有数学和编程基础，想深入 AI 算法原理的工程师",
  color: "from-violet-500/20 to-purple-500/20",
  borderColor: "border-violet-500/30",
  badgeColor: "bg-violet-500/10 text-violet-300",
  phases: [
    { phase: 1, title: "数学与编程基础", duration: "4-6 周", icon: "📐", color: "from-violet-500/20 to-purple-500/20", borderColor: "border-violet-500/30", badgeColor: "bg-violet-500/10 text-violet-300", steps: [
      { title: "线性代数", desc: "矩阵运算、特征值分解、SVD", tags: ["数学"] },
      { title: "概率统计", desc: "贝叶斯、分布、假设检验", tags: ["数学"] },
      { title: "Python 数据科学", desc: "NumPy、Pandas、Matplotlib", tags: ["Python"] },
    ]},
    { phase: 2, title: "经典机器学习", duration: "6-8 周", icon: "📊", color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-500/30", badgeColor: "bg-blue-500/10 text-blue-300", steps: [
      { title: "监督学习", desc: "线性模型、SVM、决策树、集成学习", tags: ["ML"] },
      { title: "无监督学习", desc: "聚类、降维、异常检测", tags: ["ML"] },
      { title: "模型评估", desc: "交叉验证、偏差-方差、正则化", tags: ["评估"] },
    ]},
    { phase: 3, title: "深度学习", duration: "8-10 周", icon: "🧠", color: "from-rose-500/20 to-pink-500/20", borderColor: "border-rose-500/30", badgeColor: "bg-rose-500/10 text-rose-300", steps: [
      { title: "神经网络", desc: "反向传播、激活函数、优化器", tags: ["DL"] },
      { title: "CNN 架构", desc: "LeNet → ResNet → EfficientNet", tags: ["CV"] },
      { title: "Transformer", desc: "Attention 机制、ViT、Swin", tags: ["DL"] },
      { title: "PyTorch 实战", desc: "训练循环、分布式训练", tags: ["PyTorch"] },
    ]},
    { phase: 4, title: "大语言模型", duration: "6-8 周", icon: "🤖", color: "from-amber-500/20 to-orange-500/20", borderColor: "border-amber-500/30", badgeColor: "bg-amber-500/10 text-amber-300", steps: [
      { title: "预训练", desc: "数据清洗、训练管线、分布式训练", tags: ["LLM"] },
      { title: "SFT 与 RLHF", desc: "指令微调、人类反馈强化学习", tags: ["RLHF"] },
      { title: "高效微调", desc: "LoRA、QLoRA、Adapter", tags: ["LoRA"] },
    ]},
    { phase: 5, title: "强化学习", duration: "4-6 周", icon: "🎮", color: "from-emerald-500/20 to-green-500/20", borderColor: "border-emerald-500/30", badgeColor: "bg-emerald-500/10 text-emerald-300", steps: [
      { title: "MDP 与值函数", desc: "马尔可夫决策过程、Q-Learning", tags: ["RL"] },
      { title: "策略梯度", desc: "REINFORCE、PPO", tags: ["RL"] },
      { title: "多智能体 RL", desc: "博弈论、MARL", tags: ["RL"] },
    ]},
  ],
};

// 🎨 AI + 产品经理
const pmRoute: RouteDef = {
  id: "pm",
  name: "AI 产品经理",
  emoji: "🎨",
  duration: "2-4 周",
  description: "理解 AI 能力边界，掌握 AI 产品设计方法论 — 做懂 AI 的产品经理",
  target: "产品经理、创业者、业务负责人",
  color: "from-pink-500/20 to-rose-500/20",
  borderColor: "border-pink-500/30",
  badgeColor: "bg-pink-500/10 text-pink-300",
  phases: [
    { phase: 1, title: "AI 全景认知", duration: "1 周", icon: "🌍", color: "from-pink-500/20 to-rose-500/20", borderColor: "border-pink-500/30", badgeColor: "bg-pink-500/10 text-pink-300", steps: [
      { title: "AI 能力边界", desc: "当前 AI 能做什么、不能做什么、成本是多少", tags: ["AI 入门"] },
      { title: "主流模型对比", desc: "GPT-4、Claude、Gemini、Qwen 能力矩阵", tags: ["LLM"] },
      { title: "2026 AI 趋势", desc: "Agent、多模态、端侧 AI 的行业影响", tags: ["趋势"] },
    ]},
    { phase: 2, title: "AI 产品设计方法论", duration: "1 周", icon: "💡", color: "from-purple-500/20 to-violet-500/20", borderColor: "border-purple-500/30", badgeColor: "bg-purple-500/10 text-purple-300", steps: [
      { title: "Prompt Engineering", desc: "与 AI 高效沟通、评估模型输出质量", tags: ["Prompt"] },
      { title: "AI 产品模式", desc: "Copilot、Agent、Autonomous 三种产品模式", tags: ["Agent"] },
      { title: "用户体验设计", desc: "流式输出、置信度展示、错误恢复", tags: ["UX"] },
    ]},
    { phase: 3, title: "AI 商业化实战", duration: "1-2 周", icon: "💰", color: "from-amber-500/20 to-orange-500/20", borderColor: "border-amber-500/30", badgeColor: "bg-amber-500/10 text-amber-300", steps: [
      { title: "Token 经济学", desc: "成本模型、定价策略、ROI 计算", tags: ["成本"] },
      { title: "合规与伦理", desc: "数据隐私、内容安全、AI 伦理框架", tags: ["伦理"] },
      { title: "案例研究", desc: "Claude Code、Cursor、ChatGPT 产品拆解", tags: ["实战"] },
    ]},
  ],
};

// 🔬 数据科学家
const dsRoute: RouteDef = {
  id: "data-scientist",
  name: "数据科学家",
  emoji: "🔬",
  duration: "4-8 月",
  description: "从数据分析到 AI 建模 — 用数据和 AI 驱动业务决策",
  target: "数据分析师转型、统计学背景、想深入 AI 建模的人",
  color: "from-cyan-500/20 to-blue-500/20",
  borderColor: "border-cyan-500/30",
  badgeColor: "bg-cyan-500/10 text-cyan-300",
  phases: [
    { phase: 1, title: "数据科学基础", duration: "4-6 周", icon: "📊", color: "from-cyan-500/20 to-blue-500/20", borderColor: "border-cyan-500/30", badgeColor: "bg-cyan-500/10 text-cyan-300", steps: [
      { title: "Python 数据分析", desc: "Pandas、NumPy、可视化", tags: ["Python"] },
      { title: "统计推断", desc: "假设检验、A/B 测试、贝叶斯", tags: ["统计"] },
      { title: "机器学习入门", desc: "scikit-learn、特征工程、模型选择", tags: ["ML"] },
    ]},
    { phase: 2, title: "深度学习应用", duration: "6-8 周", icon: "🧠", color: "from-violet-500/20 to-purple-500/20", borderColor: "border-violet-500/30", badgeColor: "bg-violet-500/10 text-violet-300", steps: [
      { title: "神经网络", desc: "反向传播、激活函数、优化器", tags: ["DL"] },
      { title: "NLP 实战", desc: "文本分类、情感分析、命名实体识别", tags: ["NLP"] },
      { title: "CV 实战", desc: "图像分类、目标检测", tags: ["CV"] },
    ]},
    { phase: 3, title: "LLM 与生成式 AI", duration: "4-6 周", icon: "🤖", color: "from-rose-500/20 to-pink-500/20", borderColor: "border-rose-500/30", badgeColor: "bg-rose-500/10 text-rose-300", steps: [
      { title: "LLM 原理", desc: "Transformer、预训练、微调", tags: ["LLM"] },
      { title: "RAG 实战", desc: "向量检索 + LLM 生成", tags: ["RAG"] },
      { title: "生成式模型", desc: "Diffusion、GAN", tags: ["GenAI"] },
    ]},
    { phase: 4, title: "MLOps 与生产化", duration: "4-6 周", icon: "🚀", color: "from-amber-500/20 to-orange-500/20", borderColor: "border-amber-500/30", badgeColor: "bg-amber-500/10 text-amber-300", steps: [
      { title: "模型部署", desc: "MLflow、API 服务化", tags: ["MLOps"] },
      { title: "实验管理", desc: "版本控制、超参数搜索", tags: ["MLOps"] },
    ]},
  ],
};

// 🎯 大模型开发工程师
const llmEngRoute: RouteDef = {
  id: "llm-eng",
  name: "大模型开发工程师",
  emoji: "🎯",
  duration: "4-8 月",
  description: "深入 LLM 训练、微调、推理优化 — 成为大模型基础设施工程师",
  target: "有深度学习基础，想深入大模型底层技术的工程师",
  color: "from-amber-500/20 to-red-500/20",
  borderColor: "border-amber-500/30",
  badgeColor: "bg-amber-500/10 text-amber-300",
  phases: [
    { phase: 1, title: "Transformer 深度", duration: "4-6 周", icon: "⚡", color: "from-amber-500/20 to-red-500/20", borderColor: "border-amber-500/30", badgeColor: "bg-amber-500/10 text-amber-300", steps: [
      { title: "Attention 机制", desc: "Self-Attention、Multi-Head、位置编码", tags: ["LLM"] },
      { title: "模型架构演进", desc: "GPT、LLaMA、Mistral、Qwen", tags: ["LLM"] },
      { title: "推理优化", desc: "推测解码、KV Cache 量化", tags: ["推理"] },
    ]},
    { phase: 2, title: "预训练实战", duration: "6-8 周", icon: "🏗️", color: "from-blue-500/20 to-indigo-500/20", borderColor: "border-blue-500/30", badgeColor: "bg-blue-500/10 text-blue-300", steps: [
      { title: "数据管线", desc: "数据收集、清洗、去重、Token 化", tags: ["预训练"] },
      { title: "分布式训练", desc: "数据并行、张量并行、流水线并行", tags: ["训练"] },
      { title: "训练稳定性", desc: "梯度裁剪、学习率调度、检查点", tags: ["训练"] },
    ]},
    { phase: 3, title: "对齐与微调", duration: "4-6 周", icon: "🎯", color: "from-emerald-500/20 to-green-500/20", borderColor: "border-emerald-500/30", badgeColor: "bg-emerald-500/10 text-emerald-300", steps: [
      { title: "SFT 指令微调", desc: "指令数据构建、微调策略", tags: ["SFT"] },
      { title: "RLHF", desc: "奖励模型、PPO 优化", tags: ["RLHF"] },
      { title: "高效微调", desc: "LoRA、QLoRA、Adapter", tags: ["LoRA"] },
    ]},
    { phase: 4, title: "推理与部署", duration: "4-6 周", icon: "🚀", color: "from-purple-500/20 to-violet-500/20", borderColor: "border-purple-500/30", badgeColor: "bg-purple-500/10 text-purple-300", steps: [
      { title: "推理引擎", desc: "vLLM、TensorRT-LLM", tags: ["推理"] },
      { title: "量化部署", desc: "INT8/INT4/GPTQ/AWQ", tags: ["量化"] },
    ]},
  ],
};

// 🛡️ AI 安全工程师
const securityRoute: RouteDef = {
  id: "security",
  name: "AI 安全工程师",
  emoji: "🛡️",
  duration: "2-4 月",
  description: "AI 伦理、对抗攻击、隐私保护 — 守护 AI 世界的安全底线",
  target: "安全工程师、AI 产品经理、关注 AI 伦理的开发者",
  color: "from-red-500/20 to-orange-500/20",
  borderColor: "border-red-500/30",
  badgeColor: "bg-red-500/10 text-red-300",
  phases: [
    { phase: 1, title: "AI 伦理与公平性", duration: "1-2 周", icon: "⚖️", color: "from-red-500/20 to-rose-500/20", borderColor: "border-red-500/30", badgeColor: "bg-red-500/10 text-red-300", steps: [
      { title: "AI 偏见与公平性", desc: "算法偏见来源、公平性度量与去偏", tags: ["伦理"] },
      { title: "模型可解释性", desc: "SHAP、LIME、特征归因", tags: ["伦理"] },
      { title: "AI 伦理框架", desc: "负责任 AI、行业规范", tags: ["伦理"] },
    ]},
    { phase: 2, title: "隐私保护 ML", duration: "2-3 周", icon: "🔒", color: "from-orange-500/20 to-amber-500/20", borderColor: "border-orange-500/30", badgeColor: "bg-orange-500/10 text-orange-300", steps: [
      { title: "差分隐私", desc: "差分隐私原理与应用", tags: ["隐私"] },
      { title: "联邦学习", desc: "分布式训练保护数据隐私", tags: ["隐私"] },
    ]},
    { phase: 3, title: "对抗攻击与防御", duration: "2-3 周", icon: "🛡️", color: "from-yellow-500/20 to-lime-500/20", borderColor: "border-yellow-500/30", badgeColor: "bg-yellow-500/10 text-yellow-300", steps: [
      { title: "对抗样本", desc: "FGSM、PGD、C&W 攻击", tags: ["安全"] },
      { title: "防御策略", desc: "对抗训练、输入消毒", tags: ["安全"] },
    ]},
    { phase: 4, title: "LLM 安全", duration: "2-3 周", icon: "🤖", color: "from-violet-500/20 to-purple-500/20", borderColor: "border-violet-500/30", badgeColor: "bg-violet-500/10 text-violet-300", steps: [
      { title: "Prompt 注入", desc: "注入攻击原理与防御", tags: ["安全"] },
      { title: "对齐与红队测试", desc: "RLHF、对抗性测试", tags: ["伦理"] },
    ]},
  ],
};

// ==================== 路线列表 ====================

const allRoutes: RouteDef[] = [
  fastRoute,
  foundationRoute,
  aiDevRoute,
  algoRoute,
  pmRoute,
  dsRoute,
  llmEngRoute,
  securityRoute,
];

export default function RoadmapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialRoute = searchParams.get("route") || "fast";
  const initialPhase = searchParams.get("phase");
  const initialExpanded = initialPhase !== null ? Number(initialPhase) : 1;

  const [activeRoute, setActiveRoute] = useState<string>(initialRoute);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(initialExpanded);

  const syncToURL = useCallback((route: string, phase: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (route !== "fast") params.set("route", route);
    else params.delete("route");
    if (phase !== null) params.set("phase", String(phase));
    else params.delete("phase");
    const query = params.toString();
    router.replace(query ? `/roadmap?${query}` : "/roadmap", { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    syncToURL(activeRoute, expandedPhase);
  }, [activeRoute, expandedPhase, syncToURL]);

  const route = allRoutes.find((r) => r.id === activeRoute) || fastRoute;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/roadmap" />

      {/* Hero */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            <span className="text-sm text-brand-300">AI 学习路线图</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            选择你的 <span className="text-gradient">学习路线</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            根据你的岗位目标，选择最适合的学习路径
          </p>

          {/* Route Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {allRoutes.map((r) => (
              <button
                key={r.id}
                onClick={() => { setActiveRoute(r.id); setExpandedPhase(1); syncToURL(r.id, 1); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  activeRoute === r.id
                    ? `${r.badgeColor} ${r.borderColor} shadow-lg`
                    : "text-slate-400 border-white/10 hover:text-white hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {r.emoji} {r.name}
                <span className="ml-1.5 text-xs opacity-70">{r.duration}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Route Info */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className={`p-6 rounded-2xl bg-gradient-to-r ${route.color} border ${route.borderColor}`}>
            <h2 className="text-2xl font-bold mb-2">{route.emoji} {route.name}</h2>
            <p className="text-slate-300 mb-1">{route.description}</p>
            <p className="text-slate-400 text-sm">🎯 {route.target}</p>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {route.phases.map((phase, idx) => {
            const isExpanded = expandedPhase === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl bg-gradient-to-r ${phase.color} border ${phase.borderColor} overflow-hidden transition-all`}
              >
                <button
                  onClick={() => {
                    setExpandedPhase(isExpanded ? null : idx);
                    syncToURL(activeRoute, isExpanded ? null : idx);
                  }}
                  className="w-full p-5 sm:p-6 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                >
                  {/* Phase number */}
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                    {phase.icon}
                  </div>

                  {/* Phase info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold">
                        第 {phase.phase} 阶段：{phase.title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${phase.badgeColor}`}>
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {phase.steps.length} 个学习模块 · 点击展开详情
                    </p>
                  </div>

                  {/* Expand arrow */}
                  <svg
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <div className="space-y-3 ml-0 sm:ml-16">
                      {phase.steps.map((step, sIdx) => (
                        <Link
                          key={sIdx}
                          href={stepLink(step.tags[0])}
                          className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/20 transition-all block group"
                        >
                          <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
                            {sIdx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base mb-1 group-hover:text-brand-300 transition-colors">
                              {step.title}
                            </h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {step.desc}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {step.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-white/5 rounded text-xs text-slate-500"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 border border-brand-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              选择你的起点，开始学习吧！
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              无论你现在处于哪个阶段，都能在这里找到适合的学习内容
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/knowledge"
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5"
              >
                📚 浏览知识库
              </Link>
              <Link
                href="/tools"
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              >
                🛠️ 探索 GitHub AI 精选
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
