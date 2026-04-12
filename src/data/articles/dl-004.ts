import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-004",
    title: "注意力机制与 Transformer 架构",
    category: "dl",
    tags: ["Attention", "Transformer", "自注意力"],
    summary: "详解 Self-Attention、Multi-Head Attention 和 Transformer 的编码器-解码器结构",
    date: "2026-04-01",
    readTime: "25 min",
    level: "高级",
    content: [
      {
        title: "1. 为什么需要注意力机制？",
        body: "在 Transformer 出现之前，序列建模主要依赖 RNN 和 LSTM。这些模型按顺序处理序列，导致两个核心问题：一是无法并行计算，训练速度慢；二是长距离依赖问题——序列开头的信息传到末尾时已经严重衰减。注意力机制（Attention）的核心思想是：让模型在处理每个位置时，都能\"看到\"序列中所有其他位置的信息，并根据相关性分配不同的权重。",
        mermaid: `graph LR
    A["输入序列"] --> B["Query 查询"]
    A --> C["Key 键"]
    A --> D["Value 值"]
    B --> E["Attention Score"]
    C --> E
    E --> F["Softmax 归一化"]
    D --> G["加权求和"]
    F --> G
    G --> H["输出向量"]`,
      },
      {
        title: "2. Scaled Dot-Product Attention 详解",
        body: "Transformer 使用的核心注意力机制是 Scaled Dot-Product Attention。其计算公式为：Attention(Q, K, V) = softmax(QK^T / √d_k) V。其中除以 √d_k 是为了防止点积结果过大导致 softmax 梯度消失。Q（Query）、K（Key）、V（Value）都是从输入通过线性变换得到的矩阵。",
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k: int):
        super().__init__()
        self.d_k = d_k
        self.dropout = nn.Dropout(0.1)
    
    def forward(self, Q, K, V, mask=None):
        # Q, K, V shape: (batch, heads, seq_len, d_k)
        scores = torch.matmul(Q, K.transpose(-2, -1))
        scores = scores / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        
        attention_weights = torch.softmax(scores, dim=-1)
        attention_weights = self.dropout(attention_weights)
        
        output = torch.matmul(attention_weights, V)
        return output, attention_weights

# 示例使用
d_k = 64
attention = ScaledDotProductAttention(d_k)
Q = torch.randn(2, 8, 10, d_k)  # batch=2, heads=8, seq=10
K = torch.randn(2, 8, 10, d_k)
V = torch.randn(2, 8, 10, d_k)
output, weights = attention(Q, K, V)
print(f"输出形状: {output.shape}")  # (2, 8, 10, 64)`,
          },
        ],
      },
      {
        title: "3. Multi-Head Attention：多视角并行",
        body: "Multi-Head Attention 的核心思想是：与其让模型用一个注意力头去捕捉所有类型的依赖关系，不如用多个注意力头各自学习不同的表示子空间。每个头独立计算注意力，然后将结果拼接并通过线性变换融合。这就像从多个不同的角度理解同一段文本——一个头可能关注语法关系，另一个关注语义关联，第三个关注长距离依赖。",
        code: [
          {
            lang: "python",
            code: `class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        assert d_model % num_heads == 0
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        self.attention = ScaledDotProductAttention(self.d_k)
    
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        
        # 线性变换并分头
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # 多头注意力
        attn_output, weights = self.attention(Q, K, V, mask)
        
        # 拼接所有头
        attn_output = attn_output.transpose(1, 2).contiguous() \\
            .view(batch_size, -1, self.d_model)
        
        return self.W_o(attn_output), weights`,
          },
        ],
      },
      {
        title: "4. Transformer 整体架构",
        body: "完整的 Transformer 由编码器和解码器堆叠而成。编码器由 N=6 个相同层组成，每层包含两个子层：多头自注意力和前馈神经网络（FFN）。解码器同样由 N 层组成，但每层包含三个子层：带掩码的多头自注意力（防止看到未来信息）、交叉注意力（关注编码器输出）和前馈网络。每个子层都使用残差连接和层归一化（LayerNorm）。",
        mermaid: `graph TB
    subgraph "编码器 (Encoder)"
        A["输入 Embedding"] --> B["位置编码 Positional Encoding"]
        B --> C["Multi-Head Self-Attention"]
        C --> D["Add & LayerNorm"]
        D --> E["Feed Forward NN"]
        E --> F["Add & LayerNorm"]
    end
    
    subgraph "解码器 (Decoder)"
        G["输出 Embedding"] --> H["位置编码"]
        H --> I["Masked Multi-Head Self-Attention"]
        I --> J["Add & LayerNorm"]
        J --> K["Multi-Head Cross-Attention"]
        F -.-> K
        K --> L["Add & LayerNorm"]
        L --> M["Feed Forward NN"]
        M --> N["Add & LayerNorm"]
    end
    
    N --> O["Linear + Softmax"]
    O --> P["输出概率分布"]`,
      },
      {
        title: "5. 位置编码：让模型感知顺序",
        body: "由于 Transformer 完全基于注意力机制，没有 RNN 的时序概念，因此需要显式地注入位置信息。原始 Transformer 使用正弦/余弦函数的位置编码：PE(pos, 2i) = sin(pos / 10000^(2i/d_model))，PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))。这种设计使得模型能够学习到相对位置关系，因为对于固定偏移量 k，PE(pos+k) 可以表示为 PE(pos) 的线性变换。",
        code: [
          {
            lang: "python",
            code: `class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, max_len: int = 5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2) * 
                            -(math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        # x shape: (batch, seq_len, d_model)
        return x + self.pe[:, :x.size(1)]`,
          },
        ],
      },
      {
        title: "6. Transformer 与 RNN/CNN 对比",
        table: {
          headers: ["特性", "RNN/LSTM", "CNN", "Transformer"],
          rows: [
            ["并行计算", "❌ 顺序处理", "✅ 完全并行", "✅ 完全并行"],
            ["长距离依赖", "⚠️ 随距离衰减", "⚠️ 受感受野限制", "✅ 全局注意力"],
            ["计算复杂度", "O(n·d²)", "O(k·n·d²)", "O(n²·d)"],
            ["训练速度", "慢", "快", "快（但内存消耗大）"],
            ["典型应用", "机器翻译(旧)", "图像分类", "LLM/翻译/摘要"],
            ["参数量", "中等", "中等", "较大"],
          ],
        },
      },
      {
        title: "7. 从 Transformer 到大语言模型",
        body: "Transformer 架构是现代大语言模型的基石。GPT 系列采用 Decoder-only 架构，BERT 采用 Encoder-only 架构，而 T5/BART 则使用完整的 Encoder-Decoder。理解 Transformer 是理解所有现代 LLM 的基础。后续的重要改进包括：RoPE 旋转位置编码、Flash Attention 加速、GQA 分组查询注意力、MoE 混合专家架构等。",
        list: [
          "GPT (2018): Decoder-only，自回归生成，开启了 LLM 时代",
          "BERT (2018): Encoder-only，掩码语言模型，NLP 预训练的里程碑",
          "T5 (2019): 统一文本到文本框架，Encoder-Decoder 架构",
          "PaLM (2022): 规模扩展到 540B 参数，验证了 scaling law",
          "LLaMA (2023): 高效开源 LLM，RMSNorm + SwiGLU + RoPE",
          "GPT-4/Claude 3 (2024): 多模态能力，百万级上下文窗口",
        ],
        tip: "学习建议：先手写一个最小 Transformer（约 200 行代码），再阅读原始论文 \"Attention Is All You Need\"，最后研究现代 LLM 中的改进（RoPE、Flash Attention、GQA 等）。",
      },
    ],
  };
