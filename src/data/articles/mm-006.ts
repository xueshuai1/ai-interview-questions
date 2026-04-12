import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-006",
    title: "视频-语言多模态",
    category: "multimodal",
    tags: ["视频理解", "视频语言", "多模态"],
    summary: "从视频分类到视频问答，理解视频与语言的跨模态技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
      {
        title: "1. 视频表示学习：3D CNN 与 TimeSformer",
        body: `视频表示学习是视频-语言多模态的基石。与单帧图像不同，视频同时包含空间信息和时间动态，模型必须捕获帧间的运动模式才能理解视频语义。

**3D CNN 方案：** C3D 和 I3D（Inflated 3D ConvNet）将 2D 卷积核在时间维度上扩展，通过 3D 卷积同时学习空间特征和时序特征。I3D 的创新在于将 ImageNet 预训练的 2D 权重膨胀为 3D 权重，大幅缓解了视频数据稀缺问题。其核心公式为 Y(t,h,w) = sum K(dt,dh,dw) * X(t+dt, h+dh, w+dw)，其中 K 为 3D 卷积核。

**TimeSformer 方案：** 纯 Transformer 架构，将 3D 卷积分解为空间注意力和时间注意力的交替计算（Divided Space-Time Attention）。具体而言，先对同一帧内所有 patch 做空间注意力，再对同一 patch 位置在不同帧间做时间注意力。这种分解将复杂度从 O(N^2*T^2) 降至 O(T*N^2 + N*T^2)，其中 N 为每帧 patch 数，T 为帧数，使得处理长视频成为可能。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class TimeSformerBlock(nn.Module):
    # Divided Space-Time Attention Block
    def __init__(self, dim: int, num_heads: int, num_frames: int, num_patches: int):
        super().__init__()
        self.temporal_attn = nn.MultiheadAttention(dim, num_heads, batch_first=True)
        self.spatial_attn = nn.MultiheadAttention(dim, num_heads, batch_first=True)
        self.mlp = nn.Sequential(
            nn.Linear(dim, dim * 4),
            nn.GELU(),
            nn.Linear(dim * 4, dim)
        )
        self.num_frames = num_frames
        self.norm = nn.LayerNorm(dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (B, T*N, D)
        B, TN, D = x.shape
        T, N = self.num_frames, TN // self.num_frames

        # Temporal attention: group by spatial position
        x_temp = x.view(B, N, T, D).transpose(1, 2).reshape(B * N, T, D)
        x_temp = x_temp + self.temporal_attn(self.norm(x_temp), x_temp, x_temp)[0]
        x = x_temp.reshape(B, N, T, D).transpose(1, 2).reshape(B, TN, D)

        # Spatial attention: group by temporal position
        x_spatial = x.view(B * T, N, D)
        x_spatial = x_spatial + self.spatial_attn(self.norm(x_spatial), x_spatial, x_spatial)[0]
        x = x_spatial.view(B, TN, D)

        # MLP
        x = x + self.mlp(self.norm(x))
        return x`
          },
          {
            lang: "python",
            code: `import torch.nn as nn

def i3d_inflate_2d_weight(weight_2d: torch.Tensor) -> torch.Tensor:
    # 将 2D 卷积权重膨胀为 3D 权重（I3D 策略）
    # weight_2d: (out_ch, in_ch, kH, kW)
    # 返回: (out_ch, in_ch, kT, kH, kW), 其中 kT 为时间核大小
    out_ch, in_ch, kH, kW = weight_2d.shape
    kT = 3  # 时间核大小

    # 在时间维度复制并归一化
    weight_3d = weight_2d.unsqueeze(2).expand(-1, -1, kT, -1, -1).clone()
    weight_3d = weight_3d / kT  # 保持输出量级一致
    return weight_3d

# 验证膨胀后卷积行为
conv_2d = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3)
weight_3d = i3d_inflate_2d_weight(conv_2d.weight.data)
print(f"Inflated shape: {weight_3d.shape}")  # (64, 3, 3, 7, 7)`
          }
        ],
        table: {
          headers: ["方法", "核心操作", "复杂度", "优势"],
          rows: [
            ["C3D", "纯 3D 卷积", "O(T*H*W*C)", "简单直接，时序建模自然"],
            ["I3D", "2D 到 3D 权重膨胀", "O(T*H*W*C)", "利用 ImageNet 预训练"],
            ["TimeSformer", "分治时空注意力", "O(T*N^2 + N*T^2)", "全局感受野，长视频友好"],
            ["VideoMAE", "掩码自编码预训练", "O(T*N^2)", "自监督，无需标注数据"]
          ]
        },
        mermaid: `graph LR
    A["Input Video"] --> B["Patch Embedding"]
    B --> C["CLS Token"]
    C --> D["Temporal Attention"]
    D --> E["Spatial Attention"]
    E --> F["MLP"]
    F --> G["Video Features"]
    style G fill:#4CAF50,color:#fff`,
        tip: "对于超过 64 帧的长视频，推荐使用 TimeSformer 的线性注意力变体，或使用分段池化策略降低显存占用",
        warning: "I3D 膨胀时若时间核过大（大于 7），会导致运动信息过度平滑，建议 kT=3 或 5"
      },
      {
        title: "2. 视频-文本预训练：VideoCLIP 与 CLIP4Clip",
        body: `视频-文本预训练的目标是学习一个共享的跨模态表示空间，使语义相近的视频和文本在嵌入空间中彼此靠近。这一思路直接继承自 CLIP 在图文领域的成功，但视频模态带来了额外的挑战。

**VideoCLIP 策略：** 采用对比学习（Contrastive Learning），通过 InfoNCE 损失拉近匹配的视频-文本对，推远不匹配对。关键设计包括：（1）负样本挖掘策略，使用难负样本（Hard Negative Mining）提升判别力；（2）跨模态注意力，在文本 token 和视频帧间建立细粒度对应关系；（3）多粒度对比，同时在视频-句子级别和片段-短语级别做对比，兼顾全局和局部语义对齐。

**CLIP4Clip 策略：** 直接使用预训练的 CLIP 图像编码器处理视频帧，然后通过时序聚合（平均池化或 Transformer 编码器）将帧级特征聚合为视频级特征。文本端直接复用 CLIP 的文本编码器。这种方法的优势在于零样本迁移能力强，因为 CLIP 已在 4 亿图文对上训练，包含了丰富的语义先验。损失函数为 L = -log(exp(sim(v,t)/tau) / sum_j exp(sim(v,t_j)/tau))，其中 tau 为温度参数。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoCLIP(nn.Module):
    # Video-Text Contrastive Learning Model
    def __init__(self, video_dim: int = 512, text_dim: int = 512, temperature: float = 0.07):
        super().__init__()
        self.video_encoder = TimeSformerEncoder()  # 视频编码器
        self.text_encoder = TextTransformer()       # 文本编码器
        self.video_proj = nn.Linear(video_dim, 256)
        self.text_proj = nn.Linear(text_dim, 256)
        self.logit_scale = nn.Parameter(torch.tensor(1.0 / temperature))

    def forward(self, videos: torch.Tensor, texts: torch.Tensor, labels: torch.Tensor):
        # videos: (B, T, C, H, W), texts: (B, seq_len)
        v_feat = self.video_proj(self.video_encoder(videos))  # (B, D)
        t_feat = self.text_proj(self.text_encoder(texts))      # (B, D)

        v_feat = F.normalize(v_feat, dim=-1)
        t_feat = F.normalize(t_feat, dim=-1)

        # 计算相似度矩阵
        logits = v_feat @ t_feat.T * self.logit_scale.exp()  # (B, B)

        # 双向对比损失
        loss_v = F.cross_entropy(logits, labels)
        loss_t = F.cross_entropy(logits.T, labels)
        return (loss_v + loss_t) / 2`
          },
          {
            lang: "python",
            code: `import torch

class CLIP4ClipVideoEncoder(nn.Module):
    # 使用 CLIP 图像编码器 + 时序聚合
    def __init__(self, clip_model_name: str = "ViT-B/32", agg_method: str = "transformer"):
        super().__init__()
        import clip
        self.clip_model, _ = clip.load(clip_model_name)
        for param in self.clip_model.parameters():
            param.requires_grad = False  # 冻结 CLIP 权重

        if agg_method == "transformer":
            self.temporal_encoder = nn.TransformerEncoder(
                nn.TransformerEncoderLayer(d_model=512, nhead=8, batch_first=True),
                num_layers=2
            )
        else:
            self.temporal_encoder = nn.AdaptiveAvgPool1d(1)

    def forward(self, video: torch.Tensor) -> torch.Tensor:
        # video: (B, T, C, H, W) -> 视频特征 (B, 512)
        B, T, C, H, W = video.shape
        frames = video.view(B * T, C, H, W)
        frame_feats = self.clip_model.encode_image(frames)  # (B*T, 512)
        frame_feats = frame_feats.view(B, T, 512)

        if isinstance(self.temporal_encoder, nn.TransformerEncoder):
            video_feat = self.temporal_encoder(frame_feats)[:, 0, :]
        else:
            video_feat = self.temporal_encoder(frame_feats.transpose(1, 2)).squeeze(-1)
        return video_feat`
          }
        ],
        table: {
          headers: ["模型", "视觉编码器", "文本编码器", "训练数据", "主要损失"],
          rows: [
            ["VideoCLIP", "3D ResNet", "BERT", "HowTo100M", "InfoNCE 对比"],
            ["CLIP4Clip", "CLIP ViT", "CLIP Text", "YT-Temporal-180M", "双向对比"],
            ["ViCLIP", "VideoMAE", "Chinese BERT", "中文视频语料", "对比+对齐"],
            ["X-CLIP", "ViT+跨帧注意力", "BERT", "WebVid-2.5M", "跨帧对比"]
          ]
        },
        mermaid: `graph TD
    A["Video Frames"] --> B["CLIP Image Encoder"]
    C["Text Tokens"] --> D["CLIP Text Encoder"]
    B --> E["Frame Features (B,T,D)"]
    D --> F["Text Feature (B,D)"]
    E --> G["Temporal Aggregation"]
    G --> H["Video Feature (B,D)"]
    H --> I["Contrastive Loss"]
    F --> I
    style I fill:#FF5722,color:#fff`,
        tip: "使用 CLIP4Clip 时，建议在冻结 CLIP 权重的同时微调时序聚合层，在性能和显存间取得平衡",
        warning: "对比学习对 batch size 极度敏感，batch 过小会导致负样本不足，建议使用至少 256 的 batch size 或配合 Memory Bank"
      },
      {
        title: "3. 视频问答（VideoQA）",
        body: `视频问答要求模型理解视频内容并回答自然语言问题，是检验视频-语言理解能力的综合基准。根据推理深度可分为三类：感知类（视频中有多少辆车）、时序推理类（男孩跳起来之前做了什么）和知识推理类（为什么这个人需要使用雨伞）。

**主流架构，融合-预测范式：** 首先通过视觉编码器提取视频特征 V 属于 R^(T*Dv)，通过语言编码器提取问题特征 Q 属于 R^(L*Dq)，然后通过跨模态融合模块（Cross-Modal Fusion）将两者结合。融合方式包括：（1）拼接后 MLP（简单但粗糙）；（2）多头交叉注意力（Multi-Head Cross Attention），让问题 token 查询视频帧；（3）联合 Transformer，将视频帧和问题 token 拼接后送入统一 Transformer，实现全量双向交互。

**CoMem（协同记忆网络）：** 引入外部记忆模块，存储视频中的关键事件，回答时通过多跳推理（Multi-hop Reasoning）从记忆中检索相关信息。这种设计特别适合需要多步推理的复杂问题。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class VideoQA(nn.Module):
    # Cross-Modal Attention based VideoQA
    def __init__(self, video_dim: int = 512, text_dim: int = 512, num_classes: int = 1000):
        super().__init__()
        self.cross_attn = nn.MultiheadAttention(
            embed_dim=512, num_heads=8, batch_first=True, kdim=512, vdim=512
        )
        self.classifier = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
        self.video_proj = nn.Linear(video_dim, 512)
        self.text_proj = nn.Linear(text_dim, 512)

    def forward(self, video_feats: torch.Tensor, question_feats: torch.Tensor) -> torch.Tensor:
        # video_feats: (B, T, Dv), question_feats: (B, L, Dq)
        v = self.video_proj(video_feats)   # (B, T, 512)
        q = self.text_proj(question_feats)  # (B, L, 512)

        # 问题查询视频帧
        attn_out, _ = self.cross_attn(q, v, v)  # (B, L, 512)

        # 池化 + 分类
        pooled = attn_out.mean(dim=1)  # (B, 512)
        logits = self.classifier(pooled)
        return logits  # (B, num_classes)`
          },
          {
            lang: "python",
            code: `import torch

class CoMemoryNetwork(nn.Module):
    # 协同记忆网络 - 多跳 VideoQA
    def __init__(self, dim: int = 256, hops: int = 3):
        super().__init__()
        self.hops = hops
        self.memory_rnn = nn.LSTM(dim, dim, batch_first=True)
        self.attn = nn.Linear(dim, 1)
        self.read_rnn = nn.LSTMCell(dim, dim)
        self.W = nn.Linear(dim * 2, dim)

    def forward(self, video: torch.Tensor, question: torch.Tensor) -> torch.Tensor:
        # video: (B, T, D), question: (B, D)
        B, T, D = video.shape
        h = question  # 初始记忆状态为问题向量

        for hop in range(self.hops):
            # 注意力加权读取视频
            scores = self.attn(video + h.unsqueeze(1)).squeeze(-1)  # (B, T)
            weights = torch.softmax(scores, dim=1).unsqueeze(-1)    # (B, T, 1)
            read = (video * weights).sum(dim=1)  # (B, D)

            # 更新记忆
            h, _ = self.read_rnn(read, (h, h))

        return self.W(torch.cat([h, question], dim=-1))  # (B, D)`
          }
        ],
        table: {
          headers: ["数据集", "问题数", "视频来源", "推理类型", "典型准确率"],
          rows: [
            ["MSRVTT-QA", "243K", "MSR-VTT", "感知+时序", "45-55%"],
            ["ActivityNet-QA", "100K", "ActivityNet", "时序+因果", "35-42%"],
            ["TGIF-QA", "166K", "GIF 动图", "动作+时序", "70-80%"],
            ["NExT-QA", "54K", "影视片段", "因果+描述性", "55-65%"]
          ]
        },
        mermaid: `graph LR
    A["Video"] --> B["Frame Encoder"]
    C["Question"] --> D["Text Encoder"]
    B --> E["Video Features"]
    D --> F["Question Features"]
    E --> G["Cross Attention"]
    F --> G
    G --> H["Fused Representation"]
    H --> I["Classifier"]
    I --> J["Answer"]`,
        tip: "对于开放域 VideoQA，建议在分类器前加入一个语言模型解码头，而非简单的多分类，以支持生成式答案",
        warning: "视频 QA 数据集存在严重的答案偏差（Answer Bias），约 30% 的问题仅凭答案先验就能答对，评估时需使用偏差鲁棒的指标"
      },
      {
        title: "4. 视频描述生成（Video Captioning）",
        body: `视频描述生成要求模型自动生成描述视频内容的自然语言句子。这是一个序列到序列（Seq2Seq）的生成任务，与图像描述（Image Captioning）相比，视频描述需要额外处理时间维度上的事件演化和动作关联。

**Encoder-Decoder 架构：** 编码器使用 3D CNN 或 Video Transformer 提取视频特征序列 F = {f_1, ..., f_T}，解码器通常使用 Transformer Decoder，以自回归方式逐词生成描述。关键的创新在于注意力机制的设计：（1）时序注意力，解码器在每个时间步关注不同的视频帧，对应视频中正在发生的动作；（2）层次化注意力，先在帧级别做粗粒度注意力，再在区域级别做细粒度注意力，捕获空间-时序联合语义。

**强化学习优化：** 传统的交叉熵损失（Teacher Forcing）存在 Exposure Bias 和评估指标不一致问题。使用 SCST（Self-Critical Sequence Training）直接优化 CIDEr/SPICE 等评估指标，通过在推理时采样多个候选描述，用 baseline 归一化奖励来更新模型。奖励函数定义为 R = CIDEr(y_pred) - CIDEr(y_greedy)，其中 y_greedy 作为 baseline 减小方差。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class VideoCaptioner(nn.Module):
    # Transformer-based Video Captioning Model
    def __init__(self, video_dim: int = 512, vocab_size: int = 10000, d_model: int = 512,
                 max_len: int = 30):
        super().__init__()
        self.video_proj = nn.Linear(video_dim, d_model)
        self.word_embed = nn.Embedding(vocab_size, d_model)
        self.pos_embed = nn.Parameter(torch.randn(max_len, d_model))

        decoder_layer = nn.TransformerDecoderLayer(
            d_model=d_model, nhead=8, dim_feedforward=2048, batch_first=True
        )
        self.decoder = nn.TransformerDecoder(decoder_layer, num_layers=4)
        self.output_proj = nn.Linear(d_model, vocab_size)
        self.max_len = max_len

    def forward(self, video: torch.Tensor, captions: torch.Tensor, mask: torch.Tensor):
        # video: (B, T, D), captions: (B, L), mask: (B, L)
        v_feat = self.video_proj(video)  # (B, T, D)
        t_embed = self.word_embed(captions) + self.pos_embed[:captions.size(1)]

        # 因果注意力掩码
        tgt_mask = nn.Transformer.generate_square_subsequent_mask(captions.size(1)).to(v_feat.device)

        out = self.decoder(t_embed, v_feat, tgt_mask=tgt_mask, memory_key_padding_mask=mask)
        logits = self.output_proj(out)  # (B, L, vocab_size)
        return logits`
          },
          {
            lang: "python",
            code: `import torch
from torch.distributions import Categorical

def scst_reward(model: nn.Module, video: torch.Tensor, captions: torch.Tensor,
                cider_scorer, sample_n: int = 5) -> torch.Tensor:
    # Self-Critical Sequence Training 奖励计算
    B = video.size(0)
    device = video.device

    # Greedy 解码（作为 baseline）
    model.eval()
    with torch.no_grad():
        greedy_seqs = model.greedy_decode(video, max_len=20)
    baseline_rewards = cider_scorer.compute_score(greedy_seqs)[0]  # (B,)

    # 采样解码
    model.train()
    sampled_seqs, log_probs = model.sample_decode(video, sample_n=sample_n)

    # 计算采样奖励
    sampled_rewards = cider_scorer.compute_score(sampled_seqs)[0]  # (B * sample_n,)
    sampled_rewards = sampled_rewards.view(B, sample_n)

    # 归一化奖励
    advantages = sampled_rewards - baseline_rewards.unsqueeze(1).expand(-1, sample_n)

    # 损失 = -E[reward * log_prob]
    log_probs = log_probs.view(B, sample_n, -1)
    loss = -(advantages.unsqueeze(-1) * log_probs).mean()
    return loss`
          }
        ],
        table: {
          headers: ["评估指标", "衡量维度", "范围", "特点"],
          rows: [
            ["BLEU-4", "n-gram 精确匹配", "[0, 1]", "偏向短描述，忽略语义多样性"],
            ["METEOR", "带同义词的精确/召回", "[0, 1]", "考虑词形变化，更接近人工评判"],
            ["CIDEr", "TF-IDF 加权 n-gram", "[0, 无穷)", "对罕见词敏感，最常用指标"],
            ["SPICE", "场景图匹配", "[0, 1]", "评估语义结构和对象关系"]
          ]
        },
        mermaid: `graph TD
    A["Video Frames"] --> B["3D CNN / Video Transformer"]
    B --> C["Video Features F"]
    D["<START>"] --> E["Transformer Decoder"]
    C --> E
    E --> F["Word Distribution"]
    F --> G["Sampled Word"]
    G --> E
    E --> H["<END>"]
    H --> I["Complete Caption"]
    I --> J["CIDEr Score"]`,
        tip: "使用 SCST 训练时，建议先做 30 个 epoch 的交叉熵预训练再切换强化学习，否则模型难以收敛",
        warning: "视频描述生成的自动评估指标与人工评判的相关性有限（BLEU 相关系数仅约 0.3），重要场景需要人工评估"
      },
      {
        title: "5. 时序定位（Moment Retrieval）",
        body: `时序定位（Moment Retrieval / Temporal Grounding）的任务是：给定一段视频和一条自然语言查询，在视频中找到与查询语义匹配的时间片段 [t_start, t_end]。这是视频理解中极具挑战性的任务，因为模型需要在连续的时间轴上精确定位，而非简单的分类或全局描述。

**提案-评分范式（Proposal-and-Score）：** 首先生成大量候选时间片段（Proposals），然后通过跨模态匹配模型对每个候选片段打分。生成候选片段的方法包括：（1）滑动窗口，简单但候选数量随视频长度指数增长；（2）边界匹配网络（Boundary Matching Network），预测每个时刻作为起始/结束位置的概率，然后组合生成候选；（3）密集回归，直接为每个时刻预测从该时刻开始的片段持续时间。

**2D-TAN（Two-Dimensional Temporal Attention Network）：** 将视频特征和文本特征的交互构建为一个 2D 时间响应图（Temporal Response Map），其中横轴为视频起始时刻，纵轴为结束时刻，每个位置的激活值表示该时间片段与查询的匹配程度。通过 2D 卷积在响应图上学习时空模式，最终通过池化得到定位结果。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class MomentRetrieval(nn.Module):
    # 基于密集回归的时序定位模型
    def __init__(self, video_dim: int = 512, text_dim: int = 512, hidden_dim: int = 256):
        super().__init__()
        # 跨模态融合
        self.cross_attn = nn.MultiheadAttention(
            embed_dim=video_dim, num_heads=8, batch_first=True,
            kdim=text_dim, vdim=text_dim
        )
        # 时序卷积预测起始和持续时间
        self.temporal_conv = nn.Sequential(
            nn.Conv1d(video_dim, hidden_dim, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv1d(hidden_dim, hidden_dim, kernel_size=3, padding=1),
            nn.ReLU()
        )
        self.start_head = nn.Conv1d(hidden_dim, 1, kernel_size=1)
        self.duration_head = nn.Conv1d(hidden_dim, 1, kernel_size=1)

    def forward(self, video: torch.Tensor, query: torch.Tensor) -> tuple:
        # video: (B, T, Dv), query: (B, L, Dt)
        # 跨模态注意力
        fused, _ = self.cross_attn(video, query, query)  # (B, T, Dv)
        fused = fused.transpose(1, 2)  # (B, Dv, T)

        # 时序建模
        features = self.temporal_conv(fused)  # (B, hidden, T)

        # 预测起始位置和时间跨度
        start_logits = self.start_head(features).squeeze(1)    # (B, T)
        duration_logits = self.duration_head(features).squeeze(1)  # (B, T)

        return start_logits, duration_logits`
          },
          {
            lang: "python",
            code: `import torch
import torch.nn.functional as F

def moment_retrieval_loss(start_logits: torch.Tensor, duration_logits: torch.Tensor,
                          gt_start: torch.Tensor, gt_end: torch.Tensor,
                          lambda_iou: float = 1.0, lambda_cls: float = 1.0) -> torch.Tensor:
    # 时序定位损失：IoU 损失 + 分类损失
    # gt_start, gt_end: (B,) 真实起止时刻（归一化到 [0, T-1]）
    B, T = start_logits.shape
    device = start_logits.device

    # 生成真实高斯标签
    start_labels = torch.zeros(B, T, device=device)
    end_labels = torch.zeros(B, T, device=device)

    for b in range(B):
        s, e = int(gt_start[b]), int(gt_end[b])
        sigma = max((e - s) / 6.0, 1.0)
        start_labels[b] = torch.exp(-0.5 * (torch.arange(T, device=device) - s) ** 2 / sigma ** 2)
        end_labels[b] = torch.exp(-0.5 * (torch.arange(T, device=device) - e) ** 2 / sigma ** 2)

    # BCE 分类损失
    start_cls_loss = F.binary_cross_entropy_with_logits(start_logits, start_labels)
    end_cls_loss = F.binary_cross_entropy_with_logits(duration_logits, end_labels)

    # IoU 损失
    pred_start = start_logits.argmax(dim=1)
    pred_end = duration_logits.argmax(dim=1)
    pred_start_f = pred_start.float()
    pred_end_f = pred_end.float()

    inter = torch.clamp(torch.min(pred_end_f, gt_end) - torch.max(pred_start_f, gt_start), min=0)
    union = torch.max(pred_end_f, gt_end) - torch.min(pred_start_f, gt_start)
    iou = inter / torch.clamp(union, min=1e-6)
    iou_loss = 1 - iou.mean()

    return lambda_cls * (start_cls_loss + end_cls_loss) + lambda_iou * iou_loss`
          }
        ],
        table: {
          headers: ["方法", "候选生成", "匹配方式", "Charades-STA IoU@0.5"],
          rows: [
            ["CAL", "滑动窗口", "跨模态注意力", "28.5%"],
            ["2D-TAN", "密集 2D 响应图", "2D 卷积匹配", "48.9%"],
            ["VSLNet", "边界网络", "边界感知注意力", "51.3%"],
            ["TRMG", "密集回归", "时序关系建模", "55.8%"]
          ]
        },
        mermaid: `graph LR
    A["Video"] --> B["Feature Extractor"]
    C["Query Text"] --> D["Text Encoder"]
    B --> E["Video Features (T,D)"]
    D --> F["Query Features (L,D)"]
    E --> G["Cross-Modal Fusion"]
    F --> G
    G --> H["Temporal Conv"]
    H --> I["Start Prediction"]
    H --> J["Duration Prediction"]
    I --> K["Moment [start, end]"]
    J --> K`,
        tip: "处理长视频时，建议先使用场景边界检测（Scene Boundary Detection）将视频分段，再在各段内做时序定位，可显著降低计算量",
        warning: "时序定位的评估对 IoU 阈值非常敏感，报告结果时必须注明阈值（如 IoU@0.3 vs IoU@0.7 差距可达 30% 以上）"
      },
      {
        title: "6. 多模态大模型中的视频模态",
        body: `多模态大语言模型（MLLM）正在将视频理解推向新的高度。GPT-4V、Qwen-VL、LLaVA-Video 等模型将视频帧序列作为额外输入，通过简单的视觉-语言对齐即可实现零样本视频理解，无需针对特定任务微调。

**核心架构模式，Vision-Language Connector：** 视频编码器（通常是预训练的 ViT 或 CLIP）逐帧提取视觉特征，然后通过一个轻量级的连接器（Connector）将视觉特征投影到语言模型的嵌入空间。连接器的设计有三种主流方案：（1）线性投影（Linear Projection），最简单的 MLP 映射，参数量少但表达能力有限；（2）Q-Former（如 InstructBLIP），通过可学习的查询向量从视觉特征中提取信息，参数量中等；（3）Perceiver Resampler，使用交叉注意力将可变长度的视觉特征压缩为固定数量的 token。

**训练策略，两阶段对齐：** 第一阶段做视觉-语言特征对齐（Feature Alignment），使用图文对比学习或图像描述数据训练连接器；第二阶段做指令微调（Instruction Tuning），使用高质量的视觉-语言指令数据（如视频问答、视频描述等）训练模型遵循指令的能力。关键挑战在于视频帧数与语言模型上下文窗口的矛盾：60 帧视频乘以每帧 256 个视觉 token 等于 15360 个 token，已接近多数模型的上下文上限。解决方案包括帧采样（Frame Sampling）、视觉 token 压缩（Token Merging）和时序池化（Temporal Pooling）。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class PerceiverResampler(nn.Module):
    # 将可变长度视觉特征压缩为固定数量 token
    def __init__(self, input_dim: int = 1024, output_dim: int = 4096,
                 num_queries: int = 64, num_layers: int = 2):
        super().__init__()
        self.queries = nn.Parameter(torch.randn(num_queries, input_dim))
        self.input_proj = nn.Linear(input_dim, input_dim)
        self.layers = nn.ModuleList([
            nn.TransformerDecoderLayer(
                d_model=input_dim, nhead=8, dim_feedforward=input_dim * 4, batch_first=True
            ) for _ in range(num_layers)
        ])
        self.output_proj = nn.Linear(input_dim, output_dim)

    def forward(self, visual_features: torch.Tensor) -> torch.Tensor:
        # visual_features: (B, N, D) -> compressed: (B, num_queries, output_dim)
        B = visual_features.size(0)
        queries = self.queries.unsqueeze(0).expand(B, -1, -1)  # (B, num_queries, D)
        visual = self.input_proj(visual_features)

        for layer in self.layers:
            queries = layer(queries, visual)

        return self.output_proj(queries)`
          },
          {
            lang: "python",
            code: `import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

class LLaVAVideoPipeline:
    # 简化的视频-语言大模型推理管线
    def __init__(self, llm_name: str, vision_model_name: str):
        self.tokenizer = AutoTokenizer.from_pretrained(llm_name)
        self.llm = AutoModelForCausalLM.from_pretrained(llm_name, torch_dtype=torch.float16)
        self.vision_encoder = self._load_vision_model(vision_model_name)
        self.connector = nn.Linear(1024, self.llm.config.hidden_size)

    def _load_vision_model(self, name: str):
        from transformers import CLIPVisionModel
        return CLIPVisionModel.from_pretrained(name)

    def __call__(self, video: torch.Tensor, question: str) -> str:
        # video: (T, C, H, W)
        # 1. 帧采样
        frame_indices = torch.linspace(0, video.size(0) - 1, steps=16).long()
        frames = video[frame_indices]  # (16, C, H, W)

        # 2. 视觉编码
        with torch.no_grad():
            visual_out = self.vision_encoder(frames)
            visual_features = visual_out.last_hidden_state  # (16, N, D)
            visual_tokens = self.connector(visual_features.view(-1, visual_features.size(-1)))

        # 3. 构造输入
        prompt = "<video_tokens>" + question + "</video_tokens> Answer:"
        input_ids = self.tokenizer(prompt, return_tensors="pt").input_ids

        # 4. 生成答案
        output = self.llm.generate(
            input_ids=input_ids,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.7
        )
        return self.tokenizer.decode(output[0], skip_special_tokens=True)`
          }
        ],
        table: {
          headers: ["模型", "视觉编码器", "连接器", "视频处理策略", "上下文窗口"],
          rows: [
            ["LLaVA-Video", "CLIP ViT-L", "Linear MLP", "均匀采样 32 帧", "4K tokens"],
            ["Qwen2-VL", "ViT (NaViT)", "MLP", "动态帧数 + Token 压缩", "32K tokens"],
            ["Video-LLaMA", "EVA-CLIP", "Q-Former", "时序池化 + 空间池化", "4K tokens"],
            ["VideoChat2", "BLIP-2", "Perceiver", "关键帧提取", "8K tokens"]
          ]
        },
        mermaid: `graph TD
    A["Video (T frames)"] --> B["Frame Sampling"]
    B --> C["CLIP Vision Encoder"]
    C --> D["Frame Features"]
    D --> E["Connector"]
    E --> F["Visual Tokens"]
    G["Text Prompt"] --> H["Tokenizer"]
    H --> I["Text Tokens"]
    F --> J["Concat"]
    I --> J
    J --> K["LLM"]
    K --> L["Generated Response"]`,
        tip: "使用多模态大模型处理视频时，优先选择支持动态分辨率的视觉编码器（如 NaViT），避免将视频帧 resize 为固定正方形导致信息损失",
        warning: "视觉 token 数量随帧数线性增长，32 帧以上时建议启用 Token Merging 或 KV Cache 压缩，否则推理延迟会指数级上升"
      },
      {
        title: "7. 实战：VideoCLIP 推理与应用",
        body: `本节通过一个完整的 VideoCLIP 推理流程，展示如何将视频-语言跨模态模型应用于实际的视频检索和语义搜索场景。我们将实现一个基于 VideoCLIP 的视频搜索引擎，支持自然语言查询视频片段。

**系统架构：** 离线阶段，使用预训练的 VideoCLIP 模型将视频库中的每个视频编码为固定维度的嵌入向量，构建向量索引（使用 FAISS 进行近似最近邻搜索）。在线阶段，将用户的自然语言查询编码为相同空间的文本向量，通过向量检索找到最相关的视频。整个过程完全零样本，不需要针对特定检索任务微调。

**关键工程优化：** （1）批量编码，将视频帧分批送入 GPU，充分利用并行计算能力；（2）量化索引，对视频嵌入使用 IVFPQ 量化，将 512 维浮点向量压缩为 64 字节，内存占用降低 32 倍；（3）多级检索，先用粗粒度特征做快速过滤，再用细粒度特征精确排序。`,
        code: [
          {
            lang: "python",
            code: `import torch
import numpy as np
import faiss

class VideoSearchEngine:
    # 基于 VideoCLIP 的视频搜索引擎
    def __init__(self, model: VideoCLIP, dim: int = 256, nlist: int = 100):
        self.model = model
        self.model.eval()
        self.dim = dim
        self.video_ids = []

        # FAISS IVFPQ 索引
        quantizer = faiss.IndexFlatIP(dim)
        self.index = faiss.IndexIVFPQ(quantizer, dim, nlist, 8, 8)
        self.index.nprobe = 10  # 搜索时检查 10 个最近簇

    def add_videos(self, videos: torch.Tensor, ids: list[str]):
        # 离线编码视频并建立索引
        with torch.no_grad():
            features = self.model.video_encoder(videos)
            features = self.model.video_proj(features)
            features = features / features.norm(dim=-1, keepdim=True)
            features_np = features.numpy().astype(np.float32)

        if not self.index.is_trained:
            self.index.train(features_np)
        self.index.add(features_np)
        self.video_ids.extend(ids)
        print(f"Indexed {len(ids)} videos, total: {self.index.ntotal}")

    def search(self, query: str, top_k: int = 5) -> list[tuple[str, float]]:
        # 在线搜索
        with torch.no_grad():
            text_tokens = self.model.text_encoder.tokenize(query)
            text_feat = self.model.text_encoder(text_tokens)
            text_feat = self.model.text_proj(text_feat)
            text_feat = text_feat / text_feat.norm(dim=-1, keepdim=True)
            query_np = text_feat.numpy().astype(np.float32)

        distances, indices = self.index.search(query_np, top_k)
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx >= 0:
                results.append((self.video_ids[idx], float(dist)))
        return results`
          },
          {
            lang: "python",
            code: `import torch
from PIL import Image
import decord

def load_video(video_path: str, num_frames: int = 8, target_size: int = 224) -> torch.Tensor:
    # 加载并预处理视频
    vr = decord.VideoReader(video_path, ctx=decord.cpu(0))
    total_frames = len(vr)

    # 均匀采样
    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    frames = vr.get_batch(indices).asnumpy()  # (num_frames, H, W, 3)

    # 预处理
    from torchvision import transforms
    transform = transforms.Compose([
        transforms.Lambda(lambda x: torch.from_numpy(x).permute(0, 3, 1, 2).float()),
        transforms.Resize(target_size, antialias=True),
        transforms.CenterCrop(target_size),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    frames_tensor = transform(torch.tensor(frames))  # (T, 3, H, W)
    return frames_tensor

# 使用示例
if __name__ == "__main__":
    video = load_video("sample.mp4", num_frames=16)
    print(f"Video tensor: {video.shape}")  # (16, 3, 224, 224)

    engine = VideoSearchEngine(model, dim=256)
    engine.add_videos(video.unsqueeze(0), ["sample_001"])

    results = engine.search("a person playing guitar")
    for vid, score in results:
        print(f"  {vid}: similarity={score:.4f}")`
          }
        ],
        table: {
          headers: ["组件", "技术选型", "理由", "性能影响"],
          rows: [
            ["视频解码", "Decord", "比 OpenCV 快 3 倍", "加载延迟降低 60%"],
            ["向量索引", "FAISS IVFPQ", "十亿级可扩展", "内存降低 32 倍"],
            ["特征维度", "256D", "精度-速度平衡", "检索延迟 <10ms"],
            ["帧采样", "均匀 8 帧", "覆盖全局语义", "编码速度提升 4 倍"]
          ]
        },
        mermaid: `graph LR
    A["视频库"] --> B["离线编码"]
    B --> C["视频嵌入"]
    C --> D["FAISS 索引"]
    E["用户查询"] --> F["文本编码"]
    F --> G["文本嵌入"]
    G --> H["向量检索"]
    D --> H
    H --> I["Top-K 结果"]
    I --> J["排序返回"]`,
        tip: "实际部署时，建议将视频编码结果预计算并存储到 Redis 或 Milvus，避免每次启动重新编码，可将冷启动时间从数小时降至秒级",
        warning: "FAISS 的 IVFPQ 索引在训练阶段需要足够的数据量（至少 1000 * nlist 个向量），数据不足时建议改用 IndexFlatIP 精确搜索"
      }
    ],
};
