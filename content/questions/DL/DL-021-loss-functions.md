# DL-021 ⭐⭐⭐ Common Loss Functions in Deep Learning

## Question
What are loss functions? Explain common loss functions used in deep learning and when to use each.

## Answer

### What is a Loss Function?
A **loss function** (or cost function) measures how well the model's predictions match the actual targets. The goal of training is to minimize this loss.

```
Loss = f(predicted, actual)

Lower loss = Better predictions
Training: Find weights that minimize loss
```

---

## Loss Functions for Regression

## 1. Mean Squared Error (MSE / L2 Loss)

### Formula
```
MSE = (1/n) × Σ(y_pred - y_true)²
```

### Characteristics
```
✅ Smooth, differentiable everywhere
✅ Penalizes large errors more (squared)
✅ Convex for linear models
❌ Sensitive to outliers (squared penalty)
```

### Use Cases
```
- Regression problems
- When large errors are particularly bad
- Standard choice for continuous outputs
```

### Code
```python
# PyTorch
loss_fn = nn.MSELoss()
loss = loss_fn(predictions, targets)

# Or functional
loss = F.mse_loss(predictions, targets)
```

---

## 2. Mean Absolute Error (MAE / L1 Loss)

### Formula
```
MAE = (1/n) × Σ|y_pred - y_true|
```

### Characteristics
```
✅ Robust to outliers (linear penalty)
✅ Interpretable (average error magnitude)
❌ Not differentiable at zero
❌ Can have multiple minima
```

### Use Cases
```
- Regression with outliers
- When you want robust estimates
- Less sensitive to extreme values
```

### Code
```python
loss_fn = nn.L1Loss()
loss = loss_fn(predictions, targets)
```

---

## 3. Huber Loss

### Formula
```
Lδ(a) = { 0.5×a²           if |a| ≤ δ
        { δ×(|a| - 0.5×δ)  otherwise

Where a = y_pred - y_true
```

### Characteristics
```
✅ Combines MSE and MAE benefits
✅ Quadratic for small errors (smooth)
✅ Linear for large errors (robust)
❌ Need to choose δ hyperparameter
```

### Use Cases
```
- Regression with some outliers
- When you want both smoothness and robustness
- Default: δ = 1.0
```

### Code
```python
loss_fn = nn.HuberLoss(delta=1.0)
loss = loss_fn(predictions, targets)
```

---

## Loss Functions for Classification

## 4. Binary Cross-Entropy (BCE)

### Formula
```
BCE = -[y×log(p) + (1-y)×log(1-p)]

Where:
- y: True label (0 or 1)
- p: Predicted probability
```

### Characteristics
```
✅ Standard for binary classification
✅ Works with sigmoid output
✅ Penalizes confident wrong predictions heavily
❌ Can have numerical instability (use stable implementation)
```

### Use Cases
```
- Binary classification (spam/not spam)
- Two-class problems
- Output: Single neuron with sigmoid
```

### Code
```python
# With sigmoid separately
loss_fn = nn.BCELoss()
predictions = torch.sigmoid(model(x))
loss = loss_fn(predictions, targets)

# Combined (more stable)
loss_fn = nn.BCEWithLogitsLoss()
loss = loss_fn(model(x), targets)  # No sigmoid needed
```

---

## 5. Categorical Cross-Entropy

### Formula
```
CE = -Σ y_i × log(p_i)

Where:
- y_i: True label (one-hot encoded)
- p_i: Predicted probability for class i
```

### Characteristics
```
✅ Standard for multi-class classification
✅ Works with softmax output
✅ Strong gradients for wrong predictions
❌ Requires one-hot encoded targets
```

### Use Cases
```
- Multi-class classification (10 classes)
- Mutually exclusive classes
- Output: N neurons with softmax
```

### Code
```python
# PyTorch (includes softmax)
loss_fn = nn.CrossEntropyLoss()
loss = loss_fn(predictions, targets)  # targets are class indices

# Note: PyTorch's CrossEntropyLoss expects raw logits, not softmax
```

---

## 6. Sparse Categorical Cross-Entropy

### Difference from Categorical CE
```
Categorical CE: Targets one-hot encoded [0, 1, 0]
Sparse CE: Targets as integers [1]

Same mathematical formula, different target format
```

### Use Cases
```
- Multi-class with many classes (saves memory)
- When targets are class indices
```

### Code
```python
# PyTorch: CrossEntropyLoss is already sparse
loss_fn = nn.CrossEntropyLoss()
loss = loss_fn(predictions, target_indices)  # [0, 2, 1, 3, ...]
```

---

## Specialized Loss Functions

## 7. Focal Loss

### Formula
```
FL(p_t) = -α_t × (1 - p_t)^γ × log(p_t)

Where:
- p_t: Predicted probability for true class
- α: Balancing factor
- γ: Focusing parameter (typically 2)
```

### Purpose
```
Down-weights easy examples
Focuses training on hard examples
```

### Use Cases
```
- Class imbalance problems
- Object detection (many background examples)
- When most examples are easy to classify
```

---

## 8. Contrastive Loss

### Formula
```
L = (1-y) × 0.5 × D² + y × 0.5 × max(0, margin - D)²

Where:
- D: Distance between embeddings
- y: 1 if similar, 0 if different
```

### Use Cases
```
- Learning embeddings
- Siamese networks
- Face verification
- Similarity learning
```

---

## 9. Triplet Loss

### Formula
```
L = max(0, D(anchor, positive) - D(anchor, negative) + margin)

Where:
- Anchor: Reference sample
- Positive: Same class as anchor
- Negative: Different class from anchor
```

### Use Cases
```
- Face recognition
- Learning embeddings
- Retrieval systems
```

---

## Loss Function Selection Guide

### For Regression
| Situation | Recommended Loss |
|-----------|-----------------|
| Standard regression | MSE |
| With outliers | MAE or Huber |
| Need robustness | Huber |
| Predicting distributions | Negative Log Likelihood |

### For Classification
| Situation | Recommended Loss |
|-----------|-----------------|
| Binary classification | BCE |
| Multi-class (exclusive) | Cross-Entropy |
| Multi-class (imbalanced) | Focal Loss |
| Multi-label | BCE (per label) |
| Learning embeddings | Contrastive/Triplet |

---

## Common Mistakes

### ❌ Wrong Loss for Task
```python
# Wrong: Using MSE for classification
loss = nn.MSELoss()(predictions, targets)  # Classification!

# Correct: Use CrossEntropyLoss
loss = nn.CrossEntropyLoss()(predictions, targets)
```

### ❌ Double Applying Activation
```python
# Wrong: Applying softmax then CrossEntropyLoss
predictions = softmax(model(x))
loss = nn.CrossEntropyLoss()(predictions, targets)  # Already has softmax!

# Correct: CrossEntropyLoss includes softmax
loss = nn.CrossEntropyLoss()(model(x), targets)  # Raw logits
```

### ❌ Wrong Target Format
```python
# Wrong: One-hot targets with CrossEntropyLoss
targets = torch.tensor([[0, 1, 0], [1, 0, 0]])  # One-hot
loss = nn.CrossEntropyLoss()(predictions, targets)  # Expects indices!

# Correct: Class indices
targets = torch.tensor([1, 0])  # Class indices
loss = nn.CrossEntropyLoss()(predictions, targets)
```

---

## Custom Loss Functions

### Example: Weighted MSE
```python
class WeightedMSELoss(nn.Module):
    def __init__(self, weights):
        super().__init__()
        self.weights = weights
    
    def forward(self, pred, target):
        diff = pred - target
        weighted_diff = self.weights * diff**2
        return weighted_diff.mean()
```

## Key Takeaways
- Loss functions measure prediction error
- Regression: MSE (standard), MAE (robust), Huber (balanced)
- Binary classification: Binary Cross-Entropy
- Multi-class: Categorical Cross-Entropy
- Choose loss based on task and data characteristics
- PyTorch's CrossEntropyLoss includes softmax (use raw logits)

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Model Training
## Tags: [loss-functions, MSE, cross-entropy, training, optimization]
