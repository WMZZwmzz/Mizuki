---
title: "01_[开山鼻祖]_Attention_Is_All_You_Need"
published: "2026-07-20"
category: "LLM papers"
lang: "zh"
draft: false
tags: ["Transformer", "架构", "效率", "评估"]
---

> **系列**：LLM 与 Transformer 关键论文深度解读（第 1/8 篇） | 其他论文见本目录 01–08 | 合集见工作区根目录《LLM与Transformer关键论文深度解读.md》。

# [架构奠基] Attention Is All You Need：Transformer 的诞生

## 论文信息

- **标题**：Attention Is All You Need
- **作者**：Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin（Google Brain & Google Research）
- **发表年份**：2017 年
- **会议/期刊来源**：Advances in Neural Information Processing Systems 30（NeurIPS 2017），页 5998–6008
- **arXiv**：1706.03762
- **引用量级**：超 13 万次（截至 2025 年），AI 领域历史上被引次数最高的论文之一

## 一、研究背景与核心问题

2017 年之前，序列建模（机器翻译等 sequence-to-sequence 任务）的主流架构是**循环神经网络（RNN）**，尤其是 LSTM 与 GRU。RNN 逐一处理 token，靠隐藏状态在时间步间传递信息，由此带来三个核心痛点：

1. **无法并行**：第 t 个 token 的计算依赖前 t-1 个 token 的隐藏状态，训练只能串行进行，GPU 利用率极低，序列越长代价越大；
2. **长程依赖衰减**：信息经过多个时间步的传递后发生梯度消失/爆炸，远距离词之间的关联难以被建模（尽管 LSTM 的门控机制有所缓解）；
3. **训练成本高**：串行计算使大规模训练在算力上几乎不可行。

2014 年 Bahdanau 等人的注意力机制（attention）虽让解码器能"直接看向"编码器任意位置，但底层编码仍是循环计算。论文要回答的问题是：**能否完全抛弃循环与卷积，仅靠注意力机制完成序列建模？** 论文摘要开宗明义："我们提出一种新的简单网络架构——Transformer，完全基于注意力机制，彻底摒弃循环与卷积。"

## 二、核心方法与架构创新

Transformer 是一个编码器-解码器（encoder-decoder）结构，核心创新可归纳为四点：

1. **缩放点积注意力（Scaled Dot-Product Attention）**：把"注意力"实现为对查询（Query）与键（Key）做点积打分、再对值（Value）加权求和的可微操作；
2. **多头注意力（Multi-Head Attention）**：将注意力拆成 h 个"头"并行计算，每个头在不同子空间捕捉不同类型的词间关系（如语法关系、指代关系、语义相似度）；
3. **完全并行 + 残差/层归一化**：所有位置同时计算，配合残差连接与层归一化（LayerNorm）保证深层网络可训练；
4. **位置编码（Positional Encoding）**：模型本身没有顺序概念，用正弦/余弦函数为每个位置注入位置信息。

标准配置（base 模型）：编码器 6 层 + 解码器 6 层；模型维度 d_model = 512；注意力头数 h = 8（每头 d_k = d_v = 64）；前馈网络隐层 d_ff = 2048。big 模型将 d_model 扩到 1024、头数 16。全部 Dropout 0.1，优化器 Adam，采用 warmup + 逆平方根学习率调度。

## 三、关键公式与模块设计原理

### 3.1 缩放点积注意力（论文第 3.2.1 节）

$$
Attention(Q, K, V) = softmax\left(\frac{Q K^{\mathsf{T}}}{\sqrt{d_k}}\right) V
$$

- **Q（查询）**：当前 token"想找什么"（"我该关注谁？"）；
- **K（键）**：每个 token"是什么"（供别人匹配的标签）；
- **V（值）**：每个 token 的"实际内容"（被加权取用的信息）；
- **√d_k 缩放因子**：当 d_k 较大时，点积的方差随之增大，softmax 会进入梯度极小的饱和区；除以 √d_k 使点积方差保持在 1 量级，保证训练稳定。

直觉理解：对句子中每个词，计算它与其他所有词的"相关性打分"，softmax 归一化为权重后对 V 加权求和，得到融合全局信息的上下文表征——因此任意两个位置之间都只有"一步"的距离，长程依赖问题被结构性地消除。

### 3.2 多头注意力（第 3.2.2 节）

$$
MultiHead(Q, K, V) = Concat(head_1, \dots, head_h)\, W^{O}
$$

其中每个头：

$$
head_i = Attention(Q W_i^{Q},\ K W_i^{K},\ V W_i^{V})
$$

每个头用独立的可学习投影矩阵 W_i^Q ∈ R^(d_model×d_k)、W_i^K、W_i^V 把输入映射到不同子空间，再拼接、经 W^O 投影回 d_model。多头使模型能同时关注多个不同关系维度，这是单头注意力难以做到的。

### 3.3 位置编码（第 3.5 节）

$$
PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right),\qquad
PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)
$$

其中 pos 是位置序号，i 是维度下标。正弦/余弦形式的相对位置差可表示为线性函数，使模型容易学习到"相对距离"信息。

### 3.4 逐位置前馈网络与整体残差结构（第 3.3 节）

$$
FFN(x) = \max(0,\ xW_1 + b_1)\, W_2 + b_2
$$

每个注意力子层后接一个两层的 ReLU 前馈网络，对每个位置独立施加非线性变换。每个子层外包裹残差连接与层归一化：

$$
LayerNorm(x + Sublayer(x))
$$

## 四、实验设置与主要结果

- **任务**：WMT 2014 英德（En-De）与英法（En-Fr）机器翻译。
- **训练资源**：base 模型在 8 张 P100 GPU 上训练 3.5 天；big 模型同资源 3.5 天（约 12 小时/epoch 量级，远低于当时 SOTA 系统的数天乃至数周）。
- **主要结果**（单模型，BLEU 分数）：
  - En-De：**28.4**，超过此前所有最佳结果（含集成模型，此前最优约 26.8），提升超 2 个点；
  - En-Fr：**41.8**，同样超越此前 SOTA（约 40.6 的集成）。
  - base 模型 En-De 27.3，已超过此前所有单模型。
- **与基线的对比**：RNN 系列（如 GNMT、ConvS2S 卷积基线）在同等训练时长下均显著低于 Transformer，且 Transformer 训练速度快约一个数量级（论文报告 En-De 训练耗时 3.5 天，而当时最先进模型需训练数天到数周、依赖 8–16 块 GPU）。

## 五、局限性与后续影响

**局限性**：
- 自注意力的计算复杂度为 O(n²)（n 为序列长度），长序列上内存与算力开销大（后续 FlashAttention、稀疏注意力等皆为此解药）；
- 位置编码是"外加"的，模型缺乏序列顺序的固有归纳偏置（后续 RoPE 等旋转位置编码对此改进）；
- 原始 Transformer 训练对超参数（学习率 warmup 等）较为敏感，早期复现存在不稳定性。

**后续影响**：Transformer 几乎"一统天下"——
- NLP：GPT 系列（解码器）、BERT 家族（编码器）、T5（编码器-解码器）全部建立在它之上；
- 跨模态：Vision Transformer（ViT）把图像切成 patch 送入 Transformer，AlphaFold2 用它预测蛋白质结构，语音、音乐生成同样受益；
- 论文的 8 位作者此后陆续创办/共同创办多家 AI 公司（如 Adept、Essential AI 等），Transformer 的商业价值可见一斑。

---
