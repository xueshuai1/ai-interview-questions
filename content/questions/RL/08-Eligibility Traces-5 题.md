# Eligibility Traces 面试题（5 道）

## 题目 1：基础概念
**问题：** 什么是资格迹？它在 TD 学习中起什么作用？

**参考答案：**
**资格迹定义**：
资格迹是一种记忆机制，记录状态（或状态 - 动作对）最近被访问的程度，用于将 TD 误差回溯分配到之前访问过的状态。

**数学定义**（累积迹）：
```
e_t(s) = γλ e_{t-1}(s) + 1{S_t = s}
```

**作用**：

1. **多步学习**：
   - TD(0) 只更新当前状态
   - 资格迹允许更新之前访问过的状态
   - 实现 n-step 学习的加权平均

2. **加速奖励传播**：
   - 稀疏奖励场景特别有效
   - 奖励可以快速传播到相关状态
   - 减少学习所需 episode 数

3. **统一 TD 和 MC**：
   - λ=0：TD(0)
   - λ=1：类似 MC
   - λ∈(0,1)：折中

4. **在线计算**：
   - 无需等待 episode 结束
   - 每步都可以更新

**直观理解**：
- 状态被访问时留下"痕迹"
- 痕迹随时间衰减（γλ）
- TD 误差乘以痕迹强度更新

**评分要点：** 说出"回溯分配"得基本分，解释λ作用得高分

---

## 题目 2：λ参数
**问题：** TD(λ) 中λ参数的含义是什么？不同λ值对算法有什么影响？

**参考答案：**
**λ的含义**：
- 迹衰减参数（0 ≤ λ ≤ 1）
- 控制多步学习的程度
- 决定资格迹衰减速度

**不同λ值的影响**：

| λ值 | 名称 | 行为 | 特点 |
|-----|------|------|------|
| 0 | TD(0) | 只更新当前状态 | 低方差，有偏 |
| 0.5 | - | 更新最近几步 | 折中 |
| 0.9 | TD(λ) | 更新较长历史 | 常用值 |
| 1.0 | MC | 更新整个 episode | 无偏，高方差 |

**n-step 回报视角**：
```
TD(λ) 等价于 n-step 回报的加权平均：
G_t^λ = (1-λ) Σ_{n=1}^∞ λ^{n-1} G_{t:t+n}

权重分布：
n=1: (1-λ)
n=2: (1-λ)λ
n=3: (1-λ)λ²
```

**λ=0.9 时**：
- n=1 权重：0.1
- n=2 权重：0.09
- n=3 权重：0.081
- ...

**选择建议**：
- **λ小（0-0.5）**：
  - 在线学习
  - 方差低
  - 适合连续任务

- **λ大（0.7-1.0）**：
  - 奖励稀疏
  - 需要快速传播
  - episode 任务

**评分要点：** 说出λ控制多步得基本分，给出权重公式得高分

---

## 题目 3：累积迹 vs 替代迹
**问题：** 比较累积迹和替代迹的区别，各有什么优缺点？

**参考答案：**
**累积迹（Accumulating Trace）**：
```
e_t(s) = γλ e_{t-1}(s) + 1{S_t = s}
```
- 每次访问都累加
- 同一状态多次访问，迹会超过 1

**替代迹（Replacing Trace）**：
```
e_t(s) = {
    1              如果 S_t = s
    γλ e_{t-1}(s)  否则
}
```
- 访问时重置为 1
- 迹不会超过 1

**示例对比**：
```
状态 s 在 t=0,2,4 被访问，γλ=0.9

累积迹：
t=0: e=1
t=1: e=0.9
t=2: e=0.9+1=1.9
t=3: e=1.71
t=4: e=1.71+1=2.71

替代迹：
t=0: e=1
t=1: e=0.9
t=2: e=1（重置）
t=3: e=0.9
t=4: e=1（重置）
```

**优缺点对比**：

| 方面 | 累积迹 | 替代迹 |
|------|--------|--------|
| 实现 | 简单 | 稍复杂 |
| 理论 | 标准形式 | 经验更好 |
| 重复访问 | 迹累加 | 迹重置 |
| 性能 | 一般 | 通常更好 |
| 稳定性 | 可能过大 | 更稳定 |

**替代迹优势**：
1. 避免同一状态迹过大
2. 实践中收敛更快
3. 更适合控制问题

**累积迹优势**：
1. 理论分析简单
2. 与前向视角严格等价

**评分要点：** 写出公式区别得基本分，分析性能差异得高分

---

## 题目 4：前向 vs 后向视角
**问题：** 解释 TD(λ) 的前向视角和后向视角，它们有什么关系？

**参考答案：**
**前向视角（Forward View）**：
- 定义：用 n-step 回报的加权平均
- 公式：
  ```
  G_t^λ = (1-λ) Σ_{n=1}^∞ λ^{n-1} G_{t:t+n}
  ```
- 特点：
  - 需要知道未来（n-step 回报）
  - 理论分析用
  - 实际不可实现（需要预知未来）

**后向视角（Backward View）**：
- 定义：用资格迹实现
- 公式：
  ```
  e_t(s) = γλ e_{t-1}(s) + 1{S_t = s}
  V(s) ← V(s) + α δ_t e_t(s)
  ```
- 特点：
  - 可以在线计算
  - 实际算法用
  - 只依赖历史信息

**关系定理**：
```
E[后向视角更新] = E[前向视角更新]
```

**证明思路**：
1. 展开资格迹的递归定义
2. 证明 e_t(s) 等价于λ加权的访问计数
3. TD 误差的期望等于 n-step 回报的偏差

**直观理解**：
- 前向：从当前看未来，加权平均 n-step 回报
- 后向：从未来看过去，用资格迹回溯
- 两者在期望下等价

**实际意义**：
- 前向视角用于理论分析（收敛性证明）
- 后向视角用于实际实现（在线算法）

**评分要点：** 说出两个视角定义得基本分，解释等价性得高分

---

## 题目 5：代码实现
**问题：** 请实现 TD(λ) 的核心更新函数，并解释如何处理资格迹的衰减。

**参考答案：**
```python
import numpy as np
from collections import defaultdict

class TDLambda:
    def __init__(self, gamma=0.99, lam=0.9, alpha=0.1):
        self.gamma = gamma
        self.lam = lam
        self.alpha = alpha
        self.V = defaultdict(float)
        self.e = defaultdict(float)  # 资格迹
    
    def update(self, state, reward, next_state, done):
        """
        TD(λ) 更新（后向视角）
        """
        # 1. 计算 TD 误差
        if done:
            td_target = reward
        else:
            td_target = reward + self.gamma * self.V[next_state]
        
        td_error = td_target - self.V[state]
        
        # 2. 更新当前状态的资格迹（累积迹）
        self.e[state] += 1
        
        # 3. 更新所有有迹的状态
        # 注意：需要复制 keys，因为可能在迭代中删除
        for s in list(self.e.keys()):
            # 价值更新
            self.V[s] += self.alpha * td_error * self.e[s]
            
            # 资格迹衰减
            self.e[s] *= self.gamma * self.lam
            
            # 清理过小的迹（优化）
            if self.e[s] < 1e-6:
                del self.e[s]
        
        return td_error
    
    def train_episode(self, env, policy):
        """训练一个 episode"""
        state = env.reset()
        
        while True:
            action = policy(state)
            next_state, reward, done, _ = env.step(action)
            
            self.update(state, reward, next_state, done)
            
            if done:
                break
            
            state = next_state

# 替代迹版本
class TDLambdaReplacing:
    def __init__(self, gamma=0.99, lam=0.9, alpha=0.1):
        self.gamma = gamma
        self.lam = lam
        self.alpha = alpha
        self.V = defaultdict(float)
        self.e = defaultdict(float)
    
    def update(self, state, reward, next_state, done):
        # TD 误差
        td_target = reward if done else reward + self.gamma * self.V[next_state]
        td_error = td_target - self.V[state]
        
        # 替代迹：重置当前状态为 1
        self.e[state] = 1
        
        # 更新所有状态
        for s in list(self.e.keys()):
            self.V[s] += self.alpha * td_error * self.e[s]
            
            # 当前状态已经处理，跳过衰减
            if s != state:
                self.e[s] *= self.gamma * self.lam
            
            if self.e[s] < 1e-6:
                del self.e[s]
        
        return td_error
```

**关键点**：
1. 先更新资格迹，再更新价值
2. 衰减因子是γλ（不是单独的γ或λ）
3. 清理过小的迹提高效率
4. 替代迹重置为 1 而不是累加

**评分要点：** 代码正确得基本分，解释衰减得高分

---
