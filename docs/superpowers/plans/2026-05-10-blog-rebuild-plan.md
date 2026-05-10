# Blog Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Jekyll blog with a clean single CSS file, simplified templates using `_includes/`, modern card-style design, and zero external CDN dependencies.

**Architecture:** Jekyll 4.4.1 site with two layouts (default for pages, post for articles). Shared components (navbar, sidebar, footer) live in `_includes/`. A single `assets/css/style.css` replaces all prior SASS/CSS. 4 markdown posts in `_posts/` are preserved as-is.

**Tech Stack:** Jekyll 4.4.1, Minima 2.5 theme (base only, all templates overridden), jekyll-paginate, jekyll-feed, jekyll-seo-tag. No external fonts or icon libraries.

**Special note:** CSS design MUST use the `frontend-design` skill for visual quality. All page templates that render user-facing UI should also be designed via `frontend-design`.

---

### Task 1: Clean up old files and update config

**Files:**
- Delete: `_sass/design.scss`, `_sass/main.scss`, `assets/css/style.scss`, `assets/css/design.scss`
- Modify: `_config.yml`

- [ ] **Step 1: Delete old SASS and CSS source files**

```bash
rm -f "C:\Users\26435\XyfHub.github.io\_sass\design.scss"
rm -f "C:\Users\26435\XyfHub.github.io\_sass\main.scss"
rm -f "C:\Users\26435\XyfHub.github.io\assets\css\style.scss"
rm -f "C:\Users\26435\XyfHub.github.io\assets\css\design.scss"
```

- [ ] **Step 2: Reset _config.yml to simplified version**

Write `_config.yml`:

```yaml
title: 小徐的技术日记
title_separator: "|"
email: ifikifk@qq.com
description: >-
  一名软件工程学生的技术成长记录，分享Java后端、小程序、数据库与编程日常
baseurl: ""
url: "https://xyfhub.github.io"
github_username: XyfHub

author:
  name: 小徐
  bio: 软件工程专业学生，热爱编程和技术分享
  avatar: ""

paginate: 5
paginate_path: "/page:num/"
permalink: /:year/:month/:day/:title/

menu:
  - title: 首页
    url: /
  - title: 文章
    url: /posts/
  - title: 分类
    url: /categories/
  - title: 关于
    url: /about/

social:
  - name: GitHub
    url: https://github.com/XyfHub
    icon: github
  - name: 邮箱
    url: mailto:ifikifk@qq.com
    icon: envelope

theme: minima
plugins:
  - jekyll-feed
  - jekyll-paginate

exclude:
  - .sass-cache/
  - .jekyll-cache/
  - gemfiles/
  - Gemfile
  - Gemfile.lock
  - node_modules/
  - vendor/bundle/
  - vendor/cache/
  - vendor/gems/
  - vendor/ruby/
  - README.md
  - docs/
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old SASS/CSS files, simplify _config.yml"
```

---

### Task 2: Create the single CSS file with frontend-design

**Files:**
- Create: `assets/css/style.css`

- [ ] **Step 1: Invoke frontend-design skill to design the complete CSS**

Use `Skill` tool with `skill: "frontend-design"` to create `assets/css/style.css`. The CSS must cover:

1. **CSS Variables** — light theme with indigo accent `#4f46e5`, dark theme via `prefers-color-scheme: dark`
2. **Reset & Base** — `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`, system font stack, smooth scrolling
3. **Typography** — base font-size 16px, line-height 1.7, headings with proper scale
4. **Container** — max-width 1120px centered, responsive padding
5. **Navbar** — sticky top, flexbox, site name + nav links, active state underline, dark mode
6. **Hero** — gradient background on homepage, title + subtitle + CTA button
7. **Article Cards** — white card with border-radius 12px, shadow, optional cover image, category chip, title, excerpt, meta, read-more link, hover lift effect
8. **Sidebar** — card sections for author info (avatar, name, bio, social) and categories (links with counts), sticky on desktop
9. **Article Body** — h2 with left accent border, h3 subtle, code blocks dark, inline code light bg, blockquotes, tables, images rounded
10. **TOC** — sidebar nav for post headings, active state with accent color, scroll-spy highlight
11. **Page Title Section** — gradient banner for non-homepage pages
12. **Category Cards** — colorful gradient cards for category overview
13. **Footer** — subtle bg, centered text, social links
14. **Pagination** — centered page links
15. **Back to Top** — fixed button bottom-right, visible after scroll
16. **Fade-in Animation** — `.fade-in` elements reveal on scroll
17. **Dark Mode** — all components adapted for `prefers-color-scheme: dark`
18. **Responsive** — breakpoints at 768px and 1024px for mobile/tablet

Design style: Modern card-style, clean, indigo accent, generous whitespace, readable typography. Chinese-language optimized.

- [ ] **Step 2: Verify CSS file was created**

Run: `wc -l "C:\Users\26435\XyfHub.github.io\assets\css\style.css"`  
Expected: file exists, ~350-500 lines

- [ ] **Step 3: Commit**

```bash
git add assets/css/style.css
git commit -m "feat: add single CSS stylesheet with modern card design"
```

---

### Task 3: Create shared includes

**Files:**
- Create: `_includes/navbar.html`
- Create: `_includes/sidebar.html`
- Create: `_includes/footer.html`

- [ ] **Step 1: Create `_includes/navbar.html`**

```html
<nav class="navbar">
  <div class="container navbar__inner">
    <a href="{{ '/' | relative_url }}" class="navbar__brand">{{ site.title }}</a>
    <ul class="navbar__links">
      {% for item in site.menu %}
        <li><a href="{{ item.url | relative_url }}" class="navbar__link{% if include.active == item.title %} is-active{% endif %}">{{ item.title }}</a></li>
      {% endfor %}
    </ul>
  </div>
</nav>
```

- [ ] **Step 2: Create `_includes/sidebar.html`**

```html
<aside class="sidebar">
  <div class="sidebar__card">
    <h3 class="sidebar__title">关于作者</h3>
    <div class="author-card">
      <div class="author-card__avatar">{{ site.author.name | slice: 0 }}</div>
      <div class="author-card__info">
        <h4 class="author-card__name">{{ site.author.name }}</h4>
        <p class="author-card__bio">{{ site.author.bio }}</p>
      </div>
    </div>
    <div class="author-card__social">
      {% for link in site.social %}
        <a href="{{ link.url }}" target="_blank" rel="noopener" class="social-link">{{ link.name }}</a>
      {% endfor %}
    </div>
  </div>

  <div class="sidebar__card">
    <h3 class="sidebar__title">文章分类</h3>
    <ul class="category-list">
      {% for category in site.categories %}
        <li class="category-list__item">
          <a href="{{ '/categories/' | relative_url }}#{{ category[0] | slugify }}" class="category-list__link">{{ category[0] }}</a>
          <span class="category-list__count">{{ category[1].size }}</span>
        </li>
      {% endfor %}
    </ul>
  </div>
</aside>
```

- [ ] **Step 3: Create `_includes/footer.html`**

```html
<footer class="footer">
  <div class="container footer__inner">
    <p class="footer__text">{{ site.description }}</p>
    <div class="footer__social">
      {% for link in site.social %}
        <a href="{{ link.url }}" target="_blank" rel="noopener" class="footer__link">{{ link.name }}</a>
      {% endfor %}
    </div>
    <p class="footer__copyright">&copy; {{ site.time | date: "%Y" }} {{ site.title }}</p>
  </div>
</footer>
```

- [ ] **Step 4: Commit**

```bash
git add _includes/navbar.html _includes/sidebar.html _includes/footer.html
git commit -m "feat: add shared navbar, sidebar, and footer includes"
```

---

### Task 4: Create layouts

**Files:**
- Create: `_layouts/default.html` (rewrite)
- Create: `_layouts/post.html` (rewrite)

- [ ] **Step 1: Create `_layouts/default.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {% seo %}
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📝</text></svg>">
  <meta name="theme-color" content="#4f46e5">
  <link rel="stylesheet" href="{{ '/assets/css/style.css' | relative_url }}">
  <link rel="alternate" type="application/rss+xml" title="{{ site.title }}" href="{{ '/feed.xml' | relative_url }}">
</head>
<body>
  {% include navbar.html active=page.active_nav %}
  {{ content }}
  {% include footer.html %}
  <script src="{{ '/assets/js/main.js' | relative_url }}"></script>
</body>
</html>
```

- [ ] **Step 2: Create `_layouts/post.html`**

```html
---
layout: default
---
{% assign raw_text = content | strip_html %}
{% assign char_count = raw_text | size %}
{% assign read_minutes = char_count | divided_by: 400 %}
{% if read_minutes < 1 %}{% assign read_minutes = 1 %}{% endif %}

<div class="page-title-section">
  <div class="container">
    <p class="page-title-section__eyebrow">
      <a href="{{ '/' | relative_url }}">首页</a> &rsaquo;
      <a href="{{ '/posts/' | relative_url }}">文章</a> &rsaquo;
      <span>{{ page.title | truncate: 30 }}</span>
    </p>
  </div>
</div>

<div class="container">
  <div class="article-layout">
    <article class="article-main" itemscope itemtype="https://schema.org/BlogPosting">
      <header class="article-head">
        {% if page.cover %}
          <img src="{{ page.cover | relative_url }}" alt="{{ page.title }}" class="article-head__cover">
        {% else %}
          <div class="article-head__cover article-head__cover--placeholder"></div>
        {% endif %}
        <h1 class="article-head__title" itemprop="headline">{{ page.title }}</h1>
        <div class="article-head__meta">
          <span>{{ page.date | date: "%Y年%m月%d日" }}</span>
          <span class="article-head__dot">·</span>
          <span>{{ site.author.name }}</span>
          <span class="article-head__dot">·</span>
          <span>约 {{ read_minutes }} 分钟阅读</span>
        </div>
        {% if page.categories.size > 0 %}
          <div class="article-head__chips">
            {% for category in page.categories %}
              <span class="chip">{{ category }}</span>
            {% endfor %}
          </div>
        {% endif %}
      </header>

      <div class="article-body" itemprop="articleBody">
        {{ content }}
      </div>

      <footer class="article-foot">
        <p class="article-foot__note">如果对你有帮助，欢迎收藏或在评论区交流。</p>
        <a href="{{ '/posts/' | relative_url }}" class="article-foot__back">&larr; 返回文章列表</a>
      </footer>
    </article>

    <aside class="article-aside">
      <div class="sidebar__card">
        <h3 class="sidebar__title">文章目录</h3>
        <nav class="toc-nav" id="article-toc" aria-label="文章目录"></nav>
      </div>
      <div class="sidebar__card">
        <h3 class="sidebar__title">相关文章</h3>
        <ul class="related-list">
          {% assign related = site.posts | where_exp: "p", "p.url != page.url" | sample: 5 %}
          {% for p in related %}
            <li class="related-list__item">
              <a href="{{ p.url | relative_url }}" class="related-list__link">{{ p.title }}</a>
              <span class="related-list__date">{{ p.date | date: "%Y-%m-%d" }}</span>
            </li>
          {% endfor %}
        </ul>
      </div>
    </aside>
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add _layouts/default.html _layouts/post.html
git commit -m "feat: add default and post layouts"
```

---

### Task 5: Create JavaScript

**Files:**
- Rewrite: `assets/js/main.js`

- [ ] **Step 1: Write `assets/js/main.js`**

```javascript
(function () {
  'use strict';

  // 1. Back-to-top button
  var btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', '返回顶部');
  btn.innerHTML = '&#8593;';
  document.body.appendChild(btn);

  window.addEventListener('scroll', function () {
    btn.classList.toggle('is-visible', window.pageYOffset > 300);
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 2. Article TOC (h2/h3 scroll-spy)
  var tocContainer = document.getElementById('article-toc');
  var articleBody = document.querySelector('.article-body');
  if (tocContainer && articleBody) {
    var headings = articleBody.querySelectorAll('h2, h3');
    if (headings.length) {
      headings.forEach(function (el, i) {
        if (!el.id) el.id = 'heading-' + i + '-' + Math.random().toString(36).slice(2, 8);
        var a = document.createElement('a');
        a.href = '#' + el.id;
        a.textContent = el.textContent.trim();
        a.className = 'toc-nav__link toc-nav__link--' + el.tagName.toLowerCase();
        a.addEventListener('click', function (e) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + el.id);
        });
        tocContainer.appendChild(a);
      });

      var links = tocContainer.querySelectorAll('a');
      if (links.length && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var id = entry.target.id;
            links.forEach(function (link) {
              link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
            });
          });
        }, { rootMargin: '-10% 0px -60% 0px', threshold: 0 });
        headings.forEach(function (h) { observer.observe(h); });
      }
    }
  }

  // 3. Fade-in on scroll
  var fadeNodes = document.querySelectorAll('.fade-in');
  if (fadeNodes.length && 'IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    fadeNodes.forEach(function (n) { fadeObserver.observe(n); });
  }
})();
```

- [ ] **Step 2: Commit**

```bash
git add assets/js/main.js
git commit -m "feat: rewrite main.js with back-to-top, TOC, and fade-in modules"
```

---

### Task 6: Create homepage

**Files:**
- Delete: `index.markdown`
- Create: `index.html`

- [ ] **Step 1: Delete old index file**

```bash
rm -f "C:\Users\26435\XyfHub.github.io\index.markdown"
```

- [ ] **Step 2: Create `index.html`**

```html
---
layout: default
title: 小徐的技术日记
active_nav: 首页
---

<section class="hero">
  <div class="container hero__inner">
    <h1 class="hero__title">分享技术，记录成长</h1>
    <p class="hero__subtitle">{{ site.description }}</p>
    <div class="hero__actions">
      <a href="{{ '/posts/' | relative_url }}" class="btn btn--primary">浏览文章</a>
      <a href="{{ '/about/' | relative_url }}" class="btn btn--secondary">关于我</a>
    </div>
  </div>
</section>

<section class="main-content">
  <div class="container">
    <div class="two-col">
      <div class="two-col__main">
        <h2 class="section-heading">最新文章</h2>

        {% for post in site.posts %}
          <article class="article-card fade-in">
            {% if post.cover %}
              <a href="{{ post.url | relative_url }}" class="article-card__cover-wrap">
                <img src="{{ post.cover | relative_url }}" alt="{{ post.title }}" class="article-card__cover" loading="lazy">
              </a>
            {% endif %}
            <div class="article-card__body">
              {% if post.categories.size > 0 %}
                <div class="article-card__chips">
                  {% for cat in post.categories %}
                    <span class="chip">{{ cat }}</span>
                  {% endfor %}
                </div>
              {% endif %}
              <h3 class="article-card__title">
                <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
              </h3>
              <p class="article-card__excerpt">{{ post.excerpt | strip_html | truncate: 200 }}</p>
              <div class="article-card__meta">
                <span>{{ post.date | date: "%Y年%m月%d日" }}</span>
              </div>
            </div>
          </article>
        {% endfor %}
      </div>

      <div class="two-col__side">
        {% include sidebar.html %}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: rewrite homepage with hero and article cards"
```

---

### Task 7: Create posts listing page

**Files:**
- Rewrite: `posts/index.html`

- [ ] **Step 1: Write `posts/index.html`**

```html
---
layout: default
title: 文章列表
active_nav: 文章
---

<div class="page-title-section">
  <div class="container">
    <h1 class="page-title-section__title">所有文章</h1>
    <p class="page-title-section__subtitle">分享技术经验，记录学习成长的每一步</p>
  </div>
</div>

<section class="main-content">
  <div class="container">
    <div class="two-col">
      <div class="two-col__main">
        {% for post in site.posts %}
          <article class="article-card fade-in">
            {% if post.cover %}
              <a href="{{ post.url | relative_url }}" class="article-card__cover-wrap">
                <img src="{{ post.cover | relative_url }}" alt="{{ post.title }}" class="article-card__cover" loading="lazy">
              </a>
            {% endif %}
            <div class="article-card__body">
              {% if post.categories.size > 0 %}
                <div class="article-card__chips">
                  {% for cat in post.categories %}
                    <span class="chip">{{ cat }}</span>
                  {% endfor %}
                </div>
              {% endif %}
              <h3 class="article-card__title">
                <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
              </h3>
              <p class="article-card__excerpt">{{ post.excerpt | strip_html | truncate: 200 }}</p>
              <div class="article-card__meta">
                <span>{{ post.date | date: "%Y年%m月%d日" }}</span>
              </div>
            </div>
          </article>
        {% endfor %}
      </div>
      <div class="two-col__side">
        {% include sidebar.html %}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add posts/index.html
git commit -m "feat: rewrite posts listing page"
```

---

### Task 8: Create categories page

**Files:**
- Rewrite: `categories/index.html`

- [ ] **Step 1: Write `categories/index.html`**

```html
---
layout: default
title: 文章分类
active_nav: 分类
---

<div class="page-title-section">
  <div class="container">
    <h1 class="page-title-section__title">文章分类</h1>
    <p class="page-title-section__subtitle">按分类浏览技术文章，快速找到你感兴趣的内容</p>
  </div>
</div>

<section class="main-content">
  <div class="container">
    <div class="two-col">
      <div class="two-col__main">
        <div class="category-grid">
          {% assign cat_colors = "4f46e5,0891b2,059669" | split: "," %}
          {% assign cat_idx = 0 %}
          {% for category in site.categories %}
            {% assign color = cat_colors[cat_idx] | default: "4f46e5" %}
            <a href="#{{ category[0] | slugify }}" class="category-card fade-in" style="background: linear-gradient(135deg, #{{ color }}, #{{ color }}dd);">
              <span class="category-card__name">{{ category[0] }}</span>
              <span class="category-card__count">{{ category[1].size }} 篇文章</span>
            </a>
            {% assign cat_idx = cat_idx | plus: 1 %}
          {% endfor %}
        </div>

        {% for category in site.categories %}
          <div class="category-section" id="{{ category[0] | slugify }}">
            <h2 class="category-section__title">{{ category[0] }}</h2>
            {% for post in category[1] %}
              <article class="article-card article-card--compact fade-in">
                <div class="article-card__body">
                  <h3 class="article-card__title">
                    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
                  </h3>
                  <p class="article-card__excerpt">{{ post.excerpt | strip_html | truncate: 150 }}</p>
                  <div class="article-card__meta">
                    <span>{{ post.date | date: "%Y年%m月%d日" }}</span>
                  </div>
                </div>
              </article>
            {% endfor %}
          </div>
        {% endfor %}
      </div>
      <div class="two-col__side">
        {% include sidebar.html %}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add categories/index.html
git commit -m "feat: rewrite categories page with gradient cards"
```

---

### Task 9: Update about page

**Files:**
- Modify: `about.markdown`

- [ ] **Step 1: Update `about.markdown` front matter and add sidebar**

Write `about.markdown`:

```markdown
---
layout: default
title: 关于我
active_nav: 关于
permalink: /about/
---

<div class="page-title-section">
  <div class="container">
    <h1 class="page-title-section__title">关于我</h1>
    <p class="page-title-section__subtitle">一名软件工程学生的技术成长记录</p>
  </div>
</div>

<section class="main-content">
  <div class="container">
    <div class="two-col">
      <div class="two-col__main">
        <div class="article-body">
          <h2 id="个人简介">个人简介</h2>
          <p>我是小徐，一名软件工程专业的学生，热爱编程和技术分享。我喜欢探索各种技术领域，尤其是 Java 后端开发、小程序开发和数据库技术。</p>

          <h2 id="技术栈">技术栈</h2>
          <h3 id="后端技术">后端技术</h3>
          <ul>
            <li><strong>Java</strong>：Spring Boot、Spring Cloud、MyBatis</li>
            <li><strong>数据库</strong>：MySQL、Redis、MongoDB</li>
            <li><strong>服务器</strong>：Tomcat、Nginx</li>
            <li><strong>版本控制</strong>：Git、GitHub</li>
          </ul>
          <h3 id="前端技术">前端技术</h3>
          <ul>
            <li><strong>HTML/CSS/JavaScript</strong>：基础前端开发</li>
            <li><strong>小程序</strong>：微信小程序、支付宝小程序</li>
            <li><strong>框架</strong>：Vue.js（入门级）</li>
          </ul>
          <h3 id="其他技能">其他技能</h3>
          <ul>
            <li><strong>操作系统</strong>：Windows、Linux</li>
            <li><strong>开发工具</strong>：IntelliJ IDEA、VS Code、Eclipse</li>
            <li><strong>项目管理</strong>：敏捷开发、Scrum</li>
          </ul>

          <h2 id="教育背景">教育背景</h2>
          <ul>
            <li><strong>本科</strong>：软件工程专业</li>
            <li><strong>相关课程</strong>：数据结构、算法、操作系统、计算机网络、数据库原理、软件工程</li>
          </ul>

          <h2 id="项目经验">项目经验</h2>
          <h3 id="项目1">1. 个人博客网站</h3>
          <ul>
            <li><strong>技术栈</strong>：Jekyll、GitHub Pages、CSS3</li>
            <li><strong>描述</strong>：使用 Jekyll 搭建的静态博客网站，用于分享技术学习心得和开发经验</li>
            <li><strong>职责</strong>：独立设计和开发整个网站</li>
          </ul>
          <h3 id="项目2">2. 在线商城系统</h3>
          <ul>
            <li><strong>技术栈</strong>：Spring Boot、MyBatis、MySQL、Vue.js</li>
            <li><strong>描述</strong>：一个基于 Spring Boot 和 Vue.js 的在线商城系统，包含商品管理、订单管理、用户管理等功能</li>
            <li><strong>职责</strong>：后端 API 开发和数据库设计</li>
          </ul>
          <h3 id="项目3">3. 微信小程序</h3>
          <ul>
            <li><strong>技术栈</strong>：微信小程序开发框架、云开发</li>
            <li><strong>描述</strong>：一个校园服务小程序，提供课程查询、成绩查询、校园新闻等功能</li>
            <li><strong>职责</strong>：小程序前端开发和云函数编写</li>
          </ul>

          <h2 id="学习目标">学习目标</h2>
          <ul>
            <li>深入学习 Spring Cloud 微服务架构</li>
            <li>掌握 Docker 容器技术</li>
            <li>学习前端框架 Vue.js 和 React</li>
            <li>提升算法和数据结构能力</li>
            <li>参与开源项目贡献</li>
          </ul>

          <h2 id="兴趣爱好">兴趣爱好</h2>
          <ul>
            <li>编程和技术学习</li>
            <li>阅读技术书籍和博客</li>
            <li>运动：篮球、跑步</li>
            <li>音乐：听音乐、弹吉他</li>
            <li>旅行：探索新地方</li>
          </ul>

          <h2 id="联系方式">联系方式</h2>
          <ul>
            <li><strong>邮箱</strong>：ifikifk@qq.com</li>
            <li><strong>GitHub</strong>：<a href="https://github.com/XyfHub">XyfHub</a></li>
            <li><strong>微信</strong>：请通过邮箱联系获取</li>
          </ul>

          <hr>
          <p>感谢您访问我的博客！我希望通过这个平台分享我的技术学习心得和开发经验，同时也希望能够与更多的开发者交流和学习。如果您有任何问题或建议，欢迎随时联系我。</p>
        </div>
      </div>
      <div class="two-col__side">
        {% include sidebar.html %}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add about.markdown
git commit -m "feat: rewrite about page with sidebar layout"
```

---

### Task 10: Update 404 page

**Files:**
- Modify: `404.html`

- [ ] **Step 1: Write `404.html`**

```html
---
layout: default
title: 页面未找到
permalink: /404.html
---

<div class="page-title-section">
  <div class="container">
    <h1 class="page-title-section__title">404</h1>
    <p class="page-title-section__subtitle">页面未找到</p>
  </div>
</div>

<section class="main-content">
  <div class="container" style="text-align:center;padding:3rem 1rem;">
    <p style="font-size:1.1rem;color:var(--color-text-secondary);margin-bottom:1.5rem;">您访问的页面不存在，可能已被移除或地址输入有误。</p>
    <a href="{{ '/' | relative_url }}" class="btn btn--primary" style="display:inline-flex;">返回首页</a>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add 404.html
git commit -m "feat: update 404 page with new layout"
```

---

### Task 11: Verify build and test

- [ ] **Step 1: Clean and rebuild the site**

Run: `bundle exec jekyll clean && bundle exec jekyll build`  
Expected: build completes without errors

- [ ] **Step 2: Check _site/ structure**

Run: `ls "_site/assets/css/style.css" && ls "_site/index.html" && ls "_site/posts/index.html" && ls "_site/categories/index.html" && ls "_site/about/index.html"`  
Expected: all files exist

- [ ] **Step 3: Verify a post page was generated**

Run: `ls "_site/2026/04/25/git-introduction/index.html"`  
Expected: file exists

- [ ] **Step 4: Start dev server and review**

Run: `bundle exec jekyll serve`  
Expected: server starts on http://localhost:4000, navigate and verify:
- Homepage loads with hero, article cards, sidebar
- Post pages show article with TOC in sidebar
- Categories page shows category cards and articles
- About page renders correctly
- Dark mode works (set OS to dark)
- Mobile responsive (check at <768px width)
- No broken images or 404s in browser console

- [ ] **Step 5: Commit any final fixes**

```bash
git add -A
git commit -m "chore: final adjustments after testing"
```
