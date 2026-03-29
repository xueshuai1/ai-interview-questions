#!/bin/bash
# LLM 面试题目清理脚本
# 1. 删除 source/sourceUrl 字段
# 2. 删除"来源："行
# 3. 删除"待完善"内容

cd /Users/xueshuai/.openclaw/workspace/ai-interview-questions/questions/LLM

for file in *.md; do
    echo "Processing: $file"
    
    # 创建临时文件
    temp_file=$(mktemp)
    
    # 处理文件内容
    cat "$file" | \
        # 删除 source 行
        grep -v "^source:" | \
        grep -v "^sourceUrl:" | \
        grep -v "^collectedAt:" | \
        grep -v "^\*\*来源：\*\*" | \
        grep -v "（待完善 - 需要人工审核补充）" | \
        grep -v "（待补充）" \
        > "$temp_file"
    
    # 替换原文件
    mv "$temp_file" "$file"
done

echo "Cleanup complete!"
