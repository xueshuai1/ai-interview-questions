# DL-013 ⭐⭐⭐ Explain Weight Initialization Techniques in Neural Networks

## Question
Why is weight initialization important? Compare different weight initialization techniques and their use cases.

## Answer

### Why Weight Initialization Matters

**Poor Initialization Problems:**
```
All weights = 0:
- All neurons compute same output
- All gradients identical
- Symmetry never broken
- Network learns nothing!

Weights too large:
- Activations saturate (sigmoid/tanh → 0 or 1)
- Gradients vanish
- Training stalls

Weights too small:
- Activations near zero
- Gradients tiny
- Very slow convergence
```

**Good Initialization Benefits:**
```
✅ Breaks symmetry (different neurons learn different features)
✅ Keeps activations in reasonable range
✅ Prevents vanishing/exploding gradients
✅ Faster convergence
✅ Better final performance
```

---

## Common Initialization Techniques

## 1. Zero Initialization ❌
```python
W = np.zeros(shape)
```

**Why It Fails:**
- All neurons identical
- Same gradients during backprop
- No symmetry breaking
- Equivalent to linear model

**Never use for weights!** (OK for biases)

---

## 2. Random Initialization (Uniform/Normal)
```python
# Uniform
W = np.random.uniform(-0.05, 0.05, shape)

# Normal (Gaussian)
W = np.random.normal(0, 0.01, shape)
```

**Pros:**
- Breaks symmetry
- Simple to implement

**Cons:**
- Manual tuning of scale required
- May cause vanishing/exploding gradients in deep networks

**Use Case:** Shallow networks, quick prototyping

---

## 3. Xavier/Glorot Initialization (2010) ⭐

**Designed for:** Sigmoid and Tanh activations

**Idea:** Keep variance of activations and gradients constant across layers

### Xavier Uniform
```python
limit = √(6 / (fan_in + fan_out))
W = np.random.uniform(-limit, limit, shape)

Where:
- fan_in: Number of input neurons
- fan_out: Number of output neurons
```

### Xavier Normal
```python
std = √(2 / (fan_in + fan_out))
W = np.random.normal(0, std, shape)
```

**Why It Works:**
```
Variance of outputs = Variance of inputs
Prevents signals from shrinking or exploding
Optimal for symmetric activations (tanh, sigmoid)
```

**PyTorch:**
```python
nn.init.xavier_uniform_(weight)
nn.init.xavier_normal_(weight)
```

---

## 4. He/Kaiming Initialization (2015) ⭐⭐

**Designed for:** ReLU and its variants

**Idea:** Account for ReLU's non-linearity (kills half the neurons)

### He Uniform
```python
limit = √(6 / fan_in)
W = np.random.uniform(-limit, limit, shape)
```

### He Normal (Most Common)
```python
std = √(2 / fan_in)
W = np.random.normal(0, std, shape)
```

**Why Different from Xavier?**
```
ReLU sets negative values to zero
Effectively halves the variance
Compensate by multiplying variance by 2

Xavier: std = √(2 / (fan_in + fan_out))
He:     std = √(2 / fan_in)  ← Only fan_in, larger variance
```

**PyTorch:**
```python
nn.init.kaiming_uniform_(weight, mode='fan_in', nonlinearity='relu')
nn.init.kaiming_normal_(weight, mode='fan_in', nonlinearity='relu')
```

---

## 5. LeCun Initialization (1990)

**Designed for:** SELU activation (self-normalizing networks)

```python
std = √(1 / fan_in)
W = np.random.normal(0, std, shape)
```

**Use Case:** SELU activation with AlphaDropout

---

## 6. Orthogonal Initialization

**Idea:** Initialize weight matrix as orthogonal (random orthogonal matrix)

```python
W = orthogonal_matrix(shape)
Where: WᵀW = WWᵀ = I
```

**Benefits:**
- Preserves norm of gradients
- Excellent for RNNs (prevents vanishing/exploding)
- Good for very deep networks

**PyTorch:**
```python
nn.init.orthogonal_(weight)
```

**Use Case:** RNNs, very deep networks, GANs

---

## 7. Sparse Initialization

**Idea:** Initialize most weights to zero, few to non-zero values

```python
W = np.zeros(shape)
for i in range(num_nonzero):
    W[random_idx] = np.random.normal(0, 0.01)
```

**Use Case:** Very large, sparse networks (rarely used now)

---

## Initialization Comparison Table

| Method | Formula (std) | Best For | Activation |
|--------|--------------|----------|------------|
| **Random** | 0.01 (manual) | Shallow networks | Any |
| **Xavier** | √(2/(fan_in + fan_out)) | FC, shallow | Tanh, Sigmoid |
| **He** | √(2/fan_in) | **Most common** | **ReLU, variants** |
| **LeCun** | √(1/fan_in) | SELU networks | SELU |
| **Orthogonal** | Orthogonal matrix | RNNs, very deep | Any |

---

## Activation Function Guidelines

### For ReLU and Variants (Most Common)
```python
# Use He initialization
nn.init.kaiming_normal_(weight, nonlinearity='relu')
```

### For Tanh/Sigmoid
```python
# Use Xavier initialization
nn.init.xavier_normal_(weight)
```

### For Linear/No Activation
```python
# Xavier works well
nn.init.xavier_normal_(weight)
```

### For SELU
```python
# Use LeCun initialization with normal
nn.init.normal_(weight, mean=0, std=np.sqrt(1/fan_in))
```

---

## Bias Initialization

### Standard Practice
```python
biases = torch.zeros(size)  # Initialize to zero
```

**Why Zero is OK for Biases:**
- Doesn't break symmetry (weights already randomized)
- No gradient issues
- Simple and effective

### Exceptions
```python
# For ReLU: Sometimes initialize to small positive (0.01)
# Prevents "dying ReLU" initially

# For specific architectures: Follow paper recommendations
```

---

## Practical Examples

### CNN with ReLU (Most Common)
```python
class CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 64, 3)
        self.conv2 = nn.Conv2d(64, 128, 3)
        self.fc1 = nn.Linear(128*6*6, 256)
        self.fc2 = nn.Linear(256, 10)
        
        # Initialize weights
        for m in self.modules():
            if isinstance(m, nn.Conv2d) or isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity='relu')
                nn.init.zeros_(m.bias)  # Zero bias
```

### RNN with Tanh
```python
class RNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.rnn = nn.LSTM(input_size=100, hidden_size=256)
        
        # Orthogonal initialization for recurrent weights
        for name, param in self.rnn.named_parameters():
            if 'weight_ih' in name:
                nn.init.xavier_uniform_(param)
            elif 'weight_hh' in name:
                nn.init.orthogonal_(param)
            elif 'bias' in name:
                nn.init.zeros_(param)
```

### Transformer
```python
# Transformer uses Xavier for most layers
for p in model.parameters():
    if p.dim() > 1:
        nn.init.xavier_uniform_(p)
```

---

## Common Mistakes

### ❌ Using Wrong Initialization for Activation
```python
# WRONG: Xavier with ReLU
nn.init.xavier_normal_(weight)  # For ReLU!
activation = nn.ReLU()

# CORRECT: He with ReLU
nn.init.kaiming_normal_(weight, nonlinearity='relu')
```

### ❌ Not Initializing Biases
```python
# Biases left uninitialized (random garbage values)
# Always initialize biases explicitly
nn.init.zeros_(bias)
```

### ❌ Same Initialization for All Layers
```python
# Different layers may need different initialization
# Deep networks: Consider layer-wise scaling
```

---

## Advanced Topics

### Layer-Wise Scaling
```
Very deep networks: Scale initialization by layer depth
Example: Multiply std by √(1/layer_depth)
```

### Data-Dependent Initialization
```
Use small batch of data to set initial scale
Match activation variance to data variance
```

### Learned Initialization
```
Meta-learning approaches to learn optimal initialization
Still research area
```

## Key Takeaways
- Weight initialization critical for successful training
- **He initialization** is default choice for ReLU networks
- **Xavier initialization** for Tanh/Sigmoid
- **Orthogonal initialization** for RNNs
- Initialize biases to zero
- Match initialization to activation function
- Poor initialization causes vanishing/exploding gradients

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Model Training
## Tags: [weight-initialization, he, xavier, training, neural-networks]
