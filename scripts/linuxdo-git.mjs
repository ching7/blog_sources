/**
 * linux.do 数据更新后的 git 步骤：只提交数据文件本身（带 pathspec，不会带上别人已暂存的改动）；
 * 只有在 main 分支、且工作区没有其它改动时才推送。
 */
export function gitPlan({ branch, dirtyOthers, day, file }) {
  const plan = [['git', 'commit', '-m', `chore:[${day}] 更新 linux.do 活跃度`, '--', file]];
  if (branch === 'main' && !dirtyOthers) plan.push(['git', 'push']);
  return plan;
}
