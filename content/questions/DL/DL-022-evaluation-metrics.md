# DL-022 ⭐⭐⭐ Model Evaluation Metrics for Classification and Regression

## Question
What are common evaluation metrics in deep learning? Explain metrics for classification and regression tasks.

## Answer

### Why Multiple Metrics?
```
Accuracy alone can be misleading:
- Imbalanced datasets: 99% accuracy with 99% negative samples
- Different costs: False positive vs false negative
- Need comprehensive evaluation
```

---

## Classification Metrics

## 1. Accuracy
```
Accuracy = (TP + TN) / (TP + TN + FP + FN)

✅ Simple, intuitive
❌ Misleading for imbalanced datasets
```

## 2. Precision
```
Precision = TP / (TP + FP)

"How many predicted positives are actually positive?"

Use when: False positives are costly (spam detection)
```

## 3. Recall (Sensitivity)
```
Recall = TP / (TP + FN)

"How many actual positives did we find?"

Use when: False negatives are costly (disease detection)
```

## 4. F1-Score
```
F1 = 2 × (Precision × Recall) / (Precision + Recall)

Harmonic mean of precision and recall
Good balance when both matter
```

## 5. ROC-AUC
```
ROC Curve: TPR vs FPR at different thresholds
AUC: Area under ROC curve (0.5 = random, 1.0 = perfect)

✅ Threshold-independent
✅ Good for imbalanced datasets
```

## 6. Precision-Recall AUC
```
Better than ROC-AUC for highly imbalanced datasets
Focuses on positive class performance
```

---

## Regression Metrics

## 1. Mean Absolute Error (MAE)
```
MAE = (1/n) × Σ|y_pred - y_true|

✅ Interpretable (average error)
✅ Robust to outliers
```

## 2. Mean Squared Error (MSE)
```
MSE = (1/n) × Σ(y_pred - y_true)²

✅ Penalizes large errors
❌ Not in same units as target
```

## 3. Root Mean Squared Error (RMSE)
```
RMSE = √MSE

✅ Same units as target
✅ Penalizes large errors
```

## 4. R² Score (Coefficient of Determination)
```
R² = 1 - (SS_res / SS_tot)

✅ Interpretable (variance explained)
✅ Range: -∞ to 1 (1 = perfect)
```

---

## Key Takeaways
- Classification: Accuracy, Precision, Recall, F1, ROC-AUC
- Regression: MAE, MSE, RMSE, R²
- Choose metrics based on business objectives
- Use multiple metrics for comprehensive evaluation

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Model Evaluation
## Tags: [metrics, evaluation, classification, regression, accuracy]
