---
title: "[TTS] NaturalSpeech：把像真人做实"
published: "2026-07-20"
category: "音频生成模型"
lang: "zh"
draft: false
tags: ["TTS", "评估", "架构"]
---

# NaturalSpeech 系列论文解读：微软三代接力，把"像真人"从口号做成事实

> 论文：*NaturalSpeech: End-to-End Text to Speech Synthesis with Human-Level Quality*（arXiv:2205.04421，2022.05）
> *NaturalSpeech 2: Latent Diffusion Models are Natural and Zero-Shot Speech and Singing Synthesizers*（arXiv:2304.09116，2023.04）
> *NaturalSpeech 3: Zero-Shot Speech Synthesis with Factorized Codec and Diffusion Models*（arXiv:2403.03100，2024.03）
> 作者/机构：微软亚洲研究院（Xu Tan、Tao Qin、Sheng Zhao、Tie-Yan Liu 等）

Tacotron 2 拿到 4.53 时说"接近真人"，VITS 拿到 4.43 时说"可比"。微软的 NaturalSpeech 系列则直接把目标定义成数学题：什么叫人类级？用统计检验说话。第一代在 LJSpeech 上做到 CMOS **-0.01**——与真人录音**无统计显著差异**（Wilcoxon 符号秩检验 p >> 0.05），这是这个数据集上第一次官方盖章的"人类级"。二代换掉 VAE 的配方，改用 **RVQ（残差向量量化）+ 潜扩散（latent diffusion）**，把规模推到 4.4 万小时，实现零样本和歌声合成。三代更进一步，用 **FACodec 把语音分解成内容/韵律/音色/声学细节四个子空间分别生成**，规模推到 **1B 参数 / 20 万小时**。三部曲拼起来，正好是 TTS 从"单说话人刷分"走向"大规模零样本"的完整路线图。

---

## 一、NaturalSpeech 1（2022.05）：把"人类级"变成可检验的指标

### 1. 立标准：什么叫"人类级"？

论文先回答了一个之前没人较真的问题：你怎么知道一个 TTS 达到人类级了？答案很严谨——**用统计显著性判断**。做法是让受试者对"合成语音 vs 真人录音"做比较式打分（CMOS，comparative MOS，比较平均意见分），再用 Wilcoxon 符号秩检验（Wilcoxon signed-rank test）看差异是否显著。只有差异不显著，才配叫"人类级"。

### 2. 架构：VAE 的"加强版"

NaturalSpeech 依然是 VAE（变分自编码器）家族——文本经 prior（前验）采样出隐变量，再生成波形。但为了把前验做"强"、把后验做"简单"，它上了四个模块：

- **音素预训练（phoneme pre-training）**：先在大规模纯文本/无标注数据上预训练音素编码器，让 prior 从一开始就"懂语言学"；
- **可微时长建模（differentiable duration modeling）**：时长经过软化（soft）处理变得可微分，让对齐信息能直接反向传播，替代 FastSpeech 式的离散时长；
- **双向 prior/posterior 建模（bidirectional prior/posterior）**：训练时同时优化前验和后验，减小两者差距，减少"train-test 不一致"；
- **记忆机制（memory mechanism）**：在 VAE 里加入"记忆库"，显式存储发音模式，缓解 prior 容量不足。

### 3. 成绩

LJSpeech 句级评测：CMOS **-0.01**（负数表示略差于真人，-0.01 基本就是"没差"），Wilcoxon 检验 **p >> 0.05**——统计上无法区分合成与真人。这是 LJSpeech 上第一次有人宣称达到"人类级"。注意它的口径：单说话人、句级、英文数据集，不是多说话人零样本。

## 二、NaturalSpeech 2（2023.04）：VAE 退役，扩散登台，迈向零样本

### 1. 为什么换配方

VAE 路线（含 VITS/NaturalSpeech 1）有几个天花板：扩展到大语料、多说话人时，prior 容量吃紧；训练目标偏重建，表达力有限。NaturalSpeech 2 彻底转向当时图像领域最火的 **扩散模型（diffusion model）**：

- 先把语音经**神经音频编解码器（neural audio codec）**压缩，编解码器用 **RVQ（residual vector quantization，残差向量量化）** 把波形量化成连续潜向量；
- 再用**潜扩散模型（latent diffusion）**在潜空间里生成，以文本为条件；
- **潜扩散 + RVQ 的好处**：生成在低维潜空间进行，计算量可控，同时保留高质量重建，避免了自回归 token 模型（比如 VALL-E 那类）逐 token 生成时的韵律不稳、跳字重复问题。

### 2. 零样本怎么来

论文设计了**语音提示机制（speech prompting）**：给模型一段参考语音作为条件（in-context learning，上下文学习），让扩散模型和时长/音高预测器都"照着参考说话人"生成——这就是零样本（zero-shot）克隆的核心。规模和效果：

- 训练数据 **4.4 万小时**（44K hours，语音 + 歌声混合）；
- 在**未见过的说话人**上评测，韵律/音色相似度、鲁棒性、音质全面大幅超越之前的 TTS；
- 新能力：**只用一段语音提示就能零样本合成歌声（zero-shot singing synthesis）**——念稿的人声也能唱起来。

### 3. 里程碑意义

NaturalSpeech 2 是"扩散路线 TTS 大规模零样本"的代表作之一（同期还有 Voicebox），它证明：**不靠自回归 token、不靠 VAE，扩散照样能在大语料上做高质量零样本 TTS**。自回归与扩散"两条腿走路"的格局就此定型。

## 三、NaturalSpeech 3（2024.03）：把语音拆成四份，分别生成

### 1. 动机：语音太"杂"了

一句话语音里同时叠着：说了什么（content，内容）、怎么说的（prosody，韵律）、谁在说（timbre，音色）、以及细微的声学细节（acoustic details）。这些属性纠缠在一起，一个模型全都自己猜，很难做到又像又自然。NaturalSpeech 3 的思路是**分而治之（divide-and-conquer）**。

### 2. 两个关键组件

- **FACodec（factorized codec，分解式编解码器）**：用**分解式向量量化（factorized vector quantization，FVQ）**把波形**解耦（disentangle）**到四个独立子空间——content、prosody、timbre、acoustic details，每个子空间自己的码本，互不纠缠；
- **分解式扩散模型（factorized diffusion model）**：分别对每个子空间生成，各自以对应的提示（prompt）为条件——生成内容时看文本，生成音色时看参考说话人，如此类推。通过这种分解，模型能高效、精确地建模复杂语音。

### 3. 规模与成绩

- 参数量推进到 **1B**，训练数据 **20 万小时（200K hours）**；
- 零样本（zero-shot）设定下，在多说话人数据集（如 LibriSpeech）上**质量、相似度、韵律、可懂度全面超过当时 SOTA**，并与真人录音达到同等水平（on-par with human recordings）；
- 论文明确表示：scale 到 1B/200K 小时还能继续带来提升——规模红利依然在。

### 4. 与 VALL-E 系、扩散系的关系

NaturalSpeech 3 处于"LLM 定内容、扩散定细节"之外的第三条路——**分解（factorization）**。它没有用自回归 token，也没有一个扩散模型硬啃全部属性，而是"各管各的、最后合起来"。这条思路后来影响了许多分解式 TTS 工作。

## 收尾：我的一点看法

NaturalSpeech 三部曲最值得品的，是它对"人类级"的态度。第一代它较真地引入统计检验，把模糊的"听起来像人"变成"p 值大于 0.05"——这种给评测立规矩的做法，比刷一个更高的 MOS 更有价值。而后两代的路线切换（VAE → 扩散 → 分解）也说明：这个领域没有"一招鲜"，每一代都在质疑上一代的基本盘。

我的批评有三点。第一，**"人类级"的成立范围很窄**：第一代是单说话人句级，第三代的多说话人评测也主要在 LibriSpeech 这类朗读语料上，离"日常对话里的自然"还有距离；第二，**分解的正确性依赖 FACodec 解耦得好不好**——如果码本里内容、音色没分干净，分解就只是自欺欺人；第三，**规模上去了，效率没提**：1B/200K 小时的训练成本不低，推理也重，这决定了它难以像 VITS 那样成为人人可跑的开源基线（事实也确实如此，NaturalSpeech 系开源程度和社区采用度都低于 VITS）。

但方向上我完全认同：**当"像不像真人"不再是瓶颈，瓶颈就变成了"能不能在大数据上稳定地零样本、跨语种、跨任务"**。NaturalSpeech 系列就是把这个问题一步步具体化、可操作化的最好范本。

---

## 附：核心数据速查

**基本盘**
| 项目 | 数值 |
|---|---|
| NaturalSpeech 1 | VAE 端到端，LJSpeech 句级 CMOS **-0.01**，p >> 0.05（无统计显著差异） |
| NaturalSpeech 2 | RVQ 编解码器 + 潜扩散，**4.4 万小时**，零样本 + 歌声合成 |
| NaturalSpeech 3 | FACodec 分解 + 扩散，**1B / 20 万小时**，零样本多说话人 |

**核心创新**
| 创新 | 要点 |
|---|---|
| 统计显著性判"人类级"（NS1） | CMOS + Wilcoxon 检验定义并验证人类级 |
| 强化 VAE 四件套（NS1） | 音素预训练 / 可微时长 / 双向 prior-posterior / 记忆机制 |
| RVQ + 潜扩散（NS2） | 在潜空间生成，避免自回归 token 的韵律不稳与跳字 |
| 语音提示零样本（NS2） | 扩散与时长/音高预测器做 in-context 参考克隆，并支持歌声 |
| FACodec 分解（NS3） | FVQ 把语音解耦为 content/prosody/timbre/acoustic details 四子空间 |
| 分解式扩散（NS3） | 各子空间分别生成、各自条件，分而治之 |

**关键成绩**
- NaturalSpeech 1：LJSpeech 首次官方宣称"人类级"（CMOS -0.01，p >> 0.05）
- NaturalSpeech 2：零样本 + 零样本歌声合成，韵律/相似度/鲁棒性大幅超越此前系统
- NaturalSpeech 3：质量/相似度/韵律/可懂度全面 SOTA，多说话人上与真人同水平

**关键概念清单**
- CMOS = Comparative Mean Opinion Score，比较平均意见分
- Wilcoxon signed-rank test = 威尔科克森符号秩检验（非参数统计检验）
- VAE = Variational Autoencoder，变分自编码器
- RVQ = Residual Vector Quantization，残差向量量化
- latent diffusion = 潜扩散（在压缩潜空间里做扩散生成）
- neural audio codec = 神经音频编解码器
- zero-shot = 零样本（用参考语音提示克隆未见说话人）
- in-context learning = 上下文学习
- FACodec = Factorized Codec，分解式编解码器
- FVQ = Factorized Vector Quantization，分解式向量量化
- disentangle = 解耦（把纠缠属性分到独立子空间）
- content / prosody / timbre / acoustic details = 内容 / 韵律 / 音色 / 声学细节
