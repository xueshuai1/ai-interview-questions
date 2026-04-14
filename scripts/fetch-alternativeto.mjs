/**
 * 批量获取 AlternativeTo likes 数据
 * 用法: node scripts/fetch-alternativeto.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 工具 ID -> AlternativeTo slug 映射
const altToMapping = {
  chatgpt: "chatgpt",
  claude: "claude",
  gemini: "google-bard",
  grok: "grok-xai",
  midjourney: "midjourney",
  cursor: "cursor",
  manus: "manus",
  lovable: "lovable",
  replit: "repl-it",
  "claude-code": "claude-code",
  windsurf: "windsurf-codeium",
  devin: "devin-ai",
  "claude-cowork": "claude",
  "google-notebooklm": "google-notebooklm",
  "open-webui": "open-webui",
  aider: "aider",
  "continue-dev": "continue-dev",
  bolt: "bolt-new",
  v0: "v0-dev",
  n8n: "n8n",
  dify: "dify",
  "openrouter": "openrouter",
  "openai-agents-sdk": "openai-agents-sdk",
  khoj: "khoj",
  firecrawl: "firecrawl",
  ragflow: "ragflow",
  letta: "letta-formerly-memgpt",
  "lm-studio": "lm-studio",
  "jetbrains-air": "jetbrains-ai-assistant",
  "mem-ai": "mem",
  "reclaim-ai": "reclaim-ai",
  "hume-ai": "hume-ai",
  suno: "suno",
  "synthesia": "synthesia",
  runway: "runwayml",
  "adobe-firefly": "adobe-firefly",
  "zapier-ai": "zapier",
  "swe-agent": "swe-agent",
  mcp: "model-context-protocol",
};

async function fetchAltTo(slug) {
  try {
    const resp = await fetch(`https://alternativeto.net/software/${slug}/about/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await resp.text();
    const match = html.match(/(\d+)\s*likes/);
    if (match) return parseInt(match[1]);
  } catch (e) {
    // silent
  }
  return null;
}

async function main() {
  const entries = Object.entries(altToMapping);
  console.log(`Fetching ${entries.length} AlternativeTo pages...`);
  
  const results = {};
  const errors = [];

  // Batch fetch with concurrency
  const batchSize = 5;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    console.log(`\nBatch ${Math.floor(i/batchSize)+1}: ${batch.length} tools`);
    
    const promises = batch.map(async ([id, slug]) => {
      const likes = await fetchAltTo(slug);
      if (likes !== null) {
        results[id] = { likes, slug, fetchedAt: new Date().toISOString() };
        console.log(`  ✅ ${id} (${slug}): ${likes} likes`);
      } else {
        errors.push(id);
        console.log(`  ❌ ${id} (${slug}): failed`);
      }
    });
    
    await Promise.all(promises);
    // Rate limit
    if (i + batchSize < entries.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Merge with existing stars
  const starsPath = join(__dirname, '..', 'src', 'data', 'github-stars.json');
  let existing = { stars: {}, altTo: {} };
  try { existing = JSON.parse(readFileSync(starsPath, 'utf-8')); } catch {}

  const output = {
    fetchedAt: new Date().toISOString(),
    githubStars: existing.stars || {},
    alternativeTo: { ...existing.altTo, ...results },
    totalGithubStars: Object.keys(existing.stars || {}).length,
    totalAltTo: Object.keys(results).length,
    errors: errors.length > 0 ? errors : undefined,
  };

  writeFileSync(starsPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Saved ${Object.keys(results).length} AlternativeTo entries`);
  if (errors.length) console.log(`⚠️ ${errors.length} errors: ${errors.join(', ')}`);
}

main().catch(console.error);
