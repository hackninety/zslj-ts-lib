// 构建：tsc 产出 ESM + d.ts，随后确保 data/*.json 落入 dist
import { execSync } from 'node:child_process';
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
// 先生成典籍数据（src/data/docs.json），供 index.ts 导入
execSync('node scripts/gen-docs.mjs', { cwd: root, stdio: 'inherit' });
execSync('npx tsc -p tsconfig.build.json', { cwd: root, stdio: 'inherit' });
cpSync(path.join(root, 'src/data'), path.join(dist, 'data'), { recursive: true });
console.log('build ok: dist/');
