---
title: "[编解码器] EnCodec：音频圈的分词器"
published: "2026-07-13"
category: "音频生成模型"
lang: "zh"
draft: false
tags: ["音频生成", "效率", "架构"]
---

# EnCodec 论文解读：Meta 的"音频分词器"，半个音乐生成圈都吃它的饭

> 论文：*High Fidelity Neural Audio Compression*
> 作者/机构：Alexandre Défossez、Jade Copet、Gabriel Synnaeve、Yossi Adi（Meta AI）
> 这篇是 2022 年 10 月 Meta 出的神经音频编解码器。骨架还是 SoundStream 那套——流式编解码器加 RVQ，但 Meta 做了大量工程化改造：把判别器简化成一个多尺度频谱对抗器，搞了个专门稳训练的 loss balancer（损失平衡器），再挂一个轻量 Transformer 熵编码器把码率**再省 25–40%**。规格上，**24 kHz 单声道覆盖 1.5–24 kbps，48 kHz 立体声覆盖 3–24 kbps，6 kbps 的主观质量约等于 MP3 64 kbps**。它后来成了 MusicGen、AudioGen 这些 Meta 系音频生成模型的标配 tokenizer，是整个 Meta 音频研究的地基。

---

## 一、背景：SoundStream 之后，Meta 要有自己的"底牌"

SoundStream 证明了可学习编解码器这条路走得通，但对 Meta 来说，那是 Google 的成果，只能算"路线验证"。做音频生成研究，tokenizer（分词器）必须握在自己手里——它直接决定下游模型吃什么样的"语言"。EnCodec 就是 Meta 基于 SoundStream 的思路，自己造的、更适合自家训练管线的版本。

## 二、架构：流式编解码 + RVQ，老骨架新打法

EnCodec 延续了"编码器 → 量化 → 解码器"的经典三段式：流式编码器把波形压成潜在表征，RVQ 逐级量化，解码器还原波形。两个规格：**24 kHz 单声道（1.5/3/6/12/24 kbps）和 48 kHz 立体声（3/6/12/24 kbps）**。

相比 SoundStream，训练环节做了两处务实的简化升级：

1. **单个多尺度频谱对抗器（multiscale spectrogram adversary）**：SoundStream 用了多个判别器，EnCodec 简化为一个多尺度频谱判别器。训练更快更稳，还能有效压制伪影（artifact，压缩生成的杂音失真）。
2. **Loss balancer（损失平衡器）**：这是全文最值得抄的工程细节。传统多损失训练里，各项损失的数量级不一样，权重全靠手工调参。EnCodec 的做法是：**每个损失的权重定义成"它应该在总梯度里占的比例"**，把超参选择和损失本身的数量级彻底解耦。模型训得稳，靠的就是它。

## 三、Transformer 熵编码：把码率再抠下来 25–40%

RVQ 出来的离散码流在统计上仍有冗余。EnCodec 额外训练了一个**轻量 Transformer 做熵编码（entropy coding）**：先学会预测下一个 token 的概率分布，再用算术编码把码流压得更短。效果：**码率再省 25–40%（论文摘要口径为最高 40%），而且整套流程仍然快于实时**——生成侧加这一点开销完全可接受。

这是"神经编解码器 + 概率建模式压缩"的第一次漂亮结合，也预示了后来所有"音频 LLM 背后还挂一个压缩模型"的做法。

## 四、评测：MUSHRA 全线碾压

论文做了大量主观评测（MUSHRA），覆盖语音、带噪混响语音、音乐多个域，以及 24 kHz 单声道和 48 kHz 立体声两档。结论很直接：**所有设置下都优于基线方法**。最出圈的一个对比是**6 kbps 的主观质量约等于 MP3 64 kbps**——只用 MP3 十分之一的码率，听感基本打平。

## 五、历史地位：Meta 系音频生成的地基

EnCodec 的代码和权重全部开源。之后的 MusicGen、AudioGen 等 Meta 音频模型，用的都是 EnCodec 的 token 做语言建模。可以说 Meta 2023 年那波音频生成大模型的输出，一半功劳要记在 EnCodec 这个 tokenizer 上——它决定了这些模型"看得见"什么样的音频世界。

## 收尾：我的一点看法

EnCodec 在学术创新上不算激进——RVQ 是 SoundStream 的，多尺度判别器也是前人思路。它的价值在工程：loss balancer 让大规模训练可复现、单判别器让训练更快、熵编码把码率性价比拉满。一篇"把别人的框架打磨到能撑起一个生态"的论文，作用其实比很多花哨创新更大。

局限也明显。24 kHz 对音乐生成够用，但离"发烧级"还有距离；码率上限 24 kbps 相比传统编解码器仍是高压缩档。另外，Transformer 熵编码省的是"静态压缩"的码率，对"生成模型直接采样 token"的场景收益有限——那是另一条技术路线的问题了。还有一点值得留意：EnCodec 评测主要在 MUSHRA 主观听感上，客观指标（如重建误差）并未成为论文主角，跨论文横比时得小心。

---

## 附：核心数据速查

**基本盘**
| 项目 | 数值 |
|---|---|
| 论文 | High Fidelity Neural Audio Compression |
| arXiv / 时间 | 2210.13438（2022.10，Meta AI） |
| 架构 | 流式编码器–解码器 + RVQ + 单多尺度频谱对抗器 |
| 采样率 / 码率 | 24 kHz 单声道 1.5–24 kbps；48 kHz 立体声 3–24 kbps |
| 熵编码 | 轻量 Transformer，码率再省 25–40%（摘要口径最高 40%） |

**核心创新**
| 创新 | 要点 |
|---|---|
| 单多尺度频谱对抗器 | 简化训练、压制伪影 |
| Loss balancer | 损失权重 = 梯度占比，训练稳定可复现 |
| Transformer 熵编码 | 概率建模再压缩，码率省 25–40% 且仍快于实时 |

**关键成绩**
- 6 kbps 主观质量 ≈ MP3 64 kbps
- MUSHRA 全部设置优于基线（语音/带噪混响语音/音乐，单声道/立体声）
- 开源代码与权重，支撑 MusicGen、AudioGen 等 Meta 音频模型

**关键概念清单**
- RVQ = Residual Vector Quantizer，残差向量量化
- loss balancer = 损失平衡器（以梯度占比定义损失权重）
- multiscale spectrogram adversary = 多尺度频谱对抗器（判别器）
- entropy coding / entropy model = 熵编码 / 熵模型（预测分布后再压缩）
- artifact = 伪影（压缩/生成带来的杂音失真）
- MUSHRA = 多刺激隐藏参考与锚点的主观听感测试
- tokenizer = 分词器（把音频切成离散 token 的组件）
- kbps = kilobits per second，每秒千比特（码率单位）
