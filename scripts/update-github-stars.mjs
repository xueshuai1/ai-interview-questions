#!/usr/bin/env node
/**
 * 自动更新 tools.ts 中所有 GitHub 工具的 stars 数据
 * 
 * 规则：
 * 1. 只有请求到有效数据（stars > 0）才更新，否则保留旧值
 * 2. 每个 GitHub 工具必须有 githubStars 字段
 * 3. 更新后自动按 stars 降序排序
 * 
 * 运行：node scripts/update-github-stars.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

const TOOLS_FILE = path.join(process.cwd(), 'src/data/tools.ts');
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
            resolve({ stars: j.stargazers_count || 0, createdAt: j.created_at || null, success: true });
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
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  
  // Extract GitHub repos from tools
  const urlRegex = /url:\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+)"/g;
  const repos = new Set();
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    repos.add(`${m[1]}/${m[2]}`);
  }
  const repoList = [...repos];
  console.error(`Found ${repoList.length} GitHub repos`);

  // Fetch stars
  const starsMap = {};
  let rateLimited = false;
  for (let i = 0; i < repoList.length; i++) {
    if (rateLimited) break;
    const repo = repoList[i];
    const info = await fetchRepoInfo(repo);
    if (info.success) {
      starsMap[repo] = info;
      console.error(`  ✅ ${repo}: ${info.stars.toLocaleString()} ⭐`);
    } else if (info.error === 'rate_limited') {
      console.error(`  🚫 Rate limited at ${i}/${repoList.length}`);
      rateLimited = true;
    }
    if (i < repoList.length - 1 && !rateLimited) {
      await new Promise(r => setTimeout(r, REQUEST_DELAY));
    }
  }

  const successCount = Object.keys(starsMap).length;
  if (successCount === 0) {
    console.error('❌ No data fetched, aborting update');
    process.exit(1);
  }

  // Parse tools, update stars, sort
  const toolsArrayStart = content.indexOf('export const tools: Tool[] = [');
  const beforeTools = content.slice(0, toolsArrayStart);
  
  const toolsMatch = content.match(/export const tools:\s*Tool\[\]\s*=\s*\[([\s\S]*)\];\s*$/m);
  if (!toolsMatch) {
    console.error('ERROR: Could not find tools array');
    process.exit(1);
  }

  // Split into tool blocks (handling nested braces)
  const toolsContent = toolsMatch[1];
  const toolBlocks = [];
  let depth = 0, current = [];
  for (const line of toolsContent.split('\n')) {
    current.push(line);
    depth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    if (depth <= 0 && current.length > 0) {
      const block = current.join('\n');
      if (block.trim().startsWith('{')) toolBlocks.push(block);
      current = [];
      depth = 0;
    }
  }

  // Update each tool's githubStars
  let updatedCount = 0;
  const updatedBlocks = toolBlocks.map(block => {
    const urlMatch = block.match(/url:\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+)"/);
    if (!urlMatch) return block;
    
    const repo = `${urlMatch[1]}/${urlMatch[2]}`;
    const info = starsMap[repo];
    if (!info || !info.success) return block;

    // Update or add githubStars
    if (/githubStars:\s*\d+/.test(block)) {
      return block.replace(/githubStars:\s*\d+/, `githubStars: ${info.stars}`);
    } else {
      // Add githubStars before the closing }
      const lines = block.split('\n');
      let insertIdx = lines.length - 1;
      for (let i = lines.length - 1; i >= 0; i--) {
        const trimmed = lines[i].trim();
        if (trimmed && !trimmed.startsWith('//') && trimmed !== '}' && !trimmed.startsWith('},')) {
          insertIdx = i;
          break;
        }
      }
      const indent = lines[insertIdx].match(/^(\s*)/)[1];
      lines.splice(insertIdx + 1, 0, `${indent}githubStars: ${info.stars},`);
      updatedCount++;
      return lines.join('\n');
    }
  });

  // Sort by stars descending
  const getStars = (b) => {
    const m = b.match(/githubStars:\s*(\d+)/);
    return m ? parseInt(m[1]) : 0;
  };
  updatedBlocks.sort((a, b) => getStars(b) - getStars(a));

  const result = beforeTools + 'export const tools: Tool[] = [\n' + updatedBlocks.join('\n') + '\n];\n';
  fs.writeFileSync(TOOLS_FILE, result);

  console.error(`\n📊 Updated: ${successCount} repos fetched, ${updatedCount} tools updated`);
  console.error(`✅ tools.ts sorted by stars`);
}

main().catch(e => { console.error(e); process.exit(1); });
