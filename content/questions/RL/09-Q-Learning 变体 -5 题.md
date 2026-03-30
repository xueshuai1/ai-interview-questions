# Q-Learning 变体面试题（5 道）

## 题目 1：最大化偏差
**问题：** 什么是 Q-Learning 的最大化偏差？Double Q-Learning 如何解决这个问题？

**参考答案：**
**最大化偏差（Maximization Bias）**：
在 Q-Learning 中，使用同一个 Q 函数既选择动作又评估价值，导致价值估计系统性偏高。

**数学原因**：
```
E[max_a Q(s,a)] ≥ max_a E[Q(s,a)]
```
由 Jensen 不等式，max 是凸函数，期望的 max 大于 max 的期望。

**具体表现**：
```
标准 Q-Learning: Q_target = R + γ max_a Q(S',a)
                              ↑
                    用同一个 Q 选择和评估
```
- 选择：argmax_a Q(S',a)
- 评估：Q(S', argmax_a Q(S',a))
- 结果：倾向于高估

**Double Q-Learning 解决方案**：

维护两个独立的 Q 网络 Q1 和 Q2：

```
以 0.5 概率：
    用 Q1 选择：a* = argmax_a Q1(S',a)
    用 Q2 评估：Q_target = R + γ Q2(S',a*)

以 0.5 概率：
    用 Q2 选择：a* = argmax_a Q2(S',a)
    用 Q1 评估：Q_target = R + γ Q1(S',a*)
```

**关键思想**：
- **解耦选择和评估**
- 一个网络的选择对另一个网络是独立的
- 消除系统性高估

**效果**：
- 价值估计更准确
- 学习更稳定
- 最终性能更好

**评分要点：** 说出"用同一个 Q 选择和评估"得基本分，解释解耦得高分

---

## 题目 2：Dueling DQN
**问题：** Dueling DQN 的网络结构是什么？为什么要分离价值和优势？

**参考答案：**
**Dueling DQN 结构**：

```
输入 s → 共享卷积层 → 分支
                     ├→ 价值流 → V(s)（标量）
                     └→ 优势流 → A(s,a)（向量）
                     
合并：Q(s,a) = V(s) + A(s,a) - mean_a A(s,a)
```

**为什么要分离**：

**1. 某些状态动作不重要**：
- 在某些状态下，所有动作价值相近
- 学习 V(s) 就够了，不需要精确的 Q(s,a)

**2. 更高效的学习**：
- V(s) 可以从任何动作的经验学习
- A(s,a) 只从特定动作学习
- 梯度更新更有效

**3. 更好的泛化**：
- 价值流学习状态本身的好坏
- 优势流学习动作的相对好坏
- 对新状态泛化更好

**示例**：
```
自动驾驶场景：
- 前方空旷：V(s) 高，所有动作 A(s,a)≈0
- 前方障碍：V(s) 低，刹车 A(s,刹车) 高

Dueling 可以快速学习"前方空旷"的 V(s)，
而不需要为每个动作单独学习
```

**减去均值的原因**：
- 保证可识别性（identifiability）
- 否则 V 和 A 可以有多种组合得到相同 Q
- 约束：mean_a A(s,a) = 0

**评分要点：** 画出网络结构得基本分，解释泛化优势得高分

---

## 题目 3：优先级采样
**问题：** Prioritized Experience Replay 的原理是什么？为什么要用重要性采样权重？

**参考答案：**
**优先级采样原理**：

**动机**：
- 均匀采样效率低
- TD 误差大的样本更有学习价值
- "surprise"大的经验更重要

**优先级定义**：
```
P(i) = (|δ_i| + ε)^α
```
- δ_i：样本 i 的 TD 误差
- ε：小常数（如 0.01），保证所有样本有概率
- α：优先级程度（0=均匀，1=完全优先）

**采样概率**：
```
p(i) = P(i) / Σ_j P(j)
```

**重要性采样权重**：
```
w_i = (1/N · 1/p(i))^β
```

**为什么需要重要性采样权重**：

**问题**：优先级采样改变了数据分布
- 原始分布：均匀
- 采样分布：优先级加权
- 导致梯度估计有偏

**解决方案**：用权重纠正偏差
```
损失：L = w_i · (Q_target - Q)^2
```

**权重性质**：
- β=0：不纠正（完全有偏）
- β=1：完全纠正（无偏）
- 实践中β从 0.4 线性增加到 1

**直观理解**：
- 高频采样样本：权重小（降低影响）
- 低频采样样本：权重大（增加影响）
- 平衡采样分布和原始分布

**评分要点：** 说出 TD 误差优先级得基本分，解释权重纠正得高分

---

## 题目 4：代码实现
**问题：** 请实现 Double DQN 的核心更新逻辑。

**参考答案：**
```python
import torch
import torch.nn.functional as F

class DoubleDQN:
    def __init__(self, ...):
        self.q1 = QNetwork()
        self.q2 = QNetwork()
        self.q1_target = QNetwork()
        self.q2_target = QNetwork()
    
    def update(self, states, actions, rewards, next_states, dones):
        """
        Double DQN 更新
        """
        batch_size = len(states)
        states = torch.FloatTensor(states)
        actions = torch.LongTensor(actions).unsqueeze(1)
        rewards = torch.FloatTensor(rewards)
        next_states = torch.FloatTensor(next_states)
        dones = torch.FloatTensor(dones)
        
        # === Q1 更新 ===
        with torch.no_grad():
            # Q1 选择动作
            next_actions_q1 = torch.argmax(self.q1(next_states), dim=1, keepdim=True)
            
            # Q2 目标网络评估
            next_q_q2 = self.q2_target(next_states).gather(1, next_actions_q1).squeeze()
            
            # 计算目标
            targets_q1 = rewards + self.gamma * next_q_q2 * (1 - dones)
        
        # Q1 当前估计
        current_q1 = self.q1(states).gather(1, actions).squeeze()
        
        # Q1 损失
        loss1 = F.mse_loss(current_q1, targets_q1)
        
        # === Q2 更新 ===
        with torch.no_grad():
            # Q2 选择动作
            next_actions_q2 = torch.argmax(self.q2(next_states), dim=1, keepdim=True)
            
            # Q1 目标网络评估
            next_q_q1 = self.q1_target(next_states).gather(1, next_actions_q2).squeeze()
            
            # 计算目标
            targets_q2 = rewards + self.gamma * next_q_q1 * (1 - dones)
        
        # Q2 当前估计
        current_q2 = self.q2(states).gather(1, actions).squeeze()
        
        # Q2 损失
        loss2 = F.mse_loss(current_q2, targets_q2)
        
        # 联合优化
        loss = loss1 + loss2
        
        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        return loss.item()
    
    def update_target_networks(self):
        """定期更新目标网络"""
        self.q1_target.load_state_dict(self.q1.state_dict())
        self.q2_target.load_state_dict(self.q2.state_dict())
```

**关键点**：
1. Q1 选择，Q2 评估
2. Q2 选择，Q1 评估
3. 目标网络用于稳定学习
4. 两个网络交替更新

**评分要点：** 代码正确实现解耦得基本分，处理目标网络得高分

---

## 题目 5：变体对比
**问题：** 比较 Double DQN、Dueling DQN 和 Prioritized Replay 三种改进，它们解决什么问题？可以组合使用吗？

**参考答案：**

**三种变体对比**：

| 变体 | 解决问题 | 核心思想 | 改进方面 |
|------|----------|----------|----------|
| **Double DQN** | 最大化偏差 | 解耦选择和评估 | 价值估计准确性 |
| **Dueling DQN** | 状态价值学习低效 | 分离 V 和 A | 样本效率、泛化 |
| **Prioritized Replay** | 均匀采样低效 | 按 TD 误差采样 | 样本效率 |

**详细说明**：

**Double DQN**：
- 问题：Q(s', argmax Q(s',·)) 系统性高估
- 解决：用 Q1 选择，Q2 评估
- 效果：更准确的价值估计

**Dueling DQN**：
- 问题：某些状态下动作差异小，学习 Q 效率低
- 解决：Q = V + A - mean(A)
- 效果：更快学习状态价值

**Prioritized Replay**：
- 问题：均匀采样浪费，重要经验采样少
- 解决：按|TD 误差|优先级采样
- 效果：更高样本效率

**可以组合使用吗**：

**可以！** 实际上 Rainbow DQN 就整合了所有改进：

```
Rainbow DQN = Double DQN 
            + Dueling DQN 
            + Prioritized Replay 
            + Noisy Nets 
            + N-step returns 
            + Distributional RL
```

**组合方式**：
1. 网络结构：Dueling DQN
2. 目标计算：Double DQN
3. 采样：Prioritized Replay
4. 探索：Noisy Nets
5. 回报：N-step
6. 输出：分布

**实践建议**：
- 基础：Double DQN（必须）
- 进阶：+ Dueling（推荐）
- 高效：+ Prioritized Replay
- 最佳：Rainbow（全部）

**评分要点：** 说出各自解决问题得基本分，提到 Rainbow 组合得高分

---
