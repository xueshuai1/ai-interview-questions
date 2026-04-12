import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-007",
    title: "支持向量机 SVM：最大间隔分类器",
    category: "ml",
    tags: ["SVM", "分类", "核函数"],
    summary: "从最大间隔直觉到核技巧，深入理解 SVM 的数学原理与实战应用",
    date: "2026-04-12",
    readTime: "25 min",
    level: "进阶",
    content: [
      {
        title: "1. 最大间隔直觉：为什么 SVM 选择「最宽的路」",
        body: `支持向量机（Support Vector Machine, SVM）的核心思想可以用一句话概括：在所有能把两类数据分开的超平面中，选择离两类数据都最远的那个。这个「最远」的距离被称为间隔（Margin），而 SVM 的目标就是最大化这个间隔。

想象一条马路，两侧各有行人。如果马路太窄，任何一侧有人稍微偏移就会被压到；马路越宽，容错能力越强。SVM 正是在寻找这样一条「最宽的马路」——决策边界两侧的空白区域越大，模型对未知数据的泛化能力就越强。

距离超平面最近的几个训练样本点被称为「支持向量」，它们「支撑」着间隔边界。关键性质是：只有支持向量影响最终的决策边界，其他样本点被移走后模型不会改变。这也是 SVM 对高维数据表现优异的原因——最终模型只依赖少量关键样本。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt

def visualize_margin(X, y, w, b):
    """可视化 SVM 决策边界和间隔"""
    plt.scatter(X[:, 0], X[:, 1], c=y, cmap='bwr', edgecolors='k', s=80)
    
    # 决策边界 w·x + b = 0
    x1_min, x1_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    x2_boundary = -(w[0] * np.array([x1_min, x1_max]) + b) / w[1]
    plt.plot([x1_min, x1_max], x2_boundary, 'k-', linewidth=2)
    
    # 正负间隔边界
    margin = 1 / np.linalg.norm(w)
    x2_pos = -(w[0] * np.array([x1_min, x1_max]) + b - 1) / w[1]
    x2_neg = -(w[0] * np.array([x1_min, x1_max]) + b + 1) / w[1]
    plt.plot([x1_min, x1_max], x2_pos, 'k--', alpha=0.5)
    plt.plot([x1_min, x1_max], x2_neg, 'k--', alpha=0.5)
    plt.fill_between([x1_min, x1_max], x2_pos, x2_neg, alpha=0.1, color='green')
    
    plt.title(f'SVM Margin = {2 * margin:.3f}')
    plt.show()`,
          },
          {
            lang: "python",
            code: `# 手动计算点到超平面的距离
def point_to_hyperplane(x, w, b):
    """计算样本点 x 到超平面 w·x + b = 0 的几何距离"""
    return np.abs(np.dot(w, x) + b) / np.linalg.norm(w)

# 生成简单的线性可分数据
np.random.seed(42)
X_pos = np.random.randn(30, 2) + np.array([2, 2])
X_neg = np.random.randn(30, 2) - np.array([2, 2])
X = np.vstack([X_pos, X_neg])
y = np.array([1] * 30 + [-1] * 30)

# 假设已训练好的参数
w_est = np.array([1.0, 1.0])
b_est = 0.0

for xi, yi in zip(X, y):
    dist = point_to_hyperplane(xi, w_est, b_est)
    if yi == 1:
        assert np.dot(w_est, xi) + b_est > 0, "正类点分类错误"
    else:
        assert np.dot(w_est, xi) + b_est < 0, "负类点分类错误"
    print(f"样本距离超平面: {dist:.4f}")`,
          },
        ],
        table: {
          headers: ["概念", "符号", "含义", "在 SVM 中的作用"],
          rows: [
            ["超平面", "w·x + b = 0", "决策边界", "分离两类的分界面"],
            ["函数间隔", "y(w·x + b)", "带符号的间隔", "衡量分类正确性和置信度"],
            ["几何间隔", "y(w·x+b)/||w||", "归一化的距离", "真实的空间距离"],
            ["最大间隔", "2/||w||", "两侧间隔之和", "SVM 优化的目标"],
          ],
        },
        mermaid: `graph TD
    A["训练数据"] --> B["寻找分离超平面"]
    B --> C{"有多个可选超平面？"}
    C -->|是| D["计算每个超平面的间隔"]
    C -->|否| E["线性不可分"]
    D --> F["选择间隔最大的"]
    F --> G["支持向量决定边界"]
    G --> H["得到最优分类器"]`,
        tip: "学习建议：先在二维平面上画几个可分的数据点，手动尝试画不同分割线并计算间隔，这种几何直觉对后续理解对偶问题至关重要。",
        warning: "常见陷阱：函数间隔和几何间隔容易混淆。函数间隔可以通过缩放 w 和 b 任意增大，没有意义；只有几何间隔（除以 ||w|| 后）才是真实距离。",
      },
      {
        title: "2. 硬间隔与软间隔：理想与现实的权衡",
        body: `硬间隔 SVM 要求所有样本都被正确分类且落在间隔之外。这只有在数据严格线性可分时才可能实现。然而现实世界的数据几乎总是含有噪声和重叠，强行追求硬间隔要么无解，要么导致严重过拟合——为了包容一个异常点，间隔被压缩到极小。

软间隔 SVM 引入了松弛变量 ξᵢ（slack variable），允许部分样本违反间隔约束甚至被错误分类。优化目标变为最小化 ||w||²/2 + C·Σξᵢ，其中 C 是正则化参数：C 越大，对误分类的惩罚越重（趋近硬间隔）；C 越小，模型容忍更多误差（间隔更宽，可能更泛化）。

这是一个经典的偏差-方差权衡（Bias-Variance Tradeoff）。大 C 低偏差高方差，小 C 高偏差低方差。选择合适的 C 值需要通过交叉验证来确定，它往往比核函数的选择对模型性能影响更大。`,
        code: [
          {
            lang: "python",
            code: `import cvxpy as cp
import numpy as np

def soft_margin_svm(X, y, C=1.0):
    """用凸优化库求解软间隔 SVM 原始问题
    
    最小化: ||w||²/2 + C·Σξᵢ
    约束:   yᵢ(w·xᵢ + b) >= 1 - ξᵢ, ξᵢ >= 0
    """
    n, p = X.shape
    w = cp.Variable(p)
    b = cp.Variable()
    xi = cp.Variable(n, nonneg=True)
    
    objective = cp.Minimize(0.5 * cp.sum_squares(w) + C * cp.sum(xi))
    constraints = [cp.multiply(y, X @ w + b) >= 1 - xi]
    
    problem = cp.Problem(objective, constraints)
    problem.solve()
    
    return w.value, b.value, xi.value

# 在非线性可分数据上测试
X = np.array([[0, 0], [1, 1], [0.5, 0.5], [2, 2], [3, 3]])
y = np.array([1, 1, -1, -1, -1])

w_opt, b_opt, slacks = soft_margin_svm(X, y, C=1.0)
print(f"最优权重: w = {w_opt}")
print(f"最优偏置: b = {b_opt:.4f}")
print(f"松弛变量: ξ = {slacks}")`,
          },
          {
            lang: "python",
            code: `from sklearn.svm import SVC
import numpy as np
import matplotlib.pyplot as plt

# 比较不同 C 值的效果
np.random.seed(0)
X = np.vstack([
    np.random.randn(50, 2) + [0, 0],
    np.random.randn(50, 2) + [2, 0]
])
X = np.vstack([X, [1, 0.3]])  # 添加一个异常点
y = np.array([0]*50 + [1]*50 + [0])  # 异常点标错类别

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for ax, C_val in zip(axes, [0.01, 1.0, 100.0]):
    clf = SVC(kernel='linear', C=C_val)
    clf.fit(X, y)
    ax.scatter(X[:, 0], X[:, 1], c=y, cmap='bwr', edgecolors='k', s=50)
    
    # 绘制决策边界
    xx = np.linspace(-3, 5, 100)
    yy = -(clf.coef_[0][0] * xx + clf.intercept_[0]) / clf.coef_[0][1]
    ax.plot(xx, yy, 'k-', label=f'C={C_val}')
    ax.set_title(f'C = {C_val}')
    ax.legend()
plt.tight_layout()
plt.show()`,
          },
        ],
        table: {
          headers: ["对比维度", "硬间隔 SVM", "软间隔 SVM", "说明"],
          rows: [
            ["数据要求", "严格线性可分", "允许重叠/噪声", "软间隔更实用"],
            ["优化目标", "min ||w||²/2", "min ||w||²/2 + C·Σξᵢ", "松弛变量允许违规"],
            ["可行性", "不可分时崩溃", "总有可行解", "鲁棒性更强"],
            ["C 参数", "无", "关键超参数", "越大→越接近硬间隔"],
          ],
        },
        mermaid: `graph LR
    A["数据线性可分？"] -->|是| B["硬间隔 SVM"]
    A -->|否/有噪声| C["软间隔 SVM"]
    C --> D["选择 C 值"]
    D --> E["C 大：严格分类"]
    D --> F["C 小：宽容间隔"]
    E --> G["可能过拟合"]
    F --> H["可能欠拟合"]`,
        tip: "学习建议：用 sklearn 在含噪声的数据上试不同 C 值，观察决策边界变化，你会直观感受到 C 对模型的巨大影响。",
        warning: "常见陷阱：当 C 设置过大时，模型会极力拟合每一个训练样本，包括异常值，导致泛化能力急剧下降。一定要用交叉验证选择 C。",
      },
      {
        title: "3. 对偶问题与 KKT 条件：从原始到对偶的数学之美",
        body: `将 SVM 原始问题转化为对偶问题有三个关键原因：第一，对偶问题天然只涉及样本之间的内积运算，这为核技巧铺平了道路；第二，对偶问题的变量个数等于样本数，在高维特征空间中反而更容易求解；第三，KKT 条件揭示了对偶变量 αᵢ 与支持向量的对应关系——只有支持向量对应的 αᵢ 大于零。

原始问题是最小化 ||w||²/2，约束为 yᵢ(w·xᵢ + b) ≥ 1。通过引入拉格朗日乘子 αᵢ ≥ 0，构造拉格朗日函数 L(w, b, α) = ||w||²/2 - Σαᵢ[yᵢ(w·xᵢ + b) - 1]。对 w 和 b 分别求偏导并令为零，得到 w = Σαᵢyᵢxᵢ 和 Σαᵢyᵢ = 0。代入拉格朗日函数消去 w 和 b，就得到了对偶问题。

对偶问题的形式非常优雅：最大化 Σαᵢ - (1/2)ΣᵢΣⱼ αᵢαⱼyᵢyⱼ(xᵢ·xⱼ)，约束为 αᵢ ≥ 0 且 Σαᵢyᵢ = 0。注意目标函数中所有样本都以内积 (xᵢ·xⱼ) 的形式出现，这就是核技巧的入口。`,
        code: [
          {
            lang: "python",
            code: `import cvxpy as cp
import numpy as np

def solve_dual_svm(X, y):
    """求解 SVM 对偶问题
    
    最大化: Σαᵢ - (1/2)ΣᵢΣⱼ αᵢαⱼyᵢyⱼ(xᵢ·xⱼ)
    约束:   αᵢ >= 0, Σαᵢyᵢ = 0
    """
    n = len(y)
    # 计算 Gram 矩阵（内积矩阵）
    K = X @ X.T
    H = np.outer(y, y) * K
    
    alpha = cp.Variable(n)
    objective = cp.Maximize(cp.sum(alpha) - 0.5 * cp.quad_form(alpha, H))
    constraints = [alpha >= 0, alpha @ y == 0]
    
    problem = cp.Problem(objective, constraints)
    problem.solve()
    
    alpha_opt = alpha.value
    # 识别支持向量（αᵢ > 阈值）
    sv_indices = np.where(alpha_opt > 1e-5)[0]
    print(f"支持向量个数: {len(sv_indices)} / {n}")
    
    # 从支持向量恢复 w
    w = (alpha_opt * y) @ X
    # 计算 b（取所有支持向量的平均）
    b_vals = y[sv_indices] - X[sv_indices] @ w
    b = np.mean(b_vals)
    
    return w, b, alpha_opt, sv_indices`,
          },
          {
            lang: "python",
            code: `def kkt_conditions(X, y, alpha, w, b, tol=1e-5):
    """验证 KKT 条件是否满足"""
    n = len(y)
    decisions = y * (X @ w + b)
    
    for i in range(n):
        if alpha[i] > tol:
            # 支持向量应该在间隔边界上: y(w·x+b) = 1
            assert abs(decisions[i] - 1.0) < 1e-3, f"KKT 条件在样本 {i} 处不满足"
        elif alpha[i] < tol:
            # 非支持向量应该在间隔之外: y(w·x+b) >= 1
            assert decisions[i] >= 1.0 - 1e-3, f"KKT 条件在样本 {i} 处不满足"
    
    print("✅ 所有 KKT 条件满足！")
    print(f"支持向量对应的 α 值: {alpha[alpha > tol]}")

# 使用对偶问题的解验证
X = np.array([[1, 2], [2, 3], [3, 1], [4, 1], [5, 3], [3, 4]])
y = np.array([1, 1, 1, -1, -1, -1])

w, b, alphas, sv_idx = solve_dual_svm(X, y)
kkt_conditions(X, y, alphas, w, b)`,
          },
        ],
        table: {
          headers: ["KKT 条件", "数学表达", "物理含义"],
          rows: [
            ["互补松弛", "αᵢ[yᵢ(w·xᵢ+b) - 1] = 0", "要么 αᵢ=0，要么样本恰好在间隔边界上"],
            ["原始可行", "yᵢ(w·xᵢ+b) ≥ 1 - ξᵢ", "分类约束（允许松弛）"],
            ["对偶可行", "αᵢ ≥ 0", "拉格朗日乘子非负"],
            ["梯度为零", "w = Σαᵢyᵢxᵢ", "最优权重是支持向量的线性组合"],
            ["偏置约束", "Σαᵢyᵢ = 0", "拉格朗日对 b 求导的结果"],
          ],
        },
        mermaid: `graph TD
    A["原始问题: min ||w||²/2"] --> B["构造拉格朗日函数"]
    B --> C["对 w, b 求偏导"]
    C --> D["代入消去 w, b"]
    D --> E["对偶问题: max L_D(α)"]
    E --> F["求解 αᵢ"]
    F --> G["αᵢ > 0 → 支持向量"]
    G --> H["恢复 w = Σαᵢyᵢxᵢ"]
    F --> I["计算 b"]`,
        tip: "学习建议：KKT 条件是对偶理论的核心。建议用二维数据手动计算一遍，理解每个条件对应的几何意义，这比死记公式有效得多。",
        warning: "常见陷阱：数值求解时 αᵢ 不会精确等于 0，需要设定一个阈值（如 1e-5）来判断支持向量。阈值过小会包含噪声点，过大会漏掉真正的支持向量。",
      },
      {
        title: "4. 核技巧：从线性到高维的魔法",
        body: `核技巧（Kernel Trick）是 SVM 最强大的特性之一。它的核心洞察是：对偶问题中样本只以内积形式 (xᵢ·xⱼ) 出现。如果我们把样本映射到某个高维（甚至无穷维）空间 φ(x)，只需要计算高维空间中的内积 φ(xᵢ)·φ(xⱼ)，而不需要真正执行高维映射——只要存在一个核函数 K(xᵢ, xⱼ) = φ(xᵢ)·φ(xⱼ) 即可。

RBF 核（径向基函数核）是最常用的核函数：K(x, x') = exp(-γ||x - x'||²)。它对应于将数据映射到无穷维空间，理论上可以拟合任意复杂的决策边界。γ 参数控制单个样本的影响范围：γ 大则每个样本只影响附近的区域（容易过拟合），γ 小则影响范围广（决策边界更平滑）。

多项式核 K(x, x') = (γx·x' + r)ᵈ 对应于 d 阶多项式特征空间。线性核 K(x, x') = x·x' 就是标准的线性 SVM。核函数的选择决定了模型能学习到的模式复杂度。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def linear_kernel(x1, x2):
    """线性核 K(x1, x2) = x1 · x2"""
    return np.dot(x1, x2)

def polynomial_kernel(x1, x2, degree=3, gamma=1.0, coef0=0.0):
    """多项式核 K(x1, x2) = (γ·x1·x2 + r)^d"""
    return (gamma * np.dot(x1, x2) + coef0) ** degree

def rbf_kernel(x1, x2, gamma=1.0):
    """RBF 核 K(x1, x2) = exp(-γ||x1-x2||²)"""
    return np.exp(-gamma * np.linalg.norm(x1 - x2) ** 2)

def sigmoid_kernel(x1, x2, gamma=1.0, coef0=0.0):
    """Sigmoid 核 K(x1, x2) = tanh(γ·x1·x2 + r)"""
    return np.tanh(gamma * np.dot(x1, x2) + coef0)

# 演示：两个向量的不同核函数值
a = np.array([1.0, 2.0])
b = np.array([3.0, 0.5])

print(f"线性核:   {linear_kernel(a, b):.4f}")
print(f"多项式核: {polynomial_kernel(a, b, degree=2):.4f}")
print(f"RBF 核:   {rbf_kernel(a, b, gamma=0.5):.4f}")
print(f"Sigmoid:  {sigmoid_kernel(a, b):.4f}")`,
          },
          {
            lang: "python",
            code: `from sklearn.svm import SVC
from sklearn.datasets import make_circles
import matplotlib.pyplot as plt

# 生成非线性数据（同心圆）
X, y = make_circles(n_samples=200, noise=0.1, factor=0.3, random_state=42)

# 用不同核函数对比
kernels = ['linear', 'poly', 'rbf', 'sigmoid']
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

for ax, kernel in zip(axes.ravel(), kernels):
    clf = SVC(kernel=kernel, gamma='scale', degree=3)
    clf.fit(X, y)
    
    # 绘制决策边界
    xx, yy = np.meshgrid(
        np.linspace(X[:, 0].min() - 0.5, X[:, 0].max() + 0.5, 100),
        np.linspace(X[:, 1].min() - 0.5, X[:, 1].max() + 0.5, 100)
    )
    Z = clf.decision_function(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    
    ax.contourf(xx, yy, Z, levels=50, cmap='RdBu', alpha=0.6)
    ax.scatter(X[:, 0], X[:, 1], c=y, cmap='bwr', edgecolors='k', s=60)
    ax.set_title(f'{kernel.upper()} kernel, acc={clf.score(X, y):.3f}')
    ax.axis('equal')

plt.tight_layout()
plt.show()`,
          },
        ],
        table: {
          headers: ["核函数", "公式", "参数", "适用场景", "复杂度"],
          rows: [
            ["线性核", "x·x'", "无", "高维稀疏数据", "O(n·d)"],
            ["多项式核", "(γx·x'+r)ᵈ", "d, γ, r", "图像处理", "O(n·d)"],
            ["RBF 核", "exp(-γ||x-x'||²)", "γ", "通用首选", "O(n·d)"],
            ["Sigmoid 核", "tanh(γx·x'+r)", "γ, r", "类神经网络", "O(n·d)"],
          ],
        },
        mermaid: `graph LR
    A["原始空间: 线性不可分"] --> B["核函数 K(x,x')"]
    B --> C["隐式映射到\n高维空间 φ(x)"]
    C --> D["在高维空间中\n线性可分"]
    D --> E["用对偶问题求解"]
    E --> F["核矩阵 Gram = K(X,X)"]
    F --> G["得到非线性分类器"]`,
        tip: "学习建议：RBF 核是默认首选，先用它跑通流程，再根据具体需求尝试多项式核。线性核在高维稀疏数据（如文本）上往往就够用了。",
        warning: "常见陷阱：使用自定义核函数时必须保证它是正定核（Mercer 条件），否则 SVM 的优化问题可能没有全局最优解。sklearn 的 precomputed 核矩阵需要手动检查正定性。",
      },
      {
        title: "5. 多分类策略：从二分类到多分类的扩展",
        body: `SVM 天然是一个二分类器。要处理多分类任务，需要通过组合多个二分类器来实现。主要有两种策略：一对多（One-vs-Rest, OvR）和一对一（One-vs-One, OvO）。

OvR 策略为每个类别训练一个分类器：第 k 个分类器将类别 k 的样本作为正类，其余所有样本作为负类。预测时，取 k 个分类器中置信度最高的那个。OvR 需要训练 K 个分类器（K 为类别数），每个分类器的训练数据是全集。

OvO 策略为每对类别训练一个分类器：类别 i vs 类别 j。预测时，让所有分类器投票，得票最多的类别获胜。OvO 需要训练 K(K-1)/2 个分类器，但每个分类器只使用两个类别的数据，训练更快。sklearn 中 SVC 默认使用 OvO，而 LinearSVC 默认使用 OvR。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.svm import SVC
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score

iris = load_iris()
X, y = iris.data, iris.target

# OvO（SVC 默认）
svc_ovo = SVC(kernel='rbf', decision_function_shape='ovo')
scores_ovo = cross_val_score(svc_ovo, X, y, cv=5)
print(f"OvO 准确率: {scores_ovo.mean():.4f} (+/- {scores_ovo.std():.4f})")

# OvR
svc_ovr = SVC(kernel='rbf', decision_function_shape='ovr')
scores_ovr = cross_val_score(svc_ovr, X, y, cv=5)
print(f"OvR 准确率: {scores_ovr.mean():.4f} (+/- {scores_ovr.std():.4f})")

# 查看决策函数输出
svc_ovo.fit(X, y)
print(f"\nOvO 决策函数形状: {svc_ovo.decision_function(X[:3]).shape}")
# OvO: n_class*(n_class-1)/2 = 3 个二分类器 → 3 列
print(f"OvO 投票结果: {svc_ovo.predict(X[:3])}")`,
          },
          {
            lang: "python",
            code: `# 深入理解决策函数的含义
from sklearn.svm import SVC
import numpy as np

# 用鸢尾花数据训练 OvO 分类器
svc = SVC(kernel='linear', decision_function_shape='ovo')
svc.fit(iris.data, iris.target)

# 对于前 5 个样本，查看每个二分类器的输出
decisions = svc.decision_function(iris.data[:5])
print("OvO 决策值（3 个二分类器）:")
print("列: [0vs1, 0vs2, 1vs2]")
for i, row in enumerate(decisions):
    true_label = iris.target_names[iris.target[i]]
    pred_label = iris.target_names[svc.predict([iris.data[i]])[0]]
    print(f"样本 {i}: {row} → 预测: {pred_label}, 真实: {true_label}")

# 分析置信度
confidence = np.abs(decisions).mean(axis=1)
print(f"\n平均置信度: {confidence.mean():.4f}")
print(f"低置信度样本（可能需要核函数调整）: {confidence.argmin()}")`,
          },
        ],
        table: {
          headers: ["策略", "分类器数", "每个分类器数据", "预测方式", "适用场景"],
          rows: [
            ["OvR", "K", "全集（正类=当前类）", "最大置信度", "类别少、数据量小"],
            ["OvO", "K(K-1)/2", "两个类别的子集", "多数投票", "类别多、数据量大"],
            ["DAG-SVM", "K(K-1)/2", "两个类别的子集", "有向无环图", "需要快速推理"],
          ],
        },
        mermaid: `graph TD
    A["K 类分类问题"] --> B{多分类策略}
    B -->|OvR| C["训练 K 个分类器"]
    B -->|OvO| D["训练 K(K-1)/2 个分类器"]
    C --> E["每个: 当前类 vs 其余"]
    D --> F["每个: 类别 i vs 类别 j"]
    E --> G["预测: max 决策值"]
    F --> H["预测: 多数投票"]
    G --> I["输出最终类别"]
    H --> I`,
        tip: "学习建议：类别数 K < 10 时 OvO 和 OvR 差距不大；K 很大时 OvR 更高效（分类器少）。可以用 cross_val_score 在同一数据集上比较两者的实际表现。",
        warning: "常见陷阱：OvR 的决策函数值在不同分类器之间不可直接比较（因为每个分类器的训练集不同），可能导致某些类别被系统性偏向。类别不平衡时这种偏向尤其严重。",
      },
      {
        title: "6. SVM 与逻辑回归对比：何时选谁？",
        body: `SVM 和逻辑回归（Logistic Regression, LR）都是经典的线性分类器，但它们的优化目标和适用场景有本质区别。

SVM 关注的是「间隔最大化」——只关心离决策边界最近的几个样本（支持向量），对远处的样本完全不在乎。这使得 SVM 对远离边界的异常值天然鲁棒。逻辑回归关注的是「概率最大化」——每个样本都贡献梯度，即使远离边界的样本也会影响模型参数。

在实际应用中：数据量小时 SVM（尤其带核函数的 SVM）通常表现更好，因为它的高偏差特性在数据有限时反而是一种正则化；数据量大时逻辑回归往往更优——训练更快、输出概率、易于在线学习。高维稀疏数据（如 NLP 的 TF-IDF 特征）上两者差距不大，但 LR 训练速度明显更快。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import time

# 创建数据集
X, y = make_classification(
    n_samples=5000, n_features=20, n_informative=15,
    n_redundant=5, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# SVM vs 逻辑回归对比
for model, name in [
    (SVC(kernel='linear', C=1.0), "SVM (线性核)"),
    (LogisticRegression(C=1.0, max_iter=1000), "逻辑回归"),
]:
    t0 = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - t0
    accuracy = model.score(X_test, y_test)
    
    print(f"{name}:")
    print(f"  训练时间: {train_time:.4f}s")
    print(f"  测试准确率: {accuracy:.4f}")
    if hasattr(model, 'support_vectors_'):
        print(f"  支持向量数: {len(model.support_vectors_)}")`,
          },
          {
            lang: "python",
            code: `# 对比：决策边界形状与概率输出
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.datasets import make_moons

X, y = make_moons(n_samples=200, noise=0.3, random_state=42)

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# 逻辑回归（线性边界）
lr = LogisticRegression(C=10)
lr.fit(X, y)
axes[0].scatter(X[:, 0], X[:, 1], c=y, cmap='bwr', edgecolors='k', s=50)
xx = np.linspace(-1.5, 2.5, 100)
yy = -(lr.coef_[0][0] * xx + lr.intercept_[0]) / lr.coef_[0][1]
axes[0].plot(xx, yy, 'k-', linewidth=2)
axes[0].set_title(f'Logistic Regression (acc={lr.score(X, y):.3f})')

# SVM 线性核
svm_lin = SVC(kernel='linear', C=10)
svm_lin.fit(X, y)
axes[1].scatter(X[:, 0], X[:, 1], c=y, cmap='bwr', edgecolors='k', s=50)
yy2 = -(svm_lin.coef_[0][0] * xx + svm_lin.intercept_[0]) / svm_lin.coef_[0][1]
axes[1].plot(xx, yy2, 'k-', linewidth=2)
axes[1].scatter(svm_lin.support_vectors_[:, 0], svm_lin.support_vectors_[:, 1],
                s=200, facecolors='none', edgecolors='green', linewidths=2)
axes[1].set_title(f'SVM Linear (acc={svm_lin.score(X, y):.3f})')

# SVM RBF 核
svm_rbf = SVC(kernel='rbf', gamma='scale', C=10)
svm_rbf.fit(X, y)
axes[2].scatter(X[:, 0], X[:, 1], c=y, cmap='bwr', edgecolors='k', s=50)
xx2, yy3 = np.meshgrid(np.linspace(-1.5, 2.5, 100), np.linspace(-1.5, 1.5, 100))
Z = svm_rbf.decision_function(np.c_[xx2.ravel(), yy3.ravel()])
Z = Z.reshape(xx2.shape)
axes[2].contour(xx2, yy3, Z, levels=[0], colors='k')
axes[2].scatter(svm_rbf.support_vectors_[:, 0], svm_rbf.support_vectors_[:, 1],
                s=200, facecolors='none', edgecolors='green', linewidths=2)
axes[2].set_title(f'SVM RBF (acc={svm_rbf.score(X, y):.3f})')

plt.tight_layout()
plt.show()`,
          },
        ],
        table: {
          headers: ["对比维度", "SVM", "逻辑回归", "说明"],
          rows: [
            ["优化目标", "最大化间隔", "最大化似然", "根本差异"],
            ["损失函数", "Hinge Loss", "Log Loss", "Hinge 对远处样本不敏感"],
            ["输出", "决策值/类别", "概率", "LR 天然输出概率"],
            ["核函数", "支持", "不支持", "SVM 独有优势"],
            ["大数据量", "较慢", "很快", "LR 可在线学习"],
            ["小数据量", "通常更好", "可能过拟合", "SVM 正则化更强"],
          ],
        },
        mermaid: `graph TD
    A["选择分类器"] --> B{"数据量大小？"}
    B -->|小 < 1万| C["数据维度高？"]
    B -->|大 > 10万| D["逻辑回归优先"]
    C -->|是 d > 1000| E["线性 SVM 或 LR"]
    C -->|否| F["核 SVM（RBF）"]
    D --> G{"需要概率输出？"}
    G -->|是| H["逻辑回归"]
    G -->|否| I["线性 SVM"]
    E --> J{"需要概率？"}
    J -->|是| H
    J -->|否| I`,
        tip: "学习建议：不要盲目选择。先用逻辑回归跑基线，再用 SVM 核函数看是否提升。如果提升不明显，选更快的逻辑回归——简单模型就是好模型。",
        warning: "常见陷阱：SVM 的 Hinge Loss 不输出校准的概率。如果业务需要概率（如风控），可以用 Platt 缩放或等渗回归校准，但会增加计算开销。此时逻辑回归是更直接的选择。",
      },
      {
        title: "7. sklearn 实战：从零到精通的 SVM 工作流",
        body: `掌握了理论之后，让我们在真实数据上完成一个完整的 SVM 建模流程。关键步骤包括：数据预处理（标准化对 SVM 至关重要）、核函数选择、超参数调优（网格搜索）、模型评估和结果解释。

SVM 对特征的尺度极其敏感。因为间隔的计算依赖距离度量，如果一个特征的范围是 [0, 1]，另一个是 [0, 1000]，后者会主导距离计算。标准化（StandardScaler）或归一化（MinMaxScaler）是 SVM 的必选项。

超参数调优的核心是 C 和 γ 的联合搜索。对数网格（如 C ∈ [0.01, 0.1, 1, 10, 100]，γ ∈ [0.001, 0.01, 0.1, 1]）比均匀网格更高效，因为这两个参数的影响通常是对数线性的。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.datasets import load_breast_cancer

# 1. 加载数据
data = load_breast_cancer()
X, y = data.data, data.target
print(f"数据集: {X.shape[0]} 样本, {X.shape[1]} 特征")

# 2. 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. 标准化（SVM 必需！）
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # 注意：用训练集的均值和方差

# 4. 网格搜索调参
param_grid = {
    'C': [0.01, 0.1, 1, 10, 100],
    'gamma': ['scale', 'auto', 0.001, 0.01, 0.1, 1],
    'kernel': ['rbf', 'poly']
}

grid = GridSearchCV(SVC(), param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid.fit(X_train_scaled, y_train)

print(f"\n最佳参数: {grid.best_params_}")
print(f"交叉验证最佳准确率: {grid.best_score_:.4f}")

# 5. 测试集评估
best_svm = grid.best_estimator_
y_pred = best_svm.predict(X_test_scaled)
print(f"\n测试集准确率: {best_svm.score(X_test_scaled, y_test):.4f}")
print(f"\n分类报告:")
print(classification_report(y_test, y_pred, target_names=data.target_names))`,
          },
          {
            lang: "python",
            code: `# 模型解释：分析支持向量和决策函数
import numpy as np

print(f"支持向量数: {len(best_svm.support_vectors_)} / {len(X_train)} "
      f"({100*len(best_svm.support_vectors_)/len(X_train):.1f}%)")
print(f"类别: {best_svm.classes_}")

# 决策函数值的分布
decisions = best_svm.decision_function(X_test_scaled)
correct = decisions * (2*y_test - 1)  # 转换为 {+1, -1}
print(f"\n正确分类的样本决策值: mean={correct[correct > 0].mean():.4f}, "
      f"min={correct[correct > 0].min():.4f}")
print(f"错误分类的样本决策值: mean={correct[correct < 0].mean():.4f}, "
      f"max={correct[correct < 0].max():.4f}")

# 特征重要性近似（线性核的权重绝对值）
linear_svm = SVC(kernel='linear', C=grid.best_params_['C'])
linear_svm.fit(X_train_scaled, y_train)
weights = np.abs(linear_svm.coef_[0])
top_features = np.argsort(weights)[-10:]

print("\nTop 10 重要特征:")
for idx in reversed(top_features):
    print(f"  {data.feature_names[idx]:20s}: {weights[idx]:.4f}")`,
          },
        ],
        table: {
          headers: ["步骤", "关键操作", "原因", "常见错误"],
          rows: [
            ["预处理", "StandardScaler 标准化", "SVM 对尺度敏感", "忘记 transform 测试集"],
            ["调参", "GridSearchCV + 对数网格", "C 和 γ 影响巨大", "网格范围不合理"],
            ["评估", "交叉验证 + 分类报告", "准确率不够全面", "只看准确率忽略召回"],
            ["解释", "支持向量分析 + 权重", "理解模型决策", "忽略错误样本分析"],
          ],
        },
        mermaid: `graph LR
    A["原始数据"] --> B["划分训练/测试集"]
    B --> C["StandardScaler 标准化"]
    C --> D["GridSearchCV\n调参 (C, gamma, kernel)"]
    D --> E["最佳模型"]
    E --> F["测试集评估"]
    F --> G["分类报告\n混淆矩阵"]
    G --> H["模型解释\n支持向量分析"]
    H --> I["部署/优化"]`,
        tip: "学习建议：完整的 SVM 建模流程应该是：预处理 → 基线模型 → 网格搜索 → 评估 → 分析错误 → 调整。每一步都做，不要跳步。先确保预处理正确，否则调参毫无意义。",
        warning: "常见陷阱：标准化时测试集必须用训练集的均值和方差（scaler.transform），不能重新拟合（scaler.fit_transform）。否则测试集信息泄露到训练过程，评估结果不可靠。",
      },
    ],
};
