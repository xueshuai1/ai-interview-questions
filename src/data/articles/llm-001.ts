import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-001",
    title: "大语言模型训练全流程",
    category: "llm",
    tags: ["预训练", "SFT", "RLHF"],
    summary: "从数据采集到预训练、指令微调到人类反馈强化学习的完整管线",
    date: "2026-04-10",
    readTime: "25 min",
    level: "高级",
    content: [
      {
        title: "1. 训练流程全景图",
        body: "现代大语言模型的训练是一个多阶段的复杂工程。从数万亿 token 的原始文本采集，到大规模分布式预训练，再到指令微调和人类反馈强化学习，每个阶段都需要精心设计。整个流程可以概括为：数据准备 → 预训练（Pre-training）→ 有监督微调（SFT）→ 奖励模型训练（RM）→ 强化学习对齐（RLHF/DPO）。",
        mermaid: `graph LR
    A["原始文本数据"] --> B["数据清洗与过滤"]
    B --> C["分词 Tokenization"]
    C --> D["预训练 Pre-training"]
    D --> E["基座模型 Base Model"]
    E --> F["指令数据构造"]
    F --> G["有监督微调 SFT"]
    G --> H["指令模型 SFT Model"]
    H --> I["偏好数据标注"]
    I --> J["奖励模型 RM"]
    J --> K["RLHF / DPO 对齐"]
    K --> L["最终产品模型"]`,
      },
      {
        title: "2. 数据准备：训练质量的基石",
        body: "数据质量直接决定模型能力的上限。现代 LLM 训练数据包含多个来源：网页文本（Common Crawl）、书籍（Books3）、代码（GitHub）、学术论文（arXiv）、对话数据等。关键步骤包括：重复数据去重（MinHash/SimHash）、质量过滤（语言分类器、困惑度过滤）、PII 去除、以及精心构造的指令数据。",
        code: [
          {
            lang: "python",
            code: `# 数据清洗示例：使用 datatrove 处理 Common Crawl
from datatrove.pipeline.readers import WarcReader
from datatrove.pipeline.filters import (
    LanguageFilter,
    UnigramLogProbFilter,
    URLFilter,
)
from datatrove.pipeline.dedup import MinhashDedup

pipeline = [
    WarcReader("s3://commoncrawl/crawl-data/CC-2024-10/"),
    LanguageFilter(language="en", threshold=0.65),
    UnigramLogProbFilter(threshold=-12.0),
    URLFilter(),
    MinhashDedup(n_grams=5, num_buckets=1000),
]

for doc in pipeline:
    process(doc)`,
          },
        ],
        table: {
          headers: ["数据源", "占比", "说明"],
          rows: [
            ["网页文本", "~60%", "Common Crawl，需大规模清洗过滤"],
            ["代码", "~10%", "GitHub 开源代码，提升推理能力"],
            ["书籍", "~5%", "高质量长文本，增强理解深度"],
            ["学术", "~5%", "arXiv 论文，提升专业知识"],
            ["Wikipedia", "~3%", "百科全书，提供结构化知识"],
            ["指令数据", "~2%", "SFT 阶段使用，量小但关键"],
            ["其他", "~15%", "对话、论坛、社交媒体等"],
          ],
        },
      },
      {
        title: "3. 分词（Tokenization）",
        body: "分词是将文本转换为模型可处理的 token 序列的关键步骤。现代 LLM 主要使用 Byte-Pair Encoding (BPE) 或其变种。分词器的词汇表大小直接影响模型效率和表现：词汇表太小会导致序列过长，太大则增加 Embedding 层参数量。Llama 使用 32K-128K 词汇表，GPT-4 使用约 100K。",
        code: [
          {
            lang: "python",
            code: `# 使用 tiktoken（OpenAI 的分词库）
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
text = "Hello, world! 你好世界！"
tokens = enc.encode(text)
print(f"Token IDs: {tokens}")
print(f"Token count: {len(tokens)}")
print(f"Decoded: {enc.decode(tokens)}")

# 中文分词效率分析
texts = ["人工智能", "机器学习", "深度学习"]
for t in texts:
    tokens = enc.encode(t)
    print(f"'{t}' → {len(tokens)} tokens: {tokens}")`,
          },
        ],
      },
      {
        title: "4. 预训练（Pre-training）",
        body: "预训练是 LLM 训练中最耗资源的阶段。模型在海量无标注文本上学习语言模型目标：给定前面的 token，预测下一个 token。关键技术包括：混合精度训练（FP16/BF16）、ZeRO 分布式优化、激活值检查点（Activation Checkpointing）、以及 Flash Attention 加速。训练一个 70B 参数的模型需要数万 GPU 小时。",
        code: [
          {
            lang: "python",
            code: `# 预训练配置示例（基于 Llama 架构）
model_config = {
    "vocab_size": 32000,
    "hidden_size": 4096,
    "intermediate_size": 11008,
    "num_hidden_layers": 32,
    "num_attention_heads": 32,
    "num_key_value_heads": 32,
    "max_position_embeddings": 4096,
    "rms_norm_eps": 1e-5,
    "rope_theta": 10000,
    "hidden_act": "silu",
    "use_flash_attention": True,
}

# 训练超参数
training_config = {
    "learning_rate": 3e-4,
    "warmup_steps": 2000,
    "lr_scheduler": "cosine",
    "weight_decay": 0.1,
    "batch_size": 4096 * 4096,
    "max_grad_norm": 1.0,
    "precision": "bf16-mixed",
}`,
          },
        ],
        table: {
          headers: ["模型规模", "参数量", "预训练数据", "GPU 小时（约）"],
          rows: [
            ["Llama 7B", "7B", "1T tokens", "~100K"],
            ["Llama 13B", "13B", "1T tokens", "~200K"],
            ["Llama 70B", "70B", "2T tokens", "~1M"],
            ["GPT-4", "~1.8T", "~13T tokens", "未知"],
            ["Claude 3", "未知", "未知", "未知"],
          ],
        },
        tip: "Chinchilla 定律：最优训练是在给定计算预算下，让模型大小和训练 token 数按固定比例扩展。过小模型过多训练或过大模型过少训练都是低效的。",
      },
      {
        title: "5. 有监督微调（SFT）",
        body: "预训练模型虽然掌握了语言知识，但不能很好地遵循指令。SFT 阶段使用高质量的指令-响应对数据微调模型，使其学会遵循指令、进行对话、完成任务。",
        code: [
          {
            lang: "python",
            code: `# SFT 微调示例（使用 Hugging Face TRL）
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-8B",
    torch_dtype="auto",
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B")

dataset = load_dataset("HuggingFaceH4/ultrachat_200k", split="train_sft")

training_args = SFTConfig(
    output_dir="llama-3-8b-sft",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-5,
    lr_scheduler_type="cosine",
    warmup_ratio=0.05,
    fp16=True,
    logging_steps=10,
    max_seq_length=2048,
)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    args=training_args,
)
trainer.train()`,
          },
        ],
        list: [
          "指令数据质量远比数量重要：10K 高质量样本 > 100K 低质量样本",
          "覆盖多任务：问答、摘要、翻译、代码、数学推理、创意写作",
          "包含拒绝训练：教模型识别并拒绝有害请求",
          "格式统一：使用标准化的对话模板（如 ChatML、Alpaca 格式）",
          "避免灾难性遗忘：学习率通常比预训练低 1-2 个数量级",
        ],
      },
      {
        title: "6. RLHF：让人类偏好对齐模型",
        body: "RLHF（Reinforcement Learning from Human Feedback）是让 LLM 输出与人类价值观对齐的关键技术。流程：收集人类偏好标注 → 训练奖励模型 → 使用 PPO 微调模型。",
        mermaid: `graph LR
    A["SFT 模型"] --> B["生成多个回答"]
    B --> C["人类标注偏好"]
    C --> D["训练奖励模型 RM"]
    D --> E["PPO 强化学习"]
    A --> E
    E --> F["对齐后的模型"]`,
        code: [
          {
            lang: "python",
            code: `# DPO（Direct Preference Optimization）示例
from trl import DPOTrainer, DPOConfig
from datasets import load_dataset

dataset = load_dataset("Anthropic/hh-rlhf", split="train")

dpo_config = DPOConfig(
    output_dir="llama-3-8b-dpo",
    learning_rate=5e-7,
    beta=0.1,
    max_length=1024,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
)

trainer = DPOTrainer(
    model=model,
    ref_model=ref_model,
    args=dpo_config,
    train_dataset=dataset,
    tokenizer=tokenizer,
)
trainer.train()`,
          },
        ],
        table: {
          headers: ["对齐方法", "优点", "缺点", "代表工作"],
          rows: [
            ["RLHF (PPO)", "对齐效果好，灵活", "复杂，训练不稳定", "InstructGPT, Claude"],
            ["DPO", "简单稳定，无需 RM", "效果略逊于 RLHF", "Zephyr, Mistral"],
            ["ORPO", "单阶段训练，高效", "较新方法，验证不足", "ORPO"],
            ["RLAIF", "用 AI 替代人类标注", "AI 标注质量依赖基座", "Constitutional AI"],
          ],
        },
      },
      {
        title: "7. 评估与部署",
        body: "训练完成后，模型需要全面评估（MMLU、GSM8K、HumanEval）和推理优化（KV Cache、vLLM 并行、量化加速）。",
        code: [
          {
            lang: "bash",
            code: `# 使用 vLLM 高性能推理服务
pip install vllm

# 启动 API 服务（Tensor 并行 4 GPU）
vllm serve meta-llama/Llama-3-8B \\
    --tensor-parallel-size 4 \\
    --max-model-len 8192 \\
    --gpu-memory-utilization 0.9`,
          },
        ],
        table: {
          headers: ["优化技术", "速度提升", "内存节省", "质量损失"],
          rows: [
            ["KV Cache", "2-5x", "-", "无"],
            ["vLLM PagedAttention", "10-24x", "显著", "无"],
            ["INT8 量化", "1.5-2x", "~50%", "微小"],
            ["INT4 量化", "2-3x", "~75%", "轻微"],
            ["Speculative Decoding", "2-3x", "-", "无"],
          ],
        },
      },
    ],
  };
