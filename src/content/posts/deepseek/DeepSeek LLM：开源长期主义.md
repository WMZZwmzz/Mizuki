---
title: "DeepSeek LLM：开源长期主义"
published: "2026-07-18"
category: "deepseek"
lang: "zh"
draft: false
tags: ["开源", "预训练", "对齐"]
---

# DeepSeek LLM 论文解读：开源大模型的"长期主义"

> 论文：*DeepSeek LLM: Scaling Open-Source Language Models with Longtermism*
> 作者：Xiao Bi 等，DeepSeek-AI
> 这是 DeepSeek 家 7B / 67B 稠密模型的原始论文，上一篇 DeepSeekMoE 里反复提到的"自家稠密 DeepSeek 7B / 67B"，指的就是它。预训练数据、对齐方法也都是这篇打下的底。

---

## 一、引言：别人训固定尺寸，他们回去研究 scaling law

论文开头先把形势摆出来：decoder-only Transformer 已经成了通向 AGI 的主流路子，预测下一个词，预训练完了再 SFT 一下，模型就能跟人聊天。这一波热潮是 ChatGPT、Claude、Bard 这些闭源产品点着的，社区对开源模型的期待被拉得很高，于是冒出一串开源工作，其中 LLaMA 系列最突出，成了开源模型事实上的标杆。

但 DeepSeek 注意到一个被忽略的地方。LLaMA 之后的开源社区，基本都在固定几个尺寸（7B、13B、34B、70B）上卷高质量模型，却很少有人认真研究 scaling law（缩放定律）。这里头还有个麻烦：早期两篇经典工作——Kaplan 那篇和 Chinchilla 那篇——对"同样的算力应该加给模型还是加给数据"给出了**相反的结论**，而且对超参数怎么设交代得也不够，让人没法判断那些实验是不是跑在了次优配置上。

所以这篇论文干的事是：自己把 scaling law 重新研究一遍，然后把结论用在两个最常见的开源尺寸上——7B 和 67B。标题里的 "Longtermism"（长期主义）就是这个意思，不为某一次发布刷分，而是把地基打好，让后面的版本能一路扩下去。

## 二、预训练：数据、架构、超参，都有讲究

**数据。** 目标是提升数据集的丰富度和多样性，流程分三步：去重（deduplication）、过滤（filtering）、重配比（remixing）。去重这块有个数据很有意思：跨整个 Common Crawl 语料做去重，比在单个 dump 内去重效果强得多，用了 91 个 dump 一起去重，能去掉 89.8% 的重复文档，单个 dump 只有 22.2%。过滤阶段给文档质量搞了一套既看语言又看语义的评估标准，重配比阶段把那些占比不够的领域补上来。

分词器用的是 Byte-level BPE（字节级 BPE），词表 10 万常规 token，训练在一个约 24GB 的多语言语料上完成，最后加上 15 个特殊 token，共 100015，模型训练时词表配到 102400。

**架构。** 微观设计基本跟着 LLaMA 走：Pre-Norm 结构配 RMSNorm，FFN 用 SwiGLU 做激活，中间维度是 8/3 的模型维度，位置编码用 Rotary Embedding。67B 为了省推理开销，用了 Grouped-Query Attention（GQA）替代多头注意力（MHA）。

宏观上有个自己的选择：别的模型喜欢加宽 FFN，DeepSeek 把 67B 的参数往深度上加——67B 有 95 层，7B 是 30 层。这么做的理由是更深的结构性能更好，同时层数多也方便做 pipeline 切分。

**超参数与调度器。** 一个和主流不一样的决定：预训练没用常见的 cosine 学习率调度器，改用 multi-step（多步下降）调度器。2000 步 warmup 到最大学习率，吃完全部训练数据 80% 时降到峰值的 31.6%，90% 时再降到 10%。实测最终性能和 cosine 基本持平，但有个独门好处：改训练规模时，第一阶段的训练可以复用，对 continual training（持续训练）特别友好。论文还特意实验了三个阶段 80% / 10% / 10% 的配比。

**基础设施。** 训练框架是自家的 HAI-LLM，数据并行、张量并行、序列并行、1F1B pipeline 并行都集成了，用了 flash attention 提硬件利用率，ZeRO-1 切优化器状态，bf16 训练、fp32 累计梯度。模型权重和优化器状态每 5 分钟异步存一次，坏了最多丢 5 分钟训练。还支持从不同的 3D 并行配置续训，方便应对集群负载变化。

## 三、Scaling Law：这篇论文真正的主角

第三章是这篇论文的灵魂，分量比模型本身还重。

**背景问题。** 经典理论说，模型性能随算力预算 C、模型规模 N、数据规模 D 的增长可预测地提升，算力大约等于 6ND。那么加预算时，钱该往模型还是往数据上花？早期工作（Kaplan 0.73/0.27，Chinchilla 0.49/0.51）答案互相矛盾，说明 scaling law 的普适性存疑，而且超参数设置交代不清。

**超参数的 scaling law。** 作者先在小规模实验上网格搜索 batch size 和学习率，发现一个好消息：在很宽的参数区间内，泛化误差都稳得很，不用把参数调得很精。他们把"误差不超过最优值 0.25% 的参数"都算近优参数，拟合出两条幂律公式：

- 最优学习率 η_opt = 0.3118·C^(−0.1250)
- 最优 batch size B_opt = 0.2920·C^(0.3271)

大意是：算力预算越高，batch size 该越大，学习率该越小。而且近优区间很宽，选参数不难。

**模型规模的新度量。** 这里是个关键创新。之前工作用参数量 N 代表模型规模，无论是非 embedding 参数（Kaplan 的 6N1）还是全部参数（Chinchilla 的 6N2），都有近似误差——都没算 attention 的开销，6N2 还把对能力贡献不大的词表计算也算进去了，小模型上误差能到 50%。作者改用**非 embedding 的 FLOPs/token**，记作 M，把 attention 算上、词表排除，算力公式干净地变成 C = MD。这看似只是换了个度量，实际让后面的拟合准确了不少。

**最优分配。** 用 Chinchilla 那套 IsoFLOP profile 方法，选了从 1e17 到 3e20 八个算力档，每档配大约 10 种模型/数据分配，在独立的 1 亿 token 验证集上测。拟合出的公式：

- M_opt ∝ C^0.5243，D_opt ∝ C^0.4757

意思是对半劈：预算翻倍，模型和数据差不多各分一半。而且验证了个漂亮的结果：用 1e17 的小实验，能准确预测算力高 1000 倍的模型的泛化误差。DeepSeek LLM 7B 和 67B 的成绩，被 scaling curve 提前"算"出来了。

**数据质量改变结论。** 论文在开发过程中迭代了好几版数据，这反而成了个发现：换不同的数据集去拟合，最优分配策略跟着变。数据质量越高，模型缩放指数 a 越大、数据缩放指数 b 越小——就是说，高质量数据下，增加的算力应该更多投给模型而不是数据。这或许能解释为什么早期两篇经典工作结论相反。而且它给了一个间接评估数据质量的窗口：拿同一批数据跑 scaling，看它偏模型还是偏数据。

## 四、对齐：SFT 加 DPO，还得治复读机

对齐数据约 150 万条，中英双语，有用性（helpfulness）数据 120 万条，其中通用语言任务 31.2%、数学题 46.6%、代码题 22.2%；安全性（harmlessness）数据 30 万条。

**SFT。** 7B 微调 4 个 epoch，67B 只调 2 个——67B 过拟合严重，GSM8K、HumanEval 很快顶到上限。论文还盯了一个不太常见的指标：复读率（repetition ratio），统计生成回复里卡住反复循环同一段的比例。结果发现数学 SFT 数据越多，复读率越高，因为数学题推理套路相似，弱模型抓不住规律就绕圈子。对策是两阶段微调：第一阶用全量数据，第二阶只留对话数据。7B 的复读率从 2.0% 压到 1.4%，benchmark 分基本不掉；67B 第一阶完事复读率已经低于 1%，第二阶反而伤分，所以 67B 只做一阶。

**DPO。** 在 SFT 之后加了直接偏好优化（Direct Preference Optimization，DPO），用自家 Chat 模型生成候选回复构造偏好数据。效果是：开放域生成能力明显变强，标准 benchmark 上几乎无变化。

## 五、评估：67B 打得过 LLaMA2 70B，Chat 追平 GPT-3.5

**标准 benchmark（Base 模型）。** 关键数字：DeepSeek 67B 在代码、数学、推理与中文任务上大幅领先 LLaMA2 70B——MATH 18.7 对 13.5，GSM8K 63.4 对 58.4，HumanEval 42.7 对 28.7，MBPP 57.4 对 45.6，BBH 68.7 对 62.9。中文 benchmark 更是拉开：C-Eval 66.1 对 51.4，CMMLU 70.8 对 53.1，CHID 92.1 对 55.5。注意 CHID 是成语填空，考的是中文文化，LLaMA2 没吃够中文 token，直接崩。当然不是每项都赢，个别英文理解类任务（如 WinoGrande、RACE-Middle、TriviaQA、ARC-Challenge）反而略低，HellaSwag 持平。

有个现象值得说：DeepSeek 67B 对 LLaMA2 70B 的优势，比 DeepSeek 7B 对 LLaMA2 7B 的优势大得多。论文的解释是语言冲突（language conflict）对小模型伤害更大。还有，LLaMA2 在 CMath 上成绩不错，说明数学推理这种基础能力能跨语言迁移，但成语这种就需要预训练真的吃到中文。

**Chat 模型的 SFT 效应。** 几个观察很实在：SFT 后知识类任务有波动，但论文认为这不代表丢知识，SFT 的价值在于让 chat 模型 zero-shot 拿到 base 模型 few-shot 的水平；完形填空/句子补全这类任务（比如 HellaSwag）微调后稳定下滑，作者认为纯语言模型本来就更擅长这类任务；推理类任务微涨，但论文直说"SFT 学到的不是推理能力，是推理路径的格式"。

**开放域评估。** 这是论文的高光部分。中文用 AlignBench，DeepSeek 67B Chat 总分 6.43，超过 ChatGPT（6.08）和一堆国产模型，只排在 GPT-4 两个版本后面；加了 DPO 后涨到 6.69，中文基础语言能力甚至超过最新版 GPT-4。英文用 MT-Bench，67B Chat 平均 8.35，跟 GPT-3.5-turbo（8.39）一个水平；DPO 后 8.76，仅次于 GPT-4（9.26）。

**留出集评估。** 为了防 benchmark 污染，作者用新出的测试集考了一遍：LeetCode 周赛题（126 道）、匈牙利高中数学高考、IFEval 指令遵循。DeepSeek 67B Chat 分别是 17.5、58、55.5。论文的观察：这些新任务上大小模型的差距极其明显，有些小模型在常规 benchmark 上很能打（比如 ChatGLM3 的 GSM8K 有 72.3），一到新题就露馅，说明总算力（total computing）才是硬通货。

**安全评估。** 20 人专家团队建了一套安全分类体系，手工造了 2400 道题（还专门设计了诱导、角色扮演、多轮等绕过手法防"祖母漏洞"）。DeepSeek 67B Chat 在 Do-Not-Answer 测试集上拿到 97.8，比 ChatGPT（97.7）和 GPT-4（96.5）都高。

## 六、讨论：几条反直觉的发现

**多选题数据，主动不加。** 团队试着在对齐阶段加了 2000 万条中文多选题数据，MMLU、C-Eval、CMMLU 确实大涨，但 TriviaQA 等生成式任务几乎无变化（ChineseQA 甚至微降）。结论很有意思：多选题刷分是过拟合 benchmark，用户聊天时根本感觉不到模型变聪明了，所以**故意把多选题数据从预训练和微调里都排除掉**。

**预训练里掺指令数据，等于白掺。** 在预训练最后 10% 掺 500 万条指令数据，base 模型 benchmark 确实变好，但效果跟把这些数据放 SFT 阶段加一模一样，潜力没多出来。

**System Prompt 对 7B 有害，对 67B 有益。** 加了系统提示词后 7B 的 MT-Bench 从 7.15 微降到 7.11，67B 却从 8.35 涨到 8.58。论文的解释：大模型能真正理解系统提示词的意图，小模型理解不了，训练和测试的不一致反而拖后腿。

## 七、结论、局限与展望

结论一句话：从零训练、2T token 双语语料，把 scaling law 重新校准，给了新的最优分配策略和预测 batch size / 学习率的公式，还发现 scaling law 和数据质量相关，这可能是各家结论不一致的根源。全篇强调"避免 benchmark 装饰和暗箱操作"。

局限也认得很坦率：预训练后知识不会更新、会幻觉、中文数据第一版还不够全、其它语言能力弱。

结尾是三条预告，现在看都是"剧透"：很快会发布代码智能（就是后来的 DeepSeek Coder）和 MoE（就是上一篇 DeepSeekMoE）的技术报告，其中 MoE 那条就是"设计一个稀疏模型达到稠密模型的性能"；还会构建更大更优的数据集，用于下一版 DeepSeek LLM；对齐团队在研究更 helpful、honest、safe 的模型，初步实验证明强化学习能提升复杂推理——这最后一条，其实预告了后面 DeepSeekMath 的 RL 路线。下一篇解读正好接上。

## 收尾：我的一点看法

这篇论文的读法跟 DeepSeekMoE 不一样。MoE 那篇是架构创新，这篇没有发明什么新架构，它的重心是"研究怎么把钱花在刀刃上"，而且是认认真真做了个科学问题来回答。

我最欣赏的是那个模型规模度量 M。看似只是把 6N 换成 FLOPs/token，但论文用数据证明旧度量在小模型上误差能到 50%，这就把一个"统计噪声"级别的隐患抓出来修掉了。拟合 scaling law 这种事，度量选不准，结论全是玄学。

还有两个立场挺难得的。一个是主动不要多选题数据——在人人刷 MMLU 的年代，论文明确说"这不会让模型真的变聪明"，还拿生成式任务几乎无变化做证据。另一个是"数据质量决定最优分配"这个发现，既解释了 Kaplan 和 Chinchilla 的分歧，又顺手给出一个数据质量评估工具。这两点都透着那三个字：长期主义。

当然也有它没做好的地方。语言覆盖窄，中英之外基本裸奔；多选题偏弱这个体质，在后面的 MoE 模型里还延续了下去。但作为 DeepSeek 开源路线的开山之作，它把地基打得够稳。

---

## 附：核心数据速查

| 模型 | 层数 | 隐层维度 | 注意力 | 训练数据 | 学习率 |
|---|---|---|---|---|---|
| DeepSeek 7B | 30 | 4096 | MHA | 2T tokens | 4.2e-4 |
| DeepSeek 67B | 95 | 8192 | GQA (8 kv heads) | 2T tokens | 3.2e-4 |

**67B 对 LLaMA2 70B 的关键差距**

| 任务 | DeepSeek 67B | LLaMA2 70B |
|---|---|---|
| MATH (4-shot) | 18.7 | 13.5 |
| GSM8K (8-shot) | 63.4 | 58.4 |
| HumanEval | 42.7 | 28.7 |
| MBPP | 57.4 | 45.6 |
| BBH | 68.7 | 62.9 |
| C-Eval (5-shot) | 66.1 | 51.4 |
| CMMLU (5-shot) | 70.8 | 53.1 |
| CHID (0-shot) | 92.1 | 55.5 |

**Chat 模型开放域成绩**
- 中文 AlignBench：67B Chat 6.43（超 ChatGPT 6.08，仅次 GPT-4）；+DPO 6.69
- 英文 MT-Bench：67B Chat 8.35（≈ GPT-3.5-turbo 8.39）；+DPO 8.76（仅次于 GPT-4 9.26）
- Do-Not-Answer 安全分：97.8（高于 ChatGPT 97.7、GPT-4 96.5）

**Scaling Law 核心公式**
- 最优学习率：η_opt = 0.3118·C^(−0.1250)
- 最优 batch size：B_opt = 0.2920·C^(0.3271)
- 最优模型规模：M_opt ∝ C^0.5243；最优数据量：D_opt ∝ C^0.4757
- 数据质量越高，增加的算力越该投给模型（模型缩放指数 a 变大）

**关键概念清单**
- scaling law = 缩放定律（模型性能随算力 / 模型 / 数据规模的幂律关系）
- deduplication / filtering / remixing = 去重 / 过滤 / 重配比（数据处理三步）
- BBPE = Byte-level Byte-Pair Encoding，字节级 BPE 分词
- GQA = Grouped-Query Attention，分组查询注意力
- MHA = Multi-Head Attention，多头注意力
- multi-step LR scheduler = 多步下降学习率调度器（相对 cosine）
- M = non-embedding FLOPs/token，非 embedding 计算量 / token（新模型规模度量）
- IsoFLOP profile = 固定算力剖面（Chinchilla 的拟合方法）
- SFT = supervised fine-tuning，监督微调
- DPO = Direct Preference Optimization，直接偏好优化
- repetition ratio = 复读率（生成卡死循环的比例）
- held-out evaluation = 留出集评估（用新发布的测试集防污染）
- Do-Not-Answer = 安全测试集
