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
