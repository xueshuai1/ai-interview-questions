import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-012",
    title: "自监督视觉学习：MAE, DINO, MoCo",
    category: "cv",
    tags: ["自监督学习", "MAE", "对比学习"],
    summary: "无需标注数据的视觉预训练，掌握自监督学习的最新进展",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 自监督学习动机",
            body: `自监督学习（Self-Supervised Learning, SSL）的核心思想是：从未标注数据中自动构造监督信号，让模型学会通用的特征表示。与传统监督学习依赖大量人工标注不同，SSL 利用数据本身的结构作为标签，解决了标注成本高昂的瓶颈。

在计算机视觉领域，ImageNet 等大规模标注数据集的构建需要耗费数万小时的人工标注，且标注质量难以保证。自监督学习通过设计" pretext task "（前置任务），例如预测图像旋转角度、填充被遮挡的区域、或者让模型区分同一图像的不同增强版本，迫使网络学习到对语义理解至关重要的底层特征。

预训练-微调范式是 SSL 的标准流程：先在大规模无标注数据上进行自监督预训练，学到通用视觉表示后，再用少量标注数据对特定下游任务（分类、检测、分割）进行微调。实践证明，这种范式在小样本场景下表现尤其出色，甚至超越纯监督预训练。

对比学习是非对比方法是自监督学习的两大技术路线，下文将逐一展开。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image

# 自监督学习的核心：构造数据增强视图
def build_augmentation_views(image_path: str):
    """为同一图像生成两个增强视图（View 1 & View 2）"""
    transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.2, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(0.4, 0.4, 0.4, 0.1),
        transforms.RandomGrayscale(p=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225]),
    ])
    img = Image.open(image_path).convert("RGB")
    v1 = transform(img)
    v2 = transform(img)
    return v1, v2`,
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class SSLPretrainPipeline:
    """自监督预训练管道：pretext -> representation -> fine-tune"""

    def __init__(self, backbone: nn.Module, pretext_head: nn.Module):
        self.backbone = backbone
        self.pretext_head = pretext_head

    def pretrain_step(self, views: torch.Tensor) -> torch.Tensor:
        """预训练前向传播"""
        features = self.backbone(views)    # [B, D]
        pretext_output = self.pretext_head(features)
        return pretext_output

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """下游任务使用的特征提取"""
        return self.backbone(x)

    def fine_tune(self, features: torch.Tensor, classifier: nn.Module):
        """下游任务微调"""
        return classifier(features.detach())`,
                },
            ],
            table: {
                headers: ["学习方式", "标注需求", "数据效率", "典型方法"],
                rows: [
                    ["监督学习", "需要大量人工标注", "高标注依赖", "ResNet + CrossEntropy"],
                    ["自监督学习", "无需标注，自动构造信号", "低标注依赖", "MoCo, MAE, DINO"],
                    ["半监督学习", "少量标注 + 大量无标注", "中等标注依赖", "FixMatch, MixMatch"],
                    ["弱监督学习", "图像级粗标签", "中等标注依赖", "CAM, Attention Pooling"],
                ],
            },
            mermaid: `graph TD
  A[无标注图像数据集] --> B[构造 Pretext Task]
  B --> C[对比学习: SimCLR/MoCo]
  B --> D[生成式: MAE]
  B --> E[自蒸馏: DINO]
  C --> F[通用视觉表示]
  D --> F
  E --> F
  F --> G[下游任务微调]
  G --> H[分类/检测/分割]`,
            tip: "自监督学习不是万能药，它在下游任务标注数据稀缺时优势最大；如果下游任务有海量标注数据，纯监督预训练可能更简单有效。",
            warning: "数据增强的强度直接影响 SSL 效果。增强太弱，模型学不到鲁棒特征；增强太强，语义信息被破坏，模型难以收敛。",
        },
        {
            title: "2. 对比学习：SimCLR 与 MoCo",
            body: `对比学习（Contrastive Learning）的核心直觉非常直接：让同一图像的不同增强版本（正样本对）在特征空间中靠近，让不同图像（负样本对）在特征空间中远离。这个简单的原则产生了强大的通用表示。

SimCLR 框架通过两个关键设计实现了对比学习：首先是强大的数据增强策略（随机裁剪、颜色抖动、高斯模糊），其次是 InfoNCE 损失函数，它通过温度参数控制正负样本对的区分难度。SimCLR 的瓶颈在于需要大的 batch size 来提供足够的负样本——论文中使用了 8192 的 batch size。

MoCo（Momentum Contrast）通过引入动态队列（Memory Bank）和动量编码器（Momentum Encoder）解决了负样本数量的问题。MoCo 维护一个先进先出的队列存储历史特征，即使 batch size 很小也能获得大量负样本。动量编码器通过 EMA（指数移动平均）更新，保证了队列中特征的一致性，避免了梯度回传导致的特征漂移。

两者的共同点在于都使用 InfoNCE 损失，区别在于负样本的组织方式：SimCLR 靠大 batch，MoCo 靠队列。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SimCLR(nn.Module):
    """SimCLR 对比学习模型"""

    def __init__(self, backbone: nn.Module, proj_dim: int = 128):
        super().__init__()
        self.backbone = backbone
        feature_dim = backbone.feature_dim  # e.g., 2048
        self.projector = nn.Sequential(
            nn.Linear(feature_dim, feature_dim),
            nn.ReLU(),
            nn.Linear(feature_dim, proj_dim),
        )

    def forward(self, x1: torch.Tensor, x2: torch.Tensor):
        z1 = self.projector(self.backbone(x1))
        z2 = self.projector(self.backbone(x2))
        return z1, z2

    def info_nce_loss(self, z1: torch.Tensor, z2: torch.Tensor,
                      temperature: float = 0.07) -> torch.Tensor:
        """InfoNCE 损失"""
        z = torch.cat([z1, z2], dim=0)  # [2B, D]
        sim = F.cosine_similarity(z.unsqueeze(1), z.unsqueeze(0), dim=-1)
        sim /= temperature
        labels = torch.arange(z.size(0), device=z.device)
        # 对角线以外的都是负样本
        labels[z.size(0):] = torch.arange(z.size(0), device=z.device)
        loss = F.cross_entropy(sim, labels)
        return loss`,
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class MoCo(nn.Module):
    """MoCo v2 动量对比学习"""

    def __init__(self, backbone: nn.Module, queue_size: int = 65536,
                 proj_dim: int = 128, momentum: float = 0.999):
        super().__init__()
        self.encoder_q = nn.Sequential(backbone,
                                       nn.Linear(backbone.feature_dim, proj_dim))
        self.encoder_k = nn.Sequential(backbone,
                                       nn.Linear(backbone.feature_dim, proj_dim))
        self.momentum = momentum
        self.register_buffer("queue", torch.randn(proj_dim, queue_size))
        self.queue = F.normalize(self.queue, dim=0)
        self.register_buffer("queue_ptr", torch.zeros(1, dtype=torch.long))

        for param_k in self.encoder_k.parameters():
            param_k.requires_grad = False

    @torch.no_grad()
    def _momentum_update(self):
        for param_q, param_k in zip(self.encoder_q.parameters(),
                                     self.encoder_k.parameters()):
            param_k.data = param_k.data * self.momentum + param_q.data * (1 - self.momentum)

    @torch.no_grad()
    def _dequeue_and_enqueue(self, keys: torch.Tensor):
        ptr = int(self.queue_ptr)
        bs = keys.shape[0]
        self.queue[:, ptr:ptr + bs] = keys.T
        self.queue_ptr[0] = (ptr + bs) % self.queue.shape[1]`,
                },
            ],
            table: {
                headers: ["特性", "SimCLR", "MoCo"],
                rows: [
                    ["负样本来源", "同 batch 内其他样本", "动态队列（Memory Bank）"],
                    ["Batch Size 需求", "大（4096-8192）", "小（256 即可）"],
                    ["编码器更新", "两个编码器同权重", "Query + Momentum Key 编码器"],
                    ["核心创新", "强数据增强组合", "动量编码器 + 队列"],
                    ["显存占用", "高（大 batch）", "较低（小 batch + 队列）"],
                    ["ImageNet Top-1", "~69.1%（ResNet-50）", "~67.5%（ResNet-50）"],
                ],
            },
            mermaid: `graph LR
  A[输入图像 x] --> B[增强 View 1]
  A --> C[增强 View 2]
  B --> D[Encoder Q -> z_q]
  C --> E[Encoder K -> z_k]
  D --> F[InfoNCE Loss]
  E --> F
  E -.->|动量更新| D
  G[Negative Queue] --> F
  F --> H[更新 Encoder Q]`,
            tip: "MoCo 的动量系数建议从 0.999 开始，训练初期可以用 cosine schedule 从 0.996 逐渐升到 0.999，有助于稳定训练。",
            warning: "对比学习对 batch size 极度敏感（尤其是 SimCLR）。如果显存不够用大 batch，必须用 MoCo 的队列方案，否则负样本不足会导致表征坍塌。",
        },
        {
            title: "3. 非对比方法：BYOL 与 SimSiam",
            body: `对比学习依赖大量负样本来避免表征坍塌（所有样本映射到同一个向量），但构造负样本带来了计算开销和超参数调优的复杂性。非对比方法（Non-Contrastive Methods）走了另一条路：完全不使用负样本，仅通过巧妙的架构设计就能学到有意义的表示。

BYOL（Bootstrap Your Own Latent）只用正样本对进行训练。它的核心设计是两个不对称的网络：Online Network 和 Target Network。Online Network 由 Encoder、Projector 和 Predictor 组成，而 Target Network 只有 Encoder 和 Projector，且参数是 Online Network 的 EMA 更新。关键的不对称性在于：只有 Online Network 有 Predictor 头，这种不对称性打破了坍缩的对称解，使得所有样本映射到同一向量的解不再是最优的。

SimSiam 进一步简化了 BYOL，去掉了动量编码器和 Momentum 更新，仅用两个共享权重的编码器和一个 Predictor 头。通过 stop-gradient 操作（在一个分支上阻止梯度回传），SimSiam 实现了与 BYOL 相当的效果，但训练过程更加简单。它的成功说明：非对比方法的关键不在于动量更新，而在于预测头 + 不对称性的组合。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import copy

class BYOL(nn.Module):
    """BYOL: Bootstrap Your Own Latent"""

    def __init__(self, backbone: nn.Module, proj_dim: int = 256,
                 pred_dim: int = 128, momentum: float = 0.996):
        super().__init__()
        self.online_encoder = nn.Sequential(
            backbone,
            nn.Linear(backbone.feature_dim, proj_dim),
            nn.BatchNorm1d(proj_dim),
            nn.ReLU(),
            nn.Linear(proj_dim, proj_dim),
        )
        self.predictor = nn.Sequential(
            nn.Linear(proj_dim, pred_dim),
            nn.BatchNorm1d(pred_dim),
            nn.ReLU(),
            nn.Linear(pred_dim, proj_dim),
        )
        self.target_encoder = copy.deepcopy(self.online_encoder)
        self.momentum = momentum

        for p in self.target_encoder.parameters():
            p.requires_grad = False

    @torch.no_grad()
    def update_target(self):
        for o, t in zip(self.online_encoder.parameters(),
                         self.target_encoder.parameters()):
            t.data = t.data * self.momentum + o.data * (1 - self.momentum)

    def forward(self, x1: torch.Tensor, x2: torch.Tensor):
        q1 = self.predictor(self.online_encoder(x1))
        q2 = self.predictor(self.online_encoder(x2))
        with torch.no_grad():
            z1 = self.target_encoder(x1)
            z2 = self.target_encoder(x2)
        # 交叉预测损失
        loss = -(F.cosine_similarity(q1, z2).mean() +
                 F.cosine_similarity(q2, z1).mean()) / 2
        return loss`,
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SimSiam(nn.Module):
    """SimSiam: 无需负样本、无需动量编码器的自监督学习"""

    def __init__(self, backbone: nn.Module, proj_dim: int = 2048,
                 pred_dim: int = 512):
        super().__init__()
        feature_dim = backbone.feature_dim
        self.backbone = backbone
        self.projector = nn.Sequential(
            nn.Linear(feature_dim, proj_dim, bias=False),
            nn.BatchNorm1d(proj_dim),
            nn.ReLU(),
            nn.Linear(proj_dim, proj_dim, bias=False),
            nn.BatchNorm1d(proj_dim),
            nn.ReLU(),
            nn.Linear(proj_dim, proj_dim),
            nn.BatchNorm1d(proj_dim),
        )
        self.predictor = nn.Sequential(
            nn.Linear(proj_dim, pred_dim, bias=False),
            nn.BatchNorm1d(pred_dim),
            nn.ReLU(),
            nn.Linear(pred_dim, proj_dim),
        )

    def forward_one(self, x: torch.Tensor):
        z = self.projector(self.backbone(x))
        p = self.predictor(z)
        return z, p

    def forward(self, x1: torch.Tensor, x2: torch.Tensor):
        z1, p1 = self.forward_one(x1)
        z2, p2 = self.forward_one(x2)
        # stop-gradient: 一个分支不传梯度
        loss = -(F.cosine_similarity(p1, z2.detach()).mean() +
                 F.cosine_similarity(p2, z1.detach()).mean()) / 2
        return loss`,
                },
            ],
            table: {
                headers: ["特性", "BYOL", "SimSiam", "SimCLR"],
                rows: [
                    ["负样本", "不需要", "不需要", "需要"],
                    ["动量编码器", "需要（EMA 更新）", "不需要", "不需要"],
                    ["Stop Gradient", "隐含在 EMA 中", "显式 detach", "不需要"],
                    ["Predictor 头", "需要", "需要", "不需要"],
                    ["架构对称性", "不对称（EMA）", "对称但梯度不对称", "对称"],
                    ["ImageNet Top-1", "~73.2%", "~68.1%", "~69.1%"],
                ],
            },
            mermaid: `graph TD
  A[输入 x1] --> B[Online Encoder]
  B --> C[Projector -> z1]
  C --> D[Predictor -> p1]
  A --> E[输入 x2]
  E --> F[Target Encoder]
  F --> G[Projector -> z2]
  D --> H{Cosine Similarity}
  G --> H
  H --> I[最小化距离]
  G -. stop-grad .-> B`,
            tip: "如果你显存有限且不想调大 batch，SimSiam 是最简单的入门选择——不需要队列，不需要动量编码器，代码量最少。",
            warning: "非对比方法对 Predictor 头的设计很敏感。如果去掉 Predictor 或 Predictor 太浅，模型容易坍塌到平凡解。",
        },
        {
            title: "4. 掩码图像建模：MAE",
            body: `掩码图像建模（Masked Image Modeling, MIM）将 NLP 中 BERT 的掩码语言建模思想引入视觉领域。MAE（Masked Autoencoder）是这一方向的代表作，它通过随机遮蔽输入图像的大部分区域（默认 75%），然后让模型重建被遮蔽的像素来学习视觉表示。

MAE 的架构设计有几个关键创新。首先是非对称编码器-解码器：编码器只处理可见的 patch（25%），使用轻量级解码器重建完整图像。这种设计使得编码器的计算量大幅降低，因为遮蔽的 patch 不参与编码器的计算。其次是高遮蔽率（75%），迫使模型学习全局的语义理解而非简单的局部纹理外推。

与对比学习相比，MAE 有两个显著优势。一是计算效率高，编码器只处理 25% 的 patch，训练速度更快。二是学到的表示天然适合稠密预测任务（分割、检测），因为重建任务本身就要求理解图像的局部细节和全局结构。MAE 在 ImageNet 分类、COCO 检测和 ADE20K 分割上都取得了优异表现。

MAE 的预训练目标直接是像素级重建（MSE Loss），这种生成式的目标让模型自然地学习图像的多尺度结构信息。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from timm.models.vision_transformer import PatchEmbed, Block

class MAE(nn.Module):
    """Masked Autoencoder 核心实现"""

    def __init__(self, img_size: int = 224, patch_size: int = 16,
                 embed_dim: int = 1024, depth: int = 24, num_heads: int = 16,
                 decoder_dim: int = 512, decoder_depth: int = 8,
                 mask_ratio: float = 0.75):
        super().__init__()
        self.patch_embed = PatchEmbed(img_size, patch_size, 3, embed_dim)
        num_patches = self.patch_embed.num_patches
        self.mask_ratio = mask_ratio

        # Encoder
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        self.pos_embed = nn.Parameter(torch.zeros(1, num_patches + 1, embed_dim))
        self.blocks = nn.ModuleList([
            Block(embed_dim, num_heads, mlp_ratio=4.0, qkv_bias=True)
            for _ in range(depth)
        ])
        self.norm = nn.LayerNorm(embed_dim)

        # Decoder
        self.decoder_embed = nn.Linear(embed_dim, decoder_dim)
        self.decoder_pos_embed = nn.Parameter(
            torch.zeros(1, num_patches + 1, decoder_dim))
        self.decoder_blocks = nn.ModuleList([
            Block(decoder_dim, num_heads // 2, mlp_ratio=4.0)
            for _ in range(decoder_depth)
        ])
        self.decoder_norm = nn.LayerNorm(decoder_dim)
        self.decoder_pred = nn.Linear(decoder_dim, patch_size ** 2 * 3)`,
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import numpy as np

class MAEForward:
    """MAE 前向传播流程"""

    def __init__(self, model: MAE):
        self.model = model

    def random_masking(self, x: torch.Tensor, mask_ratio: float):
        """随机遮蔽 patch，返回可见 patch 的索引和 mask"""
        N, L, D = x.shape  # batch, length, dim
        len_keep = int(L * (1 - mask_ratio))

        noise = torch.rand(N, L, device=x.device)  # [0, 1) 均匀噪声
        ids_shuffle = torch.argsort(noise, dim=1)  # 升序排列
        ids_restore = torch.argsort(ids_shuffle, dim=1)

        ids_keep = ids_shuffle[:, :len_keep]
        x_masked = torch.gather(
            x, dim=1, index=ids_keep.unsqueeze(-1).repeat(1, 1, D))

        mask = torch.ones([N, L], device=x.device)
        mask[:, :len_keep] = 0
        mask = torch.gather(mask, dim=1, index=ids_restore)
        return x_masked, mask, ids_restore

    def forward(self, imgs: torch.Tensor):
        # 1. Patch embedding
        x = self.model.patch_embed(imgs)
        x += self.model.pos_embed[:, 1:, :]

        # 2. 随机遮蔽
        x_masked, mask, ids_restore = self.random_masking(x, self.model.mask_ratio)

        # 3. 添加 cls token 并编码
        cls_tokens = self.model.cls_token.expand(x.shape[0], -1, -1)
        x = torch.cat([cls_tokens, x_masked], dim=1)
        for blk in self.model.blocks:
            x = blk(x)
        x = self.model.norm(x)

        # 4. 解码器重建
        # ... (decoder 前向)
        # 5. 计算 MSE 重建损失
        # loss = F.mse_loss(pred, target)
        pass`,
                },
            ],
            table: {
                headers: ["参数", "MAE ViT-Large", "MAE ViT-Base", "说明"],
                rows: [
                    ["Embed Dim", "1024", "768", "Patch 嵌入维度"],
                    ["Depth", "24", "12", "Transformer 层数"],
                    ["Num Heads", "16", "12", "注意力头数"],
                    ["Decoder Depth", "8", "4", "解码器层数"],
                    ["Mask Ratio", "75%", "75%", "遮蔽比例"],
                    ["Epochs", "800", "800", "预训练轮数"],
                    ["ImageNet Top-1", "85.9%", "83.1%", "线性探测精度"],
                ],
            },
            mermaid: `graph TD
  A[输入图像 224x224] --> B[Patch Embedding 14x14]
  B --> C[随机遮蔽 75%]
  C --> D[可见 Patch 25%]
  D --> E[ViT Encoder]
  E --> F[CLS Token 特征]
  F --> G[Linear 映射到 Decoder]
  G --> H[添加 Mask Token]
  H --> I[ViT Decoder]
  I --> J[重建像素 MSE Loss]`,
            tip: "MAE 的遮蔽比例（mask ratio）是最关键的超参数。75% 是论文推荐的默认值，对于高分辨率图像可以尝试提高到 80%-85%。",
            warning: "MAE 的解码器只在预训练阶段使用，下游任务微调时直接丢弃解码器，只用编码器提取特征。不要把解码器参数一起微调。",
        },
        {
            title: "5. 自蒸馏：DINO 与 DINOv2",
            body: `DINO（Self-Distillation with No Labels）将知识蒸馏的思想用于自监督学习，不需要负样本也不需要重建目标。它的核心是让学生网络（Student）预测教师网络（Teacher）对同一图像不同视图的输出分布。教师网络的参数通过学生网络的 EMA 更新，形成自举式的学习循环。

DINO 的关键创新在于多裁剪策略（Multi-Crop）。除了两个全局视图（Global Views），还生成多个局部视图（Local Views，默认 6 个）。全局视图捕捉整体语义，局部视图迫使模型关注细粒度的局部特征。这种设计让 DINO 学到的特征天然具有空间结构——特征图的不同位置对应图像的不同语义区域，这使得 DINO 在无需任何标注的情况下就能实现语义分割。

DINOv2 在 DINO 的基础上进行了全面升级。引入了 IBOT（Image BERT）的掩码建模目标，结合了全局和局部的自蒸馏；使用更大的数据集（包括 LVD-142M）和更大的模型（ViT-g/14，11 亿参数）；并直接输出可以直接用于下游任务的特征，无需微调。DINOv2 的特征在零样本分类、分割和深度估计等任务上都展现了惊人的泛化能力。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class DINOHead(nn.Module):
    """DINO 投影头和输出头"""

    def __init__(self, in_dim: int, out_dim: int = 65536,
                 use_bn: bool = True, norm_last_layer: bool = True,
                 nlayers: int = 3, hidden_dim: int = 2048,
                 bottleneck_dim: int = 256):
        super().__init__()
        layers = [nn.Linear(in_dim, hidden_dim)]
        if use_bn:
            layers.append(nn.BatchNorm1d(hidden_dim))
        layers.append(nn.GELU())
        for _ in range(nlayers - 2):
            layers.append(nn.Linear(hidden_dim, hidden_dim))
            if use_bn:
                layers.append(nn.BatchNorm1d(hidden_dim))
            layers.append(nn.GELU())
        layers.append(nn.Linear(hidden_dim, bottleneck_dim))
        self.mlp = nn.Sequential(*layers)
        self.last_layer = nn.utils.weight_norm(
            nn.Linear(bottleneck_dim, out_dim, bias=False))
        self.last_layer.weight_g.data.fill_(1)
        if norm_last_layer:
            self.last_layer.weight_g.requires_grad = False

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.mlp(x)
        x = F.normalize(x, dim=-1, p=2)
        x = self.last_layer(x)
        return x`,
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn.functional as F

def dino_loss(student_out: torch.Tensor, teacher_out: torch.Tensor,
              center: torch.Tensor, temp_student: float = 0.1,
              temp_teacher: float = 0.04):
    """DINO 损失：学生预测教师的中心化输出"""

    # 对学生输出应用锐化（sharpening）
    student_logits = student_out / temp_student
    student_probs = F.softmax(student_logits, dim=-1)

    # 对教师输出进行中心化和锐化
    teacher_centered = teacher_out - center
    teacher_probs = F.softmax(teacher_centered / temp_teacher, dim=-1)
    teacher_probs = teacher_probs.detach()  # 不传梯度

    # 交叉熵损失
    loss = torch.sum(-teacher_probs * F.log_softmax(student_logits, dim=-1),
                     dim=-1)
    return loss.mean()

def update_center(center: torch.Tensor, teacher_out: torch.Tensor,
                  center_momentum: float = 0.9) -> torch.Tensor:
    """更新中心向量（EMA）"""
    batch_center = torch.mean(teacher_out, dim=0)
    center = center * center_momentum + batch_center * (1 - center_momentum)
    return center`,
                },
            ],
            table: {
                headers: ["特性", "DINO", "DINOv2", "iBOT"],
                rows: [
                    ["训练目标", "自蒸馏 + 多裁剪", "自蒸馏 + 掩码建模", "掩码图像建模"],
                    ["输出头", "DINO Head (65536)", "多层投影头", "Masked Patch Head"],
                    ["数据集", "ImageNet-1K", "LVD-142M", "ImageNet-22K"],
                    ["最大模型", "ViT-L/16", "ViT-g/14 (1.1B)", "ViT-L/16"],
                    ["空间结构", "强（可零样本分割）", "极强（零样本深度估计）", "中等"],
                    ["微调需求", "推荐微调", "可直接使用特征", "推荐微调"],
                ],
            },
            mermaid: `graph TD
  A[输入图像] --> B[多裁剪: 2 Global + 6 Local]
  B --> C[Student Network]
  B --> D[Teacher Network EMA]
  C --> E[Student Output]
  D --> F[Teacher Output]
  F --> G[Centering + Sharpening]
  G --> H{Cross Entropy}
  E --> H
  H --> I[Update Student]
  I -.->|EMA| D`,
            tip: "DINO 的输出维度（out_dim）建议设为 65536。太小会导致信息瓶颈，太大会让中心化不稳定。",
            warning: "DINO 训练初期的温度参数（temperature）需要 warmup——从 0.04 线性增加到 0.07。如果温度一开始就设太大，教师信号太模糊，学生学不到有效特征。",
        },
        {
            title: "6. 方法对比与选型指南",
            body: `自监督视觉学习已经发展出多条技术路线，各有优劣。选择哪种方法取决于你的具体场景：计算资源、下游任务类型、数据规模和标注预算。

对比学习（MoCo/SimCLR）适合分类为主的场景，在 ImageNet 线性评估上表现稳定，但对 batch size 或队列机制有要求。非对比方法（BYOL/SimSiam）实现最简单，不需要负样本，适合显存有限的场景。MAE 为代表的掩码图像建模方法在稠密任务（检测、分割）上表现最出色，因为重建目标天然编码了局部结构信息。DINO 系列方法产出的特征空间结构最强，适合零样本场景和需要空间理解的任务。

从计算效率看，MAE 编码器只处理 25% 的 patch，理论计算量最小；MoCo 需要维护队列和双编码器，开销中等；SimCLR 需要极大 batch size，对分布式训练要求最高。

实际工程中，如果你的下游任务是分类且显存充足，MoCo v3 是稳妥选择；如果要做检测或分割，MAE 预训练更合适；如果需要特征直接可用（不想微调），DINOv2 是最佳方案。`,
            code: [
                {
                    lang: "python",
                    code: `# 方法选型的快速参考代码
SSL_METHODS = {
    "SimCLR": {
        "best_for": "通用分类",
        "batch_size": 4096,
        "negatives": "in-batch",
        "downstream": "分类 > 检测 > 分割",
        "compute": "高（需要大 batch）",
    },
    "MoCo v3": {
        "best_for": "通用分类",
        "batch_size": 256,
        "negatives": "queue-based",
        "downstream": "分类 > 检测 > 分割",
        "compute": "中等",
    },
    "BYOL": {
        "best_for": "显存受限场景",
        "batch_size": 256,
        "negatives": "无",
        "downstream": "分类 ≈ 检测 > 分割",
        "compute": "中等",
    },
    "MAE": {
        "best_for": "稠密预测任务",
        "batch_size": 4096,
        "negatives": "无（生成式）",
        "downstream": "分割 > 检测 > 分类",
        "compute": "低（仅编码可见 patch）",
    },
    "DINOv2": {
        "best_for": "零样本/特征即用",
        "batch_size": 4096,
        "negatives": "无（自蒸馏）",
        "downstream": "通用（特征直接可用）",
        "compute": "高（需大模型 + 大数据）",
    },
}`,
                },
                {
                    lang: "python",
                    code: `import torch
from typing import Dict, Any

def evaluate_ssl_features(
    model: torch.nn.Module,
    test_loader: torch.utils.data.DataLoader,
    linear_classifier: torch.nn.Module,
    device: str = "cuda",
) -> Dict[str, float]:
    """线性评估：冻结 backbone，只训练分类头"""
    model.eval()
    linear_classifier.train()

    features_list, labels_list = [], []
    with torch.no_grad():
        for imgs, labels in test_loader:
            imgs = imgs.to(device)
            feats = model.backbone(imgs)  # 冻结特征提取
            features_list.append(feats.cpu())
            labels_list.append(labels)

    features = torch.cat(features_list)
    labels = torch.cat(labels_list)

    # 训练线性分类器
    optimizer = torch.optim.SGD(linear_classifier.parameters(), lr=0.1)
    for epoch in range(100):
        logits = linear_classifier(features.to(device))
        loss = torch.nn.functional.cross_entropy(logits, labels.to(device))
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    # 评估
    with torch.no_grad():
        logits = linear_classifier(features.to(device))
        preds = logits.argmax(dim=-1)
        accuracy = (preds == labels.to(device)).float().mean().item()

    return {"accuracy": accuracy, "num_features": features.shape[1]}`,
                },
            ],
            table: {
                headers: ["方法", "分类精度", "检测 mAP", "分割 mIoU", "零样本能力", "训练难度"],
                rows: [
                    ["MoCo v3", "76.6%", "40.3%", "42.2%", "弱", "中等"],
                    ["BYOL", "73.2%", "38.5%", "41.1%", "弱", "低"],
                    ["MAE", "79.9%", "46.2%", "53.5%", "弱", "低"],
                    ["DINO", "76.1%", "42.8%", "47.3%", "强", "高"],
                    ["DINOv2", "81.5%", "51.3%", "57.4%", "极强", "极高"],
                ],
            },
            mermaid: `graph TD
  A{选择自监督方法} --> B{下游任务?}
  B -->|分类为主| C{显存?}
  C -->|充足| D[SimCLR / MoCo v3]
  C -->|有限| E[BYOL / SimSiam]
  B -->|检测 / 分割| F[MAE]
  B -->|零样本 / 通用| G[DINOv2]
  D --> H[下游微调]
  E --> H
  F --> H
  G --> I[直接使用特征]`,
            tip: "如果你不确定该选哪个方法，从 MAE 开始：它实现相对简单，在分类和稠密任务上都有不错的表现，是很好的基准线。",
            warning: "不同方法的预训练权重格式差异很大。MoCo 的权重通常需要提取 teacher 部分，MAE 的权重要丢弃 decoder，DINO 的权重只取 backbone。加载前务必检查权重结构。",
        },
        {
            title: "7. 实战：MAE 预训练与下游微调",
            body: `本节以 MAE 为例，展示完整的自监督预训练到下游任务微调的流程。MAE 是目前性价比最高的自监督方法之一，在各类下游任务上都有稳定表现，且实现相对简单。

预训练阶段的关键是构建高效的训练管道。MAE 的数据增强只需要简单的 RandomResizedCrop 和水平翻转——不需要对比学习中的颜色抖动、高斯模糊等复杂增强，因为重建任务本身就是一个足够强的监督信号。训练时使用 AdamW 优化器配合 cosine learning rate decay，batch size 推荐 4096，训练 800-1600 个 epoch。

微调阶段有两种常见做法。对于分类任务，在 CLS token 特征上接一个线性分类头，端到端微调整个 ViT；对于检测或分割任务，通常将预训练的 ViT 作为检测器/分割器的 backbone，替换原有的 ResNet。微调时的学习率通常比预训练小 1-2 个数量级，并且只对 backbone 做较小的更新。

MAE 官方开源了高质量的预训练权重，实际项目中通常直接使用预训练权重进行微调，而非从头预训练。了解完整的预训练流程有助于理解模型的行为和调参方向。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from timm.models.vision_transformer import vit_large_patch16_224

def build_mae_pretrain_pipeline(data_dir: str, batch_size: int = 256):
    """构建 MAE 预训练数据管道"""
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.2, 1.0),
                                      interpolation=3),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225]),
    ])
    dataset = datasets.ImageFolder(data_dir, transform=train_transform)
    loader = DataLoader(dataset, batch_size=batch_size,
                        shuffle=True, num_workers=8, pin_memory=True)
    return loader

def build_mae_model(device: str = "cuda"):
    """构建 MAE 模型（简化版，实际使用 mae 官方实现）"""
    from mae.models_mae import mae_vit_large_patch16_dec512d8b
    model = mae_vit_large_patch16_dec512d8b()
    model = model.to(device)
    return model

def mae_pretrain(model: nn.Module, loader: DataLoader,
                 epochs: int = 800, lr: float = 1.5e-4,
                 device: str = "cuda"):
    """MAE 预训练循环"""
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr,
                                  weight_decay=0.05)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=epochs)

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        for imgs, _ in loader:
            imgs = imgs.to(device, non_blocking=True)
            loss, _, _ = model(imgs, mask_ratio=0.75)
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()
            total_loss += loss.item()
        scheduler.step()
        print(f"Epoch {epoch}: avg_loss={total_loss/len(loader):.4f}")`,
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from torchvision import datasets, transforms

def fine_tune_mae_for_classification(
    checkpoint_path: str,
    train_dir: str,
    num_classes: int,
    epochs: int = 100,
    lr: float = 5e-4,
    device: str = "cuda",
):
    """加载 MAE 预训练权重并微调分类任务"""
    from timm.models.vision_transformer import vit_large_patch16_224

    # 1. 加载预训练 backbone
    model = vit_large_patch16_224(pretrained=False)
    checkpoint = torch.load(checkpoint_path, map_location="cpu")
    # MAE checkpoint 的 key 带 "model." 前缀
    state_dict = {k.replace("model.", ""): v
                  for k, v in checkpoint.items()}
    # 移除 decoder 相关权重
    state_dict = {k: v for k, v in state_dict.items()
                  if not k.startswith("decoder")}
    msg = model.load_state_dict(state_dict, strict=False)
    print(f"Loaded MAE weights: {msg}")

    # 2. 替换分类头
    model.head = nn.Linear(model.head.in_features, num_classes)
    model = model.to(device)

    # 3. 数据增强（微调用较弱的增强）
    train_tf = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])
    train_ds = datasets.ImageFolder(train_dir, transform=train_tf)
    loader = torch.utils.data.DataLoader(train_ds, batch_size=128,
                                          shuffle=True, num_workers=4)

    # 4. 微调训练
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr,
                                  weight_decay=0.05)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(epochs):
        model.train()
        for imgs, labels in loader:
            imgs, labels = imgs.to(device), labels.to(device)
            logits = model(imgs)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()
        print(f"Epoch {epoch}: loss={loss.item():.4f}")

    return model`,
                },
            ],
            table: {
                headers: ["阶段", "学习率", "Batch Size", "Epochs", "优化器", "数据增强"],
                rows: [
                    ["MAE 预训练", "1.5e-4", "4096", "800", "AdamW", "RandomCrop + Flip"],
                    ["线性探测", "1e-3", "1024", "90", "LARS", "Resize + CenterCrop"],
                    ["端到端微调", "5e-4", "256", "100", "AdamW", "RandomCrop + Flip"],
                    ["检测微调", "5e-5", "16", "24", "AdamW", "与检测器一致"],
                    ["分割微调", "1e-5", "16", "32", "AdamW", "与分割器一致"],
                ],
            },
            mermaid: `graph TD
  A[ImageNet 无标注数据] --> B[MAE 预训练 800 Epoch]
  B --> C[保存 Encoder 权重]
  C --> D{下游任务}
  D -->|分类| E[替换 Head + 端到端微调]
  D -->|检测| F[作为 Backbone + 检测头微调]
  D -->|分割| G[作为 Backbone + 分割头微调]
  E --> H[分类模型]
  F --> I[检测模型]
  G --> J[分割模型]`,
            tip: "微调时建议分层设置学习率：backbone 用较小的 lr（如 5e-5），新加的 head 用较大的 lr（如 5e-4），这样可以在保留预训练特征的同时快速适应新任务。",
            warning: "MAE 预训练权重的 position embedding 尺寸是固定的（14x14 对应 224x224 输入）。如果你的下游任务使用不同分辨率的输入，需要对 position embedding 进行插值，否则会产生尺寸不匹配的报错。",
        },
    ],
};
