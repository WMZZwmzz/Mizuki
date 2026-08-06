---
title: "DeepSeek-V3.2：开源拿下 IMO 金牌"
published: "2026-08-02"
category: "deepseek"
lang: "zh"
draft: false
tags: ["开源", "推理", "Agent", "GRPO"]
---

# DeepSeek-V3.2 论文解读：稀疏注意力加疯狂的 RL，把开源带到 IMO 金牌

> 论文：*DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models*
> 作者：DeepSeek-AI
> 这篇是 2025 年 12 月的技术报告。三个核心点，稀疏注意力（DSA）把长上下文的计算复杂度砍下来，可扩展的强化学习协议把后训练算力烧到预训练的 10% 以上，还有一个大规模 agentic（智能体）任务合成管线把推理能力灌进工具调用场景。最炸裂的是高算力变体 Speciale，IOI 2025、ICPC 世界总决赛没做任何针对性训练就拿了金牌，IMO 2025 则是结合 DeepSeekMath-V2 的证明技术拿下金牌，推理能力跟 Gemini-3.0-Pro 平起平坐。

---

## 一、背景：开源和闭源的差距在被拉大

引言先把问题摆出来。推理模型的发布是个分水岭，之后大模型能力涨得飞快，但最近几个月出现了一个让开源社区坐不住的现象，闭源模型的进步速度明显比开源快，差距不是在缩小而是在拉大。

作者归因于三点。架构上，开源模型还在用 vanilla attention（朴素注意力），长序列效率差，拖累部署和后训练。资源上，开源模型在后训练阶段投入的算力不够。智能体能力上，开源模型在工具调用场景的泛化和指令遵循能力明显落后。

对策就是论文的三板斧，DSA、可扩展 RL、agentic 任务合成管线。

## 二、DeepSeek Sparse Attention（稀疏注意力）

### 工作原理

DSA 由两部分组成，lightning indexer（闪电索引器）和细粒度 token 选择机制。

indexer 是个轻量模块，只有很少的注意力头，算 query token 和前面所有 token 的"索引分数"，激活函数用 ReLU（为了吞吐），可以跑在 FP8 上，计算量很小。然后每个 query 只挑索引分数最高的 top-k 个 key-value 条目做注意力。

选多少个？训练时每个 query 选 2048 个 KV token。复杂度上，主注意力从 O(L²) 降到 O(Lk)，k 远小于 L。indexer 本身还是 O(L²)，但它的计算量比完整注意力小得多。

### 挂在 MLA 上

V3.2 从 DeepSeek-V3.1-Terminus 的 checkpoint 继续训练，所以 DSA 直接基于 MLA 实现。为了在 kernel 层面让 KV 条目被多个 query 共享（这是计算效率的关键），用了 MLA 的 MQA 模式，每个 latent 向量被 query token 的所有头共享。

### 两阶段继续预训练

**Dense warm-up（稠密预热）**。先用 1000 步把 indexer 初始化出来，这个阶段保持稠密注意力，冻结所有参数只训 indexer，用 KL 散度损失让 indexer 的输出分布对齐主注意力的分布。1000 步、每步 16 条 128K 序列，总共才 2.1B token，学习率 1e-3。

**Sparse training（稀疏训练）**。引入细粒度选择机制，优化所有参数适应稀疏模式。indexer 的输入从计算图中分离出来单独优化，它的训练信号只来自 KL 损失，主模型只吃语言建模损失。15000 步、每步 480 条 128K 序列，943.7B token，学习率 7.3e-6。

### 等性能验证

作者专门做了 parity（对等性）评估，证明换成稀疏注意力没掉性能。标准 benchmark 上跟 V3.1-Terminus 差不多；用 ChatbotArena 的 Elo 间接测人类偏好，两者很接近；第三方长上下文评测 AA-LCR 上反而高了 4 分，Fiction.liveBench 全面更好。

推理成本上，长上下文场景端到端提速明显，论文给了 H800 集群上的每百万 token 成本曲线，V3.2 在长序列 prefilling 和 decoding 的成本都显著低于 V3.1-Terminus。短序列 prefilling 还专门实现了一个 masked MHA（掩码多头注意力）模式模拟 DSA，短上下文效率更高。

## 三、后训练：把 RL 算力烧起来

### 专家蒸馏加混合 RL

延续 V3.2-Exp 的管线。对每个领域（数学、编程、通用逻辑推理、通用 agentic、agentic 编程、agentic 搜索，外加写作和通用问答）先训一个领域专家模型，每个都从同一个 V3.2 base checkpoint 微调，大算力 RL。然后专家模型生成蒸馏数据，喂给最终模型。消融显示蒸馏数据训练的模型只比专家略差，后续 RL 一补就抹平差距。

混合 RL 用一个阶段把推理、agent、人类对齐三种训练合并，避免多阶段训练的灾难性遗忘。推理和 agent 任务用规则奖励加长度惩罚加语言一致性奖励，通用任务用带逐 prompt rubric（评分细则）的生成式奖励模型。

### Scaling GRPO 的四个稳定化技巧

这一节是论文的干货，讲怎么把 GRPO 稳定地放大到大规模：

1. **无偏 KL 估计**。把 K3 估计器用重要性采样比修正成无偏的。原来的 K3 在"当前策略给 token 的概率远低于参考策略"时会给这些 token 分配无界的巨大权重，梯度噪声大，累积起来训练就不稳。修正后梯度无偏。实践中还发现不同领域对 KL 强度的需求不同，数学这种领域弱 KL 甚至不加反而更好。

2. **Off-Policy Sequence Masking（离策略序列掩码）**。RL 通常先大批量采样 rollout 数据，再切小批量做多轮梯度更新，这本身就引入 off-policy（离策略）偏差；推理框架和训练框架实现细节还不一样，偏差更大。做法是，对于 advantage 为负、且新旧策略 KL 散度超阈值 δ 的序列，直接掩掉不进梯度。直觉是，模型该从自己的错误里学，但离策略太远的负样本会误导优化。

3. **Keep Routing（保留路由）**。MoE 训练和推理的路由路径可能不一致，同样的输入在两端激活不同的专家子空间，优化就不稳。做法是训练时强制使用推理采样时的专家路由路径。作者说这个操作对 MoE 的 RL 稳定性至关重要，从 V3-0324 起就一直在用。

4. **Keep Sampling Mask（保留采样掩码）**。top-p 采样会把概率过低的 token 截掉，保证样本质量，但这也让新旧策略的动作空间不一致，违反重要性采样的前提。做法是采样时保留截断掩码，训练时对新策略也施加同样的掩码，保证动作子空间一致。

### 算力账

RL 后训练算力已经超过预训练成本的 10%，而且作者观察到，RL 预算跟推理性能持续正相关，暗示再加算力还能再涨。官方 V3.2 因为加了长度约束奖励模型，性能是被压着的，去掉限制就是 Speciale。

## 四、把思考装进工具调用

R1 证明了思考过程能显著提升解题能力，但把 R1 那套直接搬进多轮工具调用场景有毛病，R1 在第二轮消息到达时就把推理内容丢掉，导致每次工具调用都要从头重新推理整个问题，token 浪费严重。

V3.2 的上下文管理规则：只有来了新的用户消息才丢弃历史推理内容；如果只是追加工具相关的消息（比如工具输出），推理内容全程保留。删推理时，工具调用历史和结果仍然留在上下文里。注意有些 agent 框架（比如 Roo Code、Terminus）用用户消息模拟工具交互，享受不到这个增强，作者建议这类框架用非思考模式。

### 冷启动

先靠精心设计的 system prompt 让模型"边推理边调用工具"，比如在思考数据里要求先把推理过程写进 <think> 标签再给最终答案，在 agent 数据里要求多轮工具调用穿插在推理过程中。这个阶段产出的轨迹可能不够稳健，但足够给后续 RL 当种子。

### 大规模 agentic 任务合成

RL 需要海量多样任务。代码 agent 用 GitHub 上百万条 issue-PR 对搭可执行环境，要求金补丁能让失败测试变通过（F2P）且不引入回归（P2F），建成了几万个可复现的跨语言环境（Python、Java、JS、TS、C、C++、Go、PHP），24667 个任务。搜索 agent 用多智能体管线造数据，先采长尾实体，再让问题构造 agent 探索、答案生成 agent 产出多样候选、验证 agent 多轮检索校验，50275 个任务。通用 agent 更狠，用自动环境合成 agent 造出 1827 个任务导向环境，工作流是建数据库、造任务专用工具函数、生成"难解易验证"的任务并迭代加难度，4417 个任务，涉及行程规划这种带一堆约束的组合搜索问题。

消融很关键。随机抽 50 个合成任务，DeepSeek-V3.2-Exp 只对 12%，GPT-5-Thinking 对 62%，说明任务够难。只用合成 agent 数据做 RL（非思考模式），τ2-Bench、MCP-Mark、MCP-Universe 全面大涨，而只在代码和搜索环境做 RL 对这三个 benchmark 没帮助，证明合成数据能泛化。

## 五、成绩

**推理**。V3.2（Thinking）跟 GPT-5-high 一个水平，略输 Gemini-3.0-Pro，跟 Kimi-K2-Thinking 相当但输出 token 少得多。AIME 2025 93.1、HMMT Feb 92.5、GPQA-Diamond 82.4、HLE 25.1、Codeforces rating 2386、MMLU-Pro 85.0。

**智能体**。SWE-Verified 73.1、SWE Multilingual 70.2（开源最强）、Terminal Bench 2.0 46.4、BrowseComp 51.4（用上下文管理到 67.6）、BrowseCompZh 65.0、τ2-Bench 80.3、MCP-Universe 45.9、MCP-Mark 38.0、Tool-Decathlon 35.2。作者坦承 tool-use 场景离闭源前沿还有距离，模型有过度自我验证、轨迹过长把 128K 上下文撑爆的毛病。

**Speciale 的竞赛成绩**，这是论文最出圈的部分：
- IMO 2025，35/42，金牌
- CMO 2025，102/126，金牌
- IOI 2025，492/600，金牌（排名第 10）
- ICPC WF 2025，解出 10/12 题，金牌（排名第 2）

实现上，Speciale 只吃推理数据，RL 时降低长度惩罚，还掺了 DeepSeekMath-V2 的数据和奖励方法来补数学证明。代价是 token 效率差，AIME 要 23k token 对 Gemini-3.0-Pro 的 15k，所以官方 V3.2 又重新加了长度约束，在性能和成本之间取平衡。

**搜索场景的测试时计算扩展**。128K 上下文在 agent 工作流里经常不够用，作者试了几种上下文管理策略，token 用到 80% 时触发。Summary 策略把超出的轨迹总结后重新 rollout，平均 364 步，性能到 60.2，但效率低；Discard-all 简单粗暴全删工具历史，67.6，又省又快。这节的结论是，测试时计算可以串行（上下文管理）也可以并行（多轨迹采样），benchmark 时得把真实计算成本算进去。

## 收尾：我的一点看法

V3.2 这篇给我的冲击点跟 V3 不一样。V3 证明"便宜能练出强模型"，V3.2 证明的是"开源模型在最高难度的智力竞赛里已经能拿金牌"。IMO、IOI、ICPC 这三块金牌放一起看，含金量是实打实的，而且 Speciale 在 IOI、ICPC 上没做任何针对性训练，说明这是通用推理能力的溢出，不是刷题；IMO/CMO 则另融入了 DeepSeekMath-V2 的证明技术。

DSA 这个设计我挺喜欢。稀疏注意力不是新概念，但 V3.2 的做法很工程化，先把 indexer 用 2.1B token 预热对齐主注意力分布，再放开全参数稀疏训练，最后用 parity 评估证明"换了架构不掉性能"。这种"先证明没变差，再谈变好"的节奏，是正经工程团队的作风。

Scaling GRPO 那节是真正的传家宝。四个技巧里，无偏 KL 估计解决的是理论问题，off-policy 掩码、Keep Routing、Keep Sampling Mask 解决的全是训练稳定性这种"不写在论文里就没人知道"的坑。任何一个做 MoE 大模型 RL 的团队，这节都值得抄。

我的担忧也有。一是 token 效率，V3.2 用明显更长的输出换性能，Speciale 更是烧 token 大户，成本不低；二是知识广度，作者自己承认总训练 FLOPs 少，世界知识不如闭源前沿，这不是 RL 能补的，得回到预训练。所以 V3.2 的定位很清楚，它是"推理和 agent 的尖刀"，不是全知全能，跟 Gemini 那类均衡型选手比还有差距。

另外提一嘴上下文管理，这个细节很多读者会跳过，但我觉得它代表了一个趋势，测试时计算怎么分配开始成为主战场。Summary、Discard-all 这种土办法能带来十几个点的提升，说明推理类 agent 的瓶颈已经不在模型本身，而在上下文预算怎么花。

---

## 附：核心数据速查

**DSA 关键参数**
| 项目 | 数值 |
|---|---|
| 索引器 | lightning indexer，少头、FP8、ReLU 激活 |
| 每 query 选择 | top-2048 个 KV token |
| 复杂度 | 主注意力 O(L²) → O(Lk) |
| 预热阶段 | 1000 步、2.1B token、学习率 1e-3，只训 indexer |
| 稀疏阶段 | 15000 步、943.7B token、学习率 7.3e-6 |

**RL 稳定化四技巧**
- 无偏 KL 估计（修正 K3，防离群 token 梯度爆炸）
- Off-Policy Sequence Masking（掩掉负 advantage 且离策略远的序列）
- Keep Routing（训练强制沿用推理时的专家路由）
- Keep Sampling Mask（训练沿用采样的 top-p 截断掩码）

**V3.2 (Thinking) 推理成绩 vs 竞品**
| 指标 | GPT-5-High | Gemini-3.0-Pro | Kimi-K2-Thinking | V3.2 |
|---|---|---|---|---|
| AIME 2025 | 94.6 | 95.0 | 94.5 | 93.1 |
| HMMT Feb | 88.3 | 97.5 | 89.4 | 92.5 |
| HLE | 26.3 | 37.7 | 23.9 | 25.1 |
| LiveCodeBench | 84.5 | 90.7 | 82.6 | 83.3 |
| Codeforces | 2537 | 2708 | - | 2386 |

**V3.2 智能体成绩**
- SWE-Verified 73.1；SWE Multilingual 70.2；Terminal Bench 2.0 46.4
- BrowseComp 51.4（上下文管理后 67.6）；BrowseCompZh 65.0
- τ2-Bench 80.3；MCP-Universe 45.9；MCP-Mark 38.0；Tool-Decathlon 35.2

**V3.2-Speciale 竞赛成绩**
| 竞赛 | 得分 | 排名/奖牌 |
|---|---|---|
| IMO 2025 | 35/42 | 金牌 |
| CMO 2025 | 102/126 | 金牌 |
| IOI 2025 | 492/600 | 金牌（第 10） |
| ICPC WF 2025 | 10/12 | 金牌（第 2 名） |

**Agentic 任务规模**
- 代码 agent 24667 任务（GitHub issue-PR，真实环境）
- 搜索 agent 50275 任务（真实搜索 API）
- 通用 agent 4417 任务（1827 个合成环境）
- 代码解释器 5908 任务（Jupyter）

**关键概念清单**
- DSA = DeepSeek Sparse Attention，DeepSeek 稀疏注意力
- lightning indexer = 闪电索引器（轻量打分模块）
- top-k selection = 按索引分数选前 k 个 KV 条目
- parity evaluation = 对等性评估（证明稀疏不掉性能）
- specialist distillation = 领域专家蒸馏
- mixed RL = 混合强化学习（推理 + agent + 对齐一次训完）
- off-policy = 离策略（采样策略与优化策略不一致）
- K3 estimator = K3 KL 散度估计器
- Keep Routing / Keep Sampling Mask = 保留路由 / 保留采样掩码
- agentic task synthesis = 智能体任务合成
- thinking context management = 思考上下文管理（保留推理内容省 token）
- test-time compute = 测试时计算（推理阶段的可扩展算力）
- HLE = Humanity's Last Exam，人类最后考试
- IMO / IOI / ICPC WF / CMO = 国际数学奥林匹克 / 国际信息学奥林匹克 / 国际大学生程序设计竞赛世界总决赛 / 中国数学奥林匹克
- τ2-Bench / MCP-Universe / MCP-Mark / Tool-Decathlon = 工具调用与 agent 评测基准
