# AI 技术知识体系

> 完整的 AI 技术领域知识点清单，用于指导内容创作

---

## 📊 ML - 机器学习基础

### 一、基础概念
- 什么是机器学习
- 机器学习 vs 深度学习 vs 人工智能
- 机器学习工作流程
- 数据类型与特征工程

### 二、监督学习
- **回归算法**
  - 线性回归
  - 逻辑回归
  - 岭回归 (Ridge)
  - Lasso 回归
  - 多项式回归
- **分类算法**
  - 朴素贝叶斯
  - K 近邻 (KNN)
  - 决策树
  - 随机森林
  - 支持向量机 (SVM)
  - 逻辑回归

### 三、无监督学习
- **聚类算法**
  - K-Means
  - 层次聚类
  - DBSCAN
  - 高斯混合模型 (GMM)
- **降维算法**
  - 主成分分析 (PCA)
  - t-SNE
  - UMAP
  - 线性判别分析 (LDA)

### 四、集成学习
- Bagging
- Boosting (AdaBoost, Gradient Boosting)
- Stacking
- Voting
- XGBoost
- LightGBM
- CatBoost

### 五、模型评估
- 混淆矩阵
- 精确率、召回率、F1 分数
- ROC 曲线与 AUC
- PR 曲线
- 交叉验证
- 学习曲线与验证曲线
- 偏差 - 方差权衡

### 六、特征工程
- 特征选择
- 特征提取
- 特征缩放（标准化、归一化）
- 编码技术（One-Hot、标签编码、目标编码）
- 缺失值处理
- 异常值检测
- 特征交互与多项式特征

### 七、优化算法
- 梯度下降
- 随机梯度下降 (SGD)
- Adam
- AdamW
- 学习率调度

---

## 🧠 DL - 深度学习

### 一、神经网络基础
- 什么是神经网络
- 感知机与多层感知机
- 激活函数（Sigmoid, Tanh, ReLU, Leaky ReLU, GELU）
- 损失函数
- 反向传播算法
- 梯度消失与梯度爆炸

### 二、卷积神经网络 (CNN)
- 卷积操作
- 池化层（最大池化、平均池化）
- 经典架构
  - LeNet
  - AlexNet
  - VGG
  - GoogLeNet (Inception)
  - ResNet
  - DenseNet
  - EfficientNet
  - MobileNet
  - ShuffleNet
- 批归一化 (BatchNorm)
- 层归一化 (LayerNorm)
- Dropout
- 残差连接
- 空洞卷积
- 深度可分离卷积

### 三、循环神经网络 (RNN)
- RNN 基础
- LSTM
- GRU
- 双向 RNN
- Seq2Seq 模型
- Attention 机制

### 四、Transformer 架构
- Self-Attention
- Multi-Head Attention
- Positional Encoding
- Encoder-Decoder 架构
- LayerNorm vs RMSNorm
- Feed-Forward Network
- Causal Attention
- Masked Attention

### 五、生成模型
- 自编码器 (Autoencoder)
- 变分自编码器 (VAE)
- 生成对抗网络 (GAN)
- CycleGAN
- StyleGAN
- Diffusion Models
  - DDPM
  - DDIM
  - Stable Diffusion
  - ControlNet
  - LoRA for Diffusion

### 六、训练技术
- 权重初始化
- 学习率预热
- 梯度裁剪
- 混合精度训练
- 早停法
- 数据增强
- 迁移学习
- 微调策略
- 冻结层

---

## 📝 NLP - 自然语言处理

### 一、基础概念
- 什么是 NLP
- NLP 应用场景
- 文本预处理

### 二、词表示
- **传统方法**
  - One-Hot 编码
  - TF-IDF
- **词向量**
  - Word2Vec (CBOW, Skip-gram)
  - GloVe
  - FastText
- **上下文词向量**
  - ELMo
  - BERT
  - GPT 系列
  - T5
  - XLNet

### 三、文本分类
- 情感分析
- 主题分类
- 多标签分类

### 四、序列标注
- 词性标注 (POS)
- 命名实体识别 (NER)
- 条件随机场 (CRF)

### 五、文本生成
- 语言模型
- 文本摘要
- 机器翻译
- 对话系统

### 六、Tokenization
- 基于词的分词
- 基于字符的分词
- 子词分词
  - BPE
  - WordPiece
  - SentencePiece

---

## 👁️ CV - 计算机视觉

### 一、基础概念
- 数字图像基础
- 图像预处理
- 卷积操作

### 二、图像分类
- 经典架构（见 DL 部分）
- 迁移学习
- 数据增强

### 三、目标检测
- **Two-Stage**
  - R-CNN
  - Fast R-CNN
  - Faster R-CNN
  - Mask R-CNN
- **One-Stage**
  - YOLO 系列
  - SSD
  - RetinaNet
  - FCOS
- **Transformer-based**
  - DETR
  - Swin Transformer

### 四、图像分割
- **语义分割**
  - FCN
  - U-Net
  - DeepLab 系列
  - PSPNet
- **实例分割**
  - Mask R-CNN
- **最新进展**
  - SAM (Segment Anything)

### 五、生成模型
- VAE
- GAN
- CycleGAN
- StyleGAN
- Diffusion Models
  - DDPM
  - Stable Diffusion
  - ControlNet

### 六、3D 视觉
- NeRF
- 3D Gaussian Splatting

### 七、最新进展
- SAM-Frontier
- Grounding DINO
- Segment Anything 2

---

## 🤖 LLM - 大语言模型

### 一、基础架构
- Transformer 详解
- Self-Attention 机制
- Multi-Head Attention
- Positional Encoding
  - 绝对位置编码
  - 相对位置编码
  - RoPE
- LayerNorm & RMSNorm
- Feed-Forward Network
- Encoder-Decoder 架构
- Decoder-only 架构

### 二、训练技术
- **预训练**
  - 数据清洗
  - 分布式训练
  - 混合精度训练
- **微调**
  - 全量微调
  - 参数高效微调
    - LoRA
    - QLoRA
    - Prefix Tuning
    - P-Tuning
    - Adapter
    - IA3
    - DoRA
    - ReLoRA

### 三、对齐技术
- RLHF (Reinforcement Learning from Human Feedback)
- DPO (Direct Preference Optimization)
- PPO (Proximal Policy Optimization)
- IPO
- SimPO
- KTO

### 四、推理优化
- **KV Cache**
- **解码优化**
  - Continuous Batching
  - Speculative Decoding
  - Prompt Cache
  - Activation Cache
- **量化**
  - INT8/INT4 量化
  - AWQ
  - GPTQ
  - SmoothQuant
- **并行技术**
  - 张量并行
  - 流水线并行

### 五、应用开发
- **Prompt Engineering**
  - Zero-shot Prompting
  - Few-shot Prompting
  - Chain of Thought
  - ReAct
- **RAG (检索增强生成)**
- **Agent 开发**
  - Function Calling
  - Tool Use
  - Multi-Agent 协作
  - 记忆系统
- **评估方法**

### 六、模型架构演进
- MoE (Mixture of Experts)
- Switch Transformer
- Mixtral
- Mamba
- SSM (State Space Models)
- RWKV
- RetNet
- Hyena
- Jamba
- Ring Attention

---

## 🎯 RecSys - 推荐系统

### 一、基础概念
- 推荐系统概述
- 推荐系统评估指标

### 二、协同过滤
- User-based CF
- Item-based CF
- 矩阵分解
  - SVD
  - SVD++
  - NMF

### 三、召回算法
- 基于内容的召回
- 协同过滤召回
- 双塔模型
- YouTube DNN
- Facebook Embedding-based Retrieval

### 四、排序算法
- **传统方法**
  - 逻辑回归
  - 因子分解机 (FM)
  - 梯度提升树 (GBDT)
- **深度学习方法**
  - Wide & Deep
  - DeepFM
  - DIN (Deep Interest Network)
  - DIEN
  - MMOE
  - ESSM

### 五、重排与多样性
- 重排策略
- 多样性保证
- 探索与利用

---

## 🎮 RL - 强化学习

### 一、基础概念
- 什么是强化学习
- MDP (马尔可夫决策过程)
- 贝尔曼方程
- 策略优化方法

### 二、价值方法
- 价值迭代算法
- Q-Learning
- SARSA
- DQN (Deep Q-Network)
- Double DQN
- Dueling DQN

### 三、策略梯度方法
- REINFORCE
- 策略梯度定理
- Actor-Critic
- A2C/A3C
- PPO (Proximal Policy Optimization)
- TRPO

### 四、模型预测控制
- 模型预测控制 (MPC)
- 基于模型的学习

### 五、高级主题
- 部分可观测 MDP (POMDP)
- Monte Carlo 方法
- Temporal Difference 学习
- Eligibility Traces
- 多智能体强化学习
- 模仿学习
- 逆强化学习
- 元强化学习

### 六、应用
- Sim-to-Real 迁移
- 梯度约束优化
- 安全强化学习
- 鲁棒强化学习
- 大模型强化学习
- 工业界应用案例

---

## ⚙️ System - AI 工程化

### 一、模型部署
- 模型格式转换 (ONNX, TensorRT)
- 模型优化
- 边缘部署
- 云端部署

### 二、MLOps
- 持续集成/持续部署 (CI/CD)
- 模型监控
- A/B 测试
- 特征存储

### 三、系统设计
- 大规模机器学习系统设计
- 推荐系统设计
- 实时预测系统
- 分布式训练系统

### 四、性能优化
- GPU 优化
- 内存优化
- 推理加速
- 批处理优化

---

## 🛠️ AI-Engineering - AI 工程与实践

### 一、Agent 开发
- Agent 架构设计
- 单 Agent 开发实践
- 多 Agent 协作系统
- Agent 记忆机制
- Agent 工具使用

### 二、开发方法论
- SDD (技能驱动开发)
- TDD (测试驱动开发)
- ATDD (验收测试驱动开发)
- OMO (开放心智操作)

### 三、AI 项目开发
- AI 项目开发流程
- 需求分析
- 技术选型策略
- 开发环境配置

### 四、工具链
- OpenCode 使用指南
- Cursor AI 编程
- Windsurf 实践
- AI 辅助开发最佳实践

### 五、前沿技术
- AI 技术趋势分析
- 最新论文解读方法
- OpenClaw 架构详解
- OpenClaw 技能开发指南

---

## 📋 内容创作优先级

### Phase 1 - 核心基础 (高优先级)
1. **ML** - 所有基础算法
2. **DL** - 神经网络基础、CNN、RNN、Transformer
3. **LLM** - Transformer 架构、Attention 机制、Prompt Engineering

### Phase 2 - 热门领域 (中优先级)
1. **LLM** - RAG、Agent 开发、微调技术
2. **CV** - 目标检测、图像分割、生成模型
3. **NLP** - 词向量、BERT、GPT

### Phase 3 - 进阶内容 (低优先级)
1. **RecSys** - 召回排序算法
2. **RL** - 基础算法
3. **System** - 部署与 MLOps
4. **AI-Engineering** - Agent 开发、工具链

---

**最后更新**: 2026-03-30
**版本**: v1.0
