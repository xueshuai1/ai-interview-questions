# DL-023 ⭐⭐⭐ Data Augmentation Techniques in Deep Learning

## Question
What is data augmentation? Explain common techniques for images, text, and audio.

## Answer

### What is Data Augmentation?
**Data augmentation** artificially increases training data by creating modified versions of existing data. It improves model generalization and reduces overfitting.

### Benefits
```
✅ More training data without collection
✅ Reduces overfitting
✅ Improves model robustness
✅ Better generalization to unseen data
```

---

## Image Augmentation

### Geometric Transformations
```
- Random horizontal/vertical flip
- Random rotation (±10-30 degrees)
- Random crop and resize
- Random translation/shift
- Random scaling/zoom
```

### Color Transformations
```
- Random brightness adjustment
- Random contrast adjustment
- Random saturation adjustment
- Random hue adjustment
- Color jittering
```

### Advanced Techniques
```
- Mixup: Blend two images
- CutMix: Cut and paste patches
- Cutout: Randomly mask out regions
- Mosaic: Combine 4 images
```

### Code Example
```python
from torchvision import transforms

transform = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.RandomCrop(32, padding=4),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor()
])
```

---

## Text Augmentation

### Techniques
```
- Synonym replacement
- Random insertion
- Random swap
- Random deletion
- Back translation (translate to another language and back)
- TF-IDF based word replacement
```

### Example
```
Original: "The movie was excellent"
Augmented: "The film was outstanding"
```

---

## Audio Augmentation

### Techniques
```
- Add background noise
- Time stretching
- Pitch shifting
- Volume adjustment
- Speed perturbation
- SpecAugment (for spectrograms)
```

---

## Best Practices
```
✅ Apply augmentation only to training data
✅ Keep augmentations realistic
✅ Monitor validation performance
✅ Combine multiple augmentations
```

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Model Training
## Tags: [data-augmentation, images, text, audio, regularization]
