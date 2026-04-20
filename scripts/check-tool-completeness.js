#!/usr/bin/env node
/**
 * 工具集完整性检查
 * 
 * 用 GitHub API 搜索高星 AI 项目，对比 tools.ts 已有数据，
 * 发现漏掉的项目（特别是总星数高但本周增长不高、不上 Trending 的项目）。
 * 
 * 用法: node scripts/check-tool-completeness.js [GITHUB_TOKEN]
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const TOOLS_FILE = path.join(REPO_ROOT, 'src/data/tools.ts');
const STARS_FILE = path.join(REPO_ROOT, 'src/data/github-stars.json');

// 提取已有工具的 ID 列表
function getExistingToolIds() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf-8');
  // 匹配 id: "xxx"
  const ids = new Set();
  const matches = content.matchAll(/id:\s*["']([^"']+)["']/g);
  for (const m of matches) {
    ids.add(m[1]);
  }
  return ids;
}

// 搜索 GitHub 高星项目
async function searchGitHub(token, query, page = 1, perPage = 100) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&page=${page}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ai-master-tools-checker'
    }
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }
  
  const data = await res.json();
  return { total: data.total_count, items: data.items };
}

async function main() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('⚠️ 未提供 GitHub Token，结果可能不完整');
    console.log('用法: node scripts/check-tool-completeness.js <GITHUB_TOKEN>');
  }

  console.log('🔍 检查工具集完整性...\n');

  const existingIds = getExistingToolIds();
  console.log(`📦 当前工具集: ${existingIds.size} 个工具\n`);

  // 多个搜索查询，覆盖不同维度的 AI 项目
  const queries = [
    'stars:>50000 language:Python topic:artificial-intelligence',
    'stars:>50000 language:Python topic:machine-learning',
    'stars:>50000 language:Python topic:deep-learning',
    'stars:>50000 language:Python topic:llm',
    'stars:>30000 language:Python topic:chatbot',
    'stars:>30000 topic:ai',
  ];

  const allGitHubProjects = new Map(); // id -> {name, stars, url}

  for (const query of queries) {
    try {
      const { items } = await searchGitHub(token, query, 1, 30);
      console.log(`📊 "${query}": 找到 ${items.length} 个项目`);
      
      for (const item of items) {
        const id = item.name.toLowerCase().replace(/[_-]/g, '-');
        if (!allGitHubProjects.has(id)) {
          allGitHubProjects.set(id, {
            name: item.name,
            stars: item.stargazers_count,
            url: item.html_url,
            description: item.description || '',
            language: item.language || '',
          });
        }
      }
      
      // 避免触发 rate limit
      if (queries.indexOf(query) < queries.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.log(`⚠️ "${query}" 搜索失败: ${err.message}`);
    }
  }

  console.log(`\n📊 GitHub 高星项目: ${allGitHubProjects.size} 个（去重后）`);

  // 找出缺失的项目
  const missing = [];
  for (const [id, info] of allGitHubProjects) {
    if (!existingIds.has(id)) {
      missing.push({ id, ...info });
    }
  }

  if (missing.length === 0) {
    console.log('\n✅ 工具集完整性检查通过！未发现遗漏的高星项目');
    return;
  }

  // 按星数排序
  missing.sort((a, b) => b.stars - a.stars);

  console.log(`\n❌ 发现 ${missing.length} 个遗漏的高星项目:`);
  console.log('\n🔴 建议立即收录（>100K⭐）:');
  missing.filter(m => m.stars >= 100000).forEach(m => {
    console.log(`  - ${m.name} (${(m.stars / 1000).toFixed(0)}K⭐) ${m.url}`);
  });

  console.log('\n🟠 建议收录（50K-100K⭐）:');
  missing.filter(m => m.stars >= 50000 && m.stars < 100000).forEach(m => {
    console.log(`  - ${m.name} (${(m.stars / 1000).toFixed(0)}K⭐) ${m.url}`);
  });

  console.log('\n🟡 建议评估后收录（30K-50K⭐）:');
  missing.filter(m => m.stars >= 30000 && m.stars < 50000).forEach(m => {
    console.log(`  - ${m.name} (${(m.stars / 1000).toFixed(0)}K⭐) ${m.url}`);
  });
}

main().catch(err => {
  console.error('❌ 检查失败:', err.message);
  process.exit(1);
});
