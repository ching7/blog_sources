# Hugo 博客迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 VuePress 1.x 博客迁移到 Hugo + PaperMod，GitHub Actions 自动构建并部署到 Cloudflare Pages，本地写 Markdown `git push` 即发布。

**Architecture:** Hugo（extended）做静态生成，PaperMod 作为 git submodule 主题；一个一次性 Python 迁移脚本把 `docs/` 下 30 篇历史 md 转成 Hugo `content/posts/`（frontmatter 转换、缺失日期用 git 首次提交时间补、图片复制到 `static/images/` 并改写引用、依赖 Vue 的页面剥离脚本并打 `归档` 标签）；GitHub Actions 用 `peaceiris/actions-hugo` 构建后用 `cloudflare/wrangler-action` 部署到 Cloudflare Pages。先用默认 `*.pages.dev` 域名。

**Tech Stack:** Hugo extended、PaperMod 主题、Python 3（仅标准库）、GitHub Actions、Cloudflare Pages（wrangler）。

**工作分支:** `blog-hugo-migration`

**Spec:** `docs/superpowers/specs/2026-06-12-hugo-blog-cloudflare-migration-design.md`

---

## 文件结构（迁移完成后）

```
hugo.toml                      # Hugo 站点配置
archetypes/default.md          # hugo new 新文章模板
themes/PaperMod/               # 主题（git submodule）
content/posts/<原目录>/<name>.md   # 迁移后的文章（保留分类层级）
content/posts/<top>/_index.md  # 6 大分类的 section 落地页
static/images/<原目录>/...      # 文章图片（按原目录镜像）
static/icon/、static/image/     # 站点级资源（logo 等）
scripts/migrate.py             # 一次性迁移脚本（可复跑）
scripts/test_migrate.py        # 迁移脚本纯函数的单元测试
.github/workflows/deploy.yml   # CI/CD
.gitignore                     # 忽略 public/ resources/
docs/                          # 旧 VuePress 资产（Task 8 清理）
```

**职责边界：** `scripts/migrate.py` 只负责「VuePress md → Hugo md/资源」的纯转换与文件搬运；Hugo 渲染/主题由 `hugo.toml` + PaperMod 负责；部署由 `deploy.yml` 负责。三者解耦，互不依赖运行时状态。

---

## 手工前置（用户侧，需你本人完成；不阻塞 Task 1-8 的本地开发，只在最终上线前需要）

这些是账号/GUI 操作，Claude 无法代办，交付时会再给一份带截图位置的清单：

- [ ] 注册 / 登录 Cloudflare 账号。
- [ ] Cloudflare Dashboard → Workers & Pages → 创建一个 **Pages** 项目（取个项目名，例如 `cyn-blog`，记下分配的 `<项目名>.pages.dev` 域名）。可先创建空项目（"Direct Upload" 方式），后续由 CI 上传产物。
- [ ] Cloudflare Dashboard → My Profile → API Tokens → 创建 Token，授予 **Account · Cloudflare Pages · Edit** 权限，复制 token 值。
- [ ] Cloudflare Dashboard 首页右侧栏复制 **Account ID**。
- [ ] GitHub 仓库 → Settings → Secrets and variables → Actions，新增两个 secret：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。

---

## Task 1: 安装 Hugo 并搭建站点骨架

**Files:**
- Create: `hugo.toml`
- Create: `.gitignore`

- [ ] **Step 1: 安装 Hugo extended（本机未安装）**

Run:
```bash
brew install hugo
hugo version
```
Expected: 输出含 `hugo v0.1xx.x ... extended`（必须有 `extended`，PaperMod 依赖它）。记下这个版本号，Task 6 的 CI 会用到。

- [ ] **Step 2: 写最小 `hugo.toml`**

创建 `hugo.toml`（`baseURL` 先留占位，Task 8 换成真实 pages.dev 域名）：
```toml
baseURL = "https://example.pages.dev/"
languageCode = "zh-cn"
title = "Attic.cyn"
theme = "PaperMod"
hasCJKLanguage = true
enableGitInfo = false
paginate = 10

[markup.goldmark.renderer]
unsafe = true   # 允许 md 中保留少量 HTML（历史文章里有 <br> 等）

[markup.highlight]
noClasses = false
codeFences = true
lineNos = false

[outputs]
home = ["HTML", "RSS", "JSON"]   # JSON 供 PaperMod 站内搜索用

[params]
defaultTheme = "auto"
ShowReadingTime = true
ShowCodeCopyButtons = true
ShowToc = true
[params.homeInfoParams]
Title = "Attic.cyn"
Content = "一个程序员的 Java 学习记录"

[[menu.main]]
identifier = "archives"
name = "归档"
url = "/archives/"
weight = 10
[[menu.main]]
identifier = "categories"
name = "分类"
url = "/categories/"
weight = 20
[[menu.main]]
identifier = "search"
name = "搜索"
url = "/search/"
weight = 30
```

- [ ] **Step 3: 写 `.gitignore`**

创建 `.gitignore`：
```gitignore
/public/
/resources/
.hugo_build.lock
.DS_Store
```

- [ ] **Step 4: 验证 Hugo 能识别配置（此时还没主题，预期报主题缺失）**

Run: `hugo --quiet 2>&1 | head -5`
Expected: 报错类似 `module "PaperMod" not found` —— 说明配置被正确读取，只是主题还没装（Task 2 装）。

- [ ] **Step 5: Commit**
```bash
git add hugo.toml .gitignore
git commit -m "chore: 初始化 Hugo 站点骨架与配置"
```

---

## Task 2: 添加 PaperMod 主题并验证渲染

**Files:**
- Create: `.gitmodules`（由 submodule 命令生成）
- Create: `themes/PaperMod/`（submodule）
- Create: `content/posts/_smoke/index.md`（临时冒烟文章，Task 4 末尾删除）

- [ ] **Step 1: 以 submodule 方式添加 PaperMod**

Run:
```bash
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive
```
Expected: `themes/PaperMod/` 出现，根目录生成 `.gitmodules`。

> 若该命令走代理失败：本机 VPN 在 `127.0.0.1:7897`，可 `https_proxy=http://127.0.0.1:7897 git submodule add ...`。

- [ ] **Step 2: 放一篇临时冒烟文章**

创建 `content/posts/_smoke/index.md`：
```markdown
---
title: "冒烟测试"
date: 2026-06-12
draft: false
---
hello hugo + papermod
```

- [ ] **Step 3: 构建验证**

Run: `hugo --quiet && ls public/index.html`
Expected: 无报错，`public/index.html` 存在。

- [ ] **Step 4: 本地起服务人工核对（可选但建议）**

Run: `hugo server -D`
Expected: 打开 `http://localhost:1313/` 看到 PaperMod 首页 + "冒烟测试" 文章。确认后 Ctrl-C。
> 本机注意：访问 localhost 需让代理放行本地，已知 harness 注入代理 `NO_PROXY` 默认空；`hugo server` 是本地进程，一般不受影响，若异常则 `export NO_PROXY=127.0.0.1,localhost,::1`。

- [ ] **Step 5: Commit**
```bash
git add .gitmodules themes/PaperMod content/posts/_smoke/index.md
git commit -m "feat: 接入 PaperMod 主题并通过冒烟构建"
```

---

## Task 3: 编写迁移脚本（TDD：先测纯函数）

**Files:**
- Create: `scripts/test_migrate.py`
- Create: `scripts/migrate.py`

- [ ] **Step 1: 写失败测试（日期归一化 + frontmatter 解析/生成）**

创建 `scripts/test_migrate.py`：
```python
import unittest
import migrate


class TestHelpers(unittest.TestCase):
    def test_normalize_date_pads_single_digits(self):
        self.assertEqual(migrate.normalize_date("2020-8-24"), "2020-08-24")

    def test_normalize_date_keeps_padded(self):
        self.assertEqual(migrate.normalize_date("2020-11-06"), "2020-11-06")

    def test_normalize_date_invalid_returns_none(self):
        self.assertIsNone(migrate.normalize_date("not-a-date"))

    def test_parse_frontmatter_splits_keys_and_body(self):
        text = "---\ntitle: Java 虚拟机\ncreateDate: 2020-8-24\ncategory: java\n---\n# 正文\nhello"
        fm, body = migrate.parse_frontmatter(text)
        self.assertEqual(fm["title"], "Java 虚拟机")
        self.assertEqual(fm["createDate"], "2020-8-24")
        self.assertEqual(fm["category"], "java")
        self.assertTrue(body.startswith("# 正文"))

    def test_build_frontmatter_maps_category_and_date(self):
        fm = {"title": "X", "createDate": "2020-8-24", "updateDate": "2020-9-1",
              "category": "java"}
        out = migrate.build_frontmatter(fm, "01.dev/12.java/x.md", "# X", is_vue=False)
        self.assertIn('title: "X"', out)
        self.assertIn("date: 2020-08-24", out)
        self.assertIn("lastmod: 2020-09-01", out)
        self.assertIn('categories: ["后端基础"]', out)
        self.assertIn('"java"', out)          # 原 category 作为 tag 保留
        self.assertNotIn("归档", out)          # 非 Vue 文章不打归档

    def test_build_frontmatter_vue_adds_archive_tag(self):
        out = migrate.build_frontmatter({"title": "demo"},
                                        "05.openSource/10.scanBox/scanBox.md",
                                        "# demo", is_vue=True)
        self.assertIn("归档", out)

    def test_strip_vue_removes_script_and_component(self):
        body = "# demo\n<scan-box-demo/>\n<script>\nexport default {}\n</script>\n正文"
        out = migrate.strip_vue(body)
        self.assertNotIn("<script>", out)
        self.assertNotIn("scan-box-demo", out)
        self.assertIn("正文", out)

    def test_rewrite_images_to_absolute(self):
        out = migrate.rewrite_images("![](./jvm.png)", "01.dev/12.java/jvm.md")
        self.assertEqual(out, "![](/images/01.dev/12.java/jvm.png)")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `cd scripts && python3 -m unittest test_migrate -v`
Expected: FAIL，报 `ModuleNotFoundError: No module named 'migrate'`（脚本还没写）。

- [ ] **Step 3: 写 `scripts/migrate.py`（完整实现）**

创建 `scripts/migrate.py`：
```python
#!/usr/bin/env python3
"""一次性迁移：VuePress docs/ -> Hugo content/posts/ + static/images/.
仅用标准库。可复跑：每次先清空 content/posts 与 static/images。
用法：python3 scripts/migrate.py
"""
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
CONTENT = ROOT / "content" / "posts"
IMAGES = ROOT / "static" / "images"

# 顶层目录 -> 分类显示名
CATEGORY = {
    "01.dev": "后端基础",
    "02.front": "前端",
    "03.framework": "框架",
    "04.javalibrary": "Java知识库",
    "05.openSource": "开源项目",
    "06.javainterview": "面试",
}

# 跳过的文件（VuePress 首页 / 动态列表，相对 DOCS）
SKIP_FILES = {"README.md", "00.mydocslist/README.md"}

# 仅依赖 Vue 的页面：剥离脚本/组件并打「归档」标签（相对 DOCS）
VUE_FILES = {"05.openSource/10.scanBox/scanBox.md"}


def normalize_date(s):
    m = re.match(r"\s*(\d{4})-(\d{1,2})-(\d{1,2})", str(s))
    if not m:
        return None
    y, mo, d = m.groups()
    return f"{y}-{int(mo):02d}-{int(d):02d}"


def git_first_date(path):
    res = subprocess.run(
        ["git", "log", "--diff-filter=A", "--format=%aI", "--", str(path)],
        cwd=ROOT, capture_output=True, text=True)
    lines = res.stdout.strip().splitlines()
    return lines[-1][:10] if lines else "2020-01-01"


def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    block = text[3:end].strip("\n")
    body = text[end + 4:]
    if body.startswith("\n"):
        body = body[1:]
    fm = {}
    for line in block.splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            fm[k.strip()] = v.strip()
    return fm, body


def first_h1(body):
    m = re.search(r"^#\s+(.+)$", body, re.M)
    return m.group(1).strip() if m else None


def yq(s):
    return '"' + str(s).replace('\\', '\\\\').replace('"', '\\"') + '"'


def build_frontmatter(fm, src_rel, body, is_vue):
    top = src_rel.split("/")[0]
    category = CATEGORY.get(top, "未分类")
    title = fm.get("title") or first_h1(body) or Path(src_rel).stem
    date = normalize_date(fm.get("createDate")) or git_first_date(DOCS / src_rel)
    lastmod = normalize_date(fm.get("updateDate")) or date
    tags = []
    if fm.get("category"):
        tags.append(fm["category"])
    if is_vue:
        tags.append("归档")
    tags_line = "tags: [" + ", ".join(yq(t) for t in tags) + "]" if tags else "tags: []"
    return "\n".join([
        "---",
        f"title: {yq(title)}",
        f"date: {date}",
        f"lastmod: {lastmod}",
        f"categories: [{yq(category)}]",
        tags_line,
        "draft: false",
        "---",
        "",
    ])


def strip_vue(body):
    body = re.sub(r"<script>.*?</script>", "", body, flags=re.S)
    body = re.sub(r"<template>.*?</template>", "", body, flags=re.S)
    body = re.sub(r"<scan-box-demo\s*/?>", "", body)
    return body


def strip_vp_containers(body):
    # 去掉 VuePress ::: 容器围栏，保留内部文字
    return "\n".join(l for l in body.splitlines() if not l.strip().startswith(":::"))


def rewrite_images(body, src_rel):
    d = Path(src_rel).parent.as_posix()

    def repl(m):
        alt, path = m.group(1), m.group(2)
        if path.startswith("./"):
            return f"![{alt}](/images/{d}/{path[2:]})"
        return m.group(0)

    return re.sub(r"!\[([^\]]*)\]\((\.\/[^)]+)\)", repl, body)


def migrate_md(src, src_rel, is_vue):
    text = src.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(text)
    if is_vue:
        body = strip_vue(body)
    body = strip_vp_containers(body)
    body = rewrite_images(body, src_rel)
    out = build_frontmatter(fm, src_rel, body, is_vue) + body.lstrip("\n")
    dest = CONTENT / src_rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(out, encoding="utf-8")


def write_section_index(top, readme_body):
    cat = CATEGORY[top]
    dest = CONTENT / top / "_index.md"
    dest.parent.mkdir(parents=True, exist_ok=True)
    head = "\n".join(["---", f"title: {yq(cat)}", "---", ""])
    dest.write_text(head + (readme_body or ""), encoding="utf-8")


def main():
    for d in (CONTENT, IMAGES):
        if d.exists():
            shutil.rmtree(d)
        d.mkdir(parents=True)

    md_count = 0
    for top in CATEGORY:
        topdir = DOCS / top
        if not topdir.exists():
            continue
        for path in sorted(topdir.rglob("*")):
            if path.is_dir():
                continue
            rel = path.relative_to(DOCS).as_posix()
            if "/.vuepress/" in "/" + rel:
                continue
            if path.suffix.lower() == ".md":
                if rel in SKIP_FILES:
                    continue
                # 顶层分类 README -> section 落地页
                if path.parent == topdir and path.stem.lower() == "readme":
                    _, body = parse_frontmatter(path.read_text(encoding="utf-8"))
                    write_section_index(top, body)
                    continue
                migrate_md(path, rel, is_vue=(rel in VUE_FILES))
                md_count += 1
            else:
                dest = IMAGES / Path(rel).parent / path.name
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, dest)
    print(f"migrated {md_count} articles")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `cd scripts && python3 -m unittest test_migrate -v`
Expected: PASS，9 个测试全绿。

- [ ] **Step 5: Commit**
```bash
git add scripts/migrate.py scripts/test_migrate.py
git commit -m "feat: 新增 VuePress→Hugo 迁移脚本（含纯函数单测）"
```

---

## Task 4: 执行迁移并验证全站构建

**Files:**
- Create: `content/posts/**`（脚本产物）
- Create: `static/images/**`（脚本产物）
- Delete: `content/posts/_smoke/`（删除冒烟文章）

- [ ] **Step 1: 跑迁移脚本**

Run: `python3 scripts/migrate.py`
Expected: 打印 `migrated 25 articles`（6 个分类目录下共 28 篇，减去 3 个分类 README→`_index.md` = 25；根 `README.md` 与 `00.mydocslist/README.md` 不在分类目录内、本就不迁移。scanBox 计入这 25 篇）。

- [ ] **Step 2: 删除冒烟文章**

Run: `rm -rf content/posts/_smoke`

- [ ] **Step 3: 全站构建，要求 0 报错**

Run: `hugo --quiet 2>&1 | tee /tmp/hugobuild.log; echo "EXIT=${PIPESTATUS[0]}"`
Expected: `EXIT=0`，`/tmp/hugobuild.log` 无 `ERROR`。

- [ ] **Step 4: 校验产物数量与关键内容**

Run:
```bash
find public/posts -name index.html | wc -l        # 文章页数量，应与迁移数一致（含 section）
grep -rl "归档" content/posts | sed 's#.*/##'      # 应只命中 scanBox.md
ls static/images/01.dev/12.java/ | head            # 图片已复制
grep -c 'src="/images/' public/posts/01.dev/12.java/jvm/index.html  # 图片引用已转绝对路径，>0
```
Expected: 文章页数量与脚本打印一致；`归档` 仅出现在 `scanBox.md`；图片目录有文件；jvm 文章页含 `/images/` 引用。

- [ ] **Step 5: 人工抽查渲染（建议）**

Run: `hugo server`
Expected: 抽查 `jvm`（图片正常显示）、`scanBox`（无 Vue 残留、正文完整、带「归档」标签）、`fastdfs`（无 `:::` 残留）三篇。确认后 Ctrl-C。

- [ ] **Step 6: Commit**
```bash
git add content static
git commit -m "feat: 迁移 25 篇历史文章及图片到 Hugo（scanBox 打归档标签）"
```

---

## Task 5: 新文章模板与本地写作流

**Files:**
- Create: `archetypes/default.md`
- Create: `WRITING.md`

- [ ] **Step 1: 写 archetype 模板**

创建 `archetypes/default.md`：
```markdown
---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
lastmod: {{ .Date }}
categories: []
tags: []
draft: true
---
```

- [ ] **Step 2: 验证 `hugo new` 生成正确 frontmatter**

Run: `hugo new posts/test-post.md && head -8 content/posts/test-post.md`
Expected: 生成文件，frontmatter 含 `date`/`draft: true`。

- [ ] **Step 3: 删除测试文件**

Run: `rm content/posts/test-post.md`

- [ ] **Step 4: 写本地写作流说明 `WRITING.md`**

创建 `WRITING.md`：
```markdown
# 写作与发布

## 新文章
    hugo new posts/<slug>.md
编辑正文，把 frontmatter 的 `draft: true` 改为 `false`（或保留草稿）。
填 `categories`（如 后端基础/前端/框架/Java知识库/开源项目/面试）和 `tags`。

## 本地预览
    hugo server -D      # -D 显示草稿

## 发布
    git add . && git commit -m "post: <标题>" && git push
push 到 main 后 GitHub Actions 自动构建并部署到 Cloudflare Pages。

## 图片
放到 static/images/ 下，正文用绝对路径引用：![](/images/xxx.png)
```

- [ ] **Step 5: Commit**
```bash
git add archetypes/default.md WRITING.md
git commit -m "feat: 新增文章 archetype 与本地写作流说明"
```

---

## Task 6: GitHub Actions → Cloudflare Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: 写部署 workflow**

创建 `.github/workflows/deploy.yml`（把 `HUGO_VERSION` 改成 Task 1 本机 `hugo version` 显示的版本；`projectName` 改成你在 Cloudflare 建的 Pages 项目名）：
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.148.2   # ← 改成本机 hugo version 的版本
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0       # 供 enableGitInfo / lastmod 使用

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: ${{ env.HUGO_VERSION }}
          extended: true

      - name: Build
        run: hugo --minify --gc

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy public --project-name=cyn-blog   # ← 改成你的项目名
```

- [ ] **Step 2: 校验 YAML 合法**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/deploy.yml'))" 2>/dev/null && echo OK || echo "需手测：本机可能无 pyyaml，改用 hugo 无关，跳过即可"`
Expected: `OK`（无 pyyaml 时跳过，YAML 由 GitHub 端校验）。

- [ ] **Step 3: 本地复现 CI 构建命令**

Run: `hugo --minify --gc && echo "BUILD OK"`
Expected: `BUILD OK`，无 ERROR。

- [ ] **Step 4: Commit**
```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GitHub Actions 构建并部署到 Cloudflare Pages"
```

---

## Task 7: 清理旧 VuePress 资产

**Files:**
- Delete: `docs/.vuepress/`、`docs/00.*`~`docs/06.*`、`docs/README.md`、`config.js` 等旧内容
- Keep: `docs/superpowers/`（spec 与 plan）

- [ ] **Step 1: 确认旧内容已在 git 历史（gh-pages）中留存**

Run: `git log --oneline gh-pages -1 && echo "旧资产保留在 gh-pages 历史，可安全从 main 移除"`
Expected: 显示 gh-pages 最新提交，说明历史可回溯。

- [ ] **Step 2: 删除旧 VuePress 资产（保留 superpowers 文档）**

Run:
```bash
git rm -r --quiet docs/.vuepress \
  docs/00.mydocslist docs/01.dev docs/02.front docs/03.framework \
  docs/04.javalibrary docs/05.openSource docs/06.javainterview \
  docs/README.md
git rm -q package.json yarn.lock 2>/dev/null || true
ls docs/   # 应只剩 superpowers/
```
Expected: `docs/` 下只剩 `superpowers/`。

- [ ] **Step 3: 确认全站仍能构建**

Run: `hugo --minify --gc 2>&1 | tee /tmp/hb.log; echo "EXIT=${PIPESTATUS[0]}"`
Expected: `EXIT=0`，无 ERROR（迁移后的 `content/` 不依赖被删的 `docs/`）。

- [ ] **Step 4: Commit**
```bash
git add -A
git commit -m "chore: 移除旧 VuePress 资产（历史保留在 gh-pages 分支）"
```

---

## Task 8: 收尾——baseURL、README、合并到 main

**Files:**
- Modify: `hugo.toml`（baseURL）
- Modify: `README.MD`

- [ ] **Step 1: 把 baseURL 换成真实 pages.dev 域名**

在 `hugo.toml` 把 `baseURL = "https://example.pages.dev/"` 改成 Cloudflare 项目分配的 `https://<项目名>.pages.dev/`（来自手工前置清单）。

- [ ] **Step 2: 更新 README.MD 顶部说明为 Hugo 工作流**

把 `README.MD` 开头改为简述：本仓库为 Hugo + PaperMod 博客源码，`main` 分支为源码，写作见 `WRITING.md`，push 自动部署 Cloudflare Pages。（保留原「阅读须知/联系方式」段落。）

- [ ] **Step 3: 末次本地构建确认**

Run: `hugo --minify --gc && echo OK`
Expected: `OK`。

- [ ] **Step 4: Commit**
```bash
git add hugo.toml README.MD
git commit -m "chore: 设置 pages.dev baseURL 并更新 README"
```

- [ ] **Step 5: 合并 blog-hugo-migration 到 main（触发首次部署）**

> 前提：手工前置清单已完成（Cloudflare 项目 + 两个 GitHub secret 已就绪）。
```bash
git branch -f main blog-hugo-migration   # 若 main 不存在则创建
git checkout main
git push github main      # push 到 GitHub 触发 Actions（origin 为 gitee，不触发 Actions）
```
Expected: GitHub Actions 运行成功，Cloudflare Pages 上 `<项目名>.pages.dev` 可访问到博客。

- [ ] **Step 6: 部署后人工验收**

打开 `https://<项目名>.pages.dev/`：首页文章列表、分类页、搜索、`jvm` 图片、`scanBox` 归档标签均正常。

---

## Self-Review 结论

- **Spec 覆盖**：Hugo+PaperMod（T1-2）、历史 md 全迁移（T3-4）、依赖 Vue 仅迁正文+归档标签（T3 `strip_vue`/`VUE_FILES` + T4 校验）、分类自动归纳（T3 `CATEGORY` 映射 + 原 category 转 tag）、缺失日期用 git 首次提交时间（T3 `git_first_date`）、图片迁移改写（T3 `rewrite_images` + T4 校验）、GitHub Actions→Cloudflare（T6）、本地写作流（T5）、先用 pages.dev（T1 占位 + T8 替换）、旧资产归档保留（T7 依赖 gh-pages 历史）—— 均有对应任务。
- **Placeholder**：无 TBD；所有脚本/配置/命令均为完整内容。`HUGO_VERSION`、Cloudflare 项目名、pages.dev 域名为「需用户填的真实值」，已在步骤中明确标注来源，非占位逻辑。
- **类型/命名一致**：`migrate.py` 中 `normalize_date`/`parse_frontmatter`/`build_frontmatter`/`strip_vue`/`rewrite_images` 在测试（T3 Step1）与实现（T3 Step3）中签名一致；`CATEGORY` 键与 `docs/` 顶层目录名一致；`归档` 标签字符串各处统一。
```
