---
title: "MiniMax-M2：10B 杀上榜首"
published: "2026-08-03"
category: "minimax"
lang: "zh"
draft: false
tags: ["MoE", "Agent", "编程", "成本"]
---

# MiniMax-M2 系列论文解读：10B 激活干翻旗舰，靠性价比杀上 OpenRouter 榜首

> 系列：M2（2025.10.27）→ M2.1（2025.12 下旬）→ M2.5（2026.02.13）→ M2.7（2026.03.18 发布，04.12 开源）
> 作者：MiniMax（技术报告 *The MiniMax-M2 Series: Mini Activations Unleashing Max Real-World Intelligence*，arXiv:2605.26494，2026 年 5 月首发、7 月修订，四代合写一篇）
> 这条线是 MiniMax 从"大而全"转向"小激活 + Agent"的路线转折点。之前 MiniMax-Text-01 走的是 456B 总参、线性注意力混搭的大底座路线，M2 开始改打性价比：229.9B 总参只激活 9.8B，用 Claude Sonnet 4.5 约 8% 的价格逼近其能力，MIT 协议开源，一路杀到 OpenRouter 调用量榜首。四代合起来是一部"以价换量、以量养训"的 Agent 进化史，也埋了一个争议收尾：M2.7 开源协议收紧，社区炸了锅。

---

## 一、M2：先把每个 token 的成本账算明白

> 发布：2025 年 10 月 27 日，MIT 协议开源。
> 成绩：Artificial Analysis 智能指数全球前五、开源第一（据报道综合 61 分）；SWE-bench Verified 官方口径 69.4%；价格 $0.30/$1.20 每百万 token，约为 Claude Sonnet 4.5 的 8%。上架两天冲进 OpenRouter 全球前十，后升至据报道全球调用量第四、编程类第一。

### 一、问题：Agent 任务又长又贵，稠密大模型扛不住

大模型的主战场正在从单轮对话转向长程 Agent：写代码、跑测试、浏览网页、操作工具，一个任务动辄几十上百轮推理加调用，上下文拉到十万 token 级。这种负载下，推理成本直接决定生意做不做得成——每个 token 都要过一遍全部参数的稠密模型，部署成本根本压不下来。

M2 的解法是激进的稀疏化：**229.9B 总参数，每个 token 只激活 9.8B**。容量按旗舰的标准给，算力按小模型的标准收。

### 二、架构：256 个专家挑 8 个，注意力反而回归"保守"

- **MoE**：62 层 decoder-only，256 个细粒度专家，**Top-8 路由**。路由用 **sigmoid gating** 加可学习的专家偏置，每个专家独立打分，去掉 softmax 的零和约束，负载均衡损失几乎可以不要。细粒度切分的好处是路由组合更多、设备间利用率方差更小。
- **Attention**：全部层用标准多头注意力 + **GQA**（48 个 query 头、8 个 KV 头），放弃了上一代 MiniMax-Text-01 的 Lightning Attention 混合方案。论文说得很直白：试了各种混合滑动窗口注意力，预训练还能糊弄过去，一到 32K 以上的长上下文 Agent 任务就原形毕露（RULER 128K CWE 从 90.0 掉到 72.0），"省的那点算力不值得拿长上下文能力换"。
- **MTP**：带 **Multi-Token Prediction** 模块，预训练 1 个，衰减期用权重复制扩到 3 个，推理时当 speculative decoding 的草稿模型，白赚吞吐。
- **上下文**：原生 192K（对外宣传口径 200K 级），预训练 29.2T token，长上下文从 8K 逐级扩到 192K。

### 三、Interleaved Thinking：工具调用之间不许断片

Agent 场景还有个隐藏痛点：多数模型的思考链是一次性的，工具调完回来，前面的推理要么丢了、要么得重推。M2 把 **Interleaved Thinking** 立为一等公民：推理和工具调用交替进行，**每一轮的完整思考块都追加回上下文**，模型带着全部推理记忆进入下一轮，形成 Plan-Act-Reflect 循环。消融显示，去掉"推理状态持久化"后，深搜、软件工程这类多步任务掉分最狠——这条设计后来成了整个 M2 系列的地基。

### 四、成绩与价格炸弹

Artificial Analysis 智能指数（v3.0）据报道综合 61 分，全球第五、开源第一，是中国开源模型首次挤进该榜全球前五。SWE-bench Verified 官方口径 69.4%（第三方榜单用自家 scaffold 复测约 50%，口径差异所致），BrowseComp 44.0，Toolathlon 16.7——Agent 各项当时还不算顶尖，但价格是真的炸裂：**$0.30/$1.20 每百万 token，约为 Claude Sonnet 4.5 的 8%**，速度还快约一倍。MIT 协议、可本地部署，OpenRouter 上架两天进前十。M2 的任务很明确：不求全面碾压，只求把"够用且便宜"做到极致，先把调用量抢过来。

## 二、M2.1：从"能写 Python"到"全栈打工"

> 发布：2025 年 12 月下旬，继续 MIT 开源。
> 成绩：Multi-SWE-bench 49.4%，超过 Claude Sonnet 4.5 的 44.3%；自研全栈基准 VIBE 平均 88.6 分，接近 Claude Opus 4.5、几乎全子集压过 Sonnet 4.5。

### 一、短板：多语言编程和 App 开发是开源模型的偏科项

M2 发布后暴露的问题很具体：仓库级代码修复集中在 Python 生态，一到 Rust、Java、Go、C++ 这些编译型语言就露怯；让模型从零搭一个能跑的应用（前端、移动端、后端），完成度也不如闭源旗舰。M2.1 专修这两门课。

### 二、Multi-SWE-bench 49.4%：第一次正面压过 Sonnet 4.5

Multi-SWE-bench 考的是多仓库、多语言的真实 issue 修复，是当时最贴近"跨语言打工"的基准。M2.1 拿下 **49.4%**，把 Claude Sonnet 4.5（44.3%）甩在身后，与 Opus 4.5（50.0%）只差半个身位——这是开源模型第一次在这条赛道上压过同代旗舰。SWE-bench Verified 从 69.4 升到 74.0，SWE-bench Multilingual 从 56.5 升到 72.5。官方同步把 Rust、Java、Go、C++、Kotlin、Objective-C、TypeScript、JavaScript 的能力系统性拉了一遍，原生 Android/iOS 开发也补齐了（演示里有 Kotlin 重力感应模拟器、iOS 桌面小组件）。

### 三、VIBE：自己出题，自己打榜

为了衡量"从零到一构建完整可运行应用"的能力，MiniMax 自研并开源了基准 **VIBE**（Visual & Interactive Benchmark for Execution in Application Development），覆盖 Web、仿真、Android、iOS、Backend 五大子集，评测用 **Agent-as-a-Verifier** 范式：不看代码截图，而是让验证 Agent 把应用真实部署起来、多轮交互打分。M2.1 综合 **88.6 分**（Web 91.5 / Android 89.7 / iOS 88.0 / 仿真 87.1 / 后端 86.7），Sonnet 4.5 是 85.2，Opus 4.5 是 90.7。另外这一代的思维链明显变短，响应更快、token 更省——为 M2.5 的速度叙事做了铺垫。

## 三、M2.5：Agent RL 全面铺开，Forge 登场

> 发布：2026 年 2 月 13 日，MIT 开源。
> 成绩：SWE-bench Verified 80.2%、BrowseComp 76.3%、Multi-SWE-bench 51.3%（当时开源第一）；上线 12 小时登顶 OpenRouter 热度榜，周调用量 3.07T token，据报道连续五周全球第一。

### 一、问题：给 Agent 做 RL，是个"不可能三角"

M2.5 是系列的技术分水岭，核心不是数据，而是 RL。给长程 Agent 做强化学习有三件事互相打架：**吞吐**（rollout 耗时从几秒到几小时都有）、**训练稳定性**（梯度方差要压住）、**Agent 灵活性**（什么脚手架都得能训）。论文称之为"不可能三角"，M2.5 的答案是自研 RL 框架 **Forge**。

### 二、算法：CISPO 加一套"复合奖励"

算法用从 M1 继承的 **CISPO**（Clipped Importance Sampling Policy Optimization）：重要性比率非对称裁剪加 stop-gradient，保证 MoE 上做大规模 RL 不发散。奖励设计是亮点：光看任务成败不够，192K token 的轨迹里信用分配根本做不细，于是叠了三层——**Process Reward**（过程奖励，惩罚语言混杂、工具格式错误，奖励结构良好的中间推理）、**真实任务耗时奖励**（同等正确的轨迹，墙钟时间短的得分高，逼模型学会并行调用工具）、reward-to-go 加轨迹级基线降方差。训练用混合域策略：推理、代码、Agent、通用四个域每步都混着训，按阶段调配比、调上下文长度、调难度，防偏科也防遗忘。

### 三、Forge：白盒黑盒通吃，前缀树合并省 40 倍

Forge 把训练、推理、Agent 三方解耦，中间用 Gateway 和数据池连接。它同时支持两类 Agent：**白盒**（上下文管理逻辑对训练框架透明，可精确重建状态分布）和**黑盒**（API-only，框架只看外部可见的请求流）——这意味着 Claude Code 这类第三方脚手架不改一行代码就能进训练循环。调度用 **Windowed FIFO**：滑窗内谁先完成谁先训（不堵队），滑窗外严格保序（分布不漂）。最狠的是 **prefix tree merging**：同一 rollout 组里大量样本共享前缀，合并成树后共享前缀只算一次前向，数学上零近似误差，训练加速最高 **40 倍**。

数据侧同样狠。RL 要跑得稳，前提是奖励可信，M2.5 的 SWE 数据管线直接从 GitHub PR 挖矿：给每个 PR 合成可运行的 Docker 环境，用 F2P/P2P 测试用例当可验证奖励，再做 bug 注入、commit 合并增广，甚至把修 bug 反转成"写测试用例"任务；终端任务则由 Terminal-Gym 把 Stack Overflow 帖子自动合成带验证脚本的 Docker 环境。一句话：每条训练轨迹都必须落在可执行环境里、带可信奖励信号。

### 四、成绩：霸榜与内部 dogfooding

数字上，SWE-bench Verified **80.2%**（追平 Claude Opus 系列）、BrowseComp **76.3%**（当时开源 SOTA）、Multi-SWE-bench 51.3%、Terminal-Bench 2.0 51.7%。速度叙事同样凶狠：**100 TPS 快速版**，连续跑一小时成本 1 美元；50 TPS 版本一小时 0.3 美元。Simon Willison 的独立评测里它排第三、开源第一。OpenRouter 上线 12 小时登顶热度榜，一周内调用量登顶，周调用量 3.07T token，超过 Kimi K2.5、GLM-5、DeepSeek V3.2 三家总和，据报道此后连续五周稳居全球第一。最扎心的宣传来自内部：MiniMax 内部 **30% 的任务由 M2.5 自主完成**（覆盖研发、产品、销售、HR、财务），**80% 的新提交代码由它生成**。据报道训练覆盖 20 万+ 真实业务场景——模型先在自己公司"上岗"，再卖给全世界。

## 四、M2.7：模型开始训练它自己

> 发布：2026 年 3 月 18 日（API），4 月 12 日正式开源权重。
> 成绩：SWE-Pro 56.22%、GDPval-AA 1495 ELO 开源第一；官方称其为"首个深度参与自身进化的大模型"。争议：改用限制商用的自定义许可。

### 一、Self-Evolution：不是噱头，是真的进生产流水线了

M2.7 的卖点是 **self-evolution**。MiniMax 搭了一套 Model Iteration System：研究员定目标、审结果，模型干活。M2.7 先给自己写了一个 **Agent Harness**（工作区脚手架，含分层技能、持久记忆、安全护栏、评测设施）——零人类代码，全部出自内部 M2.7 之手。然后在 RL 团队里实际"上班"：监控训练运行、读日志、诊断指标异常、自动改代码调配置，承担内部 RL 流程 **30% 到 50%** 的日常迭代工作（包括文献调研、实验配置、训练监控）。最激进的实验是让 M2.7 优化自家编程脚手架：自主执行"**分析→规划→修改→评测**"循环 100+ 轮，自己发现了 loop detection 这类机制、找到了更优参数组合，内部评测集上带来 **30% 提升**。

### 二、成绩：开源权重里的新天花板

技术报告里 M2.7 对标的是 Claude Opus 4.6、Sonnet 4.6、GPT 5.4、Gemini 3.1 Pro：**SWE-bench Pro 56.2**（官方对外口径 56.22%，与 GPT-5.3-Codex 相当）、Multi-SWE-bench **52.7**（对比模型中最高）、SWE-bench Multilingual 76.5、BrowseComp 77.8、AIME 2026 94.2、GPQA-Diamond 89.8。最能体现"自我进化"含金量的是 MLE Bench Lite：M2.7 当独立 ML 工程师跑 22 场 Kaggle 式竞赛，24 小时自主迭代，最好一轮拿 9 金 5 银 1 铜，奖牌率 **66.6%**，追平 Gemini 3.1 Pro。GDPval-AA 在 Artificial Analysis 榜单上以 **1495 ELO 拿下开源第一**。注意短板也在报告里写着：MMLU-Pro 81.8 反而比 M2.5 的 85.2 低，纯知识密度上小激活模型依然吃亏。

### 三、协议争议：MIT 的时代结束了

真正让 M2.7 出圈的是开源协议。M2、M2.1、M2.5 三代都是干净的 MIT，M2.7 却换成了自定义许可（社区称 Modified-MIT）：非商用免费，**商用需 MiniMax 书面授权**，且商业产品要显著标注 "Built with MiniMax M2.7"。官方解释是防止第三方"阉割降级"（过度量化、错误模板）砸了招牌，负责人还特意澄清自托管写代码完全免费。但社区不买账：MIT 本就允许商用，挂着 MIT 的名却行限制之实，Hacker News 上的批评是"这是权重可查看的专有模型，不是开源"；更微妙的是 HuggingFace 仓库里 MIT 标识一度没撤干净。背景不难猜：2026 年 1 月 MiniMax 港交所上市、募资约 6.2 亿美元，开源从获客手段变成了需要回收的商业资产。M2.7 是这条路线转折的第一张账单。

## 五、横向总结：三条线穿起四代模型

### 一、架构演进：一副骨架，四代后训练

四代模型共用同一个底座：229.9B 总参、9.8B 激活、256 专家 Top-8、192K 上下文、MTP 投机解码。真正的演进全在后训练：数据管线从 SWE 扩到 AppDev、终端、深搜、办公、金融，奖励从"测试通过"升级到 Agent-as-a-Verifier 的三层验证。这是"架构一次到位、能力迭代靠数据和 RL"的路线，跟 DeepSeek-V3 那套"基础设施定江山"的思路同源。

### 二、Forge RL 体系：从算法到流水线

M2 时代的 RL 还是配角，M2.5 起 Forge 成为主角，M2.7 直接让模型坐上驾驶位。技术栈一脉相承：CISPO 保稳定、复合奖励管信用分配、白盒黑盒通吃管生态、Windowed FIFO 和前缀树合并管效率。报告称这套 Gateway 抽象已在数百种 Agent 脚手架、数千种工具调用格式上验证过。"真实任务耗时作为奖励"这招尤其务实——它训出来的不是做题家，是懂得并行开工、快速交付的"打工人"。

### 三、开源协议：从 MIT 到收紧

MIT（M2/M2.1/M2.5）→ 自定义许可（M2.7），中间隔着一次 IPO。三代 MIT 攒下的社区信任，是 M2 系列能以 8% 价格撬动旗舰市场的杠杆；协议收紧换来了商业控制权，代价是"伪开源"的质疑和生态的观望。这笔账怎么算，要看 M3 还开不开源。

---

## 收尾：我的一点看法

M2 系列最让我服气的是它把"性价比"做成了一套系统工程，而不是单纯的降价。10B 激活不是妥协，是设计目标：因为激活小，推理便宜，才敢把 Interleaved Thinking 这种动辄几十万 token 的长程 Agent 玩法下放给所有人；因为调用量大，OpenRouter 上的真实使用又反哺训练数据和奖励设计。8% 的价格逼近 Claude，靠的不是赔本，而是稀疏 MoE + Forge 效率 + MIT 生态的三重杠杆。这套"以价换量、以量养训"的飞轮，是 2026 年上半年国产模型最完整的商业叙事。

但代价也明摆着。一是通用能力的隐性税：MMLU-Pro 不升反降、纯知识基准始终追不上稠密旗舰，小激活模型是用 Agent 长板换知识短板；二是 M2.7 的协议转向，我认为是一步险棋。MIT 三代攒下的"真开源"人设，是 MiniMax 在海外开发者圈子里最值钱的资产，换成 Modified-MIT 后，哪怕条款本身不算苛刻，"MIT 标识没撤干净"这种细节足以让信任打折。上市要报表，开源要人心，两头都要的结果往往是两头都疼。

对比另外两家更有意思：DeepSeek 至今全系 MIT，靠的是技术声望换生态位，不急着从权重上收钱；智谱 GLM 走的是"开源引流 + API 收费"的中间路线，协议温和。MiniMax 选了最激进的变现姿势，本质上是在赌：我的模型强到就算限制商用，你也不得不来谈授权。M2.7 的自进化能力确实给了它一点赌本——如果模型真能承担 30%-50% 的研发迭代，那 MiniMax 的护城河就不在权重本身，而在那套让权重持续变强的流水线。流水线的产出若持续领先，协议收紧就只是时间问题上的讨价还价；一旦迭代速度被追上，这步棋就会显得既丢了口碑又没赚到钱。

---

## 附：核心数据速查

**四代模型对比**
| 项目 | M2 | M2.1 | M2.5 | M2.7 |
|---|---|---|---|---|
| 发布 | 2025.10.27 | 2025.12 下旬 | 2026.02.13 | 2026.03.18（04.12 开源） |
| 参数 | 229.9B 总 / 9.8B 激活（四代同底座） | 同左 | 同左 | 同左 |
| SWE-bench Verified | 69.4% | 74.0% | 80.2% | —（SWE-Pro 56.22%） |
| Multi-SWE-bench | 36.2% | 49.4% | 51.3% | 52.7% |
| SWE-bench Multilingual | 56.5% | 72.5% | 74.1% | 76.5% |
| BrowseComp | 44.0% | 47.4% | 76.3% | 77.8% |
| 标志事件 | AA 榜全球第五开源第一 | 自研基准 VIBE 平均 88.6 | OpenRouter 登顶、周调用 3.07T | 自我进化、GDPval-AA 开源第一 |
| 价格（$/M token） | 0.30 / 1.20 | 同 M2 | 0.30 / 2.40（100 TPS） | 同 M2.5 体系 |
| 协议 | MIT | MIT | MIT | 自定义许可（商用需授权） |

**M2 底座规格**：62 层、隐层 3072、词表 200,064、256 专家 Top-8、sigmoid gating、全层 MHA+GQA（48Q/8KV）、192K 上下文、MTP×3 投机解码、预训练 29.2T token

**关键概念清单**
- MoE / fine-grained experts = 混合专家 / 细粒度专家（256 个小专家，Top-8 路由）
- sigmoid gating = sigmoid 门控路由（加专家偏置，替代 softmax 零和约束）
- MTP = Multi-Token Prediction（兼作 speculative decoding 草稿路径）
- Interleaved Thinking = 交错思维（推理与工具调用交替，思考状态跨轮持久化）
- Plan-Act-Reflect = 规划-执行-反思循环
- Forge = MiniMax 自研 Agent 原生 RL 框架（训练/推理/Agent 三方解耦）
- CISPO = Clipped Importance Sampling Policy Optimization（非对称裁剪 + stop-gradient）
- Process Reward = 过程奖励（轨迹中间行为的稠密监督）
- Task Completion Time Reward = 真实任务耗时奖励（鼓励并行、快速交付）
- Windowed FIFO = 窗口式先进先出调度（吞吐与分布一致性的折中）
- prefix tree merging = 前缀树合并（共享前缀只算一次，最高 40 倍训练加速）
- Agent-as-a-Verifier（AaaV）= 用验证 Agent 真实部署并交互打分（VIBE 的评测范式）
- VIBE = 全栈应用开发基准（Web/仿真/Android/iOS/后端）
- SWE-bench Pro / Multi-SWE-bench / BrowseComp / GDPval-AA = 编码/多语言编码/深搜/办公任务基准
- self-evolution = 自我进化（模型参与自身训练迭代：调参、修代码、改脚手架）
- Modified-MIT = M2.7 的自定义许可（非商用免费，商用需授权 + 标注来源）
