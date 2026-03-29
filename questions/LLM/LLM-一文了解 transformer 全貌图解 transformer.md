---
title: "一文了解 Transformer 全貌（图解 Transformer）"
category: "LLM"
difficulty: "⭐⭐⭐⭐"
tags: ["Transformer", "自注意力机制", "编码器 - 解码器", "位置编码", "并行计算"]
---

## 题目描述
Transformer 是现代大语言模型的基石架构。请详细说明 Transformer 的整体架构、核心组件及工作原理。

**标签：** Transformer, 自注意力机制，编码器 - 解码器，位置编码，并行计算

## 参考答案
### 整体架构

Transformer 采用**编码器 - 解码器（Encoder-Decoder）**架构：

```
输入序列 → [编码器 N 层] → 隐表示 → [解码器 N 层] → 输出序列
```

**核心创新：** 完全基于注意力机制，无需 RNN/CNN，支持并行计算。

### 核心组件

**1. 自注意力机制（Self-Attention）**

```python
# Scaled Dot-Product Attention
def attention(Q, K, V):
    d_k = Q.shape[-1]
    scores = Q @ K.transpose(-2, -1) / sqrt(d_k)
    attn_weights = softmax(scores)
    output = attn_weights @ V
    return output
```

**多头注意力（Multi-Head Attention）：** 多个注意力头并行计算，捕获不同子空间信息。

**2. 位置编码（Positional Encoding）**

```python
# 正弦余弦位置编码
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

**3. 前馈神经网络（FFN）**

```python
# 两层全连接网络
FFN(x) = max(0, x·W1 + b1)·W2 + b2
```

**4. 层归一化与残差连接**

```python
# LayerNorm(x + Sublayer(x))
```

### 编码器与解码器

**编码器：** 双向注意力，并行处理整个序列。

**解码器：** 掩码自注意力（只能关注当前位置之前）+ 交叉注意力（关注编码器输出）。

### 实际应用场景

| 场景 | Transformer 变体 |
|------|----------------|
| 机器翻译 | 原始 Encoder-Decoder |
| 文本分类 | BERT（仅 Encoder） |
| 文本生成 | GPT（仅 Decoder） |
| 图像识别 | Vision Transformer (ViT) |

## 考察重点

### 知识维度
- [ ] Transformer 整体架构理解
- [ ] 自注意力机制原理与计算
- [ ] 并行计算优势的理解

### 能力维度
- [ ] 位置编码的必要性与实现

### 思维维度
- [ ] 编码器与解码器的区别

## 延伸追问

### 追问 1: 自注意力的计算复杂度（5分）
**问题：** 自注意力的计算复杂度是多少？如何处理长序列？

**答案：** 复杂度 O(n²·d)。长序列优化：稀疏注意力、线性注意力、滑动窗口、分块注意力。

### 追问 2: 为什么需要多头注意力？（5分）
**问题：** 单头注意力不够吗？多头的优势是什么？

**答案：** 多头可以学习不同的表示子空间，捕获多种特征（语法、语义、实体等），增强表达力。

### 追问 3: 位置编码演进（5分）
**问题：** 位置编码有哪些改进版本？

**答案：** 原始正弦余弦→可学习位置编码（BERT）→RoPE（Llama）→ALiBi。趋势：支持更长序列外推。

### 追问 4: Encoder-only vs Decoder-only（5分）
**问题：** BERT 和 GPT 有什么区别？

**答案：** BERT 双向注意力，适合理解任务；GPT 单向注意力，适合生成任务。

## 深入理解
Transformer 通过自注意力机制实现了序列的并行处理和长程依赖捕获，彻底改变了 NLP 领域。理解 Transformer 是学习现代大语言模型的基础。

## 更新历史
- v1 (2026-03-29): 初始版本（重写，补充完整答案）

### 追问 5: 前沿进展（5 分）
**问题：** （待补充）

**答案：** （待补充）

## 更新历史
- v1 (2026-03-29): 格式标准化修复
