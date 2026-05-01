---
layout: default
title: 小徐的技术日记
---

{% include navbar.html active='home' %}

<!-- 英雄区 -->
<section class="hero-section">
  <div class="container">
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">分享技术，记录成长</h1>
        <div class="spacer"></div>
        <p class="hero-subtitle">一名软件工程学生的技术成长记录，分享Java后端、小程序、数据库与编程日常</p>
        <div class="spacer"></div>
        <div class="hero-buttons">
          <a href="/posts/" class="btn-primary">
            <span class="btn-text">浏览文章</span>
            <span class="spacer"></span>
            <i class="ri-arrow-right-line btn-icon"></i>
          </a>
          <div class="spacer"></div>
          <a href="/about/" class="btn-secondary">
            <span class="btn-text">关于我</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 主内容区 -->
<section class="main-content">
  <div class="container">
    <div class="content-container">
      <!-- 左侧内容区 -->
      <div class="left-content">
        <!-- 最新文章标题 -->
        <div class="section-title">
          <div class="title-left">
            <i class="ri-file-text-line title-icon"></i>
            <span class="spacer"></span>
            <span class="title-text">最新文章</span>
          </div>
          <div class="spacer"></div>
          <div class="title-right">
            <a href="/posts/" class="view-all">
              <span class="view-all-text">查看全部</span>
              <span class="spacer"></span>
              <i class="ri-arrow-right-line view-all-icon"></i>
            </a>
          </div>
        </div>
        <div class="spacer"></div>
        <!-- 文章列表 -->
        <div class="article-list">
          {% for post in site.posts %}
            <article class="article-card">
              {% if post.cover %}
                <img src="{{ post.cover }}" alt="{{ post.title }}" class="article-cover">
              {% else %}
                <div class="article-cover" style="background: linear-gradient(135deg, #2563eb, #4338ca);"></div>
              {% endif %}
              <div class="article-content">
                {% if post.categories.size > 0 %}
                  <div class="article-tags">
                    {% for category in post.categories %}
                      <span class="tag tag-java">{{ category }}</span>
                    {% endfor %}
                  </div>
                {% endif %}
                <h3 class="article-title"><a href="{{ post.url }}">{{ post.title }}</a></h3>
                <p class="article-excerpt">{{ post.excerpt | strip_html | truncate: 200 }}</p>
                <div class="article-meta">
                  <span class="article-meta-item">
                    <span class="article-meta-icon">📅</span>
                    <span>{{ post.date | date: "%Y年%m月%d日" }}</span>
                  </span>
                  <span class="article-meta-item">
                    <span class="article-meta-icon">👤</span>
                    <span>小徐</span>
                  </span>
                </div>
                <a href="{{ post.url }}" class="article-read-more">阅读更多 →</a>
              </div>
            </article>
          {% endfor %}
        </div>
      </div>
      <!-- 右侧边栏 -->
      <div class="right-sidebar">
        <!-- 个人信息 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">个人信息</h3>
          <div class="author-info">
            <div class="author-avatar">徐</div>
            <h4 class="author-name">{{ site.author.name }}</h4>
            <p class="author-bio">{{ site.author.bio }}</p>
            <div class="social-links">
              {% for link in site.social %}
                <a href="{{ link.url }}" target="_blank" class="social-link">{{ link.name }}</a>
              {% endfor %}
            </div>
          </div>
        </div>
        <!-- 文章分类 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">文章分类</h3>
          <ul class="category-list">
            {% for category in site.categories %}
              <li class="category-item">
                <a href="/categories/{{ category[0] }}" class="category-link">{{ category[0] }}</a>
                <span class="category-count">{{ category[1].size }}</span>
              </li>
            {% endfor %}
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 页脚 -->
<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <p class="footer-text">小徐的技术日记 | 分享技术，记录成长</p>
      <div class="footer-social">
        {% for link in site.social %}
          <a href="{{ link.url }}" target="_blank" class="footer-social-link">{{ link.name }}</a>
        {% endfor %}
      </div>
      <p class="footer-copyright">&copy; {{ site.time | date: "%Y" }} {{ site.title }}. 保留所有权利。</p>
    </div>
  </div>
</footer>
