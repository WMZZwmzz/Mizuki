---
title: "[TTS·声音克隆] CosyVoice：100 万小时炼成"
published: "2026-07-06"
category: "音频生成模型"
lang: "zh"
draft: false
tags: ["TTS", "流式", "开源"]
---

# CosyVoice 系列论文解读：阿里语音"三连跳"，从 300M 黑马到 100 万小时大模型

> 论文：CosyVoice: A Scalable Multilingual Zero-shot Text-to-speech Synthesizer based on Supervised Semantic Tokens（arXiv:2407.05407）；CosyVoice 2: Scalable Streaming Speech Synthesis with Large Language Models（arXiv:2412.10117）；CosyVoice 3: Towards In-the-wild Speech Generation via Scaling-up and Post-training（arXiv:2505.17589）
> 作者/机构：阿里巴巴（通义实验室 FunAudioLLM 团队，Zhihao Du、Qian Chen、Shiliang Zhang、Jingren Zhou 等）

CosyVoice 是中文开源 TTS 里最成体系的家族，没有之一。2024 年 7 月第一代发布时，别人还在纠结"自回归还是扩散"，它直接祭出**"LLM 定内容 + 流匹配定细节"**的组合拳，把两者长处都吃了，中英零样本克隆做到当时开源最好，还第一个把"监督语义 token"引进了 TTS。到了 12 月的 CosyVoice 2，又解决了流式合成的问题，一个模型同时支持流式和非流式，首包延迟压到约 150 毫秒的量级。2025 年 5 月的 CosyVoice 3 更狠，**参数量从 0.5B 涨到 1.5B，训练数据从 1 万小时拉到 100 万小时，语种覆盖 9 个语种 + 18 个中文方言**。一年之内三连跳，把"开源 TTS 的天花板"这个头衔焊死了。

---

## 一、CosyVoice 1：给语音 token 装上"语义"

大模型 TTS 都依赖音频 token，token 的质量决定模型的天花板。在 CosyVoice 之前，主流 token 都是无监督学的——编解码器自己把波形压成码字，模型只"知道"这些码字对应某段声音，但**不知道它们对应哪个字**，语义信息是缺失的。

CosyVoice 的破局点是**监督语义 token（supervised semantic tokens）**：把多语种语音识别（ASR）模型的编码器里插入向量量化（VQ），让 ASR 干活的副产品——语义特征——直接变成离散 token。这样一来，每个 token 都跟文本内容严格对齐，内容一致性和说话人相似度立刻拉开差距。论文里明确说，监督 token 在零样本克隆的内容一致性和相似度上全面胜过无监督 token，这也是**业界第一个把监督语音 token 用进 TTS 的工作**。

生成侧则是经典的"LLM + 流匹配"双引擎：一个语言模型（LLM）负责"文本→音频 token"，一个条件流匹配（conditional flow matching）模型负责"音频 token→语音波形"。LLM 管韵律和内容，流匹配管渲染速度，分工明确。关于规模，要较个真：**论文正文并没有明确写参数量，"约 300M"是论文表 10 里用的命名口径**，社区据此流传，引用时务必标注这一点。模型走 FunAudioLLM 开源，是当时开源 TTS 里少数敢称"可扩展、数据越大越强"的。

## 二、CosyVoice 2：一个模型，又流式又不流式

实时交互火了之后，TTS 能不能"边读边出"（流式）成了刚需。但流式通常要专门训练一套模型，跟高质量非流式模型还得来回切换，工程上很烦。CosyVoice 2 的核心卖点就是**用同一个模型同时覆盖流式和非流式两种场景**。

它做了三件事。第一，把音频 token 的量化从传统码本换成**有限标量量化（FSQ，finite-scalar quantization）**——FSQ 不靠"可学习的码本"而是靠一组固定的标量网格做量化，彻底消灭了"有的码本没人用"的浪费问题，码本利用率（codebook utilization）大幅提升。第二，精简文本-语音语言模型的架构，让它可以**直接复用预训练 LLM 当骨干**，不用从零堆。第三，也是最有工程含量的一步，设计了 **chunk-aware 的因果流匹配（causal flow matching）模型**——流匹配模型只依赖"已经生成过的 chunk"，于是能边生成边播放，天然支持流式；同时保留非流式模式，质量几乎无损。

成绩上，CosyVoice 2 论文称自然度达到人类平价（human parity）水准、流式模式质量几乎不损失。两个数字要交代清楚口径：**MOS 5.53 是模型自评**，不是第三方盲测；**首包延迟约 150 毫秒是官方 GitHub 仓库给的口径，论文正文没有给出具体数值**。看这类"官方口径"数字，心里得有根弦。

## 三、CosyVoice 3：数据×100、参数×3，冲向"野外"

CosyVoice 3 的目标很直白：论文标题里的 "In-the-wild"，就是"野外真实环境"——不要只在干净的录音室里好用，要扛得住真实世界的噪音、口音、五花八门的说话场景。手段就俩字：**变大**。

**数据规模**：从上一代的 1 万小时直接拉到 **100 万小时**，领域和文本格式也大幅扩宽，覆盖 **9 个语种 + 18 个中文方言**。**模型规模**：从 0.5B 涨到 **1.5B**，靠更大的容量吃掉更大的数据。这波"万小时→百万小时"的跳跃，是中文 TTS 开源生态里迄今最大的一次量级跨越。

结构上还有两个新东西。一是新的**监督多任务语音分词器**：让语音识别、语音情绪识别、语种识别、音频事件检测、说话人分析五个任务一起监督 tokenizer 的学习。多任务一起训，分词器就同时带上了"内容、情绪、语种、场景、说话人"多层信息，韵律自然度因此大涨。二是新的**可微奖励模型（differentiable reward model）做 RL 后训练**——注意"可微"这个词，它让奖励信号可以直接回传梯度，比传统 RLHF 里"奖励模型给分、策略网络黑盒优化"更丝滑，而且官方说这个后训练方案对其它 LLM 语音合成模型也适用，等于给开源社区递了个通用工具。

## 收尾：我的一点看法

CosyVoice 系列给我最深的印象是"产品感"。它不是纯学术玩具，每一步都踩在真实的工程痛点上：第一代解决"token 没语义"的学术痛点，第二代解决"流式不流式要两套模型"的工程痛点，第三代解决"中文方言和真实场景没人覆盖"的产品痛点。**一年三代，代代打在实处**，这比追着顶会审稿口味跑有意义得多。

技术路线上，它验证了一个行业共识：**LLM 管内容、流匹配管渲染的混合架构，是零样本 TTS 在质量和速度之间最划算的折中点**。后来 Seed-TTS、F5-TTS 等或明或暗都在这条线上。CosyVoice 3 用 100 万小时数据把这个配方推到规模极限，也顺带证明中文开源社区完全有能力做出世界级语音模型。

该泼的冷水也要泼。MOS 5.53 是自评、150 毫秒首包是官方口径，这类"自报家门"的数字跟第三方盲测（比如 TTS Arena）之间通常有温差；100 万小时数据里有多少是合法授权采集的，论文没说透，版权问题在 TTS 圈是绕不开的雷。另外 1.5B 的规模相比 Seed-TTS、Qwen3-Omni 这些大厂私有大模型还有差距，"开源最强"四个字，是矮子里拔将军，还是要继续追赶的。但无论如何，**把百万小时、18 种方言的模型开源出来这件事本身，就已经给中文 TTS 社区攒下了巨大的公共资产**。

---

## 附：核心数据速查

**基本盘**
| 项目 | CosyVoice | CosyVoice 2 | CosyVoice 3 |
|---|---|---|---|
| arXiv / 时间 | 2407.05407 / 2024.07 | 2412.10117 / 2024.12 | 2505.17589 / 2025.05 |
| 机构 | 阿里（FunAudioLLM） | 阿里 | 阿里 |
| 参数量 | 约 300M（论文表 10 命名口径，正文未明确） | 未公开单一数字 | 1.5B（上一代 0.5B） |
| 训练数据 | 中英多语 | 大规模多语 | 100 万小时（上一代约 1 万小时） |
| 语种覆盖 | 中英 | 多语 | 9 语种 + 18 中文方言 |

**核心创新**
| 创新 | 要点 |
|---|---|
| 监督语义 token | ASR 编码器插 VQ 出语义 token，内容对齐远超无监督 token |
| LLM + 流匹配双引擎 | LLM 生成 token、流匹配渲染波形，混合架构 |
| FSQ 有限标量量化 | 固定标量网格量化，提升码本利用率 |
| chunk-aware 因果流匹配 | 只依赖已生成 chunk，单模型同时支持流式/非流式 |
| 监督多任务分词器 | ASR/情绪/语种/事件/说话人五任务共同监督 |
| 可微奖励模型 RL | 可微奖励信号直接回传梯度，可用于其它 LLM TTS |

**关键成绩（注意口径）**
- CosyVoice 1：零样本内容一致性、说话人相似度优于无监督 token 方案
- CosyVoice 2：MOS **5.53**（自评）；首包约 **150 ms**（官方 GitHub 口径，论文未给具体值）；流式/非流式统一
- CosyVoice 3：数据 1 万→100 万小时；参数 0.5B→1.5B；9 语种 + 18 中文方言
- 全程开源（FunAudioLLM），中文开源 TTS 生态代表

**关键概念清单**
- supervised semantic token = 监督语义 token（带文本语义的音频码字）
- VQ = Vector Quantization，向量量化
- flow matching = 流匹配（噪声到数据的直线轨迹生成）
- FSQ = Finite Scalar Quantization，有限标量量化
- codebook utilization = 码本利用率
- chunk-aware causal flow matching = chunk 感知的因果流匹配（流式生成）
- streaming / non-streaming = 流式 / 非流式合成
- MOS = Mean Opinion Score，平均主观意见分
- differentiable reward model = 可微奖励模型
- RL = Reinforcement Learning，强化学习
- in-the-wild = 野外/真实环境（含噪音、口音、多样场景）
- ASR = Automatic Speech Recognition，自动语音识别
