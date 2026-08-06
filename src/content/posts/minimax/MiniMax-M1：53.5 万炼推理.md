---
title: "MiniMax-M1：53.5 万炼推理"
published: "2026-08-01"
category: "minimax"
lang: "zh"
draft: false
tags: ["长上下文", "强化学习", "推理", "效率"]
---

# MiniMax-M1 论文解读：百万上下文里放开想，RL 只花 53.5 万美元

> 论文：*MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention*
> 作者：MiniMax
> 2025 年 6 月 17 日发布，全球首个开源的大规模混合注意力（MoE）推理模型。DeepSeek-R1 证明"大规模 RL 出奇迹"之后，这是 MiniMax 交出的答卷，也是 M 系列的起点。卖点一句话：用 Lightning Attention 把超长思考、百万上下文的算力账单打下来，再用新算法 CISPO 把 RL 训练效率再提一倍——512 块 H800 训三周，租金约 53.5 万美元。

---

## 一、引言：大家都在加长思考，但注意力先撑不住了

R1 之后的行业共识很统一：想让模型更强，就让它"想得更久"。OpenAI o1、DeepSeek-R1 靠大规模强化学习不断拉长推理长度，performance 一路涨——这被归功于一个新维度，**test-time compute（测试时算力）**：生成阶段砸进去的 FLOPs 越多，效果越好，难题上尤其明显。

但传统 Transformer 有个绕不过去的拦路虎：**softmax attention 的计算复杂度是序列长度的平方（O(N²)）**。思考长度一拉长，注意力这块的算力和延迟就暴涨。这不光让推理变贵，更要命的是卡住了 RL——RL 训练里大头就是不停生成超长 rollout，注意力越贵，RL 越烧不起。

之前不是没人想办法：稀疏 attention、线性 attention、状态空间模型（Mamba 这类）、线性 RNN……但论文直言，这些方案几乎没在大规模推理模型上被真正验证过，目前能打的大推理模型清一色还是传统注意力。唯一的例外是腾讯 Hunyuan-T1（用 Mamba），但没开源、细节极少。

MiniMax 要做的，就是造一个既开源、又能高效堆 test-time compute、还能跟最先进推理模型掰手腕的大模型。这就是 **MiniMax-M1**：混合 MoE 架构 + **Lightning Attention**，基于自家 MiniMax-Text-01 底座（456B 总参、每 token 激活 45.9B、32 个专家）。原生支持 100 万 token 上下文——是 DeepSeek-R1 的 8 倍；生成 100K token 时只花 R1 约 25% 的 FLOPs。再用大规模 RL 从数学一路训到沙箱里的真实软件工程，最终交出 M1-40k 和 M1-80k 两个思考预算版本。

## 二、Lightning Attention：把"长思考"的算力账单打下来

先说清楚 softmax attention 为什么贵。标准注意力里，每生成一个新 token，都要回头跟前面**所有** token 算一遍相关性。这就像每进一个新人，都得跟屋里所有人逐一握手——人越多，握手次数按平方涨，KV cache 也跟着越堆越大。线性注意力换了个打法：不再逐个握手，而是维护一个**固定大小的"状态笔记"**，每来一个新 token 只更新、读取这份笔记，单 token 开销近似常数，总复杂度降到近似线性——softmax 是全场互相加微信，线性注意力是只维护一张公共通讯录，人再多查表成本也不涨。

**Lightning Attention** 就是这种线性注意力的一种 **I/O-aware（感知访存）实现**——不光理论上 FLOPs 低，还真把显存读写（HBM/SRAM 之间的搬运）压下来，让"理论便宜"变成"实际快"。

MiniMax-M1 用的是**混合架构**：每 7 个带 Lightning Attention 的 transnormer block 后面，接 1 个 softmax attention block。纯线性注意力在精确长程检索上会吃亏（笔记毕竟是有损压缩），所以每隔几层掺一层全注意力兜底——大部分计算走便宜的线性通道，关键位置保留精确检索能力，鱼和熊掌兼得。

账算下来很直观。跟 DeepSeek-R1 比：

- 生成长度 64K token 时，M1 只花不到 50% 的 FLOPs
- 生成长度 100K token 时，只花约 25% 的 FLOPs

思考越长，省得越多。这个优势在 RL 里被放大——rollout 生成恰恰是 RL 的主要瓶颈，注意力便宜了，RL 自然就便宜了。再叠加原生 100 万上下文，M1 特别适合那种"输入很长、还得放开了想"的真实任务。

## 三、RL 的地基：继续预训练 + SFT 冷启动

RL 不是凭空上的。MiniMax 先在 MiniMax-Text-01 上做**继续预训练**，喂了额外 7.5T token：重新打磨网页和 PDF 解析、提高数学和代码数据的召回，重点抽天然的 QA 对、坚决不用合成数据；把 STEM、代码、书籍、推理相关数据的占比提到 70%。训练配方上先以 8e-5 恒定学习率跑 2.5T token，再衰减到 8e-6 跑 5T。长上下文扩展也有个坑：混合 Lightning 架构收敛复杂度高，训练长度拉太猛会突然梯度爆炸——作者归因于浅层参数跟不上深层变化（浅层衰减率不同、更关注局部信息），解法是分 4 个阶段平滑地把上下文从 32K 一路扩到 1M。

然后是 **SFT 冷启动**：精选带长 CoT 的样本，把"反思式思维链"这类行为先注入模型，覆盖数学、代码、STEM、写作、问答、多轮对话，其中数学 + 代码约占 60%。目的是给后面的 RL 一个又稳又强的起点。

## 四、CISPO：不裁 token，裁权重

RL 算法是这篇的另一半核心。先从背景讲起：

**PPO** 用一个重要性采样权重 ρ = π(θ)/π(old) 来修正 off-policy 的分布偏移，然后用 clip 把 ρ 限制在 [1−ε, 1+ε] 内，取 `min(ρ·A, clip(ρ)·A)`。**GRPO** 干脆去掉 critic，advantage 直接用"组内相对奖励"算（同一道题采 G 个回答，自己的奖励减去组均值再除以组标准差），但 token 级的 clip 机制照旧。

问题就出在这个 **token 级裁剪**上。MiniMax 在混合架构上跑 zero-RL 时发现，GRPO 压不住、带不动长 CoT。消融下来，罪魁是那个 clip：

像 "Wait""However""Recheck""Aha" 这类**反思词**，是推理路径上的"岔路口"，本身就罕见、base 模型给的概率很低。策略一更新，这些 token 的 ρ 很容易蹿得很高，结果在第一次 on-policy 更新后就被 clip 出局，之后的 off-policy 梯度里彻底没份了。而 MiniMax 每批生成要做多达 16 轮 off-policy 更新，损失被放大。这些低概率 token 恰恰是稳住熵、支撑可扩展 RL 的关键。**DAPO** 想把上限 clip 调高来补救，但在 16 轮 off-policy 的设定下收效甚微。

**CISPO（Clipped IS-weight Policy Optimization）** 的解法很巧：**不裁 token 的更新，改裁重要性采样权重本身**。回到 REINFORCE 目标，把 ρ 先 clip 到 [1−ε_low, 1+ε_high]，再对它做 **stop-gradient**，当成一个固定系数乘到 `A·log π` 上：

- PPO/GRPO：clip 的是 token 更新本身 → 越界的 token 梯度被整个清零
- CISPO：clip 的是权重系数（且截断梯度）→ 每个 token 都保留梯度，只是振幅被钳住

打个比方：PPO 是"谁嗓门超标就直接禁言"，CISPO 是"嗓门大的把音量调小，但让人家继续说"。这样所有 token（尤其是长回答里的反思 token）都持续贡献梯度，熵稳得住、探索不掉线。CISPO 没有 KL 惩罚项，沿用 DAPO 的 dynamic sampling 和长度惩罚；ε_low 设成很大值（等于不设下限），只调 ε_high。

效果在受控实验里很干净：拿 Qwen2.5-32B-base 做 zero-RL、AIME 2024 当标尺，**CISPO 相同步数下全面超过 GRPO 和 DAPO，而且只用一半训练步数就追平 DAPO——等于 2 倍加速**。

## 五、混合架构跑大规模 RL：三个坑和三个填法

混合注意力天生利于 RL 扩展，但 MiniMax 是头一个在这架构上真刀真枪大规模上 RL 的，踩了不少独家的坑：

**坑一：训练和推理的数值精度对不上。** RL 对数值精度极敏感。作者发现 rollout token 在训练态和推理态算出来的概率明显不一致，直接卡住了奖励上涨。逐层排查后锁定元凶：输出层 LM head 上有大幅值激活。解法是把 LM head 提到 **FP32** 精度，两条理论上应完全一致的概率被重新对齐，相关性从约 0.987 拉到 0.997，奖励才恢复正常增长。这个问题在带 softmax 的小型稠密模型上根本不出现——是混合架构独有的。

**坑二：优化器超参极其敏感。** M1 训练里梯度量级跨度极大，从 1e-18 到 1e-5，大部分还小于 1e-14，相邻迭代间梯度相关性又弱。用 VeRL 默认的 AdamW（β=(0.9, 0.999)、eps=1e-8）会不收敛。最终改成 β1=0.9、β2=0.95、eps=1e-15。

**坑三：重复死循环。** 复杂 prompt 会诱发又长又重复的病态回答，梯度巨大、威胁稳定。简单字符串匹配抓不住花样百出的重复模式，作者改用概率信号：模型一旦陷入重复循环，每个 token 的概率会飙高。于是定了条规则——**连续 3000 个 token 每个概率都高于 0.99 就提前截断**，既防失稳又顺带提了吞吐。

## 六、数据、奖励与课程：可验证和不可验证一把抓

RL 数据分两大类，配一套课程（curriculum）糅在一起。

**可验证问题（规则奖励 + 格式奖励）：**

- **数学**：数十万道竞赛级题清洗去重、与 SFT 严格隔离防泄漏，再用强模型算 pass@10，只保留通过率严格在 0~0.9 之间的题，最后留约 5 万道——太简单和太偏的都不要。
- **逻辑**：用自研 **SynLogic** 框架合成 41 类逻辑任务（密码、数独等），约 5.3 万条，并用难度上下界保证"有挑战但学得动"。
- **竞赛编程**：3 万题，缺测试用例的就让模型补全，同样按通过率筛。
- **软件工程**：借鉴 SWE-bench，从公开 GitHub 仓库构造真实 issue/PR，搭**容器化沙箱**真正跑代码——测试全过给正奖励，编译错、运行挂、测试回归给零或负奖励，用执行结果当硬信号。

**不可验证问题（GenRM 生成式奖励模型）：** 2.5 万条通用样本。有标准答案的（如 STEM）用 GenRM 按五档评分；没标准答案的（写作、指令遵循）用成对比较，给 −1/0/1，参考答案靠"瑞士轮"打分选优。这里有个大坑：**GenRM 偏爱长回答**，会诱导模型刷长度、reward hacking。离线治理不够，MiniMax 干脆在 RL 训练中**在线持续监控长度作弊**，一发现就重新校准 GenRM，再叠加奖励塑形、value clipping、归一化。

**课程与扩预算**：先用纯规则奖励的推理任务打底，再逐步混入通用任务——既保住数学代码这些可验证硬技能，又长出通用能力，避免灾难性遗忘。第一轮 RL 输出上限 40K（得 M1-40k），随后扩到 80K（得 M1-80k），扩窗用**阶梯式**：40K→48K→56K→64K→72K→80K，每步看困惑度收敛、输出长度 99 分位是否逼近窗口上限再进档。期间还遇到"pattern collapse"——负样本长度涨得比正样本快，尾段积累过多负梯度，导致后段文本崩坏；用重复检测早停、样本级 loss + token 级归一化、调低梯度裁剪阈值等三招按住。

## 七、评估：代码、工具、长文本三线开花

评测统一用 temperature 1.0、top-p 0.95。先看结论：M1 整体追平甚至超过 DeepSeek-R1、Qwen3-235B 这些强开源模型，**强项集中在复杂软件工程、工具调用、长上下文**；数学竞赛上略逊于最新的 R1-0528。

- **数学**：M1-80k AIME 2024 86.0，开源第二，仅次于 R1-0528（91.4），也压过 Qwen3-235B（85.7）；AIME 2025 76.9、MATH-500 96.8。
- **代码**：LiveCodeBench 65.0（与 Qwen3 打平）、FullStackBench 68.3（超 Qwen3）。
- **软件工程**：SWE-bench Verified 56.0（40k 也有 55.6），略低于 R1-0528 的 57.6，但大幅甩开其它开源模型——这正是沙箱执行式 RL 换来的。
- **长上下文**：OpenAI-MRCR(128k) 73.4，超过 o3（56.5）和 R1（35.8）；1M 档位 56.2，是唯一能跑满 100 万的开源模型，与 Gemini 2.5 Pro 同档。整体长文本**全球第二**，仅以微弱差距次于 Gemini 2.5 Pro。
- **工具调用**：TAU-bench 62.8%（图 1，airline 62.0 / retail 63.5），**超过 Gemini 2.5 Pro**，也压过所有开源模型。

短板也写得很坦白：GPQA Diamond 70.0、HLE 8.4、SimpleQA 18.5——知识密度和事实性上落后 R1-0528（GPQA 81.0、SimpleQA 27.8）和 Gemini；数学竞赛整体也不及 R1-0528。

RL scaling 的收益有曲线为证（图 4）：训练过程中回答长度持续上涨，AIME 和 LiveCodeBench 的平均响应超 2 万 token，AIME 2024 准确率从 68% 一路涨到 80%——"想得更久 = 更强"在 M1 上成立，而且它想得起。

---

## 收尾：我的一点看法

读完 M1，我最想先聊的是 CISPO 这个选择。它和 GRPO/DAPO 的分歧其实是个很本质的取舍：**该不该把"越界"的 token 直接踢出梯度**。GRPO 继承 PPO 的 trust region，clip token 更新；DAPO 只是把上限放宽。MiniMax 却退一步回到 REINFORCE，clip 的是重要性采样权重本身，还截断梯度——结果是所有 token 都保留梯度、熵稳得住。这跟 R1 的哲学正好能对照着看：R1 赌的是"奖励够干净、少干预"，M1 赌的是"梯度别丢、让反思词活下来"。两者都在减少不必要的约束，只是下手的位置不同。CISPO 的 2 倍收敛加速，本质是把 RL 最贵的 rollout 复用率提上去了。

第二个让我记住的是那笔 **53.5 万美元**。512 块 H800、三周，跑完一个 456B 模型的完整 RL——这数字本身在顶级推理模型里算不上天文，但它把"混合注意力 + CISPO = 更省的 RL"这个命题落了地。省的不只是推理账单，更是 RL 训练账单，而后者才是 reasoning 时代真正的大头。换句话说，Lightning Attention 不光是给用户的福利，也是 MiniMax 给自己把迭代成本打了下来。

当然冷水也要泼。M1 的强项很"务实"——软件工程、工具调用、长上下文，这些都是能搭沙箱、能上执行奖励、可验证的领域；一到吃知识密度的 GPQA、HLE、SimpleQA，和数学竞赛，就被 R1-0528 和 Gemini 拉开。这说明它赢在"会干活、能落地"，而非"更博学"。另外混合注意力的数值精度坑、优化器敏感性，也提醒后来者：新架构上 RL 不是拿来就能用，工程债得自己一点点还。

放在 R1 之后的时间线上看，M1 的意义更像一次"架构押注"：当所有人都默认用传统注意力堆思考长度时，MiniMax 赌线性/混合注意力能把 test-time compute 的成本曲线压下来。从结果看它赌对了长上下文和 agent 场景。M 系列从这里起步，后面能不能把知识密度这块短板补上，是我最期待的事。

---

## 附：核心数据速查

**模型规格**
| 项目 | 数值 |
|---|---|
| 底座 | MiniMax-Text-01 |
| 总参数 / 激活参数 | 456B / 45.9B |
| 专家数 | 32 |
| 注意力 | 混合：每 7 个 Lightning Attention block + 1 个 softmax attention block |
| 原生上下文 | 100 万 token（DeepSeek-R1 的 8 倍） |
| 版本 | M1-40k / M1-80k（思考预算） |
| 100K 生成 FLOPs | 约为 DeepSeek-R1 的 25%（64K 时 <50%） |

**RL 配置**
| 项目 | 数值 |
|---|---|
| RL 算法 | CISPO（裁 IS 权重不裁 token，无 KL，含 dynamic sampling + 长度惩罚） |
| 算力 | 512 块 H800，约 3 周 |
| 租赁成本 | 约 $534,700（≈53.5 万美元） |
| off-policy 轮数 | 每批生成最多 16 轮 |
| 精度修复 | LM head 升 FP32，概率相关性 0.987→0.997 |
| 优化器 | AdamW，β1=0.9、β2=0.95、eps=1e-15 |
| 重复截断 | 连续 3000 token 概率均 >0.99 即停 |
| 继续预训练 | 7.5T token，STEM/代码/书/推理占比 70% |

**RL 数据构成**
- 数学约 5 万道（pass@10 ∈ (0, 0.9)）、逻辑约 5.3 万条（SynLogic，41 任务）、竞赛编程 3 万题，均规则奖励；软件工程数千条用沙箱执行奖励
- 通用 2.5 万条用 GenRM 奖励（有答案五档评分 / 无答案成对 −1/0/1）

**关键 benchmark（M1-80k 对主要对手）**
| Benchmark | M1-80k | M1-40k | DS-R1-0528 | Qwen3-235B | Gemini 2.5 Pro | OpenAI o3 |
|---|---|---|---|---|---|---|
| AIME 2024 | 86.0 | 83.3 | 91.4 | 85.7 | 92.0 | 91.6 |
| MATH-500 | 96.8 | 96.0 | 98.0 | 96.2 | 98.8 | 98.1 |
| LiveCodeBench | 65.0 | 62.3 | 73.1 | 65.9 | 77.1 | 75.8 |
| SWE-bench Verified | 56.0 | 55.6 | 57.6 | 34.4 | 67.2 | 69.1 |
| OpenAI-MRCR (128k) | 73.4 | 76.1 | 51.5 | 27.7 | 76.8 | 56.5 |
| OpenAI-MRCR (1M) | 56.2 | 58.6 | — | — | 58.8 | — |
| TAU-bench (airline) | 62.0 | 60.0 | 53.5 | 34.7 | 50.0 | 52.0 |
| TAU-bench (retail) | 63.5 | 67.8 | 63.9 | 58.6 | 67.0 | 73.9 |
| GPQA Diamond | 70.0 | 69.2 | 81.0 | 71.1 | 86.4 | 83.3 |
| SimpleQA | 18.5 | 17.9 | 27.8 | 11.0 | 54.0 | 49.4 |

**关键概念清单**
- test-time compute = 测试时算力（生成阶段多花 FLOPs 换性能）
- LRM = Large Reasoning Model，大推理模型
- Lightning Attention = I/O-aware 的线性注意力实现
- 混合注意力 = 每 7 个线性注意力 block 掺 1 个 softmax attention block
- CISPO = Clipped IS-weight Policy Optimization（裁 IS 权重而非 token 更新，截断梯度当固定系数）
- PPO = Proximal Policy Optimization；GRPO = Group Relative Policy Optimization（去 critic，组内相对 advantage）；DAPO = GRPO 变体（dynamic sampling、clip-higher、长度惩罚）
- importance sampling weight ρ = π(θ)/π(old)，修正 off-policy 分布偏移
- zero-RL = 直接从 base 模型做 RL（对照实验设定）
- GenRM = Generative Reward Model，生成式奖励模型
- reward hacking = 奖励作弊（如刷长度骗 GenRM）
- SynLogic = MiniMax 的逻辑数据合成框架（41 类任务）
- curriculum = 课程学习（先规则奖励推理、再混入通用任务）
- pattern collapse = 模式崩坏（负样本变长导致尾段文本退化）
- SWE-bench Verified / TAU-bench / OpenAI-MRCR / LongBench-v2 = 软件工程 / 工具调用 / 长上下文基准
- AIME / GPQA / HLE / SimpleQA = 竞赛数学 / 研究生级科学问答 / 高难知识 / 事实性基准
