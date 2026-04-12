import fs from 'fs';

const filePath = 'src/data/knowledge.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Helper: find article block boundaries by ID
function findArticleBlock(text, id) {
  const idMarker = `id: "${id}"`;
  const idIdx = text.indexOf(idMarker);
  if (idIdx < 0) return null;
  
  // Find the opening { (go backwards from id)
  let braceStart = -1;
  let depth = 0;
  for (let i = idIdx; i >= 0; i--) {
    if (text[i] === '}') depth++;
    if (text[i] === '{') {
      if (depth === 0) {
        braceStart = i;
        break;
      }
      depth--;
    }
  }
  if (braceStart < 0) return null;
  
  // Find the closing } (go forward from braceStart)
  let braceEnd = -1;
  depth = 0;
  let inStr = false;
  let strChar = '';
  let esc = false;
  for (let i = braceStart; i < text.length; i++) {
    const ch = text[i];
    if (esc) { esc = false; continue; }
    if (ch === '\\') { esc = true; continue; }
    if (!inStr && (ch === '"' || ch === "'" || ch === '`')) {
      inStr = true; strChar = ch; continue;
    }
    if (inStr && ch === strChar) { inStr = false; continue; }
    if (!inStr) {
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) { braceEnd = i + 1; break; }
      }
    }
  }
  if (braceEnd < 0) return null;
  
  return { start: braceStart, end: braceEnd, text: text.substring(braceStart, braceEnd) };
}

// ===== Replace agent-001 =====
const agentBlock = findArticleBlock(content, 'agent-001');
if (!agentBlock) { console.error('agent-001 not found!'); process.exit(1); }

const agentNewContent = `{
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
        body: \`AI Agent（智能体）是 2024-2026 年 AI 领域最引人注目的范式转变。要理解它，我们先看看 AI 系统的演进路径：

第一代：问答系统——你问它答，被动响应。ChatGPT 刚发布时就是这种模式：用户输入一段文字，模型生成回复，然后等待下一次输入。这种交互模式下，模型完全没有"主动性"。

第二代：工具增强——模型可以调用外部工具（搜索引擎、代码执行器、API），但仍需要用户明确指定。用户说"帮我搜索 XX"，模型执行搜索并返回结果。

第三代：AI Agent——模型不仅能够使用工具，还能自主规划、分解复杂任务、在多步执行中保持上下文、根据执行结果动态调整策略。Agent 的核心特征是"主动性"和"自主性"。

举个例子：如果你让一个 Agent "帮我订一张下周北京到上海的机票"，它会自动：理解你的偏好→搜索航班→比较价格和时刻→检查你的日历→执行预订→发送确认。整个过程不需要你逐步指导。

Agent 不是单一技术，而是一种架构模式——它将大语言模型（LLM）作为"大脑"，围绕它构建感知、规划、记忆和执行的完整系统。这篇文章将深入拆解每一个组件。\`,
        mermaid: \`graph LR
    A["用户目标"] --> B["感知模块\\\\n理解意图"]
    B --> C["规划模块\\\\n任务分解"]
    C --> D["记忆模块\\\\n上下文管理"]
    D --> E["执行模块\\\\n工具调用"]
    E --> F["观察结果"]
    F --> C
    F -.->|任务完成| G["输出结果"]\`,
        tip: "关键区分：Agent ≠ 更好的聊天机器人。聊天机器人是对话的，Agent 是目标驱动的。聊天机器人等待输入，Agent 主动采取行动。",
      },
      {
        title: "2. Agent 的四大核心组件",
        body: \`一个完整的 AI Agent 系统通常包含四个核心组件，这个架构框架由 Stanford 的"Agent4Science"论文和多个开源框架（LangChain、AutoGen、CrewAI）共同确立。

感知模块（Perception）：负责理解用户的意图和环境状态。在大多数 Agent 系统中，LLM 本身就是感知模块——它接收自然语言输入，理解其中的目标、约束和上下文。但感知不止于理解文字，还包括：从结构化数据中提取信息（如读取数据库）、从非结构化内容中识别模式（如分析文档）、以及感知外部环境状态（如检查网页内容）。

规划模块（Planning）：这是 Agent 的"智慧"所在。规划分为两个层次：任务分解（Task Decomposition）——将复杂目标拆解为可执行的子任务序列；策略选择（Strategy Selection）——根据当前状态选择最优的执行路径。规划的核心挑战是：LLM 一次性生成的计划往往不完美，需要在执行中动态调整（Re-planning）。

记忆模块（Memory）：Agent 需要"记住"信息才能做出连贯的决策。记忆分为三种：短期记忆——当前对话上下文和正在执行的任务状态；长期记忆——通过向量数据库存储的历史经验和知识；工作记忆——当前步骤的中间结果和变量。

执行模块（Action/Tool Use）：将规划转化为实际行动。Agent 通过工具调用（Function Calling）来与外部世界交互：调用 API、执行代码、读写文件、操作浏览器等。执行模块的关键设计是：工具描述必须清晰（让 LLM 理解每个工具的用途），执行结果必须反馈给规划模块形成闭环。\`,
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
            code: \`# 一个极简 Agent 框架的实现
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
    return str(eval(expression))\`,
          },
        ],
      },
      {
        title: "3. 规划模式：Agent 如何思考",
        body: \`规划是 Agent 智能的核心体现。LLM 本身是一个"下一个 token 预测器"，它没有内在的目标导向。Agent 框架通过设计特定的 prompt 结构和执行流程，让 LLM 展现出"思考"和"规划"的能力。

ReAct 模式（Reasoning + Acting）：这是最经典的 Agent 规划范式。核心思想是让 LLM 在每一步都先"思考"（Thought），再"行动"（Action），然后"观察"（Observation），如此循环。ReAct 的优势在于：思考过程被显式记录下来，便于调试和理解；每一步的观察结果直接反馈给下一步的思考，形成动态调整。

思维树（Tree of Thoughts, ToT）：当任务特别复杂时，单线的 ReAct 可能不够。ToT 让 Agent 在关键决策点生成多个可能的"思路分支"，评估每个分支的可行性，选择最有希望的路径继续。这类似于人类在面对复杂问题时会考虑多种解决方案。

反射（Reflection）：高级 Agent 不仅执行任务，还会在执行后"反思"：哪些步骤做得好？哪些可以改进？这种元认知能力让 Agent 能够自我优化。典型的实现方式是让 LLM 对执行历史进行总结和评估，生成改进建议。\`,
        mermaid: \`sequenceDiagram
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
    P->>U: 返回最终结果\`,
        code: [
          {
            lang: "python",
            code: \`# ReAct 模式的完整实现
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
        for line in text.strip().split("\\n"):
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
        tools_desc = "\\n".join(f"- {name}: {fn.__doc__}" for name, fn in self.tools.items())
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
                    prompt += response + f"\\nObservation: {obs}\\n"
                else:
                    prompt += response + "\\nObservation: 工具不存在\\n"
            else:
                prompt += response + "\\n"
        return "达到最大迭代次数"\`,
          },
        ],
        warning: "规划模块的常见陷阱：① 过度规划——Agent 生成过于详细的计划，但执行中环境变化导致计划失效；② 规划惰性——Agent 倾向于选择最简单的路径而非最优路径；③ 上下文丢失——长任务中，Agent 可能忘记最初的目标。缓解策略：定期让 Agent 复述当前目标。",
      },
      {
        title: "4. 记忆系统：Agent 的长期记忆",
        body: \`如果没有记忆，Agent 就只是一个无状态的函数——每次调用都从零开始。记忆系统赋予 Agent 连续性和学习能力。

短期记忆（Short-term Memory）：就是当前对话的上下文窗口。LLM 的上下文长度有限（例如 128K tokens），这意味着 Agent 不能无限地记住所有历史。常见的策略是：滑动窗口（保留最近 N 条消息）、摘要压缩（将旧对话压缩为摘要）、关键信息提取（只保留与当前任务相关的信息）。

长期记忆（Long-term Memory）：通过外部存储实现。最常用的是向量数据库（Vector Database）：将历史交互、知识点、经验转化为向量嵌入（Embedding），在需要时通过语义相似度检索。这使得 Agent 可以"记住"大量信息，而不受上下文窗口限制。

情景记忆（Episodic Memory）vs 语义记忆（Semantic Memory）：借鉴认知心理学的分类，情景记忆存储"发生了什么"（具体事件），语义记忆存储"知道什么"（抽象知识）。Agent 系统也可以做类似的区分：将具体交互记录存储在情景记忆中，将从中提取的通用知识存储在语义记忆中。\`,
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
            code: \`# 基于向量相似度的 Agent 记忆系统
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
    print(f"  [{r['score']}] {r['text']}")\`,
          },
        ],
      },
      {
        title: "5. 工具调用（Function Calling）：Agent 的双手",
        body: \`工具调用是 Agent 与外部世界交互的唯一方式。没有工具，Agent 就只是一个会说话的模型——它无法获取实时信息、无法执行计算、无法影响外部环境。

Function Calling 的工作原理：现代 LLM（如 GPT-4、Claude、Qwen）都支持函数调用能力。开发者提供一组函数描述（名称、参数、用途），LLM 在需要时返回一个结构化的函数调用请求。系统执行这个函数，将结果返回给 LLM，LLM 再基于结果继续推理。

工具设计的黄金法则：① 描述清晰——每个工具的名称和描述必须让 LLM 能准确理解其用途；② 参数明确——参数的类型和含义要精确描述；③ 错误处理——工具失败时返回有意义的错误信息，帮助 LLM 决定重试还是换方案；④ 最小权限——工具只授予完成任务所需的最小权限，避免安全风险。

Agent 的"工具箱"：常见的 Agent 工具包括：搜索引擎（获取实时信息）、代码执行器（运行 Python/JavaScript 代码）、文件操作（读写本地文件）、数据库查询（访问结构化数据）、API 调用（与第三方服务交互）、浏览器自动化（操作网页）。\`,
        code: [
          {
            lang: "python",
            code: \`# 完整的工具定义与调用框架
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
        return "\\n".join(f"- {r['title']}: {r['snippet'][:100]}..." for r in results[:num_results])
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
print(json.dumps(registry.get_tools_description(), indent=2, ensure_ascii=False))\`,
          },
        ],
        tip: "工具开发的实用建议：先写工具的描述和参数定义，再实现函数体。因为 LLM 理解工具的唯一方式就是描述——描述写得好，Agent 就能准确使用工具。",
      },
      {
        title: "6. Agent 框架对比与选择",
        body: \`2024-2026 年间，涌现了大量 Agent 框架。理解它们的差异，能帮助你在实际项目中做出正确的选择。

LangChain/LangGraph：最流行的 Agent 框架，提供了完整的工具链。LangChain 擅长"链式"的线性流程，而 LangGraph 支持更复杂的图结构（循环、分支）。适合需要快速原型的场景。但抽象层次较高，调试可能困难。

AutoGen（Microsoft）：多 Agent 协作框架的标杆。支持多个 Agent 之间通过对话协作完成任务，内置了用户参与模式（Human-in-the-loop）。适合需要复杂团队协作的场景。

CrewAI：轻量级的多 Agent 框架，API 设计优雅，学习曲线低。适合小型项目和快速实验。\`,
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
        body: \`AI Agent 已经在多个领域展现出巨大的实用价值。

软件开发：Agent 可以作为"AI 编程助手"，不仅能补全代码，还能理解整个代码库的架构、编写测试、修复 Bug、审查代码。典型工具包括 Devin（AI 软件工程师）、GitHub Copilot Workspace 等。Agent 在开发中的核心价值不是"替代程序员"，而是"放大程序员的生产力"——让一个程序员能做以前需要两三个人才能完成的工作。

数据分析：Agent 可以自动完成"数据探索→清洗→分析→可视化→报告"的完整流程。用户上传数据集，Agent 自动识别数据类型、生成描述性统计、发现异常值、构建可视化图表、撰写分析结论。

客户服务：新一代客服 Agent 不再只是关键词匹配的聊天机器人，而是能真正理解客户问题、查询订单状态、处理退款、升级复杂问题的智能助手。\`,
        mermaid: \`graph TD
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
    E --> E2["自动修复 + 告警"]\`,
        warning: "Agent 的安全风险不容忽视：① 工具权限过大——Agent 可能执行破坏性操作；② Prompt 注入——恶意用户通过精心构造的输入让 Agent 执行未授权操作；③ 无限循环——Agent 可能在规划-执行循环中陷入死循环。缓解策略：沙盒执行、权限最小化、超时限制、人工审批关键操作。",
        tip: "Agent 开发的黄金法则：从简单开始。不要一开始就构建复杂的多 Agent 系统。先用单 Agent + 几个工具验证核心流程，确认有效后再逐步扩展。",
      },
    ],
  }`;

content = content.substring(0, agentBlock.start) + agentNewContent + content.substring(agentBlock.end);
console.log('agent-001 replaced');
console.log('File size after agent-001:', (content.length / 1024).toFixed(1), 'KB');

// Now replace dl-003
// Re-parse since content changed
const dl3Block = findArticleBlock(content, 'dl-003');
if (!dl3Block) { console.error('dl-003 not found!'); process.exit(1); }

const dl3NewContent = `{
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
        body: \`在深度学习的众多任务中，序列数据是一类非常特殊的存在。语音信号、文本、时间序列、视频帧——它们的共同特征是：数据点之间存在先后顺序和依赖关系。

想象你在读一句话："我今天去了一家新开的餐厅，菜品很___。" 你能自然地填出"好吃"或"美味"，因为前面的上下文（餐厅、菜品）提供了线索。但如果这些词被打乱顺序随机给你，你就无法做出这个推断。这就是序列数据的核心挑战：当前时刻的理解依赖于历史信息。

传统的前馈神经网络（Feedforward Neural Network）无法处理这种依赖。它们假设每个输入样本是独立同分布的（i.i.d.），没有"记忆"能力。你给网络输入一句话的第一个词和最后一个词，它无法知道这两个词之间的关联。

循环神经网络（Recurrent Neural Network, RNN）的设计哲学非常优雅：让网络在时间步之间共享权重，并通过隐藏状态（Hidden State）传递历史信息。在每个时间步 t，RNN 接收当前输入 xₜ 和上一时刻的隐藏状态 hₜ₋₁，输出当前隐藏状态 hₜ 和可选的输出 yₜ。这种递归结构使得网络能够处理任意长度的序列。\`,
        mermaid: \`graph LR
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
    style G fill:#10b981\`,
        tip: "直觉理解：把 RNN 想象成一个有短期记忆的人。每读到一个新词，他结合当前的理解和之前的记忆来更新自己的认知。这就是 hₜ = f(xₜ, hₜ₋₁) 的含义。",
      },
      {
        title: "2. 标准 RNN 的数学推导与前向传播",
        body: \`标准 RNN（Elman Network）的核心公式非常简洁：

hₜ = tanh(Wₕₕ · hₜ₋₁ + Wₓₕ · xₜ + bₕ)
yₜ = Wₕᵧ · hₜ + bᵧ

其中，Wₕₕ 是隐藏状态到隐藏状态的权重矩阵（"记忆"的权重），Wₓₕ 是输入到隐藏状态的权重矩阵（"感知"的权重），Wₕᵧ 是隐藏状态到输出的权重矩阵。

关键设计：Wₕₕ 在所有时间步共享。这意味着无论序列有多长，RNN 使用的参数量是固定的。这与将每个时间步当作独立输入的全连接网络形成鲜明对比——后者参数量随序列长度线性增长。

激活函数的选择也很重要。RNN 通常使用 tanh 而非 ReLU 作为隐藏状态的激活函数，原因有二：tanh 的输出范围是 [-1, 1]，这限制了隐藏状态不会无限增长（稳定性）；同时 tanh 在零点附近近似线性，保留了梯度信息。\`,
        code: [
          {
            lang: "python",
            code: \`import numpy as np

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
print(f"隐藏状态形状: {states.shape}")  # (21, 32) 包含初始 h_0\`,
          },
        ],
      },
      {
        title: "3. 梯度消失问题：RNN 的致命缺陷",
        body: \`理论上，RNN 能处理任意长度的序列。但实际上，标准 RNN 很难"记住"很久之前的信息。这就是著名的梯度消失（Vanishing Gradient）问题。

让我们通过反向传播来分析原因。RNN 的损失函数 L 对 Wₕₕ 的梯度需要链式法则跨越多个时间步：

∂L/∂Wₕₕ = Σₜ (∂L/∂hₜ) · (∂hₜ/∂Wₕₕ)

其中，∂hₜ/∂hₖ（t > k）涉及 t-k 次矩阵连乘：

∂hₜ/∂hₖ = Πⱼ₌ₖ₊₁ᵗ diag(tanh'(zⱼ)) · Wₕₕ

问题出在这个连乘上。tanh 的导数范围是 (0, 1]，且大部分区域远小于 1。假设平均导数为 0.5，那么 10 步之后的梯度贡献就是 0.5¹⁰ ≈ 0.001——几乎消失了。

这导致什么后果？RNN 只能学习短期依赖（通常不超过 5-10 步）。对于需要长距离依赖的任务（如理解长文档、翻译长句子），标准 RNN 几乎无能为力。

有趣的是，也存在梯度爆炸（Exploding Gradient）问题——当 Wₕₕ 的特征值大于 1 时，连乘会导致梯度指数级增长，训练不稳定。梯度爆炸可以用梯度裁剪（Gradient Clipping）解决，但梯度消失需要架构级的创新。\`,
        code: [
          {
            lang: "python",
            code: \`# 数值演示：为什么 RNN 的梯度会消失
import numpy as np

def demonstrate_gradient_vanishing(seq_length=20):
    """数值演示 RNN 反向传播中的梯度消失"""
    tanh_deriv_avg = 0.5
    W_hh_norm = 0.8  # W_hh 的典型谱范数
    decay_factor = tanh_deriv_avg * W_hh_norm
    
    print(f"每步梯度衰减因子: {decay_factor:.4f}")
    print(f"\\n时间步 | 相对梯度大小 | 衰减程度")
    print("-" * 40)
    
    for t in range(1, seq_length + 1):
        relative_gradient = decay_factor ** t
        emoji = "🟢" if relative_gradient > 0.01 else "🟡" if relative_gradient > 0.0001 else "🔴"
        print(f"  t={t:2d}   | {relative_gradient:.6e} | {emoji}")
    
    print(f"\\n结论：{seq_length} 步后，梯度只剩初始的 {decay_factor**seq_length:.2e}")
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
demonstrate_gradient_clipping()\`,
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
        body: \`LSTM（Long Short-Term Memory）是 Hochreiter & Schmidhuber（1997）提出的划时代架构。它的核心创新是"门控机制"（Gating Mechanism）——通过精心设计的门来控制信息的流动，从而解决梯度消失问题。

LSTM 引入了三个门和一个细胞状态：

遗忘门（Forget Gate）：决定从细胞状态中丢弃什么信息。它读取 hₜ₋₁ 和 xₜ，输出一个 0 到 1 之间的向量 fₜ，与细胞状态 Cₜ₋₁ 逐元素相乘。fₜ = 0 表示完全遗忘，fₜ = 1 表示完全保留。

输入门（Input Gate）：决定向细胞状态中添加什么新信息。包含两部分：iₜ 决定更新的幅度（sigmoid），C̃ₜ 是候选值（tanh）。

输出门（Output Gate）：决定基于细胞状态输出什么。oₜ 决定输出的幅度，hₜ = oₜ ⊙ tanh(Cₜ)。

LSTM 的精髓在于细胞状态 Cₜ 的更新方式：Cₜ = fₜ ⊙ Cₜ₋₁ + iₜ ⊙ C̃ₜ。当 fₜ ≈ 1 且 iₜ ≈ 0 时，Cₜ ≈ Cₜ₋₁——信息无损地流过时间步。这条"高速公路"（Constant Error Carousel）让梯度可以几乎无衰减地反向传播，从根本上解决了梯度消失问题。\`,
        mermaid: \`graph TD
    X["输入 xₜ"] --> C["Concat xₜ 和 hₜ₋₁"]
    H["hₜ₋₁"] --> C
    
    C --> F["遗忘门 fₜ\\nsigmoid"]
    C --> I["输入门 iₜ\\nsigmoid"]
    C --> N["候选值 C̃ₜ\\ntanh"]
    C --> O["输出门 oₜ\\nsigmoid"]
    
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
    style N fill:#8b5cf6\`,
        code: [
          {
            lang: "python",
            code: \`class LSTM:
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
print(f"隐藏状态最终值范围: [{h_states[-1].min():.3f}, {h_states[-1].max():.3f}]")\`,
          },
        ],
      },
      {
        title: "5. GRU 与 LSTM 对比",
        body: \`GRU（Gated Recurrent Unit）由 Cho 等人（2014）提出，是 LSTM 的简化版本。它将 LSTM 的四个门简化为两个：更新门（Update Gate）和重置门（Reset Gate）。

更新门 zₜ 融合了 LSTM 中遗忘门和输入门的功能——它同时决定保留多少旧信息和添加多少新信息。重置门 rₜ 决定忽略多少过去的隐藏状态。

GRU 的优势：参数更少（训练更快）、在中小数据集上效果与 LSTM 相当、实现更简单。在许多实际任务中，GRU 和 LSTM 的性能差异很小（通常 < 1%），但 GRU 训练速度更快。\`,
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
          "LSTM 的细胞状态是一条"信息高速公路"，让长期依赖成为可能",
          "现代实践中，RNN/LSTM/GRU 常用于 Transformer 不适合的场景：流式处理（需要逐 token 输出）、低延迟推理、资源受限设备",
        ],
      },
      {
        title: "6. RNN 家族的实际应用场景",
        body: \`尽管 Transformer 在 NLP 领域占据主导地位，RNN 家族在以下场景中仍然不可替代。

时间序列预测：股票价格、天气预测、销售预测等场景中，LSTM 和 GRU 仍然是主流选择。原因是时间序列数据通常具有强烈的时间依赖性，且数据量不足以训练大型 Transformer。LSTM 的门控机制天然适合捕捉时间序列中的趋势和周期性模式。

语音识别：虽然端到端的 Transformer 模型（如 Whisper）在语音识别上表现出色，但流式语音识别（实时转写）仍然依赖 RNN 架构，因为 RNN 可以逐帧处理输入，而 Transformer 需要完整的上下文窗口。

音乐生成：音乐的时序特性使其非常适合 RNN 建模。LSTM 可以学习音乐的节奏、和弦进行和旋律模式，生成连贯的音乐片段。\`,
        code: [
          {
            lang: "python",
            code: \`# 用 LSTM 进行时间序列预测
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
print(f"序列形状: {X[0].shape} -> 预测单值")\`,
          },
        ],
        tip: "在 2026 年的实际工程中，如果你做 NLP，优先选择 Transformer；如果你做时间序列预测，LSTM/GRU 仍然是可靠选择；如果你需要流式处理（低延迟逐 token 输出），RNN 架构有天然优势。",
      },
    ],
  }`;

content = content.substring(0, dl3Block.start) + dl3NewContent + content.substring(dl3Block.end);
console.log('dl-003 replaced');
console.log('Final file size:', (content.length / 1024).toFixed(1), 'KB');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Both articles injected successfully!');
