# DL-004 ⭐⭐⭐ Compare Activation Functions: Sigmoid, Tanh, ReLU, and Softmax

## Question
What are activation functions? Compare Sigmoid, Tanh, ReLU, and Softmax activation functions, including their advantages, disadvantages, and use cases.

## Answer

### What are Activation Functions?
**Activation functions** introduce non-linearity into neural networks, enabling them to learn complex patterns and approximate any function. Without activation functions, neural networks would be equivalent to a single linear layer, regardless of depth.

### Mathematical Properties
An activation function f(x) transforms the weighted sum:
```
output = f(Σwᵢxᵢ + b)
```

### Comparison of Activation Functions

## 1. Sigmoid (Logistic Function)

**Formula:** `σ(x) = 1 / (1 + e⁻ˣ)`

**Output Range:** (0, 1)

**Graph Shape:** S-shaped curve

### Advantages
✅ Smooth gradient, differentiable everywhere
✅ Output bounded between 0 and 1 (interpretable as probability)
✅ Historically significant, well-understood

### Disadvantages
❌ **Vanishing Gradient**: Gradients approach 0 for extreme values
❌ **Not Zero-Centered**: Output always positive, causes zigzag updates
❌ **Computationally Expensive**: Exponential operations
❌ **Saturates**: Loses sensitivity for large |x|

### Use Cases
- Binary classification output layer
- Probability estimation
- Gating mechanisms in LSTM/GRU

### Code
```python
def sigmoid(x):
    return 1 / (1 + np.exp(-x))
```

---

## 2. Tanh (Hyperbolic Tangent)

**Formula:** `tanh(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)`

**Output Range:** (-1, 1)

**Graph Shape:** S-shaped curve through origin

### Advantages
✅ **Zero-Centered**: Output centered at 0, better convergence
✅ Stronger gradients than sigmoid (steeper)
✅ Smooth and differentiable

### Disadvantages
❌ Still suffers from vanishing gradient
❌ Computationally expensive (exponential)
❌ Saturates for large |x|

### Use Cases
- Hidden layers in RNNs
- When zero-centered output is beneficial
- Binary classification (alternative to sigmoid)

### Code
```python
def tanh(x):
    return np.tanh(x)  # or (np.exp(x) - np.exp(-x)) / (np.exp(x) + np.exp(-x))
```

---

## 3. ReLU (Rectified Linear Unit)

**Formula:** `ReLU(x) = max(0, x)`

**Output Range:** [0, ∞)

**Graph Shape:** Linear for x>0, zero for x≤0

### Advantages
✅ **No Vanishing Gradient** (for positive values)
✅ **Computationally Efficient**: Simple threshold operation
✅ **Faster Convergence**: Linear, non-saturating for x>0
✅ **Sparse Activation**: Many neurons output zero (efficient)

### Disadvantages
❌ **Dying ReLU**: Neurons can "die" (always output 0)
❌ **Not Zero-Centered**: Output always non-negative
❌ **Unbounded**: Output can grow infinitely
❌ Gradient is 0 for x<0 (no learning for negative inputs)

### Use Cases
- **Default choice for hidden layers** in most networks
- CNNs (convolutional layers)
- Deep feedforward networks

### Code
```python
def relu(x):
    return np.maximum(0, x)
```

### ReLU Variants

| Variant | Formula | Improvement |
|---------|---------|-------------|
| **Leaky ReLU** | max(αx, x) | Small gradient for x<0 |
| **Parametric ReLU** | max(αx, x), α learned | Learns negative slope |
| **ELU** | x if x>0, α(eˣ-1) otherwise | Smooth negative region |
| **GELU** | x × Φ(x) | Used in Transformers |

---

## 4. Softmax

**Formula:** `softmax(xᵢ) = eˣⁱ / Σⱼeˣʲ`

**Output Range:** (0, 1), sum = 1

**Graph Shape:** Normalized exponential distribution

### Advantages
✅ **Probability Distribution**: Outputs sum to 1
✅ **Multi-class Classification**: Natural fit for multiple classes
✅ **Differentiable**: Works with backpropagation

### Disadvantages
❌ **Computationally Expensive**: Exponential operations
❌ **Numerical Instability**: Can overflow with large values
❌ Only for output layer (not hidden layers)

### Use Cases
- **Multi-class classification output layer**
- When you need probability distribution over classes
- Attention mechanisms in Transformers

### Code
```python
def softmax(x):
    exp_x = np.exp(x - np.max(x))  # Subtract max for numerical stability
    return exp_x / np.sum(exp_x)
```

---

## Comparison Table

| Property | Sigmoid | Tanh | ReLU | Softmax |
|----------|---------|------|------|---------|
| **Output Range** | (0, 1) | (-1, 1) | [0, ∞) | (0, 1), Σ=1 |
| **Zero-Centered** | ❌ No | ✅ Yes | ❌ No | ❌ No |
| **Vanishing Gradient** | ❌ Severe | ❌ Moderate | ✅ Minimal | ❌ Moderate |
| **Computation** | Expensive | Expensive | Cheap | Expensive |
| **Sparse Output** | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **Best For** | Binary output | RNN hidden | Hidden layers | Multi-class output |
| **Default Choice** | ❌ | ❌ | ✅ | For multi-class |

---

## Practical Recommendations

### For Hidden Layers
```
Priority: ReLU > Leaky ReLU > Tanh > Sigmoid
```
- **Start with ReLU** for most architectures
- Use **Leaky ReLU** if dying ReLU is observed
- Use **Tanh** for RNNs (historical choice)
- Avoid **Sigmoid** in hidden layers

### For Output Layers
```
Binary Classification: Sigmoid
Multi-class Classification: Softmax
Regression: Linear (no activation)
```

### Modern Trends
- **Transformers**: GELU activation
- **Very Deep Networks**: ReLU variants with skip connections
- **RNNs**: Tanh/ReLU with gating (LSTM/GRU)

## Key Takeaways
- Activation functions introduce non-linearity essential for learning
- ReLU is the default choice for hidden layers (efficient, no vanishing gradient)
- Sigmoid for binary output, Softmax for multi-class output
- Tanh is zero-centered but suffers from vanishing gradients
- Choose activation based on layer type and task requirements

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Neural Network Components
## Tags: [activation-functions, sigmoid, tanh, relu, softmax, comparison]
