import { readFileSync, writeFileSync } from 'fs';

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  
  // Pattern: inside body template literal, there's "mermaid: `graph..." 
  // that needs to be extracted as a separate property
  // The pattern is: body: `...text.\n            mermaid: `graph...\n...\n...\n...\n`\n\n**text
  // We need to: close body before mermaid, add mermaid as separate property
  
  // Match: body: `...(text ending with 。 or 或其他中文标点)\n            mermaid: `graph...\n...\n...\n...\`\n\n
  // Replace with: body: `...(text)\n\n**text...**\`,
  //             mermaid: `graph...
  
  // More robust: find all instances where "mermaid: `graph" appears inside a body string
  // The key indicator is the pattern: some Chinese text then newline + indentation + "mermaid: `graph"
  
  const regex = /(body: `[\s\S]*?[。！？.]\n)(\s+mermaid: `graph[\s\S]*?`)\n\n(\*\*)/g;
  
  let match;
  const fixes = [];
  let fixedContent = content;
  
  // Find all matches
  while ((match = regex.exec(content)) !== null) {
    fixes.push({
      bodyEnd: match[1],
      mermaidBlock: match[2],
      afterText: match[3]
    });
  }
  
  if (fixes.length === 0) {
    console.log(`No issues found in ${filePath}`);
    return false;
  }
  
  console.log(`Found ${fixes.length} mermaid-in-body issues in ${filePath}`);
  
  // Replace: move mermaid out of body
  // Pattern: body: `...text。\n            mermaid: `graph...\`\n\n**text
  // → body: `...text。\n\n**text...**\`,\n            mermaid: `graph...\`
  
  const replaceRegex = /([\s\S]*?body: `[\s\S]*?[。！？.])\n(\s+)mermaid: (`graph[\s\S]*?`)\n\n(\*\*)/g;
  fixedContent = content.replace(replaceRegex, (full, bodyPart, indent, mermaidTick, afterStar) => {
    // bodyPart already includes the body text up to the period
    // We need to add `\n\n** after the closing backtick of body
    // Then add mermaid as a separate property
    
    // Find the section end - need to find the closing backtick of body
    // Actually the issue is the body text CONTINUES after the mermaid block
    // We need to extract mermaid and put it AFTER the body closes
    
    // Let me think differently...
    // The actual structure is:
    // body: `text。\n            mermaid: `graph...\`\n\n**more text...**\n...text...`,\n
    // 
    // We want:
    // body: `text。\n\n**more text...**\n...text...`,\n            mermaid: `graph...\`
    
    return full; // placeholder
  });
  
  // Actually, let me do a simpler approach - just find and replace the specific patterns
  
  // For ai-security-013.ts section 2:
  // The body starts with "要深入理解" and ends after the mermaid block
  // But the body text continues after the mermaid block
  
  // Simpler approach: use string replacement
  
  // Pattern 1: in section 2 of ai-security-013.ts
  const old1 = `body: \`要深入理解奖励劫持，必须从**数学层面**分析其发生机制。
            mermaid: \`graph TD
    A["奖励劫持攻击"] --> B["目标-意图错位"]
    A --> C["非预期策略"]
    A --> D["脆弱性放大"]
    B --> B1["奖励函数设计缺陷"]
    B --> B2["奖励信号可操控"]
    C --> C1["环境探索意外发现"]n    D --> D1["AI 毒品攻击"]\`

**形式化定义**：`;
  
  const new1 = `body: \`要深入理解奖励劫持，必须从**数学层面**分析其发生机制。

**形式化定义**：`;
  
  const mermaid1 = `            mermaid: \`graph TD
    A["奖励劫持攻击"] --> B["目标-意图错位"]
    A --> C["非预期策略"]
    A --> D["脆弱性放大"]
    B --> B1["奖励函数设计缺陷"]
    B --> B2["奖励信号可操控"]
    C --> C1["环境探索意外发现"]
    D --> D1["AI 毒品攻击"]\``;
  
  // Find the warning line that ends section 2 and add mermaid after it
  const warning1 = `warning: \`**常见误区：** 许多人认为只要「奖励函数设计得足够精细」就能避免奖励劫持。这是错误的——**古德哈特定律（Goodhart's Law）**指出：「当一个度量成为目标时，它就不再是一个好的度量。」无论奖励函数设计得多精细，足够强大的 AI 系统总能找到利用漏洞的方式。\``;
  
  const warning1New = warning1 + `,\n${mermaid1}`;
  
  fixedContent = content.replace(old1, new1).replace(warning1, warning1New);
  
  if (fixedContent === content) {
    console.log(`Pattern 1 not found in ${filePath}`);
    return false;
  }
  
  // Pattern 2: in section 6 of ai-security-013.ts  
  const old2 = `body: \`防御奖励劫持需要从**系统设计**的**全生命周期**入手——从**奖励函数的初始设计**到**运行时的持续监控**，每个环节都需要**针对性的安全措施**。
            mermaid: \`graph TD
    A["多层防御体系"] --> B["第一层：奖励函数安全设计"]
    A --> C["第二层：奖励模型鲁棒性增强"]n    A --> D["第三层：运行时监控与干预"]n    A --> E["第四层：治理与流程"]n    B --> B1["多目标奖励"]n    B --> B2["惩罚未知行为"]n    B --> B3["人类否决权"]n    C --> C1["对抗训练"]n    C --> C2["数据溯源验证"]n    C --> C3["差分隐私训练"]n    D --> D1["输出异常度监控"]n    D --> D2["自动降级机制"]n    E --> E1["安全审查委员会"]n    E --> E2["红队测试"]\`

**第一层防御：奖励函数安全设计（Reward Function Security by Design）**`;
  
  const new2 = `body: \`防御奖励劫持需要从**系统设计**的**全生命周期**入手——从**奖励函数的初始设计**到**运行时的持续监控**，每个环节都需要**针对性的安全措施**。

**第一层防御：奖励函数安全设计（Reward Function Security by Design）**`;
  
  const mermaid2 = `            mermaid: \`graph TD
    A["多层防御体系"] --> B["第一层：奖励函数安全设计"]
    A --> C["第二层：奖励模型鲁棒性增强"]
    A --> D["第三层：运行时监控与干预"]
    A --> E["第四层：治理与流程"]
    B --> B1["多目标奖励"]
    B --> B2["惩罚未知行为"]
    B --> B3["人类否决权"]
    C --> C1["对抗训练"]
    C --> C2["数据溯源验证"]
    C --> C3["差分隐私训练"]
    D --> D1["输出异常度监控"]
    D --> D2["自动降级机制"]
    E --> E1["安全审查委员会"]
    E --> E2["红队测试"]\``;
  
  const warning2 = `warning: \`**防御的成本：** 完整的奖励劫持防御体系需要**大量的工程投入和持续维护**。对于一个小型团队来说，实施所有四层防御可能**超出资源能力**。建议从「奖励函数安全设计」和「运行时监控」这两个**性价比最高**的层面开始，逐步扩展到完整体系。\``;
  
  const warning2New = warning2 + `,\n${mermaid2}`;
  
  fixedContent = fixedContent.replace(old2, new2).replace(warning2, warning2New);
  
  // Pattern 3: in blog-124.ts section 4
  const old3 = `body: \`AI 内容农场的危害远不止于「互联网上多了些垃圾文章」。它对**互联网的整个信息生态**产生了**系统性、多层次的侵蚀效应**。
            mermaid: \`graph LR
    A["AI 内容农场批量生成"] --> B["互联网充斥低质量内容"]
    B --> C["AI 公司爬虫抓取训练数据"]
    C --> D["训练数据中 AI 内容比例上升"]
    D --> E["新模型质量下降 Model Collapse"]
    E --> F["用更差模型生成更多内容"]
    F --> A
    B --> G["高质量内容被淹没"]
    G --> H["专家写作动力下降"]
    H --> D\`


**影响一：搜索引擎信任危机（Search Engine Trust Crisis）**`;
  
  const new3 = `body: \`AI 内容农场的危害远不止于「互联网上多了些垃圾文章」。它对**互联网的整个信息生态**产生了**系统性、多层次的侵蚀效应**。


**影响一：搜索引擎信任危机（Search Engine Trust Crisis）**`;
  
  const mermaid3 = `            mermaid: \`graph LR
    A["AI 内容农场批量生成"] --> B["互联网充斥低质量内容"]
    B --> C["AI 公司爬虫抓取训练数据"]
    C --> D["训练数据中 AI 内容比例上升"]
    D --> E["新模型质量下降 Model Collapse"]
    E --> F["用更差模型生成更多内容"]
    F --> A
    B --> G["高质量内容被淹没"]
    G --> H["专家写作动力下降"]
    H --> D\``;
  
  const warning3 = `warning: \`**系统性风险：** 模型崩溃不是「如果发生」的问题，而是「何时发生」的问题。如果不采取措施隔离 AI 生成内容和人类创作内容，整个 AI 行业的进步将受到根本性威胁。这不仅是内容农场的问题，更是整个 AI 生态的生存问题。\``;
  
  const warning3New = warning3 + `,\n${mermaid3}`;
  
  fixedContent = fixedContent.replace(old3, new3).replace(warning3, warning3New);
  
  writeFileSync(filePath, fixedContent);
  console.log(`Fixed ${filePath}`);
  return true;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node fix-mermaid.mjs <file1> [file2] ...');
  process.exit(1);
}

let totalFixed = 0;
for (const file of args) {
  if (fixFile(file)) totalFixed++;
}
console.log(`\nTotal files fixed: ${totalFixed}`);
