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

- **Navbar is centralized via `_includes/navbar.html`.** All pages (index, post layout, posts listing, categories, about) include it with `{% include navbar.html active='...' %}` to set the active nav item. The `_layouts/default.html` is intentionally minimal (just `<head>` + `{{ content }}`).
- **Sidebar and footer HTML are duplicated across all 5 pages.** The author card, category list, and footer are copy-pasted into `index.markdown`, `posts/index.html`, `categories/index.html`, `about.markdown`, and `_layouts/post.html`. Changing any of these requires editing all 5 files.
- **Four SASS source files with significant redundancy.** `_sass/design.scss` and `_sass/main.scss` are older design systems (blue primary `#2563eb`, `.navbar`/`.hero` class names). `assets/css/design.scss` is the active design layer (imports Remix Icon CDN, `.top-nav`/`.hero-section`/`.page-title-section` class names). `assets/css/style.scss` imports `design.scss` (from the SASS load path, resolving to `_sass/design.scss` first), then overrides everything with CSDN-style theming (red `--accent: #fc5531`, `prefers-color-scheme: dark` support, gradient headers, BEM-like class names). Jekyll compiles `style.scss` to `style.css` at build time (not committed).
- **Post layout** (`_layouts/post.html`) is where most complexity lives: breadcrumbs, cover images, reading time estimate (chars/400), auto-generated TOC in sidebar, related posts, author card, category tags.

### CSS class naming conventions

Two naming systems coexist across the SASS sources:
- **BEM-like** (from `assets/css/style.scss`): `.article-layout`, `.article-head__title`, `.sidebar-toc__link--h3`, `.breadcrumb__sep`
- **Utility/hierarchical** (from `assets/css/design.scss`): `.top-nav`, `.hero-section`, `.content-container`, `.left-content`, `.right-sidebar`

When adding new styles, use the BEM-like conventions from `style.scss` — `design.scss` is effectively frozen.

### JavaScript (`assets/js/main.js`)

Three independent IIFE modules:
1. Back-to-top button (creates element, scroll listener at >300px)
2. Article TOC generator — reads `h2`/`h3` from `.article-body`, assigns IDs, builds nav links, wires IntersectionObserver for scroll-spy
3. Scroll reveal — IntersectionObserver adds `.is-visible` to `.fade-in-up`, `.article-card`, `.sidebar` elements

### Page inventory

| URL | Source file | Notes |
|---|---|---|
| `/` | `index.markdown` | Homepage with hero, article list, sidebar |
| `/posts/` | `posts/index.html` | All posts listing with manual pagination UI |
| `/categories/` | `categories/index.html` | Hardcoded category color mappings (Java → blue gradient, 小程序 → purple, fallback → yellow) |
| `/about/` | `about.markdown` | Static about page with markdown body |
| `/404.html` | `404.html` | Static 404 page (does not use default layout) |
| `/contact/` | *does not exist* | Referenced in `_config.yml` nav menu but no page created |
| Individual post | `_layouts/post.html` | Used by all `_posts/*.md` files |

### Content

Posts live in `_posts/` with standard Jekyll naming (`YYYY-MM-DD-slug.md`). Front matter supports `cover` (image path), `categories`, and `tags`. Posts are written in Markdown with syntax highlighting via Rouge.

### Dependencies

- `jekyll-paginate` (5 posts per page, configured in `_config.yml` — but the homepage template uses `site.posts` directly, not `paginator.posts`, so pagination is effectively unused)
- `jekyll-feed` (Atom feed at `/feed.xml`)
- `jekyll-seo-tag` (via Minima, adds `{% seo %}` in `<head>`)
- Remix Icon (loaded via CDN in `assets/css/design.scss` for `ri-*` icon classes)
- Google Fonts: Noto Sans SC (loaded in both `_sass/design.scss` and `assets/css/design.scss`)
