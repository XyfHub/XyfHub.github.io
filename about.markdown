---
layout: default
title: 关于我
permalink: /about/
---

{% include navbar.html active='about' %}

<!-- 页面标题区 -->
<section class="page-title-section">
  <div class="container">
    <div class="title-container">
      <h1 class="page-title">关于我</h1>
      <div class="spacer"></div>
      <p class="page-subtitle">一名软件工程学生的技术成长记录</p>
    </div>
  </div>
</section>

<!-- 主内容区 -->
<section class="main-content">
  <div class="container">
    <div class="content-container">
      <!-- 左侧内容区 -->
      <div class="left-content">
        <div class="article-detail">
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
            <p>让我们一起在技术的道路上不断前进！</p>
          </div>
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
