import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-007",
    title: "支持向量机 SVM：最大间隔分类器",
    category: "ml",
    tags: ["SVM", "分类", "核函数"],
    summary: "从硬间隔到核技巧，理解 SVM 的数学之美",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
      {
        title: "1. 最大间隔的直觉：为什么「越宽越好」",
        body: `想象你在一张纸上画了一条线，把红色点和蓝色点分开。这条线可以贴着红色点画，也可以贴着蓝色点画，或者画在正中间。直觉告诉我们，画在正中间的那条线最「稳」——因为即使新来的数据点有些偏移，它也不容易被分错。这就是 SVM 的核心直觉：寻找一个决策边界，使得离它最近的两个类别的样本点到边界的距离最大化，这个距离称为「间隔」（margin）。

为什么最大间隔这么重要？从统计学习理论的角度看，间隔越大的分类器，其泛化能力越强。Vapnik 和 Chervonenkis 的 VC 维理论严格证明了这一点：间隔越大，模型的 VC 维越低，泛化误差的上界就越紧。换句话说，最大间隔分类器不仅在训练集上表现好，在没见过的数据上也不会太差。这就是 SVM 在深度学习时代之前长期称霸分类任务的原因。

SVM 寻找的不是随便一条分界线，而是那条「最安全」的分界线。距离决策边界最近的那些样本点被称为「支持向量」（Support Vectors）——正是因为它们「支撑」住了间隔，才使得最优超平面的位置被唯一确定。有趣的是，移除所有非支持向量的样本点，SVM 的决策边界不会有任何变化。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs
from sklearn.svm import SVC

# 生成可线性分离的数据
X, y = make_blobs(n_samples=100, centers=2, random_state=42, cluster_std=1.2)

# 训练 SVM
svm = SVC(kernel='linear', C=1.0)
svm.fit(X, y)

# 可视化决策边界和间隔
fig, ax = plt.subplots(figsize=(10, 7))
ax.scatter(X[:, 0], X[:, 1], c=y, cmap='coolwarm', edgecolors='k', s=50)

# 获取超平面参数
w = svm.coef_[0]
b = svm.intercept_[0]
x0_min, x0_max = X[:, 0].min() - 1, X[:, 0].max() + 1
x0_grid = np.linspace(x0_min, x0_max, 100)

# 决策边界和间隔边界
ax.plot(x0_grid, -(w[0] * x0_grid + b) / w[1], 'k-', linewidth=2, label='决策边界')
ax.plot(x0_grid, -(w[0] * x0_grid + b + 1) / w[1], 'k--', linewidth=1, label='间隔边界')
ax.plot(x0_grid, -(w[0] * x0_grid + b - 1) / w[1], 'k--', linewidth=1)

# 标记支持向量
ax.scatter(X[svm.support_, 0], X[svm.support_, 1], s=200, facecolors='none',
           edgecolors='gold', linewidth=2, label='支持向量')
ax.legend()
ax.set_title('SVM 最大间隔分类器')
plt.show()`,
          },
          {
            lang: "python",
            code: `# 验证：支持向量的关键作用
import numpy as np
from sklearn.svm import SVC
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=500, n_features=5, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

svm = SVC(kernel='linear', C=1.0)
svm.fit(X_train, y_train)
n_sv = len(svm.support_)
n_train = len(X_train)
print(f"训练样本: {n_train}, 支持向量: {n_sv} ({n_sv/n_train*100:.1f}%)")

# 移除所有非支持向量，重新训练
sv_mask = np.zeros(n_train, dtype=bool)
sv_mask[svm.support_] = True
X_sv_only = X_train[sv_mask]
y_sv_only = y_train[sv_mask]

svm_sv = SVC(kernel='linear', C=1.0)
svm_sv.fit(X_sv_only, y_sv_only)

acc_full = svm.score(X_test, y_test)
acc_sv = svm_sv.score(X_test, y_test)
print(f"全数据准确率: {acc_full:.4f}")
print(f"仅支持向量准确率: {acc_sv:.4f}")  # 应该完全相同`,
          },
        ],
        table: {
          headers: ["概念", "数学含义", "几何含义", "重要性"],
          rows: [
            ["超平面", "w·x + b = 0", "决策边界", "分类的分界线"],
            ["间隔", "2 / ||w||", "两条虚线间的距离", "越大泛化越好"],
            ["支持向量", "满足 y(w·x+b) = 1 的点", "贴在间隔边界上的点", "唯一决定超平面"],
            ["非支持向量", "满足 y(w·x+b) > 1 的点", "远离边界的点", "移除不影响模型"],
          ],
        },
        mermaid: `graph TD
    A["两类样本点"] --> B["无数条可分离的直线"]
    B --> C["哪条最优?"]
    C --> D["定义间隔 margin"]
    D --> E["最大化间隔"]
    E --> F["得到唯一最优超平面"]
    F --> G["支持向量决定一切"]`,
        tip: "SVM 的预测只依赖于支持向量，所以支持向量的数量直接影响预测速度。如果支持向量太多，考虑调整 C 值或使用核近似方法。",
        warning: "最大间隔只在数据线性可分时才成立。如果两类数据有重叠，硬间隔 SVM 将无解——这就是为什么我们需要软间隔。",
      },
      {
        title: "2. 硬间隔与软间隔：完美与现实的权衡",
        body: `硬间隔 SVM（Hard Margin SVM）要求所有样本都被正确分类，并且间隔边界之内不能有任何样本。这在数学上非常优雅——它等价于一个凸二次规划问题：最小化 ½||w||²，约束条件是 yᵢ(w·xᵢ + b) ≥ 1 对所有样本成立。这个优化问题有全局唯一解，可以用标准的凸优化方法求解。

但现实世界的数据几乎从不是完美线性可分的。噪声、异常值、类别重叠——这些情况都会导致硬间隔 SVM 无法找到可行解，或者找到的超平面被个别异常值严重扭曲。为了解决这个问题，Vapnik 引入了松弛变量 ξᵢ，允许某些样本违反间隔约束。这就得到了软间隔 SVM（Soft Margin SVM）。

软间隔的目标函数变为：最小化 ½||w||² + C·Σξᵢ，其中 C 是一个关键的超参数。C 很大时，模型对误分类的惩罚很重，间隔变窄，趋向于硬间隔；C 很小时，模型容忍更多的误分类，间隔变宽，决策边界更平滑。C 的选择本质上就是偏差-方差权衡：大 C 低偏差高方差（可能过拟合），小 C 高偏差低方差（可能欠拟合）。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.svm import SVC

# 生成有重叠的数据
X, y = make_classification(
    n_samples=200, n_features=2, n_informative=2,
    n_redundant=0, n_clusters_per_class=1,
    flip_y=0.15, random_state=42
)

# 不同 C 值的效果对比
C_values = [0.01, 0.1, 1.0, 10.0, 100.0]
fig, axes = plt.subplots(1, 5, figsize=(20, 4))

for ax, C in zip(axes, C_values):
    svm = SVC(kernel='linear', C=C)
    svm.fit(X, y)

    # 绘制决策区域
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 200),
                         np.linspace(y_min, y_max, 200))
    Z = svm.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    ax.contourf(xx, yy, Z, alpha=0.2, cmap='coolwarm')
    ax.scatter(X[:, 0], X[:, 1], c=y, cmap='coolwarm', edgecolors='k', s=30)
    ax.scatter(X[svm.support_, 0], X[svm.support_, 1], s=80,
               facecolors='none', edgecolors='gold', linewidth=2)
    ax.set_title(f'C = {C}')
    ax.set_aspect('equal')

plt.tight_layout()
plt.show()`,
          },
          {
            lang: "python",
            code: `# 用交叉验证选择最优 C
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.datasets import make_classification
from sklearn.preprocessing import StandardScaler

X, y = make_classification(
    n_samples=1000, n_features=10, n_informative=5,
    flip_y=0.1, random_state=42
)
X = StandardScaler().fit_transform(X)

# 网格搜索最优 C
param_grid = {'C': [0.001, 0.01, 0.1, 0.5, 1.0, 5.0, 10.0, 50.0, 100.0]}
grid = GridSearchCV(
    SVC(kernel='linear'), param_grid, cv=5,
    scoring='accuracy', n_jobs=-1
)
grid.fit(X, y)

print(f"最优 C: {grid.best_params_['C']}")
print(f"交叉验证准确率: {grid.best_score_:.4f}")

# 观察 C 与支持向量数量的关系
C_range = np.logspace(-3, 3, 20)
sv_ratios = []
scores = []

for C in C_range:
    svm = SVC(kernel='linear', C=C)
    scores.append(cross_val_score(svm, X, y, cv=5, scoring='accuracy').mean())
    svm.fit(X, y)
    sv_ratios.append(len(svm.support_) / len(X))

import matplotlib.pyplot as plt
fig, ax1 = plt.subplots(figsize=(10, 5))
ax1.semilogx(C_range, scores, 'b-', linewidth=2, label='CV 准确率')
ax1.set_xlabel('C (对数尺度)')
ax1.set_ylabel('CV 准确率', color='b')
ax2 = ax1.twinx()
ax2.semilogx(C_range, sv_ratios, 'r--', linewidth=2, label='支持向量比例')
ax2.set_ylabel('支持向量比例', color='r')
plt.title('C 值对模型复杂度和准确率的影响')
plt.show()`,
          },
        ],
        table: {
          headers: ["C 值范围", "间隔宽度", "误分类容忍", "偏差", "方差", "适用场景"],
          rows: [
            ["C → 0", "很宽", "很高", "大", "小", "噪声多的数据"],
            ["C = 0.1", "较宽", "较高", "中等", "中等", "一般场景"],
            ["C = 1.0", "适中", "适中", "中等", "中等", "默认起点"],
            ["C = 10", "较窄", "较低", "较小", "较大", "干净的数据"],
            ["C → ∞", "最窄", "零容忍", "很小", "很大", "硬间隔"],
          ],
        },
        mermaid: `graph TD
    A["数据线性可分?"] -->|是| B["硬间隔 SVM"]
    A -->|否| C["软间隔 SVM"]
    B --> D["min ½||w||²"]
    D --> E["s.t. y(w·x+b) ≥ 1"]
    C --> F["min ½||w||² + C·Σξᵢ"]
    F --> G["s.t. y(w·x+b) ≥ 1-ξᵢ"]
    G --> H["ξᵢ ≥ 0"]`,
        tip: "C 的选择建议：先用 C=1.0 作为基线，然后在 [0.01, 0.1, 1, 10, 100] 上做网格搜索。对于高维数据（如文本分类），通常需要较大的 C。",
        warning: "C 太大时 SVM 会过拟合，特别是数据有噪声时。如果训练集准确率接近 100% 但测试集很差，尝试减小 C。",
      },
      {
        title: "3. 对偶问题与 KKT 条件：从原始到对偶的转换",
        body: `SVM 的原始优化问题虽然是一个凸二次规划，但直接求解在高维空间中效率不高。更重要的是，原始形式下核技巧无法引入。因此，我们需要将原始问题转换为对偶问题。这一步是理解 SVM 的关键分水岭。

转换过程使用了拉格朗日乘子法。对于每个约束条件 yᵢ(w·xᵢ + b) - 1 + ξᵢ ≥ 0，我们引入拉格朗日乘子 αᵢ ≥ 0。通过对原始变量 w、b、ξ 求偏导并令其为零，可以消去这些变量，得到一个只关于 α 的优化问题：最大化 Σαᵢ - ½ΣΣαᵢαⱼyᵢyⱼ(xᵢ·xⱼ)，约束条件是 0 ≤ αᵢ ≤ C 且 Σαᵢyᵢ = 0。

对偶问题有几个关键优势。首先，目标函数中样本只以内积 xᵢ·xⱼ 的形式出现，这为核技巧铺平了道路——我们可以把内积替换为核函数 K(xᵢ, xⱼ)，隐式地将数据映射到高维空间。其次，对偶问题是一个凸二次规划，可以用 SMO（Sequential Minimal Optimization）等高效算法求解。最后，KKT 条件告诉我们：只有支持向量对应的 αᵢ > 0，非支持向量的 αᵢ = 0，这保证了 SVM 的稀疏性。`,
        code: [
          {
            lang: "python",
            code: `# 从零实现简化版 SVM 对偶问题求解（使用 cvxopt）
import numpy as np
from cvxopt import matrix, solvers
from sklearn.datasets import make_blobs

# 生成数据
X, y = make_blobs(n_samples=100, centers=2, random_state=42)
y = np.where(y == 0, -1, 1)  # SVM 使用 -1/+1 标签

n_samples = len(X)

# 构造 Gram 矩阵
K = X @ X.T  # 线性核

# 对偶问题：max Σαᵢ - ½ΣΣαᵢαⱼyᵢyⱼKᵢⱼ
# 等价于 min ½α^T P α - q^T α
P = matrix(np.outer(y, y) * K)
q = matrix(-np.ones(n_samples))
G = matrix(np.vstack([-np.eye(n_samples), np.eye(n_samples)]))
h = matrix(np.hstack([np.zeros(n_samples), np.ones(n_samples) * 1e6]))  # 大 C
A = matrix(y.reshape(1, -1), tc='d')
b = matrix(0.0)

solvers.options['show_progress'] = False
solution = solvers.qp(P, q, G, h, A, b)
alpha = np.array(solution['x']).flatten()

# 找出支持向量
sv_idx = np.where(alpha > 1e-5)[0]
print(f"支持向量数量: {len(sv_idx)} / {n_samples}")

# 计算 w 和 b
w = np.sum(alpha[sv_idx, np.newaxis] * y[sv_idx, np.newaxis] * X[sv_idx], axis=0)
b_vals = []
for i in sv_idx:
    b_vals.append(y[i] - np.dot(w, X[i]))
b = np.mean(b_vals)

print(f"w = {w}")
print(f"b = {b:.4f}")
print(f"准确率: {np.mean((X @ w + b > 0).astype(int) == np.where(y == 1, 1, 0)):.4f}")`,
          },
          {
            lang: "python",
            code: `# 验证 KKT 条件
import numpy as np
from sklearn.svm import SVC
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=100, n_features=5, random_state=42)
y = np.where(y == 0, -1, 1)

svm = SVC(kernel='linear', C=1.0)
svm.fit(X, y)

# 获取对偶系数 (alpha)
alpha = svm.dual_coef_[0]
support_vectors = svm.support_vectors_

# 验证 KKT 互补松弛条件
# αᵢ = 0 → 样本在间隔外（正确分类）
# 0 < αᵢ < C → 样本在间隔边界上（支持向量）
# αᵢ = C → 样本在间隔内或误分类

decision_values = svm.decision_function(X)
margins = y * decision_values

print("=== KKT 条件验证 ===")
print(f"正确分类且在间隔外 (margin > 1): {np.sum(margins > 1)} 个")
print(f"在间隔边界上 (margin ≈ 1): {np.sum(np.abs(margins - 1) < 0.01)} 个")
print(f"在间隔内 (0 < margin < 1): {np.sum((margins > 0) & (margins < 1))} 个")
print(f"误分类 (margin < 0): {np.sum(margins < 0)} 个")

# α 的分布
print(f"\\nα = 0 的数量: {np.sum(np.abs(alpha) < 1e-5)}")
print(f"0 < |α| < C 的数量: {np.sum((np.abs(alpha) > 1e-5) & (np.abs(alpha) < 1.0 - 1e-5))}")
print(f"|α| = C 的数量: {np.sum(np.abs(alpha) >= 1.0 - 1e-5)}")`,
          },
        ],
        table: {
          headers: ["KKT 条件", "α 的取值", "样本位置", "含义"],
          rows: [
            ["αᵢ = 0", "零", "间隔之外（正确分类）", "不影响模型，可移除"],
            ["0 < αᵢ < C", "正数", "恰好贴在间隔边界上", "标准支持向量"],
            ["αᵢ = C", "上限值", "间隔之内或误分类", "软间隔支持向量"],
            ["Σαᵢyᵢ = 0", "约束", "全局约束", "保证偏置 b 可解"],
          ],
        },
        mermaid: `graph TD
    A["原始问题"] --> B["构造拉格朗日函数"]
    B --> C["对 w, b, ξ 求偏导"]
    C --> D["消去原始变量"]
    D --> E["得到对偶问题"]
    E --> F["用 SMO 算法求解 α"]
    F --> G["KKT 条件: α > 0 即支持向量"]
    G --> H["w = Σαᵢyᵢxᵢ"]
    H --> I["决策函数: sign(w·x + b)"]`,
        tip: "理解对偶问题的关键不在于推导的每一步，而在于抓住一个核心洞察：样本只以内积形式出现。这直接引出了核技巧。",
        warning: "手动求解对偶问题仅用于学习。实际项目请用 sklearn 的 SVC——它使用优化的 SMO 实现，速度快几个数量级。",
      },
      {
        title: "4. 核技巧：从线性到非线性的魔法",
        body: `核技巧（Kernel Trick）是 SVM 最强大的特性，也是它能在深度学习之前长期统治非线性分类任务的秘密武器。核心思想极其优雅：我们不需要显式地把数据映射到高维空间——只需要找到一个函数 K(xᵢ, xⱼ)，它等于某个映射 φ 下的高维内积 ⟨φ(xᵢ), φ(xⱼ)⟩。

以多项式核为例：K(x, z) = (γx·z + r)^d 等价于先将数据映射到所有 d 阶多项式特征组合的空间中，然后计算内积。如果原始特征有 F 个，d 阶多项式空间的维度是 C(F+d, d)——当 F=100、d=3 时，这个维度高达 176851！如果我们显式计算这个映射，存储和计算都不可行。但核函数只需要 O(F) 的计算量就得到了同样的高维内积结果。

RBF（径向基函数）核 K(x, z) = exp(-γ||x - z||²) 更是将数据映射到了无穷维空间。它衡量的是两个样本的「相似度」——距离越近越相似，核值越大。RBF 核几乎总能将数据变得线性可分（只要 γ 不是极端值），这使得 RBF SVM 成为一个强大的通用分类器。γ 控制着单个样本的影响范围：γ 大 → 每个样本影响范围小 → 决策边界复杂（可能过拟合）；γ 小 → 影响范围大 → 决策边界平滑（可能欠拟合）。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_circles
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler

# 生成非线性可分数据（同心圆）
X, y = make_circles(n_samples=500, factor=0.4, noise=0.1, random_state=42)
X = StandardScaler().fit_transform(X)

# 不同核函数的对比
kernels = ['linear', 'poly', 'rbf', 'sigmoid']
fig, axes = plt.subplots(2, 2, figsize=(12, 12))

for ax, kernel in zip(axes.ravel(), kernels):
    if kernel == 'poly':
        svm = SVC(kernel=kernel, degree=3, C=1.0, gamma='scale')
    elif kernel == 'rbf':
        svm = SVC(kernel=kernel, C=1.0, gamma='scale')
    elif kernel == 'sigmoid':
        svm = SVC(kernel=kernel, C=1.0, gamma='scale')
    else:
        svm = SVC(kernel=kernel, C=1.0)

    svm.fit(X, y)

    # 绘制决策区域
    x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
    y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 300),
                         np.linspace(y_min, y_max, 300))
    Z = svm.decision_function(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    ax.contourf(xx, yy, Z, levels=30, cmap='RdBu', alpha=0.6)
    ax.scatter(X[:, 0], X[:, 1], c=y, cmap='coolwarm', edgecolors='k', s=30)
    ax.scatter(X[svm.support_, 0], X[svm.support_, 1], s=60,
               facecolors='none', edgecolors='gold', linewidth=1.5)
    ax.set_title(f'{kernel} 核 (准确率: {svm.score(X, y):.3f})')
    ax.set_aspect('equal')

plt.tight_layout()
plt.show()`,
          },
          {
            lang: "python",
            code: `# RBF 核的 γ 参数敏感性分析
import numpy as np
import matplotlib.pyplot as plt
from sklearn.svm import SVC
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X, y = make_moons(n_samples=500, noise=0.2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
X_train = StandardScaler().fit_transform(X_train)
X_test = StandardScaler().transform(X_test)

gamma_values = [0.01, 0.1, 1.0, 10.0, 50.0]
fig, axes = plt.subplots(1, 5, figsize=(20, 4))

for ax, gamma in zip(axes, gamma_values):
    svm = SVC(kernel='rbf', gamma=gamma, C=1.0)
    svm.fit(X_train, y_train)

    x_min, x_max = X_train[:, 0].min() - 0.5, X_train[:, 0].max() + 0.5
    y_min, y_max = X_train[:, 1].min() - 0.5, X_train[:, 1].max() + 0.5
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 200),
                         np.linspace(y_min, y_max, 200))
    Z = svm.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    ax.contourf(xx, yy, Z, alpha=0.3, cmap='RdYlBu')
    ax.scatter(X_train[:, 0], X_train[:, 1], c=y_train, cmap='coolwarm',
               edgecolors='k', s=20)
    train_acc = svm.score(X_train, y_train)
    test_acc = svm.score(X_test, y_test)
    ax.set_title(f'γ={gamma}\\n训练:{train_acc:.3f} 测试:{test_acc:.3f}')

plt.tight_layout()
plt.show()`,
          },
        ],
        table: {
          headers: ["核函数", "公式", "超参数", "适用场景", "复杂度"],
          rows: [
            ["线性", "x·z", "无", "高维稀疏数据（文本）", "O(n·d)"],
            ["多项式", "(γx·z+r)^d", "d, γ, r", "图像、有阶数先验", "O(n²·d)"],
            ["RBF", "exp(-γ||x-z||²)", "γ", "通用首选", "O(n²·d)"],
            ["Sigmoid", "tanh(γx·z+r)", "γ, r", "类似神经网络", "O(n²·d)"],
          ],
        },
        mermaid: `graph TD
    A["原始特征空间"] --> B["线性不可分"]
    B --> C["核函数 K(x,z)"]
    C --> D["隐式映射到高维空间"]
    D --> E["高维空间中线性可分"]
    E --> F["RBF: 无穷维"]
    E --> G["多项式: C(d+F,d) 维"]
    E --> H["线性: 原始维度"]`,
        tip: "RBF 核是默认首选。调参时先调 γ（影响范围），再调 C（正则化强度）。常用搜索范围：γ ∈ [1e-3, 1e3]（对数尺度），C ∈ [1e-3, 1e3]。",
        warning: "核函数计算需要存储 n×n 的核矩阵，内存复杂度 O(n²)。当样本量 >50000 时，考虑使用线性核或核近似方法（如 Nystroem、Random Fourier Features）。",
      },
      {
        title: "5. 多分类策略：SVM 天生是二分类器",
        body: `SVM 本质上是一个二分类器——它寻找一个超平面将两类数据分开。但在实际应用中，我们经常需要处理三分类、十分类甚至上百分类的问题。如何将二分类的 SVM 扩展到多分类？主要有两种策略：OvR（One-vs-Rest）和 OvO（One-vs-One）。

OvR 策略为每个类别训练一个二分类器：第 k 个分类器将类别 k 作为正类，其余所有类别作为负类。预测时，选择决策函数值最大的那个分类器对应的类别。如果有 K 个类别，就需要训练 K 个分类器。OvR 的优点是分类器少、训练快；缺点是如果类别不平衡，负类样本远多于正类，可能导致分类器偏向多数类。

OvO 策略为每一对类别训练一个二分类器。K 个类别需要训练 K(K-1)/2 个分类器。预测时使用投票机制：每个分类器对它负责的那一对类别投一票，得票最多的类别胜出。OvO 的优点是每个分类器只在两个类别上训练，数据更纯净，分类器质量更高；缺点是分类器数量随 K 呈平方增长。sklearn 的 SVC 默认使用 OvO，而 LinearSVC 默认使用 OvR。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.svm import SVC, LinearSVC
from sklearn.multiclass import OneVsRestClassifier, OneVsOneClassifier
from sklearn.model_selection import cross_val_score
import time

# 生成 5 分类数据
X, y = make_classification(
    n_samples=2000, n_features=10, n_informative=6,
    n_classes=5, n_clusters_per_class=1, random_state=42
)

# 比较 OvR 和 OvO
strategies = {
    'OvR (SVC)': OneVsRestClassifier(SVC(kernel='rbf', C=1.0)),
    'OvO (SVC)': OneVsOneClassifier(SVC(kernel='rbf', C=1.0)),
    'OvR (LinearSVC)': OneVsRestClassifier(LinearSVC(C=1.0, max_iter=5000)),
    'OvO (LinearSVC)': OneVsOneClassifier(LinearSVC(C=1.0, max_iter=5000)),
}

for name, clf in strategies.items():
    start = time.time()
    scores = cross_val_score(clf, X, y, cv=5, scoring='accuracy')
    train_time = time.time() - start
    print(f"{name:25s} | 准确率: {scores.mean():.4f} ± {scores.std():.4f} | 时间: {train_time:.2f}s")

# 查看内置 SVC 的 OvO 决策
svm = SVC(kernel='rbf', C=1.0, decision_function_shape='ovr')
svm.fit(X, y)
print(f"\\n决策函数形状: {svm.decision_function(X[:5]).shape}")
print(f"每个样本的决策值: {svm.decision_function(X[:5])}")`,
          },
          {
            lang: "python",
            code: `# OvO 投票机制详解
import numpy as np
from sklearn.datasets import load_iris
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from itertools import combinations

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.3, random_state=42
)

classes = np.unique(y_train)
n_classes = len(classes)
print(f"类别: {classes}")
print(f"需要 {n_classes * (n_classes - 1) // 2} 个二分类器")

# 手动实现 OvO
ovo_classifiers = {}
for c1, c2 in combinations(classes, 2):
    mask = (y_train == c1) | (y_train == c2)
    clf = SVC(kernel='rbf', C=1.0)
    clf.fit(X_train[mask], y_train[mask])
    ovo_classifiers[(c1, c2)] = clf
    acc = clf.score(X_test[mask], y_test[mask])
    print(f"  {c1} vs {c2}: 准确率 {acc:.4f}")

# 投票预测
def ovo_predict(X, classifiers, classes):
    votes = np.zeros((len(X), len(classes)))
    for (c1, c2), clf in classifiers.items():
        preds = clf.predict(X)
        for i, p in enumerate(preds):
            votes[i, np.where(classes == p)[0][0]] += 1
    return classes[votes.argmax(axis=1)]

predictions = ovo_predict(X_test, ovo_classifiers, classes)
ovo_acc = np.mean(predictions == y_test)
print(f"\\n手动 OvO 准确率: {ovo_acc:.4f}")

# 与 sklearn 内置对比
sklearn_ovo = SVC(kernel='rbf', C=1.0, decision_function_shape='ovo')
sklearn_ovo.fit(X_train, y_train)
print(f"sklearn OvO 准确率: {sklearn_ovo.score(X_test, y_test):.4f}")`,
          },
        ],
        table: {
          headers: ["策略", "分类器数量", "训练速度", "预测方式", "适用场景"],
          rows: [
            ["OvR", "K", "快", "最大决策值", "类别多、类别平衡"],
            ["OvO", "K(K-1)/2", "慢", "投票", "类别少（<10）"],
            ["DAGSVM", "K(K-1)/2", "中等", "有向无环图遍历", "快速预测"],
            ["Error-Correcting", "可调", "慢", "纠错码解码", "高容错需求"],
          ],
        },
        mermaid: `graph TD
    A["多分类问题 K 类"] --> B{"选择策略"}
    B -->|"OvR"| C["训练 K 个分类器"]
    B -->|"OvO"| D["训练 K(K-1)/2 个分类器"]
    C --> E["预测: 最大决策值"]
    D --> F["预测: 投票机制"]
    E --> G["最终类别"]
    F --> G`,
        tip: "类别数 < 10 时用 OvO（sklearn 的 SVC 默认），类别数 ≥ 10 时用 OvR（LinearSVC 默认）。对于极多分类（>100 类），考虑层次分类或层次 SVM。",
        warning: "OvO 的分类器数量是平方级增长的。100 个类别需要训练 4950 个分类器！此时务必切换到 OvR 或使用层次分类策略。",
      },
      {
        title: "6. SVM vs 逻辑回归：最大间隔与概率的博弈",
        body: `SVM 和逻辑回归（Logistic Regression）都是经典的线性分类器，都能处理高维数据，也都可以通过核技巧或特征工程扩展到非线性场景。但它们的设计哲学截然不同，这导致了在实际应用中的不同表现。

逻辑回归的核心是概率建模——它假设数据服从伯努利分布，通过极大似然估计来拟合参数。它的输出天然是一个概率值，可以直接用于风险评估、排序等场景。SVM 的核心是几何间隔最大化——它寻找「最安全」的分界线，输出是类别标签和到边界的距离（非概率）。SVM 只关心靠近边界的支持向量，远离边界的样本对它毫无影响；逻辑回归则对所有样本「一视同仁」，每个样本都对损失函数有贡献。

这个本质区别带来了几个实际差异。第一，特征缩放的敏感性：SVM 对特征缩放极其敏感，因为间隔的计算依赖于特征的绝对值；逻辑回归虽然也受益于缩放，但不如 SVM 那么关键。第二，稀疏性：SVM 的解是稀疏的（只有支持向量影响模型），逻辑回归的解通常是稠密的（所有特征都有非零权重，除非加 L1 正则化）。第三，核技巧：SVM 天然支持核函数；逻辑回归虽然理论上也能用核方法，但计算开销远大于 SVM。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.calibration import CalibratedClassifierCV

# 生成数据
X, y = make_classification(
    n_samples=1000, n_features=10, n_informative=6,
    flip_y=0.05, random_state=42
)
X = StandardScaler().fit_transform(X)

# 训练两个模型
svm = SVC(kernel='rbf', C=1.0, probability=True)  # 启用概率估计
lr = LogisticRegression(C=1.0, max_iter=1000)

# 交叉验证
svm_scores = cross_val_score(svm, X, y, cv=5, scoring='accuracy')
lr_scores = cross_val_score(lr, X, y, cv=5, scoring='accuracy')
print(f"SVM:  {svm_scores.mean():.4f} ± {svm_scores.std():.4f}")
print(f"LR:   {lr_scores.mean():.4f} ± {lr_scores.std():.4f}")

# 比较决策边界
svm.fit(X, y)
lr.fit(X, y)

# 在二维投影上可视化
from sklearn.decomposition import PCA
X_2d = PCA(n_components=2).fit_transform(X)

fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for ax, (name, model) in zip(axes, [('SVM', svm), ('LR', lr)]):
    x_min, x_max = X_2d[:, 0].min()-0.5, X_2d[:, 0].max()+0.5
    y_min, y_max = X_2d[:, 1].min()-0.5, X_2d[:, 1].max()+0.5
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 100),
                         np.linspace(y_min, y_max, 100))
    Z = model.decision_function(PCA(n_components=10).fit_transform(
        PCA(n_components=2).inverse_transform(np.c_[xx.ravel(), yy.ravel()])
    )).reshape(xx.shape)
    ax.contourf(xx, yy, Z, levels=30, cmap='RdBu', alpha=0.5)
    ax.scatter(X_2d[:, 0], X_2d[:, 1], c=y, cmap='coolwarm', edgecolors='k', s=20)
    ax.set_title(name)
plt.tight_layout()
plt.show()`,
          },
          {
            lang: "python",
            code: `# SVM 概率校准：Platt Scaling vs Isotonic Regression
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss

X, y = make_classification(n_samples=2000, n_features=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 基础 SVM（无概率）
svm_base = SVC(kernel='rbf', C=1.0)
svm_base.fit(X_train, y_train)

# Platt Scaling (sigmoid 校准)
svm_platt = CalibratedClassifierCV(svm_base, method='sigmoid', cv=5)
svm_platt.fit(X_train, y_train)

# Isotonic Regression (非参数校准)
svm_iso = CalibratedClassifierCV(SVC(kernel='rbf', C=1.0), method='isotonic', cv=5)
svm_iso.fit(X_train, y_train)

# Brier Score（概率校准质量）
# 注意：SVM.decision_function 输出不是概率，需要转换
base_scores = brier_score_loss(y_test, 1 / (1 + np.exp(-svm_base.decision_function(X_test))))
platt_scores = brier_score_loss(y_test, svm_platt.predict_proba(X_test)[:, 1])
iso_scores = brier_score_loss(y_test, svm_iso.predict_proba(X_test)[:, 1])

print(f"Platt Scaling Brier Score: {platt_scores:.4f}")
print(f"Isotonic Brier Score:      {iso_scores:.4f}")
print(f"未校准(转换) Brier Score:  {base_scores:.4f}")
print(f"越低越好 → {'Platt' if platt_scores < iso_scores else 'Isotonic'} 校准更优")`,
          },
        ],
        table: {
          headers: ["特性", "SVM", "逻辑回归", "谁更优"],
          rows: [
            ["优化目标", "最大化间隔", "极大似然估计", "各有侧重"],
            ["输出", "类别标签", "概率值", "LR（概率场景）"],
            ["稀疏性", "稀疏（支持向量）", "稠密", "SVM（预测快）"],
            ["核技巧", "天然支持", "可用但慢", "SVM"],
            ["特征缩放敏感性", "极高", "中等", "LR（更鲁棒）"],
            ["大规模数据", "O(n²)~O(n³)", "O(n·d)", "LR（更快）"],
            ["高维稀疏数据", "优秀", "优秀", "平手"],
          ],
        },
        mermaid: `graph TD
    A["分类问题"] --> B{"需要什么?"}
    B -->|"概率输出"| C["逻辑回归"]
    B -->|"最大间隔"| D["SVM"]
    B -->|"大规模数据"| E["逻辑回归 / 线性 SVM"]
    B -->|"非线性+中等数据"| F["RBF SVM"]
    B -->|"高维稀疏"| G["线性 SVM 或 LR"]
    C --> H["需要概率校准"]
    D --> I["需要核技巧"]`,
        tip: "选择建议：需要概率输出 → 逻辑回归；追求最高分类精度且数据量中等 → RBF SVM；大规模高维数据 → 线性 SVM（LinearSVC）或逻辑回归。",
        warning: "SVM 的 decision_function 输出不是概率！如果需要概率，务必使用 probability=True（Platt Scaling）或 CalibratedClassifierCV。",
      },
      {
        title: "7. sklearn 实战：从数据到部署的完整流程",
        body: `理论再好，最终还是要落到代码上。一个完整的 SVM 项目流程包括：数据探索与预处理 → 基线模型 → 超参数调优 → 模型评估 → 部署准备。每一步都有需要注意的陷阱和最佳实践。

数据预处理是 SVM 最关键的前置步骤。由于 SVM 的间隔计算直接依赖于特征的绝对值，如果特征的尺度差异很大（比如一个特征范围是 0-1，另一个是 0-10000），那么间隔就会被大尺度的特征主导，模型实际上忽略了小尺度特征。因此，标准化（StandardScaler）几乎是 SVM 的标配。对于类别特征，需要先进行编码（One-Hot 或 Label Encoding）。

超参数调优方面，RBF 核的 SVM 有两个关键参数：C 和 γ。最经典的调参策略是在对数尺度上做网格搜索：C ∈ {0.001, 0.01, 0.1, 1, 10, 100}，γ ∈ {0.001, 0.01, 0.1, 1, 10, 100}。sklearn 的 GridSearchCV 可以自动完成这个过程。对于大规模数据，建议先用随机搜索（RandomizedSearchCV）缩小范围。

部署时，SVM 模型需要保存支持向量和对应的参数。sklearn 的 joblib 可以序列化整个模型对象。预测时间复杂度是 O(n_sv · d)，其中 n_sv 是支持向量数量，d 是特征维度。如果支持向量太多导致预测太慢，可以考虑模型压缩技术。`,
        code: [
          {
            lang: "python",
            code: `# 完整的 SVM 项目流程
import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
from sklearn.pipeline import Pipeline
import joblib
import matplotlib.pyplot as plt

# 步骤 1: 加载数据
data = load_breast_cancer()
X, y = data.data, data.target
print(f"数据集: {data.DESCR[:200]}...")
print(f"样本数: {X.shape[0]}, 特征数: {X.shape[1]}")
print(f"类别分布: 恶性={np.sum(y==0)}, 良性={np.sum(y==1)}")

# 步骤 2: 划分数据集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 步骤 3: 构建 Pipeline（标准化 + SVM）
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('svm', SVC(kernel='rbf', random_state=42))
])

# 步骤 4: 网格搜索最优参数
param_grid = {
    'svm__C': [0.1, 0.5, 1.0, 5.0, 10.0],
    'svm__gamma': ['scale', 'auto', 0.01, 0.1, 1.0],
}

grid = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid.fit(X_train, y_train)

print(f"\\n最佳参数: {grid.best_params_}")
print(f"交叉验证准确率: {grid.best_score_:.4f}")

# 步骤 5: 详细评估
y_pred = grid.predict(X_test)
y_proba = grid.decision_function(X_test)

print(f"\\n测试集准确率: {grid.score(X_test, y_test):.4f}")
print(f"\\n分类报告:")
print(classification_report(y_test, y_pred, target_names=data.target_names))

# ROC 曲线
fpr, tpr, _ = roc_curve(y_test, y_proba)
roc_auc = auc(fpr, tpr)
plt.figure(figsize=(6, 5))
plt.plot(fpr, tpr, 'b-', linewidth=2, label=f'ROC (AUC = {roc_auc:.4f})')
plt.plot([0, 1], [0, 1], 'k--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('SVM ROC 曲线')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 步骤 6: 保存模型
joblib.dump(grid.best_estimator_, 'svm_breast_cancer.pkl')
print(f"\\n模型已保存。支持向量数量: {grid.best_estimator_.named_steps['svm'].n_support_}")`,
          },
          {
            lang: "python",
            code: `# 模型压缩：减少支持向量数量
import numpy as np
from sklearn.svm import SVC
from sklearn.datasets import load_breast_cancer
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import time

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
X_train = StandardScaler().fit_transform(X_train)
X_test = StandardScaler().transform(X_test)

# 训练原始模型
svm_full = SVC(kernel='rbf', C=1.0, gamma='scale')
svm_full.fit(X_train, y_train)
n_sv_full = len(svm_full.support_)
print(f"原始模型: {n_sv_full} 个支持向量")

# 方法 1: 增大 C 值（减少支持向量）
for C in [10, 50, 100]:
    svm = SVC(kernel='rbf', C=C, gamma='scale')
    svm.fit(X_train, y_train)
    acc = svm.score(X_test, y_test)
    pred_time = time.time()
    svm.predict(X_test)
    pred_time = time.time() - pred_time
    print(f"C={C:5.0f}: {len(svm.support_):3d} SV | 准确率: {acc:.4f} | 预测: {pred_time*1000:.2f}ms")

# 方法 2: 使用 LinearSVC（总是 O(d) 预测）
from sklearn.svm import LinearSVC
linear_svm = LinearSVC(C=1.0, max_iter=5000)
linear_svm.fit(X_train, y_train)
acc = linear_svm.score(X_test, y_test)
print(f"\\nLinearSVC: 无显式支持向量 | 准确率: {acc:.4f} | 预测: O(特征维度)")

# 保存最优模型
best_model = SVC(kernel='rbf', C=5.0, gamma='scale')
best_model.fit(X_train, y_train)
joblib.dump(best_model, 'svm_compressed.pkl')
print(f"\\n压缩模型已保存: {len(best_model.support_)} 个支持向量")`,
          },
        ],
        table: {
          headers: ["流程步骤", "关键操作", "常用工具", "注意事项"],
          rows: [
            ["数据预处理", "标准化、编码、缺失值", "StandardScaler, OneHotEncoder", "SVM 必须标准化"],
            ["数据集划分", "训练/验证/测试", "train_test_split", "用 stratify 保持类别比例"],
            ["基线模型", "默认参数快速训练", "SVC(kernel='rbf')", "建立性能基线"],
            ["超参数调优", "网格/随机搜索", "GridSearchCV", "对数尺度搜索 C 和 γ"],
            ["模型评估", "准确率、混淆矩阵、ROC", "classification_report, roc_curve", "多维度评估"],
            ["模型部署", "序列化、压缩", "joblib.dump", "关注支持向量数量"],
          ],
        },
        mermaid: `graph TD
    A["原始数据"] --> B["探索性分析"]
    B --> C["预处理 Pipeline"]
    C --> D["标准化 + 编码"]
    D --> E["基线 SVM 模型"]
    E --> F["超参数网格搜索"]
    F --> G["最优模型"]
    G --> H["全面评估"]
    H --> I["ROC / 混淆矩阵"]
    I --> J{"达标?"}
    J -->|否| E
    J -->|是| K["模型压缩"]
    K --> L["序列化保存"]
    L --> M["生产部署"]`,
        tip: "Pipeline 是 SVM 项目的最佳实践——它确保标准化和 SVM 训练被当作一个整体进行交叉验证，避免数据泄露。永远不要在 CV 之前单独做标准化。",
        warning: "SVM 的训练时间复杂度在 O(n²) 到 O(n³) 之间。超过 10 万条样本时，考虑使用 SGDClassifier(loss='hinge') 作为线性 SVM 的近似替代。",
      },
    ],
};
