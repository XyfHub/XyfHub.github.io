---
layout: post
title:  "开始我的技术博客之旅"
date:   2026-04-16 15:04:40 +0800
categories: 博客 技术
tags: Jekyll GitHub Pages
cover: /assets/images/start.jpg
---
欢迎来到我的技术博客！这是我的第一篇文章，我将在这里记录我的技术学习和成长历程。

## 为什么选择 Jekyll？

我选择使用 Jekyll 来搭建我的个人博客，主要因为以下几个原因：

- **简单易用**：Jekyll 是一个静态网站生成器，不需要数据库，部署简单
- **GitHub Pages 支持**：可以免费托管在 GitHub Pages 上
- **Markdown 语法**：使用 Markdown 编写文章，语法简洁明了
- **高度可定制**：可以根据自己的需求定制主题和功能

## 博客内容规划

在这个博客中，我将分享以下内容：

- **Java 后端开发**：Spring Boot、MyBatis 等框架的使用和实践
- **小程序开发**：微信小程序、支付宝小程序的开发经验
- **数据库技术**：MySQL、Redis 等数据库的使用和优化
- **编程技巧**：各种编程语言的实用技巧和最佳实践
- **学习心得**：技术学习过程中的感悟和收获

## 如何使用 Jekyll 写文章

Jekyll 的文章需要放在 `_posts` 目录下，文件名格式为：

```
YEAR-MONTH-DAY-title.MARKUP
```

其中 `YEAR` 是四位数年份，`MONTH` 和 `DAY` 是两位数的月份和日期，`MARKUP` 是文件扩展名（如 markdown）。

在文章开头，需要添加 front matter，包含文章的元数据：

```yaml
---
layout: post
title:  "文章标题"
date:   2026-04-16 15:04:40 +0800
categories: 分类1 分类2
tags: 标签1 标签2
---
```

## 代码示例

Jekyll 支持代码高亮，让我们来看一个简单的 Java 代码示例：

{% highlight java %}
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
{% endhighlight %}

## 结语

希望通过这个博客，我能够记录自己的技术成长，同时也能为其他开发者提供一些有用的信息和经验。如果您有任何问题或建议，欢迎在评论区留言！

让我们一起在技术的道路上不断前进！🚀
