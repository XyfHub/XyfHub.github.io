---
layout: post
title: "学习笔记：LangChain 快速入门 — 从 Hello World 到模型调用"
date: 2026-06-08 10:00:00 +0800
categories: [学习笔记]
tags: [LangChain, AI Agent, DeepSeek, Python, 大模型, 工具调用, Agent]
description: 系统学习 LangChain 框架的基础用法，涵盖环境搭建、工具定义、Agent 创建、模型初始化（init_chat_model / 模型类）、invoke 与 stream 两种调用方式，以及如何在智能体中使用模型。
---

## 概述

LangChain 是目前最主流的 LLM 应用开发框架之一，提供了统一的接口来对接各种大模型、管理工具调用、构建 Agent。本文整理了两节 LangChain 入门课程的学习笔记：

- **上篇（Hello World）**：从零搭建 LangChain 环境，定义工具，创建并调用第一个 Agent
- **下篇（模型篇）**：深入模型的初始化方式、invoke/stream 两种调用模式，以及在 Agent 中集成模型

---

## 上篇：LangChain Hello World

### 1. 准备工作

首先安装 LangChain 核心依赖：

```bash
uv add langchain
```

LangChain 支持多种模型平台，按需安装对应 SDK：

```bash
# 集成 DeepSeek
uv add langchain-deepseek

# 集成 OpenAI
uv add langchain-openai

# 集成 Anthropic
uv add langchain-anthropic
```

开发 Agent 的基本步骤只有四步：**加载环境变量 → 定义工具 → 定义 Agent → 调用 Agent**。

---

### 2. 加载环境变量

使用 `python-dotenv` 从 `.env` 文件加载 API Key 等敏感配置：

```python
from dotenv import load_dotenv

load_dotenv()
```

---

### 3. 定义工具（Tools）

工具是 Agent 与外部世界交互的"手"。LangChain 提供 `@tool` 装饰器，把普通 Python 函数一键变成工具：

```python
from langchain.tools import tool

@tool
def get_weather(location: str) -> str:
    """
    Get the weather in a given location.
    Args:
        location: city name or coordinates
    """
    return f"Current weather in {location} is sunny"
```

要点：
- 函数的 **docstring** 就是工具的 description，Agent 据此判断何时调用该工具
- 函数的 **参数类型注解** 帮助 Agent 理解参数格式
- 工具可被 Agent 在推理过程中自动选择和调用

---

### 4. 创建 Agent

`create_agent` 是 LangChain 提供的一站式 Agent 创建函数，一行代码搞定：

```python
from langchain.agents import create_agent

agent = create_agent(
    model="deepseek-chat",
    tools=[get_weather]
)
```

只需要指定**模型名称**和**工具列表**，LangChain 内部自动完成 prompt 构造、工具绑定、解析逻辑等繁琐工作。

---

### 5. 发起调用

调用 Agent 需要传入 `messages` 列表：

```python
response = agent.invoke({
    "messages": [
        {"role": "user", "content": "杭州今天天气如何?"}
    ]
})
```

Agent 返回的 `messages` 列表中包含了完整的推理链：
1. `HumanMessage` — 用户原始输入
2. `AIMessage` — 模型分析后决定调用 `getWeather` 工具（含 `tool_calls`）
3. `ToolMessage` — 工具返回结果：`"Current weather in 杭州 is sunny"`
4. `AIMessage` — 模型综合工具结果后的最终回复："杭州今天的天气是晴朗的。天气不错，适合外出活动！"

---

### 6. Agent 执行流程（ReAct 模式）

Agent 的执行遵循 **ReAct**（Reasoning + Acting）循环，共五个步骤：

```
用户提问 → 模型分析（判断是否需要工具、调用哪个工具）
    → 调用工具（执行具体操作）
    → 感知分析（评估工具返回结果，判断是否足以完成任务）
    → 生成结果（若不够则回到第 2 步继续循环）
```

| 步骤 | 名称 | 说明 |
|------|------|------|
| 1 | Input | 用户提问 |
| 2 | Reasoning | 模型分析需求，规划任务，判断是否需要调用工具及调用哪个工具 |
| 3 | Action | 调用工具执行具体操作 |
| 4 | Observation | 分析工具返回结果，判断是否足以完成目标，不足则继续前面步骤 |
| 5 | Output | 综合所有信息，生成最终回复 |

---

### 7. Agent 如何知道工具信息？

Agent 能"看到"工具，是因为 `create_agent` 在内部做了两件事：

1. **工具信息注入 System Prompt**：将每个工具的名称、描述、参数 schema 注入到系统提示词中
2. **模型原生 Function Calling**：借助模型自身支持的 function calling 能力，将工具作为可调用函数绑定到模型上

这样，当用户提问时，模型就能根据 prompt 中的工具描述判断是否需要调用工具、调用哪个工具、传什么参数。

---

## 下篇：LangChain 模型初始化与调用

### 1. 初始化模型

LangChain 提供两种初始化模型的方式：

| 方式 | 适用场景 | 灵活性 |
|------|----------|--------|
| `init_chat_model()` | LangChain 官方支持的模型平台 | 低，但最方便 |
| 模型类直接实例化 | 社区模型或需要精细控制 | 高，更灵活 |

---

#### 1.1 init_chat_model（推荐方式）

`init_chat_model` 根据模型名称自动推断提供商并完成初始化，是最简单的方式：

```python
from langchain.chat_models import init_chat_model

# LangChain 根据 "deepseek-chat" 自动识别为 DeepSeek 平台
model = init_chat_model(model="deepseek-chat")
# 类型：<class 'langchain_deepseek.chat_models.ChatDeepSeek'>
```

**自定义模型提供商**（适用于 LangChain 未原生支持的平台）：

以阿里云百炼的通义千问为例 —— 虽然 LangChain 不直接支持，但阿里兼容 OpenAI 接口格式，所以指定 `model_provider="openai"` 即可：

```python
import os

base_url = os.getenv("DASHSCOPE_BASE_URL")
api_key = os.getenv("DASHSCOPE_API_KEY")

model = init_chat_model(
    model="qwen-max",
    model_provider="openai",  # 阿里兼容 OpenAI 格式
    base_url=base_url,
    api_key=api_key
)
```

**调整模型参数**：

```python
model = init_chat_model(
    model="qwen-max",
    model_provider="openai",
    base_url=base_url,
    api_key=api_key,
    temperature=1.5,     # 控制随机性（0~2，越高越随机）
    # max_tokens=2048,   # 最大输出长度
    # top_p=0.9,         # 核采样参数
    # timeout=30,        # 超时时间（秒）
    # max_retries=3      # 最大重试次数
)
```

常用参数说明：

| 参数 | 含义 | 建议 |
|------|------|------|
| `temperature` | 随机性，值越小越确定 | 代码/事实问答用 0~0.3，创意写作用 0.7~1.5 |
| `max_tokens` | 最大输出 token 数 | 按需设置，避免浪费 |
| `top_p` | 核采样，控制词汇多样性 | 一般与 temperature 二选一调整 |
| `timeout` | 请求超时 | 网络不稳定时适当调大 |
| `max_retries` | 失败重试次数 | 生产环境建议 2~3 |

---

#### 1.2 使用模型类（社区扩展）

`init_chat_model` 底层就是帮我们调用模型类。对于社区贡献的模型，可以直接使用对应的类：

```bash
# 安装社区版依赖
uv add langchain-community
# 安装阿里云百炼 SDK
uv add dashscope
```

```python
from langchain_community.chat_models.tongyi import ChatTongyi

model = ChatTongyi(
    model="qwen-max"
    # 其它参数...
)
```

LangChain 社区支持的模型非常丰富，具体可查阅[官方文档](https://docs.langchain.com/oss/python/integrations/chat)。

---

### 2. 访问模型：invoke vs stream

LangChain 提供两种调用方式，适用不同场景：

---

#### 2.1 invoke — 阻塞式调用

等待模型生成完整结果后才返回，适合后台批处理：

```python
# 简单调用
response = model.invoke("你是谁？")
print(response.content)
```

```python
# 传入消息数组（支持 system prompt）
response = model.invoke([
    {"role": "system", "content": "你扮演火箭队的武藏，以武藏的性格口吻回答用户的问题。"},
    {"role": "user", "content": "你是谁？"}
])
print(response.content)
# 输出：哼！听好了，我可是火箭队最美丽的成员——武藏！...
```

`invoke` 的优缺点：

- ✅ 调用简单，一行代码拿到完整结果
- ❌ 需等待全部生成完毕，长文本时用户感知延迟大

---

#### 2.2 stream — 流式调用

实时逐 token 返回结果，像 ChatGPT 那样一个字一个字往外蹦：

```python
stream = model.stream("你是谁？")
# stream 是一个 generator

for chunk in stream:
    print(chunk.content, end="", flush=True)
```

`stream` 的优缺点：

- ✅ 用户体验好，即时反馈
- ✅ 适合聊天场景和实时交互
- ❌ 无法获取完整响应后才做后处理

**选择建议**：聊天/交互场景用 `stream`，批量/后台处理用 `invoke`。

---

### 3. 在智能体中使用模型

创建 Agent 时，可以传入已初始化的模型对象，也可以直接传模型名称让 LangChain 自动初始化：

```python
from langchain.agents import create_agent

# 方式一：传入已初始化的 model 对象
agent = create_agent(model=model)

# 方式二：传入模型名称，LangChain 自动初始化
agent = create_agent(model="deepseek-chat")
```

---

#### 3.1 Agent 的 invoke 调用

与模型调用类似，但需要传入 `messages` 字段：

```python
response = agent.invoke({
    "messages": [{"role": "user", "content": "你是谁？"}]
})
# 返回 {'messages': [HumanMessage, AIMessage]}
```

---

#### 3.2 Agent 的 stream 调用

流式调用时需指定 `stream_mode="messages"`，返回 `(token, metadata)` 元组：

```python
messages = agent.stream(
    {"messages": [{"role": "user", "content": "你是谁？"}]},
    stream_mode="messages"
)

for token, metadata in messages:
    if token.content:
        print(token.content, end="", flush=True)
```

> **注意**：Agent 的 stream 返回值和模型的不同 —— 模型直接返回 chunk 对象，Agent 返回 `(token, metadata)` 元组。遍历时记得解包。

---

### 4. 完整调用链路总结

```
加载环境变量 (load_dotenv)
    ↓
初始化模型 (init_chat_model / ChatTongyi)
    ↓
定义工具 (@tool 装饰器)
    ↓
创建 Agent (create_agent)
    ↓
调用 Agent (invoke / stream)
    ↓
Agent 自动完成：理解意图 → 选择工具 → 执行 → 观察 → 输出
```

---

## 关键要点

1. **`create_agent` 是核心入口**：封装了 prompt 构建、工具绑定、解析逻辑，一行创建 Agent
2. **`@tool` 装饰器**将普通函数变为 Agent 可用的工具，docstring 就是工具说明
3. **`init_chat_model` 是推荐的模型初始化方式**：自动推断提供商，同时也支持自定义 base_url / api_key 接入非官方平台
4. **invoke vs stream**：前者阻塞等完整结果，后者实时流式输出 —— 聊天用 stream，批处理用 invoke
5. **Agent 调用需传 `messages` 字段**：与直接调用模型不同，Agent 的入参是 `{"messages": [...]}` 格式的字典
6. **Agent stream 返回值是元组**：`(token, metadata)`，区别于模型的直接 chunk 对象
