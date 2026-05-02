// AI Agent 编排模式与架构：从 ReAct 到多智能体协同的完整技术体系

import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-042",
    title: "AI Agent 编排模式与架构：从 ReAct 到多智能体协同的完整技术体系",
    category: "agent",
    tags: ["Agent 编排", "ReAct", "多智能体", "Supervisor", "Swarm", "工作流", "任务分解", "Agent 架构", "Orchestration"],
    summary: "AI Agent 从单轮对话走向自主任务执行，核心挑战在于如何有效地编排 Agent 的思考、行动和协作流程。本文系统讲解 Agent 编排的完整技术体系——从经典的 ReAct 范式到 Supervisor-Agents 模式，从 Swarm 分布式协作到基于图的复杂工作流，涵盖架构原理、设计模式、代码实现、框架对比和生产实践，是构建生产级 Agent 系统的必读指南。",
    date: "2026-05-02",
    readTime: "28 min",
    level: "高级",
    content: [
        {
            title: "1. 概念：什么是 Agent 编排，为什么它如此重要",
            body: `**Agent 编排**（Agent Orchestration）是指**协调和管理 AI Agent**的**思考、决策、行动和协作**的**系统化方法**。它回答了一个核心问题：当一个复杂任务到来时，**如何组织一个或多个 Agent**来**高效、可靠地完成**它？

**为什么需要专门的编排层？** 因为**单个 Agent**的能力虽然强大，但面对**复杂任务**时存在**根本性局限**。一个需要**搜索网络**、**分析数据**、**编写代码**、**测试验证**的任务，如果让单个 Agent**一次性完成**，往往会遇到**上下文窗口耗尽**、**推理链断裂**、**错误无法回滚**等问题。

**Agent 编排的核心目标**可以概括为三个词：**分解**（Decomposition）、**协调**（Coordination）和**容错**（Fault Tolerance）。

**分解**意味着将**复杂任务**拆解为**可管理的子任务**，每个子任务可以由**专门的 Agent**或**专门的工具链**来处理。**协调**意味着确保各个子任务之间的**依赖关系**得到正确处理——比如**代码生成 Agent**的输出必须作为**代码测试 Agent**的输入。**容错**意味着当某个 Agent**执行失败**时，编排层能够**检测到错误**、**分析原因**，并决定是**重试**、**降级**还是**切换策略**。

**2026 年的标志性进展**：**OpenAI Symphony** 发布了**开源 Agent 编排规范**，定义了 Agent 之间**标准化的通信协议**和**任务交接机制**。与此同时，**Anthropic** 的 **Claude Code** 采用了**内置编排引擎**，通过**规划-执行-验证循环**来自主完成编程任务。**Google** 的 **ADK**（Agent Development Kit）提供了**基于图的工作流编排**能力。**Microsoft** 的 **AutoGen** 则强调**多 Agent 对话式协作**。

**Agent 编排 ≠ 工具调用**。这是一个**常见的概念混淆**。**工具调用**（Tool Calling / Function Calling）是 Agent 与**外部工具**的交互方式——Agent 决定调用哪个工具、传入什么参数。**编排**则是更高层次的**流程管理**——决定**哪个 Agent 先执行**、**Agent 之间如何传递信息**、**失败时如何恢复**。工具调用是**编排的一个子环节**。

**Agent 编排也 ≠ 工作流引擎**。传统的工作流引擎（如 **Airflow**、**Tempo**、**Camunda**）管理的是**确定性的任务流程**——每个步骤的输入输出是**明确定义的**、**可预测的**。Agent 编排管理的是**不确定性的智能流程**——Agent 的决策路径是**动态生成的**、**上下文依赖的**、**可能需要回退和重试的**。

**理解 Agent 编排**需要从**四个层次**来看：**单 Agent 内部编排**（思考→行动→观察循环）、**多 Agent 协作编排**（Agent 之间的任务分配和信息交换）、**人机协作编排**（Agent 与人类的交互节点）、**系统级编排**（Agent 系统与外部基础设施的集成）。`,
            mermaid: `graph TD
    A["Agent 编排体系"] --> B["单 Agent 内部编排"]
    A --> C["多 Agent 协作编排"]
    A --> D["人机协作编排"]
    A --> E["系统级编排"]
    
    B --> B1["ReAct 范式"]
    B --> B2["Plan-and-Execute"]
    B --> B3["反射与自省"]
    
    C --> C1["Supervisor 模式"]
    C --> C2["Swarm 模式"]
    C --> C3["流水线模式"]
    C --> C4["图工作流模式"]
    
    D --> D1["Human-in-the-Loop"]
    D --> D2["审批节点"]
    D --> D3["反馈循环"]
    
    E --> E1["工具注册与发现"]
    E --> E2["状态持久化"]
    E --> E3["监控与告警"]
    
    classDef main fill:#1e3a5f
    class A main
    classDef sub fill:#2d1b69
    class B,C,D,E sub`,
            tip: "学习 Agent 编排的最佳起点是**理解 ReAct 范式**。ReAct（Reasoning + Acting）是所有高级编排模式的**基础单元**。掌握了 ReAct 之后，再学习如何**组合多个 ReAct 循环**来实现更复杂的编排。推荐阅读 Yao et al. 的 'ReAct: Synergizing Reasoning and Acting in Language Models' 原始论文。",
            warning: "不要将 Agent 编排**过度复杂化**。很多场景下，一个**简单的线性流程**（Agent A → Agent B → Agent C）就足够了。只有当任务**确实需要动态决策**、**条件分支**或**并行处理**时，才引入复杂的编排模式。**过度编排**会导致**调试困难**、**延迟增加**和**成本飙升**。"
        },
        {
            title: "2. 原理：经典 Agent 编排模式深度解析",
            body: `本节深入讲解**五种核心 Agent 编排模式**，每种模式都有**独特的架构理念**和**适用场景**。

### 2.1 ReAct 模式：推理与行动的循环

**ReAct**（Reasoning + Acting）是最基础的 Agent 编排模式，由 **Yao et al. (2022)** 提出。它的核心思想是将 Agent 的执行过程分解为三个交替进行的步骤：**思考**（Thought）→ **行动**（Action）→ **观察**（Observation）。

**工作流程**：Agent 接收到任务后，首先进行**推理**（Thought），分析需要什么信息或操作；然后执行**行动**（Action），调用工具或执行代码；接着获取**观察结果**（Observation），将结果反馈给 Agent；Agent 基于观察结果进行**下一轮推理**，直到任务完成。

**ReAct 的关键优势**在于它将**推理过程**和**执行过程**紧密耦合——Agent 的每一步推理都基于**最新的执行结果**，而不是预先规划好的固定流程。这使得 Agent 能够**动态适应**执行过程中出现的**新信息和意外情况**。

**ReAct 的局限性**也很明显：**线性循环**无法处理**需要并行执行**的子任务；**没有全局规划**，Agent 可能在**错误的方向上越走越远**；**缺乏失败恢复机制**，一旦某个行动失败，整个循环可能崩溃。

### 2.2 Plan-and-Execute 模式：规划与执行分离

**Plan-and-Execute** 模式将 Agent 的工作分为两个明确阶段：**规划阶段**（Planning）和**执行阶段**（Execution）。

**规划阶段**：一个**专门的规划 Agent**（Planner）接收任务，分析任务的**子目标**和**依赖关系**，生成一个**结构化的执行计划**。这个计划通常是一个**有向无环图**（DAG），定义了各个子任务的**执行顺序**和**数据流**。

**执行阶段**：**执行 Agent**（Executor）按照规划阶段生成的计划**逐步执行**。与 ReAct 不同，执行 Agent 不需要**重新思考每一步的方向**——它只需要**专注于当前步骤**的正确执行。

**Plan-and-Execute 的核心价值**在于**关注点分离**：规划 Agent 负责**战略层面的思考**，执行 Agent 负责**战术层面的执行**。这使得**规划可以重用**——同一个计划可以在**不同环境**或**不同数据集**上重复执行。

**但 Plan-and-Execute 也有挑战**：如果**初始规划有误**，整个执行过程都会偏离正确方向；当执行过程中遇到**计划外的情况**时，需要**重新规划**（Replanning），这增加了**系统复杂度**。

### 2.3 Supervisor 模式：中央协调器

**Supervisor 模式**引入了一个**中央协调 Agent**（Supervisor），它负责**分配任务**给**多个专业 Agent**（Workers），**收集结果**，并**整合最终输出**。

**工作流程**：Supervisor 接收任务后，**分析任务需求**，将任务**分解为子任务**，将每个子任务**分配给最合适的 Worker Agent**。每个 Worker Agent**独立完成**自己的子任务，将结果**返回给 Supervisor**。Supervisor **汇总所有结果**，进行**一致性检查**，生成**最终输出**。

**Supervisor 模式的关键设计决策**在于**任务分配策略**：是**静态分配**（预先知道哪个 Worker 擅长什么）还是**动态分配**（根据 Worker 的当前负载和能力动态决定）？是**串行分配**（一个 Worker 完成后再分配下一个）还是**并行分配**（同时分配多个子任务）？

**Supervisor 模式适合**需要**多种专业技能**的场景——比如一个任务需要**代码编写**、**代码审查**、**测试生成**和**文档编写**，Supervisor 可以将这些子任务分别分配给**专门的 Worker**。

### 2.4 Swarm 模式：去中心化协作

**Swarm 模式**（也称为**去中心化多 Agent 协作**）与 Supervisor 模式形成**鲜明对比**：没有中央协调器，每个 Agent 都**自主决策**，通过**Agent 之间的直接通信**来完成协作。

**Swarm 的核心机制**是**消息传递**（Message Passing）和**共识达成**（Consensus）。每个 Agent 可以**发布任务**、**认领任务**、**提交结果**，其他 Agent 可以**评审结果**、**提出修改建议**、**投票决定是否接受**。

**Swarm 模式的优势**在于**高容错性**——没有单点故障；**高可扩展性**——可以随时加入新的 Agent；**自适应性强**——Agent 群体可以根据任务需求**自动调整结构**。

**但 Swarm 的挑战**也很显著：**消息开销大**——Agent 之间的大量通信会**增加延迟**和**成本**；**可能出现死锁**——多个 Agent 互相等待对方先行动；**难以调试**——去中心化的决策过程**缺乏清晰的因果链**。

### 2.5 图工作流模式：基于 DAG 的精确控制

**图工作流模式**将 Agent 编排建模为一个**有向无环图**（DAG），其中**节点**是**Agent 或工具**，**边**是**数据流和控制流**。

**图工作流的核心特点**是**精确的流程控制**：每个节点有**明确的输入输出**，边的类型可以定义**条件分支**（如果条件 A 满足则走路径 X，否则走路径 Y）、**并行执行**（多个节点同时执行）和**聚合**（等待多个前置节点完成后才执行）。

**图工作流模式适合**需要**严格流程控制**和**可追溯性**的场景——比如**合规审核流程**，每个步骤都必须**按顺序执行**，每一步的**输入输出**都必须**记录和审计**。`,
            mermaid: `graph LR
    A["ReAct"] -->|"最基础"| B["Plan-and-Execute"]
    B -->|"规划+执行"| C["Supervisor"]
    C -->|"中心化"| D["Swarm"]
    D -->|"去中心化"| E["图工作流"]
    E -->|"精确控制"| F["混合模式"]
    
    classDef mode fill:#1e3a5f
    class A,B,C,D,E,F mode`,
            tip: "选择编排模式时，遵循**渐进复杂度原则**：先用 **ReAct** 验证基本逻辑是否可行 → 如果任务需要规划 → 升级到 **Plan-and-Execute** → 如果需要多个专业技能 → 升级到 **Supervisor** → 如果需要高容错和自适应 → 考虑 **Swarm** → 如果需要精确流程控制 → 选择 **图工作流**。不要一开始就选择最复杂的模式。",
            warning: "不同编排模式之间**不是互斥的**。生产系统通常采用**混合模式**——比如 Supervisor 内部的每个 Worker 使用 ReAct，整个 Supervisor 流程建模为图工作流。但混合模式会显著增加**系统复杂度**和**调试难度**，建议每个模式都**独立测试通过**后再组合。"
        },
        {
            title: "3. 实战：构建 Supervisor 编排系统",
            body: `本节通过一个**完整的代码示例**，展示如何从零构建一个**生产级的 Supervisor 编排系统**。这个系统将实现一个**代码开发流水线**——从**需求分析**到**代码生成**、**代码审查**、**测试生成**，最终输出**高质量的代码产物**。

**系统架构设计**：**Supervisor Agent**作为中央协调器，管理四个**Worker Agent**：**Analyst**（需求分析）、**Coder**（代码生成）、**Reviewer**（代码审查）、**Tester**（测试生成）。Supervisor 负责任务分解、Worker 调度、结果收集和最终整合。

**关键设计决策**：

**第一，Worker 的选择策略**。我们采用**静态角色绑定**——每个 Worker 有固定的职责和能力描述。Supervisor 根据子任务类型**匹配最合适的 Worker**。在实际生产中，也可以引入**动态评分机制**——根据 Worker 的**历史表现**和**当前负载**动态选择。

**第二，结果验证机制**。每个 Worker 完成任务后，Supervisor 会对结果进行**格式校验**和**内容检查**。如果结果不满足要求，Supervisor 会**要求 Worker 重新执行**，最多重试**三次**。

**第三，超时控制**。每个 Worker 的执行都有**超时限制**（比如 60 秒）。如果 Worker 超时未完成，Supervisor 会**终止该 Worker**，尝试**降级策略**（比如使用简化版处理）或**标记任务失败**。

**第四，上下文传递**。Worker 之间**不直接通信**——所有信息交换都通过 Supervisor **中转**。这保证了 Supervisor 对**全局状态**的**完全可见性**，便于**调试**和**审计**。

**状态机设计**：Supervisor 内部维护一个**任务状态机**，包含以下状态：**PENDING**（等待执行）、**RUNNING**（正在执行）、**REVIEWING**（审查中）、**TESTING**（测试中）、**COMPLETED**（已完成）、**FAILED**（失败）。状态之间的转换由**Worker 的执行结果**驱动。`,
            code: [
                {
                    lang: "python",
                    title: "Supervisor 编排系统核心实现",
                    code: `from enum import Enum
from typing import Optional
from dataclasses import dataclass
import time

class TaskState(Enum):
    PENDING = "pending"
    RUNNING = "running"
    REVIEWING = "reviewing"
    TESTING = "testing"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class TaskResult:
    success: bool
    output: str
    metadata: dict = None

class WorkerAgent:
    """Worker Agent 基类，定义统一的执行接口"""
    
    def __init__(self, name: str, role: str, timeout: int = 60):
        self.name = name
        self.role = role
        self.timeout = timeout
        self.task_count = 0
    
    def execute(self, task: str, context: dict) -> TaskResult:
        """执行子任务，子类实现具体逻辑"""
        start_time = time.time()
        try:
            result = self._do_execute(task, context)
            self.task_count += 1
            return result
        except TimeoutError:
            return TaskResult(
                success=False,
                output=f"Worker {self.name} 超时 ({self.timeout}s)"
            )
        except Exception as e:
            return TaskResult(
                success=False,
                output=f"Worker {self.name} 执行失败: {str(e)}"
            )
    
    def _do_execute(self, task: str, context: dict) -> TaskResult:
        raise NotImplementedError

class AnalystAgent(WorkerAgent):
    def __init__(self):
        super().__init__("analyst", "需求分析", timeout=30)
    
    def _do_execute(self, task: str, context: dict) -> TaskResult:
        # 实际实现中调用 LLM API 进行需求分析
        return TaskResult(
            success=True,
            output=f"需求分析完成: {task}",
            metadata={"requirements": ["功能需求", "非功能需求"]}
        )

class SupervisorAgent:
    """Supervisor 编排器"""
    
    def __init__(self, workers: list[WorkerAgent], max_retries: int = 3):
        self.workers = {w.role: w for w in workers}
        self.max_retries = max_retries
        self.task_log = []
    
    def orchestrate(self, task: str) -> TaskResult:
        """编排完整的任务执行流程"""
        state = TaskState.PENDING
        context = {}
        
        # Phase 1: 需求分析
        state = TaskState.RUNNING
        result = self._execute_with_retry(
            "需求分析", self.workers.get("需求分析"), task, context
        )
        if not result.success:
            return TaskResult(success=False, output="需求分析失败")
        context["requirements"] = result.output
        
        # Phase 2: 代码生成
        result = self._execute_with_retry(
            "代码生成", self.workers.get("代码生成"), task, context
        )
        if not result.success:
            return TaskResult(success=False, output="代码生成失败")
        context["code"] = result.output
        state = TaskState.REVIEWING
        
        # Phase 3: 代码审查
        result = self._execute_with_retry(
            "代码审查", self.workers.get("代码审查"), task, context
        )
        if not result.success:
            return TaskResult(success=False, output="代码审查失败")
        context["review"] = result.output
        state = TaskState.TESTING
        
        # Phase 4: 测试生成
        result = self._execute_with_retry(
            "测试生成", self.workers.get("测试生成"), task, context)
        if not result.success:
            return TaskResult(success=False, output="测试生成失败")
        
        state = TaskState.COMPLETED
        return TaskResult(
            success=True,
            output="所有阶段完成",
            metadata=context
        )
    
    def _execute_with_retry(self, phase: str, worker, task, context):
        for attempt in range(self.max_retries):
            result = worker.execute(task, context)
            if result.success:
                self.task_log.append({"phase": phase, "status": "ok"})
                return result
            self.task_log.append({
                "phase": phase, 
                "attempt": attempt + 1,
                "status": "retry"
            })
        return TaskResult(success=False, output=f"{phase} 重试 {self.max_retries} 次后失败")`
                },
                {
                    lang: "typescript",
                    title: "TypeScript 版 Supervisor 编排引擎（带状态追踪）",
                    code: `interface TaskState {
  id: string;
  currentPhase: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: Map<string, any>;
  startTime: number;
  retryCount: number;
}

interface WorkerDef {
  role: string;
  execute: (task: string, ctx: Record<string, any>) => Promise<{
    success: boolean;
    output: string;
    metadata?: Record<string, any>;
  }>;
  timeoutMs?: number;
}

class SupervisorEngine {
  private workers: Map<string, WorkerDef>;
  private activeTasks: Map<string, TaskState>;
  private maxRetries: number;

  constructor(
    workers: WorkerDef[],
    options: { maxRetries?: number } = {}
  ) {
    this.workers = new Map();
    workers.forEach(w => this.workers.set(w.role, w));
    this.activeTasks = new Map();
    this.maxRetries = options.maxRetries ?? 3;
  }

  async orchestrate(
    taskId: string,
    phases: Array<{ name: string; role: string; input?: string }>
  ): Promise<TaskState> {
    const state: TaskState = {
      id: taskId,
      currentPhase: '',
      status: 'running',
      results: new Map(),
      startTime: Date.now(),
      retryCount: 0,
    };
    this.activeTasks.set(taskId, state);

    for (const phase of phases) {
      state.currentPhase = phase.name;
      const worker = this.workers.get(phase.role);
      
      if (!worker) {
        state.status = 'failed';
        return state;
      }

      const result = await this.executeWithRetry(
        worker,
        phase.input || '',
        Object.fromEntries(state.results),
        state
      );

      if (!result.success) {
        state.status = 'failed';
        return state;
      }

      state.results.set(phase.name, result.output);
    }

    state.status = 'completed';
    return state;
  }

  private async executeWithRetry(
    worker: WorkerDef,
    task: string,
    ctx: Record<string, any>,
    state: TaskState
  ) {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const timeout = worker.timeoutMs ?? 60000;
      const result = await Promise.race([
        worker.execute(task, ctx),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout)
        ).catch(() => ({ success: false, output: 'timeout' }))
      ]) as any;

      if (result.success) return result;
      state.retryCount++;
    }
    return { success: false, output: 'max retries exceeded' };
  }
}`
                }
            ],
            tip: "在生产环境中实现 Supervisor 编排时，**务必实现完整的事件日志系统**。每次 Worker 的执行（包括成功和失败）都应该记录到**持久化存储**中，包括：执行时间、输入参数、输出结果、重试次数。这不仅便于**事后调试**，还可以用于**分析 Worker 的性能瓶颈**和**优化任务分配策略**。",
            warning: "Supervisor 模式的一个**常见陷阱**是**Supervisor 本身成为性能瓶颈**。当 Worker 数量增多时，Supervisor 需要**处理的消息量**会线性增长。解决方案包括：**异步消息队列**（如 RabbitMQ、Kafka）来**解耦**Supervisor 和 Worker，或者引入**分层 Supervisor**（多个 Supervisor 各自管理一组 Worker）。"
        },
        {
            title: "4. 代码：Agent 通信协议与状态管理",
            body: `在**多 Agent 编排系统**中，Agent 之间的**通信协议**和**状态管理**是最关键的基础设施。本节展示如何实现一个**轻量级的 Agent 消息总线**，支持**异步消息传递**、**消息优先级**和**消息持久化**。

**消息总线的设计目标**：

**第一，解耦通信**。Agent 之间**不直接互相调用**，而是通过消息总线**发布和订阅消息**。这使得 Agent 可以**独立部署和扩展**，不需要知道其他 Agent 的存在。

**第二，保证消息顺序**。对于同一个任务流，消息必须**按顺序处理**。比如 Agent A 的输出必须**先于** Agent B 的输入到达。

**第三，支持消息重试**。如果某个 Agent 处理消息失败，消息总线需要**重新投递**该消息，直到处理成功或达到最大重试次数。

**第四，消息可追溯**。每条消息都应该有**唯一 ID**、**来源 Agent**、**目标 Agent**、**时间戳**和**关联的任务 ID**。这样可以在出现问题时**回溯完整的消息流**。`,
            code: [
                {
                    lang: "typescript",
                    title: "Agent 消息总线实现",
                    code: `interface AgentMessage {
  id: string;
  taskId: string;
  fromAgent: string;
  toAgent: string;
  type: 'task_assign' | 'task_result' | 'error' | 'heartbeat';
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class AgentMessageBus {
  private queues: Map<string, AgentMessage[]> = new Map();
  private subscribers: Map<string, Set<(msg: AgentMessage) => void>> = new Map();
  private messageLog: AgentMessage[] = [];

  // 发布消息到指定 Agent 的队列
  publish(message: AgentMessage): void {
    message.id = message.id || crypto.randomUUID();
    message.timestamp = Date.now();
    
    const queue = this.queues.get(message.toAgent) || [];
    queue.push(message);
    this.queues.set(message.toAgent, queue);
    
    // 通知订阅者
    const subs = this.subscribers.get(message.toAgent);
    if (subs) {
      subs.forEach(cb => cb(message));
    }
    
    // 记录消息日志
    this.messageLog.push(message);
  }

  // Agent 订阅自己的消息队列
  subscribe(agentId: string, handler: (msg: AgentMessage) => void): void {
    const subs = this.subscribers.get(agentId) || new Set();
    subs.add(handler);
    this.subscribers.set(agentId, subs);
  }

  // 获取指定 Agent 的待处理消息
  getPendingMessages(agentId: string): AgentMessage[] {
    return this.queues.get(agentId) || [];
  }

  // 标记消息处理成功（从队列中移除）
  markProcessed(agentId: string, messageId: string): void {
    const queue = this.queues.get(agentId) || [];
    this.queues.set(
      agentId,
      queue.filter(m => m.id !== messageId)
    );
  }

  // 重试失败的消息
  retryFailed(agentId: string): void {
    const queue = this.queues.get(agentId) || [];
    for (const msg of queue) {
      if (msg.retryCount < msg.maxRetries) {
        msg.retryCount++;
        this.publish(msg);
      }
    }
  }

  // 查询指定任务的所有消息
  getTaskMessages(taskId: string): AgentMessage[] {
    return this.messageLog.filter(m => m.taskId === taskId);
  }
}`
                },
                {
                    lang: "python",
                    title: "Agent 状态追踪器（带快照和回滚）",
                    code: `from dataclasses import dataclass, field
from typing import Any
import json
import time

@dataclass
class AgentStateSnapshot:
    """Agent 状态快照，用于回滚和审计"""
    agent_id: str
    task_id: str
    state: dict
    timestamp: float
    checksum: str = ""
    
    def compute_checksum(self) -> str:
        import hashlib
        data = json.dumps(self.state, sort_keys=True)
        self.checksum = hashlib.md5(data.encode()).hexdigest()
        return self.checksum

class StateTracker:
    """Agent 状态追踪器，支持快照、回滚和审计"""
    
    def __init__(self, max_snapshots: int = 100):
        self.snapshots: dict[str, list[AgentStateSnapshot]] = {}
        self.max_snapshots = max_snapshots
    
    def save_snapshot(self, agent_id: str, task_id: str, state: dict) -> AgentStateSnapshot:
        """保存状态快照"""
        snapshot = AgentStateSnapshot(
            agent_id=agent_id,
            task_id=task_id,
            state=state.copy(),
            timestamp=time.time()
        )
        snapshot.compute_checksum()
        
        key = f"{agent_id}:{task_id}"
        if key not in self.snapshots:
            self.snapshots[key] = []
        
        self.snapshots[key].append(snapshot)
        
        # 清理旧快照
        if len(self.snapshots[key]) > self.max_snapshots:
            self.snapshots[key] = self.snapshots[key][-self.max_snapshots:]
        
        return snapshot
    
    def rollback(self, agent_id: str, task_id: str, steps: int = 1) -> dict | None:
        """回滚到指定步数之前的状态"""
        key = f"{agent_id}:{task_id}"
        if key not in self.snapshots:
            return None
        
        snapshots = self.snapshots[key]
        if len(snapshots) <= steps:
            return None
        
        target = snapshots[-(steps + 1)]
        return target.state.copy()
    
    def get_audit_trail(self, agent_id: str, task_id: str) -> list[dict]:
        """获取完整的审计轨迹"""
        key = f"{agent_id}:{task_id}"
        if key not in self.snapshots:
            return []
        
        return [
            {
                "timestamp": s.timestamp,
                "checksum": s.checksum,
                "state_keys": list(s.state.keys())
            }
            for s in self.snapshots[key]
        ]`
                }
            ],
            tip: "Agent 状态快照的**存储策略**需要根据**业务需求**来设计。如果只需要**最近状态的快速回滚**，使用**内存存储**即可。如果需要**长期审计**和**故障分析**，应该将快照**持久化到数据库**中。对于高可用场景，建议将快照存储到**分布式存储系统**（如 Redis Cluster、Amazon S3）中。",
            warning: "状态快照的**内存占用**可能很快增长——尤其是当 Agent 状态包含**大量数据**（如上下文历史、工具调用记录）时。务必设置**合理的快照数量上限**（max_snapshots），并考虑**增量快照**（只存储与上次快照的差异部分）来减少内存消耗。"
        },
        {
            title: "5. 对比：主流 Agent 编排框架全景对比",
            body: `本节对**六大主流 Agent 编排框架**进行**系统性对比**，帮助你选择最适合自己场景的编排方案。

**对比维度**包括：**编排模式支持**（支持哪些编排模式）、**学习曲线**（上手难度）、**扩展性**（能否扩展到大规模 Agent）、**可观测性**（调试和监控能力）、**生态集成**（与 LLM、数据库、消息队列的集成度）、**生产成熟度**（是否有大规模生产案例）。

**LangGraph** 是基于**图工作流**的 Agent 编排框架，由 **LangChain** 团队开发。它使用**有向图**来建模 Agent 的执行流程，每个节点是一个**Agent 或工具**，边定义了**控制流和数据流**。LangGraph 的**最大优势**是**精确的流程控制**和**强大的可观测性**——每个节点的执行状态都可以**实时监控**。但它的**学习曲线较陡**，需要理解**图论**和**状态机**的概念。

**AutoGen** 是 **Microsoft** 开发的多 Agent 编排框架，核心设计理念是**对话式协作**——Agent 之间通过**自然语言对话**来完成协作。AutoGen 支持**多种编排模式**：一对一对话、群组讨论、Supervisor-Worker 模式。它的**最大优势**是**灵活性**——你可以用**极少的代码**构建复杂的多 Agent 系统。但它的**可观测性较弱**——当 Agent 数量增多时，很难追踪**消息流**和**决策链**。

**CrewAI** 是一个**面向角色的多 Agent 框架**，强调**角色定义**、**任务分配**和**流程编排**。它的**设计理念**是：每个 Agent 有明确的**角色**（role）、**目标**（goal）和**背景**（backstory），Supervisor 根据角色**自动分配任务**。CrewAI 的**最大优势**是**简单易用**——适合**快速原型开发**。但它的**扩展性有限**——当 Agent 数量超过 10 个时，性能会**明显下降**。

**OpenAI Swarm** 是 OpenAI 教育用的**轻量级多 Agent 框架**，设计理念是**极简主义**——整个框架只有**不到 100 行代码**。Swarm 的核心概念是**Agent 和交接函数**（handoff function）——一个 Agent 可以通过调用交接函数将控制权**转移给另一个 Agent**。Swarm 适合**学习和教学**，但**不建议用于生产环境**——它缺乏**错误处理**、**状态管理**和**可观测性**。

**Google ADK**（Agent Development Kit）是 Google 推出的**全栈 Agent 开发框架**，提供了从**Agent 定义**、**工作流编排**到**部署运行**的**完整工具链**。ADK 的**最大优势**是**与 Google 生态的深度集成**——Vertex AI、Cloud Run、Pub/Sub 等。但它的**锁定效应明显**——一旦使用了 ADK，迁移到其他平台会**比较困难**。

**Anthropic Claude Code 内置编排**不是一个独立的框架，而是 Claude Code 产品**内置的编排引擎**。它采用**Plan-and-Execute**模式，通过**规划-执行-验证循环**来自主完成编程任务。它的**最大优势**是**开箱即用**——不需要额外配置。但它的**封闭性**意味着你**无法自定义编排逻辑**。`,
            table: {
                headers: ["框架", "编排模式", "学习曲线", "扩展性", "可观测性", "生产成熟度", "最佳场景"],
                rows: [
                    ["LangGraph", "图工作流", "⭐⭐⭐ 较陡", "⭐⭐⭐⭐ 好", "⭐⭐⭐⭐⭐ 优秀", "⭐⭐⭐⭐ 高", "复杂流程控制"],
                    ["AutoGen", "对话协作", "⭐⭐ 中等", "⭐⭐⭐ 中", "⭐⭐ 较弱", "⭐⭐⭐⭐ 高", "多 Agent 对话"],
                    ["CrewAI", "角色任务", "⭐ 简单", "⭐⭐ 有限", "⭐⭐⭐ 中等", "⭐⭐⭐ 中", "快速原型"],
                    ["OpenAI Swarm", "Agent 交接", "⭐ 极简", "⭐ 有限", "⭐ 基础", "⭐ 教育", "学习教学"],
                    ["Google ADK", "全栈工作流", "⭐⭐⭐ 较陡", "⭐⭐⭐⭐ 好", "⭐⭐⭐⭐ 好", "⭐⭐⭐ 中", "Google 生态"],
                    ["Claude Code", "Plan-and-Execute", "⭐ 零配置", "⭐⭐⭐ 中", "⭐⭐⭐ 中等", "⭐⭐⭐⭐ 高", "编程任务"]
                ]
            },
            tip: "选择框架时，**不要只看功能列表**，而要考虑**你的具体需求**。如果你需要**精确的流程控制**和**强大的调试能力**，选择 **LangGraph**。如果你需要**快速搭建多 Agent 原型**，选择 **CrewAI**。如果你的团队已经深度使用 **Google Cloud**，选择 **ADK**。如果你只是**想学习多 Agent 概念**，从 **Swarm** 开始。",
            warning: "**框架选型**是一个**需要谨慎考虑**的决策。一旦选择了某个框架，**迁移成本会很高**——你的 Agent 逻辑、状态管理、消息格式都会与框架**深度耦合**。建议在选型前，用**同一个简单任务**在 2-3 个候选框架上**分别实现**，对比**开发体验**、**代码复杂度**和**运行效率**后再做决定。"
        },
        {
            title: "6. 注意事项：Agent 编排的常见陷阱与最佳实践",
            body: `在实际的 Agent 编排系统开发和运维过程中，有许多**容易被忽视的陷阱**和**值得遵循的最佳实践**。本节总结来自**生产环境**的经验教训。

### 6.1 上下文爆炸

**问题**：在多 Agent 协作中，每个 Agent 执行后都会产生**输出结果**，这些结果会作为**上下文**传递给后续 Agent。随着协作链的增长，**上下文大小**会**指数级增长**，最终超出 LLM 的**上下文窗口限制**。

**解决方案**：

**上下文摘要**：不是将所有历史输出都传递给下一个 Agent，而是先由一个**摘要 Agent**对历史输出进行**压缩和提炼**，只传递**关键信息**。

**上下文分层**：将上下文分为**全局上下文**（所有 Agent 共享）和**局部上下文**（只有相关 Agent 需要）。全局上下文保持**精简**，局部上下文根据需要**动态加载**。

### 6.2 循环依赖

**问题**：Agent 之间可能出现**循环依赖**——Agent A 等待 Agent B 的结果，而 Agent B 又等待 Agent A 的结果。这种**死锁**在 Supervisor 模式中**不易察觉**，因为 Supervisor 可能一直在等待**永远不会到来的结果**。

**解决方案**：

**依赖图检测**：在任务分配前，构建**Agent 依赖图**（DAG），检测是否存在**环路**。如果存在环路，**拒绝执行**并报告错误。

**超时熔断**：为每个 Agent 的执行设置**超时时间**，超时后**自动熔断**，向 Supervisor 报告错误，Supervisor 可以**切换到备用策略**。

### 6.3 非确定性执行

**问题**：LLM 的**非确定性**意味着同一个 Agent 在**相同的输入**下可能产生**不同的输出**。这使得 Agent 编排系统的**执行结果不可预测**，增加了**调试**和**测试**的难度。

**解决方案**：

**固定随机种子**：在开发和测试阶段，使用**固定的随机种子**（temperature=0）来确保**可重复的执行结果**。

**结果校验层**：在 Agent 输出后增加一个**校验层**，验证输出是否满足**预定的格式和内容要求**。如果校验失败，**自动重试**或**触发人工审核**。

### 6.4 成本失控

**问题**：Agent 编排系统可能因为**过度的重试**、**不必要的并行**或**过长的执行链**而产生**意外的 API 调用成本**。

**解决方案**：

**成本预算**：为每个任务设置**最大成本预算**（基于预估的 token 消耗）。当实际成本接近预算时，**触发告警**或**自动降级**（比如使用更小的模型）。

**执行优化**：**缓存**重复的 Agent 执行结果；**合并**可以共享上下文的 Agent 调用；**裁剪**不必要的中间步骤。`,
            tip: "建立**Agent 编排的健康指标体系**是生产运维的关键。建议监控以下指标：**平均执行时间**（反映编排效率）、**失败率**（反映系统稳定性）、**重试率**（反映任务难度和 Agent 能力匹配度）、**Token 消耗**（反映成本效率）、**上下文使用率**（反映上下文管理效果）。这些指标可以帮助你**持续优化**编排策略。",
            warning: "**不要在生产环境中使用默认的重试策略**。默认的'无限重试直到成功'会导致**成本爆炸**。务必设置**最大重试次数**（通常 3 次）和**重试间隔**（指数退避）。同时，区分**可重试错误**（如网络超时）和**不可重试错误**（如输入格式错误）——后者重试只会**浪费资源**。"
        },
        {
            title: "7. 扩展阅读：Agent 编排的未来趋势",
            body: `Agent 编排技术正在**快速演进**，以下几个趋势值得**持续关注**。

**趋势一：标准化的 Agent 通信协议**。2026 年发布的 **OpenAI Symphony** 规范定义了**标准化的 Agent 通信协议**，包括**任务描述格式**、**结果返回格式**、**错误码体系**和**交接机制**。这意味着未来不同厂商的 Agent 框架可以**互相通信和协作**，打破当前的**生态孤岛**。

**趋势二：自适应编排**。未来的编排系统不再是**静态定义**的流程，而是能够**根据任务复杂度和环境变化**动态调整编排策略的**自适应系统**。比如，当系统检测到某个子任务的**执行时间超出预期**时，自动**切换到并行模式**或**分配更多 Agent**来加速执行。

**趋势三：Agent 编排的可验证性**。随着 Agent 在**关键业务场景**中的应用越来越广泛，**验证 Agent 编排系统的正确性**成为重要需求。形式化验证方法（如**模型检测**、**定理证明**）将被引入 Agent 编排领域，确保编排系统**不会出现死锁**、**不会遗漏关键步骤**、**不会违反安全策略**。

**趋势四：人机协同编排**。未来的 Agent 编排系统将更加强调**人类的参与点**——在关键决策节点设置**人工审批**，在复杂任务中引入**人类专家指导**，在错误场景中提供**人工介入接口**。这不是退步，而是对**AI 能力边界**的**清醒认知**——在某些场景下，**人类的判断力和创造力**仍然是**不可替代的**。

**趋势五：低代码/无代码 Agent 编排**。随着 Agent 技术的普及，**非技术人员**也需要能够**构建和管理** Agent 编排流程。可视化的**拖拽式编排界面**、**自然语言描述生成编排流程**、**编排模板市场**等产品形态将大量涌现，降低 Agent 编排的**技术门槛**。`,
            tip: "如果你想在 Agent 编排领域**保持技术前沿**，建议关注以下资源：**OpenAI Symphony 规范文档**（了解标准化通信协议）、**LangGraph 官方博客**（了解图工作流编排的最新进展）、**Multi-Agent Systems 学术会议**（如 AAMAS、PRIMA，了解学术研究前沿）、**各大 AI 公司的 Agent 框架更新**（Anthropic、Google、Microsoft 的框架迭代速度很快）。",
            warning: "Agent 编排技术的**快速迭代**意味着今天的**最佳实践**可能在**几个月后**就过时了。但不要盲目追求**最新的技术**——在选择编排方案时，**稳定性和可靠性**比**新颖性**更重要。对于**关键业务系统**，建议选择**经过生产验证**的框架（如 LangGraph、AutoGen），而不是**最新的实验性框架**。"
        }
    ]
};
