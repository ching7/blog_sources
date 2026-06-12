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
