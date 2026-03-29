# DL-025 ⭐⭐⭐ What is Embedding? Word Embeddings and Applications

## Question
What are embeddings in deep learning? Explain word embeddings and their applications.

## Answer

### What are Embeddings?
**Embeddings** are dense, continuous vector representations of discrete items (words, images, users, etc.). They capture semantic meaning and relationships in a lower-dimensional space.

### Why Embeddings?
```
One-hot encoding: [0, 0, 1, 0, 0, ...]  ← Sparse, no semantic meaning
Embedding:        [0.2, -0.5, 0.8, ...] ← Dense, captures meaning
```

---

## Word Embeddings

## 1. Word2Vec
```
Two architectures:
- CBOW: Predict word from context
- Skip-gram: Predict context from word

Properties:
- Captures semantic similarity
- Vector arithmetic: king - man + woman = queen
```

## 2. GloVe (Global Vectors)
```
Based on word co-occurrence matrix
Combines global matrix factorization with local context
```

## 3. FastText
```
Extends Word2Vec with subword information
Handles out-of-vocabulary words
Good for morphologically rich languages
```

## 4. Contextual Embeddings (Modern)
```
- ELMo: Context-dependent embeddings
- BERT: Bidirectional transformer embeddings
- Different embedding for same word in different contexts
```

---

## Properties of Good Embeddings

### Semantic Similarity
```
Similar words have similar vectors:
cosine_similarity("cat", "dog") > cosine_similarity("cat", "car")
```

### Analogies
```
Vector arithmetic captures relationships:
vec("Paris") - vec("France") + vec("Germany") ≈ vec("Berlin")
```

### Dimensionality
```
Typical: 50-300 dimensions
Much smaller than vocabulary size (10,000+)
```

---

## Applications

### 1. NLP Tasks
```
- Text classification
- Sentiment analysis
- Machine translation
- Named entity recognition
```

### 2. Recommendation Systems
```
- User embeddings
- Item embeddings
- Collaborative filtering
```

### 3. Graph Analysis
```
- Node embeddings (Node2Vec)
- Link prediction
- Community detection
```

### 4. Other Domains
```
- Image embeddings (CNN features)
- Audio embeddings
- User behavior embeddings
```

---

## Code Example
```python
from gensim.models import Word2Vec

# Train Word2Vec
sentences = [["cat", "sat", "on", "mat"],
             ["dog", "ran", "in", "park"]]
model = Word2Vec(sentences, vector_size=100, window=5, min_count=1)

# Get embedding
vector = model.wv["cat"]

# Find similar words
similar = model.wv.most_similar("cat", topn=5)
```

## Key Takeaways
- Embeddings: Dense vector representations
- Word2Vec, GloVe, FastText: Classic word embeddings
- BERT: Contextual embeddings (modern)
- Capture semantic meaning and relationships
- Applications: NLP, recommendations, graphs

## Difficulty: ⭐⭐⭐ (Advanced)
## Category: Neural Network Components
## Tags: [embeddings, word2vec, GloVe, NLP, representations]
