---
layout: default
title: 小徐的技术日记
---

<!-- 头部区域 -->
<header class="header">
  <div class="container">
    <h1>{{ site.title }}</h1>
    <p>{{ site.description }}</p>
  </div>
</header>

<!-- 导航栏 -->
{% include navbar.html %}

<!-- 主内容区域 -->
<div class="container">
  <div class="row">
    <!-- 左侧内容 -->
    <div class="col-md-8">
      <!-- 个人简介 -->
      <section class="about-section main-content">
        <h2>关于我</h2>
        <div class="about-content">
          <p>{{ site.author.bio }}</p>
          <p>我是一名软件工程专业的学生，热衷于学习和分享技术知识。主要关注Java后端开发、小程序开发、数据库设计等领域。</p>
          <p>欢迎关注我的GitHub，一起交流学习！</p>
        </div>
      </section>

      <!-- 文章列表 -->
      <section class="posts-section main-content">
        <h2>最新文章</h2>
        {% for post in site.posts %}
          <article class="post">
            <h3 class="post-title"><a href="{{ post.url }}">{{ post.title }}</a></h3>
            <div class="post-meta">
              <span class="date">{{ post.date | date: "%Y年%m月%d日" }}</span>
              {% if post.categories.size > 0 %}
                <span class="categories">
                  {% for category in post.categories %}
                    <a href="/categories/{{ category }}">{{ category }}</a>
                  {% endfor %}
                </span>
              {% endif %}
            </div>
            <div class="post-excerpt">
              {{ post.excerpt | strip_html | truncate: 200 }}
            </div>
            <a href="{{ post.url }}" class="read-more">阅读更多</a>
          </article>
        {% endfor %}

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
      </section>
    </div>

    <!-- 右侧边栏 -->
    <div class="col-md-4">
      <!-- 个人信息 -->
      <aside class="sidebar">
        <h2>个人信息</h2>
        <div class="author-info">
          <h3>{{ site.author.name }}</h3>
          <p>{{ site.author.bio }}</p>
          <div class="social-links">
            {% for link in site.social %}
              <a href="{{ link.url }}" target="_blank">{{ link.name }}</a>
            {% endfor %}
          </div>
        </div>
      </aside>

      <!-- 分类 -->
      <aside class="sidebar">
        <h2>文章分类</h2>
        <ul class="category-list">
          {% for category in site.categories %}
            <li>
              <a href="/categories/{{ category[0] }}">{{ category[0] }} ({{ category[1].size }})</a>
            </li>
          {% endfor %}
        </ul>
      </aside>

      <!-- 标签云 -->
      <aside class="sidebar">
        <h2>标签</h2>
        <div class="tag-cloud">
          {% for tag in site.tags %}
            <a href="/tags/{{ tag[0] }}" style="font-size: {{ tag[1].size | times: 4 | plus: 12 }}px;">{{ tag[0] }}</a>
          {% endfor %}
        </div>
      </aside>
    </div>
  </div>
</div>

<!-- 页脚 -->
<footer class="footer">
  <div class="container">
    <p>&copy; {{ site.time | date: "%Y" }} {{ site.title }}. 保留所有权利。</p>
  </div>
</footer>
