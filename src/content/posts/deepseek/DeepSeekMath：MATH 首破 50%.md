---
title: "DeepSeekMath：MATH 首破 50%"
published: "2026-07-09"
category: "deepseek"
lang: "zh"
draft: false
tags: ["GRPO", "推理", "开源"]
---

# DeepSeekMath 论文解读：开源模型第一次在 MATH 上突破 50%

> 论文：*DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*
> 作者：Zhihong Shao、Peiyi Wang、Qihao Zhu 等，DeepSeek-AI（清华、北大联合实习）
> 这篇是 DeepSeek 推理路线的承重墙：120B token 的数学语料构建方法、GRPO 这个 RL 算法，都是从这篇定型的。一年后 R1 横空出世，回头看这里的 GRPO 就是那场爆发的第一块砖。

---

## 一、引言：数学是 LLM 最难啃的骨头

开头交代背景：数学推理对语言模型来说特别难，因为它结构化、要求严谨。GPT-4、Gemini-Ultra 这些闭源模型在 MATH 这种竞赛级 benchmark 上很强，但不开源；开源模型差得远。DeepSeek 这篇要做的事，就是用一个 7B 的开源模型，逼近闭源模型的数学水平。

摘要里有一组开门见山的数字：DeepSeekMath 7B 在 MATH 上拿到 51.7%，不用外部工具、不用投票，直接逼近 Gemini-Ultra 和 GPT-4 的水平。用自一致性（self-consistency）采 64 个样本，能到 60.9%。

这个成绩归功于两个关键因素：
1. **数据**：从 Common Crawl 里精心筛出 120B token 的高质量数学语料。
2. **算法**：提出 GRPO（Group Relative Policy Optimization，组相对策略优化），一个 PPO 的变体，数学推理能力提升的同时还省显存。

## 二、数学预训练：从 Common Crawl 挖出 120B token

**数据收集管线。** 核心是个迭代流程：先拿一个高质量的小种子语料，训练一个 fastText 分类器，用分类器从 Common Crawl 里"召回"更多数学网页，人工精修后再更新分类器，循环往复。

细节很有意思：
- 种子语料选的是 OpenWebMath，拿它当正例，从 Common Crawl 随机抽 50 万页当负例，训 fastText。
- 原始 Common Crawl 经过 URL 去重和近似去重后剩 40B 个 HTML 页面。
- 分类器按分数排序，只保留排名靠前的数学页面。
- 光靠分类器不够：第一轮采完后，把整个 Common Crawl 按域名切块，收集率超过 10% 的域名（比如 mathoverflow.net）判为数学相关，再人工标注这些域名里哪些 URL 路径是数学内容，补进种子语料，训练更强的分类器。
- 这样迭代了四轮，最后拿到 3550 万数学网页，共 120B token。第四轮发现 98% 的数据第三轮已经收过了，就停手。

**去污染。** 为了防 benchmark 污染，凡跟 GSM8K、MATH、CMATH、AGIEval 这些基准有 10-gram 精确匹配的文本段，全部从训练语料里剔除。

**语料质量验证。** 作者拿 1.3B 的模型分别在不同数学语料上训 150B token 对比：MathPile（8.9B，85% 来自 arXiv）、OpenWebMath（13.6B）、Proof-Pile-2（51.9B，arXiv+代码+OpenWebMath 混合），以及自家的 DeepSeekMath Corpus（120.2B）。结果在 8 个数学 benchmark 上，自家语料全面领先。三个结论：质量高（50B token 时就超过 Proof-Pile-2 一整轮的效果）、多语言（中英数学都涨，别的语料英文为主，中文数学几乎不长甚至倒退）、规模大（别家语料训练时已经重复多轮、早早触顶，自家语料学习曲线还在陡峭爬升）。

**Base 模型训练。** DeepSeekMath-Base 7B 用 DeepSeek-Coder-Base-v1.5 7B 初始化（先代码后数学是刻意的，后面消融会讲为什么），再训 500B token，配比：56% DeepSeekMath Corpus、4% AlgebraicStack、10% arXiv、20% GitHub 代码、10% 中英 Common Crawl 自然语言。

**Base 7B 成绩。** GSM8K 64.2%、MATH 36.2%，超过所有开源 base 模型——包括专门练数学的 Llemma 34B——还在 MATH 上超过闭源的 Minerva 540B（参数是它的 77 倍）。中文数学更是大幅领先。形式化数学同样最强：miniF2F-valid 25.8%、miniF2F-test 24.6%，超过 Mistral 7B、Llemma 34B、CodeLlama 34B 等所有对比模型。带工具（写 Python 程序）解题 GSM8K+Python 66.9%、MATH+Python 31.4%，也超 Llemma 34B。顺带数学预训练把 MMLU 和 BBH 也带涨了，说明它提升的不只是数学能力。

## 三、SFT：把基础模型教成会解应用题

SFT 数据 776K 条，中英都有，题目按三种格式配解法：chain-of-thought（CoT，思维链）、program-of-thought（PoT，程序式思考）、tool-integrated reasoning（工具集成推理）。英文侧：GSM8K 和 MATH 标注了工具集成解法，加上 MathInstruct 子集和 Lila-OOD 训练集，覆盖代数、概率、数论、微积分、几何。中文侧：K-12 数学题，76 个子主题，CoT 和工具集成双格式。训练配置很常规：500 步、batch size 256、恒定学习率 5e-5。

DeepSeekMath-Instruct 7B 在 MATH 上不依赖工具拿到 46.8%，超所有开源模型，也超大部分闭源（Inflection-2、Gemini Pro），差距只有 9 个点起步。带工具解题 MATH 到 57.4%。虽然打不过 GPT-4 和 Gemini Ultra，但已经是开源最强。评估体系很广：除了 MATH、GSM8K，还覆盖 SAT、OCW Courses 等英文高中/大学级数学基准，以及 Gaokao 系列中文数学基准。

## 四、RL：GRPO，把 critic 模型丢掉

**PPO 的问题。** PPO 是 LLM 对齐的标准 RL 算法，但它是个 actor-critic 架构——要额外训练一个值函数（value model），这个模型通常跟策略模型一样大，显存和算力开销巨大。而且在 LLM 场景里，奖励模型只给最后一个 token 打分，逐 token 训练一个精确的值函数很别扭。

**GRPO 的核心想法。** 干脆不要值函数。同一道题 q 采样 G 个输出，用这组输出的平均奖励当基线，每个输出的 advantage 就是它跟组内平均的差除以组内标准差：

A_i = (r_i − mean(r)) / std(r)

这样 advantage 完全来自组内相对，省掉整个 critic。还有个好处：奖励模型本来就是靠"同一道题的输出两两比较"训练的，组内相对的思想跟奖励模型的天性一致。KL 惩罚也改了个做法——不在奖励里加，而是直接作为正则项加进 loss。

**三种变体。**
- **Outcome Supervision（结果监督）**：奖励模型给整段输出一个分，组内归一化，所有 token 共享这个 advantage。简单直接。
- **Process Supervision（过程监督）**：奖励模型给每步推理打分，每个 token 的 advantage 是它之后所有步归一化奖励的和。信号更细，对复杂题更有效。实验里 GRPO+PS 确实优于 GRPO+OS。
- **Iterative RL（迭代式）**：训练过程中旧奖励模型跟不上新策略，就采样新数据持续训练奖励模型，用 10% 历史数据的重放机制，再把 reference 模型设成当前策略继续训。两轮迭代下来涨得明显，尤其第一轮。

**训练配置。** 只用 SFT 数据里 GSM8K 和 MATH 的 CoT 格式题目，约 14.4 万道。奖励模型基于 DeepSeekMath-Base 7B 初始化，每道题采 64 个输出。目的明确：其它 benchmark 全程没沾过 RL 数据，好验证泛化。

**效果。** DeepSeekMath-RL 7B：GSM8K 82.9% → 88.2%，MATH 46.8% → 51.7%（开源首次在竞赛级 MATH 上突破 50%）。更重要是**域外**也涨：CMATH 84.6% → 88.8%、MGSM-zh 73.2% → 79.6%。只用 GSM8K 和 MATH 的数据，却在所有 benchmark 上都超过 Instruct 模型。

## 五、讨论：几组含金量很高的实验

### 5.1 预训练的经验

**代码训练确实提升数学推理。** 这是个流传已久但没人验证过的说法，作者给了部分回答。两阶段训练里，先训 400B 代码 token 再训 150B 数学 token，比先训 400B 通用 token 效果更好——不光是带工具解题，纯 CoT 解题也更强。代码训练还让后续数学训练事半功倍。但有个细节：单阶段混合代码+数学，纯 CoT 推理反而略降，作者猜是 1.3B 模型太小，同时吸收两类数据的能力有限。

**arXiv 论文几乎没用。** 这是个反直觉的发现。很多数学语料把 arXiv 论文当主力（MathPile 超 85% 来自 arXiv），但实验显示：单独用 arXiv 语料训练，GSM8K、MATH、MMLU-STEM、miniF2F 全部没有明显提升甚至倒退。作者自己也留了退路：没测过非形式化定理转化、跟其它数据混合、以及更大模型规模下的效果，结论要谨慎看待。

### 5.2 RL 的洞见

**统一范式。** 论文给了一个漂亮的分析框架：所有训练方法的梯度都可以拆成三部分——数据来源、奖励函数、梯度系数。SFT、RFT、DPO、Online RFT、PPO、GRPO 都能套进这个范式，本质都是"直接或简化的 RL"。

几个关键观察：
- **在线优于离线**：Online RFT 后期明显超过 RFT。早期 actor 跟 SFT 模型长得像，采样数据差不多；后期差异放大，实时采样优势就出来了。
- **梯度系数要区分奖惩**：GRPO 会根据奖励模型给的分数大小做差分强化和惩罚，而 Online RFT 对答对的输出统一强化、不惩罚答错的。GRPO 因此超过 Online RFT。
- **RL 提升的不是"基础能力"而是"分布稳健性"**：看 Maj@K 和 Pass@K 的对比，RL 让 Maj@K 大涨但 Pass@K 不变。意思是 RL 没有教会模型新知识，而是把正确答案在采样分布里的地位抬高了。这个洞见很重要——后来很多推理模型的提升都可以这么理解。

**RL 的三个未来方向。** 数据源：换域外题目和更高级的采样（树搜索）。算法：奖励信号不可靠时怎么办（作者提到 PRM800K 里约 20% 的标注是错的），需要 weak-to-strong 这类对噪声奖励鲁棒的算法。奖励函数：怎么提升奖励模型的泛化、反映不确定性、高效构建过程奖励模型。

## 六、结论、局限与展望

结论一句话：DeepSeekMath 用 Common Crawl 的公开数据加一个省显存的 RL 算法，让开源模型在竞赛级 MATH 上首次突破 50%，逼近闭源水平。

局限也认了：几何和定理证明比闭源模型弱——干跑测试里三角形、椭圆相关的题处理不了，作者判断是预训练和微调的数据选择有偏。另外 few-shot 能力不如 GPT-4：GPT-4 加 few-shot 提示能涨分，DeepSeekMath 的 zero-shot 和 few-shot 表现差不多。

## 收尾：我的一点看法

这篇论文值得认真读的原因，是它每一层都留了"为什么"的实验证据，不是拍脑袋。

数据层，它证明 Common Crawl 这种公开垃圾堆里能挖出金矿，而且把挖矿的流程讲透了：分类器召回、域名标注、迭代扩张，还有那个反直觉的结论——arXiv 论文可能根本没那么有用。这个结论在当年几乎是异端，现在回头看，DeepSeek 不信权威、信实验的作风从这里就开始了。

算法层，GRPO 是真正能被记住的贡献。它不复杂——把 critic 丢掉、用组内相对当基线——但它精准打在 PPO 在 LLM 上的痛点上：值函数又大又难训。这个"砍掉不必要的东西"的思路，跟 V2 的 MLA 是同一个味道。而且 R1 证明这个算法能一直用到 671B 的大规模 RL 上，韧性极好。

还有那个"RL 提升的是分布稳健性而不是基础能力"的结论，我特别喜欢。它把 RL 的效果说透了：不是玄学，是把模型已经会的东西在分布上扶正。这也解释了为什么后来 R1 用那么简单的规则奖励就能撬动推理能力。

局限同样值得记一笔：几何弱、few-shot 不涨，这两个短板其实预告了后来 R1 论文里"探索 60 条规则奖励"时遇到的 geometry 问题。DeepSeek 一路走来的路线，每篇论文都在给下一篇埋线索。

---

## 附：核心数据速查

**DeepSeekMath 模型阶梯**
| 模型 | 关键分数（MATH / GSM8K） | 备注 |
|---|---|---|
| Base 7B | 36.2% / 64.2% | 超 Minerva 540B、Llemma 34B |
| Instruct 7B | 46.8% / 82.9% | MATH 开源最强（GSM8K 上 WizardMath-v1.1 83.2% 略高） |
| RL 7B | 51.7% / 88.2% | 开源首次 MATH 突破 50% |

**DeepSeekMath Corpus 数据管线**
- 种子语料：OpenWebMath；分类器：fastText
- 从去重后 40B 个 Common Crawl HTML 页面中召回
- 迭代 4 轮 → 3550 万数学网页 → 120B token（约 Minerva 数学网页的 7 倍、OpenWebMath 的 9 倍）
- 10-gram 精确匹配去污染

**Base 7B 训练配比（500B token）**
- 56% DeepSeekMath Corpus + 4% AlgebraicStack + 10% arXiv + 20% GitHub 代码 + 10% 中英 CC 自然语言
- 用 DeepSeek-Coder-Base-v1.5 7B 初始化

**RL 关键设定与提升**
- 只用 GSM8K + MATH 的 CoT 格式数据，约 14.4 万题，每题采 64 个输出
- GSM8K 82.9% → 88.2%；MATH 46.8% → 51.7%
- 域外：CMATH 84.6% → 88.8%；MGSM-zh 73.2% → 79.6%

**不同数学语料对比（1.3B 模型，150B token）**
| 语料 | 规模 | GSM8K | MATH |
|---|---|---|---|
| MathPile | 8.9B | 2.7% | 3.3% |
| OpenWebMath | 13.6B | 11.5% | 8.9% |
| Proof-Pile-2 | 51.9B | 14.3% | 11.2% |
| DeepSeekMath Corpus | 120.2B | 23.8% | 13.6% |

**关键概念清单**
- GRPO = Group Relative Policy Optimization，组相对策略优化（去掉 critic，用组内奖励归一化算 advantage）
- PPO = Proximal Policy Optimization，近端策略优化
- critic / value model = 值函数模型（PPO 里用来算 advantage，GRPO 里被去掉）
- Common Crawl = 互联网网页公开爬虫语料
- fastText = 轻量文本分类器
- OpenWebMath = 高质量数学网页语料（种子）
- MathPile / Proof-Pile-2 = 其它开源数学语料
- CoT = chain-of-thought，思维链
- PoT = program-of-thought，程序式思考
- tool-integrated reasoning = 工具集成推理
- outcome supervision = 结果监督；process supervision = 过程监督（每步打分）
- iterative RL = 迭代式强化学习（持续更新奖励模型）
- self-consistency = 自一致性（采多个样本取多数投票）
- MATH = 竞赛级数学基准（Hendrycks 等，2021）
- Maj@K / Pass@K = 采 K 个样本的多数投票准确率 / 至少一个正确的覆盖率
- miniF2F = 形式化数学基准（奥林匹克级）
