import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import { EMOJI, emojiSrc } from '../../src/data/emoji.mjs';

test('清单里每个表情都已下载且不超过 300KB', () => {
  for (const code of Object.values(EMOJI)) {
    const st = statSync(`public/emoji/${code}.webp`);
    assert.ok(st.size < 300 * 1024, `${code} ${st.size}`);
  }
});

test('emojiSrc 返回站内路径', () => {
  assert.equal(emojiSrc('cat'), '/emoji/1f431.webp');
});

test('emojiSrc 拼写错误会抛错', () => {
  assert.throws(() => emojiSrc('nope'));
});
