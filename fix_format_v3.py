#!/usr/bin/env python3
"""
面试题格式修复脚本 v3
将所有面试题格式统一为标准结构
"""

import os
import re
from pathlib import Path

QUESTIONS_DIR = "/Users/xueshuai/.openclaw/workspace/ai-interview-questions/questions/LLM"

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def parse_frontmatter(content):
    match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if match:
        fm_text = match.group(1)
        body = content[match.end():]
        fm = {}
        for line in fm_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                value = value.strip()
                # 清理引号和方括号
                if value.startswith('[') and value.endswith(']'):
                    pass  # 保持数组格式
                else:
                    value = value.strip('"\'')
                fm[key.strip()] = value
        return fm, body
    return {}, content

def extract_section(body, section_name):
    pattern = rf'^## {section_name}\s*\n(.*?)(?=^## |\Z)'
    match = re.search(pattern, body, re.MULTILINE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

def extract_followup_questions(body):
    followups = []
    # 匹配 ### 追问 X: 主题 或 ### 追问 X: 主题（N 分）
    pattern = r'^### 追问 (\d+):?\s*([^(]+?)(?:（(\d+) 分）)?\s*\n\*\*问题：\*\*\s*(.*?)\*\*答案：\*\*\s*(.*?)(?=^### |\Z)'
    matches = re.findall(pattern, body, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        num, topic, score, question, answer = match
        followups.append({
            'num': int(num),
            'topic': topic.strip(),
            'score': score if score else '5',
            'question': question.strip(),
            'answer': answer.strip()
        })
    
    return followups

def extract_checkpoints(body):
    checkpoints = extract_section(body, '考察重点')
    # 移除已经格式化的维度标题
    checkpoints = re.sub(r'^### 知识维度\s*', '', checkpoints, flags=re.MULTILINE)
    checkpoints = re.sub(r'^### 能力维度\s*', '', checkpoints, flags=re.MULTILINE)
    checkpoints = re.sub(r'^### 思维维度\s*', '', checkpoints, flags=re.MULTILINE)
    # 提取所有列表项
    items = re.findall(r'^[-*]\s*\[?\s*\]?\s*(.+?)\s*$', checkpoints, re.MULTILINE)
    return [item.strip() for item in items if item.strip() and not item.startswith('#')]

def format_checkpoints(items):
    knowledge = []
    ability = []
    thinking = []
    
    for item in items:
        item = item.strip()
        if not item:
            continue
        
        # 根据内容分类
        if any(kw in item for kw in ['理解', '概念', '原理', '定义', '知识', '掌握', '机制', '基础']):
            knowledge.append(item)
        elif any(kw in item for kw in ['能够', '应用', '实现', '代码', '使用', '设计', '分析', '解决', '能力']):
            ability.append(item)
        else:
            thinking.append(item)
    
    # 确保每个维度至少有内容
    if not knowledge:
        knowledge = ["理解核心概念"]
    if not ability:
        ability = ["能够应用相关知识"]
    if not thinking:
        thinking = ["理解技术优劣"]
    
    return {
        'knowledge': knowledge[:3],
        'ability': ability[:3],
        'thinking': thinking[:2]
    }

def rebuild_content(fm, body, filename):
    # 提取基础信息
    title = fm.get('title', filename.replace('.md', '').replace('LLM-', ''))
    category = fm.get('category', 'LLM')
    difficulty = fm.get('difficulty', '⭐⭐⭐')
    tags_str = fm.get('tags', '[]')
    
    # 解析 tags
    if tags_str.startswith('[') and tags_str.endswith(']'):
        tags_content = tags_str[1:-1]
        tags = [t.strip().strip('"\'') for t in tags_content.split(',') if t.strip()]
    else:
        tags = [tags_str]
    
    # 提取内容
    desc = extract_section(body, '题目描述')
    desc = re.sub(r'\*\*标签：\*\*.*?\n', '', desc).strip()
    desc = re.sub(r'^标签：.*?\n', '', desc, flags=re.MULTILINE).strip()
    desc = re.sub(r'^\*\*来源：\*\*.*?\n', '', desc, flags=re.MULTILINE).strip()
    desc = re.sub(r'^来源：.*?\n', '', desc, flags=re.MULTILINE).strip()
    
    answer = extract_section(body, '参考答案')
    
    # 提取考察重点
    cp_items = extract_checkpoints(body)
    cp_formatted = format_checkpoints(cp_items)
    
    # 提取延伸追问
    followups = extract_followup_questions(body)
    
    # 构建新内容
    tags_list = ', '.join([f'"{t}"' for t in tags[:5]])
    
    new_content = f'''---
title: "{title}"
category: "{category}"
difficulty: "{difficulty}"
tags: [{tags_list}]
---

## 题目描述
{desc}

## 参考答案
{answer}

## 考察重点

### 知识维度
'''
    
    for cp in cp_formatted['knowledge']:
        new_content += f'- [ ] {cp}\n'
    
    new_content += '\n### 能力维度\n'
    for cp in cp_formatted['ability']:
        new_content += f'- [ ] {cp}\n'
    
    new_content += '\n### 思维维度\n'
    for cp in cp_formatted['thinking']:
        new_content += f'- [ ] {cp}\n'
    
    new_content += '\n## 延伸追问\n'
    
    topics = ["深入理解", "实际应用", "对比分析", "优化改进", "前沿进展"]
    for i, fu in enumerate(followups[:5]):
        topic = fu['topic'] if fu['topic'] and not fu['topic'].startswith('追问') else topics[i] if i < len(topics) else f"追问{i+1}"
        score = fu['score'] if fu['score'] else '5'
        new_content += f'''
### 追问 {i+1}: {topic}（{score}分）
**问题：** {fu['question']}

**答案：** {fu['answer']}
'''
    
    # 如果追问不足 5 个，补充
    for i in range(len(followups), 5):
        topic = topics[i]
        new_content += f'''
### 追问 {i+1}: {topic}（5 分）
**问题：** （待补充）

**答案：** （待补充）
'''
    
    new_content += '''
## 更新历史
- v1 (2026-03-29): 格式标准化修复
'''
    
    return new_content

def fix_file(filepath):
    filename = os.path.basename(filepath)
    print(f"处理：{filename}")
    
    try:
        content = read_file(filepath)
        fm, body = parse_frontmatter(content)
        
        if not fm:
            print(f"  ⚠️  无 frontmatter，跳过")
            return False
        
        new_content = rebuild_content(fm, body, filename)
        write_file(filepath, new_content)
        print(f"  ✅ 修复完成")
        return True
    except Exception as e:
        print(f"  ❌ 错误：{e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 60)
    print("面试题格式修复脚本 v3")
    print("=" * 60)
    
    files = []
    for f in os.listdir(QUESTIONS_DIR):
        if f.endswith('.md') and not f.endswith('.bak'):
            files.append(os.path.join(QUESTIONS_DIR, f))
    
    print(f"\n找到 {len(files)} 个文件\n")
    
    success = 0
    for filepath in sorted(files):
        if fix_file(filepath):
            success += 1
    
    print(f"\n{'=' * 60}")
    print(f"修复完成：{success}/{len(files)}")
    print(f"{'=' * 60}")

if __name__ == '__main__':
    main()
