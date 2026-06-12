# 博客迁移设计：VuePress → Hugo + Cloudflare Pages

- **日期**：2026-06-12
- **状态**：已与用户确认方向，待评审
- **作者**：author（user）

## 背景 / 现状

当前仓库 `blog_sources` 是一个 **VuePress 1.x** 静态博客（"Attic.cyn"），内容为中文 Java 学习笔记，按编号分类放在 `docs/` 下：`01.dev`、`02.front`、`03.framework`、`04.javalibrary`、`05.openSource`、`06.javainterview`。当前在 `gh-pages` 分支上既放源码又放构建产物，部署在 GitHub/Gitee Pages。

痛点：
1. GitHub Pages 国内访问需翻墙。
2. 没有自动化构建发布链路。
3. 想要顺畅的「本地写 Markdown → 自动发布」体验。
4. VuePress 1.x 技术栈偏老（node-sass 等老依赖坑多）。

## 目标

- 换到现代、低维护的静态方案，**国内访问更友好**。
- **GitHub Actions 自动构建 → Cloudflare Pages 自动部署**。
- **本地用 Obsidian/Typora/VSCode 写 Markdown，git push 即发布**。
- **迁移并整理历史纯 Markdown 文章**，保留原有 6 大分类。

## 非目标（明确不做）

- 不做在线 CMS / 浏览器后台写作（用户选择本地写）。
- 不迁移 `scanBox` 等 Vue 自定义组件演示页 —— 归档丢弃。
- 不做动态系统（WordPress 等）。
- 不强求保留旧站 URL（旧站为 IP:8080 / Gitee Pages，SEO 包袱低）。
- 暂不做 ICP 备案 + 国内服务器的重方案。

## 关键决策

| 维度 | 选择 | 理由 |
|---|---|---|
| 静态生成器 | **Hugo** | Go 单二进制、构建极快、零 npm 依赖、主题多、中文社区熟；丢弃 Vue 组件后无短板 |
| 主题 | **PaperMod** | 极简极快、自带搜索/深色模式、文档全、开箱即用、专注写作 |
| 托管 | **Cloudflare Pages** | 全球 CDN，国内访问优于 GitHub Pages |
| CI/CD | **GitHub Actions + wrangler** | 用户明确要 GitHub Actions 构建后推 Cloudflare Pages |
| 写作流 | **本地 Markdown + git push** | 用户选择本地软件写作、自动同步 |

## 架构

```
本地 Obsidian/Typora/VSCode 写 .md
        │ git push (main 分支)
        ▼
GitHub Actions
   1. checkout（含 submodule，拉取主题）
   2. setup-hugo（pin 版本，hugo-extended）
   3. hugo --minify  →  public/
   4. cloudflare/wrangler-action 上传 public/
        ▼
Cloudflare Pages  ──全球 CDN──▶  国内访问（建议绑自定义域名）
```

## 1. 仓库与分支策略

- `main` 分支 = 新 Hugo 站点源码 + 全部 Markdown 内容，今后唯一日常分支。
- 旧 VuePress 资产（`docs/.vuepress/`、`config.js`、`enhanceApp.js`、`scanBox` 组件、`package.json` 等）**归档保留**：迁移完成后保留在 `legacy-vuepress` 分支（或 `main` 上的 `legacy/` 目录），不删除、不再维护。
- 构建产物不再进 git（Cloudflare 端构建），废弃 `gh-pages` 分支上的 `dist`。
- 当前实际开发在 `blog-hugo-migration` 分支进行，完成后合入 `main`。

## 2. 历史文章迁移

一次性、可复跑的迁移脚本完成以下工作：

- **抽取纯 Markdown**：从 `docs/` 6 大分类目录抽出 `.md`（排除 `.vuepress/` 和 `superpowers/`），放入 Hugo `content/posts/`，**保留 6 大分类**作为 Hugo `categories`（或一级 section）。
- **frontmatter 转换**（VuePress → Hugo）：

  | Hugo 字段 | 来源 |
  |---|---|
  | `title` | 原 frontmatter title，缺失则取文件首个 H1 或文件名 |
  | `date` | 原 frontmatter date；**缺失则用 git 首次提交时间** `git log --diff-filter=A --format=%aI -- <file>` |
  | `lastmod` | git 最后提交时间（对应原 VuePress lastUpdated） |
  | `categories` | 来自所在分类目录（如 `01.dev` → "后端基础"） |
  | `tags` | 原 tags，无则留空 |
  | `draft` | `false` |

- **图片**：`docs/.vuepress/public/image`、`/icon` 下资源迁到 Hugo `static/`（保持 `/image/...`、`/icon/...` 路径不变，文中引用基本无需改）；必要时按文章做 page bundle。
- **链接修正**：检查并修正文中跨文档相对链接、图片路径在 Hugo 下能正确解析。
- **丢弃归档**：`scanBox`/`tiff` 等组件页不迁。

迁移脚本产物需人工抽查若干篇核对渲染。

## 3. CI/CD（GitHub Actions → Cloudflare Pages）

`.github/workflows/deploy.yml`：

- 触发：push 到 `main`。
- 步骤：checkout（`submodules: recursive`，拉 PaperMod）→ `peaceiris/actions-hugo`（pin extended 版本）→ `hugo --minify`（设置正确 `baseURL`）→ `cloudflare/wrangler-action` 部署 `public/` 到 Pages 项目。
- **所需 GitHub Secrets**：
  - `CLOUDFLARE_API_TOKEN`（Cloudflare 后台 → My Profile → API Tokens，授 Pages 编辑权限）
  - `CLOUDFLARE_ACCOUNT_ID`（Cloudflare 后台首页右侧）
- 交付时附「去 Cloudflare 哪里拿这两个值 + 建 Pages 项目」的图文清单。

> 备选：Cloudflare Pages 也能直接连 GitHub 仓库自行构建。但用户明确要 GitHub Actions 构建后推送，故采用 Actions + wrangler 方案（构建环境可控、可 pin Hugo 版本）。

## 4. 本地写作流

- 新文章：`hugo new posts/<slug>.md`，archetype 模板预填 frontmatter（title/date/draft/categories）。
- 本地预览：`hugo server -D`（含草稿）。
- 发布：编辑器写完 → `git commit && git push` → Actions 自动构建上线。
- 移动端：偶尔用 GitHub 网页版直接改 md 也能触发发布。

## 5. 国内访问的现实约束（需用户知晓）

- Cloudflare Pages 国内访问优于 GitHub Pages，但默认 `*.pages.dev` 在国内仍可能限速/不稳。
- **建议绑自定义域名**（CNAME 指向 Cloudflare，无需备案）通常明显改善访问。
- 唯一「保证稳」是国内服务器 + ICP 备案的重方案，本期不做。
- 结论：先上 Cloudflare + 自定义域名，够用即止。

## 风险 / 待办

- Hugo 版本需 pin，避免主题与 Hugo 不兼容（PaperMod 对 Hugo extended 有最低版本要求）。
- 历史 md 中如有 VuePress 专属语法（容器 `:::`、`<script>`、自定义组件标签）需在迁移脚本里清洗或人工处理。
- 自定义域名 / Cloudflare 账号属用户侧人工操作（拿 token、建 Pages 项目、配 DNS）。

## 范围外但相关

- 后续可选增强：评论系统（giscus）、文章搜索已由 PaperMod 自带、RSS（Hugo 自带）、图床。本期不展开。
