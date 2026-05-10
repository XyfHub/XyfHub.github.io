---
layout: post
title: "学习笔记：构建终端AI聊天应用（chatApp）"
date: 2026-04-28 10:00:00 +0800
categories: [学习笔记]
tags: [Java, AI, 终端应用, HTTP, SSE]
cover: /assets/images/study-notes-4.28.jpg
---

## chatApp 概述

chatApp 是一个终端 AI 聊天应用，对接小米 MiMo API。整体采用清晰的三层架构：数据层、网络层、表现层，使用纯 Java 标准库实现，零第三方依赖。

---

## 1. 数据层：ChatMessage + ChatConfig

### ChatMessage

用 Java `record` 表示一条消息，只有 `role` 和 `content` 两个字段：

```java
public record ChatMessage(String role, String content) {
    public static ChatMessage system(String content) {
        return new ChatMessage("system", content);
    }
    public static ChatMessage user(String content) {
        return new ChatMessage("user", content);
    }
    public static ChatMessage assistant(String content) {
        return new ChatMessage("assistant", content);
    }
}
```

提供三个静态工厂方法 `system()`、`user()`、`assistant()` 来创建不同角色的消息。整个对话历史就是一个 `List<ChatMessage>`，简单直观。

### ChatConfig

不可变配置对象，采用 Builder 模式构建。关键设计：每个 `withXxx()` 方法不修改自身，而是返回一个新的 `ChatConfig`（**copy-on-write**），保证线程安全和不可变性。

配置从环境变量 `MIMO_API_KEY` 加载，API key 为空则直接 `System.exit(1)`，明确前置条件。

---

## 2. 网络层：MiMoClient

封装了对 MiMo OpenAI 兼容 API 的 HTTP 调用，使用 `java.net.http.HttpClient`，完全不依赖第三方库。

### 同步非流式请求

`chat()` 方法手动拼接 JSON body → POST → 解析 `choices[0].message.content`。JSON 解析没有用 Jackson/Gson，而是手写字符串扫描：

- `escapeJson()` — 序列化时转义特殊字符
- `extractContent()` — 提取响应内容，处理 `\n`、`\t`、`\uXXXX` 等转义
- `extractError()` — 提取错误信息

### SSE 流式请求

`chatStream()` 设置 `stream: true` → 读取 `InputStream` → 逐行解析 `data: ...` 行 → 遇到 `[DONE]` 结束。每拿到一个 token 就回调 `onToken` consumer，实现实时打字机效果输出。

```java
// 流式回调的核心逻辑
while ((line = reader.readLine()) != null) {
    if (line.startsWith("data: ")) {
        String data = line.substring(6);
        if ("[DONE]".equals(data)) break;
        String token = extractDeltaContent(data);
        if (token != null) onToken.accept(token);
    }
}
```

---

## 3. 表现层：ChatRenderer + ChatApp

### ChatRenderer

纯静态方法类，负责所有输出格式化，集中展示了 **Clique** 库的两大核心 API：

**Clique.ink() — 函数式样式 API**

每个方法返回新的 Ink 实例，链式组合颜色和样式。Ink 重载了 `+` 运算符，可以直接拼接字符串：

```java
Clique.ink().yellow().on("Model: ") +
Clique.ink().brightWhite().bold().on(config.model())
```

**Clique.frame() — 组件 API**

用 Builder 模式构建带边框的 UI 块：

```java
Clique.frame(BoxType.ROUNDED, "blue")
    .title("Welcome to chatApp")
    .nest(content1, FrameAlign.LEFT)
    .nest(content2, FrameAlign.LEFT)
    .render();
```

欢迎界面、帮助菜单、配置展示都用 Frame 组件来渲染，视觉效果统一且美观。

### ChatApp

主循环是一个结构清晰的 REPL（Read-Eval-Print Loop）：

1. 打印欢迎界面（Frame 组件）→ 添加 system prompt 到消息列表
2. 循环：显示绿色 `>` 提示符 → 读行
3. 以 `/` 开头走命令分发：`/exit`、`/clear`、`/model`、`/stream`、`/system`、`/config`、`/help`
4. 否则作为用户消息发送给 API
5. 流式模式时逐 token 输出（模拟打字机效果），非流式模式一次性输出完整响应
6. AI 回复追加到消息列表，实现上下文记忆（每次请求都带完整历史）

---

## 架构亮点总结

| 层次 | 职责 | 关键技术选择 |
|------|------|-------------|
| 数据层 | 消息模型与配置 | Java record、Builder 模式、copy-on-write |
| 网络层 | API 通信 | java.net.http.HttpClient、手写 JSON 解析、SSE 流式 |
| 表现层 | 终端 UI 渲染 | Clique 库（Ink + Frame）、REPL 循环 |

整体设计保持了**零第三方依赖**的克制，手写 JSON 解析虽然"粗糙"，但在这种小规模场景下反而让代码更可控、更易理解。
