import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-001",
    title: "词嵌入：从 Word2Vec 到 GloVe",
    category: "nlp",
    tags: ["词向量", "表示学习", "基础"],
    summary: "理解分布式表示的核心思想，对比 CBOW 与 Skip-gram 模型",
    date: "2026-04-06",
    readTime: "12 min",
    level: "入门",
    content: [
      {
        title: "1. 分布式表示的起源",
        body: `在词嵌入出现之前，自然语言处理中最主流的词汇表示方式是 one-hot 编码。假设词表大小为 V，每个词被表示为一个 V 维向量，仅有一个位置为 1，其余全为 0。例如，词表为 ["cat", "dog", "fish"] 时，"cat" = [1,0,0]，"dog" = [0,1,0]。

one-hot 编码有两个致命缺陷。第一是维度灾难：现代 NLP 任务的词表通常超过 10 万，导致向量极度稀疏，计算效率极低。第二是语义鸿沟：任意两个不同词之间的余弦相似度都是 0——"猫"和"狗"的语义相近性完全无法表达。

1986 年，Hinton 首次提出了分布式表示（Distributed Representation）的概念：用一个低维、稠密的实值向量来表示每个词，向量中的每个维度都编码了某种语义特征。这意味着"猫"和"狗"的向量会在某些维度上接近，而"猫"和"汽车"则相距较远。

2013 年，Mikolov 等人发表的 Word2Vec 将这一想法推向了实用化。Word2Vec 的核心洞见是：一个词的含义由它的上下文决定（Distributional Hypothesis）。通过设计一个简单的神经网络任务来预测上下文，训练过程中学到的隐藏层权重就是高质量的词向量。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def one_hot_encode(word, vocab):
    """将词转换为 one-hot 编码"""
    vec = np.zeros(len(vocab))
    vec[vocab.index(word)] = 1.0
    return vec

vocab = ["cat", "dog", "fish", "bird", "car", "bike"]
cat_vec = one_hot_encode("cat", vocab)
dog_vec = one_hot_encode("dog", vocab)

print(f"cat  one-hot: {cat_vec}")
print(f"dog  one-hot: {dog_vec}")
print(f"余弦相似度: {np.dot(cat_vec, dog_vec):.4f}  (应为 0)")`,
          },
          {
            lang: "python",
            code: `import numpy as np

def cosine_similarity(a, b):
    """计算两个向量的余弦相似度"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 模拟训练好的词向量（稠密、低维）
embeddings = {
    "cat":    np.array([0.8,  0.3, -0.2,  0.5]),
    "dog":    np.array([0.7,  0.4, -0.1,  0.6]),
    "fish":   np.array([0.3,  0.6,  0.8,  0.1]),
    "car":    np.array([-0.5, -0.3,  0.1, -0.7]),
    "bike":   np.array([-0.4, -0.2,  0.2, -0.6]),
}

print("动物间相似度:")
print(f"  cat-dog: {cosine_similarity(embeddings['cat'], embeddings['dog']):.4f}")
print(f"  cat-fish: {cosine_similarity(embeddings['cat'], embeddings['fish']):.4f}")
print("交通工具间相似度:")
print(f"  car-bike: {cosine_similarity(embeddings['car'], embeddings['bike']):.4f}")
print("跨类别相似度:")
print(f"  cat-car: {cosine_similarity(embeddings['cat'], embeddings['car']):.4f}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# 演示分布式表示如何编码语义特征
# 假设四个维度分别编码: [是否动物, 是否家养, 是否水生, 是否交通工具]
semantic_dims = ["动物", "家养", "水生", "交通工具"]

conceptual = {
    "cat":  np.array([ 1.0,  1.0, -0.5, -1.0]),
    "dog":  np.array([ 1.0,  1.0, -0.8, -1.0]),
    "fish": np.array([ 1.0,  0.3,  1.0, -1.0]),
    "bird": np.array([ 1.0,  0.5, -0.5, -0.8]),
    "car":  np.array([-1.0, -1.0, -1.0,  1.0]),
    "bike": np.array([-1.0, -0.8, -1.0,  0.9]),
}

print("语义维度解释:")
for word, vec in conceptual.items():
    features = ", ".join(f"{d}={v:+.1f}" for d, v in zip(semantic_dims, vec))
    print(f"  {word:5s}: {features}")`,
          },
        ],
        table: {
          headers: ["表示方式", "维度", "稀疏性", "语义相似性", "代表方法"],
          rows: [
            ["One-hot", "V（词表大小）", "✅ 极度稀疏", "❌ 无法表达", "传统 NLP"],
            ["TF-IDF", "V", "✅ 稀疏", "⚠️ 文档级", "信息检索"],
            ["分布式表示", "d << V (50~500)", "✅ 稠密", "✅ 词级语义", "Word2Vec/GloVe"],
          ],
        },
        mermaid: `graph LR
    A["词表 V=100,000"] -->|one-hot| B["100,000 维稀疏向量"]
    A -->|分布式表示| C["300 维稠密向量"]
    B --> D["余弦相似度 = 0"]
    C --> E["余弦相似度 ≈ 语义相似度"]
    E --> F["猫 ≈ 狗 > 汽车"]
    style B fill:#fdd
    style C fill:#dfd
    style E fill:#dfd`,
        tip: "分布式表示的关键洞察：不要把每个词当作孤立的符号，而是看作语义空间中的一个点。空间中距离近的点，含义也相近。",
        warning: "词嵌入的维度不是越大越好。300 维通常是性价比最高的选择——过小无法捕获足够语义，过大则容易过拟合并浪费计算资源。",
      },
      {
        title: "2. 语言模型与神经网络",
        body: `语言模型的核心任务是估计一个词序列的概率：P(w₁, w₂, ..., wₙ)。根据链式法则，这可以分解为条件概率的连乘：P(w₁, w₂, ..., wₙ) = Π P(wᵢ | w₁, ..., wᵢ₋₁)。

传统的 N-gram 语言模型用前 N-1 个词预测下一个词。但 N-gram 面临严重的数据稀疏问题：随着 N 增大，可能的 N-gram 组合呈指数增长，绝大多数组合在训练数据中从未出现过。平滑技术（如 Kneser-Ney）只能部分缓解。

2003 年，Bengio 等人提出了划时代的神经网络语言模型（Neural Probabilistic Language Model）。他们的核心思想是：先为每个词学习一个低维稠密向量（即词嵌入），然后用这些向量作为前馈神经网络的输入来预测下一个词。

具体流程：(1) 将上下文词 wᵢ₋ₙ₊₁...wᵢ₋₁ 映射为稠密向量 C(w)；(2) 将这些向量拼接后输入隐藏层 h = tanh(b + H·x)；(3) 通过输出层计算词表上的概率分布 P(wᵢ | context) = softmax(b + U·x + W·h)。

这个模型的关键贡献在于：词嵌入 C 和语言模型参数是联合训练的。词向量不是预先给定的，而是在语言建模任务中自动学习得到的。这也意味着，词嵌入的质量直接受益于语言模型训练数据的规模。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class SimpleNgramModel:
    """简单的 N-gram 语言模型（基于计数）"""

    def __init__(self, n=3):
        self.n = n
        self.counts = {}  # (context) -> {next_word: count}
        self.context_counts = {}  # (context) -> total

    def train(self, sentences):
        for sent in sentences:
            tokens = ["<BOS>"] * (self.n - 1) + sent + ["<EOS>"]
            for i in range(self.n - 1, len(tokens)):
                context = tuple(tokens[i - self.n + 1:i])
                word = tokens[i]
                self.counts.setdefault(context, {})
                self.counts[context][word] = self.counts[context].get(word, 0) + 1
                self.context_counts[context] = self.context_counts.get(context, 0) + 1

    def predict(self, context):
        """返回下一个词的概率分布"""
        counts = self.counts.get(context, {})
        total = self.context_counts.get(context, 0)
        if total == 0:
            return {}
        return {w: c / total for w, c in counts.items()}

# 训练
sentences = [
    ["I", "love", "natural", "language", "processing"],
    ["I", "love", "machine", "learning"],
    ["I", "like", "natural", "language", "processing"],
]
model = SimpleNgramModel(n=3)
model.train(sentences)
print("P(w | 'I love'):", model.predict(("I", "love")))`,
          },
          {
            lang: "python",
            code: `import numpy as np

class BengioNeuralLM:
    """简化的 Bengio 2003 神经网络语言模型"""

    def __init__(self, vocab_size, context_len, embed_dim, hidden_dim):
        self.vocab_size = vocab_size
        self.context_len = context_len
        self.embed_dim = embed_dim
        self.hidden_dim = hidden_dim

        # 词嵌入矩阵 C: V × d
        self.C = np.random.randn(vocab_size, embed_dim) * 0.01
        # 隐藏层: H (d*n → h) + 偏置 b
        self.H = np.random.randn(context_len * embed_dim, hidden_dim) * 0.01
        self.b = np.zeros(hidden_dim)
        # 输出层: U (d*n → V) + W (h → V) + 偏置
        self.U = np.random.randn(context_len * embed_dim, vocab_size) * 0.01
        self.W = np.random.randn(hidden_dim, vocab_size) * 0.01

    def forward(self, context_indices):
        """前向传播，返回 logits"""
        # 获取上下文词的嵌入
        x = self.C[context_indices].flatten()  # (context_len * embed_dim,)
        h = np.tanh(self.b + self.H.T @ x)     # (hidden_dim,)
        logits = self.U.T @ x + self.W.T @ h   # (vocab_size,)
        return logits, x, h

    def predict_proba(self, context_indices):
        """返回下一个词的概率分布"""
        logits, _, _ = self.forward(context_indices)
        exp_logits = np.exp(logits - np.max(logits))
        return exp_logits / exp_logits.sum()

model = BengioNeuralLM(vocab_size=100, context_len=2, embed_dim=8, hidden_dim=16)
context = np.array([5, 12])  # 两个上下文词的索引
probs = model.predict_proba(context)
top5 = np.argsort(probs)[::-1][:5]
for idx in top5:
    print(f"  词 {idx}: P = {probs[idx]:.6f}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

def softmax(x):
    """数值稳定的 softmax"""
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()

def cross_entropy_loss(probs, target_idx):
    """交叉熵损失"""
    return -np.log(probs[target_idx] + 1e-10)

# 演示：N-gram 稀疏性 vs 神经网络泛化
def demonstrate_sparsity():
    """展示 N-gram 模型的稀疏性问题"""
    vocab_size = 10000
    n = 5
    possible_ngrams = vocab_size ** n  # 10^20
    print(f"5-gram 可能组合数: {possible_ngrams:.2e}")
    print(f"典型训练集规模: ~10^9 tokens")
    print(f"覆盖率: {10**9 / possible_ngrams:.2e} (几乎为零)")

demonstrate_sparsity()

# 神经网络的泛化优势
print("\\n神经网络优势:")
print("- 词嵌入: 相似词共享表示，隐式泛化")
print("- 隐藏层: 学习非线性组合模式")
print("- 参数共享: O(V·d + d·n·h + h·V) << O(Vⁿ)")`,
          },
        ],
        table: {
          headers: ["模型类型", "泛化能力", "参数量", "数据稀疏问题", "词嵌入"],
          rows: [
            ["N-gram", "❌ 仅匹配", "O(Vᴺ)", "❌ 严重", "无"],
            ["Bengio NPLM", "✅ 隐式泛化", "O(V·d + d·h + h·V)", "✅ 缓解", "联合学习"],
            ["Word2Vec", "✅ 强泛化", "O(V·d)", "✅ 很好", "核心目标"],
          ],
        },
        mermaid: `graph TB
    A["上下文词 w₁, w₂, ..., wₙ₋₁"] --> B["词嵌入矩阵 C"]
    B --> C["拼接: x = [C(w₁); ...; C(wₙ₋₁)]"]
    C --> D["隐藏层: h = tanh(b + Hx)"]
    C --> E["直接映射: Ux"]
    D --> F["Wh"]
    E --> G["Ux + Wh + b"]
    F --> G
    G --> H["Softmax"]
    H --> I["P(wₙ | context)"]
    style B fill:#bbf
    style H fill:#bfb`,
        tip: "Bengio 2003 论文是深度学习在 NLP 领域的开山之作。它第一次证明了词嵌入和语言模型可以联合训练，这一思想直接启发了后来的 Word2Vec。",
        warning: "Bengio 模型的计算瓶颈在 Softmax 层：输出层矩阵大小为 V × h，当 V = 100,000 时，每次前向传播需要数百万次乘法运算。这也是后来 Word2Vec 要引入负采样和层次 Softmax 的原因。",
      },
      {
        title: "3. CBOW 模型",
        body: `CBOW（Continuous Bag of Words）是 Word2Vec 的两个核心架构之一。它的任务非常简单：给定一个词的上下文（周围的词），预测这个词本身。

具体来说，对于中心词 wₜ 和上下文窗口 [wₜ₋₂, wₜ₋₁, wₜ₊₁, wₜ₊₂]，CBOW 将上下文词的词向量取平均作为输入：x = (1/4)·[v(wₜ₋₂) + v(wₜ₋₁) + v(wₜ₊₁) + v(wₜ₊₂)]，然后通过 softmax 层预测中心词 wₜ 的概率。

数学上，CBOW 的目标函数是最大化训练语料中所有位置的条件对数概率之和：J = Σₜ log P(wₜ | wₜ₋c, ..., wₜ₊c)，其中 c 是上下文窗口大小。

CBOW 的核心架构包含两个矩阵：输入矩阵 Wᵢₙ（V × d），每行对应一个输入词的词向量；输出矩阵 Wₒᵤₜ（d × V），每列对应一个输出词的词向量。注意，同一个词在输入矩阵和输出矩阵中有两组不同的向量。

由于 CBOW 对上下文取了平均，它对上下文词的顺序不敏感。这使得 CBOW 训练速度较快，适合小规模数据集。但在需要捕捉上下文顺序信息的任务中，Skip-gram 通常表现更好。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class CBOW:
    """Continuous Bag of Words 模型（简化实现）"""

    def __init__(self, vocab_size, embed_dim, window_size=2):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.window_size = window_size
        # 输入矩阵 W_in: V × d
        self.W_in = np.random.randn(vocab_size, embed_dim) * 0.1
        # 输出矩阵 W_out: d × V
        self.W_out = np.random.randn(embed_dim, vocab_size) * 0.1

    def forward(self, context_indices):
        """前向传播：上下文词向量平均 → softmax"""
        # 获取上下文词的输入嵌入并取平均
        context_vectors = self.W_in[context_indices]  # (2c, d)
        x = np.mean(context_vectors, axis=0)          # (d,)
        # 计算 logits
        logits = self.W_out.T @ x                      # (V,)
        # softmax
        exp_logits = np.exp(logits - np.max(logits))
        probs = exp_logits / exp_logits.sum()
        return probs, x

    def get_word_vector(self, word_idx):
        """获取词的嵌入向量"""
        return self.W_in[word_idx]

# 测试
vocab = {"我": 0, "爱": 1, "自然": 2, "语言": 3, "处理": 4}
model = CBOW(vocab_size=5, embed_dim=4, window_size=2)
context = np.array([0, 1, 3, 4])  # "我", "爱", "语言", "处理"
probs, hidden = model.forward(context)
print(f"隐藏层表示: {hidden}")
print(f"预测概率: {probs}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

class CBOWTrainer:
    """CBOW 模型训练（使用 SGD + 负采样）"""

    def __init__(self, vocab_size, embed_dim, lr=0.025, neg_samples=5):
        self.embed_dim = embed_dim
        self.lr = lr
        self.neg_samples = neg_samples
        self.W_in = (np.random.rand(vocab_size, embed_dim) - 0.5) / embed_dim
        self.W_out = np.zeros((vocab_size, embed_dim))

    def _sigmoid(self, x):
        return 1.0 / (1.0 + np.exp(-np.clip(x, -10, 10)))

    def train_step(self, center_idx, context_indices):
        """单次训练步（含负采样）"""
        # 正样本
        context_mean = np.mean(self.W_in[context_indices], axis=0)
        positive = self.W_out[center_idx]
        score = np.dot(context_mean, positive)
        prob = self._sigmoid(score)
        # 梯度
        grad_in = (prob - 1.0) * positive
        grad_out = (prob - 1.0) * context_mean
        self.W_out[center_idx] -= self.lr * grad_out
        self.W_in[context_indices] -= self.lr * grad_in / len(context_indices)
        # 负样本
        neg_indices = np.random.randint(0, self.W_out.shape[0], self.neg_samples)
        for neg_idx in neg_indices:
            if neg_idx == center_idx:
                continue
            neg_vec = self.W_out[neg_idx]
            score = np.dot(context_mean, neg_vec)
            prob = self._sigmoid(score)
            grad_in = prob * neg_vec
            grad_out = prob * context_mean
            self.W_out[neg_idx] += self.lr * grad_out
            self.W_in[context_indices] += self.lr * grad_in / len(context_indices)

model = CBOWTrainer(vocab_size=100, embed_dim=16, neg_samples=5)
# 模拟训练：中心词=5，上下文=[3,4,6,7]
for epoch in range(100):
    model.train_step(center_idx=5, context_indices=np.array([3, 4, 6, 7]))
print(f"训练后词向量范数: {np.linalg.norm(model.W_in[5]):.4f}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# CBOW 的数学推导演示
def cbow_gradient_analysis():
    """分析 CBOW 的梯度流"""
    vocab_size = 1000
    embed_dim = 50
    window_size = 2

    W_in = np.random.randn(vocab_size, embed_dim) * 0.1
    W_out = np.random.randn(vocab_size, embed_dim) * 0.1

    center_word = 42
    context = np.array([40, 41, 43, 44])  # 前后各2个词

    # 前向传播
    h = np.mean(W_in[context], axis=0)  # 隐藏层 (d,)
    logits = W_out @ h                   # (V,)
    probs = np.exp(logits - logits.max())
    probs /= probs.sum()

    # 梯度
    target = np.zeros(vocab_size)
    target[center_word] = 1.0
    d_logits = probs - target  # (V,)

    # 参数梯度
    dW_out = np.outer(d_logits, h)           # (V, d)
    dW_in_context = (1 / len(context)) * W_out.T @ d_logits  # (2c, d)

    print(f"隐藏层均值: {h.mean():.4f}, 范数: {np.linalg.norm(h):.4f}")
    print(f"预测中心词概率: {probs[center_word]:.6f}")
    print(f"梯度范数 ||dW_out||: {np.linalg.norm(dW_out):.4f}")
    print(f"梯度范数 ||dW_in||: {np.linalg.norm(dW_in_context):.4f}")

cbow_gradient_analysis()`,
          },
        ],
        table: {
          headers: ["组件", "形状", "作用", "更新方式"],
          rows: [
            ["W_in（输入矩阵）", "V × d", "存储输入词向量", "上下文词共享梯度"],
            ["W_out（输出矩阵）", "V × d", "存储输出词向量", "中心词 + 负样本更新"],
            ["隐藏层 h", "d", "上下文向量平均", "前向计算，不存储参数"],
            ["Softmax 输出", "V", "词表上的概率分布", "梯度反向传播"],
          ],
        },
        mermaid: `graph LR
    A["wₜ₋₂"] -->|v(wₜ₋₂)| E["平均池化"]
    B["wₜ₋₁"] -->|v(wₜ₋₁)| E
    C["wₜ₊₁"] -->|v(wₜ₊₁)| E
    D["wₜ₊₂"] -->|v(wₜ₊₂)| E
    E -->|"h = mean(v)"| F["隐藏层 h"]
    F --> G["W_out · h"]
    G --> H["Softmax"]
    H --> I["P(wₜ | context)"]
    style E fill:#bbf
    style H fill:#bfb`,
        tip: "CBOW 的窗口大小是一个重要超参数。小窗口（2-5）捕获句法信息（词性、搭配），大窗口（10-20）捕获主题信息（文档级语义）。根据任务需求选择合适的窗口。",
        warning: "CBOW 对上下文取平均的操作会导致信息损失——它无法区分 '狗 咬 人' 和 '人 咬 狗' 这样的语序差异。如果语序对你的任务很重要，请考虑 Skip-gram 或其他架构。",
      },
      {
        title: "4. Skip-gram 模型",
        body: `Skip-gram 是 Word2Vec 的另一个核心架构，与 CBOW 恰好相反：它用中心词预测上下文。给定中心词 wₜ，模型试图最大化其上下文中每个词的条件概率之和：J = Σₜ Σ₋c≤j≤c,j≠0 log P(wₜ₊ⱼ | wₜ)。

Skip-gram 的前向传播更简单：直接将中心词的词向量 v(wₜ) 输入到输出层，对上下文中的每个词分别计算 softmax 概率。这意味着一个训练样本（中心词 + 上下文窗口）会产生 2c 个预测任务。

Skip-gram 相比 CBOW 有两个关键优势。第一，它对罕见词更友好——每个上下文词都独立接收梯度信号，而不是被平均掉。第二，它在小数据集上表现更好，因为更多的训练样本（每个中心词产生 2c 个样本）。

但原始的 Skip-gram 面临计算效率的严峻挑战。Softmax 分母需要对整个词表求和，复杂度为 O(V)。Mikolov 提出了两种解决方案：层次 Softmax（Hierarchical Softmax）和负采样（Negative Sampling）。

层次 Softmax 利用霍夫曼树将 O(V) 的 softmax 计算降为 O(log V)。负采样则更简洁：将多分类问题转化为多个二分类问题，只需更新中心词和少量负样本的向量。负采样的核心公式：J = log σ(v'ₒᵤₜ · vᵢₙ) + Σₖ E[log σ(-v'ₙₑg · vᵢₙ)]。

负采样的采样分布也很讲究。Mikolov 提出使用 P(w)^(3/4) 的 unigram 分布（即词频的 3/4 次方归一化），这样可以给低频词更高的采样概率，使它们获得足够的训练信号。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class SkipGram:
    """Skip-gram 模型实现"""

    def __init__(self, vocab_size, embed_dim):
        self.embed_dim = embed_dim
        self.W_in = (np.random.rand(vocab_size, embed_dim) - 0.5) / embed_dim
        self.W_out = np.zeros((vocab_size, embed_dim))

    def _sigmoid(self, x):
        return 1.0 / (1.0 + np.exp(-np.clip(x, -10, 10)))

    def forward(self, center_idx):
        """前向传播，返回所有词的概率（仅用于演示，实际用负采样）"""
        v = self.W_in[center_idx]
        logits = self.W_out @ v
        exp_logits = np.exp(logits - logits.max())
        return exp_logits / exp_logits.sum(), v

    def negative_sampling_step(self, center_idx, target_idx, neg_indices, lr=0.025):
        """负采样训练步"""
        v = self.W_in[center_idx]
        loss = 0.0

        # 正样本
        pos_score = np.dot(self.W_out[target_idx], v)
        pos_prob = self._sigmoid(pos_score)
        loss -= np.log(pos_prob + 1e-10)
        grad_pos = (pos_prob - 1.0) * v
        grad_v_pos = (pos_prob - 1.0) * self.W_out[target_idx]

        self.W_out[target_idx] -= lr * grad_pos
        self.W_in[center_idx] -= lr * grad_v_pos

        # 负样本
        for neg_idx in neg_indices:
            neg_score = np.dot(self.W_out[neg_idx], v)
            neg_prob = self._sigmoid(neg_score)
            loss -= np.log(1.0 - neg_prob + 1e-10)
            grad_neg = neg_prob * v
            grad_v_neg = neg_prob * self.W_out[neg_idx]
            self.W_out[neg_idx] += lr * grad_neg
            self.W_in[center_idx] += lr * grad_v_neg

        return loss

model = SkipGram(vocab_size=100, embed_dim=16)
for _ in range(500):
    negs = np.random.choice([i for i in range(100) if i != 7], 5, replace=False)
    loss = model.negative_sampling_step(center_idx=5, target_idx=7, neg_indices=negs)
print(f"训练损失: {loss:.4f}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

def negative_sampling_distribution(word_counts, power=0.75):
    """
    计算负采样分布 P(w)^(3/4)
    这是 Mikolov 论文中的关键技巧
    """
    counts = np.array(word_counts, dtype=float)
    # 将词频提升到 3/4 次方
    powered = counts ** power
    return powered / powered.sum()

# 模拟词频分布（符合 Zipf 定律）
vocab = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "rare_word"]
freqs = [10000, 5000, 3000, 2500, 2000, 1800, 1500, 1200, 1000, 10]

original = np.array(freqs) / sum(freqs)
neg_sampling = negative_sampling_distribution(freqs)

print("词频 vs 负采样分布对比:")
print(f"{'词':<12} {'原始P(w)':>10} {'P(w)^0.75':>10} {'比值':>8}")
for i, word in enumerate(vocab):
    ratio = neg_sampling[i] / original[i] if original[i] > 0 else 0
    print(f"{word:<12} {original[i]:>10.6f} {neg_sampling[i]:>10.6f} {ratio:>8.2f}x")`,
          },
          {
            lang: "python",
            code: `import numpy as np

class HierarchicalSoftmax:
    """层次 Softmax 实现（基于二叉树）"""

    def __init__(self, vocab_size, embed_dim):
        self.embed_dim = embed_dim
        # 内部节点的参数（V-1 个内部节点）
        self.internal_params = np.random.randn(vocab_size - 1, embed_dim) * 0.01

    def _sigmoid(self, x):
        return 1.0 / (1.0 + np.exp(-np.clip(x, -10, 10)))

    def compute_path_probability(self, word_idx, path_codes, path_nodes, word_vector):
        """
        计算从根到叶子（词）的路径概率
        path_codes: 路径上的左右决策 (0=左, 1=右)
        path_nodes: 路径上的内部节点索引
        """
        log_prob = 0.0
        for code, node in zip(path_codes, path_nodes):
            score = np.dot(self.internal_params[node], word_vector)
            prob = self._sigmoid(score)
            if code == 1:  # 右孩子
                log_prob += np.log(prob + 1e-10)
            else:  # 左孩子
                log_prob += np.log(1.0 - prob + 1e-10)
        return log_prob

    def train_step(self, word_idx, path_codes, path_nodes, word_vector, lr=0.025):
        """层次 Softmax 训练步"""
        grad = np.zeros_like(word_vector)
        for code, node in zip(path_codes, path_nodes):
            score = np.dot(self.internal_params[node], word_vector)
            prob = self._sigmoid(score)
            if code == 1:
                grad += (prob - 1.0) * self.internal_params[node]
                self.internal_params[node] -= lr * (prob - 1.0) * word_vector
            else:
                grad += prob * self.internal_params[node]
                self.internal_params[node] -= lr * prob * word_vector
        return grad

# 模拟：词 "cat" 在霍夫曼树中的路径为 [右, 左, 右] = [1, 0, 1]
hs = HierarchicalSoftmax(vocab_size=100, embed_dim=16)
word_vec = np.random.randn(16) * 0.1
log_prob = hs.compute_path_probability(
    word_idx=5,
    path_codes=[1, 0, 1],
    path_nodes=[0, 2, 5],
    word_vector=word_vec
)
print(f"路径对数概率: {log_prob:.4f}")`,
          },
          {
            lang: "python",
            code: `# 对比 CBOW 和 Skip-gram 的训练样本生成
def generate_training_samples(sentence, window_size=2):
    """从句子生成 CBOW 和 Skip-gram 训练样本"""
    samples = {"cbow": [], "skipgram": []}
    for i in range(len(sentence)):
        # 确定上下文窗口
        start = max(0, i - window_size)
        end = min(len(sentence), i + window_size + 1)
        context = [sentence[j] for j in range(start, end) if j != i]
        if not context:
            continue
        center = sentence[i]
        # CBOW: 上下文 → 中心词
        samples["cbow"].append({"context": context, "target": center})
        # Skip-gram: 中心词 → 每个上下文词
        for ctx_word in context:
            samples["skipgram"].append({"center": center, "target": ctx_word})
    return samples

sentence = ["自然", "语言", "处理", "是", "人工", "智能", "的", "重要", "分支"]
samples = generate_training_samples(sentence, window_size=2)

print(f"CBOW 训练样本数: {len(samples['cbow'])}")
print(f"Skip-gram 训练样本数: {len(samples['skipgram'])}")
print(f"\\nCBOW 样本示例:")
for s in samples['cbow'][:2]:
    print(f"  上下文: {s['context']} → 目标: {s['target']}")
print(f"\\nSkip-gram 样本示例:")
for s in samples['skipgram'][:3]:
    print(f"  中心: {s['center']} → 目标: {s['target']}")`,
          },
        ],
        table: {
          headers: ["特性", "CBOW", "Skip-gram"],
          rows: [
            ["预测方向", "上下文 → 中心词", "中心词 → 上下文"],
            ["训练速度", "✅ 较快", "⚠️ 较慢"],
            ["罕见词表示", "⚠️ 较弱（被平均）", "✅ 较强（独立梯度）"],
            ["小数据集表现", "⚠️ 一般", "✅ 更好"],
            ["大数据集表现", "✅ 好", "✅ 好"],
            ["样本数量", "每句 n 个", "每句 2cn 个"],
          ],
        },
        mermaid: `graph LR
    A["中心词 wₜ"] -->|v(wₜ)| B["输入向量"]
    B --> C["W_out · v(wₜ)"]
    C --> D["Softmax"]
    D --> E["P(wₜ₋₂ | wₜ)"]
    D --> F["P(wₜ₋₁ | wₜ)"]
    D --> G["P(wₜ₊₁ | wₜ)"]
    D --> H["P(wₜ₊₂ | wₜ)"]
    style A fill:#f9f
    style D fill:#bfb`,
        tip: "实践中，Skip-gram + 负采样是最常用的组合。推荐参数：embed_dim=300, window_size=5-10, neg_samples=5-15, min_count=5。Gensim 的默认参数已经是很好的起点。",
        warning: "负采样数量不是越多越好。Mikolov 的论文指出：小数据集用 5-20 个负样本，大数据集用 2-5 个就够了。过多的负样本会显著拖慢训练速度，且收益递减。",
      },
      {
        title: "5. GloVe 全局向量",
        body: `GloVe（Global Vectors for Word Representation）是 Stanford 于 2014 年提出的词嵌入方法。它的核心思想是：Word2Vec 只利用了局部上下文窗口信息，而词义也可以从全局共现统计中学习到。

GloVe 的出发点是构建一个全局词-词共现矩阵 X，其中 Xᵢⱼ 表示词 i 和词 j 在整个语料库中共同出现的次数。然后，GloVe 学习两组向量 wᵢ 和 w̃ⱼ，以及对应的偏置 bᵢ 和 b̃ⱼ，使得它们的内积加上偏置等于共现次数的对数：wᵢ · w̃ⱼ + bᵢ + b̃ⱼ = log(Xᵢⱼ)。

GloVe 的损失函数是加权最小二乘法：J = Σᵢⱼ f(Xᵢⱼ) · (wᵢ · w̃ⱼ + bᵢ + b̃ⱼ - log(Xᵢⱼ))²。权重函数 f(x) 的设计非常关键：当 x < x_max 时，f(x) = (x/x_max)^α；当 x ≥ x_max 时，f(x) = 1。通常取 α = 0.75, x_max = 100。这样设计的目的是：对高频共现对给予充分权重，对极低频共现对降低权重（避免噪声主导），对零共现完全不计算（f(0) = 0）。

GloVe 与 Word2Vec 的关系很有趣。数学上可以证明，当 Skip-gram 的负采样数量趋近无穷时，它实际上在隐式地分解一个与 PMI（Pointwise Mutual Information）相关的矩阵。GloVe 则是直接、显式地对共现统计进行建模。因此，GloVe 可以看作是一种"全局版"的 Skip-gram。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from collections import defaultdict

def build_cooccurrence_matrix(sentences, vocab, window_size=5):
    """构建全局词-词共现矩阵"""
    vocab_idx = {w: i for i, w in enumerate(vocab)}
    n = len(vocab)
    X = np.zeros((n, n))

    for sent in sentences:
        for i, word in enumerate(sent):
            if word not in vocab_idx:
                continue
            wi = vocab_idx[word]
            # 使用距离衰减权重
            start = max(0, i - window_size)
            end = min(len(sent), i + window_size + 1)
            for j in range(start, end):
                if j == i or sent[j] not in vocab_idx:
                    continue
                wj = vocab_idx[sent[j]]
                distance = abs(i - j)
                X[wi][wj] += 1.0 / distance  # 远距离权重更低

    return X

sentences = [
    ["cat", "sit", "on", "mat"],
    ["dog", "sit", "on", "rug"],
    ["cat", "chase", "mouse"],
    ["dog", "chase", "cat"],
]
vocab = sorted(set(w for s in sentences for w in s))
X = build_cooccurrence_matrix(sentences, vocab, window_size=2)

print("共现矩阵:")
print(f"{'':>8}", "".join(f"{w:>8}" for w in vocab))
for i, w in enumerate(vocab):
    print(f"{w:>8}", "".join(f"{X[i][j]:>8.1f}" for j in range(len(vocab))))`,
          },
          {
            lang: "python",
            code: `import numpy as np

class GloVe:
    """GloVe 模型的简化实现"""

    def __init__(self, vocab_size, embed_dim, x_max=100, alpha=0.75):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.x_max = x_max
        self.alpha = alpha
        # 初始化参数
        self.W = (np.random.rand(vocab_size, embed_dim) - 0.5) / embed_dim
        self.W_tilde = (np.random.rand(vocab_size, embed_dim) - 0.5) / embed_dim
        self.b = (np.random.rand(vocab_size) - 0.5) / embed_dim
        self.b_tilde = (np.random.rand(vocab_size) - 0.5) / embed_dim

    def f(self, x):
        """权重函数 f(x)"""
        if x >= self.x_max:
            return 1.0
        return (x / self.x_max) ** self.alpha

    def loss(self, cooccurrence_matrix):
        """计算 GloVe 损失"""
        total_loss = 0.0
        nonzero = np.argwhere(cooccurrence_matrix > 0)
        for i, j in nonzero:
            x_ij = cooccurrence_matrix[i, j]
            diff = np.dot(self.W[i], self.W_tilde[j]) + self.b[i] + self.b_tilde[j]
            diff -= np.log(x_ij)
            total_loss += self.f(x_ij) * diff ** 2
        return total_loss / 2

    def train_step(self, i, j, x_ij, lr=0.05):
        """单次梯度更新"""
        diff = np.dot(self.W[i], self.W_tilde[j]) + self.b[i] + self.b_tilde[j]
        diff -= np.log(x_ij)
        weight = self.f(x_ij)
        grad = weight * diff

        # 更新参数
        self.W[i] -= lr * grad * self.W_tilde[j]
        self.W_tilde[j] -= lr * grad * self.W[i]
        self.b[i] -= lr * grad
        self.b_tilde[j] -= lr * grad

        return weight * diff ** 2

# 训练
model = GloVe(vocab_size=10, embed_dim=8)
X = np.random.rand(10, 10) * 5
X = (X + X.T) / 2  # 对称
np.fill_diagonal(X, 0)

for epoch in range(100):
    nonzero = np.argwhere(X > 0)
    total_loss = 0
    for i, j in nonzero:
        total_loss += model.train_step(i, j, X[i, j])
    if epoch % 20 == 0:
        print(f"Epoch {epoch}: loss = {total_loss:.4f}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# 展示 GloVe 与 Skip-gram 的数学联系
def pmi_matrix(cooccurrence_matrix):
    """计算 PMI（Pointwise Mutual Information）矩阵"""
    # P(i, j) = X(i,j) / sum(X)
    total = cooccurrence_matrix.sum()
    P_joint = cooccurrence_matrix / total
    # P(i) = sum(X(i,:)) / sum(X)
    P_i = cooccurrence_matrix.sum(axis=1) / total
    P_j = cooccurrence_matrix.sum(axis=0) / total
    # PMI(i,j) = log(P(i,j) / (P(i) * P(j)))
    P_product = np.outer(P_i, P_j)
    with np.errstate(divide='ignore'):
        pmi = np.log(P_joint / P_product)
    pmi[~np.isfinite(pmi)] = 0
    return pmi

# 简单共现矩阵
X = np.array([
    [0, 10,  2,  1],
    [10,  0,  8,  1],
    [ 2,  8,  0,  5],
    [ 1,  1,  5,  0],
])
pmi = pmi_matrix(X)

print("PMI 矩阵:")
words = ["cat", "dog", "fish", "bird"]
print(f"{'':>6}", "".join(f"{w:>8}" for w in words))
for i, w in enumerate(words):
    print(f"{w:>6}", "".join(f"{pmi[i][j]:>8.2f}" for j in range(len(words))))
print("\\n高 PMI 值 → 强共现关系（词义相关）")
print("低 PMI 值 → 弱共现关系（词义无关）")`,
          },
        ],
        table: {
          headers: ["特性", "Word2Vec (Skip-gram)", "GloVe"],
          rows: [
            ["信息来源", "局部上下文窗口", "全局共现矩阵"],
            ["优化目标", "最大化上下文概率", "加权最小二乘拟合 log(Xᵢⱼ)"],
            ["训练方式", "在线（SGD 逐样本）", "批量（利用全局统计）"],
            ["对罕见词", "✅ 负采样有效", "⚠️ 低共现被降权"],
            ["类比任务", "✅ 好", "✅ 略优"],
            ["可扩展性", "✅ 流式训练", "⚠️ 需构建共现矩阵"],
          ],
        },
        mermaid: `graph TB
    A["大规模语料库"] --> B["构建共现矩阵 X"]
    B --> C["Xᵢⱼ = 词 i 和 j 的共现次数"]
    C --> D["权重函数 f(Xᵢⱼ)"]
    D --> E["f(x) = min((x/x_max)^α, 1)"]
    E --> F["损失: f(Xᵢⱼ)·(wᵢ·w̃ⱼ + bᵢ + b̃ⱼ - log Xᵢⱼ)²"]
    F --> G["SGD 优化"]
    G --> H["最终向量: W + W_tilde"]
    style B fill:#bbf
    style F fill:#f9a
    style H fill:#bfb`,
        tip: "GloVe 的最佳实践：在大规模语料（如 Wikipedia + Gigaword）上训练时，GloVe 的表现通常略优于 Word2Vec。推荐使用官方预训练的 GloVe 向量（6B tokens, 300d），可以直接下载使用。",
        warning: "GloVe 需要先构建完整的共现矩阵，这意味着你必须先遍历整个语料库。对于流式数据或持续更新的场景，Word2Vec 的在线训练方式更为合适。",
      },
      {
        title: "6. FastText 子词嵌入",
        body: `FastText 是 Facebook AI Research 于 2016 年提出的词嵌入方法，是对 Word2Vec 的重要改进。它解决了一个关键问题：如何处理未登录词（Out-Of-Vocabulary, OOV）？

在 Word2Vec 中，每个词被当作不可分割的整体来学习向量。这意味着训练词表中不存在的词完全无法处理——你得到的只是一个空向量或报错。这在形态丰富的语言（如德语、土耳其语、芬兰语）中尤为严重。

FastText 的核心创新是引入子词（subword）信息。它将每个词表示为字符 n-gram 的集合。例如，单词 "apple" 在 n=3 时被分解为："<ap", "app", "ppl", "ple", "le>"（加上边界符 < 和 >）。FastText 为每个字符 n-gram 学习一个向量，然后将它们求和作为词的最终表示。

数学上，FastText 的词向量 v(w) = Σ₉∈G(w) z_g，其中 G(w) 是词 w 的所有字符 n-gram 集合，z_g 是 n-gram g 的向量。注意，整个词本身也被视为一个特殊的 n-gram（即 unigram 的情况），这样保证了 FastText 能退化为标准的 Skip-gram。

这一设计的优雅之处在于：即使遇到训练时未见过的词，只要它的字符 n-gram 有部分出现在训练数据中，FastText 就能通过组合这些已知的 n-gram 向量来生成合理的词表示。例如，"unhappiness" 虽然未见过，但 "un-", "-ness", "happi-" 等子词都很常见。`,
        code: [
          {
            lang: "python",
            code: `def get_char_ngrams(word, min_n=3, max_n=6):
    """获取词的字符 n-gram 集合（带边界符）"""
    word = f"<{word}>"  # 添加边界符
    ngrams = []
    for n in range(min_n, max_n + 1):
        for i in range(len(word) - n + 1):
            ngrams.append(word[i:i+n])
    return ngrams

# 演示
words = ["apple", "applying", "unhappiness", "快"]
for word in words:
    ngrams = get_char_ngrams(word)
    print(f"{word:15s} → {len(ngrams):3d} n-grams: {ngrams[:5]}{'...' if len(ngrams) > 5 else ''}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

class FastTextModel:
    """简化的 FastText 模型（基于子词嵌入）"""

    def __init__(self, vocab, embed_dim, min_n=3, max_n=6, num_buckets=2000000):
        self.vocab = vocab
        self.vocab_idx = {w: i for i, w in enumerate(vocab)}
        self.embed_dim = embed_dim
        self.min_n = min_n
        self.max_n = max_n
        self.num_buckets = num_buckets  # 哈希桶数量

        # 词向量（vocab 大小）
        self.word_embeddings = np.random.randn(len(vocab), embed_dim) * 0.01
        # 子词向量（哈希桶大小）
        self.subword_embeddings = np.random.randn(num_buckets, embed_dim) * 0.01

    def _hash(self, ngram):
        """简单哈希到桶索引"""
        h = 0
        for c in ngram:
            h = (h * 31 + ord(c)) % self.num_buckets
        return h

    def get_word_representation(self, word):
        """获取词的完整表示（词向量 + 子词向量之和）"""
        word_idx = self.vocab_idx.get(word)
        if word_idx is None:
            # OOV 词：只用子词
            vec = np.zeros(self.embed_dim)
        else:
            vec = self.word_embeddings[word_idx].copy()

        ngrams = self._get_ngrams(word)
        for ng in ngrams:
            bucket = self._hash(ng)
            vec += self.subword_embeddings[bucket]
        return vec

    def _get_ngrams(self, word):
        word = f"<{word}>"
        ngrams = []
        for n in range(self.min_n, self.max_n + 1):
            for i in range(len(word) - n + 1):
                ngrams.append(word[i:i+n])
        return ngrams

# 测试
vocab = ["apple", "apply", "applied", "happy", "happiness"]
model = FastTextModel(vocab, embed_dim=16)

# 已知词
apple_vec = model.get_word_representation("apple")
# OOV 词
apples_vec = model.get_word_representation("apples")

sim = np.dot(apple_vec, apples_vec) / (np.linalg.norm(apple_vec) * np.linalg.norm(apples_vec))
print(f"'apple' 与 'apples' (OOV) 相似度: {sim:.4f}")
print("即使 'apples' 不在词表中，也能获得有意义的表示！")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# FastText 子词嵌入的优势演示：形态丰富的语言
def demonstrate_morphology():
    """展示 FastText 如何处理形态变化"""
    # 模拟学习到的子词嵌入
    subword_vecs = {
        "<un":    np.array([ 0.8, -0.2,  0.5]),
        "happy":  np.array([ 0.9,  0.7, -0.3]),
        "ppin":   np.array([ 0.1,  0.3,  0.2]),
        "iness>": np.array([-0.3,  0.6,  0.4]),
        "ly>":    np.array([ 0.2, -0.5,  0.6]),
        "<re":    np.array([ 0.6, -0.1, -0.3]),
    }

    def subword_sum(word):
        word = f"<{word}>"
        ngrams = set()
        for n in range(3, 7):
            for i in range(len(word) - n + 1):
                ng = word[i:i+n]
                if ng in subword_vecs:
                    ngrams.add(ng)
        if not ngrams:
            return np.zeros(3)
        return sum(subword_vecs[ng] for ng in ngrams) / len(ngrams)

    words = ["unhappiness", "happily", "reapply"]
    print("子词组合生成词向量:")
    for w in words:
        v = subword_sum(w)
        print(f"  {w:15s} → {v}")

demonstrate_morphology()`,
          },
          {
            lang: "python",
            code: `# 使用 gensim 训练 FastText
try:
    from gensim.models import FastText
    from gensim.test.utils import common_texts

    # 训练 FastText
    model = FastText(
        sentences=common_texts,
        vector_size=100,
        window=5,
        min_count=1,
        min_n=3,        # 最小字符 n-gram 长度
        max_n=6,        # 最大字符 n-gram 长度
        epochs=10,
        workers=4,
    )

    # 获取已知词向量
    vec_human = model.wv["human"]
    print(f"'human' 向量形状: {vec_human.shape}")

    # OOV 词也能获得向量！
    oov_words = ["humanness", "humanity", "transhuman"]
    for w in oov_words:
        try:
            vec = model.wv[w]
            sim = model.wv.similarity("human", w)
            print(f"  OOV '{w}': 与 'human' 相似度 = {sim:.4f}")
        except KeyError:
            print(f"  OOV '{w}': 无法表示")
except ImportError:
    print("gensim 未安装，跳过 FastText 演示")
    print("安装: pip install gensim")`,
          },
        ],
        table: {
          headers: ["特性", "Word2Vec", "FastText"],
          rows: [
            ["词表示单位", "完整词", "字符 n-gram"],
            ["OOV 处理", "❌ 无法处理", "✅ 子词组合"],
            ["参数数量", "V × d", "V × d + B × d (B=桶数)"],
            ["形态学语言", "⚠️ 一般", "✅ 优秀"],
            ["训练速度", "✅ 快", "⚠️ 较慢（哈希碰撞）"],
            ["词表外泛化", "❌ 无", "✅ 强"],
          ],
        },
        mermaid: `graph TB
    A["单词: 'unhappiness'"] --> B["字符 n-gram 分解"]
    B --> C["<un, unh, nha, hap, app, ppi, pin, ine, nes, ess, ss>"]
    C --> D["每个 n-gram 映射到哈希桶"]
    D --> E["查找子词向量 z_g"]
    E --> F["v = Σ z_g"]
    F --> G["最终词向量"]
    style A fill:#f9f
    style F fill:#bbf
    style G fill:#bfb`,
        tip: "FastText 在多语言场景下表现尤为出色。对于中文等语言，字符本身就是最小的语义单位，可以将 min_n 和 max_n 都设为 1，此时 FastText 退化为字符级词嵌入。",
        warning: "FastText 的哈希桶大小是一个需要权衡的参数。桶太小会导致大量哈希碰撞，不同 n-gram 共享同一个向量；桶太大则浪费内存。官方推荐 200 万到 20 亿个桶，根据词表大小选择。",
      },
      {
        title: "7. 词嵌入评估与应用",
        body: `如何判断一个词嵌入模型好不好？评估方法分为两大类：内在评估（Intrinsic Evaluation）和外在评估（Extrinsic Evaluation）。

内在评估直接测量词向量本身的语义质量。最经典的任务是词类比（Word Analogy）：给定 "man : woman :: king : ?"，模型应该回答 "queen"。数学上，这等价于寻找使 v(queen) ≈ v(king) - v(man) + v(woman) 成立的词。另一个常用任务是词相似度（Word Similarity）：计算词向量之间的余弦相似度，与人类标注的相似度评分（如 SimLex-999、WordSim-353）计算 Spearman 相关系数。

外在评估则将词向量作为下游任务的输入，看任务性能是否提升。例如，将词向量输入到文本分类、命名实体识别（NER）、情感分析等模型中，观察准确率、F1 分数等指标的变化。外在评估更可靠——因为最终目的是提升下游任务表现，但它的缺点是计算成本高，且结果受到下游模型的影响。

值得注意的是，静态词嵌入（Word2Vec、GloVe、FastText）无法处理一词多义问题。"bank" 在 "river bank" 和 "bank account" 中应该有不同的向量，但静态嵌入只能给出一个固定的表示。这也是后来 ELMo、BERT 等上下文感知词嵌入兴起的根本原因。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def word_analogy(embeddings, word_a, word_b, word_c):
    """
    词类比任务: a : b :: c : ?
    即: 找到 d 使得 v(d) ≈ v(b) - v(a) + v(c)
    """
    if not all(w in embeddings for w in [word_a, word_b, word_c]):
        return None, None

    target = embeddings[word_b] - embeddings[word_a] + embeddings[word_c]

    best_sim = -1
    best_word = None
    for word, vec in embeddings.items():
        if word in [word_a, word_b, word_c]:
            continue
        sim = np.dot(target, vec) / (np.linalg.norm(target) * np.linalg.norm(vec) + 1e-10)
        if sim > best_sim:
            best_sim = sim
            best_word = word
    return best_word, best_sim

# 模拟训练好的词向量
embeddings = {
    "man":    np.array([ 0.9,  0.1,  0.2, -0.1]),
    "woman":  np.array([ 0.8, -0.2,  0.3, -0.1]),
    "king":   np.array([ 0.95, 0.1,  0.5,  0.3]),
    "queen":  np.array([ 0.85,-0.15, 0.55, 0.25]),
    "prince": np.array([ 0.88, 0.05, 0.45, 0.2]),
    "princess": np.array([0.78,-0.1, 0.5,  0.15]),
    "boy":    np.array([ 0.85, 0.15, 0.1, -0.05]),
    "girl":   np.array([ 0.75,-0.15, 0.15,-0.05]),
}

answer, sim = word_analogy(embeddings, "man", "woman", "king")
print(f"man : woman :: king : {answer} (相似度: {sim:.4f})")

answer, sim = word_analogy(embeddings, "boy", "girl", "prince")
print(f"boy : girl :: prince : {answer} (相似度: {sim:.4f})")`,
          },
          {
            lang: "python",
            code: `import numpy as np
from scipy.stats import spearmanr

def evaluate_word_similarity(embeddings, word_pairs, human_scores):
    """
    词相似度评估：计算词向量相似度与人类评分的 Spearman 相关系数
    """
    model_scores = []
    valid_human = []

    for (w1, w2), human in zip(word_pairs, human_scores):
        if w1 in embeddings and w2 in embeddings:
            vec1, vec2 = embeddings[w1], embeddings[w2]
            sim = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2) + 1e-10)
            model_scores.append(sim)
            valid_human.append(human)

    if len(model_scores) < 3:
        return None, None

    corr, p_value = spearmanr(valid_human, model_scores)
    return corr, p_value

# 模拟 WordSim-353 数据集
word_pairs = [
    ("king", "queen"), ("boy", "girl"), ("car", "auto"),
    ("cat", "dog"), ("book", "paper"), ("happy", "sad"),
]
human_scores = [8.5, 8.0, 8.8, 7.5, 6.5, 3.0]  # 人类标注的相似度 (0-10)

embeddings = {
    "king":  np.array([0.9, 0.1, 0.5, 0.3]),
    "queen": np.array([0.85,-0.15,0.55,0.25]),
    "boy":   np.array([0.85, 0.15,0.1,-0.05]),
    "girl":  np.array([0.75,-0.15,0.15,-0.05]),
    "car":   np.array([0.1, 0.2, 0.8, 0.1]),
    "auto":  np.array([0.15,0.25,0.75,0.15]),
    "cat":   np.array([0.8, 0.3,-0.2,0.5]),
    "dog":   np.array([0.7, 0.4,-0.1,0.6]),
    "book":  np.array([0.3, 0.1, 0.6, 0.2]),
    "paper": np.array([0.25,0.15,0.55,0.25]),
    "happy": np.array([0.4, 0.8, 0.1, 0.2]),
    "sad":   np.array([0.3,-0.7, 0.15,0.1]),
}

corr, p_val = evaluate_word_similarity(embeddings, word_pairs, human_scores)
print(f"Spearman 相关系数: {corr:.4f} (p = {p_val:.4f})")
print(f"{'优秀' if corr > 0.7 else '一般' if corr > 0.5 else '较差'} (WordSim-353 基线: ~0.65)")`,
          },
          {
            lang: "python",
            code: `# 使用 gensim 进行完整的词嵌入评估
try:
    from gensim.models import KeyedVectors
    from gensim.downloader import load

    # 加载预训练模型
    print("加载预训练词向量...")
    model = load("glove-wiki-gigaword-100")  # 100d GloVe

    # 1. 词类比评估
    print("\\n=== 词类比任务 ===")
    analogy_pairs = [
        ("man", "woman", "king"),
        ("paris", "france", "berlin"),
        ("big", "bigger", "small"),
    ]
    for a, b, c in analogy_pairs:
        result = model.most_similar(positive=[b, c], negative=[a], topn=1)
        print(f"  {a} : {b} :: {c} : {result[0][0]} ({result[0][1]:.4f})")

    # 2. 词相似度
    print("\\n=== 词相似度 ===")
    pairs = [("cat", "dog"), ("car", "bicycle"), ("happy", "sad")]
    for w1, w2 in pairs:
        sim = model.similarity(w1, w2)
        print(f"  {w1} <-> {w2}: {sim:.4f}")

    # 3. 找最相似的词
    print("\\n=== 最相似词 ===")
    for word in ["computer", "beautiful", "run"]:
        similar = model.most_similar(word, topn=3)
        print(f"  {word}: {', '.join(f'{w}({s:.3f})' for w, s in similar)}")

except Exception as e:
    print(f"gensim 评估跳过: {e}")`,
          },
        ],
        table: {
          headers: ["评估方法", "度量指标", "数据集", "Word2Vec 基线", "GloVe 基线"],
          rows: [
            ["词类比", "准确率", "Google Analogy", "~73%", "~76%"],
            ["词相似度", "Spearman ρ", "WordSim-353", "~0.65", "~0.72"],
            ["语义相关性", "Spearman ρ", "SimLex-999", "~0.35", "~0.40"],
            ["文本分类", "准确率", "SST-2", "~85%", "~86%"],
            ["NER", "F1 分数", "CoNLL-2003", "~88%", "~89%"],
          ],
        },
        mermaid: `graph TB
    A["词嵌入模型"] --> B["内在评估"]
    A --> C["外在评估"]
    B --> D["词类比任务"]
    B --> E["词相似度任务"]
    B --> F["聚类可视化"]
    C --> G["文本分类"]
    C --> H["命名实体识别"]
    C --> I["情感分析"]
    D --> J["准确率: ~73-76%"]
    E --> K["Spearman ρ: ~0.65-0.72"]
    G --> L["F1/Accuracy"]
    H --> M["F1 Score"]
    I --> N["Accuracy"]
    style B fill:#bbf
    style C fill:#bfb`,
        tip: "词嵌入是 NLP 流水线的基石，但已经不是最前沿。如果你在做新项目，建议直接从 BERT/RoBERTa 等上下文嵌入开始——它们在几乎所有下游任务上都显著优于静态词嵌入。但理解 Word2Vec/GloVe 的原理对于掌握 NLP 仍然至关重要。",
        warning: "词嵌入会继承训练数据中的偏见！研究表明，Word2Vec 向量中 'man : woman :: programmer : homemaker' 这样的性别偏见关系清晰可测。在实际应用中，需要意识到这些偏见并采取缓解措施（如 debiasing 技术）。",
      },
    ],
  };
