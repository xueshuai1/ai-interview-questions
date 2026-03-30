# Transformer - 面试题精选

> **分类**: 基础架构 | **编号**: 001 | **题目数量**: 8 | **难度**: ⭐⭐⭐ | **更新时间**: 2026-03-30

`Transformer` `Attention` `面试必考` `大厂高频`

---

## 📊 能力评估维度

```mermaid
radarChart
    title Transformer 相关面试能力评估
    "基础概念": 90
    "原理理解": 85
    "代码实现": 80
    "工程实践": 75
    "优化能力": 70
    "创新思维": 65
```

---

## 题目 1: Transformer 基础概念 ⭐⭐

### 🎯 问题

**请用 3 分钟解释 Transformer 的核心思想和主要优势。**

### ✅ 参考答案

#### 核心定义（30 秒）

Transformer 是一种**完全基于注意力机制**的序列建模架构，摒弃了传统的 RNN 和 CNN 结构。

#### 关键要点（2 分钟）

**1. 自注意力机制**
- 允许模型在处理每个位置时关注序列的所有其他位置
- 捕获长距离依赖关系
- 计算复杂度：O(n²)，但可并行化

**2. 并行化训练**
- 与 RNN 不同，Transformer 可以同时处理整个序列
- 训练速度提升 5-10 倍
- 更适合大规模数据和模型

**3. 位置编码**
- 由于没有序列性，需要显式添加位置信息
- 使用正弦/余弦函数编码相对位置
- 可学习到绝对位置信息

#### 对比优势（30 秒）

| 对比维度 | RNN/LSTM | Transformer |
|---------|----------|-------------|
| 并行化 | ❌ 无法并行 | ✅ 完全并行 |
| 长距离依赖 | ⭐⭐ 梯度消失 | ⭐⭐⭐⭐ 直接连接 |
| 训练速度 | ⭐⭐ 慢 | ⭐⭐⭐⭐ 快 |

### 💡 评分标准

| 维度 | 权重 | 评分要点 |
|------|------|---------|
| 概念准确性 | 30% | 正确描述 Self-Attention、并行化 |
| 逻辑清晰度 | 25% | 分点阐述、层次分明 |
| 举例说明 | 25% | 能举出具体应用场景 |
| 时间控制 | 20% | 3 分钟内完成，重点突出 |

### 🔍 延伸追问

1. **追问 1**: Transformer 为什么需要位置编码？（⭐⭐）
   - 期望回答：因为没有 RNN 的序列性，相同词在不同位置无法区分
   
2. **追问 2**: Self-Attention 的计算复杂度是多少？（⭐⭐）
   - 期望回答：O(n²)，因为需要计算所有位置对的注意力分数
   
3. **追问 3**: 如何处理超长序列？（⭐⭐⭐）
   - 期望回答：提到 Sparse Attention、Longformer、Reformer 等改进方案

---

## 题目 2: Self-Attention 机制详解 ⭐⭐⭐

### 🎯 问题

**请详细解释 Self-Attention 的计算过程，包括 Q、K、V 的含义和计算公式。**

### ✅ 参考答案

#### 数学公式

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

#### 核心组件

**1. Query (Q) - 查询向量**
- 表示"我想关注什么"
- 由输入通过线性变换得到：$Q = XW_Q$

**2. Key (K) - 键向量**
- 表示"我提供什么信息"
- 用于被查询：$K = XW_K$

**3. Value (V) - 值向量**
- 表示"实际的内容"
- 加权求和得到最终输出：$V = XW_V$

#### 计算步骤

```mermaid
flowchart TD
    A[输入 X] --> B[线性变换得到 Q, K, V]
    B --> C[计算 Q*K^T 得到相似度]
    C --> D[除以 sqrt(d_k) 缩放]
    D --> E[Softmax 归一化]
    E --> F[加权求和得到输出]
    
    style A fill:#e3f2fd
    style B fill:#bbdefb
    style C fill:#90caf9
    style D fill:#64b5f6
    style E fill:#42a5f5
    style F fill:#2196f3
```

#### 代码实现

```python
def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    缩放点积注意力
    
    Args:
        Q: Query 向量 [batch_size, num_heads, seq_len, d_k]
        K: Key 向量 [batch_size, num_heads, seq_len, d_k]
        V: Value 向量 [batch_size, num_heads, seq_len, d_k]
        mask: 掩码矩阵（可选）
    
    Returns:
        output: 注意力输出
        attention_weights: 注意力权重（用于可视化）
    """
    d_k = Q.size(-1)
    
    # 1. 计算注意力分数
    scores = torch.matmul(Q, K.transpose(-2, -1))  # [batch, heads, q_len, k_len]
    
    # 2. 缩放（防止梯度消失）
    scores = scores / math.sqrt(d_k)
    
    # 3. 应用 mask（如果有）
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    
    # 4. Softmax 归一化
    attention_weights = torch.softmax(scores, dim=-1)
    
    # 5. 加权求和
    output = torch.matmul(attention_weights, V)
    
    return output, attention_weights
```

### 💡 评分标准

| 评分等级 | 要求 |
|---------|------|
| ⭐⭐ 及格 | 能写出公式，解释 QKV 基本概念 |
| ⭐⭐⭐ 良好 | 能详细说明计算步骤，理解缩放因子的作用 |
| ⭐⭐⭐⭐ 优秀 | 能手写代码实现，理解每个维度的变化 |

### 🔍 延伸追问

1. **为什么要除以 $\sqrt{d_k}$？**（⭐⭐⭐）
   - 答案：防止点积结果过大，导致 Softmax 梯度消失
   
2. **Multi-Head 和 Single-Head 有什么区别？**（⭐⭐）
   - 答案：多头可以在不同子空间学习不同的注意力模式
   
3. **注意力矩阵的形状是什么？**（⭐⭐）
   - 答案：[batch_size, num_heads, seq_len, seq_len]

---

## 题目 3: 代码实现题 ⭐⭐⭐⭐

### 🎯 问题

**请在白板上实现 Multi-Head Attention 的前向传播过程。**

### ✅ 参考代码

```python
import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model=512, num_heads=8, dropout=0.1):
        super().__init__()
        assert d_model % num_heads == 0, "d_model 必须能被 num_heads 整除"
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        # 线性变换层
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        
        self.dropout = nn.Dropout(dropout)
        self.scale = math.sqrt(self.d_k)
    
    def forward(self, q, k, v, mask=None):
        """
        Args:
            q: Query [batch_size, seq_len_q, d_model]
            k: Key [batch_size, seq_len_k, d_model]
            v: Value [batch_size, seq_len_v, d_model]
            mask: 掩码 [batch_size, 1, 1, seq_len] 或 [batch_size, 1, seq_len_q, seq_len_k]
        """
        batch_size = q.size(0)
        
        # Step 1: 线性变换 + 分头
        # [batch, seq_len, d_model] -> [batch, num_heads, seq_len, d_k]
        Q = self.W_q(q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(k).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(v).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # Step 2: 计算注意力分数
        # Q: [batch, heads, q_len, d_k], K: [batch, heads, k_len, d_k]
        # scores: [batch, heads, q_len, k_len]
        scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        
        # Step 3: 应用 mask
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        # Step 4: Softmax + Dropout
        attention_weights = torch.softmax(scores, dim=-1)  # [batch, heads, q_len, k_len]
        attention_weights = self.dropout(attention_weights)
        
        # Step 5: 加权求和
        # attention: [batch, heads, q_len, k_len], V: [batch, heads, k_len, d_k]
        # context: [batch, heads, q_len, d_k]
        context = torch.matmul(attention_weights, V)
        
        # Step 6: 合并多头 + 输出变换
        # context: [batch, q_len, num_heads, d_k] -> [batch, q_len, d_model]
        context = context.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        output = self.W_o(context)
        
        return output

# 测试代码
if __name__ == "__main__":
    # 参数设置
    batch_size = 2
    seq_len = 10
    d_model = 512
    num_heads = 8
    
    # 创建模型和输入
    attention = MultiHeadAttention(d_model=d_model, num_heads=num_heads)
    q = torch.randn(batch_size, seq_len, d_model)
    k = torch.randn(batch_size, seq_len, d_model)
    v = torch.randn(batch_size, seq_len, d_model)
    
    # 前向传播
    output = attention(q, k, v)
    
    # 验证输出形状
    assert output.shape == (batch_size, seq_len, d_model), f"期望输出形状：{(batch_size, seq_len, d_model)}, 实际：{output.shape}"
    
    print(f"✅ Multi-Head Attention 测试通过！")
    print(f"   输入形状：{q.shape}")
    print(f"   输出形状：{output.shape}")
    print(f"   参数量：{sum(p.numel() for p in attention.parameters()):,}")
```

### 💡 评分要点

| 检查项 | 分值 | 说明 |
|--------|------|------|
| 线性变换正确 | 15 分 | W_q, W_k, W_v, W_o 四个矩阵 |
| 分头操作正确 | 20 分 | view + transpose 的组合使用 |
| 注意力计算正确 | 20 分 | Q*K^T / sqrt(d_k) |
| Mask 处理正确 | 15 分 | masked_fill 的使用 |
| 输出合并正确 | 15 分 | transpose + view 恢复原始维度 |
| 代码规范 | 15 分 | 注释清晰、变量命名规范 |

---

## 题目 4: 工程实践题 ⭐⭐⭐

### 🎯 问题

**在实际项目中，如何优化 Transformer 的推理速度？请列举至少 3 种方法。**

### ✅ 参考答案

#### 方法 1: 知识蒸馏（Knowledge Distillation）

```python
# 使用更小的学生模型
teacher_model = Transformer(d_model=1024, num_layers=24)  # 大模型
student_model = Transformer(d_model=256, num_layers=4)    # 小模型

# 蒸馏损失
def distillation_loss(student_logits, teacher_logits, temperature=4.0):
    student_log_probs = F.log_softmax(student_logits / temperature, dim=-1)
    teacher_probs = F.softmax(teacher_logits / temperature, dim=-1)
    return F.kl_div(student_log_probs, teacher_probs, reduction='batchmean')
```

**效果**: 推理速度提升 4-8 倍，精度损失 < 2%

#### 方法 2: 量化（Quantization）

```python
# PyTorch 动态量化
from torch.quantization import quantize_dynamic

# 只量化 Linear 层
quantized_model = quantize_dynamic(
    model,
    {nn.Linear},
    dtype=torch.qint8
)

# 推理速度提升 2-3 倍，模型大小减少 75%
```

#### 方法 3: 注意力优化

| 优化方案 | 原理 | 加速比 |
|---------|------|--------|
| **Sparse Attention** | 只关注局部窗口 | 3-5x |
| **Linear Attention** | 近似计算，O(n) 复杂度 | 5-10x |
| **Flash Attention** | IO 感知的高效实现 | 2-3x |

```python
# 使用 Flash Attention
from flash_attn import flash_attn_qkvpacked_func

# 比标准 Attention 快 2-3 倍，显存占用减少 50%
output = flash_attn_qkvpacked_func(qkv, dropout_p=0.0, softmax_scale=None)
```

### 💡 评分标准

- ⭐⭐ 知道 1 种优化方法
- ⭐⭐⭐ 知道 2-3 种方法，能说明原理
- ⭐⭐⭐⭐ 知道 4 种以上方法，有实际项目经验

---

## 📚 推荐学习资源

### 📖 论文

1. [Attention Is All You Need](https://arxiv.org/abs/1706.03762) - 原论文（必读）
2. [Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) - 图解版
3. [The Annotated Transformer](http://nlp.seas.harvard.edu/2018/04/03/attention.html) - 代码注释版

### 💻 实践项目

- [HuggingFace Transformers](https://github.com/huggingface/transformers)
- [Fairseq](https://github.com/pytorch/fairseq)
- [Implement Transformer from Scratch](https://github.com/jadore801120/attention-is-all-you-need-pytorch)

### 📹 视频教程

- [李宏毅 Transformer 课程](https://www.youtube.com/watch?v=uqdE5upV6l8)
- [Stanford CS224N Lecture 5](https://www.youtube.com/watch?v=5vcjaukPf6Q)

---

**难度说明**:
- ⭐⭐ 基础题：校招/初级工程师
- ⭐⭐⭐ 进阶题：社招/中级工程师  
- ⭐⭐⭐⭐ 高级题：专家岗/研究员

**下一篇**: [Self-Attention 面试题](./002_Self-Attention_questions.md)
