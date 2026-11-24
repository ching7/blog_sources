// 用本机 Chrome 打开 linux.do（过 Cloudflare 人机验证），取 ching7 的公开统计写入 src/data/activity/linuxdo.json。
// 用法：npm run fetch:linuxdo            只更新文件
//       npm run fetch:linuxdo -- --commit  更新后提交并推送（数据没变则跳过）
// 弹出的 Chrome 若停在验证页，手动点一下即可；登录状态与验证 cookie 保存在 .cache/linuxdo-profile。
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { summarizeLinuxdo } from '../src/lib/activity.mjs';
import { gitPlan } from './linuxdo-git.mjs';

const USER = 'ching7';
const OUT = 'src/data/activity/linuxdo.json';
const commit = process.argv.includes('--commit');

// Playwright 自己拉起的浏览器带自动化标记，会被 Cloudflare 一直拦在验证页；
// 所以先按普通方式启动 Chrome（独立的 .cache/linuxdo-profile），再经调试端口接上去。
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${resolve('.cache/linuxdo-profile')}`,
  '--no-first-run',
  '--no-default-browser-check',
  `https://linux.do/u/${USER}/summary`,
], { stdio: 'ignore' });

async function connect() {
  for (let i = 0; i < 40; i++) {
    try { return await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`); } catch { await new Promise((r) => setTimeout(r, 500)); }
  }
  throw new Error('连不上 Chrome 调试端口');
}

let data;
const browser = await connect();
try {
  const page = browser.contexts()[0].pages().find((p) => p.url().includes('linux.do')) ?? browser.contexts()[0].pages()[0];
  // 最多等 3 分钟：期间如果停在人机验证页，手动点一下
  let summary, user;
  for (let i = 0; i < 90 && !summary; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    [summary, user] = await page.evaluate(async (u) => {
      const get = async (p) => { const r = await fetch(p, { headers: { accept: 'application/json' } }); return r.ok ? r.json() : null; };
      return [await get(`/u/${u}/summary.json`), await get(`/u/${u}.json`)];
    }, USER).catch(() => [null, null]);
    if (i === 5 && !summary) console.log('还没拿到数据：如果 Chrome 停在验证页，请手动点一下');
  }
  if (!summary || !user) throw new Error('3 分钟内没能通过 linux.do 的验证');
  data = summarizeLinuxdo(summary, user, new Date().toISOString());
} finally {
  await browser.close().catch(() => {});
  chrome.kill();
}

const before = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
const after = JSON.stringify(data, null, 2) + '\n';
// 只有日期变了不算变化
const same = before && JSON.stringify({ ...JSON.parse(before), updatedAt: 0 }) === JSON.stringify({ ...data, updatedAt: 0 });
writeFileSync(OUT, after);
console.log(`linux.do：${data.days} 天 · ${data.hours} 小时 · ${data.postsRead} 帖 · 等级 ${data.trustLevel}`);

if (commit && !same) {
  const sh = (...a) => execFileSync(a[0], a.slice(1), { encoding: 'utf8' }).trim();
  const branch = sh('git', 'rev-parse', '--abbrev-ref', 'HEAD');
  const dirtyOthers = sh('git', 'status', '--porcelain').split('\n').some((l) => l && !l.endsWith(OUT));
  for (const [cmd, ...args] of gitPlan({ branch, dirtyOthers, day: data.updatedAt.replaceAll('-', ''), file: OUT })) {
    execFileSync(cmd, args, { stdio: 'inherit' });
  }
  if (branch !== 'main' || dirtyOthers) console.log(`已提交但没推送：当前分支 ${branch}${dirtyOthers ? '，工作区还有别的改动' : ''}`);
} else if (commit) {
  console.log('数据没变，不提交');
}
