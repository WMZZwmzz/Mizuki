---
title: "DeepSeek-Coder-V2：代码追平 GPT-4"
published: "2026-07-24"
category: "deepseek"
lang: "zh"
draft: false
tags: ["开源", "编程", "MoE"]
---

# DeepSeek-Coder-V2 论文解读：第一个在代码上追平 GPT-4 的开源模型

> 论文：*DeepSeek-Coder-V2: Breaking the Barrier of Closed-Source Models in Code Intelligence*
> 作者：Qihao Zhu、Daya Guo、Zhihong Shao 等，DeepSeek-AI
> 2024 年 6 月。DeepSeek 第一次把 MoE 用到代码模型上，也第一次做出百亿参数级别的开源代码模型。做法很朴素，从 DeepSeek-V2 的中间 checkpoint 继续预训练 6 万亿 token，代码语料扩到 338 种语言，上下文拉到 128K。结果代码和数学直接对标 GPT-4-Turbo，HumanEval 90.2、Aider 73.7（全场第一）、SWE-Bench 首个破 10% 的开源模型。代码智能的"闭源垄断"被打破了。

---

## 一、路线：站在 V2 的肩膀上继续练

Coder-V2 不是从零开始，是从 DeepSeek-V2 的中间 checkpoint（已经训了 4.2T token）继续预训练，再加 6T token，总共见过 10.2T token。这样代码和数学能力大涨，通用语言能力还保住。

两个型号：Coder-V2-Lite 16B 总参数（2.4B 激活），Coder-V2 236B 总参数（21B 激活）。这是开源社区第一个百亿参数级别的代码模型。

## 二、数据：60% 代码，10% 数学，30% 自然语言

代码语料 1170B token，来源是 GitHub 和 CommonCrawl，用的是 DeepSeekMath 那套数据管线。GitHub 上爬到 2023 年 11 月之前的仓库，规则过滤加近似去重后得到 821B 代码、185B 代码相关文本，编程语言从 86 种扩到 338 种。CommonCrawl 那边用 fastText 分类器做种子召回，网页数据迭代收集 3 轮、GitHub 数据迭代 2 轮，又补了 70B 网页代码 token 和 94B GitHub 源码。数学语料 221B token，是 DeepSeekMath 的 120B 的近两倍。自然语言语料直接从 V2 的训练集里采样。

新语料的效果用 1B 小模型做了消融。新语料训 1T token 时 HumanEval 到 36.0%、MBPP 到 49.0%，训到 2T 达到 37.2% 和 54.0%。

## 三、训练：两个型号，两种策略

- **Lite 16B**：next token prediction + FIM（PSM 模式，比例 0.5），保留代码补全能力。
- **236B**：只用 next token prediction，不训 FIM。

上下文用 YaRN 从 16K 扩到 128K，分两阶段各 1000 步（32K 序列 batch 1152，然后 128K 序列 batch 288），长上下文数据做了上采样，NIAH 测试 128K 全程绿。

有个小插曲，训练时用指数归一化导致训练不稳、梯度爆炸，作者回退到传统归一化方法。

对齐阶段，SFT 用 300M token 的指令数据（Coder 的 2 万条代码 + Math 的 3 万条数学 + V2 的通用数据混合），然后 GRPO 强化学习。这里有个值得注意的实验，代码偏好的奖励信号直接用编译器 0-1 反馈其实噪声很大（测试用例覆盖不全），作者选择用编译器数据训一个奖励模型，再用奖励模型的信号做 RL。在自家 LeetCode 和 LeetCode-zh 测试集上，奖励模型信号明显优于裸编译器信号。

## 四、成绩：代码追平 GPT-4-Turbo

**代码生成**。多语言 HumanEval（13 种语言）平均 75.3%，全场第二，仅次于 GPT-4o 的 76.4%，把 Gemini-1.5-Pro（68.9%）、Claude-3-Opus（70.8%）、GPT-4-Turbo（72.3%）全压在下面。Python 单语言 90.2%。MBPP+ 76.2%，EvalPlus 管线下的新 SOTA。Lite 16B 平均 65.6%，比 Coder-33B 的 61.9% 还高。

**竞赛编程**。LiveCodeBench（2023.12-2024.06）43.4%，跟 GPT-4o 并列，仅次于 GPT-4-Turbo 的 45.7%。USACO 12.1%，跟 GPT-4-Turbo 的 12.3% 几乎打平。

**代码修复**。Aider 73.7%，所有模型里最高，超过 GPT-4o 的 72.9%。SWE-Bench 12.7%，第一个破 10% 的开源模型。Defects4J 21.0%，跟闭源模型的差距很小。

**代码理解**。CRUXEval-I 70.0%、CRUXEval-O 75.1%，开源第一，但离 GPT-4o 还有差距，作者归因于 21B 激活参数确实比闭源巨头小。

**数学**。GSM8K 94.9%、MATH 75.7%（GPT-4o 是 76.6%）、Math Odyssey 53.7%，AIME 2024 做对 4/30（maj@64 到 5/30），比所有对比的闭源模型都多。

**通用语言**。MMLU 79.2%，Arena-Hard 65.0（V2 Chat 才 41.6，因为 Arena-Hard 里代码数学题占比高，Coder-V2 正好吃这碗饭）、MT-Bench 8.77、AlignBench 7.84。BBH 83.9 超过 V2 的 79.7。知识密集型基准（TriviaQA 这类）略掉，因为代码语料挤占了网页数据。

**仓库级补全**。RepoBench v1.1（只用了 2023 年 12 月的数据防泄漏），Lite 16B 用 2.4B 激活参数在 Python 上做到跟 Coder-33B 相当、Java 上跟 Coder-7B 相当。**FIM 单行补全**，Lite 16B 平均 86.4%，跟 Coder-33B 持平。

## 收尾：我的一点看法

Coder-V2 在 DeepSeek 序列里的位置有点尴尬，前有 Coder 开山，后有 V3 封神，但它其实是个承重墙。它验证了两件事，第一，MoE 架构在代码领域同样成立，21B 激活参数就能匹敌体量远大于自己的闭源模型；第二，从通用模型继续预训练做垂直模型的路线可行，这个配方后来被反复使用。

我特别想夸的是那个"奖励模型 vs 编译器信号"的消融。编译器能给出 0-1 反馈，看起来够用了，但作者较真地发现测试用例覆盖不全会让信号有噪声，训一个奖励模型反而更稳。这种"看起来够用但认真一测其实不够用"的细节，是工程团队和实验室团队的分水岭。这条线后来演化成 R1 的"只用规则奖励"哲学，但那是数学代码领域规则确实干净的前提下的选择，代码修复这种开放场景还是得靠模型。

还有个点值得记住，Coder-V2 是 DeepSeek 唯一一个把 FIM 用到 236B 大模型之外的型号上的（16B 用、236B 不用），说明 FIM 对纯代码模型有用，但对大 MoE 模型收益不明显。后来 V3 的 FIM 比例 0.1，也是在这个认知上迭代的。

短板也很清楚。CRUXEval 上的代码推理跟 GPT-4o 差一截，SWE-Bench 12.7% 只是"破 10%"的里程碑，离真正能修真实仓库 bug 还远。知识型任务被代码语料挤占，TriviaQA 掉。它是个尖刀模型，不是六边形战士，这个定位要看清。

---

## 附：核心数据速查

**基本盘**
| 项目 | Coder-V2-Lite | Coder-V2 |
|---|---|---|
| 总参数 / 激活参数 | 16B / 2.4B | 236B / 21B |
| 训练数据 | 4.2T（V2 中间点）+ 6T | 同左，共 10.2T |
| 编程语言 | 338 种 | 338 种 |
| 上下文 | 128K（YaRN） | 128K |
| FIM | 0.5（PSM） | 不用 |

**数据构成**：60% 代码（1170B token）+ 10% 数学（221B token）+ 30% 自然语言

**Instruct 236B 关键成绩**
| 指标 | Coder-V2 | 对比 |
|---|---|---|
| Python HumanEval | 90.2% | GPT-4o 91.0% |
| 多语言 HumanEval 平均 | 75.3% | GPT-4o 76.4% |
| MBPP+ | 76.2% | EvalPlus SOTA |
| LiveCodeBench | 43.4% | GPT-4-Turbo 45.7% |
| Aider | 73.7% | 全场第一 |
| SWE-Bench | 12.7% | 首个开源破 10% |
| MATH | 75.7% | GPT-4o 76.6% |
| GSM8K | 94.9% | GPT-4o 95.8% |
| AIME 2024 | 4/30（maj@64 5/30） | 全场最高 |
| MMLU | 79.2% | - |
| Arena-Hard | 65.0 | V2 Chat 41.6 |

**1B 消融（新语料 vs Coder 语料，2T token）**
- HumanEval 30.5% → 37.2%（+6.7）
- MBPP 44.6% → 54.0%（+9.4）

**关键概念清单**
- MoE = Mixture of Experts，专家混合
- continued pre-training = 继续预训练（从已有 checkpoint 接着练）
- FIM = Fill-in-the-Middle，填充中间训练
- fastText = 轻量文本分类器（语料召回）
- YaRN = 长上下文外推方法（16K → 128K）
- GRPO = Group Relative Policy Optimization，组相对策略优化
- reward model vs compiler signal = 奖励模型信号 vs 编译器 0-1 反馈
- LiveCodeBench = 竞赛编程基准（防污染）
- USACO = 美国信息学奥林匹克基准
- RepoBench = 仓库级代码补全基准
- CRUXEval = 代码执行推理基准（输入输出双向预测）
- Defects4J / SWE-Bench / Aider = 代码修复基准
- EvalPlus = 增强版代码评测管线（MBPP+ 来自这里）
