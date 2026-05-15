---
layout: post
title: "学习笔记：Claude 工作日报 — 2026年5月15日"
date: 2026-05-15 23:59:59 +0800
categories: [学习笔记]
tags: [Claude, 日报, Java, MCP, Firecrawl, CloudBase, Jackson, JSON-RPC]
---

## 一、今日概览

今天围绕 AIChat 项目的 MCP 子系统进行了大量工作：上午接入腾讯云 CloudBase MCP 并打通 stdio 传输通道；下午用 brainstorming → spec → plan → subagent-driven-development 全流程实现了 MCP 运行时动态配置功能，用户无需重启应用即可通过 `/mcp add`/`/mcp remove` 命令增删 MCP 服务器。晚间成功连接 Firecrawl MCP 并进行网页抓取测试，期间修复了两个 JSON 解析和参数类型转换的 bug。

## 二、项目：AIChat — CloudBase MCP 接入

### 做了什么

1. **配置文件探索**：研究了 MCP 配置文件 `~/.aiChat/mcp-servers.json` 的格式、加载路径和解析逻辑（`McpConfigFile.java`），确认支持 stdio 和 HTTP 两种传输模式。

2. **CloudBase 接入**：通过配置文件以 stdio 方式连接腾讯云 CloudBase MCP：
   ```json
   {"name": "cloudbase", "transport": "stdio", "command": ["npx"], "args": ["-y", "@cloudbase/cloudbase-mcp@latest"]}
   ```
   成功连接并注册 36 个工具。

3. **CLAUDE.md 更新**：补充了 MCP 子系统的架构文档，包括各 package 职责、配置格式、代码规范等，方便后续 AI 辅助开发。

### 关键要点

- **MCP 配置解析**：`McpConfigFile.java` 使用 Jackson 读取 JSON，支持 `$ENV_VAR` 环境变量引用，在 `McpServerConfig.resolveEnvVars()` 中解析
- **stdio 传输支持 env 和 workDir**：配置文件可为每个 server 指定独立的环境变量和工作目录，`StdioTransport` 在启动子进程时注入

## 三、项目：AIChat — MCP 运行时动态配置

### 做了什么

1. **需求头脑风暴**（superpowers:brainstorming）：确定方案——同时支持 `/mcp add <JSON>` 粘贴配置连接和 `/mcp remove <name>` 断开连接，连接成功后询问用户是否持久化到配置文件。

2. **设计文档与实施计划**：
   - 编写了完整的设计 spec（`docs/superpowers/specs/2026-05-15-mcp-dynamic-config-design.md`）
   - 编写了 5-task 实施计划（`docs/superpowers/plans/2026-05-15-mcp-dynamic-config.md`）

3. **Subagent-Driven Development 执行**（5 个 Task，全部完成）：

   - **Task 1 — ToolRegistry.unregister**：新增 `unregister(String name)` 方法，支持按名移除工具（1 行代码）
   - **Task 2 — McpLauncher.connectOne 提取**：从 `launch()` 中抽出 `connectOne()` 公共方法，支持单 server 独立连接，新增 `toolNames` 参数追踪 server→工具 的映射
   - **Task 3 — McpConfigFile 持久化**：新增 `addServer()` 和 `removeServer()` 方法，支持 upsert 写入和按名删除，空数组时自动删除配置文件
   - **Task 4 — ChatApp 命令实现**：
     - `mcpAdd(String json)`：支持 3 种 JSON 格式（单对象/数组/`{servers:[...]}` 包装），JSON 解析 → 跳过已连接 → connectOne → 注册工具 → 询问是否持久化
     - `mcpRemove(String name)`：断开连接 → 反注册工具 → 更新 system prompt → 询问是否从配置文件删除
   - **Task 5 — 错误修复与代码清理**：移除 ChatApp 中重复的 JSON 工具方法，修复异常变量引用错误

4. **Bug 修复（多轮迭代）**：
   - `/mcp add{...}` 无空格写法解析失败 → 增加 subcommand 前缀剥离逻辑
   - 多行 JSON 粘贴不支持 → 实现 `readMultilineJson()` + `isJsonComplete()` 大括号/方括号平衡检测
   - 多行 JSON 中内层 `}` 截断 JSON → 移除 `}`/`]` 快捷退出逻辑，改为传入 prefix 参数进行全局 brace 计数
   - 错误日志不完整 → 同时显示 Map 和 List 两种 JSON 解析路径的失败原因

### 关键要点

- **Subagent-Driven Development 实战**：完整走通了 skill → implementer → spec-reviewer → code-quality-reviewer 的双重审查流程，每个 task 都需要同时通过 spec 合规性审查和代码质量审查
- **多行 JSON 输入设计**：使用 brace/bracket 计数器（需正确处理 string 内的引号和转义）判断 JSON 完整性，而非依赖 `}`/`]` 行终止符
- **Jackson JSON 解析**：先尝试 `readValue(json, Map.class)` 解析对象/包装格式，失败再尝试 `List.class` 解析数组格式

## 四、项目：AIChat — Firecrawl MCP 连接与参数类型修复

### 做了什么

1. **Firecrawl MCP 接入**：以 `/mcp add` 命令在运行时动态添加 Firecrawl MCP server：
   ```json
   {"name": "firecrawl", "transport": "stdio", "command": ["npx"], "args": ["-y", "firecrawl-mcp"], "env": {"FIRECRAWL_API_KEY": "fc-xxx"}}
   ```
   成功连接并注册抓取工具（`firecrawl_scrape`、`firecrawl_search` 等）。

2. **修复 MCP array/object 参数类型转换**：`McpToolAdapter.coerceValue()` 原来只处理 boolean/number/string 三种类型。当 AI 传递 `formats=["markdown"]` 时，`["markdown"]` 被当作字符串发给 MCP server，导致 JSON-RPC 参数验证失败。新增 `array` → `List`（Jackson 解析）和 `object` → `Map` 的类型转换。

### 关键要点

- **npm 包名纠正**：Firecrawl MCP 的正确 npm 包名是 `firecrawl-mcp`，而非 `@mcp/firecrawl`
- **MCP Tool 参数类型映射**：AI 生成的 tool_call XML 中所有参数值都是字符串，需要根据 MCP 工具的 JSON Schema `type` 字段（`boolean`/`number`/`integer`/`array`/`object`）进行强制类型转换
- **Jackson 解析容错**：array/object 类型的值可能是合法的 JSON（如 `["markdown"]`），也可能是普通字符串，解析失败时回退为原始字符串

## 五、今日收获

1. **MCP 动态管理的完整方案**：从设计到实现，建立了一套 MCP server 热插拔机制——添加连接 + 注册工具 + 重建 system prompt + 可选持久化，整个流程对用户透明

2. **终端多行输入的正确处理**：bash 的 heredoc 或文本块粘贴在 Java `readLine()` 中逐行返回，需用 brace 计数器而非行内容判断输入终止

3. **AI 工具调用的参数类型问题**：LLM 输出的参数值天然是字符串，需要 adapter 层根据 JSON Schema 进行类型转换，否则 MCP server 会因参数类型不匹配而拒绝调用

4. **Subagent-Driven Development 效率**：通过将实现任务分派给独立 subagent + spec/code 双重审查，在保持代码质量的同时加速了开发，8 个 commit 完成了 5 个 task


