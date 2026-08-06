---
title: "DeepSeek-Coder：开源代码急先锋"
published: "2026-07-27"
category: "deepseek"
lang: "zh"
draft: false
tags: ["开源", "编程", "预训练"]
---

# DeepSeek-Coder 论文解读：开源代码模型率先压过 GPT-3.5

> 论文：*DeepSeek-Coder: When the Large Language Model Meets Programming - The Rise of Code Intelligence*
> 作者：Daya Guo、Qihao Zhu 等，DeepSeek-AI（北大联合）
> 这是 2023年11月2日，DeepSeek 第一个模型：DeepSeek Coder。DeepSeek Coder 不是后来的"论文版"（arXiv论文2401.14196于2024年1月才提交），而是2023年11月就作为模型发布了。1B、7B、33B全系列开源，免费商用。1.3B 到 33B 三个规模，从头训了 2 万亿 token，87 种编程语言。两个卖点，一是数据按"仓库"级别组织，而不是单文件，这让模型能理解跨文件的依赖；二是预训练里加了填空任务（FIM），代码补全能力直接拉满。33B 的 Instruct 版在 HumanEval 上超过了 GPT-3.5-Turbo，这是开源代码模型率先做到的。

---

## 一、背景：代码领域被闭源垄断

代码智能这事，OpenAI 们把门槛抬得很高，Codex、GPT-3.5 这些闭源模型很强，但研究者够不着。开源模型（StarCoder、CodeLlama 这些）跟闭源差距明显。DeepSeek-Coder 就是来填这个坑的。

## 二、数据：从仓库角度组织代码

### 采集与过滤

爬 GitHub 上 2023 年 2 月之前创建的公开仓库，只留 87 种编程语言。先用 StarCoder 那套规则粗过滤，比如平均行长超过 100 字符、最大行长超过 1000 字符的去掉，字母占比低于 25% 的去掉，JSON/YAML 只留 50 到 5000 字符的。一套下来数据量砍到原来的 32.8%。最后总规模 798GB、6.03 亿个文件。最大的几块是 Java 18.63%、Python 15.12%、C++ 11.39%、TypeScript 7.60%、PHP 7.38%、C# 7.34%。

### 依赖解析：把文件按依赖关系排序

以前训练代码模型都是文件级，一个文件一个样本，文件之间的依赖关系全丢了。真实项目里跨文件调用才是常态。DeepSeek-Coder 的做法是，用正则表达式提取文件间的依赖（Python 的 import、C# 的 using、C 的 include），然后做一个带环容忍的拓扑排序，把被依赖的文件排在前面（依赖它的文件靠后），保证每个文件需要的上下文都在它之前。每个文件前面加一行注释标注文件路径。

### 仓库级去重

别人做 near-deduplication（近似去重）都是文件级，DeepSeek 是在仓库级做，把整个仓库的代码拼起来当一个样本去重。原因是文件级去重可能把仓库内部的文件删掉，破坏仓库结构。

### 质量筛选和防污染

编译器加质量模型加启发式规则，滤掉有语法错误、可读性差的代码。防污染是 n-gram 匹配，如果一段代码里有跟 HumanEval、MBPP、GSM8K、MATH 测试数据相同的 10-gram 字符串就删掉；测试数据里不足 10-gram 但不少于 3-gram 的，用精确匹配。

## 三、训练：填空比顺读更能练代码

### FIM 目标

除了常规的 next token prediction（下一 token 预测），还用了 Fill-in-the-Middle（FIM，填充中间）。做法是把文本随机切成前缀、后缀、中间三段，打乱顺序用特殊字符连起来，让模型学会"根据上下文补中间"。FIM 有两种模式，PSM（前缀-后缀-中间）和 SPM（后缀-前缀-中间）。

消融实验（1.3B 模型、Python 子集、HumanEval-FIM 基准）很有意思。FIM 比例 0%、50%、100% 和 MSP 50%（Masked Span Prediction，掩码跨度预测）四档对比。100% FIM 在 HumanEval-FIM 上效果最好，但 FIM 率太高会影响人类可读的代码补全表现（MBPP 掉）。最后取了个折中，训练用 50% FIM 率。

### 上下文 16K

代码文件往往很长，上下文拉到 16384 token，应付复杂项目。

## 四、成绩：6.7B 打平 CodeLlama-34B

**多语言 HumanEval / MBPP**。Base 33B 八种语言平均 50.3%，MBPP 66.0%，比同规模的 CodeLlama-34B 高 9 到 11 个点。最吓人的是 6.7B 就超过了 CodeLlama-34B，这是预训练语料质量的直接体现。Instruct 33B 的 Python 单语言 79.3%，超过 GPT-3.5-Turbo 的 76.2%。

**DS-1000**（数据科学真实工作流，7 个库）。Base 33B 平均 40.2%，远超 CodeLlama-34B 的 34.3%，各库全面领先。

**LeetCode 竞赛题**（作者自己建的基准，2023 年 7 月到 2024 年 1 月的题，180 道，每道 100 个测试用例）。Instruct 33B Pass@1 27.8%，超过 GPT-3.5-Turbo 的 23.3%，是唯一超过它的开源模型，但离 GPT-4-Turbo 的 40.6% 还有距离。作者还发现加 CoT 提示（先写分步提纲再写代码）能显著提升，特别是难题。

**单行 FIM 补全**（Python/Java/JavaScript 三语言行级精确匹配）。33B 平均 81.2%，1.3B 就超过了 StarCoder 和 CodeLlama。

**跨文件补全（CrossCodeEval）**。这是仓库级预训练的直接验证。6.7B 加 BM25 检索在四个语言上全面超过同规模模型。消融更关键，去掉仓库级预训练，Java、TypeScript、C# 三个语言都掉，证明仓库级数据确实有用。

**程序化数学推理（PAL）**。用"自然语言描述步骤 + 代码执行"的方式做数学题，33B 七个基准平均 65.8%，GSM8K 60.7%、MATH 29.1%，比 CodeLlama-34B 的 62.0% 高。

**v1.5：从通用模型继续练**。为了补自然语言和数学能力，从 DeepSeek-LLM-7B 继续预训练 2T token（70% 源码、10% Markdown/StackExchange、7% 代码相关 NL、7% 数学相关 NL、6% 中英双语），得到 v1.5 6.9B。代码能力略降，但数学和 NL 全面大涨，Instruct-v1.5 6.9B 的 GSM8K 从 62.8% 涨到 72.6%，MATH 从 28.6% 到 34.1%，MMLU 从 37.2% 到 49.5%。

许可协议也很重要，宽松许可，研究和商用都行，这在当时的代码模型里不多见。

## 收尾：我的一点看法

这篇论文在 DeepSeek 序列里容易被跳过，因为后面 V2、V3 太耀眼。但它埋了两颗关键的种子。

第一颗是数据方法论。仓库级预训练、依赖解析拓扑排序、仓库级去重，这套东西后来直接进了 V2/V3 的数据管线，DeepSeek 处理语料的认真劲儿从这儿就开始了。而且 FIM 那个消融实验做得干净，50% FIM 率这个选择后来 V3 也沿用了（0.1 的比例是后续迭代）。

第二颗是"开源模型也能打过闭源"的信心。Instruct 33B 在 HumanEval 和 LeetCode 竞赛上超过 GPT-3.5-Turbo，在当时是标志性事件。它证明路线是对的，只要数据够好、训练够认真，开源模型在垂直领域能跟闭源掰手腕。这个信心后来一路延续到 V3、R1。

6.7B 打平 34B 这个结果值得单独说。参数只有人家五分之一，性能持平，这是语料质量的胜利。DeepSeek 后来所有模型都在追求"用更少的参数和算力办同样的事"，这篇是最早的证据。

当然也要说缺点。LeetCode 竞赛题的评估里作者自己就承认可能有数据污染嫌疑，7 月和 8 月的题得分偏高；另外程序化数学推理（PAL）跟 DeepSeekMath 那种真正的数学推理还是两回事，这篇里 MATH 只有 29.1%，一年后 DeepSeekMath 直接把它打到 50% 以上。

---

## 附：核心数据速查

**基本盘**
| 项目 | 数值 |
|---|---|
| 模型规模 | 1.3B / 6.7B / 33B（Base + Instruct） |
| 预训练数据 | 2T tokens，87 种语言 |
| 数据构成 | 87% 源码 + 10% 英文代码相关 NL + 3% 中文 |
| 上下文 | 16K |
| FIM 比例 | 50%（消融后选择） |
| 许可证 | 宽松，研究 + 商用 |

**数据管线**
- 规则过滤（StarCoder 风格，数据砍到 32.8%）
- 依赖解析（正则提取 import/include，拓扑排序）
- 仓库级近似去重（非文件级）
- 质量筛选 + n-gram 防污染（10-gram 精确匹配）

**Base 33B 关键成绩**
- 多语言 HumanEval 平均 50.3%；MBPP 66.0%
- DS-1000 平均 40.2%
- FIM 单行补全平均 81.2%
- PAL 数学推理平均 65.8%

**Instruct 33B**
- Python HumanEval 79.3%（GPT-3.5-Turbo 76.2%）
- LeetCode 竞赛 27.8%（GPT-3.5-Turbo 23.3%，GPT-4-Turbo 40.6%）
- CoT 提示可进一步提升

**v1.5 6.9B（从 DeepSeek-LLM-7B 继续预训练）**
- Instruct-v1.5：HumanEval 64.1%、GSM8K 72.6%、MATH 34.1%、MMLU 49.5%

**关键概念清单**
- FIM = Fill-in-the-Middle，填充中间训练
- PSM / SPM = 前缀-后缀-中间 / 后缀-前缀-中间两种 FIM 排列
- MSP = Masked Span Prediction，掩码跨度预测
- repository-level pre-training = 仓库级预训练
- dependency parsing = 依赖解析（拓扑排序）
- near-deduplication = 近似去重
- CrossCodeEval = 跨文件代码补全基准
- DS-1000 = 数据科学代码生成基准（7 个库）
- PAL = Program-Aided Language Models，程序辅助语言模型
- CoT = Chain-of-Thought，思维链
