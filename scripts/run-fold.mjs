// 构建 → 后台起 astro preview → 跑首屏测试 → 关掉 preview。
import { spawn, execSync } from 'node:child_process';

execSync('npx astro build', { stdio: 'ignore' });
// Astro 7 每个项目只允许一个预览服务，先停掉已在跑的
try { execSync('npx astro preview stop', { stdio: 'ignore' }); } catch {}
const preview = spawn('npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', '4399'], { stdio: 'ignore', detached: true });
let code = 1;
try {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch('http://127.0.0.1:4399/')).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  code = await new Promise((res) => {
    spawn('node', ['--test', 'tests/fold.test.mjs'], { stdio: 'inherit', env: { ...process.env, FOLD_BASE: 'http://127.0.0.1:4399' } }).on('exit', res);
  });
} finally {
  try { process.kill(-preview.pid); } catch {}
  try { execSync('npx astro preview stop', { stdio: 'ignore' }); } catch {}
}
process.exit(code);
