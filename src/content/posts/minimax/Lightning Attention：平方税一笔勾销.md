---
title: "Lightning Attention：平方税一笔勾销"
published: "2026-07-05"
category: "minimax"
lang: "zh"
draft: false
tags: ["长上下文", "效率", "架构"]
---

# Lightning Attention 论文解读：把 O(N²) 的"平方税"一笔勾销

> 论文：*Lightning Attention-2: A Free Lunch for Handling Unlimited Sequence Lengths in Large Language Models*
> 作者：Zhen Qin, Weigao Sun, Dong Li, Xuyang Shen, Weixuan Sun, Yiran Zhong（OpenNLPLab）
> 这篇是 MiniMax 技术谱系里的地基之作：MiniMax-01 那个 400 万 token 上下文、7:1 混合 Lightning Attention 架构，算法内核就是它；后续 M1、M2.5 乃至据报道的 M3 一路沿用。论文后以《Various Lengths, Constant Speed》为题正式发表于 ICML 2024。

---

## 一、引言：长序列要交的"平方税"

问题摆得很直白：标准 **softmax attention** 的计算复杂度随序列长度平方增长。序列翻一倍，算力翻四倍——这就是长序列的"平方税"。上下文想从 8K 走到 1M，这条路根本走不通。

出路早就有人指出了：**linear attention（线性注意力）**。把 softmax 去掉，利用矩阵乘法的结合律，把 (QK⊤)V 改算成 Q(K⊤V)，复杂度从 O(n²) 降到 O(n)。理论上，这样的模型处理任意长度的序列，训练速度不变、显存占用固定——听起来像一张免费支票。

但论文开头就泼了盆冷水：这张支票在 GPU 上兑不了现。理论复杂度 O(n) 不等于墙钟时间变快，卡在两个地方：

1. **I/O 瓶颈。** GPU 上内存访问（HBM 读写）主导整体速度，naive 实现的线性注意力反而更慢。
2. **cumsum（累加求和）死结。** causal（因果）场景下，kernel trick 需要的右乘退化成一串前后依赖的累加，第 t 步必须等第 t-1 步算完，GPU 上几千个计算单元只能排队干等，并行度全废。

第一块石头已经被 **Lightning Attention-1**（在 TransNormerLLM 里提出）搬掉了：它照搬 FlashAttention 的 tiling 思路做 IO 优化，但代价是复杂度仍停留在 O(n²d)。这篇 Lightning Attention-2 解决的是第二块石头。结果一句话概括：**序列长度从 1K 拉到 92K，训练速度纹丝不动。**

## 二、预备知识：一个"右乘"戏法，和它的死穴

先把线性注意力的公式说清楚。标准 attention 是 O = Norm((QK⊤)V)，先算 Q 和 K 的内积，得到一个 n×n 的注意力矩阵——平方税就藏在这里。线性注意力把它换成 O = Norm(Q(K⊤V))：先算 K⊤V，得到一个 d×d 的矩阵。

打个比方：n×n 的算法好比每个新员工入职都要跟全公司所有人一一握手；d×d 的算法则是把全公司的信息先汇总成一本 d×d 的"手册"，每个新人只需要翻手册。由于 d 远小于 n，训练复杂度降到 O(nd²)；推理时更狠——手册可以递推更新（K⊤V 随新 token 增量累加），每生成一个 token 只需 O(d²)，与历史长度无关。

死穴在 causal 场景。语言模型是从左往右生成的，第 t 个 token 只能看前 t 个 token，"全量手册"不存在了，只能一步步累加：kv_t = kv_{t-1} + k_t⊤v_t。这就是 **cumsum** 问题——数学上没问题，硬件上是灾难，串行依赖把 GPU 的并行度清零。Lightning Attention-1 的妥协是退回"左乘"（老老实实算块内的 QK⊤），靠 IO 优化续命，复杂度仍是 O(n²d)。

## 三、核心方法：分而治之，块内块外两套算法

Lightning Attention-2 的钥匙是四个字：**分而治之（divide and conquer）**。把序列切成 T = n/B 个块（block），每块 B 个 token，然后把注意力计算拆成两半：

**块内（intra-block）走并行。** 块内只有 B 个 token，平方一下也贵不到哪去，干脆用传统方式算：O_intra = [(Q_iK_i⊤) ⊙ M]V_i，M 是带衰减率的因果 mask。这部分全是矩阵乘，GPU 的 Tensor Core 最喜欢。

**块间（inter-block）走递推。** 之前所有块的历史，压缩成一个 d×d 的"交接本" KV；当前块只需要读一遍交接本：O_inter = ΛQ_i(KV)，然后更新交接本 KV = λ^B·KV + (λ^B·Λ⁻¹K_i)⊤V_i。无论序列多长，交接本永远只有 d×d 大。

还是用公司打比方：块内计算像部门内部开小会，人少，怎么开都快；块间通信像部门之间的交接本——新部门上任不用翻全公司十年的档案，读一本薄薄的交接记录就够了。序列从 1K 涨到 1M，涨的只是部门数量，交接本的厚度不变。

两块拼起来 O_i = O_intra + O_inter，数学上与原始线性注意力完全等价，没有近似。前向和反向都做了同样的 tiling（论文给了完整的 Algorithm 1 和 Algorithm 2，反向也拆成 intra/inter 两路递推），中间状态 KV 常驻片上 SRAM 迭代累加，只有输入输出走一趟 HBM。λ 是固定的 **decay rate（衰减率）**，给远期记忆加个指数折扣——注意它是手工设定的常数，不是数据相关的。

复杂度账算下来：每块 intra 花 O(B²d)，inter 花 O(Bd²)，总计 O(nd² + nBd)。实践中取 B ≈ d，两项平衡，总复杂度 O(nd²)——对序列长度 n 是严格线性的。cumsum？彻底消失了。

## 四、硬件感知：把算力花在 GPU 喜欢的地方

这篇论文最值得品的地方，是它不满足于"数学上 O(n)"，而是追着硬件把账算到底。

GPU 的内存有两级：**HBM**（片外高带宽显存，A100 上约 2TB/s）和 **SRAM**（片上缓存，容量只有几十 MB，但带宽比 HBM 高一个数量级）。打个比方：HBM 是仓库，SRAM 是工位。低效 kernel 的毛病是反复跑仓库；**IO-aware** 的做法是把每个块的 Q、K、V 一次性搬上工位，所有 intra/inter 计算全在工位上完成，最后只把结果写回一次仓库。这就是 **tiling** 的精髓，FlashAttention 靠它加速了 softmax attention，这篇把它移植给了线性注意力。

更细的一层是"复杂度分配"：同样是线性注意力，左乘（(QK⊤)V）和右乘（Q(K⊤V)）数学等价，但硬件性格完全不同——左乘是 B×B 的并行小矩阵乘，右乘是 d×d 的状态递推。论文的分配策略是：小范围的块内交给左乘吃并行，大范围的历史交给右乘吃递推，再用块大小 B 这个旋钮在两者之间配平。所有重活都落在 matmul 上， cumsum 这类内存密集、无法并行的慢操作被连根拔掉。整套 kernel 用 **Triton** 实现，实验跑在 A100/A800 集群上。

这套思路在 MiniMax-01 的工程阶段被进一步细化到算子级：据报道团队针对不同代际 GPU 的算力/带宽特性做了 kernel 深度定制，块大小定为 256，在 Hopper 架构（H800/H20）上用 WGMMA、TMA 异步拷贝和 cuBLAS 的 StridedBatchedMatmul 重写算子，最终推理端到端 MFU 超过 75%（H20 上）。

## 五、实验：训练速度"横着走"，精度几乎不掉

先看最扎眼的一张表（2×A100 80G，TGS = 每 GPU 每秒处理的 token 数，序列从 1K 拉到 92K）：

- **0.4B 模型**：LLaMA + FlashAttention-2 从 35,931 一路跌到 4,078；TNL + Lightning Attention-1 从 41,789 跌到 6,012；而 Lightning Attention-2 从 38,615 到 38,596——几乎是一条水平线。92K 长度上，LA2 比 FA2 快约 9.5 倍。
- **1B 模型**：FA2 到 82K 只剩 3,167 TGS、92K 直接 OOM（显存爆了）；LA2 稳定在 20,000 上下。
- **3B 模型**：FA2 和 LA1 在 64K 双双 OOM，LA2 还能跑，稳定在 7,500 上下。

单算子层面（单卡 A100），前向/反向的运行时间：FA2 随长度二次方膨胀，LA2 线性增长；显存占用上 LA2 同样显著更低。序列越长，差距越大。

**精度呢？几乎不掉。** 0.4B 模型在 8×A100 上训 10 万步，LA1 和 LA2 的 loss 分别是 2.229 和 2.228——注意 LA2 只是换了个更快的算法，数学上完全等价，还略好 0.001。在 30B token 语料上对比 1B/3B 的 HGRN、TNN、LLaMA-FA2，TNL-LA2 的训练 loss 曲线压在所有人头上。

再往上看规模。**TransNormerLLM-15B**（42 层、40 头、隐层 5120，目标语料超 1.3T token、训练序列长 6,144）训到约 100B token 的中间检查点，训练速度 1,620 TGS，对 Pythia-12B（约 100B token）：常识推理均分 56.76 vs 54.58，HellaSwag 61.09 vs 58.83，C-Eval 0-shot 26.70 vs 24.00，MMLU 0-shot 26.90 vs 24.80——全面小幅领先。这是线性注意力第一次在十几 B 规模上被验证"能打"。

论文也顺手点了两个邻居：**GLA** 同样做 chunk 化 tiling，但每个块走纯并行，显存占用更高；**RetNet** 的 chunk-wise retention 跟前向思路相似，但没做 IO-aware，也没给反向传播方案。

## 六、从论文到 MiniMax-01：7:1 混合，撑起 400 万 token

这篇论文真正的历史地位，要到 MiniMax-01 技术报告里才完全兑现。

**纯线性注意力有个软肋：检索。** MiniMax 的 scaling 实验（70M 到 7B，300B token）发现，线性注意力在大多数任务上追平 softmax，唯独 **NIAH（大海捞针）** 检索任务明显偏弱。解法很务实：**hybrid-lightning**——每 7 层 lightning attention 插 1 层 softmax attention。消融显示这个混搭是当时最优解：1B 模型上，hybrid-lightning 的 NIAH 拿 95.7，而 hybrid-cosformer2 只有 43.6；训练速度 33.4K TGS，也是三者里最快的。拟合出的 scaling law 同样站混合架构：同样算力预算下，hybrid 的 loss 系数 3.4797·C^-0.0763，优于纯 lightning（3.5391）和纯 softmax（3.7087）。FLOPs 账也好看：softmax 层的二次项占比从 n/(6d) 被摊薄到 n/(48d)——二次税只按八分之一征收。

最终落地的 MiniMax-Text-01：80 层、7:1 混合、456B 总参数 / 45.9B 激活、32 专家 top-2 MoE。训练用 1500–2500 张 H800，上下文一路扩到 1M；推理时上下文推到 **400 万 token**——4M 大海捞针测试全绿，LongBench v2 综合 56.5（带 CoT，超过 GPT-4o 的 51.4），长上下文 prefill 延迟显著低于 GPT-4o、Claude-3.5-Sonnet 等 API 模型。据报道，团队在访谈中给过一个直观的数字：1M 长度下 softmax attention 的延迟约为 lightning attention 的 2,700 倍。工程上则靠 **LASP+**（线性注意力序列并行，把串行通信改并行）、**Varlen Ring Attention** 和四个推理 kernel 优化（kernel 融合让 decode 延迟降 10%、prefill/decode 分流让混合 batch 延迟从 100ms 砍到 50ms 等）把架构红利吃干榨净。

后来的故事大家都熟了：MiniMax-M1 沿用同一套 7:1 架构，原生 1M 上下文，生成长度 100K 时推理 FLOPs 只有 DeepSeek-R1 的约 25%；再往后的 M2.5 等旗舰也始终没离开线性注意力这条路线。

## 收尾：我的一点看法

这篇论文的价值，我认为可以用一句话概括：它第一次把线性注意力的理论红利，在 causal 场景下变成了真实的墙钟速度。在它之前，"O(n) 复杂度"是写在纸上的；在它之后，是跑在 A100 上的一条水平线。

亮点有三个。一是 intra/inter 的拆分干净漂亮——用块大小的旋钮在并行和递推之间配平，cumsum 直接消失，数学上还完全等价，不掉精度（2.228 vs 2.229 就是证据）。二是诚实：论文没吹"超越 Transformer"，15B 的对比也只敢说追平 Pythia-12B，这种分寸在注意力机制的论文里不多见。三是它证明了一个方法论：理论复杂度要兑现，必须追着 HBM/SRAM、Tensor Core 这些硬件细节算账。FlashAttention 不改公式、只改 IO；Lightning Attention 改了公式、再把 IO 也改对——两条路最后在 MiniMax-01 里合流。

局限也坦率说。纯线性注意力检索弱，得靠 softmax 层来救，7:1 是工程妥协而不是终极答案（团队自己说未来可能压到 1/16 甚至只留一层）；decay 是手工固定的，不如 Mamba 那类数据依赖的门控灵活；论文阶段的验证止步于 15B 的中间检查点，真正的大规模背书是半年后 MiniMax-01 补上的。另外"free lunch"这个标题也得打个折——免费的是复杂度，不免费的是一整套 Triton kernel、序列并行和推理框架的工程投入。

话说回来，看 2024 年初的时间点：所有人都在用 FlashAttention 给 softmax 续命，敢换公式、还把新公式做到比 FlashAttention 更快的，只有这一家。它不是线性注意力的发明者，但它是让线性注意力第一次"能用、敢用、上规模"的那篇。

---

## 附：核心数据速查

**复杂度对比（n = 序列长度，d = 特征维度，B = 块大小）**

| 机制 | 训练复杂度 | 推理复杂度（每 token） | 备注 |
|---|---|---|---|
| Softmax Attention | O(n²d) | O(md²)，m 为历史长度 | KV cache 随长度线性增长 |
| 线性注意力（理论） | O(nd²) | O(d²) | kernel trick，causal 下需 cumsum |
| Lightning Attention-1 | O(n²d) | — | IO-aware tiling，复杂度未降 |
| Lightning Attention-2 | O(nd² + nBd)，B≈d 时 O(nd²) | O(d²) | intra/inter 拆分，无 cumsum |

**训练速度 TGS（token/GPU/秒，2×A100 80G）**

| 模型 | 1K | 16K | 64K | 92K |
|---|---|---|---|---|
| LLaMA-FA2 (0.4B) | 35,931 | 15,479 | 5,643 | 4,078 |
| TNL-LA1 (0.4B) | 41,789 | 21,112 | 8,247 | 6,012 |
| TNL-LA2 (0.4B) | 38,615 | 37,755 | 38,278 | 38,596 |
| LLaMA-FA2 (3B) | 7,117 | 3,755 | OOM | OOM |
| TNL-LA2 (3B) | 7,524 | 7,545 | 7,545 | OOM 前约 7.5K |

**MiniMax-01 混合架构关键数据**

| 项目 | 数值 |
|---|---|
| 层配置 | 80 层，每 7 层 lightning + 1 层 softmax |
| 参数 | 456B 总参 / 45.9B 激活，32 专家 top-2 |
| 上下文 | 训练扩至 1M，推理支持 4M token |
| scaling law（loss 系数） | hybrid 3.4797 < lightning 3.5391 < softmax 3.7087 |
| 1B 消融 NIAH | hybrid-lightning 95.7 vs hybrid-cosformer2 43.6 |
| 推理 MFU | H20 上端到端超 75% |
| 据报道 | 1M 长度下 softmax 延迟约为 lightning 的 2,700 倍 |

**TransNormerLLM-15B vs Pythia-12B（约 100B token）**

| 指标 | TNL-LA2 15B | Pythia 12B |
|---|---|---|
| CSR 均分 | 56.76 | 54.58 |
| HellaSwag | 61.09 | 58.83 |
| C-Eval (0-shot) | 26.70 | 24.00 |
| MMLU (0-shot) | 26.90 | 24.80 |

**关键概念清单**
- Lightning Attention = IO-aware 的线性注意力实现，MiniMax 混合架构的基石
- linear attention = 去掉 softmax、用 kernel trick 把复杂度降为线性的注意力
- kernel trick = 先算 K⊤V（d×d）避开 n×n 注意力矩阵
- cumsum = 累加求和，causal 线性注意力的串行死结
- tiling = 分块计算，让数据只搬一次 HBM、全程在 SRAM 加工
- intra-block / inter-block = 块内（左乘并行）/ 块间（右乘递推）两种计算
- KV state = 块间传递的 d×d "交接本"，大小与序列长度无关
- decay rate λ = 固定的指数衰减率，给远期记忆打折
- IO-aware = 按 HBM/SRAM 带宽差异设计数据搬运
- Triton = 论文 kernel 的实现语言
- TGS = tokens per GPU per second，训练速度指标
- NIAH = Needle In A Haystack，大海捞针检索测试
- hybrid-lightning = 7:1 混合 lightning/softmax 的 MiniMax 架构
- LASP+ = 线性注意力序列并行，把跨卡串行依赖改成并行
- MFU = Model FLOPs Utilization，算力利用率
