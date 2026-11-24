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

test('首页：无名字、有欢迎语、四件物件、打卡本、猫、切换按钮', () => {
  const html = readDist('index.html');
  assert.doesNotMatch(html, /\u9648\u4e9a\u7537/);
  assert.match(html, /嗯？你也走到/); // GREETINGS[0] 服务端渲染
  for (const h of ['/repos/', '/aesthetics/', '/explore/', '/notes/']) assert.match(html, new RegExp(`href="${h}"`));
  assert.match(html, /最近有没有偷懒/);
  assert.match(html, /更新于 \d{4}-\d{2}-\d{2}/);
  assert.match(html, /戳我/);
  assert.match(html, /href="\/about\/"/);
  assert.match(html, /<a[^>]*class="[^"]*\bmode-switch\b[^"]*"[^>]*href="\/desk\/"|<a[^>]*href="\/desk\/"[^>]*class="[^"]*\bmode-switch\b/);
});

test('热闹版存在、无名字、能回到简约', () => {
  const html = readDist('desk/index.html');
  assert.doesNotMatch(html, /\u9648\u4e9a\u7537/);
  assert.match(html, /<a[^>]*class="[^"]*\bmode-switch\b[^"]*"[^>]*href="\/"|<a[^>]*href="\/"[^>]*class="[^"]*\bmode-switch\b/);
  assert.match(html, /最近有没有偷懒/);
  assert.match(html, /戳我/);
});

test('首页图片只引用自托管资源', () => {
  for (const f of ['index.html', 'desk/index.html']) assert.doesNotMatch(readDist(f), /<img[^>]+src="https?:\/\//, f);
});

test('展区页都存在', () => {
  for (const p of ['repos', 'aesthetics', 'explore', 'about', 'notes']) readDist(`${p}/index.html`);
  readDist('404.html');
});

test('仓库点评原文', () => {
  assert.match(readDist('repos/index.html'), /PPT 转 MP4 小工具，TTS \+ FFmpeg 拼出来的，意外多人 star/);
});

test('About 自述与代表项目原文', () => {
  const html = readDist('about/index.html');
  assert.match(html, /发现 OOM 没躲过去，只是变成了显存版/);
  assert.match(html, /金融行业智能体平台/);
  assert.match(html, /技能矩阵/);
});

test('404 有猫和回桌面的路', () => {
  const html = readDist('404.html');
  assert.match(html, /推下/);
  assert.match(html, /href="\/"/);
  assert.match(html, /data-cat404/);
});

test('简约首页悬停表情不随首屏下载（只有 data-src）', () => {
  const html = readDist('index.html');
  const pops = html.match(/<img[^>]*class="pop[^"]*"[^>]*>/g) ?? [];
  assert.equal(pops.length, 4);
  for (const p of pops) {
    assert.doesNotMatch(p, /\ssrc=/, p);
    assert.match(p, /data-src="\/emoji\//, p);
  }
});

test('页面带「减弱动态效果时换静态表情」的脚本', () => {
  for (const f of ['index.html', 'desk/index.html', 'about/index.html', '404.html'])
    assert.match(readDist(f), /data-still-emoji/, f);
});

test('全站不出现名字、公司等个人信息', () => {
  const PRIVATE = /\u9648\u4e9a\u7537|\u4e9a\u7537|cheny\x6e|chen\x79anan|ching\x37777|\u8baf\u98de|ifly\x74ek|hund\x73un|\u6052\u751f|jres\x63loud|7756086\x398|ching\x5fvip/i;
  for (const f of listDist().filter((f) => f.endsWith('.html'))) {
    const m = readDist(f).match(PRIVATE);
    assert.equal(m, null, `${f}: ${m?.[0]}`);
  }
  assert.doesNotMatch(readDist('about/index.html'), /公司/);
});
