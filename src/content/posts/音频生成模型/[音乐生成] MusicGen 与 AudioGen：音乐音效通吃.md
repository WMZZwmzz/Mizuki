---
title: "[音乐生成] MusicGen 与 AudioGen：音乐音效通吃"
published: "2026-07-19"
category: "音频生成模型"
lang: "zh"
draft: false
tags: ["音乐生成", "开源", "架构"]
---

# MusicGen 与 AudioGen 论文解读：Meta 一个"四码本"模型，音乐音效通吃

> 论文：*AudioGen: Textually Guided Audio Generation*（arXiv:2209.15352，2022.09.30，ICLR 2023）
> 论文：*Simple and Controllable Music Generation*（MusicGen，arXiv:2306.05284，2023.06.08，NeurIPS 2023）
> 作者/机构：Meta AI（Felix Kreuk、Jade Copet、Gabriel Synnaeve、Yossi Adi、Alexandre Défossez 等）

Meta 在音频生成上的打法一直很统一：**一切都能变成 token，一切都能交给语言模型**。2022 年的 AudioGen 先拿音效试水——文本描述进、逼真音效出，是个纯粹的"文本→音效"自动回归模型；2023 年的 MusicGen 把同一套哲学搬到音乐上，做了个大升级：不再级联多个模型，而是一个**单阶段 Transformer + EnCodec 的四个码本并行预测**。这篇解读最想澄清的一件事是：**AudioGen 是 1B（large）/ 285M（base），不是 3.3B**——3.3B 是 MusicGen 的规模，这俩经常被张冠李戴。弄清楚这一点，Meta 两条产品线的规模谱系就顺了。

---

## 一、AudioGen：文本→音效的自动回归模型

AudioGen 解决的问题很朴素：给一句"狗在草地上奔跑"或者"城市街道的车流声"，生成对应的音效。它是个**自动回归（autoregressive）生成模型**，在**学习到的离散音频表示**上逐 token 预测——这个离散表示就是 Meta 自家之前做的 **EnCodec** 神经音频编解码器产出的 token。EnCodec 用残差向量量化把波形压成 token，AudioGen 就在这些 token 上练语言模型，生成时再把 token 解回波形。

论文摘要里点出了这个任务的四重难点，翻译成大白话就是：声音在空气里传播会混成一团（多人同时说话很难分）；真实录音带噪音和混响；文本标注稀少，模型很难扩大；想生成高保真音频就得高采样率，序列长到爆炸。AudioGen 的应对办法有几个：**混合增强（augmentation）**——训练时把不同的音频样本混在一起，逼模型内部学会"分离多个声源"；**多流建模（multi-stream）**——同时预测多个 token 流，用更短的序列保住码率和感知质量，推理更快；**无分类器引导（classifier-free guidance）**——让输出更贴合文本描述。数据侧它整理了 10 个带文本标注的音频数据集，拼出一个规模可观的音文训练集。

**参数量口径**：AudioGen 有两个规格——**large 是 1B 参数，base 是 285M 参数**。网上不少资料把 AudioGen 写成 3.3B，那是拿 MusicGen 的数字张冠李戴了。AudioGen 的实验结论是在当时的主客观指标上都超过了对照基线，还能做有条件/无条件的"音频续写"。

## 二、MusicGen：单阶段 LM 的逆袭

如果说 AudioGen 还是"多个 token 流轮流预测"的常规打法，MusicGen 直接把架构简化到了极致：**一个单阶段的 Transformer 语言模型，直接操作 EnCodec 压缩出来的多个离散 token 流**。

这里要解释一下"四个码本"。EnCodec 用残差向量量化（RVQ）分层量化音频，一层压完的残差再交给下一层压，最后每个时间步得到多个码本上的 token（MusicGen 用的是 4 个码本）。问题来了：这些码本是**平行的**——同一时刻有 4 个 token 都要预测，但标准的自回归语言模型一次只能吐一个 token，这是多对一的不匹配。此前很多方案的处理是级联：训一个模型管第一个码本，再训别的模型管后续码本，模型越堆越多。

MusicGen 的核心创新是 **token interleaving（token 交错模式）**：在一个序列里把 4 个码本的 token 按不同顺序交错排列，用一个模型统一建模，通过精心设计的交错模式让"并行码本"和"自回归时序"自洽。这样既不需要级联一堆模型，又能并行预测多个码本。论文标题里的"Simple"（简单）就是这么来的——它把之前 MusicLM 那套分层级联、AudioGen 那套多流都收编成了"一个模型 + 一种交错模式"。**它还能同时吃文本描述和旋律特征两个条件**，生成的样本支持单声道和立体声。论文在标准的 text-to-music 基准上做了自动和人工双重评测，结果全面优于当时的对照系统，靠消融实验逐项论证了每个组件的必要性。

## 三、关键数字：32kHz、2 万小时、FAD=3.8

MusicGen 的几个数字值得单独拎出来记：

- **采样率 32 kHz**，对音乐来说已经够"像回事"了，明显高于早期模型的 16/24 kHz；
- **训练数据约 2 万小时的许可音乐**——注意是"许可"（licensed），这是 Meta 有意绕开版权雷区的选择，跟后来 RIAA 起诉的几家"野生数据流"形成对比；
- **三个开源档位：300M、1.5B、3.3B**，全部开源权重；
- **最大档 3.3B 在 MusicCaps 基准上的 FAD = 3.8**（FAD 是衡量生成音频与真实音频分布距离的指标，越小越好）。

FAD 3.8 这个数后来被反复引用，因为它在当时刷新了开源模型的记录，而且此后的整整两年里，**MusicGen 一直是开源音乐生成的事实基线**——新模型发布几乎都要跟它比一比，GitHub 上的 audiocraft 仓库也成了 Meta 音频全家桶的入口。它同时是"单阶段 + 4 码本并行"这条路线的标杆，后来的开源模型（包括 YuE、ACE-Step 这些）不少都在它肩膀上继续爬。

## 收尾：我的一点看法

AudioGen 和 MusicGen 是一对"先证明范式、再升级范式"的组合拳。AudioGen 证明"文本 + EnCodec token + 自回归"在音效上行得通，MusicGen 则用单阶段设计解决了多码本并行的问题，把模型的复杂度从"管多个模型的编排"降到了"管一种交错模式"。后者的"简单"不是偷懒，是把对的问题用对的架构解掉。

我比较欣赏的是 Meta 的数据洁癖：2 万小时许可音乐这个选择，让 MusicGen 能在版权风暴里站稳——虽然质量和数据量都打了折扣，但它成了学术界和开源圈能放心用的基线。这在 AI 音乐被版权问题反复锤打的时代，是一种很务实的判断。缺点也明显：32kHz 比当时商业系统的 44.1kHz 低一档，2 万小时对音乐这种丰富模态来说不算多，生成的音乐在结构上偶尔还是会"糊"（长程连贯性不够）。但作为开源基线，它完成了自己的历史任务：让"下一个 MusicGen"有了参照系。

---

## 附：核心数据速查

**基本盘**
| 项目 | AudioGen | MusicGen |
|---|---|---|
| 论文 | arXiv:2209.15352（2022.09.30，ICLR 2023） | arXiv:2306.05284（2023.06.08，NeurIPS 2023） |
| 任务 | 文本→音效 | 文本/旋律→音乐 |
| 架构 | 自动回归 LM（离散 token 表示） | 单阶段 Transformer LM + EnCodec 4 码本 |
| 参数量 | large **1B** / base **285M**（⚠️ 非 3.3B） | **300M / 1.5B / 3.3B** |
| 采样率 | ⚠️（论文口径） | **32 kHz** |
| 训练数据 | 10 个带标注音频数据集 | **约 2 万小时许可音乐** |
| 关键技巧 | 混合增强、多流建模、CFG | token interleaving（交错模式）、支持 mono/stereo |

**核心创新**
| 创新 | 要点 |
|---|---|
| AudioGen：文本条件音效生成 | 文本描述→EnCodec token 自动回归→音效 |
| AudioGen：混合增强 | 混合音频样本逼模型学会分离声源 |
| MusicGen：单阶段 LM | 消灭级联，一个 Transformer 管 4 个码本 |
| MusicGen：token interleaving | 交错模式让并行码本适配自回归时序 |
| MusicGen：多条件 | 同时支持文本描述与旋律特征条件 |

**关键成绩**
- MusicGen 最大档 **3.3B** 在 MusicCaps 上 **FAD = 3.8**
- 主客观评测全面优于当时对照基线
- 开源权重（300M/1.5B/3.3B）与 audiocraft 代码库
- 此后约两年**开源音乐生成的事实基线**

**关键概念清单**
- EnCodec = Meta 的神经音频编解码器（RVQ 量化）
- codebook / 码本 = 离散 token 的查询表；多码本指多个量化层级
- RVQ = Residual Vector Quantization，残差向量量化
- token interleaving = token 交错模式，安排多码本 token 的序列顺序
- CFG = Classifier-Free Guidance，无分类器引导
- FAD = Frechet Audio Distance，弗雷歇音频距离，越小表示生成分布越接近真实
- MusicCaps = 5.5k 条音乐-文本对的评测数据集
- multi-stream = 多流建模，同时预测多条 token 流
