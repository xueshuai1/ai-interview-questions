import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-guide",
    title: "深度学习核心技术学习导览",
    category: "dl",
    tags: ["深度学习", "学习导览", "神经网络", "CNN", "RNN"],
    summary: "掌握深度学习三大方向：神经网络基础、CNN 计算机视觉、RNN 序列模型。理解 Transformer 架构，这是大语言模型的基础。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 什么是深度学习？",
            body: `机器学习靠"特征工程"（人工提取特征），深度学习靠"端到端学习"（从原始数据直接学）。

2012 年 AlexNet 在图像识别比赛中大获全胜，深度学习从此崛起。今天，**几乎所有 AI 突破都来自深度学习**。`
        },
        {
            title: "1. 学习全景图",
            body: `深度学习分为四个方向：

**神经网络基础** — 感知机、多层网络、反向传播、激活函数、优化器

**CNN（计算机视觉）** — 卷积、池化、ResNet

**RNN / 序列模型** — RNN、LSTM、注意力机制

**Transformer** — Self-Attention、编码器（LLM 的基石）`
        },
        {
            title: "2. 学习建议",
            body: `**重点投入时间：**
- 神经网络基础（反向传播是核心）
- Transformer 架构（LLM 的基石）

**可以略过的：**
- CNN 的具体架构细节（知道思想就行）
- RNN 的数学推导（知道 LSTM 解决什么问题就行）

> **2026 年最重要的部分：Transformer。** 它是 GPT、Claude、Gemini 的共同基础。`,
            tip: "💡 用 PyTorch 搭建一个简单的神经网络，亲手跑一次训练流程，比看十篇教程都管用。"
        },
        {
            title: "架构图示 1",
            mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
        },
        {
            title: "架构图示 2",
            mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
        },
    ]
};
