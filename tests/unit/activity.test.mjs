import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parseContributions, formatCount, summarizeLinuxdo } from '../../src/lib/activity.mjs';

test('解析真实贡献页', () => {
  const days = parseContributions(readFileSync('tests/fixtures/contributions.html', 'utf8'));
  assert.ok(days.length >= 365, String(days.length));
  assert.ok(days.every((d, i) => i === 0 || d.date > days[i - 1].date));
  assert.ok(days.every((d) => d.level >= 0 && d.level <= 4));
  assert.ok(days.some((d) => d.level > 0));
});

test('改版后解析为空', () => assert.deepEqual(parseContributions('<html></html>'), []));

test('formatCount', () => {
  assert.equal(formatCount(9999), '9999');
  assert.equal(formatCount(24013), '2.4 万');
  assert.equal(formatCount(20000), '2 万');
});

test('summarizeLinuxdo', () => {
  const r = summarizeLinuxdo(
    { user_summary: { days_visited: 102, time_read: 141560, posts_read_count: 24013 } },
    { user: { trust_level: 2, created_at: '2026-06-10T08:33:19.825Z' } },
    '2026-11-24T03:13:00Z',
  );
  assert.deepEqual(r, { days: 102, hours: 39, postsRead: '2.4 万', trustLevel: 2, joined: '2026-06', updatedAt: '2026-11-24' });
});

test('抓取失败不覆盖已有数据，退出码 0', () => {
  const before = readFileSync('src/data/activity/github.json', 'utf8');
  execFileSync('node', ['scripts/fetch-github.mjs'], { env: { ...process.env, GITHUB_CONTRIB_URL: 'http://127.0.0.1:9/' }, stdio: 'pipe' });
  assert.equal(readFileSync('src/data/activity/github.json', 'utf8'), before);
});

test('打卡本的「更新于」取较旧的那个日期', async () => {
  const { staleDate } = await import('../../src/lib/activity.mjs');
  assert.equal(staleDate('2026-11-30', '2026-11-24'), '2026-11-24');
  assert.equal(staleDate('2026-10-01', '2026-11-24'), '2026-10-01');
});

test('解析出的天数太少（页面半改版）不写入', async () => {
  const { shouldWrite } = await import('../../src/lib/activity.mjs');
  assert.equal(shouldWrite(Array(7).fill({})), false);
  assert.equal(shouldWrite(Array(299).fill({})), false);
  assert.equal(shouldWrite(Array(365).fill({})), true);
});

test('更新日期按北京时间', async () => {
  const { beijingDate } = await import('../../src/lib/activity.mjs');
  assert.equal(beijingDate(new Date('2026-11-23T18:00:00Z')), '2026-11-24');
  assert.equal(beijingDate(new Date('2026-11-23T15:59:00Z')), '2026-11-23');
});
