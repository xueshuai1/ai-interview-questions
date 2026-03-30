#!/bin/bash

# 文章管理工具脚本
# 用法：./scripts/article-tools.sh <命令> [参数]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONTENT_DIR="$PROJECT_ROOT/content/knowledge"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印帮助信息
print_help() {
  echo -e "${BLUE}AI 知识库文章管理工具${NC}"
  echo ""
  echo "用法：$0 <命令> [参数]"
  echo ""
  echo "命令:"
  echo "  create <分类> <标题> <编号>  创建新文章"
  echo "  update <文件路径>            更新文章（自动更新时间）"
  echo "  stats                        显示文章统计"
  echo "  check                        检查文章质量"
  echo "  changelog <文件路径>         添加更新日志"
  echo "  archive <文件路径>           归档文章"
  echo "  help                         显示帮助信息"
  echo ""
  echo "示例:"
  echo "  $0 create LLM \"Self-Attention\" 002"
  echo "  $0 update content/knowledge/LLM/001_Transformer.md"
  echo "  $0 stats"
  echo "  $0 check"
}

# 创建新文章
create_article() {
  local CATEGORY=$1
  local TITLE=$2
  local NUMBER=$3
  
  if [ -z "$CATEGORY" ] || [ -z "$TITLE" ] || [ -z "$NUMBER" ]; then
    echo -e "${RED}❌ 错误：缺少参数${NC}"
    echo "用法：$0 create <分类> <标题> <编号>"
    echo "示例：$0 create LLM \"Self-Attention\" 002"
    exit 1
  fi
  
  local FILE="$CONTENT_DIR/$CATEGORY/${NUMBER}_${TITLE}.md"
  local DATE=$(date +%Y-%m-%d)
  
  # 检查分类是否存在
  if [ ! -d "$CONTENT_DIR/$CATEGORY" ]; then
    echo -e "${YELLOW}⚠️  分类目录不存在，正在创建：$CONTENT_DIR/$CATEGORY${NC}"
    mkdir -p "$CONTENT_DIR/$CATEGORY"
  fi
  
  # 检查文件是否已存在
  if [ -f "$FILE" ]; then
    echo -e "${RED}❌ 错误：文件已存在：$FILE${NC}"
    exit 1
  fi
  
  # 创建文章模板
  cat > "$FILE" << EOF
# $TITLE

> **分类**: $(get_category_name $CATEGORY) | **编号**: ${CATEGORY}-${NUMBER} | **更新时间**: ${DATE} | **难度**: ⭐⭐⭐
> **版本**: v1.0 | **作者**: AI Team | **审核状态**: ⏳

\`$TITLE\` \`$CATEGORY\` \`深度学习\`

**摘要**: 50-100 字的摘要内容，简要介绍文章的核心内容和价值...

---

## 更新日志

- **v1.0** (${DATE}) - 初始版本

---

## 一、核心概念

### 1.1 什么是 $TITLE

[在此处编写内容]

---

**下一篇**: [下一篇文章](./$(printf "%03d" $((10#$NUMBER + 1)))_Next_Article)

**上一篇**: [返回目录](../README.md)
EOF
  
  echo -e "${GREEN}✅ 文章模板已创建：$FILE${NC}"
  echo ""
  echo -e "${YELLOW}📝 下一步:${NC}"
  echo "1. 编辑文件添加内容：vim $FILE"
  echo "2. 提交并推送："
  echo "   git add -A"
  echo "   git commit -m \"docs: 新增 $TITLE 文章\""
  echo "   git push origin main"
}

# 获取分类名称
get_category_name() {
  case $1 in
    LLM) echo "大语言模型" ;;
    ML) echo "机器学习基础" ;;
    DL) echo "深度学习" ;;
    NLP) echo "自然语言处理" ;;
    CV) echo "计算机视觉" ;;
    RecSys) echo "推荐系统" ;;
    RL) echo "强化学习" ;;
    System) echo "AI 工程化" ;;
    *) echo $1 ;;
  esac
}

# 更新文章
update_article() {
  local FILE=$1
  
  if [ -z "$FILE" ]; then
    echo -e "${RED}❌ 错误：缺少文件路径${NC}"
    echo "用法：$0 update <文件路径>"
    exit 1
  fi
  
  if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ 错误：文件不存在：$FILE${NC}"
    exit 1
  fi
  
  local DATE=$(date +%Y-%m-%d)
  
  # 更新更新时间
  sed -i "s/\*\*更新时间\*\*:[^|]*/\*\*更新时间\*\*: ${DATE}/" "$FILE"
  
  # 获取当前版本
  local CURRENT_VERSION=$(grep "\*\*版本\*\*:" "$FILE" | grep -oP 'v\K[0-9]+\.[0-9]+' | head -1)
  
  if [ -n "$CURRENT_VERSION" ]; then
    # 增加版本号（次版本）
    local MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1)
    local MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)
    local NEW_VERSION="${MAJOR}.$((MINOR + 1))"
    
    sed -i "s/\*\*版本\*\*: v${CURRENT_VERSION}/\*\*版本\*\*: v${NEW_VERSION}/" "$FILE"
    
    echo -e "${GREEN}✅ 文章已更新：$FILE${NC}"
    echo "   版本：v${CURRENT_VERSION} → v${NEW_VERSION}"
    echo "   更新时间：${DATE}"
  else
    echo -e "${YELLOW}⚠️  未找到版本号，请手动添加${NC}"
  fi
}

# 显示统计信息
show_stats() {
  echo -e "${BLUE}=== AI 知识库文章统计 ===${NC}"
  echo ""
  
  # 总计
  local TOTAL=$(find "$CONTENT_DIR" -name "*.md" | wc -l)
  echo -e "📚 文章总数：${GREEN}$TOTAL${NC}"
  echo ""
  
  # 按分类统计
  echo -e "${BLUE}📊 按分类统计:${NC}"
  for dir in "$CONTENT_DIR"/*/; do
    if [ -d "$dir" ]; then
      local CATEGORY=$(basename "$dir")
      local COUNT=$(find "$dir" -name "*.md" | wc -l)
      local CATEGORY_NAME=$(get_category_name $CATEGORY)
      echo -e "  - ${CATEGORY_NAME} (${CATEGORY}): ${GREEN}$COUNT${NC} 篇"
    fi
  done
  echo ""
  
  # 按版本统计
  echo -e "${BLUE}🔄 版本分布:${NC}"
  local V1=$(grep -r "\*\*版本\*\*: v1" "$CONTENT_DIR" 2>/dev/null | wc -l)
  local V2=$(grep -r "\*\*版本\*\*: v2" "$CONTENT_DIR" 2>/dev/null | wc -l)
  local V3=$(grep -r "\*\*版本\*\*: v3" "$CONTENT_DIR" 2>/dev/null | wc -l)
  echo -e "  - v1.x: ${GREEN}$V1${NC} 篇"
  echo -e "  - v2.x: ${GREEN}$V2${NC} 篇"
  echo -e "  - v3.x: ${GREEN}$V3${NC} 篇"
  echo ""
  
  # 最近更新
  echo -e "${BLUE}🕐 最近 7 天更新:${NC}"
  find "$CONTENT_DIR" -name "*.md" -mtime -7 -exec basename {} \; 2>/dev/null | head -10
  echo ""
  
  # 质量统计
  echo -e "${BLUE}📝 质量检查:${NC}"
  local WITH_CHANGELOG=$(grep -r "## 更新日志" "$CONTENT_DIR" 2>/dev/null | wc -l)
  local WITH_VERSION=$(grep -r "\*\*版本\*\*:" "$CONTENT_DIR" 2>/dev/null | wc -l)
  local WITH_UPDATE=$(grep -r "\*\*更新时间\*\*:" "$CONTENT_DIR" 2>/dev/null | wc -l)
  
  local CHANGELOG_PCT=$((WITH_CHANGELOG * 100 / TOTAL))
  local VERSION_PCT=$((WITH_VERSION * 100 / TOTAL))
  local UPDATE_PCT=$((WITH_UPDATE * 100 / TOTAL))
  
  echo -e "  - 有更新日志：${GREEN}$WITH_CHANGELOG/$TOTAL ($CHANGELOG_PCT%)${NC}"
  echo -e "  - 有版本号：${GREEN}$WITH_VERSION/$TOTAL ($VERSION_PCT%)${NC}"
  echo -e "  - 有更新时间：${GREEN}$WITH_UPDATE/$TOTAL ($UPDATE_PCT%)${NC}"
}

# 检查文章质量
check_quality() {
  echo -e "${BLUE}=== 文章质量检查 ===${NC}"
  echo ""
  
  local ERRORS=0
  local WARNINGS=0
  
  for file in $(find "$CONTENT_DIR" -name "*.md"); do
    local HAS_TITLE=$(grep -c "^# " "$file" 2>/dev/null || echo 0)
    local HAS_CATEGORY=$(grep -c "\*\*分类\*\*:" "$file" 2>/dev/null || echo 0)
    local HAS_UPDATE=$(grep -c "\*\*更新时间\*\*:" "$file" 2>/dev/null || echo 0)
    local HAS_VERSION=$(grep -c "\*\*版本\*\*:" "$file" 2>/dev/null || echo 0)
    local HAS_CHANGELOG=$(grep -c "## 更新日志" "$file" 2>/dev/null || echo 0)
    
    if [ $HAS_TITLE -eq 0 ]; then
      echo -e "${RED}❌ $file: 缺少标题${NC}"
      ((ERRORS++))
    fi
    
    if [ $HAS_CATEGORY -eq 0 ]; then
      echo -e "${RED}❌ $file: 缺少分类信息${NC}"
      ((ERRORS++))
    fi
    
    if [ $HAS_UPDATE -eq 0 ]; then
      echo -e "${RED}❌ $file: 缺少更新时间${NC}"
      ((ERRORS++))
    fi
    
    if [ $HAS_VERSION -eq 0 ]; then
      echo -e "${YELLOW}⚠️  $file: 缺少版本号${NC}"
      ((WARNINGS++))
    fi
    
    if [ $HAS_CHANGELOG -eq 0 ]; then
      echo -e "${YELLOW}⚠️  $file: 缺少更新日志${NC}"
      ((WARNINGS++))
    fi
  done
  
  echo ""
  echo -e "${BLUE}检查结果:${NC}"
  echo -e "  - 错误：${RED}$ERRORS${NC}"
  echo -e "  - 警告：${YELLOW}$WARNINGS${NC}"
  
  if [ $ERRORS -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ 检查失败，请修复错误后重新提交${NC}"
    exit 1
  else
    echo ""
    echo -e "${GREEN}✅ 检查通过！${NC}"
  fi
}

# 添加更新日志
add_changelog() {
  local FILE=$1
  local MESSAGE=$2
  
  if [ -z "$FILE" ]; then
    echo -e "${RED}❌ 错误：缺少文件路径${NC}"
    echo "用法：$0 changelog <文件路径> [更新信息]"
    exit 1
  fi
  
  if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ 错误：文件不存在：$FILE${NC}"
    exit 1
  fi
  
  local DATE=$(date +%Y-%m-%d)
  local VERSION=$(grep "\*\*版本\*\*:" "$FILE" | grep -oP 'v\K[0-9]+\.[0-9]+' | head -1)
  
  if [ -z "$VERSION" ]; then
    VERSION="1.0"
  fi
  
  # 更新日志条目
  local CHANGELOG_ENTRY="- **v${VERSION}** (${DATE}) - ${MESSAGE:-更新内容}"
  
  # 在更新日志部分后添加
  if grep -q "## 更新日志" "$FILE"; then
    # 找到更新日志部分，在第一行后插入
    sed -i "/## 更新日志/a\\$CHANGELOG_ENTRY" "$FILE"
  else
    # 添加更新日志部分
    cat >> "$FILE" << EOF

---

## 更新日志

$CHANGELOG_ENTRY
EOF
  fi
  
  echo -e "${GREEN}✅ 已添加更新日志：$FILE${NC}"
  echo "   版本：v${VERSION}"
  echo "   日期：${DATE}"
  echo "   内容：${MESSAGE:-更新内容}"
}

# 归档文章
archive_article() {
  local FILE=$1
  
  if [ -z "$FILE" ]; then
    echo -e "${RED}❌ 错误：缺少文件路径${NC}"
    echo "用法：$0 archive <文件路径>"
    exit 1
  fi
  
  if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ 错误：文件不存在：$FILE${NC}"
    exit 1
  fi
  
  local ARCHIVE_DIR="$PROJECT_ROOT/content/.archived"
  mkdir -p "$ARCHIVE_DIR"
  
  # 移动文件到归档目录
  local BASENAME=$(basename "$FILE")
  mv "$FILE" "$ARCHIVE_DIR/$BASENAME"
  
  echo -e "${GREEN}✅ 文章已归档：$ARCHIVE_DIR/$BASENAME${NC}"
  echo ""
  echo -e "${YELLOW}📝 下一步:${NC}"
  echo "git add -A"
  echo "git commit -m \"docs: 归档文章 $BASENAME\""
  echo "git push origin main"
}

# 主函数
case "${1:-help}" in
  create)
    create_article "$2" "$3" "$4"
    ;;
  update)
    update_article "$2"
    ;;
  stats)
    show_stats
    ;;
  check)
    check_quality
    ;;
  changelog)
    add_changelog "$2" "$3"
    ;;
  archive)
    archive_article "$2"
    ;;
  help|--help|-h)
    print_help
    ;;
  *)
    echo -e "${RED}❌ 未知命令：$1${NC}"
    print_help
    exit 1
    ;;
esac
