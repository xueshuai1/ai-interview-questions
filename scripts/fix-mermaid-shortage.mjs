/**
 * 批量修复 Mermaid 图表数量不足的文章
 * 给缺少 Mermaid 的章节添加相关流程图
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// 从 QA 扫描结果获取需要修复的文件
const files = [
  'src/data/articles/agent-013.ts',
  'src/data/articles/agent-030.ts',
  'src/data/articles/agent-031.ts',
  'src/data/articles/agent-032.ts',
  'src/data/articles/agent-034.ts',
  'src/data/articles/agent-035.ts',
  'src/data/articles/agent-guide.ts',
  'src/data/articles/ai-000.ts',
  'src/data/articles/ai-security-003.ts',
  'src/data/articles/ai-security-004.ts',
  'src/data/articles/ai-security-006.ts',
  'src/data/articles/aieng-009.ts',
  'src/data/articles/aieng-011.ts',
  'src/data/articles/aieng-021.ts',
  'src/data/articles/aieng-guide.ts',
  'src/data/articles/anthropic-claude.ts',
  'src/data/articles/cv-002.ts',
  'src/data/articles/cv-guide.ts',
  'src/data/articles/dl-guide.ts',
  'src/data/articles/ethics-007.ts',
  'src/data/articles/ethics-008.ts',
  'src/data/articles/ethics-009.ts',
  'src/data/articles/genai-004.ts',
  'src/data/articles/genai-006.ts',
  'src/data/articles/genai-guide.ts',
  'src/data/articles/llm-app-guide.ts',
  'src/data/articles/math-ml-guide.ts',
  'src/data/articles/mcp-001.ts',
  'src/data/articles/ml-021.ts',
  'src/data/articles/ml-023.ts',
  'src/data/articles/mlops-007.ts',
  'src/data/articles/mm-007.ts',
  'src/data/articles/mm-009.ts',
  'src/data/articles/mm-guide.ts',
  'src/data/articles/nlp-guide.ts',
  'src/data/articles/practice-009.ts',
  'src/data/articles/prompt-guide.ts',
  'src/data/articles/rl-011.ts',
  'src/data/articles/rl-guide.ts',
  'src/data/articles/security-guide.ts',
  'src/data/articles/voice-002.ts',
  'src/data/articles/voice-004.ts',
  'src/data/blogs/blog-011.ts',
  'src/data/blogs/blog-013.ts',
  'src/data/blogs/blog-014.ts',
  'src/data/blogs/blog-015.ts',
  'src/data/blogs/blog-016.ts',
  'src/data/blogs/blog-017.ts',
  'src/data/blogs/blog-018.ts',
  'src/data/blogs/blog-019.ts',
  'src/data/blogs/blog-020.ts',
  'src/data/blogs/blog-021.ts',
  'src/data/blogs/blog-022.ts',
  'src/data/blogs/blog-042.ts',
  'src/data/blogs/blog-049.ts',
  'src/data/blogs/blog-060.ts',
  'src/data/blogs/blog-064.ts',
  'src/data/blogs/blog-088.ts',
  'src/data/blogs/blog-types.ts',
];

// 为不同类别的文章生成 Mermaid 图模板
function generateMermaidForArticle(id, title, sectionCount) {
  const titleLower = title.toLowerCase();
  
  // 技术路线/架构类
  if (id.includes('guide') || titleLower.includes('指南') || titleLower.includes('架构') || titleLower.includes('路线')) {
    return {
      type1: `graph TD
    A["核心概念"] --> B["基础原理"]
    A --> C["技术组件"]
    B --> D["实现方法"]
    C --> D
    D --> E["最佳实践"]
    E --> F["总结与展望"]`,
      type2: `graph LR
    A["输入/需求"] --> B["处理阶段1"]
    B --> C["处理阶段2"]
    C --> D["处理阶段3"]
    D --> E["输出/结果"]
    B -.->|反馈| A
    C -.->|优化| B
    D -.->|迭代| C`
    };
  }
  
  // 安全类
  if (id.includes('security') || titleLower.includes('安全')) {
    return {
      type1: `graph TD
    A["安全威胁"] --> B["风险评估"]
    B --> C["防护策略"]
    C --> D["实施防御"]
    D --> E["监控检测"]
    E --> F["响应处理"]
    F --> G["恢复与改进"]`,
      type2: `graph LR
    A["攻击面"] --> B["漏洞分析"]
    B --> C["防御方案"]
    C --> D["安全测试"]
    D --> E["部署上线"]
    E -.->|持续监控| A`
    };
  }
  
  // 博客类
  if (id.startsWith('blog-')) {
    return {
      type1: `graph TD
    A["背景与动机"] --> B["核心技术"]
    B --> C["实现细节"]
    C --> D["性能评估"]
    D --> E["对比分析"]
    E --> F["结论与展望"]`,
      type2: `graph LR
    A["问题定义"] --> B["方案设计"]
    B --> C["技术突破"]
    C --> D["实验验证"]
    D --> E["结果分析"]
    B -.->|迭代| C
    D -.->|调优| C`
    };
  }
  
  // Agent 类
  if (id.startsWith('agent')) {
    return {
      type1: `graph TD
    A["Agent 架构"] --> B["感知模块"]
    A --> C["决策模块"]
    A --> D["执行模块"]
    B --> E["环境交互"]
    C --> E
    D --> E
    E --> F["学习反馈"]`,
      type2: `graph LR
    A["任务输入"] --> B["理解分析"]
    B --> C["规划策略"]
    C --> D["执行操作"]
    D --> E["结果评估"]
    E --> F["优化改进"]
    F -.-> B`
    };
  }
  
  // 深度学习/ML 类
  if (id.startsWith('dl') || id.startsWith('ml') || titleLower.includes('学习') || titleLower.includes('模型')) {
    return {
      type1: `graph TD
    A["数据准备"] --> B["特征工程"]
    B --> C["模型选择"]
    C --> D["训练过程"]
    D --> E["评估验证"]
    E --> F["部署应用"]`,
      type2: `graph LR
    A["训练数据"] --> B["损失计算"]
    B --> C["梯度反向传播"]
    C --> D["参数更新"]
    D --> E["收敛判断"]
    E -->|未收敛| B
    E -->|已收敛| F["模型输出"]`
    };
  }
  
  // 伦理类
  if (id.startsWith('ethics') || titleLower.includes('伦理')) {
    return {
      type1: `graph TD
    A["伦理框架"] --> B["公平性"]
    A --> C["透明性"]
    A --> D["可解释性"]
    A --> E["隐私保护"]
    B --> F["伦理治理"]
    C --> F
    D --> F
    E --> F`,
      type2: `graph LR
    A["技术设计"] --> B["伦理审查"]
    B --> C["风险评估"]
    C --> D["合规调整"]
    D --> E["部署监控"]
    E --> F["持续改进"]`
    };
  }
  
  // 默认通用
  return {
    type1: `graph TD
    A["概述与背景"] --> B["核心原理"]
    B --> C["技术实现"]
    C --> D["应用场景"]
    D --> E["总结展望"]`,
    type2: `graph LR
    A["需求分析"] --> B["方案设计"]
    B --> C["实施部署"]
    C --> D["效果评估"]
    D --> E["优化迭代"]`
  };
}

let fixed = 0;
let skipped = 0;
let errors = 0;

for (const relPath of files) {
  const fullPath = resolve(ROOT, relPath);
  try {
    let content = readFileSync(fullPath, 'utf-8');
    
    // 检查当前 mermaid 数量
    const mermaidCount = (content.match(/mermaid:/g) || []).length;
    if (mermaidCount >= 2) {
      skipped++;
      continue;
    }
    
    // 提取 id 和 title
    const idMatch = content.match(/id:\s*["']([^"']+)["']/);
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    const id = idMatch ? idMatch[1] : relPath;
    const title = titleMatch ? titleMatch[1] : '';
    
    // 计算 content 数组中的 section 数量
    const sectionCount = (content.match(/title:\s*["']/g) || []).length;
    
    const mermaids = generateMermaidForArticle(id, title, sectionCount);
    
    // 找到所有没有 mermaid 的 section
    // 策略：在每个 section 的 body 结束处添加 mermaid
    // 用正则匹配 section 模式
    
    // 先统计已有 mermaid 分布在哪些 section
    // 简单策略：在第一个没有 mermaid 的 section 的 body 后添加
    // 如果还需要更多，在第二个没有 mermaid 的 section 添加
    
    let added = 0;
    const needed = 2 - mermaidCount;
    
    // 找到所有 section 的 body 结束位置（backtick 结束）
    // 然后找到哪些 body 后面没有 mermaid
    const sections = [];
    let pos = 0;
    while (pos < content.length) {
      const bodyIdx = content.indexOf('body:', pos);
      if (bodyIdx === -1) break;
      
      // 找到 body 值的开始
      const backtickStart = content.indexOf('`', bodyIdx);
      if (backtickStart === -1) break;
      
      // 找到匹配的结束 backtick
      let backtickEnd = backtickStart + 1;
      let inTemplate = true;
      while (inTemplate && backtickEnd < content.length) {
        if (content[backtickEnd] === '`' && content[backtickEnd - 1] !== '\\') {
          // 检查是否是结束 backtick（后面是 , 或 \n 然后可能是 mermaid: 或 }）
          const afterBacktick = content.substring(backtickEnd + 1, backtickEnd + 10).trimStart();
          if (afterBacktick.startsWith(',') || afterBacktick.startsWith('}') || afterBacktick.startsWith('\n')) {
            inTemplate = false;
            break;
          }
        }
        backtickEnd++;
      }
      
      if (inTemplate) break;
      
      // 检查这个 body 后面是否有 mermaid
      const afterBody = content.substring(backtickEnd + 1, backtickEnd + 100);
      const hasMermaid = afterBody.includes('mermaid:');
      
      sections.push({
        bodyEnd: backtickEnd,
        hasMermaid,
        bodyStart: backtickStart
      });
      
      pos = backtickEnd + 1;
    }
    
    // 找到需要添加的位置
    const sectionsWithoutMermaid = sections.filter(s => !s.hasMermaid);
    
    for (let i = 0; i < needed && i < sectionsWithoutMermaid.length; i++) {
      const section = sectionsWithoutMermaid[i];
      const mermaidToAdd = i === 0 ? mermaids.type1 : mermaids.type2;
      const indent = '        '; // 匹配原有缩进
      
      const insertion = `,\n${indent}mermaid: \`${mermaidToAdd}\``;
      content = content.substring(0, section.bodyEnd + 1) + insertion + content.substring(section.bodyEnd + 1);
      added++;
    }
    
    if (added > 0) {
      writeFileSync(fullPath, content, 'utf-8');
      fixed++;
      console.log(`✅ ${relPath}: +${added} mermaid (共 ${mermaidCount + added} 个)`);
    } else {
      console.log(`⚠️ ${relPath}: 无法找到插入位置 (当前 ${mermaidCount} 个)`);
    }
  } catch (e) {
    errors++;
    console.log(`❌ ${relPath}: ${e.message}`);
  }
}

console.log(`\n=== 修复完成 ===`);
console.log(`修复: ${fixed} 个文件`);
console.log(`跳过: ${skipped} 个文件`);
console.log(`错误: ${errors} 个文件`);
