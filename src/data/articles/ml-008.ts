import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-008",
    title: "K-Means：无监督聚类基础",
    category: "ml",
    tags: ["聚类", "无监督学习", "K-Means"],
    summary: "从直觉到实战，掌握最经典的无监督聚类算法 K-Means 及其核心技巧",
    date: "2026-04-12",
    readTime: "20 min",
    level: "入门",
    content: [
      {
        title: "1. 什么是聚类？直觉与概念",
        body: `聚类（Clustering）是无监督学习中最核心的任务之一。与分类不同，聚类面对的数据没有任何标签——算法需要自己从数据中发现结构，把相似的样本「分堆」。

想象一个场景：你是一家电商公司的数据分析师，手头有 10 万用户的消费数据（购买频次、平均客单价、退货率等），但没有任何用户分群标签。老板问你：「能不能帮我把用户分成几类？」这就是聚类的典型场景——你不知道分类标准是什么，但你相信数据中天然存在不同的用户群体。

聚类算法的核心假设是：同一簇（Cluster）内的样本彼此相似，不同簇之间的样本差异较大。衡量「相似」的方式通常使用距离度量，最常见的是欧氏距离。

K-Means 之所以经典，是因为它简单、快速、可解释，而且效果在大多数情况下都不错。理解 K-Means 是学习所有聚类算法的起点。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs

# 生成模拟的聚类数据
X, y_true = make_blobs(
    n_samples=300,
    centers=4,
    cluster_std=0.60,
    random_state=42
)

# 可视化原始数据
plt.scatter(X[:, 0], X[:, 1], s=15, alpha=0.6, edgecolors='w')
plt.title('模拟聚类数据（无标签）')
plt.xlabel('特征 1')
plt.ylabel('特征 2')
plt.show()`,
          },
          {
            lang: "python",
            code: `from scipy.spatial.distance import cdist

def euclidean_distance(a, b):
    """计算两个点之间的欧氏距离"""
    return np.sqrt(np.sum((a - b) ** 2))

# 验证距离计算
point_a = np.array([1.0, 2.0])
point_b = np.array([4.0, 6.0])
dist = euclidean_distance(point_a, point_b)
print(f"欧氏距离: {dist:.2f}")  # 应为 5.00

# 批量距离计算（向量化版本）
points = np.array([[1, 2], [3, 4], [5, 6]])
center = np.array([2, 3])
distances = np.sqrt(np.sum((points - center) ** 2, axis=1))
print(f"各点到中心的距离: {distances}")`,
          },
        ],
        table: {
          headers: ["学习方式", "有无标签", "目标", "典型算法"],
          rows: [
            ["监督学习", "有标签", "学习输入到输出的映射", "线性回归、逻辑回归、SVM"],
            ["无监督学习", "无标签", "发现数据内在结构", "K-Means、PCA、DBSCAN"],
            ["半监督学习", "部分标签", "利用少量标签提升性能", "标签传播、自训练"],
            ["强化学习", "奖励信号", "学习最优决策策略", "Q-Learning、PPO"],
          ],
        },
        mermaid: `graph LR
    A["原始数据（无标签）"] --> B["聚类算法"]
    B --> C["簇 1：高价值用户"]
    B --> D["簇 2：流失风险用户"]
    B --> E["簇 3：新用户群体"]
    B --> F["簇 4：价格敏感用户"]
    C --> G["精准营销策略"]
    D --> G
    E --> G
    F --> G`,
        tip: "学习建议：先理解「什么是好的聚类」——簇内紧凑、簇间分离。这个直觉会帮你理解后面所有算法的设计动机。",
      },
      {
        title: "2. K-Means 算法流程：从初始化到收敛",
        body: `K-Means 算法的核心思想可以用一句话概括：让每个样本归属于离它最近的簇中心，然后更新簇中心为该簇所有样本的均值，反复迭代直到收敛。

算法步骤如下：

第一步：随机选择 K 个点作为初始簇中心（Centroids）。
第二步：计算每个样本到所有 K 个簇中心的距离，将样本分配给距离最近的簇。
第三步：对每个簇，重新计算簇中心（该簇所有样本的均值）。
第四步：重复第二步和第三步，直到簇中心不再变化（或变化小于某个阈值）。

K-Means 优化的是一个明确的目标函数——惯性（Inertia）：J = Σ Σ ||xᵢ - μⱼ||²，即所有样本到其所属簇中心的距离平方和。每一次迭代都保证 J 不增，因此算法必然收敛。

需要注意的是，K-Means 收敛到的是局部最优解，而非全局最优。这是因为目标函数是非凸的，不同的初始化可能得到完全不同的结果。这也是为什么实践中要多次运行取最优，或使用 K-Means++ 初始化策略。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class KMeansFromScratch:
    """从零实现 K-Means 算法"""

    def __init__(self, k=3, max_iters=100, tol=1e-4, random_state=None):
        self.k = k
        self.max_iters = max_iters
        self.tol = tol
        self.random_state = random_state
        self.centroids = None
        self.labels = None
        self.inertia = None

    def _init_centroids(self, X):
        """随机初始化 K 个簇中心"""
        rng = np.random.RandomState(self.random_state)
        indices = rng.choice(X.shape[0], self.k, replace=False)
        return X[indices].copy()

    def _assign_clusters(self, X):
        """将每个样本分配给最近的簇中心"""
        distances = np.sqrt(
            ((X[:, np.newaxis, :] - self.centroids[np.newaxis, :, :]) ** 2).sum(axis=2)
        )
        return np.argmin(distances, axis=1)

    def _update_centroids(self, X, labels):
        """重新计算每个簇的中心（均值）"""
        new_centroids = np.zeros_like(self.centroids)
        for i in range(self.k):
            if np.sum(labels == i) > 0:
                new_centroids[i] = X[labels == i].mean(axis=0)
            else:
                new_centroids[i] = X[np.random.choice(X.shape[0])]
        return new_centroids

    def fit(self, X):
        self.centroids = self._init_centroids(X)

        for i in range(self.max_iters):
            self.labels = self._assign_clusters(X)
            new_centroids = self._update_centroids(X, self.labels)

            # 检查收敛
            shift = np.sqrt(((self.centroids - new_centroids) ** 2).sum(axis=1)).max()
            self.centroids = new_centroids

            if shift < self.tol:
                print(f"第 {i+1} 次迭代后收敛")
                break

        self.inertia = self._compute_inertia(X)
        return self

    def _compute_inertia(self, X):
        """计算惯性（所有样本到所属簇中心的距离平方和）"""
        return sum(
            np.sum((X[self.labels == i] - self.centroids[i]) ** 2)
            for i in range(self.k)
        )

    def predict(self, X):
        return self._assign_clusters(X)`,
          },
          {
            lang: "python",
            code: `from sklearn.datasets import make_blobs

# 使用手写 K-Means 进行聚类
X, _ = make_blobs(n_samples=200, centers=3, random_state=42)

kmeans = KMeansFromScratch(k=3, max_iters=50, random_state=42)
kmeans.fit(X)

print(f"簇中心:\n{kmeans.centroids}")
print(f"惯性 (Inertia): {kmeans.inertia:.2f}")
print(f"各簇样本数: {[np.sum(kmeans.labels == i) for i in range(3)]}")`,
          },
        ],
        table: {
          headers: ["步骤", "操作", "输入", "输出", "时间复杂度"],
          rows: [
            ["1. 初始化", "随机选 K 个点", "数据集 X", "K 个簇中心", "O(K)"],
            ["2. 分配", "计算到各中心距离", "X, 簇中心", "样本标签", "O(n·K·d)"],
            ["3. 更新", "计算各簇均值", "X, 标签", "新簇中心", "O(n·d)"],
            ["4. 收敛判断", "检查中心变化", "新旧中心", "继续/停止", "O(K·d)"],
          ],
        },
        mermaid: `graph TD
    A["随机选择 K 个初始中心"] --> B["计算每个样本到 K 个中心的距离"]
    B --> C["将样本分配给最近的中心"]
    C --> D["重新计算每个簇的均值作为新中心"]
    D --> E{"中心是否变化？"}
    E -->|是，继续迭代| B
    E -->|否，收敛| F["输出最终簇标签和中心"]`,
        warning: "K-Means 对异常值非常敏感！一个远离所有簇的异常点会把整个簇中心拉偏。在运行 K-Means 之前，务必进行异常值检测或使用 RobustScaler 做预处理。",
      },
      {
        title: "3. K 值选择：肘部法与轮廓系数",
        body: `K-Means 最大的超参数就是 K 值——你想要把数据分成几类？这个问题没有标准答案，但有几个科学的方法可以指导选择。

肘部法（Elbow Method）是最直观的方法：尝试不同的 K 值，计算对应的惯性（Inertia），然后画出 K-Inertia 曲线。随着 K 增加，惯性必然下降（极端情况 K=n 时惯性为零）。我们寻找曲线的「肘部」——即惯性下降速度显著变缓的拐点。

轮廓系数（Silhouette Score）则从另一个角度评估聚类质量：对每个样本 i，计算 a(i) = 样本 i 到同簇其他样本的平均距离（凝聚度），b(i) = 样本 i 到最近其他簇所有样本的平均距离（分离度）。轮廓系数 s(i) = (b(i) - a(i)) / max(a(i), b(i))。s(i) 的取值范围是 [-1, 1]，越接近 1 说明聚类效果越好。

实际应用中，肘部法和轮廓系数应该结合使用。肘部法提供直觉，轮廓系数提供量化指标，同时还要结合业务理解——分 3 类还是 5 类，最终取决于业务场景。`,
        code: [
          {
            lang: "python",
            code: `import matplotlib.pyplot as plt
from sklearn.cluster import KMeans

# 肘部法：寻找最优 K
inertias = []
k_range = range(1, 11)

for k in k_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X)
    inertias.append(kmeans.inertia_)

plt.plot(k_range, inertias, 'bo-', linewidth=2, markersize=8)
plt.xlabel('K 值')
plt.ylabel('惯性 (Inertia)')
plt.title('肘部法选择最优 K')
plt.axvline(x=3, color='r', linestyle='--', label='最优 K=3')
plt.legend()
plt.show()`,
          },
          {
            lang: "python",
            code: `from sklearn.metrics import silhouette_score

# 轮廓系数评估不同 K 值
sil_scores = []
for k in range(2, 11):
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)
    score = silhouette_score(X, labels)
    sil_scores.append(score)
    print(f"K={k}: 轮廓系数 = {score:.4f}")

best_k = range(2, 11)[np.argmax(sil_scores)]
print(f"\n最优 K 值（轮廓系数）: {best_k}")

plt.plot(range(2, 11), sil_scores, 'rs-', linewidth=2, markersize=8)
plt.xlabel('K 值')
plt.ylabel('轮廓系数')
plt.title('轮廓系数法选择最优 K')
plt.axvline(x=best_k, color='g', linestyle='--', label=f'最优 K={best_k}')
plt.legend()
plt.show()`,
          },
          {
            lang: "python",
            code: `from sklearn.metrics import silhouette_samples

# 深入分析：绘制每个样本的轮廓系数分布
def plot_silhouette_analysis(X, k, cluster_labels):
    """绘制每个簇的轮廓系数分布图"""
    sil_vals = silhouette_samples(X, cluster_labels)
    y_lower = 10

    fig, ax = plt.subplots(figsize=(8, 6))

    for i in range(k):
        ith_vals = sil_vals[cluster_labels == i]
        ith_vals.sort()
        size = ith_vals.shape[0]
        y_upper = y_lower + size
        ax.fill_betweenx(range(y_lower, y_upper), 0, ith_vals, alpha=0.7)
        ax.text(-0.05, y_lower + size / 2, f'簇 {i}')
        y_lower = y_upper + 10

    avg_score = silhouette_score(X, cluster_labels)
    ax.axvline(x=avg_score, color='r', linestyle='--', label=f'平均 = {avg_score:.3f}')
    ax.set_xlim([-0.1, 1])
    ax.set_xlabel('轮廓系数')
    ax.set_title(f'K={k} 时的轮廓系数分布')
    ax.legend()
    plt.show()`,
          },
        ],
        table: {
          headers: ["方法", "核心指标", "优点", "缺点", "适用场景"],
          rows: [
            ["肘部法", "惯性 Inertia", "直观简单", "拐点不明显时主观", "初步探索"],
            ["轮廓系数", "s ∈ [-1, 1]", "量化、无业务假设", "计算量大 O(n²)", "科学评估"],
            ["间隔统计量", "Gap Statistic", "统计严谨", "计算慢", "学术研究"],
            ["业务驱动", "业务指标", "贴合实际需求", "需要领域知识", "工业落地"],
          ],
        },
        mermaid: `graph LR
    A["尝试不同 K 值"] --> B["计算惯性"]
    A --> C["计算轮廓系数"]
    B --> D["肘部法曲线"]
    C --> E["轮廓系数曲线"]
    D --> F["寻找拐点"]
    E --> G["取最大值"]
    F --> H["综合判断最优 K"]
    G --> H
    H --> I["结合业务场景验证"]`,
        tip: "学习建议：肘部法有时候拐点不明显（特别是真实数据中），这时候轮廓系数是更好的选择。但也不要完全依赖数字——分几类最终要回到业务意义上去验证。",
      },
      {
        title: "4. 初始化策略：K-Means++ 的智慧",
        body: `K-Means 对初始簇中心非常敏感。如果随机选的两个初始中心很近，它们会「竞争」同一个区域的数据点，导致最终的聚类质量下降。

K-Means++ 算法解决了这个问题。它的核心思想是：让初始簇中心彼此尽可能远离。具体做法是：

第一步：随机选择第一个簇中心。
第二步：对每个样本 x，计算它到最近已有中心的距离 D(x)。
第三步：以概率 P(x) = D(x)² / ΣD(xᵢ)² 选择下一个中心——距离越远的点被选中的概率越大。
第四步：重复第二和第三步，直到选出 K 个中心。

这个策略看似增加了计算量，但它大幅降低了陷入局部最优的概率。理论证明，K-Means++ 的解与最优解的期望差距仅为 O(log K)，而随机初始化的差距可能非常大。

scikit-learn 中 KMeans 的默认初始化方式就是 K-Means++（init='k-means++'），这也是为什么现代 K-Means 实现比早年教科书上的版本效果好得多的原因。`,
        code: [
          {
            lang: "python",
            code: `class KMeansPlusPlus:
    """实现 K-Means++ 初始化策略"""

    def __init__(self, k, random_state=None):
        self.k = k
        self.rng = np.random.RandomState(random_state)

    def _distance_to_nearest(self, X, centroids):
        """计算每个点到最近已有中心的距离"""
        min_dists = np.full(X.shape[0], np.inf)
        for c in centroids:
            dists = np.sum((X - c) ** 2, axis=1)
            min_dists = np.minimum(min_dists, dists)
        return min_dists

    def init_centroids(self, X):
        n_samples = X.shape[0]
        centroids = []

        # 第一步：随机选择第一个中心
        first_idx = self.rng.randint(0, n_samples)
        centroids.append(X[first_idx].copy())

        # 第二步到第四步：概率化选择后续中心
        for _ in range(1, self.k):
            dists = self._distance_to_nearest(X, centroids)
            probs = dists / dists.sum()
            cumprobs = np.cumsum(probs)
            r = self.rng.rand()
            idx = np.searchsorted(cumprobs, r)
            idx = min(idx, n_samples - 1)
            centroids.append(X[idx].copy())

        return np.array(centroids)

# 使用示例
kpp = KMeansPlusPlus(k=3, random_state=42)
init_centers = kpp.init_centroids(X)
print(f"K-Means++ 初始中心:\n{init_centers}")`,
          },
          {
            lang: "python",
            code: `from sklearn.cluster import KMeans

# 对比随机初始化 vs K-Means++ 的效果
results = {'random': [], 'kmeans++': []}

for trial in range(20):
    # 随机初始化
    km_rand = KMeans(n_clusters=3, init='random', n_init=1,
                     max_iters=300, random_state=trial)
    km_rand.fit(X)
    results['random'].append(km_rand.inertia_)

    # K-Means++ 初始化
    km_plus = KMeans(n_clusters=3, init='k-means++', n_init=1,
                     max_iters=300, random_state=trial)
    km_plus.fit(X)
    results['kmeans++'].append(km_plus.inertia_)

print(f"随机初始化  - 平均惯性: {np.mean(results['random']):.2f}, "
      f"标准差: {np.std(results['random']):.2f}")
print(f"K-Means++    - 平均惯性: {np.mean(results['kmeans++']):.2f}, "
      f"标准差: {np.std(results['kmeans++']):.2f}")
print(f"改进幅度: {(1 - np.mean(results['kmeans++'])/np.mean(results['random']))*100:.1f}%")`,
          },
          {
            lang: "python",
            code: `import matplotlib.pyplot as plt

# 可视化两种初始化策略的对比
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# 第一列：K-Means++ 初始化
km_pp = KMeans(n_clusters=3, init='k-means++', n_init=1, random_state=42)
labels_pp = km_pp.fit_predict(X)
axes[0].scatter(X[:, 0], X[:, 1], c=labels_pp, cmap='viridis', s=15, alpha=0.7)
axes[0].scatter(km_pp.cluster_centers_[:, 0], km_pp.cluster_centers_[:, 1],
                c='red', marker='X', s=200, label='簇中心')
axes[0].set_title(f'K-Means++ (Inertia={km_pp.inertia_:.0f})')
axes[0].legend()

# 第二列：随机初始化
km_rand = KMeans(n_clusters=3, init='random', n_init=1, random_state=42)
labels_rand = km_rand.fit_predict(X)
axes[1].scatter(X[:, 0], X[:, 1], c=labels_rand, cmap='viridis', s=15, alpha=0.7)
axes[1].scatter(km_rand.cluster_centers_[:, 0], km_rand.cluster_centers_[:, 1],
                c='red', marker='X', s=200, label='簇中心')
axes[1].set_title(f'随机初始化 (Inertia={km_rand.inertia_:.0f})')
axes[1].legend()

# 第三列：20 次试验的惯性对比
axes[2].boxplot([results['random'], results['kmeans++']], labels=['Random', 'K-Means++'])
axes[2].set_ylabel('Inertia')
axes[2].set_title('20 次试验惯性对比')
plt.tight_layout()
plt.show()`,
          },
        ],
        table: {
          headers: ["初始化方式", "选择策略", "优点", "缺点", "sklearn 默认"],
          rows: [
            ["随机初始化", "均匀随机选 K 个点", "简单快速", "容易陷入差的局部最优", "否"],
            ["K-Means++", "距离越远概率越大", "理论保证、效果好", "初始化稍慢", "是"],
            ["手动指定", "用户提供初始中心", "完全可控", "需要领域知识", "否"],
            ["K-Means||", "分布式并行初始化", "适合大规模数据", "实现复杂", "否"],
          ],
        },
        mermaid: `graph TD
    A["随机选择第一个中心"] --> B["计算所有点到最近中心的距离 D"]
    B --> C["P(x) = D(x)² / ΣD(xᵢ)²"]
    C --> D["按概率选择下一个中心"]
    D --> E{已选满 K 个？}
    E -->|否| B
    E -->|是| F["K-Means++ 初始化完成"]
    F --> G["执行标准 K-Means 迭代"]`,
        tip: "学习建议：K-Means++ 的精髓在于「让初始中心尽可能分散」。理解这个直觉后，你可以自然地想到更多改进思路——比如用 PCA 先降维再选初始中心。",
      },
      {
        title: "5. 优缺点与局限性",
        body: `没有完美的算法，K-Means 也不例外。理解它的局限性比了解它的优点更重要——这能帮你避免在错误的场景中使用它。

K-Means 最大的假设是：簇是凸形的（球形）且大小相近。这个假设在很多真实场景中并不成立。如果数据呈现月牙形、环形或不规则形状，K-Means 会强制把它切成球形的块，结果自然不理想。

K-Means 对异常值也很敏感。因为簇中心是均值，一个极端值会显著影响中心位置。相比之下，K-Medians（用中位数代替均值）或 K-Medoids（选实际样本点作为中心）更鲁棒。

K-Means 还假设所有簇的方差相同。如果一个簇很密集而另一个簇很分散，K-Means 的决策边界（垂直平分线）会不合理地偏向密集的簇。

另外，K-Means 基于欧氏距离，这意味着它假设所有特征量纲相同且独立。如果特征之间高度相关或量纲不同，应该先做标准化或 PCA。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.datasets import make_moons, make_circles

# K-Means 在非凸形状上的失败案例
fig, axes = plt.subplots(2, 3, figsize=(15, 10))

datasets = [
    ('月牙形', make_moons(n_samples=300, noise=0.1, random_state=42)[0]),
    ('环形', make_circles(n_samples=300, noise=0.05, factor=0.5, random_state=42)[0]),
    (' blobs', make_blobs(n_samples=300, centers=2, random_state=42)[0]),
]

for i, (name, data) in enumerate(datasets):
    km = KMeans(n_clusters=2, random_state=42, n_init=10)
    labels = km.fit_predict(data)

    axes[0, i].scatter(data[:, 0], data[:, 1], c=labels, cmap='viridis', s=15)
    axes[0, i].scatter(km.cluster_centers_[:, 0], km.cluster_centers_[:, 1],
                       c='red', marker='X', s=150)
    axes[0, i].set_title(f'K-Means on {name}')
    axes[0, i].set_aspect('equal')

# K-Medians 对比（用 L1 距离）
def kmedians(X, k, max_iters=100, random_state=42):
    rng = np.random.RandomState(random_state)
    centers = X[rng.choice(X.shape[0], k, replace=False)].copy()
    for _ in range(max_iters):
        # L1 距离
        dists = np.array([np.sum(np.abs(X - c), axis=1) for c in centers])
        labels = np.argmin(dists, axis=0)
        new_centers = np.array([X[labels == i].mean(axis=0)
                                for i in range(k)])
        if np.allclose(centers, new_centers):
            break
        centers = new_centers
    return labels, centers

labels_med, centers_med = kmedians(datasets[0][1], k=2)
axes[1, 0].scatter(datasets[0][1][:, 0], datasets[0][1][:, 1],
                   c=labels_med, cmap='viridis', s=15)
axes[1, 0].scatter(centers_med[:, 0], centers_med[:, 1],
                   c='red', marker='X', s=150)
axes[1, 0].set_title('K-Medians on 月牙形')
axes[1, 0].set_aspect('equal')

plt.tight_layout()
plt.show()`,
          },
          {
            lang: "python",
            code: `from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

# 特征标准化对 K-Means 的影响
from sklearn.datasets import load_iris

iris = load_iris()
X_iris = iris.data

# 未标准化
km_raw = KMeans(n_clusters=3, random_state=42, n_init=10)
labels_raw = km_raw.fit_predict(X_iris)

# 标准化后
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_iris)
km_scaled = KMeans(n_clusters=3, random_state=42, n_init=10)
labels_scaled = km_scaled.fit_predict(X_scaled)

from sklearn.metrics import adjusted_rand_score
ari_raw = adjusted_rand_score(iris.target, labels_raw)
ari_scaled = adjusted_rand_score(iris.target, labels_scaled)

print(f"未标准化 ARI: {ari_raw:.4f}")
print(f"标准化后 ARI: {ari_scaled:.4f}")
print(f"各特征量纲差异: {X_iris.max(axis=0) - X_iris.min(axis=0)}")`,
          },
        ],
        table: {
          headers: ["特性", "K-Means 表现", "影响", "解决方案"],
          rows: [
            ["非凸形状", "差", "强制切分为球形", "DBSCAN / 谱聚类"],
            ["异常值敏感", "差", "中心被拉偏", "K-Medoids / 异常值过滤"],
            ["簇大小不均", "差", "倾向大簇", "GMM / 层次聚类"],
            ["特征量纲不一", "差", "大量纲特征主导", "标准化 / 归一化"],
            ["计算效率", "优 O(n·K·d·iter)", "适合大数据", "Mini-Batch K-Means"],
            ["可解释性", "优", "簇中心即代表", "直接使用"],
          ],
        },
        mermaid: `graph TD
    A["K-Means 局限性"] --> B["假设簇为凸形"]
    A --> C["对异常值敏感"]
    A --> D["簇大小应相近"]
    A --> E["欧氏距离依赖"]
    B --> F["非凸数据用 DBSCAN"]
    C --> G["用 K-Medoids 替代"]
    D --> H["用 GMM 替代"]
    E --> I["标准化 / 特征选择"]`,
        warning: "K-Means 不能直接处理类别型特征（如颜色、城市名称）。如果数据包含类别变量，需要先进行 One-Hot 编码或使用 K-Prototypes 算法（支持混合型数据）。",
      },
      {
        title: "6. 与层次聚类和 DBSCAN 对比",
        body: `K-Means 不是唯一的聚类算法。在真实项目中，你应该根据数据特点选择最合适的算法。

层次聚类（Hierarchical Clustering）的核心优势是不需要预先指定 K 值。它通过构建树状结构（Dendrogram）来展示数据在不同粒度下的聚类结果。你可以事后决定在哪一层「切一刀」。层次聚类有两种策略：自底向上的凝聚法（Agglomerative，每个样本先自成一类，逐步合并）和自顶向下的分裂法（Divisive，所有样本先成一类，逐步拆分）。

DBSCAN（Density-Based Spatial Clustering of Applications with Noise）则基于密度定义簇。它将密度足够大的区域连成一片，形成任意形状的簇。DBSCAN 的最大亮点是能够自动识别异常值（噪声点）——这在 K-Means 中是做不到的。

这三种算法各有所长：K-Means 适合大数据且簇近似球形；层次聚类适合中小数据且需要层次化理解；DBSCAN 适合发现任意形状的簇和处理噪声。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.cluster import AgglomerativeClustering, DBSCAN
from scipy.cluster.hierarchy import dendrogram, linkage
import matplotlib.pyplot as plt

# 层次聚类
agg = AgglomerativeClustering(n_clusters=3, linkage='ward')
labels_agg = agg.fit_predict(X)

# 绘制树状图
linkage_matrix = linkage(X[:50], method='ward')  # 样本多时用子集
plt.figure(figsize=(10, 5))
dendrogram(linkage_matrix, truncate_mode='level', p=15)
plt.title('层次聚类树状图')
plt.xlabel('样本索引')
plt.ylabel('距离')
plt.axhline(y=10, color='r', linestyle='--', label='切割阈值=10')
plt.legend()
plt.show()

print(f"层次聚类标签分布: {np.bincount(labels_agg)}")`,
          },
          {
            lang: "python",
            code: `# DBSCAN 聚类
db = DBSCAN(eps=0.5, min_samples=5)
labels_db = db.fit_predict(X)

n_clusters_db = len(set(labels_db)) - (1 if -1 in labels_db else 0)
n_noise = list(labels_db).count(-1)
print(f"DBSCAN 发现 {n_clusters_db} 个簇，{n_noise} 个噪声点")

# 可视化对比三种算法
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
colors = ['viridis', 'viridis', 'viridis']

for ax, labels, name in zip(axes,
    [KMeans(n_clusters=3, random_state=42).fit_predict(X),
     AgglomerativeClustering(n_clusters=3).fit_predict(X),
     DBSCAN(eps=0.5, min_samples=5).fit_predict(X)],
    ['K-Means', '层次聚类', 'DBSCAN']):

    mask_noise = labels == -1
    ax.scatter(X[~mask_noise, 0], X[~mask_noise, 1],
               c=labels[~mask_noise], cmap='viridis', s=15, alpha=0.7)
    if np.any(mask_noise):
        ax.scatter(X[mask_noise, 0], X[mask_noise, 1],
                   c='red', s=15, label='噪声点', alpha=0.7)
    ax.set_title(name)
    ax.legend()

plt.tight_layout()
plt.show()`,
          },
          {
            lang: "python",
            code: `import time

# 三种算法的性能与效果对比
algorithms = {
    'K-Means': KMeans(n_clusters=3, random_state=42, n_init=10),
    '层次聚类': AgglomerativeClustering(n_clusters=3, linkage='ward'),
    'DBSCAN': DBSCAN(eps=0.5, min_samples=5),
}

from sklearn.metrics import silhouette_score, calinski_harabasz_score

results = []
for name, algo in algorithms.items():
    start = time.time()
    labels = algo.fit_predict(X)
    elapsed = time.time() - start

    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    sil = silhouette_score(X, labels) if n_clusters > 1 else -1
    ch = calinski_harabasz_score(X, labels) if n_clusters > 1 else -1

    results.append({
        '算法': name,
        '耗时(s)': f'{elapsed:.3f}',
        '簇数': n_clusters,
        '轮廓系数': f'{sil:.4f}',
        'CH分数': f'{ch:.1f}',
    })

for r in results:
    print(r)`,
          },
        ],
        table: {
          headers: ["算法", "需要指定 K?", "簇形状", "处理噪声", "复杂度", "大数据适用"],
          rows: [
            ["K-Means", "是", "凸形（球形）", "否", "O(n·K·d·iter)", "是"],
            ["层次聚类", "否（事后切）", "任意", "否", "O(n²·d) 或 O(n²log n)", "否"],
            ["DBSCAN", "否（调 eps/minPts）", "任意形状", "是", "O(n log n)", "中等"],
            ["GMM", "是", "椭圆（高斯）", "概率化", "O(n·K·d·iter)", "是"],
          ],
        },
        mermaid: `graph LR
    A["选择聚类算法"] --> B{"数据规模？"}
    B -->|大数据 n>10000| C["K-Means / Mini-Batch"]
    B -->|中小数据| D{"簇的形状？"}
    D -->|球形/凸形| C
    D -->|任意形状| E["DBSCAN"]
    D -->|需要层次结构| F["层次聚类"]
    D -->|概率化软分配| G["GMM"]
    C --> H["结果"]
    E --> H
    F --> H
    G --> H`,
        tip: "学习建议：不要只学一个聚类算法。掌握 K-Means 后，立刻学习 DBSCAN——两个算法的对比会帮你深刻理解「距离 vs 密度」的本质差异。",
      },
      {
        title: "7. sklearn 实战：完整的聚类流水线",
        body: `现在让我们把所有知识串起来，用一个真实的端到端案例来巩固 K-Means 的完整应用流程。

真实世界的数据从来不是干净的。你需要：处理缺失值、标准化特征、选择合适的 K 值、评估聚类质量、最后给出可解释的业务结论。

scikit-learn 提供了 Pipeline 和 GridSearchCV 来自动化这个过程。我们还可以结合 PCA 做降维可视化——把高维数据投影到 2D 平面上，直观地看到聚类效果。

这个实战案例涵盖了你今后在项目中会遇到的所有关键步骤。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.datasets import load_digits
import matplotlib.pyplot as plt

# 加载真实数据集（手写数字，去掉标签使用）
digits = load_digits()
X_digits = digits.data  # 1797 样本, 64 维

# 构建完整流水线
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=2, random_state=42)),  # 降维到 2D 用于可视化
    ('kmeans', KMeans(n_clusters=10, random_state=42, n_init=10)),
])

labels = pipeline.fit_predict(X_digits)

# 可视化 2D 聚类结果
X_2d = pipeline.named_steps['pca'].transform(X_digits)
centers_2d = pipeline.named_steps['pca'].transform(
    pipeline.named_steps['kmeans'].cluster_centers_
)

fig, ax = plt.subplots(figsize=(10, 8))
scatter = ax.scatter(X_2d[:, 0], X_2d[:, 1], c=labels,
                     cmap='tab10', s=10, alpha=0.6)
ax.scatter(centers_2d[:, 0], centers_2d[:, 1], c='black',
           marker='X', s=200, linewidths=2, label='簇中心')
ax.set_title('K-Means 聚类手写数字（PCA 降维到 2D）')
ax.legend()
plt.colorbar(scatter, label='簇标签', ax=ax)
plt.show()`,
          },
          {
            lang: "python",
            code: `from sklearn.metrics import adjusted_rand_score, adjusted_mutual_info_score

# 评估聚类质量（与真实标签对比）
true_labels = digits.target
print(f"调整兰德指数 (ARI): {adjusted_rand_score(true_labels, labels):.4f}")
print(f"调整互信息 (AMI): {adjusted_mutual_info_score(true_labels, labels):.4f}")

# 查看每个簇主要由哪些数字组成
print("\n各簇主要包含的数字：")
for cluster_id in range(10):
    mask = labels == cluster_id
    cluster_digits = true_labels[mask]
    if len(cluster_digits) > 0:
        top_digits = np.bincount(cluster_digits).argsort()[::-1][:3]
        counts = np.bincount(cluster_digits)[top_digits]
        print(f"  簇 {cluster_id}: 主要数字 = {list(zip(top_digits, counts))}")`,
          },
          {
            lang: "python",
            code: `from sklearn.metrics import silhouette_score
import numpy as np

# 用 GridSearchCV 自动搜索最优 K（结合 PCA + KMeans）
from sklearn.model_selection import ParameterGrid

param_grid = {
    'kmeans__n_clusters': range(5, 16),
    'pca__n_components': [2, 5, 10, 20],
}

best_score = -1
best_params = None

for params in ParameterGrid(param_grid):
    pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('pca', PCA(random_state=42)),
        ('kmeans', KMeans(random_state=42, n_init=10)),
    ])
    pipe.set_params(**params)
    labels_temp = pipe.fit_predict(X_digits)
    n_clusters = len(set(labels_temp))

    if n_clusters > 1:
        score = silhouette_score(X_digits, labels_temp)
        if score > best_score:
            best_score = score
            best_params = params
            print(f"新最优: {params} -> 轮廓系数={score:.4f}")

print(f"\n最优参数: {best_params}")
print(f"最优轮廓系数: {best_score:.4f}")`,
          },
        ],
        table: {
          headers: ["步骤", "sklearn 工具", "作用", "关键参数"],
          rows: [
            ["数据加载", "load_digits / 自定义", "获取原始数据", "—"],
            ["预处理", "StandardScaler", "特征标准化", "with_mean, with_std"],
            ["降维", "PCA", "降维可视化", "n_components"],
            ["聚类", "KMeans", "执行聚类", "n_clusters, init, n_init"],
            ["评估", "silhouette_score, ARI", "量化聚类质量", "—"],
            ["可视化", "matplotlib / seaborn", "展示聚类结果", "cmap, alpha"],
          ],
        },
        mermaid: `graph LR
    A["原始数据"] --> B["StandardScaler 标准化"]
    B --> C["PCA 降维到 2D"]
    C --> D["K-Means 聚类"]
    D --> E["评估: 轮廓系数/ARI"]
    D --> F["可视化: 散点图"]
    D --> G["分析: 簇特征分布"]
    E --> H{"效果满意？"}
    H -->|否| I["调整 K 或换算法"]
    H -->|是| J["输出业务结论"]
    I --> D`,
        warning: "聚类结果的解释要谨慎！K-Means 找到的簇是数学上紧凑的群体，但不一定有业务意义。务必结合领域知识验证——比如「这个簇真的对应一类特定的用户吗？」",
        tip: "实战建议：永远把聚类结果可视化！即使你的数据有 100 维，先用 PCA/TSNE/UMAP 降到 2D 画出来看看。眼睛是最好的评估工具。",
      },
    ],
  };
