---
title: "Gemini发展史-资料整理-2023.12-2025.6"
published: "2026-07-11"
category: "gemini"
lang: "zh"
draft: false
tags: ["发展史", "多模态", "Agent"]
---

# Gemini 发展史资料整理（2023.12 — 2025.6）

> 供《Gemini 发展史》长文撰写使用。信息基于 Google 官方博客、DeepMind 博客及权威媒体报道，可核实。

## 一、Gemini 1.5 系列

- **2023-12-06 | Gemini 1.0 发布**：Ultra / Pro / Nano 三尺寸；Nano 首次随 Pixel 8 Pro 端侧运行（本地对话、摘要、转录）。1.0 全系上下文 32K token。
- **2024-02-15 | Gemini 1.5 Pro（私人预览）**：首个 1M token 上下文模型；采用 **MoE（混合专家）架构**（相对传统 Transformer 按需激活专家通路）；性能接近 1.0 Ultra 但算力更低。标准上下文 128K，1M 版本经 AI Studio / Vertex AI 预览，可处理约 1 小时视频、11 小时音频、70 万字文本。
- **2024-05-14（Google I/O）| 1.5 Flash + 1.5 Pro 升级**：Flash 为轻量版，通过蒸馏 1.5 Pro 知识而来，同享 1M 上下文，主打低延迟高吞吐（一次分析 1500 页文档/3 万行代码）；1.5 Pro 增强翻译/编码/推理/原生音频理解；宣布 **1.5 Pro 2M token 上下文（waitlist 私人预览）**；新增 Gems、Gemini Live、视频抽帧、并行函数调用。
- **2024-05-30 | 1.5 Pro / Flash GA**（200+ 国家和地区），6 月起全面可用。
- **2024-09-24 | Gemini 1.5 大版本更新（-002 模型）**：1.5 Pro / Flash 升级为生产级模型；MMLU-Pro +7%、MATH/HiddenMath +20%、视觉与代码 +2~7%；**API 降价：输入 -64%、输出 -52%**（2024-10-01 生效）；发布轻量版 **Gemini 1.5 Flash-8B**；输出提速 2 倍、延迟降 3 倍。
- **Gemini Nano**：端侧小模型，从 1.0 起随 Pixel 8 Pro 首发，后扩展到 Chrome 桌面端、Pixel 系列及 Android。

## 二、Gemini 2.0 与 2.5 系列

- **2024-12-11 | Gemini 2.0 Flash（实验版）发布**：Google 官宣「Agentic 时代」宣言（"the agentic era"）。特点：原生图像+音频输出（TTS）、原生工具调用（Google 搜索、代码执行、第三方函数）、速度约为 1.5 Pro 的 2 倍且关键基准反超 1.5 Pro；发布 **Multimodal Live API**（实时音频/视频流输入）。同日在 Gemini Advanced 上线 **Deep Research** 功能。基于 100% 自研 Trillium（第六代 TPU）训练与推理。
- **2025-02-05 | Gemini 2.0 全家族上线**：2.0 Flash GA（$0.10/M 输入）；**2.0 Pro（实验版）**：迄今最强编码/复杂指令能力，**2M token 上下文**（可一次处理《哈利·波特》全 7 册）；**2.0 Flash-Lite（公开预览）**：最性价比模型，$0.075/M 输入（缓存后 $0.01875），质量优于 1.5 Flash，为 4 万张图各生成一句说明不到 1 美元。
- **2025-03-25 | Gemini 2.5 Pro（实验版）**：首个「思考模型」（thinking model，回答问题前先推理）；**在 LMArena 登顶 #1**（大幅领先，首款登顶的 Google 模型）；SWE-Bench Verified 63.8%、GPQA Diamond 84%、AIME 2025 86.7%、AIME 2024 92%、MMMU 81.7%；1M token 上下文。
- **2025-04-17 | Gemini 2.5 Flash（预览）**：首个可切换思考预算的混合推理模型（可控思维预算）。
- **2025-05-20（I/O 2025）| 2.5 系列大更新**：**2.5 Pro Deep Think** 实验增强推理模式（并行假设思考）：2025 USAMO 数学 49.4%、LiveCodeBench 80.4%、MMMU 84.0%；2.5 Flash 全面升级（token 使用减少 20-30%）；2.5 Pro 在 LMArena 全维度第一、WebDev Arena ELO 1415 登顶；Live API 新增原生音频输出、情感对话、Proactive Audio；Mariner 计算机使用能力开放到 API。
- **2025-06-17 | 2.5 Pro / 2.5 Flash GA + Flash-Lite 预览**：全部为思考模型、支持可调思考预算；2.5 Flash-Lite 成本为 Flash 的 1/3（输入）、1/6（输出）。

## 三、关键能力演进

- **原生多模态**：文本/图像/音频/视频/代码统一处理（1.5 起原生音频理解，2.0 起原生图像+音频输出）。
- **长上下文**：1.0 的 32K → 1.5 的 1M（2 月）→ 1.5 Pro 2M（5 月 I/O）→ 2.0 Pro 2M（2025-02）→ 2.5 Pro 1M/2M。
- **Native Tool Use**：2.0 起原生调用搜索、代码执行、函数调用；API 支持 Grounding with Google Search、URL Context、上下文缓存、MCP 工具。
- **Jules**：GitHub 原生集成的异步编程 Agent，可拆解 issue、制定并执行计划、开 PR（2024-12 随 2.0 公布）。
- **Deep Research**：自主研究 Agent，浏览数十来源后输出带引用的结构化报告（2024-12 上线 Gemini Advanced）。
- **Project Mariner**：浏览器 Agent（Chrome 扩展），理解屏幕像素/元素并执行任务，**WebVoyager 基准 83.5%**；敏感操作（如购物）需用户确认。
- **Project Astra**：实时多模态通用 Agent，支持 10 分钟会话记忆、多语言/混合语言对话、调用搜索/Lens/地图、接近人类对话延迟；在原型智能眼镜上测试。
- **Live API**：2024-12 发布（实时音视频输入）；2025-05 升级为原生音频输出对话 + 工具调用，24 语言同声切换。

## 四、重要基准成绩

| 模型 | 关键成绩 |
|---|---|
| Gemini 1.0 Ultra | **MMLU 90.04%（CoT@32）首个超越人类专家（89.8%）的模型**；GPT-4 为 86.4%；MMMU 62.4% SOTA |
| Gemini 1.5 Pro | MMLU 85.9%（多数投票 91.7%）；MMMU 62.2%（较 1.0 的 47.9% 大幅提升）；HumanEval 84.1%；GPQA 59.1%；ChartQA 87.2% |
| Gemini 2.0 Flash / Thinking | 2.0 Flash 速度 2 倍于 1.5 Pro 且关键基准反超；**2.0 Flash Thinking 一度登顶 LMArena** |
| Gemini 2.5 Pro | **LMArena #1（首次登顶，约领先 40 ELO）**；SWE-Bench Verified 63.8%；GPQA Diamond 84%；AIME 2025 86.7%；MMMU 81.7%；MRCR 1M 上下文 83.1% |
| 2.5 Pro Deep Think | 2025 USAMO 49.4%；LiveCodeBench 80.4%；MMMU 84.0% |

## 五、商业化与生态

- **2024-02-08 | Bard → Gemini 改名**：聊天机器人、Duet AI 全线并入 Gemini 品牌；Android 独立 App、iOS 集成进 Google App；230+ 国家/地区、40+ 语言可用。
- **Gemini Advanced**：基于 Ultra 1.0，并入 **Google One AI Premium，$19.99/月**（2 个月免费试用，含 2TB 存储）；后续 2024-08 上线 Gemini Live（自然语音对话）、Gems 定制。
- **Gemini API / AI Studio**：2023-12 开放；2024 年 5 月起免费层 + 按量付费，2024-10 大幅降价。
- **Workspace 集成**：Gmail/Docs/Slides/Sheets 侧栏（原 Duet AI）；Business/Enterprise/Frontline 方案内置 Gemini App；2024-09 起 Workspace 广泛预置。
- **Android / Pixel 端侧**：Gemini 成为默认助手形态（取代 Google Assistant 路径）；Nano 端侧模型首发 Pixel 8 Pro，Chrome 桌面端扩展；Pixel 9 全系深度集成。

## 六、开源与开发者

- **2024-02-21 | Gemma 开源系列**：2B / 7B 两个尺寸（各带预训练 + 指令微调版），与 Gemini 同源技术；支持 Keras 3.0 / PyTorch / JAX / Hugging Face，可在笔记本本地运行，允许商用；发布后数周内下载数百万次。后续扩展：CodeGemma、RecurrentGemma、PaliGemma（视觉语言，2024-05）、Gemma 2（27B，2024-06）。
- **Gemini API 定价（2025-06 稳定版）**：
  - 2.5 Pro：输入 $1.25/M、输出 $10/M（≤200K token；超长上下文 $2.50/$15）；
  - 2.5 Flash：输入 $0.30/M、输出 $2.50/M；
  - 2.5 Flash-Lite：输入 $0.10/M、输出 $0.40/M；
  - 2.0 Flash-Lite 曾达 $0.075/M 输入（击缓存 $0.01875）。
- **开发者生态**：Gemini API Developer Competition（2024-05，大奖定制 DeLorean）；上下文缓存（2024-06）、批量 API、思考摘要（thought summaries）、MCP 工具支持等持续上线。

## 参考来源（可靠链接）

1. Google Blog — Introducing Gemini 2.0: our new AI model for the agentic era（2024-12-11）https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/
2. Google Blog — Gemini 2.0 is now available to everyone（2025-02-05）https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-updates-february-2025/
3. Google Blog — Gemini 2.5: Our most intelligent AI model（2025-03-25）https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-thinking-updates-march-2025/
4. Google Blog — Gemini 2.5 updates at I/O 2025（含 Deep Think）https://blog.google/technology/google-deepmind/google-gemini-updates-io-2025/
5. DeepMind Blog — Gemini 2.5: Our most intelligent models are getting even better https://deepmind.google/blog/gemini-25-our-world-leading-model-is-getting-even-better
6. Google Blog — Bard becomes Gemini: Try Ultra 1.0 and a new mobile app today（2024-02-08）https://blog.google/products/gemini/bard-gemini-advanced-app/
7. Google Blog — Gemini 1.5 Pro updates, 1.5 Flash debut（I/O 2024）https://blog.google/technology/developers/gemini-gemma-developer-updates-may-2024/
8. Google Blog — Our next-generation model: Gemini 1.5（2024-02-15）https://blog.google/technology/ai/google-gemini-next-generation-model-february-2024/
9. Google Blog — Gemma: Introducing new state-of-the-art open models（2024-02-21）https://blog.google/technology/developers/gemma-open-models/
10. Google AI for Developers — Gemini API 官方定价页 https://ai.google.dev/gemini-api/docs/pricing
11. Google AI for Developers — Gemini API Release notes（版本时间线）https://ai.google.dev/gemini-api/docs/changelog
12. Vertex AI Blog — Vertex AI at I/O 2024 https://cloud.google.com/blog/products/ai-machine-learning/vertex-ai-io-announcements/
13. Ars Technica — Gemini 2.5 Pro GA / Flash-Lite（2025-06-17）https://arstechnica.com/ai/2025/06/googles-gemini-ai-family-updated-with-stable-2-5-pro-super-efficient-2-5-flash-lite/
14. MIT Technology Review — Google's new Gemini 1.5（2024-02-15）https://www.technologyreview.com/2024/02/15/1088367/googles-new-version-of-gemini-can-handle-far-bigger-amounts-of-data/
15. Hidekazu Konishi — Google Gemini Model Release Timeline（完整时间线，可交叉核对）https://hidekazu-konishi.com/entry/google_gemini_model_release_timeline.html
