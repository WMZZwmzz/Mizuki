---
title: "MiniMax-01：4M 上下文破局"
published: "2026-08-01"
category: "minimax"
lang: "zh"
draft: false
tags: ["长上下文", "MoE", "开源", "架构"]
---

# MiniMax-01 论文解读：456B 总参、4M 上下文，混合注意力第一次在千亿模型里挑大梁

> 论文：*MiniMax-01: Scaling Foundation Models with Lightning Attention*
> 作者：MiniMax（89 位作者联合署名）
> 这是 MiniMax 第一次向世界亮出完整技术栈的开源旗舰：456B 总参、每 token 只激活 45.9B，用 Lightning Attention + MoE 把上下文撑到训练 1M、推理外推 4M token，性能对标 GPT-4o 和 Claude-3.5-Sonnet。它也是行业里第一个把线性注意力做到千亿规模并完整开源的大模型——后续 MiniMax-M1 等所有 M 系列的地基，理解 MiniMax 后来的每一次出手，都得从这篇读起。

---

## 一、引言：上下文卡在平方复杂度上

先摆问题：2024 年底的主流模型，上下文窗口普遍在 32K 到 256K 之间。听起来不小，但真要用起来就露馅——想塞进一本专业书、一个完整的代码仓库、或者靠很多-shot 示例做 in-context learning，都不够。

为什么扩不动？根子在 **softmax attention** 的复杂度是序列长度的平方（O(N²)）。这两年上下文从 4K 涨到 256K，靠的主要是更强的 GPU 和 FlashAttention 这类 I/O-aware 实现，但架构本身没变：序列再翻倍，注意力算力需求翻四倍，硬件增速根本追不上。

学界不是没给解药：稀疏注意力、线性注意力、长卷积、Mamba 这类状态空间模型、线性 RNN……论文直言，这些方案理论漂亮，却几乎没在商业规模模型上被真正验证过。MiniMax 的野心很直接：做一个性能对标顶级闭源模型、上下文却长一个数量级的开源模型。他们押的宝就是 **lightning attention（闪电注意力）**——一个 I/O-aware 的线性注意力实现，外加 MoE 把算力吃满。

## 二、架构总览：456B 里只激活 45.9B

最终拍板的规格：**32 个专家、456B 总参数、每 token 激活 45.9B**，80 层、隐层 6144、64 个注意力头（每头 128 维）。MoE 用 top-2 路由，每个专家的 FFN 隐层 9216。注意力是混合的：**每 7 个带 lightning attention 的 transnormer block 后面，接 1 个 softmax attention block**（80 层里 72 层线性、8 层 softmax），softmax 层用 GQA（group size 8），RoPE 只施加在注意力 head 维度的一半上、base 频率 10000。归一化用 DeepNorm 加持的 PostNorm——消融实验里，PostNorm 各项全面压过 PreNorm。

参数量不是拍脑袋定的，而是来自一个很实在的约束：**单机 8 张 80G 显卡、640GB 显存、8-bit 量化下要能塞下 1M token 的上下文**，所以总参数封顶 500B。在这个约束下做优化，再套上他们修正过的 scaling law 公式，456B / 45.9B / 32 专家就是最优解。

## 三、为什么是"7 份线性 + 1 份 softmax"

这个配比是拿实验喂出来的。MiniMax 在 70M 到 7B 六个规模、最多 300B token 上对比了三种注意力：纯 softmax、纯 lightning、混合。结论分两层：

**纯线性注意力不能单独用。** 按 Chinchilla 的方法拟合 scaling law，同算力下 lightning 和 hybrid 的 loss 都比纯 softmax 低，训练速度上 lightning 更是全场唯一能跑赢 FlashAttention2 的线性模型（序列 1K 到 64K，速度恒定不随长度掉）。但一到 **NIAH（大海捞针）检索任务就翻车**——论文原话：线性注意力"retrieval capabilities 有限"，而这恰恰是 in-context learning 的地基。直觉上也好理解：softmax 每来一个 token 都从初始状态把整条历史"重算"一遍，像**从头翻一遍书**，信息不丢；线性注意力只维护一份固定大小的"状态笔记"，是**有损压缩**，笔记再厚也存不下全文。

**混合架构反而能反超。** 每 8 层掺 1 层 softmax 的 hybrid-lightning，不仅把检索短板补上，NIAH 和外推能力甚至超过纯 softmax——这有点反直觉。论文给了一个解释：把 softmax 写成线性循环形式，它的隐状态容量是 O(N)；而 lightning 的容量是 O(d²/β)，d（隐层维）远大于 β（block 大小），所以混合模型的实际容量反而更大。跟 hybrid-cosformer2、hybrid-hgrn2、hybrid-window（滑窗注意力）几个变体同配置对比，hybrid-lightning 全面胜出，尤其 NIAH 一骑绝尘。

## 四、MoE 的 scaling 选择与工程

MoE 的价值论文用 isoflop 实验背书：同样算力预算，24B 总参/2B 激活的 MoE 全面碾压 7B 稠密。放大后遇到两个坑，各给了解法：

**路由崩溃（routing collapse）。** 少数专家霸榜、负载失衡，解决靠 GShard 式辅助损失（系数 0.01）+ 一个自研的 **global router**：跨专家并行组额外加一次 allgather，同步各专家待处理的 token 数再统一调度，把整体 token 丢弃率压下来。训练采用 token-drop 策略（专家容量满就丢 token）换效率。

**通信开销。** MoE 的 all-to-all 通信是训练大头。MiniMax 把专家并行的 ProcessGroup 拆成 **ETP（Expert Tensor Parallel，专家张量并行）** 和 **EDP（Expert Data Parallel，专家数据并行）**，让 MoE 的并行策略跟非 MoE 部分彻底解耦，再配合 EP-ETP 重叠调度（把 token 分组、计算和通信交错执行）。效果：MoE 纯通信开销砍掉 50%。

## 五、预训练：数据、超参，和 1M 是怎么训出来的

**数据。** 语料覆盖学术、书籍、网页、代码。质量把关用自家上一代模型（60B 总参 MoE）当 reward labeler 打分，聚焦知识深度、实用性、类别分布三个维度；格式上发现过度 Markdown 化反而伤多样性，改用嵌套文档模板；数据混合靠一套"repetition-aware"实验框架调——高质文档能训到 4 个 epoch，低质的两轮就掉点。分词用 byte-level BPE，词表 200K。

**超参。** 训练从 8192 序列开始，batch size 按"临界 batch size"幂律从 16M 一路翻倍到 128M；学习率 2e-4 恒定跑 7.2T token，之后发现梯度范数异常，降到 1.3e-4 再跑 3.2T，最后 1T token 快速衰减到 3e-5——按这个计划合计约 10T+ token。集群是 1500 到 2500 张 H800 的动态规模。

**1M 上下文三阶段扩展。** 128K 阶段喂 300B token（70% 中长数据）、RoPE base 提到 5M；512K 阶段 32B token；1M 阶段 26B token、RoPE base 10M。每阶段最后 20% 混入 10% 同长度分布的高质量长上下文 QA 数据，数据源权重用线性插值平稳过渡防失稳。配套工程是 **varlen ring attention**（softmax 侧，data-packing 后直接对整条打包序列做环注意力，避免传统 ring attention 的 padding 浪费）和 **LASP+**（线性注意力序列并行改进版，用 local prefix sum + allgather 把串行依赖变并行，提速最高到 1/N）。

**4M 是怎么来的？** 训练只到 1M，但 vanilla NIAH 压力测试一路绿到 **4M**——外推能力来自两点：混合架构本身外推就好（第三节的结论），加上 RoPE 只打在半个 head 维度上。论文也坦率承认 NIAH 对自家模型太简单（128K 步就满分），后来换 MR-NIAH 这种更难的任务监控训练。

## 六、对齐：四维奖励 + 五阶段

奖励模型管四个维度：**correctness（正确性）**（数学用早期版模型判一致性、代码在沙箱跑测试）、**truthfulness（真实性）**（拆句聚类 + 众包核验）、**helpfulness（有用性）**、**harmlessness（无害性）**（Constitutional AI 路线）。SFT 用领域专家模型 + rejection sampling 造数据。

五阶段训练法很讲究：S1 短上下文 SFT（8192）；S2 直接跳到 **1,032,192** 的长上下文 SFT（50% 长上下文 prompt）；S3 短上下文 DPO；S4 长上下文 DPO；S5 短上下文在线 RL。在线 RL 是魔改版 **GRPO**：给重要性采样权重加双端裁剪（原来只裁上限）、把 KL 项改造成 stop-gradient 形式降梯度方差、再做正负样本 advantage 均衡。RoPE base 全程保持 10M。

## 七、评测：短的不虚，长的通杀

**核心 benchmark**：MMLU 88.5（与 Claude-3.5-Sonnet 的 88.3、DeepSeek-V3 的 88.5 同级）；**C-SimpleQA 上超过所有对比模型**（GPT-4o 64.6、Claude 56.8）；GPQA Diamond 54.4，超过 GPT-4o（46.0）和多数开源指令模型；MATH pass@1 77.4，比 GPT-4o 和 Claude-3.5-Sonnet 都高；HumanEval 86.9 与 Qwen2.5-72B-Instruct 相当；SimpleQA 75.7，和 Gemini 系列同级、远超 GPT-4o 与 Claude；IFEval、Arena-Hard 位列前三。短板也在：MBPP+ 71.7 偏弱，论文自认预训练代码数据不够，复杂编程是后续要补的课。

**长上下文是主场**：RULER 上 128K 起全面领先——128K 时 0.947 对 Claude-3.5-Sonnet 的 0.938，1M 时 0.910 对 Gemini-1.5-Pro 的 0.850，GPT-4o 根本测不到这个长度。**LongBench v2** 的 w/ CoT 设置下，论文称在全部被评测系统中拿下 SOTA；据官方模型卡与媒体报道，仅次于 OpenAI 的 o1-preview 和人类水平。自建的 **MR-NIAH**（多轮大海捞针，2K 到 1M token、约 2000 轮对话）中英文都几乎不随长度衰减，GPT/Claude/Gemini 都做不到。**MTOB**（用一本书学一门濒危语言 Kalamang）上，无上下文时因为预训练几乎没见 Kalamang 而垫底，但半本书/整本书的增量学习超越所有对手。自家 Hailuo AI 用户场景的 in-house 评测（长上下文 93.8、创作 81.3）也全面领先，加搜索工具后端到端从 58% 跳到 71.5%。

## 八、VL-01：512B token 长出来的眼睛

**MiniMax-VL-01** 是标准的 ViT-MLP-LLM 接法：一个 **ViT-L/14** 视觉编码器（303M 参数，从头训练，先用 37B 图文对在 224×224 上预训练、再用 1.2B 对在 336×336 微调，CoCa 式对比学习，ImageNet-1K zero-shot 80.55%）+ 随机初始化的两层 MLP projector + MiniMax-Text-01 底座。图文数据上，ViT 用了 **6.94 亿图文对**，另有 1 亿张带细粒度描述（约 300 token/图）的图片数据。

有个设计很体现"长上下文思维"：动态分辨率 336 到 2016，patch 特征**不做池化压缩**，直接以原始高维特征喂给 LLM——传统 VLM 怕序列太长才压缩特征，MiniMax 反而用长上下文能力"白嫖"信息量。训练四阶段：模态对齐（80B token，固定 336×336）→ 视觉理解增强（420B 多模态 token，与 Text-01 后训练数据 20:1 混合）→ 用户体验（44.8B 真实场景数据，1 epoch）→ DPO 偏好优化（4 万对，早停防过拟合），合计约 **512B vision-language token** 续训。

结果：MMMU 68.5、MMMU-Pro 52.7、ChartQA 91.7、DocVQA 96.4、OCRBench 865、AI2D 83.3、MathVista 68.6——多模态通用能力跟 GPT-4o 同档；长文档 MMLongBench-Doc 32.5，仅次于 GPT-4o。短板是 OlympiadBench 只有 24.2，数学推理明显吃力。

## 收尾：我的一点看法

读这篇最过瘾的地方，是它跟 DeepSeek-V3 正好构成两条对照路线。DeepSeek 赌的是"softmax 不能丢，但 KV cache 可以压"——MLA 把每 token 的缓存压成一个小向量，省的是**显存**；MiniMax 赌的是"注意力本身可以换"——线性注意力把复杂度从 O(N²) 降到 O(N)，省的是**算力**。V3 用 MLA + 稠密激活把性价比打到极致，MiniMax-01 用 7:1 混合把上下文做到 4M。谁对谁错没有答案，但 4M 这个数字证明：当所有人默认堆 softmax 时，换引擎确实能打开一个数量级的空间。

4M 上下文不是炫技。它是给 agent 时代准备的：一本书、一个仓库、两千轮对话、一张高清大图的全部像素——这些"装得下"和"装不下"是质变。VL-01 敢不压缩图像特征，底气就是这 4M。后来 M1 在这个底座上长出了 100 万上下文的深度推理，MiniMax 的整条产品线都在这篇的地基上。

冷水也要泼。混合架构的本质是"有损压缩 + 1/8 精确索引"的妥协：纯线性注意力检索不行，全靠那 8 层 softmax 兜底——论文自己在未来工作里也说，想把最后 1/8 也干掉。检索的"绿"目前主要靠 vanilla NIAH，论文也承认它太简单、128K 步就满分。另外复杂编程弱、Kalamang 无上下文垫底，说明这个架构的胜利还不是全面的。但对开源社区来说，它最大的贡献是把"线性注意力能不能真打"这个悬了九年的问题，用一套完整权重给出了答案——而且答案是能。

---

## 附：核心数据速查

**MiniMax-Text-01 基本盘**
| 项目 | 数值 |
|---|---|
| 总参数 / 激活参数 | 456B / 45.9B（每 token） |
| MoE | 32 专家，top-2 路由，每专家 FFN 隐层 9216 |
| 层数 / 隐层维度 | 80 / 6144 |
| 注意力 | 混合：72 层 Lightning Attention + 8 层 Softmax Attention（每 7:1 交替） |
| 注意力头 | 64 头 × 128 维；softmax 层 GQA（group 8） |
| RoPE | 只施加于半个 head 维度，base 10K（长上下文阶段 5M/10M） |
| 上下文 | 训练 1M token，推理外推 4M token（GPT-4o 的 32 倍、Claude-3.5-Sonnet 的 20 倍） |
| 预训练数据 | 约 10T+ token（7.2T + 3.2T + 1T 分阶段），词表 200K |
| 训练集群 | 1500–2500 张 H800 |
| 归一化 / 正则 | DeepNorm 加持的 PostNorm |
| 开源 | 完整权重开源（Hugging Face / GitHub），商用 MAU 超 1 亿需额外授权（据报道） |

**核心 benchmark（MiniMax-Text-01 对主要对手）**
| Benchmark | MiniMax-Text-01 | GPT-4o (11-20) | Claude-3.5-Sonnet (10-22) |
|---|---|---|---|
| MMLU | 88.5 | 85.7 | 88.3 |
| C-SimpleQA | 超过所有对比模型 | 64.6 | 56.8 |
| SimpleQA | 75.7 | 39.0 | 28.1 |
| GPQA Diamond | 54.4 | 46.0 | 65.0 |
| MATH | 77.4 | 76.6 | 74.1 |
| GSM8k | 94.8 | 95.6 | 96.9 |
| HumanEval | 86.9 | 90.2 | 93.7 |
| MBPP+ | 71.7 | 76.2 | 75.1 |
| RULER (128K) | 0.947 | — | 0.938 |
| RULER (1M) | 0.910 | — | —（Gemini-1.5-Pro 0.850） |
| LongBench v2 (w/ CoT) | 论文内 SOTA，仅次于 o1-preview 与人类（据报道） | 低于 MiniMax | 低于 MiniMax |

**MiniMax-VL-01 要点**
| 项目 | 数值 |
|---|---|
| 视觉编码器 | ViT-L/14，303M 参数（6.94 亿图文对；224² 训 37B 对 + 336² 微调 1.2B 对） |
| 连接器 | 两层 MLP projector |
| 续训数据 | 约 512B vision-language token，四阶段（80B + 420B + 44.8B + DPO 4 万对） |
| 动态分辨率 | 336×336 到 2016×2016，特征不池化直喂 LLM |
| MMMU / MMMU-Pro | 68.5 / 52.7 |
| DocVQA / ChartQA / OCRBench | 96.4 / 91.7 / 865 |
| MathVista / OlympiadBench | 68.6 / 24.2（数学短板） |
| MMLongBench-Doc | 32.5（仅次于 GPT-4o 41.4） |

**关键概念清单**
- Lightning Attention = I/O-aware 的线性注意力实现（tiling 分块，intra-block 左积 + inter-block 右积，训练复杂度 O(N)）
- TransNormer = 线性注意力架构（lightning attention 的理论前身）
- 混合注意力 = 每 7 个 lightning block 掺 1 个 softmax block（72:8）
- GQA = Grouped-Query Attention，分组查询注意力（softmax 层用，group size 8）
- RoPE = 旋转位置编码（只用于一半 head 维度，利于长度外推）
- global router = 跨专家并行组的全局 token 调度（配合 GShard 辅助损失防路由崩溃）
- token-drop = 专家容量满时丢弃 token 的训练策略
- ETP / EDP = Expert Tensor Parallel / Expert Data Parallel（MoE 并行与主模型解耦，通信开销降 50%）
- varlen ring attention = 支持 data-packing 的环注意力（softmax 侧长序列并行）
- LASP+ = Linear Attention Sequence Parallelism 改进版（local prefix sum + allgather，串行变并行）
- data-packing = 不同样本沿序列维首尾相接打包，省 padding 浪费
- DPO = Direct Preference Optimization（离线偏好优化）
- GRPO = Group Relative Policy Optimization（MiniMax 版加 IS 权重双端裁剪、stop-gradient KL、advantage 均衡）
- NIAH / MR-NIAH = 大海捞针 / 多轮大海捞针检索测试
- RULER / LongBench v2 / MTOB = 长上下文理解与推理 / 真实长文本多任务 / 一本书学新语言基准
- ViT-L/14 = 视觉 Transformer（14×14 patch，L 规模）
- CoCa = 对比学习 + 生成式目标结合的图文预训练范式
- MFU = Model FLOPs Utilization，算力利用率（H20 上端到端推理超 75%）
