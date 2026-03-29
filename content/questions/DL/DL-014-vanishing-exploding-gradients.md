# DL-014 ⭐⭐⭐ What are Vanishing and Exploding Gradients? How to Fix Them?

## Question
Explain the vanishing and exploding gradient problems. What causes them and how can they be solved?

## Answer

### The Problems

## Vanishing Gradient
**Definition:** Gradients become extremely small during backpropagation, preventing weights from updating effectively.

```
Gradient at layer 1: 0.0000001  ← Too small!
Weight update: negligible
Layer never learns
```

## Exploding Gradient
**Definition:** Gradients become extremely large, causing unstable updates and numerical overflow.

```
Gradient at layer 1: 1000000  ← Too large!
Weight update: huge
Training becomes unstable, NaN values
```

---

## Root Cause: Chain Rule Multiplication

### Backpropagation Mathematics
```
For a network with L layers:

∂L/∂W₁ = ∂L/∂aₗ × ∂aₗ/∂zₗ × ∂zₗ/∂aₗ₋₁ × ... × ∂a₂/∂z₂ × ∂z₂/∂W₁

This is a product of L-1 terms!
```

### Vanishing Gradient Example
```
Using sigmoid activation:
- Sigmoid derivative: max value = 0.25
- For 10 layers: (0.25)¹⁰ = 0.00000095  ← Vanishes!
- For 20 layers: (0.25)²⁰ = 0.0000000000009  ← Gone!

Each layer multiplies by <1, gradient shrinks exponentially
```

### Exploding Gradient Example
```
Large weights (e.g., W > 1):
- For 10 layers: (2.0)¹⁰ = 1024  ← Explodes!
- For 20 layers: (2.0)²⁰ = 1,048,576  ← Overflow!

Each layer multiplies by >1, gradient grows exponentially
```

---

## Symptoms

### Vanishing Gradient
```
✓ Early layers learn very slowly or not at all
✓ Training loss decreases very slowly
✓ Early layer weights barely change
✓ Network behaves like shallow network
✓ Common in: RNNs, deep networks with sigmoid/tanh
```

### Exploding Gradient
```
✓ Loss becomes NaN or Inf
✓ Weights become extremely large
✓ Training is unstable, oscillates wildly
✓ Gradients have huge norms
✓ Common in: RNNs, poorly initialized networks
```

---

## Solutions

## 1. Better Activation Functions

### ReLU (Most Effective)
```
f(x) = max(0, x)
f'(x) = 1 for x > 0, 0 for x ≤ 0

Derivative is 1 (not <1 like sigmoid)
Gradients flow freely for positive activations
```

### Leaky ReLU
```
f(x) = max(αx, x) where α is small (e.g., 0.01)
Prevents "dying ReLU" problem
Small gradient even for negative values
```

### Comparison
```
Sigmoid derivative: 0 to 0.25  ← Vanishes!
Tanh derivative:    0 to 1.0   ← Better but still vanishes
ReLU derivative:    0 or 1     ← No vanishing for positive!
```

---

## 2. Proper Weight Initialization

### He Initialization (for ReLU)
```
std = √(2 / fan_in)

Keeps variance constant across layers
Prevents gradients from shrinking/growing
```

### Xavier Initialization (for Tanh/Sigmoid)
```
std = √(2 / (fan_in + fan_out))

Optimal for symmetric activations
```

### Orthogonal Initialization (for RNNs)
```
Initialize weight matrix as orthogonal
Preserves gradient norm
Excellent for recurrent connections
```

---

## 3. Batch Normalization
```
Normalizes activations to zero mean, unit variance
Keeps gradients in reasonable range
Allows stable training of very deep networks

Placement: After convolution/linear, before activation
```

---

## 4. Gradient Clipping (for Exploding Gradients)

### Method
```python
# Clip gradient norm
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# Or clip gradient values
torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=1.0)
```

### How It Works
```
If ||gradient|| > max_norm:
    gradient = gradient × (max_norm / ||gradient||)

Caps gradient magnitude without changing direction
```

### Use Cases
- RNNs (especially LSTMs/GRUs)
- When exploding gradients observed
- Standard practice in sequence modeling

---

## 5. Skip Connections / Residual Connections

### ResNet Architecture
```
Traditional:     x → Conv → ReLU → Conv → ReLU → y

Residual:        x → Conv → ReLU → Conv → (+) → ReLU → y
                 └──────────────────────↑
                 (identity skip connection)

Mathematically: y = F(x) + x
```

### Why It Helps
```
Backpropagation:
∂L/∂x = ∂L/∂y × (∂F/∂x + 1)

The "+1" provides direct gradient path!
Gradient can flow through skip connection unchanged
Enables training of 100+ layer networks
```

---

## 6. LSTM/GRU instead of Vanilla RNN

### Vanilla RNN Problem
```
hₜ = tanh(W×xₜ + U×hₜ₋₁)

Gradient must flow through tanh at each step
Vanishes quickly for long sequences
```

### LSTM Solution
```
Cell state Cₜ acts as "gradient highway"
Gating mechanisms control information flow
Gradients can flow through cell state unchanged
Can learn dependencies over 100+ time steps
```

---

## 7. Careful Network Architecture Design

### Guidelines
```
✓ Don't make networks unnecessarily deep
✓ Use batch normalization in deep networks
✓ Use residual connections for very deep networks
✓ Monitor gradient norms during training
✓ Start with proven architectures (ResNet, etc.)
```

### Layer-wise Learning Rates
```
Early layers: Lower learning rate
Later layers: Higher learning rate

Helps when early layers learn slower
```

---

## Detection and Monitoring

### Monitor Gradient Norms
```python
for name, param in model.named_parameters():
    if param.grad is not None:
        grad_norm = param.grad.data.norm(2)
        print(f"{name}: gradient norm = {grad_norm}")
        
# Healthy: 0.01 to 10
# Vanishing: < 0.001
# Exploding: > 100
```

### Visualization
```
Plot gradient norms by layer:
Layer 1:  0.0001  ← Vanishing!
Layer 5:  0.01
Layer 10: 1.0

Should be roughly equal across layers
```

---

## Solution Summary Table

| Problem | Solutions | Priority |
|---------|-----------|----------|
| **Vanishing** | ReLU activation | ⭐⭐⭐ |
| **Vanishing** | He/Xavier initialization | ⭐⭐⭐ |
| **Vanishing** | Batch normalization | ⭐⭐⭐ |
| **Vanishing** | Skip/residual connections | ⭐⭐⭐ |
| **Vanishing** | LSTM/GRU (for RNNs) | ⭐⭐⭐ |
| **Exploding** | Gradient clipping | ⭐⭐⭐ |
| **Exploding** | Proper initialization | ⭐⭐ |
| **Exploding** | Batch normalization | ⭐⭐ |
| **Exploding** | Reduce learning rate | ⭐⭐ |

---

## Practical Example: Fixing Vanishing Gradients

### Before (Problematic)
```python
# Using sigmoid in deep network
class BadNetwork(nn.Module):
    def __init__(self):
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 256)
        self.fc3 = nn.Linear(256, 256)
        self.fc4 = nn.Linear(256, 10)
        self.sigmoid = nn.Sigmoid()  # Problem!
    
    def forward(self, x):
        x = self.sigmoid(self.fc1(x))  # Vanishing!
        x = self.sigmoid(self.fc2(x))
        x = self.sigmoid(self.fc3(x))
        return self.fc4(x)
```

### After (Fixed)
```python
class GoodNetwork(nn.Module):
    def __init__(self):
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 256)
        self.fc3 = nn.Linear(256, 256)
        self.fc4 = nn.Linear(256, 10)
        
        # Initialize properly
        nn.init.kaiming_normal_(self.fc1.weight)
        nn.init.kaiming_normal_(self.fc2.weight)
        nn.init.kaiming_normal_(self.fc3.weight)
    
    def forward(self, x):
        x = F.relu(self.fc1(x))  # ReLU instead of sigmoid
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))
        return self.fc4(x)
```

## Key Takeaways
- Vanishing gradients: Gradients become too small, early layers don't learn
- Exploding gradients: Gradients become too large, training unstable
- Caused by repeated multiplication in chain rule during backprop
- Solutions: ReLU, proper initialization, batch norm, skip connections
- For RNNs: Use LSTM/GRU and gradient clipping
- Monitor gradient norms during training

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Model Training
## Tags: [vanishing-gradient, exploding-gradient, backpropagation, training, RNN]
