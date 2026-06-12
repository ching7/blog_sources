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
