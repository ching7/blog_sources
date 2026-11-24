# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

个人展厅站点（「一张乱桌子」）：Astro 7 静态输出 + 手写 CSS + 原生 JS。设计与计划见 `docs/superpowers/specs/2026-11-23-personal-exhibition-site-design.md` 与 `docs/superpowers/plans/2026-11-24-personal-exhibition-site.md`。日常操作见 `WRITING.md`。

## Commands

- `npm run dev` / `npm run build` / `npm test`（单元 → 构建 → dist 检查）/ `npm run test:fold`（首屏，本地 Chrome）/ `npm run check:drafts`
- 抓数据：`npm run fetch:github`、`npm run fetch:linuxdo`（代理写法见 WRITING.md）

## Architecture

- `src/pages/`：`/` 简约首页、`/desk/` 热闹首页、`/repos/` `/aesthetics/` `/explore/` `/notes/` `/about/`、`/posts/[...slug]`（旧 Hugo 链接，`src/lib/legacy-slug.mjs` 负责小写化）、`404`
- `src/components/`：Card、Tag、Highlight（rough-notation）、Greeting、Cat、PencilCup、ActivityLog、DeskList、HomeControls、SectionHead、Draft
- `src/data/`：desk、greetings、repos、about.md、emoji、activity/*.json；`src/lib/`：纯函数（有单元测试）
- `src/content/notes/`：25 篇旧笔记（content collection，glob loader 自定义 id，别用默认 slugger）
- `scripts/`：fetch-github、fetch-linuxdo（spawn 普通 Chrome + CDP，绕开自动化标记）、fetch-emoji（192px 跳帧压缩）、localize-images、check-drafts、run-fold

## Rules

- 不引 UI 框架、CSS 框架、组件库；新增依赖要写理由。
- 全站不出现名字、公司等个人信息（dist 测试守着）；两种首页的操作位统一：右上猫、左下关于我、右下换色 + 切换按钮（`HomeControls`）。
- 两种首页在 1280×720 下不能滚动（`test:fold` 守着）。
- 文案：仓库点评、About 原文照搬 GitHub README；起草的用 `<Draft>`，CI 会拦。
- 资源全部自托管，不引外部 CDN。

## Deploy notes

- `.github/workflows/deploy.yml`：push main / 每日 cron / 手动；部署 `dist/` 到 Pages 项目 `cyn-blog`（secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`）。
- GitHub remote 是 `github`；gitee 的 `origin` 不跑 Actions。
- 主域名 `southocean.home64.de`（zone 托管在 Cloudflare，NS 由 ipv64 委派），绑在 Pages 项目 `cyn-blog` 上；`astro.config.mjs` 的 `site` 与之一致。
