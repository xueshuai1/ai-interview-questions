// Knowledge base data - AI learning articles

export interface ArticleSection {
  title: string;
  body?: string;
  code?: { lang: string; code: string; filename?: string }[];
  table?: { headers: string[]; rows: string[][] };
  mermaid?: string;
  list?: string[];
  tip?: string;
  warning?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  date: string;
  readTime: string;
  level: "入门" | "进阶" | "高级";
  content?: ArticleSection[];
}

export const categories = [
  { key: "all", label: "全部", icon: "📋" },
  { key: "ml", label: "机器学习", icon: "📊" },
  { key: "dl", label: "深度学习", icon: "🧠" },
  { key: "nlp", label: "自然语言处理", icon: "💬" },
  { key: "cv", label: "计算机视觉", icon: "👁️" },
  { key: "llm", label: "大语言模型", icon: "🤖" },
  { key: "agent", label: "AI Agent", icon: "🦾" },
];

export const articles: Article[] = [
  // 机器学习
  {
    id: "ml-001",
    title: "线性回归：机器学习的第一课",
    category: "ml",
    tags: ["监督学习", "回归", "基础"],
    summary: "从最小二乘法到梯度下降，理解线性回归的数学原理与实现",
    date: "2026-04-10",
    readTime: "18 min",
    level: "入门",
    content: [
      {
        title: "1. 什么是线性回归？",
        body: `线性回归是机器学习中最基础、最重要的算法之一。它的核心思想非常简单：假设输入特征和输出目标之间存在线性关系，我们试图找到一条直线（或多维空间中的一个超平面），使得这条线能够最好地拟合数据点。

形式化地说，给定 n 个样本，每个样本有 p 个特征，线性回归模型可以表示为：y = w₀ + w₁x₁ + w₂x₂ + ... + wₚxₚ + ε，其中 w 是待学习的权重参数，ε 是随机误差项。

不要被"简单"这个词欺骗——线性回归是理解几乎所有现代机器学习算法的基石。神经网络中的每个神经元本质上都是一个线性变换加上非线性激活函数；正则化技术（L1/L2）首先在线性回归中被提出；甚至深度学习中的优化方法也源于对线性回归损失函数的梯度分析。`,
        mermaid: `graph LR
    A["输入特征 x"] --> B["线性组合: w·x + b"]
    B --> C["预测值 ŷ"]
    D["真实值 y"] --> E["损失函数 MSE"]
    C --> E
    E --> F["优化算法"]
    F -.->|更新参数| B`,
        tip: "学习建议：不要跳过数学推导。亲手推一遍最小二乘法的解析解，这会让你对后面所有基于梯度的优化方法有更深的理解。",
      },
      {
        title: "2. 损失函数：如何衡量拟合的好坏",
        body: `训练线性回归模型的第一步是定义一个损失函数（Loss Function），用来衡量模型预测值与真实值之间的差距。最常用的是均方误差（Mean Squared Error, MSE）：MSE = (1/n) Σ(yᵢ - ŷᵢ)²。

选择 MSE 有三个深层原因：第一，它对大误差给予更大的惩罚（平方项），这使得模型对异常值敏感；第二，MSE 是凸函数，保证了梯度下降能够找到全局最优解；第三，从概率角度看，最小化 MSE 等价于在误差服从高斯分布的假设下进行极大似然估计。

除了 MSE，还有平均绝对误差（MAE）和 Huber Loss。MAE 对异常值更鲁棒，但在零点不可导；Huber Loss 结合了 MSE 和 MAE 的优点：小误差时用平方项保证光滑性，大误差时用绝对项减少异常值影响。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def mse_loss(y_true, y_pred):
    """均方误差损失（MSE）"""
    return np.mean((y_true - y_pred) ** 2)

def mae_loss(y_true, y_pred):
    """平均绝对误差损失（MAE）"""
    return np.mean(np.abs(y_true - y_pred))

def huber_loss(y_true, y_pred, delta=1.0):
    """Huber Loss：结合 MSE 和 MAE 的优点"""
    residual = np.abs(y_true - y_pred)
    quadratic = np.minimum(residual, delta)
    linear = residual - quadratic
    return np.mean(0.5 * quadratic ** 2 + delta * linear)

# 对比三种损失函数对异常值的敏感度
y_true = np.array([1, 2, 3, 4, 5])
y_pred_good = np.array([1.1, 2.1, 3.1, 4.1, 5.1])
y_pred_outlier = np.array([1.1, 2.1, 3.1, 4.1, 20.0])

print(f"好预测  MSE: {mse_loss(y_true, y_pred_good):.4f}")
print(f"异常值  MSE: {mse_loss(y_true, y_pred_outlier):.4f}")
print(f"好预测  MAE: {mae_loss(y_true, y_pred_good):.4f}")
print(f"异常值  MAE: {mae_loss(y_true, y_pred_outlier):.4f}")`,
          },
        ],
        table: {
          headers: ["损失函数", "公式", "可导性", "异常值鲁棒性", "适用场景"],
          rows: [
            ["MSE", "(1/n)Σ(y-ŷ)²", "✅ 处处可导", "❌ 敏感", "误差服从正态分布"],
            ["MAE", "(1/n)Σ|y-ŷ|", "❌ 零点不可导", "✅ 鲁棒", "数据含较多异常值"],
            ["Huber", "分段函数", "✅ 处处可导", "✅ 鲁棒", "兼顾精度与鲁棒性"],
          ],
        },
      },
      {
        title: "3. 解析解：最小二乘法的矩阵推导",
        body: `线性回归有一个优雅的闭式解（Closed-form Solution），可以直接通过矩阵运算得到最优参数，无需迭代。

将模型写成矩阵形式：ŷ = Xw，其中 X 是 n×(p+1) 的设计矩阵（包含一列全 1 的偏置项），w 是 (p+1)×1 的参数向量。最小化 MSE 损失函数 J(w) = (1/n)(Xw - y)ᵀ(Xw - y)。

对 w 求导并令导数为零：∂J/∂w = (2/n)Xᵀ(Xw - y) = 0，解得：w = (XᵀX)⁻¹Xᵀy。这就是著名的正规方程（Normal Equation）。

解析解的优势是一次性得到精确解，不需要调学习率、不需要迭代。但它有致命缺陷：计算 (XᵀX)⁻¹ 的时间复杂度是 O(p³)，当特征数量 p 很大时（比如 p > 10000），求逆运算极其昂贵甚至内存溢出。因此，实际工程中通常使用梯度下降而非解析解。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class LinearRegressionNormalEquation:
    """使用正规方程求解线性回归（解析解）"""

    def __init__(self):
        self.weights = None

    def fit(self, X, y):
        # 添加偏置列（全 1）
        X_b = np.c_[np.ones(X.shape[0]), X]
        # 正规方程: w = (X^T X)^{-1} X^T y
        self.weights = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y
        return self

    def predict(self, X):
        X_b = np.c_[np.ones(X.shape[0]), X]
        return X_b @ self.weights

# 使用 sklearn 生成测试数据
from sklearn.datasets import make_regression
X, y = make_regression(n_samples=200, n_features=3, noise=10, random_state=42)

model = LinearRegressionNormalEquation()
model.fit(X, y)
predictions = model.predict(X)
mse = np.mean((y - predictions) ** 2)
print(f"MSE: {mse:.2f}")
print(f"权重: {model.weights}")`,
          },
        ],
      },
      {
        title: "4. 梯度下降：机器学习的通用优化引擎",
        body: `当解析解不可行时（特征太多、数据太大、或模型非线性），我们需要使用迭代优化方法。梯度下降是其中最核心的算法。

核心思想：损失函数 J(w) 关于参数 w 的梯度 ∇J(w) 指向函数增长最快的方向，所以沿着负梯度方向更新参数，就能逐步降低损失。更新公式：w := w - α·∇J(w)，其中 α 是学习率。

梯度下降有三种变体：批量梯度下降（BGD）使用全部数据计算梯度，保证收敛但速度慢；随机梯度下降（SGD）每次只用一个样本，速度快但波动大；小批量梯度下降（Mini-batch GD）折中两者，是深度学习中最常用的方法。`,
        code: [
          {
            lang: "python",
            code: `class LinearRegressionGD:
    """使用梯度下降求解线性回归"""

    def __init__(self, lr=0.01, n_iters=1000, batch_size=None):
        self.lr = lr
        self.n_iters = n_iters
        self.batch_size = batch_size  # None 表示 BGD
        self.weights = None
        self.loss_history = []

    def fit(self, X, y):
        n_samples, n_features = X.shape
        X_b = np.c_[np.ones(n_samples), X]
        self.weights = np.zeros(n_features + 1)

        for i in range(self.n_iters):
            if self.batch_size is None:
                y_pred = X_b @ self.weights
                gradients = (2 / n_samples) * X_b.T @ (y_pred - y)
            else:
                indices = np.random.choice(n_samples, self.batch_size)
                X_batch, y_batch = X_b[indices], y[indices]
                y_pred = X_batch @ self.weights
                gradients = (2 / self.batch_size) * X_batch.T @ (y_pred - y_batch)

            self.weights -= self.lr * gradients

            if i % 100 == 0:
                loss = np.mean((X_b @ self.weights - y) ** 2)
                self.loss_history.append(loss)
        return self

    def predict(self, X):
        X_b = np.c_[np.ones(X.shape[0]), X]
        return X_b @ self.weights`,
          },
        ],
        mermaid: `graph TD
    A["初始化权重 w=0"] --> B["计算梯度"]
    B --> C{"选择梯度下降变体"}
    C -->|BGD 全部数据| D["稳定但慢"]
    C -->|SGD 单样本| E["快但波动大"]
    C -->|Mini-batch| F["折中方案"]
    D --> G["更新: w = w - α·∇J"]
    E --> G
    F --> G
    G --> H{"收敛？"}
    H -->|否| B
    H -->|是| I["输出最优权重 w*"]`,
        table: {
          headers: ["变体", "每次迭代样本数", "收敛速度", "稳定性", "适用场景"],
          rows: [
            ["BGD", "n（全部）", "慢", "✅ 稳定", "小数据集"],
            ["SGD", "1", "快", "❌ 波动大", "超大数据集"],
            ["Mini-batch", "b（通常 32-256）", "快", "✅ 较稳定", "深度学习标准"],
          ],
        },
      },
      {
        title: "5. 正则化：防止过拟合的利器",
        body: `当模型过于复杂或特征之间存在共线性时，线性回归容易过拟合训练数据。正则化通过在损失函数中增加惩罚项来约束模型复杂度。

L2 正则化（Ridge 回归）：在 MSE 基础上加上 λΣwⱼ²。它使权重趋向于小值但不为零，相当于给参数施加了高斯先验。

L1 正则化（Lasso 回归）：加上 λΣ|wⱼ|。它的独特之处在于可以将某些权重精确压缩到零，实现自动特征选择。这等价于拉普拉斯先验。

弹性网络（Elastic Net）：结合 L1 和 L2，同时获得特征选择和共线性处理能力。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class RidgeRegression:
    """L2 正则化线性回归（Ridge）"""

    def __init__(self, alpha=1.0):
        self.alpha = alpha
        self.weights = None

    def fit(self, X, y):
        X_b = np.c_[np.ones(X.shape[0]), X]
        n_features = X_b.shape[1]
        reg_matrix = self.alpha * np.eye(n_features)
        reg_matrix[0, 0] = 0  # 偏置项不惩罚
        self.weights = np.linalg.inv(X_b.T @ X_b + reg_matrix) @ X_b.T @ y
        return self

    def predict(self, X):
        X_b = np.c_[np.ones(X.shape[0]), X]
        return X_b @ self.weights`,
          },
        ],
        table: {
          headers: ["方法", "惩罚项", "特征选择", "解析解", "适用场景"],
          rows: [
            ["普通最小二乘", "无", "❌", "✅", "特征少，无共线性"],
            ["Ridge (L2)", "λΣw²", "❌", "✅", "特征共线性强"],
            ["Lasso (L1)", "λΣ|w|", "✅ 自动选择", "❌ 需迭代", "需要特征选择"],
            ["Elastic Net", "λ₁Σ|w|+λ₂Σw²", "✅ 自动选择", "❌ 需迭代", "高维数据（p>>n）"],
          ],
        },
        warning: "正则化前务必对特征进行标准化（StandardScaler）！因为 L1/L2 惩罚对量纲敏感，未标准化的特征会导致惩罚项不公平地偏向某些特征。",
      },
      {
        title: "6. 模型评估：不止看 R²",
        body: `训练完线性回归模型后，如何科学地评估它的好坏？

R²（决定系数）衡量模型解释了多少目标变量的方差：R² = 1 - SS_res/SS_tot。但 R² 有一个缺陷：增加任何特征都会使 R² 不减。因此引入了调整后的 R²：Adj_R² = 1 - (1-R²)·(n-1)/(n-p-1)，它会惩罚不必要的特征。

此外还要关注：残差分析（残差应服从正态分布且方差恒定）、多重共线性诊断（VIF > 10 说明共线性严重）、交叉验证（K-fold CV 评估泛化能力）。`,
        list: [
          "R² > 0.8 通常认为拟合较好，但需结合领域知识判断",
          "Adjusted R² 用于比较不同特征数量的模型",
          "RMSE（均方根误差）与目标变量单位一致，更直观",
          "残差图应呈现随机散点，不应有系统性模式",
          "K-fold 交叉验证（K=5 或 10）评估模型泛化能力",
          "VIF > 10 提示多重共线性，考虑删除或合并特征",
        ],
      },
      {
        title: "7. 线性回归的实际应用",
        body: `线性回归看似简单，但在真实世界中有着广泛的应用。

房价预测：根据房屋面积、房龄、地段等特征预测售价。这是线性回归最经典的应用，各大房价平台的核心算法之一就是多元线性回归的改进版本。

销售预测：电商公司根据历史销量、促销活动、季节因素等预测未来销售额。线性回归提供了可解释的基准模型，业务人员可以直接理解每个特征的贡献度。

金融风险评估：银行用线性回归（及其正则化变体）评估借款人的信用评分，预测违约概率。模型的可解释性是金融监管的硬性要求。`,
        list: [
          "房价预测：面积、位置、房龄 → 预测售价",
          "销售预测：历史数据、促销、季节 → 预测未来销量",
          "A/B 测试：实验组 vs 对照组，控制混杂变量",
          "信用评分：收入、负债、历史 → 预测违约概率",
          "医疗分析：年龄、BMI、血压 → 预测疾病风险",
        ],
        tip: "线性回归永远是数据分析的第一选择。先跑一个线性回归看看基线表现，再决定是否需要更复杂的模型。",
      },
    ],
  },
  {
    id: "ml-002",
    title: "决策树与随机森林实战",
    category: "ml",
    tags: ["监督学习", "集成学习", "分类"],
    summary: "从信息增益到基尼系数，掌握决策树的分裂策略与随机森林的集成思想",
    date: "2026-04-08",
    readTime: "16 min",
    level: "入门",
    content: [
      {
        title: "1. 决策树：像人类一样做决策",
        body: `决策树是最直观的机器学习算法之一。它的核心思想是模拟人类的决策过程：通过一系列 if-then 规则，逐步将数据划分到不同的类别或预测不同的数值。

想象你在判断一个人是否会购买某款产品：首先看年龄（>30 岁？），然后看收入（>50K？），最后看是否之前购买过类似产品。每一步都在缩小候选集，直到得出最终判断。

决策树的优势在于：完全可解释（可以画出树形图展示每个决策路径）、不需要特征标准化、能处理数值和类别特征、对非线性关系天然友好。缺点是容易过拟合，一棵完全生长的树会记住训练集的每个细节。`,
        mermaid: `graph TD
    A["年龄 > 30?"] -->|"是"| B["收入 > 50K?"]
    A -->|"否"| C["有学生优惠?"]
    B -->|"是"| D["购买过类似产品?"]
    B -->|"否"| E["不购买"]
    C -->|"是"| F["购买"]
    C -->|"否"| E
    D -->|"是"| F
    D -->|"否"| G["可能购买"]`,
        tip: "决策树是理解更复杂算法（随机森林、梯度提升树）的基础。先理解一棵树如何生长，再理解多棵树如何协作。",
      },
      {
        title: "2. 如何选择最佳分裂点：信息增益与基尼系数",
        body: `决策树的核心问题是：在每个节点，应该选择哪个特征、哪个阈值来分裂数据？答案取决于纯度这个关键概念。一个好的分裂应该让子节点中的数据尽可能纯净（即属于同一类别）。

信息增益（Information Gain）基于信息论中的熵（Entropy）。熵衡量一个数据集的不确定性：H(S) = -Σ pᵢ log₂(pᵢ)。当一个节点中所有样本属于同一类别时，熵为 0（完全纯净）；当类别均匀分布时，熵最大。信息增益 = 父节点熵 - 子节点加权熵。选择信息增益最大的特征进行分裂，就是 ID3 算法的核心思想。

基尼系数（Gini Impurity）是另一种纯度度量：Gini(S) = 1 - Σ pᵢ²。它计算的是随机抽取两个样本属于不同类别的概率。基尼系数计算比熵更快（没有对数运算），是 CART 算法的默认选择。

对于回归树，使用方差减少（Variance Reduction）作为分裂标准：选择使子节点方差之和最小的分裂点。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def entropy(labels):
    """计算熵: H(S) = -Σ p_i log_2(p_i)"""
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / len(labels)
    return -np.sum(probs * np.log2(probs + 1e-10))

def gini_impurity(labels):
    """计算基尼系数: G(S) = 1 - Σ p_i²"""
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / len(labels)
    return 1 - np.sum(probs ** 2)

# 示例：二分类问题
labels_pure = np.array([1, 1, 1, 1, 1])
labels_mixed = np.array([1, 1, 0, 0, 0])
labels_balanced = np.array([1, 1, 1, 0, 0, 0])

print("=== 纯度对比 ===")
print(f"完全纯净  - Entropy: {entropy(labels_pure):.4f}, Gini: {gini_impurity(labels_pure):.4f}")
print(f"3:2 混合  - Entropy: {entropy(labels_mixed):.4f}, Gini: {gini_impurity(labels_mixed):.4f}")
print(f"3:3 均衡  - Entropy: {entropy(labels_balanced):.4f}, Gini: {gini_impurity(labels_balanced):.4f}")`,
          },
        ],
        table: {
          headers: ["分裂标准", "公式", "特点", "代表算法"],
          rows: [
            ["信息增益", "H(父) - Σ(nᵢ/n)H(子ᵢ)", "偏向多值特征", "ID3"],
            ["信息增益率", "IG / SplitInfo", "修正信息增益偏差", "C4.5"],
            ["基尼系数", "1 - Σpᵢ²", "计算快，效果类似熵", "CART"],
            ["方差减少", "Var(父) - Σ(nᵢ/n)Var(子ᵢ)", "用于回归树", "CART 回归"],
          ],
        },
      },
      {
        title: "3. 从零实现决策树",
        body: `理解决策树最好的方式就是手写一棵。下面是一个简化版的 CART 分类树实现：递归地选择最佳分裂点，直到达到停止条件（最大深度、最小样本数、或节点纯度达标）。`,
        code: [
          {
            lang: "python",
            code: `class DecisionNode:
    """决策树节点"""
    def __init__(self, feature=None, threshold=None,
                 left=None, right=None, value=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value  # 叶子节点的预测值

class DecisionTreeClassifier:
    """简化版 CART 分类树"""

    def __init__(self, max_depth=5, min_samples_split=2):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root = None

    def _gini(self, y):
        if len(y) == 0:
            return 0
        probs = np.bincount(y) / len(y)
        return 1 - np.sum(probs ** 2)

    def _best_split(self, X, y):
        best_gain = -1
        best_feature = None
        best_threshold = None
        n_samples, n_features = X.shape
        parent_gini = self._gini(y)

        for feature in range(n_features):
            thresholds = np.unique(X[:, feature])
            for threshold in thresholds:
                left_mask = X[:, feature] <= threshold
                right_mask = ~left_mask
                if left_mask.sum() == 0 or right_mask.sum() == 0:
                    continue
                n_left = left_mask.sum()
                n_right = right_mask.sum()
                weighted_gini = (n_left * self._gini(y[left_mask]) +
                                 n_right * self._gini(y[right_mask])) / n_samples
                gain = parent_gini - weighted_gini
                if gain > best_gain:
                    best_gain = gain
                    best_feature = feature
                    best_threshold = threshold

        return best_feature, best_threshold, best_gain

    def _build_tree(self, X, y, depth):
        if (depth >= self.max_depth or
            len(y) < self.min_samples_split or
            self._gini(y) == 0):
            return DecisionNode(value=np.bincount(y).argmax())

        feature, threshold, gain = self._best_split(X, y)
        if feature is None or gain <= 0:
            return DecisionNode(value=np.bincount(y).argmax())

        left_mask = X[:, feature] <= threshold
        left = self._build_tree(X[left_mask], y[left_mask], depth + 1)
        right = self._build_tree(X[~left_mask], y[~left_mask], depth + 1)
        return DecisionNode(feature, threshold, left, right)

    def fit(self, X, y):
        self.root = self._build_tree(X, y, depth=0)
        return self

    def _predict_one(self, x, node):
        if node.value is not None:
            return node.value
        if x[node.feature] <= node.threshold:
            return self._predict_one(x, node.left)
        return self._predict_one(x, node.right)

    def predict(self, X):
        return np.array([self._predict_one(x, self.root) for x in X])`,
          },
        ],
      },
      {
        title: "4. 剪枝：控制过拟合",
        body: `一棵不受限制的决策树会不断分裂直到每个叶子节点只有一个样本，这意味着它在记忆训练数据而非学习规律。剪枝（Pruning）是控制决策树复杂度的核心手段。

预剪枝（Pre-pruning）：在树生长过程中提前停止。常见策略包括：限制最大深度（max_depth）、要求节点最少样本数（min_samples_split）、要求叶子节点最少样本数（min_samples_leaf）。

后剪枝（Post-pruning）：先让树完全生长，然后自底向上地合并那些对验证集性能没有帮助的节点。代价复杂度剪枝是最经典的后剪枝方法，它引入了一个复杂度参数 alpha，在树的拟合度和复杂度之间做权衡。

实践中，预剪枝更常用（计算效率高），而后剪枝通常效果更好但更耗时。sklearn 的 DecisionTreeClassifier 默认不剪枝，所以实际使用时必须手动设置 max_depth 等参数。`,
        list: [
          "max_depth：限制树的最大深度（最常用的预剪枝参数）",
          "min_samples_split：节点分裂所需的最小样本数（默认 2）",
          "min_samples_leaf：叶子节点的最小样本数（防止极端分裂）",
          "max_features：每步考虑的最大特征数（增加随机性）",
          "ccp_alpha：代价复杂度剪枝参数（后剪枝）",
          "交叉验证选择最佳超参数组合",
        ],
        warning: "sklearn 决策树默认不剪枝！如果你用默认参数训练，几乎一定会过拟合。至少设置 max_depth 或 min_samples_leaf。",
      },
      {
        title: "5. 随机森林：集成的力量",
        body: `随机森林（Random Forest）通过构建多棵决策树并将它们的结果聚合起来，大幅提升预测性能。它的核心思想是群体的智慧——每棵树独立做判断，然后投票决定最终结果。

随机森林通过两种随机性来确保树之间的多样性：Bootstrap 采样（有放回抽样），每棵树使用不同的训练子集；特征随机选择，在每个分裂点只从随机选择的 k 个特征中寻找最佳分裂。

这种设计使得随机森林几乎不会过拟合（随着树的数量增加，泛化误差收敛到一个下界）、不需要剪枝、对异常值鲁棒、可以并行训练。而且它天然支持特征重要性评估。`,
        mermaid: `graph TB
    A["原始训练集"] --> B["Bootstrap 采样 1"]
    A --> C["Bootstrap 采样 2"]
    A --> D["Bootstrap 采样 N"]
    B --> E["决策树 1"]
    C --> F["决策树 2"]
    D --> G["决策树 N"]
    E --> H["投票/平均"]
    F --> H
    G --> H
    H --> I["最终预测"]`,
        code: [
          {
            lang: "python",
            code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1000, n_features=20,
                           n_informative=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

rf = RandomForestClassifier(
    n_estimators=100,        # 树的数量
    max_depth=10,            # 每棵树的最大深度
    min_samples_split=5,     # 最小分裂样本数
    min_samples_leaf=2,      # 叶子最小样本数
    max_features="sqrt",     # 每步考虑的特征数
    random_state=42,
    n_jobs=-1                # 并行训练
)
rf.fit(X_train, y_train)

print(f"训练集准确率: {rf.score(X_train, y_train):.4f}")
print(f"测试集准确率: {rf.score(X_test, y_test):.4f}")

# 特征重要性
importances = rf.feature_importances_
top_features = np.argsort(importances)[::-1][:5]
print("Top 5 重要特征:")
for i, feat_idx in enumerate(top_features):
    print(f"  特征 {feat_idx}: {importances[feat_idx]:.4f}")`,
          },
        ],
        table: {
          headers: ["算法", "单树/集成", "过拟合风险", "可解释性", "训练速度"],
          rows: [
            ["单棵决策树", "单树", "高", "完全可解释", "快"],
            ["随机森林", "集成 (Bagging)", "低", "特征重要性", "中等（可并行）"],
            ["Gradient Boosting", "集成 (Boosting)", "中", "特征重要性", "慢（串行）"],
            ["XGBoost", "集成 (Boosting+)", "中", "特征重要性", "快（优化版）"],
          ],
        },
        tip: "随机森林的 n_estimators（树的数量）越大越好——不会过拟合，只会让结果更稳定。通常 100-500 棵树已经足够。",
      },
      {
        title: "6. 实际应用场景",
        body: `决策树和随机森林在工业界有着广泛的应用，尤其是当可解释性很重要时。

信用风险评估：银行使用决策树来评估贷款申请。监管机构要求银行能解释为什么拒绝某个申请——决策树的决策路径完美满足这个要求。

医疗诊断：根据患者症状、化验结果预测疾病。决策树可以生成清晰的诊断流程，医生可以直接理解和验证。

客户流失预测：电信、金融行业用随机森林预测哪些客户可能流失。随机森林能处理混合类型特征（数值、类别），而且不需要复杂的特征工程。

特征选择：随机森林的特征重要性是数据科学中最常用的特征选择方法之一。先用随机森林跑一遍数据，筛选出重要特征，再用更复杂的模型训练。`,
        list: [
          "信用评估：可解释的决策路径满足监管要求",
          "医疗诊断：生成清晰的诊断流程",
          "客户流失：随机森林处理混合特征，无需复杂工程",
          "特征选择：用随机森林特征重要性做预筛选",
          "异常检测：孤立森林（Isolation Forest）的变体",
        ],
      },
    ],
  },
  {
    id: "ml-003",
    title: "SVM 支持向量机详解",
    category: "ml",
    tags: ["监督学习", "分类", "核方法"],
    summary: "理解最大间隔分类器、核技巧与软间隔 SVM 的完整推导",
    date: "2026-04-05",
    readTime: "15 min",
    level: "进阶",
  },
  {
    id: "ml-004",
    title: "K-Means 聚类算法深入剖析",
    category: "ml",
    tags: ["无监督学习", "聚类"],
    summary: "从距离度量到 K 值选择，全面掌握 K-Means 及其变种算法",
    date: "2026-04-03",
    readTime: "10 min",
    level: "入门",
  },
  {
    id: "ml-005",
    title: "XGBoost 原理与调参指南",
    category: "ml",
    tags: ["集成学习", "梯度提升", "调参"],
    summary: "深入 XGBoost 的目标函数推导、正则化策略和实用调参技巧",
    date: "2026-03-28",
    readTime: "18 min",
    level: "进阶",
  },
  // 深度学习
  {
    id: "dl-001",
    title: "神经网络基础：从感知机到多层网络",
    category: "dl",
    tags: ["反向传播", "激活函数", "基础"],
    summary: "理解神经元、激活函数、反向传播和梯度消失问题",
    date: "2026-04-09",
    readTime: "12 min",
    level: "入门",
  },
  {
    id: "dl-002",
    title: "CNN 卷积神经网络完全指南",
    category: "dl",
    tags: ["CNN", "图像识别", "架构"],
    summary: "从 LeNet 到 ResNet，梳理 CNN 架构演进与核心组件",
    date: "2026-04-07",
    readTime: "20 min",
    level: "进阶",
  },
  {
    id: "dl-003",
    title: "RNN 与 LSTM：处理序列数据",
    category: "dl",
    tags: ["RNN", "LSTM", "序列建模"],
    summary: "理解循环神经网络的记忆机制与 LSTM 的门控设计",
    date: "2026-04-04",
    readTime: "15 min",
    level: "进阶",
  },
  {
    id: "dl-004",
    title: "注意力机制与 Transformer 架构",
    category: "dl",
    tags: ["Attention", "Transformer", "自注意力"],
    summary: "详解 Self-Attention、Multi-Head Attention 和 Transformer 的编码器-解码器结构",
    date: "2026-04-01",
    readTime: "25 min",
    level: "高级",
    content: [
      {
        title: "1. 为什么需要注意力机制？",
        body: "在 Transformer 出现之前，序列建模主要依赖 RNN 和 LSTM。这些模型按顺序处理序列，导致两个核心问题：一是无法并行计算，训练速度慢；二是长距离依赖问题——序列开头的信息传到末尾时已经严重衰减。注意力机制（Attention）的核心思想是：让模型在处理每个位置时，都能\"看到\"序列中所有其他位置的信息，并根据相关性分配不同的权重。",
        mermaid: `graph LR
    A["输入序列"] --> B["Query 查询"]
    A --> C["Key 键"]
    A --> D["Value 值"]
    B --> E["Attention Score"]
    C --> E
    E --> F["Softmax 归一化"]
    D --> G["加权求和"]
    F --> G
    G --> H["输出向量"]`,
      },
      {
        title: "2. Scaled Dot-Product Attention 详解",
        body: "Transformer 使用的核心注意力机制是 Scaled Dot-Product Attention。其计算公式为：Attention(Q, K, V) = softmax(QK^T / √d_k) V。其中除以 √d_k 是为了防止点积结果过大导致 softmax 梯度消失。Q（Query）、K（Key）、V（Value）都是从输入通过线性变换得到的矩阵。",
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k: int):
        super().__init__()
        self.d_k = d_k
        self.dropout = nn.Dropout(0.1)
    
    def forward(self, Q, K, V, mask=None):
        # Q, K, V shape: (batch, heads, seq_len, d_k)
        scores = torch.matmul(Q, K.transpose(-2, -1))
        scores = scores / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        
        attention_weights = torch.softmax(scores, dim=-1)
        attention_weights = self.dropout(attention_weights)
        
        output = torch.matmul(attention_weights, V)
        return output, attention_weights

# 示例使用
d_k = 64
attention = ScaledDotProductAttention(d_k)
Q = torch.randn(2, 8, 10, d_k)  # batch=2, heads=8, seq=10
K = torch.randn(2, 8, 10, d_k)
V = torch.randn(2, 8, 10, d_k)
output, weights = attention(Q, K, V)
print(f"输出形状: {output.shape}")  # (2, 8, 10, 64)`,
          },
        ],
      },
      {
        title: "3. Multi-Head Attention：多视角并行",
        body: "Multi-Head Attention 的核心思想是：与其让模型用一个注意力头去捕捉所有类型的依赖关系，不如用多个注意力头各自学习不同的表示子空间。每个头独立计算注意力，然后将结果拼接并通过线性变换融合。这就像从多个不同的角度理解同一段文本——一个头可能关注语法关系，另一个关注语义关联，第三个关注长距离依赖。",
        code: [
          {
            lang: "python",
            code: `class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        assert d_model % num_heads == 0
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        self.attention = ScaledDotProductAttention(self.d_k)
    
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        
        # 线性变换并分头
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # 多头注意力
        attn_output, weights = self.attention(Q, K, V, mask)
        
        # 拼接所有头
        attn_output = attn_output.transpose(1, 2).contiguous() \\
            .view(batch_size, -1, self.d_model)
        
        return self.W_o(attn_output), weights`,
          },
        ],
      },
      {
        title: "4. Transformer 整体架构",
        body: "完整的 Transformer 由编码器和解码器堆叠而成。编码器由 N=6 个相同层组成，每层包含两个子层：多头自注意力和前馈神经网络（FFN）。解码器同样由 N 层组成，但每层包含三个子层：带掩码的多头自注意力（防止看到未来信息）、交叉注意力（关注编码器输出）和前馈网络。每个子层都使用残差连接和层归一化（LayerNorm）。",
        mermaid: `graph TB
    subgraph "编码器 (Encoder)"
        A["输入 Embedding"] --> B["位置编码 Positional Encoding"]
        B --> C["Multi-Head Self-Attention"]
        C --> D["Add & LayerNorm"]
        D --> E["Feed Forward NN"]
        E --> F["Add & LayerNorm"]
    end
    
    subgraph "解码器 (Decoder)"
        G["输出 Embedding"] --> H["位置编码"]
        H --> I["Masked Multi-Head Self-Attention"]
        I --> J["Add & LayerNorm"]
        J --> K["Multi-Head Cross-Attention"]
        F -.-> K
        K --> L["Add & LayerNorm"]
        L --> M["Feed Forward NN"]
        M --> N["Add & LayerNorm"]
    end
    
    N --> O["Linear + Softmax"]
    O --> P["输出概率分布"]`,
      },
      {
        title: "5. 位置编码：让模型感知顺序",
        body: "由于 Transformer 完全基于注意力机制，没有 RNN 的时序概念，因此需要显式地注入位置信息。原始 Transformer 使用正弦/余弦函数的位置编码：PE(pos, 2i) = sin(pos / 10000^(2i/d_model))，PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))。这种设计使得模型能够学习到相对位置关系，因为对于固定偏移量 k，PE(pos+k) 可以表示为 PE(pos) 的线性变换。",
        code: [
          {
            lang: "python",
            code: `class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, max_len: int = 5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2) * 
                            -(math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        # x shape: (batch, seq_len, d_model)
        return x + self.pe[:, :x.size(1)]`,
          },
        ],
      },
      {
        title: "6. Transformer 与 RNN/CNN 对比",
        table: {
          headers: ["特性", "RNN/LSTM", "CNN", "Transformer"],
          rows: [
            ["并行计算", "❌ 顺序处理", "✅ 完全并行", "✅ 完全并行"],
            ["长距离依赖", "⚠️ 随距离衰减", "⚠️ 受感受野限制", "✅ 全局注意力"],
            ["计算复杂度", "O(n·d²)", "O(k·n·d²)", "O(n²·d)"],
            ["训练速度", "慢", "快", "快（但内存消耗大）"],
            ["典型应用", "机器翻译(旧)", "图像分类", "LLM/翻译/摘要"],
            ["参数量", "中等", "中等", "较大"],
          ],
        },
      },
      {
        title: "7. 从 Transformer 到大语言模型",
        body: "Transformer 架构是现代大语言模型的基石。GPT 系列采用 Decoder-only 架构，BERT 采用 Encoder-only 架构，而 T5/BART 则使用完整的 Encoder-Decoder。理解 Transformer 是理解所有现代 LLM 的基础。后续的重要改进包括：RoPE 旋转位置编码、Flash Attention 加速、GQA 分组查询注意力、MoE 混合专家架构等。",
        list: [
          "GPT (2018): Decoder-only，自回归生成，开启了 LLM 时代",
          "BERT (2018): Encoder-only，掩码语言模型，NLP 预训练的里程碑",
          "T5 (2019): 统一文本到文本框架，Encoder-Decoder 架构",
          "PaLM (2022): 规模扩展到 540B 参数，验证了 scaling law",
          "LLaMA (2023): 高效开源 LLM，RMSNorm + SwiGLU + RoPE",
          "GPT-4/Claude 3 (2024): 多模态能力，百万级上下文窗口",
        ],
        tip: "学习建议：先手写一个最小 Transformer（约 200 行代码），再阅读原始论文 \"Attention Is All You Need\"，最后研究现代 LLM 中的改进（RoPE、Flash Attention、GQA 等）。",
      },
    ],
  },
  {
    id: "dl-005",
    title: "GAN 生成对抗网络原理与应用",
    category: "dl",
    tags: ["GAN", "生成模型", "图像生成"],
    summary: "从原始 GAN 到 StyleGAN，探索生成对抗网络的发展脉络",
    date: "2026-03-25",
    readTime: "16 min",
    level: "进阶",
  },
  // NLP
  {
    id: "nlp-001",
    title: "词嵌入：从 Word2Vec 到 GloVe",
    category: "nlp",
    tags: ["词向量", "表示学习", "基础"],
    summary: "理解分布式表示的核心思想，对比 CBOW 与 Skip-gram 模型",
    date: "2026-04-06",
    readTime: "12 min",
    level: "入门",
  },
  {
    id: "nlp-002",
    title: "BERT 预训练模型深度解析",
    category: "nlp",
    tags: ["BERT", "预训练", "微调"],
    summary: "解析 BERT 的 MLM 和 NSP 预训练任务，以及下游任务的微调方法",
    date: "2026-04-02",
    readTime: "18 min",
    level: "进阶",
  },
  // 计算机视觉
  {
    id: "cv-001",
    title: "目标检测：从 R-CNN 到 YOLO",
    category: "cv",
    tags: ["目标检测", "YOLO", "实时检测"],
    summary: "梳理两阶段与单阶段检测器的设计差异，对比 YOLO 系列各版本性能",
    date: "2026-04-05",
    readTime: "20 min",
    level: "进阶",
  },
  {
    id: "cv-002",
    title: "图像分割：语义分割与实例分割",
    category: "cv",
    tags: ["分割", "FCN", "Mask R-CNN"],
    summary: "从 FCN 到 Mask R-CNN，理解像素级预测的核心技术",
    date: "2026-03-30",
    readTime: "16 min",
    level: "进阶",
  },
  // 大语言模型
  {
    id: "llm-001",
    title: "大语言模型训练全流程",
    category: "llm",
    tags: ["预训练", "SFT", "RLHF"],
    summary: "从数据采集到预训练、指令微调到人类反馈强化学习的完整管线",
    date: "2026-04-10",
    readTime: "25 min",
    level: "高级",
    content: [
      {
        title: "1. 训练流程全景图",
        body: "现代大语言模型的训练是一个多阶段的复杂工程。从数万亿 token 的原始文本采集，到大规模分布式预训练，再到指令微调和人类反馈强化学习，每个阶段都需要精心设计。整个流程可以概括为：数据准备 → 预训练（Pre-training）→ 有监督微调（SFT）→ 奖励模型训练（RM）→ 强化学习对齐（RLHF/DPO）。",
        mermaid: `graph LR
    A["原始文本数据"] --> B["数据清洗与过滤"]
    B --> C["分词 Tokenization"]
    C --> D["预训练 Pre-training"]
    D --> E["基座模型 Base Model"]
    E --> F["指令数据构造"]
    F --> G["有监督微调 SFT"]
    G --> H["指令模型 SFT Model"]
    H --> I["偏好数据标注"]
    I --> J["奖励模型 RM"]
    J --> K["RLHF / DPO 对齐"]
    K --> L["最终产品模型"]`,
      },
      {
        title: "2. 数据准备：训练质量的基石",
        body: "数据质量直接决定模型能力的上限。现代 LLM 训练数据包含多个来源：网页文本（Common Crawl）、书籍（Books3）、代码（GitHub）、学术论文（arXiv）、对话数据等。关键步骤包括：重复数据去重（MinHash/SimHash）、质量过滤（语言分类器、困惑度过滤）、PII 去除、以及精心构造的指令数据。",
        code: [
          {
            lang: "python",
            code: `# 数据清洗示例：使用 datatrove 处理 Common Crawl
from datatrove.pipeline.readers import WarcReader
from datatrove.pipeline.filters import (
    LanguageFilter,
    UnigramLogProbFilter,
    URLFilter,
)
from datatrove.pipeline.dedup import MinhashDedup

pipeline = [
    WarcReader("s3://commoncrawl/crawl-data/CC-2024-10/"),
    LanguageFilter(language="en", threshold=0.65),
    UnigramLogProbFilter(threshold=-12.0),
    URLFilter(),
    MinhashDedup(n_grams=5, num_buckets=1000),
]

for doc in pipeline:
    process(doc)`,
          },
        ],
        table: {
          headers: ["数据源", "占比", "说明"],
          rows: [
            ["网页文本", "~60%", "Common Crawl，需大规模清洗过滤"],
            ["代码", "~10%", "GitHub 开源代码，提升推理能力"],
            ["书籍", "~5%", "高质量长文本，增强理解深度"],
            ["学术", "~5%", "arXiv 论文，提升专业知识"],
            ["Wikipedia", "~3%", "百科全书，提供结构化知识"],
            ["指令数据", "~2%", "SFT 阶段使用，量小但关键"],
            ["其他", "~15%", "对话、论坛、社交媒体等"],
          ],
        },
      },
      {
        title: "3. 分词（Tokenization）",
        body: "分词是将文本转换为模型可处理的 token 序列的关键步骤。现代 LLM 主要使用 Byte-Pair Encoding (BPE) 或其变种。分词器的词汇表大小直接影响模型效率和表现：词汇表太小会导致序列过长，太大则增加 Embedding 层参数量。Llama 使用 32K-128K 词汇表，GPT-4 使用约 100K。",
        code: [
          {
            lang: "python",
            code: `# 使用 tiktoken（OpenAI 的分词库）
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
text = "Hello, world! 你好世界！"
tokens = enc.encode(text)
print(f"Token IDs: {tokens}")
print(f"Token count: {len(tokens)}")
print(f"Decoded: {enc.decode(tokens)}")

# 中文分词效率分析
texts = ["人工智能", "机器学习", "深度学习"]
for t in texts:
    tokens = enc.encode(t)
    print(f"'{t}' → {len(tokens)} tokens: {tokens}")`,
          },
        ],
      },
      {
        title: "4. 预训练（Pre-training）",
        body: "预训练是 LLM 训练中最耗资源的阶段。模型在海量无标注文本上学习语言模型目标：给定前面的 token，预测下一个 token。关键技术包括：混合精度训练（FP16/BF16）、ZeRO 分布式优化、激活值检查点（Activation Checkpointing）、以及 Flash Attention 加速。训练一个 70B 参数的模型需要数万 GPU 小时。",
        code: [
          {
            lang: "python",
            code: `# 预训练配置示例（基于 Llama 架构）
model_config = {
    "vocab_size": 32000,
    "hidden_size": 4096,
    "intermediate_size": 11008,
    "num_hidden_layers": 32,
    "num_attention_heads": 32,
    "num_key_value_heads": 32,
    "max_position_embeddings": 4096,
    "rms_norm_eps": 1e-5,
    "rope_theta": 10000,
    "hidden_act": "silu",
    "use_flash_attention": True,
}

# 训练超参数
training_config = {
    "learning_rate": 3e-4,
    "warmup_steps": 2000,
    "lr_scheduler": "cosine",
    "weight_decay": 0.1,
    "batch_size": 4096 * 4096,
    "max_grad_norm": 1.0,
    "precision": "bf16-mixed",
}`,
          },
        ],
        table: {
          headers: ["模型规模", "参数量", "预训练数据", "GPU 小时（约）"],
          rows: [
            ["Llama 7B", "7B", "1T tokens", "~100K"],
            ["Llama 13B", "13B", "1T tokens", "~200K"],
            ["Llama 70B", "70B", "2T tokens", "~1M"],
            ["GPT-4", "~1.8T", "~13T tokens", "未知"],
            ["Claude 3", "未知", "未知", "未知"],
          ],
        },
        tip: "Chinchilla 定律：最优训练是在给定计算预算下，让模型大小和训练 token 数按固定比例扩展。过小模型过多训练或过大模型过少训练都是低效的。",
      },
      {
        title: "5. 有监督微调（SFT）",
        body: "预训练模型虽然掌握了语言知识，但不能很好地遵循指令。SFT 阶段使用高质量的指令-响应对数据微调模型，使其学会遵循指令、进行对话、完成任务。",
        code: [
          {
            lang: "python",
            code: `# SFT 微调示例（使用 Hugging Face TRL）
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-8B",
    torch_dtype="auto",
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B")

dataset = load_dataset("HuggingFaceH4/ultrachat_200k", split="train_sft")

training_args = SFTConfig(
    output_dir="llama-3-8b-sft",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-5,
    lr_scheduler_type="cosine",
    warmup_ratio=0.05,
    fp16=True,
    logging_steps=10,
    max_seq_length=2048,
)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    args=training_args,
)
trainer.train()`,
          },
        ],
        list: [
          "指令数据质量远比数量重要：10K 高质量样本 > 100K 低质量样本",
          "覆盖多任务：问答、摘要、翻译、代码、数学推理、创意写作",
          "包含拒绝训练：教模型识别并拒绝有害请求",
          "格式统一：使用标准化的对话模板（如 ChatML、Alpaca 格式）",
          "避免灾难性遗忘：学习率通常比预训练低 1-2 个数量级",
        ],
      },
      {
        title: "6. RLHF：让人类偏好对齐模型",
        body: "RLHF（Reinforcement Learning from Human Feedback）是让 LLM 输出与人类价值观对齐的关键技术。流程：收集人类偏好标注 → 训练奖励模型 → 使用 PPO 微调模型。",
        mermaid: `graph LR
    A["SFT 模型"] --> B["生成多个回答"]
    B --> C["人类标注偏好"]
    C --> D["训练奖励模型 RM"]
    D --> E["PPO 强化学习"]
    A --> E
    E --> F["对齐后的模型"]`,
        code: [
          {
            lang: "python",
            code: `# DPO（Direct Preference Optimization）示例
from trl import DPOTrainer, DPOConfig
from datasets import load_dataset

dataset = load_dataset("Anthropic/hh-rlhf", split="train")

dpo_config = DPOConfig(
    output_dir="llama-3-8b-dpo",
    learning_rate=5e-7,
    beta=0.1,
    max_length=1024,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
)

trainer = DPOTrainer(
    model=model,
    ref_model=ref_model,
    args=dpo_config,
    train_dataset=dataset,
    tokenizer=tokenizer,
)
trainer.train()`,
          },
        ],
        table: {
          headers: ["对齐方法", "优点", "缺点", "代表工作"],
          rows: [
            ["RLHF (PPO)", "对齐效果好，灵活", "复杂，训练不稳定", "InstructGPT, Claude"],
            ["DPO", "简单稳定，无需 RM", "效果略逊于 RLHF", "Zephyr, Mistral"],
            ["ORPO", "单阶段训练，高效", "较新方法，验证不足", "ORPO"],
            ["RLAIF", "用 AI 替代人类标注", "AI 标注质量依赖基座", "Constitutional AI"],
          ],
        },
      },
      {
        title: "7. 评估与部署",
        body: "训练完成后，模型需要全面评估（MMLU、GSM8K、HumanEval）和推理优化（KV Cache、vLLM 并行、量化加速）。",
        code: [
          {
            lang: "bash",
            code: `# 使用 vLLM 高性能推理服务
pip install vllm

# 启动 API 服务（Tensor 并行 4 GPU）
vllm serve meta-llama/Llama-3-8B \\
    --tensor-parallel-size 4 \\
    --max-model-len 8192 \\
    --gpu-memory-utilization 0.9`,
          },
        ],
        table: {
          headers: ["优化技术", "速度提升", "内存节省", "质量损失"],
          rows: [
            ["KV Cache", "2-5x", "-", "无"],
            ["vLLM PagedAttention", "10-24x", "显著", "无"],
            ["INT8 量化", "1.5-2x", "~50%", "微小"],
            ["INT4 量化", "2-3x", "~75%", "轻微"],
            ["Speculative Decoding", "2-3x", "-", "无"],
          ],
        },
      },
    ],
  },
  {
    id: "llm-002",
    title: "Prompt Engineering 最佳实践",
    category: "llm",
    tags: ["Prompt", "技巧", "实战"],
    summary: "系统学习 CoT、Few-shot、ReAct 等 Prompt 设计模式与技巧",
    date: "2026-04-08",
    readTime: "20 min",
    level: "入门",
    content: [
      {
        title: "1. 什么是 Prompt Engineering？",
        body: `Prompt Engineering（提示工程）是与大语言模型高效沟通的艺术和科学。它的核心目标是通过精心设计的输入文本，引导模型输出符合预期的高质量结果。

不要被"写几句话"这个表象所欺骗——Prompt Engineering 背后有深刻的认知科学原理。大语言模型本质上是 next-token predictor，它们根据上下文的概率分布生成下一个词。好的 Prompt 实际上是在模型的巨大参数空间中划定一个高概率区域，让模型的输出落在这个区域内。

理解这一点至关重要：你不是在"命令"模型做事，而是在"引导"模型走向你想要的推理路径。这就像在黑暗中用手电筒照亮一条路——手电筒照亮的地方，就是模型会走的方向。`,
        mermaid: `graph LR
    A["用户意图"] --> B["意图分析"]
    B --> C["Prompt 设计"]
    C --> D["角色设定"]
    C --> E["任务描述"]
    C --> F["约束条件"]
    C --> G["示例提供"]
    D --> H["LLM 推理"]
    E --> H
    F --> H
    G --> H
    H --> I["输出生成"]
    I --> J["结果评估"]
    J -.->|不满意| C
    J -->|满意| K["最终结果"]`,
        tip: "核心理念：Prompt Engineering 不是魔法，而是工程。好的 Prompt 应该是可复现、可迭代、可评估的。"
      },
      {
        title: "2. Prompt 的核心组成要素",
        body: `一个高质量的 Prompt 通常包含五个核心要素：角色（Role）、任务（Task）、上下文（Context）、约束（Constraints）和格式（Format）。这五个要素共同构成了 Prompt 的"黄金结构"。

**角色（Role）**：赋予模型一个特定身份，如"你是一个资深 Python 工程师"。角色设定能激活模型参数空间中与该角色相关的专业知识区域。

**任务（Task）**：清晰描述你要模型做什么。使用动作动词开头，如"分析"、"编写"、"解释"。避免模糊的"帮我看看"。

**上下文（Context）**：提供完成任务所需的背景信息。包括领域知识、已有数据、用户画像等。上下文越充分，模型输出越精准。

**约束（Constraints）**：限定输出的范围、长度、风格等。如"不超过 200 字"、"使用中文"、"避免专业术语"。

**格式（Format）**：指定输出的结构，如 JSON、Markdown 表格、代码块等。结构化输出便于后续程序处理。`,
        code: [
          {
            lang: "python",
            code: `# 好的 Prompt 结构示例
def build_prompt(user_question: str, context: str) -> str:
    """构建结构化 Prompt"""
    return f"""你是一个资深的数据分析师，擅长用 Python 进行数据清洗和可视化。

【任务】
请分析以下数据集的特征，并给出数据清洗方案。

【上下文】
数据集包含用户行为日志，字段包括：user_id, timestamp, action, page_url。
当前数据存在以下问题：
- timestamp 格式不统一（部分为 Unix 时间戳，部分为 ISO 格式）
- action 字段存在拼写错误（如 "clik" 应为 "click"）
- 约 5% 的 user_id 为空值

【待分析问题】
{user_question}

【已有数据样例】
{context}

【约束】
1. 使用 Python 代码，基于 pandas 库
2. 代码需要包含详细注释
3. 输出结果以 Markdown 表格形式呈现
4. 总回答不超过 800 字"""

# 使用示例
question = "如何处理时间戳格式不一致的问题？"
sample_data = """user_id,timestamp,action,page_url
123,1712567890,click,/home
,2024-04-08T10:30:00,clik,/products
456,1712570000,view,/about"""

print(build_prompt(question, sample_data))`
          }
        ]
      },
      {
        title: "3. Few-Shot Learning：让模型照猫画虎",
        body: `Few-Shot Learning 是 Prompt Engineering 中最强大的技术之一。通过在 Prompt 中提供少量输入-输出示例，你可以让模型快速理解任务模式，而无需重新训练模型参数。

Few-Shot 的核心原理是 In-Context Learning（上下文学习）。大语言模型在预训练阶段已经见过海量的文本模式，当你在 Prompt 中展示几个示例时，模型会自动识别其中的模式并应用到新的输入上。这与人类的"举一反三"能力非常相似。

关键要点：示例的质量远比重更重要。3 个精心挑选的高质量示例，效果远好于 10 个随机示例。示例应该覆盖任务的典型场景和边界情况。`,
        code: [
          {
            lang: "python",
            code: `# Few-Shot Prompt 示例：情感分类
def few_shot_sentiment_prompt(text: str) -> str:
    """Few-shot 情感分析 Prompt"""
    return f"""请判断以下评论的情感倾向，输出"正面"、"负面"或"中性"，并给出简短理由。

示例 1：
输入："这部电影的特效太震撼了，剧情也很紧凑，强烈推荐！"
输出：{{"sentiment": "正面", "reason": "表达了对电影的强烈推荐"}}

示例 2：
输入："等了两个小时才上菜，菜还是凉的，服务态度也很差。"
输出：{{"sentiment": "负面", "reason": "描述了等待时间长、食物质量差、服务差"}}

示例 3：
输入："这款手机用了一个月了，电池续航一般，拍照还行。"
输出：{{"sentiment": "中性", "reason": "客观描述，没有明显的褒贬"}}

请分析：
输入："{text}"
输出："""

# 测试
test_cases = [
    "物流很快，包装精美，产品质量超出预期",
    "客服态度极其恶劣，再也不买了",
    "产品功能中规中矩，价格偏高"
]

for case in test_cases:
    prompt = few_shot_sentiment_prompt(case)
    # response = llm.generate(prompt)
    print(f"输入: {case}")`
          },
          {
            lang: "python",
            code: `# Few-Shot 示例选择策略
def select_best_examples(query: str, example_pool: list,
                         k: int = 3) -> list:
    """基于语义相似度选择最相关的 Few-Shot 示例"""
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    
    # 将查询和示例向量化
    vectorizer = TfidfVectorizer()
    all_texts = [query] + [ex["input"] for ex in example_pool]
    vectors = vectorizer.fit_transform(all_texts)
    
    # 计算查询与每个示例的相似度
    query_vec = vectors[0:1]
    example_vecs = vectors[1:]
    similarities = cosine_similarity(query_vec, example_vecs)[0]
    
    # 选择最相似的 k 个示例
    top_indices = similarities.argsort()[-k:][::-1]
    return [example_pool[i] for i in top_indices]

# 使用示例
examples = [
    {"input": "如何重置密码？", "output": "前往设置 > 安全 > 重置密码"},
    {"input": "订单什么时候到？", "output": "请在订单页面查看物流信息"},
    {"input": "怎么开发票？", "output": "订单完成后在订单详情中申请"},
]

query = "我忘记登录密码了怎么办？"
selected = select_best_examples(query, examples, k=2)
for ex in selected:
    print(f"Q: {ex['input']} → A: {ex['output']}")`
          }
        ],
        table: {
          headers: ["Few-Shot 策略", "适用场景", "优点", "缺点"],
          rows: [
            ["Zero-Shot", "简单分类、摘要", "简洁、Token 少", "复杂任务效果差"],
            ["One-Shot", "中等复杂度任务", "快速建立模式", "单示例可能不具代表性"],
            ["Few-Shot (3-5)", "格式要求严格的输出", "效果显著提升", "消耗更多 Token"],
            ["Many-Shot (10+)", "高度专业化任务", "覆盖更多边界情况", "可能超出上下文窗口"],
            ["动态选择", "查询类型多样", "最相关的示例", "需要额外的检索逻辑"],
          ]
        }
      },
      {
        title: "4. Chain of Thought（思维链）：让模型逐步推理",
        body: `Chain of Thought（CoT）Prompting 的核心思想是：引导模型将复杂问题拆解为多个中间推理步骤，而不直接跳到答案。这在数学推理、逻辑分析、代码调试等需要多步推理的任务中效果显著。

为什么 CoT 有效？大语言模型本质上是自回归的——每个生成的 token 都基于之前的所有 token。当模型被要求展示推理过程时，中间推理步骤实际上成为了后续推理的上下文，帮助模型保持推理链的连贯性。这就像人类在草稿纸上做数学题——写下中间步骤可以大幅降低出错率。

CoT 有两种实现方式：Zero-Shot CoT（只需在 Prompt 末尾加上"请逐步思考"）和 Few-Shot CoT（在示例中展示完整的推理过程）。Few-Shot CoT 通常效果更好，因为它不仅告诉模型"要逐步思考"，还示范了"如何逐步思考"。`,
        code: [
          {
            lang: "python",
            code: `# Chain of Thought Prompt 示例
def cot_math_prompt(problem: str) -> str:
    """CoT 数学推理 Prompt"""
    return f"""你是一个数学老师。请逐步解答以下问题，展示完整的推理过程。

示例：
问题：一个水池有进水管和出水管。进水管单独工作 6 小时可以注满水池，出水管单独工作 8 小时可以排空水池。如果两管同时打开，需要多长时间才能注满水池？

解答步骤：
1. 进水管每小时注水量 = 1/6 池
2. 出水管每小时排水量 = 1/8 池
3. 两管同时工作，每小时净注水量 = 1/6 - 1/8 = 4/24 - 3/24 = 1/24 池
4. 注满水池需要的时间 = 1 ÷ (1/24) = 24 小时
答案：24 小时

问题：{problem}

解答步骤："""

# 测试
problem = "某商品先涨价 20%，再降价 20%，最终价格相比原价变化了多少？"
print(cot_math_prompt(problem))`
          }
        ],
        warning: "CoT 的安全注意事项：模型的推理过程可能包含错误或不一致的逻辑。对于关键决策（如医疗、金融），务必对推理过程进行人工审核，不能仅看最终答案。"
      },
      {
        title: "5. ReAct 模式：推理与行动的交替循环",
        body: `ReAct（Reasoning + Acting）是一种将推理和行动交替进行的 Prompt 设计模式。与纯 CoT 不同，ReAct 让模型在推理过程中可以调用外部工具（如搜索引擎、API、数据库），然后根据工具返回的结果继续推理。

ReAct 的工作流程：Thought（思考下一步做什么）→ Action（执行具体操作）→ Observation（观察工具返回结果）→ 重复直到得出结论。这个循环让模型既能"思考"又能"行动"，极大地扩展了 LLM 的能力边界。

ReAct 的实际应用非常广泛：问答系统可以先搜索再回答；数据分析可以先查询数据库再解释结果；代码调试可以先运行测试再分析错误。`,
        code: [
          {
            lang: "python",
            code: `# ReAct 模式简易实现
class ReActAgent:
    """简易 ReAct Agent 实现"""
    
    def __init__(self, llm, tools: dict):
        self.llm = llm
        self.tools = tools
        self.max_iterations = 5
    
    def run(self, question: str) -> str:
        # ReAct Prompt 模板
        prompt = f"""请用以下格式回答问题：

Thought: 分析当前情况，决定下一步
Action: 使用工具（格式：tool_name[query]）
Observation: 工具返回的结果
...（重复 Thought/Action/Observation）
Thought: 我已获得足够信息
Answer: 最终答案

可用工具：
- search: 搜索引擎查询
- calculate: 数学计算
- weather: 查询天气

问题：{question}
"""
        
        history = prompt
        for i in range(self.max_iterations):
            response = self.llm.generate(history)
            history += "\n" + response
            
            # 解析 Action
            if "Action:" in response:
                action_line = response.split("Action:")[1].strip().split("\n")[0]
                tool_name = action_line.split("[")[0]
                query = action_line.split("[")[1].rstrip("]")
                
                # 执行工具
                if tool_name in self.tools:
                    result = self.tools[tool_name](query)
                    history += f"\nObservation: {result}"
                else:
                    history += f"\nObservation: 未知工具: {tool_name}"
            else:
                break  # 没有 Action，说明已有答案
        
        # 提取 Answer
        if "Answer:" in history:
            return history.split("Answer:")[-1].strip()
        return history

# 使用示例
tools = {
    "search": lambda q: f"搜索结果: {q} → 找到相关信息",
    "calculate": lambda q: f"计算结果: {q} = {eval(q)}",
}
agent = ReActAgent(llm=None, tools=tools)  # 此处 llm 为示意
print("ReAct Agent 初始化完成")`
          }
        ],
        mermaid: `sequenceDiagram
    participant U as 用户
    participant A as ReAct Agent
    participant T as 外部工具
    U->>A: 提出问题
    loop 推理循环
        A->>A: Thought: 分析情况
        A->>T: Action: 调用工具
        T-->>A: Observation: 返回结果
        A->>A: 基于结果继续推理
    end
    A-->>U: Answer: 最终答案`
      },
      {
        title: "6. System Prompt 与角色工程",
        body: `System Prompt 是对话开始前注入模型的"系统级指令"，它定义了模型的行为边界、角色定位和输出风格。与 User Prompt 不同，System Prompt 通常不会被用户直接看到，但它对整个对话质量的影响最大。

角色工程（Role Engineering）是 System Prompt 设计的核心技术。通过精确的角色定义，你可以激活模型在特定领域的专业知识。例如，"你是一个有 10 年经验的安全工程师"和"你是一个安全专家"虽然意思相近，但前者会让模型倾向于提供更具体、更实战导向的建议。

设计 System Prompt 的关键原则：明确角色、设定边界、定义风格、规定格式、强调约束。一个好的 System Prompt 应该像一份精确的岗位说明书——任何接手的人（或模型）都能清楚地知道该做什么、不该做什么、以及怎么做。`,
        code: [
          {
            lang: "python",
            code: `# System Prompt 模板库
class SystemPromptTemplates:
    """不同场景的 System Prompt 模板"""
    
    CODE_REVIEWER = """你是一位资深代码审查工程师，拥有 15 年以上软件开发经验。
你的职责：
1. 识别代码中的 bug、安全漏洞和性能问题
2. 提出具体的改进建议，并说明原因
3. 对代码风格和规范给出评价
4. 始终保持建设性和尊重性

输出格式：
- 🟢 优点
- 🔴 问题（按严重程度排序）
- 💡 改进建议
- 📝 重构示例代码"""

    DATA_ANALYST = """你是一位数据科学家，擅长探索性数据分析和统计推断。
你的风格：
- 用数据说话，避免主观臆断
- 解释统计指标的实际含义
- 指出数据中的异常值和潜在偏差
- 建议下一步的分析方向"""

    TECHNICAL_WRITER = """你是一位技术文档撰写专家。
原则：
- 简洁明了，避免冗长
- 使用主动语态
- 每个段落只表达一个核心观点
- 代码示例必须有注释和说明"""

# 使用示例
def create_chat_completion(system_prompt: str, user_message: str):
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    return messages  # 实际调用 LLM API

# 代码审查场景
messages = create_chat_completion(
    SystemPromptTemplates.CODE_REVIEWER,
    "请审查这段代码：\\ndef get_data(url):\\n    import urllib.request\\n    response = urllib.request.urlopen(url)\\n    return response.read()"
)
print(f"System: {messages[0]['content'][:80]}...")
print(f"User: {messages[1]['content']}")`
          }
        ],
        table: {
          headers: ["角色类型", "System Prompt 关键词", "典型输出风格", "常见陷阱"],
          rows: [
            ["代码审查员", "资深工程师、15 年经验、建设性", "结构化、有代码示例", "过于苛刻，打击开发者"],
            ["数据科学家", "统计推断、用数据说话、偏差分析", "数据驱动、谨慎结论", "过度技术化，非专业人士看不懂"],
            ["技术写手", "简洁、主动语态、单段单观点", "精炼、易读、结构化", "过度简化，丢失技术细节"],
            ["教师", "耐心、循序渐进、举例说明", "由浅入深、有练习题", "进度太慢，效率低"],
            ["产品经理", "用户视角、商业价值、优先级", "需求文档格式、有优先级", "过度关注商业，忽略技术可行性"],
          ]
        }
      },
      {
        title: "7. Prompt 安全与常见陷阱",
        body: `Prompt Engineering 不仅关乎技巧，还关乎安全。了解常见的陷阱和安全风险，才能写出健壮可靠的 Prompt。

**注入攻击（Prompt Injection）**：攻击者通过在用户输入中嵌入恶意指令，试图覆盖或绕过 System Prompt。防御策略包括：使用分隔符明确区分指令和数据、对输入进行清洗和转义、避免在 Prompt 中暴露敏感信息。

**幻觉（Hallucination）**：模型生成的内容看起来合理但实际上是错误的。减少幻觉的方法包括：提供准确的上下文、要求模型引用来源、对不确定的内容要求模型表达不确定性。

**输出不一致性**：同一个 Prompt 多次运行可能产生不同的结果。应对策略包括：设置 temperature=0 以获得确定性输出、使用结构化输出格式、对输出进行后处理验证。`,
        mermaid: `graph TD
    A["Prompt 安全风险"] --> B["注入攻击"]
    A --> C["幻觉/编造"]
    A --> D["输出不一致"]
    A --> E["敏感信息泄露"]
    B --> B1["使用分隔符"]
    B --> B2["输入清洗"]
    B --> B3["指令与数据分离"]
    C --> C1["提供准确上下文"]
    C --> C2["要求引用来源"]
    C --> C3["表达不确定性"]
    D --> D1["temperature=0"]
    D --> D2["结构化输出"]
    D --> D3["后处理验证"]
    E --> E1["避免 System Prompt 暴露"]
    E --> E2["敏感信息脱敏"]
    E --> E3["输出内容审核"]`,
        warning: "安全红线：永远不要在 Prompt 中包含 API 密钥、数据库连接字符串、用户密码等敏感信息。使用环境变量或密钥管理服务存储这些凭证。",
        list: [
          "始终对用户输入进行清洗和转义，防止注入攻击",
          "使用 XML 标签或三引号明确区分指令和数据部分",
          "对关键输出进行格式验证和逻辑校验",
          "设置合理的 max_tokens 限制，防止输出过长",
          "记录 Prompt 版本和对应的输出，便于回溯和优化",
          "定期进行安全审计，测试 Prompt 的鲁棒性",
          "避免过度依赖单个 Prompt——关键场景使用多轮对话验证",
        ]
      },
    ],
  },
  {
    id: "llm-003",
    title: "RAG 检索增强生成架构指南",
    category: "llm",
    tags: ["RAG", "向量数据库", "知识库"],
    summary: "如何结合外部知识库增强 LLM 的准确性和时效性",
    date: "2026-04-06",
    readTime: "22 min",
    level: "进阶",
    content: [
      {
        title: "1. 为什么需要 RAG？大语言模型的三大局限",
        body: `大语言模型虽然强大，但存在三个天然局限：知识截止（训练数据有固定截止日期，无法了解最新信息）、幻觉倾向（对不知道的内容倾向于编造而非承认）、私有数据盲区（训练数据不包含企业内部文档和数据库）。

RAG（Retrieval-Augmented Generation，检索增强生成）是解决这些问题最优雅的架构方案。它的核心思想很简单：在模型生成回答之前，先从外部知识库中检索相关信息，然后将检索结果和问题一起输入模型。这样模型就不需要"记住"所有知识，只需要"读懂"给它的参考资料并作答。

这就像开卷考试——你不需要背下整本教科书，只需要知道如何快速查找相关信息并理解它。RAG 让 LLM 从"闭卷答题"变成"开卷答题"，准确率大幅提升，幻觉显著减少。`,
        mermaid: `graph LR
    A["用户问题"] --> B["向量检索"]
    C["知识库文档"] --> D["分块+向量化"]
    D --> E["向量数据库"]
    E --> B
    B --> F["相关文档片段"]
    F --> G["Prompt 组装"]
    A --> G
    G --> H["LLM 生成回答"]
    H --> I["最终答案"]`,
        tip: "关键认知：RAG 不是微调模型，而是在推理时注入外部知识。模型参数不变，但每次回答的上下文不同。"
      },
      {
        title: "2. RAG 架构全景：从数据到答案的完整流程",
        body: `一个完整的 RAG 系统包含两个阶段：索引阶段（Indexing）和查询阶段（Querying）。

**索引阶段**（离线执行，一次性或定期更新）：
1. 文档采集：从各种数据源（PDF、网页、数据库、API）获取原始文档
2. 文本清洗：去除 HTML 标签、乱码、无关内容
3. 文档分块（Chunking）：将长文档切分为固定大小的文本块。这是最关键也最容易被忽视的环节——块太大则检索精度下降，块太小则丢失上下文
4. 向量化（Embedding）：使用 Embedding 模型将每个文本块转换为高维向量
5. 存储入库：将向量和元数据存入向量数据库，建立索引

**查询阶段**（在线执行，每次用户提问时触发）：
1. 问题向量化：使用同一个 Embedding 模型将用户问题转换为向量
2. 相似度检索：在向量数据库中找到与问题最相似的 Top-K 个文本块
3. 上下文组装：将检索到的文本块与原始问题组合成 Prompt
4. LLM 生成：将组装好的 Prompt 输入 LLM，生成最终回答
5. 结果后处理：格式校验、引用标注、安全检查`,
        code: [
          {
            lang: "python",
            code: `# RAG 索引阶段完整实现
from typing import List, Dict
import hashlib

class DocumentIndexer:
    """RAG 文档索引器"""
    
    def __init__(self, embedding_model, vector_db, chunk_size=500,
                 chunk_overlap=50):
        self.embedding_model = embedding_model
        self.vector_db = vector_db
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def chunk_document(self, text: str) -> List[Dict]:
        """将文档切分为重叠的文本块"""
        chunks = []
        # 按段落分割
        paragraphs = text.split('\n\n')
        current_chunk = ""
        chunk_index = 0
        
        for para in paragraphs:
            if len(current_chunk) + len(para) > self.chunk_size:
                if current_chunk:
                    chunk_id = hashlib.md5(
                        current_chunk.encode()
                    ).hexdigest()[:12]
                    chunks.append({
                        "id": chunk_id,
                        "text": current_chunk.strip(),
                        "index": chunk_index
                    })
                    chunk_index += 1
                # 保留重叠部分
                overlap_start = max(0, len(current_chunk) - self.chunk_overlap)
                current_chunk = current_chunk[overlap_start:] + "\n\n" + para
            else:
                current_chunk += ("\n\n" if current_chunk else "") + para
        
        if current_chunk.strip():
            chunk_id = hashlib.md5(
                current_chunk.encode()
            ).hexdigest()[:12]
            chunks.append({
                "id": chunk_id,
                "text": current_chunk.strip(),
                "index": chunk_index
            })
        
        return chunks
    
    def index(self, documents: List[Dict[str, str]]) -> int:
        """索引文档列表，返回索引的文档数量"""
        total_chunks = 0
        for doc in documents:
            chunks = self.chunk_document(doc["content"])
            for chunk in chunks:
                # 向量化
                embedding = self.embedding_model.encode(chunk["text"])
                # 存储到向量数据库
                self.vector_db.add(
                    id=chunk["id"],
                    vector=embedding,
                    metadata={
                        "text": chunk["text"],
                        "source": doc.get("source", ""),
                        "title": doc.get("title", "")
                    }
                )
                total_chunks += 1
        return total_chunks

# 使用示例
documents = [
    {
        "title": "公司员工手册",
        "source": "hr_docs",
        "content": "员工每年享有 15 天带薪年假...\n\n"
                   "病假需要提供医院证明...\n\n"
                   "加班补偿按 1.5 倍工资计算..."
    },
]
# indexer = DocumentIndexer(embedding_model, vector_db)
# count = indexer.index(documents)
# print(f"索引完成，共 {count} 个文本块")`
          }
        ]
      },
      {
        title: "3. Chunking 策略：RAG 成败的关键",
        body: `文本分块（Chunking）是 RAG 系统中最影响效果的环节之一。分块策略直接决定了检索的精度和上下文的质量。

**固定大小分块（Fixed-Size Chunking）**：最简单的方法。按字符数或 Token 数等长切分，块之间有少量重叠。优点是简单高效，缺点是可能在不恰当的位置切断句子或段落。

**语义分块（Semantic Chunking）**：利用文本的语义结构来切分。先按段落、章节、列表等自然边界分割，再对过长的段落进行二次切分。优点是保留了语义完整性，缺点是实现更复杂。

**递归字符分块（Recursive Character Splitting）**：LangChain 等框架使用的策略。先用大分隔符（如双换行）分割，如果块仍然太大，再用小分隔符（如单换行、句号、空格）递归分割。这在简单性和效果之间取得了很好的平衡。

**关键参数选择**：Chunk Size 取决于 Embedding 模型的上下文窗口和目标任务的性质。对于问答任务，300-500 Token 通常足够；对于需要长篇上下文的摘要任务，可能需要 1000-2000 Token。Overlap 一般设置为 Chunk Size 的 10%-20%。`,
        code: [
          {
            lang: "python",
            code: `# 递归字符分块实现
def recursive_split(text: str, chunk_size: int,
                    overlap: int) -> List[str]:
    """递归字符分块算法"""
    if len(text) <= chunk_size:
        return [text] if text.strip() else []
    
    # 按优先级尝试不同的分隔符
    separators = ["\n\n", "\n", "。", "，", " ", ""]
    
    for sep in separators:
        if sep == "":
            # 最后手段：按字符硬切
            chunks = []
            start = 0
            while start < len(text):
                end = start + chunk_size
                chunks.append(text[start:end])
                start = end - overlap
            return chunks
        
        parts = text.split(sep)
        # 如果分割后仍有过长的块，对长块递归处理
        result = []
        current = ""
        for part in parts:
            part_with_sep = part + sep
            if len(part_with_sep) > chunk_size:
                # 长块：递归处理
                if current.strip():
                    result.append(current.strip())
                result.extend(recursive_split(
                    part_with_sep, chunk_size, overlap
                ))
                current = ""
            elif len(current + part_with_sep) > chunk_size:
                if current.strip():
                    result.append(current.strip())
                current = part_with_sep
            else:
                current += part_with_sep
        
        if current.strip():
            result.append(current.strip())
        
        # 检查是否有效分割
        if len(result) > 1:
            return result
    
    return [text] if text.strip() else []

# 测试
text = """第一段内容。

第二段，这里有很多信息需要讨论。

第三段是非常长的内容，""" + "A" * 600 + """。

第四段结尾。"""

chunks = recursive_split(text, chunk_size=200, overlap=40)
for i, chunk in enumerate(chunks):
    print(f"Chunk {i+1} ({len(chunk)} chars): {chunk[:60]}...")`
          }
        ],
        table: {
          headers: ["分块策略", "实现难度", "语义完整性", "检索精度", "适用场景"],
          rows: [
            ["固定大小", "低", "差", "中", "快速原型验证"],
            ["递归字符", "中", "中", "高", "通用 RAG 系统"],
            ["语义分块", "高", "优", "高", "结构化文档（论文、法律文件）"],
            ["基于文档结构", "高", "优", "极高", "有明确章节标记的文档"],
            ["滑动窗口", "低", "中", "中", "流式数据处理"],
          ]
        },
        warning: "分块陷阱：不要让一个文本块包含多个不相关的主题。例如，一个块里同时有员工年假政策和服务器配置信息，这会导致检索时引入大量无关噪声。"
      },
      {
        title: "4. 向量检索与 Embedding 模型选择",
        body: `Embedding 模型将文本映射为高维向量，使得语义相似的文本在向量空间中的距离也更近。选择合适的 Embedding 模型是 RAG 系统的核心决策。

**评估 Embedding 模型的关键指标**：
1. MTEB 分数（Massive Text Embedding Benchmark）：权威的 Embedding 模型评测榜单，涵盖分类、聚类、配对、重排序、检索、STS 等任务
2. 多语言能力：如果你的应用场景涉及中文，必须选择对中文支持良好的模型
3. 上下文长度：模型能处理的最大文本长度，决定了单个 Chunk 的最大尺寸
4. 推理速度：影响 RAG 系统的延迟表现
5. 向量维度：维度越高表达能力越强，但存储和计算成本也越高

**主流 Embedding 模型对比**：OpenAI 的 text-embedding-3-large 性能最强但需要付费；开源模型如 BGE（BAAI General Embedding）在中文场景下表现优异，且可以本地部署；Cohere 的 Embedding 模型在多语言支持上有优势。`,
        mermaid: `graph TD
    A["用户查询"] --> B["向量化 Query"]
    C["向量数据库"] --> D["相似度计算"]
    B --> D
    D --> E["Top-K 候选"]
    E --> F["Cross-Encoder 重排序"]
    F --> G["Final Top-K"]
    G --> H["组装 Prompt"]
    
    style A fill:#e1f5fe
    style G fill:#e8f5e9
    style H fill:#fff3e0`,
        list: [
          "中文场景优先选择 BGE-m3 或 m3e 等中文优化模型",
          "向量维度不必盲目追求高维——768 维通常已经足够",
          "使用混合检索（BM25 + 向量）可以弥补纯向量检索的不足",
          "Cross-Encoder 重排序能显著提升 Top-K 的精度，但会增加延迟",
          "定期评估检索质量：人工标注 50-100 个问答对，计算检索命中率",
        ]
      },
      {
        title: "5. 完整的 RAG 查询 pipeline 实现",
        body: `查询阶段是 RAG 系统与用户直接交互的环节，决定了用户的实际体验。一个生产级的查询 pipeline 需要考虑多个方面：查询理解、多路检索、结果融合、答案生成、引用标注。

**查询理解（Query Understanding）**：用户的原始提问可能不够精确。通过查询改写（Query Rewriting）、查询扩展（Query Expansion）和意图识别，可以大幅提升检索质量。例如，用户问"年假怎么算"，系统可以改写为"员工带薪年假计算规则"进行检索。

**多路检索（Multi-Path Retrieval）**：结合多种检索策略。向量检索擅长语义匹配，BM25 擅长关键词匹配，知识图谱擅长实体关系查询。将多路检索结果融合（如 Reciprocal Rank Fusion），效果通常优于任何单一策略。`,
        code: [
          {
            lang: "python",
            code: `# 完整 RAG 查询 Pipeline
class RAGPipeline:
    """生产级 RAG 查询管道"""
    
    def __init__(self, embedding_model, vector_db,
                 llm, reranker=None, top_k=5):
        self.embedding_model = embedding_model
        self.vector_db = vector_db
        self.llm = llm
        self.reranker = reranker
        self.top_k = top_k
    
    def rewrite_query(self, query: str) -> List[str]:
        """查询改写：生成多个检索查询"""
        # 实际场景可以用 LLM 来改写
        rewrites = [query]  # 原始查询
        # 同义词扩展
        synonyms = {
            "年假": ["带薪年假", "年休假", "休假天数"],
            "报销": ["费用报销", "财务报销", "报销流程"],
        }
        for keyword, syns in synonyms.items():
            if keyword in query:
                for syn in syns:
                    rewrites.append(query.replace(keyword, syn))
        return rewrites[:3]  # 最多 3 个改写
    
    def retrieve(self, queries: List[str]) -> List[Dict]:
        """多查询检索 + 去重 + 重排序"""
        all_results = []
        seen_ids = set()
        
        for q in queries:
            query_vec = self.embedding_model.encode(q)
            results = self.vector_db.search(
                vector=query_vec, top_k=self.top_k
            )
            for r in results:
                if r["id"] not in seen_ids:
                    all_results.append(r)
                    seen_ids.add(r["id"])
        
        # Cross-Encoder 重排序
        if self.reranker and all_results:
            scored = self.reranker.rank(
                query=queries[0],
                documents=[r["text"] for r in all_results]
            )
            all_results = [
                {**all_results[i], "rerank_score": s}
                for i, s in enumerate(scored)
            ]
            all_results.sort(
                key=lambda x: x.get("rerank_score", 0), reverse=True
            )
        
        return all_results[:self.top_k]
    
    def generate(self, query: str, contexts: List[Dict]) -> Dict:
        """组装 Prompt 并调用 LLM 生成"""
        context_text = "\n\n".join([
            f"[来源 {i+1}: {ctx.get('source', '未知')}]\\n{ctx['text']}"
            for i, ctx in enumerate(contexts)
        ])
        
        prompt = f"""你是一个专业的知识助手。请根据以下参考资料回答问题。

参考资料：
{context_text}

问题：{query}

要求：
1. 仅基于参考资料回答，不要编造信息
2. 如果参考资料不足以回答问题，请如实说明
3. 在回答中标注引用来源，如 [来源 1]
4. 回答要简洁准确"""
        
        response = self.llm.generate(prompt)
        return {
            "answer": response,
            "sources": [
                {"text": c["text"][:100], "source": c.get("source", "")}
                for c in contexts[:3]
            ]
        }
    
    def run(self, query: str) -> Dict:
        """完整 pipeline 执行"""
        queries = self.rewrite_query(query)
        contexts = self.retrieve(queries)
        return self.generate(query, contexts)

# 使用示例
# rag = RAGPipeline(embedding_model, vector_db, llm, reranker)
# result = rag.run("年假有多少天？")
# print(f"答案: {result['answer']}")
# for src in result['sources']:
#     print(f"来源: {src['source']}")`
          }
        ]
      },
      {
        title: "6. RAG 系统的评估与优化",
        body: `没有评估就没有优化。RAG 系统需要从多个维度进行量化评估，才能持续迭代改进。

**评估框架 RAGAS**：RAG Assessment（RAGAS）是目前最流行的 RAG 评估框架，它从四个维度进行评估：
1. 忠实度（Faithfulness）：生成的答案是否忠实于检索到的上下文，即是否基于参考资料而非模型自身知识
2. 答案相关性（Answer Relevance）：答案是否直接回答了用户的问题
3. 上下文精度（Context Precision）：检索到的上下文中有多少是真正相关的
4. 上下文召回率（Context Recall）：检索到的上下文覆盖了多少应该被召回的信息

**优化策略**：当评估结果不理想时，有针对性地优化——忠实度低说明模型在编造，需要加强 Prompt 约束和降低 temperature；答案相关性低可能需要改进查询改写；上下文精度低需要优化 Embedding 模型或引入重排序；上下文召回率低可能需要调整分块策略或增加检索数量。`,
        code: [
          {
            lang: "python",
            code: `# 简易 RAG 评估实现
def evaluate_rag(test_cases: List[Dict], rag_pipeline) -> Dict:
    """评估 RAG 系统的质量"""
    results = {"faithfulness": [], "relevance": [],
               "context_precision": [], "context_recall": []}
    
    for case in test_cases:
        query = case["question"]
        ground_truth = case["answer"]
        relevant_docs = case.get("relevant_docs", [])
        
        result = rag_pipeline.run(query)
        answer = result["answer"]
        contexts = [c["text"] for c in result.get("sources", [])]
        
        # 简易评估（实际应使用 LLM-as-judge 或人工标注）
        # 忠实度：答案中的关键事实是否都在上下文中
        facts_in_context = 0
        total_facts = 0
        for fact in extract_key_facts(answer):
            total_facts += 1
            if any(fact.lower() in ctx.lower() for ctx in contexts):
                facts_in_context += 1
        faithfulness = facts_in_context / max(total_facts, 1)
        
        # 答案相关性：答案与标准答案的关键词重叠
        answer_words = set(extract_keywords(answer))
        truth_words = set(extract_keywords(ground_truth))
        relevance = len(answer_words & truth_words) / max(len(truth_words), 1)
        
        results["faithfulness"].append(faithfulness)
        results["relevance"].append(relevance)
    
    return {
        k: sum(v) / max(len(v), 1) for k, v in results.items()
    }

# 测试集示例
test_cases = [
    {
        "question": "年假有多少天？",
        "answer": "员工每年享有 15 天带薪年假",
        "relevant_docs": ["hr_handbook_section_3.txt"]
    },
]
# scores = evaluate_rag(test_cases, rag_pipeline)
# print(f"忠实度: {scores['faithfulness']:.2%}")
# print(f"相关性: {scores['relevance']:.2%}")`
          }
        ],
        table: {
          headers: ["评估指标", "衡量什么", "低分原因", "优化方向"],
          rows: [
            ["忠实度", "答案是否基于检索到的上下文", "模型编造信息、temperature 过高", "加强 Prompt 约束、降低 temperature"],
            ["答案相关性", "答案是否直接回答问题", "查询理解不准、检索不精准", "查询改写、意图识别"],
            ["上下文精度", "检索结果中有多少是相关的", "Embedding 模型质量差、Chunking 策略不佳", "更换模型、优化分块、引入重排序"],
            ["上下文召回率", "应该召回的信息有多少被召回了", "检索数量太少、向量检索盲区", "增加 Top-K、混合检索"],
          ]
        }
      },
      {
        title: "7. RAG 的进阶模式与未来趋势",
        body: `基础 RAG 已经能解决很多问题，但在复杂场景下，需要更高级的 RAG 变体。

**Agentic RAG**：将 RAG 嵌入到 Agent 的工作流中。Agent 可以根据需要自主决定何时检索、检索什么、以及如何处理检索结果。相比固定流程的 RAG，Agentic RAG 更灵活但也更复杂。

**Graph RAG**：结合知识图谱的 RAG。将文档中的实体和关系抽取为知识图谱，检索时不仅考虑文本相似度，还考虑实体间的关系路径。这在需要多跳推理（Multi-hop Reasoning）的场景中特别有用，比如"张总的下属王经理负责哪个项目？"

**Self-RAG**：模型在生成过程中自主评估是否需要检索、检索质量如何、以及生成的内容是否准确。这引入了反思机制，让模型能够自我纠正。

**多模态 RAG**：不仅检索文本，还检索图像、表格、图表等多模态信息，让 LLM 的回答更加丰富和准确。`,
        mermaid: `graph LR
    A["基础 RAG"] --> B["+ Agent 自主规划"]
    A --> C["+ 知识图谱"]
    A --> D["+ 自我反思"]
    A --> E["+ 多模态"]
    B --> F["Agentic RAG"]
    C --> G["Graph RAG"]
    D --> H["Self-RAG"]
    E --> I["多模态 RAG"]
    
    style A fill:#bbdefb
    style F fill:#c8e6c9
    style G fill:#c8e6c9
    style H fill:#c8e6c9
    style I fill:#c8e6c9`,
        warning: "架构选择建议：从基础 RAG 开始，先评估效果，再按需升级到高级模式。不要一开始就上 Agentic RAG 或 Graph RAG——复杂度会显著增加开发和维护成本。",
        list: [
          "生产环境建议：基础 RAG + Cross-Encoder 重排序 + 查询改写，性价比最高",
          "多跳推理场景优先考虑 Graph RAG，而非单纯增加 Top-K",
          "Self-RAG 的延迟较高，适合离线场景或异步回答，不适合实时对话",
          "定期更新知识库：文档过期是 RAG 系统最大的隐性风险",
          "监控检索延迟：端到端延迟超过 3 秒会显著影响用户体验",
        ]
      },
    ],
  },
  // AI Agent
  {
    id: "agent-001",
    title: "AI Agent 入门：从概念到实现",
    category: "agent",
    tags: ["Agent", "规划", "工具使用"],
    summary: "理解 AI Agent 的核心组件：感知、规划、记忆和工具调用",
    date: "2026-04-09",
    readTime: "15 min",
    level: "入门",
  },
  {
    id: "agent-002",
    title: "Multi-Agent 系统设计与协作",
    category: "agent",
    tags: ["Multi-Agent", "协作", "架构"],
    summary: "探索多智能体系统的通信协议、角色分配和任务协调机制",
    date: "2026-04-07",
    readTime: "20 min",
    level: "高级",
  },
];
