# DL-015 ⭐⭐⭐ What is Learning Rate? How to Choose and Schedule It?

## Question
What is the learning rate in deep learning? Explain how to choose it and describe different learning rate scheduling strategies.

## Answer

### What is Learning Rate?

**Definition:** The learning rate (α or η) is a hyperparameter that controls the step size during gradient descent optimization. It determines how much to update weights in response to the estimated error.

**Update Rule:**
```
w_new = w_old - α × ∇L

Where:
- α: Learning rate
- ∇L: Gradient of loss function
```

### Visual Analogy
```
Imagine walking down a mountain in fog:
- Learning rate = step size
- Too large: Overshoot the bottom, may climb up other side
- Too small: Takes forever to reach bottom
- Just right: Efficient descent to minimum
```

---

## Learning Rate Impact

### Too Large (α = 0.1)
```
Epoch 1: Loss = 2.5
Epoch 2: Loss = 5.0  ← Increased!
Epoch 3: Loss = 3.2  ← Oscillating
Epoch 4: Loss = 6.1  ← Diverging!

Result: Training diverges, never converges
```

### Too Small (α = 0.00001)
```
Epoch 1: Loss = 2.5
Epoch 10: Loss = 2.4  ← Barely decreased
Epoch 100: Loss = 2.0  ← Very slow
Epoch 1000: Loss = 1.5  ← Finally improving

Result: Training takes forever, may get stuck
```

### Just Right (α = 0.001)
```
Epoch 1: Loss = 2.5
Epoch 10: Loss = 1.8  ← Steady decrease
Epoch 50: Loss = 0.9
Epoch 100: Loss = 0.5  ← Converged!

Result: Efficient convergence
```

---

## How to Choose Initial Learning Rate

### Common Starting Points

| Architecture | Typical Range | Default Start |
|-------------|---------------|---------------|
| **FC Networks** | 0.001 - 0.1 | 0.01 |
| **CNNs** | 0.001 - 0.01 | 0.001 |
| **RNNs/LSTMs** | 0.0001 - 0.001 | 0.001 |
| **Transformers** | 0.00001 - 0.0001 | 0.00005 |
| **Fine-tuning** | 0.00001 - 0.0001 | 0.00003 |

### Rule of Thumb
```
1. Start with common value (e.g., 0.001)
2. Train for few epochs
3. If loss doesn't decrease: Try 10× larger
4. If loss oscillates/diverges: Try 10× smaller
5. Once working, fine-tune within that range
```

---

## Learning Rate Scheduling

**Why Schedule?**
```
Early training: Large LR for fast progress
Late training: Small LR for fine-tuning

Fixed LR compromise: Not optimal for either phase
Scheduled LR: Best of both worlds!
```

## 1. Step Decay

**Method:** Reduce LR by factor at specific epochs

```python
# Reduce by 10× every 30 epochs
scheduler = StepLR(optimizer, step_size=30, gamma=0.1)

Schedule:
Epoch 0-29:   LR = 0.1
Epoch 30-59:  LR = 0.01
Epoch 60-89:  LR = 0.001
```

**Use Case:** Standard practice for CNNs

---

## 2. Exponential Decay

**Method:** Continuous exponential decrease

```python
scheduler = ExponentialLR(optimizer, gamma=0.95)

Schedule:
Epoch 0:   LR = 0.1
Epoch 1:   LR = 0.1 × 0.95 = 0.095
Epoch 2:   LR = 0.1 × 0.95² = 0.090
Epoch 10:  LR = 0.1 × 0.95¹⁰ = 0.060
```

**Use Case:** When smooth decay preferred

---

## 3. Cosine Annealing

**Method:** Cosine curve from max to min LR

```python
scheduler = CosineAnnealingLR(optimizer, T_max=100, eta_min=0.0001)

Schedule:
Starts at max LR, follows cosine curve to min LR
Smooth, non-monotonic (can help escape local minima)
```

**Use Case:** Modern practice, works well in practice

---

## 4. ReduceLROnPlateau

**Method:** Reduce LR when validation metric stops improving

```python
scheduler = ReduceLROnPlateau(
    optimizer, 
    mode='min',      # Minimize loss
    factor=0.1,      # Reduce by 10×
    patience=10,     # Wait 10 epochs
    verbose=True
)

# In training loop:
scheduler.step(validation_loss)
```

**Use Case:** When optimal stopping point unknown

---

## 5. Warm Restarts (SGDR)

**Method:** Periodically restart LR to higher value

```python
scheduler = CosineAnnealingWarmRestarts(
    optimizer, 
    T_0=10,   # Restart every 10 epochs
    T_mult=2  # Double period each restart
)

Schedule:
Epoch 0-9:   LR: 0.1 → 0.001 (cosine)
Epoch 10:    LR: 0.1 (restart!)
Epoch 10-19: LR: 0.1 → 0.001 (cosine)
Epoch 20:    LR: 0.1 (restart!)
```

**Use Case:** Helps escape local minima, better generalization

---

## 6. Warmup

**Method:** Start with small LR, gradually increase

```python
# Linear warmup for 5 epochs
Epoch 0: LR = 0.0001
Epoch 1: LR = 0.0005
Epoch 2: LR = 0.001
Epoch 3: LR = 0.0015
Epoch 4: LR = 0.002  ← Target LR reached
Epoch 5+: LR = 0.002 (or start decay)
```

**Use Case:** Transformers, very deep networks, prevents early instability

---

## 7. One Cycle Policy

**Method:** Increase LR, then decrease (one cycle)

```python
scheduler = OneCycleLR(
    optimizer,
    max_lr=0.01,
    epochs=100,
    steps_per_epoch=len(dataloader)
)

Schedule:
First half:  0.001 → 0.01 (increase)
Second half: 0.01 → 0.001 (decrease)
```

**Use Case:** Fast training, good generalization

---

## Learning Rate Finder

### Method (Leslie Smith)
```python
1. Start with very small LR (e.g., 1e-7)
2. Train one batch
3. Increase LR exponentially
4. Repeat for many batches
5. Plot loss vs LR
6. Choose LR where loss decreases fastest
```

### Interpretation
```
Loss
 │
 │    ──────↘
 │           ↘  ← Steepest descent (choose here!)
 │            ∼∼∼↗  ← Too high (diverging)
 │
 └─────────────────→ LR (log scale)
     ↑
  Choose LR just before minimum
```

---

## Adaptive Learning Rate Optimizers

### Adam (Most Popular)
```python
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001,           # Initial LR
    betas=(0.9, 0.999), # Momentum parameters
    eps=1e-8            # Numerical stability
)
```

**Benefits:**
- Adapts LR per parameter
- Works well out-of-box
- Default choice for most tasks

### Other Adaptive Optimizers
| Optimizer | Key Feature | Use Case |
|-----------|-------------|----------|
| **Adam** | Momentum + RMSProp | Default choice |
| **AdamW** | Adam + decoupled weight decay | Transformers |
| **RMSprop** | Adaptive LR | RNNs |
| **AdaGrad** | Per-parameter LR | Sparse data |
| **SGD + Momentum** | Classic, stable | CNNs (sometimes better) |

---

## Practical Guidelines

### For CNNs
```python
optimizer = torch.optim.SGD(
    model.parameters(),
    lr=0.1,              # Relatively high
    momentum=0.9,
    weight_decay=1e-4
)
scheduler = MultiStepLR(optimizer, milestones=[30, 60, 90], gamma=0.1)
```

### For Transformers
```python
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=5e-5,             # Lower LR
    betas=(0.9, 0.999),
    weight_decay=0.01
)
scheduler = get_linear_schedule_with_warmup(
    optimizer,
    num_warmup_steps=1000,
    num_training_steps=10000
)
```

### For Fine-tuning
```python
# Lower LR for pretrained layers
optimizer = torch.optim.AdamW([
    {'params': model.backbone.parameters(), 'lr': 1e-5},
    {'params': model.classifier.parameters(), 'lr': 1e-4}
])
```

---

## Common Mistakes

### ❌ Using Same LR for Pretrained and New Layers
```python
# Wrong: Same LR for all
optimizer = Adam(model.parameters(), lr=0.001)

# Better: Lower LR for pretrained
optimizer = AdamW([
    {'params': model.pretrained.parameters(), 'lr': 1e-5},
    {'params': model.new_layers.parameters(), 'lr': 1e-3}
])
```

### ❌ No Learning Rate Scheduling
```python
# Suboptimal: Fixed LR throughout
optimizer = Adam(model.parameters(), lr=0.001)
# No scheduler

# Better: Add scheduling
scheduler = ReduceLROnPlateau(optimizer, patience=10)
```

### ❌ Too High LR for Fine-tuning
```python
# Wrong: Using same LR as training from scratch
optimizer = Adam(model.parameters(), lr=0.001)  # Too high!

# Correct: Much lower for fine-tuning
optimizer = AdamW(model.parameters(), lr=0.00003)
```

## Key Takeaways
- Learning rate controls step size in gradient descent
- Too high: Diverges; Too low: Slow convergence
- Typical range: 0.00001 to 0.1 (depends on architecture)
- Use scheduling for better results (step decay, cosine, etc.)
- Adam optimizer works well with lr=0.001 as default
- Use learning rate finder to choose optimal LR
- Lower LR for fine-tuning pretrained models

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Optimization
## Tags: [learning-rate, optimization, scheduling, training, hyperparameters]
