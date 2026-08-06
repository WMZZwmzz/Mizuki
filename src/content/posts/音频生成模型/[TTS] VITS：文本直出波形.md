---
title: "[TTS] VITS：文本直出波形"
published: "2026-07-29"
category: "音频生成模型"
lang: "zh"
draft: false
tags: ["TTS", "端到端", "开源"]
---

# VITS 论文解读：文本直接吐波形，中间环节一个不剩，还成了开源标配

> 论文：*Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech*
> 作者/机构：Jaehyeon Kim、Jungil Kong、Juhee Son（Kakao），ICML 2021，arXiv:2106.06103（2021.06）

FastSpeech 2 证明了并行合成可行，但"文本→mel 谱→声码器→波形"还是两段式，mel 谱只是个中间站。VITS 干了一件更彻底的事：**文本直接生成波形，中间没有 mel 谱、没有声码器环节**——一个模型训练到底。它把三类生成模型攒在了一起：变分自编码器（VAE）、标准化流（normalizing flow）、生成对抗网络（GAN），再加上一个随机时长预测器（stochastic duration predictor）。LJSpeech 上 MOS **4.43**（真人为 4.46），超过当时所有公开 TTS 系统，而且还能并行、能控制韵律多样性。它是"完全端到端"理念的完成态，也是 2021 到 2023 年开源 TTS 的默认基线——后来的 HiFi-GAN 生态、ESPnet、Coqui 系，几乎都长在 VITS 的肩膀上。

---

## 一、问题：两段式的尽头

Tacotron 2 把音质做上去了，但 mel 谱 + WaveNet 两段式有两层浪费：

1. **mel 谱是"中间人"**：它只保留了人耳相关的频段，丢掉了一部分波形细节——声码器再怎么渲染，信息损失已经发生了；
2. **训练不联合**：声学模型（文本→mel）和声码器（mel→波形）分开训练，误差层层传递，没法端到端优化。

VITS 的目标：把这两个环节揉成一个网络，让梯度从波形一路流回文本。难点也很直接——**波形太"细"了**：16kHz 下 1 秒就是 16000 个采样点，而文本只有几个字符，中间巨大的尺度鸿沟（one-to-many，一对多）必须被建模，否则模型只能学会"平均化"的模糊发音。

## 二、架构：三大件 + 一个神来之笔

VITS 全称就是它的架构：**条件变分自编码器 + 对抗训练**。拆开看：

### 1. 变分自编码器（VAE）：处理"一对多"的核心

给每个文本输入配一个**隐变量 z（latent variable）**，z 由"文本条件 + 随机噪声"生成。同一句话，抽不同的 z，就得到不同的韵律和音色——这从机制上抓住了"一句话有无数种合法说法"。训练时用后验编码器（posterior encoder）从真实波形里提取 z 的分布，推理时从前验（prior）里采样。

### 2. 标准化流（Normalizing Flow）：把 z 变"柔顺"

VAE 的前验若太简单，z 的表达力不够。VITS 用 flow 把高斯分布**扭曲成更复杂的分布**，让 z 既能表达丰富韵律，又保持可精确计算对数似然（便于训练）。论文里 flow 还承担了"把频谱帧数对齐到波形采样数"的功能——z 是频谱级的，要通过 flow 升级（upsample）成波形级。

### 3. GAN：别让波形糊掉

最后用对抗训练收尾：**判别器（discriminator）** 逼生成器把波形做"尖"、做真实——这吸收了 HiFi-GAN 的思路，VITS 的判别器直接借用了 HiFi-GAN 的**多周期判别器（multi-period discriminator）**结构。GAN 是"最后一公里"的质量保证。

### 4. 随机时长预测器（Stochastic Duration Predictor）：语速的"自由度"

普通时长预测器输出一个确定值（每个字说多长固定），VITS 把它改成**从分布里采样**——配合 flow，让模型能生成多样的节奏。论文明说：这能表达"同一文本可以有不同的语速和韵律"这一天然的一对多关系。

### 5. 对齐（Alignment）：波形级对齐的简化

VITS 用 **Monotonic Alignment Search（单调对齐搜索）** 从后验对齐里"免费"提取文本-波形对齐，免去了 FastSpeech 那样先训老师的蒸馏流程——这是它"训练简单、一步到位"的关键。

## 三、成绩：端到端第一次打赢两段式

LJSpeech 单说话人评测：

- VITS MOS **4.43**；
- 真人录音（ground truth）**4.46**；
- 对比对象包括当时公开可用的最佳 TTS（Tacotron 2、FastSpeech 2 + 各类声码器组合），**VITS 全面胜出**。

数字之外还有两个工程亮点：**推理是并行的**（没有逐帧自回归，声码器环节也并进了网络），速度远快于 Tacotron 2；并且**能通过采样 z 控制韵律多样性**。从此"端到端 + 并行 + 高质量"三件事第一次同时成立。

## 四、影响：两年开源默认基线的由来

VITS 开源后，几乎成为 2021–2023 年开源 TTS 的"标准件"：

- 官方实现（vits）成为许多人训练 TTS 的首选模板；
- ESPnet 集成、Coqui TTS 的 VITS 变体、众多中文 TTS 项目（比如后来的 GPT-SoVITS 基底）都从 VITS 衍生；
- 它证明"VAE + flow + GAN"这个配方可行，直接影响了后续 VALL-E（自回归 token 路线）、NaturalSpeech 系列（也是 VAE 家族）的设计。

## 收尾：我的一点看法

VITS 最打动我的不是某个单项技术，而是它**把"端到端"从口号变成了可复现的标准**。此前"端到端"大多只是"少两个手工特征"，VITS 是真正把梯度从波形回传到文本、把 mel 谱这个中间人开除，并且让质量反超两段式。它回答了 2016 年以来 TTS 圈反复追问的问题："到底需不需要频谱这个中间表示？"——VITS 的答案是"不需要，只要中间有个好的隐变量"。

它也很诚实：MOS 4.43 vs 4.46，虽然"可比"，但**没有宣称超越真人**——韵律自然度仍有缝隙，这缝隙后来由更大的模型（NaturalSpeech、VALL-E 系）去填。另外几个批评点：一是**多说话人/跨语种能力弱**，论文主要是单说话人评测，音色控制手段有限；二是**随机时长预测器的采样质量不稳定**，抽到的时长偶尔不自然；三是训练对 batch 和超参比较敏感，复现成本不低。至于"文本→波形"的简化是否牺牲了可控性——韵律可控性靠抽 z，比显式控制 pitch/energy 更难，这算端到端的代价。

一句话总结：VITS 是"端到端 TTS"这个概念被彻底做完的作品，它之后，TTS 的战场从"怎么端到端"转移到"怎么大规模、怎么零样本"。

---

## 附：核心数据速查

**基本盘**
| 项目 | 数值 |
|---|---|
| 论文 | Conditional Variational Autoencoder with Adversarial Learning for End-to-End TTS |
| 机构 / 发表 | Kakao，ICML 2021，arXiv:2106.06103（2021.06） |
| 输入→输出 | 文本 → 波形（完全端到端，无中间声码器） |
| 架构 | CVAE + Normalizing Flow + GAN + 随机时长预测器 |
| 判别器 | 借用 HiFi-GAN 多周期判别器 |

**核心创新**
| 创新 | 要点 |
|---|---|
| 条件变分自编码器 | 用隐变量 z 建模"文本→波形"的一对多映射 |
| Normalizing Flow | 扭曲前验分布，提升隐变量表达力并承担帧→采样对齐 |
| 对抗训练 | 判别器逼波形更真实，端到端质量保障 |
| 随机时长预测器 | 从分布采样时长，韵律多样可控 |
| 单调对齐搜索 | 免蒸馏、免外部对齐器，训练一步到位 |

**关键成绩**
- LJSpeech MOS **4.43** vs 真人 4.46，超过当时所有公开 TTS 系统
- 推理并行，速度快于两段式自回归方案
- 可采样 z 控制韵律多样性
- 2021–2023 年开源 TTS 默认基线，影响 ESPnet / Coqui / 后续 VAE 系模型

**关键概念清单**
- CVAE = Conditional Variational Autoencoder，条件变分自编码器
- latent variable = 隐变量（z，控制生成多样性的随机来源）
- normalizing flow = 标准化流（可逆变换，把简单分布映射为复杂分布）
- GAN = Generative Adversarial Network，生成对抗网络
- posterior / prior = 后验 / 前验分布
- stochastic duration predictor = 随机时长预测器
- monotonic alignment search = 单调对齐搜索
- multi-period discriminator = 多周期判别器（HiFi-GAN 组件）
- ground truth = 真人录音（评测基准）
