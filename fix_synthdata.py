#!/usr/bin/env python3
"""Add a second code example to synthdata-001.ts"""
import re

filepath = "src/data/articles/synthdata-001.ts"

with open(filepath, "r") as f:
    content = f.read()

# Find the closing of the first code block in section 7
# Pattern: the first code block ends with }, followed by ], followed by warning:
# We want to insert a second code block between }, and ],

# Strategy: find "generate_synthetic_images.py" and then find the closing }, after it
idx = content.find('filename: "generate_synthetic_images.py"')
if idx < 0:
    print("ERROR: Could not find generate_synthetic_images.py marker")
    exit(1)

# Find the closing }, after this
after = content[idx:]
# The structure is: filename: "generate_synthetic_images.py",\n                },\n            ],\n            warning:
closing = after.find("},\n            ],\n            warning:")
if closing < 0:
    print("ERROR: Could not find closing pattern")
    print("Context:", repr(after[:200]))
    exit(1)

insert_pos = idx + closing + 2  # +2 to skip the },

new_code = """
                {
                    lang: "python",
                    code: `# 合成数据质量评估 pipeline
# 综合统计相似性 + 下游任务性能验证
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from scipy.spatial.distance import jensenshannon

def statistical_similarity(real_data, synthetic_data, n_bins=50):
    \"\"\"计算合成数据与真实数据的统计相似性

    使用 Jensen-Shannon 散度评估每个特征维度的分布差异。
    JS 散度范围 [0, 1]，0 表示完全相同，1 表示完全不同。
    合格标准：JS < 0.1 表示分布足够接近。
    \"\"\"
    n_features = real_data.shape[1]
    js_distances = []
    for i in range(n_features):
        real_min, real_max = real_data[:, i].min(), real_data[:, i].max()
        bins = np.linspace(real_min, real_max, n_bins)
        real_hist, _ = np.histogram(real_data[:, i], bins=bins, density=True)
        synth_hist, _ = np.histogram(synthetic_data[:, i], bins=bins, density=True)
        real_hist = real_hist + 1e-10
        synth_hist = synth_hist + 1e-10
        real_hist /= real_hist.sum()
        synth_hist /= synth_hist.sum()
        js = jensenshannon(real_hist, synth_hist)
        js_distances.append(js)
    return np.mean(js_distances), js_distances

def downstream_task_evaluation(X_real, y_real, X_synth, y_synth, X_test, y_test):
    \"\"\"下游任务评估：在合成数据上训练，在真实数据上测试

    这是最终的质量检验标准：如果合成数据训练的模型在真实测试集上
    的性能接近真实数据训练的模型（>=90%），说明合成数据质量合格。
    \"\"\"
    synth_model = RandomForestClassifier(n_estimators=100, random_state=42)
    synth_model.fit(X_synth, y_synth)
    synth_acc = synth_model.score(X_test, y_test)
    real_model = RandomForestClassifier(n_estimators=100, random_state=42)
    real_model.fit(X_real, y_real)
    real_acc = real_model.score(X_test, y_test)
    relative_performance = synth_acc / real_acc if real_acc > 0 else 0
    return {
        "synthetic_model_accuracy": f"{synth_acc:.4f}",
        "real_model_accuracy": f"{real_acc:.4f}",
        "relative_performance": f"{relative_performance:.2%}",
        "passed": relative_performance >= 0.90,
    }

# 使用示例
from sklearn.datasets import make_classification
X_real, y_real = make_classification(
    n_samples=5000, n_features=20, n_informative=10,
    n_redundant=5, random_state=42
)
X_synth = X_real + np.random.normal(0, 0.1, X_real.shape)
y_synth = y_real.copy()
X_train, X_test, y_train, y_test = train_test_split(X_real, y_real, test_size=0.2, random_state=42)
mean_js, js_per_feature = statistical_similarity(X_train, X_synth[:4000])
print(f"平均 JS 散度: {mean_js:.4f} ({'合格' if mean_js < 0.1 else '不合格'})")
result = downstream_task_evaluation(X_train, y_train, X_synth[:4000], y_synth[:4000], X_test, y_test)
print(f"合成数据模型准确率: {result['synthetic_model_accuracy']}")
print(f"真实数据模型准确率: {result['real_model_accuracy']}")
print(f"相对性能: {result['relative_performance']} ({'合格' if result['passed'] else '不合格'})")`,
                    filename: "evaluate_synthetic_data.py",
                },"""

content = content[:insert_pos] + new_code + content[insert_pos:]

with open(filepath, "w") as f:
    f.write(content)

print("Done - inserted second code example")
