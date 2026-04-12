import { Article } from '../knowledge';

export const article: Article = {
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
  };
