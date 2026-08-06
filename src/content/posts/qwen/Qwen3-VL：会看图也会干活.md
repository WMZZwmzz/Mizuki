---
title: "Qwen3-VL：会看图也会干活"
published: "2026-07-14"
category: "qwen"
lang: "zh"
draft: false
tags: ["视觉", "Agent", "MoE", "架构"]
---

# Qwen3-VL 论文解读：视觉模型也会思考了，从"看图说话"到"看图干活"

> 论文：*Qwen3-VL Technical Report*
> 作者：Shuai Bai 等 64 人（阿里通义千问团队）
> arXiv：2511.21631，2025 年 11 月 26 日提交，42 页
> 这篇论文标志着 Qwen 视觉语言模型正式进入"会思考、能动手"的新阶段。如果说 Qwen2.5-VL 解决了"看得清"的问题，那 Qwen3-VL 要解决的是"想得深、做得对"。从架构到训练再到能力边界，变化都很大，值得一读。

---

## 一、这次到底做了什么？

一句话概括：**Qwen3-VL 是通义千问团队发布的第三代视觉语言模型（Vision-Language Model, VLM），在视觉理解的基础上，加入了深度推理（Thinking）模式和视觉 Agent 能力。**

先说背景。Qwen 系列的视觉模型已经迭代了三代：

- **Qwen-VL**（一代）：最早的多模态尝试，基本是"给 LLM 装了个眼睛"
- **Qwen2-VL**：引入了 M-RoPE，让模型能处理视频和更复杂的图像
- **Qwen2.5-VL**：把视觉理解做到了开源 SOTA，支持动态分辨率、超长上下文，号称"See More, Understand More"

到了 Qwen3-VL，slogan 变成了**"更锐利的视觉，更深度的思考，更广泛的行动"（Sharper Vision, Deeper Thought, Broader Action）**。不只是口号升级，模型矩阵也从 3 个 Dense 模型扩展到了 6 个基础模型（加上 Thinking 版本一共 12 个），覆盖了从端侧 2B 到旗舰 235B MoE 的全线产品。

具体来说，Qwen3-VL 在三个方向做了大动作：

1. **视觉推理（Visual Reasoning）**：内置 Thinking 模式，能像 o1 那样分步推理、自我纠错
2. **视觉 Agent**：能操作 GUI、生成结构化的操作指令，向"AI 操作系统"迈了一步
3. **架构升级**：引入 MoE（混合专家模型）、DeepStack 多层视觉特征注入、Interleaved-MRoPE 等新机制

---

## 二、架构改了什么？从"看得清"到"想得深"

### 1. 视觉编码器：从自研 ViT 换成了 SigLIP-2

Qwen2.5-VL 用的是自研 ViT，搭配窗口注意力（Window Attention）来降低计算量。Qwen3-VL 直接换成了 **SigLIP-2**——Google 2025 年发布的新一代视觉-语言预训练编码器。

具体选型上，小模型（2B/4B）用的是 **SigLIP2-Large（300M 参数）**，大模型用 **SigLIP2-SO-400M**。SigLIP-2 采用全注意力（Full Self-Attention），全局特征提取能力更强，代价是推理速度会慢一些——这也是社区反馈 Qwen3-VL 推理偏慢的主要原因之一。

补丁策略也变了：Qwen2.5-VL 用 28 的倍数做尺寸、步长 14；Qwen3-VL 改成了 16x16 的 patch，32 倍空间压缩。

### 2. DeepStack：多层视觉特征注入，不增加序列长度

这是 Qwen3-VL 最有意思的架构创新之一。

传统的 VLM 架构，视觉编码器只输出一层最终特征给 LLM。问题是：ViT 的浅层特征包含纹理、边缘等低级信息，深层特征包含语义、结构等高级信息——只用最后一层，等于丢掉了大量细粒度信息。

**DeepStack** 的做法是：从 ViT 的 **3 个中间层**抽取特征，通过 **3 个独立的 2 层 MLP Merger** 处理后，以残差连接（Residual Connection）的方式分别注入到 LLM 的 **前 3 层**。这样做的结果是：多尺度视觉信息被保留下来了，而且序列长度没有增加——这一点很关键，因为高分辨率图像本来就会产生大量的视觉 token。

### 3. Interleaved-MRoPE：让时间、高度、宽度不再"偏科"

Qwen2-VL 引入的 **M-RoPE**（Multimodal Rotary Position Embedding）是个好东西，它把位置编码分成了时间（time）、高度（height）、宽度（width）三个维度，让模型能处理视频等多模态序列。但原版 M-RoPE 有个问题：三个维度在频率维度上是顺序排列的（先时间、再高度、再宽度），导致频谱不均衡。

**Interleaved-MRoPE** 的解决方案很巧妙：把 t、h、w 三个维度**交错排列**，模式是 `[t,h,w, t,h,w, t,h,w, ...]`。这样三个维度在频率上均匀分布，位置编码的质量更高，尤其在长视频场景下效果更好。

另一个视频相关的改进是时间戳表示：Qwen2.5-VL 用绝对时间编码，Qwen3-VL 改用文本字符串，比如 `<3.0 seconds>`。听起来简单，但对长视频的时间定位精度提升很大。

### 4. MoE 架构：用 7B 的成本，享受 30B+ 的性能

Qwen3-VL 首次引入了 **混合专家模型（Mixture of Experts, MoE）**。旗舰模型 **235B-A22B** 总参数量 235B，但每次推理只激活 22B 参数——大约是 Qwen2.5-VL-72B 的三分之一。

这意味着什么？你用 7B 级别模型的推理成本，可以享受到 30B+ 级别模型的性能。对于部署来说，这是一个质变。

完整模型矩阵如下：

| 模型 | 总参数量 | 激活参数量 | 架构 | 定位 |
|------|---------|-----------|------|------|
| Qwen3-VL-2B | 2B | 2B | Dense | 端侧/移动设备 |
| Qwen3-VL-4B | 4B | 4B | Dense | 轻量部署 |
| Qwen3-VL-8B | 8B | 8B | Dense | 单 GPU 推理 |
| Qwen3-VL-30B-A3B | 30B | 3B | MoE | 高效推理 |
| Qwen3-VL-32B | 32B | 32B | Dense | 中端甜点 |
| Qwen3-VL-235B-A22B | 235B | 22B | MoE | 旗舰性能 |

每个模型都有 **Instruct** 和 **Thinking** 两个版本。Thinking 版本内置了深度推理能力，不需要用户手写 Chain-of-Thought 提示。

---

## 三、训练流程：四阶段预训练 + 后训练

### 1. 预训练四阶段

Qwen3-VL 的预训练分四个阶段，数据量和上下文长度逐步递增：

| 阶段 | 目标 | 上下文长度 | 数据量 | 训练内容 |
|------|------|-----------|--------|---------|
| Stage 0：对齐 | 视觉-语言对齐 | 8K | 67B tokens | 冻结 LLM 和视觉编码器，只训练 Merger |
| Stage 1：多模态 | 全面多模态学习 | 8K | ~1T tokens | 解冻全部参数 |
| Stage 2：长上下文 | 长文本和 Agent 数据 | 32K | ~1T tokens | 强调文本和 Agent 任务 |
| Stage 3：超长上下文 | 超长文档和视频 | 262K | 100B tokens | 长文档和长视频 |

一个值得注意的细节：Qwen3-VL 采用了**平方根归一化的每 token 损失函数（Square-Root Normalized Per-Token Loss）**，用来平衡文本 token 和多模态 token 对损失的贡献。这解决了一个常见问题——多模态 token 通常比纯文本 token 更难预测，如果不做平衡，模型会倾向于忽略视觉信息。

### 2. 后训练：SFT + 知识蒸馏 + 强化学习

后训练（Post-Training）部分，Qwen3-VL 做了三件事：

1. **监督微调（SFT）**：使用扩展的 Chain-of-Thought 数据集，让模型学会分步推理
2. **知识蒸馏（Knowledge Distillation）**：从大模型蒸馏到小模型，让小模型也能有不错的推理能力
3. **强化学习（RL）**：进一步优化推理质量

最终产出 Instruct 和 Thinking 两个系列。Thinking 版本是通过长链式思维（Long Chain-of-Thought）数据专门训练的，模型在推理时会先生成一段"思考过程"，再给出最终答案。

训练数据的覆盖面也很广：**39 种 OCR 语言、6000 万 STEM 题目、多种空间理解和 Agent 任务数据**。

---

## 四、三大核心能力

### 1. 视觉推理（Thinking 模式）

这是 Qwen3-VL 最大的卖点之一。Thinking 模式的本质是让模型在回答之前先做一段"内心独白"——分步拆解问题、验证中间结果、必要时自我纠正。

效果怎么样？看数字：

- **MMStar**（高难度视觉推理）：235B-A22B-Thinking 达到了 **78.7**
- **MathVista**（数学视觉推理）：235B 达到 **84.9**
- **MIA-Bench**：235B 的数学和文本子任务得分超过 GPT-5-high-thinking 版本 10.0 和 5.0 分
- **HallusionBench**（对齐评估）：Thinking 版本分别领先 Gemini-2.5-Pro、GPT-5、Claude Opus 4.1 达 3.0、1.0 和 6.3 分

特别值得一提的是 **8B-Thinking** 版本，它在 MathVision 测试中的准确率甚至超过了 Gemini 2.5 Flash Lite——一个 8B 参数的小模型在数学推理上打赢了 Google 的大模型，这说明 Thinking 模式的训练确实有效。

即便是最小的 2B-Thinking 版本，MMBench-EN 也有 **79.9**，MMStar 有 **68.1**，放在一年前这都是 7B 模型才能达到的水平。

### 2. 视觉 Agent：从"看图"到"干活"

Qwen3-VL 的 Agent 能力是让模型从"理解图像"进化到"操作界面"。具体来说，模型可以：

- **解读屏幕界面**：识别 UI 元素，不依赖 DOM 结构，而是通过语义理解和 OCR（支持 32 种语言）来定位按钮、输入框、菜单等
- **生成操作指令**：输出结构化的 JSON 操作流程，比如"将鼠标移动到用户名输入框"
- **与外部工具集成**：支持与 PyAutoGUI、企业 RPA 平台对接，插件式工具扩展
- **跨平台应用**：PC 端和移动端（通过 ADB/WebDriver）都能用

Agent 能力的 benchmark 数据：

| 测试 | 模型 | 得分 |
|------|------|------|
| OSWorld | 32B | 41.0 |
| AndroidWorld | 32B | 63.7 |
| EmbSpatial | 235B | 84.3 |
| RefSpatial | 235B | 69.9 |
| RoboSpatialHome | 235B | 73.9 |

在 3D 定位任务（SUN RGB-D）上，235B Thinking 版本比 Gemini-2.5-Pro 高出 **5.2 个百分点**。这说明在需要精确空间理解的 Agent 场景下，Qwen3-VL 有实打实的优势。

### 3. 超长上下文 + 视频理解

**256K token 原生上下文窗口**，可扩展到 100 万 token。在"大海捞针"（Needle in a Haystack）测试中：

- 256K token（约 30 分钟视频）：**100% 准确率**
- 1M token（约 2 小时视频）：**99.5% 召回率**

视频理解能力也有明显提升。Qwen3-VL 支持 **120fps** 的视频帧率，通过 Interleaved-MRoPE 实现帧级时间定位。8B 版本在时间理解任务上已经追平了上一代的 Qwen2.5-VL-72B——代际进步非常明显。

视频 benchmark 数据：

| 测试 | 模型 | 得分 |
|------|------|------|
| VideoMME（无字幕） | 235B-Instruct | 79.2 |
| VideoLLM-Bench | — | 73.5（+12.3 vs 上一代） |

---

## 五、跟友商比到底怎么样？

这里把 Qwen3-VL 跟主流竞品做个正面对比。需要说明的是，各家使用的评测版本和条件不完全一致，数字仅供参考：

### 旗舰模型对比

| Benchmark | Qwen3-VL-235B | GPT-4o/5 | Gemini-2.5-Pro | Claude Opus 4.1 |
|-----------|--------------|----------|---------------|----------------|
| MMMU_VAL | 78.7 | 84.2 (GPT-4o) | ~82 | 77.8 |
| MMStar | 78.7 (Thinking) | — | — | — |
| MathVista | 84.9 | — | — | — |
| DocVQA | 89.2 | — | — | — |
| MMBench-EN | 90.6 | — | — | — |
| HallusionBench | 领先 (Thinking) | — | 落后 3.0 分 | 落后 6.3 分 |
| MuirBench | 80.1 (Thinking) | — | — | — |
| RefCOCO-avg | 91.9 | — | — | — |

Qwen3-VL-235B 在 **46 项评测中的 32 项**取得了最佳成绩（论文声称），尤其在文档理解、多图关联、Agent 操作和视觉数学推理方面表现突出。

### 跟上一代 Qwen2.5-VL 比

| Benchmark | Qwen2.5-VL-72B | Qwen3-VL-8B | Qwen3-VL-235B |
|-----------|---------------|-------------|--------------|
| MMBench-EN | 82.3 | 85.3 (Thinking) | 90.6 |
| DocVQA | 88.7 | — | 89.2 |
| VideoLLM-Bench | 61.2 | — | 73.5 |

- MMBench-EN 提升约 **5.3 分**
- DocVQA 提升约 **3.7 分**
- VideoLLM-Bench 提升约 **12.3 分**（视频理解进步最大）
- 整体视觉和逻辑任务平均提升 **15-20%**

### OCR 能力

Qwen3-VL 在 OCR 方面的数据：
- 支持 **109 种语言**的 OCR（上一代为 39 种）
- OCRBench（英文）：67.1
- 能处理稀有字体和复杂表格

---

## 六、损失函数和训练细节的巧思

### 平方根归一化损失

这是个不大但很精巧的改动。在多模态训练中，文本 token 和视觉 token 的预测难度差异很大。如果直接用标准的交叉熵损失，模型容易被"简单"的文本 token 主导，忽略"困难"的视觉 token。

Qwen3-VL 的做法是对每个 token 的损失做**平方根归一化**：取 token 损失的平方根后再求均值。这相当于对高损失 token 做了压缩、对低损失 token 做了放大，让两类 token 的梯度贡献更均衡。

### 知识蒸馏的规模效应

后训练阶段，Qwen3-VL 从 235B 的旗舰模型蒸馏到小模型。这意味着即便是 2B 的端侧模型，也"见过"大模型的推理方式。从 benchmark 数据看，2B-Thinking 在 MMBench-EN 上达到 79.9，这在以前是 7B 模型的专属领域。

---

## 七、实际使用中的体感和局限

先说优点：

- **Thinking 模式确实好用**：在复杂图表分析、多步数学推理场景下，Thinking 版本的回答质量明显高于 Instruct 版本，而且推理过程可读
- **Agent 能力有实用价值**：GUI 操作不是噱头，32B 模型在 OSWorld 上 41 分、AndroidWorld 上 63.7 分，已经可以做简单的自动化流程
- **MoE 架构性价比高**：235B 总参数但只激活 22B，部署成本可控

再说问题：

- **推理速度下降**：SigLIP-2 的全注意力 + DeepStack 的多层注入，让推理速度比 Qwen2.5-VL 慢了不少，社区反馈不少
- **OCR 英文分数看着不高**：OCRBench 英文 67.1 这个数字，跟一些专门做 OCR 的模型比还有差距。不过考虑到 Qwen3-VL 是通用模型，这个取舍可以理解
- **Agent 能力还在早期**：OSWorld 41 分说明在真实桌面操作场景下，模型还有很大的提升空间。跟人类操作效率比，还差得远
- **Thinking 模式的 token 消耗**：深度推理意味着更多的输出 token，对 API 调用来说成本更高

---

## 收尾：我的一点看法

从 Qwen-VL 到 Qwen3-VL，通义千问的多模态路线走得很清晰：先解决"能看到"（一代），再解决"看得清"（二代），然后解决"看得深"（2.5 代），现在解决"想得透、做得到"（三代）。每一步都不算惊艳，但每一步都在扎实地缩小与闭源模型的差距——到了 Qwen3-VL，在不少评测上已经反超了。

最值得关注的不是某个具体 benchmark 的分数，而是两个趋势。第一，**Thinking 模式的引入说明多模态模型正在从"识别"走向"推理"**，这跟纯文本领域的 o1/Qwen3 趋势一致。视觉推理比纯文本推理难得多，因为视觉信息本身就比文本更模糊、更多义。Qwen3-VL 在这个方向上的尝试，哪怕是初步的，也值得关注。

第二，**Agent 能力的加入意味着 VLM 正在从"分析工具"变成"执行工具"**。虽然现在的 GUI 操作还比较粗糙，但从"看图说话"到"看图干活"，这是一个质的跨越。结合 256K 上下文和视频理解能力，Qwen3-VL 理论上可以处理"看完一段教程视频然后自动执行"这样的任务——虽然现在还做不到，但框架已经搭起来了。

当然也有遗憾。推理速度的下降是个实际问题，对于需要低延迟的应用场景（比如实时视频分析），Qwen3-VL 可能不是最佳选择。另外，MoE 架构虽然降低了推理成本，但也增加了部署复杂度——235B 的模型参数要完整加载到显存里，即便只激活 22B，硬件门槛依然不低。

总的来说，Qwen3-VL 是目前开源多模态模型中的最强选手之一。如果你在做需要视觉推理、文档理解或视觉 Agent 的项目，值得优先评估。如果只是简单的图像分类或 OCR，Qwen2.5-VL 甚至更小的模型可能更划算。

---

## 附：核心数据速查

### 模型参数速查

| 模型 | 总参数 | 激活参数 | 架构 | 视觉编码器 | 上下文 |
|------|-------|---------|------|-----------|--------|
| Qwen3-VL-2B | 2B | 2B | Dense | SigLIP2-Large (300M) | 256K |
| Qwen3-VL-4B | 4B | 4B | Dense | SigLIP2-Large (300M) | 256K |
| Qwen3-VL-8B | 8B | 8B | Dense | SigLIP2-SO (400M) | 256K |
| Qwen3-VL-30B-A3B | 30B | 3B | MoE | SigLIP2-SO (400M) | 256K |
| Qwen3-VL-32B | 32B | 32B | Dense | SigLIP2-SO (400M) | 256K |
| Qwen3-VL-235B-A22B | 235B | 22B | MoE | SigLIP2-SO (400M) | 256K（可扩展至 1M） |

### 核心 Benchmark 速查（235B-A22B）

| Benchmark | Instruct | Thinking | 说明 |
|-----------|----------|----------|------|
| MMMU_VAL | 78.7 | — | 多模态理解 |
| MMStar | — | 78.7 | 高难度视觉推理 |
| MathVista_mini | 84.9 | — | 数学视觉推理 |
| MMBench-EN | 90.6 | — | 通用视觉基准 |
| DocVQA | 89.2 | — | 文档理解 |
| OCRBench (EN) | 67.1 | — | OCR 识别 |
| RefCOCO-avg | 91.9 | — | 视觉定位 |
| VideoMME (w/o sub) | 79.2 | — | 视频理解 |
| MuirBench | — | 80.1 | 多图理解 |
| HallusionBench | — | 领先 SOTA | 对齐评估 |
| EmbSpatial | 84.3 | — | 具身空间理解 |
| OSWorld | — | 62.0 (235B) | 桌面操作 Agent |
| AndroidWorld | — | 63.7 (32B) | 手机操作 Agent |
| Needle (256K) | 100% | — | 超长上下文 |
| Needle (1M) | 99.5% | — | 超长上下文 |

### 训练阶段速查

| 阶段 | 上下文 | 数据量 | 核心操作 |
|------|--------|--------|---------|
| Stage 0 | 8K | 67B tokens | 对齐（冻结 LLM + ViT） |
| Stage 1 | 8K | ~1T tokens | 全参数多模态训练 |
| Stage 2 | 32K | ~1T tokens | 长上下文 + Agent 数据 |
| Stage 3 | 262K | 100B tokens | 超长文档和视频 |
| 后训练 | — | — | SFT + 蒸馏 + RL |

### 关键概念清单

| 概念 | 英文 | 一句话解释 |
|------|------|-----------|
| **SigLIP-2** | Sigmoid Loss for Language Image Pre-training 2 | Google 的新一代视觉-语言编码器，Qwen3-VL 用它替换了自研 ViT |
| **DeepStack** | Deep Stack of Visual Features | 从 ViT 多个中间层抽取特征注入 LLM，保留多尺度视觉信息 |
| **Interleaved-MRoPE** | Interleaved Multimodal Rotary Position Embedding | 将时间/高度/宽度维度交错排列的位置编码，改进视频理解 |
| **MoE** | Mixture of Experts | 混合专家模型，总参数大但激活参数小，降低推理成本 |
| **Thinking Mode** | — | 内置深度推理模式，模型先思考再回答，提升复杂任务准确率 |
| **SFT** | Supervised Fine-Tuning | 监督微调，用标注数据训练模型遵循指令 |
| **RL** | Reinforcement Learning | 强化学习，用于后训练阶段优化推理质量 |
| **Knowledge Distillation** | — | 知识蒸馏，将大模型的推理能力迁移到小模型 |
| **Needle in a Haystack** | — | 大海捞针测试，评估超长上下文中的信息检索能力 |
| **MuirBench** | — | 多图理解基准，测试模型对多张相关图像的联合分析能力 |
| **OSWorld** | — | 桌面操作系统 Agent 基准，测试模型操控真实桌面界面的能力 |
| **AndroidWorld** | — | 移动端 Agent 基准，测试模型操控 Android 界面的能力 |
| **EmbSpatial** | — | 具身空间理解基准，测试模型在机器人/Agent 场景下的空间推理 |

---

*参考来源：arXiv:2511.21631, Qwen 团队官方发布，以及社区技术解析文章。*
