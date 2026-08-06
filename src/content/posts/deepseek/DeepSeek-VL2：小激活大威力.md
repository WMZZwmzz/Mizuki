---
title: "DeepSeek-VL2：小激活大威力"
published: "2026-07-09"
category: "deepseek"
lang: "zh"
draft: false
tags: ["多模态", "视觉", "MoE"]
---

# DeepSeek-VL2 论文解读：MoE 加动态分块，小激活参数干翻大稠密模型

> 论文：*DeepSeek-VL2: Mixture-of-Experts Vision-Language Models for Advanced Multimodal Understanding*
> 作者：Zhiyu Wu、Xiaokang Chen、Zizheng Pan 等，DeepSeek-AI
> 2024 年 12 月。VL 的继任者，两大升级，视觉侧用动态分块策略处理任意宽高比的高清图，语言侧换上了带 MLA 的 DeepSeekMoE（Tiny 除外，它用标准 MHA）。三个型号激活参数只有 1.0B、2.8B、4.5B，但 OCR、文档图表理解全面对标 7B 甚至更大的模型。最出彩的是视觉定位，RefCOCO 系列把专做检测的 Grounding DINO、Florence-2 都超了。

---

## 一、升级点：两个"动"字

VL1 的混合视觉编码器（SigLIP 384 + SAM-B 1024）有个硬伤，固定 1024 分辨率，遇到超宽超高、极端宽高比的图（比如 InfographicVQA 里那种长图）就抓瞎。VL2 换成动态分块。

语言侧，VL1 用的是稠密 DeepSeek-LLM，VL2 换成 DeepSeekMoE 加 MLA（Tiny 除外），KV cache 压进 latent 向量，推理又快吞吐又高。这是把 V2 的架构红利直接搬到多模态上。

## 二、架构：动态分块视觉编码

用一个 SigLIP-SO400M-384 编码器搞定所有分辨率。候选分辨率集合 CR = {(m·384, n·384) | m、n 为正整数，m·n ≤ 9}，对输入图像算缩放到每个候选分辨率需要的填充面积，选填充最少的那个。然后图被切成 m×n 个 384×384 的局部块，外加一个全局缩略图块，全部过同一个视觉编码器。

每个块产出 27×27=729 个 1152 维 embedding，用 2×2 像素重组压缩到 14×14=196 个 token。全局缩略图加 <tile_newline> token 标记行尾，<view_separator> 分隔缩略图和局部块。多图场景（超过 2 张）禁用分块，控制上下文长度。

这套设计的妙处是，图像分辨率线性增长，token 数线性增长，不触发注意力那种平方级爆炸，还能保住局部注意力特征提取的优势。

## 三、数据：重质不重量

**对齐阶段**。ShareGPT4V 120 万条，冻结语言模型，同时训练视觉编码器与 MLP 适配器。

**预训练**。这次比例反过来了，70% 视觉语言数据 + 30% 纯文本（VL1 是 70% 文本），因为 MoE 语言模型底子厚，扛得住。交错图文用 WIT、WikiHow、30% OBELICS，再加中文的 Wanjuan 补多语言。图像描述是重头戏，作者发现公开描述数据集质量参差，有的是密集准确的高级描述，有的就是"短描述、图文不匹配、明显幻觉"，于是搞了个重写管线，用自家 captioner 结合 OCR 提示、元信息（地点、相机参数）和原描述重写，还学 PixelProse 用多变指令引导生成。最后用 DeepSeek Chat 给所有描述按写作质量打分，过滤低质量。

OCR 数据用 LaTeX OCR 加 12M RenderedText 加自家英中文档 OCR 数据。问答数据里加了表格图表文档（PubTabNet、FinTabNet、Docmatix）、网页转代码和图表转 Python（WebSight 加 Jupyter 笔记本，用 V2.5 复刻了一部分 WebSight 并重写 plot-to-code 去噪）、视觉提示问答（在图上叠箭头、方框、圆圈、涂鸦）。

**视觉定位是新能力**。数据格式是 <|ref|>query<|/ref|><|det|>[[x1,y1,x2,y2]]<|/det|>，坐标归一化到 0-999。特意造了负样本，查询的对象不在图里，逼模型学会"没有就是没有"。还有接地对话数据，回答里每个名词短语都带上位置框。

**SFT 阶段**。公开 VQA 数据普遍有"回答太短、OCR 质量差、有幻觉"三个毛病，作者用问题+图像+OCR 信息联合重写答案。Tiny 模型有个中英混排的毛病，加了个中文 QA 数据集治。定位数据翻成中文、加负样本、加跨图同类别定位（参考图里框一个对象，在另一张图里找同类）。推理数据加了详细推理过程但统一格式，还发现小模型要简短回答，详细推理对 Tiny 反而有害。

## 四、训练：三段式，MoE 加载

三个型号都是三阶段，对齐 2.0B token、预训练约 800B token、SFT 约 20B token。预训练用 step 学习率衰减（50% 和 75% 时除以 √10），大模型用 BF16 优化器，专家偏置纠正只在 VL2 上开。训练成本很省，Tiny/Small/VL2 分别在 16/33/42 节点 × 8 张 A100 上跑 7/10/14 天。

工程细节：视觉编码器在流水线并行里做细粒度分层，图像分块负载在不同数据并行 rank 间均衡，纯文本 batch 和图文 batch 用两套流水线策略切换。

## 五、成绩：小参数，大效果

**OCR 与文档理解**（4.5B 激活参数对 8.3B 的 Qwen2-VL-7B）：
- DocVQA 93.3（Qwen2-VL-7B 94.5，Claude-3.5-Sonnet 95.2）
- ChartQA 86.0（Qwen 83.0，GPT-4o 85.7）
- InfoVQA 78.1（Qwen 76.5，GPT-4V 75.1；因极端宽高比，评测时放大候选分辨率至 mn≤18）
- TextVQA 84.2（Qwen 84.3，GPT-4o 77.4）
- OCRBench 811（Qwen 845，Claude 788）

**通用理解**：MMStar 61.3、AI2D 81.4、MMMU 51.1、MME 2253、MMBench 83.1、MMBench-CN 79.6、MMBench-V1.1 79.2、MathVista 62.8、RealWorldQA 68.4。MMBench 上超过 Qwen2-VL-7B 和 InternVL2-8B。

**视觉定位**（这是最亮的）：RefCOCO val 95.1、testA 96.7、testB 92.7；RefCOCO+ 91.2/94.9/87.4；RefCOCOg 92.8/92.9。把专做检测的 Grounding DINO-Large（90.6）、UNINEXT-H（92.6）、Florence-2-L（93.4）全部超过，这是个通用 VLM 干翻专用检测器的标志性结果。

**小型号**。Tiny 1.0B 激活参数，OCRBench 809，比 InternVL2-1B 的 754 高一大截，DocVQA 88.9；Small 2.8B，OCRBench 834，接近 8B 模型。

## 收尾：我的一点看法

VL2 最值得记的一个数字是它的参数效率。4.5B 激活参数，在几乎所有的 OCR 和文档理解基准上追平甚至超过 8B 的 Qwen2-VL-7B，在 MMBench 这类通用基准上也不虚。MoE 加 MLA 的架构红利，在视觉语言领域同样成立，这是 V2 架构跨模态复用的一次成功验证。

动态分块这个设计，我愿称之为"视觉侧的 MLA"——都是用小预算办大事的哲学。固定 token 预算的思路在 VL1 就有了，VL2 把"固定分辨率"进化成"固定候选分辨率集合"，用填充面积最小化做选择，工程上非常干净。后来 DeepSeek-OCR 的切片思路、V4 的 CSA 压缩，都能在这找到血缘。

视觉定位超过专用检测器这件事，含金量被低估了。RefCOCO 系列是检测领域的老基准，Grounding DINO 是专门为定位训练的，VL2 一个通用聊天模型拿下了。它说明一个趋势，通用模型的多模态能力一旦堆够数据，会反超那些窄而专的模型，这跟 R1 蒸馏小模型吊打大模型是同一个故事的两种讲法。

数据工程这块，VL2 展示了 DeepSeek 的一贯作风，重写、打分、过滤、补负样本，一套组合拳下来数据质量拉满。那个"用 DeepSeek Chat 给描述打分"的操作尤其务实，自己训的模型给自己筛数据，零额外成本。

要说不足，OCRBench 811 还是被 Qwen2-VL-7B 的 845 压着，说明 OCR 这个赛道 Qwen 当时确实更强；Tiny 模型的中英混排问题要专门造数据集治，小模型的语言平衡始终是个麻烦。另外论文是技术报告性质，没有系统讲清楚 70% VL 比例为什么可行，跟 VL1 的 70% 文本正好反过来，这个反转的原因值得深挖——我猜是 MoE 语言底座更强，但论文没说透。

---

## 附：核心数据速查

**模型家族**
| 型号 | LLM 总参 | 激活参数 | 视觉编码器 |
|---|---|---|---|
| Tiny | 3B MoE | 1.0B | SigLIP-SO400M-384 |
| Small | 16B MoE | 2.8B | SigLIP-SO400M-384 |
| VL2 | 27B MoE | 4.5B | SigLIP-SO400M-384 |

**动态分块**
- 候选分辨率 CR={(m·384, n·384) | m·n ≤ 9}，选填充最小
- m×n 局部块 + 1 全局缩略图，每块 196 token
- <tile_newline> 行尾标记，<view_separator> 缩略图/局部块分隔
- 多图（>2）禁用分块

**训练**
- 三阶段：对齐 2.0B / 预训练 ~800B（70% VL + 30% 文本）/ SFT ~20B token
- 成本：16/33/42 节点 × 8 A100，7/10/14 天

**VL2（4.5B 激活）关键成绩**
| 基准 | DeepSeek-VL2 | Qwen2-VL-7B | 闭源最强 |
|---|---|---|---|
| DocVQA | 93.3 | 94.5 | Claude 95.2 |
| ChartQA | 86.0 | 83.0 | Claude 90.8 |
| InfoVQA | 78.1 | 76.5 | Gemini 80.1 |
| TextVQA | 84.2 | 84.3 | Gemini 78.7 |
| OCRBench | 811 | 845 | Claude 788 |
| MMBench | 83.1 | 83.0 | GPT-4o 83.4 |
| MathVista | 62.8 | 58.2 | Claude 67.7 |

**视觉定位（RefCOCO val / testA / testB）**
- DeepSeek-VL2：95.1 / 96.7 / 92.7（超 Grounding DINO-Large 90.6、UNINEXT-H 92.6、Florence-2-L 93.4）

**关键概念清单**
- MoE = Mixture of Experts，专家混合
- MLA = Multi-head Latent Attention，多头潜在注意力
- dynamic tiling = 动态分块（任意宽高比高清图）
- SigLIP-SO400M = 视觉编码器
- VL adaptor = 视觉语言适配器
- visual grounding = 视觉定位（<ref>/<det> 特殊 token）
- grounded conversation = 接地对话（名词带定位框）
- in-context grounding = 跨图同类别定位
- negative samples = 负样本（查询对象不存在）
- RefCOCO / RefCOCO+ / RefCOCOg = 指代表达定位基准
- OCRBench / DocVQA / ChartQA / InfoVQA / TextVQA = OCR 与文档理解基准
- MMBench / MMMU / MMStar / MathVista / MME / AI2D = 多模态通用理解基准
