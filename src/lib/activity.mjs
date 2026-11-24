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
