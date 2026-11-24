import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const run = (dir) => spawnSync('node', ['scripts/check-drafts.mjs', dir], { encoding: 'utf8' });

test('有待确认文案时退出码 1 并列出页面', () => {
  const dir = mkdtempSync(join(tmpdir(), 'drafts-'));
  mkdirSync(join(dir, 'about'));
  writeFileSync(join(dir, 'about/index.html'), '<p><span class="draft" data-draft>邮箱</span></p>');
  writeFileSync(join(dir, 'index.html'), '<p>ok</p>');
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /about\/index\.html/);
  assert.doesNotMatch(r.stdout + r.stderr, /^index\.html/m);
});

test('没有时退出码 0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'drafts-'));
  writeFileSync(join(dir, 'index.html'), '<p>ok</p>');
  assert.equal(run(dir).status, 0);
});
