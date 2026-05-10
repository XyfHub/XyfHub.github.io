# Blog Rebuild Design Spec

**Date:** 2026-05-10  
**Goal:** Rebuild the Jekyll blog with a clean, modern card-style design that deploys reliably to GitHub Pages.

## Requirements

1. Preserve all 4 existing blog posts (content, titles, dates)
2. Replace all CSS/SASS with a single hand-written `style.css`
3. Replace all Jekyll templates with simplified versions using `_includes/` for shared components
4. Modern card-style design with system font stack, no external CDN dependencies
5. Responsive (mobile/desktop), dark mode via `prefers-color-scheme: dark`
6. Homepage: two-column (article list + sidebar), article page: single-column centered

## File Structure

```
├── _config.yml              # simplified config, remove contact nav
├── _layouts/
│   ├── default.html         # global shell: head + navbar + footer
│   └── post.html            # single-column article layout with TOC
├── _includes/
│   ├── navbar.html          # shared nav (home/categories/posts/about)
│   ├── sidebar.html         # shared sidebar (author card + categories)
│   └── footer.html          # shared footer
├── assets/
│   ├── css/
│   │   └── style.css        # single CSS file, ~350-400 lines, no SASS
│   └── js/
│       └── main.js          # back-to-top + TOC scroll-spy + fade-in
├── index.html               # homepage: article cards + sidebar
├── posts/
│   └── index.html           # post listing: article cards + sidebar + pagination
├── categories/
│   └── index.html           # category cards + articles by category + sidebar
├── about.md                 # about page with sidebar
├── _posts/                  # 4 markdown files preserved as-is
└── 404.html                 # simple standalone 404
```

## Design System

| Property | Value |
|----------|-------|
| Font | System font stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif` |
| Monospace font | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` |
| Primary accent | `#4f46e5` (indigo) |
| Text color (light) | `#1e293b` |
| Text secondary | `#64748b` |
| Background (light) | `#f8fafc` |
| Card background | `#ffffff` |
| Card shadow | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` |
| Card radius | `12px` |
| Dark bg | `#0f172a` |
| Dark card bg | `#1e293b` |
| Dark text | `#e2e8f0` |
| Max content width (single-col) | `720px` |
| Max site width (two-col) | `1120px` |

## Pages and Layouts

### `_layouts/default.html`
- `<head>` with meta tags, `{% seo %}`, single CSS link, system font
- `<body>` renders `{% include navbar.html %}`, `{{ content }}`, `{% include footer.html %}`
- JS loaded at end of body

### `_layouts/post.html` (extends default)
- Single column, max-width 720px, centered
- Article header: title, date, reading time (chars/400), category tags
- Article body from markdown content
- Auto-generated TOC sidebar (sticky on desktop, collapsible on mobile) from h2/h3
- Related posts at bottom

### `index.html`
- Hero section with title + subtitle
- Left: article cards (cover image fallback → gradient placeholder, title, excerpt 200 chars, date, category chip, "Read more →")
- Right: sticky sidebar (author card + category list)

### `posts/index.html`
- Page title "所有文章"
- Same article card layout as homepage
- Pagination controls at bottom

### `categories/index.html`
- Category cards at top (gradient backgrounds, icon, article count)
- Below: articles grouped by category
- Sidebar

### `about.md`
- Content area + sidebar, same two-column layout

## CSS Architecture (single file)

```
1. CSS Variables (light theme)
2. Reset & base
3. Typography
4. Navbar
5. Hero
6. Article cards
7. Sidebar
8. Article body (post content styling)
9. TOC
10. Category cards
11. Footer
12. Pagination
13. Dark mode overrides (@media prefers-color-scheme: dark)
14. Responsive breakpoints (768px, 1024px)
```

No SASS compilation needed. Jekyll serves `style.css` directly.

## JavaScript (main.js)

Three self-contained modules:
1. Back-to-top button (create element, show >300px scroll, smooth scroll to top)
2. TOC scroll-spy (find h2/h3 in `.article-body`, build nav in `#article-toc`, IntersectionObserver for active state)
3. Fade-in on scroll (IntersectionObserver adds `.visible` to `.fade-in` elements)

## What Gets Deleted

- `_sass/` directory and all contents
- `assets/css/style.scss`
- `assets/css/design.scss`
- `assets/img/` (old favicons/manifest — replaced with simple inline SVG favicon)
- `_layouts/default.html` (rewritten)
- `_layouts/post.html` (rewritten)
- `_includes/navbar.html` (rewritten)
- `index.markdown` → replaced with `index.html`
- `posts/index.html` (rewritten)
- `categories/index.html` (rewritten)
- `about.markdown` (updated)
- `_config.yml` (updated, simplified)

## What Stays

- `_posts/*.md` — all 4 files preserved
- `Gemfile` / `Gemfile.lock` — dependencies unchanged
- `assets/images/` — post cover images preserved
- `assets/js/main.js` — rewritten but same location
