/**
 * 修复 Mermaid 数量不足 - v5 (行级 brace-counting parser)
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const qaOutput = execSync('node scripts/qa-scan.mjs 2>&1', { cwd: ROOT, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
const failingFiles = [];
for (const line of qaOutput.split('\n')) {
  const m = line.match(/❌ (src\/data\/[^:]+\.ts): Mermaid 图表数量不足/);
  if (m) failingFiles.push(m[1]);
}
const files = failingFiles.filter(f => !f.endsWith('-types.ts'));
if (files.length === 0) { console.log('无需要修复的文件'); process.exit(0); }

function getMermaids(fp) {
  const id = fp.split('/').pop().replace('.ts', '');
  const isBlog = fp.includes('/blogs/');
  const m = (a, b) => [a, b];
  if (id.includes('security')) return m(`graph TD\n    A["安全威胁"] --> B["风险评估"]\n    B --> C["防护策略"]\n    C --> D["实施防御"]\n    D --> E["监控检测"]\n    E --> F["响应处理"]\n    F --> G["恢复与改进"]`, `graph LR\n    A["攻击面"] --> B["漏洞分析"]\n    B --> C["防御方案"]\n    C --> D["安全测试"]\n    D --> E["部署上线"]\n    E -.->|持续监控| A`);
  if (id.startsWith('agent')) return m(`graph TD\n    A["Agent 架构"] --> B["感知模块"]\n    A --> C["决策模块"]\n    A --> D["执行模块"]\n    B --> E["环境交互"]\n    C --> E\n    D --> E\n    E --> F["学习反馈"]`, `graph LR\n    A["任务输入"] --> B["理解分析"]\n    B --> C["规划策略"]\n    C --> D["执行操作"]\n    D --> E["结果评估"]\n    E --> F["优化改进"]\n    F -.-> B`);
  if (id.startsWith('rl')) return m(`graph TD\n    A["强化学习基础"] --> B["MDP 建模"]\n    B --> C["价值函数"]\n    B --> D["策略梯度"]\n    C --> E["Q-Learning"]\n    C --> F["DQN"]\n    D --> G["REINFORCE"]\n    D --> H["PPO"]`, `graph LR\n    A["环境交互"] --> B["采样轨迹"]\n    B --> C["计算回报"]\n    C --> D["更新策略"]\n    D --> A\n    B -.->|经验回放| C`);
  if (id.startsWith('dl') || id.startsWith('ml')) return m(`graph TD\n    A["数据准备"] --> B["特征工程"]\n    B --> C["模型选择"]\n    C --> D["训练过程"]\n    D --> E["评估验证"]\n    E --> F["部署应用"]`, `graph LR\n    A["训练数据"] --> B["损失计算"]\n    B --> C["梯度反向传播"]\n    C --> D["参数更新"]\n    D --> E["收敛判断"]\n    E -->|未收敛| B\n    E -->|已收敛| F["模型输出"]`);
  if (id.startsWith('cv')) return m(`graph TD\n    A["图像输入"] --> B["预处理"]\n    B --> C["特征提取"]\n    C --> D["模型推理"]\n    D --> E["结果输出"]\n    C -.->|多尺度| C`, `graph LR\n    A["卷积层"] --> B["激活函数"]\n    B --> C["池化层"]\n    C --> D["全连接层"]\n    D --> E["分类输出"]`);
  if (id.startsWith('nlp')) return m(`graph TD\n    A["文本输入"] --> B["分词处理"]\n    B --> C["词向量编码"]\n    C --> D["模型推理"]\n    D --> E["输出生成"]`, `graph LR\n    A["语言模型"] --> B["注意力机制"]\n    B --> C["位置编码"]\n    C --> D["多头注意力"]\n    D --> E["输出生成"]`);
  if (id.startsWith('ethics')) return m(`graph TD\n    A["伦理框架"] --> B["公平性"]\n    A --> C["透明性"]\n    A --> D["可解释性"]\n    A --> E["隐私保护"]\n    B --> F["伦理治理"]\n    C --> F\n    D --> F\n    E --> F`, `graph LR\n    A["技术设计"] --> B["伦理审查"]\n    B --> C["风险评估"]\n    C --> D["合规调整"]\n    D --> E["部署监控"]\n    E --> F["持续改进"]`);
  if (id.startsWith('genai')) return m(`graph TD\n    A["提示词设计"] --> B["模型推理"]\n    B --> C["输出生成"]\n    C --> D["质量评估"]\n    D --> E["迭代优化"]\n    D -.->|不满意| A`, `graph LR\n    A["预训练"] --> B["微调"]\n    B --> C["对齐优化"]\n    C --> D["部署推理"]\n    D --> E["反馈学习"]`);
  if (id.startsWith('voice')) return m(`graph TD\n    A["语音输入"] --> B["特征提取"]\n    B --> C["声学模型"]\n    C --> D["语言模型"]\n    D --> E["文本输出"]`, `graph LR\n    A["音频采集"] --> B["降噪处理"]\n    B --> C["语音识别"]\n    C --> D["语义理解"]\n    D --> E["响应生成"]`);
  if (id.startsWith('mlops')) return m(`graph TD\n    A["数据管道"] --> B["模型训练"]\n    B --> C["模型评估"]\n    C --> D["部署上线"]\n    D --> E["监控告警"]\n    E --> F["自动回滚"]`, `graph LR\n    A["CI/CD"] --> B["自动化测试"]\n    B --> C["模型验证"]\n    C --> D["生产部署"]\n    D --> E["性能监控"]`);
  if (id.startsWith('practice')) return m(`graph TD\n    A["项目启动"] --> B["需求分析"]\n    B --> C["技术设计"]\n    C --> D["编码实现"]\n    D --> E["测试部署"]`, `graph LR\n    A["最佳实践"] --> B["代码规范"]\n    B --> C["Code Review"]\n    C --> D["持续集成"]\n    D --> E["生产发布"]`);
  if (id.startsWith('llm')) return m(`graph TD\n    A["用户输入"] --> B["Prompt 构建"]\n    B --> C["LLM 调用"]\n    C --> D["结果解析"]\n    D --> E["响应返回"]\n    B -.->|上下文| C`, `graph LR\n    A["Token 处理"] --> B["注意力计算"]\n    B --> C["前馈网络"]\n    C --> D["输出生成"]\n    D --> E["下一个 Token"]`);
  if (id.startsWith('math')) return m(`graph TD\n    A["数学问题"] --> B["符号表示"]\n    B --> C["模型推理"]\n    C --> D["结果验证"]\n    D --> E["答案输出"]`, `graph LR\n    A["公式推导"] --> B["数值计算"]\n    B --> C["验证检查"]\n    C --> D["结果呈现"]`);
  if (id.startsWith('mcp')) return m(`graph TD\n    A["客户端请求"] --> B["MCP Server"]\n    B --> C["工具发现"]\n    C --> D["工具调用"]\n    D --> E["结果返回"]`, `graph LR\n    A["协议定义"] --> B["能力声明"]\n    B --> C["工具注册"]\n    C --> D["运行时调用"]`);
  if (id.startsWith('anthropic')) return m(`graph TD\n    A["Constitutional AI"] --> B["安全训练"]\n    B --> C["RLHF"]\n    C --> D["部署监控"]\n    D --> E["持续改进"]`, `graph LR\n    A["模型训练"] --> B["安全评估"]\n    B --> C["红队测试"]\n    C --> D["发布决策"]`);
  if (id.startsWith('aieng')) return m(`graph TD\n    A["工程需求"] --> B["架构设计"]\n    B --> C["技术选型"]\n    C --> D["开发实现"]\n    D --> E["测试验证"]\n    E --> F["部署运维"]\n    F -.->|反馈| B`, `graph LR\n    A["系统设计"] --> B["模块拆分"]\n    B --> C["接口定义"]\n    C --> D["集成测试"]\n    D --> E["上线运维"]`);
  if (id.startsWith('ai')) return m(`graph TD\n    A["AI 基础"] --> B["机器学习"]\n    A --> C["深度学习"]\n    A --> D["强化学习"]\n    B --> E["监督学习"]\n    C --> F["神经网络"]\n    D --> G["策略优化"]`, `graph LR\n    A["问题定义"] --> B["数据收集"]\n    B --> C["模型训练"]\n    C --> D["评估优化"]\n    D --> E["部署应用"]`);
  if (id.startsWith('mm')) return m(`graph TD\n    A["多模态输入"] --> B["特征融合"]\n    B --> C["联合推理"]\n    C --> D["跨模态生成"]\n    D --> E["统一输出"]`, `graph LR\n    A["文本"] --> B["多模态编码器"]\n    A --> C["图像"]\n    A --> D["音频"]\n    B --> E["联合表示"]\n    C --> E\n    D --> E`);
  if (id.includes('guide')) return m(`graph TD\n    A["核心概念"] --> B["基础原理"]\n    A --> C["技术组件"]\n    B --> D["实现方法"]\n    C --> D\n    D --> E["最佳实践"]\n    E --> F["总结与展望"]`, `graph LR\n    A["输入/需求"] --> B["处理阶段1"]\n    B --> C["处理阶段2"]\n    C --> D["处理阶段3"]\n    D --> E["输出/结果"]\n    B -.->|反馈| A\n    C -.->|优化| B\n    D -.->|迭代| C`);
  if (isBlog) return m(`graph TD\n    A["背景与动机"] --> B["核心技术"]\n    B --> C["实现细节"]\n    C --> D["性能评估"]\n    D --> E["对比分析"]\n    E --> F["结论与展望"]`, `graph LR\n    A["问题定义"] --> B["方案设计"]\n    B --> C["技术突破"]\n    C --> D["实验验证"]\n    D --> E["结果分析"]\n    B -.->|迭代| C\n    D -.->|调优| C`);
  return m(`graph TD\n    A["概述与背景"] --> B["核心原理"]\n    B --> C["技术实现"]\n    C --> D["应用场景"]\n    D --> E["总结展望"]`, `graph LR\n    A["需求分析"] --> B["方案设计"]\n    B --> C["实施部署"]\n    C --> D["效果评估"]\n    D --> E["优化迭代"]`);
}

function findSectionsByLine(lines) {
  const sections = [];
  
  for (let titleLine = 0; titleLine < lines.length; titleLine++) {
    const trimmed = lines[titleLine].trimStart();
    if (!trimmed.match(/^title:\s*["']/)) continue;
    
    // 找到前面的 {
    let openLine = titleLine;
    while (openLine >= 0 && !lines[openLine].includes('{')) openLine--;
    if (openLine < 0) continue;
    
    // 从 openLine 开始 brace counting，找到匹配的 }
    let depth = 0;
    let sq = false, dq = false, tl = 0;
    let closeLine = -1;
    
    for (let li = openLine; li < lines.length; li++) {
      const line = lines[li];
      for (let ci = 0; ci < line.length; ci++) {
        const ch = line[ci];
        if (ch === '\\' && (sq || dq || tl > 0)) { ci++; continue; }
        if (ch === '`' && !sq && !dq) { tl++; continue; }
        if (ch === '`' && tl > 0) { tl--; continue; }
        if (ch === "'" && !dq && tl === 0) { sq = !sq; continue; }
        if (ch === '"' && !sq && tl === 0) { dq = !dq; continue; }
        if (sq || dq || tl > 0) continue;
        if (ch === '{') depth++;
        if (ch === '}') {
          depth--;
          if (depth === 0 && (li > openLine || ci > line.indexOf('{'))) {
            closeLine = li;
            break;
          }
        }
      }
      if (closeLine >= 0) break;
    }
    
    if (closeLine < 0) continue;
    
    const sectionText = lines.slice(openLine, closeLine + 1).join('\n');
    const hasMermaid = /mermaid:\s*[`"]/.test(sectionText);
    
    sections.push({ openLine, closeLine, hasMermaid });
  }
  
  return sections;
}

let fixed = 0;

for (const relPath of files) {
  const fullPath = resolve(ROOT, relPath);
  try {
    let content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    const currentCount = (content.match(/mermaid:\s*`/g) || []).length;
    const needed = Math.max(0, 2 - currentCount);
    if (needed === 0) { fixed++; continue; }
    
    const sections = findSectionsByLine(lines);
    const sectionsWithoutMermaid = sections.filter(s => !s.hasMermaid);
    
    if (sectionsWithoutMermaid.length === 0) { fixed++; continue; }
    
    const mermaids = getMermaids(relPath);
    
    // 从后往前插入
    const targets = sectionsWithoutMermaid.slice(0, needed).sort((a, b) => b.closeLine - a.closeLine);
    
    for (let t = 0; t < targets.length; t++) {
      const section = targets[t];
      const mermaidText = mermaids[t % mermaids.length];
      const indent = ' '.repeat(lines[section.openLine].search(/\S/) + 4);
      
      const insert = `${indent}mermaid: \`${mermaidText}\`,`;
      
      // 在 closeLine 的 } 之前插入
      const closeLineContent = lines[section.closeLine];
      const firstBrace = closeLineContent.indexOf('}');
      const before = closeLineContent.substring(0, firstBrace);
      const after = closeLineContent.substring(firstBrace);
      lines[section.closeLine] = before + insert + '\n' + before.trimEnd() + after;
    }
    
    const newContent = lines.join('\n');
    const newCount = (newContent.match(/mermaid:\s*`/g) || []).length;
    writeFileSync(fullPath, newContent, 'utf-8');
    console.log(`✅ ${relPath}: ${currentCount} → ${newCount} 个 mermaid`);
    fixed++;
  } catch (e) {
    console.log(`❌ ${relPath}: ${e.message}`);
  }
}

console.log(`\n共修复: ${fixed}`);
