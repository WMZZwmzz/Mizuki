---
title: "qwen-evolution-history"
published: "2026-07-09"
category: "qwen"
lang: "zh"
draft: false
tags: ["发展史", "开源", "Agent"]
---

# 没人整理过的 Qwen 进化史：从开源奠基到 Agent 旗舰的三年技术蜕变

> 从 2023 年 8 月的 Qwen-7B 到 2026 年 5 月的 Qwen-3.7-Max，阿里通义千问用不到三年时间走完了"开源追随者→全球开源第一梯队→闭源 Agent 旗舰"的完整弧线。这篇文章把主线六代模型、六大专项分支和十余篇技术报告串起来，讲清楚 Qwen 是怎么一步步"打败自己"的。

---

## 〇、为什么值得整理 Qwen 的历史

2023 年夏天，国内大模型赛道已经挤满了选手。百度文心、讯飞星火、智谱 ChatGLM、百川、零一万物……几乎每周都有新模型发布。在这样的红海里，阿里在 8 月低调上线了一个叫"通义千问"的开源模型系列，英文名 Qwen。没有发布会，没有热搜，只在 Hugging Face 和魔搭社区悄悄挂了几个权重文件。

三年后的今天，Qwen 系列在 Hugging Face 的累计下载量超过 3 亿次，衍生模型数量突破 10 万，长期占据开源模型下载榜前列。2024 年 10 月，Qwen 的衍生模型数超过 Meta 的 LLaMA，成为全球开源生态中被 fork 和微调最多的模型家族之一。苹果被传在内部评估 Qwen，李飞飞团队用它做实验，Manus 的智能体底层跑着 Qwen，甚至 DeepSeek-R1 的部分小尺寸蒸馏模型也基于 Qwen 训练。

这不是一个"大力出奇迹"的故事。Qwen 的三年，是一部关于工程哲学、架构选择和生态战略的技术进化史。

---

## 一、组织与起点：通义实验室的"慢功夫"

Qwen 出自阿里巴巴→阿里云→通义实验室。首席科学家周靖人，2015 年从微软加入阿里，先后在 iDST、达摩院、蚂蚁、淘宝等体系参与前沿研发和业务落地。2022 年，阿里推出魔搭社区并开源近 400 个模型，为后来的 Qwen 生态打下基础。

周靖人在 2025 年 Qwen3 发布时接受采访说了一句很实在的话："某一天的流量没那么重要，研发不能临时调节奏，因为不符合研发规律。"这句话几乎可以当作 Qwen 团队的工程信条——不追热点，不赶发布窗口，每一代模型都有完整的技术报告，每一个架构决策都有工程上的理由。

算力底座方面，Qwen 训练使用阿里云 GPU 集群，包括 A100、H100 以及国产芯片实验集群。2025 年，阿里宣布计划投入 3800 亿元建设 AI 和云基础设施。2026 年初，阿里进行组织重构，新设"Alibaba Token Hub"业务单元，通义实验室则继续专注 Qwen 模型研发。

商业模式上，Qwen 长期走"开源+商业"双线：开源线通过 Hugging Face 和 ModelScope 发布，主要协议为 Apache 2.0；商业线通过阿里云 DashScope / 百炼平台提供 API 服务，企业定制版包括 Qwen-Max / Plus。截至 2026 年，DashScope 的 ARR（年度经常性收入）达到约 2.8 亿美元。

---

## 二、Qwen-1（2023.08）：开山之作，中文 LLM 的"基建"

**论文：arXiv:2309.16609**

2023 年 8 月，Qwen 首发，提供 7B 和 14B 两个尺寸（后续补充 1.8B 和 72B），训练数据约 3T tokens，上下文窗口 8K。

从架构上看，Qwen-1 是标准的 LLaMA 风格 decoder-only Transformer，但做了几项关键改造：

**151K 双语大词表。** 这是 Qwen-1 最容易被忽视、却影响最深远的决策。当时 LLaMA 的词表约 32K，GPT-2 约 50K，而 Qwen 直接做到了 152K。更大的词表意味着中文字、词可以被更完整地切分为独立 token，单个 token 承载更多中文语义，中文推理时所需 token 数更少。这个决策直接奠定了 Qwen 在中文任务上的效率优势，后续所有版本都继承了这个词表。

**Untied Embeddings。** 输入 embedding 和输出 projection 不共享权重，给模型更多表达自由度。

**RoPE base 设为 1e6。** 远高于 LLaMA 的 10000，为后续长上下文扩展预留了空间。这个看似不起眼的超参数选择，在一年后的 Qwen-2 时代被证明极具前瞻性。

**QKV bias。** 在 Q、K、V 投影中加入 bias，改善中文任务微调效果。这个设计在 Qwen3 中被 QK-Norm 替代，但在当时是务实的选择。

Qwen-7B 在 C-Eval 上取得 63.5 分，高于 LLaMA2-7B 的 32.5 分和 ChatGLM2-6B 的 51.7 分。上线三个月内，Hugging Face 下载超过一百万次。

同期发布的还有 Qwen-VL（视觉语言模型），覆盖 2B、7B、72B，支持图像理解和图文问答。从 Day 1 就同步发布多模态版本，这在当时的国内开源模型中非常少见——大多数团队还在"先把语言模型做好"的阶段。

**作者点评：** Qwen-1 的技术含量在今天看来并不惊人，但它的工程选择——大词表、高 RoPE base、多尺寸开源、Apache 2.0 协议、配套技术报告——几乎每一条都在后续被证明是正确的。这不是一个追求"单点突破"的团队，而是一个在搭"基建"的团队。

---

## 三、Qwen-1.5（2024.02）：试水 MoE，铺全尺寸矩阵

2024 年 2 月，Qwen-1.5 发布。架构上基本延续 Qwen-1，没有独立论文，但做了两件重要的事：

**第一，尺寸矩阵大幅扩展。** 从 0.5B 到 110B，覆盖 0.5B、1.8B、4B、7B、14B、32B、72B、110B 共八档。更细粒度的尺寸意味着从手机端到云端服务器，开发者可以在同一个模型族内完成选型迁移。

**第二，首次引入 MoE。** Qwen1.5-MoE-A2.7B 的结构是：总参数 14.3B，64 个专家，每个 token 激活 4 个专家，激活参数仅 2.7B（约 19%）。推理成本接近 2.7B Dense 模型，但任务表现接近 7B 级别。

这是 Qwen 团队第一次在主线产品中验证 MoE 的可行性。虽然 Qwen1.5-MoE 的规模还很小，但它为后来 Qwen-2 的 57B-A14B、Qwen-3 的 235B-A22B、Qwen-3.5 的 397B-A17B 积累了路由设计和负载均衡的工程经验。

**作者点评：** Qwen-1.5 是一个"过渡版本"，但过渡得有章法。它没有急着改架构，而是先把尺寸矩阵铺全、把 MoE 跑通。这种"先验证再推进"的节奏，在后来每一代 Qwen 的迭代中都能看到。

---

## 四、Qwen-2（2024.06）：GQA 全 size 化，第一次架构大升级

**论文：arXiv:2407.10671**

2024 年 6 月，Qwen-2 发布，提供 0.5B / 1.5B / 7B / 57B-A14B（MoE）/ 72B 五个版本。这是 Qwen 系列最重要的一次架构升级，核心变化有三个：

### 4.1 GQA 全 size 化

传统多头注意力（MHA）中，Q、K、V 头数一致，KV Cache 随序列长度线性增长，长序列推理时显存压力巨大。Qwen-2 改用 Grouped Query Attention（GQA）：多个 Query 头共享少量 KV 头。

以 Qwen2-7B 为例：Query 头数 28，KV 头数 4，分组大小 7。生成 2K token 时，KV Cache 可节省约 7 倍。

GQA 本身不是 Qwen 发明的——LLaMA-2 之后业界已经广泛使用。但 Qwen 的做法有一个关键区别：**从 0.5B 到 72B，所有尺寸全部使用 GQA。** 当时大多数团队只在大模型上用 GQA，小模型仍用 MHA。Qwen 的选择牺牲了一点小模型的精度上限，但换来了工程一致性——vLLM、SGLang、TensorRT-LLM 等推理引擎可以 day-1 支持全系列，不需要为不同尺寸做适配。

这个决策体现了 Qwen 与 DeepSeek 的第一条路线分歧：DeepSeek-V2 选择了更激进的 MLA（Multi-head Latent Attention），可以把 KV Cache 压到 MHA 的 1.76%，但需要推理引擎专门适配；Qwen 选择了更"无聊"但更通用的 GQA，确保生态兼容性。

### 4.2 长上下文：从 8K 到 128K

Qwen-1 的上下文窗口只有 8K。Qwen-2 通过 RoPE ABF（Adjusted Base Frequency）缩放，将上下文直接拉到 128K。ABF 的核心公式是调整 RoPE 的 base 频率：

$$\text{base}_{\text{ABF}} = \text{base} \times \left(\frac{L_{\text{train}}}{L_{\text{orig}}}\right)^{d/(d-2)}$$

还记得 Qwen-1 把 RoPE base 设为 1e6 吗？这个"预留空间"在这里发挥了作用——高 base 意味着频率调整有更大的操作余地，不需要像低 base 模型那样做极端的插值。

### 4.3 DPO 替代 PPO

后训练阶段，Qwen-2 用 DPO（Direct Preference Optimization）替代了传统的 PPO（Proximal Policy Optimization）。DPO 不需要单独训练 reward model，训练流程更简洁，稳定性更好。这个选择在当时还算前沿，到 2025 年已经成为业界主流。

此外，Qwen-2 将多语言支持从 Qwen-1 的中英双语扩展到 29 种语言，数据清洗也更严格。在 MMLU、HumanEval、GSM8K 等基准上，Qwen2-7B 全面超过同规模开源模型。

**作者点评：** Qwen-2 的哲学是"工程一致性优先于单点极致"。GQA 全 size 化、统一的长上下文方案、DPO 替代 PPO——每一个选择都不是最激进的，但组合在一起，形成了一个从 0.5B 到 72B 工程上高度一致的模型族。对于需要部署多个尺寸的团队来说，这种一致性的价值远大于某个 benchmark 上多出的零点几分。

---

## 五、Qwen-2.5（2024.09）：18T 数据、1M 上下文与全家桶时代

**论文：arXiv:2412.15115（Qwen2.5）；arXiv:2501.15383（Qwen2.5-1M）**

2024 年 9 月，Qwen-2.5 发布。这一代的关键词是"矩阵"——不再只是一个语言模型，而是一个覆盖多模态、多专业领域的完整模型家族。

### 5.1 语言模型：七档全覆盖

0.5B / 1.5B / 3B / 7B / 14B / 32B / 72B，共七档 Dense 模型。预训练数据从 Qwen-2 时期的约 7T tokens 跃升到 18T tokens。数据质量工程包括：使用 Qwen2.5-VL 对 PDF 文档进行 OCR 文本提取，使用 Qwen2.5 自身生成合成数学和代码数据，多轮去重和质量过滤。

### 5.2 Dual Chunk Attention：不重训即可 1M

Qwen-2.5 最核心的架构创新是 Dual Chunk Attention（DCA）。传统的 YaRN 类 RoPE 扩展通常只能做到 128K 量级，再往上就需要重新训练。DCA 的思路完全不同：

将长序列切成多个 chunk。Intra-Chunk Attention 在 chunk 内做完整 attention；Inter-Chunk Attention 在 chunk 间用代表 token 做稀疏 attention。本质上，DCA 对相对位置做了二阶 mapping，把超出训练上下文的相对位置映射回训练见过的范围。

效果是：即使模型只在 32K 上训练，推理时也可以做到 1M 上下文，不需要为 1M 重新训练。Qwen2.5-1M 在 1M-token passkey retrieval 任务上接近完美准确率。

与 DeepSeek 的 NSA（Native Sparse Attention）和 DSA（DeepSeek Sparse Attention）相比，DCA 的最大优势是"推理时即可启用"。NSA 需要原生训练，DSA 需要 continued training，而 DCA 是一个纯推理时的方案。代价是精度上限可能不如原生稀疏 attention，但对于大多数实际场景，"不需要重训"这个属性的工程价值巨大。

### 5.3 专业分支同步发布

Qwen-2.5 同期发布了一系列专业模型：

- **Qwen2.5-Coder**：面向代码任务，使用超过 5.5T tokens 的代码预训练数据，覆盖 0.5B 到 32B。
- **Qwen2.5-Math**（arXiv:2409.12122）：引入 TIR（Tool-Integrated Reasoning），模型可以生成 Python 代码执行计算，将结果反馈给推理过程。Qwen2.5-Math-7B-Instruct 在 MATH 基准上达到 85.3，在 TIR 模式下甚至超过 Qwen2-Math-72B-Instruct。高考数学测试得分 88.5。
- **Qwen2.5-VL**（arXiv:2409.12191）：引入 Naive Dynamic Resolution 和 M-RoPE（多维旋转位置编码），不再强制把图片 resize 到固定尺寸，按原始比例切分 patch。
- **Qwen2-Audio**（arXiv:2407.10759）：统一语音 LLM，双模式训练，覆盖 30+ 音频任务。

### 5.4 M-RoPE：多模态位置编码的统一

M-RoPE 是 Qwen2-VL 引入的关键创新。标准 RoPE 是一维序列位置编码，不适合图像、视频等多模态输入。M-RoPE 将位置编码分解为 temporal、height、width 三个维度：文本 token 只用 temporal；图像 patch 使用 height 与 width；视频帧三维都使用。

这个设计的深远意义在于：它不需要为不同模态单独设计 adapter，所有模态在同一个 Transformer 中处理，位置编码层面就完成了统一。后来的 TMRoPE（Qwen2.5-Omni）进一步将音频纳入同一体系，所有模态在 temporal 维度对齐。

**作者点评：** Qwen-2.5 是 Qwen 从"一个好的语言模型"变成"一个模型平台"的转折点。七档 Dense + 专业分支 + 多模态，加上 DCA 带来的 1M 上下文，Qwen-2.5 几乎覆盖了企业用户能想到的所有部署场景。从这一代开始，Qwen 不再只是和 LLaMA 比 MMLU 分数，而是在和整个开源生态比"谁能提供更多选择"。

---

## 六、QwQ（2024.11）：推理专家的短暂独立

2024 年 11 月，在 OpenAI o1 掀起"推理模型"热潮后不久，Qwen 团队发布了 QwQ-32B-Preview。

QwQ 的核心技术包括 Self-Questioning Long-CoT（自我提问式长思维链）、多阶段强化学习和 test-time scaling。它不是通用对话模型，而是一个专门的推理专家——面对数学证明、逻辑推理、代码调试等任务时，会生成极长的思考过程，反复自我验证和纠错。

2025 年初，QwQ-Max 发布，在多个推理基准上压过了 o1 和 DeepSeek-R1。

但 QwQ 作为独立产品线的生命周期并不长。Qwen 团队很快意识到，让用户在"通用模型"和"推理模型"之间切换 endpoint 是一个糟糕的体验。这个洞察直接催生了 Qwen-3 最重要的创新——Built-in Thinking Mode。QwQ 的技术积累被吸收进 Qwen-3 的后训练流程，QwQ 作为独立品牌逐渐淡出。

**作者点评：** QwQ 的存在和消亡同样有价值。它证明了 Qwen 团队有能力做顶级推理模型，但也让他们确认了"推理不应该是独立产品，而应该是通用模型的内置能力"这个判断。DeepSeek 走了另一条路——R1、R2 作为独立推理专家持续迭代。两条路线孰优孰劣尚无定论，但 Qwen 的选择确实降低了用户的使用门槛。

---

## 七、Qwen2.5-Omni（2025.03）：Thinker-Talker 与全模态统一

**论文：arXiv:2503.20215**

2025 年 3 月，Qwen2.5-Omni 发布，这是 Qwen 多模态路线的集大成之作。

核心架构是 Thinker-Talker 设计：Thinker 是核心 LLM，处理文本、图像、视频、音频输入，输出文本；Talker 基于 Thinker 的 hidden state，并行生成语音 token，支持流式输出。

这个架构解决了一个根本问题：一个模型如何同时完成多模态理解与多模态生成？Thinker 负责"想"，Talker 负责"说"，两者解耦但共享表示。效果类似 GPT-4o 的 realtime 语音对话能力，但 Qwen2.5-Omni 是开源的。

与 DeepSeek 的 Janus 相比，两者解耦的维度不同：Qwen-Omni 解耦的是"输入理解"与"输出生成"，覆盖 text、image、audio、video，输出文本与语音；Janus 解耦的是"理解 encoder"与"生成 encoder"，覆盖 text、image，输出文本与图像。Qwen-Omni 支持流式语音，Janus 不支持。

TMRoPE 在 M-RoPE 的基础上进一步将音频纳入位置编码体系，所有模态在 temporal 维度对齐。至此，Qwen 形成了 M-RoPE → TMRoPE → Thinker-Talker 的完整多模态演化路径。

---

## 八、Qwen-3（2025.04）：内置思考模式，36T 数据，全球开源第一梯队

**论文：arXiv:2505.09388**

2025 年 4 月 29 日，Qwen-3 发布。周靖人在当天的采访中将其定位为"国内率先采用混合推理路线的开源模型，也是全球首个开源同类模型"。

### 8.1 Built-in Thinking Mode：一个模型，两种思考

这是 Qwen-3 最具标志性的创新。同一个模型内置思考与非思考双模式：使用 `/think` 触发长 CoT 推理路径，使用 `/no_think` 走快速回答路径。也可以通过 chat template 中的 `enable_thinking` 参数控制。

训练细节：数据混合约 30% reasoning trace + 70% 普通对话。推理时由 prompt 标签触发 reasoning 路径，两种模式分别计算 reward。后训练环节融合了 QwQ 的推理能力和 Qwen2.5-Instruct 的通用对话能力。

与 DeepSeek-R1 的对比：R1 是单独的 reasoning specialist，Qwen-3 是通用模型内嵌 reasoning。Qwen-3 同一个 endpoint 即可切换，通用能力覆盖更强。周靖人说："混合推理模型需要同时学习两类输出生成模式，因此比单纯推理模型更难。"

值得注意的是，Claude 3.7 后来也采用了类似的 hybrid reasoning 路线。

### 8.2 模型规格：Dense + MoE 双轨

Dense 模型：0.6B / 1.7B / 4B / 8B / 14B / 32B，共六档。
MoE 模型：30B-A3B（总参数 30B，激活 3B）和 235B-A22B（总参数 235B，激活 22B）。

训练数据从 Qwen-2.5 的 18T tokens 翻倍到 36T tokens，支持语言从 29 种扩展到 119 种。

### 8.3 架构变化

**QK-Norm 替代 QKV-bias。** 对 Q、K 做 RMSNorm，不再依赖 bias。防止注意力分数出现极端值，减少 softmax 饱和，超长序列训练更稳定。

**MoE 设计简化。** Qwen2.5-MoE 包含 shared experts（所有 token 都会激活共享专家），Qwen3-MoE 改为纯稀疏设计，去掉 shared experts，使用 global-batch load balancing loss，鼓励不同专家专业化。

### 8.4 代际跃迁

Qwen3 最惊人的数据是：Qwen3-4B 的指令跟随能力可媲美 Qwen2.5-72B-Instruct。参数量相差约 18 倍，但能力接近。旗舰 MoE 版本 Qwen3-235B-A22B 在多个主要评测中胜过 DeepSeek-R1 完整版（后者总参数 6710 亿、激活参数 370 亿）。

发布时，Qwen 系列总下载量达 3 亿次，其中 2.5 亿次来自最近 7 个月；衍生模型数突破 10 万。

**作者点评：** Qwen-3 是 Qwen 系列的"iPhone 时刻"。Built-in Thinking Mode 解决了推理模型和通用模型割裂的痛点，36T 数据和 119 种语言让它真正成为全球性模型，而 4B≈72B 的代际跃迁则证明了数据质量和训练方法的进步可以远超参数规模的直觉。从这一代开始，Qwen 不再是"中国最好的开源模型"，而是"全球最好的开源模型之一"。

---

## 九、Qwen-3.5（2026.02）：Gated DeltaNet，注意力架构的跃迁

2026 年 2 月，Qwen-3.5 发布。旗舰模型为 Qwen3.5-397B-A17B MoE：总参数 3970 亿，激活参数仅 170 亿（约 4.3%），HuggingFace 开源。

### 9.1 Hybrid Linear Attention：3:1 的异质混合

Qwen-3.5 最核心的架构创新是引入 Gated DeltaNet（GDN），形成异质混合注意力：每 4 层 Transformer block 中，3 层使用 Gated DeltaNet，1 层使用 full attention，比例为 3:1。

Gated DeltaNet 的关键部件包括：Delta rule（错误纠正式记忆更新）、Exponential gating（自适应记忆衰减）、Causal Conv1D（捕获局部上下文）、L2 normalization on Q/K（稳定数值）。

效果是：主体复杂度从 O(N²) 降到 O(N)，少数层保留 O(N²)。原生上下文从 Qwen-3 的 128K 提升到 262K，支持语言从 119 种增加到 201 种，解码吞吐相比 Qwen-3 提升 8.6 到 19 倍。

与 DeepSeek-V4 的 NSA/DSA 路线相比：Qwen-3.5 用线性 attention 替代部分 full attention，DeepSeek-V4 在 full attention 内部做稀疏化。两者都追求实际推理复杂度接近线性，但工程取舍不同——Qwen 的方案更"异质"，DeepSeek 的方案更"同质"。

### 9.2 多模态早融合

Qwen-3.5 在预训练阶段就混合文本、图像、音频 token 进行训练（早融合），而不是传统的"文本 Transformer + 独立 Vision Encoder + adapter"（晚融合）。跨模态理解更深，推理更一致。

### 9.3 效率数据

Qwen3.5-Plus 的效果超过万亿参数级 Qwen3-Max，显存需求下降 60%，推理速度提高 19 倍。用约 170 亿激活参数打赢上一代万亿参数旗舰，这个效率提升是架构创新带来的，不是单纯堆算力。

**作者点评：** Qwen-3.5 的 Gated DeltaNet 是 2026 年开源 LLM 注意力架构最重要的跃迁之一。它证明了一件事：Transformer 的 full attention 不是不可动摇的，但替代方案不是"全部替换"，而是"混合使用"。3:1 的比例是一个工程上的甜蜜点——足够的 full attention 层保持精度，足够的 GDN 层降低计算成本。

---

## 十、Qwen-3.6 与 Qwen-3.7-Max（2026.04-05）：闭源转向与 Agent 旗舰

### 10.1 Qwen-3.6-Plus（2026.04）

2026 年 4 月，Qwen-3.6-Plus 发布，闭源，仅通过 API 提供。性能描述为"接近 Claude Opus 4.5"。同期发布的 Qwen3.6-35B-A3B 为开源版本，主打 1M 原生上下文和始终在线 CoT。

### 10.2 Qwen3.5-Omni（2026.04）

**论文：arXiv:2604.15804**

Qwen3.5-Omni 在 215 项评测中取得领先，可理解视频并生成长图文。但这一代开始闭源，不再开放权重。Built-in Thinking 被扩展到多模态场景，实时语音延迟小于 200ms。

### 10.3 Qwen-3.7-Max（2026.05.20）

2026 年 5 月 20 日，阿里云栖大会，Qwen-3.7-Max 正式发布。这是 Qwen 系列的闭源旗舰，定位为"agent-first"——以 Agent 为中心的长程自主执行。

核心能力：

- 约 1M token 上下文
- 原生 Extended Thinking
- 支持超过 1000 步连续工具调用
- 内部测试中完成 1000+ 工具调用、持续运行 35 小时不降解
- 原生 MCP 支持
- 输出速度 200.8 tokens/s

Benchmark 数据：

| 评测 | 得分 |
|---|---|
| SWE-Bench Pro | 60.6 |
| SWE-Verified | 80.4 |
| Terminal-Bench 2.0 | 69.7 |
| GPQA Diamond | 92.4 |
| HMMT 2026 Feb | 97.1 |
| IMOAnswerBench | 90.0 |
| MCP-Atlas | 76.4 |

在 SWE-Pro、Terminal-Bench 2.0、GPQA Diamond 三个 agentic 评测上，Qwen-3.7-Max 同时领先 DeepSeek-V4-Pro 和 Claude Opus 4.6。Artificial Analysis Intelligence Index 得分 57，全球第 7；Chatbot Arena 文本榜全球第 13，中国模型第 1。

定价：输入 $2.50 / 1M tokens，输出 $7.50 / 1M tokens，缓存输入 $0.25 / 1M tokens。

同期亮相的还有阿里自研 AI 芯片"真武 M890"，Qwen-3.7-Max 在该平台上将 Extend Attention 内核推理速度提升约 10 倍。

### 10.4 闭源转向的意义

2026 年 4 月起，Qwen3.5-Omni、Qwen3.6-Plus、Qwen-3.7-Max 不再开放权重，仅通过 API 或闭源方式使用。这打破了 Qwen 长期"open-source-first"的默认策略。

周靖人在 2025 年曾说"不开源反而风险更大"。一年后的闭源转向并非否定开源，而是形成了"开源基座 + 闭源前沿"的双轨格局：主线模型（Qwen-3、Qwen-3.5 的开源版本）继续 Apache 2.0，前沿旗舰和全模态版本走 API 商业化。这与 DeepSeek 的路线形成鲜明对比——DeepSeek-V4 仍为 MIT 开源。

**作者点评：** Qwen-3.7-Max 的"agent-first"定位非常精准。2026 年的大模型竞争已经从"谁的 benchmark 分数高"转向"谁能完成更长的自主任务链"。1000+ 步连续执行、35 小时不降解——这些数字的意义不在于 benchmark 排名，而在于它意味着 Agent 应用第一次有了真正可靠的底层模型。闭源是商业选择，但 agent-first 是技术判断。

---

## 十一、六大专项分支：全家桶的完整版图

除了主线六代模型，Qwen 还形成了六个专项分支，覆盖了从视觉到代码、从数学到全模态的完整版图。

### 11.1 Qwen-VL（视觉语言）

演进路线：Qwen-VL（2023.08）→ Qwen2-VL（2024.09，arXiv:2409.12191）→ Qwen2.5-VL → Qwen3-VL（2025.11，arXiv:2511.21631）。关键技术包括 M-RoPE、Naive Dynamic Resolution、视频理解和 Visual Grounding。

### 11.2 Qwen-Audio（音频）

演进路线：Qwen-Audio（2023.11）→ Qwen2-Audio（2024.07，arXiv:2407.10759）。统一语音 LLM，双模式训练，覆盖 30+ 音频任务。

### 11.3 Qwen-Coder（代码）

演进路线：CodeQwen 1.5（2024.04）→ Qwen2.5-Coder（2024.09，arXiv:2409.12186）→ Qwen3-Coder（480B-A35B MoE）。关键技术包括 Repo-level 训练、FIM（Fill-in-the-Middle）和 agentic coding。Qwen3-Coder 在 SWE-bench 上得分 56.4。

### 11.4 Qwen-Math（数学）

代表模型 Qwen2.5-Math（arXiv:2409.12122），引入 TIR（Tool-Integrated Reasoning）和 Self-Improvement Loop。高考数学 88.5 分。

### 11.5 QwQ（推理专家）

QwQ-32B-Preview（2024.11）→ QwQ-Max。Self-Questioning Long-CoT、多阶段 RL、test-time scaling。QwQ-Max 曾压过 o1 和 R1，后技术积累并入 Qwen-3 主线。

### 11.6 Qwen-Omni（全模态）

演进路线：Qwen2.5-Omni（2025.03，arXiv:2503.20215）→ Qwen3-Omni（2025.09，arXiv:2509.17765）→ Qwen3.5-Omni（2026.04，arXiv:2604.15804，闭源）。关键技术包括 Thinker-Talker、TMRoPE、Built-in Thinking 多模态化和 HLA backbone。实时延迟小于 200ms。

---

## 十二、总览表：三年，六代，五十余个模型

| 版本 | 时间 | 最大规模 | 训练数据 | 上下文 | 关键创新 | 协议 |
|---|---|---|---|---|---|---|
| Qwen-1 | 2023.08 | 72B Dense | 3T tokens | 8K | 151K 词表，RoPE base 1e6 | Apache 2.0 |
| Qwen-1.5 | 2024.02 | 72B + MoE-A2.7B | — | 8K | 首次 MoE，八档尺寸 | Apache 2.0 |
| Qwen-2 | 2024.06 | 72B Dense + 57B-A14B | ~7T tokens | 128K | GQA 全 size 化，DPO | Apache 2.0 |
| Qwen-2.5 | 2024.09 | 72B Dense | 18T tokens | 1M (DCA) | DCA，全家桶，M-RoPE | Apache 2.0 |
| Qwen-3 | 2025.04 | 235B-A22B MoE | 36T tokens | 128K-256K | Built-in Thinking，QK-Norm | Apache 2.0 |
| Qwen-3.5 | 2026.02 | 397B-A17B MoE | 36T+ tokens | 262K | Gated DeltaNet 3:1，早融合 | Apache 2.0 |
| Qwen-3.6-Plus | 2026.04 | 闭源 | — | 1M | 始终在线 CoT | 闭源 API |
| Qwen-3.7-Max | 2026.05 | 闭源 | — | ~1M | Agent-first，1000+ 步执行 | 闭源 API |

---

## 十三、三条技术主线与两条路线分歧

### 13.1 Qwen 的三条技术主线

**效率革命。** 从 Qwen-1 的纯 Dense，到 Qwen-1.5 试水 MoE，到 Qwen-3 的超稀疏 MoE（235B 总参数只激活 22B），再到 Qwen-3.5 的 Gated DeltaNet 混合注意力（397B 总参数只激活 17B）。核心思想始终是：总参数可以很大，但每次推理只激活少量参数。

**感知扩展。** 从纯文本到视觉（Qwen-VL）、音频（Qwen-Audio）、全模态（Qwen-Omni），从晚融合（独立 encoder + adapter）到早融合（预训练阶段混合多模态 token）。M-RoPE → TMRoPE → Thinker-Talker 形成完整的多模态位置编码和架构演化路径。

**推理深化。** 从 SFT 微调到 RLHF，从 TIR 工具推理到 QwQ 独立推理专家，从 Built-in Thinking Mode 到始终在线 CoT。模型从"直接给答案"转向"可展示推理过程"，推理能力成为模型能力的核心指标。

### 13.2 Qwen 与 DeepSeek 的五条路线分歧

| 维度 | Qwen | DeepSeek |
|---|---|---|
| 尺寸矩阵 | 九档完整，端侧到云端 | 集中少数旗舰 |
| 多模态 | VL + Audio + Omni 全家桶 | 单线 VL + Janus |
| 推理 | 通用模型内嵌 thinking mode | 独立 reasoning specialist（R1/R2） |
| 注意力 | 异质混合（GDN + full attention） | full attention 内部稀疏化（MLA/NSA/DSA） |
| 2026 开源策略 | 前沿旗舰转闭源 API | V4 仍为 MIT 开源 |

这两条路线没有绝对的对错。Qwen 更偏产品化、全家桶、工程一致性；DeepSeek 更偏研究院风格、单点架构突破、前沿旗舰开源。选择哪条路线，取决于你是要"一个模型族解决所有问题"还是"一个模型做到极致"。

---

## 十四、结语：开源的"基建"与闭源的"前沿"

回看 Qwen 的三年，最打动我的不是某个 benchmark 分数，而是它的工程纪律。

每一代模型都有完整的技术报告。每一个架构决策——大词表、GQA 全 size 化、DCA、Built-in Thinking、Gated DeltaNet——都不是追热点，而是解决上一代暴露出的具体工程问题。Qwen-1 把 RoPE base 设为 1e6，一年后在 Qwen-2 的长上下文扩展中兑现；Qwen-1.5 试水 MoE，三代之后在 Qwen-3.5 的 397B-A17B 中达到极致；QwQ 作为独立推理专家只活了半年，但它的技术积累让 Qwen-3 的 Built-in Thinking Mode 成为可能。

2026 年的闭源转向让一些开源社区的用户感到失望，但如果你把 Qwen 的三年当作一个整体来看，这个转向其实是自然的：开源基座已经足够成熟（Qwen-3 和 Qwen-3.5 的 Apache 2.0 版本覆盖了绝大多数场景），闭源前沿则去探索 Agent 时代的天花板。开源做"基建"，闭源做"前沿"，两条腿走路。

周靖人说："大模型已进入早期阶段的中期。"如果这个判断成立，那么 Qwen 的三年进化史，不过是这场长跑的第一圈。

---

## 参考资料

1. Qwen Technical Report, arXiv:2309.16609, 2023
2. Qwen2 Technical Report, arXiv:2407.10671, 2024
3. Qwen2.5 Technical Report, arXiv:2412.15115, 2024
4. Qwen2.5-1M Technical Report, arXiv:2501.15383, 2025
5. Qwen3 Technical Report, arXiv:2505.09388, 2025
6. Qwen2-VL, arXiv:2409.12191, 2024
7. Qwen2-Audio Technical Report, arXiv:2407.10759, 2024
8. Qwen2.5-Omni Technical Report, arXiv:2503.20215, 2025
9. Qwen2.5-Math Technical Report, arXiv:2409.12122, 2024
10. Qwen2.5-Coder Technical Report, arXiv:2409.12186, 2024
11. Qwen3-VL Technical Report, arXiv:2511.21631, 2025
12. Qwen3-Omni Technical Report, arXiv:2509.17765, 2025
13. Qwen3.5-Omni Technical Report, arXiv:2604.15804, 2026
14. Alibaba Cloud Summit: Qwen 3.7 Max, agent-first flagship LLM, 2026-05-20
15. 通义千问 Qwen3 发布，对话阿里周靖人, 2025-04-30
16. Qwen 家族技术路线图, yudonglee.me, 2026-06
17. Qwen 系列模型技术演进全景：从 Qwen1 到 Qwen3.6, CSDN, 2026-05
