// Google Noto Animated Emoji（CC BY 4.0），自托管在 public/emoji/<码点>.webp（192px 跳帧压缩，另有 .still.webp 单帧静态版）。
// 只收录 2026-11-24 确认有动态版的码点；新增前先确认 fonts.gstatic.com/s/e/notoemoji/latest/<码点>/512.webp 存在。
export const EMOJI = {
  gift: '1f381',
  rainbow: '1f308',
  rocket: '1f680',
  sauropod: '1f995',
  fire: '1f525',
  cat: '1f431',
  catGrin: '1f63a',
  catSmirk: '1f63c',
  catWeary: '1f640',
  sparkles: '2728',
  eyes: '1f440',
  tea: '2615',
  thinking: '1f914',
  mindBlown: '1f92f',
  alien: '1f47e',
  cool: '1f60e',
  crystal: '1f52e',
  party: '1f973',
  collision: '1f4a5',
  broom: '1f9f9',
  upsideDown: '1f643',
};

export function emojiSrc(name) {
  const code = EMOJI[name];
  if (!code) throw new Error(`未知表情：${name}`);
  return `/emoji/${code}.webp`;
}
