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
        title: "1. 分布式表示思想：从 One-Hot 到 Dense Vector",
        body: `词嵌入的核心动机来源于 one-hot 编码的致命缺陷。在 one-hot 表示中，词汇表大小为 V 时，每个词是一个 V 维向量，仅一个位置为 1，其余全为 0。这带来三个严重问题：

第一，维度灾难——英语词汇量约 100 万，中文更多，one-hot 向量极度稀疏，存储和计算效率极低。第二，语义真空——"猫"和"狗"的 one-hot 向量正交（内积为 0），模型无法捕捉它们的语义相似性。第三，泛化无能——模型在训练集上见过 "cat"，遇到测试集中的 "kitten" 时完全无法利用已有知识。

**分布式假设（Distributional Hypothesis）** 由 Firth（1957）提出："You shall know a word by the company it keeps"——一个词的含义由其上下文决定。Mikolov 等人将其数学化：将每个词映射到一个低维稠密向量空间（通常 50-300 维），使得语义相似的词在空间中距离更近。

形式化地，词嵌入是一个映射函数 E: V → Rᵈ，其中 d ≪ V。这个映射通过学习得到一个嵌入矩阵 W ∈ R^(V×d)，词 w_i 的向量就是 W 的第 i 行。训练的目标是调整 W，使得共现频繁的词对具有相似的向量表示。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# One-Hot 的问题：语义相似性完全缺失
vocab = ["cat", "dog", "kitten", "car", "bicycle"]
word2idx = {w: i for i, w in enumerate(vocab)}
V = len(vocab)

def one_hot(word):
    vec = np.zeros(V)
    vec[word2idx[word]] = 1
    return vec

cat_vec = one_hot("cat")
dog_vec = one_hot("dog")
car_vec = one_hot("car")

print("=== One-Hot 向量 ===")
print(f"cat:    {cat_vec}")
print(f"dog:    {dog_vec}")
print(f"car:    {car_vec}")
print(f"cat·dog (余弦): {np.dot(cat_vec, dog_vec):.4f}")
print(f"cat·car (余弦): {np.dot(cat_vec, car_vec):.4f}")
# 所有词对的内积都是 0！模型无法区分语义相似性`,
          },
          {
            lang: "python",
            code: `# 分布式表示：词嵌入矩阵
np.random.seed(42)
d = 50  # 嵌入维度

# 模拟训练好的词嵌入矩阵
W = np.random.randn(V, d) * 0.1

def cosine_sim(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

cat_emb = W[word2idx["cat"]]
dog_emb = W[word2idx["dog"]]
car_emb = W[word2idx["car"]]

print("=== 词嵌入向量 (前5维) ===")
print(f"cat: {cat_emb[:5]}")
print(f"dog: {dog_emb[:5]}")
print(f"car: {car_emb[:5]}")

# 假设训练后，语义相似的词向量更近
# 这里用人工调整来演示
W[word2idx["dog"]] = cat_emb + np.random.randn(d) * 0.05
W[word2idx["kitten"]] = cat_emb + np.random.randn(d) * 0.08

dog_emb = W[word2idx["dog"]]
kitten_emb = W[word2idx["kitten"]]

print(f"\\ncat·dog 相似度: {cosine_sim(cat_emb, dog_emb):.4f}")
print(f"cat·kitten 相似度: {cosine_sim(cat_emb, kitten_emb):.4f}")
print(f"cat·car 相似度: {cosine_sim(cat_emb, car_emb):.4f}")`,
          },
          {
            lang: "python",
            code: `# 可视化：词嵌入空间的二维投影
import numpy as np

# 模拟一个训练好的 300 维词嵌入空间
np.random.seed(42)
words = ["king", "queen", "man", "woman", "prince", "princess",
         "cat", "dog", "kitten", "puppy", "car", "truck",
         "bicycle", "motorcycle", "apple", "banana"]
embeddings = np.random.randn(len(words), 300)

# 模拟训练后的语义聚类（手动调整）
animal_cluster = embeddings[6:10].mean(axis=0)
royalty_cluster = embeddings[0:6].mean(axis=0)
vehicle_cluster = embeddings[10:14].mean(axis=0)

for i in range(6, 10):
    embeddings[i] = 0.7 * embeddings[i] + 0.3 * animal_cluster
for i in range(6):
    embeddings[i] = 0.7 * embeddings[i] + 0.3 * royalty_cluster
for i in range(10, 14):
    embeddings[i] = 0.7 * embeddings[i] + 0.3 * vehicle_cluster

# PCA 降维到 2D
from sklearn.decomposition import PCA
pca = PCA(n_components=2)
embeddings_2d = pca.fit_transform(embeddings)

print("=== 词嵌入 2D 投影 ===")
for word, (x, y) in zip(words, embeddings_2d):
    print(f"  {word:<12} ({x:6.2f}, {y:6.2f})")

# 验证类比关系: king - man + woman ≈ queen
king = embeddings[0]; man = embeddings[2]
woman = embeddings[3]; queen = embeddings[1]
result = king - man + woman
sim = np.dot(result, queen) / (np.linalg.norm(result) * np.linalg.norm(queen))
print(f"\\nking - man + woman ≈ queen 相似度: {sim:.4f}")`,
          },
        ],
        table: {
          headers: ["表示方法", "维度", "稀疏性", "语义相似性", "泛化能力"],
          rows: [
            ["One-Hot", "V (词汇表大小)", "极度稀疏 (1/V)", "❌ 所有词正交", "❌ 无"],
            ["TF-IDF", "V", "稀疏", "⚠️ 基于共现统计", "⚠️ 弱"],
            ["Word2Vec", "50-300", "稠密", "✅ 语义相似词靠近", "✅ 强"],
            ["GloVe", "50-300", "稠密", "✅ 全局统计 + 局部上下文", "✅ 强"],
            ["BERT", "768-1024", "稠密+上下文", "✅ 动态上下文感知", "✅✅ 最强"],
          ],
        },
        mermaid: `graph LR
    A["One-Hot"] -->|"语义真空\n维度灾难"| B["分布式表示"]
    B -->|"局部上下文窗口"| C["Word2Vec"]
    B -->|"全局共现矩阵"| D["GloVe"]
    B -->|"子词信息"| E["FastText"]
    C --> F["词嵌入矩阵\nW ∈ R^(V×d)"]
    D --> F
    E --> F
    F --> G["语义类比: king - man + woman ≈ queen"]`,
        tip: "学习建议：不要一上来就用 Word2Vec，先手动用 one-hot 计算几个词对的内积，深刻体会语义真空的问题，再理解分布式表示为什么有效。",
        warning: "词嵌入训练需要大量语料。小数据集（< 100 万词）上训练的嵌入质量很差，建议使用预训练的嵌入矩阵（如 GloVe 42B、Common Crawl）。",
      },
      {
        title: "2. CBOW 模型：用上下文预测中心词",
        body: `CBOW（Continuous Bag-of-Words）是 Word2Vec 的第一个模型，其核心思想极其直观：给定一个词的上下文（周围的词），预测这个中心词是什么。

**模型架构：**
CBOW 是一个浅层神经网络，包含三层：输入层、投影层（隐藏层）和输出层。

输入层：将上下文窗口（大小为 2C，即左右各 C 个词）中的每个词通过嵌入矩阵 W 映射为 d 维向量。假设上下文词为 w_{t-C}, ..., w_{t-1}, w_{t+1}, ..., w_{t+C}，它们的嵌入向量分别为 v_{w_{t-C}}, ..., v_{w_{t+C}}。

投影层：将上下文所有词的嵌入向量求和（或平均），得到一个 d 维的上下文表示向量 h = (1/2C) Σ v_{w_j}。注意这里是逐元素相加，不是拼接——这体现了 CBOW 的"词袋"假设：上下文中词的顺序不重要。

输出层：通过 softmax 函数计算词汇表中每个词作为中心词的概率：P(w_t | context) = exp(u_{w_t}^T h) / Σ exp(u_{w_i}^T h)，其中 u_{w_i} 是输出嵌入向量。

训练目标是最小化负对数似然：J = -log P(w_t | context)，等价于最大化正确中心词的概率。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class CBOW:
    """CBOW 模型简化实现"""
    
    def __init__(self, vocab_size, embed_dim, learning_rate=0.01):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.lr = learning_rate
        # 输入嵌入矩阵: W_in ∈ R^(V × d)
        self.W_in = np.random.randn(vocab_size, embed_dim) * 0.1
        # 输出嵌入矩阵: W_out ∈ R^(d × V)
        self.W_out = np.random.randn(embed_dim, vocab_size) * 0.1
    
    def softmax(self, x):
        e_x = np.exp(x - np.max(x))
        return e_x / e_x.sum()
    
    def predict(self, context_indices):
        """用上下文词索引预测中心词
        context_indices: 上下文词的索引列表 [w_{t-C}, ..., w_{t+C}]
        返回: 词汇表上每个词的概率分布
        """
        # 投影层: 上下文嵌入平均
        h = self.W_in[context_indices].mean(axis=0)  # (d,)
        
        # 输出层: softmax
        scores = self.W_out.T @ h  # (V,)
        probs = self.softmax(scores)
        return probs, h
    
    def train_step(self, context_indices, target_idx):
        """单步训练: 前向传播 + 反向传播"""
        probs, h = self.predict(context_indices)
        
        # 负对数似然损失
        loss = -np.log(probs[target_idx] + 1e-10)
        
        # 梯度: 输出层
        d_scores = probs.copy()
        d_scores[target_idx] -= 1  # softmax 交叉熵梯度
        
        # 更新输出嵌入
        d_W_out = np.outer(h, d_scores)  # (d, V)
        self.W_out -= self.lr * d_W_out
        
        # 梯度回传到输入嵌入
        d_h = self.W_out @ d_scores  # (d,)
        
        # 更新每个上下文词的输入嵌入
        for idx in context_indices:
            self.W_in[idx] -= self.lr * d_h / len(context_indices)
        
        return loss`,
          },
          {
            lang: "python",
            code: `# CBOW 训练演示
np.random.seed(42)

# 迷你词汇表
vocab = ["the", "cat", "sat", "on", "mat", "a", "dog", "bed"]
word2idx = {w: i for i, w in enumerate(vocab)}
V = len(vocab)

model = CBOW(vocab_size=V, embed_dim=8, learning_rate=0.05)

# 训练数据: (上下文, 中心词)
training_data = [
    (["the", "sat"], "cat"),      # the [cat] sat
    (["cat", "on"], "sat"),       # cat [sat] on
    (["sat", "mat"], "on"),       # sat [on] mat
    (["on", "the"], "mat"),       # on [mat] the
    (["a", "bed"], "dog"),        # a [dog] bed
    (["dog", "on"], "bed"),       # dog [bed] on
]

print("=== CBOW 训练 ===")
for epoch in range(500):
    total_loss = 0
    for ctx, target in training_data:
        ctx_idx = [word2idx[w] for w in ctx]
        target_idx = word2idx[target]
        loss = model.train_step(ctx_idx, target_idx)
        total_loss += loss
    if epoch % 100 == 0:
        print(f"Epoch {epoch:4d} | Loss: {total_loss:.4f}")

# 测试: 给定上下文 "the" 和 "sat"，预测中心词
ctx_test = [word2idx["the"], word2idx["sat"]]
probs, _ = model.predict(ctx_test)
top3 = np.argsort(probs)[::-1][:3]
print(f"\\n上下文 'the _ sat' 的预测:")
for idx in top3:
    print(f"  {vocab[idx]}: {probs[idx]:.4f}")`,
          },
          {
            lang: "python",
            code: `# 分析 CBOW 学到的嵌入
import numpy as np

# 训练后检查词向量
print("=== 词嵌入分析 ===")
for word in vocab:
    vec = model.W_in[word2idx[word]]
    print(f"{word:<6}: L2范数={np.linalg.norm(vec):.4f}, 前4维={vec[:4]}")

# 计算词对余弦相似度
def cos_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

pairs = [("cat", "dog"), ("cat", "mat"), ("sat", "on"), ("the", "a")]
print("\\n词对相似度:")
for w1, w2 in pairs:
    sim = cos_sim(model.W_in[word2idx[w1]], model.W_in[word2idx[w2]])
    print(f"  {w1} ↔ {w2}: {sim:.4f}")

# CBOW 的损失函数推导
print("\\n=== CBOW 损失函数推导 ===")
print("目标: 最大化 P(w_t | w_{t-C}, ..., w_{t+C})")
print("P(w_O | w_I) = exp(u_O^T h) / Σ exp(u_j^T h)")
print("  u_O: 输出嵌入中 w_O 的列向量")
print("  h = (1/2C) Σ v_{w_j} : 上下文嵌入平均")
print("损失 J = -log P(w_O | w_I)")
print("     = -u_O^T h + log(Σ exp(u_j^T h))")
print("∂J/∂u_j = p_j · h          (j ≠ O)")
print("∂J/∂u_O = (p_O - 1) · h    (j = O)")
print("∂J/∂v_{w_j} = (1/2C) · Σ (∂J/∂u_k · W_out[:,k])")`,
          },
        ],
        table: {
          headers: ["组件", "维度", "公式", "说明"],
          rows: [
            ["输入嵌入 W_in", "V × d", "v_w = W_in[w]", "词的输入表示"],
            ["上下文平均 h", "d", "h = (1/2C) Σ v_{w_j}", "上下文聚合"],
            ["输出嵌入 W_out", "d × V", "u_w = W_out[:,w]", "词的输出表示"],
            ["输出分数", "V", "s_j = u_j^T h", "未归一化概率"],
            ["概率分布", "V", "p_j = exp(s_j)/Σexp(s_k)", "softmax 归一化"],
          ],
        },
        mermaid: `graph TD
    A["上下文词 w_1"] --> E1["嵌入 v_1"]
    B["上下文词 w_2"] --> E2["嵌入 v_2"]
    C["上下文词 w_3"] --> E3["嵌入 v_3"]
    D["上下文词 w_4"] --> E4["嵌入 v_4"]
    E1 --> F["求和/平均"]
    E2 --> F
    E3 --> F
    E4 --> F
    F --> G["隐藏层 h"]
    G --> H["线性变换 W_out"]
    H --> I["Softmax"]
    I --> J["P(w_1) P(w_2) ... P(w_V)"]`,
        tip: "CBOW 适合小数据集和低频词——因为它对上下文做平均，平滑了噪声。但这也意味着它对词的顺序不敏感，对句法结构的学习不如 Skip-gram。",
        warning: "CBOW 输出层的 softmax 需要计算词汇表所有 V 个词的概率，当 V 很大时（如 100 万），计算代价极高。必须使用负采样或分层 softmax 加速。",
      },
      {
        title: "3. Skip-gram 模型：用中心词预测上下文",
        body: `Skip-gram 是 Word2Vec 的另一个模型，与 CBOW 恰好相反：给定中心词，预测它的上下文。

**模型架构：**
Skip-gram 的输入是单个中心词的嵌入向量 h = v_{w_t}，输出是词汇表上每个词作为上下文词的概率分布。与 CBOW 不同，Skip-gram 对上下文中的每个位置分别预测（而不是求平均），因此每个训练样本产生 2C 个预测任务。

训练目标函数：J = -Σ_{-C ≤ j ≤ C, j ≠ 0} log P(w_{t+j} | w_t)，其中 P(w_O | w_I) = exp(u_O^T v_I) / Σ exp(u_j^T v_I)。

**为什么 Skip-gram 比 CBOW 效果更好？**
Skip-gram 为每个中心词-上下文词对生成独立的训练样本，这意味着相同的信息量被"展开"成了 2C 倍的训练信号。在数学上，这相当于对每个中心词做了 2C 次独立的参数更新，而非 CBOW 的一次批量更新。实验表明，Skip-gram 对罕见词的表示学习更好——因为罕见词即使只出现几次，每次都会产生 2C 个训练样本。

代价是 Skip-gram 训练更慢：相同数据量下，Skip-gram 需要处理的训练样本是 CBOW 的 2C 倍。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class SkipGram:
    """Skip-gram 模型简化实现"""
    
    def __init__(self, vocab_size, embed_dim, lr=0.01):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.lr = lr
        self.W_in = np.random.randn(vocab_size, embed_dim) * 0.1
        self.W_out = np.random.randn(embed_dim, vocab_size) * 0.1
    
    def softmax(self, x):
        e_x = np.exp(x - np.max(x))
        return e_x / e_x.sum()
    
    def predict(self, center_idx):
        """给定中心词，预测上下文概率分布"""
        h = self.W_in[center_idx]  # (d,)
        scores = self.W_out.T @ h  # (V,)
        probs = self.softmax(scores)
        return probs, h
    
    def train_step(self, center_idx, context_idx):
        """单步训练: 中心词 → 一个上下文词"""
        h = self.W_in[center_idx]
        scores = self.W_out.T @ h
        probs = self.softmax(scores)
        
        loss = -np.log(probs[context_idx] + 1e-10)
        
        # 梯度
        d_scores = probs.copy()
        d_scores[context_idx] -= 1
        
        d_W_out = np.outer(h, d_scores)
        d_h = self.W_out @ d_scores
        
        self.W_out -= self.lr * d_W_out
        self.W_in[center_idx] -= self.lr * d_h
        
        return loss`,
          },
          {
            lang: "python",
            code: `# Skip-gram 训练演示
np.random.seed(42)

vocab = ["the", "cat", "sat", "on", "mat", "a", "dog", "bed", "is", "sleeping"]
word2idx = {w: i for i, w in enumerate(vocab)}
V = len(vocab)

model = SkipGram(vocab_size=V, embed_dim=16, lr=0.05)

# 从语料生成 (中心词, 上下文) 对
sentences = [
    ["the", "cat", "sat", "on", "the", "mat"],
    ["a", "dog", "is", "sleeping", "on", "the", "bed"],
    ["the", "cat", "is", "sleeping"],
]

window_size = 2
pairs = []
for sent in sentences:
    for t in range(len(sent)):
        for j in range(-window_size, window_size + 1):
            if j == 0:
                continue
            ctx_idx = t + j
            if 0 <= ctx_idx < len(sent):
                pairs.append((word2idx[sent[t]], word2idx[sent[ctx_idx]]))

print(f"训练样本对数: {len(pairs)}")
print("=== Skip-gram 训练 ===")
for epoch in range(500):
    total_loss = 0
    for center, context in pairs:
        loss = model.train_step(center, context)
        total_loss += loss
    if epoch % 100 == 0:
        print(f"Epoch {epoch:4d} | Loss: {total_loss:.4f}")

# 检查学到的嵌入
def cos_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

print("\\n词对相似度 (Skip-gram):")
for w1, w2 in [("cat", "dog"), ("cat", "mat"), ("is", "sleeping"), ("on", "bed")]:
    sim = cos_sim(model.W_in[word2idx[w1]], model.W_in[word2idx[w2]])
    print(f"  {w1:<10} ↔ {w2:<10}: {sim:.4f}")`,
          },
          {
            lang: "python",
            code: `# CBOW vs Skip-gram 对比实验
import numpy as np

np.random.seed(42)

# 用更大的模拟数据集比较
print("=== CBOW vs Skip-gram 对比 ===")
print("语料: 1000 个句子, 窗口大小=2\\n")

vocab = ["king", "queen", "man", "woman", "prince", "princess",
         "boy", "girl", "father", "mother", "brother", "sister"]
word2idx = {w: i for i, w in enumerate(vocab)}
V = len(vocab)

# 生成语法相关的句子
templates = [
    ["the", "king", "and", "queen"],
    ["the", "man", "and", "woman"],
    ["the", "prince", "and", "princess"],
    ["the", "boy", "and", "girl"],
    ["the", "father", "and", "mother"],
    ["the", "brother", "and", "sister"],
]

# CBOW 训练
cbow = __import__('sys').modules.get('__main__')
cbow_model = type('CBOW', (), {
    'W_in': np.random.randn(V, 16) * 0.1,
    'W_out': np.random.randn(16, V) * 0.1,
    'vocab_size': V, 'embed_dim': 16
})()

# Skip-gram 训练
sg_model = type('SG', (), {
    'W_in': np.random.randn(V, 16) * 0.1,
    'W_out': np.random.randn(16, V) * 0.1,
})()

# 训练 200 轮
for model, name in [(cbow_model, "CBOW"), (sg_model, "Skip-gram")]:
    for epoch in range(200):
        for tmpl in templates:
            for t in range(len(tmpl)):
                center = word2idx.get(tmpl[t])
                if center is None:
                    continue
                for j in [-1, 1]:
                    ctx_t = t + j
                    if 0 <= ctx_t < len(tmpl):
                        ctx = word2idx.get(tmpl[ctx_t])
                        if ctx is None:
                            continue
                        # 简化训练步骤
                        h = model.W_in[center]
                        scores = model.W_out.T @ h
                        exp_s = np.exp(scores - scores.max())
                        probs = exp_s / exp_s.sum()
                        d = probs.copy()
                        d[ctx] -= 1
                        model.W_out -= 0.01 * np.outer(h, d)
                        model.W_in[center] -= 0.01 * model.W_out @ d

# 评估类比关系 quality
pairs_test = [("king", "queen"), ("man", "woman"), ("father", "mother")]
for name, m in [("CBOW", cbow_model), ("Skip-gram", sg_model)]:
    sims = [np.dot(m.W_in[word2idx[a]], m.W_in[word2idx[b]]) /
            (np.linalg.norm(m.W_in[word2idx[a]]) * np.linalg.norm(m.W_in[word2idx[b]]))
            for a, b in pairs_test]
    print(f"{name}: 平均配对相似度 = {np.mean(sims):.4f}")`,
          },
        ],
        table: {
          headers: ["特性", "CBOW", "Skip-gram"],
          rows: [
            ["输入", "上下文词 (多个)", "中心词 (单个)"],
            ["输出", "中心词 (单个)", "上下文词 (多个)"],
            ["训练速度", "快 (上下文平均)", "慢 (2C 次预测)"],
            ["低频词表示", "较差 (被平均掉)", "较好 (独立训练)"],
            ["高频词表示", "较好", "一般"],
            ["训练样本数/句", "N (每词 1 个)", "2C×N (每词 2C 个)"],
            ["适用场景", "小数据集、快速原型", "大数据集、高质量嵌入"],
          ],
        },
        mermaid: `graph TD
    A["中心词 w_t"] --> E["嵌入 v_t"]
    E --> H["隐藏层 h = v_t"]
    H --> S["Softmax"]
    S --> P1["P(w_{t-2})"]
    S --> P2["P(w_{t-1})"]
    S --> P3["P(w_{t+1})"]
    S --> P4["P(w_{t+2})"]
    P1 --> L["损失求和"]
    P2 --> L
    P3 --> L
    P4 --> L
    
    style A fill:#bbdefb
    style E fill:#c8e6c9
    style H fill:#fff9c4
    style S fill:#ffe0b2
    style L fill:#ffcdd2`,
        tip: "Skip-gram 是大多数场景下的首选。虽然训练比 CBOW 慢，但它学到的词向量质量更高，尤其是对低频词的表示。实际工程中可以用负采样（下一节）来解决 Skip-gram 的训练速度问题。",
        warning: "Skip-gram 的训练样本数是 CBOW 的 2C 倍（C 是窗口半宽），当窗口设为 5 时，每个中心词产生 10 个训练样本。在大数据集上这会导致训练时间成倍增长。",
      },
      {
        title: "4. 负采样（Negative Sampling）：高效训练的秘诀",
        body: `负采样是 Word2Vec 训练加速的核心技术。问题的根源在于：标准的 softmax 需要计算词汇表中所有 V 个词的概率并归一化，当 V = 100 万时，每次前向传播都要做 100 万次指数运算和一次归一化——计算复杂度 O(V)，不可接受。

**负采样的核心思想：** 将多分类问题转化为多个二分类问题。对于每个训练样本（中心词 w_I，上下文词 w_O），我们不再试图从 V 个词中正确预测 w_O，而是做 K+1 个二分类：

1. 一个正样本：中心词 w_I 和真实上下文词 w_O 的配对，标签为 1
2. K 个负样本：中心词 w_I 和随机采样的噪声词 w_N 的配对，标签为 0

每个二分类任务用 sigmoid 函数：P(D=1 | w_I, w_O) = σ(u_O^T v_I) = 1 / (1 + exp(-u_O^T v_I))

训练目标最大化正样本的 sigmoid 输出，同时最小化负样本的 sigmoid 输出：
J = -log σ(u_O^T v_I) - Σ_{k=1}^K log σ(-u_{N_k}^T v_I)

**噪声分布：** 负样本不是均匀随机采样，而是按照词频的 3/4 次幂分布采样：P(w) = f(w)^{3/4} / Σ f(w_j)^{3/4}。3/4 次幂的作用是让低频词被采样的概率相对提高（因为 x^{0.75} 对小数值的压缩比线性弱），使负样本更有信息量。

计算复杂度从 O(V) 降到 O(K)，K 通常取 5-20。这是 Word2Vec 能在大规模语料上训练的关键。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def negative_sampling_loss(v_center, u_context, u_negatives):
    """负采样损失函数
    v_center: 中心词嵌入 (d,)
    u_context: 正样本上下文嵌入 (d,)
    u_negatives: K 个负样本嵌入 (K, d)
    """
    def sigmoid(x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    # 正样本损失
    pos_score = np.dot(u_context, v_center)
    pos_loss = -np.log(sigmoid(pos_score) + 1e-10)
    
    # 负样本损失
    neg_scores = u_negatives @ v_center  # (K,)
    neg_loss = -np.sum(np.log(sigmoid(-neg_scores) + 1e-10))
    
    return pos_loss + neg_loss

# 演示
np.random.seed(42)
d, K = 16, 5
v_center = np.random.randn(d)
u_context = np.random.randn(d)
u_negatives = np.random.randn(K, d)

loss = negative_sampling_loss(v_center, u_context, u_negatives)
print(f"负采样损失: {loss:.4f}")
print(f"  正样本得分: {np.dot(u_context, v_center):.4f}")
print(f"  负样本得分: {u_negatives @ v_center}")`,
          },
          {
            lang: "python",
            code: `# 噪声分布采样
import numpy as np

# 模拟词频统计（齐普夫定律: f(w) ∝ 1/rank）
vocab_size = 10000
ranks = np.arange(1, vocab_size + 1)
raw_freqs = 1.0 / ranks
raw_freqs /= raw_freqs.sum()

# 不同的采样分布
uniform = np.ones(vocab_size) / vocab_size
freq_power_1 = raw_freqs ** 1.0 / np.sum(raw_freqs ** 1.0)
freq_power_3_4 = raw_freqs ** 0.75 / np.sum(raw_freqs ** 0.75)
freq_power_0 = np.ones(vocab_size) / vocab_size  # 均匀

print("=== 噪声分布对比 (Top 10 高频词) ===")
print(f"{'Rank':<6} {'原始频率':>10} {'p^1':>10} {'p^0.75':>10} {'均匀':>10}")
print("-" * 50)
for i in range(10):
    print(f"{i+1:<6} {raw_freqs[i]:10.6f} {freq_power_1[i]:10.6f} "
          f"{freq_power_3_4[i]:10.6f} {uniform[i]:10.6f}")

# 为什么用 3/4 次幂？
print("\\n=== 3/4 次幂的效果 ===")
test_freqs = [0.3, 0.1, 0.01, 0.001, 0.0001]
print(f"{'原始频率':<12} {'^1 (不变)':>12} {'^0.75':>12} {'相对提升':>12}")
for f in test_freqs:
    print(f"{f:<12.6f} {f**1:<12.6f} {f**0.75:<12.6f} "
          f"{(f**0.75)/(f**1):>12.2f}x")

# 3/4 次幂使低频词的采样概率相对提升
# 例如 0.001^0.75 / 0.001 = 177.83 倍`,
          },
          {
            lang: "python",
            code: `# 完整的负采样 Skip-gram 训练
import numpy as np

class SkipGramNegSampling:
    """带负采样的 Skip-gram"""
    
    def __init__(self, vocab_size, embed_dim, K=5, lr=0.025):
        self.V = vocab_size
        self.d = embed_dim
        self.K = K
        self.lr = lr
        self.W_in = (np.random.rand(vocab_size, embed_dim) - 0.5) / embed_dim
        self.W_out = (np.random.rand(vocab_size, embed_dim) - 0.5) / embed_dim
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def get_noise_dist(self, word_counts):
        """构建噪声分布表 (unigram table)"""
        freqs = word_counts / word_counts.sum()
        power_freqs = freqs ** 0.75
        self.noise_dist = power_freqs / power_freqs.sum()
        # 预采样表 (Mikolov 的 alias table 简化版)
        self.noise_table = np.random.choice(
            self.V, size=100000, p=self.noise_dist
        )
    
    def sample_negatives(self, center_idx):
        """采样 K 个负样本（排除中心词本身）"""
        negatives = []
        while len(negatives) < self.K:
            n = np.random.choice(self.noise_table)
            if n != center_idx:
                negatives.append(n)
        return negatives
    
    def train_step(self, center_idx, context_idx):
        """单步负采样训练"""
        lr = self.lr
        # 正样本
        v = self.W_in[center_idx]
        u_pos = self.W_out[context_idx]
        score_pos = np.dot(u_pos, v)
        sig_pos = self.sigmoid(score_pos)
        # 梯度: 正样本
        grad_pos = (sig_pos - 1) * v
        self.W_out[context_idx] -= lr * grad_pos
        grad_v_pos = (sig_pos - 1) * u_pos
        
        # 负样本
        negatives = self.sample_negatives(center_idx)
        grad_v_neg = np.zeros(self.d)
        for n in negatives:
            u_neg = self.W_out[n]
            score_neg = np.dot(u_neg, v)
            sig_neg = self.sigmoid(score_neg)
            self.W_out[n] -= lr * sig_neg * v
            grad_v_neg += sig_neg * u_neg
        
        self.W_in[center_idx] -= lr * (grad_v_pos + grad_v_neg)
        return -np.log(sig_pos + 1e-10) - sum(
            np.log(self.sigmoid(-np.dot(self.W_out[n], self.W_in[center_idx])) + 1e-10)
            for n in negatives
        )

# 训练演示
np.random.seed(42)
V, d = 50, 16
model = SkipGramNegSampling(V, d, K=5, lr=0.05)
word_counts = np.random.randint(1, 1000, V)
model.get_noise_dist(word_counts)

# 模拟训练
pairs = [(np.random.randint(V), np.random.randint(V)) for _ in range(5000)]
for epoch in range(5):
    total_loss = 0
    for center, context in pairs:
        total_loss += model.train_step(center, context)
    print(f"Epoch {epoch+1} | Avg Loss: {total_loss/len(pairs):.4f}")

# 检查嵌入质量
print("\\n嵌入矩阵统计:")
print(f"  W_in 均值: {model.W_in.mean():.6f}, 标准差: {model.W_in.std():.6f}")
print(f"  W_out 均值: {model.W_out.mean():.6f}, 标准差: {model.W_out.std():.6f}")`,
          },
        ],
        table: {
          headers: ["方法", "计算复杂度", "精度", "适用场景"],
          rows: [
            ["完整 Softmax", "O(V·d)", "最高 (基准)", "V < 10,000"],
            ["分层 Softmax", "O(log V · d)", "高", "V 较大，低频词多"],
            ["负采样 (K=5)", "O((K+1)·d)", "接近完整 softmax", "最常用"],
            ["负采样 (K=20)", "O((K+1)·d)", "更高", "需要高质量嵌入"],
            ["噪声对比估计", "O((K+1)·d)", "中等", "理论分析"],
          ],
        },
        mermaid: `graph TD
    A["中心词 w_I"] --> B["嵌入 v_I"]
    A --> C["正样本 w_O"]
    A --> D["负采样 K 个词"]
    B --> E["σ(u_O^T v_I)"]
    B --> F["σ(u_N1^T v_I)"]
    B --> G["σ(u_N2^T v_I)"]
    B --> H["..."]
    B --> I["σ(u_NK^T v_I)"]
    E --> J["标签 = 1"]
    F --> K["标签 = 0"]
    G --> K
    H --> K
    I --> K
    J --> L["BCE 损失求和"]
    K --> L`,
        tip: "负采样数 K 的选择：小数据集 K=5-10 就够了，大数据集 K=2-5 也行——因为数据量大，即使负样本少也能学到好的表示。",
        warning: "负采样的质量高度依赖噪声分布。如果词频统计不准确（如包含大量停用词），噪声分布会偏向高频无意义词，降低训练效果。训练前应去除停用词或进行词频截断。",
      },
      {
        title: "5. GloVe：全局共现矩阵 + 局部上下文的统一",
        body: `GloVe（Global Vectors for Word Representation）由 Stanford NLP 团队提出，试图融合两种词嵌入范式的优点：基于矩阵分解的全局方法（如 LSA、SVD）和基于局部上下文窗口的预测方法（如 Word2Vec）。

**核心洞察：** 两个词 w_i 和 w_j 的共现次数 X_{ij} 包含了丰富的语义信息。具体地，共现比率 X_{ij}/X_{ik} 可以区分不同类型的词间关系：

- 如果词 k 与词 i 相关但与词 j 无关，则 X_{ij}/X_{ik} 很小
- 如果词 k 与词 j 相关但与词 i 无关，则 X_{ij}/X_{ik} 很大
- 如果词 k 与两者都相关或都不相关，则 X_{ij}/X_{ik} ≈ 1

例如：对于 "ice" 和 "steam"，"solid" 与 ice 的共现远多于与 steam 的共现（比率大），而 "gas" 与 steam 的共现远多于与 ice 的共现（比率小）。

**GloVe 的权重函数：** 最小化以下加权最小二乘损失：
J = Σ_{i,j=1}^V f(X_{ij}) (w_i^T w̃_j + b_i + b̃_j - log X_{ij})²

其中 f(x) 是权重函数：
- f(x) = (x/x_max)^α  当 x < x_max
- f(x) = 1  当 x ≥ x_max

α 通常取 0.75，x_max 取 100。这个函数的作用是：对高频共现对赋予较小权重（避免过度拟合高频词对），对低频共现对赋予较大权重（保留有意义的稀有共现信号），同时设置上限防止数值溢出。

GloVe 的训练速度比 Word2Vec 快，且在某些任务上表现更好（特别是语义相似性任务）。它直接优化共现比率这一更本质的统计量，而非间接地通过上下文预测。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from scipy import sparse

# 构建共现矩阵
def build_cooccurrence_matrix(corpus, vocab, window_size=2):
    """构建全局词共现矩阵"""
    V = len(vocab)
    word2idx = {w: i for i, w in enumerate(vocab)}
    cooccur = np.zeros((V, V))
    
    for sentence in corpus:
        indices = [word2idx.get(w) for w in sentence if w in word2idx]
        for i in range(len(indices)):
            for j in range(max(0, i - window_size), min(len(indices), i + window_size + 1)):
                if i != j:
                    distance = abs(i - j)
                    cooccur[indices[i], indices[j]] += 1.0 / distance
    
    return cooccur

# 示例语料
corpus = [
    ["i", "love", "natural", "language", "processing"],
    ["natural", "language", "processing", "is", "fascinating"],
    ["i", "love", "machine", "learning"],
    ["machine", "learning", "and", "natural", "language", "processing"],
    ["deep", "learning", "is", "a", "subset", "of", "machine", "learning"],
]
vocab = ["i", "love", "natural", "language", "processing", "machine",
         "learning", "is", "fascinating", "deep", "and", "a", "subset", "of"]

X = build_cooccurrence_matrix(corpus, vocab, window_size=2)
print("共现矩阵:")
for i, w1 in enumerate(vocab):
    if X[i].sum() > 0:
        print(f"  {w1:<12}: {X[i].astype(int)}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# GloVe 权重函数
def glove_weight(x, x_max=100, alpha=0.75):
    """GloVe 权重函数 f(x)"""
    if x < x_max:
        return (x / x_max) ** alpha
    return 1.0

# 可视化权重函数
print("=== GloVe 权重函数 ===")
print(f"{'共现次数':<10} {'权重':<10} {'说明'}")
print("-" * 40)
for x in [1, 2, 5, 10, 20, 50, 100, 200, 500]:
    w = glove_weight(x)
    desc = ""
    if x < 10:
        desc = "低频共现 → 较大权重"
    elif x < 100:
        desc = "中频共现 → 衰减权重"
    else:
        desc = "高频共现 → 上限权重"
    print(f"{x:<10} {w:<10.4f} {desc}")

# GloVe 训练
def train_glove(cooccur_matrix, embed_dim=16, epochs=100, lr=0.05, x_max=100):
    """GloVe 训练简化实现"""
    V = cooccur_matrix.shape[0]
    np.random.seed(42)
    
    # 词向量和上下文向量
    W = np.random.randn(V, embed_dim) * 0.1
    W_tilde = np.random.randn(V, embed_dim) * 0.1
    b = np.zeros(V)
    b_tilde = np.zeros(V)
    
    # 提取非零共现对
    pairs = np.argwhere(cooccur_matrix > 0)
    weights = np.array([glove_weight(cooccur_matrix[i, j]) for i, j in pairs])
    log_cooccur = np.log(np.array([cooccur_matrix[i, j] for i, j in pairs]))
    
    for epoch in range(epochs):
        # 梯度下降
        diffs = (W[pairs[:, 0]] * W_tilde[pairs[:, 1]]).sum(axis=1) + b[pairs[:, 0]] + b_tilde[pairs[:, 1]] - log_cooccur
        
        loss = np.mean(weights * diffs ** 2)
        
        grad_common = weights * diffs[:, np.newaxis]  # (N, d)
        
        for idx in range(len(pairs)):
            i, j = pairs[idx]
            g = grad_common[idx]
            W[i] -= lr * g * W_tilde[j]
            W_tilde[j] -= lr * g * W[i]
            b[i] -= lr * weights[idx] * diffs[idx]
            b_tilde[j] -= lr * weights[idx] * diffs[idx]
        
        if epoch % 20 == 0:
            print(f"Epoch {epoch:4d} | Loss: {loss:.6f}")
    
    return W + W_tilde  # 最终词向量 = 输入 + 输出

W_final = train_glove(X, embed_dim=16, epochs=100, lr=0.01)
print("\\n训练完成！最终词向量形状:", W_final.shape)`,
          },
          {
            lang: "python",
            code: `# GloVe vs Word2Vec 对比分析
import numpy as np

print("=== GloVe vs Word2Vec 深度对比 ===\\n")

print("1. 优化目标:")
print("   Word2Vec: 最大化 P(context | center) 或 P(center | context)")
print("   GloVe:    最小化 Σ f(X_ij)(w_i·w_j + b_i + b_j - log X_ij)²")
print()
print("2. 信息利用:")
print("   Word2Vec: 局部窗口内的共现 (顺序敏感)")
print("   GloVe:    全局共现矩阵 (顺序不敏感)")
print()
print("3. 训练方式:")
print("   Word2Vec: 随机梯度下降 (在线学习)")
print("   GloVe:    批量梯度下降 (需要完整共现矩阵)")
print()
print("4. 词向量:")
print("   Word2Vec: 使用输入嵌入 W_in 或两者平均")
print("   GloVe:    使用 W_in + W_out 之和")
print()
print("5. 类比任务表现 (Google Analogy Test Set):")
print("   Word2Vec (Skip-gram, 300d, 100B tokens): 72-76%")
print("   GloVe (300d, 840B tokens): 75-78%")
print()
print("6. 语义相似性任务 (WordSim-353):")
print("   Word2Vec: ~0.68 (Spearman)")
print("   GloVe:    ~0.75 (Spearman)")

# 模拟 GloVe 的共现比率分析
print("\\n=== 共现比率分析 ===")
# 假设: "ice" 和 "steam" 的共现统计
cooccur = {
    ("ice", "solid"): 380,
    ("ice", "gas"): 12,
    ("steam", "solid"): 8,
    ("steam", "gas"): 320,
    ("ice", "water"): 370,
    ("steam", "water"): 310,
}

# 计算共现比率
def ratio(wi, wj, wk):
    X_ik = cooccur.get((wi, wk), 1)
    X_jk = cooccur.get((wj, wk), 1)
    return X_ik / X_jk

print(f"P(solid|ice) / P(solid|steam) = {ratio('ice', 'steam', 'solid'):.1f}")
print(f"P(gas|ice) / P(gas|steam) = {ratio('ice', 'steam', 'gas'):.3f}")
print(f"P(water|ice) / P(water|steam) = {ratio('ice', 'steam', 'water'):.2f}")
print("\\nGloVe 捕捉的正是这种比率模式！")`,
          },
        ],
        table: {
          headers: ["特性", "Word2Vec (Skip-gram)", "GloVe"],
          rows: [
            ["方法", "预测模型 (局部上下文)", "矩阵分解 (全局统计)"],
            ["优化目标", "负采样下的交叉熵", "加权最小二乘"],
            ["训练数据", "流式文本", "全局共现矩阵"],
            ["内存需求", "低 (在线学习)", "高 (需完整共现矩阵)"],
            ["并行性", "有限", "高 (矩阵运算天然并行)"],
            ["语义相似性", "好", "更好 (利用全局信息)"],
            ["类比推理", "好", "相当或略好"],
            ["训练速度", "中等", "快 (矩阵分解)"],
          ],
        },
        mermaid: `graph TD
    A["大规模语料"] --> B["构建全局共现矩阵 X"]
    B --> C["权重函数 f(X_ij)"]
    C --> D["最小化损失"]
    D -->|"J = Σ f(X_ij)(w_i·w_j + b_i + b_j - log X_ij)²"| E["SGD 优化"]
    E --> F["词向量 W + 上下文向量 W̃"]
    F --> G["最终嵌入 = W + W̃"]
    
    style A fill:#bbdefb
    style B fill:#c8e6c9
    style C fill:#fff9c4
    style G fill:#e1bee7`,
        tip: "GloVe 的全局共现矩阵在大规模语料上效果显著。如果你有足够的计算资源，推荐用 GloVe 训练 840B tokens 的 Common Crawl 语料——这几乎是目前最好的免费预训练词嵌入。",
        warning: "GloVe 需要完整的共现矩阵，这意味着必须先扫描整个语料统计共现次数。对于超大规模语料（如 Common Crawl），这一步本身就可能需要大量内存。Word2Vec 的流式训练方式在这种情况下更可行。",
      },
      {
        title: "6. FastText：子词信息与形态学感知",
        body: `FastText 由 Facebook AI Research 提出，解决了 Word2Vec 的一个根本局限：无法处理未见过的词（Out-Of-Vocabulary, OOV）。

**子词分解（Subword Decomposition）：**
FastText 的核心创新是将每个词分解为字符 n-gram 的集合。例如，对于词 "where"，设定 n-gram 范围为 3-6，我们得到：
- 3-gram: <wh, whe, her, ere, re>
- 4-gram: <whe, wher, here, ere>
- 5-gram: <where>
- 6-gram: <where>
（< 和 > 是边界符号，用于区分前缀和后缀）

词 w 的最终向量表示为其所有 n-gram 向量之和：v(w) = Σ_{g ∈ G(w)} z_g，其中 G(w) 是词 w 的所有 n-gram 集合，z_g 是 n-gram g 的嵌入向量。

**OOV 词的处理：** 当遇到训练时未见过的词时，FastText 可以将其分解为 n-gram，通过已有 n-gram 向量的组合得到该词的表示。例如，"unhappiness" 在训练时未出现，但其 n-gram（un, unh, hap, app, ppi, pin, ine, nes, ess）可能在其他词中出现过。

**形态学优势：** 词缀通常携带重要的语义信息。FastText 的 n-gram 自动捕捉了前缀（un-, re-, dis-）和后缀（-tion, -ness, -able）的含义。这使得 "unhappy" 和 "happy" 的向量天然相近——它们共享大量 n-gram。

**训练：** FastText 的 Skip-gram 训练与 Word2Vec 类似，但每个词的表示从单一向量变为 n-gram 向量之和。负采样同样适用。`,
        code: [
          {
            lang: "python",
            code: `# FastText 子词分解
import numpy as np

def get_char_ngrams(word, min_n=3, max_n=6):
    """获取词的字符 n-gram"""
    word = f"<{word}>"  # 添加边界符
    ngrams = set()
    for n in range(min_n, max_n + 1):
        for i in range(len(word) - n + 1):
            ngrams.add(word[i:i+n])
    return ngrams

# 演示
words = ["where", "when", "what", "unhappy", "happiness", "happily"]
for word in words:
    ngrams = get_char_ngrams(word)
    print(f"{word:<12} → {len(ngrams):2d} n-grams: {sorted(ngrams)[:8]}")

# 共享 n-gram 分析
def shared_ngrams(w1, w2, min_n=3, max_n=6):
    g1 = get_char_ngrams(w1, min_n, max_n)
    g2 = get_char_ngrams(w2, min_n, max_n)
    shared = g1 & g2
    return shared

print("\\n=== 共享 n-gram 分析 ===")
pairs = [("happy", "unhappy"), ("happy", "happiness"), ("happy", "cat"),
         ("running", "runner"), ("running", "swimming")]
for w1, w2 in pairs:
    shared = shared_ngrams(w1, w2)
    ratio = len(shared) / max(len(get_char_ngrams(w1)), len(get_char_ngrams(w2)))
    print(f"  {w1:<12} ↔ {w2:<12}: {len(shared):2d} 共享 ({ratio:.0%})")`,
          },
          {
            lang: "python",
            code: `import numpy as np

class FastTextSimple:
    """简化版 FastText 实现"""
    
    def __init__(self, vocab, embed_dim=16, min_n=3, max_n=6):
        self.vocab = set(vocab)
        self.d = embed_dim
        self.min_n = min_n
        self.max_n = max_n
        
        # 收集所有 n-gram
        self.ngram2idx = {"<pad>": 0}
        idx = 1
        for word in vocab:
            for ngram in get_char_ngrams(word, min_n, max_n):
                if ngram not in self.ngram2idx:
                    self.ngram2idx[ngram] = idx
                    idx += 1
        
        self.ngram_size = len(self.ngram2idx)
        self.ngram_embeds = np.random.randn(self.ngram_size, embed_dim) * 0.1
        self.output_embeds = np.random.randn(len(vocab), embed_dim) * 0.1
        self.word2idx = {w: i for i, w in enumerate(vocab)}
    
    def get_word_vector(self, word):
        """获取词向量（所有 n-gram 向量之和）"""
        ngrams = get_char_ngrams(word, self.min_n, self.max_n)
        indices = [self.ngram2idx.get(g, 0) for g in ngrams]
        return self.ngram_embeds[indices].mean(axis=0)
    
    def get_oov_vector(self, word):
        """获取 OOV 词的向量"""
        ngrams = get_char_ngrams(word, self.min_n, self.max_n)
        indices = [self.ngram2idx.get(g, 0) for g in ngrams 
                   if g in self.ngram2idx]
        if not indices:
            return np.zeros(self.d)
        return self.ngram_embeds[indices].mean(axis=0)

# 演示
vocab = ["happy", "unhappy", "happiness", "happily", "sad", "sadness"]
ft = FastTextSimple(vocab, embed_dim=16)

print("=== FastText OOV 处理 ===")
oov_words = ["happier", "unhappiness", "unhappily", "apple"]
for word in oov_words:
    vec = ft.get_oov_vector(word)
    print(f"  {word:<15}: L2={np.linalg.norm(vec):.4f}, 前4维={vec[:4]}")

# 对比 Word2Vec 和 FastText
print("\\nWord2Vec: 'happier' → OOV (零向量)")
print("FastText: 'happier' → 'happ' + 'appi' + 'ppie' + 'pier' + 'ier>' 组合向量")`,
          },
          {
            lang: "python",
            code: `# FastText 在词形变化上的优势
import numpy as np

# 模拟训练后的 FastText 嵌入
np.random.seed(42)
d = 64

# happy 词族的 n-gram 共享
ngram_vectors = {}
base_ngrams = get_char_ngrams("happy")
for g in base_ngrams:
    ngram_vectors[g] = np.random.randn(d) * 0.1

# unhappy 共享大部分 happy 的 n-gram
unhappy_ngrams = get_char_ngrams("unhappy")
for g in unhappy_ngrams & base_ngrams:
    pass  # 已经存在

# 构建词向量
def build_vector(word, ngram_vectors):
    ngrams = get_char_ngrams(word)
    vecs = [ngram_vectors.get(g, np.random.randn(d) * 0.1) for g in ngrams]
    return np.mean(vecs, axis=0)

happy_vec = build_vector("happy", ngram_vectors)
unhappy_vec = build_vector("unhappy", ngram_vectors)
happiness_vec = build_vector("happiness", ngram_vectors)
cat_vec = np.random.randn(d) * 0.1  # 无关词

def cos_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

print("=== FastText 词形变化相似度 ===")
print(f"  happy    ↔ unhappy:   {cos_sim(happy_vec, unhappy_vec):.4f}")
print(f"  happy    ↔ happiness: {cos_sim(happy_vec, happiness_vec):.4f}")
print(f"  happy    ↔ cat:       {cos_sim(happy_vec, cat_vec):.4f}")

print("\\nWord2Vec 需要独立学习每个词的向量：")
print("  happy 和 unhappy 被视为完全独立的词")
print("  如果训练集中 unhappy 出现很少，其向量质量差")
print("\\nFastText 通过共享 n-gram 自动关联：")
print("  happy 和 unhappy 共享 'happy' n-gram")
print("  即使 unhappy 出现次数少，也能继承 happy 的信息")`,
          },
        ],
        table: {
          headers: ["特性", "Word2Vec", "GloVe", "FastText"],
          rows: [
            ["基本单元", "整词", "整词", "字符 n-gram"],
            ["OOV 处理", "❌ 无法处理", "❌ 无法处理", "✅ n-gram 组合"],
            ["形态学", "❌ 不感知", "❌ 不感知", "✅ 自动学习"],
            ["参数量", "V × d", "V × d", "G × d (G ≫ V)"],
            ["训练速度", "快", "快", "稍慢 (n-gram 分解)"],
            ["低频词表示", "较差", "一般", "好 (共享 n-gram)"],
            ["多语言", "需要分词器", "需要分词器", "对黏着语友好"],
          ],
        },
        mermaid: `graph TD
    A["输入词 'unhappy'"] --> B["字符 n-gram 分解"]
    B --> C1["<un"]
    B --> C2["unh"]
    B --> C3["nha"]
    B --> C4["hap"]
    B --> C5["app"]
    B --> C6["ppy"]
    B --> C7["py>"]
    C1 --> D["查 n-gram 嵌入表"]
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    C6 --> D
    C7 --> D
    D --> E["所有 n-gram 向量求和"]
    E --> F["最终词向量"]
    
    style A fill:#bbdefb
    style B fill:#fff9c4
    style D fill:#c8e6c9
    style F fill:#e1bee7`,
        tip: "如果你的任务涉及大量专业术语、拼写变体或多语言混合（如代码中的变量名、化学分子式、人名等），FastText 是比 Word2Vec 更好的选择。",
        warning: "FastText 的 n-gram 数量远大于词汇表大小（G ≫ V），因此参数量更大。对于小嵌入维度（如 d=50），n-gram 向量可能学习不充分，建议使用 d≥100。",
      },
      {
        title: "7. 词嵌入评估：如何衡量词向量质量",
        body: `训练好的词嵌入到底好不好？评估词嵌入质量有两个维度：**内在评估（Intrinsic Evaluation）**和**外在评估（Extrinsic Evaluation）**。

**内在评估：** 直接在词向量上测试特定语言能力。
- 词相似性（Word Similarity）：计算词对向量间的余弦相似度，与人类标注的相似度评分做相关性分析（Spearman/Pearson 相关系数）。常用数据集：WordSim-353、SimLex-999、MEN。
- 类比推理（Analogy）：测试向量空间的算术性质，如 "king - man + woman ≈ queen"。常用数据集：Google Analogy Test Set（包含语义类和语法类共 8 种关系）、BATS 数据集。

**外在评估：** 将词嵌入作为下游 NLP 任务的输入，看任务性能是否提升。这是更可靠的评估方式，因为最终目的是改善实际任务。常用任务：文本分类、NER、情感分析、机器翻译。

**可视化评估：** 用 t-SNE 或 PCA 将高维词向量降到 2D/3D，观察语义相似的词是否自然聚类。虽然不够定量，但直观有效。

**需要注意的陷阱：** 内在评估高分不代表外在评估一定好——词向量可能过度拟合了类比任务但没有学到真正有用的语义。相反，内在评估一般的词向量在外在任务上可能表现不错。`,
        code: [
          {
            lang: "python",
            code: `# 词相似性评估
import numpy as np
from scipy.stats import spearmanr, pearsonr

# WordSim-353 数据集示例 (词对, 人类评分)
wordsim353 = [
    ("tiger", "cat", 7.35),
    ("tiger", "tiger", 10.0),
    ("plane", "car", 5.77),
    ("train", "car", 6.31),
    ("television", "radio", 6.77),
    ("media", "radio", 7.42),
    ("doctor", "nurse", 7.00),
    ("professor", "doctor", 6.62),
    ("student", "professor", 6.81),
    ("smart", "student", 4.62),
    ("smart", "stupid", 5.81),
    ("company", "stock", 7.08),
    ("stock", "market", 8.13),
    ("stock", "phone", 1.62),
    ("stock", "CD", 1.62),
    ("stock", "jaguar", 0.92),
    ("money", "bank", 7.19),
    ("money", "cash", 9.15),
    ("money", "property", 5.94),
    ("money", "possession", 7.29),
]

# 模拟词嵌入（用预训练向量会更准确）
np.random.seed(42)
vocab_words = set()
for w1, w2, _ in wordsim353:
    vocab_words.add(w1)
    vocab_words.add(w2)
vocab = list(vocab_words)
embeddings = {w: np.random.randn(100) for w in vocab}

# 故意让语义相似的词向量更近
embeddings["cat"] = embeddings["tiger"] * 0.9 + np.random.randn(100) * 0.1
embeddings["car"] = embeddings["plane"] * 0.7 + np.random.randn(100) * 0.1
embeddings["radio"] = embeddings["television"] * 0.8 + np.random.randn(100) * 0.1
embeddings["nurse"] = embeddings["doctor"] * 0.85 + np.random.randn(100) * 0.1
embeddings["cash"] = embeddings["money"] * 0.95 + np.random.randn(100) * 0.05
embeddings["possession"] = embeddings["money"] * 0.7 + np.random.randn(100) * 0.1

def cos_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 计算模型预测的相似度
model_scores = []
human_scores = []
for w1, w2, score in wordsim353:
    if w1 in embeddings and w2 in embeddings:
        model_scores.append(cos_sim(embeddings[w1], embeddings[w2]))
        human_scores.append(score)

if model_scores:
    spearman, _ = spearmanr(model_scores, human_scores)
    pearson, _ = pearsonr(model_scores, human_scores)
    print(f"WordSim-353 评估结果:")
    print(f"  Spearman 相关: {spearman:.4f}")
    print(f"  Pearson 相关:  {pearson:.4f}")
    print(f"  (理想值 > 0.6 为良好, > 0.7 为优秀)")`,
          },
          {
            lang: "python",
            code: `# 类比推理评估
import numpy as np

def evaluate_analogies(embeddings, questions):
    """评估类比推理准确率
    questions: [(a, b, c, expected_answer), ...]
    测试: a - b + c ≈ expected_answer
    """
    def cos_sim(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    correct = 0
    total = 0
    
    for a, b, c, expected in questions:
        if all(w in embeddings for w in [a, b, c, expected]):
            # 计算类比向量
            analogy_vec = embeddings[a] - embeddings[b] + embeddings[c]
            
            # 在所有词中找最相似的（排除 a, b, c）
            best_word = None
            best_sim = -float('inf')
            exclude = {a, b, c}
            
            for word, vec in embeddings.items():
                if word in exclude:
                    continue
                sim = cos_sim(analogy_vec, vec)
                if sim > best_sim:
                    best_sim = sim
                    best_word = word
            
            total += 1
            if best_word == expected:
                correct += 1
                print(f"  ✅ {a} - {b} + {c} = {best_word} (sim={best_sim:.3f})")
            else:
                print(f"  ❌ {a} - {b} + {c} = {best_word} (期望: {expected})")
    
    if total > 0:
        print(f"\\n准确率: {correct}/{total} = {correct/total:.1%}")
    return correct / total if total > 0 else 0

# 模拟预训练嵌入
np.random.seed(42)
d = 300

# 语义类比
king = np.random.randn(d)
queen = king - np.array([1.0] * d * 0.01) + np.random.randn(d) * 0.05
man = np.random.randn(d)
woman = man - np.array([1.0] * d * 0.01) + np.random.randn(d) * 0.05

# 首都类比
paris = np.random.randn(d)
france = paris + np.array([0.5] * d * 0.02) + np.random.randn(d) * 0.03
london = np.random.randn(d)
england = london + np.array([0.5] * d * 0.02) + np.random.randn(d) * 0.03

embeddings = {"king": king, "queen": queen, "man": man, "woman": woman,
              "paris": paris, "france": france, "london": london, "england": england,
              "cat": np.random.randn(d), "dog": np.random.randn(d)}

questions = [
    ("king", "man", "woman", "queen"),
    ("paris", "france", "london", "england"),
]

evaluate_analogies(embeddings, questions)`,
          },
          {
            lang: "python",
            code: `# t-SNE 可视化词嵌入
import numpy as np

def tsne_simple(words, embeddings, perplexity=5):
    """简化的 t-SNE 可视化（使用 sklearn）"""
    try:
        from sklearn.manifold import TSNE
        vecs = np.array([embeddings[w] for w in words])
        tsne = TSNE(n_components=2, perplexity=min(perplexity, len(words)-1),
                    random_state=42, n_iter=1000)
        coords = tsne.fit_transform(vecs)
        return coords
    except ImportError:
        # 如果没有 sklearn，用 PCA 替代
        from sklearn.decomposition import PCA
        vecs = np.array([embeddings[w] for w in words])
        pca = PCA(n_components=2)
        return pca.fit_transform(vecs)

# 构建语义聚类
np.random.seed(42)
d = 50

# 动物类
center_animal = np.random.randn(d)
animals = {"cat", "dog", "bird", "fish", "horse", "elephant", "lion", "tiger"}
animal_embeds = {w: center_animal + np.random.randn(d) * 0.3 for w in animals}

# 水果类
center_fruit = np.random.randn(d) + 5
fruits = {"apple", "banana", "orange", "grape", "peach", "mango", "lemon"}
fruit_embeds = {w: center_fruit + np.random.randn(d) * 0.3 for w in fruits}

# 车辆类
center_vehicle = np.random.randn(d) - 5
vehicles = {"car", "truck", "bus", "train", "plane", "boat", "bike"}
vehicle_embeds = {w: center_vehicle + np.random.randn(d) * 0.3 for w in vehicles}

all_embeds = {**animal_embeds, **fruit_embeds, **vehicle_embeds}
all_words = list(all_embeds.keys())

coords = tsne_simple(all_words, all_embeds)

# 打印 2D 坐标（可用来画图）
print("=== 词嵌入 t-SNE 2D 坐标 ===")
categories = {"动物": animals, "水果": fruits, "车辆": vehicles}
for cat, words in categories.items():
    print(f"\\n{cat}:")
    for w in words:
        idx = all_words.index(w)
        print(f"  {w:<12} ({coords[idx][0]:6.2f}, {coords[idx][1]:6.2f})")

print("\\n在 t-SNE 图中，同一类别的词应该自然聚类在一起")
print("如果不同类别的词混在一起，说明嵌入质量不佳")`,
          },
        ],
        table: {
          headers: ["评估方法", "测试内容", "数据规模", "评价标准", "优点", "缺点"],
          rows: [
            ["词相似性 (WordSim-353)", "词对语义相似度", "353 对", "Spearman 相关", "快速直观", "不全面"],
            ["词相似性 (SimLex-999)", "真正的相似性 (非关联)", "999 对", "Spearman 相关", "区分相似/关联", "较小"],
            ["类比推理 (Google)", "向量算术性质", "19,544 题", "准确率", "测试关系推理", "不一定反映实用性"],
            ["下游任务 (文本分类)", "实际任务性能", "任务相关", "F1/Accuracy", "最可靠", "慢，依赖任务"],
            ["t-SNE 可视化", "空间结构", "全部词汇", "目视检查", "直观", "主观"],
          ],
        },
        mermaid: `graph TD
    A["词嵌入训练完成"] --> B{"评估方式?"}
    B -->|"内在评估"| C["词相似性测试"]
    B -->|"内在评估"| D["类比推理测试"]
    B -->|"内在评估"| E["t-SNE 可视化"]
    B -->|"外在评估"| F["下游任务性能"]
    C --> G["Spearman 相关系数"]
    D --> H["类比准确率"]
    E --> I["聚类效果目视"]
    F --> J["F1/Accuracy/mAP"]
    G --> K["综合评估报告"]
    H --> K
    I --> K
    J --> K`,
        tip: "评估词嵌入时，内在评估和外在评估要结合看。内在评估让你快速比较不同嵌入的质量，外在评估告诉你嵌入在实际任务中的真实价值。不要只看类比准确率——一个类比准确率 78% 的嵌入在文本分类上可能不如一个 65% 的嵌入。",
        warning: "常见陷阱：(1) 在评估时没有排除训练集中的词对（数据泄露）；(2) 类比测试时没有排除输入词本身（如 king - man + woman = king）；(3) 用 t-SNE 的超参数（如 perplexity）操控可视化效果来'证明'嵌入质量好。",
      },
    ],
  };
