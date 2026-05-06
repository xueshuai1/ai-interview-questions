import { readFileSync, writeFileSync } from 'fs';

const blogFile = 'src/data/blogs/blog-124.ts';
let content = readFileSync(blogFile, 'utf8');

// The mermaid block is embedded inside body template literal in section 4
// Need to: 1) remove from body 2) add as separate property after warning

const oldBody = `body: \`AI 内容农场的危害远不止于「互联网上多了些垃圾文章」。它对**互联网的整个信息生态**产生了**系统性、多层次的侵蚀效应**。
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

const newBody = `body: \`AI 内容农场的危害远不止于「互联网上多了些垃圾文章」。它对**互联网的整个信息生态**产生了**系统性、多层次的侵蚀效应**。


**影响一：搜索引擎信任危机（Search Engine Trust Crisis）**`;

content = content.replace(oldBody, newBody);

// Now add mermaid as separate property after the warning in section 4
const oldWarning4 = `warning: \`**系统性风险：** 模型崩溃不是「如果发生」的问题，而是「何时发生」的问题。如果不采取措施隔离 AI 生成内容和人类创作内容，整个 AI 行业的进步将受到根本性威胁。这不仅是内容农场的问题，更是整个 AI 生态的生存问题。\`
    },`;

const newWarning4 = `warning: \`**系统性风险：** 模型崩溃不是「如果发生」的问题，而是「何时发生」的问题。如果不采取措施隔离 AI 生成内容和人类创作内容，整个 AI 行业的进步将受到根本性威胁。这不仅是内容农场的问题，更是整个 AI 生态的生存问题。\`,
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
    },`;

content = content.replace(oldWarning4, newWarning4);

writeFileSync(blogFile, content);
console.log('Fixed blog-124.ts');
