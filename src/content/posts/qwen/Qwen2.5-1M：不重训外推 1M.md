---
title: "Qwen2.5-1M：不重训外推 1M"
published: "2026-07-08"
category: "qwen"
lang: "zh"
draft: false
tags: ["长上下文", "推理", "架构"]
---

# Qwen2.5-1M 论文解读：不重训就能外推到 1M，DCA 这波是巧劲

> 论文：*Qwen2.5-1M Technical Report*
> 作者：An Yang, Bowen Yu, Chengyuan Li, Dayiheng Liu, Fei Huang 等（通义千问团队）
> arXiv: 2501.15383，2025年1月发布。
> 这篇报告干的事情很明确：把 Qwen2.5 的上下文从 128K 拉到 1M tokens，而且核心外推手段不需要额外训练。不是堆算力的故事，是工程巧思的故事。

## 一、问题：RoPE 的长距离困境

### 1. 为什么不能直接推理 1M？

Qwen2.5 用的是 **RoPE（Rotary Position Embedding）** 做位置编码。RoPE 的好处是相对位置天然编码在 attention score 里，但坏处也很明显——模型只见过训练长度以内的相对距离。

你让一个训练窗口 32K 的模型去处理 1M tokens 的输入，query 和 key 之间的相对位置距离会出现大量"从未见过"的值。RoPE 在这些未见距离上的行为基本是随机的，attention 分布直接崩掉。

之前的做法，比如 **PI（Position Interpolation）** 和 **YaRN**，本质上是在频率域做插值或缩放，把大距离"压"回模型见过的范围。能用，但有精度损失，而且压缩是全局的——近距离的 token 关系也被扰动了。

### 2. Qwen2.5-1M 的解法思路

团队的思路是：**训练阶段把原生窗口拉到 256K，推理阶段再用一个免训练的外推方法把 256K 扩到 1M。** 这个免训练方法就是本文的核心贡献——**Dual Chunk Attention（DCA，双块注意力）**。

## 二、Dual Chunk Attention：把长序列"骗"成短序列

### 1. 核心思想

DCA 的想法其实很直觉：既然模型只认识短距离，那我就把长序列切成若干 **chunk（块）**，每块长度小于预训练窗口。块内的 token 正常算 attention，块间的 token 用一套位置映射规则，让模型"以为"它们之间的距离没那么远。

具体来说，DCA 把完整的 L×L attention 矩阵拆成三部分：

- **Intra-Chunk Attention（块内注意力）**
- **Successive-Chunk Attention（相邻块注意力）**
- **Inter-Chunk Attention（跨块注意力）**

### 2. Intra-Chunk Attention：块内正常来

每个 chunk 的大小 w 小于预训练窗口（比如 w=32K，预训练窗口 256K）。块内的 token 保持原始相对位置编码，完全不做任何修改。这部分和标准 attention 一模一样，模型处理起来毫无压力。

### 3. Successive-Chunk Attention：相邻块的边界过渡

相邻两个块之间的 token，距离其实不远（跨越了一个 chunk 边界而已）。这部分用一个局部窗口 W 来保留真实的近距离关系——窗口内的 token 用真实相对位置，窗口外的退回 Inter-Chunk 的规则。

这解决了一个关键问题：如果所有跨块 token 都用"假距离"，那 chunk 边界处的局部连贯性就断了。

### 4. Inter-Chunk Attention：远距离的"善意谎言"

这是最核心的部分。对于不相邻的块之间的 token 对，真实相对距离可能是几十万甚至上百万。DCA 的做法是：

- 给 query 分配一个很大的固定位置索引
- 给 key 的位置做周期性重复映射

效果是：无论两个 token 实际相距多远，模型看到的相对距离都被映射到预训练窗口以内的某个值。远距离的"远"被压缩成一个常数级别的距离——模型不需要区分"距你 50 万 token"和"距你 80 万 token"，它只需要知道"这很远了"。

**关键点：整个过程只修改位置索引，不动模型权重。** 所以不需要任何额外训练。

### 5. 为什么不需要重训？

因为 DCA 本质上是一个推理时的 position index 变换。模型的 Q/K/V 投影矩阵、FFN 权重、LayerNorm 参数——全部不变。你只是告诉模型："嘿，这两个 token 的距离是 3000，不是 300000。" 模型在 3000 这个距离上的行为是训练过的，所以它能正常工作。

论文给了一个很硬的证据：**Qwen2.5-7B-Instruct 和 14B-Instruct 只在 32K 长度上做过 SFT，但加上 DCA 后在 1M token 的 Passkey Retrieval 上达到了接近完美的准确率（超过 80%，14B 接近 100%）。** 没做任何长序列训练，纯靠推理时的位置映射。

## 三、训练管线：渐进式拉长 + 两阶段 SFT

### 1. 渐进式预训练

虽然 DCA 不需要训练，但模型的原生窗口还是要从 4K 拉到 256K 的。团队用的是 **渐进式预训练（Progressive Pre-training）**：

| 阶段 | 上下文长度 | RoPE base |
|------|-----------|-----------|
| 1 | 4,096 | 10,000 → 调整中 |
| 2 | 32,768 | 调整中 |
| 3 | 65,536 | 1,000,000 |
| 4 | 131,072 | 5,000,000 |
| 5 | 262,144 | 10,000,000 |

RoPE base 从原始的 10,000 一路调到 10,000,000——这就是 **Adjusted Base Frequency（ABF）**。base 越大，高频分量越少，位置编码在长距离上衰减越慢，模型越能"看到"远处的 token。

数据配比上，后三个阶段用 75% 当前最大长度 + 25% 短序列的混合，防止短文本能力退化。

### 2. 长数据合成

自然界的长文本（Common Crawl、arXiv、书籍、代码仓库）有个问题：长距离依赖关系往往很弱。一本书第 3 章和第 87 章可能没什么语义关联。

团队合成了三类预训练任务来强化长距离依赖：
- **Fill-in-the-middle**：从长文本中间挖空让模型填
- **关键词/位置检索**：在长文本中找特定信息
- **段落重排序**：打乱段落顺序让模型恢复

### 3. 两阶段 SFT

- **Stage 1**：只用短指令数据（≤32K tokens），和 Qwen2.5-128K 版本完全一样的数据和步数。目的是先稳住短文本能力。
- **Stage 2**：混合短指令（≤32K）和长指令（≤256K），长指令数据由 Qwen-Agent 通过 RAG + 分块阅读 + 逐步推理生成。

### 4. RL 的意外发现

强化学习阶段只用了 ≤8K tokens 的短文本做偏好对齐（类似 DPO）。结果发现：**短文本上学到的人类偏好对齐能力，能泛化到长文本任务上。** LongBench-Chat 的分数确实涨了。这省了一大笔长序列 RL 的训练成本。

## 四、跟 YaRN、MInference 的关系：不是替代，是组合

### 1. DCA + YaRN

论文里 DCA 不是单独用的，而是和 **YaRN 的 attention scaling** 配合使用。YaRN 负责在 attention score 上做一个温度缩放（补偿长序列下 softmax 的熵增），DCA 负责位置映射。两者正交，互不干扰。

实验表明 DCA + YaRN 不改变短序列行为——短文本上该怎样还怎样。

### 2. 跟 NSA / 其他稀疏注意力的区别

**NSA（Native Sparse Attention）** 是 DeepSeek 提出的训练时稀疏注意力，需要从头训练。DCA 完全是推理时的方法，不动训练流程。

推理加速方面，Qwen2.5-1M 用的是基于 **MInference** 的稀疏注意力——利用 attention map 的 vertical-slash 模式（少数 key token 吸引大量注意力），离线搜索每个 head 的稀疏配置，推理时只算关键 token 的 attention。这跟 DCA 是不同层面的优化：DCA 解决"能不能处理"的问题，MInference 解决"处理得快不快"的问题。

### 3. Qwen2.5-72B 的有趣对照

论文提到一个很有意思的实验：**Qwen2.5-72B-Instruct 只训练到 32K，但加上 DCA + YaRN 后，在 LV-Eval（256K 长度）上持续优于专门训练到 256K 的 Qwen2.5-14B-Instruct-1M。** 这说明模型基础能力 + 好的外推方法，可能比硬训长窗口更有效。

## 五、实验结果：数字说话

### 1. Passkey Retrieval（1M tokens）

在 1M token 的无关文本中藏一个 passkey，让模型找出来：

- **Qwen2.5-14B-Instruct-1M**：准确率接近 100%
- **Qwen2.5-Turbo**：100%
- **Qwen2.5-7B-Instruct-1M**：有少量错误，但整体表现良好

作为对比，没有 DCA 的模型在这个长度上基本是随机猜。

### 2. RULER（128K tokens）

RULER 是 Passkey Retrieval 的升级版，包含多针检索、多问题回答、高频词查找等任务：

| 模型 | RULER @128K |
|------|-------------|
| Qwen2.5-Turbo | 93.1 |
| Qwen2.5-14B-Instruct-1M | 92.2 |
| GPT-4 | 91.6 |
| GLM4-9B-1M | 89.9 |

14B 的开源模型干到了 GPT-4 上面，这在长上下文任务上是很强的表现。

### 3. LV-Eval（256K）和 LongBench-Chat（100K）

- LV-Eval 要求同时理解多个证据片段，Qwen2.5-1M 系列在大多数维度上超过 GPT-4o-mini
- LongBench-Chat 评估人类偏好对齐，RL 的加入带来了明显提升

### 4. 短文本不退化

在 MMLU-Pro、GSM8K、MATH、HumanEval、LiveCodeBench 等标准 benchmark 上，1M 版本和 128K 版本表现基本一致。Qwen2.5-14B-Instruct-1M 在短文本上和 GPT-4o-mini 打平，但上下文长度是人家的 8 倍。

## 六、推理加速：从 12 分钟到 109 秒

### 1. 问题有多严重？

1M token 的 full attention，prefill 阶段注意力计算占前向传播 90% 以上的时间。Qwen2.5-7B 如果直接 prefill 1M tokens，光一层 MLP 的激活内存就要 **71GB**。

### 2. Chunked Prefill

把输入切成 32,768 token 的块逐块 prefill，激活显存直接降 **96.7%**。同时避免长 prefill 阻塞 decode 请求。

### 3. 稀疏注意力 + 核优化

基于 MInference 的稀疏注意力把计算量压缩约 **12.5 倍**。但原始 MInference 在超长序列上有精度问题——超过 400K tokens 后准确率可能掉到 60% 以下。

团队的修复方案：
- 在关键 token 选择阶段恢复连续相对位置（解决 DCA 非连续位置对 diagonal pattern 的干扰）
- 用 1M token 的校准集重新搜索稀疏配置（原始搜索通常在 32K 以下做）

修复后精度基本恢复，同时保持约 4 倍 prefill 加速。

### 4. 最终速度

| 场景 | Full Attention | 优化后 | 加速比 |
|------|---------------|--------|--------|
| Qwen2.5-14B-1M @H20 | 12.2 分钟 | 109 秒 | ~6.7x |
| Qwen2.5-Turbo @H20 | 4.9 分钟 | 68 秒 | ~4.3x |

在 A100 上，MInference 稀疏核比 FlashAttention 快 **13.7 倍**，BladeLLM 优化后达到 **27.8 倍**。峰值 FLOPs 利用率到 90%。

## 七、部署：门槛不低但方案清晰

开源部署需要自定义 vLLM 分支（`dev/dual-chunk-attn`），硬件要求：

| 模型 | 最低总显存 | 最大 TP 数 |
|------|-----------|-----------|
| Qwen2.5-7B-Instruct-1M | 120GB | 4 GPU |
| Qwen2.5-14B-Instruct-1M | 320GB | 8 GPU |

推荐 Ampere 或 Hopper 架构 GPU，CUDA 12.1/12.3。如果显存不够，可以缩短 `--max-model-len` 处理较短输入。FP8 量化可以进一步降低显存占用。

## 收尾：我的一点看法

DCA 这个方法的精妙之处在于，它承认了一个事实：对于大多数长文本任务，模型不需要精确区分"50 万 token 远"和"80 万 token 远"。它只需要知道"这很远了，但内容还是要注意到"。把连续的距离空间离散化成"块内/相邻块/远块"三档，用最小的信息损失换来了免训练的外推能力。

72B + DCA 打败专门训练的 14B-1M 这个实验特别有说服力。它暗示了一个方向：与其花大力气做长序列训练，不如把基础模型能力做扎实，然后用聪明的推理时方法去外推。训练成本是实打实的钱，推理时的位置映射是零成本的。

当然 DCA 不是万能的。Passkey Retrieval 本质上是一个"找到那个针"的任务，对语义理解的要求不高。在需要真正理解 1M token 全文逻辑关系的任务上（比如跨章节推理、全文摘要），DCA 的"善意谎言"能撑到什么程度，论文没有给出特别令人信服的证据。RULER 和 LV-Eval 的结果不错，但这些 benchmark 的难度天花板也在那里。

推理框架的工程完成度很高。从 MInference 集成、chunked prefill、稀疏配置精化到 BladeLLM 的核优化，整条链路都做了。27.8 倍于 FlashAttention 的稀疏核加速，90% 的 FLOPs 利用率——这是真正能部署的数字，不是论文里的玩具。

最后说一句：这篇报告的范围比较窄，就是"怎么把 Qwen2.5 拉到 1M"这一个问题的完整解答。没有新架构，没有新训练范式，有的是对已有技术的精准组合和工程打磨。但有时候，把正确的事情做到位，本身就是最大的贡献。

## 附：核心数据速查

### 关键数字

| 项目 | 数值 |
|------|------|
| 最大上下文长度 | 1,000,000 tokens |
| 原生训练窗口 | 256K tokens |
| DCA 外推倍数 | ≥4x（256K → 1M） |
| RoPE base 调整 | 10,000 → 10,000,000 |
| Passkey Retrieval @1M（14B） | ~100% |
| RULER @128K（14B-1M） | 92.2 |
| RULER @128K（GPT-4） | 91.6 |
| Prefill 加速（1M tokens） | 3x - 7x |
| 14B TTFT @H20 优化后 | 109 秒（原 12.2 分钟） |
| 稀疏注意力计算压缩 | ~12.5x |
| Chunked Prefill 显存节省 | 96.7% |
| 7B 最低部署显存 | 120GB |
| 14B 最低部署显存 | 320GB |

### 核心概念清单

| 概念 | 一句话解释 |
|------|-----------|
| DCA（Dual Chunk Attention） | 推理时位置映射方法，把长序列切块后让模型"以为"距离很短，免训练外推 |
| Intra-Chunk Attention | 块内注意力，保持原始相对位置，不做任何修改 |
| Inter-Chunk Attention | 跨块注意力，把远距离映射为常数级别的"假距离" |
| Successive-Chunk Attention | 相邻块注意力，用局部窗口保留边界处的真实近距离关系 |
| Adjusted Base Frequency | RoPE base 从 10K 调到 10M，让位置编码在长距离上衰减更慢 |
| Progressive Pre-training | 分阶段拉长训练窗口：4K → 32K → 64K → 128K → 256K |
| MInference | 基于 vertical-slash 模式的稀疏注意力，离线搜索每个 head 的稀疏配置 |
| Chunked Prefill | 把长输入切块逐块 prefill，避免激活内存爆炸 |
| YaRN | 注意力温度缩放方法，与 DCA 正交互补 |
| BladeLLM | 阿里内部推理引擎，核优化后比 FlashAttention 快 27.8x |
