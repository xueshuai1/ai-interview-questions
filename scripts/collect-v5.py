#!/usr/bin/env python3
"""
AI 面试题自动收集脚本 - v5.1 修复版

修复问题：
- 添加 self.keywords_db 初始化
- 优化错误处理
- 跳过知乎等反爬网站

使用：python3 -u scripts/collect-v5.py --count 30 --category CV --use-agent-browser
"""

import os
import sys
import json
import hashlib
import difflib
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import re

# 添加报告生成器导入
# 禁用输出缓冲
sys.stdout.reconfigure(line_buffering=True)

# ============ 配置 ============

CONFIG = {
    "search_engine": "bing",
    "max_results_per_keyword": 15,
    "max_keywords_per_run": 10,
    "similarity_threshold": 0.8,
    "images_dir": "public/images/questions",
    "git_email": "xueshuai@example.com",
    "git_name": "薛帅",
    "keywords_version": "v5.0",
    "skip_domains": ["zhihu.com", "jianshu.com"],  # 跳过反爬网站
    "priority_sites": [
        "medium.com",
        "towardsdatascience.com",
        "machinelearningmastery.com",
        "pyimagesearch.com",
        "realpython.com",
        "kdnuggets.com",
        "analyticsvidhya.com",
        "dev.to",
        "github.com",
        "arxiv.org",
        "stackoverflow.com",
        "huggingface.co",
        "fast.ai",
        "openai.com",
        "google.ai"
    ],
    "target_sites": {
        "en_round4": ["medium.com", "towardsdatascience.com", "dev.to", "analyticsvidhya.com"],
        "en_round5": ["machinelearningmastery.com", "pyimagesearch.com", "realpython.com", "kdnuggets.com"],
        "en_round6": ["github.com", "arxiv.org", "stackoverflow.com", "huggingface.co"]
    }
}

# ============ 简化版收集器 ============

class SimpleCollector:
    """简化版收集器 - 修复 keywords_db bug"""
    
    def __init__(self):
        self.questions_dir = Path("questions")
        self.questions_dir.mkdir(parents=True, exist_ok=True)
        self.collected_count = 0
        self.updated_count = 0
        self.skipped_count = 0
        self.processed_urls = set()
        self.search_history = []
        self.category_stats = {}
        self.source_stats = {}
        self.start_time = datetime.now()
        # 修复：添加 keywords_db 属性（虽然不使用，但避免报错）
        self.keywords_db = None
    
    def find_similar_question(self, title: str, content: str) -> Optional[Path]:
        """查找相似题目"""
        if not self.questions_dir.exists():
            return None
        
        for md_file in self.questions_dir.rglob("*.md"):
            try:
                file_content = md_file.read_text(encoding='utf-8')
                if title in file_content or len(difflib.SequenceMatcher(None, title, file_content[:500]).ratio()) > 0.8:
                    return md_file
            except:
                continue
        return None
    
    def create_question(self, title: str, category: str, content: str, tags: List[str], source_url: str) -> Path:
        """创建题目文件"""
        slug = re.sub(r'[^\w\s\u4e00-\u9fff-]', '', title)
        slug = slug.replace(' ', '-').lower()[:60]
        filename = f"{category}-{slug}.md"
        
        file_path = self.questions_dir / category / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        markdown = f"""---
title: "{title}"
category: "{category}"
difficulty: "⭐⭐⭐"
tags: [{', '.join([f'"{tag}"' for tag in tags])}]
source: "{source_url}"
sourceUrl: "{source_url}"
collectedAt: "{datetime.now().strftime('%Y-%m-%d')}"
---

## 题目描述
{title}

**来源：** {source_url}
**标签：** {', '.join(tags)}

## 参考答案
（待完善 - 需要人工审核补充）

## 考察重点
- 基础知识掌握
- 实际应用能力
- 问题解决思路

## 延伸追问
### 追问 1: 深入理解
**问题：** 这个技术背后的原理是什么？
**答案：** （待补充）

### 追问 2: 实际应用场景
**问题：** 在实际项目中如何应用？
**答案：** （待补充）

## 深入理解
（待完善 - 需要人工审核补充）

## 更新历史
- v1 ({datetime.now().strftime('%Y-%m-%d')}): 初始版本
"""
        
        file_path.write_text(markdown, encoding='utf-8')
        return file_path
    
    def process_content(self, content: str, url: str, keyword: str, category: str) -> Optional[Path]:
        """处理内容并创建题目"""
        # 简单提取标题
        lines = content.split('\n')
        title = ""
        for line in lines[:30]:
            if 10 < len(line) < 100 and 'http' not in line and not line.startswith('#'):
                title = line.strip()
                break
        
        if not title or len(title) < 5:
            return None
        
        # 提取标签
        tags = [keyword.split()[0], category]
        
        # 检查是否已存在
        similar = self.find_similar_question(title, content)
        if similar:
            self.updated_count += 1
            return similar
        
        # 创建题目
        file_path = self.create_question(title, category, content, tags, url)
        self.collected_count += 1
        return file_path

# ============ agent-browser 封装 ============

class AgentBrowser:
    """agent-browser CLI 封装"""
    
    def __init__(self, search_engine: str = "bing"):
        self.search_engine = search_engine
        self.session_id = f"collector_{int(time.time())}"
    
    def search(self, query: str, max_results: int = 15, target_sites: Optional[List[str]] = None) -> List[Dict]:
        """搜索"""
        # 构建搜索 URL
        if target_sites:
            site_query = " OR ".join([f"site:{site}" for site in target_sites[:5]])
            full_query = f"{query} ({site_query})"
        else:
            full_query = query
        
        search_url = f"https://www.bing.com/search?q={full_query.replace(' ', '+')}&count={max_results*2}"
        print(f"🔍 搜索：{query}")
        print(f"🌐 打开：{search_url}")
        
        # 打开搜索结果
        subprocess.run(f'agent-browser --session {self.session_id} open "{search_url}"', shell=True, capture_output=True)
        time.sleep(3)
        
        # 提取结果
        js_code = """
        (function() {
            var results = [];
            var seenUrls = new Set();
            var links = document.querySelectorAll('a[href^="http"]');
            for (var i = 0; i < Math.min(links.length, 150); i++) {
                var a = links[i];
                var url = a.href;
                var txt = a.innerText || a.textContent || '';
                if (url.includes('bing.com') || url.length < 20 || seenUrls.has(url)) continue;
                var t = txt.trim();
                if (t.length > 5 && t.length < 200) {
                    seenUrls.add(url);
                    results.push({title: t.substring(0, 150), url: url});
                    if (results.length >= 15) return results;
                }
            }
            return results;
        })();
        """
        
        result = subprocess.run(f'agent-browser --session {self.session_id} eval "{js_code}"', shell=True, capture_output=True, text=True, timeout=30)
        
        try:
            results = json.loads(result.stdout.strip())
            print(f"  ✓ 找到 {len(results)} 个结果")
            return results
        except:
            return []
    
    def close(self):
        """关闭浏览器"""
        subprocess.run(f'agent-browser --session {self.session_id} close', shell=True, capture_output=True)
        print("✓ 浏览器会话已关闭")

# ============ 内容获取 ============

def web_fetch(url: str, max_chars: int = 10000) -> str:
    """获取网页内容"""
    try:
        import requests
        from bs4 import BeautifulSoup
        
        # 跳过知乎等反爬网站
        for domain in CONFIG['skip_domains']:
            if domain in url:
                print(f"  ⚠️  跳过知乎链接")
                return ""
        
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        for script in soup(['script', 'style']):
            script.decompose()
        
        text = soup.get_text(separator='\n', strip=True)
        return text[:max_chars] if len(text) > max_chars else text
    except Exception as e:
        print(f"  ⚠️  获取失败：{e}")
        return ""

# ============ 词库加载 ============

def load_v5_keywords(keywords_file: str = None, category: str = None) -> Dict:
    """加载 v5.0 词库"""
    if keywords_file is None:
        # 根据 category 自动选择词库文件
        if category:
            keywords_file = f"data/keywords-v5-{category.lower()}.json"
        else:
            keywords_file = "data/keywords-v5-cv.json"
    
    file_path = Path(keywords_file)
    if not file_path.exists():
        return {}
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_search_rounds(keywords_data: Dict, category: Optional[str] = None) -> List[Dict]:
    """提取搜索轮次"""
    rounds = []
    categories = keywords_data.get('categories', {})
    
    if category and category in categories:
        cat_data = categories[category]
        level2_data = cat_data.get('level2', {})
        
        # 中文搜索
        rounds.append({"name": f"{category} 中文一级类目", "keywords": [cat_data['name']['zh']]})
        rounds.append({"name": f"{category} 中文二级类目", "keywords": [data['name']['zh'] for data in level2_data.values()]})
        
        zh_level3 = []
        for data in level2_data.values():
            zh_level3.extend(data.get('keywords', {}).get('zh', [])[:10])
        rounds.append({"name": f"{category} 中文三级知识点", "keywords": zh_level3})
        
        # 英文搜索
        rounds.append({"name": f"{category} 英文一级类目", "keywords": [cat_data['name']['en']], "target_sites": CONFIG['target_sites']['en_round4']})
        rounds.append({"name": f"{category} 英文二级类目", "keywords": [data['name']['en'] for data in level2_data.values()], "target_sites": CONFIG['target_sites']['en_round5']})
        
        en_level3 = []
        for data in level2_data.values():
            en_level3.extend(data.get('keywords', {}).get('en', [])[:10])
        rounds.append({"name": f"{category} 英文三级知识点", "keywords": en_level3, "target_sites": CONFIG['target_sites']['en_round6']})
    
    return [r for r in rounds if r.get('keywords')]

# ============ 主函数 ============

def collect_category(category: str, count: int = 30):
    """收集指定领域"""
    print(f"\n🚀 开始收集 {category} 领域面试题...")
    print(f"目标数量：{count}\n")
    
    collector = SimpleCollector()
    browser = AgentBrowser()
    
    try:
        # 加载词库
        keywords_data = load_v5_keywords(category=category)
        if not keywords_data:
            print("⚠️  词库加载失败")
            return
        
        search_rounds = extract_search_rounds(keywords_data, category=category)
        print(f"📚 加载 {len(search_rounds)} 轮搜索策略\n")
        
        all_results = []
        
        # 执行搜索
        for round_idx, search_round in enumerate(search_rounds, 1):
            keywords = search_round.get('keywords', [])
            target_sites = search_round.get('target_sites')
            
            print(f"\n{'='*60}")
            print(f"🔄 第{round_idx}轮：{search_round.get('name', '未知')}")
            print(f"{'='*60}")
            print(f"   关键词数：{len(keywords)}")
            
            for i, kw in enumerate(keywords[:CONFIG['max_keywords_per_run']]):
                if collector.collected_count >= count:
                    print(f"\n✅ 已达到目标数量 {count}")
                    break
                
                print(f"\n[{i+1}/{len(keywords)}] 搜索：{kw}")
                results = browser.search(kw, max_results=CONFIG['max_results_per_keyword'], target_sites=target_sites)
                all_results.extend(results)
                time.sleep(1)
            
            print(f"\n✅ 第{round_idx}轮完成，累积：{len(all_results)} 个结果")
        
        # 处理结果
        print(f"\n📊 搜索完成，总计：{len(all_results)} 个结果")
        
        for i, result in enumerate(all_results[:count*3]):
            if collector.collected_count >= count:
                break
            
            url = result.get('url', '')
            if url in collector.processed_urls:
                continue
            
            collector.processed_urls.add(url)
            print(f"\n[{i+1}/{len(all_results)}] 处理：{result.get('title', '')[:60]}")
            
            content = web_fetch(url)
            
            # 质量检查：至少 1000 字
            if not content or len(content) < 1000:
                print(f"  ⚠️  内容太短（{len(content)}字），跳过")
                collector.skipped_count += 1
                continue
            
            # 质量检查：必须有代码示例或详细说明
            has_code = '```' in content or 'def ' in content or 'class ' in content or 'import ' in content
            has_detail = len(content.split('\n')) > 30
            
            if not (has_code or has_detail):
                print(f"  ⚠️  缺少代码或详细内容，跳过")
                collector.skipped_count += 1
                continue
            
            keyword = search_rounds[0]['keywords'][0] if search_rounds else category
            file_path = collector.process_content(content, url, keyword, category)
            
            if file_path:
                print(f"  ✓ 创建：{file_path.name}")
        
        # 总结
        print(f"\n{'='*60}")
        print(f"📊 收集完成！")
        print(f"{'='*60}")
        print(f"✅ 新增：{collector.collected_count} 道")
        print(f"🔄 更新：{collector.updated_count} 道")
        print(f"⏭️ 跳过：{collector.skipped_count} 道")
        
    finally:
        browser.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='AI 面试题收集 v5.1')
    parser.add_argument('--category', type=str, required=True, help='领域分类（CV/NLP/ML/DL/RecSys/RL/LLM/System）')
    parser.add_argument('--count', type=int, default=30, help='目标数量')
    
    args = parser.parse_args()
    collect_category(args.category, args.count)
