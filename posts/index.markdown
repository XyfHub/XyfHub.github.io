---
layout: default
title: 文章列表
permalink: /posts/
---

<!-- 导航栏 -->
<nav class="navbar">
  <div class="navbar-container">
    <div class="logo">
      <div class="logo-icon">徐</div>
      <div class="logo-text">小徐的技术日记</div>
    </div>
    <div class="nav-menu">
      <a href="/" class="nav-item">
        <span class="nav-item-icon">🏠</span>
        <span>首页</span>
      </a>
      <a href="/posts/" class="nav-item active">
        <span class="nav-item-icon">📝</span>
        <span>文章</span>
      </a>
      <a href="/about/" class="nav-item">
        <span class="nav-item-icon">👤</span>
        <span>关于</span>
      </a>
      <a href="/contact/" class="nav-item">
        <span class="nav-item-icon">📞</span>
        <span>联系方式</span>
      </a>
    </div>
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input type="text" class="search-input" placeholder="搜索文章...">
    </div>
  </div>
</nav>

<!-- 页面标题区 -->
<section class="page-title">
  <div class="container">
    <div class="page-title-content">
      <h1 class="page-title-text">文章归档</h1>
      <p class="page-title-subtitle">共 {{ site.posts.size }} 篇技术文章，记录学习与成长的点点滴滴</p>
    </div>
  </div>
</section>

<!-- 筛选工具栏 -->
<section class="filter-toolbar">
  <div class="container">
    <div class="filter-container">
      <div class="category-filters">
        <a href="/posts/" class="category-filter active">全部</a>
        {% for category in site.categories %}
          <a href="/categories/{{ category[0] }}" class="category-filter">{{ category[0] }}</a>
        {% endfor %}
      </div>
      <div class="sort-options">
        <span class="sort-label">排序：</span>
        <a href="/posts/?sort=newest" class="sort-option active">
          <span>最新发布</span>
          <span class="sort-option-icon">↓</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- 主内容区域 -->
<section class="main-content">
  <div class="container">
    <div class="content-container">
      <!-- 左侧内容 -->
      <div class="left-content">
        <!-- 文章列表 -->
        <div class="article-list">
          {% for post in site.posts %}
            <article class="article-list-card">
              <div class="article-list-content">
                {% if post.cover %}
                  <img src="{{ post.cover }}" alt="{{ post.title }}" class="article-list-cover">
                {% else %}
                  <div class="article-list-cover" style="background: linear-gradient(135deg, #2563eb, #4338ca);"></div>
                {% endif %}
                <div class="article-list-info">
                  {% if post.categories.size > 0 %}
                    <div class="article-list-tags">
                      {% for category in post.categories %}
                        {% if category == 'Java' %}
                          <span class="tag tag-java">{{ category }}</span>
                        {% elsif category == 'Spring Boot' %}
                          <span class="tag tag-spring">{{ category }}</span>
                        {% else %}
                          <span class="tag tag-java">{{ category }}</span>
                        {% endif %}
                      {% endfor %}
                    </div>
                  {% endif %}
                  <h3 class="article-list-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
                  <p class="article-list-excerpt">{{ post.excerpt | strip_html | truncate: 150 }}</p>
                  <div class="article-list-meta">
                    <span class="article-meta-item">
                      <span class="article-meta-icon">📅</span>
                      <span>{{ post.date | date: "%Y年%m月%d日" }}</span>
                    </span>
                    <span class="article-meta-item">
                      <span class="article-meta-icon">👤</span>
                      <span>小徐</span>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          {% endfor %}
        </div>

        <!-- 分页 -->
        {% if paginator.total_pages > 1 %}
          <div class="pagination">
            {% if paginator.previous_page %}
              <a href="{{ paginator.previous_page_path }}" class="prev">上一页</a>
            {% endif %}
            <span class="page-number">第 {{ paginator.page }} 页，共 {{ paginator.total_pages }} 页</span>
            {% if paginator.next_page %}
              <a href="{{ paginator.next_page_path }}" class="next">下一页</a>
            {% endif %}
          </div>
        {% endif %}
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
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
