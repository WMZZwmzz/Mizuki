---
title: "MiniMax-M3：算力省 20 倍"
published: "2026-07-25"
category: "minimax"
lang: "zh"
draft: false
tags: ["长上下文", "多模态", "效率", "开源"]
---

# MiniMax-M3 论文解读：MSA 稀疏注意力加原生多模态，把百万上下文的算力打到二十分之一

> 论文：*MiniMax Sparse Attention*（arXiv:2606.13392）
> 作者：MiniMax
> M3 是 2026 年 6 月 1 日发布的旗舰模型，6 月 16 日正式开源权重与 MSA 技术论文。428B 总参数、23B 激活，是国内第一个同时把"1M 上下文、前沿 Coding Agent、原生多模态"三件套放进同一个开源模型的选手，Artificial Analysis 综合智能指数全球开源第一，也是 WAIC 2026 的核心展品。撑起这一切的，是块级稀疏注意力 MSA：百万 token 上下文下，单 token 计算量约为上一代的 1/20。

---

## 一、背景：百万上下文这堵墙，二次方注意力顶不住了

引言先把需求摆出来。前沿 LLM 正在从单轮问答转向长程 agentic 工作流，写代码要读整个仓库、做任务要挂持久记忆、跑 agent 要几百步推理和工具调用交错，几十万到上百万 token 的联合注意力成了刚需。而 softmax 注意力的计算量随序列长度二次方增长，训练和推理两头烧钱，部署规模下根本不可持续。

社区有两条路。一条是混合架构，把一部分 softmax 注意力层换成线性注意力或滑动窗口，MiniMax 自家前两代（M1、M2）走的就是这条路。另一条是保留 softmax 注意力本身，但把它稀疏化，只算值得算的部分，DeepSeek 的 DSA、NSA、MoBA 都在这一派。

M3 选了后者，而且姿态很明确，论文原话是"遵循奥卡姆剃刀"：大量消融之后只留下必要组件。MSA 坚持稀疏 softmax 注意力范式，最大限度复用现有软硬件生态；用块级选择加小 top-k，让更多 GPU 架构都能高效跑起来。设计哲学一句话，简单到不能再简单，剩下的交给工程。

## 二、MSA：先给 KV 块打分，再只注意选中的那几块

MSA 是建在 GQA（Grouped Query Attention）之上的块级稀疏注意力，两个分支：Index Branch（索引分支）和 Main Branch（主分支）。

**Index Branch（索引分支）**。轻到什么程度？在标准 GQA 之上只多加两个投影矩阵：每个 GQA 组配一个 index query 头，所有组共享一个 index key 头。打分流程是，先算 query 和因果窗口内所有 key token 的点积索引分，然后用 max-pooling 把 token 分聚合成块级分，最后每个 GQA 组独立挑出分数最高的 k 个 key 块。注意是"每组独立挑"，不同组可以关注不同的块。另外有个保底规则，query 所在的 local block（局部块）无条件入选，防止模型把眼皮底下的邻居漏掉。

**Main Branch（主分支）**。拿到选中的块之后，做标准的 softmax 注意力，但只算这些块里的 token。部署配置是块大小 B = 128、每组选 k = 16 个块，也就是每个 query 的注意力预算固定为 2048 个 KV token，不管上下文是 10 万还是 100 万。

复杂度账很清楚：GQA 主注意力是 O(L²)，MSA 主分支是 O(L·kB)，预算不随序列长度涨，indexer 那点计算量相对可以忽略。

打个比方，全注意力是读完一整个百万字的档案馆再回答问题；MSA 是先派一个极轻量的图书管理员给所有书架打分，每个问题只从档案里抽出最相关的 16 个书架来读，而且每个 GQA 组各抽各的。

为什么选块级而不是 token 级？论文说得直白：token 级选择粒度最细，但细碎的计算很难映射到 GPU 的矩阵操作上；块级选择路由开销小、访存规则，还能放松头维度的硬件约束。这是为部署而生的取舍。

## 三、训练：先用 KL 把索引器对齐，再放开稀疏

Top-k 选择不可导，语言建模损失训不到索引投影，MSA 的训练方案是四个零件：

1. **KL 对齐损失**。把索引分布对齐到 Main Branch 的注意力分布：以组内各头注意力概率的平均当老师，让 indexer 在选中块诱导出的 token 集合上模仿它。老师分布 detach 掉梯度，KL 损失不动主分支分毫。

2. **Gradient Detach（梯度截断）**。对 indexer 的输入 hidden states 做 stop-gradient，KL 的梯度只更新两个索引投影矩阵，不碰主干。辅助损失就是个干净的对齐信号。

3. **Indexer Warmup（索引器预热）**。两阶段日程：开头若干步先跑全注意力，只训新加的索引投影，让 indexer 先学会打分；然后切换到稀疏注意力，KL 改在 top-k 选中的位置上算。这个日程同样适用于把已训好的全注意力 checkpoint 无损稀疏化。

4. **Local Block（强制局部块）**。训练推理全程保留 query 所在块的那个槽位，防止退化到忽略近邻。

验证做得很足。在一个 109B 的 MoE 模型上（41 层、激活 6B、64 个 query 头配 4 个 KV 头、原生多模态训练）跑了两条路：**MSA-PT** 从头训，3T token 预算，40B token 预热后全程稀疏；**MSA-CPT** 从 2.6T 的 GQA checkpoint 换注意力继续训 400B token。结果两条 LM loss 曲线跟全注意力几乎重合，梯度范数也全程正常，稀疏训练跟稠密训练一样稳。

能力上，MSA 跟 GQA 打得有来有回：文本代码基本持平，部分任务反而更强，比如 TAU2 从 29.6 涨到 37.6，MMMU 从 79.8 涨到 84.2，HLE 从 44.14 涨到 45.48。论文自己的解释是，原生稀疏预训练让模型表征主动适应了稀疏注意力模式。长上下文扩展实验里，每 query 只给 2048 token 的预算，HELMET 跟全注意力只差 0.6 分，紧预算下长程能力没塌。

## 四、Kernel：把理论稀疏变成真实加速

理论 FLOPs 降了不等于墙钟快了，稀疏注意力的索引构建、top-k、query gather、负载不均都是开销。MSA 这节的 kernel 设计是论文的重头戏：

**exp-free TopK（免指数 Top-k）**。softmax 保序，选 top-k 根本不用算 exp，直接把原始分数丢进选择。配合 B=128、k=16 的小 k 场景写了专用 kernel：warp 内 32 个 lane 各流式处理 1/32 的行，共享内存里维护 k 元最小堆，最后 shuffle 归并。实测比 torch.topk 快 5.1 倍，比 TileLang 的基数选择快 3.7 倍。

**KV-outer 稀疏注意力**。迭代顺序反着来：外层遍历 KV 块，把选中该块的 query gather 过来拼在一起，塞满 128×128 的 tensor-core MMA。论文给了 IO 分析，KV-outer 的算术强度约为 Q-outer 的 L/(kB) 倍，1M 上下文下优势巨大。热点块（几乎每个 query 都选的早期块）会拖垮调度，解法是 pre-scheduled tile chunking：调度 kernel 提前把热点 tile 按 query 维切块分给多个 CTA，再用 two-phase combine 合并部分结果，全程不用原子操作。

账算下来：1M 上下文下每 token 注意力 FLOPs 降 28.4 倍；H800 实测，prefill 快 14.2 倍，decode 快 7.6 倍（109B 实验模型口径）。

落到 M3 产品上，官方口径是另一组数：百万上下文下单 token 计算量约为上一代 M2 的 1/20，Prefilling 加速超 9 倍、Decoding 加速超 15 倍；底层推理算子重新设计了数据读取与计算路径，据报道性能较主流开源方案提升 4 倍以上。输出速度从上线时的约 30 TPS 提到约 80 TPS，官方说还要再提 30-40%。

## 五、原生多模态：从第一天起就混训，不是后来接的模块

M3 的多模态不是"语言模型练好了再挂个视觉编码器"，而是从预训练 Step 0 开始，文本、图片、视频交错（interleaved）混合训练，不同模态的语义空间从第一天就在同一个模型里融合。据官方说法，这是第一个从 Step 0 做多模态混合训练的开源模型。

两个细节值得记。一是 MiniMax 强调 interleaved data（交错数据）对多模态性能的提升"比一般认为的更加关键"，图文在序列里交替出现，跨模态对齐才长得出来；二是为了喂饱这种训练，他们重构了数据管线，把预训练数据规模顶到了 100T（百万亿）token 量级。

回报写在成绩单上：SVG-Bench 超过 Claude Opus 4.7，OmniDocBench 超过 Gemini 3.1 Pro。MSA 论文的 109B 消融也从侧面佐证，原生稀疏预训练的 MSA-PT 在图像和视频任务上普遍强于全注意力基线，稀疏注意力和原生多模态是互相成就的。

## 六、成绩：编程开源第一，demo 敢跑 24 小时

先看 benchmark。M3 的主战场是编程和 agent：

- **SWE-Bench Pro 59.0%**，超过 GPT-5.5 和 Gemini 3.1 Pro，逼近 Opus 4.7
- **Terminal Bench 2.1 66.0%**，跟 Opus 4.7（66.1）贴脸
- **BrowseComp 83.5**，反超 Opus 4.7 的 79.3
- MCP Atlas 74.2、KernelBench Hard 28.8、SWE-fficiency 34.8
- Artificial Analysis 综合智能指数全球开源第一，GDPval-AA 开源第一，Vals.AI 国产第一，Code Arena WebDev 进了帕累托前沿

数学也有惊喜，配套的 MaxProof 框架（arXiv:2606.13473）把 M3 系列推到 IMO 2025 的 35/42、USAMO 2026 的 36/42，均超人类金牌线。

官方放的两个长任务 demo 最能说明 1M 上下文加 agent 的含金量。一个是 CUDA 算子优化：M3 连续自主跑了约 24 小时，1959 次工具调用、147 次 benchmark 提交，把 Hopper GPU 上 FP8 GEMM 的峰值利用率从 7.6% 提到 71.3%，实测加速 9.4 倍。另一个是论文复现：约 12 小时自主跑完，18 次 commit、23 张实验图表，复现出 SFT 阶段趋势和 DPO 的 squeezing 效应。这种小时级的自主作业，上下文不够长的模型连入场资格都没有。

产品侧，与 M3 同日发布的还有 MiniMax Code，专为 M3 设计、跟 M3 一起训练的 Agent 产品，内置 Agent Team 多智能体协作和 Producer + Verifier 对抗式 Harness。商业侧是组合拳：API 永久降价 50%（标准档 512K 以内输入 2.10 元/百万 token、输出 8.40 元/百万 token），权重全开源；市场用脚投票，OpenRouter 上 M3 首周调用量就达 2.5 万亿 token，冲进全球前三。7 月的 WAIC 2026 上，M3 是 MiniMax 展台的核心展品。

## 收尾：我的一点看法

跟 DeepSeek V3.2 的 DSA 摆在一起看最有意思，两家押的是同一条稀疏注意力路线，做法却是两种性格。DSA 走精细路线，token 级选择、lightning indexer 多头打分、建在 MLA 的 MQA 模式上，所有头共享一个 top-2048 索引；MSA 走粗犷路线，块级选择（128 token 一块）、每组独立 top-16、建在 GQA 上，indexer 轻到只加两个投影矩阵。DSA 换来更细的召回，MSA 换来 GPU 上规整的访存和"什么卡都能部署"的普适性，论文里那句"奥卡姆剃刀"不是客套。但两家的训练配方像同一个模子刻出来的，稠密预热、KL 对齐、梯度截断、稀疏继续训练，一步不差，说明这套"先对齐索引器再放开稀疏"的 recipe 已经是行业事实标准。

原生多模态这点我想单独夸。市面上多数旗舰的多模态是"后接"的，语言底座练好了再挂视觉模块，像成年人学二外；M3 从 Step 0 就图文视频混训，是母语级双语。100T 量级的数据管线重构听着枯燥，但这才是原生多模态真正的门槛。SVG-Bench 超 Opus 4.7 不是白来的。

组合拳也打得聪明。开源权重是掀桌子，API 永久五折是补刀，80 TPS 的输出速度是把体验拉满。23B 激活换来开源综合指数第一，这个性价比让闭源阵营很难受。

担忧也说两点。一是块级粒度的天花板，论文自己承认长上下文检索还有残余差距（HELMET 比全注意力低 0.6），块越大召回越粗，这个账躲不掉；二是那两个 demo 太漂亮了，24 小时 1959 次工具调用是精心挑选的高光场景，日常 agent 的稳定性、幻觉率、轨迹冗余，开源社区跑上几个月才有公论。M3 证明了国产模型能在架构层面开出自己的路，接下来要看的是这条路能走多稳。

---

## 附：核心数据速查

**M3 基本盘**
| 项目 | 数值 |
|---|---|
| 总参数 / 激活参数 | 428B / 23B |
| 上下文长度 | 最高 1M（512K 内稳定） |
| 模态 | 原生多模态（文本 / 图片 / 视频，Step 0 混训） |
| 预训练数据规模 | 100T token 量级（据报道） |
| 发布 / 开源 | 2026-06-01 发布 / 2026-06-16 开源（权重 6-12 已上线） |
| 开源地址 | huggingface.co/MiniMaxAI/MiniMax-M3、github.com/MiniMax-AI/MiniMax-M3 |

**MSA 关键参数**
| 项目 | 数值 |
|---|---|
| 架构基座 | GQA 上的块级稀疏注意力 |
| 块大小 B / 选择数 k | 128 / 16（每 query 预算 2048 KV token，每组独立） |
| Index Branch | 每组 1 个 index query 头 + 全局共享 1 个 index key 头，仅加 2 个投影矩阵 |
| 训练配方 | KL 对齐损失 + 梯度截断 + 索引器预热 + 强制 local block |
| 验证模型 | 109B MoE（41 层、激活 6B）、3T token、原生多模态 |
| 双路线 | MSA-PT（从头训）/ MSA-CPT（稠密 checkpoint 稀疏化续训 400B） |

**效率数字（两套口径）**
| 口径 | 数值 |
|---|---|
| 论文（109B，1M 上下文，H800） | 注意力 FLOPs 降 28.4×；prefill 14.2×、decode 7.6× |
| 官方（M3 vs M2） | 单 token 计算量约 1/20；Prefilling 加速超 9×、Decoding 超 15× |
| 输出速度 | 约 30 TPS → 约 80 TPS（计划再提 30-40%） |
| 推理算子 | 较主流开源方案提升 4 倍以上（据报道） |

**Benchmark 成绩**
| 指标 | M3 | 对照 |
|---|---|---|
| SWE-Bench Pro | 59.0% | 超 GPT-5.5、Gemini 3.1 Pro，逼近 Opus 4.7 |
| Terminal Bench 2.1 | 66.0% | Opus 4.7 为 66.1 |
| BrowseComp | 83.5 | Opus 4.7 为 79.3 |
| MCP Atlas | 74.2 | — |
| Artificial Analysis 综合智能指数 | 全球开源第一 | GDPval-AA 开源第一、Vals.AI 国产第一 |
| MaxProof（数学） | IMO 2025 35/42、USAMO 2026 36/42 | 均超金牌线 |

**长任务 demo**
- CUDA 算子优化：约 24 小时、1959 次工具调用、147 次 benchmark 提交，Hopper FP8 GEMM 峰值利用率 7.6% → 71.3%（加速 9.4×）
- 论文复现：约 12 小时、18 次 commit、23 张图表

**商业化**
- API 永久降价 50%：标准档 ≤512K 输入 2.10 元 / 输出 8.40 元每百万 token；>512K 输入 4.20 元 / 输出 16.80 元
- Token Plan：Plus 49 元/月（6 亿 token）、Max 119 元/月（18 亿）、Ultra 469 元/月（55 亿）
- 配套产品 MiniMax Code（Agent Team + Producer/Verifier 对抗式 Harness）
- OpenRouter 首周调用量 2.5 万亿 token（全球前三）

**关键概念清单**
- MSA = MiniMax Sparse Attention，建在 GQA 上的块级稀疏注意力
- Index Branch / Main Branch = 索引分支（打分选块）/ 主分支（选中块上做精确注意力）
- GQA = Grouped Query Attention，分组查询注意力（多个 query 头共享一组 KV 头）
- blockwise selection = 块级选择（B=128，比 token 级更 GPU 友好）
- per-group Top-k = 每个 GQA 组独立选 k=16 个块
- local block = 强制保留的 query 所在局部块
- KL alignment loss = 索引分布对齐主分支注意力的辅助损失
- Gradient Detach / Indexer Warmup = 梯度截断 / 索引器预热（先稠密后稀疏的两阶段训练）
- exp-free TopK = 免指数 Top-k（softmax 保序，跳过 exp 直接选）
- KV-outer iteration = 外层遍历 KV 块、gather query 拼满 tensor-core 的迭代顺序
- MSA-PT / MSA-CPT = 从头稀疏预训练 / 稠密 checkpoint 稀疏化续训
- interleaved data = 交错数据（图文视频在序列中交替排列）
- DSA = DeepSeek Sparse Attention（token 级选择，建在 MLA 上，与 MSA 互为对照）
- SWE-Bench Pro / Terminal Bench / BrowseComp = 编程智能体 / 终端操作 / 深度搜索评测基准
- Artificial Analysis Intelligence Index = 第三方综合智能指数榜单
