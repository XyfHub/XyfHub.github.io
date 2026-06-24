---
layout: post
title: "RAG PDF 知识库问答系统：从0到1全栈构建记录"
date: 2026-06-23 10:00:00 +0800
categories: [项目经历]
tags: [RAG, LLM, 向量数据库, PDF问答, Python全栈, DeepSeek, BGE-M3, ChromaDB, FastAPI]
description: 从技术选型到系统实现，完整记录一个基于 RAG 的 PDF 知识库问答系统构建过程，涵盖框架选型、混合检索、SSE 流式返回等关键技术决策。
---

> 2026-06-23 | 项目经历 | DocRAG | 阅读约 12 分钟

## 项目背景

在准备实习面试的过程中，我决定做一个基于 RAG（Retrieval-Augmented Generation，检索增强生成）的 PDF 知识库问答系统。目标是构建一个完整可用的全栈应用：上传 PDF 文档后，能用自然语言对文档内容提问，系统自动检索相关段落并生成带源引用的回答。

这篇文章不求面面俱到，重点在于**每个技术决策背后的「为什么」**——这也是面试官最关心的部分。

---

## 一、什么是 RAG，为什么要用它

大语言模型（LLM）虽然强大，但有两个硬伤：

1. **知识截止**：训练数据有截止日期，无法回答最新信息
2. **幻觉**：对于不知道的内容，模型会「编造」听起来合理但实际错误的答案

RAG 的解决思路很朴素：**提问时，先从外部知识库检索相关文档，把检索结果和问题一起交给 LLM。** LLM 不需要「记住」所有知识，只需要基于提供的上下文推理和总结。

<div class="mermaid">
sequenceDiagram
    participant U as 👤 用户
    participant R as 🔍 检索引擎
    participant K as 📚 知识库
    participant L as 🤖 LLM

    U->>R: 提问
    R->>K: 向量检索相关内容
    K-->>R: Top-K 相关文档
    R->>L: 拼接上下文 + 问题
    L-->>U: 带源引用的流式回答
</div>

---

## 二、技术选型调研

### 2.1 RAG 框架：LlamaIndex vs LangChain

这是第一个关键决策。两个框架各有侧重，**我的结论是混合使用**：

| 维度 | LangChain | LlamaIndex |
|------|-----------|------------|
| 定位 | LLM 应用万能工具箱 | 专注数据与 LLM 交互的索引引擎 |
| PDF 解析 | 依赖第三方库 | 内置 LlamaParse（ParseBench 84.9%） |
| 检索精度 | ★★★☆☆ | ★★★★★（内置混合检索+重排序） |
| Agent 能力 | ★★★★★ | 有限 |
| 学习曲线 | 陡峭 | 中等 |

**为什么选混合架构？** LlamaIndex 在数据层（文档解析、索引构建、检索）能力突出，LangChain 在编排层（Agent 决策、多轮对话）更成熟。两者在 2026 年已经加强了互操作性，不是「二选一」的问题，而是「各取所长」。

### 2.2 PDF 解析

对比了五个主流方案：

| 工具 | 速度(s/页) | 表格 | 公式 | 综合分 |
|------|:---:|:---:|:---:|:---:|
| PyMuPDF4LLM | **0.09** | 弱 | 无 | 0.732 |
| Marker | 1 (GPU) | 好 | **最佳** | 0.861 |
| Docling | 0.76 | **最佳** | 良好 | **0.882** |
| Unstructured | 3.0 | 一般 | 一般 | 0.841 |

**选择 PyMuPDF4LLM，启用分层策略。** 90% 的 PDF 是纯文本或简单排版，用 PyMuPDF4LLM 快速处理（0.09s/页）。对复杂文档（表格密集、多栏排版）可选配 Marker 做兜底。分层策略同时兼顾了速度和精度，而不是一刀切地选「最强」方案。

### 2.3 向量数据库

| 数据库 | 单查询延迟 | 并发 QPS | 适用规模 | 运维成本 |
|--------|:---:|:---:|------|:---:|
| FAISS | 0.8ms | 652 | <10M(单机) | 低但需自建 |
| Qdrant | 15ms | **1245** | 1M-100M | 中 |
| Milvus | 10ms | 1180 | **100M+** | 高 |
| Chroma | 50ms | 423 | <100K | **极低** |

**选择 ChromaDB，理由只有一个：开发阶段最重要的是迭代速度。** `pip install chromadb` 即装即用，零配置，Python 原生 API。等数据量上去了再迁移到 Qdrant 或 Milvus——向量数据库的接口已经趋同，迁移成本很低。不要过早优化。

### 2.4 Embedding 模型

中文检索场景的核心指标——CMTEB 中文检索 benchmark：

| 模型 | CMTEB 中文检索 | 部署方式 | 费用 |
|------|:---:|------|:---:|
| BGE-M3 | **71.4** | 本地 Ollama | 免费 |
| Qwen3-Embedding-8B | **73.83** | 本地(GPU) | 免费 |
| OpenAI text-embedding-3-large | 68.2 | API | $0.13/M token |
| Cohere multilingual-v3 | 69.1 | API | $0.10/M token |

**选择 BGE-M3。** 中文检索能力（71.4）显著超过 OpenAI（68.2），完全开源免费，支持 Dense + Sparse + ColBERT 三种检索模式，可本地部署也可领域微调。通过 Ollama 一条命令即可运行。Qwen3-Embedding 分数更高但需要 GPU——对于开发阶段，BGE-M3 的 CPU 友好性更实用。

### 2.5 LLM 方案

对比了本地部署（Ollama / Qwen3-8B）和商业 API 两套方案。**选择 DeepSeek-V3 API**：

- 中文能力业界天花板
- 价格仅 ¥1/百万 token（GPT-4o 的 1/20）
- 无需 GPU 硬件投入

最终形成**纯国产模型栈**：BGE-M3（智源，Embedding）+ DeepSeek-V3（深度求索，生成）。这在面试时是一个很好的叙事角度——既体现了对国产模型生态的关注，也说明了选型不是盲目「支持国产」，而是有具体的性能/成本依据。

---

## 三、系统架构设计

采用**分层微服务架构**，核心设计理念：

> 摄入和检索通过 ChromaDB 解耦——摄入只管写，问答只管读。

<div class="mermaid">
graph TD
    A[🖥️ Next.js Frontend] --> B[⚡ FastAPI API Gateway]
    B --> C[📥 Ingestion Service<br/>PyMuPDF + Chunker]
    B --> E[🔍 RAG Pipeline<br/>DeepSeek-V3]
    C --> D[(🗄️ ChromaDB)]
    D --> F[🔄 Hybrid Search + Rerank]
    F --> E
</div>

### 为什么分层？

| 层级 | 目录 | 职责 | 可独立做的事 |
|------|------|------|-------------|
| 摄入层 | `ingestion/` | PDF 解析 → 分块 → 向量化 → 索引 | 离线异步，独立扩展 |
| 检索层 | `retrieval/` | 混合检索 + 重排序 | 独立评估 MRR、NDCG、召回率 |
| 生成层 | `generation/` | RAG 链路编排 + LLM 客户端 | LLM 可插拔替换 |
| API 层 | `api/` | 路由、请求验证、响应封装 | 薄层，不含业务逻辑 |

每一层都有明确的接口定义，可以独立测试和替换。面试时逐个讲清楚每层的职责，比一个「大杂烩」脚本有说服力得多。

### 核心数据流

**文档摄入（离线异步）：**

<div class="mermaid">
flowchart LR
    A[📄 PDF 上传] --> B[PyMuPDF4LLM<br/>提取文本+元数据]
    B --> C[SemanticChunker<br/>语义分块<br/>512 tokens / 64 overlap]
    C --> D[BGE-M3<br/>Embedding 1024维]
    D --> E[(ChromaDB<br/>持久化)]
</div>

**问答链路（在线 SSE 流式）：**

<div class="mermaid">
flowchart LR
    A[❓ 用户提问] --> B[混合检索<br/>向量 + BM25]
    B --> C[RRF 融合<br/>取 Top-10]
    C --> D[Rerank 重排序<br/>取 Top-5]
    D --> E[Prompt 构建<br/>系统指令+上下文+问题]
    E --> F[DeepSeek-V3<br/>SSE 流式生成]
    F --> G[✅ 返回 token + 源引用]
</div>

### 为什么用混合检索？

纯向量检索能捕捉语义相似性，但对专有名词、数字、代码等关键词不敏感。BM25 恰恰擅长精确关键词匹配。通过 RRF（Reciprocal Rank Fusion）算法融合两个排序列表，比单一检索方式的召回率高 15-20%。

**核心实现：**

```python
def hybrid_search(query: str, top_k: int = 10) -> list[Document]:
    """混合检索：向量 + BM25，RRF 融合"""
    # 1. 向量检索
    dense_results = vector_store.similarity_search_with_score(query, k=top_k * 2)

    # 2. BM25 关键词检索
    sparse_results = bm25_retriever.search(query, k=top_k * 2)

    # 3. RRF 融合排序
    fused = rrf_fusion(dense_results, sparse_results, k=60)
    return fused[:top_k]


def rrf_fusion(
    ranked_a: list[Document],
    ranked_b: list[Document],
    k: int = 60
) -> list[Document]:
    """Reciprocal Rank Fusion：对两个排序列表加权融合"""
    scores: dict[str, float] = {}

    for rank, doc in enumerate(ranked_a, start=1):
        scores[doc.id] = scores.get(doc.id, 0) + 1 / (k + rank)

    for rank, doc in enumerate(ranked_b, start=1):
        scores[doc.id] = scores.get(doc.id, 0) + 1 / (k + rank)

    sorted_ids = sorted(scores, key=scores.get, reverse=True)
    return [id_to_doc[doc_id] for doc_id in sorted_ids]
```

---

## 四、实现要点

### 4.1 语义分块

固定大小分块（比如 512 字硬切）的问题是：一句话可能被从中截断，导致语义碎片化。我的实现是「段落 → 句子 → 滑动窗口」三级策略：

```python
class SemanticChunker:
    """语义感知的文档分块器"""
    def __init__(self, chunk_size: int = 512, overlap: int = 64):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, text: str) -> list[str]:
        chunks = []

        # 1. 先按段落边界（双换行）分割，保留自然段落结构
        paragraphs = text.split("\n\n")

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # 2. 段落较短 → 直接作为一个 chunk
            if self._token_count(para) <= self.chunk_size:
                chunks.append(para)
                continue

            # 3. 段落过长 → 按句子边界二次分割
            sentences = self._split_sentences(para)
            current_chunk = []
            current_len = 0

            for sentence in sentences:
                sent_len = self._token_count(sentence)

                if current_len + sent_len > self.chunk_size and current_chunk:
                    chunks.append(" ".join(current_chunk))
                    # 滑动窗口：保留最后 overlap tokens 对应的句子
                    overlap_sentences = self._calc_overlap(current_chunk)
                    current_chunk = overlap_sentences
                    current_len = sum(self._token_count(s) for s in current_chunk)

                current_chunk.append(sentence)
                current_len += sent_len

            if current_chunk:
                chunks.append(" ".join(current_chunk))

        return chunks
```

关键设计点：
1. **优先尊重段落边界**，不破坏文档的自然结构
2. **句子是最小不可分割单元**，绝不在句子中间截断
3. **64 token 重叠窗口**，避免跨块语义丢失

### 4.2 SSE 流式返回

聊天接口使用 SSE（Server-Sent Events）而非普通 JSON 响应，用户能看到答案逐字出现，而不是等待 10 秒后一次性展示。这是用户体验的关键细节。

后端 SSE 事件流设计：

```python
@router.post("/chat/{doc_id}/stream")
async def chat_stream(doc_id: str, request: ChatRequest):
    """SSE 流式聊天端点"""

    async def event_generator():
        # 阶段1：检索源文档，通过 sources 事件告知前端
        sources = await retrieval_service.hybrid_search(
            query=request.message,
            doc_id=doc_id,
            top_k=5
        )
        yield {
            "event": "sources",
            "data": json.dumps([{
                "filename": s.filename,
                "page": s.page_number,
                "snippet": s.text[:200],
                "score": round(s.score, 4)
            } for s in sources], ensure_ascii=False)
        }

        # 阶段2：逐 token 流式生成回答
        context = build_context(sources)
        prompt = build_prompt(context, request.message)

        async for token in llm_client.stream_chat(prompt):
            yield {
                "event": "token",
                "data": json.dumps({"content": token}, ensure_ascii=False)
            }

        # 阶段3：结束信号 + 统计信息
        yield {
            "event": "done",
            "data": json.dumps({"sources_count": len(sources)}, ensure_ascii=False)
        }

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 禁用 Nginx 缓冲
        }
    )
```

三种事件类型各司其职：

| 事件 | 触发时机 | 携带数据 |
|------|---------|---------|
| `sources` | 检索完成后立即发送 | 文档名、页码、文本摘要、相关度分数 |
| `token` | LLM 每生成一个 token | 单个 token 内容 |
| `done` | 生成完毕 | 完整统计信息 |

### 4.3 源引用溯源

每个回答下方都展示参考来源卡片，包含：文档名、页码、相关文本摘要、相关度百分比。这个功能在面试展示时非常有说服力——它证明了系统不是在「胡说八道」，每个结论都有据可查。

---

## 五、项目亮点（面试可用）

1. **混合检索 + RRF 融合**：深入理解向量检索与关键词检索的互补关系，不是简单地调 API，而是理解了 RRF 的融合原理
2. **分层架构**：每层职责清晰、接口明确、可独立测试——这是工程能力的体现
3. **纯国产模型栈**：BGE-M3 + DeepSeek-V3，每个选择都有性能/成本数据支撑，不是盲目的「支持国产」
4. **SSE 流式 + 源引用**：完整的用户体验和可解释性设计，证明你考虑了用户体验而非只关注模型
5. **每个决策都有「为什么」**：技术选型不是堆砌流行词，而是 trade-off 分析——这是面试官最看重的思维习惯

---

## 六、技术栈总结

| 层级 | 选型 | 为什么没选替代方案 |
|------|------|-------------------|
| 框架 | FastAPI + Next.js 14 | Flask 异步性能差，Streamlit 不适合定制化 UI |
| PDF 解析 | PyMuPDF4LLM | Marker 需 GPU，LlamaParse 需付费 |
| 分块 | 自定义 SemanticChunker | LangChain TextSplitter 不理解中文语义边界 |
| Embedding | BGE-M3 (Ollama) | Qwen3-Emb 需要 GPU，OpenAI Emb 中文弱且收费 |
| 向量库 | ChromaDB | Qdrant/Milvus 功能强但开发阶段过度复杂 |
| 检索 | 向量 + BM25 + RRF | 纯向量对关键词不敏感，纯关键词丢失语义 |
| 重排序 | Reranker 关键词交叉评分 | BGE-Reranker 需额外部署 GPU 模型 |
| LLM | DeepSeek-V3 | GPT-4o 贵 20 倍，Qwen-Max 中文略逊 |
| 部署 | Docker Compose | K8s 对于单机项目过度复杂 |

---

## 七、下一步计划

- [ ] **Agentic RAG**：让 LLM 自主判断是否需要检索、如何多步检索，而非每条消息都无脑检索
- [ ] **多模态支持**：PDF 中的图片、表格、图表问答
- [ ] **增量索引**：新增文档无需重建全库，降低写入成本
- [ ] **量化评估**：用 RAGAS 框架系统评估检索和生成质量，用数据驱动优化

---

> 项目的完整代码和设计文档可以在 [GitHub](#) 上查看。如果你也在做类似的 RAG 项目，或对技术选型有不同看法，欢迎交流讨论。
>
> **原创声明**：本文为原创内容，转载需经作者授权并注明出处。

<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
</script>
