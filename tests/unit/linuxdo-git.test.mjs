import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gitPlan } from '../../scripts/linuxdo-git.mjs';

const FILE = 'src/data/activity/linuxdo.json';

test('只提交数据文件本身（带 pathspec），main 且干净时推送', () => {
  const plan = gitPlan({ branch: 'main', dirtyOthers: false, day: '20261124', file: FILE });
  assert.deepEqual(plan, [
    ['git', 'commit', '-m', 'chore:[20261124] 更新 linux.do 活跃度', '--', FILE],
    ['git', 'push'],
  ]);
});

test('不在 main 上：只提交，不推送', () => {
  const plan = gitPlan({ branch: 'feat/x', dirtyOthers: false, day: '20261124', file: FILE });
  assert.equal(plan.length, 1);
  assert.deepEqual(plan[0].slice(-2), ['--', FILE]);
});

test('工作区还有别的改动：只提交，不推送', () => {
  const plan = gitPlan({ branch: 'main', dirtyOthers: true, day: '20261124', file: FILE });
  assert.equal(plan.length, 1);
});
