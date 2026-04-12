import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-002",
    title: "反向传播：神经网络如何学习",
    category: "dl",
    tags: ["反向传播", "梯度", "链式法则"],
    summary: "从链式法则到权重更新，揭开神经网络学习的核心机制",
    date: "2026-04-12",
    readTime: "20 min",
    level: "入门",
    content: [
      {
        title: "1. 直觉：神经网络是怎么学会的",
        body: `想象你在玩一个猜数字的游戏。你给出一个猜测，裁判告诉你高了还是低了，你根据这个反馈调整下一次的猜测。几轮之后，你的猜测就越来越准确。这就是神经网络学习的最朴素直觉。

神经网络的学习过程也是如此，只不过猜的不是一个数字，而是数百万甚至数十亿个权重参数。正向传播是猜的过程——数据从输入层经过层层变换到达输出层。损失函数是裁判——它告诉我们猜得有多离谱。反向传播是调整的过程——它计算每个权重对误差的贡献有多大，然后告诉每个权重应该往哪个方向调整。

反向传播（Backpropagation）这个名字中的反向指的是信息流动的方向：从输出层向输入层逐层反向传递误差信号。它本质上只做一件事——用链式法则计算损失函数对每个权重的偏导数（梯度）。这些梯度告诉我们：如果微调这个权重，损失会怎么变。`,
        code: [
          {
            lang: "python",
            code: `# 用猜数字游戏类比反向传播
import numpy as np

def guess_game():
    """类比：反向传播 = 根据反馈调整猜测"""
    target = 42  # 真实值
    guess = np.random.uniform(0, 100)  # 初始猜测

    for i in range(10):
        error = guess - target  # 误差
        loss = error ** 2  # 损失（平方误差）
        gradient = 2 * error  # 梯度（损失对猜测的导数）

        # 根据梯度调整（学习率 = 0.1）
        guess -= 0.1 * gradient

        print(f"第{i+1}轮: 猜测={guess:.2f}, 误差={error:.2f}, 梯度={gradient:.2f}")

    print(f"\\n最终猜测: {guess:.4f}, 真实值: {target}")

guess_game()`,
          },
        ],
        table: {
          headers: ["概念", "猜数字游戏", "神经网络"],
          rows: [
            ["猜测", "一个数字", "数百万权重参数的组合"],
            ["反馈", "高了/低了", "损失函数值"],
            ["调整方向", "梯度正负", "损失对权重的偏导数"],
            ["调整幅度", "凭感觉", "梯度 * 学习率"],
          ],
        },
        mermaid: `graph LR
    A["输入数据"] --> B["正向传播"]
    B --> C["预测输出"]
    C --> D["损失函数"]
    D --> E["反向传播"]
    E --> F["计算梯度"]
    F --> G["更新权重"]
    G -.->|下一轮| B`,
        tip: "理解反向传播的关键是把它拆成两步：先正向（计算预测），再反向（计算梯度）。不要试图同时理解两个方向。",
      },
      {
        title: "2. 链式法则：反向传播的数学核心",
        body: `链式法则是微积分中最强大的工具之一。它解决了这样一个问题：如果 z 是 y 的函数，y 是 x 的函数，那么 z 对 x 的导数是多少？答案是 dz/dx = dz/dy * dy/dx。看起来简单，但神经网络就是把这个简单规则反复应用。

考虑一个最简单的神经网络：一个输入 x，经过一个权重 w，经过激活函数 sigma，得到输出 y_hat，然后与真实值 y 计算损失 L。我们要求 dL/dw。

分解链路：L 到 y_hat 到 z 到 w（其中 z = w*x 是线性变换，y_hat = sigma(z) 是激活，L = L(y_hat, y) 是损失）。根据链式法则：dL/dw = dL/dy_hat * dy_hat/dz * dz/dw。

第一项 dL/dy_hat 告诉我们预测与真实的差距有多大；第二项 dy_hat/dz 告诉我们激活函数在当前输入处的斜率（梯度）；第三项 dz/dw = x 是输入值。三项相乘就是这个权重的梯度。

神经网络中的反向传播就是把这个过程推广到多层、多权重的情况。从输出层开始，逐层向输入方向计算梯度，每层的梯度可以复用下一层的梯度结果，这就是传播的含义。`,
        code: [
          {
            lang: "python",
            code: `# 手动实现一个神经元的反向传播
import numpy as np

class Neuron:
    """一个带 ReLU 激活的单神经元"""

    def __init__(self, w, b):
        self.w = w
        self.b = b

    def forward(self, x):
        """正向传播"""
        self.x = x
        self.z = np.dot(self.w, self.x) + self.b  # 线性变换
        self.a = np.maximum(0, self.z)  # ReLU 激活
        return self.a

    def backward(self, dL_da):
        """反向传播：计算梯度"""
        # ReLU 的导数：z > 0 时为 1，否则为 0
        da_dz = (self.z > 0).astype(float)
        # 链式法则：dL/dz = dL/da * da/dz
        dL_dz = dL_da * da_dz
        # dL/dw = dL/dz * dz/dw = dL/dz * x
        self.dL_dw = dL_dz * self.x
        # dL/db = dL/dz * dz/db = dL/dz * 1
        self.dL_db = dL_dz
        # dL/dx = dL/dz * dz/dx = dL/dz * w（传播给前一层）
        dL_dx = dL_dz * self.w
        return dL_dx

    def update(self, lr=0.01):
        """梯度下降更新权重"""
        self.w -= lr * self.dL_dw
        self.b -= lr * self.dL_db

# 演示
neuron = Neuron(w=np.array([0.5, -0.3]), b=0.1)
x = np.array([1.0, 2.0])
y_true = 1.5

# 正向
pred = neuron.forward(x)
loss = 0.5 * (pred - y_true) ** 2  # MSE 损失
print(f"预测: {pred:.4f}, 损失: {loss:.4f}")

# 反向：dL/da = pred - y_true
dL_da = pred - y_true
neuron.backward(dL_da)
print(f"梯度 dw: {neuron.dL_dw}")
print(f"梯度 db: {neuron.dL_db:.4f}")

# 更新
neuron.update(lr=0.1)
print(f"更新后 w: {neuron.w}, b: {neuron.b:.4f}")`,
          },
        ],
        table: {
          headers: ["激活函数", "f(x)", "f'(x)", "梯度范围"],
          rows: [
            ["ReLU", "max(0, x)", "1 if x>0 else 0", "[0, 1]"],
            ["Sigmoid", "1/(1+e^(-x))", "sigma(x)(1-sigma(x))", "(0, 0.25]"],
            ["Tanh", "(e^x-e^(-x))/(e^x+e^(-x))", "1-tanh^2(x)", "(0, 1]"],
            ["GELU", "x * Phi(x)", "复杂", "(0, ~1]"],
          ],
        },
        mermaid: `graph TD
    L["损失 L"] -->|"dL/da"| Y_hat["预测 y_hat"]
    Y_hat -->|"dy_hat/dz"| Z["线性变换 z"]
    Z -->|"dz/dw"| W["权重 w"]
    Z -->|"dz/dx"| X["输入 x"]
    W -.->|更新| W
    X -.->|"传播给前一层"| X`,
        warning: "Sigmoid 和 Tanh 的梯度最大只有 0.25 和 1，多层相乘后会导致梯度消失。这就是为什么现代深度学习首选 ReLU。",
      },
      {
        title: "3. 完整的多层反向传播实现",
        body: `理解了单个神经元后，我们来看看多层神经网络的反向传播。核心思想不变——链式法则——但需要逐层传递梯度。

对于一个两层网络（输入 到 隐藏层 到 输出层），正向传播是：z1 = W1*x + b1 到 a1 = sigma(z1) 到 z2 = W2*a1 + b2 到 a2 = sigma(z2)。反向传播从输出层开始：先算 dL/da2，然后反向推到 dL/dz2 到 dL/dW2 到 dL/db2 到 dL/da1 到 dL/dz1 到 dL/dW1 到 dL/db1。

注意梯度的流向：dL/da1 既用于更新 W1 和 b1，也继续向输入方向传播（虽然输入层不需要更新）。每层的梯度计算都依赖下一层的梯度结果，这就是传播的真正含义。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class SimpleNeuralNetwork:
    """两层神经网络（含完整前向+反向传播）"""

    def __init__(self, input_dim, hidden_dim, output_dim):
        # Xavier 初始化
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros((1, hidden_dim))
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2.0 / hidden_dim)
        self.b2 = np.zeros((1, output_dim))

    def relu(self, x):
        return np.maximum(0, x)

    def relu_derivative(self, x):
        return (x > 0).astype(float)

    def forward(self, X):
        """正向传播"""
        self.X = X
        self.z1 = X @ self.W1 + self.b1
        self.a1 = self.relu(self.z1)
        self.z2 = self.a1 @ self.W2 + self.b2
        # Softmax 输出
        exp_z = np.exp(self.z2 - np.max(self.z2, axis=1, keepdims=True))
        self.a2 = exp_z / np.sum(exp_z, axis=1, keepdims=True)
        return self.a2

    def backward(self, y_true, lr=0.01):
        """反向传播 + 权重更新"""
        batch_size = self.X.shape[0]
        # y_true one-hot 编码
        y_onehot = np.zeros_like(self.a2)
        y_onehot[np.arange(batch_size), y_true] = 1

        # 输出层梯度
        dz2 = self.a2 - y_onehot  # 交叉熵 + softmax 的组合导数
        dW2 = self.a1.T @ dz2 / batch_size
        db2 = np.sum(dz2, axis=0, keepdims=True) / batch_size

        # 隐藏层梯度
        da1 = dz2 @ self.W2.T
        dz1 = da1 * self.relu_derivative(self.z1)
        dW1 = self.X.T @ dz1 / batch_size
        db1 = np.sum(dz1, axis=0, keepdims=True) / batch_size

        # 更新权重
        self.W2 -= lr * dW2
        self.b2 -= lr * db2
        self.W1 -= lr * dW1
        self.b1 -= lr * db1

        return np.mean(-np.sum(y_onehot * np.log(self.a2 + 1e-8)))

# 训练演示
nn = SimpleNeuralNetwork(input_dim=2, hidden_dim=8, output_dim=3)
X_train = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y_train = np.array([0, 1, 1, 2])

for epoch in range(500):
    loss = nn.forward(X_train)
    _ = nn.backward(y_train, lr=0.1)
    if epoch % 100 == 0:
        print(f"Epoch {epoch}: loss = {loss:.4f}")

print(f"\\n预测: {np.argmax(nn.forward(X_train), axis=1)}")
print(f"真实: {y_train}")`,
          },
        ],
        table: {
          headers: ["层", "正向公式", "反向公式", "说明"],
          rows: [
            ["输出层", "z2 = a1*W2 + b2", "dz2 = a2 - y", "交叉熵+softmax"],
            ["隐藏层", "z1 = x*W1 + b1", "dz1 = (dz2*W2T) * sigma'(z1)", "ReLU 激活"],
            ["权重更新", "-", "W -= lr * dW", "梯度下降"],
          ],
        },
        mermaid: `graph TD
    X["输入 X"] -->|"W1, b1"| Z1["z1 = X*W1 + b1"]
    Z1 -->|ReLU| A1["a1 = ReLU(z1)"]
    A1 -->|"W2, b2"| Z2["z2 = a1*W2 + b2"]
    Z2 -->|Softmax| A2["a2 = softmax(z2)"]
    A2 -->|"Loss"| L["损失 L"]
    L -->|"dz2"| Z2
    Z2 -->|"dW2, db2, da1"| A1
    A1 -->|"dz1"| Z1
    Z1 -->|"dW1, db1"| X`,
        tip: "推导反向传播时，每层只关心两件事：我的输入是什么？我的输出传给谁？把注意力局限在一层内，不要被全局公式吓到。",
      },
      {
        title: "4. 梯度消失与梯度爆炸",
        body: `反向传播有一个臭名昭著的问题：梯度消失（Gradient Vanishing）和梯度爆炸（Gradient Explosion）。这两个问题都源于链式法则的连乘特性。

梯度消失：当网络很深时，梯度需要从输出层一直传回输入层。如果每层的梯度都小于 1（比如用 Sigmoid 激活，梯度最大 0.25），那么经过 L 层后，输入层的梯度大约是 0.25 的 L 次方。对于 10 层网络，这是约 10 的负 6 次方——小到可以忽略。结果就是靠近输入层的权重几乎不更新，网络退化成只有最后几层在学习。

梯度爆炸：反过来，如果每层的权重大于 1，连乘后梯度会指数级增长。一个 10 层网络，如果每层梯度约 2，那么 2 的 10 次方等于 1024 倍放大。梯度过大导致权重更新步长过大，模型震荡甚至发散。

现代深度学习的解决方案：用 ReLU 系列激活函数（梯度恒为 1 或 0，不会连乘缩小）；用 BatchNorm 稳定每层的激活值分布；用残差连接（ResNet）让梯度有高速公路直达浅层；用梯度裁剪（Gradient Clipping）限制梯度的最大范数。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt

# 演示梯度消失：不同激活函数在深层网络中的梯度衰减
def sigmoid_derivative(x):
    return 1.0 / (1.0 + np.exp(-x)) * (1.0 - 1.0 / (1.0 + np.exp(-x)))

def relu_derivative(x):
    return (x > 0).astype(float)

def tanh_derivative(x):
    return 1 - np.tanh(x) ** 2

layers = range(1, 30)
np.random.seed(42)

sigmoid_grads = []
relu_grads = []
tanh_grads = []

for n_layers in layers:
    sigmoid_grad = np.mean([sigmoid_derivative(x) for x in np.random.randn(1000)]) ** n_layers
    relu_grad = np.mean([relu_derivative(x) for x in np.random.randn(1000)]) ** n_layers
    tanh_grad = np.mean([tanh_derivative(x) for x in np.random.randn(1000)]) ** n_layers
    sigmoid_grads.append(sigmoid_grad)
    relu_grads.append(relu_grad)
    tanh_grads.append(tanh_grad)

plt.figure(figsize=(10, 6))
plt.semilogy(layers, sigmoid_grads, 'r-', linewidth=2, label='Sigmoid')
plt.semilogy(layers, relu_grads, 'g-', linewidth=2, label='ReLU')
plt.semilogy(layers, tanh_grads, 'b-', linewidth=2, label='Tanh')
plt.xlabel('网络深度（层数）')
plt.ylabel('梯度大小（对数坐标）')
plt.title('梯度消失：不同激活函数的衰减速度')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()`,
          },
          {
            lang: "python",
            code: `# 梯度裁剪的实现
def clip_gradients(gradients, max_norm=1.0):
    """
    梯度裁剪：如果梯度范数超过阈值，按比例缩小
    这是解决梯度爆炸的标准方法
    """
    total_norm = np.sqrt(sum(np.sum(g ** 2) for g in gradients))
    if total_norm > max_norm:
        scale = max_norm / total_norm
        gradients = [g * scale for g in gradients]
        print(f"梯度被裁剪：原始范数 {total_norm:.2f} -> 裁剪后 {max_norm}")
    return gradients

# 模拟梯度爆炸
np.random.seed(42)
gradients = [np.random.randn(100, 100) * 5 for _ in range(5)]
total_norm = np.sqrt(sum(np.sum(g ** 2) for g in gradients))
print(f"裁剪前总范数: {total_norm:.2f}")

clipped = clip_gradients(gradients, max_norm=1.0)
clipped_norm = np.sqrt(sum(np.sum(g ** 2) for g in clipped))
print(f"裁剪后总范数: {clipped_norm:.2f}")`,
          },
        ],
        table: {
          headers: ["问题", "原因", "后果", "解决方案"],
          rows: [
            ["梯度消失", "连乘导致指数衰减", "浅层权重不更新", "ReLU, BatchNorm, 残差连接"],
            ["梯度爆炸", "连乘导致指数增长", "权重震荡/发散", "梯度裁剪, 权重初始化"],
            ["梯度不稳定", "不同层尺度差异大", "训练难以收敛", "BatchNorm, LayerNorm"],
          ],
        },
        mermaid: `graph TD
    A["深层网络"] --> B{"梯度方向?"}
    B -->|"太小"| C["梯度消失"]
    B -->|"太大"| D["梯度爆炸"]
    C --> E["用 ReLU"]
    C --> F["残差连接"]
    C --> G["BatchNorm"]
    D --> H["梯度裁剪"]
    D --> I["合理初始化"]`,
        warning: "RNN/LSTM 特别容易出现梯度消失问题，因为它们在时间维度上展开后相当于极深的网络。这就是为什么 LSTM 需要门控机制。",
      },
      {
        title: "5. 计算图：反向传播的可视化框架",
        body: `计算图（Computational Graph）是理解反向传播最直观的工具。它把数学运算表示成有向图：节点是运算（加法、乘法、激活函数等），边是数据流。正向传播时数据从输入流向输出；反向传播时梯度沿着相反方向流动。

计算图的强大之处在于：任何复杂的函数都可以分解成简单运算的组合。一旦分解完成，反向传播就变成了一件机械的事情——对每个简单运算单独求导，然后用链式法则组合。

举个例子：f(x, y, z) = (x + y) * z。计算图把它分解为：a = x + y，f = a * z。反向传播时，先算 df/df = 1，然后 df/da = z，df/dz = a，df/dx = df/da * da/dx = z * 1 = z，df/dy = z。

深度学习框架（TensorFlow、PyTorch）的核心功能之一就是自动构建计算图并自动计算梯度（Autograd）。你只需要定义正向传播，框架自动完成反向传播。但理解计算图的原理对于调试和自定义模型至关重要。`,
        code: [
          {
            lang: "python",
            code: `# 手动实现计算图 + 自动求导
class Value:
    """标量值 + 梯度，支持自动求导"""

    def __init__(self, data, _children=(), _op=''):
        self.data = data
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')
        def _backward():
            self.grad += 1.0 * out.grad
            other.grad += 1.0 * out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    def backward(self):
        """反向传播计算所有梯度"""
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()

# 演示：f(x, y, z) = (x + y) * z
x = Value(2.0)
y = Value(3.0)
z = Value(4.0)
f = (x + y) * z
f.backward()

print(f"f = ({x.data} + {y.data}) * {z.data} = {f.data}")
print(f"df/dx = {x.grad} (应该是 z={z.data})")
print(f"df/dy = {y.grad} (应该是 z={z.data})")
print(f"df/dz = {z.grad} (应该是 x+y={x.data+y.data})")`,
          },
        ],
        table: {
          headers: ["运算", "正向", "反向 (dL/d_input1)", "反向 (dL/d_input2)"],
          rows: [
            ["a + b", "a + b", "1 * dL/dout", "1 * dL/dout"],
            ["a * b", "a * b", "b * dL/dout", "a * dL/dout"],
            ["max(a, b)", "较大值", "1 或 0", "0 或 1"],
            ["exp(x)", "e^x", "e^x * dL/dout", "-"],
          ],
        },
        mermaid: `graph LR
    x["x = 2.0"] --> add["+"]
    y["y = 3.0"] --> add
    add -->|"a = 5.0"| mul["*"]
    z["z = 4.0"] --> mul
    mul -->|"f = 20.0"| out["输出"]
    style add fill:#90EE90
    style mul fill:#87CEEB`,
        tip: "PyTorch 的 autograd 本质上就是上面 Value 类的高效版本。理解了这个 50 行的实现，你就理解了 PyTorch 自动求导的核心原理。",
      },
      {
        title: "6. 反向传播的变体与优化",
        body: `标准的反向传播（计算完整梯度后用梯度下降更新）有很多改进版本。理解这些变体有助于你选择合适的优化策略。

Mini-batch 梯度下降是最基本的变体：不是用全部数据也不是用单个样本计算梯度，而是用一小批（比如 32 或 256 个）样本。这样既保证了梯度的稳定性（比 SGD 低方差），又保证了计算效率（向量化运算）。

动量法（Momentum）引入了惯性概念：当前更新方向 = 本次梯度 + 上一次更新方向 * 动量系数。这使得优化过程在平坦区域加速、在震荡区域减速，收敛更快更稳定。Adam 则更进一步，结合了动量（一阶矩估计）和自适应学习率（二阶矩估计），是目前最常用的优化器。

反向模式自动微分（Reverse-mode AD）是反向传播的更一般形式。它不仅适用于神经网络，而是适用于任何可微计算。PyTorch 和 TensorFlow 都使用这种方法。`,
        code: [
          {
            lang: "python",
            code: `# Adam 优化器的核心逻辑
class SimpleAdam:
    """Adam 优化器简化实现"""

    def __init__(self, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
        self.lr = lr
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps
        self.m = {}  # 一阶矩（动量）
        self.v = {}  # 二阶矩（自适应学习率）
        self.t = 0   # 时间步

    def step(self, params, grads):
        """执行一步更新"""
        self.t += 1
        for key in params:
            g = grads[key]
            if key not in self.m:
                self.m[key] = 0
                self.v[key] = 0
            # 更新一阶矩
            self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * g
            # 更新二阶矩
            self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * g ** 2
            # 偏差校正
            m_hat = self.m[key] / (1 - self.beta1 ** self.t)
            v_hat = self.v[key] / (1 - self.beta2 ** self.t)
            # 更新参数
            params[key] -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)
        return params

print("SGD:     w = w - lr * g")
print("Momentum: v = beta1*v + g;  w = w - lr * v")
print("Adam:    m = beta1*m + g;  v = beta2*v + g^2;  w = w - lr * m_hat / (v_hat + eps)")
print("\\nAdam = 动量(一阶矩) + 自适应学习率(二阶矩) + 偏差校正")`,
          },
        ],
        table: {
          headers: ["优化器", "公式", "优点", "缺点"],
          rows: [
            ["SGD", "w -= lr * g", "简单、通用", "收敛慢、易震荡"],
            ["SGD+Momentum", "v = beta*v + g; w -= lr*v", "加速收敛", "需要调动量系数"],
            ["RMSProp", "v = beta*v + g^2; w -= lr*g/sqrt(v)", "自适应学习率", "缺少动量"],
            ["Adam", "动量+RMSProp+偏差校正", "收敛快、少调参", "可能泛化稍差"],
            ["AdamW", "Adam + 权重衰减", "更好的正则化", "需要调权重衰减系数"],
          ],
        },
        mermaid: `graph TD
    A["梯度 g"] --> B{"选择优化器"}
    B -->|"SGD"| C["w -= lr * g"]
    B -->|"SGD+M"| D["v = beta*v + g<br/>w -= lr * v"]
    B -->|"Adam"| E["m = b1*m + g<br/>v = b2*v + g^2<br/>w -= lr * m_hat/(v_hat+eps)"]
    C --> F["更新权重"]
    D --> F
    E --> F`,
        warning: "Adam 虽然收敛快，但在某些任务上泛化能力不如 SGD。如果你的模型在验证集上过拟合，试试 SGD + Momentum。",
      },
      {
        title: "7. 实战：从零训练一个神经网络",
        body: `现在我们把所有知识整合起来：从零实现一个完整的神经网络训练流程，包含正向传播、反向传播、优化和评估。

我们将训练一个两层神经网络来识别手写数字（MNIST）。这个任务足够简单，但涵盖了深度学习的所有核心要素。

实现要点：1) 正确的权重初始化（Xavier/He）是训练成功的前提；2) Mini-batch 训练比全批量更高效；3) 每个 epoch 后评估验证集准确率可以监控过拟合；4) 学习率调度（Learning Rate Scheduling）可以帮助模型在训练后期更精细地调整。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
import numpy as np

# 加载数据
digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(
    digits.data / 16.0, digits.target, test_size=0.2, random_state=42
)
encoder = OneHotEncoder(sparse_output=False)
y_train_oh = encoder.fit_transform(y_train.reshape(-1, 1))

class NeuralNetwork:
    def __init__(self, layers):
        self.layers = layers
        self.weights = []
        self.biases = []
        for i in range(len(layers) - 1):
            w = np.random.randn(layers[i], layers[i+1]) * np.sqrt(2.0 / layers[i])
            b = np.zeros((1, layers[i+1]))
            self.weights.append(w)
            self.biases.append(b)

    def relu(self, x): return np.maximum(0, x)
    def relu_deriv(self, x): return (x > 0).astype(float)

    def forward(self, X):
        self.activations = [X]
        self.z_values = []
        for i in range(len(self.weights) - 1):
            z = self.activations[-1] @ self.weights[i] + self.biases[i]
            self.z_values.append(z)
            self.activations.append(self.relu(z))
        z = self.activations[-1] @ self.weights[-1] + self.biases[-1]
        exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
        output = exp_z / np.sum(exp_z, axis=1, keepdims=True)
        self.z_values.append(z)
        self.activations.append(output)
        return output

    def backward(self, y_true, lr=0.01):
        m = y_true.shape[0]
        deltas = [None] * len(self.weights)
        deltas[-1] = self.activations[-1] - y_true
        for i in range(len(self.weights) - 2, -1, -1):
            deltas[i] = (deltas[i+1] @ self.weights[i+1].T) * self.relu_deriv(self.z_values[i])
        for i in range(len(self.weights)):
            dW = self.activations[i].T @ deltas[i] / m
            db = np.sum(deltas[i], axis=0, keepdims=True) / m
            self.weights[i] -= lr * dW
            self.biases[i] -= lr * db

# 训练
nn = NeuralNetwork([64, 128, 64, 10])
batch_size = 32
n_epochs = 200

for epoch in range(n_epochs):
    indices = np.random.permutation(len(X_train))
    for start in range(0, len(X_train), batch_size):
        batch_idx = indices[start:start+batch_size]
        nn.forward(X_train[batch_idx])
        nn.backward(y_train_oh[batch_idx], lr=0.001)
    if (epoch + 1) % 50 == 0:
        preds = np.argmax(nn.forward(X_test), axis=1)
        acc = np.mean(preds == y_test)
        print(f"Epoch {epoch+1}: 测试集准确率 = {acc:.4f}")`,
          },
        ],
        table: {
          headers: ["步骤", "做什么", "关键公式", "常见错误"],
          rows: [
            ["初始化", "设置权重和偏置", "W ~ N(0, 2/n_in)", "用零初始化所有权重"],
            ["正向", "计算预测", "a = sigma(Wx + b)", "忘记 BatchNorm 或激活"],
            ["损失", "衡量预测差距", "交叉熵/MSE", "用错损失函数"],
            ["反向", "计算梯度", "链式法则", "梯度公式推导错误"],
            ["更新", "调整权重", "w -= lr * dL/dw", "学习率太大/太小"],
          ],
        },
        mermaid: `graph TD
    A["MNIST 数据 64 维"] --> B["全连接层 128 + ReLU"]
    B --> C["全连接层 64 + ReLU"]
    C --> D["全连接层 10 + Softmax"]
    D --> E["交叉熵损失"]
    E --> F["反向传播"]
    F --> G["Adam 更新权重"]
    G -.->|200 轮| B`,
        tip: "从零实现神经网络最好的方式是用小数据集（如 MNIST、Iris）先跑通，再扩展到大数据。调试时用极小的网络（2-3 层）确认逻辑正确。",
      },
    ],
};
