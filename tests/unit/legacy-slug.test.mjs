import { test } from 'node:test';
import assert from 'node:assert/strict';
import { legacySlug } from '../../src/lib/legacy-slug.mjs';

test('大小写混合的路径全部小写', () => {
  assert.equal(legacySlug('05.openSource/12.pptToVideo/pptToVideo'), '05.opensource/12.ppttovideo/ppttovideo');
});
test('_index 映射为所在目录', () => {
  assert.equal(legacySlug('01.dev/_index'), '01.dev');
});
test('普通路径原样', () => {
  assert.equal(legacySlug('04.javalibrary/javalibrary'), '04.javalibrary/javalibrary');
});
