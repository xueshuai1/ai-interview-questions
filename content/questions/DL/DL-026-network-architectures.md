# DL-026 ⭐⭐⭐ Explain Different Types of Neural Network Architectures

## Question
What are the main types of neural network architectures? Explain their characteristics and use cases.

## Answer

### Overview
Different architectures are designed for different types of data and tasks.

---

## 1. Feedforward Neural Networks (FNN)
```
Structure: Input → Hidden → Output (no loops)
Use cases: Tabular data, simple classification
Limitations: No memory, fixed input size
```

## 2. Convolutional Neural Networks (CNN)
```
Structure: Conv → Pool → FC layers
Use cases: Images, spatial data, video
Key features: Local connectivity, parameter sharing
Examples: LeNet, AlexNet, VGG, ResNet
```

## 3. Recurrent Neural Networks (RNN)
```
Structure: Loops for sequential processing
Use cases: Time series, text, speech
Variants: LSTM, GRU
Limitations: Sequential, vanishing gradients
```

## 4. Transformers
```
Structure: Self-attention, no recurrence
Use cases: NLP, vision, multimodal
Advantages: Parallel, long-range dependencies
Examples: BERT, GPT, ViT
```

## 5. Autoencoders
```
Structure: Encoder → Bottleneck → Decoder
Use cases: Dimensionality reduction, denoising, generation
Variants: VAE, Denoising AE
```

## 6. Generative Adversarial Networks (GAN)
```
Structure: Generator vs Discriminator
Use cases: Image generation, translation
Examples: DCGAN, StyleGAN, CycleGAN
```

## 7. Graph Neural Networks (GNN)
```
Structure: Message passing on graphs
Use cases: Social networks, molecules, knowledge graphs
```

---

## Architecture Selection Guide

| Data Type | Recommended Architecture |
|-----------|-------------------------|
| Tabular | FNN, XGBoost |
| Images | CNN, ViT |
| Text | Transformer, RNN |
| Time Series | RNN, Transformer, TCN |
| Graph | GNN |
| Generation | GAN, VAE, Diffusion |

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Neural Network Architectures
## Tags: [architectures, CNN, RNN, transformer, GAN, FNN]
