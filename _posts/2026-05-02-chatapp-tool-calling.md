---
layout: post
title: "学习笔记：终端AI聊天程序工具调用功能开发"
date: 2026-05-02 10:00:00 +0800
categories: [学习笔记]
tags: [Java, AI, 工具调用, Function Calling, MiMo, 终端应用]

---

## 一、问题

当前终端AI聊天程序仅能实现纯文本对话，无法操作本地文件（读取、写入、编辑）或执行shell命令，无法满足用户通过AI快速操作本地资源的需求。需基于MiMo模型，实现其对本地工具的调用能力，类比OpenAI的function calling功能。

## 二、约束

核心约束：MiMo原生API（api.xiaomimimo.com/v1）不支持标准OpenAI的tools参数，无法在请求JSON中传入`"tools": [...]`来获取结构化的tool_calls响应。

MiMo模型的工具调用格式为专有XML格式，由此决定，整个工具调用方案只能基于**纯文本层面的注入+解析**实现，无法通过标准协议交互完成。

## 三、方案：System Prompt 注入 + 多策略解析

整体方案分为两大核心环节，全程零依赖，仅使用indexOf和substring实现字符串操作，适配终端程序轻量需求。

### 3.1 工具定义注入（让模型知晓可用工具）

通过`ToolRegistry.buildSystemPromptSection()`方法，将工具定义以纯文本形式拼接在system prompt中，明确告知模型工具列表、调用格式及要求。

### 3.2 响应工具调用解析（从模型响应中提取工具调用信息）

通过`ToolCallParser.parse()`方法实现多策略解析，按优先级依次尝试，无法解析则视为普通文本回复。

| 优先级 | 策略 | 具体做法 |
|--------|------|----------|
| 1 | XML 匹配 | 通过`indexOf("<tool_call>")`定位标签位置，解析`<function=NAME>`和`<parameter=KEY>VALUE`内容，移除XML块后得到模型的思考文本 |
| 2 | JSON 兜底 | 匹配`"name":"..."`和`"arguments":"..."`模式，通过手动字符串扫描提取工具调用信息 |
| 3 | 放弃 | 返回空列表，将模型响应视为普通文本回复 |

---

## 四、架构：新增/修改的文件

所有文件均位于`demo/src/main/java/clique/demo/chat/`目录下。

### 新增文件

- `DangerLevel.java`：定义LOW/MEDIUM/HIGH三种风险等级枚举
- `Tool.java`：定义工具接口及ParameterSpec参数规范
- `ToolCall.java`：封装解析后得到的工具调用数据
- `ToolRegistry.java`：负责工具注册及system prompt注入文本生成
- `ToolCallParser.java`：实现多策略工具调用解析逻辑
- `tools/` 目录（具体工具实现）
  - `ShellTool.java`：实现shell命令执行功能
  - `ReadFileTool.java`：实现本地文件读取功能
  - `WriteFileTool.java`：实现本地文件写入功能
  - `EditFileTool.java`：实现本地文件编辑功能

### 修改文件

- `ChatMessage.java`：从简单record改为普通类，新增toolCalls、toolCallId字段，支持工具调用相关消息
- `MiMoClient.java`：优化请求体，支持工具调用相关参数，新增`extractToolCalls()`方法提取响应中的工具调用信息
- `ChatRenderer.java`：新增工具调用审批UI，按风险等级实现绿/黄/红分色标注
- `ChatApp.java`：新增工具调用循环逻辑及用户审批流程，串联整个工具调用链路

---

## 五、数据流（单轮工具调用）

以用户输入**"帮我在当前目录创建一个hello.txt"**为例：

1. 用户输入指令后，进入`ChatApp.processUserMessage()`方法，将用户消息添加到消息列表
2. 启动工具调用循环（最多执行10轮）
   1. 调用`client.chat(messages)`向MiMo API发送请求，模型返回包含工具调用XML块的响应文本
   2. 通过`ToolCallParser.parse(response)`解析响应，得到工具调用列表与思考文本
   3. 若无工具调用，退出循环
   4. 对每个工具调用：判定风险等级 → 分色展示 → 用户审批(y/n) → 执行工具 → 记录结果
   5. 将消息加入列表，回到循环第一步
3. 循环结束，渲染最终回复，完成交互

---

## 六、安全（含风险体系与安全措施）

### 6.1 三级风险体系

| 等级 | 枚举 | 颜色 | 语义 | 示例 |
|------|------|------|------|------|
| 低危 | LOW | 绿色 | 只读、创建新文件 | ls, dir, cat, read_file, 创建不存在的文件 |
| 中危 | MEDIUM | 黄色 | 修改已有文件 | 覆盖已有文件, edit_file, mv, cp |
| 高危 | HIGH | 红色 | 删除、破坏性操作 | rm, del, rmdir, format |

**设计要点**

- 所有工具调用均需用户审批，无自动执行
- ShellTool根据关键词自动判定风险等级
- WriteFile根据文件是否存在判定风险
- ReadFile固定低危，EditFile固定中危

### 6.2 五层安全措施

1. 中风险及以上命令强制审批，无关闭选项
2. 按风险等级分色标注，高危红色高亮
3. 路径安全控制：禁止`../`、绝对路径、系统路径
4. ShellTool设置30秒超时，输出限制8KB
5. 全量try-catch异常处理，保证主程序不崩溃

---

## 七、踩坑（关键设计决策与避坑点）

| 设计决策 | 选择方案 | 避坑理由 |
|---------|----------|----------|
| 工具调用格式 | System Prompt注入 + 专有XML格式 | MiMo API不支持原生tools参数 |
| 解析方式 | 手写字符串扫描（indexOf+substring） | 零依赖、轻量、格式固定 |
| 流式处理 | 工具调用循环强制非流式 | 避免XML标签被拆分导致解析失败 |
| ChatMessage | record改为普通类+工厂方法 | 支持纯文本/工具调用/结果三种结构 |
| 审批机制 | 所有命令均需用户审批 | 规避Shell命令不确定性风险 |

---

## 补充：新增终端命令

- `/tools`：列出所有已注册工具及风险等级
- `/tools on|off`：开启/关闭工具调用功能
- `/danger`：显示三级风险体系说明（绿黄红样式）
