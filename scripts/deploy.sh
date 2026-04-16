#!/bin/bash
# 自动更新首页内容时间戳，然后执行 git commit + push
# 用法：./scripts/deploy.sh "commit message"

MESSAGE=${1:-"update: 内容更新"}

# 使用统一的生成脚本更新时间
node scripts/generate-update-time.mjs

# git add + commit + push
git add -A
git commit -m "${MESSAGE}"
git push

echo "✅ 提交并推送完成"
