// 把笔记里 ![](https://gitee.com/...) 的图片下载进 public/images/<笔记目录>/，并改写为站内路径。
// 运行：NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 node scripts/localize-images.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';

const NOTES = 'src/content/notes';
const IMG_RE = /!\[([^\]]*)\]\((https:\/\/gitee\.com\/[^)\s]+\.(?:png|jpe?g|gif|webp))\)/gi;

const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') && files.push(p);
  }
})(NOTES);

const failed = [];
let done = 0;
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const relDir = dirname(relative(NOTES, file));
  let out = src;
  for (const [whole, alt, url] of src.matchAll(IMG_RE)) {
    const name = basename(new URL(url).pathname);
    const target = join('public/images', relDir, name);
    if (!existsSync(target)) {
      try {
        const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }, redirect: 'follow' });
        const type = res.headers.get('content-type') ?? '';
        if (!res.ok || !type.startsWith('image/')) throw new Error(`${res.status} ${type}`);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, Buffer.from(await res.arrayBuffer()));
      } catch (e) {
        failed.push(`${file}: ${url} (${e.message})`);
        continue;
      }
    }
    out = out.replace(whole, `![${alt}](/images/${relDir}/${name})`);
    done++;
  }
  if (out !== src) writeFileSync(file, out);
}

console.log(`本地化 ${done} 张图片`);
if (failed.length) {
  console.error(`失败 ${failed.length} 张：\n${failed.join('\n')}`);
  process.exit(1);
}
