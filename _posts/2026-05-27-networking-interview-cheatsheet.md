---
layout: post
title: "计算机网络面试速查：传输层与应用层高频考点"
date: 2026-05-27 10:00:00 +0800
categories: [学习笔记]
tags: [计算机网络, 面试, TCP, HTTP, 传输层, 应用层]
description: 整理计算机网络传输层与应用层的面试高频考点，涵盖TCP/UDP、三次握手四次挥手、HTTP/HTTPS、状态码、DNS等核心知识点，适合后端开发实习面试快速复习。
---

## 传输层

### TCP vs UDP

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接，通信前需建立连接 | 无连接，直接发送数据 |
| 可靠性 | 可靠交付，保证数据无差错、不丢失、不重复、按序到达 | 尽最大努力交付，不保证可靠性 |
| 有序性 | 有序，通过序列号保证数据按序到达 | 无序，数据包可能乱序到达 |
| 速度 | 较慢，有额外的连接管理和确认开销 | 快速，头部仅 8 字节，无连接开销 |
| 头部开销 | 20~60 字节 | 8 字节 |
| 适用场景 | 文件传输、邮件、网页浏览 | DNS、音视频通话、直播、在线游戏 |

### TCP 三次握手

<div class="mermaid">
sequenceDiagram
    participant C as 客户端
    participant S as 服务端
    Note over C,S: 初始状态 CLOSED
    C->>S: ① SYN=1, seq=x<br/>客户端进入 SYN-SENT
    Note right of S: 收到 SYN，进入 SYN-RCVD
    S->>C: ② SYN=1, ACK=1<br/>seq=y, ack=x+1
    Note left of C: 收到 SYN+ACK，进入 ESTABLISHED
    C->>S: ③ ACK=1<br/>seq=x+1, ack=y+1
    Note right of S: 收到 ACK，进入 ESTABLISHED
    Note over C,S: 连接建立，开始传输数据
</div>

**为什么是三次，不是两次？** 防止已失效的连接请求到达服务端，导致服务端错误地建立连接。如果只有两次握手，服务端收到一个过期的 SYN 就会直接进入 ESTABLISHED 状态，浪费资源。

**为什么不是四次？** 服务端的 SYN 和 ACK 可以合并发送(捎带确认)，所以三次就够了。

### TCP 四次挥手

<div class="mermaid">
sequenceDiagram
    participant C as 客户端
    participant S as 服务端
    Note over C,S: 连接已建立 (ESTABLISHED)
    C->>S: ① FIN=1, seq=u<br/>客户端进入 FIN-WAIT-1
    Note right of S: 收到 FIN，进入 CLOSE-WAIT
    S->>C: ② ACK=1, ack=u+1<br/>服务端进入 CLOSE-WAIT
    Note left of C: 收到 ACK，进入 FIN-WAIT-2
    Note right of S: 处理完剩余数据后准备关闭
    S->>C: ③ FIN=1, seq=w<br/>服务端进入 LAST-ACK
    Note left of C: 收到 FIN，进入 TIME-WAIT
    C->>S: ④ ACK=1, ack=w+1<br/>客户端进入 TIME-WAIT
    Note right of S: 收到 ACK，进入 CLOSED
    Note left of C: 等待 2MSL 后进入 CLOSED
    Note over C,S: 连接完全关闭
</div>

**为什么挥手需要四次？** 因为 TCP 是全双工的，每个方向都需要单独关闭。服务端收到客户端的 FIN 后，可能还有数据没发完，所以先回一个 ACK，等数据发完后再发自己的 FIN。ACK 和 FIN 不能合并。

**TIME_WAIT（2MSL）的作用：**

1. 确保最后一个 ACK 能到达服务端（如果丢失，服务端会重发 FIN，客户端可以重发 ACK）
2. 让旧连接的所有报文在网络中消失，避免影响新连接

### TCP 可靠传输机制

**确认应答（ACK）**：接收方收到数据后发送确认，发送方收到确认才认为发送成功。

**超时重传**：发送方在超时时间内未收到 ACK，则重传数据。超时时间(RTO)略大于 RTT（往返时间）。

**滑动窗口**：允许发送方连续发送多个报文段而不用等每个的 ACK，提高吞吐量。窗口大小由接收方通告。

**流量控制**：接收方通过通告窗口大小来控制发送方的发送速率，防止接收方缓冲区溢出。

**拥塞控制**：

| 算法 | 说明 |
|------|------|
| 慢启动 | 连接建立后，cwnd 从 1 开始指数增长，直到达到 ssthresh |
| 拥塞避免 | cwnd ≥ ssthresh 后，转为线性增长（每个 RTT 加 1） |
| 快重传 | 收到 3 个重复 ACK 时，不等超时就立即重传丢失的报文 |
| 快恢复 | 快重传后不降到慢启动，而是将 ssthresh 和 cwnd 都减半，进入拥塞避免 |

### UDP 关键点

- **无连接**：发送数据前不需要建立连接
- **不可靠**：不保证数据到达，没有确认机制
- **面向报文**：保留应用层报文边界，不拆分不合并
- **头部仅 8 字节**：源端口(2) + 目的端口(2) + 长度(2) + 校验和(2)
- **典型应用**：DNS、DHCP、音视频流媒体、在线游戏、QUIC(HTTP/3 底层)

---

## 应用层

### HTTP vs HTTPS

| 特性 | HTTP | HTTPS |
|------|------|-------|
| 默认端口 | 80 | 443 |
| 传输方式 | 明文 | TLS/SSL 加密 |
| 证书 | 不需要 | 需要 CA 颁发证书 |
| 安全性 | 低，可被中间人攻击 | 高，防窃听防篡改 |
| 速度 | 快（无加密开销） | 慢（多一次 TLS 握手） |

**TLS 握手（简化流程）**：客户端发送支持的加密套件和随机数 → 服务端返回证书和随机数 → 客户端验证证书 → 双方用随机数生成对称密钥 → 加密通信开始。

### HTTP 状态码速记

> 记忆口诀：**1 信息，2 成功，3 重定向，4 客户端错，5 服务端错**

| 状态码 | 含义 |
|--------|------|
| **200 OK** | 请求成功 |
| **301 Moved Permanently** | 永久重定向（换域名时用，搜索引擎更新链接） |
| **302 Found** | 临时重定向（跳转到登录页等临时场景） |
| **304 Not Modified** | 资源未修改，使用缓存 |
| **400 Bad Request** | 请求参数有误 |
| **401 Unauthorized** | 未认证，需要登录 |
| **403 Forbidden** | 已认证但没权限访问 |
| **404 Not Found** | 资源不存在 |
| **500 Internal Server Error** | 服务端代码报错 |
| **502 Bad Gateway** | 网关错误（上游服务返回无效响应） |
| **503 Service Unavailable** | 服务暂时不可用（过载或维护中） |
| **504 Gateway Timeout** | 网关超时（上游服务响应太慢） |

### HTTP 版本演进

| 版本 | 核心改进 |
|------|----------|
| **HTTP/1.0** | 短连接，每次请求建立新 TCP 连接，请求完就断开 |
| **HTTP/1.1** | 持久连接(Keep-Alive)、管道化(Pipelining)、Host 头(支持虚拟主机)、断点续传 |
| **HTTP/2.0** | 二进制分帧、多路复用(同连接并发请求/响应)、头部压缩(HPACK)、服务端推送 |
| **HTTP/3.0** | 基于 QUIC(UDP)，解决 TCP 队头阻塞，0-RTT 连接建立，连接迁移 |

### GET vs POST

| 维度 | GET | POST |
|------|-----|------|
| 语义 | 获取资源 | 提交数据/创建资源 |
| 参数位置 | URL 查询字符串 | 请求体 |
| 安全性(可见性) | 参数暴露在 URL 中 | 参数在请求体中，相对隐蔽 |
| 幂等性 | 幂等（多次请求结果相同） | 不幂等（多次请求可能创建多条记录） |
| 缓存 | 可缓存 | 不可缓存 |
| 长度限制 | 受 URL 长度限制（浏览器约 2KB） | 理论上无限制 |
| 书签 | 可收藏 | 不可收藏 |

> **注意**：GET 也可以有请求体，但不推荐且大多数服务端忽略；POST 也可以有 URL 参数。区别主要在语义，不在技术实现。

### Cookie vs Session

| 维度 | Cookie | Session |
|------|--------|---------|
| 存储位置 | 客户端（浏览器） | 服务端（内存/数据库/Redis） |
| 安全性 | 较低，可被篡改和窃取 | 较高，数据在服务端 |
| 生命周期 | 可设置过期时间，关闭浏览器后可能保留 | 依赖会话超时时间，关闭浏览器通常失效 |
| 大小限制 | 单个 Cookie ≤ 4KB | 理论上无限制 |
| 跨域支持 | 支持二级域名共享 | 默认不支持跨域 |
| **分布式问题** | 无 | 需要 Session 共享（Redis/粘性会话/无状态 Token） |

### DNS 解析流程

<div class="mermaid">
sequenceDiagram
    participant B as 浏览器
    participant L as 本地 DNS 服务器
    participant R as 根域名服务器
    participant T as 顶级域名服务器(.com)
    participant A as 权威域名服务器

    Note over B: 输入 www.example.com
    B->>L: ① 查询 www.example.com 的 IP
    Note over B,L: 递归查询 —— 本地 DNS 代理完成全链路

    L->>R: ② 请求 .com 的 NS 地址
    R->>L: 返回 .com 域名服务器地址

    L->>T: ③ 请求 example.com 的 NS 地址
    T->>L: 返回 example.com 权威服务器地址

    L->>A: ④ 请求 www.example.com 的 IP
    A->>L: 返回 IP: 93.184.216.34

    L->>B: ⑤ 返回解析结果
    Note over B: 缓存结果，开始 TCP 连接
</div>

- **递归查询**：浏览器 → 本地 DNS（由本地 DNS 代劳查询全链路，返回最终结果）
- **迭代查询**：本地 DNS → 根 → .com → 权威（本地 DNS 逐级询问，每级只给下一级地址）
- 实际中：客户端对本地 DNS 是递归，本地 DNS 对外是迭代

### 从输入 URL 到页面渲染（综合题）

> 这是面试中最常见的综合题，考察对整个网络栈的理解。按顺序答，每个环节展开 1-2 句即可。

1. **URL 解析** — 浏览器解析协议、域名、端口、路径
2. **DNS 解析** — 域名 → IP 地址（见上文 DNS 流程）
3. **TCP 连接** — 三次握手建立连接（HTTPS 还需要 TLS 握手）
4. **HTTP 请求** — 浏览器发送 HTTP 请求报文
5. **服务端处理** — 服务端接收请求，处理逻辑，返回 HTTP 响应
6. **浏览器解析渲染** — HTML → DOM 树，CSS → CSSOM 树，合并为渲染树 → Layout(布局) → Paint(绘制) → Composite(合成)
7. **连接关闭** — 四次挥手（HTTP/1.1 默认持久连接，不会立即关闭）

---

## 一句话总结

传输层保证数据怎么发、发得准不准确（TCP 可靠慢、UDP 快速不可靠）；应用层定义发了什么、怎么解析（HTTP 协议、URL 寻址、DNS 翻译）。面试先答框架，再被追问细节。

<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
</script>
