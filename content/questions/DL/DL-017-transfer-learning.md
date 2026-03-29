# DL-017 ⭐⭐⭐ What is Transfer Learning? Explain Approaches and Use Cases

## Question
What is transfer learning in deep learning? Explain different approaches, when to use it, and provide examples.

## Answer

### What is Transfer Learning?
**Transfer Learning** is a technique where a model trained on one task is reused as the starting point for a model on a second, related task. Instead of training from scratch, you leverage knowledge (weights) from a pre-trained model.

### Analogy
```
Learning from scratch:
- Learn to recognize edges → shapes → objects → specific objects
- Takes years (or millions of images)

Transfer learning:
- Already knows edges → shapes → objects
- Only learn specific objects for your task
- Takes days (or thousands of images)
```

---

## Why Transfer Learning Works

### Feature Hierarchy in CNNs
```
Layer 1: Edges, corners (通用 features)
Layer 2: Textures, patterns (通用 features)
Layer 3: Shapes, parts (somewhat task-specific)
Layer 4: Objects (task-specific)
Layer 5: Specific categories (very task-specific)

Early layers learn general features useful for many tasks!
```

### Benefits
```
✅ Less training data required (100s vs 100,000s of images)
✅ Faster training (fewer epochs)
✅ Better performance (especially with small datasets)
✅ Less computational resources
✅ Leverages state-of-the-art architectures
```

---

## Transfer Learning Approaches

## 1. Feature Extraction (Frozen Base)

### Method
```
1. Remove final classification layer from pretrained model
2. Freeze all pretrained layers (don't update weights)
3. Add new classifier layers for your task
4. Train only the new layers
```

### Architecture
```
Input → [Pretrained CNN (frozen)] → Features → [New Classifier] → Output
        ↓
        Weights frozen, no gradient updates
```

### Code Example
```python
# Load pretrained model
model = torchvision.models.resnet50(pretrained=True)

# Freeze all layers
for param in model.parameters():
    param.requires_grad = False

# Replace final layer
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, num_classes)  # New layer

# Only train the new layer
optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)
```

### When to Use
```
✓ Small dataset (< 1,000 images)
✓ Similar domain to pretrained data
✓ Quick baseline needed
✓ Limited computational resources
```

---

## 2. Fine-Tuning (Unfrozen Base)

### Method
```
1. Start with feature extraction approach
2. After training new layers, unfreeze some/all base layers
3. Train entire network with very low learning rate
4. Pretrained weights are slightly adjusted
```

### Architecture
```
Input → [Pretrained CNN (fine-tuned)] → Features → [Classifier] → Output
        ↓
        Weights updated with very low LR
```

### Code Example
```python
# First: Train classifier with frozen base
# ... (feature extraction training) ...

# Then: Unfreeze some layers for fine-tuning
for param in model.parameters():
    param.requires_grad = False

# Unfreeze last few layers
for param in model.layer4.parameters():
    param.requires_grad = True

# Train with very low learning rate
optimizer = torch.optim.Adam([
    {'params': model.layer4.parameters(), 'lr': 1e-5},
    {'params': model.fc.parameters(), 'lr': 1e-3}
])
```

### When to Use
```
✓ Medium dataset (1,000 - 10,000 images)
✓ Your data differs from pretrained data
✓ Need better performance
✓ Have computational resources
```

---

## 3. Full Fine-Tuning

### Method
```
1. Load pretrained weights
2. Unfreeze ALL layers
3. Train entire network with low learning rate
4. All weights are updated
```

### When to Use
```
✓ Large dataset (> 10,000 images)
✓ Your domain differs significantly from pretrained
✓ Maximum performance needed
✓ Sufficient computational resources
```

---

## Common Pretrained Models

### ImageNet Models (Computer Vision)

| Model | Top-1 Acc | Parameters | Use Case |
|-------|-----------|------------|----------|
| **ResNet50** | 76.0% | 25M | General purpose, good balance |
| **ResNet101** | 77.4% | 44M | Better accuracy, more compute |
| **EfficientNet-B0** | 77.1% | 5M | Efficient, mobile-friendly |
| **EfficientNet-B7** | 84.4% | 66M | State-of-the-art accuracy |
| **VGG16** | 71.5% | 138M | Simple architecture, many params |
| **ViT-Base** | 81.8% | 86M | Transformer-based, modern |

### NLP Models
| Model | Use Case |
|-------|----------|
| **BERT** | Text classification, QA, NER |
| **GPT** | Text generation, language modeling |
| **RoBERTa** | Improved BERT, various NLP tasks |
| **T5** | Text-to-text tasks |

---

## Transfer Learning Strategies by Dataset Size

### Tiny Dataset (< 100 images)
```
Approach: Feature extraction only
- Freeze entire pretrained model
- Train only final classifier
- Use heavy data augmentation
- Consider few-shot learning techniques
```

### Small Dataset (100 - 1,000 images)
```
Approach: Feature extraction + light fine-tuning
- Freeze most of pretrained model
- Train classifier
- Optionally fine-tune last 1-2 layers
- Use data augmentation
```

### Medium Dataset (1,000 - 10,000 images)
```
Approach: Fine-tuning
- Start with feature extraction
- Fine-tune last 2-3 layers
- Use moderate learning rate
- Data augmentation recommended
```

### Large Dataset (> 10,000 images)
```
Approach: Full fine-tuning or train from scratch
- Fine-tune all layers
- Or train from scratch if domain very different
- Standard data augmentation
```

---

## Practical Example: Dog Breed Classification

### Scenario
```
Task: Classify 120 dog breeds
Dataset: 10,000 images
Pretrained: ImageNet (1,000 classes, includes some dogs)
```

### Implementation
```python
import torchvision.models as models

# Load pretrained ResNet50
model = models.resnet50(pretrained=True)

# Replace final layer
num_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(num_features, 512),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(512, 120)  # 120 dog breeds
)

# Training strategy
# Phase 1: Train classifier (frozen base)
for param in model.parameters():
    param.requires_grad = False
for param in model.fc.parameters():
    param.requires_grad = True

optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)
# Train for 10 epochs

# Phase 2: Fine-tune (unfreeze some layers)
for param in model.layer4.parameters():
    param.requires_grad = True

optimizer = torch.optim.Adam([
    {'params': model.layer4.parameters(), 'lr': 1e-5},
    {'params': model.fc.parameters(), 'lr': 1e-4}
])
# Train for 10 more epochs
```

---

## Domain Adaptation

### When Source and Target Domains Differ
```
Example:
- Pretrained on: Natural images (ImageNet)
- Target domain: Medical X-rays

Challenge: Different data distribution
```

### Strategies
```
1. Use earlier layers only (more general features)
2. More aggressive fine-tuning
3. Domain adaptation techniques
4. Train on intermediate domain if available
```

---

## Common Mistakes

### ❌ Using Too High Learning Rate
```python
# Wrong: Same LR as training from scratch
optimizer = Adam(model.parameters(), lr=0.001)  # Too high!

# Correct: Lower LR for fine-tuning
optimizer = Adam(model.parameters(), lr=0.00003)
```

### ❌ Not Freezing Layers Properly
```python
# Wrong: Forget to set requires_grad
model = models.resnet50(pretrained=True)
model.fc = nn.Linear(2048, 10)
# All layers will be updated!

# Correct: Explicitly freeze
for param in model.parameters():
    param.requires_grad = False
```

### ❌ Using Wrong Pretrained Model
```python
# Wrong: Using ImageNet for medical images without consideration
# ImageNet has natural images, not X-rays

# Better: Use models pretrained on medical images if available
# Or be prepared to fine-tune more aggressively
```

---

## Transfer Learning Checklist

```
□ Choose appropriate pretrained model
□ Match input preprocessing to pretrained model
□ Replace final classification layer
□ Freeze base layers (initially)
□ Use lower learning rate than training from scratch
□ Train classifier first
□ Optionally fine-tune base layers
□ Monitor for overfitting (use validation set)
□ Use data augmentation
□ Save best model (not last)
```

## Key Takeaways
- Transfer learning reuses pretrained models for new tasks
- Saves time, data, and computational resources
- Two main approaches: feature extraction and fine-tuning
- Choose approach based on dataset size and similarity
- Use lower learning rates than training from scratch
- Popular pretrained models: ResNet, EfficientNet, BERT
- Always use appropriate data preprocessing

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Model Training
## Tags: [transfer-learning, fine-tuning, pretrained-models, feature-extraction]
