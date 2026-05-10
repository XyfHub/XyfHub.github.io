---
layout: post
title: "工作记录：MCP 集成开发"
date: 2026-05-10 10:00:00 +0800
categories: [学习笔记]
tags: [Java, MCP, Model Context Protocol, AI, 终端应用, JSON-RPC, MCP服务器]
cover: /assets/images/study-notes-5.10.png
---

## 一、工作概述

为 Clique 终端 AI 聊天应用 (`clique-demo-chat`) 集成 **Model Context Protocol (MCP)** 支持，使聊天应用能够连接外部 MCP 工具服务器，扩展 AI 助手的工具调用能力。

## 二、完成内容

### 2.1 传输层 (Transport Layer) — 3 种传输方式

| 传输实现 | 文件 | 行数 | 说明 |
|---------|------|------|------|
| McpTransport | transport/McpTransport.java | 8 | 传输接口，定义 `connect/send/receive/close` 四个方法 |
| StdioTransport | transport/StdioTransport.java | 90 | 子进程 stdin/stdout 通信，虚拟线程捕获 stderr |
| HttpSseTransport | transport/HttpSseTransport.java | 127 | HTTP POST + SSE 流，解析 `data:` 行 |
| StreamableHttpTransport | transport/StreamableHttpTransport.java | 78 | Streamable HTTP 变体，`X-MCP-Session-Id` 会话管理 |

### 2.2 协议层 (Protocol Layer) — 8 个 POJO + 编解码器

- JSON-RPC 2.0 类型：`JsonRpcRequest`、`JsonRpcResponse`、`JsonRpcError`
- MCP 领域类型：`ServerCapabilities`、`ToolsCapability`、`McpServerTool`、`JsonSchema`、`CallToolResult`、`ContentItem`
- 编解码器：`McpCodec` — Jackson 序列化/反序列化，忽略未知字段保证前向兼容
- 支持 MCP 方法：`initialize`、`notifications/initialized`、`tools/list`、`tools/call`

### 2.3 客户端层 (Client Layer)

- **`McpClient`** (85 行)：JSON-RPC 握手、工具发现、工具调用、自动校验服务端 tools 能力
- **`McpToolAdapter`** (66 行)：将远程 MCP 工具适配到本地 `Tool` 接口，`inputSchema` → `ParameterSpec` 自动转换
- **`DirectToolAdapter`** (59 行)：内置进程内 MCP 服务器的轻量适配器，绕过传输层直接调用

### 2.4 服务端层 (Server Layer)

- **`McpToolDefinition`** (30 行)：工具定义模型（name/description/schema/handler）
- **`McpServer`** (102 行)：抽象 MCP 服务端基类，自动处理 `initialize/tools/list/tools/call` 请求分发
- **`McpServerRunner`** (27 行)：启动器，支持 `--stdio`（默认）和 `--http <port>` 两种运行模式

### 2.5 示例 MCP 服务器（2 个）

**GitHubMcpServer (151 行)**

- `github_search_repos`：仓库搜索（query/language/sort）
- `github_search_code`：代码搜索（query/repo）
- 调用 GitHub REST API v3，格式化返回结果（前 10 条）

**TencentDocsMcpServer (249 行)**

- `tencent_doc_list`：列出最近文档
- `tencent_doc_read`：读取文档内容
- `tencent_doc_edit`：追加内容到文档（通过 batchUpdate API）
- 双认证模式：OAuth 或应用账号自动获取 token

### 2.6 ChatApp 集成

在 `ChatApp.java` 中新增 `/mcp` 命令：

| 命令 | 功能 |
|------|------|
| /mcp list | 显示已连接的 MCP 服务器及其工具 |
| /mcp connect <url> | 通过 HTTP+SSE 连接远程 MCP 服务器 |
| /mcp github | 启动内置 GitHub 搜索 MCP（进程内运行） |
| /mcp tencent | 启动内置腾讯文档 MCP |

工具注册后自动并入 `ToolRegistry`，AI 模型可直接调用。MCP 工具危险等级统一为 **LOW（自动批准）**。

### 2.7 测试覆盖（5 个测试类，18 个测试用例）

| 测试类 | 用例数 | 覆盖范围 |
|--------|--------|----------|
| McpCodecTest | 5 | JSON-RPC 编解码、未知字段忽略 |
| StdioTransportTest | 2 | 进程通信、退出清理 |
| McpClientTest | 4 | 握手、工具列表、调用参数 |
| McpToolAdapterTest | 2 | Schema 转换、危险等级 |
| McpServerTest | 5 | 初始化、工具调用、错误处理 |

### 2.8 依赖与构建

- 在 `demo/pom.xml` 新增 `jackson-databind 2.18.2` 依赖
- 使用 `maven-shade-plugin` 打包 fat JAR
- 所有 MCP 代码位于 `clique.demo.chat.mcp` 包，不影响核心库

## 三、架构总结

```
demo/src/main/java/clique/demo/chat/mcp/
├── transport/          4 files    传输层: 接口 + 3 种实现
├── protocol/           8 files    协议层: JSON-RPC + POJO + 编解码
├── client/             3 files    客户端层: 客户端 + 适配器
├── server/             3 files    服务端层: 服务基类 + 启动器
└── examples/
    ├── github/         1 file     GitHub 搜索 MCP
    └── tencentdocs/    1 file     腾讯文档 MCP
```

**总计**：22 个主源码文件 + 5 个测试文件，约 **1500+ 行代码**。

## 四、设计特点

1. **分层清晰**：传输 → 协议 → 客户端/服务端，每层职责单一
2. **向前兼容**：所有 POJO 使用 `@JsonIgnoreProperties(ignoreUnknown = true)`
3. **双模式运行**：MCP 服务可独立进程运行（stdio/HTTP），也可进程内直接调用
4. **无缝集成**：通过适配器接入现有 `Tool` 体系，对 AI 调用链路透明
5. **安全优先**：MCP 远程工具默认 LOW 危险等级，自动批准不阻塞流程
