---
title: "06_[意图对齐]_InstructGPT_RLHF指令遵循"
published: "2026-07-25"
category: "LLM papers"
lang: "zh"
draft: false
tags: ["RLHF", "SFT", "PPO", "对齐"]
---

> **系列**：LLM 与 Transformer 关键论文深度解读（第 6/8 篇） | 其他论文见本目录 01–08 | 合集见工作区根目录《LLM与Transformer关键论文深度解读.md》。

# [意图对齐] InstructGPT：RLHF 与指令遵循

## 论文信息

- **标题**：Training Language Models to Follow Instructions with Human Feedback
- **作者**：Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin 等（OpenAI 对齐团队）
- **发表年份**：2022 年（2022 年 3 月首发 arXiv）
- **会议/期刊来源**：Advances in Neural Information Processing Systems 35（NeurIPS 2022）
- **arXiv**：2203.02155
- **引用量级**：数万次（RLHF 范式事实标准的源头之一）

## 一、研究背景与核心问题

GPT-3 证明了规模的力量，但暴露出一个根本矛盾：**模型的能力很强，却"不听话"**。它被训练来"预测网页上最合理的下一个词"，而非"完成用户的指令"——论文将这一错位称为**目标失配（misalignment）**。典型表现：不按指令行事（继续写相似问题而非作答）、编造事实（幻觉）、输出有毒或偏见内容。

论文要回答：**能否不靠继续增大模型，而用人类反馈把已有能力"对齐"到用户意图上？** 论文将对齐目标概括为三个词——**有用（helpful）、诚实（honest）、无害（harmless）**。

## 二、核心方法与架构创新：RLHF 三阶段

论文把人类反馈强化学习（RLHF，源于 Christiano 2017、Stiennon 2020 的工作）工程化为一套可复现的三阶段流水线：

1. **阶段一：监督微调（SFT）**。聘请 40 名标注员，在真实 API 提示（及自撰提示）上写出"理想回复"示范，用这些约 1.3 万条示范对 GPT-3 做监督微调，得到 SFT 策略模型。
2. **阶段二：训练奖励模型（Reward Model, RM）**。让标注员对同一提示的多个模型输出排序，收集约 3.3 万条偏好对比数据，训练一个与 SFT 同构、去掉最后 unembedding 层的奖励模型，学会"预测哪个输出更被人类偏好"。
3. **阶段三：PPO 强化学习**。以 SFT 模型为初始策略，用奖励模型打分作为奖励，通过 PPO 算法微调策略，使其输出"更讨人类喜欢"；并加入对 SFT 策略的 KL 惩罚防止偏离过远，以及**预训练数据混合（PPO-ptx）**缓解"对齐税"。

关键工程决策：提示数据来自**真实 API 用户分布**（而非学术基准），这是模型能服务真实用户的原因。

## 三、关键公式与模块设计原理

### 3.1 奖励模型目标（成对偏好）

对提示 x、被偏好输出 y_w 与不被偏好输出 y_l，用 Bradley-Terry 式成对损失：

$$
\mathcal{L}_{RM} = - \mathbb{E}_{(x, y_w, y_l)} \left[ \log \sigma\big( r(x, y_w) - r(x, y_l) \big) \right]
$$

其中 r 是奖励模型打分，σ 是 sigmoid。直观上：让被偏好输出的分数尽量高于不被偏好输出。

### 3.2 PPO 目标（带 KL 约束）

$$
\text{maximize } \mathbb{E}_{(x, y) \sim \pi_\theta} \left[ r(x, y) \right] - \beta \cdot \mathbb{E}_{x}\left[ KL\left( \pi_\theta(\cdot \mid x) \,\|\, \pi_{SFT}(\cdot \mid x) \right) \right]
$$

β 控制策略偏离 SFT 的程度：纯奖励最大化会诱导"奖励黑客"（编造高分话术），KL 惩罚把策略钉在"仍像语言模型"的可行域内。

### 3.3 对齐税与 PPO-ptx

纯 RL 会损害通用能力（在 SQuAD、HellaSwag 等学术基准上倒退），论文称之为"对齐税"（alignment tax）。解法：RL 目标与预训练语言建模目标按小权重混合，在保住偏好提升的同时恢复基准表现——这成为后续所有对齐方案的标准配方。

## 四、实验设置与主要结果

- **评估**：在留出的真实 API 提示分布上由标注员成对比较；辅以 TruthfulQA、RealToxicityPrompts、偏见基准及学术基准。
- **核心结论（论文摘要原话）**："在我们提示分布上的人类评估中，**13 亿参数的 InstructGPT 输出被人类更偏好于 1750 亿参数的 GPT-3**，尽管参数少了 100 倍。"
- **具体数字**：1750 亿 InstructGPT 相对 1750 亿 GPT-3 的胜率 **85% ± 3%**；相对 few-shot GPT-3 为 **71% ± 4%**；
- **安全性**：TruthfulQA 上更真实、信息更丰富；闭域 API 任务上幻觉率从 **41% 降至 21%**；毒性生成下降（但偏见指标改善有限）；
- **能力保持**：PPO-ptx 使学术基准回归最小化，验证了"对齐不应以牺牲能力为代价"。

## 五、局限性与后续影响

**局限性（论文坦承）**：
- 模型仍会犯简单错误；
- 对齐对象是"40 名标注员 + 研究者的偏好"，而非普世的"人类价值"——**对齐给一个群体 ≠ 对齐全社会**；
- 在有害指令上仍可能顺从；
- 奖励模型质量是天花板，偏好数据分布决定模型行为边界。

**后续影响**：InstructGPT 是 **ChatGPT（GPT-3.5）的直接前身**——OpenAI 官方即指出 ChatGPT 基于此类指令跟随模型构建。RLHF 从此成为大模型"后训练"阶段的标准范式，衍生出 Constitutional AI（RLAIF）、DPO（直接偏好优化）、GRPO 等大量改进；其对"真实用户提示分布"的强调，也奠定了评估从学术基准向真实任务迁移的潮流。

---
