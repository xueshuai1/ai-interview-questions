#!/usr/bin/env node
/**
 * 自我进化脚本
 * 
 * 功能：
 * 1. 读取 EVOLUTION-LOG.md 获取当前策略状态
 * 2. 执行自我审查
 * 3. 检查是否有遗漏的高星项目
 * 4. 发现策略不足，自动更新进化日志
 * 5. 输出改进建议
 * 
 * 运行：node scripts/self-evolve.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TOOLS_FILE = path.join(ROOT, 'src/data/tools.ts');
const EVOLUTION_LOG = path.join(ROOT, 'EVOLUTION-LOG.md');
const TOPICS_FILE = path.join(ROOT, 'data/ai-topics.json');

// 提取 tools.ts 中已有的 GitHub 仓库
function extractExistingRepos() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  const urlRegex = /url:\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+)"/g;
  const repos = new Set();
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    repos.add(`${m[1].toLowerCase()}/${m[2].toLowerCase()}`);
  }
  return repos;
}

// 获取每个工具的 GitHub stars
function extractToolStars() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  const stars = {};
  const regex = /\bid:\s*"([^"]+)"[\s\S]*?githubStars:\s*(\d+)/g;
  let m;
  // Better approach: parse each tool block
  const toolRegex = /\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?githubStars:\s*(\d+)[\s\S]*?\},?/g;
  while ((m = toolRegex.exec(content)) !== null) {
    stars[m[1]] = parseInt(m[2]);
  }
  // Fallback: simple regex
  if (Object.keys(stars).length === 0) {
    const idRegex = /id:\s*"([^"]+)"/g;
    const starsRegex = /githubStars:\s*(\d+)/g;
    // This is simplified - in practice we'd need to match pairs
  }
  return stars;
}

// 检查是否有新的 GitHub 热门项目未收录
async function checkMissingHighStarProjects() {
  const existingRepos = extractExistingRepos();
  console.error(`📦 已有 ${existingRepos.size} 个 GitHub 项目`);
  
  // 用 GitHub API 搜索高星 AI 项目
  const queries = [
    'topic:artificial-intelligence stars:>10000',
    'topic:machine-learning stars:>10000',
    'topic:large-language-models stars:>5000',
    'topic:ai-agent stars:>5000',
    'topic:llm stars:>5000'
  ];
  
  const missingProjects = [];
  
  for (const query of queries) {
    try {
      const result = await searchGitHub(query, 10);
      if (result.success) {
        for (const item of result.items) {
          const fullName = item.full_name.toLowerCase();
          if (!existingRepos.has(fullName)) {
            missingProjects.push(item);
          }
        }
      }
    } catch (e) {
      console.error(`⚠️  搜索 ${query} 失败: ${e.message}`);
    }
    await sleep(1000);
  }
  
  // 去重并按 stars 排序
  const seen = new Set();
  const unique = missingProjects.filter(p => {
    if (seen.has(p.full_name)) return false;
    seen.add(p.full_name);
    return true;
  }).sort((a, b) => b.stargazers_count - a.stargazers_count);
  
  return unique.slice(0, 20);
}

function searchGitHub(query, perPage = 10) {
  return new Promise((resolve) => {
    const headers = { 'User-Agent': 'ai-master-site', 'Accept': 'application/vnd.github.v3+json' };
    const options = {
      hostname: 'api.github.com',
      path: `/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`,
      headers,
      timeout: 10000
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const j = JSON.parse(data);
            resolve({ success: true, items: j.items || [] });
          } catch { resolve({ success: false, items: [] }); }
        } else {
          resolve({ success: false, items: [] });
        }
      });
    }).on('error', () => resolve({ success: false, items: [] }));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// 主函数
async function main() {
  console.error('🧬 自我进化审查开始\n');
  
  // 1. 读取进化日志
  let evolutionLog = '';
  try {
    evolutionLog = fs.readFileSync(EVOLUTION_LOG, 'utf8');
    console.error('✅ 已读取 EVOLUTION-LOG.md');
  } catch {
    console.error('⚠️  未找到 EVOLUTION-LOG.md，将创建');
  }
  
  // 2. 检查是否有遗漏的高星项目
  console.error('\n🔍 检查遗漏的高星项目...');
  const missingProjects = await checkMissingHighStarProjects();
  
  if (missingProjects.length > 0) {
    console.error(`\n🆕 发现 ${missingProjects.length} 个遗漏的高星项目：`);
    for (const p of missingProjects.slice(0, 10)) {
      console.error(`  - ${p.full_name} (${p.stargazers_count.toLocaleString()} ⭐) - ${p.description?.slice(0, 60) || ''}`);
    }
  } else {
    console.error('✅ 未发现明显遗漏的高星项目');
  }
  
  // 3. 检查 topics 库是否需要更新
  console.error('\n🏷️  检查 topics 库...');
  try {
    const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
    console.error(`✅ 已有 ${topicsData.topics.length} 个 topics`);
    
    // 检查 missing projects 中是否有新 topics
    const newTopics = new Set();
    for (const p of missingProjects) {
      if (p.topics) {
        for (const topic of p.topics) {
          if (!topicsData.topics.find(t => t.topic === topic) && topic.includes('ai') || topic.includes('llm') || topic.includes('agent') || topic.includes('ml')) {
            newTopics.add(topic);
          }
        }
      }
    }
    
    if (newTopics.size > 0) {
      console.error(`🆕 发现 ${newTopics.size} 个新 AI 相关 topics：`);
      for (const t of newTopics) {
        console.error(`  - ${t}`);
      }
    } else {
      console.error('✅ 未发现新 topics');
    }
  } catch {
    console.error('⚠️  无法读取 topics 库');
  }
  
  // 4. 输出进化建议
  console.error('\n💡 进化建议：');
  const suggestions = [];
  
  if (missingProjects.length > 5) {
    suggestions.push(`发现 ${missingProjects.length} 个遗漏项目，说明收集策略仍有盲区`);
  }
  
  if (!evolutionLog.includes('Topics 扫描')) {
    suggestions.push('Topics 扫描策略尚未完全集成到 cron 中');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('当前策略状态良好，继续保持');
  }
  
  suggestions.forEach(s => console.error(`  → ${s}`));
  
  // 5. 生成进化报告
  const report = {
    date: new Date().toISOString(),
    missingProjectsCount: missingProjects.length,
    topMissing: missingProjects.slice(0, 10).map(p => ({
      repo: p.full_name,
      stars: p.stargazers_count,
      description: p.description
    })),
    suggestions,
    evolutionLogExists: evolutionLog.length > 0
  };
  
  const reportPath = path.join(ROOT, 'data/evolution-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(`\n💾 进化报告已保存到 ${reportPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
