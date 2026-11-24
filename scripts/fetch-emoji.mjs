// 下载 Noto 动态表情并压缩，存 public/emoji/<码点>.webp；已存在则跳过。
// 原图 512px、约 70 帧、500–700KB；直接重编码反而更大。做法：缩到 192px（最大显示 96px，覆盖 2 倍屏），
// 隔一帧取一帧并把被丢帧的时长并入保留帧（动画总时长不变），再以 q60 编码，单张约 100–200KB。
// 运行：NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 node scripts/fetch-emoji.mjs
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { EMOJI } from '../src/data/emoji.mjs';

const SIZE = 192;
const STEP = 2;
const QUALITY = 60;
mkdirSync('public/emoji', { recursive: true });

async function shrink(buf) {
  const meta = await sharp(buf, { animated: true }).metadata();
  const { data, info } = await sharp(buf, { animated: true }).resize(SIZE).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.pageHeight ?? SIZE;
  const n = meta.pages ?? 1;
  const frameBytes = w * h * 4;
  const frames = [];
  const delay = [];
  for (let i = 0; i < n; i += STEP) {
    frames.push(data.subarray(i * frameBytes, (i + 1) * frameBytes));
    let d = 0;
    for (let j = i; j < Math.min(i + STEP, n); j++) d += meta.delay?.[j] ?? 40;
    delay.push(d);
  }
  return sharp(Buffer.concat(frames), { raw: { width: w, height: h * frames.length, channels: 4, pageHeight: h } })
    .webp({ quality: QUALITY, alphaQuality: QUALITY, effort: 6, delay, loop: 0 })
    .toBuffer();
}

let failed = 0;
for (const [name, code] of Object.entries(EMOJI)) {
  const out = `public/emoji/${code}.webp`;
  if (existsSync(out)) continue;
  const res = await fetch(`https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/512.webp`);
  if (!res.ok) { console.error(`✗ ${name} ${code}: ${res.status}`); failed++; continue; }
  writeFileSync(out, await shrink(Buffer.from(await res.arrayBuffer())));
  console.log(`✓ ${name} ${code} ${(statSync(out).size / 1024).toFixed(0)}KB`);
}
process.exit(failed ? 1 : 0);
