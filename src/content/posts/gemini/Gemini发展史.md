---
title: "Gemini发展史"
published: "2026-07-22"
category: "gemini"
lang: "zh"
draft: false
tags: ["发展史", "多模态", "Agent"]
---

# Gemini 发展史：从 AlphaGo 到世界模型的技术长征

---

## 〇、总览：这篇文章讲什么

文章系统梳理了 **Google Gemini** 从 2023 年 12 月发布首个原生多模态模型，到 2026 年 7 月发布 3.6 Flash 之间约两年半的模型进化史；并回溯其前身 DeepMind / Google Brain 自 2010 年以来的技术积累。与 DeepSeek 的"论文驱动"路线不同，Gemini 是"项目驱动"——每条产品线与模型版本背后都是 Google DeepMind 的整合研发体系，因此本文以**版本发布时间线**为骨干，沿三条技术主线展开：

1. **原生多模态**——从"拼接式多模态"到"从零统一预训练五模态"，再到"任意输入→任意输出"的世界模型；
2. **推理能力**——从"快速响应"到"思考模型"，再到"混合推理 / 并行假设推理"，思考深度与速度的解耦；
3. **Agent 能力**——从聊天机器人到"Agentic 时代"宣言，再到能真实执行任务的通用智能体（Antigravity、Spark）。

作者最后总结出 Gemini 体系的四条方法论：研究驱动的长线主义、原生多模态优于拼接、模型-系统-硬件三位一体、思考与效率的平衡。

> 📌 配套解读：本文各节点在 `gemini/` 文件夹下有 8 份配套论文/模型解读文档（清单与映射见**附录 D**），时间线总表中以"本地解读"列链接，正文各节以 `📄 本地解读` 引用。建议对照阅读。

---

## 一、发展时间线总表

| 时间 | 事件 | 核心贡献 | 阶段定位 | 本地解读 |
|---|---|---|---|---|
| 2010.09 | DeepMind 成立 | 伦敦，使命"先解决智能" | 序章 | — |
| 2014.01 | Google 收购 DeepMind | 约 5 亿美元，含禁军用条款 | 序章 | — |
| 2016.03 | AlphaGo 击败李世石 | 深度学习破圈元年 | 序章 | [AlphaGo系列论文解读.md](./gemini/AlphaGo系列论文解读.md) |
| 2017.06 | Transformer 论文（Google Brain） | 现代大模型的地基 | 序章 | [Transformer论文解读.md](./gemini/Transformer论文解读.md) |
| 2018.12 / 2020.11 | AlphaFold / AlphaFold2 | 解决 50 年蛋白质折叠难题 | 序章 | [AlphaFold论文解读.md](./gemini/AlphaFold论文解读.md) |
| 2022.04 | PaLM 发布 | 540B 参数，Gemini 前身 | 序章 | [PaLM系列论文解读.md](./gemini/PaLM系列论文解读.md) |
| 2023.02 | Bard 发布 | 应对 ChatGPT 的 "code red" | 序章 | — |
| 2023.04.20 | Google Brain + DeepMind 合并 | Hassabis 任 CEO，首个项目即 Gemini | 序章 | — |
| 2023.12.06 | **Gemini 1.0**（分水岭①） | 原生多模态，MMLU 90.0% 超人类专家 | 诞生 | [Gemini-1.0论文解读.md](./gemini/Gemini-1.0论文解读.md) |
| 2024.02.08 | Bard 更名 Gemini、Ultra 开放 | Gemini Advanced 订阅制 | 诞生 | — |
| 2024.02.15 | **Gemini 1.5 Pro** | 首个 1M token 上下文、MoE 架构 | 长上下文革命 | [Gemini-1.5论文解读.md](./gemini/Gemini-1.5论文解读.md) |
| 2024.05.14 | I/O 2024：1.5 Flash、2M 预告 | 蒸馏轻量版、长上下文再翻倍 | 长上下文革命 | → 1.5 解读 |
| 2024.09.24 | Gemini 1.5 生产级更新 | API 降价 64%/52%、Flash-8B | 长上下文革命 | → 1.5 解读 |
| 2024.12.11 | **Gemini 2.0 Flash**（分水岭②） | "Agentic 时代"宣言、原生工具调用 | Agentic | [Gemini-2.x系列解读.md](./gemini/Gemini-2.x系列解读.md) |
| 2025.02.05 | Gemini 2.0 Pro / Flash-Lite | 2M 上下文，一次读完《哈利·波特》 | Agentic | → 2.x 解读 |
| 2025.03.25 | **Gemini 2.5 Pro**（分水岭③） | 首个思考模型，LMArena 登顶 | 学会思考 | → 2.x 解读 |
| 2025.05.20 | I/O 2025：Deep Think | 并行假设推理，USAMO 49.4% | 学会思考 | → 2.x 解读 |
| 2025.06.17 | 2.5 Pro / Flash GA | 2M 上下文、思考预算可调 | 学会思考 | → 2.x 解读 |
| 2025.11.18 | **Gemini 3 Pro + Deep Think + Antigravity**（里程碑） | 全面登顶、真实 Agent 能力、6.5 亿 MAU | 真实智能体 | [Gemini-3系列解读.md](./gemini/Gemini-3系列解读.md) |
| 2025.12.16 | Gemini 3 Flash | 混合推理，SWE-bench 78% 反超 Pro | 真实智能体 | → 3 系解读 |
| 2026.02.12 | **Gemini 3.1 Pro** | GPQA 94.3% 公开最高、ARC-AGI-2 77.1% | 真实智能体 | → 3 系解读 |
| 2026.05.19 | I/O 2026：**Gemini 3.5 Flash + Omni + Spark** | 世界模型、个人智能体、9 亿 MAU | 世界模型与个人 AI | → 3 系解读 |
| 2026.07.21 | Gemini 3.6 Flash / 3.5 Flash-Lite | 性价比旗舰；Gemini 4 预训练已启动 | 世界模型与个人 AI | → 3 系解读 |

> 📌 "本地解读"列指向 `gemini/` 文件夹下的配套解读文档（8 篇，清单见附录 D）；"→ X 解读"表示同系列后续节点，引用同一份解读文档。

三个分水岭：**1.0**（原生多模态确立）、**2.0**（Agentic 转向）、**2.5**（思考模型确立）。里程碑：**Gemini 3**（真实世界智能体）。

---

## 二、序章：Alpha 时代——Gemini 诞生的三十年铺垫（2010–2023）

### 1. DeepMind：从伦敦车库到 Google 5 亿美元收购

**2010 年 9 月 23 日**，Demis Hassabis（神经科学家、13 岁国际象棋大师）、Shane Legg 与 Mustafa Suleyman 在伦敦创立 DeepMind，使命是"先解决智能，再解决其他一切"。**2014 年 1 月 26 日**，Google 以约 **5 亿美元**（报道区间 4–6.5 亿）收购 DeepMind，交易含"禁止军事应用"条款。这比 OpenAI 成立（2015 年 12 月）早近两年——**Gemini 的血统源头，是当时地球上最强的一支研究团队**。

### 2. AlphaGo 系：深度学习第一次震动世界

- **2015.10**：AlphaGo 以 5:0 击败欧洲冠军樊麾，首次有程序战胜职业棋手（Nature 论文 2016.01）；
- **2016.03**：首尔五番棋 **4:1 击败李世石**，全球轰动，Google 自此宣布"AI-first"战略；
- **2017.05**：乌镇击败柯洁（0:3），赛后 AlphaGo 宣布退役；
- **2017.10–12**：AlphaGo Zero 摆脱人类棋谱仅靠自对弈；AlphaZero 单一算法通吃围棋/国际象棋/将棋（训练 4 小时超 Stockfish，5000 块 TPU v1 自对弈 + 64 块 TPU v2 训练）。

> 📄 **本地解读**：[AlphaGo系列论文解读.md](./gemini/AlphaGo系列论文解读.md)——含 MCTS 与双网络（策略/价值）细节、AlphaGo Zero 纯自对弈 RL 与 72 小时 100:0 胜 AlphaGo Lee、AlphaZero 三棋通吃的技术路径与训练配置。

### 3. AlphaFold：科学 AI 的顶点

**2018 年 12 月** AlphaFold 首战 CASP13 夺冠；**2020 年 11 月 30 日** AlphaFold2 在 CASP14 中位 **GDT 92.4**，被 CASP 组织方认定"解决 50 年蛋白质折叠难题"，2021 年开源并发布超 2 亿蛋白质结构数据库。Hassabis 与 John Jumper 凭此获 **2024 年诺贝尔化学奖**——这是 Gemini 团队"研究驱动长线主义"的最佳注脚。

> 📄 **本地解读**：[AlphaFold论文解读.md](./gemini/AlphaFold论文解读.md)——含 Evoformer（MSA + 成对表示双向互更新）与结构模块（IPA 等变注意力）架构、CASP14 数据（GDT 92.4、z 分数 244.0 vs 次佳 90.8）、端到端可微与 recycling 设计。

### 4. Google Brain：Transformer 的诞生地

与 DeepMind 平行，Google Brain（2011 年成立）贡献了现代大模型的全部地基：**2017 年发明 Transformer 架构**（论文《Attention Is All You Need》）、TensorFlow、BERT、LaMDA（Bard 早期内核，137B 参数）、Imagen。

> 📄 **本地解读**：[Transformer论文解读.md](./gemini/Transformer论文解读.md)——含自注意力/多头注意力/位置编码设计、WMT14 英德 BLEU 28.4 与英法 41.8、8×P100 训 3.5 天的成本、以及对整个大模型世系的奠基意义。

### 5. 合并：Google DeepMind 成立，Gemini 立项

**2023 年 4 月 20 日**，面对 OpenAI / 微软的 ChatGPT 冲击，Pichai 官宣 Google Brain 与 DeepMind 合并为 **Google DeepMind**：Hassabis 任 CEO，Jeff Dean 转任谷歌首席科学家。新部门第一个重点项目即**原生多模态大模型——Gemini**。

> 📌 两线并流：DeepMind 带来"研究-工程"一体的 RL 与科学 AI 文化，Google Brain 带来 Transformer 与 TPU 基建——Gemini 是两者合并后的第一个孩子。

### 6. 前身模型与 Bard：被 ChatGPT 逼出来的发布节奏

- **PaLM**（2022.04）：540B 参数，基于 Pathways 系统，约 GPT-3 的 3 倍规模；
- **PaLM 2**（2023.05 I/O）：四档尺寸 Gecko/Otter/Bison/Unicorn，覆盖 100+ 语言，接入 25 款谷歌产品；
- **Bard**：2022.11.30 ChatGPT 发布后谷歌内部拉响 **"code red"**；2023.02.06 Bard 官宣（基于 LaMDA）；2 月 8 日巴黎演示配图翻车致 Alphabet 股价单日跌 7.4%（市值蒸发约千亿美元）；3 月 21 日英美公测；4 月内核换 PaLM；5 月 I/O 升级 PaLM 2 并向 180+ 国家开放；7 月支持中文；**2023.12.06 Bard 换用 Gemini Pro**（发布以来最大升级）。

> 📄 **本地解读**：[PaLM系列论文解读.md](./gemini/PaLM系列论文解读.md)——含 PaLM 540B 的 Pathways 训练与涌现现象（GSM8K CoT 58% → 自一致性 74%）、PaLM 2 的 compute-optimal 缩放与四档尺寸、Med-PaLM 2 首个通过 USMLE 专家级。

> ⚠️ 口径修正：Bard 正式更名 Gemini 是 **2024 年 2 月 8 日**（同日上线 Gemini Advanced / Ultra 1.0），2023 年 12 月 6 日只是 Bard 换用 Gemini Pro 内核。

---

## 三、阶段一：诞生——Gemini 1.0，原生多模态（2023.12）

### 1. Gemini 1.0：首个原生多模态模型

**2023 年 12 月 6 日**，Pichai 官宣 Gemini 1.0，定位"迄今规模最大、能力最强的通用模型"。

> 📄 技术报告：*Gemini: A Family of Highly Capable Multimodal Models* | arXiv:2312.11805（2023-12）

**核心创新：原生多模态（natively multimodal）**——从零开始同时预训练文本、代码、音频、图像、视频**五种模态**，区别于 GPT-4V 那种"视觉编码器 + 语言模型拼接"的路线，无需 OCR 即可端到端理解图像。

**三档尺寸**：
- **Gemini Ultra**：最强，面向高度复杂任务；
- **Gemini Pro**：多任务通用主力，即日驱动 Bard；
- **Gemini Nano**：端侧模型，**Nano-1（1.8B 参数）/ Nano-2（3.25B）**，预装 Pixel 8 Pro。

**关键成绩**：
- **MMLU 90.0%（CoT@32）**——首个超过人类专家（89.8%）的模型，GPT-4 为 86.4%；
- 32 项学术基准中 **30 项超过当前 SOTA**（Hassabis 口径"30/32 领先 GPT-4"）；
- 多模态评测全面超 GPT-4V，MMMU 59.4%；HumanEval 74.4%。

**算力与规模**：基于 TPU v4 与 v5e 大规模预训练，同日发布更强加速器 **TPU v5p**；上下文窗口 32K。参数量官方未公布，SemiAnalysis 等 2023 年 11 月报道估计 Ultra 约 1.8 万亿参数（MoE），**未经证实，仅作传闻**。

**争议**：官方演示视频被质疑剪辑，DeepMind 研究副总裁 Oriol Vinyals 承认"视频真实但为演示而缩短"。

> 📄 **本地解读**：[Gemini-1.0论文解读.md](./gemini/Gemini-1.0论文解读.md)——含五模态联合预训练的技术主张、多模态编码器与时序整合细节、goodput >97% 的工程数据、与 GPT-4/GPT-4V 全项对比表、演示视频争议与参数量传闻的考证。

### 2. Bard 更名 Gemini（2024.02.08）

2024 年 2 月 8 日，Bard 正式更名 **Gemini**，推出 Android App 与 iOS 版，上线 **Gemini Advanced（Ultra 1.0）**，并入 Google One AI Premium 订阅（**$19.99/月**）。Gemini 从一个"模型名"正式成为"产品线"。

---

## 四、阶段二：长上下文革命——Gemini 1.5（2024.02–2024.09）

### 1. Gemini 1.5 Pro：1M 上下文与 MoE

**2024 年 2 月 15 日**发布 Gemini 1.5 Pro，两个颠覆：

- **百万级上下文（1M token）**——标准版 128K，预览版 1M，可一次处理约 1 小时视频、11 小时音频、70 万字文本；
- **MoE 混合专家架构**——按需激活专家通路，性能接近 1.0 Ultra 但计算成本更低。**这标志着 Gemini 从"大而全"转向"稀疏高效"**，与 DeepSeek-V2 的 MLA+MoE 几乎同期确立稀疏化路线。

### 2. I/O 2024：1.5 Flash 与 2M 预告（2024.05.14）

- **1.5 Flash**：通过**蒸馏 1.5 Pro 知识**而来的轻量版，同享 1M 上下文，主打低延迟高吞吐（一次分析 1500 页文档 / 3 万行代码）；
- 1.5 Pro 增强翻译/编码/推理/原生音频理解，预告 **2M token 上下文**（waitlist 预览）；
- 产品侧上线 Gems 定制助手、Gemini Live 语音对话。

### 3. 生产级更新与降价（2024.09.24）

1.5 Pro / Flash 升级为生产级模型（-002 版）：MMLU-Pro +7%、MATH/HiddenMath +20%；**API 降价：输入 −64%、输出 −52%**；发布轻量版 **1.5 Flash-8B**；输出提速 2 倍、延迟降 3 倍。

> 📌 口径说明：1.5 的 GA 是 **2024-05-30**；2024-09-24 是"-002"大版本更新（含降价与 Flash-8B），二者勿混。

> 📄 **本地解读**：[Gemini-1.5论文解读.md](./gemini/Gemini-1.5论文解读.md)——含 MoE 稀疏架构、1M/2M 上下文的实现与大海捞针评测（文本 1M 召回 >99.7%、11 小时音频 100%、3 小时视频 100%）、1.5 Flash 蒸馏路线、Kalamang 语言上下文学习达人类水平等细节。

---

## 五、阶段三：Agentic 时代——Gemini 2.0（2024.12–2025.02）

### 1. Gemini 2.0 Flash：Agentic 时代宣言（2024.12.11）

Google 官宣"**the agentic era**"（智能体时代）。2.0 Flash 实验版带来：

- **原生多模态输出**：原生图像生成 + 原生音频输出（TTS）；
- **原生工具调用**：Google 搜索、代码执行、第三方函数调用，无需提示词工程拼装；
- 速度约为 1.5 Pro 的 2 倍且关键基准反超；
- 同日发布 **Multimodal Live API**（实时音视频流输入），Gemini Advanced 上线 **Deep Research**（自主研究 Agent）；
- 基于 100% 自研 **Trillium（第六代 TPU）** 训练与推理——"模型-系统-硬件"三位一体至此闭环。

同期发布三个 Agent 原型：**Jules**（GitHub 原生集成、自动开 PR 的编程 Agent）、**Project Mariner**（浏览器 Agent，WebVoyager 83.5%，购物等敏感操作需确认）、**Project Astra**（实时多模态通用 Agent，10 分钟会话记忆，原型智能眼镜测试）。

> 📄 **本地解读**：[Gemini-2.x系列解读.md](./gemini/Gemini-2.x系列解读.md)——含 2.0 的原生工具调用/多模态输出/Trillium TPU、Jules/Mariner/Astra 三大 Agent 原型细节，以及 2.5 的思考模型转向、可调思考预算与 Deep Think 并行假设推理（USAMO 49.4%）。

### 2. 2.0 全家族（2025.02.05）

- **2.0 Flash GA**：$0.10/M 输入；
- **2.0 Pro（实验版）**：迄今最强编码/复杂指令能力，**2M token 上下文**——一次可处理《哈利·波特》全 7 册；
- **2.0 Flash-Lite**：最性价比模型，$0.075/M 输入（缓存后 $0.01875），质量优于 1.5 Flash。

---

## 六、阶段四：学会思考——Gemini 2.5（2025.03–2025.09）

### 1. Gemini 2.5 Pro：首个思考模型（2025.03.25）

**LMArena（Chatbot Arena）登顶 #1**——首款登顶的 Google 模型，约领先 40 ELO。关键成绩：SWE-Bench Verified 63.8%、GPQA Diamond 84%、AIME 2025 86.7%、MMMU 81.7%、MRCR 1M 上下文 83.1%。

**核心转向："thinking model"**——回答问题前先内部推理。这改变了 Gemini 长期"快但不深"的定位，也开启了与 OpenAI o 系列 / DeepSeek R1 的推理竞赛。

### 2. 混合推理与 Deep Think（2025.04–2025.08）

- **2025.04.17 | 2.5 Flash**：首个**可切换思考预算**的混合推理模型——同一模型可快可深，由用户/调用方控制思考量；
- **2025.05.20（I/O 2025）| 2.5 Pro Deep Think**：**并行假设推理**（同时探索多假设再收敛）：2025 USAMO 数学 49.4%、LiveCodeBench 80.4%、MMMU 84.0%；WebDev Arena ELO 1415 登顶；
- **2025.06.17 | 2.5 Pro / Flash GA**：上下文扩至 **2M**、思考预算可调、原生音频输出；定价 $1.25/$10（超长上下文 $2.50/$15）；
- **2025.08.01 | 2.5 Deep Think（AI Ultra）**：并行推理正式产品化，USAMO、LiveCodeBench 领先。

> 📌 2.5 系列的完整形态：**思考模型（默认）+ 思考预算可调（Flash）+ Deep Think（并行推理扩展）**——"深度与速度解耦"的设计从此固定，成为 3 系混合推理的雏形。

> 📄 **本地解读**：[Gemini-2.x系列解读.md](./gemini/Gemini-2.x系列解读.md)——2.5 Pro 的 LMArena 登顶（约 1370 Elo、领先约 40）、SWE-Bench Verified 63.8%、GPQA Diamond 84% 等成绩，以及 2.5 全系的定价与 2M 上下文规格。

---

## 七、阶段五：真实智能体——Gemini 3（2025.11–2026.02）

### 1. Gemini 3 Pro：全面登顶（2025.11.18）

距 2.5 代仅 8 个月，Google 发布 **Gemini 3 Pro + Deep Think 模式 + Antigravity 平台**。官方口径：原生多模态、**1M token 上下文 / 64K 输出**、TPU v5p 训练、稀疏 MoE（参数量未公开，据泄露模型卡）。

**基准全面登顶（2025.11 时点）**：
- **LMArena 1501 Elo 登顶**；
- Humanity's Last Exam（无工具）**37.5%**（破 GPT-5 Pro 的 31.64 纪录）；
- GPQA Diamond **91.9%**；SimpleQA Verified **72.1%**；ARC-AGI-2 破纪录；
- SWE-bench Verified **76.2%**（较 2.5 Pro 大幅提升）；Terminal-Bench 2.0 54.2%；WebDev Arena 1487 Elo。

**生态数据（皮查伊发布）**：AI Overviews 月活 **20 亿**；Gemini App 月活 **6.5 亿**；开发者 1300 万；Alphabet Q3 营收 1023.46 亿美元（+16%）。API 定价：输入 $2.00 / 输出 $12.00（超 200k token 后 $4.00/$18.00）。

**竞争态势**：全面压制 GPT-5.1 与 Claude Sonnet 4.5；Anthropic 当天下宣布与英伟达、微软结盟；奥特曼评价"看起来很不错"。

> ⚠️ 口径修正：2025-11-18 首发旗舰是 **Gemini 3 Pro**（Gemini 3 Flash 系 12 月中旬补发）；3 Pro 发布时上下文为 1M，"2M"是后续 3.1 Pro（Vertex 企业版）与 3.5 Pro 的规格。

### 2. Gemini 3 Deep Think：并行推理登顶（2025.12.04）

向 AI Ultra 订阅（$249.99/月）开放，非独立模型，是 3 Pro 的**推理时扩展模式**：HLE **41.0%**、GPQA Diamond **93.8%**、ARC-AGI-2 **45.1%**（ARC Prize 验证，"空前"）。基于获 IMO/ICPC 金牌的 2.5 Deep Think 增强版。2026.02.12 再发重大升级。

### 3. Gemini 3 Flash：混合推理主力（2025.12.16–17）

发布并成为 Gemini App 默认模型（替换 2.5 Flash）：**混合推理**、思考量可调，日常任务 token 比 2.5 Pro 少 30%；GPQA Diamond 90.4%、HLE 33.7%、**SWE-bench 78%（反超 3 Pro）**；速度比 2.5 Pro 快 3 倍；定价输入 $0.50 / 输出 $3.00；发布时 API 日处理量已破 **1 万亿 token**；同时成为搜索 AI Mode 默认模型。

### 4. Gemini 3.1 Pro：首个 ".1" 增量（2026.02.12–19）

首次采用 ".1" 增量命名（2.12 应用内上线、2.19 官方发布）：**GPQA 94.3%（无工具，公开最高）**、HLE 44.4%（带工具 51.4%）、**ARC-AGI-2 77.1%（3 Pro 的两倍多）**、SWE-bench 80.6%、LiveCodeBench Pro 2887；1M 上下文（Vertex 企业版 2M）、输出 66K；定价维持 $2/$12；LMArena 约 1501 Elo。

> 📄 **本地解读**：[Gemini-3系列解读.md](./gemini/Gemini-3系列解读.md)——含 3 Pro 的"真实 Agent 能力"与 Antigravity 平台、3 Deep Think 的并行推理登顶（HLE 41%、ARC-AGI-2 45.1%）、3 Flash 混合推理反超 Pro（SWE-bench 78%）、3.1/3.5/3.6 系列迭代，以及附带的 Gemma 开源线速览。

---

## 八、阶段六：世界模型与个人 AI——Gemini 3.5 / 3.6（2026.05–2026.08）

### 1. Google I/O 2026：3.5 Flash、Omni、Spark（2026.05.19）

- **Gemini 3.5 Flash 首发**：输出速度较其他前沿模型快 **4 倍**；基准全面超 3.1 Pro（Terminal-Bench 2.1 76.2%、GDPval-AA 1656 Elo、MCP Atlas 83.6%、CharXiv 84.2%）；定价 $1.50/$9.00；成为 Gemini App 与搜索 AI Mode 全球默认模型；
- **Gemini Omni Flash（世界模型）**：任意输入→任意输出，首攻视频生成（含数字化身，SynthID 水印）——多模态主线走到尽头；
- **Gemini Spark（个人智能体）**：24/7 云端个人代理，接入 Gmail/Docs 及 30+ 三方工具——Agent 主线产品化；
- **Daily Brief** 个性化简报。

**I/O 数据**：平台月处理 **3200 万亿 token**（同比 ×7）；Gemini App 月活 **超 9 亿**（一年前 4 亿）；AI Overviews 月活 25 亿；开发者 850 万+；API 每分钟 190 亿 token；订阅改为 $99 新 Ultra 档 + $250→$200/月。

### 2. Gemini 3.5 Pro 跳票与 3.6 Flash（2026.06–07）

- **3.5 Pro**（2M 上下文 + Deep Think，Ultra 专属）原预期 6 月发布，因编码性能不达标**推迟**，6 月底重置训练数据仍不如预期，截至 7 月下旬仅限企业与政府伙伴测试；
- **2026.07.21 | Gemini 3.6 Flash + 3.5 Flash-Lite**：3.6 Flash 定价 $1.50/$7.50，输出 token 省 17%（DeepSWE 最高省 65%），DeepSWE 37→49%、MLE-Bench 49.7→63.9%、OSWorld 78.4→83%；Flash-Lite 定价 $0.30/$2.50、**350 token/s**，3.5 家族最快最便宜；
- **Gemini 4 预训练已启动**。

**Q2 2026 财报（7 月）**：Gemini App 月活 **9.5 亿**、日活同比 ×3；开发者 900 万+；API 每分钟 220 亿 token；Antigravity 周活 240 万；Ask YouTube 单月 1.4 亿用户；单季资本开支 449 亿美元（+100%）。

**落地场景**：车载（沃尔沃 EX60 语音控车）、智能眼镜（三星/Gentle Monster/Warby Parker，纯音频款 2026 晚些、带屏款 2027）、Android XR、Workspace/Gmail、Google Maps Ask Maps、搜索 25 年来最大改版（Search Agent）。

---

## 九、三条技术主线

### 主线一：原生多模态——从拼接走向统一

> 拼接式（PaLM 时代）→ 原生统一预训练（1.0，五模态）→ 原生音频理解（1.5）→ 原生图像+音频输出（2.0）→ 视频生成与化身（Omni）→ 任意输入→任意输出世界模型（3.5 Omni）

- 1.0 确立"原生"路线：从零联合训练，而非事后拼接编码器；
- 1.5 补原生音频理解；2.0 首次实现多模态**输出**（TTS + 图像生成）；
- 2026 年 Omni Flash 把多模态推到"任意输入→任意输出"，并叠加世界模型叙事。

### 主线二：推理能力——从快到深，再到"可调"

> 快速响应（1.0–2.0）→ 思考模型（2.5 Pro）→ 思考预算可调（2.5 Flash）→ 并行假设推理（2.5 Pro Deep Think）→ 深度推理扩展（3 Deep Think，HLE 41%）→ 混合推理（3 Flash / 3.5 Flash）

- 2.5 是关键转向：默认"先想后答"；
- 思考深度与速度的解耦（可调预算 + 独立 Deep Think 模式）是 Gemini 区别于竞品的差异化设计；
- 数据佐证：USAMO 49.4%（2.5 DT）→ ARC-AGI-2 45.1%（3 DT）→ 77.1%（3.1 Pro）。

### 主线三：Agent 能力——从聊天到真实世界

> 聊天（Bard）→ 原生工具调用（2.0）→ 专用 Agent（Jules / Mariner / Astra / Deep Research）→ 通用智能体平台（3 + Antigravity）→ 个人智能体（Spark）

- 2.0 宣言"Agentic 时代"，Native tool use 是地基；
- 3 系首次把"Agent 能力"作为卖点中心（自动执行任务、Antigravity 工作流）；
- 2026 年 Spark 将 Agent 产品化为"24/7 个人助理"，接入 30+ 三方工具。

---

## 十、Gemini 方法论（四条原则）

1. **研究驱动的长线主义**——从 AlphaGo 到 AlphaFold 再到 Gemini，十年不换主线的持续投入，科学成就是品牌与技术自信的来源（2024 诺奖）；
2. **原生多模态优于拼接**——相信模态是统一计算原语，从零联合预训练五模态，而非事后拼接（1.0 起坚持至今）；
3. **模型-系统-硬件三位一体**——TPU（v4/v5e/v5p/Trillium）自研、模型与推理栈同研，Gemini 的每次登顶都建立在自研算力底座上；
4. **思考与效率的平衡**——同一家族内用"思考模型 + 可调预算 + Deep Think + Flash 轻量线"覆盖从毫秒级响应到数分钟深度推理的全部场景，而非只赌一头。

对比 DeepSeek 的四条（效率至上、解耦优于统一、涌现优于监督、系统思维）：两家都强调"系统思维"，但 DeepSeek 押注"参数效率"（MLA/稀疏注意力），Gemini 押注"原生多模态 + 生态嵌入"（搜索/Workspace/Android/云）；DeepSeek 靠论文与开源建立信任，Gemini 靠产品规模与基准霸权。

---

## 附录 A：参考来源

**官方**
1. Google 官方博客《Introducing Gemini》（2023-12-06）：https://blog.google/technology/ai/google-gemini-ai/
2. Gemini 1.0 技术报告：https://storage.googleapis.com/deepmind-media/gemini/gemini_1_report.pdf
3. Google 官方博客《Bard becomes Gemini》（2024-02-08）：https://blog.google/products/gemini/bard-gemini-advanced-app/
4. Google 官方博客《Our next-generation model: Gemini 1.5》（2024-02-15）：https://blog.google/technology/ai/google-gemini-next-generation-model-february-2024/
5. Google 官方博客《Introducing Gemini 2.0: our new AI model for the agentic era》（2024-12-11）：https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/
6. Google 官方博客《Gemini 2.5: Our most intelligent AI model》（2025-03-25）：https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-thinking-updates-march-2025/
7. Google 官方博客《Gemini 2.5 updates at I/O 2025》：https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-updates-io-2025/
8. Google 官方博客《Gemini 3 Deep Think》：https://blog.google/products/gemini/gemini-3-deep-think/
9. Google 官方博客《Gemini 3 Flash》（中文）：https://blog.google/intl/zh-tw/products/explore-get-answers/gemini-3-flash
10. Google I/O 2026 开发者要点：https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights
11. Gemini 3.6 Flash 模型卡（DeepMind）：https://deepmind.google/models/model-cards/gemini-3-6-flash/
12. DeepMind《AlphaZero》：https://deepmind.google/discover/blog/alphazero-shedding-new-light-on-chess-shogi-and-go/
13. Google 官方博客《Gemma: Introducing new state-of-the-art open models》（2024-02-21）：https://blog.google/technology/developers/gemma-open-models/

**媒体/第三方**
14. 澎湃新闻《Gemini 3 发布报道》：https://m.thepaper.cn/newsDetail_forward_31999393
15. 新华网《谷歌发布 Gemini 3》：https://www.news.cn/tech/20251120/fe871e40a8ae4865b25ed101802d0071/c.html
16. TechCrunch《Google consolidates AI research divisions into Google DeepMind》：https://techcrunch.com/2023/04/20/google-consolidates-ai-research-divisions-into-google-deepmind
17. Wikipedia《DeepMind》：https://en.wikipedia.org/wiki/DeepMind
18. Wikipedia《Gemini (chatbot)》：https://en.wikipedia.org/wiki/Gemini_(chatbot)
19. EBI《AlphaFold2 验证》：https://www.ebi.ac.uk/training/online/courses/alphafold/validation-and-impact/how-have-alphafolds-predictions-of-protein-structure-been-validated
20. Ars Technica《Gemini 2.5 Pro GA / Flash-Lite》（2025-06-17）：https://arstechnica.com/ai/2025/06/googles-gemini-ai-family-updated-with-stable-2-5-pro-super-efficient-2-5-flash-lite/
21. Hidekazu Konishi《Google Gemini Model Release Timeline》（完整时间线交叉核对）：https://hidekazu-konishi.com/entry/google_gemini_model_release_timeline.html
22. nowosci.ai《3.6 Flash 发布（3.5 Pro 推迟、Gemini 4 预训练）》：https://www.nowosci.ai/en/article/google-launches-gemini-3-6-flash-3-5-flash-lite

## 附录 B：完整时间线（速览）

2010.09 DeepMind 成立 → 2014.01 Google 收购 → 2016.03 AlphaGo 胜李世石 → 2017.06 Transformer → 2018.12 AlphaFold CASP13 → 2020.11 AlphaFold2 → 2022.04 PaLM → 2023.02 Bard → 2023.04 合并 Google DeepMind → 2023.12.06 **Gemini 1.0** → 2024.02.08 Bard 更名 Gemini / Ultra → 2024.02.15 **1.5 Pro（1M）** → 2024.05.14 I/O（1.5 Flash、2M 预告）→ 2024.09.24 1.5 生产级更新 → 2024.12.11 **2.0 Flash（Agentic）** → 2025.02.05 2.0 Pro/Flash-Lite → 2025.03.25 **2.5 Pro（思考模型、LMArena 登顶）** → 2025.05.20 I/O（Deep Think）→ 2025.06.17 2.5 GA（2M）→ 2025.11.18 **Gemini 3 Pro** → 2025.12.04 3 Deep Think → 2025.12.16 3 Flash → 2026.02.12 **3.1 Pro** → 2026.05.19 **I/O 2026（3.5 Flash / Omni / Spark）** → 2026.07.21 3.6 Flash / 3.5 Flash-Lite → **Gemini 4 预训练中**

## 附录 C：修正与口径说明

1. **Bard 更名时间**：常见误传为 2023.12，实为 **2024-02-08**；2023-12-06 仅是 Bard 换用 Gemini Pro 内核。
2. **Gemini 3 首发阵容**：2025-11-18 首发旗舰是 **3 Pro**（非 Flash）；3 Flash 2025-12-16 发布。
3. **上下文规格**：3 Pro 发布时 1M；"2M"属 3.1 Pro（Vertex 企业版）与 3.5 Pro。
4. **参数规模**：Ultra/3 系参数量官方均未公布；1.8 万亿参数（Ultra）为 SemiAnalysis 传闻；3 系 MoE 据泄露模型卡，均未证实。
5. **1.5 GA 与 -002**：GA 为 2024-05-30；2024-09-24 为 -002 大版本更新（含降价 64%/52%、Flash-8B）。
6. **基准口径**：文中基准分数均为对应发布时间点的官方/第三方评测值，随模型更新会变动，引用时需注明时点。

## 附录 D：本地文件清单与论文/版本映射

本地 `gemini/` 文件夹共 8 个配套解读文档。以下为解读文件与论文/版本的对应关系（论文编号以官方/arXiv 为准）：

| 本地解读文件 | 对应论文/版本 | arXiv/发布 |
|---|---|---|
| [AlphaGo系列论文解读.md](./gemini/AlphaGo系列论文解读.md) | AlphaGo / AlphaGo Zero / AlphaZero（三篇合一） | Nature 2016 / Nature 2017 / 1712.01815 |
| [AlphaFold论文解读.md](./gemini/AlphaFold论文解读.md) | AlphaFold / AlphaFold2 | Nature 2020 / Nature 2021 |
| [Transformer论文解读.md](./gemini/Transformer论文解读.md) | Attention Is All You Need | 1706.03762 |
| [PaLM系列论文解读.md](./gemini/PaLM系列论文解读.md) | PaLM / PaLM 2（两篇合一） | 2204.02311 / 2305.10403 |
| [Gemini-1.0论文解读.md](./gemini/Gemini-1.0论文解读.md) | Gemini 1.0 技术报告 | 2312.11805 |
| [Gemini-1.5论文解读.md](./gemini/Gemini-1.5论文解读.md) | Gemini 1.5 技术报告 | 2403.05530 |
| [Gemini-2.x系列解读.md](./gemini/Gemini-2.x系列解读.md) | Gemini 2.0 / 2.5 全系（无正式论文） | 官方博客与模型卡 |
| [Gemini-3系列解读.md](./gemini/Gemini-3系列解读.md) | Gemini 3 / 3.1 / 3.5 / 3.6（无正式论文） | 官方博客与模型卡 |

说明：
1. **Gemini 2.x 与 3 系无正式技术论文**，解读文档在引用块中明确标注"依据官方博客、模型卡与技术发布"，本文相关节点引用同一份系列解读。
2. **未纳入独立解读的节点**：Bard（产品，无独立论文，其技术前身 PaLM/LaMDA 已在相关解读中覆盖）、Gemma 开源线（在 Gemini-3系列解读.md 末尾以"速览"形式附述）、Gemini Nano 端侧模型（在 Gemini-1.0论文解读.md 中覆盖）。
3. **数字口径**：解读文档与本文（含附录 C 的修正口径）保持一致；个别基准（如 Gemini 1.5 的 GPQA 59.1%）在解读中注明采用第三方聚合口径。
