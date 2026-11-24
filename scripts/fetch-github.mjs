// 抓 GitHub 公开贡献页写入 src/data/activity/github.json。
// 失败或解析为空时不写文件、退出码 0：构建沿用仓库里上一次的数据。
// 本机：NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 node scripts/fetch-github.mjs
import { writeFileSync } from 'node:fs';
import { parseContributions, shouldWrite, beijingDate } from '../src/lib/activity.mjs';

const URL = process.env.GITHUB_CONTRIB_URL ?? 'https://github.com/users/ching7/contributions';
const OUT = 'src/data/activity/github.json';

try {
  const res = await fetch(URL, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const days = parseContributions(await res.text());
  if (!shouldWrite(days)) throw new Error(`只解析出 ${days.length} 天，页面可能改版了`);
  writeFileSync(OUT, JSON.stringify({ updatedAt: beijingDate(), days }) + '\n');
  console.log(`GitHub 活跃度：${days.length} 天，${days.filter((d) => d.level > 0).length} 天有提交`);
} catch (e) {
  console.warn(`⚠ GitHub 活跃度抓取失败，沿用旧数据：${e.message}`);
}
