#!/usr/bin/env python3
"""
知识库完整性检查脚本
检查项：
1. 文件数 = import 数 = 数组条目数
2. 没有遗漏的文件
3. 没有重复的条目
"""
import re
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
KNOWLEDGE_FILE = os.path.join(SCRIPT_DIR, 'src/data/knowledge.ts')
ARTICLES_DIR = os.path.join(SCRIPT_DIR, 'src/data/articles')

def check():
    errors = []
    warnings = []

    # 1. 检查所有 .ts 文件
    files = sorted([f[:-3] for f in os.listdir(ARTICLES_DIR) if f.endswith('.ts') and not f.startswith('_')])
    print(f"📁 文章文件数: {len(files)}")

    # 2. 检查 knowledge.ts
    with open(KNOWLEDGE_FILE) as f:
        content = f.read()

    # 提取所有 import
    imports = re.findall(r"import { article as (\w+) } from './articles/([^']+)'", content)
    import_names = set(name for name, _ in imports)
    import_modules = {mod: name for name, mod in imports}
    print(f"📥 import 数量: {len(imports)}")

    # 提取 articles 数组
    match = re.search(r'export const articles.*?\[([^\]]+)\]', content, re.DOTALL)
    if not match:
        print("❌ 未找到 articles 数组")
        return 1
    entries = re.findall(r'(\w+)', match.group(1))
    print(f"📋 数组条目数: {len(entries)}")

    # 3. 检查 import 和文件是否对应
    files_set = set(files)
    imported_set = set(mod for _, mod in imports)

    # 文件存在但没 import
    missing_imports = files_set - imported_set
    if missing_imports:
        for f in sorted(missing_imports):
            errors.append(f"文件存在但未 import: {f}")

    # import 但文件不存在
    for mod, name in imports:
        if mod not in files_set:
            errors.append(f"import 了不存在的文件: {mod} ({name})")

    # 4. 检查 import 是否在数组中
    entries_set = set(entries)
    missing_from_array = import_names - entries_set
    if missing_from_array:
        for name in sorted(missing_from_array):
            errors.append(f"已 import 但未加入数组: {name}")

    # 5. 检查重复
    from collections import Counter
    c = Counter(entries)
    duplicates = {k: v for k, v in c.items() if v > 1}
    if duplicates:
        for name, count in duplicates.items():
            errors.append(f"数组中重复 {count} 次: {name}")

    # 6. 总结
    print()
    if errors:
        print(f"❌ 发现 {len(errors)} 个问题:")
        for e in errors:
            print(f"   - {e}")
        return 1
    elif warnings:
        print(f"⚠️ 发现 {len(warnings)} 个警告:")
        for w in warnings:
            print(f"   - {w}")
        return 0
    else:
        print(f"✅ 知识库完整性检查通过！({len(files)} 篇文章，无遗漏无重复)")
        return 0

if __name__ == '__main__':
    sys.exit(check())
