---
title: "DeepSeek-V4：百万 token 平民化"
published: "2026-07-08"
category: "deepseek"
lang: "zh"
draft: false
tags: ["长上下文", "MoE", "FP8", "效率"]
---

# DeepSeek-V4 论文解读：百万 token 上下文，终于不再是奢侈品

> 论文：*DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence*
> 作者：DeepSeek-AI
> 这是 2026 年 4 月的 preview（预览）版本技术报告。V4 系列两个模型，Pro 有 1.6T 总参数（49B 激活），Flash 有 284B（13B 激活），双双原生支持 100 万 token 上下文。核心卖点很直白，1M 上下文的场景下，Pro 的推理 FLOPs 只有 V3.2 的 27%，KV cache 只有 10%。把百万 token 上下文从"烧钱表演"变成"日常操作"，顺便在竞赛级形式化数学推理上表现亮眼（Putnam-2025 满分 120/120、IMOAnswerBench 89.8）。

---

## 一、为什么需要 V4：注意力是测试时扩展的天花板

推理模型把测试时扩展（test-time scaling）变成了主流范式，但 vanilla attention（朴素注意力）的平方级复杂度给超长上下文和超长推理过程设了天花板。与此同时，agentic 工作流、跨文档分析这些长周期任务又对超长上下文提出刚需。V4 就是冲着拆掉这个天花板去的。

对比 V3.2 的效率账（1M 上下文场景）：
- V4-Pro（激活参数更多）的单 token FLOPs 只有 V3.2 的 27%，KV cache 只有 10%
- V4-Flash 更狠，FLOPs 只有 10%，KV cache 只有 7%

KV cache 本身也做了混合精度存储：RoPE 维度保持 BF16，其余维度用 FP8，比纯 BF16 省近一半；1M 上下文场景下整体 KV cache 可以压到常见 BF16 GQA8 基线的约 2%。

还有个细节，路由专家权重用了 FP4 精度。FP4×FP8 在当前硬件上的峰值 FLOPs 跟 FP8×FP8 一样，但在未来硬件上理论上还能再省 1/3。

## 二、架构：三处大改

### 1. 混合注意力：CSA + HCA

这是 V4 最核心的创新，一页图能看懂，压缩再稀疏，或者往死里压缩。

**CSA（Compressed Sparse Attention，压缩稀疏注意力）**。先把每 m 个 token 的 KV cache 压缩成一个条目（用了两套 KV 投影和压缩权重，相邻块重叠，实际压缩率 1/m），然后用 V3.2 的 DSA 那套，lightning indexer 对压缩后的条目打分，每个 query 只挑 top-k 个压缩 KV 做注意力。为了保住局部细粒度信息，还额外并上少量滑动窗口的 KV。输出侧用分组的输出投影，因为多头输出维度太大，直接投影太贵。

**HCA（Heavily Compressed Attention，重度压缩注意力）**。不做稀疏选择，就是往死里压，每 m'（远大于 m）个 token 压成一个条目，然后在这个重度压缩的空间上做稠密注意力，同样带滑动窗口。

两者的混合策略，让 1M 上下文在工程上变得可行。注意力从 V3.2 那代的"稀疏但不压缩"升级成"先压缩再稀疏"，压缩维度是新加的省钱维度。

实现细节上也下了功夫：query 和 KV 条目在做核心注意力前先过 RMSNorm，防 logit 爆炸；RoPE 只加在最后 64 维，并在输出侧以相反位置反向施加，让输出也带上相对位置信息；还用了 Attention Sink 技巧——一组可学习的 sink logits 加进注意力分母，让每头注意力总分可以不等于 1。

### 2. mHC：把残差连接约束到流形上

Manifold-Constrained Hyper-Connections（流形约束超连接）。基础版本是 Hyper-Connections，把残差流的宽度从 d 扩成 n_hc×d，用三个线性映射（输入映射、残差变换、输出映射）在层间传递信号，把残差宽度和实际隐层大小解耦，多一个几乎免费的扩展轴。

但 HC 堆深了会数值不稳。mHC 的修法是，把残差变换矩阵 B 约束到双随机矩阵的流形（Birkhoff polytope，伯克霍夫多胞形）上，用 Sinkhorn-Knopp 算法迭代投影（先取指数保证正数，再交替做行、列归一化，迭代 20 轮，是论文采用的实用截断值）。这样谱范数 ≤1，残差变换不扩张，前向和反传都稳；而且这个集合对乘法封闭，堆多深都稳。输入输出映射用 Sigmoid 限幅，防止信号抵消。参数还是动态生成的，输入相关分量加静态偏置。

### 3. Muon 优化器

主体模块改用 Muon，embedding、预测头、mHC 静态偏置/门控因子、RMSNorm 权重仍保留 AdamW。论文的说法是收敛更快、训练更稳。工程上做了混合 ZeRO 策略来省显存。

### MoE 的小改动

还是 DeepSeekMoE 框架，但亲和分的激活函数从 Sigmoid 换成了 Sqrt(Softplus)。无辅助损失负载均衡保留，路由目标节点数限制去掉（并行策略重新设计来兜底）。前几个 Transformer 块的稠密 FFN 换成了带 Hash routing（哈希路由）的 MoE 层。MTP 完全沿用 V3。

## 三、基础设施：把每个 token 都抠出来

- **MoE 单融合 kernel**，计算、通信、内存访问完全重叠。
- **TileLang**，自研的领域专用语言（DSL），兼顾开发效率和运行效率。
- **批无关且确定性的 kernel 库**，保证训练推理逐位可复现。
- **扩展 autograd**，支持张量级 checkpointing，细粒度重计算控制。
- **两阶段上下文并行**（contextual parallelism）管理压缩注意力。
- **异构 KV cache 加磁盘存储**，支持共享前缀复用。长上下文场景 KV cache 太大，内存放不下就往磁盘放。
- **可抢占容错 rollout 服务**，token 级 Write-Ahead Log（WAL），任务被抢占或硬件故障后能从断点继续解码，避免整体重采样的长度偏差。
- **DeepSeek Elastic Compute（DSec）**，生产级沙箱平台，一个统一 SDK 背后抽象出 Function Call / Container / microVM / fullVM 四种执行基板，支撑百万上下文 RL/OPD 的 agentic 工作负载。

## 四、预训练：32T/33T token，稳定性靠两招

V4-Flash 训了 32T token，V4-Pro 训了 33T token，预训练完原生支持 1M 上下文。Base 模型对比，Flash-Base 用更少的激活参数在大多数 benchmark 上就超过了 V3.2-Base，Pro-Base 全面碾压。知识类提升最猛，FACTS Parametric 27.1 到 62.6，Simple-QA verified 28.3 到 55.2。

训练稳定性专门写了两招：

**Anticipatory Routing（预判式路由）**。把路由网络和主干网络的更新解耦，第 t 步的特征用当前参数算，但路由索引用历史参数（t-Δ 步）算，数据提前取，路由索引提前缓存。这样 loss spike（损失尖峰）大幅减少，额外的墙钟开销控制在 20% 左右，而且平时不用，只在检测到 loss spike 时短暂开启。论文坦言原理还没有完全吃透，但有效。

**SwiGLU Clamping（限幅）**。SwiGLU 的线性分量钳到 [-10, 10]，门控分量上限 10，消除异常值，稳定训练，不掉性能。

## 五、后训练：专家栽培加 on-policy 蒸馏

### 两阶段范式

先独立栽培领域专家。每个领域（数学、代码、agent、指令遵循等）从 base 出发，先 SFT 再 GRPO RL，奖励信号按领域定制。产出多个各有所长的专家模型。

然后用多教师 On-Policy Distillation（OPD，在线策略蒸馏）合并成统一模型。学生从自己的采样轨迹上学，优化对每个教师的反向 KL 损失，按任务上下文动态对齐对应专家。这比传统的权重合并和混合 RL 更能避免性能退化。十多个教师模型蒸馏一个学生。

关键工程点是**全词表 logit 蒸馏**。之前的做法把全词表 KL 损失简化成 token 级估计，方差大、训练不稳。V4 保留完整 logit 分布，教师权重卸载到分布式存储按需加载，正向时只缓存最后一层 hidden state，训练时再现场重建 logits，绕开显存爆炸。

### 三种推理档位

Non-think（非思考）、Think High（高思考）、Think Max（极限思考），RL 训练时用不同的长度惩罚和上下文窗口得到，用 <think> 标签区分。Think Max 模式还在 system prompt 里注入一段"推理强度拉满"的指令。

### 生成式奖励模型

V4 不用标量奖励模型了。难验证任务直接用 Generative Reward Model（GRM，生成式奖励模型），而且 RL 直接优化 GRM 本身，actor 网络天然就是 GRM，模型的评判能力和生成能力联合优化。只需要极少量的人工标注，靠模型自己的逻辑泛化到复杂任务。

### 工具调用与思考管理

工具调用格式改成 |DSML| 特殊 token 加 XML 格式，比 JSON 更能抗转义失败。思考管理比 V3.2 更进一步，工具调用场景下所有推理内容全程保留，连用户消息边界都不丢，长周期 agent 任务能维持连贯的思维链；普通对话场景还是新用户消息来了就丢推理。

还有个有意思的设计，**Quick Instruction（快捷指令）**。聊天场景有一堆辅助任务（要不要联网、意图识别、生成对话标题），以前靠独立小模型，还得重新 prefill。V4 直接往输入序列后面追加特殊 token，每个 token 对应一个辅助任务，复用已算好的 KV cache，完全避免冗余 prefill，还能并行执行，显著降低首 token 延迟，还省掉了维护一个小模型的工程负担。

### FP4 量化感知训练

对 MoE 专家权重和 CSA 索引器的 QK 路径做 FP4 量化感知训练（QAT）。FP4 反量化为 FP8 是无损的，因为 FP8 的指数位更多，动态范围更大，能吸收 FP4 子块的 scale 信息。索引分数从 FP32 压到 BF16，top-k 选择器快 2 倍，KV 条目召回率保持 99.7%。RL 采样阶段直接用原生 FP4 权重，保证采样行为和线上部署完全一致。

## 六、成绩：知识开创新高，推理追平前沿

**知识**。SimpleQA-Verified 57.9，比所有开源基线高出 20 个绝对点；中文 SimpleQA 84.4。MMLU-Pro 87.5、GPQA 90.1、HLE 37.7。仍然落后 Gemini-3.1-Pro（SimpleQA 75.6），但差距大幅收窄。

**推理**。Pro-Max 在标准推理 benchmark 上超过 GPT-5.2 和 Gemini-3.0-Pro，略输 GPT-5.4 和 Gemini-3.1-Pro，作者自己评估大概落后前沿 3 到 6 个月。LiveCodeBench 93.5、Codeforces rating 3206（人类选手榜第 23 名）、HMMT 2026 Feb 95.2、IMOAnswerBench 89.8、Apex Shortlist 90.2。Flash-Max 推理能力跟 GPT-5.2、Gemini-3.0-Pro 相当，性价比极高。

**形式化数学**。Putnam-200（本科数学竞赛题）Pass@8，Flash-Max 拿到 81.0，对比 Seed-2.0-Pro 的 35.5 和 Gemini-3-Pro 的 26.5；Putnam-2025 满分布景下 DeepSeek-V4 拿到 120/120，跟最好的 Axiom 并列。

**智能体**。SWE-Verified 80.6、Terminal Bench 2.0 67.9、BrowseComp 83.4、MCPAtlas 73.6、Toolathlon 51.8，跟 K2.6、GLM-5.1 相当，仍略逊闭源前沿。

**百万上下文**。MRCR 1M 83.5 超过 Gemini-3.1-Pro 的 76.3（不如 Opus 4.6 的 92.9），CorpusQA 1M 62.0 也超过 Gemini-3.1-Pro。128K 以内检索性能非常稳，过了 128K 才有可见下滑。

**真实场景**。中文功能写作对 Gemini-3.1-Pro 胜率 62.7% 对 34.1%，创意写作写作质量 77.5% 胜率；但最高难度 prompt 上 Claude Opus 4.5 仍占优（52.0% 对 45.9%）。白领任务 30 道高难度中文专业任务对 Opus-4.6-Max，整体非负率 63%。内部研发代码任务，Pro-Max 通过率 67%，Claude Sonnet 4.5 是 47%，Opus 4.5 是 70%。内部 85 人调研，52% 认为 V4-Pro 可以当主力编码模型，39% 倾向可以，不到 9% 说不。

## 收尾：我的一点看法

V4 的定位很清晰，它是 DeepSeek 对"上下文长度"这个维度的总攻。V3.2 用稀疏注意力证明了"换掉稠密注意力不掉性能"，V4 在这个基础上再加压缩维度，把 1M 上下文从理论变成日常。这里的技术逻辑是一脉相承的，V3 引入 MTP 时还说"MTP 可以用于投机解码"，V4 的 CSA 直接就是"压缩 + 稀疏"的组合拳，一步比一步激进。

mHC 是个值得单独琢磨的设计。残差连接从 Transformer 出生就没怎么变过，V4 把它升级成流形约束版本，还专门用 Birkhoff 多胞形保证谱范数有界。这属于"在大家都觉得已经到底的地方再挖一层"的工作，跟 MLA 当年的气质很像。

OPD 取代混合 RL 这个转变，我觉得是后训练范式的一个信号。混合 RL 的问题在于多个目标互相拉扯，OPD 让统一模型动态对齐不同领域的专家，逻辑上更干净。全词表蒸馏能跑起来，靠的是那套"缓存 hidden state 现场重建 logits"的工程，这种细节才是别人抄不走的东西。

泼冷水的地方也有。一是架构复杂度明显上升，作者自己承认"为了控风险保留了很多已验证的组件和技巧，让架构相对复杂"，未来要做减法；二是 Anticipatory Routing 和 SwiGLU Clamping 两个稳定化手段的机理还没搞明白，属于"能用但不懂为什么"的工程经验；三是知识广度，SimpleQA 跟 Gemini-3.1-Pro 还差着 17 个点，RL 补不了知识，只能回预训练加算力。四是多模态，V4 还是纯文本，论文明确说了正在做。

另外注意论文里引用的 Conditional Memory（Cheng et al., 2026），那是 DeepSeek 在稀疏性上的下一个方向——更稀疏的 embedding 模块这一方向的延伸（其论文自称"一条新的稀疏轴"），值得单独读。

---

## 附：核心数据速查

**模型基本盘**
| 项目 | V4-Pro | V4-Flash |
|---|---|---|
| 总参数 / 激活参数 | 1.6T / 49B | 284B / 13B |
| 上下文 | 1M tokens | 1M tokens |
| 预训练数据 | 33T tokens | 32T tokens |
| 1M 场景 FLOPs（vs V3.2） | 27% | 10% |
| 1M 场景 KV cache（vs V3.2） | 10% | 7% |

**架构创新**
- CSA = 压缩 + DSA 稀疏选择，压缩率 1/m，带滑动窗口
- HCA = 重度压缩（m'≫m），稠密注意力，带滑动窗口
- mHC = 流形约束超连接（B 矩阵投影到双随机流形，Sinkhorn-Knopp 20 轮）
- Muon 优化器；亲和分激活改 Sqrt(Softplus)；前层 Hash routing
- 路由专家权重 FP4；索引器 QK 路径 FP4（QAT）

**训练稳定性**
- Anticipatory Routing：历史参数算路由，loss spike 时自动启用，额外开销约 20%
- SwiGLU Clamping：线性分量 [-10,10]，门控上限 10

**Pro-Max 关键成绩**
| 指标 | Pro-Max | 对比 |
|---|---|---|
| SimpleQA-Verified | 57.9 | Gemini-3.1-Pro 75.6 |
| MMLU-Pro | 87.5 | Gemini 91.0 |
| GPQA Diamond | 90.1 | Gemini 94.3 |
| HLE | 37.7 | Gemini 44.4 |
| LiveCodeBench | 93.5 | 最高 |
| Codeforces | 3206 | 人类榜第 23 |
| HMMT 2026 Feb | 95.2 | Gemini 94.7 |
| MRCR 1M | 83.5 | Gemini 76.3，Opus 4.6 92.9 |
| SWE Verified | 80.6 | 与 Gemini-3.1-Pro 并列（Opus-4.6-Max 80.8） |
| Terminal Bench 2.0 | 67.9 | Opus 65.4 |
| Putnam-2025 | 120/120 | 与 Axiom 并列 |

**形式化推理（Putnam-200 Pass@8）**
- Flash-Max 81.0；Seed-2.0-Pro 35.5；Gemini-3-Pro 26.5

**后训练要点**
- 专家栽培（SFT + GRPO）→ 多教师 OPD（反向 KL，全词表 logit 蒸馏）
- 三种推理档位：Non-think / Think High / Think Max
- GRM 生成式奖励模型（RL 直接优化 GRM，演员即评判）
- |DSML| XML 工具调用；工具场景思考全程保留
- Quick Instruction 特殊 token 复用 KV cache，降 TTFT

**关键概念清单**
- CSA = Compressed Sparse Attention，压缩稀疏注意力
- HCA = Heavily Compressed Attention，重度压缩注意力
- mHC = Manifold-Constrained Hyper-Connections，流形约束超连接
- Birkhoff polytope = 伯克霍夫多胞形（双随机矩阵流形）
- Sinkhorn-Knopp = 行列交替归一化迭代算法
- Muon = 基于矩阵正交化的优化器
- OPD = On-Policy Distillation，在线策略蒸馏
- GRM = Generative Reward Model，生成式奖励模型
- QAT = Quantization-Aware Training，量化感知训练
- Anticipatory Routing = 预判式路由
- contextual parallelism = 上下文并行
- TTFT = Time-to-First-Token，首 token 延迟
- MRCR / CorpusQA = 百万上下文检索评测基准
- Putnam = 普特南数学竞赛（本科级）
- Apex / HLE / SimpleQA-Verified = 知识与推理评测基准
