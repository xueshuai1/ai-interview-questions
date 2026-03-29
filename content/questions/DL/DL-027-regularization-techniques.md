# DL-027 ⭐⭐⭐ What is Regularization? Techniques to Prevent Overfitting

## Question
What is regularization in deep learning? Explain different regularization techniques.

## Answer

### What is Regularization?
**Regularization** is a set of techniques to prevent overfitting by adding constraints or penalties to the learning process, improving generalization to unseen data.

---

## Regularization Techniques

## 1. L1 Regularization (Lasso)
```
Loss += λ × Σ|w|

Effect: Some weights become exactly zero
Use: Feature selection, sparse models
```

## 2. L2 Regularization (Ridge)
```
Loss += λ × Σw²

Effect: Weights decay toward zero
Use: Most common regularization
```

## 3. Dropout
```
Randomly drop neurons during training
Prevents co-adaptation
Typical rate: 0.3-0.5
```

## 4. Batch Normalization
```
Normalize layer inputs
Stabilizes training, slight regularization
```

## 5. Early Stopping
```
Stop training when validation loss increases
Prevents overfitting to training data
```

## 6. Data Augmentation
```
Create variations of training data
Increases effective dataset size
```

## 7. Weight Constraints
```
Max norm constraints on weights
Prevents weights from growing too large
```

## 8. Label Smoothing
```
Don't use hard 0/1 labels
Use 0.1/0.9 instead
Prevents overconfidence
```

---

## Comparison

| Technique | Strength | Overhead | Best For |
|-----------|----------|----------|----------|
| Dropout | Strong | Low | FC layers |
| L2 | Moderate | None | All layers |
| BatchNorm | Mild | Medium | Deep networks |
| Early Stopping | Mild | None | Always use |
| Data Aug | Strong | Domain-specific | Limited data |

---

## Best Practices
```
✅ Combine multiple techniques
✅ Start with L2 + dropout + early stopping
✅ Tune regularization strength
✅ Monitor validation performance
```

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Model Training
## Tags: [regularization, dropout, L2, overfitting, generalization]
