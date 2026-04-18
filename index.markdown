---
layout: default
title: 小徐的技术日记
---

<!-- 导航栏 -->
<nav class="navbar">
  <div class="navbar-container">
    <div class="logo">
      <div class="logo-icon">徐</div>
      <div class="logo-text">小徐的技术日记</div>
    </div>
    <div class="nav-menu">
      <a href="/" class="nav-item active">
        <span class="nav-item-icon">🏠</span>
        <span>首页</span>
      </a>
      <a href="/posts/" class="nav-item">
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

<!-- 英雄区 -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">分享技术，记录成长</h1>
      <p class="hero-subtitle">一名软件工程学生的技术成长记录，分享Java后端、小程序、数据库与编程日常</p>
      <div class="hero-buttons">
        <a href="/posts/" class="btn btn-primary">
          <span>浏览文章</span>
          <span class="btn-icon">→</span>
        </a>
        <a href="/about/" class="btn btn-secondary">
          <span>关于我</span>
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
        <!-- 最新文章 -->
        <div class="section-title">
          <div class="section-title-text">
            <span class="section-title-icon">📚</span>
            <span>最新文章</span>
          </div>
          <a href="/posts/" class="view-all">
            <span>查看全部</span>
            <span class="view-all-icon">→</span>
          </a>
        </div>

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
