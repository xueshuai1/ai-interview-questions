#!/usr/bin/env python3
"""
技术文档质量评估与整理脚本

按照 10 个维度（100 分制）评估收集到的技术文档：
1. 问题定义（10 分）
2. 核心概念（10 分）
3. 使用示例（15 分）
4. 实践指南（15 分）
5. 对比分析（10 分）
6. 深度适中（10 分）
7. 结构清晰（10 分）
8. 图表辅助（10 分）
9. 时效性（5 分）
10. 来源可靠（5 分）

评分决策：
- 90-100 分：优秀，直接采用
- 70-89 分：良好，补充后采用
- 50-69 分：一般，需要大量补充
- <50 分：较差，不建议采用

使用：python3 scripts/evaluate-quality.py
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# ============ 质量评估标准 ============

QUALITY_STANDARDS = {
    "problem_definition": {"name": "问题定义", "max_score": 10},
    "core_concepts": {"name": "核心概念", "max_score": 10},
    "code_examples": {"name": "使用示例", "max_score": 15},
    "practical_guide": {"name": "实践指南", "max_score": 15},
    "comparison": {"name": "对比分析", "max_score": 10},
    "depth": {"name": "深度适中", "max_score": 10},
    "structure": {"name": "结构清晰", "max_score": 10},
    "visuals": {"name": "图表辅助", "max_score": 10},
    "timeliness": {"name": "时效性", "max_score": 5},
    "source_reliability": {"name": "来源可靠", "max_score": 5},
}

# ============ 评估函数 ============

def evaluate_problem_definition(content: str) -> int:
    """评估问题定义（10 分）"""
    score = 0
    
    # 检查是否说明技术背景
    if any(kw in content.lower() for kw in ['background', 'context', '为什么', '背景', '场景']):
        score += 3
    
    # 检查是否说明解决的痛点
    if any(kw in content.lower() for kw in ['problem', 'challenge', '痛点', '问题', '解决']):
        score += 3
    
    # 检查是否有应用场景
    if any(kw in content.lower() for kw in ['application', 'use case', '应用', '场景']):
        score += 2
    
    # 检查是否有与旧方案对比
    if any(kw in content.lower() for kw in ['vs', 'compared to', '相比', '传统']):
        score += 2
    
    return min(score, 10)

def evaluate_core_concepts(content: str) -> int:
    """评估核心概念（10 分）"""
    score = 0
    
    # 检查是否有术语定义
    if re.search(r'(是指 | 定义为 | means|refers to|definition)', content, re.IGNORECASE):
        score += 3
    
    # 检查是否有原理讲解
    if re.search(r'(原理 | 机制 | 如何工作 | how it works|principle)', content, re.IGNORECASE):
        score += 3
    
    # 检查是否有类比或图示
    if re.search(r'(如图 | 如下 | 如下 图 | as shown|like|类似)', content, re.IGNORECASE):
        score += 2
    
    # 检查是否有公式（可选）
    if re.search(r'[a-zA-Z]\s*=\s*[a-zA-Z]', content):
        score += 2
    
    return min(score, 10)

def evaluate_code_examples(content: str) -> int:
    """评估使用示例（15 分）"""
    score = 0
    
    # 检查是否有代码块
    code_blocks = re.findall(r'```[\s\S]*?```', content)
    if code_blocks:
        score += 5
        
        # 检查代码长度
        total_code_lines = sum(len(block.split('\n')) for block in code_blocks)
        if total_code_lines > 20:
            score += 5
        
        # 检查是否有注释
        if re.search(r'# |// |\*', content):
            score += 3
        
        # 检查是否有输入输出
        if re.search(r'(input|output|输入 | 输出|print|return)', content, re.IGNORECASE):
            score += 2
    
    return min(score, 15)

def evaluate_practical_guide(content: str) -> int:
    """评估实践指南（15 分）"""
    score = 0
    
    # 检查是否有最佳实践
    if re.search(r'(best practice|最佳实践|推荐 | recommended|should)', content, re.IGNORECASE):
        score += 4
    
    # 检查是否有常见陷阱
    if re.search(r'(pitfall|陷阱 | 注意 | caution|warning|avoid)', content, re.IGNORECASE):
        score += 4
    
    # 检查是否有调优技巧
    if re.search(r'(tuning|优化 | 调优 | parameter|配置)', content, re.IGNORECASE):
        score += 4
    
    # 检查是否有性能考量
    if re.search(r'(performance|性能 | 效率 | speed|memory)', content, re.IGNORECASE):
        score += 3
    
    return min(score, 15)

def evaluate_comparison(content: str) -> int:
    """评估对比分析（10 分）"""
    score = 0
    
    # 检查是否有对比
    if re.search(r'(vs|versus|对比 | 相比 |compared to|difference)', content, re.IGNORECASE):
        score += 4
    
    # 检查是否有对比表格
    if re.search(r'\|.*\|.*\|', content):
        score += 3
    
    # 检查是否有优缺点分析
    if re.search(r'(advantage|disadvantage|优点 | 缺点|pros|cons)', content, re.IGNORECASE):
        score += 3
    
    return min(score, 10)

def evaluate_depth(content: str) -> int:
    """评估深度适中（10 分）"""
    score = 0
    
    # 检查内容长度
    word_count = len(content.split())
    if 1000 <= word_count <= 5000:
        score += 4
    elif 500 <= word_count < 1000 or 5000 < word_count <= 8000:
        score += 2
    
    # 检查是否有理论 + 实践
    has_theory = re.search(r'(理论 | 原理 | theory|concept)', content, re.IGNORECASE)
    has_practice = re.search(r'(实践 | 实战 | 示例 | practice|example|code)', content, re.IGNORECASE)
    if has_theory and has_practice:
        score += 6
    elif has_theory or has_practice:
        score += 3
    
    return min(score, 10)

def evaluate_structure(content: str) -> int:
    """评估结构清晰（10 分）"""
    score = 0
    
    # 检查是否有标题层次
    headers = re.findall(r'^#{1,6}\s+', content, re.MULTILINE)
    if len(headers) >= 5:
        score += 4
    elif len(headers) >= 3:
        score += 2
    
    # 检查是否有目录
    if re.search(r'(目录|table of contents|contents)', content, re.IGNORECASE):
        score += 2
    
    # 检查是否有分段
    paragraphs = content.split('\n\n')
    if len(paragraphs) >= 10:
        score += 4
    elif len(paragraphs) >= 5:
        score += 2
    
    return min(score, 10)

def evaluate_visuals(content: str) -> int:
    """评估图表辅助（10 分）"""
    score = 0
    
    # 检查是否有图片
    if re.search(r'!\[.*\]\(.*\)', content):
        score += 5
    
    # 检查是否有表格
    if re.search(r'\|.*\|.*\|', content):
        score += 3
    
    # 检查是否有列表
    if re.search(r'^[-*]\s+', content, re.MULTILINE):
        score += 2
    
    return min(score, 10)

def evaluate_timeliness(content: str, file_path: str) -> int:
    """评估时效性（5 分）"""
    score = 0
    
    # 检查是否有年份
    current_year = datetime.now().year
    if str(current_year) in content or str(current_year - 1) in content:
        score += 3
    elif str(current_year - 2) in content:
        score += 2
    
    # 检查是否有版本号的最新版本
    if re.search(r'v\d+\.\d+', content):
        score += 2
    
    return min(score, 5)

def evaluate_source_reliability(url: str, file_path: str) -> int:
    """评估来源可靠（5 分）"""
    score = 0
    
    # 高可靠性网站
    reliable_sites = ['github.com', 'arxiv.org', 'medium.com', 'towardsdatascience.com', 
                      'machinelearningmastery.com', 'pyimagesearch.com', 'stackoverflow.com',
                      'huggingface.co', 'official', 'docs']
    
    for site in reliable_sites:
        if site in url.lower() or site in file_path.lower():
            score += 3
            break
    
    # 检查是否有作者信息
    if re.search(r'(author|作者 | by |written by)', url.lower() + file_path.lower()):
        score += 2
    
    return min(score, 5)

# ============ 主评估函数 ============

def evaluate_document(file_path: Path) -> Dict:
    """评估单个文档"""
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return {"file": str(file_path), "error": str(e), "total_score": 0}
    
    # 从文件名提取 URL（如果有）
    url = file_path.name
    
    # 逐项评分
    scores = {
        "problem_definition": evaluate_problem_definition(content),
        "core_concepts": evaluate_core_concepts(content),
        "code_examples": evaluate_code_examples(content),
        "practical_guide": evaluate_practical_guide(content),
        "comparison": evaluate_comparison(content),
        "depth": evaluate_depth(content),
        "structure": evaluate_structure(content),
        "visuals": evaluate_visuals(content),
        "timeliness": evaluate_timeliness(content, str(file_path)),
        "source_reliability": evaluate_source_reliability(url, str(file_path)),
    }
    
    # 计算总分
    total_score = sum(scores.values())
    
    # 评级
    if total_score >= 90:
        rating = "优秀"
        action = "直接采用"
    elif total_score >= 70:
        rating = "良好"
        action = "补充后采用"
    elif total_score >= 50:
        rating = "一般"
        action = "需要大量补充"
    else:
        rating = "较差"
        action = "不建议采用"
    
    return {
        "file": str(file_path),
        "scores": scores,
        "total_score": total_score,
        "rating": rating,
        "action": action,
        "word_count": len(content.split()),
    }

# ============ 批量评估 ============

def evaluate_all_documents(questions_dir: str = "questions") -> List[Dict]:
    """评估所有文档"""
    results = []
    
    questions_path = Path(questions_dir)
    if not questions_path.exists():
        print(f"❌ 目录不存在：{questions_dir}")
        return results
    
    # 遍历所有分类
    for category_dir in questions_path.iterdir():
        if not category_dir.is_dir():
            continue
        
        print(f"\n📂 评估分类：{category_dir.name}")
        
        # 遍历所有 Markdown 文件
        for md_file in category_dir.glob("*.md"):
            result = evaluate_document(md_file)
            result["category"] = category_dir.name
            results.append(result)
            
            # 打印简要结果
            emoji = {"优秀": "✅", "良好": "⭐", "一般": "⚠️", "较差": "❌"}.get(result["rating"], "❓")
            print(f"  {emoji} {result['file'].split('/')[-1][:50]}... - {result['total_score']}/100 ({result['rating']})")
    
    return results

# ============ 生成报告 ============

def generate_report(results: List[Dict], output_file: str = "logs/quality-report.md"):
    """生成质量评估报告"""
    
    # 统计
    total_docs = len(results)
    excellent = sum(1 for r in results if r.get("rating") == "优秀")
    good = sum(1 for r in results if r.get("rating") == "良好")
    average = sum(1 for r in results if r.get("rating") == "一般")
    poor = sum(1 for r in results if r.get("rating") == "较差")
    
    avg_score = sum(r["total_score"] for r in results) / max(total_docs, 1)
    
    # 按分类统计
    category_stats = {}
    for result in results:
        cat = result.get("category", "Unknown")
        if cat not in category_stats:
            category_stats[cat] = {"count": 0, "total_score": 0, "excellent": 0}
        category_stats[cat]["count"] += 1
        category_stats[cat]["total_score"] += result["total_score"]
        if result.get("rating") == "优秀":
            category_stats[cat]["excellent"] += 1
    
    # 生成报告
    report = f"""# 技术文档质量评估报告

**生成时间：** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**评估标准：** 10 维度 100 分制  
**文档总数：** {total_docs} 篇

---

## 📊 总体统计

| 指标 | 数值 |
|------|------|
| 文档总数 | {total_docs} |
| 平均分 | {avg_score:.1f}/100 |
| 优秀 (90-100) | {excellent} 篇 ({excellent/total_docs*100:.1f}%) |
| 良好 (70-89) | {good} 篇 ({good/total_docs*100:.1f}%) |
| 一般 (50-69) | {average} 篇 ({average/total_docs*100:.1f}%) |
| 较差 (<50) | {poor} 篇 ({poor/total_docs*100:.1f}%) |

---

## 📁 分类统计

| 分类 | 文档数 | 平均分 | 优秀数 |
|------|--------|--------|--------|
"""
    
    for cat, stats in sorted(category_stats.items()):
        avg = stats["total_score"] / max(stats["count"], 1)
        report += f"| {cat} | {stats['count']} | {avg:.1f} | {stats['excellent']} |\n"
    
    report += f"""
---

## 📋 详细评估结果

### 优秀文档（{excellent}篇）

"""
    
    # 列出优秀文档
    excellent_docs = [r for r in results if r.get("rating") == "优秀"]
    for doc in excellent_docs[:10]:  # 只显示前 10 个
        filename = doc['file'].split('/')[-1][:60]
        report += f"- ✅ **{filename}** - {doc['total_score']}/100\n"
        report += f"  - 代码示例：{doc['scores'].get('code_examples', 0)}/15\n"
        report += f"  - 实践指南：{doc['scores'].get('practical_guide', 0)}/15\n"
        report += f"  - 结构清晰：{doc['scores'].get('structure', 0)}/10\n\n"
    
    report += f"""
### 需要改进的文档（{average + poor}篇）

"""
    
    # 列出需要改进的文档
    poor_docs = [r for r in results if r.get("rating") in ["一般", "较差"]]
    for doc in poor_docs[:10]:  # 只显示前 10 个
        filename = doc['file'].split('/')[-1][:60]
        report += f"- ⚠️ **{filename}** - {doc['total_score']}/100 ({doc['rating']})\n"
        report += f"  - 建议：{doc.get('action', '需要补充')}\n\n"
    
    report += f"""
---

## 💡 改进建议

### 对于优秀文档
- ✅ 直接采用到知识库
- ✅ 作为模板参考
- ✅ 可以分享给其他用户

### 对于良好文档
- ⚠️ 补充代码示例
- ⚠️ 添加实践指南
- ⚠️ 增强对比分析

### 对于一般/较差文档
- ❌ 需要大量补充或重写
- ❌ 考虑替换为更优质的内容
- ❌ 或者标记为"待完善"

---

## 📈 评分维度说明

| 维度 | 分值 | 评估要点 |
|------|------|----------|
| 问题定义 | 10 分 | 技术背景、痛点、应用场景 |
| 核心概念 | 10 分 | 术语定义、原理讲解 |
| 使用示例 | 15 分 | 代码完整性、注释、输入输出 |
| 实践指南 | 15 分 | 最佳实践、陷阱、调优 |
| 对比分析 | 10 分 | 与类似技术对比 |
| 深度适中 | 10 分 | 理论与实践平衡 |
| 结构清晰 | 10 分 | 目录、标题层次 |
| 图表辅助 | 10 分 | 架构图、流程图、表格 |
| 时效性 | 5 分 | 内容不过时 |
| 来源可靠 | 5 分 | 作者资质、引用来源 |

---

**报告生成完毕！**
"""
    
    # 保存报告
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    Path(output_file).write_text(report, encoding='utf-8')
    print(f"\n📄 报告已保存：{output_file}")
    
    return report

# ============ 主函数 ============

def main():
    print("="*60)
    print("📐 技术文档质量评估系统")
    print("="*60)
    
    # 评估所有文档
    results = evaluate_all_documents()
    
    if not results:
        print("\n❌ 没有找到文档")
        return
    
    # 生成报告
    generate_report(results)
    
    # 打印总结
    print("\n" + "="*60)
    print("📊 评估总结")
    print("="*60)
    
    total = len(results)
    excellent = sum(1 for r in results if r.get("rating") == "优秀")
    good = sum(1 for r in results if r.get("rating") == "良好")
    
    print(f"总文档数：{total}")
    print(f"优秀：{excellent} ({excellent/total*100:.1f}%)")
    print(f"良好：{good} ({good/total*100:.1f}%)")
    print(f"平均分数：{sum(r['total_score'] for r in results)/total:.1f}/100")

if __name__ == "__main__":
    main()
