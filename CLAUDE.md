# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal Java learning-notes blog ("Attic.cyn") built with **Hugo** (extended) + the **PaperMod** theme. Content is Chinese-language Markdown under `content/posts/`, organized into category sections. Migrated from a former VuePress 1.x site — the old VuePress source remains in the `gh-pages` branch's git history.

## Commands

- `hugo server -D` — local dev server (includes drafts).
- `hugo --minify --gc` — production build into `public/` (the exact command CI runs).
- `hugo new posts/<slug>.md` — scaffold a new post from `archetypes/default.md`.
- `cd scripts && python3 -m unittest test_migrate` — run the migration script's unit tests.

Hugo is installed via Homebrew (`hugo version` → v0.158.x+extended). The theme is a git submodule — after a fresh clone run `git submodule update --init --recursive`.

## Architecture

- **`content/posts/<category>/...`** — articles as Markdown, nested by original category (01.dev, 02.front, 03.framework, 04.javalibrary, 05.openSource, 06.javainterview). Each category has an `_index.md` section landing page. Post frontmatter: `title`/`date`/`lastmod`/`categories`/`tags`/`draft`.
- **`static/images/<dir>/`** — article images, referenced from posts with absolute paths `/images/...`.
- **`hugo.toml`** — site config (PaperMod theme, menu, search via JSON output, pagination).
- **`themes/PaperMod/`** — theme (git submodule, pinned commit).
- **`scripts/migrate.py`** — one-off VuePress→Hugo migration script (already run; kept for reference). Standard-library only.
- **`.github/workflows/deploy.yml`** — on push to `main`, builds Hugo and deploys `public/` to Cloudflare Pages via wrangler. Requires repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.

## Writing & publishing

See `WRITING.md`. In short: `hugo new posts/<slug>.md`, write, set `draft: false`, fill `categories`/`tags`, then `git commit && git push` to `main` → GitHub Actions deploys to Cloudflare Pages.

## Deploy notes

- `baseURL` in `hugo.toml` must match the Cloudflare Pages URL (currently the `*.pages.dev` default; a custom domain can be added later).
- The GitHub remote is `github` (github.com/ching7/blog_sources); the gitee `origin` does not run Actions.
- Migration design docs / specs / plans live under `docs/superpowers/`.
