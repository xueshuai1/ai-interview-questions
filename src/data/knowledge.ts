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
    readTime: "20 min",
    level: "进阶",
    content: [
      {
        title: "1. SVM 的核心直觉：最大间隔分类器",
        body: `支持向量机（Support Vector Machine, SVM）是机器学习中最优雅、理论最完备的分类算法之一。它的核心思想可以用一句话概括：在所有能将两类数据分开的超平面中，选择离两类数据都最远的那个。

想象你在两张桌子之间放一块木板，把两堆球分开。你可以倾斜木板，可以前后移动——但只要能把球分开，从数学上说都是"可行"的分类器。但 SVM 会问：哪种摆放方式最稳健？答案是：让木板到最近的红球和最近的蓝球的距离都最大化。这个距离就是间隔（Margin），而距离木板最近的那些球就是支持向量（Support Vectors）——它们"支撑"着最优超平面的位置。

为什么最大化间隔是好事？从统计学习理论（VC 维）的角度，间隔越大，模型的泛化能力越强。直觉上也很合理：如果你的分类边界离数据点很远，那么即使新数据略有扰动，也不太会跨越边界被分错类。`,
        mermaid: `graph LR
    A["训练数据"] --> B["寻找分类超平面"]
    B --> C["计算每个候选超平面的间隔"]
    C --> D["选择最大间隔超平面"]
    D --> E["支持向量确定边界"]
    E --> F["新样本分类"]
    
    style A fill:#bbdefb
    style D fill:#c8e6c9
    style F fill:#fff3e0`,
        tip: "关键洞察：SVM 的最终决策只依赖于支持向量（那些离边界最近的样本），与远离边界的样本无关。这意味着 SVM 对异常值有一定的鲁棒性——只要异常值不是支持向量。",
      },
      {
        title: "2. 数学推导：从几何间隔到优化问题",
        body: `SVM 的数学推导是机器学习中教科书级别的优化问题。我们一步步来看。

首先定义超平面：w·x + b = 0，其中 w 是法向量，b 是偏置。样本 (xᵢ, yᵢ)，yᵢ ∈ {-1, +1}。分类正确的条件是 yᵢ(w·xᵢ + b) > 0。

点 xᵢ 到超平面的几何距离是 |w·xᵢ + b| / ||w||。我们要求所有样本都被正确分类且间隔至少为 γ，即 yᵢ(w·xᵢ + b) / ||w|| ≥ γ。通过缩放 w 和 b（不改变超平面），可以令函数间隔 yᵢ(w·xᵢ + b) = 1，此时几何间隔 γ = 1/||w||。

最大化间隔 γ = 1/||w|| 等价于最小化 ||w||，等价于最小化 (1/2)||w||²。为什么要加 1/2？因为求导时 2 会被消掉，让后续推导更简洁。

这就得到了 SVM 的原始优化问题：min (1/2)||w||²，subject to yᵢ(w·xᵢ + b) ≥ 1, ∀i。这是一个凸二次规划问题，有唯一的全局最优解。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from scipy.optimize import minimize

class SVMFromScratch:
    """从零实现线性 SVM（使用凸优化求解器）"""
    
    def __init__(self, C=1.0):
        self.C = C
        self.w = None
        self.b = None
        self.support_vectors = None
    
    def _objective(self, params, X, y):
        """目标函数: (1/2)||w||^2 + C * Σhinge_loss"""
        n_features = X.shape[1]
        w = params[:n_features]
        b = params[n_features]
        
        # 正则化项
        reg = 0.5 * np.dot(w, w)
        
        # Hinge loss: max(0, 1 - y_i(w·x_i + b))
        margins = y * (X @ w + b)
        hinge = np.maximum(0, 1 - margins)
        
        return reg + self.C * np.sum(hinge)
    
    def _gradient(self, params, X, y):
        """目标函数的梯度"""
        n_features = X.shape[1]
        w = params[:n_features]
        b = params[n_features]
        
        grad_w = w.copy()
        grad_b = 0.0
        
        margins = y * (X @ w + b)
        violated = margins < 1  # hinge loss 非零的样本
        
        grad_w -= self.C * np.sum(
            (y[violated] * X[violated].T), axis=1
        )
        grad_b -= self.C * np.sum(y[violated])
        
        return np.append(grad_w, grad_b)
    
    def fit(self, X, y):
        n_samples, n_features = X.shape
        params = np.zeros(n_features + 1)
        
        result = minimize(
            self._objective, params,
            args=(X, y),
            jac=self._gradient,
            method='L-BFGS-B'
        )
        
        self.w = result.x[:n_features]
        self.b = result.x[n_features]
        
        # 找出支持向量（间隔 ≈ 1 的样本）
        margins = np.abs(y * (X @ self.w + self.b))
        sv_mask = margins < 1.01
        self.support_vectors = X[sv_mask]
        
        return self
    
    def predict(self, X):
        return np.sign(X @ self.w + self.b)
    
    def decision_function(self, X):
        """返回到超平面的距离（符号表示类别）"""
        return X @ self.w + self.b

# 测试
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=200, n_features=2,
                           n_redundant=0, random_state=42)
y = y * 2 - 1  # 转换为 {-1, +1}

svm = SVMFromScratch(C=1.0)
svm.fit(X, y)
print(f"支持向量数量: {len(svm.support_vectors)}")
print(f"权重 w: {svm.w}")
print(f"偏置 b: {svm.b:.4f}")`,
          },
        ],
      },
      {
        title: "3. 对偶问题与 KKT 条件",
        body: `为什么要求解对偶问题？有三个关键原因：第一，对偶问题将优化变量的数量从样本维度转换为样本数量，当特征维度很高时（如文本分类），对偶问题更高效；第二，对偶问题天然地引入了核技巧（Kernel Trick），让我们能够处理非线性分类；第三，对偶问题的解直接揭示了哪些样本是支持向量。

使用拉格朗日乘子法，引入乘子 αᵢ ≥ 0，构造拉格朗日函数：L(w, b, α) = (1/2)||w||² - Σαᵢ[yᵢ(w·xᵢ + b) - 1]。

对 w 和 b 分别求偏导并令其为零，得到：w = Σαᵢyᵢxᵢ 和 Σαᵢyᵢ = 0。代回拉格朗日函数，消去 w 和 b，得到对偶问题：

max Σαᵢ - (1/2)ΣΣαᵢαⱼyᵢyⱼ(xᵢ·xⱼ)，subject to αᵢ ≥ 0, Σαᵢyᵢ = 0。

注意 xᵢ·xⱼ 只以内积形式出现——这就是核技巧的入口！如果我们将 xᵢ·xⱼ 替换为 K(xᵢ, xⱼ)，就等价于在高维特征空间中做线性 SVM，而无需显式计算高维映射。

KKT 互补松弛条件告诉我们：αᵢ > 0 当且仅当 yᵢ(w·xᵢ + b) = 1，即该样本恰好落在间隔边界上——它就是支持向量。`,
        code: [
          {
            lang: "python",
            code: `# 使用 SMO（Sequential Minimal Optimization）简化求解
# SMO 的核心思想：每次只优化两个 α，解析求解

def smo_svm(X, y, C=1.0, tol=1e-3, max_passes=20):
    """简化版 SMO 算法"""
    n = len(y)
    alphas = np.zeros(n)
    b = 0.0
    passes = 0
    
    def kernel(xi, xj):
        return np.dot(xi, xj)  # 线性核
    
    def compute_E(i):
        """计算预测误差"""
        return sum(
            alphas[j] * y[j] * kernel(X[j], X[i])
            for j in range(n)
        ) + b - y[i]
    
    while passes < max_passes:
        num_changed = 0
        
        for i in range(n):
            Ei = compute_E(i)
            
            # 检查是否违反 KKT 条件
            if ((y[i] * Ei < -tol and alphas[i] < C) or
                (y[i] * Ei > tol and alphas[i] > 0)):
                
                # 选择第二个 α
                j = np.random.randint(0, n)
                while j == i:
                    j = np.random.randint(0, n)
                
                Ej = compute_E(j)
                alpha_i_old, alpha_j_old = alphas[i], alphas[j]
                
                # 计算 L 和 H 边界
                if y[i] != y[j]:
                    L = max(0, alphas[j] - alphas[i])
                    H = min(C, C + alphas[j] - alphas[i])
                else:
                    L = max(0, alphas[i] + alphas[j] - C)
                    H = min(C, alphas[i] + alphas[j])
                
                if L == H:
                    continue
                
                # 计算最优 α_j
                eta = (2 * kernel(X[i], X[j]) -
                       kernel(X[i], X[i]) -
                       kernel(X[j], X[j]))
                if eta >= 0:
                    continue
                
                alphas[j] -= y[j] * (Ei - Ej) / eta
                alphas[j] = np.clip(alphas[j], L, H)
                
                if abs(alphas[j] - alpha_j_old) < 1e-5:
                    continue
                
                alphas[i] += y[i] * y[j] * (alpha_j_old - alphas[j])
                num_changed += 1
        
        passes = passes + 1 if num_changed == 0 else 0
    
    return alphas, b

# 测试
X = np.array([[1, 2], [2, 3], [3, 3], [2, 1], [3, 2]])
y = np.array([1, 1, 1, -1, -1])
alphas, b = smo_svm(X, y, C=1.0)
print(f"Alpha: {alphas}")
print(f"支持向量索引: {np.where(alphas > 1e-3)[0]}")
print(f"b = {b:.4f}")`,
          },
        ],
        table: {
          headers: ["概念", "含义", "在 SVM 中的作用"],
          rows: [
            ["拉格朗日乘子 αᵢ", "每个约束的权重", "αᵢ > 0 的样本是支持向量"],
            ["对偶问题", "原问题的等价变形", "引入核技巧，降低维度"],
            ["KKT 互补松弛", "αᵢ·(约束余量) = 0", "识别支持向量的理论依据"],
            ["SMO 算法", "每次优化两个 α", "高效求解大规模 SVM"],
          ],
        },
      },
      {
        title: "4. 核技巧：从线性到非线性的魔法",
        body: `核技巧是 SVM 最强大的特性。它的核心洞察是：如果我们在优化问题中只看到数据的内积 xᵢ·xⱼ，那么我们可以用任何一个核函数 K(xᵢ, xⱼ) 来替代内积，这等价于先将数据映射到一个高维（甚至无限维）特征空间 φ(x)，然后在那个空间中做线性 SVM。

数学表达：K(xᵢ, xⱼ) = φ(xᵢ)·φ(xⱼ)。关键在于，我们不需要知道 φ 具体是什么——只要 K 满足 Mercer 条件（对应的核矩阵半正定），就存在对应的 φ。

常用核函数：线性核 K(x,z) = x·z（等价于原始线性 SVM）；多项式核 K(x,z) = (γx·z + r)^d（能捕捉特征间的交互作用）；RBF（径向基函数）核 K(x,z) = exp(-γ||x-z||²)（将数据映射到无限维空间，是最常用的核函数）；Sigmoid 核 K(x,z) = tanh(γx·z + r)（类似两层神经网络的激活）。

RBF 核为何如此强大？直观理解：它在每个训练样本周围放置一个高斯"小山包"，新的样本根据与各个训练样本的距离获得不同的"高度"。这意味着 RBF SVM 实际上在做某种形式的模板匹配——新样本离哪个类别的训练样本更近，就更可能被分入该类别。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.svm import SVC
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

# 生成非线性可分数据
X, y = make_moons(n_samples=300, noise=0.15, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 对比不同核函数
kernels = {
    'linear': SVC(kernel='linear', C=1.0),
    'poly (d=3)': SVC(kernel='poly', degree=3, C=1.0),
    'rbf': SVC(kernel='rbf', C=1.0, gamma='scale'),
    'sigmoid': SVC(kernel='sigmoid', C=1.0, gamma='scale'),
}

print("不同核函数在 Moon 数据集上的表现：")
print("-" * 45)
for name, model in kernels.items():
    model.fit(X_train, y_train)
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    n_sv = model.n_support_.sum()
    print(f"{name:12s} | 训练: {train_acc:.3f} | "
          f"测试: {test_acc:.3f} | 支持向量: {n_sv}")

# RBF 核的 gamma 参数影响
print("\\nRBF 核 gamma 参数影响：")
for gamma in [0.1, 1.0, 10.0, 100.0]:
    svm = SVC(kernel='rbf', gamma=gamma, C=1.0)
    svm.fit(X_train, y_train)
    print(f"  gamma={gamma:6.1f} | "
          f"训练: {svm.score(X_train, y_train):.3f} | "
          f"测试: {svm.score(X_test, y_test):.3f} | "
          f"SV: {svm.n_support_.sum()}")`,
          },
        ],
        table: {
          headers: ["核函数", "公式", "超参数", "适用场景", "计算复杂度"],
          rows: [
            ["线性核", "x·z", "无", "线性可分、高维稀疏数据", "O(d)"],
            ["多项式核", "(γx·z+r)^d", "d, γ, r", "图像识别、文本分类", "O(d)"],
            ["RBF 核", "exp(-γ||x-z||²)", "γ", "通用、非线性分类", "O(d)"],
            ["Sigmoid 核", "tanh(γx·z+r)", "γ, r", "神经网络替代", "O(d)"],
          ],
        },
        warning: "核函数选择的经验法则：如果特征数 >> 样本数（如文本分类），用线性核；如果样本数 >> 特征数，用 RBF 核；不确定时，先试 RBF 核，它几乎总是比线性核好。",
      },
      {
        title: "5. 软间隔 SVM：处理非完美可分数据",
        body: `真实世界的数据几乎从来不是完美线性可分的。硬间隔 SVM 要求所有样本都满足 yᵢ(w·xᵢ + b) ≥ 1，这在有噪声或重叠的数据中是不可能的——优化问题无解。

软间隔 SVM 通过引入松弛变量 ξᵢ ≥ 0 来解决这个问题：允许某些样本违反间隔约束，但要付出代价。优化问题变为：

min (1/2)||w||² + C·Σξᵢ，subject to yᵢ(w·xᵢ + b) ≥ 1 - ξᵢ, ξᵢ ≥ 0。

参数 C 是关键：C 很大时，模型倾向于减少 ξᵢ（减少误分类），间隔变窄，容易过拟合；C 很小时，模型允许更多的 ξᵢ（容忍误分类），间隔变宽，泛化能力更强但可能有更多训练误差。

这本质上是在偏差-方差之间做权衡。C 是 SVM 最重要的超参数，通常通过交叉验证在 {0.001, 0.01, 0.1, 1, 10, 100} 的网格中搜索。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_breast_cancer

# 加载数据
X, y = load_breast_cancer(return_X_y=True)
y = y * 2 - 1  # 转换为 {-1, +1}

# 标准化（SVM 对量纲敏感！）
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 网格搜索最佳 C 和 gamma
param_grid = {
    'C': [0.01, 0.1, 1, 10, 100],
    'kernel': ['rbf', 'linear'],
    'gamma': ['scale', 'auto', 0.001, 0.01, 0.1],
}

grid = GridSearchCV(
    SVC(), param_grid,
    cv=5, scoring='accuracy',
    n_jobs=-1, verbose=1
)
grid.fit(X_scaled, y)

print(f"最佳参数: {grid.best_params_}")
print(f"最佳 CV 准确率: {grid.best_score_:.4f}")

# 不同 C 值的决策边界变化
print("\\nC 值对模型的影响：")
for C_val in [0.01, 0.1, 1, 10, 100]:
    svm = SVC(kernel='rbf', C=C_val, gamma='scale')
    svm.fit(X_scaled, y)
    print(f"  C={C_val:5.2f} | "
          f"准确率: {svm.score(X_scaled, y):.4f} | "
          f"支持向量: {svm.n_support_.sum()}")`,
          },
        ],
      },
      {
        title: "6. SVM 与其他分类算法对比",
        body: `SVM 并不是在所有场景下都是最优选择。理解它与其他算法的优缺点对比，能帮助你在实际问题中做出正确的选择。

相比逻辑回归：SVM 只关注支持向量（边界附近的样本），而逻辑回归考虑所有样本。当数据有明显的边界时，SVM 往往更好；当需要概率输出时，逻辑回归更合适。SVM 通过核技巧能处理非线性，而逻辑回归需要手动构造非线性特征。

相比神经网络：SVM 在小数据集（< 10K 样本）上通常优于神经网络，因为它有坚实的理论保证和凸优化保证（全局最优）。但在大数据集上，神经网络的可扩展性和表示能力远超 SVM。现代深度学习中，SVM 主要被用作最后一层的分类器（替代 softmax），这被称为 SVM 头。`,
        table: {
          headers: ["算法", "数据规模", "非线性能力", "可解释性", "训练速度", "内存"],
          rows: [
            ["逻辑回归", "大", "弱（需手工特征）", "高（系数即权重）", "快", "低"],
            ["SVM (线性)", "中", "弱", "中（支持向量解释）", "快", "中"],
            ["SVM (RBF)", "中", "强（自动）", "低", "中", "O(n²) 存储核矩阵"],
            ["决策树", "中-大", "强", "高", "快", "低"],
            ["随机森林", "大", "强", "中（特征重要性）", "中（可并行）", "中"],
            ["神经网络", "大-超大", "极强", "低（黑盒）", "慢（需 GPU）", "高"],
          ],
        },
        list: [
          "样本量 < 10K，SVM 通常优于神经网络",
          "高维稀疏数据（文本），线性 SVM 是最好的基线之一",
          "需要概率输出时，用 Platt Scaling 或校准后的 SVM",
          "大数据场景下，用 LinearSVC 或 SGDClassifier 替代传统 SVM",
          "SVM 对特征标准化非常敏感——训练前必须 StandardScaler",
        ],
      },
      {
        title: "7. SVM 的实际应用场景",
        body: `尽管深度学习在很多领域占据主导地位，SVM 在以下场景中仍然是首选或强竞争力的方案。

文本分类：高维稀疏的文本数据（TF-IDF 特征）是线性 SVM 的"甜点"。SVM 在高维空间中的表现非常优秀，且不会因为维度灾难而退化。在垃圾邮件检测、情感分析、新闻分类等任务中，线性 SVM 常常达到或接近深度学习模型的效果，但训练速度快几个数量级。

生物信息学：基因表达数据分析、蛋白质分类、DNA 序列分析。这些场景通常样本量小（几十到几百）、特征维度高（数千到数万），正是 SVM 的优势区间。

图像分类（小样本）：当标注数据有限时，SVM + 手工特征（HOG、SIFT）仍然是可靠的方案。在工业检测、医疗影像等数据获取成本高的领域，SVM 配合迁移学习的特征提取器效果很好。`,
        mermaid: `graph TD
    A["选择分类器"] --> B{"数据规模？"}
    B -->|< 10K| C{"特征类型？"}
    B -->|> 100K| D["深度学习 / 集成学习"]
    C -->|高维稀疏| E["线性 SVM"]
    C -->|低维稠密| F{"需要概率？"}
    F -->|是| G["逻辑回归 / 校准 SVM"]
    F -->|否| H["RBF-SVM / 随机森林"]
    E --> I["文本分类、基因分析"]
    D --> J["图像、语音、NLP"]
    G --> K["金融风控、医疗诊断"]
    H --> L["通用分类任务"]`,
        tip: "实用建议：在 Kaggle 等数据科学竞赛中，先用线性 SVM 跑一个基线——如果效果已经很好，就不需要更复杂的模型。如果不够好，再尝试 RBF-SVM 或神经网络。",
      },
    ],
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
    readTime: "18 min",
    level: "入门",
    content: [
      {
        title: "1. 从生物神经元到人工神经元",
        body: `人工神经网络（Artificial Neural Network, ANN）的灵感来源于生物大脑的神经元网络。一个生物神经元通过树突接收来自其他神经元的信号，在细胞体内进行整合，当信号强度超过阈值时，通过轴突向下游神经元传递电信号。

McCulloch 和 Pitts 在 1943 年提出了第一个数学模型：M-P 神经元。它将生物神经元的运作抽象为三个步骤：接收多个输入信号（每个信号有不同的权重 wᵢ）、对所有加权输入求和并与阈值 θ 比较、通过激活函数产生输出。

这个看似简单的模型却是所有深度学习的基石。现代深度神经网络虽然在规模和复杂度上远超最初的感知机，但每个神经元的基本运算模式——加权求和、非线性变换——始终未变。`,
        mermaid: `graph LR
    A["输入 x₁"] -->|权重 w₁| C["求和 Σ"]
    B["输入 x₂"] -->|权重 w₂| C
    D["输入 xₙ"] -->|权重 wₙ| C
    C -->|"z = Σwᵢxᵢ + b"| E["激活函数 f(z)"]
    E --> F["输出 a"]
    
    style A fill:#bbdefb
    style B fill:#bbdefb
    style D fill:#bbdefb
    style E fill:#c8e6c9
    style F fill:#fff3e0`,
        tip: "学习建议：在纸上画一个神经元，标注输入、权重、偏置、激活函数和输出。然后手动计算一次前向传播。这个简单的练习比看十篇教程都有效。",
      },
      {
        title: "2. 感知机：最早的神经网络",
        body: `感知机（Perceptron）由 Frank Rosenblatt 于 1958 年提出，是最简单的神经网络——只有一个神经元。它接收输入 x，计算 z = w·x + b，然后用阶跃函数判断：z ≥ 0 则输出 1，否则输出 0。

感知机的训练规则非常直观：如果预测正确，权重不变；如果预测错误，向正确的方向调整权重。具体地，当 yᵢ = 1 但预测为 0 时，增加权重（w := w + η·xᵢ）；当 yᵢ = 0 但预测为 1 时，减小权重（w := w - η·xᵢ）。

感知机收敛定理保证了：如果数据线性可分，感知机算法在有限步内一定会找到一个完美分类的超平面。但它有两个致命缺陷：只能处理线性可分数据（连 XOR 问题都解决不了）；只能输出 0 或 1，无法给出置信度。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class Perceptron:
    """从零实现经典感知机"""
    
    def __init__(self, lr=0.01, n_iters=1000):
        self.lr = lr
        self.n_iters = n_iters
        self.w = None
        self.b = None
    
    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.w = np.zeros(n_features)
        self.b = 0.0
        
        for _ in range(self.n_iters):
            errors = 0
            for xi, yi in zip(X, y):
                z = np.dot(xi, self.w) + self.b
                y_pred = 1 if z >= 0 else 0
                update = self.lr * (yi - y_pred)
                self.w += update * xi
                self.b += update
                errors += int(update != 0)
            if errors == 0:
                print(f"收敛！迭代 {_+1} 次")
                break
        return self
    
    def predict(self, X):
        z = X @ self.w + self.b
        return np.where(z >= 0, 1, 0)

# 测试 AND 门（线性可分）
X_and = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y_and = np.array([0, 0, 0, 1])

p = Perceptron(lr=0.1, n_iters=100)
p.fit(X_and, y_and)
print(f"AND 门预测: {p.predict(X_and)}")

# 测试 XOR 门（线性不可分——感知机无法解决）
X_xor = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y_xor = np.array([0, 1, 1, 0])

p2 = Perceptron(lr=0.1, n_iters=100)
p2.fit(X_xor, y_xor)
print(f"XOR 门预测: {p2.predict(X_xor)} (应不正确)")`,
          },
        ],
        table: {
          headers: ["逻辑门", "输入 (0,0)", "输入 (0,1)", "输入 (1,0)", "输入 (1,1)", "线性可分"],
          rows: [
            ["AND", "0", "0", "0", "1", "✅"],
            ["OR", "0", "1", "1", "1", "✅"],
            ["NOT", "1", "0", "1", "0", "✅ (单输入)"],
            ["XOR", "0", "1", "1", "0", "❌ 需要多层"],
            ["NAND", "1", "1", "1", "0", "✅"],
          ],
        },
        warning: "XOR 问题是感知机无法跨越的鸿沟——正是这个缺陷导致了第一次 AI 冬天（1969-1980）。Minsky 和 Papert 在《Perceptrons》中证明了感知机的局限性，使得神经网络研究停滞了十几年。",
      },
      {
        title: "3. 激活函数：引入非线性的关键",
        body: `如果没有激活函数，无论多少层网络叠加，本质上仍然是一个线性变换（线性函数的组合仍是线性的）。激活函数的作用是为网络引入非线性能力，使其能够拟合任意复杂的函数。

Sigmoid 函数 σ(z) = 1/(1+e⁻ᶻ)：将输出压缩到 (0, 1) 区间，可解释为概率。在二分类的输出层仍然广泛使用。但它在输入较大或较小时梯度接近零，导致梯度消失问题。

Tanh 函数 tanh(z)：将输出压缩到 (-1, 1) 区间，是零均值的（比 Sigmoid 更好）。但同样存在梯度消失问题。

ReLU 函数 ReLU(z) = max(0, z)：现代深度学习中最常用的激活函数。计算极其高效（只需一个比较操作），在正区间的梯度恒为 1，有效缓解梯度消失。缺点是"死亡 ReLU"问题——如果某个神经元的输出始终为负，它的梯度永远为零，权重不再更新。

Leaky ReLU 和 GELU 是 ReLU 的改进版本。GELU（高斯误差线性单元）在 Transformer 中被广泛使用，它在负区间保留了小概率的激活，使得梯度始终不为零。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def sigmoid_grad(z):
    s = sigmoid(z)
    return s * (1 - s)

def relu(z):
    return np.maximum(0, z)

def relu_grad(z):
    return (z > 0).astype(float)

def gelu(z):
    """GELU 近似实现"""
    return 0.5 * z * (1 + np.tanh(
        np.sqrt(2 / np.pi) * (z + 0.044715 * z**3)
    ))

# 激活函数及梯度对比
z_vals = [-10, -5, -1, 0, 1, 5, 10]
print(f"{'z':>6} | {'Sigmoid':>9} | {'SigGrad':>9} | {'ReLU':>6} | {'ReLUGrad':>6}")
print("-" * 52)
for z in z_vals:
    print(f"{z:6.1f} | {sigmoid(z):9.6f} | {sigmoid_grad(z):9.6f} | {relu(z):6.1f} | {relu_grad(z):6.1f}")

# 梯度消失演示
print("\\n梯度消失演示（深层网络中的 Sigmoid 梯度衰减）：")
gradient = 1.0
for layer in range(1, 11):
    gradient *= 0.25  # sigmoid 最大梯度约 0.25
    print(f"  第 {layer:2d} 层: 梯度 = {gradient:.2e}")`,
          },
        ],
        table: {
          headers: ["激活函数", "输出范围", "梯度范围", "计算成本", "主要优点", "主要缺点"],
          rows: [
            ["Sigmoid", "(0, 1)", "(0, 0.25]", "高（指数运算）", "可解释为概率", "梯度消失、非零均值"],
            ["Tanh", "(-1, 1)", "(0, 1]", "高（指数运算）", "零均值", "梯度消失"],
            ["ReLU", "[0, ∞)", "{0, 1}", "极低", "计算快、缓解梯度消失", "死亡 ReLU"],
            ["Leaky ReLU", "(-∞, ∞)", "{0.01, 1}", "极低", "避免死亡 ReLU", "负区间斜率需选择"],
            ["GELU", "(-∞, ∞)", "连续", "中", "光滑、Transformer 标准", "计算稍复杂"],
          ],
        },
      },
      {
        title: "4. 多层感知机（MLP）：从线性到万能",
        body: `多层感知机（Multi-Layer Perceptron, MLP）是在输入层和输出层之间增加了一个或多个隐藏层的神经网络。正是这些隐藏层使得网络能够学习非线性决策边界。

万能近似定理（Universal Approximation Theorem）：一个具有足够多神经元的单隐藏层 MLP，使用非线性激活函数，可以以任意精度逼近任何定义在紧凑集上的连续函数。这个定理从理论上保证了 MLP 的表达能力。

但"能逼近"不等于"能学好"。定理没有告诉我们：需要多少神经元、如何高效训练、以及能否泛化到未见数据。这些问题的答案催生了深度学习的大量研究成果。

一个典型的 MLP 前向传播过程：第 l 层的输出 a⁽ˡ⁾ = f(W⁽ˡ⁾ · a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)，其中 f 是激活函数。从输入 a⁽⁰⁾ = x 开始，逐层计算直到输出层。`,
        mermaid: `graph LR
    subgraph "输入层"
        I1["x₁"]
        I2["x₂"]
        I3["x₃"]
    end
    
    subgraph "隐藏层 1"
        H1["h₁₁"]
        H2["h₁₂"]
        H3["h₁₃"]
        H4["h₁₄"]
    end
    
    subgraph "隐藏层 2"
        H5["h₂₁"]
        H6["h₂₂"]
        H7["h₂₃"]
    end
    
    subgraph "输出层"
        O1["ŷ₁"]
        O2["ŷ₂"]
    end
    
    I1 --> H1 & H2 & H3 & H4
    I2 --> H1 & H2 & H3 & H4
    I3 --> H1 & H2 & H3 & H4
    H1 --> H5 & H6 & H7
    H2 --> H5 & H6 & H7
    H3 --> H5 & H6 & H7
    H4 --> H5 & H6 & H7
    H5 --> O1 & O2
    H6 --> O1 & O2
    H7 --> O1 & O2`,
        code: [
          {
            lang: "python",
            code: `class MLP:
    """从零实现多层感知机（2 个隐藏层）"""
    
    def __init__(self, layer_sizes, lr=0.01):
        """layer_sizes: [输入维度, 隐藏1, 隐藏2, 输出维度]"""
        self.lr = lr
        self.weights = []
        self.biases = []
        
        # He 初始化
        for i in range(len(layer_sizes) - 1):
            fan_in = layer_sizes[i]
            limit = np.sqrt(2.0 / fan_in)
            w = np.random.randn(fan_in, layer_sizes[i+1]) * limit
            b = np.zeros((1, layer_sizes[i+1]))
            self.weights.append(w)
            self.biases.append(b)
    
    def forward(self, X):
        self.z_list = []
        self.a_list = [X]
        
        a = X
        for i in range(len(self.weights) - 1):
            z = a @ self.weights[i] + self.biases[i]
            a = np.maximum(0, z)  # ReLU
            self.z_list.append(z)
            self.a_list.append(a)
        
        # 输出层（无激活，用于回归）
        z = a @ self.weights[-1] + self.biases[-1]
        self.z_list.append(z)
        self.a_list.append(z)
        return z
    
    def backward(self, X, y):
        m = X.shape[0]
        dz = (self.a_list[-1] - y) / m  # MSE 梯度
        
        dw_list, db_list = [], []
        for i in range(len(self.weights) - 1, -1, -1):
            dw = self.a_list[i].T @ dz
            db = np.sum(dz, axis=0, keepdims=True)
            dw_list.insert(0, dw)
            db_list.insert(0, db)
            
            if i > 0:
                dz = (dz @ self.weights[i].T) * (self.z_list[i-1] > 0)
        
        for i in range(len(self.weights)):
            self.weights[i] -= self.lr * dw_list[i]
            self.biases[i] -= self.lr * db_list[i]
    
    def train(self, X, y, epochs=1000):
        for epoch in range(epochs):
            out = self.forward(X)
            loss = np.mean((out - y) ** 2)
            self.backward(X, y)
            if epoch % 200 == 0:
                print(f"Epoch {epoch:4d}: Loss = {loss:.6f}")

# 测试 XOR
X = np.array([[0,0],[0,1],[1,0],[1,1]], dtype=float)
y = np.array([[0],[1],[1],[0]], dtype=float)

np.random.seed(42)
mlp = MLP([2, 8, 4, 1], lr=0.5)
mlp.train(X, y, epochs=2000)
pred = mlp.forward(X)
print("\\nXOR 结果:")
for i in range(4):
    print(f"  {X[i].astype(int).tolist()} -> {pred[i][0]:.4f} (期望 {int(y[i][0])})")`,
          },
        ],
      },
      {
        title: "5. 反向传播：神经网络的学习引擎",
        body: `反向传播（Backpropagation）是训练神经网络的核心算法。它的本质是链式法则（Chain Rule）在计算图上的高效应用。

理解反向传播的关键是计算图（Computational Graph）。每个运算（加法、乘法、激活函数）都是图中的一个节点。前向传播时，数据从输入流向输出；反向传播时，梯度从输出流回输入。

链式法则告诉我们：如果 z = g(y) 且 y = f(x)，那么 ∂z/∂x = (∂z/∂y) · (∂y/∂x)。在神经网络中，这意味着损失函数对某一层权重的梯度，可以通过逐层传递梯度来计算。

反向传播的四个基本方程（BPE1-BPE4）构成了完整的梯度计算框架。最关键的洞察是：每个神经元的误差 δ⁽ˡ⁾ 可以从后一层的误差 δ⁽ˡ⁺¹⁾ 反向计算得到，这避免了为每个权重单独计算梯度的巨大开销。`,
        mermaid: `graph TD
    A["输入 x"] --> B["前向传播"]
    B --> C["计算损失 L"]
    C --> D["计算 ∂L/∂ŷ"]
    D --> E["反向传播 ∂L/∂w"]
    E --> F["链式法则逐层传递"]
    F --> G["∂L/∂w¹, ∂L/∂w², ..."]
    G --> H["梯度下降更新权重"]
    H --> B
    
    style A fill:#bbdefb
    style C fill:#fff3e0
    style H fill:#c8e6c9`,
        list: [
          "前向传播：计算每一层的 z = W·a + b 和 a = f(z)",
          "输出层误差：δᴸ = ∂L/∂aᴸ ⊙ f'(zᴸ)",
          "隐藏层误差：δˡ = (Wˡ⁺¹)ᵀ · δˡ⁺¹ ⊙ f'(zˡ)",
          "权重梯度：∂L/∂Wˡ = δˡ · (aˡ⁻¹)ᵀ",
          "偏置梯度：∂L/∂bˡ = δˡ",
          "用梯度下降更新所有权重：W := W - α·∂L/∂W",
        ],
        tip: "调试技巧：用数值梯度验证反向传播的正确性。对每个权重 w 计算 (L(w+ε) - L(w-ε)) / 2ε，与反向传播计算的梯度对比。如果差异 > 1e-7，说明反向传播实现有误。",
      },
      {
        title: "6. 梯度消失与梯度爆炸：深度网络的训练难题",
        body: `当神经网络变深时，反向传播中梯度需要乘以多层权重矩阵。根据链式法则，梯度是连乘的形式——如果每个矩阵的谱范数小于 1，梯度会指数级衰减（消失）；如果大于 1，梯度会指数级增长（爆炸）。

梯度消失的后果：浅层（靠近输入）的权重几乎不更新，网络退化为只有最后几层在训练，深度的优势完全丧失。这正是 sigmoid/tanh 时代深层网络无法训练的根本原因。

解决方案包括：使用 ReLU 类激活函数（正区间梯度恒为 1）；Xavier/He 初始化（让每层的输出方差保持一致）；残差连接（ResNet，让梯度可以直接跨层传播）；层归一化/批归一化（稳定每层的输入分布）；梯度裁剪（限制梯度的最大范数，防止爆炸）。`,
        code: [
          {
            lang: "python",
            code: `# 演示梯度消失问题
import numpy as np

def demonstrate_vanishing_gradient():
    """展示不同激活函数的梯度消失效应"""
    n_layers = 20
    
    for act_name, max_grad in [("Sigmoid", 0.25), ("ReLU", 1.0)]:
        grad = 1.0
        print(f"\\n{act_name} ({n_layers} 层):")
        for layer in range(1, n_layers + 1):
            grad *= max_grad
            if layer in [1, 5, 10, 15, 20]:
                print(f"  第 {layer:2d} 层: 梯度 = {grad:.2e}")

demonstrate_vanishing_gradient()

# He 初始化 vs 随机初始化
print("\\nHe 初始化 vs 随机初始化:")
for init_name, scale in [("Xavier", np.sqrt(2/20)), ("He", np.sqrt(2/10)), ("Bad", 5.0)]:
    W = np.random.randn(10, 10) * scale
    a = np.maximum(0, W @ np.random.randn(10, 100))
    print(f"  {init_name:8s}: 权重 std={W.std():.4f}, 激活 std={a.std():.4f}")`,
          },
        ],
        table: {
          headers: ["问题", "原因", "症状", "解决方案"],
          rows: [
            ["梯度消失", "连乘 < 1 的因子", "浅层权重几乎不更新", "ReLU, He 初始化, 残差连接"],
            ["梯度爆炸", "连乘 > 1 的因子", "权重更新过大, NaN", "梯度裁剪, 更好的初始化"],
            ["死亡 ReLU", "负输入导致梯度为零", "部分神经元永久关闭", "Leaky ReLU, 降低学习率"],
            ["激活饱和", "Sigmoid/Tanh 极值区", "梯度接近零, 学习停滞", "换 ReLU, 特征标准化"],
          ],
        },
      },
      {
        title: "7. 权重初始化与学习率策略",
        body: `好的初始化和学习率策略决定了神经网络能否成功训练。

权重初始化：如果权重太大，激活值会饱和（Sigmoid/Tanh）或爆炸（ReLU）；如果权重太小，信号会衰减到零。Xavier 初始化假设激活函数是线性的，让每层的输入和输出方差保持一致，适用于 Sigmoid/Tanh。He 初始化考虑了 ReLU 在负区间的截断，方差放大两倍，是 ReLU 网络的标准选择。

学习率调度：固定学习率往往不是最优的。学习率太大可能跳过最优解，太小则训练极慢。常用的调度策略包括：Step Decay（每 N 个 epoch 衰减）、Cosine Annealing（余弦衰减，在终点附近精细化搜索）、Warmup（先小后大再小，Transformer 训练的标准配置）。`,
        mermaid: `graph LR
    A["权重初始化"] --> B["Xavier (Sigmoid/Tanh)"]
    A --> C["He (ReLU/GELU)"]
    A --> D["LeCun (SELU)"]
    
    E["学习率策略"] --> F["固定 LR"]
    E --> G["Step Decay"]
    E --> H["Cosine Annealing"]
    E --> I["Warmup + Cosine"]
    
    style B fill:#bbdefb
    style C fill:#c8e6c9
    style H fill:#fff3e0
    style I fill:#c8e6c9`,
        list: [
          "ReLU 网络使用 He 初始化：std = sqrt(2/fan_in)",
          "Sigmoid/Tanh 使用 Xavier 初始化：std = sqrt(1/fan_in)",
          "学习率是最关键的超参数——先调 LR，再调其他",
          "从 LR=0.01 开始尝试，以 10 倍间隔搜索 {0.1, 0.01, 0.001, ...}",
          "Warmup + Cosine Annealing 是 Transformer 训练的标配",
          "Adam 优化器通常比 SGD 对学习率更不敏感",
        ],
        warning: "永远不要用大的随机值初始化权重！这是新手最常见的错误之一。错误的初始化会导致激活值饱和或爆炸，网络从一开始就无法学习。",
      },
    ],
  },

  {
    id: "dl-003",
    title: "RNN 与 LSTM：处理序列数据",
    category: "dl",
    tags: ["RNN", "LSTM", "序列建模"],
    summary: "理解循环神经网络的记忆机制与 LSTM 的门控设计",
    date: "2026-04-04",
    readTime: "20 min",
    level: "进阶",
    content: [
      {
        title: "1. 为什么需要循环神经网络？序列数据的特殊性",
        body: `在深度学习的众多任务中，序列数据是一类非常特殊的存在。语音信号、文本、时间序列、视频帧——它们的共同特征是：数据点之间存在先后顺序和依赖关系。

想象你在读一句话："我今天去了一家新开的餐厅，菜品很___。" 你能自然地填出"好吃"或"美味"，因为前面的上下文（餐厅、菜品）提供了线索。但如果这些词被打乱顺序随机给你，你就无法做出这个推断。这就是序列数据的核心挑战：当前时刻的理解依赖于历史信息。

传统的前馈神经网络（Feedforward Neural Network）无法处理这种依赖。它们假设每个输入样本是独立同分布的（i.i.d.），没有"记忆"能力。你给网络输入一句话的第一个词和最后一个词，它无法知道这两个词之间的关联。

循环神经网络（Recurrent Neural Network, RNN）的设计哲学非常优雅：让网络在时间步之间共享权重，并通过隐藏状态（Hidden State）传递历史信息。在每个时间步 t，RNN 接收当前输入 xₜ 和上一时刻的隐藏状态 hₜ₋₁，输出当前隐藏状态 hₜ 和可选的输出 yₜ。这种递归结构使得网络能够处理任意长度的序列。`,
        mermaid: `graph LR
    A["x₁"] --> B["RNN Cell"]
    B --> C["h₁"]
    C --> D["RNN Cell"]
    D --> E["h₂"]
    E --> F["RNN Cell"]
    F --> G["h₃ ... hₜ"]
    
    A2["x₂"] --> D
    A3["x₃"] --> F
    
    style A fill:#3b82f6
    style A2 fill:#3b82f6
    style A3 fill:#3b82f6
    style C fill:#10b981
    style E fill:#10b981
    style G fill:#10b981`,
        tip: "直觉理解：把 RNN 想象成一个有短期记忆的人。每读到一个新词，他结合当前的理解和之前的记忆来更新自己的认知。这就是 hₜ = f(xₜ, hₜ₋₁) 的含义。",
      },
      {
        title: "2. 标准 RNN 的数学推导与前向传播",
        body: `标准 RNN（Elman Network）的核心公式非常简洁：

hₜ = tanh(Wₕₕ · hₜ₋₁ + Wₓₕ · xₜ + bₕ)
yₜ = Wₕᵧ · hₜ + bᵧ

其中，Wₕₕ 是隐藏状态到隐藏状态的权重矩阵（"记忆"的权重），Wₓₕ 是输入到隐藏状态的权重矩阵（"感知"的权重），Wₕᵧ 是隐藏状态到输出的权重矩阵。

关键设计：Wₕₕ 在所有时间步共享。这意味着无论序列有多长，RNN 使用的参数量是固定的。这与将每个时间步当作独立输入的全连接网络形成鲜明对比——后者参数量随序列长度线性增长。

激活函数的选择也很重要。RNN 通常使用 tanh 而非 ReLU 作为隐藏状态的激活函数，原因有二：tanh 的输出范围是 [-1, 1]，这限制了隐藏状态不会无限增长（稳定性）；同时 tanh 在零点附近近似线性，保留了梯度信息。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class VanillaRNN:
    """从零实现标准 RNN"""
    
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        self.hidden_dim = hidden_dim
        # Xavier 初始化（对于 tanh 激活很重要）
        scale_hh = np.sqrt(2.0 / (hidden_dim + hidden_dim))
        scale_xh = np.sqrt(2.0 / (input_dim + hidden_dim))
        self.W_hh = np.random.randn(hidden_dim, hidden_dim) * scale_hh
        self.W_xh = np.random.randn(hidden_dim, input_dim) * scale_xh
        self.b_h = np.zeros(hidden_dim)
        self.W_hy = np.random.randn(output_dim, hidden_dim) * np.sqrt(2.0 / (hidden_dim + output_dim))
        self.b_y = np.zeros(output_dim)
    
    def forward(self, sequence: np.ndarray) -> tuple:
        """前向传播：处理整个序列
        Args:
            sequence: shape (seq_len, input_dim)
        Returns:
            outputs: shape (seq_len, output_dim)
            hidden_states: shape (seq_len + 1, hidden_dim)
        """
        seq_len = sequence.shape[0]
        hidden_states = [np.zeros(self.hidden_dim)]  # h_0 = 0
        outputs = []
        
        for t in range(seq_len):
            x_t = sequence[t]
            h_prev = hidden_states[-1]
            # 核心公式: h_t = tanh(W_hh @ h_{t-1} + W_xh @ x_t + b_h)
            h_t = np.tanh(self.W_hh @ h_prev + self.W_xh @ x_t + self.b_h)
            hidden_states.append(h_t)
            # 输出: y_t = W_hy @ h_t + b_y
            y_t = self.W_hy @ h_t + self.b_y
            outputs.append(y_t)
        
        return np.array(outputs), np.array(hidden_states)
    
    def last_output(self, sequence: np.ndarray) -> np.ndarray:
        """只返回最后一个时间步的输出（序列分类任务常用）"""
        outputs, _ = self.forward(sequence)
        return outputs[-1]

# 测试
rnn = VanillaRNN(input_dim=10, hidden_dim=32, output_dim=5)
seq = np.random.randn(20, 10)  # 20 步，每步 10 维
outputs, states = rnn.forward(seq)
print(f"输入序列长度: {seq.shape[0]}")
print(f"输出形状: {outputs.shape}")   # (20, 5)
print(f"隐藏状态形状: {states.shape}")  # (21, 32) 包含初始 h_0`,
          },
        ],
      },
      {
        title: "3. 梯度消失问题：RNN 的致命缺陷",
        body: `理论上，RNN 能处理任意长度的序列。但实际上，标准 RNN 很难"记住"很久之前的信息。这就是著名的梯度消失（Vanishing Gradient）问题。

让我们通过反向传播来分析原因。RNN 的损失函数 L 对 Wₕₕ 的梯度需要链式法则跨越多个时间步：

∂L/∂Wₕₕ = Σₜ (∂L/∂hₜ) · (∂hₜ/∂Wₕₕ)

其中，∂hₜ/∂hₖ（t > k）涉及 t-k 次矩阵连乘：

∂hₜ/∂hₖ = Πⱼ₌ₖ₊₁ᵗ diag(tanh'(zⱼ)) · Wₕₕ

问题出在这个连乘上。tanh 的导数范围是 (0, 1]，且大部分区域远小于 1。假设平均导数为 0.5，那么 10 步之后的梯度贡献就是 0.5¹⁰ ≈ 0.001——几乎消失了。

这导致什么后果？RNN 只能学习短期依赖（通常不超过 5-10 步）。对于需要长距离依赖的任务（如理解长文档、翻译长句子），标准 RNN 几乎无能为力。

有趣的是，也存在梯度爆炸（Exploding Gradient）问题——当 Wₕₕ 的特征值大于 1 时，连乘会导致梯度指数级增长，训练不稳定。梯度爆炸可以用梯度裁剪（Gradient Clipping）解决，但梯度消失需要架构级的创新。`,
        code: [
          {
            lang: "python",
            code: `# 数值演示：为什么 RNN 的梯度会消失
import numpy as np

def demonstrate_gradient_vanishing(seq_length=20):
    """数值演示 RNN 反向传播中的梯度消失"""
    tanh_deriv_avg = 0.5
    W_hh_norm = 0.8  # W_hh 的典型谱范数
    decay_factor = tanh_deriv_avg * W_hh_norm
    
    print(f"每步梯度衰减因子: {decay_factor:.4f}")
    print(f"\n时间步 | 相对梯度大小 | 衰减程度")
    print("-" * 40)
    
    for t in range(1, seq_length + 1):
        relative_gradient = decay_factor ** t
        emoji = "🟢" if relative_gradient > 0.01 else "🟡" if relative_gradient > 0.0001 else "🔴"
        print(f"  t={t:2d}   | {relative_gradient:.6e} | {emoji}")
    
    print(f"\n结论：{seq_length} 步后，梯度只剩初始的 {decay_factor**seq_length:.2e}")
    print("这就是为什么 RNN 很难学习长距离依赖。")

def demonstrate_gradient_clipping():
    """演示梯度裁剪如何解决梯度爆炸"""
    np.random.seed(42)
    norms_no_clip = np.random.lognormal(mean=0, sigma=2, size=100)
    max_norm = 5.0
    clipped = np.minimum(norms_no_clip, max_norm)
    
    print("梯度裁剪效果：")
    print(f"  裁剪前 | 最大值: {norms_no_clip.max():.2f}, 均值: {norms_no_clip.mean():.2f}")
    print(f"  裁剪后 | 最大值: {clipped.max():.2f}, 均值: {clipped.mean():.2f}")
    print(f"  被裁剪的比例: {(norms_no_clip > max_norm).mean() * 100:.1f}%")

demonstrate_gradient_vanishing()
print()
demonstrate_gradient_clipping()`,
          },
        ],
        table: {
          headers: ["问题", "原因", "影响", "解决方案"],
          rows: [
            ["梯度消失", "tanh' × W 连乘 < 1", "无法学习长距离依赖", "LSTM/GRU 门控机制"],
            ["梯度爆炸", "W 的谱范数过大", "训练不稳定、NaN", "梯度裁剪（Gradient Clipping）"],
            ["短期记忆", "隐藏状态容量有限", "只能记住最近几步", "增大 hidden_dim（有限效果）"],
          ],
        },
        warning: "标准 RNN 在 2026 年已经很少用于实际项目。它的教学价值在于让你理解序列建模的基本思想，但实际工程中应该使用 LSTM、GRU 或 Transformer。",
      },
      {
        title: "4. LSTM：门控机制解决梯度消失",
        body: `LSTM（Long Short-Term Memory）是 Hochreiter & Schmidhuber（1997）提出的划时代架构。它的核心创新是"门控机制"（Gating Mechanism）——通过精心设计的门来控制信息的流动，从而解决梯度消失问题。

LSTM 引入了三个门和一个细胞状态：

遗忘门（Forget Gate）：决定从细胞状态中丢弃什么信息。它读取 hₜ₋₁ 和 xₜ，输出一个 0 到 1 之间的向量 fₜ，与细胞状态 Cₜ₋₁ 逐元素相乘。fₜ = 0 表示完全遗忘，fₜ = 1 表示完全保留。

输入门（Input Gate）：决定向细胞状态中添加什么新信息。包含两部分：iₜ 决定更新的幅度（sigmoid），C̃ₜ 是候选值（tanh）。

输出门（Output Gate）：决定基于细胞状态输出什么。oₜ 决定输出的幅度，hₜ = oₜ ⊙ tanh(Cₜ)。

LSTM 的精髓在于细胞状态 Cₜ 的更新方式：Cₜ = fₜ ⊙ Cₜ₋₁ + iₜ ⊙ C̃ₜ。当 fₜ ≈ 1 且 iₜ ≈ 0 时，Cₜ ≈ Cₜ₋₁——信息无损地流过时间步。这条"高速公路"（Constant Error Carousel）让梯度可以几乎无衰减地反向传播，从根本上解决了梯度消失问题。`,
        mermaid: `graph TD
    X["输入 xₜ"] --> C["Concat xₜ 和 hₜ₋₁"]
    H["hₜ₋₁"] --> C
    
    C --> F["遗忘门 fₜ\nsigmoid"]
    C --> I["输入门 iₜ\nsigmoid"]
    C --> N["候选值 C̃ₜ\ntanh"]
    C --> O["输出门 oₜ\nsigmoid"]
    
    F --> M1["⊙ 逐元素乘"]
    C_prev["Cₜ₋₁"] --> M1
    M1 --> A["+ 逐元素加"]
    I --> M2["⊙"]
    N --> M2
    M2 --> A
    A --> C_curr["Cₜ 细胞状态"]
    
    C_curr --> T["tanh"]
    T --> M3["⊙"]
    O --> M3
    M3 --> H_out["hₜ 输出"]
    
    style C_curr fill:#f59e0b
    style H_out fill:#10b981
    style F fill:#3b82f6
    style I fill:#3b82f6
    style O fill:#3b82f6
    style N fill:#8b5cf6`,
        code: [
          {
            lang: "python",
            code: `class LSTM:
    """从零实现 LSTM——理解门控机制"""
    
    def __init__(self, input_dim: int, hidden_dim: int):
        self.hidden_dim = hidden_dim
        self.W_f = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.1
        self.b_f = np.ones(hidden_dim)  # 初始偏置为 1，让遗忘门初始"不遗忘"
        self.W_i = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.1
        self.b_i = np.zeros(hidden_dim)
        self.W_c = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.1
        self.b_c = np.zeros(hidden_dim)
        self.W_o = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.1
        self.b_o = np.zeros(hidden_dim)
    
    def forward(self, sequence: np.ndarray):
        """LSTM 前向传播"""
        seq_len = sequence.shape[0]
        h = np.zeros(self.hidden_dim)
        c = np.zeros(self.hidden_dim)
        hidden_states = [h.copy()]
        cell_states = [c.copy()]
        
        for t in range(seq_len):
            x = sequence[t]
            combined = np.concatenate([h, x])
            # 遗忘门
            f = self._sigmoid(self.W_f @ combined + self.b_f)
            # 输入门
            i = self._sigmoid(self.W_i @ combined + self.b_i)
            # 候选细胞状态
            c_tilde = np.tanh(self.W_c @ combined + self.b_c)
            # 输出门
            o = self._sigmoid(self.W_o @ combined + self.b_o)
            # 更新细胞状态（关键！）
            c = f * c + i * c_tilde
            # 更新隐藏状态
            h = o * np.tanh(c)
            hidden_states.append(h.copy())
            cell_states.append(c.copy())
        
        return np.array(hidden_states), np.array(cell_states)
    
    @staticmethod
    def _sigmoid(x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

# 演示
lstm = LSTM(input_dim=10, hidden_dim=32)
seq = np.random.randn(50, 10)
h_states, c_states = lstm.forward(seq)
print(f"隐藏状态形状: {h_states.shape}")
print(f"细胞状态最终值范围: [{c_states[-1].min():.3f}, {c_states[-1].max():.3f}]")
print(f"隐藏状态最终值范围: [{h_states[-1].min():.3f}, {h_states[-1].max():.3f}]")`,
          },
        ],
      },
      {
        title: "5. GRU 与 LSTM 对比",
        body: `GRU（Gated Recurrent Unit）由 Cho 等人（2014）提出，是 LSTM 的简化版本。它将 LSTM 的四个门简化为两个：更新门（Update Gate）和重置门（Reset Gate）。

更新门 zₜ 融合了 LSTM 中遗忘门和输入门的功能——它同时决定保留多少旧信息和添加多少新信息。重置门 rₜ 决定忽略多少过去的隐藏状态。

GRU 的优势：参数更少（训练更快）、在中小数据集上效果与 LSTM 相当、实现更简单。在许多实际任务中，GRU 和 LSTM 的性能差异很小（通常 < 1%），但 GRU 训练速度更快。`,
        table: {
          headers: ["特性", "标准 RNN", "LSTM", "GRU"],
          rows: [
            ["门数量", "无", "3个（遗忘/输入/输出）", "2个（更新/重置）"],
            ["参数量", "最少", "最多（~4x RNN）", "中等（~3x RNN）"],
            ["长距离依赖", "很差", "优秀", "良好"],
            ["训练速度", "最快", "最慢", "中等"],
            ["记忆容量", "低", "高（细胞状态 + 隐藏状态）", "中（仅隐藏状态）"],
            ["2026 年使用频率", "极少", "中等", "中等"],
          ],
        },
        list: [
          "选择建议：需要最强记忆能力 → LSTM；追求效率 → GRU；教学/理解 → 从标准 RNN 开始",
          "在 Transformer 出现后，RNN 家族在 NLP 中基本被取代，但在时间序列预测、音频处理等领域仍有重要地位",
          'LSTM 的细胞状态是一条“信息高速公路”，让长期依赖成为可能',
          "现代实践中，RNN/LSTM/GRU 常用于 Transformer 不适合的场景：流式处理（需要逐 token 输出）、低延迟推理、资源受限设备",
        ],
      },
      {
        title: "6. RNN 家族的实际应用场景",
        body: `尽管 Transformer 在 NLP 领域占据主导地位，RNN 家族在以下场景中仍然不可替代。

时间序列预测：股票价格、天气预测、销售预测等场景中，LSTM 和 GRU 仍然是主流选择。原因是时间序列数据通常具有强烈的时间依赖性，且数据量不足以训练大型 Transformer。LSTM 的门控机制天然适合捕捉时间序列中的趋势和周期性模式。

语音识别：虽然端到端的 Transformer 模型（如 Whisper）在语音识别上表现出色，但流式语音识别（实时转写）仍然依赖 RNN 架构，因为 RNN 可以逐帧处理输入，而 Transformer 需要完整的上下文窗口。

音乐生成：音乐的时序特性使其非常适合 RNN 建模。LSTM 可以学习音乐的节奏、和弦进行和旋律模式，生成连贯的音乐片段。`,
        code: [
          {
            lang: "python",
            code: `# 用 LSTM 进行时间序列预测
import numpy as np

class TimeSeriesPredictor:
    """用 LSTM 做时间序列预测"""
    
    def __init__(self, seq_len: int = 60, feature_dim: int = 1, hidden_dim: int = 64):
        self.seq_len = seq_len
        self.lstm = LSTM(input_dim=feature_dim, hidden_dim=hidden_dim)
        self.W_out = np.random.randn(1, hidden_dim) * 0.1
        self.b_out = np.zeros(1)
    
    def create_sequences(self, data: np.ndarray) -> tuple:
        """将时间序列转换为监督学习格式"""
        X, y = [], []
        for i in range(len(data) - self.seq_len):
            X.append(data[i:i + self.seq_len])
            y.append(data[i + self.seq_len])
        return np.array(X), np.array(y)
    
    def predict_next(self, history: np.ndarray) -> float:
        """基于历史序列预测下一个值"""
        seq = history[-self.seq_len:]
        h_states, _ = self.lstm.forward(seq)
        h_last = h_states[-1]
        return float(self.W_out @ h_last + self.b_out)
    
    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        predictions = [self.predict_next(seq.flatten()) for seq in X_test]
        predictions = np.array(predictions).flatten()
        mse = np.mean((predictions - y_test) ** 2)
        mae = np.mean(np.abs(predictions - y_test))
        return {"MSE": round(float(mse), 6), "MAE": round(float(mae), 6)}

# 生成模拟时间序列（带趋势和季节性）
np.random.seed(42)
n_points = 1000
t = np.arange(n_points)
trend = 0.01 * t
seasonality = 10 * np.sin(2 * np.pi * t / 50)
noise = np.random.randn(n_points) * 2
series = trend + seasonality + noise

model = TimeSeriesPredictor(seq_len=60, hidden_dim=64)
X, y = model.create_sequences(series.reshape(-1, 1))
print(f"训练序列数: {X.shape[0]}")
print(f"序列形状: {X[0].shape} -> 预测单值")`,
          },
        ],
        tip: "在 2026 年的实际工程中，如果你做 NLP，优先选择 Transformer；如果你做时间序列预测，LSTM/GRU 仍然是可靠选择；如果你需要流式处理（低延迟逐 token 输出），RNN 架构有天然优势。",
      },
    ],
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
    readTime: "22 min",
    level: "入门",
    content: [
      {
        title: "1. 什么是 AI Agent？从聊天机器人到自主智能体",
        body: `AI Agent（智能体）是 2024-2026 年 AI 领域最引人注目的范式转变。要理解它，我们先看看 AI 系统的演进路径：

第一代：问答系统——你问它答，被动响应。ChatGPT 刚发布时就是这种模式：用户输入一段文字，模型生成回复，然后等待下一次输入。这种交互模式下，模型完全没有"主动性"。

第二代：工具增强——模型可以调用外部工具（搜索引擎、代码执行器、API），但仍需要用户明确指定。用户说"帮我搜索 XX"，模型执行搜索并返回结果。

第三代：AI Agent——模型不仅能够使用工具，还能自主规划、分解复杂任务、在多步执行中保持上下文、根据执行结果动态调整策略。Agent 的核心特征是"主动性"和"自主性"。

举个例子：如果你让一个 Agent "帮我订一张下周北京到上海的机票"，它会自动：理解你的偏好→搜索航班→比较价格和时刻→检查你的日历→执行预订→发送确认。整个过程不需要你逐步指导。

Agent 不是单一技术，而是一种架构模式——它将大语言模型（LLM）作为"大脑"，围绕它构建感知、规划、记忆和执行的完整系统。这篇文章将深入拆解每一个组件。`,
        mermaid: `graph LR
    A["用户目标"] --> B["感知模块\\n理解意图"]
    B --> C["规划模块\\n任务分解"]
    C --> D["记忆模块\\n上下文管理"]
    D --> E["执行模块\\n工具调用"]
    E --> F["观察结果"]
    F --> C
    F -.->|任务完成| G["输出结果"]`,
        tip: "关键区分：Agent ≠ 更好的聊天机器人。聊天机器人是对话的，Agent 是目标驱动的。聊天机器人等待输入，Agent 主动采取行动。",
      },
      {
        title: "2. Agent 的四大核心组件",
        body: `一个完整的 AI Agent 系统通常包含四个核心组件，这个架构框架由 Stanford 的"Agent4Science"论文和多个开源框架（LangChain、AutoGen、CrewAI）共同确立。

感知模块（Perception）：负责理解用户的意图和环境状态。在大多数 Agent 系统中，LLM 本身就是感知模块——它接收自然语言输入，理解其中的目标、约束和上下文。但感知不止于理解文字，还包括：从结构化数据中提取信息（如读取数据库）、从非结构化内容中识别模式（如分析文档）、以及感知外部环境状态（如检查网页内容）。

规划模块（Planning）：这是 Agent 的"智慧"所在。规划分为两个层次：任务分解（Task Decomposition）——将复杂目标拆解为可执行的子任务序列；策略选择（Strategy Selection）——根据当前状态选择最优的执行路径。规划的核心挑战是：LLM 一次性生成的计划往往不完美，需要在执行中动态调整（Re-planning）。

记忆模块（Memory）：Agent 需要"记住"信息才能做出连贯的决策。记忆分为三种：短期记忆——当前对话上下文和正在执行的任务状态；长期记忆——通过向量数据库存储的历史经验和知识；工作记忆——当前步骤的中间结果和变量。

执行模块（Action/Tool Use）：将规划转化为实际行动。Agent 通过工具调用（Function Calling）来与外部世界交互：调用 API、执行代码、读写文件、操作浏览器等。执行模块的关键设计是：工具描述必须清晰（让 LLM 理解每个工具的用途），执行结果必须反馈给规划模块形成闭环。`,
        table: {
          headers: ["组件", "核心职责", "典型技术", "关键挑战"],
          rows: [
            ["感知（Perception）", "理解意图和环境", "LLM 文本理解、多模态解析", "歧义消解、不完整信息"],
            ["规划（Planning）", "任务分解和策略选择", "ReAct、CoT、ToT、反射", "计划不完美、需要动态调整"],
            ["记忆（Memory）", "存储和检索信息", "向量数据库、知识图谱、摘要", "信息过载、检索准确性"],
            ["执行（Action）", "与外部世界交互", "Function Calling、API 调用、代码执行", "工具错误处理、安全性"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 一个极简 Agent 框架的实现
from typing import List, Dict, Callable
import json

class SimpleAgent:
    """极简 AI Agent：感知→规划→执行→观察的循环"""
    
    def __init__(self, llm, tools: Dict[str, Callable]):
        self.llm = llm
        self.tools = tools
        self.memory = []
        self.max_steps = 10
    
    def plan(self, goal: str, history: List[Dict]) -> Dict:
        """规划模块：让 LLM 决定下一步行动"""
        tools_desc = json.dumps(
            {name: fn.__doc__ for name, fn in self.tools.items()},
            ensure_ascii=False, indent=2
        )
        history_str = json.dumps(history[-5:], ensure_ascii=False, indent=2)
        prompt = f"""你是一个 AI Agent。当前目标是：{goal}

可用工具：
{tools_desc}

最近执行历史：
{history_str}

请决定下一步行动。返回 JSON 格式：
{{"tool": "工具名", "input": "输入参数"}}
如果目标已完成，返回 {{"done": true, "result": "最终结果"}}"""
        response = self.llm(prompt)
        return json.loads(response)
    
    def execute(self, tool_name: str, tool_input: str) -> str:
        if tool_name not in self.tools:
            return f"错误：工具不存在"
        try:
            return str(self.tools[tool_name](tool_input))
        except Exception as e:
            return f"执行错误：{str(e)}"
    
    def run(self, goal: str) -> str:
        print(f"开始执行目标：{goal}")
        for step in range(self.max_steps):
            plan = self.plan(goal, self.memory)
            if plan.get("done"):
                return plan.get("result", "任务完成")
            tool_name = plan.get("tool", "")
            tool_input = plan.get("input", "")
            print(f"  步骤 {step+1}: {tool_name}({tool_input[:50]}...)")
            obs = self.execute(tool_name, tool_input)
            self.memory.append({"step": step + 1, "plan": plan, "observation": obs[:500]})
        return "达到最大步数，任务未完成"

# 定义工具
def search_web(query: str) -> str:
    """搜索网络获取信息"""
    return f"搜索结果：关于'{query}'的相关信息..."

def calculate(expression: str) -> str:
    """计算数学表达式"""
    return str(eval(expression))`,
          },
        ],
      },
      {
        title: "3. 规划模式：Agent 如何思考",
        body: `规划是 Agent 智能的核心体现。LLM 本身是一个"下一个 token 预测器"，它没有内在的目标导向。Agent 框架通过设计特定的 prompt 结构和执行流程，让 LLM 展现出"思考"和"规划"的能力。

ReAct 模式（Reasoning + Acting）：这是最经典的 Agent 规划范式。核心思想是让 LLM 在每一步都先"思考"（Thought），再"行动"（Action），然后"观察"（Observation），如此循环。ReAct 的优势在于：思考过程被显式记录下来，便于调试和理解；每一步的观察结果直接反馈给下一步的思考，形成动态调整。

思维树（Tree of Thoughts, ToT）：当任务特别复杂时，单线的 ReAct 可能不够。ToT 让 Agent 在关键决策点生成多个可能的"思路分支"，评估每个分支的可行性，选择最有希望的路径继续。这类似于人类在面对复杂问题时会考虑多种解决方案。

反射（Reflection）：高级 Agent 不仅执行任务，还会在执行后"反思"：哪些步骤做得好？哪些可以改进？这种元认知能力让 Agent 能够自我优化。典型的实现方式是让 LLM 对执行历史进行总结和评估，生成改进建议。`,
        mermaid: `sequenceDiagram
    participant U as 用户
    participant P as 规划模块
    participant M as 记忆模块
    participant T as 工具层
    
    U->>P: 提交目标
    loop 直到完成
        P->>P: Thought（思考）
        P->>T: Action（调用工具）
        T-->>P: Observation（结果）
        P->>M: 存入记忆
        P->>P: 是否需要调整计划？
    end
    P->>U: 返回最终结果`,
        code: [
          {
            lang: "python",
            code: `# ReAct 模式的完整实现
REACT_PROMPT = """你是一个 AI 助手，通过"思考-行动-观察"循环来解决复杂问题。

可用工具：
{tools}

格式：
Thought: <你的思考>
Action: <工具名>
Action Input: <工具输入>
Observation: <工具返回结果>
...（重复以上步骤）
Thought: 我已经有了足够的信息。
Final Answer: <最终答案>

问题：{question}

开始：
"""

class ReActAgent:
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = tools
        self.max_iterations = 8
    
    def _parse_response(self, text: str) -> dict:
        result = {"thought": "", "action": None, "action_input": None, "final_answer": None}
        for line in text.strip().split("\n"):
            if line.startswith("Thought:"):
                result["thought"] = line[len("Thought:"):].strip()
            elif line.startswith("Action:"):
                result["action"] = line[len("Action:"):].strip()
            elif line.startswith("Action Input:"):
                result["action_input"] = line[len("Action Input:"):].strip()
            elif line.startswith("Final Answer:"):
                result["final_answer"] = line[len("Final Answer:"):].strip()
        return result
    
    def run(self, question: str) -> str:
        tools_desc = "\n".join(f"- {name}: {fn.__doc__}" for name, fn in self.tools.items())
        prompt = REACT_PROMPT.format(tools=tools_desc, question=question)
        for i in range(self.max_iterations):
            response = self.llm(prompt)
            parsed = self._parse_response(response)
            print(f"  Thought: {parsed['thought']}")
            if parsed["final_answer"]:
                return parsed["final_answer"]
            if parsed["action"] and parsed["action_input"]:
                tool = self.tools.get(parsed["action"])
                if tool:
                    obs = tool(parsed["action_input"])
                    print(f"  Action: {parsed['action']}('{parsed['action_input'][:30]}...')")
                    print(f"  Observation: {obs[:100]}...")
                    prompt += response + f"\nObservation: {obs}\n"
                else:
                    prompt += response + "\nObservation: 工具不存在\n"
            else:
                prompt += response + "\n"
        return "达到最大迭代次数"`,
          },
        ],
        warning: "规划模块的常见陷阱：① 过度规划——Agent 生成过于详细的计划，但执行中环境变化导致计划失效；② 规划惰性——Agent 倾向于选择最简单的路径而非最优路径；③ 上下文丢失——长任务中，Agent 可能忘记最初的目标。缓解策略：定期让 Agent 复述当前目标。",
      },
      {
        title: "4. 记忆系统：Agent 的长期记忆",
        body: `如果没有记忆，Agent 就只是一个无状态的函数——每次调用都从零开始。记忆系统赋予 Agent 连续性和学习能力。

短期记忆（Short-term Memory）：就是当前对话的上下文窗口。LLM 的上下文长度有限（例如 128K tokens），这意味着 Agent 不能无限地记住所有历史。常见的策略是：滑动窗口（保留最近 N 条消息）、摘要压缩（将旧对话压缩为摘要）、关键信息提取（只保留与当前任务相关的信息）。

长期记忆（Long-term Memory）：通过外部存储实现。最常用的是向量数据库（Vector Database）：将历史交互、知识点、经验转化为向量嵌入（Embedding），在需要时通过语义相似度检索。这使得 Agent 可以"记住"大量信息，而不受上下文窗口限制。

情景记忆（Episodic Memory）vs 语义记忆（Semantic Memory）：借鉴认知心理学的分类，情景记忆存储"发生了什么"（具体事件），语义记忆存储"知道什么"（抽象知识）。Agent 系统也可以做类似的区分：将具体交互记录存储在情景记忆中，将从中提取的通用知识存储在语义记忆中。`,
        table: {
          headers: ["记忆类型", "存储方式", "容量", "检索方式", "典型应用"],
          rows: [
            ["短期记忆", "上下文窗口", "有限（128K tokens）", "顺序访问", "当前任务上下文"],
            ["情景记忆", "向量数据库", "近乎无限", "语义相似度检索", "历史经验回放"],
            ["语义记忆", "知识图谱/文档", "可扩展", "关键词/语义检索", "领域知识库"],
            ["程序记忆", "工具描述/脚本", "可扩展", "按需加载", "工具使用指南"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 基于向量相似度的 Agent 记忆系统
import numpy as np
from typing import List, Dict

class VectorMemory:
    def __init__(self, embed_fn, top_k: int = 5):
        self.embed_fn = embed_fn
        self.memories: List[Dict] = []
        self.top_k = top_k
    
    def add(self, text: str, metadata: Dict = None):
        embedding = self.embed_fn(text)
        self.memories.append({
            "text": text, "embedding": embedding,
            "metadata": metadata or {},
        })
    
    def retrieve(self, query: str) -> List[Dict]:
        query_vec = self.embed_fn(query)
        sims = []
        for mem in self.memories:
            sim = float(np.dot(query_vec, mem["embedding"]) / 
                       (np.linalg.norm(query_vec) * np.linalg.norm(mem["embedding"]) + 1e-8))
            sims.append((sim, mem))
        sims.sort(key=lambda x: x[0], reverse=True)
        return [{"text": m["text"], "score": round(s, 3), "metadata": m["metadata"]}
                for s, m in sims[:self.top_k]]

# 使用示例
def dummy_embed(text: str) -> np.ndarray:
    h = hash(text) % 10000
    return np.random.RandomState(h).rand(128)

memory = VectorMemory(embed_fn=dummy_embed, top_k=3)
memory.add("用户喜欢用 Python 写数据分析代码", {"type": "preference"})
memory.add("项目使用 FastAPI 作为后端框架", {"type": "project"})
memory.add("上次讨论了 Transformer 架构", {"type": "history"})
results = memory.retrieve("用户的编程偏好是什么？")
for r in results:
    print(f"  [{r['score']}] {r['text']}")`,
          },
        ],
      },
      {
        title: "5. 工具调用（Function Calling）：Agent 的双手",
        body: `工具调用是 Agent 与外部世界交互的唯一方式。没有工具，Agent 就只是一个会说话的模型——它无法获取实时信息、无法执行计算、无法影响外部环境。

Function Calling 的工作原理：现代 LLM（如 GPT-4、Claude、Qwen）都支持函数调用能力。开发者提供一组函数描述（名称、参数、用途），LLM 在需要时返回一个结构化的函数调用请求。系统执行这个函数，将结果返回给 LLM，LLM 再基于结果继续推理。

工具设计的黄金法则：① 描述清晰——每个工具的名称和描述必须让 LLM 能准确理解其用途；② 参数明确——参数的类型和含义要精确描述；③ 错误处理——工具失败时返回有意义的错误信息，帮助 LLM 决定重试还是换方案；④ 最小权限——工具只授予完成任务所需的最小权限，避免安全风险。

Agent 的"工具箱"：常见的 Agent 工具包括：搜索引擎（获取实时信息）、代码执行器（运行 Python/JavaScript 代码）、文件操作（读写本地文件）、数据库查询（访问结构化数据）、API 调用（与第三方服务交互）、浏览器自动化（操作网页）。`,
        code: [
          {
            lang: "python",
            code: `# 完整的工具定义与调用框架
import json
from typing import Any, Dict, List, Callable

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, dict] = {}
    
    def register(self, name: str, description: str, param_names: List[str], func: Callable):
        self._tools[name] = {"name": name, "description": description, "param_names": param_names, "func": func}
    
    def get_tools_description(self) -> List[Dict]:
        return [{"name": t["name"], "description": t["description"]} for t in self._tools.values()]
    
    def call_tool(self, name: str, args: Dict) -> Any:
        tool = self._tools.get(name)
        if not tool:
            raise ValueError(f"未知工具: {name}")
        return tool["func"](**{k: v for k, v in args.items() if k in tool["param_names"]})

def search_tool(query: str, num_results: int = 5) -> str:
    """搜索网络获取信息"""
    import urllib.request
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&format=json&srlimit={num_results}"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read())
        results = data.get("query", {}).get("search", [])
        if not results:
            return f"未找到关于'{query}'的结果"
        return "\n".join(f"- {r['title']}: {r['snippet'][:100]}..." for r in results[:num_results])
    except Exception as e:
        return f"搜索失败: {e}"

def calculator_tool(expression: str) -> str:
    """安全计算数学表达式"""
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expression):
        return "错误：表达式包含不允许的字符"
    try:
        return str(eval(expression))
    except Exception as e:
        return f"计算错误: {e}"

registry = ToolRegistry()
registry.register("search", "搜索网络获取实时信息", ["query", "num_results"], search_tool)
registry.register("calculator", "计算数学表达式", ["expression"], calculator_tool)
print(json.dumps(registry.get_tools_description(), indent=2, ensure_ascii=False))`,
          },
        ],
        tip: "工具开发的实用建议：先写工具的描述和参数定义，再实现函数体。因为 LLM 理解工具的唯一方式就是描述——描述写得好，Agent 就能准确使用工具。",
      },
      {
        title: "6. Agent 框架对比与选择",
        body: `2024-2026 年间，涌现了大量 Agent 框架。理解它们的差异，能帮助你在实际项目中做出正确的选择。

LangChain/LangGraph：最流行的 Agent 框架，提供了完整的工具链。LangChain 擅长"链式"的线性流程，而 LangGraph 支持更复杂的图结构（循环、分支）。适合需要快速原型的场景。但抽象层次较高，调试可能困难。

AutoGen（Microsoft）：多 Agent 协作框架的标杆。支持多个 Agent 之间通过对话协作完成任务，内置了用户参与模式（Human-in-the-loop）。适合需要复杂团队协作的场景。

CrewAI：轻量级的多 Agent 框架，API 设计优雅，学习曲线低。适合小型项目和快速实验。`,
        table: {
          headers: ["框架", "单/多 Agent", "学习曲线", "适合场景", "最大优势"],
          rows: [
            ["LangChain/LangGraph", "两者都支持", "中等", "快速原型、生产部署", "生态最完善、工具最多"],
            ["AutoGen", "多 Agent", "较陡", "复杂团队协作、研究", "多 Agent 对话最强"],
            ["CrewAI", "多 Agent", "低", "小型项目、实验", "API 最优雅"],
            ["OpenAI Assistants API", "单 Agent", "低", "生产级应用", "官方支持、最稳定"],
            ["自定义框架", "灵活", "高", "特定需求、深度优化", "完全可控"],
          ],
        },
        list: [
          "选择框架前，先明确：你的任务是单步还是多步？需要多个 Agent 协作吗？对可控性的要求有多高？",
          "新项目建议从 LangChain 开始——文档最全、社区最大、遇到问题最容易找到答案",
          "多 Agent 协作场景优先考虑 AutoGen 或 CrewAI",
          "生产环境考虑 OpenAI Assistants API——最稳定但灵活性最低",
        ],
      },
      {
        title: "7. 实际应用场景与最佳实践",
        body: `AI Agent 已经在多个领域展现出巨大的实用价值。

软件开发：Agent 可以作为"AI 编程助手"，不仅能补全代码，还能理解整个代码库的架构、编写测试、修复 Bug、审查代码。典型工具包括 Devin（AI 软件工程师）、GitHub Copilot Workspace 等。Agent 在开发中的核心价值不是"替代程序员"，而是"放大程序员的生产力"——让一个程序员能做以前需要两三个人才能完成的工作。

数据分析：Agent 可以自动完成"数据探索→清洗→分析→可视化→报告"的完整流程。用户上传数据集，Agent 自动识别数据类型、生成描述性统计、发现异常值、构建可视化图表、撰写分析结论。

客户服务：新一代客服 Agent 不再只是关键词匹配的聊天机器人，而是能真正理解客户问题、查询订单状态、处理退款、升级复杂问题的智能助手。`,
        mermaid: `graph TD
    A["Agent 应用场景"] --> B["软件开发"]
    A --> C["数据分析"]
    A --> D["客户服务"]
    A --> E["自动化运维"]
    
    B --> B1["代码补全 + Bug 修复"]
    B --> B2["测试生成 + 代码审查"]
    C --> C1["自动 EDA + 可视化"]
    C --> C2["自然语言查询数据"]
    D --> D1["智能问答 + 工单处理"]
    D --> D2["情感分析 + 升级判断"]
    E --> E1["日志分析 + 异常检测"]
    E --> E2["自动修复 + 告警"]`,
        warning: "Agent 的安全风险不容忽视：① 工具权限过大——Agent 可能执行破坏性操作；② Prompt 注入——恶意用户通过精心构造的输入让 Agent 执行未授权操作；③ 无限循环——Agent 可能在规划-执行循环中陷入死循环。缓解策略：沙盒执行、权限最小化、超时限制、人工审批关键操作。",
        tip: "Agent 开发的黄金法则：从简单开始。不要一开始就构建复杂的多 Agent 系统。先用单 Agent + 几个工具验证核心流程，确认有效后再逐步扩展。",
      },
    ],
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
