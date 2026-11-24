# 写作与维护

## 本地开发

    npm install
    npm run dev          # http://localhost:4321
    npm test             # 单元测试 → 构建 → 产物检查
    npm run test:fold    # 首屏测试：两种首页在 1280×720 / 1440×900 下不滚动（需本机装有 Chrome）

## 加一篇笔记

在 `src/content/notes/<分类目录>/` 下新建 `xxx.md`，frontmatter：

    ---
    title: "标题"
    date: 2026-11-24
    draft: false
    ---

URL 是 `/posts/<分类目录>/<文件名>/`（全部小写）。图片放 `public/images/<分类目录>/`，正文用 `/images/...` 引用。

## 改首页 / 展区文案

- 首页物件：`src/data/desk.mjs`；欢迎语：`src/data/greetings.mjs`（不要出现名字）
- 仓库点评：`src/data/repos.mjs`；About 正文：`src/data/about.md`（两者都原文照搬 GitHub 个人主页 README）
- 还没定稿的话用 `<Draft>…</Draft>` 包住。`npm run build && npm run check:drafts` 会列出所有「待确认」；**有待确认文案时 CI 不会部署**。

## 动态表情

清单在 `src/data/emoji.mjs`。新增前先确认 `https://fonts.gstatic.com/s/e/notoemoji/latest/<码点>/512.webp` 存在，再跑：

    env -u https_proxy -u http_proxy NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 node scripts/fetch-emoji.mjs

## 活跃度（首页「最近有没有偷懒」）

- **GitHub**：CI 每天北京时间 02:00 自动抓一次并重新部署。本机手动：
  `env -u https_proxy -u http_proxy NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 npm run fetch:github`
  （小写的 `https_proxy` 优先级更高，必须去掉，否则不走 VPN）
- **linux.do**：Cloudflare 拦脚本，只能本机跑，会弹出一个独立的 Chrome：
  `npm run fetch:linuxdo`（只更新文件）或 `npm run fetch:linuxdo -- --commit`（更新并提交推送）。
  每天自动跑：`nohup scripts/linuxdo-loop.sh >/dev/null 2>&1 &`；停：`kill -INT -$(cat .cache/linuxdo-loop.pgid)`；日志 `.cache/linuxdo-loop.log`。
  不要做成 launchd（访问不了 `~/Downloads`）。

## 发布

    git push github main

push 后 GitHub Actions 自动构建、测试、检查草稿并部署到 Cloudflare Pages。
