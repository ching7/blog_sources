# 个人展厅站点 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `blog_sources` 从 Hugo + PaperMod 博客原地重建为「手绘工作台」风格的 Astro 个人展厅站点，迁入 25 篇旧笔记，首页带活跃度打卡本，经 GitHub Actions 部署到 Cloudflare Pages。

**Architecture:** Astro 静态输出（`output: 'static'`，目录格式 URL，尾斜杠）。页面全部服务端渲染为纯 HTML，互动物件（欢迎语、猫、笔筒）各自是一个 `.astro` 组件，内联原生 `<script>`。数据（仓库点评、活跃度、问候语、表情清单）放 `src/data/`，由 `scripts/` 下的 Node 脚本生成或手工维护；纯函数放 `src/lib/`，用 `node --test` 测试；构建产物用 `tests/dist.test.mjs` 做回归检查。

**Tech Stack:** Astro 7.x、原生 JS/CSS、rough-notation（spec 写了 Rough.js + RoughNotation；手绘描边用 CSS 不规则圆角已足够，故只装 rough-notation 做荧光笔/下划线，Rough.js 等真需要手绘图形时再加）、lxgw-wenkai-webfont、sharp（Astro 自带依赖，用于缩放动态表情）、Playwright（仅 linux.do 抓取脚本）、Node 内置测试器 `node --test`、wrangler（CI）。

**Spec:** `docs/superpowers/specs/2026-11-23-personal-exhibition-site-design.md`（执行前通读；视觉确认稿 `.superpowers/brainstorm/*/content/minimal-v2.html`（简约首页）与 `c-v4.html`（热闹首页），本地浏览器直接打开）。

## Global Constraints

- 不引入 React/Vue/Svelte 等 UI 框架，不用 CSS 框架或组件库；互动只用原生 JS。新增依赖仅限本计划列出的几个，再加要在提交信息里写理由。
- Node 用 arm64 `/opt/homebrew/bin/node`（v26），本机没有 bun。外网下载（npm、gstatic、gitee、GitHub）一律走 `http://127.0.0.1:7897`，例如 `npm --proxy http://127.0.0.1:7897 --https-proxy http://127.0.0.1:7897 install ...`；curl 用 `env -u NO_PROXY -u no_proxy curl --noproxy '' --proxy http://127.0.0.1:7897`；这类命令需关沙箱。
- 字体、图片、表情全部自托管；构建产物里不得出现 `fonts.gstatic.com`、`fonts.googleapis.com`、`gitee.com`（图片）、`192.168.`（图片）。
- 首页 HTML 不得出现「作者」。
- 色彩 token（CSS 自定义属性，定义在 `src/styles/tokens.css`）：`--paper:#f3ecdf; --ink:#2b2b2b; --dot:#d9cdb6; --hl:#FFB11B; --c-about:#0D5661; --c-repos:#005CAF; --c-aesthetics:#EEA9A9; --c-explore:#5DAC81; --c-notes:#BDC0BA; --c-log:#F35336`。
- 调色板（名称、色值，顺序固定）：山吹 `#FFB11B`、紅緋 `#F35336`、桜 `#FEDFE1`、若竹 `#5DAC81`、瑠璃 `#005CAF`、青磁 `#69B0AC`、藤 `#8B81C3`、墨 `#1C1C1C`。换色**不持久化**（不用 localStorage），刷新回山吹。
- 首页两种模式：`/` 简约（默认，确认稿 `minimal-v2.html`）、`/desk/` 热闹（确认稿 `c-v4.html`），互相链接切换，不记住访客选择。
- **统一操作位**：两种首页的可操作元素位置和交互方式一致——**右上**＝猫（气泡文案相同「戳我，或者敲敲键盘」，点按或敲键盘触发）；**左下**＝「关于我 →」文字链接；**右下**＝换色控件（简约版为色点、热闹版为笔筒，都是单击换色）紧挨着最右下角的模式切换按钮（简约版「弄乱桌面 🙃」/ 热闹版「整理桌面 🧹」）。切换按钮两版同一样式：高 30px 胶囊、1.5px 墨色虚线边、纸白底，悬停/键盘聚焦变实线墨底白字。所有可操作元素都用 `<a>`/`<button>`，可键盘聚焦，不做只靠悬停才能触发的功能。
- **首屏原则**：`/` 与 `/desk/` 在 1280×720 与 1440×900 视口下 `document.documentElement.scrollHeight <= innerHeight`；宽 < 720px 允许滚动。
- 文案：自述、代表项目、仓库点评原文照搬 `github.com/ching7/ching7` README，不改写事实；builder 起草的部分用 `<span data-draft>…</span>` 包住（页面上显示「待确认」角标）。事实性数字（38 star、25 篇、2020 年）必须与实际一致。
- 所有动画尊重 `prefers-reduced-motion: reduce`（关掉旋转/抖动/流动，动态表情改用首帧静态占位不强制，但不得有持续位移动画）。
- Git 提交信息首行格式 `类型:[YYYYMMDD] 描述`，如 `feat:[20261124] 搭建 Astro 骨架`。本计划在分支 `feat/exhibition-site` 上做（从 `main` 拉出），**不推送、不合并 main**，直到 Task 10 用户确认。
- 旧 URL 清单（必须全部在 `dist/` 中存在 `index.html`）见 Task 3 的 `tests/fixtures/legacy-urls.txt`。

## Review Focus

1. **旧链接大小写**：外链指向 `/posts/05.opensource/12.ppttovideo/ppttovideo/`（Hugo 已小写化），源文件名却是 `pptToVideo.md`；新站必须生成小写路径并返回 200。→ Task 3 的 `legacy-urls` 回归测试。
2. **矮屏幕溢出**：笔记本常见 1280×720，内容稍多（长欢迎语、热力图满格、说明变长）就会出现滚动条，违反首屏原则。→ Task 7 的 Playwright 首屏测试，用最长的那条欢迎语跑。
3. **GitHub 页面改版或抓取失败**：解析出 0 格时不能用空数据覆盖已提交的 `github.json`，构建继续。→ Task 6 `parseContributions` 空输入测试 + 脚本行为测试。
4. **禁用 JS 或网络慢**：首页欢迎语、物件、打卡本数字都应服务端渲染在 HTML 里，JS 只负责「换一句」和动效。→ Task 7 dist 测试检查欢迎语文本存在于 HTML。
5. **首页体积失控**：动态表情原图每张约 600KB，直接用会让首页十几 MB。→ Task 4 缩放到 256px 并断言单张 < 300KB；首页只直接加载可见表情，其余问候语表情懒加载。

---

### Task 1: Astro 骨架替换 Hugo

**Files:**
- Delete: `hugo.toml`、`archetypes/`、`themes/PaperMod`（submodule，连同 `.gitmodules`）、`content/search.md`、`content/archives.md`、`scripts/migrate.py`、`scripts/test_migrate.py`、`scripts/__pycache__/`、`layouts/`（若存在）
- Create: `package.json`、`astro.config.mjs`、`src/styles/tokens.css`、`src/styles/base.css`、`src/layouts/Base.astro`、`src/pages/index.astro`（临时占位）、`tests/dist.test.mjs`、`tests/helpers.mjs`
- Modify: `.gitignore`（加 `node_modules/`、`dist/`、`.astro/`、`.cache/`；删 `/public/` 一行——`public/` 将是 Astro 静态资源目录，要提交）

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description?: string; section?: 'repos'|'aesthetics'|'explore'|'notes'|'about'|'home' }`，在 `<body data-section>` 上设置并把 `--c` 设为对应身份色。
- Produces: `tests/helpers.mjs` 导出 `readDist(path: string): string`（读 `dist/` 下文件，不存在则抛错）、`listDist(): string[]`（`dist/` 下全部文件的相对路径）、`fixture(name: string): string[]`（读 `tests/fixtures/<name>`，按行切分、去空行）。
- Produces: npm scripts：`dev`、`build`（`astro build`）、`test:unit`（`node --test tests/unit/`）、`test:dist`（`node --test tests/dist.test.mjs`）、`test`（先 unit 再 build 再 dist）。

- [ ] **Step 1:** `git switch -c feat/exhibition-site main`；把当前未提交的 `.gitignore` 改动与 spec 文件一并带过来。
- [ ] **Step 2:** 删除上面列出的 Hugo 文件（`git rm -r`；submodule 用 `git rm themes/PaperMod` 后删 `.gitmodules`）。**保留** `content/posts/` 和 `static/images/`，Task 3 迁移。
- [ ] **Step 3:** 安装依赖（走代理）：`astro@^7`、`rough-notation@^0.5`、`lxgw-wenkai-webfont@^1.7`。`astro.config.mjs`：`site: 'https://cyn-blog.pages.dev'`、`trailingSlash: 'always'`、`build: { format: 'directory' }`。
- [ ] **Step 4: 写失败测试** `tests/dist.test.mjs`：
  ```js
  test('首页存在且是中文', () => {
    const html = readDist('index.html');
    assert.match(html, /<html lang="zh-CN"/);
  });
  test('不引用外部字体 CDN', () => {
    for (const f of listDist().filter(f => /\.(html|css)$/.test(f)))
      assert.doesNotMatch(readDist(f), /fonts\.(gstatic|googleapis)\.com/, f);
  });
  ```
- [ ] **Step 5:** `npm run build && npm run test:dist` → 预期 FAIL（无 index 或 lang 不对）。
- [ ] **Step 6:** 实现 `Base.astro`、`tokens.css`（Global Constraints 的 token 原样）、`base.css`（纸面底 + `radial-gradient(var(--dot) 1px, transparent 1px)` 22px 点阵；正文字体 `"LXGW WenKai", "Kaiti SC", "STKaiti", serif`，从 `lxgw-wenkai-webfont/style.css` 引入——它是按 unicode-range 切片的自托管字体；`prefers-reduced-motion` 下全局 `animation: none; transition: none`）。临时 `index.astro` 用 `Base` 渲染一句占位。
- [ ] **Step 7:** `npm run build && npm run test:dist` → PASS。
- [ ] **Step 8:** 提交 `refactor:[20261124] 移除 Hugo，搭建 Astro 骨架`。

### Task 2: 纸面组件与手绘语言

**Files:**
- Create: `src/components/Card.astro`、`src/components/Tag.astro`、`src/components/Highlight.astro`、`src/components/SiteFooter.astro`
- Modify: `src/layouts/Base.astro`（挂页脚）

**Interfaces:**
- Produces: `Card.astro` props `{ href?: string; color: string; tilt?: number; class?: string }`，默认插槽为内容；外观：`#fffdf7` 底、`2.5px solid var(--ink)`、不规则圆角 `14px 18px 12px 20px / 18px 12px 20px 14px`、`box-shadow: 5px 6px 0 <color>`、顶部胶带（`<color>` 55% 透明）、`rotate(tilt deg)`（默认奇偶交替 -1.6 / 1.3），悬停摆正上浮 `translateY(-8px) scale(1.04)`。有 `href` 时整卡是 `<a>`。
- Produces: `Tag.astro` props `{ label: string; colorName: string; color: string }` → 渲染「● 仓库 · 瑠璃」小签。
- Produces: `Highlight.astro` 默认插槽文本，用 rough-notation `annotate(el, { type: 'highlight', color: 'var(--hl)' 的计算值, animationDuration: 800 })`，进入视口时播放一次；无 JS 时退化为 CSS 渐变下划线 `linear-gradient(transparent 58%, var(--hl) 58%)`。
- Produces: `SiteFooter.astro`：一行小字「关于我 →」链接 `/about/` + 「动态表情来自 Google Noto Emoji（CC BY 4.0）」署名。

- [ ] **Step 1: 写失败测试**（追加到 `tests/dist.test.mjs`）：
  ```js
  test('每页有 Noto 署名和 About 入口', () => {
    const html = readDist('index.html');
    assert.match(html, /Noto Emoji/);
    assert.match(html, /href="\/about\/"/);
  });
  ```
- [ ] **Step 2:** 运行 → FAIL。
- [ ] **Step 3:** 实现四个组件；临时首页放一张 `Card` + `Highlight` 看效果。
- [ ] **Step 4:** 运行 → PASS；`npm run dev` 目测与 `c-v4.html` 的卡片一致。
- [ ] **Step 5:** 提交 `feat:[20261124] 纸面卡片、小签、荧光笔与页脚`。

### Task 3: 笔记迁移（旧 URL 不变、图片自托管）

**Files:**
- Move: `content/posts/**` → `src/content/notes/**`（保留原目录名和文件名）；`static/images/**` → `public/images/**`；然后删空的 `content/`、`static/`
- Create: `src/content.config.ts`、`src/lib/legacy-slug.mjs`、`tests/unit/legacy-slug.test.mjs`、`tests/fixtures/legacy-urls.txt`、`scripts/localize-images.mjs`、`src/pages/posts/[...slug].astro`、`src/pages/notes/index.astro`、`src/layouts/Note.astro`、`public/_redirects`

**Interfaces:**
- Produces: `legacySlug(id: string): string` — 输入 glob 加载器的原始 id（相对 `src/content/notes`、去 `.md`），输出 Hugo 当年的路径段：全部小写；`x/y/_index` → `x/y`。例：`05.openSource/12.pptToVideo/pptToVideo` → `05.opensource/12.ppttovideo/ppttovideo`；`01.dev/_index` → `01.dev`。
- Produces: 内容集合 `notes`，用 `glob({ pattern: '**/*.md', base: './src/content/notes', generateId: ({ entry }) => entry.replace(/\.md$/, '') })`（**必须自定义 generateId**：默认的 slugger 会把 `01.dev` 变成 `01dev`）。schema：`title: string`、`date?: date`、`lastmod?: date`、`categories?: string[]`、`tags?: string[]`、`draft?: boolean`。
- Produces: `/notes/` 页按 `categories[0]` 分组列出 25 篇（`_index` 不计入），每组用 `Card` + 白鼠身份色；页面顶部文案「考古现场：25 篇 2020 年前后的 Java 笔记」——数字用集合实际计数渲染，不写死。

- [ ] **Step 1:** 用 `git mv` 搬目录。
- [ ] **Step 2:** 写 `tests/fixtures/legacy-urls.txt`（每行一个，2026-11-24 由旧 Hugo 构建实测得出）：
  ```
  /posts/01.dev/
  /posts/01.dev/10.storage/fastdfs/
  /posts/01.dev/11.network/cros/
  /posts/01.dev/11.network/nginx/
  /posts/01.dev/12.java/annotation/
  /posts/01.dev/12.java/designpattern/
  /posts/01.dev/12.java/java8newfeature/
  /posts/01.dev/12.java/jvm/
  /posts/01.dev/12.java/reflect/
  /posts/01.dev/13.codestd/gitstd/
  /posts/02.front/
  /posts/02.front/10.vuepress/manual/
  /posts/03.framework/
  /posts/03.framework/10.spring/annotation/
  /posts/03.framework/10.spring/aop/
  /posts/03.framework/10.spring/ioc/
  /posts/03.framework/10.spring/springbase/
  /posts/03.framework/10.spring/springbootdemo/
  /posts/03.framework/10.spring/springbootmodule/
  /posts/03.framework/11.microservices/domaindrivedesign/
  /posts/03.framework/12.log/log4j2andslf4j/
  /posts/03.framework/13.utils/swaggerdemo/
  /posts/04.javalibrary/javalibrary/
  /posts/05.opensource/10.scanbox/scanbox/
  /posts/05.opensource/10.scanbox/scanboxreadme/
  /posts/05.opensource/11.simplemall/simplemalldemo/
  /posts/05.opensource/12.ppttovideo/ppttovideo/
  /posts/06.javainterview/10.interviewnote/interviewnote/
  ```
- [ ] **Step 3: 写失败测试** `tests/unit/legacy-slug.test.mjs`：
  ```js
  assert.equal(legacySlug('05.openSource/12.pptToVideo/pptToVideo'), '05.opensource/12.ppttovideo/ppttovideo');
  assert.equal(legacySlug('01.dev/_index'), '01.dev');
  assert.equal(legacySlug('04.javalibrary/javalibrary'), '04.javalibrary/javalibrary');
  ```
  以及 dist 测试：
  ```js
  test('旧笔记 URL 全部存在', () => {
    for (const u of fixture('legacy-urls.txt')) readDist(u.slice(1) + 'index.html');
  });
  test('笔记图片已自托管', () => {
    for (const f of listDist().filter(f => f.startsWith('posts/') && f.endsWith('.html')))
      assert.doesNotMatch(readDist(f), /<img[^>]+src="https?:\/\/(gitee\.com|192\.168\.)/, f);
  });
  test('旧搜索/归档有重定向', () => {
    const r = readDist('_redirects');
    for (const p of ['/search/ /notes/ 301', '/archives/ /notes/ 301', '/categories/* /notes/ 301', '/tags/* /notes/ 301']) assert.ok(r.includes(p), p);
  });
  ```
- [ ] **Step 4:** 运行 → FAIL。
- [ ] **Step 5:** 实现 `legacySlug`、`content.config.ts`、`[...slug].astro`（`getStaticPaths` 用 `legacySlug(entry.id)`；`_index` 条目渲染成该分类的小目录页）、`Note.astro`（正文用更易读的字号/行高，但保留纸面、墨色描边容器、白鼠身份色胶带；代码块用 Astro 自带 Shiki，主题选浅色 `github-light`）、`/notes/` 页、`public/_redirects`（上面四行）。
- [ ] **Step 6:** 写 `scripts/localize-images.mjs`：扫描 `src/content/notes/**/*.md` 中 `![..](https://gitee.com/...)` 与 `<img src="https://gitee.com/...">`，下载（用 Node 内置 `fetch`；运行时带 `NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897`，Node 24+ 的内置 fetch 会据此走代理，不需要额外依赖）到 `public/images/<笔记所在目录>/<原文件名>`，改写为站内绝对路径；遇到 `192.168.` 地址，替换为 `<span class="img-broken">（这张图留在了 2020 年的内网里）</span>`。下载失败的打印清单并以非零码退出，不改写该条。运行：`NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 node scripts/localize-images.mjs`（关沙箱），预期 24 张下载、4 处标注。
- [ ] **Step 7:** `npm test` → 全 PASS。抽查 `/posts/05.opensource/12.ppttovideo/ppttovideo/` 页面图片可显示。
- [ ] **Step 8:** 提交 `feat:[20261124] 迁移 25 篇笔记，保留旧链接并自托管图片`。

### Task 4: 动态表情资源

**Files:**
- Create: `src/data/emoji.mjs`、`scripts/fetch-emoji.mjs`、`public/emoji/*.webp`、`tests/unit/emoji.test.mjs`

**Interfaces:**
- Produces: `EMOJI`：名称 → Noto 码点的对象，至少包含（均已于 2026-11-24 确认有动态版）：`gift:'1f381'`、`rainbow:'1f308'`、`rocket:'1f680'`、`sauropod:'1f995'`、`fire:'1f525'`、`cat:'1f431'`、`catGrin:'1f63a'`、`sparkles:'2728'`、`eyes:'1f440'`、`tea:'2615'`、`thinking:'1f914'`、`mindBlown:'1f92f'`、`alien:'1f47e'`、`cool:'1f60e'`、`crystal:'1f52e'`、`party:'1f973'`。
- Produces: `emojiSrc(name: keyof EMOJI): string` → `/emoji/<码点>.webp`；名字不存在时抛错（构建期暴露拼写错误）。

- [ ] **Step 1: 写失败测试** `tests/unit/emoji.test.mjs`：
  ```js
  test('清单里每个表情都已下载且不超过 300KB', () => {
    for (const code of Object.values(EMOJI)) {
      const st = statSync(`public/emoji/${code}.webp`);
      assert.ok(st.size < 300 * 1024, code);
    }
  });
  test('emojiSrc 拼写错误会抛错', () => assert.throws(() => emojiSrc('nope')));
  ```
- [ ] **Step 2:** 运行 → FAIL。
- [ ] **Step 3:** 实现 `emoji.mjs`；`fetch-emoji.mjs` 逐个下载 `https://fonts.gstatic.com/s/e/notoemoji/latest/<code>/512.webp`（同 Task 3 的代理方式），用 `sharp(buf, { animated: true }).resize(256).webp({ quality: 80 })` 写到 `public/emoji/<code>.webp`；已存在则跳过。
- [ ] **Step 4:** `NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 node scripts/fetch-emoji.mjs`（关沙箱）后运行测试 → PASS。若某张仍 ≥300KB，降 `quality` 或缩到 192px，再测。
- [ ] **Step 5:** 提交 `feat:[20261124] 自托管 Noto 动态表情（256px）`。

### Task 5: 首页互动物件——欢迎语、笔筒、猫

**Files:**
- Create: `src/data/greetings.mjs`、`src/lib/greeting.mjs`、`src/lib/accent.mjs`、`src/components/Greeting.astro`、`src/components/PencilCup.astro`、`src/components/Cat.astro`、`tests/unit/greeting.test.mjs`

**Interfaces:**
- Consumes: `emojiSrc`（Task 4）、`Highlight`（Task 2）。
- Produces: `GREETINGS: { emoji: string; text: string }[]`，初始内容（来自确认稿，可再加，但不得出现名字）：eyes「嗯？你也走到这儿来了。」、tea「泡杯茶，随便翻。」、thinking「这里没有简历，只有一张乱桌子。」、mindBlown「小心，桌上有东西会动。」、alien「欢迎，鞋不用脱。」、cool「今天也没有 OOM，真好。」、crystal「我猜你会先点那只恐龙。」、party「你是今天第一个……大概吧。」
- Produces: `nextGreetingIndex(current: number, length: number, rand: () => number): number` — 返回 `[0, length)` 内且 ≠ `current` 的下标；`length === 1` 时返回 0。
- Produces: `PALETTE: { name: string; hex: string }[]`（Global Constraints 的 8 色，顺序固定），放 `src/lib/accent.mjs`。
- `Greeting.astro`：构建时用 `GREETINGS[0]` 服务端渲染（保证无 JS 可读）；客户端加载后随机换成一条，点击用 `nextGreetingIndex` 换下一条；末尾若干字用 `Highlight` 荧光笔。其它问候语的表情图在点击时才设置 `src`（懒加载）。
- `PencilCup.astro` props `{ variant: 'cup' | 'dots' }`：`cup`（热闹版）8 支高度不一的笔 + 笔筒标签显示「名称 · hex」+ 点击时笔上方冒 `sparkles` 表情 1.4s；`dots`（简约版）8 个 12px 色点，悬停放大。点击都只做 `document.documentElement.style.setProperty('--hl', hex)`，不持久化。
- `Cat.astro` props `{ size: 'sm' | 'lg' }`（sm 56px、气泡「戳我」；lg 88px、气泡「戳我，或者敲敲键盘」）：动态 `cat` 表情，旁边常驻对话气泡；悬停轻微放大；点按或任意 `keydown`（忽略带 Ctrl/Meta/Alt 的组合键，也忽略焦点在 input/textarea 时）左右交替倾斜 8°，每 5 次换一句：「咚！」「咚咚咚！」「你打字好快」「这人会写 Java」「也会写 Python」「还会画架构图」「好了好了够了」；累计 30 次换成 `catGrin` 并说「你赢了」。位置由首页决定（见 Task 7），组件本身不 `position: fixed`。

- [ ] **Step 1: 写失败测试**：
  ```js
  // greeting.test.mjs
  test('不会返回当前下标', () => {
    for (let i = 0; i < 100; i++) assert.notEqual(nextGreetingIndex(3, 8, Math.random), 3);
  });
  test('只有一条时返回 0', () => assert.equal(nextGreetingIndex(0, 1, Math.random), 0));
  test('问候语里没有名字', () => {
    for (const g of GREETINGS) assert.doesNotMatch(g.text, /作者|作者/);
  });
  ```
- [ ] **Step 2:** `npm run test:unit` → FAIL。
- [ ] **Step 3:** 实现 `greetings.mjs`、`greeting.mjs`、`accent.mjs` 与三个组件、Base 头部脚本。
- [ ] **Step 4:** `npm run test:unit` → PASS；`npm run dev` 手动玩：换句、换色（刷新后回山吹）、猫键盘/点按都响应。
- [ ] **Step 5:** 提交 `feat:[20261124] 随机欢迎语、笔筒换色、动态猫`。

### Task 6: 活跃度数据与打卡本

**Files:**
- Create: `src/lib/activity.mjs`、`scripts/fetch-github.mjs`、`scripts/fetch-linuxdo.mjs`、`scripts/linuxdo-loop.sh`、`src/data/activity/github.json`、`src/data/activity/linuxdo.json`、`src/components/ActivityLog.astro`、`tests/unit/activity.test.mjs`、`tests/fixtures/contributions.html`
- Modify: `package.json`（`devDependencies` 加 `playwright`；scripts 加 `fetch:github`、`fetch:linuxdo`）、`.gitignore`（加 `.cache/`）

**Interfaces:**
- Produces: `parseContributions(html: string): { date: string; level: 0|1|2|3|4 }[]` — 从 `data-date="YYYY-MM-DD"` 与同一标签内 `data-level="N"` 提取，按日期升序。
- Produces: `formatCount(n: number): string` — `< 10000` 原样数字字符串；`>= 10000` 为一位小数加「万」并去掉 `.0`（`24013 → '2.4 万'`，`20000 → '2 万'`）。
- Produces: `summarizeLinuxdo(summary: object, user: object, fetchedAt: string): { days: number; hours: number; postsRead: string; trustLevel: number; joined: string; updatedAt: string }` — `days = summary.user_summary.days_visited`；`hours = Math.round(time_read / 3600)`；`postsRead = formatCount(posts_read_count)`；`trustLevel = user.user.trust_level`；`joined = created_at` 的 `YYYY-MM`；`updatedAt = fetchedAt` 的 `YYYY-MM-DD`。
- 数据文件格式：`github.json = { updatedAt: 'YYYY-MM-DD', days: [{date, level}] }`；`linuxdo.json` = `summarizeLinuxdo` 的返回值。
- `fetch-github.mjs`：抓 `https://github.com/users/ching7/contributions`（带 UA；尊重 `HTTPS_PROXY`）；解析结果为空或请求失败 → 打印警告、**不写文件**、退出码 0。
- `fetch-linuxdo.mjs`：`chromium.launchPersistentContext('.cache/linuxdo-profile', { headless: false, channel: 'chrome' })` 打开 `https://linux.do/u/ching7/summary`，等页面标题含「LINUX DO」（最多 60s，期间若出现人机验证由真人点一下），然后在页面内 `fetch('/u/ching7/summary.json')` 和 `fetch('/u/ching7.json')`，`summarizeLinuxdo` 后写 `linuxdo.json`。加 `--commit` 参数时：`git add src/data/activity/linuxdo.json && git commit -m "chore:[YYYYMMDD] 更新 linux.do 活跃度" && git push`（无变化则跳过）。
- `linuxdo-loop.sh`：`set -m`；每 24 小时跑一次 `node scripts/fetch-linuxdo.mjs --commit`，日志写 `.cache/linuxdo-loop.log`；用法注释写明 `nohup scripts/linuxdo-loop.sh >/dev/null 2>&1 &` 启动、`kill -INT -<pgid>` 停止；**不要做成 launchd**（launchd 访问不了 `~/Downloads`）。
- `ActivityLog.astro`：用 `Card`（颜色 `--c-log`，`fire` 表情，标题「最近有没有偷懒」）；上半部是 7 行 × N 列的格子，`level > 0` 的格子填 `var(--hl)` 且墨色描边，其余 `#ece4d3`；下半部「linux.do 泡了 **{days}** 天 · 读了 **{hours}** 小时 · 刷过 **{postsRead}** 帖 · 信任等级 **{trustLevel}** · 加入于 {joined}」，数字用 `Highlight`；底部小字「更新于 {较新的 updatedAt}」。照实展示，不做稀疏处理。

- [ ] **Step 1:** 抓一份真实 HTML 存 `tests/fixtures/contributions.html`（走代理 curl）。
- [ ] **Step 2: 写失败测试** `tests/unit/activity.test.mjs`：
  ```js
  test('解析真实贡献页', () => {
    const days = parseContributions(readFileSync('tests/fixtures/contributions.html', 'utf8'));
    assert.ok(days.length >= 365);
    assert.ok(days.every((d, i) => i === 0 || d.date > days[i - 1].date));
    assert.ok(days.every(d => d.level >= 0 && d.level <= 4));
  });
  test('改版后解析为空', () => assert.deepEqual(parseContributions('<html></html>'), []));
  test('formatCount', () => {
    assert.equal(formatCount(9999), '9999');
    assert.equal(formatCount(24013), '2.4 万');
    assert.equal(formatCount(20000), '2 万');
  });
  test('summarizeLinuxdo', () => {
    const r = summarizeLinuxdo(
      { user_summary: { days_visited: 102, time_read: 141560, posts_read_count: 24013 } },
      { user: { trust_level: 2, created_at: '2026-06-10T08:33:19.825Z' } },
      '2026-11-24T03:13:00Z');
    assert.deepEqual(r, { days: 102, hours: 39, postsRead: '2.4 万', trustLevel: 2, joined: '2026-06', updatedAt: '2026-11-24' });
  });
  test('抓取失败不覆盖已有数据', () => {
    const before = readFileSync('src/data/activity/github.json', 'utf8');
    execFileSync('node', ['scripts/fetch-github.mjs'], { env: { ...process.env, GITHUB_CONTRIB_URL: 'http://127.0.0.1:9/' } });
    assert.equal(readFileSync('src/data/activity/github.json', 'utf8'), before);
  });
  ```
  （`fetch-github.mjs` 读可选环境变量 `GITHUB_CONTRIB_URL` 覆盖地址，仅供测试。）
- [ ] **Step 3:** 运行 → FAIL。
- [ ] **Step 4:** 实现 `activity.mjs`、两个抓取脚本、循环脚本、`ActivityLog.astro`。
- [ ] **Step 5:** 生成真实数据：`NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 npm run fetch:github`；`npm run fetch:linuxdo`（弹出 Chrome，必要时人工过验证）。两个 json 提交进仓库。
- [ ] **Step 6:** `npm run test:unit` → PASS。
- [ ] **Step 7:** 提交 `feat:[20261124] 打卡本：GitHub 热力图与 linux.do 数据`。

### Task 7: 两种首页组装（简约 `/` + 热闹 `/desk/`）

**Files:**
- Modify: `src/pages/index.astro`（简约）
- Create: `src/components/HomeControls.astro`（底栏：左「关于我」，右换色 + `mode-switch` 切换按钮；props `{ mode: 'simple' | 'desk' }`，两页共用，保证位置与交互一致）、`src/pages/desk/index.astro`（热闹）、`src/data/desk.mjs`、`src/components/DeskList.astro`（简约版物件清单）、`tests/fold.test.mjs`（Playwright 首屏测试，仅本地跑，不进 CI）

**Interfaces:**
- Consumes: `Greeting`、`Cat`、`PencilCup`（Task 5）、`ActivityLog`（Task 6）、`Card`、`Tag`（Task 2）、`emojiSrc`（Task 4）。
- Produces: `DESK: { href; emoji; title; blurb; section; sectionLabel; colorName; color }[]`，四项（文案可打磨，事实不可改）：
  - `/repos/` gift「拆盲盒」：「几个顺手造的小轮子。其中一个不知道为什么，被 38 个陌生人收藏了。」仓库 · 瑠璃
  - `/aesthetics/` rainbow「偷来的颜色」：「从别人那儿顺来的颜色、画和字体。这张桌子也是用它们拼的。」审美 · 鴇
  - `/explore/` rocket「可能会炸」：「还没想清楚的实验和半成品。点进去之前，建议后退半步。」探索 · 若竹
  - `/notes/` sauropod「考古现场」：「挖出 {N} 篇 2020 年前后的 Java 笔记。那时候还在和 jstack 谈恋爱。」笔记 · 白鼠（N 用笔记集合实际计数）
- 两页共用 `DESK`、`GREETINGS`、活跃度数据，只是排版不同；页面上都不出现名字。
- **`/`（简约，照 `minimal-v2.html`）**：单栏 max-width 760px，`main` 为 `min-height:100vh` 的纵向 flex，间距用 vh（顶部 `calc(44px + 3vh)`、清单与打卡本前 `3.5vh`、行内边距 `clamp(8px,1.5vh,20px)`），页脚 `margin-top:auto`。首行：小号 `Greeting` + `Cat size=sm` 靠右。`DeskList`：每行身份色圆点 + 比喻标题 + 灰色说明 + 右侧展区名；悬停右移 14px、标题出现身份色荧光笔（`color-mix(in srgb, var(--c) 45%, transparent)`）、行右侧浮出该物件的动态表情（64px，懒加载）。打卡本简版：标题「最近有没有偷懒」+ 6px 格热力图 + 一行 linux.do 数字与更新日期（`ActivityLog` 加 prop `variant: 'card' | 'strip'`）。页脚：「关于我 →」、`PencilCup variant=dots`、「弄乱桌面 🙃」链到 `/desk/`。
- **`/desk/`（热闹，照 `c-v4.html`）**：`html,body` 高 100%，`.in` 为 100vh 纵向 flex；首行 `Greeting`（64px 表情、40px 字）+ `Cat size=lg` 靠右；桌面网格 `repeat(4, minmax(0,1fr)) minmax(0,2fr)`，四张 `Card` + `ActivityLog variant=card`（热力图 6px 格）；底行 `margin-top:auto`：`PencilCup variant=cup`、「关于我 →」、「整理桌面 🧹」链到 `/`。
- < 720px 宽：两页都改单列，允许滚动，物件保留轻微旋转。

- [ ] **Step 1: 写失败测试**（dist）：
  ```js
  test('首页：无名字、有欢迎语、四件物件、打卡本', () => {
    const html = readDist('index.html');
    assert.doesNotMatch(html, /作者/);
    assert.match(html, /嗯？你也走到这儿来了。/);           // GREETINGS[0] 服务端渲染
    for (const h of ['/repos/', '/aesthetics/', '/explore/', '/notes/']) assert.match(html, new RegExp(`href="${h}"`));
    assert.match(html, /最近有没有偷懒/);
    assert.match(html, /更新于 \d{4}-\d{2}-\d{2}/);
    assert.match(html, /戳我/);
    assert.match(html, /href="\/desk\/"/);
  });
  test('两版切换按钮同一样式类', () => {
    assert.match(readDist('index.html'), /class="[^"]*\bmode-switch\b[^"]*"[^>]*href="\/desk\/"|href="\/desk\/"[^>]*class="[^"]*\bmode-switch\b/);
    assert.match(readDist('desk/index.html'), /class="[^"]*\bmode-switch\b/);
  });
  test('热闹版存在并能回到简约', () => {
    const html = readDist('desk/index.html');
    assert.doesNotMatch(html, /作者/);
    assert.match(html, /href="\/"/);
    assert.match(html, /最近有没有偷懒/);
  });
  test('首页图片只引用自托管表情', () => {
    assert.doesNotMatch(readDist('index.html'), /src="https?:\/\//);
  });
  ```
  以及 `tests/fold.test.mjs`（`astro preview` 起在 4321 端口后运行；playwright chromium headless）：
  ```js
  for (const [w, h] of [[1280, 720], [1440, 900]]) for (const path of ['/', '/desk/'])
    test(`${path} 在 ${w}x${h} 首屏放得下（最长欢迎语）`, async () => {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      await page.goto(`http://localhost:4321${path}`);
      await page.evaluate(t => { document.querySelector('[data-greeting-text]').textContent = t; }, LONGEST_GREETING);
      const { sh, ih } = await page.evaluate(() => ({ sh: document.documentElement.scrollHeight, ih: innerHeight }));
      assert.ok(sh <= ih, `${sh} > ${ih}`);
    });
  ```
  （`LONGEST_GREETING` = `GREETINGS` 中最长的 text；`Greeting.astro` 的文字节点加 `data-greeting-text`；npm script `test:fold` 负责 build → 后台 `astro preview --port 4321` → 跑测试 → 关掉 preview；首次需 `npx playwright install chromium`。）
- [ ] **Step 2:** `npm test` → FAIL。
- [ ] **Step 3:** 实现 `desk.mjs`、`DeskList.astro`、`index.astro`、`desk/index.astro`，给 `ActivityLog` 加 `strip` 变体。
- [ ] **Step 4:** `npm test && npm run test:fold` → PASS；`npm run dev` 与两份确认稿并排对比，375px 宽各看一遍；系统开「减弱动态效果」再看一遍。
- [ ] **Step 5:** 提交 `feat:[20261124] 简约与热闹两种首页`。

### Task 8: 展区页与 About、404

**Files:**
- Create: `src/data/repos.mjs`、`src/pages/repos/index.astro`、`src/pages/aesthetics/index.astro`、`src/pages/explore/index.astro`、`src/pages/about/index.astro`、`src/pages/404.astro`、`src/components/Draft.astro`

**Interfaces:**
- Consumes: `Base`（`section` 参数决定身份色）、`Card`、`Tag`、`Highlight`、`Cat`、`emojiSrc`。
- Produces: `REPOS: { name; url; comment; stars; language }[]`，五项**原文照搬** README「我的项目」表格：ppt2video（「PPT 转 MP4 小工具，TTS + FFmpeg 拼出来的，意外多人 star」, 38, Java）、prompt-me、ai-roundtable、smartisan-mall-simple、fastDFSStudy（点评、星数、语言逐字复制）。
- Produces: `Draft.astro`：包住 builder 起草的文案，渲染 `<span data-draft>…<sup>待确认</sup></span>`。
- 页面要求：
  - `/repos/`：每个仓库一张 `Card`（瑠璃），点评做正文，星数和语言做小签，卡片链到 GitHub。
  - `/aesthetics/`：先放用户收藏夹「设计」目录里能公开的条目（NIPPON COLORS、Ian Fisher 云彩、WebGL Fluid、Open Peeps、Bongo Cat 等，各一句为什么喜欢——这句话用 `Draft` 包住），再加一段「这张桌子是怎么拼的」说明本站配色与字体（事实陈述，不用 Draft）。
  - `/explore/`：放 ai-roundtable、prompt-me 等「实验」，加占位「更多半成品施工中」；说明文字用 `Draft`。
  - `/about/`：藍色调、克制排版。自述段落逐字复制 README narrative 段；两个代表项目（金融行业智能体平台、AI 训推一体平台）的简介、技术栈、个人贡献逐字复制 README；技术栈汇总、联系方式区用 `Draft` 起草（联系方式先只放 GitHub `https://github.com/ching7`）。本页可以出现名字。
  - `/404.html`：一句俏皮话 + `thinking` 表情 + 回桌面链接。
  - 每区最多一个小玩具，本任务**不加**；留给 Open Design 回灌后另议。

- [ ] **Step 1: 写失败测试**（dist）：
  ```js
  test('展区页都存在', () => {
    for (const p of ['repos', 'aesthetics', 'explore', 'about', 'notes']) readDist(`${p}/index.html`);
    readDist('404.html');
  });
  test('仓库点评原文', () => assert.match(readDist('repos/index.html'), /PPT 转 MP4 小工具，TTS \+ FFmpeg 拼出来的，意外多人 star/));
  test('About 自述原文', () => assert.match(readDist('about/index.html'), /发现 OOM 没躲过去，只是变成了显存版/));
  ```
- [ ] **Step 2:** `npm test` → FAIL。
- [ ] **Step 3:** 实现上述文件。
- [ ] **Step 4:** `npm test` → PASS。
- [ ] **Step 5:** 提交 `feat:[20261124] 仓库、审美、探索、About 与 404 页`。

### Task 9: 部署流水线与文档

**Files:**
- Modify: `.github/workflows/deploy.yml`、`CLAUDE.md`、`WRITING.md`、`README.MD`
- Create: `scripts/check-drafts.mjs`

**Interfaces:**
- `check-drafts.mjs`：扫描 `dist/**/*.html`，发现 `data-draft` 则列出页面并以退出码 1 结束；npm script `check:drafts`。
- `deploy.yml`：触发 `push: main`、`workflow_dispatch`、`schedule: cron '0 18 * * *'`（北京时间 02:00）；步骤：checkout（不再需要 submodules）→ `actions/setup-node@v4`（`node-version: 22`，`cache: npm`）→ `npm ci` → `node scripts/fetch-github.mjs`（失败不影响后续，脚本本身已保证退出码 0）→ `npm run build` → `npm run test:unit && npm run test:dist` → `npm run check:drafts` → wrangler `pages deploy dist --project-name=cyn-blog`（沿用现有 secrets 写法）。CI 不跑 `fetch-linuxdo`，也不提交任何文件。

- [ ] **Step 1: 写失败测试**：在 `tests/unit/check-drafts.test.mjs` 中造一个临时目录含 `<span data-draft>` 的 html，断言脚本（接受目录参数，默认 `dist`）退出码为 1；不含时为 0。
- [ ] **Step 2:** 运行 → FAIL；实现脚本 → PASS。
- [ ] **Step 3:** 改写 `deploy.yml`；`CLAUDE.md`、`WRITING.md`、`README.MD` 改为 Astro 工作流：写笔记放 `src/content/notes/<分类>/`、`npm run dev`、`npm test`、两个抓取命令、linux.do 循环怎么起停、草稿检查会阻止部署。
- [ ] **Step 4:** 本地完整跑一遍：`npm ci && npm test && npm run check:drafts` → 前两步 PASS，`check:drafts` 预期 FAIL 并列出 aesthetics/explore/about（文案尚未确认，这是正确的拦截）。
- [ ] **Step 5:** 提交 `ci:[20261124] 部署改为 Astro 构建，每日刷新 GitHub 活跃度，草稿拦截上线`。

### Task 10: 用户验收与上线（人工）

不写代码，由执行者整理清单交给用户，用户逐条确认后才合并：

- [ ] **Step 1:** `npm run dev`，给用户一份验收清单：首页默认简约、「弄乱桌面 / 整理桌面」能来回切、刷新后回到简约；1280×720 窗口下两种首页都不用滚动；每次刷新欢迎语不同、点一下换句；四件物件跳转正确；色点/笔筒换色生效、刷新回山吹；猫点按/敲键盘有反应、30 次后换脸；打卡本数字与 linux.do 资料页一致；`/posts/05.opensource/12.ppttovideo/ppttovideo/` 能打开且图片正常；手机宽度（DevTools 375px）布局；系统开「减弱动态效果」后没有持续晃动。
- [ ] **Step 2:** 用户逐条改定所有「待确认」文案（`npm run build && npm run check:drafts` 列出位置），并提供审美/探索条目与 About 联系方式；改完 `check:drafts` 通过。
- [ ] **Step 3:** 用户确认后再：合并到 `main` 并 `git push github main`（触发部署）。
- [ ] **Step 4:** 用户指定主域名后，在 Cloudflare Pages 项目 `cyn-blog` 绑定自定义域名，`astro.config.mjs` 的 `site` 改为该域名，其余两个域名在 Cloudflare 设 301 到主域名。
- [ ] **Step 5:** 用户在 Open Design 细化视觉后，另开一轮对齐（不在本计划内）。
