---
layout: post
title:  "Spring Boot 入门指南"
date:   2026-04-17 10:00:00 +0800
categories: Java 后端开发
tags: Spring Boot 入门指南
---
# Spring Boot 入门指南

## 什么是 Spring Boot？

Spring Boot 是由 Pivotal 团队开发的一个基于 Spring 框架的快速开发框架，它的主要目标是简化 Spring 应用的初始搭建和开发过程。

## 为什么使用 Spring Boot？

- **自动配置**：根据项目依赖自动配置应用
- **独立运行**：可以创建独立的可执行 JAR 文件
- **内嵌服务器**：内置 Tomcat、Jetty 等服务器
- **生产就绪**：提供健康检查、指标监控等功能
- **无代码生成**：不需要生成代码或 XML 配置

## 环境准备

在开始之前，你需要准备以下环境：

- JDK 8 或更高版本
- Maven 3.6 或更高版本
- IDE（如 IntelliJ IDEA、Eclipse 等）

## 创建 Spring Boot 项目

### 方法一：使用 Spring Initializr

1. 访问 [Spring Initializr](https://start.spring.io/)
2. 选择项目类型（Maven 或 Gradle）
3. 选择 Java 版本
4. 填写项目信息（Group、Artifact 等）
5. 添加依赖（如 Web、JPA、MySQL 等）
6. 点击 "Generate" 按钮下载项目

### 方法二：使用 IDE 创建

以 IntelliJ IDEA 为例：

1. 打开 IDEA，选择 "File" -> "New" -> "Project"
2. 选择 "Spring Initializr"
3. 填写项目信息
4. 选择依赖
5. 点击 "Finish" 完成创建

## 项目结构

一个典型的 Spring Boot 项目结构如下：

```
src/
├── main/
│   ├── java/
│   │   └── com/example/demo/
│   │       ├── DemoApplication.java          # 主应用类
│   │       ├── controller/                    # 控制器
│   │       ├── service/                       # 服务层
│   │       ├── repository/                    # 数据访问层
│   │       └── model/                         # 数据模型
│   └── resources/
│       ├── application.properties             # 配置文件
│       └── static/                            # 静态资源
└── test/                                      # 测试代码
```

## 编写第一个 Spring Boot 应用

### 1. 创建主应用类

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### 2. 创建控制器

```java
package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }
}
```

### 3. 配置应用

在 `application.properties` 文件中添加配置：

```properties
# 服务器配置
server.port=8080
server.servlet.context-path=/demo

# 应用配置
spring.application.name=demo
```

### 4. 运行应用

- **使用 IDE 运行**：直接运行 `DemoApplication` 类
- **使用 Maven 运行**：在项目根目录执行 `mvn spring-boot:run`
- **使用 JAR 文件运行**：执行 `mvn package` 打包后，运行 `java -jar target/demo-0.0.1-SNAPSHOT.jar`

## 访问应用

启动应用后，打开浏览器访问：`http://localhost:8080/demo/hello`，你将看到 "Hello, Spring Boot!" 的响应。

## 添加数据库支持

### 1. 添加依赖

在 `pom.xml` 文件中添加数据库相关依赖：

```xml
<dependencies>
    <!-- Web 依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- JPA 依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- MySQL 驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- 测试依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 2. 配置数据库连接

在 `application.properties` 文件中添加数据库配置：

```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/test?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=123456

# JPA 配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 3. 创建实体类

```java
package com.example.demo.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    
    // Getters and Setters
    // ...
}
```

### 4. 创建 Repository

```java
package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
```

### 5. 创建服务层

```java
package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
}
```

### 6. 创建控制器

```java
package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public List<User> findAll() {
        return userService.findAll();
    }
    
    @PostMapping
    public User save(@RequestBody User user) {
        return userService.save(user);
    }
}
```

## 测试 API

使用 Postman 或 curl 测试 API：

1. 发送 POST 请求到 `http://localhost:8080/demo/users`，添加用户：

```json
{
    "name": "张三",
    "email": "zhangsan@example.com"
}
```

2. 发送 GET 请求到 `http://localhost:8080/demo/users`，获取所有用户。

## 部署 Spring Boot 应用

### 1. 打包应用

执行 Maven 命令打包应用：

```bash
mvn package
```

打包完成后，在 `target` 目录下会生成一个 JAR 文件。

### 2. 部署到服务器

将 JAR 文件上传到服务器，然后执行：

```bash
java -jar demo-0.0.1-SNAPSHOT.jar
```

或者使用后台运行：

```bash
nohup java -jar demo-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

## 总结

Spring Boot 是一个非常强大的框架，它大大简化了 Spring 应用的开发过程。通过本文的介绍，你应该已经了解了如何创建一个基本的 Spring Boot 应用，以及如何添加数据库支持。

Spring Boot 还有很多其他功能，如安全配置、缓存、消息队列等，这些都可以通过添加相应的依赖和配置来实现。

希望本文对你有所帮助，祝你在 Spring Boot 的学习和使用过程中取得成功！
