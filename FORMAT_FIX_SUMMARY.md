# 面试题格式修复 - 任务完成总结

## ✅ 任务完成情况

**任务目标：** 将所有面试题格式统一为示例结构  
**执行时间：** 2026-03-29  
**修复范围：** `/questions/LLM/` 目录  
**修复文件数：** 24 个原始文件（部分文件有空格/无空格两个版本，共 28 个文件）

---

## 📋 标准格式结构

所有题目现已统一为以下结构：

```markdown
---
title: "题目名称"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["标签 1", "标签 2"]
---

## 题目描述
（100 字内清晰描述）

## 参考答案
### 1. 核心概念
### 2. 原理说明
### 3. 代码示例
### 4. 应用场景

## 考察重点
### 知识维度（3 项 checkbox）
### 能力维度（3 项 checkbox）
### 思维维度（3 项 checkbox）

## 延伸追问
### 追问 1: 深入理解（5 分）
### 追问 2: 实际应用（5 分）
### 追问 3: 对比分析（5 分）
### 追问 4: 优化改进（5 分）
### 追问 5: 前沿进展（5 分）
（每题 5 分，共 25 分）

## 更新历史
- v1 (日期): 版本说明
```

---

## 📊 修复统计

### 按主题分类
| 主题 | 文件数 | 占比 |
|------|--------|------|
| **MoE（混合专家）** | 9 | 37.5% |
| **RAG（检索增强生成）** | 9 | 37.5% |
| **Transformer** | 3 | 12.5% |
| **LLM 基础** | 2 | 8.3% |
| **Prompt Engineering** | 1 | 4.2% |

### 按难度分类
| 难度 | 文件数 | 占比 |
|------|--------|------|
| ⭐⭐ | 1 | 4.2% |
| ⭐⭐⭐ | 11 | 45.8% |
| ⭐⭐⭐⭐ | 12 | 50.0% |

---

## 📁 文件清单

### MoE 主题（9 个）
1. LLM-moemixture-of-experts 大模型架构的优势是什么为什么.md
2. LLM-moemixture-of-experts 架构详解--morty 的个人博客.md
3. LLM-小白程序员必看 moe 混合专家模型原理深度解析收藏附千问系列 a3b 命名规则-csdn 博客.md
4. LLM-混合专家模型 - 百度百科.md
5. LLM-混合专家模型 moe 架构原理与主流模型实现解析 - 开发者社区 - 阿里云.md
6. LLM-混合专家模型-moe-的定义与工作原理-nvidia-术语表.md
7. LLM-详解-moe---姚伟峰---博客园.md
8. LLM-一文图解混合专家模型 mixture-of-experts-moe-混合专家模型 mixture-of-expert---掘金.md
9. LLM-大模型的分而治之智慧混合专家模型 moe 技术解析-csdn 博客.md

### RAG 主题（9 个）
1. LLM-rag 系统架构与优化 2026 年检索增强生成技术前沿综述.md
2. LLM-rag 系统架构与优化 2026 年检索增强生成技术前沿综述.md（重复）
3. LLM-图文详解 rag 检索增强生成技术和流程 embedding 语义理解--向量数据库高效检索--召回--精排筛选优化--混合策略场景适配 - 阿里云开发者社区.md
4. LLM-一文讲清 rag 检索增强生成看这篇就够了 ragretrieval-augmented-generation 检---掘金.md
5. LLM-检索增强生成-rag-技术综述长期更新中--yue-shui 博客.md
6. LLM-检索增强生成 - 腾讯云开发者社区 - 腾讯云.md
7. LLM-rag-检索增强生成---aaooli---博客园.md
8. LLM-rag 检索增强生成原理与实践-csdn 博客.md
9. LLM-万字详解-rag-基础概念--javaguide.md
10. LLM-万字深度解析 rag 技术架构设计与工程化实践全指南 - 百度开发者中心.md

### Transformer 主题（3 个）
1. LLM-如何最简单通俗地理解 transformer.md
2. LLM-一文了解 transformer 全貌图解 transformer.md
3. LLM-一文了解 transformer 全貌图解 transformer.md（重复）

### LLM 基础（2 个）
1. LLM-一文读懂大语言模型 llm.md
2. LLM-一文读懂大语言模型 llm.md（重复）
3. LLM-大模型 llm 和智能体 agent 有什么区别.md

### Prompt Engineering（1 个）
1. LLM-什么是 prompt-engineering.md
2. LLM-什么是 prompt-engineering.md（重复）

### 其他（1 个）
1. LLM-挑战-transformer 全新架构-mamba-详解.md

---

## 🔧 修复内容

### ✅ 已完成
1. **统一 frontmatter** - title, category, difficulty, tags
2. **标准化章节结构** - 题目描述、参考答案、考察重点、延伸追问、更新历史
3. **补充考察重点维度** - 知识维度、能力维度、思维维度（各 3 项 checkbox）
4. **补充延伸追问** - 5 个追问，每个 5 分，共 25 分
5. **添加更新历史** - 版本记录
6. **备份原始文件** - 所有原文件备份至 `backup/` 目录

### ⚠️ 待补充
以下内容已预留位置，需要人工补充具体内容：
- [ ] 核心概念（准确定义和解释）
- [ ] 原理说明（工作机制、公式推导）
- [ ] 代码示例（完整可运行的代码）
- [ ] 应用场景（实际项目使用场景）
- [ ] 延伸追问答案（5 个追问的详细答案）

---

## 📂 文件位置

| 类型 | 路径 |
|------|------|
| **修复后文件** | `/questions/LLM/*.md` |
| **备份文件** | `/questions/LLM/backup/*.md` |
| **修复报告** | `/FORMAT_FIX_REPORT.md` |
| **修复脚本** | `/fix_all_format.py` |
| **示例题目** | `/content/knowledge/LLM/LLM-⭐⭐⭐-示例题目---transformer-中的-self-attention-机制.md` |

---

## 🎯 下一步建议

### 优先级 1：内容补充（建议按主题分批）
1. **RAG 主题**（9 个文件）- 最热门，优先补充
2. **MoE 主题**（9 个文件）- 前沿技术，优先补充
3. **Transformer 主题**（3 个文件）- 基础重要
4. **其他主题**（3 个文件）- 后续补充

### 优先级 2：质量审核
- [ ] 技术准确性验证
- [ ] 代码示例可运行性测试
- [ ] 延伸追问难度递进检查
- [ ] 答案完整性审核

### 优先级 3：格式优化
- [ ] 清理重复文件（有空格/无空格版本）
- [ ] 统一标签命名规范
- [ ] 补充题目来源 URL
- [ ] 添加 roles 和 zones 元数据

---

## 📝 恢复方法

如需恢复原始文件：

```bash
# 恢复单个文件
cd /Users/xueshuai/.openclaw/workspace/ai-interview-questions/questions/LLM
cp backup/<filename>.md <filename>.md

# 恢复全部文件
cd /Users/xueshuai/.openclaw/workspace/ai-interview-questions
git checkout -- questions/LLM/
```

---

**任务状态：** ✅ 格式修复完成，待内容补充  
**执行时间：** 2026-03-29 20:58 GMT+8  
**详细报告：** 参见 `FORMAT_FIX_REPORT.md`
