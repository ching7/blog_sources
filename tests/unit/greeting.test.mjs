import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextGreetingIndex } from '../../src/lib/greeting.mjs';
import { GREETINGS } from '../../src/data/greetings.mjs';
import { EMOJI } from '../../src/data/emoji.mjs';
import { PALETTE } from '../../src/lib/accent.mjs';

test('不会返回当前下标', () => {
  for (let i = 0; i < 200; i++) assert.notEqual(nextGreetingIndex(3, 8, Math.random), 3);
});

test('结果总在范围内', () => {
  for (const r of [0, 0.5, 0.999999]) {
    const n = nextGreetingIndex(7, 8, () => r);
    assert.ok(n >= 0 && n < 8 && n !== 7, String(n));
  }
});

test('只有一条时返回 0', () => assert.equal(nextGreetingIndex(0, 1, Math.random), 0));

test('问候语里没有名字，表情都在清单里', () => {
  assert.ok(GREETINGS.length >= 8);
  for (const g of GREETINGS) {
    assert.doesNotMatch(g.text, /\u9648\u4e9a\u7537|\u4e9a\u7537/);
    assert.ok(EMOJI[g.emoji], g.emoji);
  }
});

test('调色板 8 色，山吹在首位', () => {
  assert.equal(PALETTE.length, 8);
  assert.deepEqual(PALETTE[0], { name: '山吹', hex: '#FFB11B' });
});

test('splitGreeting 把句末标点前的最多 4 个字标成荧光笔', async () => {
  const { splitGreeting } = await import('../../src/lib/greeting.mjs');
  assert.deepEqual(splitGreeting('今天也没有 OOM，真好。'), ['今天也没有 OOM，', '真好', '。']);
  assert.deepEqual(splitGreeting('泡杯茶，随便翻。'), ['泡杯茶，', '随便翻', '。']);
  assert.deepEqual(splitGreeting('嗯？你也走到这儿来了。'), ['嗯？你也走到', '这儿来了', '。']);
  assert.deepEqual(splitGreeting('你是今天第一个……大概吧。'), ['你是今天第一个……', '大概吧', '。']);
});
