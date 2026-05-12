---
layout: post
title: "学习笔记：Claude 工作日报 — 2026年5月12日"
date: 2026-05-12 23:59:59 +0800
categories: [学习笔记]
tags: [Claude, 日报, Java, MCP, Python, Jekyll, Skill, Clique]
---

## 一、今日概览

今天主要完成了两项工作：一是从零创建了一个 `daily-report` skill，实现自动整理 Claude Code 全天会话并发布到 GitHub Pages 个人博客；二是为 Clique-dev 的 demo 项目实现了基于 YAML 配置文件的 MCP 服务器加载功能，让用户可以通过配置文件自由接入外部 MCP 服务，而不需要修改代码。

## 二、项目：daily-report skill（创建新 Skill）

### 做了什么

1. **需求分析与头脑风暴**：使用 superpowers:brainstorming 技能梳理需求——自动收集一天内所有 Claude Code 窗口的会话记录，生成结构化日报，发布到 Jekyll 博客。

2. **技术选型与设计**：确认 Python 环境（Python 3.10.9），确定方案 B（Python stdlib 脚本 + Jekyll 博文生成）。编写了完整的设计文档（`docs/superpowers/specs/2026-05-12-daily-report-skill-design.md`）和实施计划（`docs/superpowers/plans/2026-05-12-daily-report-skill.md`）。

3. **Skill 骨架搭建**：创建 `SKILL.md`（112行），定义五步工作流：确定日期 → 运行提取脚本 → 生成博文 → 用户审查 → 发布推送。经过 spec compliance 和 code quality 两轮审查后合入。

4. **extract_sessions.py 脚本编写**（453行）：
   - 零依赖，仅使用 Python 标准库（json, os, glob, datetime, argparse, collections）
   - 扫描 `~/.claude/projects/` 下所有 JSONL 会话文件
   - 按北京时间（UTC+8）过滤目标日期的条目
   - 按 sessionId 分组，合并同一项目的多个会话
   - 提取用户提示（截断 500 字符）、工具调用动作、自动推断话题标签
   - 支持 `--date` 单日和 `--from`/`--to` 日期范围两种模式
   - 无会话时 exit code 3

### 关键要点

- **会话数据来源**：Claude Code 的项目会话存储在 `~/.claude/projects/<project-hash>/<session-id>.jsonl`，每个条目是单行 JSON，包含 type、message、timestamp 等字段
- **多窗口合并**：同一项目目录下打开多个窗口会产生独立 sessionId，脚本通过 project directory 将其合并
- **编码处理**：Windows 下 Python 的 GBK 默认编码导致 UnicodeDecodeError，需在脚本中处理 UTF-8 编码
- **Python 路径问题**：Windows Store 版的 Python 与直接安装版共存，需指定 `C:\Users\26435\AppData\Local\Programs\Python\Python310\python.exe`

## 三、项目：Clique-dev（MCP 配置文件加载功能）

### 做了什么

1. **配置文件系统设计**：创建 `McpServerConfig` record 和 `McpConfigFile` wrapper，支持 YAML 格式的 MCP 服务器配置，用户可通过 `~/.clique/mcp-servers.yml` 定义外部 MCP 服务。

2. **McpLauncher 启动器**：创建 `McpLauncher` 工具类，负责读取配置文件并根据配置创建对应的 Transport（Stdio/HTTP SSE/Streamable HTTP），自动实例化 `McpClient` 并注册工具。

3. **ChatApp 集成**：
   - 启动时自动加载配置文件中的 MCP 服务器
   - 新增 `/mcp reload` 命令支持热加载配置
   - 保留原有 `/mcp connect` 命令用于临时连接
   - 运行时支持 `/mcp connect stdio <command>` 动态接入任意外部 MCP

4. **StdioTransport 增强**：
   - 添加 `env` 和 `workingDir` 支持，允许配置文件设定环境变量
   - 修复 Windows 下 `npx` 找不到的问题：继承系统 PATH 环境变量，使用 `cmd /c` 包装命令

5. **CloudBase MCP 接入实战**：研究腾讯云 CloudBase MCP 的接入方式，通过 `npx -y @cloudbase/cloudbase-mcp@latest` 以 stdio 方式连接。遇到了 Windows PATH 传递问题，最终通过 StdioTransport 改造解决。

### 关键要点

- **YAML 配置文件优于硬编码**：用户不需要修改 Java 代码即可接入新的 MCP 服务，降低了使用门槛
- **Java ProcessBuilder 在 Windows 下的坑**：启动子进程时不会自动继承用户 PATH，需显式传递环境变量
- **MCP 协议传输层抽象**：项目支持三种传输方式（StdioTransport、HttpSseTransport、StreamableHttpTransport），配置文件通过 `type` 字段区分
- **编译与测试**：每次改动后通过 `mvn compile` 和 `mvn test` 验证，确保不引入回归

## 四、今日收获

1. **Claude Code Skill 开发全流程**：从 brainstorming → writing-plans → subagent-driven-development → 审查 → 测试，建立了一套完整的 skill 开发方法论。

2. **Claude Code 会话数据模型**：深入理解了 Claude Code 的 JSONL 存储格式，sessionId 机制、项目哈希计算方式，以及 history.jsonl 的结构。

3. **Jekyll 博客发布流程**：熟悉了 GitHub Pages + Jekyll 的博文发布流程，包括 front matter 格式、标签系统、_posts 目录结构。

4. **MCP 协议的实战应用**：从配置加载到传输层实现，完整走通了 MCP 客户端接入外部 MCP 服务器的链路，并成功连接了 CloudBase MCP。

5. **Windows 兼容性问题**：Python 编码、Java ProcessBuilder 环境变量传递、PATH 查找等跨平台兼容性问题及解决方案。

## 五、敏感信息检查清单

- [x] 无 API key / token / 密码
- [x] 无公司内部路径或配置
- [x] 无个人身份信息
