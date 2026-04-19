#!/usr/bin/env node
/**
 * 自动更新 tools.ts 中所有 GitHub 工具的 stars 数据
 * 
 * 规则：
 * 1. 只有请求到有效数据（stars > 0）才更新，否则保留旧值
 * 2. 每个 GitHub 工具必须有 githubStars 字段
 * 3. 保存历史快照用于显示增长趋势
 * 4. 更新后自动按 stars 降序排序
 * 
 * 运行：node scripts/update-github-stars.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TOOLS_FILE = path.join(ROOT, 'src/data/tools.ts');
const STARS_FILE = path.join(ROOT, 'src/data/github-stars.json');
const HISTORY_FILE = path.join(ROOT, 'src/data/github-stars-history.json');
const REQUEST_DELAY = 1500;

function fetchRepoInfo(repo) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}`,
      headers: { 'User-Agent': 'ai-master-site' },
      timeout: 8000
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const j = JSON.parse(data);
            resolve({
              stars: j.stargazers_count || 0,
              forks: j.forks_count || 0,
              language: j.language || null,
              createdAt: j.created_at || null,
              updatedAt: j.updated_at || null,
              success: true
            });
          } catch { resolve({ success: false, stars: 0, error: 'parse' }); }
        } else if (res.statusCode === 403 || res.statusCode === 429) {
          resolve({ success: false, stars: 0, error: 'rate_limited' });
        } else if (res.statusCode === 404) {
          resolve({ success: false, stars: 0, error: 'not_found' });
        } else {
          resolve({ success: false, stars: 0, error: `http_${res.statusCode}` });
        }
      });
    }).on('error', () => resolve({ success: false, stars: 0, error: 'network' }))
      .on('timeout', () => resolve({ success: false, stars: 0, error: 'timeout' }));
  });
}

async function main() {
  const now = new Date().toISOString();
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  
  // Extract GitHub repos from tools
  const urlRegex = /url:\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+)"/g;
  const reposMap = {}; // tool id -> repo
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    // Find the tool id near this URL
    const blockStart = Math.max(0, m.index - 500);
    const blockEnd = Math.min(content.length, m.index + 200);
    const block = content.slice(blockStart, blockEnd);
    const idMatch = block.match(/\bid:\s*"([^"]+)"/);
    if (idMatch) {
      reposMap[idMatch[1]] = `${m[1]}/${m[2]}`;
    }
  }
  const repoList = Object.entries(reposMap);
  console.error(`Found ${repoList.length} tools with GitHub repos`);

  // Load current stars.json to get previous values
  let currentStars = {};
  try {
    const existing = JSON.parse(fs.readFileSync(STARS_FILE, 'utf8'));
    currentStars = existing.stars || {};
  } catch {}

  // Load history for trend calculation
  let historyData = {};
  try {
    const hist = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    historyData = hist.snapshots || {};
  } catch {}

  // Save previous snapshot before fetching
  const previousSnapshot = {};
  for (const [id, repo] of repoList) {
    if (currentStars[id]) {
      previousSnapshot[id] = {
        stars: currentStars[id].stars || 0,
        forks: currentStars[id].forks || 0,
        fetchedAt: currentStars[id].fetchedAt || now
      };
    }
  }

  // Fetch stars
  const starsMap = {};
  let rateLimited = false;
  let successCount = 0;
  let fallbackCount = 0;

  for (let i = 0; i < repoList.length; i++) {
    if (rateLimited) break;
    const [toolId, repo] = repoList[i];
    const info = await fetchRepoInfo(repo);
    
    if (info.success) {
      starsMap[toolId] = info;
      successCount++;
      console.error(`  ✅ ${toolId} (${repo}): ${info.stars.toLocaleString()} ⭐`);
    } else if (info.error === 'rate_limited') {
      console.error(`  🚫 Rate limited at ${i}/${repoList.length}, using fallback`);
      rateLimited = true;
    } else {
      // Fallback: extract githubStars from tools.ts
      const blockRegex = new RegExp(`id:\\s*"${toolId}"[\\s\\S]*?githubStars:\\s*(\\d+)`);
      const blockMatch = content.match(blockRegex);
      if (blockMatch) {
        const fallbackStars = parseInt(blockMatch[1]);
        starsMap[toolId] = { stars: fallbackStars, success: false, error: 'fallback', fetchedAt: now };
        fallbackCount++;
        console.error(`  📦 ${toolId}: fallback ${fallbackStars.toLocaleString()} ⭐`);
      } else {
        console.error(`  ❌ ${toolId}: no data`);
        starsMap[toolId] = { stars: 0, success: false, error: info.error };
      }
    }
    
    if (i < repoList.length - 1 && !rateLimited) {
      await new Promise(r => setTimeout(r, REQUEST_DELAY));
    }
  }

  // Build new github-stars.json
  const newStars = {};
  const newSnapshots = {};
  
  for (const [toolId, repo] of repoList) {
    const info = starsMap[toolId];
    if (info && info.stars > 0) {
      newStars[toolId] = {
        stars: info.stars,
        forks: info.forks || currentStars[toolId]?.forks || 0,
        language: info.language || currentStars[toolId]?.language || null,
        createdAt: info.createdAt || currentStars[toolId]?.createdAt || null,
        updatedAt: info.updatedAt || currentStars[toolId]?.updatedAt || null,
        fetchedAt: now,
        previousStars: previousSnapshot[toolId]?.stars || null,
        delta: previousSnapshot[toolId] ? info.stars - (previousSnapshot[toolId].stars || 0) : null
      };
      newSnapshots[toolId] = {
        stars: info.stars,
        forks: info.forks || 0,
        fetchedAt: now
      };
    } else if (currentStars[toolId]) {
      // Keep old data if fetch failed
      newStars[toolId] = {
        ...currentStars[toolId],
        fetchedAt: now,
        delta: previousSnapshot[toolId] ? (currentStars[toolId].stars - (previousSnapshot[toolId].stars || 0)) : null
      };
      newSnapshots[toolId] = previousSnapshot[toolId] || { stars: currentStars[toolId].stars, fetchedAt: now };
    }
  }

  const starsJson = {
    fetchedAt: now,
    totalRepos: repoList.length,
    successCount: successCount,
    errors: {},
    stars: newStars
  };

  fs.writeFileSync(STARS_FILE, JSON.stringify(starsJson, null, 2));
  console.error(`\n📊 Wrote ${Object.keys(newStars).length} entries to github-stars.json`);

  // Save history snapshot
  const historyJson = {
    description: 'GitHub stars 历史快照',
    fetchedAt: now,
    snapshots: newSnapshots
  };
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyJson, null, 2));

  // Update tools.ts - sort by stars
  const toolsArrayStart = content.indexOf('export const tools: Tool[] = [');
  const beforeTools = content.slice(0, toolsArrayStart);
  const toolsMatch = content.match(/export const tools:\s*Tool\[\]\s*=\s*\[([\s\S]*)\];\s*$/m);
  if (!toolsMatch) { console.error('ERROR: tools array not found'); process.exit(1); }

  const toolsContent = toolsMatch[1];
  const toolBlocks = [];
  let depth = 0, current = [];
  for (const line of toolsContent.split('\n')) {
    current.push(line);
    depth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    if (depth <= 0 && current.length > 0) {
      const block = current.join('\n');
      if (block.trim().startsWith('{')) toolBlocks.push(block);
      current = []; depth = 0;
    }
  }

  // Update githubStars in each tool
  let updatedCount = 0;
  const updatedBlocks = toolBlocks.map(block => {
    const idMatch = block.match(/\bid:\s*"([^"]+)"/);
    if (!idMatch) return block;
    const toolId = idMatch[1];
    const info = starsMap[toolId];
    if (!info || info.stars <= 0) return block;

    if (/githubStars:\s*\d+/.test(block)) {
      return block.replace(/githubStars:\s*\d+/, `githubStars: ${info.stars}`);
    } else {
      const lines = block.split('\n');
      let insertIdx = lines.length - 1;
      for (let i = lines.length - 1; i >= 0; i--) {
        const trimmed = lines[i].trim();
        if (trimmed && !trimmed.startsWith('//') && trimmed !== '}' && !trimmed.startsWith('},')) {
          insertIdx = i; break;
        }
      }
      const indent = lines[insertIdx].match(/^(\s*)/)[1];
      lines.splice(insertIdx + 1, 0, `${indent}githubStars: ${info.stars},`);
      updatedCount++;
      return lines.join('\n');
    }
  });

  // Sort by stars descending
  const getStars = (b) => { const m = b.match(/githubStars:\s*(\d+)/); return m ? parseInt(m[1]) : 0; };
  updatedBlocks.sort((a, b) => getStars(b) - getStars(a));

  const result = beforeTools + 'export const tools: Tool[] = [\n' + updatedBlocks.join('\n') + '\n];\n';
  fs.writeFileSync(TOOLS_FILE, result);

  console.error(`\n📋 Summary:`);
  console.error(`   API fetched: ${successCount}`);
  console.error(`   Fallback: ${fallbackCount}`);
  console.error(`   Tools updated: ${updatedCount}`);
  console.error(`   Total entries: ${Object.keys(newStars).length}`);
  console.error(`   Trends: ${Object.values(newStars).filter(s => s.delta !== null && s.delta !== 0).length} tools with delta`);
  
  // Show top gainers
  const gainers = Object.entries(newStars)
    .filter(([, s]) => s.delta && s.delta > 0)
    .sort((a, b) => (b[1].delta || 0) - (a[1].delta || 0))
    .slice(0, 5);
  if (gainers.length > 0) {
    console.error('\n📈 Top gainers (since last check):');
    for (const [id, s] of gainers) {
      console.error(`   ${id}: +${s.delta.toLocaleString()} ⭐ (${s.stars.toLocaleString()} total)`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
