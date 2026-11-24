import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDist, listDist, fixture } from './helpers.mjs';

test('首页存在且是中文', () => {
  const html = readDist('index.html');
  assert.match(html, /<html lang="zh-CN"/);
});

test('不引用外部字体 CDN', () => {
  for (const f of listDist().filter((f) => /\.(html|css)$/.test(f)))
    assert.doesNotMatch(readDist(f), /fonts\.(gstatic|googleapis)\.com/, f);
});

test('每页有 Noto 署名和 About 入口', () => {
  const html = readDist('index.html');
  assert.match(html, /Noto Emoji/);
  assert.match(html, /href="\/about\/"/);
});

test('旧笔记 URL 全部存在', () => {
  for (const u of fixture('legacy-urls.txt')) readDist(u.slice(1) + 'index.html');
});

test('笔记图片已自托管', () => {
  for (const f of listDist().filter((f) => f.startsWith('posts/') && f.endsWith('.html')))
    assert.doesNotMatch(readDist(f), /<img[^>]+src="https?:\/\/(gitee\.com|192\.168\.)/, f);
});

test('旧搜索/归档有重定向', () => {
  const r = readDist('_redirects');
  for (const p of ['/search/ /notes/ 301', '/archives/ /notes/ 301', '/categories/* /notes/ 301', '/tags/* /notes/ 301'])
    assert.ok(r.includes(p), p);
});
