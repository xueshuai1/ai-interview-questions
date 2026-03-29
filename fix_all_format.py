#!/usr/bin/env python3
"""
面试题格式批量修复脚本
将所有题目格式统一为标准结构
"""

import os
import re
from pathlib import Path
from datetime import datetime

QUESTIONS_DIR = "/Users/xueshuai/.openclaw/workspace/ai-interview-questions/questions/LLM"
BACKUP_DIR = "/Users/xueshuai/.openclaw/workspace/ai-interview-questions/questions/LLM/backup"

# 标准模板
STANDARD_TEMPLATE = '''---
title: "{title}"
category: "LLM"
difficulty: "{difficulty}"
tags: {tags}
---

## 题目描述
{description}

## 参考答案

### 1. 核心概念
{core_concept}

### 2. 原理说明
{principle}

### 3. 代码示例
{code_example}

### 4. 应用场景
{application}

## 考察重点

### 知识维度
- [ ] 理解{topic}的核心概念
- [ ] 掌握{topic}的基本原理
- [ ] 了解{topic}的发展脉络

### 能力维度
- [ ] 能够手写{topic}相关代码
- [ ] 能够分析{topic}的优缺点
- [ ] 能够在实际项目中应用{topic}

### 思维维度
- [ ] 理解为什么需要{topic}
- [ ] 能够对比{topic}与其他方案的优劣
- [ ] 能够评估{topic}的适用场景

## 延伸追问

### 追问 1: 深入理解（5 分）
**问题：** {topic}的核心原理是什么？关键公式/机制是什么？

**答案：**
（详细答案，包含公式推导或机制说明）

### 追问 2: 实际应用（5 分）
**问题：** 在实际项目中如何应用{topic}？有哪些典型场景？

**答案：**
（详细答案，包含具体应用场景和实现方式）

### 追问 3: 对比分析（5 分）
**问题：** {topic}与相关技术相比有什么优劣？

**答案：**
（详细答案，包含对比表格或分析）

### 追问 4: 优化改进（5 分）
**问题：** {topic}存在哪些问题？如何优化改进？

**答案：**
（详细答案，包含优化方案和实现思路）

### 追问 5: 前沿进展（5 分）
**问题：** 2025-2026 年{topic}领域有哪些重要进展？

**答案：**
（详细答案，包含最新研究进展和趋势）

## 更新历史
- v1 ({date}): 初始版本（按标准格式重写）
'''

def extract_title(filepath):
    """从文件名提取题目"""
    name = os.path.basename(filepath)
    # 移除 LLM-前缀和.md 后缀
    name = re.sub(r'^LLM-', '', name)
    name = re.sub(r'\.md$', '', name)
    # 清理常见后缀
    name = re.sub(r'-.*博客.*$', '', name)
    name = re.sub(r'-.*博客园.*$', '', name)
    name = re.sub(r'-.*掘金.*$', '', name)
    name = re.sub(r'-.*csdn.*$', '', name)
    name = re.sub(r'-.*百度.*$', '', name)
    name = re.sub(r'-.*腾讯.*$', '', name)
    name = re.sub(r'-.*阿里云.*$', '', name)
    name = re.sub(r'-.*nvidia.*$', '', name)
    name = re.sub(r'-.*百度百科.*$', '', name)
    return name.strip('- ').replace('-', ' ')

def extract_difficulty(content):
    """从内容提取难度"""
    match = re.search(r'difficulty:\s*["\']?(⭐+)["\']?', content)
    if match:
        return match.group(1)
    return "⭐⭐⭐"

def extract_tags(content):
    """从内容提取标签"""
    match = re.search(r'tags:\s*\[([^\]]+)\]', content)
    if match:
        tags_str = match.group(1)
        tags = [t.strip().strip('"\'') for t in tags_str.split(',')]
        return tags
    return ["LLM"]

def extract_description(content):
    """从内容提取题目描述"""
    match = re.search(r'##\s*题目描述\s*\n(.*?)(?=##|\*\*标签|\Z)', content, re.DOTALL)
    if match:
        desc = match.group(1).strip()
        # 移除标签行
        desc = re.sub(r'\*\*标签：.*', '', desc)
        return desc[:200]  # 限制长度
    return "请详细解释相关概念和原理。"

def create_backup(filepath):
    """创建备份"""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    backup_path = os.path.join(BACKUP_DIR, os.path.basename(filepath))
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return backup_path

def fix_file(filepath):
    """修复单个文件"""
    print(f"处理：{os.path.basename(filepath)}")
    
    # 读取原文件
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取信息
    title = extract_title(filepath)
    difficulty = extract_difficulty(content)
    tags = extract_tags(content)
    description = extract_description(content)
    topic = title.split()[0] if title.split() else "该主题"
    date = datetime.now().strftime("%Y-%m-%d")
    
    # 生成标准格式内容
    new_content = STANDARD_TEMPLATE.format(
        title=title,
        difficulty=difficulty,
        tags=tags,
        description=description,
        core_concept=f"（待补充{topic}的准确定义和核心概念）",
        principle=f"（待补充{topic}的工作原理和机制说明）",
        code_example=f"```python\n# TODO: 添加{topic}相关代码示例\npass\n```",
        application=f"（待补充{topic}的实际应用场景）",
        topic=topic,
        date=date
    )
    
    # 创建备份
    create_backup(filepath)
    
    # 写入新内容
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  ✓ 已修复，备份至：{BACKUP_DIR}/")
    return True

def main():
    """主函数"""
    print("=" * 60)
    print("面试题格式批量修复脚本")
    print("=" * 60)
    
    # 获取所有 MD 文件
    md_files = list(Path(QUESTIONS_DIR).glob("*.md"))
    print(f"\n找到 {len(md_files)} 个文件需要修复\n")
    
    # 修复每个文件
    success_count = 0
    for filepath in md_files:
        try:
            if fix_file(str(filepath)):
                success_count += 1
        except Exception as e:
            print(f"  ✗ 处理失败：{e}")
    
    print(f"\n{'=' * 60}")
    print(f"修复完成！成功：{success_count}/{len(md_files)}")
    print(f"备份目录：{BACKUP_DIR}")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
