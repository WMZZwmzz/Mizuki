---
title: "PaLM：540B 越大越强"
published: "2026-07-21"
category: "gemini"
lang: "zh"
draft: false
tags: ["预训练", "架构", "CoT"]
---

# PaLM 系列论文解读：5400 亿参数证明"越大越强"，替 Gemini 探好了路

> 系列：PaLM（*PaLM: Scaling Language Modeling with Pathways*，arXiv:2204.02311，2022.04）→ PaLM 2（*PaLM 2 Technical Report*，arXiv:2305.10403，2023.05）
> 作者：Google（Google Research / Google Brain 联合；PaLM 为 Chowdhery、Narang 领衔，PaLM 2 为 Anil 等）
> 一句话定位：PaLM 把密集 Transformer 一路推到 5400 亿参数，用 Pathwass 系统打通"一机多 pod"的工程天花板，验证了"越大越强"和能力的涌现；PaLM 2 再按 compute-optimal 缩放收敛到"小而强"，把多语言和推理拉满。两篇合起来，正是 Gemini 出生前 Google 全部的家底。

---

## 第一篇 PaLM：5400 亿参数的规模宣言

> 论文：*PaLM: Scaling Language Modeling with Pathways*
> 作者：Aakanksha Chowdhery、Sharan Narang 等（Google）
> 2022 年 4 月。GPT-3 之后，Google 终于拿出一张 540B 的牌：稠密激活、decoder-only，靠 Pathways 系统横跨两个 TPU v4 Pod 训练，在 BIG-bench 上超过人类平均水平，GSM8K 用思维链冲到 58%。它是"预训练 + 规模 + 涌现"三件套集大成的一作。

### 一、引言：GPT-3 之后，Google 需要自己的答案

2020 年 GPT-3 用 1750 亿参数证明了 few-shot（少样本）学习的威力，2021 年 Google 自家的 GLaM、LaMDA 和 DeepMind 的 Gopher 在追赶，但所有人的路都被同一个工程问题堵死：**模型大到单个加速器集群装不下时，怎么把多个集群"缝"在一起高效训练？**

Google 的答案是 2021 年提出的 Pathways 系统——一个跨数千甚至上万块芯片训练单一模型的新架构。PaLM（Pathways Language Model）就是这条路的第一块试金石：**5400 亿参数的稠密激活 decoder-only 模型**。

### 二、Pathways：让 6144 块 TPU 干同一件事

Pathways 解决的正是当年最难的问题——跨集群训练。

- **6144 块 TPU v4 芯片**，即**两个 TPU v4 Pod**。PaLM 是当时用 TPU 训练的最大系统配置。
- 并行策略：**Pod 之间做数据并行**，Pod 内部再做标准的数据并行 + 模型并行；不靠当时主流的流水线并行（pipeline parallelism）撑规模。对比一下：Gopher 用了最多 4096 块 TPU v3，Megatron-Turing NLG 用流水线并行撑到 2240 块 A100，而 PaLM 直接在 6144 块 TPU v4 上无流水线扩展。
- 训练效率：**模型 FLOPs 利用率（MFU）46.2%、硬件 FLOPs 利用率 57.8%**——这是当时同规模 LLM 里最高的硬件利用率纪录。（注意：常被引用的"60%+"其实是以硬件峰值性能为分母的 57.8%，接近六成，别记成 60% 整。）
- 两个提速细节：重排 Transformer block，让注意力层和前馈层**并行计算**；配合 TPU 编译器优化，把计算重叠起来吃满硬件。
- 成本：约等于 6144 块 TPU v4 跑 1368 小时，官方云博客口径约 50 天。

### 三、架构与数据：稠密 decoder-only，780B token

- 架构：**decoder-only**，沿用 GPT-3 的整体路数，但用上并行 block 和**多查询注意力（MQA）**——多个查询头共享一组键值，省 KV cache、加速推理。
- 数据：**780B token** 预训练语料，78% 英语、**22% 非英语**；来源包括网页文档、书籍、Wikipedia、对话、GitHub 代码。
- 词汇表：**"无损"词汇表**——保留空白符（对代码尤其重要）、把词表外的 Unicode 字符拆成字节、把数字逐位拆成独立 token。作者认为"数字逐位拆分"是 PaLM 数学推理强的一个隐形功臣。
- 一个反直觉的点：预训练数据里**代码只占约 5%**，但 PaLM 的代码能力依然顶尖。

### 四、评估成绩：涌现、推理与代码三连击

**少样本全面领先。** 在 29 个常用英语 NLP 任务里，PaLM 540B 在**其中 28 个**上超过此前所有大模型（GPT-3、Gopher、Chinchilla、GLaM、MT-NLG、LaMDA）的 few-shot 成绩；MMLU 5-shot **69.3**，超过 Chinchilla 70B 的 67.5。

**涌现：能力随规模跳跃式出现。** 在 BIG-bench（150+ 个新任务的大套件）上，PaLM 540B 5-shot 的平均表现**超过了人类平均水平（人类平均约 47）**。更关键的是那个"涌现"现象：在 58 个共同子任务上，性能总体随规模对数线性增长，但**约四分之一的子任务从 62B 跳到 540B 时出现 >10 个百分点的阶梯式跃升**——小模型几乎不会、大模型突然就会，比如区分因果、从 emoji 猜电影这类能力。这正是"越大越强"最生动的一张证据图。

**推理：思维链加规模，双剑合璧。** PaLM 540B 用 8-shot 思维链（chain-of-thought，CoT，让模型先把推理过程写出来再给答案）+ 外部计算器，在 GSM8K（小学数学应用题集）上拿到 **58%**，一举超过此前 SOTA——GPT-3 微调 + 计算器 + verifier 的 55%。在此基础上再加**自一致性（self-consistency，多条推理路径投票）**，可推到 **74%**。在 7 个推理数据集上，540B + CoT 拿下 4 个 SOTA。

**代码。** HumanEval pass@1 约 **26.2%**（pass@100 76.2%），few-shot 性能几乎追平专门微调过的 Codex 12B，而训练用的 Python 代码量只有它的约 1/50。

**多语言。** 尽管非英语语料只占 22%，PaLM 在翻译、摘要、问答等多语言任务上依然逼近或超过微调 SOTA。

### 五、局限与讨论

作者专门做了偏见与毒性分析：模型随规模增大毒性上升，存在刻板印象风险（如对穆斯林的负面联想）；记忆率随规模上升，但整体仍可控（对 50-token 训练片段精确匹配率约 2.4%）。论文还坦率地讨论了数据污染、伦理与缓解策略，并附了 data card 和 model card。此外，**权重未开源**、训练成本极高，也是它作为"研究模型"的两道门槛。

### 收尾：我的一点看法

PaLM 在 Gemini 家谱里的位置是"承前启后"：前面接着 GPT-3 的规模信仰，后面直接通向 Gemini。它第一次用几近饱和的硬件利用率证明了**"只要系统跟得上，模型还能更大"**——Pathways 把"多 pod 高效协同"这个工程硬骨头啃下来了，这正是后来 Gemini 训练所依赖的基础设施能力。

它的科学贡献集中在两点：一是**涌现的量化证据**，BIG-bench 上"突然会了"的任务清单，让"scaling 到底有没有尽头"的争论第一次有了正面数据；二是**推理 + 思维链的组合拳**，GSM8K 58% 那条曲线直接启发了后来 PaLM 2、GPT-4 的推理路线。放到 Gemini 叙事里：PaLM 是"祖辈"，Gemini 是"孙辈"，中间那代叫 PaLM 2。

### 附：核心数据速查

**PaLM 基本盘**
| 项目 | 数值 |
|---|---|
| 参数量 | 540B（稠密激活） |
| 架构 | decoder-only Transformer |
| 训练硬件 | 6144 块 TPU v4（两个 Pod） |
| 训练效率 | MFU 46.2% / 硬件 FLOPs 利用率 57.8% |
| 预训练数据 | 780B token（78% 英语，22% 非英语） |
| 训练成本 | ≈6144 TPU v4 跑 1368 小时（约 50 天） |

**关键 benchmark**
| 指标 | PaLM 540B | 备注 |
|---|---|---|
| 29 个英语任务 | 28 个 few-shot SOTA | 超过 GPT-3 / Gopher 等 |
| MMLU (5-shot) | 69.3 | Chinchilla 70B 为 67.5 |
| BIG-bench (5-shot) | 超过人类平均 | 58 个子任务中约 1/4 出现涌现 |
| GSM8K | CoT+计算器 58% → 自一致性 74% | 前 SOTA 55%（GPT-3 微调+verifier） |
| HumanEval pass@1 | 约 26.2% | 接近微调 Codex 12B |

**关键概念清单**
- Pathways = Google 的跨芯片/跨 pod 训练系统
- TPU v4 Pod = TPU v4 加速器组成的集群（一个 Pod 数千芯片）
- MFU = Model FLOPs Utilization，模型算力利用率
- decoder-only = 只有解码器的单向自回归结构
- MQA = Multi-Query Attention，多查询注意力（共享 KV）
- few-shot = 少样本学习（给几个示例，不更新参数）
- emergent ability = 涌现能力（规模跨过阈值后能力突然出现）
- chain-of-thought = 思维链（先写推理过程再给答案）
- self-consistency = 自一致性（多条推理路径投票）
- BIG-bench = 150+ 任务的超大规模评测套件
- GSM8K / MMLU / HumanEval = 数学推理 / 常识问答 / 代码生成基准

---

## 第二篇 PaLM 2：更小、更快、更会的多语言接棒人

> 论文：*PaLM 2 Technical Report*
> 作者：Rohan Anil 等（Google，Brain 与 DeepMind 已宣布合并筹备中）
> 2023 年 5 月。ChatGPT 逼得 Google 在 I/O 大会上正面反击，PaLM 2 是那张牌：放弃"越大越好"，改用 compute-optimal 缩放做出更小更省却更强的模型，多语言扩到 100+ 语言，四档尺寸从移动端到云端全覆盖。它是 Gemini 的"父辈"。

### 一、引言：I/O 大会上的正面反击

2022 年 11 月 ChatGPT 引爆全球，2023 年 3 月 GPT-4 紧随其后，Google 被贴上"起了个大早赶了个晚集"的标签。2023 年 5 月的 Google I/O 上，PaLM 2 被正式推出——技术报告同日上线，**这是一场舆论与技术的双重反击**。

PaLM 2 没有继续堆参数，反而"缩了"：它比 PaLM 更小、推理更快、服务更便宜，但整体能力更强。这正是它和 PaLM 最大的分水岭。

### 二、compute-optimal 缩放与数据：一条被反复验证的路

- **compute-optimal scaling（算力最优缩放）**：模型大小与训练数据量按约 1:1 的比例一起放大，而不是过去"模型涨三倍、数据涨一倍"的粗暴路线（这正是 Chinchilla 论文的教训）。结论是：**对给定的算力预算，模型并非越大越好，数据跟上才有最优解**。PaLM 2 因此比 PaLM 小，却"吃"得更懂。
- **数据**：预训练语料扩展到了 **100+ 种语言**，涵盖网页文档、书籍、代码、数学表达式、科学论文、对话，以及**平行语料**（多语言对照文本）。相比 PaLM 偏英语的语料，PaLM 2 的非英语占比大幅提高。
- **架构与目标**：仍为 decoder-only，但训练目标改用 **UL2 式的"去噪混合"**——用多种掩码/前缀模式混合预训练，让模型学得更全面；上下文长度也比 PaLM 显著加长。
- **数据治理**：去重、敏感信息（PII）过滤，并给部分数据打上毒性标签用于控制生成。

### 三、四档尺寸：从 Gecko 到 Unicorn

PaLM 2 提供 **Gecko（壁虎）、Otter（水獭）、Bison（野牛）、Unicorn（独角兽）** 四档从小到大：

| 尺寸 | 定位 |
|---|---|
| Gecko | 轻量到能在**移动设备上离线运行**，交互延迟极低 |
| Otter | 中端，性价比之选 |
| Bison | 高端能力，通用主力 |
| Unicorn | 最大最强，云端旗舰 |

"一系多尺寸"让同一个模型家族能塞进手机、网页、云端各种场景，这套打法后来被 Gemini（Nano / Pro / Ultra）完整继承。

### 四、评估成绩与 Med-PaLM 2

**推理与数学。** GSM8K 上 PaLM 2 few-shot + CoT 达到 **80.7%**，加自一致性推到 **91.0%**——比 PaLM 的 58% 高出整整一截，逼近 GPT-4 水平线。

**多语言。** 在高级语言能力考试上通过"精通"级别；翻译质量超越 PaLM 和部分 Google Translate 结果；在 WinoGrande、BIG-Bench Hard 等推理基准上同样出色。

**代码。** 熟悉 Python、JavaScript 等主流语言，也能生成 Prolog、Fortran、Verilog 等小众语言的代码。

**Med-PaLM 2（医学领域微调版）。** 基于 PaLM 2 微调，在 MedQA（美国执业医师考试风格题）上拿到 **86.5%**，成为**首个在 USMLE 风格问题上达到"专家级"水平的 LLM**，超过同期 GPT-4 报告的 81.4%。它证明了"通用底座 + 领域微调"这条路的可行性——这正是 Gemini 家族后来各领域变体的先声。

**产品落地。** 发布时即支撑 **25+ 个 Google 产品与功能**：Bard（对话）、Workspace（Gmail、Docs 写作）、代码辅助工具、Sec-PaLM（安全领域）等。

### 五、信息受限说明

必须坦诚：**PaLM 2 技术报告与 PaLM 是两种写法**。报告没有公布参数量、训练数据量、算力成本等关键细节，也没有给出模型架构图与超参数。公开可见的信息只有：decoder-only、基于 JAX 与 TPU v4、compute-optimal 缩放、UL2 式多目标、四档尺寸、100+ 语言。外媒估算其规模约 **340B 参数、3.6T token**，但这是估计值，未经 Google 官方确认。这也是 PaLM 2 常被诟病"技术含量不足"的原因——对研究者而言，它更像一篇"产品发布说明"，而非 PaLM 那样的技术论文。

### 收尾：我的一点看法

PaLM 2 的意义不在单点技术，而在**路线的转向**。PaLM 证明"越大越强"，PaLM 2 立刻用 Chinchilla 式的算力最优缩放告诉你"大不是目的，配比才是"——这个转向非常 Google：它不再跟 OpenAI 拼参数数量，而是拼性价比和工程效率。四档尺寸的"模型家族"策略，加上"通用底座 + 领域微调"（Med-PaLM 2），几乎就是后来 Gemini 产品矩阵的彩排。

承继关系也清楚：**Gemini 就是 PaLM 系的技术接班人**。同样的 TPU 集群 + Pathways/JAX 训练栈、同样的 decoder-only 骨架、同样的多尺寸家族思路、同样的领域化扩展（Gemini 直接多模态化了）。PaLM 2 把"更小更省更强"的缩放观和多语言数据配方交给了 Gemini，而 Gemini 在它的肩上加上了多模态这最后一块拼图。

### 附：核心数据速查

**PaLM 2 基本盘**
| 项目 | 数值 |
|---|---|
| 参数量 | 未公开（外媒估约 340B） |
| 训练数据 | 未公开（外媒估约 3.6T token）；100+ 种语言 |
| 架构 | decoder-only，UL2 式多目标，JAX + TPU v4 |
| 缩放策略 | compute-optimal（模型与数据约 1:1 缩放） |
| 尺寸家族 | Gecko / Otter / Bison / Unicorn |

**关键 benchmark**
| 指标 | PaLM 2 | 对比 |
|---|---|---|
| GSM8K（CoT） | 80.7 | PaLM 540B 为 58 |
| GSM8K（+自一致性） | 91.0 | — |
| MedQA（Med-PaLM 2） | 86.5（USMLE 专家级） | GPT-4 报告 81.4 |

**关键概念清单**
- compute-optimal scaling = 算力最优缩放（模型与数据按比例缩放）
- UL2 = 一种多目标预训练（多种去噪模式混合）
- JAX = Google 的高性能数值计算框架（TPU 训练栈）
- Med-PaLM 2 = PaLM 2 的医学领域微调版
- USMLE = 美国执业医师考试（MedQA 为其风格题目）
- Gecko / Otter / Bison / Unicorn = PaLM 2 四档尺寸代号
- Sec-PaLM = 安全领域微调版

---

## 系列总评

PaLM 和 PaLM 2 放一起，是 Google 在 GPT 时代一次完整的攻防战演练，也是 Gemini 的技术"家谱前传"。

**PaLM 回答"能不能更大"**：540B 稠密模型、6144 块 TPU、57.8% 的硬件利用率，工程上打通了跨 pod 训练；科学上给出涌现的量化证据，把"规模出奇迹"从信仰变成数据。**PaLM 2 回答"怎么更高效"**：算力最优缩放、100+ 语言数据、四档尺寸家族、领域微调，把"大而全"收成"小而精"。一个向外扩张边界，一个向内收敛效率，正好是训练任何下一代模型的完整一课。

把时间线拉直看：Transformer 是 Gemini 的始祖，PaLM 是祖辈，PaLM 2 是父辈，Gemini 是这一脉的嫡传。Gemini 论文里反复出现的元素——TPU 集群上的 decoder-only、多尺寸家族（Nano/Pro/Ultra）、多语言与代码、领域化变体——几乎都能在 PaLM 系列里找到原形。理解了这两篇"前传"，再看 Gemini 时就会明白：它不是什么横空出世，而是 Google 攒了五年多的技术家底，在 2023 年底的一次总兑现。
