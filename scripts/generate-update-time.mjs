import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 北京时间 UTC+8
const now = new Date();
const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
const formatted = bjTime.toISOString().replace('T', ' ').substring(0, 16);

const content = `// 此文件由构建脚本自动生成，记录最后部署时间\nexport const LAST_UPDATE_TIME = "${formatted}";\n`;

const filePath = join(__dirname, '..', 'src', 'data', 'update-time.ts');
writeFileSync(filePath, content, 'utf-8');
console.log(`✅ 更新时间已生成: ${formatted}`);
