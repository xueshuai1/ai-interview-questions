#!/bin/bash
# 面试题目清理脚本
# 1. 删除 source/sourceUrl/createdAt 字段
# 2. 删除"来源："行
# 3. 删除"待完善"内容
# 4. 删除"更新历史"部分

QUESTIONS_DIR="/Users/xueshuai/.openclaw/workspace/ai-interview-questions/questions"

cd "$QUESTIONS_DIR"

for file in $(find . -name "*.md" -type f); do
    echo "Processing: $file"
    
    # 创建临时文件
    temp_file=$(mktemp)
    
    # 处理文件内容
    cat "$file" | \
        grep -v "^source:" | \
        grep -v "^sourceUrl:" | \
        grep -v "^createdAt:" | \
        grep -v "^collectedAt:" | \
        grep -v "^\*\*来源：\*\*" | \
        grep -v "（待完善 - 需要人工审核补充）" | \
        grep -v "（待补充）" | \
        grep -v "^## 更新历史" | \
        grep -v "^- v1" \
        > "$temp_file"
    
    # 替换原文件
    mv "$temp_file" "$file"
done

echo "Cleanup complete!"
