#!/usr/bin/env node
/**
 * 工具集自动更新脚本
 * 
 * 功能：
 * 1. 运行 discover-topic-projects.mjs 发现遗漏项目
 * 2. 如果有遗漏项目，自动添加到 tools.ts
 * 3. 提交并推送
 * 
 * 运行：node scripts/auto-update-tools.mjs
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function run(cmd) {
  console.log(`🔧 ${cmd}`);
  try {
    return execSync(cmd, { cwd: ROOT, stdio: 'pipe' }).toString();
  } catch (e) {
    return e.stdout?.toString() || e.stderr?.toString() || '';
  }
}

function main() {
  console.log('🚀 开始自动更新工具集...\n');
  
  // 1. 运行发现脚本
  console.log('📡 步骤 1: 扫描 GitHub Topics 发现遗漏项目...');
  try {
    run('node scripts/discover-topic-projects.mjs');
  } catch (e) {
    console.error('❌ 发现脚本运行失败');
    process.exit(1);
  }
  
  // 2. 读取报告
  const reportPath = path.join(ROOT, 'data/missing-projects-report.json');
  if (!existsSync(reportPath)) {
    console.log('📭 没有生成报告，跳过');
    process.exit(0);
  }
  
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const missingCount = report.missingCount || 0;
  
  console.log(`\n📊 发现 ${missingCount} 个遗漏项目`);
  
  if (missingCount === 0) {
    console.log('✅ 工具集已是最新，无需添加');
    process.exit(0);
  }
  
  // 3. 运行批量添加脚本
  console.log('\n📦 步骤 2: 批量添加遗漏项目到 tools.ts...');
  try {
    const output = run('node scripts/batch-add-tools.mjs');
    console.log(output);
  } catch (e) {
    console.error('❌ 批量添加失败');
    process.exit(1);
  }
  
  // 4. 验证编译
  console.log('\n✅ 步骤 3: 验证 TypeScript 编译...');
  const tscOutput = run('npx tsc --noEmit 2>&1');
  if (tscOutput.trim()) {
    console.error('❌ TypeScript 编译失败：');
    console.error(tscOutput);
    process.exit(1);
  }
  console.log('✅ 编译通过');
  
  // 5. 提交并推送
  console.log('\n📤 步骤 4: 提交并推送...');
  run('git add src/data/tools.ts');
  const commitMsg = `feat: 自动收录 ${missingCount} 个遗漏 AI 工具（GitHub Topics 扫描）`;
  const commitOutput = run(`git commit -m "${commitMsg}"`);
  console.log(commitOutput);
  
  const pushOutput = run('git push');
  console.log(pushOutput);
  
  console.log(`\n🎉 工具集自动更新完成！新增 ${missingCount} 个工具`);
}

main();
