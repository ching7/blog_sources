// 上线前检查：构建产物里还有「待确认」文案（data-draft）就列出页面并以退出码 1 结束。
// 用法：node scripts/check-drafts.mjs [目录，默认 dist]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? 'dist';
const hits = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) {
      const n = (readFileSync(p, 'utf8').match(/\bdata-draft\b/g) ?? []).length;
      if (n) hits.push(`${relative(root, p)}（${n} 处）`);
    }
  }
})(root);

if (hits.length) {
  console.error(`还有待确认的文案，先改定再上线：\n${hits.join('\n')}`);
  process.exit(1);
}
console.log('没有待确认的文案');
