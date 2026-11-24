/** 从 github.com/users/<u>/contributions 的 HTML 里取每天的提交等级，按日期升序。 */
export function parseContributions(html) {
  const days = [];
  for (const [tag] of html.matchAll(/<td\b[^>]*\bdata-date="\d{4}-\d{2}-\d{2}"[^>]*>/g)) {
    const date = tag.match(/data-date="([^"]+)"/)[1];
    const level = tag.match(/data-level="([0-4])"/);
    if (level) days.push({ date, level: Number(level[1]) });
  }
  return days.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** 过万写成「2.4 万」。 */
export function formatCount(n) {
  if (n < 10000) return String(n);
  return `${(n / 10000).toFixed(1).replace(/\.0$/, '')} 万`;
}

/** linux.do 的 summary.json + <user>.json → 打卡本要展示的几个数字。 */
export function summarizeLinuxdo(summary, user, fetchedAt) {
  const s = summary.user_summary;
  return {
    days: s.days_visited,
    hours: Math.round(s.time_read / 3600),
    postsRead: formatCount(s.posts_read_count),
    trustLevel: user.user.trust_level,
    joined: user.user.created_at.slice(0, 7),
    updatedAt: fetchedAt.slice(0, 10),
  };
}

/** 两个数据源的更新日期取较旧的：CI 每天刷新 GitHub，不能让手动更新的 linux.do 数字看起来也是今天的。 */
export function staleDate(a, b) {
  return a < b ? a : b;
}

/** 至少 300 天才算解析成功：GitHub 页面半改版时宁可沿用旧数据，也不写入残缺的一小段。 */
export function shouldWrite(days) {
  return days.length >= 300;
}

/** 北京时间（UTC+8）的日期 YYYY-MM-DD：CI 在北京时间 02:00 跑，用 UTC 会显示成前一天。 */
export function beijingDate(now = new Date()) {
  return new Date(now.getTime() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}
