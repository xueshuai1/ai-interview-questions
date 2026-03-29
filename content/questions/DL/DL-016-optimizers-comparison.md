# DL-016 ⭐⭐⭐ Compare Optimizers: SGD, Momentum, RMSprop, and Adam

## Question
Compare different optimization algorithms used in deep learning: SGD, Momentum, RMSprop, and Adam. What are their advantages and when to use each?

## Answer

### What is an Optimizer?
An **optimizer** is an algorithm that updates neural network weights to minimize the loss function. It determines how to use the gradient to update weights efficiently.

---

## 1. SGD (Stochastic Gradient Descent)

### Update Rule
```
w = w - α × ∇L

Where:
- α: Learning rate
- ∇L: Gradient of loss
```

### Characteristics
```
✅ Simple, easy to understand
✅ Theoretically well-understood
✅ Can find good minima with proper tuning
❌ Slow convergence
❌ May get stuck in local minima
❌ Noisy updates (high variance)
❌ Requires careful learning rate tuning
```

### Use Cases
- When you need reproducibility
- Small datasets
- Educational purposes
- Sometimes better generalization than Adam

---

## 2. SGD with Momentum

### Update Rule
```
v = β × v + α × ∇L    # Update velocity
w = w - v             # Update weights

Where:
- v: Velocity (accumulated gradient)
- β: Momentum coefficient (typically 0.9)
```

### Intuition
```
Imagine a ball rolling down a hill:
- Gains momentum in consistent directions
- Slows down when gradient changes direction
- Smooths out noisy gradients
```

### Characteristics
```
✅ Faster convergence than SGD
✅ Reduces oscillations
✅ Helps escape shallow local minima
✅ Still relatively simple
❌ Adds one more hyperparameter (β)
❌ May overshoot minima
```

### Typical Parameters
```python
optimizer = torch.optim.SGD(
    model.parameters(),
    lr=0.01,
    momentum=0.9,          # Standard value
    weight_decay=1e-4      # L2 regularization
)
```

---

## 3. RMSprop (Root Mean Square Propagation)

### Update Rule
```
E[g²] = β × E[g²] + (1-β) × (∇L)²   # Moving average of squared gradients
w = w - α × ∇L / (√E[g²] + ε)       # Normalize by RMS
```

### Key Idea
```
- Adapts learning rate per parameter
- Large gradients → Small effective LR
- Small gradients → Large effective LR
- Prevents exploding/vanishing updates
```

### Characteristics
```
✅ Adaptive learning rates
✅ Works well for RNNs
✅ Handles sparse gradients well
✅ No manual LR tuning per parameter
❌ More complex than SGD
❌ Another hyperparameter (β, typically 0.99)
```

### Use Cases
- RNNs and LSTMs
- Non-stationary objectives
- When gradients vary significantly across parameters

---

## 4. Adam (Adaptive Moment Estimation) ⭐ Most Popular

### Update Rule
```
# First moment (mean of gradients)
m = β₁ × m + (1-β₁) × ∇L

# Second moment (uncentered variance)
v = β₂ × v + (1-β₂) × (∇L)²

# Bias correction
m̂ = m / (1 - β₁ᵗ)
v̂ = v / (1 - β₂ᵗ)

# Update
w = w - α × m̂ / (√v̂ + ε)
```

### Combines Best of Both
```
Momentum (from SGD with Momentum):
- Uses first moment (m) for acceleration

RMSprop:
- Uses second moment (v) for adaptive LR
```

### Characteristics
```
✅ Fast convergence
✅ Adaptive learning rates per parameter
✅ Works well out-of-box
✅ Default choice for most problems
✅ Handles sparse gradients
✅ Robust to hyperparameter choices
❌ May generalize worse than SGD
❌ More memory (stores m and v for each parameter)
❌ Can converge to sharp minima
```

### Default Parameters
```python
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001,            # Default LR
    betas=(0.9, 0.999),  # β₁, β₂
    eps=1e-8,            # Numerical stability
    weight_decay=0       # L2 regularization (use AdamW for decoupled)
)
```

---

## 5. AdamW (Adam with Decoupled Weight Decay)

### Problem with Adam
```
In Adam, weight decay is coupled with adaptive LR
L2 regularization doesn't work as expected
```

### AdamW Solution
```
Decouples weight decay from gradient-based update
Proper L2 regularization
```

### Use Cases
- **Transformers** (BERT, GPT, etc.)
- When using weight decay with Adam
- Modern best practice

```python
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=0.001,
    betas=(0.9, 0.999),
    weight_decay=0.01      # Proper weight decay
)
```

---

## Optimizer Comparison Table

| Optimizer | Convergence | Memory | Hyperparams | Best For |
|-----------|-------------|--------|-------------|----------|
| **SGD** | Slow | Low | 1 (LR) | Small datasets, reproducibility |
| **SGD+Momentum** | Medium | Low | 2 (LR, β) | CNNs, when Adam overfits |
| **RMSprop** | Fast | Medium | 2 (LR, β) | RNNs, online learning |
| **Adam** | **Fastest** | High | 3 (LR, β₁, β₂) | **Default choice** |
| **AdamW** | **Fastest** | High | 4 (LR, β₁, β₂, WD) | **Transformers, modern DL** |

---

## When to Use Each Optimizer

### Adam/AdamW (Default Choice) ✅
```
✓ Most deep learning tasks
✓ When you want fast convergence
✓ Limited hyperparameter tuning time
✓ Transformers and attention models
✓ Computer vision (most cases)
✓ NLP tasks
```

### SGD with Momentum
```
✓ When Adam overfits
✓ CNNs (sometimes better generalization)
✓ When you need reproducibility
✓ Well-studied architectures (ResNet, etc.)
✓ When memory is limited
```

### RMSprop
```
✓ RNNs and LSTMs
✓ Reinforcement learning
✓ Non-stationary problems
✓ When gradients vary a lot
```

### Plain SGD
```
✓ Educational purposes
✓ When you need theoretical guarantees
✓ Very small datasets
✓ Convex optimization problems
```

---

## Practical Recommendations

### For CNNs
```python
# Option 1: Adam (faster convergence)
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# Option 2: SGD+Momentum (sometimes better generalization)
optimizer = torch.optim.SGD(
    model.parameters(), 
    lr=0.1, 
    momentum=0.9,
    weight_decay=1e-4
)
```

### For RNNs/Transformers
```python
# Always use AdamW
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=0.0001,
    betas=(0.9, 0.999),
    weight_decay=0.01
)
```

### For Fine-tuning
```python
# Lower learning rate, AdamW
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=0.00003,  # Much lower
    weight_decay=0.01
)
```

---

## Convergence Comparison

```
Loss
 │
 │  SGD ────────────────────────→ (slow but steady)
 │
 │  Momentum ─────∼∼∼∼∼→ (faster, some oscillation)
 │
 │  Adam ∼∼→ (fastest convergence!)
 │
 └─────────────────────────────────→ Epochs
```

---

## Common Mistakes

### ❌ Using Adam with Wrong Learning Rate
```python
# Wrong: Using SGD learning rate with Adam
optimizer = Adam(model.parameters(), lr=0.1)  # Too high!

# Correct: Lower LR for Adam
optimizer = Adam(model.parameters(), lr=0.001)
```

### ❌ Not Using AdamW for Transformers
```python
# Suboptimal: Adam with weight decay
optimizer = Adam(model.parameters(), lr=0.001, weight_decay=0.01)

# Better: AdamW (decoupled weight decay)
optimizer = AdamW(model.parameters(), lr=0.001, weight_decay=0.01)
```

### ❌ Switching Optimizers Mid-Training
```python
# Don't do this!
optimizer = Adam(model.parameters())
# ... train for 10 epochs ...
optimizer = SGD(model.parameters())  # Loses momentum state!
```

## Key Takeaways
- **Adam/AdamW** is default choice for most tasks (fast, works out-of-box)
- **SGD+Momentum** sometimes generalizes better for CNNs
- **RMSprop** works well for RNNs
- Adam combines momentum + adaptive learning rates
- Use AdamW (not Adam) when using weight decay
- Learning rate ranges differ between optimizers

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Optimization
## Tags: [optimizers, SGD, Adam, RMSprop, momentum, training]
