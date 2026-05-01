# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bundle install                    # Install dependencies (first time or after Gemfile changes)
bundle exec jekyll serve          # Dev server with live reload at http://localhost:4000
bundle exec jekyll build          # Production build into _site/
bundle exec jekyll clean && bundle exec jekyll build  # Clean rebuild
```

There are no tests, linters, or CI workflows in this project.

## Architecture

This is a Jekyll 4.4.1 static site (personal tech blog in Chinese) deployed via GitHub Pages at `xyfhub.github.io`. It uses the Minima 2.5 theme as a base but overrides nearly everything with custom templates and CSS.

### Key architectural choices

- **Navbar is duplicated, not inherited.** Every page (index, post layout, posts listing, categories) copies the full nav HTML inline rather than extracting it into `_includes/`. The `_layouts/default.html` is intentionally minimal (just `<head>` + `{{ content }}`). Changing the nav means editing 4+ files.
- **Two layers of SASS that conflict.** `_sass/design.scss` is an older design system (blue primary, Noto Sans SC, `top-nav`/`hero-section` class names). `assets/css/style.scss` is the active stylesheet — it imports `design.scss` via `@import`, then overrides everything with CSDN-style theming (red `--accent: #fc5531`, `prefers-color-scheme: dark` support, gradient headers). `assets/css/style.css` is the compiled output checked into the repo.
- **Post layout** (`_layouts/post.html`) is where most complexity lives: breadcrumbs, cover images, reading time estimate (chars/400), auto-generated TOC in sidebar, related posts, author card, category tags.

### CSS class naming conventions

Two naming systems coexist:
- **BEM-like** (active layer): `.article-layout`, `.article-head__title`, `.sidebar-toc__link--h3`, `.breadcrumb__sep`
- **Utility/hierarchical** (legacy layer): `.top-nav`, `.hero-section`, `.content-container`, `.left-content`, `.right-sidebar`

### JavaScript (`assets/js/main.js`)

Three independent IIFE modules:
1. Back-to-top button (creates element, scroll listener at >300px)
2. Article TOC generator — reads `h2`/`h3` from `.article-body`, assigns IDs, builds nav links, wires IntersectionObserver for scroll-spy
3. Scroll reveal — IntersectionObserver adds `.is-visible` to `.fade-in-up`, `.article-card`, `.sidebar` elements

### Content

Posts live in `_posts/` with standard Jekyll naming (`YYYY-MM-DD-slug.md`). Front matter supports `cover` (image path), `categories`, and `tags`. Categories are rendered with hardcoded color mappings in `categories/index.html` (Java → blue gradient, 小程序 → purple, fallback → yellow).

### Dependencies

- `jekyll-paginate` (5 posts per page, configured in `_config.yml`)
- `jekyll-feed` (Atom feed at `/feed.xml`)
- `jekyll-seo-tag` (via Minima, adds `{% seo %}` in head)
- Remix Icon (loaded via CDN for `ri-*` icon classes)
- Google Fonts: Noto Sans SC (loaded in `_sass/design.scss`)
