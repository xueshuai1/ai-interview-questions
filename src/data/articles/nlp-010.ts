import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-010",
    title: "NLP 评估指标：BLEU, ROUGE, METEOR",
    category: "nlp",
    tags: ["评估指标", "NLP", "BLEU"],
    summary: "从 BLEU 到 BERTScore，掌握 NLP 任务的评估体系",
    date: "2026-04-12",
    readTime: "16 min",
    level: "入门",
    content: [
      {
        title: "1. 为什么需要评估指标？",
        body: `自然语言处理任务中，模型生成的文本质量很难用简单的「对或错」来衡量。想象一下：你训练了一个机器翻译模型，它把「今天天气很好」翻译成了「今天的天气非常好」。这个翻译和参考译文不完全一致，但语义完全正确——传统的精确匹配（exact match）会给出 0 分，这显然不合理。

评估指标的核心作用有三：第一，**量化比较**——在不同模型之间提供客观的数值对比；第二，**训练信号**——某些指标可直接作为优化目标（如 Perplexity）；第三，**调试诊断**——通过分析指标得分发现模型的薄弱环节。

NLP 评估经历了从「基于词面重叠」到「基于语义相似度」的演进。早期的 BLEU、ROUGE 只关心 n-gram 是否匹配，而现代的 BERTScore 利用预训练语言模型的语义空间来衡量。理解这个演进路径，对选择合适的评估方法至关重要。`,
        code: [
          {
            lang: "python",
            code: `# 问题：精确匹配在 NLP 中几乎无用
reference = "The cat is on the mat"
prediction = "A cat sits on the mat"

# 逐词对比
ref_words = reference.lower().split()
pred_words = prediction.lower().split()

exact_match = ref_words == pred_words
print(f"精确匹配: {exact_match}")
# False —— 但这两句话意思几乎一样！

# 词级别重叠
overlap = set(ref_words) & set(pred_words)
print(f"重叠词: {overlap}")
print(f"重叠率: {len(overlap) / len(ref_words):.2%}")
# 4/6 = 66.7% — 这才是有意义的信号`,
          },
          {
            lang: "python",
            code: `# 评估指标的三大类别
eval_categories = {
    "基于重叠": {
        "examples": ["BLEU", "ROUGE", "METEOR"],
        "principle": "比较预测文本与参考文本的 n-gram 重叠度",
        "pros": "计算快速、无需训练、可解释",
        "cons": "忽略语义、对同义词不鲁棒",
    },
    "基于语言模型": {
        "examples": ["Perplexity", "Cross-Entropy"],
        "principle": "衡量模型对文本的困惑程度",
        "pros": "可直接作为训练目标",
        "cons": "只适用于生成概率模型",
    },
    "基于语义": {
        "examples": ["BERTScore", "BLEURT", "COMET"],
        "principle": "利用预训练模型的语义空间计算相似度",
        "pros": "捕捉语义、对改写鲁棒",
        "cons": "计算开销大、依赖预训练模型",
    },
}

for cat, info in eval_categories.items():
    print(f"\\n{cat}: {', '.join(info['examples'])}")
    print(f"  原理: {info['principle']}")`,
          },
        ],
        table: {
          headers: ["指标类型", "代表方法", "适用任务", "计算速度"],
          rows: [
            ["基于重叠", "BLEU / ROUGE / METEOR", "翻译 / 摘要", "极快"],
            ["基于语言模型", "Perplexity / Cross-Entropy", "语言建模", "快"],
            ["基于语义", "BERTScore / BLEURT", "翻译 / 摘要 / 对话", "较慢"],
            ["基于模型评分", "COMET / BLEURT", "翻译", "较慢"],
          ],
        },
        mermaid: `graph LR
    A["NLP 评估"] --> B["基于重叠"]
    A --> C["基于语言模型"]
    A --> D["基于语义"]
    B --> B1["BLEU - 翻译"]
    B --> B2["ROUGE - 摘要"]
    B --> B3["METEOR - 改进重叠"]
    C --> C1["Perplexity"]
    D --> D1["BERTScore"]
    D --> D2["BLEURT"]`,
        tip: "入门项目先用 BLEU 和 ROUGE 快速建立基线，再考虑用 BERTScore 做深度分析。",
        warning: "不要只用单一指标评估模型——BLEU 高的模型未必在实际应用中表现更好。",
      },
      {
        title: "2. BLEU：机器翻译的黄金标准",
        body: `BLEU（Bilingual Evaluation Understudy）由 Papineni 等人在 2002 年提出，是 NLP 领域最有影响力的评估指标之一。它的核心思想非常直观：如果机器翻译的 n-gram 与人工参考译文的 n-gram 重叠越多，翻译质量就越好。

BLEU 的计算分为两步：首先是**修正的 n-gram 精确率**——统计预测文本中每个 n-gram 在参考文本中出现的次数，超过参考次数的部分会被截断（防止模型通过重复同一个词刷分）。然后是** brevity penalty（简短惩罚）**——如果预测文本比参考文本短，会受到指数级惩罚，防止模型只输出很短但高精确率的内容。

最终的 BLEU 分数是 1 到 4-gram 精确率的几何平均，再乘以简短惩罚。取值范围 0-1（通常以 0-100 表示）。一般来说，BLEU > 30 被认为是可接受的翻译，BLEU > 60 接近人工翻译水平。`,
        code: [
          {
            lang: "python",
            code: `import math
from collections import Counter

def modified_precision(pred, refs, n):
    """计算修正的 n-gram 精确率"""
    pred_ngrams = Counter(zip(*[pred[i:] for i in range(n)]))
    max_ref_counts = Counter()
    for ref in refs:
        ref_ngrams = Counter(zip(*[ref[i:] for i in range(n)]))
        for ng, count in ref_ngrams.items():
            max_ref_counts[ng] = max(max_ref_counts[ng], count)

    clipped = sum(min(pred_ngrams[ng], max_ref_counts.get(ng, 0))
                   for ng in pred_ngrams)
    total = sum(pred_ngrams.values())
    return clipped / max(total, 1)

# 示例
reference = [["The", "cat", "is", "on", "the", "mat"]]
prediction = ["The", "cat", "is", "on", "the", "mat"]

for n in range(1, 5):
    prec = modified_precision(prediction, reference, n)
    print(f"{n}-gram 精确率: {prec:.4f}")`,
          },
          {
            lang: "python",
            code: `def bleu_score(pred, refs, max_n=4):
    """计算 BLEU 分数"""
    # 计算各阶 n-gram 精确率
    precisions = []
    for n in range(1, max_n + 1):
        p = modified_precision(pred, refs, n)
        precisions.append(p)
        print(f"P{n} = {p:.4f}")

    # 几何平均
    if any(p == 0 for p in precisions):
        return 0.0

    log_avg = sum(math.log(p) for p in precisions) / max_n
    bp = math.exp(log_avg)

    # 简短惩罚
    pred_len = len(pred)
    ref_len = min(len(r) for r in refs)
    if pred_len < ref_len:
        bp *= math.exp(1 - ref_len / pred_len)

    return bp * 100

refs = [["I", "love", "machine", "translation"]]
preds = ["I", "love", "machine", "translation"]
print(f"\\nBLEU: {bleu_score(preds, refs):.2f}")

preds2 = ["I", "like", "machine", "learning"]
print(f"BLEU: {bleu_score(preds2, refs):.2f}")`,
          },
        ],
        table: {
          headers: ["n-gram 阶数", "捕捉什么", "BLEU 中的权重"],
          rows: [
            ["1-gram", "词汇选择是否正确", "等权（几何平均）"],
            ["2-gram", "局部搭配是否自然", "等权（几何平均）"],
            ["3-gram", "短片段是否流畅", "等权（几何平均）"],
            ["4-gram", "更长片段的一致性", "等权（几何平均）"],
          ],
        },
        mermaid: `graph TD
    A["预测译文"] --> B["提取 1-4 gram"]
    C["参考译文"] --> D["提取 1-4 gram"]
    B --> E["修正计数 clip"]
    D --> E
    E --> F["计算各阶精确率"]
    F --> G["几何平均"]
    G --> H["Brevity Penalty"]
    H --> I["BLEU 分数"]`,
        tip: "BLEU 对多个参考译文支持良好——传入多个人工翻译作为参考列表，取每个 n-gram 的最大出现次数。",
        warning: "BLEU 不保证语义正确性。「我喜欢猫」和「我讨厌猫」可能有相同的 BLEU 分数（如果参考译文中恰好有对应词）。",
      },
      {
        title: "3. ROUGE：文本摘要的评估利器",
        body: `ROUGE（Recall-Oriented Understudy for Gouping Evaluation）由 Lin 在 2004 年提出，最初用于自动文本摘要评估。与 BLEU 关注精确率不同，ROUGE 更关注**召回率**——参考摘要中有多少内容被生成摘要覆盖了。

这个设计直觉很清晰：摘要任务的关键是「不遗漏重要信息」。一个短的摘要可以很容易做到高精确率（只说最重要的话），但如果漏掉了关键信息，召回率就会很低。因此 ROUGE 以召回率为主，同时也会报告 F1 分数。

ROUGE 有多个变体：ROUGE-N 计算 n-gram 召回率，最常用的是 ROUGE-1（unigram）和 ROUGE-2（bigram）；ROUGE-L 基于最长公共子序列（LCS），不需要连续的 n-gram 匹配，更能捕捉句子级别的相似性；ROUGE-S 计算跳跃 bigram，允许中间有间隔的词对匹配。`,
        code: [
          {
            lang: "python",
            code: `def rouge_n_recall(pred, refs, n=1):
    """计算 ROUGE-N 召回率"""
    pred_ngrams = set(zip(*[pred[i:] for i in range(n)]))
    # 合并所有参考的 n-gram
    ref_ngrams = set()
    for ref in refs:
        ref_ngrams.update(zip(*[ref[i:] for i in range(n)]))

    if len(ref_ngrams) == 0:
        return 0.0

    matched = len(pred_ngrams & ref_ngrams)
    recall = matched / len(ref_ngrams)

    # 精确率
    precision = matched / len(pred_ngrams) if pred_ngrams else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    return {"R": recall, "P": precision, "F1": f1}

ref = [["AI", "is", "transforming", "the", "world"]]
pred = ["AI", "is", "changing", "the", "world", "rapidly"]
result = rouge_n_recall(pred, ref, n=1)
print(f"ROUGE-1: R={result['R']:.3f}, P={result['P']:.3f}, F1={result['F1']:.3f}")`,
          },
          {
            lang: "python",
            code: `def rouge_l_f1(pred, ref):
    """基于最长公共子序列的 ROUGE-L"""
    m, n = len(pred), len(ref)
    # 动态规划计算 LCS
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if pred[i-1] == ref[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    lcs_len = dp[m][n]
    if lcs_len == 0:
        return {"R": 0, "P": 0, "F1": 0}

    recall = lcs_len / n
    precision = lcs_len / m
    beta = 1.2  # 更重视召回率
    f1 = ((1 + beta**2) * precision * recall) / (precision + beta**2 * recall + 1e-12)
    return {"R": recall, "P": precision, "F1": f1}

ref = ["The", "model", "achieves", "state", "of", "the", "art"]
pred = ["The", "new", "model", "achieves", "art", "results"]
result = rouge_l_f1(pred, ref)
print(f"ROUGE-L: R={result['R']:.3f}, P={result['P']:.3f}, F1={result['F1']:.3f}")`,
          },
        ],
        table: {
          headers: ["ROUGE 变体", "匹配方式", "优势", "适用场景"],
          rows: [
            ["ROUGE-1", "Unigram 重叠", "捕捉关键词覆盖", "摘要关键信息评估"],
            ["ROUGE-2", "Bigram 重叠", "捕捉局部连贯性", "摘要流畅度评估"],
            ["ROUGE-L", "最长公共子序列", "不要求连续匹配", "句子级相似性"],
            ["ROUGE-S", "跳跃 Bigram", "允许词间间隔", "灵活的结构匹配"],
          ],
        },
        mermaid: `graph TD
    A["生成摘要"] --> B["提取 n-gram"]
    C["参考摘要"] --> D["提取 n-gram"]
    B --> E["计算召回率"]
    D --> E
    E --> F{"ROUGE 变体"}
    F --> G["ROUGE-N"]
    F --> H["ROUGE-L"]
    F --> I["ROUGE-S"]
    G --> J["F1 分数"]
    H --> J
    I --> J`,
        tip: "论文中通常同时报告 ROUGE-1、ROUGE-2 和 ROUGE-L，这样读者可以全面了解摘要质量。",
        warning: "ROUGE 对摘要长度敏感——过长的摘要容易获得高召回率，但可能包含大量冗余信息。建议结合 ROUGE 精确率一起分析。",
      },
      {
        title: "4. METEOR：对 BLEU 的重要改进",
        body: `METEOR（Metric for Evaluation of Translation with Explicit ORdering）由 Banerjee 和 Lavie 在 2005 年提出，直接针对 BLEU 的几个已知缺陷进行了改进。

第一个改进是**召回率导向**。BLEU 纯粹是精确率指标，而 METEOR 先计算单字（unigram）的精确率和召回率，然后用调和平均（F-mean）结合，其中召回率的权重更高（alpha=0.85）。这更符合翻译评估的直觉——漏译比多译更严重。

第二个改进是**同义词匹配**。METEOR 内置了 WordNet 同义词库和词干提取器，即使预测和参考用了不同的词（如 "big" vs "large"），也能被识别为匹配。第三个改进是**片段惩罚（fragmentation penalty）**——如果匹配的词在句子中分布得很分散，说明语序混乱，会被扣分。这使得 METEOR 在句子级别的评估上与人工评判的相关性显著高于 BLEU。`,
        code: [
          {
            lang: "python",
            code: `import nltk
from nltk.corpus import wordnet
from collections import Counter

def get_synonyms(word):
    """获取单词的所有同义词"""
    synonyms = {word.lower()}
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name().lower())
    return synonyms

def meteor_unigram_match(pred, refs):
    """METEOR 风格的 unigram 匹配（含同义词）"""
    pred_words = [w.lower() for w in pred]
    ref_words = [w.lower() for refs_list in refs for w in refs_list]

    matched = 0
    ref_used = set()

    for i, pw in enumerate(pred_words):
        # 精确匹配
        for j, rw in enumerate(ref_words):
            if j not in ref_used and pw == rw:
                matched += 1
                ref_used.add(j)
                break
        else:
            # 同义词匹配
            syns = get_synonyms(pw)
            for j, rw in enumerate(ref_words):
                if j not in ref_used and rw in syns:
                    matched += 1
                    ref_used.add(j)
                    break

    precision = matched / len(pred_words) if pred_words else 0
    recall = matched / len(ref_words) if ref_words else 0
    return precision, recall, matched

print("METEOR unigram 匹配（含同义词）")
print(f"big 的同义词: {get_synonyms('big')}")
print(f"good 的同义词: {get_synonyms('good')}")`,
          },
          {
            lang: "python",
            code: `def meteor_score(pred, refs, alpha=0.85, beta=3.0, gamma=0.5):
    """简化版 METEOR 分数计算"""
    pred_words = pred.lower().split()
    ref_words = refs.lower().split()

    # 精确匹配
    pred_counter = Counter(pred_words)
    ref_counter = Counter(ref_words)

    matched = sum(min(pred_counter[w], ref_counter[w]) for w in pred_counter)
    precision = matched / len(pred_words) if pred_words else 0
    recall = matched / len(ref_words) if ref_words else 0

    # 调和平均（更重视召回率）
    f_mean = (alpha * recall + (1 - alpha) * precision)
    if precision + recall == 0:
        f_mean = 0

    # 片段惩罚
    # 简化：假设完全连续则 penalty=0，完全分散则 penalty 最大
    fragments = max(1, len(pred_words) - matched + 1)
    penalty = 0.5 * (fragments / max(matched, 1)) ** beta

    final = f_mean * (1 - penalty)
    return max(0, final)

ref = "The quick brown fox jumps over the lazy dog"
pred1 = "The quick brown fox jumps over the lazy dog"
pred2 = "dog lazy the over jumps fox brown quick The"

print(f"完全匹配: {meteor_score(pred1, ref):.4f}")
print(f"词序打乱: {meteor_score(pred2, ref):.4f}")
# 片段惩罚会让 pred2 得分更低`,
          },
        ],
        table: {
          headers: ["特性", "BLEU", "METEOR", "改进效果"],
          rows: [
            ["导向", "精确率", "召回率（加权 F-mean）", "更符合翻译直觉"],
            ["词汇匹配", "严格精确", "同义词 + 词干", "覆盖更多有效翻译"],
            ["语序考量", "仅通过 n-gram 间接体现", "片段惩罚直接扣分", "对语序更敏感"],
            ["人工相关性", "中等（0.2-0.3）", "较高（0.3-0.5）", "与人工评分更接近"],
          ],
        },
        mermaid: `graph LR
    A["预测文本"] --> B["Unigram 匹配"]
    C["参考文本"] --> B
    B --> D["同义词扩展"]
    D --> E["精确率 P"]
    D --> F["召回率 R"]
    E --> G["F-mean (α=0.85)"]
    F --> G
    G --> H["片段惩罚"]
    H --> I["METEOR 分数"]`,
        tip: "WMT（机器翻译工作坊）多年来的评估显示，METEOR 与人工评分的相关性通常高于 BLEU，尤其在低资源语言对上。",
        warning: "METEOR 依赖 WordNet 等语言资源，对英语效果最好。评估中文等语言时，同义词匹配的优势会大幅减弱。",
      },
      {
        title: "5. Perplexity：语言模型的内在评估",
        body: `Perplexity（困惑度）是语言模型最经典的内在评估指标，衡量模型对测试数据的「惊讶程度」。直觉上，如果一个语言模型对下一词的预测越准确，它的困惑度就越低。

数学定义是：PP = 2^H，其中 H 是交叉熵（cross-entropy）。交叉熵 H = -1/N * Σ log₂ P(wᵢ | w₁, ..., wᵢ₋₁)，即模型对测试集中每个词的平均负对数概率。Perplexity 可以理解为模型在每一步平均从多少个等概率选项中做选择——PP=100 意味着模型每步相当于从 100 个候选词中猜一个。

Perplexity 的优势在于它与语言模型的训练目标（最大化似然）直接对应，优化 Perplexity 等价于优化交叉熵损失。但它也有局限：Perplexity 只衡量模型对给定文本的拟合度，不直接反映生成文本的质量或有用性。一个 Perplexity 很低的模型可能生成重复、无聊但语法正确的文本。`,
        code: [
          {
            lang: "python",
            code: `import math

def perplexity_from_probs(probs):
    """从每步的概率计算困惑度"""
    N = len(probs)
    # 交叉熵
    cross_entropy = -sum(math.log2(p + 1e-10) for p in probs) / N
    # 困惑度
    pp = 2 ** cross_entropy
    return pp

# 模拟语言模型对一句话的逐词预测概率
# 句子: "The cat sat on the mat"
probs = [
    0.15,   # P(The) — 句首，不确定性高
    0.30,   # P(cat | The) — 合理的后续词
    0.25,   # P(sat | The cat) — 合理
    0.40,   # P(on | The cat sat) — 很合理
    0.60,   # P(the | The cat sat on) — 非常确定
    0.80,   # P(mat | The cat sat on the) — 几乎确定
]

pp = perplexity_from_probs(probs)
print(f"交叉熵: {-sum(math.log2(p) for p in probs) / len(probs):.2f} bits")
print(f"困惑度: {pp:.2f}")
print(f"等效选项数: 模型每步平均从 {pp:.0f} 个词中选择")`,
          },
          {
            lang: "python",
            code: `# 使用 HuggingFace transformers 计算 Perplexity
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

def compute_perplexity(model, tokenizer, text):
    """计算给定文本的困惑度"""
    encodings = tokenizer(text, return_tensors="pt")
    max_length = model.config.max_position_embeddings
    seq_len = encodings.input_ids.size(1)

    # 如果文本太长，截断
    if seq_len > max_length:
        encodings.input_ids = encodings.input_ids[:, :max_length]
        encodings.attention_mask = encodings.attention_mask[:, :max_length]

    with torch.no_grad():
        outputs = model(
            encodings.input_ids,
            labels=encodings.input_ids
        )
        loss = outputs.loss  # 交叉熵损失
        ppl = torch.exp(loss)

    return ppl.item()

# 示例（需要安装 transformers）
# model_name = "gpt2"
# model = AutoModelForCausalLM.from_pretrained(model_name)
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# text = "The cat sat on the mat."
# print(f"Perplexity: {compute_perplexity(model, tokenizer, text):.2f}")
print("使用 GPT-2 计算困惑度的示例代码（取消注释运行）")`,
          },
        ],
        table: {
          headers: ["困惑度范围", "含义", "典型场景"],
          rows: [
            ["< 10", "极好的语言模型", "小规模受限领域"],
            ["10 - 50", "良好的语言模型", "新闻、小说等通用领域"],
            ["50 - 200", "可用的语言模型", "早期 RNN 语言模型"],
            ["> 200", "较差的语言模型", "训练不足或领域不匹配"],
          ],
        },
        mermaid: `graph TD
    A["测试文本"] --> B["语言模型"]
    B --> C["逐词概率 P(wᵢ|context)"]
    C --> D["交叉熵 H"]
    D --> E["Perplexity = 2^H"]
    E --> F["越低越好"]
    style F fill:#90EE90`,
        tip: "比较不同模型的 Perplexity 时，必须在相同的测试集上计算，否则结果不可比。",
        warning: "Perplexity 和生成质量不是完全正相关的。过低的 Perplexity 可能意味着模型过度记住了训练数据（过拟合），反而降低了泛化能力。",
      },
      {
        title: "6. BERTScore：基于语义的评估革命",
        body: `BERTScore 由 Zhang 等人在 2020 年提出，标志着 NLP 评估从「词面匹配」到「语义匹配」的范式转变。它的核心思想很简单：与其比较两个句子的词是否相同，不如比较它们的语义表示是否相似。

具体做法是：用预训练的 BERT（或其他 Transformer 模型）分别编码候选文本和参考文本，得到每个 token 的上下文向量表示。然后对候选文本中的每个 token，在参考文本中找到余弦相似度最高的 token（贪婪匹配），对所有匹配对取平均得到精确率。反过来再做一次得到召回率。最后计算 F1 作为 BERTScore。

这种方法的优势是巨大的：「I adore this movie」和「I love this film」在传统指标下得分很低，但 BERTScore 会给出高分，因为 BERT 的语义空间知道 adore≈love、movie≈film。BERTScore 在 WMT19 评估中与人工评分的相关性远超 BLEU。`,
        code: [
          {
            lang: "python",
            code: `# BERTScore 的核心计算流程
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel

def bert_similarity(tokenizer, model, cand, ref):
    """计算候选和参考文本的 BERT 相似度矩阵"""
    # 编码
    cand_input = tokenizer(cand, return_tensors="pt", padding=True)
    ref_input = tokenizer(ref, return_tensors="pt", padding=True)

    with torch.no_grad():
        cand_out = model(**cand_input)
        ref_out = model(**ref_input)

    # 获取 token 级别的表示（取最后一层）
    cand_emb = cand_out.last_hidden_state[0]  # [seq_len_c, dim]
    ref_emb = ref_out.last_hidden_state[0]    # [seq_len_r, dim]

    # 归一化
    cand_emb = F.normalize(cand_emb, p=2, dim=1)
    ref_emb = F.normalize(ref_emb, p=2, dim=1)

    # 余弦相似度矩阵
    sim_matrix = torch.mm(cand_emb, ref_emb.T)
    return sim_matrix

# 示例（需要模型权重）
# tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
# model = AutoModel.from_pretrained("bert-base-uncased")
# sim = bert_similarity(tokenizer, model,
#     "I adore this movie", "I love this film")
# print(f"相似度矩阵形状: {sim.shape}")
print("BERT 相似度矩阵计算流程（取消注释运行）")`,
          },
          {
            lang: "python",
            code: `# 使用官方 bert-score 库
# pip install bert-score
from bert_score import score

# 示例数据
candidates = [
    "I adore this movie",
    "The weather is nice today",
    "The cat is sitting on the mat",
]
references = [
    "I love this film",
    "Today the weather is beautiful",
    "A cat sits on the mat",
]

# 计算 BERTScore
# P, R, F1 = score(candidates, references, lang="en", verbose=True)
# print(f"Average P: {P.mean():.4f}")
# print(f"Average R: {R.mean():.4f}")
# print(f"Average F1: {F1.mean():.4f}")

# 手动演示贪婪匹配
import numpy as np

def greedy_matching(sim_matrix):
    """贪婪匹配计算精确率和召回率"""
    # 精确率：每个候选 token 找最佳参考 token
    precision = sim_matrix.max(dim=1).values.mean().item()
    # 召回率：每个参考 token 找最佳候选 token
    recall = sim_matrix.max(dim=0).values.mean().item()
    # F1
    f1 = 2 * precision * recall / (precision + recall + 1e-10)
    return precision, recall, f1

# 模拟相似度矩阵（4个候选token x 5个参考token）
sim = np.array([
    [0.95, 0.10, 0.05, 0.02, 0.01],  # I → I
    [0.20, 0.92, 0.08, 0.03, 0.02],  # adore → love
    [0.05, 0.10, 0.88, 0.05, 0.03],  # this → this
    [0.02, 0.05, 0.08, 0.93, 0.04],  # movie → film
])
P, R, F1 = greedy_matching(torch.tensor(sim))
print(f"P={P:.4f}, R={R:.4f}, F1={F1:.4f}")`,
          },
        ],
        table: {
          headers: ["特性", "BLEU", "BERTScore", "差异"],
          rows: [
            ["匹配方式", "词面精确匹配", "语义向量相似度", "BERTScore 能识别同义替换"],
            ["语言模型", "无", "BERT/RoBERTa/DeBERTa", "依赖预训练模型质量"],
            ["计算速度", "极快（毫秒级）", "较慢（GPU 秒级）", "BERTScore 慢约 100-1000 倍"],
            ["人工相关性", "0.2-0.3", "0.5-0.7", "BERTScore 显著更接近人类判断"],
          ],
        },
        mermaid: `graph TD
    A["候选文本"] --> B["BERT 编码"]
    C["参考文本"] --> D["BERT 编码"]
    B --> E["Token 向量"]
    D --> E
    E --> F["余弦相似度矩阵"]
    F --> G["贪婪匹配 → Precision"]
    F --> H["贪婪匹配 → Recall"]
    G --> I["F1 Score"]
    H --> I
    I --> J["BERTScore"]`,
        tip: "BERTScore 支持多种底层模型（bert-base、roberta-large、deberta-xlarge），模型越大通常与人工评分的相关性越高。",
        warning: "BERTScore 对领域外文本效果会下降——如果候选/参考文本的主题与 BERT 预训练语料差异很大，语义表示可能不够准确。",
      },
      {
        title: "7. 实战：sacrebleu 和 evaluate 工具箱",
        body: `在实际项目中，你不会从零实现 BLEU 或 ROUGE，而是使用成熟的评估库。这里介绍两个最常用的工具：sacrebleu 和 HuggingFace 的 evaluate 库。

**sacrebleu** 是 BLEU 的标准化实现，解决了原始 BLEU 实现中的多个不一致问题：它强制使用统一的 tokenization 方案（避免不同实现得出不同结果），内置了多组标准测试集（如 WMT14/17/19），并且一行命令就能复现论文中的 BLEU 分数。它的口号是：「提供可复现、可比较、可引用的 BLEU 分数」。

**evaluate** 是 HuggingFace 推出的统一评估框架，将 BLEU、ROUGE、METEOR、BERTScore 等数十种指标封装成统一的 API。你只需要 load_metric（或 load），传入 predictions 和 references 就能得到结果。它统一了后端实现，让比较不同指标变得异常简单。`,
        code: [
          {
            lang: "bash",
            code: `# sacrebleu CLI 使用
# 安装
pip install sacrebleu

# 从文件计算 BLEU
sacrebleu data/refs.txt -i data/hypo.txt -m bleu

# 指定 tokenize 方式
sacrebleu data/refs.txt -i data/hypo.txt -m bleu -tok zh

# 下载并使用标准测试集
sacrebleu -t wmt19 -l en-de --echo src > src.txt
sacrebleu -t wmt19 -l en-de --echo ref > ref.txt

# 计算多个指标
sacrebleu data/refs.txt -i data/hypo.txt -m bleu chrf ter

# Python API
python -c "
import sacrebleu
refs = [['The cat is on the mat']]
hyps = ['The cat is on the mat']
bleu = sacrebleu.corpus_bleu(hyps, refs)
print(bleu.format())
"`,
          },
          {
            lang: "python",
            code: `# HuggingFace evaluate 库实战
# pip install evaluate rouge-score bert-score

import evaluate

# 加载多个指标
bleu = evaluate.load("bleu")
rouge = evaluate.load("rouge")
meteor = evaluate.load("meteor")
bertscore = evaluate.load("bertscore")

predictions = [
    "The cat is on the mat",
    "I love this movie very much",
]
references = [
    ["The cat is sitting on the mat", "A cat is on the mat"],
    ["I really love this film", "This movie is great"],
]

# BLEU
bleu_result = bleu.compute(predictions=predictions, references=references)
print(f"BLEU: {bleu_result['bleu']:.4f}")

# ROUGE
rouge_result = rouge.compute(predictions=predictions, references=references)
print(f"ROUGE-1: {rouge_result['rouge1']:.4f}")
print(f"ROUGE-2: {rouge_result['rouge2']:.4f}")
print(f"ROUGE-L: {rouge_result['rougeL']:.4f}")

# METEOR
meteor_result = meteor.compute(predictions=predictions, references=references)
print(f"METEOR: {meteor_result['meteor']:.4f}")`,
          },
        ],
        table: {
          headers: ["工具", "支持指标", "主要优势", "安装方式"],
          rows: [
            ["sacrebleu", "BLEU, chrF, TER", "标准化、可复现、内置测试集", "pip install sacrebleu"],
            ["evaluate", "50+ 指标全覆盖", "统一 API、与 HF 生态集成", "pip install evaluate"],
            ["nltk", "BLEU, ROUGE, METEOR", "轻量、无需额外依赖", "pip install nltk"],
            ["bert-score", "BERTScore", "语义评估的专门实现", "pip install bert-score"],
          ],
        },
        mermaid: `graph LR
    A["评估需求"] --> B{"选择工具"}
    B --> C["sacrebleu"]
    B --> D["evaluate"]
    B --> E["bert-score"]
    C --> F["标准化 BLEU 分数"]
    D --> G["多指标统一评估"]
    E --> H["语义相似度评分"]
    F --> I["模型对比报告"]
    G --> I
    H --> I`,
        tip: "在论文中报告 BLEU 分数时，使用 sacrebleu 并注明签名（signature），这样其他研究者可以精确复现你的结果。",
        warning: "不同工具的实现细节不同（如 tokenization、smoothing 策略），直接比较不同工具输出的 BLEU 分数没有意义。论文复现时必须使用相同的工具。",
      },
    ],
};
