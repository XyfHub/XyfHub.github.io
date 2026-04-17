---
layout: default
title: 文章列表
permalink: /posts/
---

<header class="header header--animated">
  <div class="header__bg" aria-hidden="true"></div>
  <div class="container header__inner">
    <p class="header__eyebrow">全部文章</p>
    <h1 class="header__title">文章列表</h1>
    <p class="header__desc">按时间倒序浏览本站所有文章</p>
  </div>
</header>

{% include navbar.html %}

<div class="container">
  <div class="row">
    <div class="col-md-8">
      <section class="posts-section main-content article-card fade-in-up">
        {% for post in site.posts %}
          <article class="post">
            <h2 class="post-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
            <div class="post-meta">
              <span class="date">{{ post.date | date: "%Y年%m月%d日" }}</span>
              {% if post.categories.size > 0 %}
                <span class="categories">
                  {% for category in post.categories %}
                    <span class="article-chip article-chip--sm article-chip--cat">{{ category }}</span>
                  {% endfor %}
                </span>
              {% endif %}
            </div>
            <div class="post-excerpt">
              {{ post.excerpt | strip_html | truncate: 220 }}
            </div>
            <a href="{{ post.url | relative_url }}" class="read-more">阅读全文</a>
          </article>
        {% endfor %}
      </section>
    </div>
    <div class="col-md-4">
      <aside class="sidebar fade-in-up">
        <h2>关于本站</h2>
        <p>{{ site.description }}</p>
      </aside>
      <aside class="sidebar fade-in-up">
        <h2>热门标签</h2>
        <div class="tag-cloud">
          {% for tag in site.tags %}
            <a href="{{ '/tags/' | append: tag[0] | relative_url }}" style="font-size: {{ tag[1].size | times: 4 | plus: 12 }}px;">{{ tag[0] }}</a>
          {% endfor %}
        </div>
      </aside>
    </div>
  </div>
</div>

<footer class="footer">
  <div class="container">
    <p>&copy; {{ site.time | date: "%Y" }} {{ site.title }}. 保留所有权利。</p>
  </div>
</footer>
