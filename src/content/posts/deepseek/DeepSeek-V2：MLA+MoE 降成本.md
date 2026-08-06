---
title: "DeepSeek-V2：MLA+MoE 降成本"
published: "2026-07-27"
category: "deepseek"
lang: "zh"
draft: false
tags: ["MoE", "MLA", "成本", "效率"]
---

# DeepSeek-V2 论文解读：MLA 和 MoE，一头一尾把成本打下来

> 论文：*DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model*
> 作者：DeepSeek-AI
> DeepSeek-V2 是承上启下的一作：attention 这边有了全新的 MLA，FFN 那边沿用了上一篇的 DeepSeekMoE。V3 的架构骨架就是它搭的，甚至 R1 也是从它对齐出来的。理解 DeepSeek 后续所有工作的钥匙，一半在这篇里。

---

## 一、引言：两个瓶颈，一前一后

开头把问题说得明白：模型越大越强，但代价是训练算力涨、推理吞吐掉。尤其是推理，有个隐藏的拦路虎——attention 的 KV cache。

Transformer 生成的时候，每个 token 的 key 和 value 都要缓存下来给后面的 token 用，序列越长、batch 越大，这个缓存越大，直接卡住最大 batch 和序列长度。为了省它，之前有人做 Grouped-Query Attention（GQA）和 Multi-Query Attention（MQA），但省缓存的同时性能也打折，不如标准的 MHA（Multi-Head Attention，多头注意力）。

DeepSeek 的思路是"我全都要"：设计一个 attention 机制，KV cache 比 GQA 还小，性能却比 MHA 还强——这就是 Multi-head Latent Attention（MLA）。FFN 那边则直接接上自家上一代的 DeepSeekMoE，稀疏计算，用更省的钱把模型练强。

把这两个凑一起就是 DeepSeek-V2：236B 总参数，每个 token 只激活 21B，上下文 128K。跟上一代稠密的 DeepSeek 67B 比，一组数字非常扎眼：

- 训练成本省 42.5%
- KV cache 减 93.3%
- 最大生成吞吐提 5.76 倍
- 性能还全面反超

这就是标题里三个词的意思：Strong（强）、Economical（省）、Efficient（快）。

## 二、MLA：把 KV cache 压成一个"小向量"

**为什么 KV cache 是瓶颈。** 标准 MHA 里，每个 token 每层要缓存 2·n_h·d_h 个元素（所有头的 key 和 value）。头多、层深，这个数字巨大。

**低秩联合压缩。** MLA 的核心是一招降维：不直接缓存 key 和 value，而是先投影到一个低维的 latent（潜在）向量 c_KV，叫"KV 联合压缩"。生成时只缓存这个压缩向量，用的时候再靠上投影矩阵把它还原成 key、value。这样每个 token 每层只需缓存 d_c 个元素，d_c 远小于原来的维度。

这招还有个额外的红利：因为 key 的还原矩阵 W_UK 可以"吸收"进 query 的投影矩阵 W_Q，value 的还原矩阵 W_UV 可以吸收进输出矩阵 W_O，推理时甚至不需要显式算出 key 和 value，直接在压缩空间里算 attention。训练时 query 也做同样的低秩压缩省显存（虽然它不影响 KV cache）。

**解耦 RoPE。** 这里有个技术上的坎：位置编码 RoPE 跟低秩压缩不兼容。RoPE 对 key 和 query 都敏感，一旦给 key 套上位置相关的 RoPE 矩阵，还原矩阵 W_UK 就没法吸收进 W_Q 了（因为中间夹着位置矩阵，矩阵乘法不交换），推理就得把前缀所有 token 的 key 重新算一遍，效率全没。

解法是"解耦 RoPE"：额外加一组多头的 query 和一个共享的 key，专门用来承载 RoPE 的位置信息。主路走压缩向量，旁路走位置信息，互不干扰。代价只是多缓存一小段解耦 key，可以忽略。

**效果对照。** 表格很清楚：MHA 每 token 缓存 2·n_h·d_h·l 个元素，GQA 是 2·n_g·d_h·l，MQA 是 2·d_h·l，MLA 只要 (d_c + d_Rh)·l，约等于 9/2·d_h·l。换算一下：MLA 的 KV cache 量级等于只有 2.25 个组的 GQA，但性能比 MHA 还强。DeepSeek-V2 里 d_c = 512（等于 4·d_h），解耦的每头维度是 64。

## 三、DeepSeekMoE：上一代的专家，这一代继续用

FFN 部分直接采用 DeepSeekMoE 架构：细粒度专家切分加共享专家隔离。V2 里每层 2 个共享专家加 160 个路由专家，每个专家中间隐层维度 1536，每个 token 激活 6 个路由专家。

因为用了 expert parallelism（专家并行），路由专家分布在多卡上，这篇补了几个工程细节：

**Device-Limited Routing（设备受限路由）。** 细粒度切分后激活的专家数量多，如果专家乱分布在很多卡上，每个 token 的通信开销就大。做法是：每个 token 先挑亲和分最高的 M 个设备（V2 里 M=3），只在选中的设备里做 top-K。这样每个 token 最多跨 3 张卡，通信有上界，实测 M≥3 时性能跟不设限的 top-K 差不多。

**三种辅助损失。** 除了防 routing collapse（路由崩溃）的专家级平衡损失和保证卡间算力均衡的设备级平衡损失，还多了一个通信平衡损失，专门保证每张卡接收的 token 数也均衡，否则发送量有上界、接收量没谱，通信照样堵。

**Token-Dropping（token 丢弃）。** 平衡损失不能保证严格均衡，训练时再加一层保险：每张卡算平均计算预算，亲和分最低的 token 直接丢掉，丢到预算以内。留了个口子：大约 10% 的训练序列的 token 永远不丢。这样训练和推理的丢弃策略可以灵活对齐。

## 四、预训练：8.1T token，中文占大头

数据处理沿用 DeepSeek 67B 的三阶段流程，但量加了、质升了：挖掘互联网数据潜力、优化清洗流程，"抢救"回一大批被误删的数据；中文数据特意加多，分词后中文 token 比英文多约 12%。还特意过滤掉有争议的内容，缓解地域文化带来的数据偏见。

模型配置：60 层、隐层 5120、128 个头（每头 128 维）、KV 压缩维度 512、query 压缩维度 1536、解耦每头维度 64。训练超参：AdamW、warmup 后阶梯下降、最大学习率 2.4e-4、batch size 从 2304 渐增到 9216。

**长上下文扩展。** 预训练默认序列长度 4K，之后用 YaRN 把上下文一路扩到 128K，scale 设 40、目标 160K。因为注意力结构特殊，作者把 YaRN 的熵调节因子改成了 √t = 0.0707·ln s + 1，用来压困惑度。训练只额外跑了 1000 步、序列长度 32K，但测 128K 时依然稳——"Needle In A Haystack"（大海捞针）测试从 1K 到 128K 全绿。

## 五、评估：21B 激活参数，打遍开源

先看数字。21B 激活参数对 67B 稠密参数，DeepSeek-V2 在几乎所有 benchmark 上碾压 DeepSeek 67B。跟其它开源模型比：

- **对 Qwen1.5 72B**：英文、代码、数学全面胜出；中文多选题略输，其它项持平或更好。
- **对 Mixtral 8x22B**：英文整体相当或更好（英语常识类略输），MMLU 反超，代码数学相当；中文大幅领先（Mixtral 没吃中文数据）。
- **对 LLaMA3 70B**：英文基础能力有轻微差距——这个差距是坦率承认的，因为 DeepSeek-V2 的英文 token 只有 LLaMA3 的不到四分之一。但代码数学能力相当，中文 benchmark 碾压。

作者还特意点了一句：DeepSeek-V2 预训练阶段从未见过 SFT 数据。

**训练成本。** H800 集群上每训 1T token，DeepSeek 67B 要 300.6K GPU 小时，DeepSeek-V2 只要 172.8K，省 42.5%。虽然 MoE 有额外通信开销，但算子和通信都优化过，MFU（算力利用率）不低。

**推理效率。** 部署时参数转 FP8，KV cache 再量化到平均每元素 6 bit。单机 8 张 H800，生成吞吐超 5 万 token/秒，是 DeepSeek 67B 的 5.76 倍；prompt 输入吞吐超 10 万 token/秒。

## 六、对齐：SFT 加两阶段 RL

**SFT。** 1.5M 条指令数据（有用性 120 万 + 安全性 30 万），比初版提升了数据质量，重点治幻觉、提写作。微调 2 个 epoch，学习率 5e-6。SFT 后 GSM8K、MATH、HumanEval 大涨，因为 SFT 数据里数学代码含量高。

**RL。** 这里用了 GRPO（Group Relative Policy Optimization），这是从 DeepSeekMath 继承的算法。它跟 PPO 最大的区别：不要 critic 模型（那个通常跟策略模型一样大的值函数网络），而是对同一道题采一组输出，用组内分数的均值、标准差当基线算 advantage。省掉 critic 就是省一大笔训练开销。

RL 分两阶段。第一阶段"推理对齐"：专门训一个数学代码的奖励模型，用它的反馈优化策略。第二阶段"人类偏好对齐"：多奖励框架，有用性 + 安全性 + 规则奖励加权求和。代码偏好数据来自编译器反馈，数学偏好数据来自标准答案，奖励模型用 DeepSeek-V2 Chat (SFT) 初始化。工程上也下了功夫：混合引擎（训练和推理用不同并行策略）、vLLM 大 batch 推理后端、CPU 卸载调度。

**评估成绩。** DeepSeek-V2 Chat (RL)：MT-Bench 8.97、AlpacaEval 2.0 长度控制胜率 38.9、AlignBench 7.91。英文开放域对话在开源模型里是顶级；中文 AlignBench 上超越所有开源模型，甚至打败大多数闭源模型——中文语言理解单项超过 GPT-4-Turbo-1106-Preview，只有推理单项还落后于 ERNIEBot-4.0 和 GPT-4 这种巨无霸。

## 七、讨论：几条工程经验的沉淀

**SFT 数据量不能太少。** 有工作说不到 1 万条 SFT 数据就够用，但 DeepSeek-V2 实验发现少于 1 万条时 IFEval 明显掉。解释是：模型需要一定数据量才能长出特定技能，虽然这个量随模型变大而减少，但不会归零。

**Alignment Tax（对齐税）。** RL 让开放域生成大涨，但 BBH 这类标准 benchmark 被拖累——这就是对齐税。作者靠数据处理和训练策略把这笔税压到能接受的范围，但也承认"既对齐又不牺牲通用能力"是个值得继续研究的方向。

**Online RL 优于 offline。** 偏好对齐里在线方法明显强于离线方法，为此他们砸了很多功夫实现在线 RL 框架。

## 八、结论、局限与展望

结论就是开头的三件套：性能强、训练省、推理快，21B 激活参数跻身当时最强开源模型之列。

局限还是那老三样：知识不更新、会幻觉、非中英语言弱。

展望里有一条特别值得注意：下一步的目标是"性能追平 GPT-4"——这就是 DeepSeek-V3 的方向。另外预告了要支持多模态。这两条后来都兑现了，只是多模态那条拐了个弯。

## 收尾：我的一点看法

V2 这篇的价值，我认为被严重低估了。DeepSeekMoE 那篇解决的是"同样的算力，MoE 怎么比 GShard 更强"，V2 解决的是"推理时 KV cache 怎么不把 MoE 卡死"。两个问题合起来，才让"大而省"成为可能。

MLA 是个真正的原创点，值得单独夸。KV cache 是推理成本的隐藏大头，GQA、MQA 为了省它都牺牲了性能，MLA 用低秩压缩不仅没牺牲，还更强了。那个"上投影矩阵吸收进 W_Q / W_O"的细节尤其漂亮——推理时 key 和 value 根本不用算出来，等于把降维的收益吃干榨净。后来 DeepSeek-V3 用的也是 MLA，说明这个设计经住了规模考验。

还有一个值得品的位置：这篇论文的字里行间都在省。省训练用 MoE，省推理用 MLA，省 KV cache 用量化，省 RL 用 GRPO 砍掉 critic。它不是某个单一技术惊艳，而是一整套"省钱哲学"。放到 2024 年中，这套组合拳打出来的性价比，是其它开源模型很难跟的。

当然话说回来，英文基础能力确实被 LLaMA3 甩了一点——英文 token 不到人家的四分之一，这个账赖不掉。但中文一骑绝尘、代码数学相当，已经够它站在第一梯队。

---

## 附：核心数据速查

**DeepSeek-V2 基本盘**
| 项目 | 数值 |
|---|---|
| 总参数 / 激活参数 | 236B / 21B |
| 上下文长度 | 128K |
| 预训练数据 | 8.1T tokens（中文 token 比英文多约 12%） |
| 层数 / 隐层维度 | 60 / 5120 |
| attention 头数 | 128（每头 128 维） |
| 共享 / 路由专家 | 2 + 160（每 token 激活 6 个路由专家） |
| 每专家中间维度 | 1536 |

**对 DeepSeek 67B 的三项效率提升**
| 指标 | 数值 |
|---|---|
| 训练成本 | 省 42.5%（300.6K → 172.8K GPU 小时 / 每 T token） |
| KV cache | 减 93.3% |
| 最大生成吞吐 | 提升至 5.76 倍（单机 8×H800 超 5 万 token/秒） |
| prompt 输入吞吐 | 超 10 万 token/秒 |

**关键 benchmark（Base，21B 激活参数）**
- MMLU 78.5；GSM8K 79.2；MATH 43.6；HumanEval 48.8；MBPP 66.6
- C-Eval 81.7；CMMLU 84.0；CHID 92.7；CCPM 93.1

**Chat (RL) 开放域成绩**
- MT-Bench 8.97；AlpacaEval 2.0 长度控制胜率 38.9；AlignBench 7.91

**KV cache 每 token 对比（l = 层数）**
| 注意力机制 | KV cache | 能力 |
|---|---|---|
| MHA | 2·n_h·d_h·l | 强 |
| GQA | 2·n_g·d_h·l | 中等 |
| MQA | 2·d_h·l | 弱 |
| MLA | (d_c+d_Rh)·l ≈ 4.5·d_h·l | 更强 |

**关键概念清单**
- MLA = Multi-head Latent Attention，多头潜在注意力（低秩 KV 联合压缩）
- KV cache = 推理时为加速生成的键值缓存
- latent = 潜在向量（压缩后的低维表示）
- decoupled RoPE = 解耦旋转位置编码（让 RoPE 与低秩压缩兼容）
- DeepSeekMoE = 细粒度专家切分 + 共享专家隔离的 MoE 架构
- expert parallelism = 专家并行（专家分布在不同设备上）
- device-limited routing = 设备受限路由（每 token 最多跨 M 台设备）
- routing collapse = 路由崩溃（少数专家霸榜）
- token-dropping = 训练时按亲和分丢弃 token 保负载均衡
- YaRN = 长上下文外推方法（4K → 128K）
- GRPO = Group Relative Policy Optimization，组相对策略优化（无 critic 的 RL 算法）
- alignment tax = 对齐税（对齐过程伤害部分 benchmark 性能）
- AlpacaEval / MT-Bench / AlignBench = 中英开放域对话评测基准
- MFU = Model FLOPs Utilization，模型算力利用率
