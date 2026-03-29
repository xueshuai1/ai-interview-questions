# DL-019 ⭐⭐⭐ What are Transformers? Explain Architecture and Applications

## Question
What is the Transformer architecture? Explain its components, how it differs from RNNs, and its applications.

## Answer

### What is a Transformer?
**Transformer** is a neural network architecture introduced in "Attention Is All You Need" (Vaswani et al., 2017) that relies entirely on attention mechanisms, dispensing with recurrence and convolutions. It has become the foundation for modern NLP and is expanding to vision, speech, and multimodal tasks.

### Key Innovation
```
RNN/CNN/LSTM: Sequential processing or local connections
Transformer: Global attention between all positions

Result:
- Better long-range dependency modeling
- Highly parallelizable
- State-of-the-art performance
```

---

## Transformer Architecture Overview

### Encoder-Decoder Structure
```
┌─────────────────────────────────────────────────┐
│  DECODER                                        │
│  ┌──────────────┐                               │
│  │ Masked       │                               │
│  │ Self-Attn    │                               │
│  ├──────────────┤                               │
│  │ Cross-Attn   │ ← attends to encoder output   │
│  ├──────────────┤                               │
│  │ Feed Forward │                               │
│  └──────────────┘                               │
├─────────────────────────────────────────────────┤
│  ENCODER                                        │
│  ┌──────────────┐                               │
│  │ Self-Attn    │ ← attends to all positions    │
│  ├──────────────┤                               │
│  │ Feed Forward │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

---

## Transformer Components

## 1. Input Embedding
```
Tokens → Embedding Matrix → Vector representations

Example:
"Hello world" → [101, 2054] → [512-dim vectors]
```

## 2. Positional Encoding
```
Problem: Self-attention has no notion of order
Solution: Add position information to embeddings

Encoding:
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

Added to input embeddings:
Input = Token_Embedding + Positional_Encoding
```

### Why Sinusoidal?
```
- Allows model to learn relative positions
- Can generalize to sequence lengths not seen in training
- Alternative: Learnable positional embeddings
```

## 3. Multi-Head Self-Attention

### Scaled Dot-Product Attention
```
Attention(Q, K, V) = softmax(QKᵀ / √d_k) × V
```

### Multi-Head Extension
```
MultiHead(Q, K, V) = Concat(head₁, ..., headₕ) × W_O

Each head: headᵢ = Attention(QW_Qᵢ, KW_Kᵢ, VW_Vᵢ)

Typical: 8 or 16 heads, 64 dimensions per head
```

## 4. Add & Norm (Residual + LayerNorm)
```
Output = LayerNorm(x + Sublayer(x))

Where:
- x: Input to sublayer
- Sublayer: Attention or Feed Forward
- Residual connection helps gradient flow
- LayerNorm stabilizes training
```

## 5. Feed Forward Network
```
FFN(x) = max(0, xW₁ + b₁)W₂ + b₂

Two linear transformations with ReLU activation
Applied position-wise (same FFN for each position)
```

## 6. Output Layer
```
Final representation → Linear → Softmax → Probabilities

For language modeling:
Predicts next token probability distribution
```

---

## Encoder vs Decoder

### Transformer Encoder
```
Purpose: Understand input sequence

Structure:
Input → Embedding + PosEnc → [Self-Attn → Add&Norm → FFN → Add&Norm] × N

Attention: Full (can see all positions)
Use cases: BERT, encoding tasks
```

### Transformer Decoder
```
Purpose: Generate output sequence

Structure:
Input → Embedding + PosEnc → [Masked Self-Attn → Cross-Attn → FFN] × N → Output

Attention: 
- Masked self-attention (can only see past)
- Cross-attention (attends to encoder)
Use cases: GPT, language generation
```

---

## Transformer vs RNN

| Aspect | RNN/LSTM | Transformer |
|--------|----------|-------------|
| **Processing** | Sequential | Parallel |
| **Long Dependencies** | Limited (vanishing gradient) | Excellent (direct attention) |
| **Training Speed** | Slow (can't parallelize) | Fast (fully parallel) |
| **Memory** | O(1) per step | O(n²) for attention |
| **Position** | Implicit (order preserved) | Explicit (positional encoding) |
| **Context** | Fixed (hidden state) | Dynamic (attention weights) |

### Speed Comparison
```
Training on same task:
RNN: 10 days
Transformer: 1 day (10× faster!)
```

---

## Transformer Variants

### Encoder-Only (BERT-style)
```
Architecture: Encoder stack only
Training: Masked language modeling
Use cases: Text classification, NER, QA
Examples: BERT, RoBERTa, DistilBERT
```

### Decoder-Only (GPT-style)
```
Architecture: Decoder stack only
Training: Causal language modeling (predict next token)
Use cases: Text generation, chatbots
Examples: GPT-2, GPT-3, GPT-4, LLaMA
```

### Encoder-Decoder (Original)
```
Architecture: Both encoder and decoder
Training: Sequence-to-sequence
Use cases: Translation, summarization
Examples: Original Transformer, T5, BART
```

---

## Applications

### 1. Natural Language Processing
| Task | Model | Description |
|------|-------|-------------|
| **Text Classification** | BERT | Sentiment, topic, spam detection |
| **Named Entity Recognition** | BERT | Extract names, places, dates |
| **Question Answering** | BERT, T5 | Answer questions from context |
| **Machine Translation** | Transformer | Translate between languages |
| **Text Generation** | GPT | Generate articles, stories, code |
| **Summarization** | BART, T5 | Create summaries of long text |

### 2. Computer Vision
| Model | Description |
|-------|-------------|
| **ViT (Vision Transformer)** | Image classification with transformers |
| **DETR** | Object detection with transformers |
| **Segment Anything** | Image segmentation |

### 3. Multimodal
| Model | Description |
|-------|-------------|
| **CLIP** | Image-text understanding |
| **DALL-E** | Text-to-image generation |
| **Flamingo** | Visual language model |

### 4. Speech
| Model | Description |
|-------|-------------|
| **Whisper** | Speech recognition |
| **AudioLM** | Audio generation |

---

## Why Transformers Dominated

### 1. Scalability
```
More data + more parameters = better performance
Law holds even at massive scale (GPT-3: 175B params)
```

### 2. Transfer Learning
```
Pretrain on massive data → Fine-tune on specific tasks
One model, many applications
```

### 3. Parallelization
```
Train on hundreds of GPUs efficiently
Much faster than RNNs
```

### 4. Performance
```
State-of-the-art on most NLP benchmarks
Expanding to vision, speech, science
```

---

## Limitations

### 1. Computational Complexity
```
Self-attention: O(n²) memory and time
Long sequences become expensive

Solutions: Sparse attention, linear attention
```

### 2. Data Hungry
```
Needs massive pretraining data
Not suitable for low-resource settings without fine-tuning
```

### 3. Fixed Context Window
```
Can only attend to tokens within window
GPT-4: ~128K tokens max

Solutions: Sliding window, memory mechanisms
```

### 4. Lack of True Understanding
```
Statistical patterns, not reasoning
Can make logical errors
```

---

## Code Example (Hugging Face)

```python
from transformers import AutoModel, AutoTokenizer

# Load pretrained transformer
model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Tokenize input
text = "Hello, I'm a transformer!"
inputs = tokenizer(text, return_tensors="pt")

# Forward pass
outputs = model(**inputs)

# Get contextualized representations
last_hidden_states = outputs.last_hidden_state
# Shape: (batch, seq_len, hidden_dim)
```

## Key Takeaways
- Transformers use self-attention instead of recurrence
- Fully parallelizable, much faster than RNNs
- Encoder-decoder, encoder-only, or decoder-only variants
- Foundation of modern LLMs (BERT, GPT, etc.)
- Applications: NLP, vision, speech, multimodal
- Limitations: O(n²) complexity, data hungry
- Dominant architecture in modern deep learning

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Neural Network Architectures
## Tags: [transformer, attention, NLP, BERT, GPT, architecture]
