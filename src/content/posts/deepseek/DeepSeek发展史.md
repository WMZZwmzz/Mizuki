---
title: "DeepSeek发展史"
published: "2026-07-11"
category: "deepseek"
lang: "zh"
draft: false
tags: ["发展史", "架构", "推理"]
---

# DeepSeek 发展史：25 篇论文里的技术蜕变

\---

## 〇、总览：这篇文章讲什么

文章系统梳理了 **DeepSeek（深度求索）** 从 2023 年 11 月发布首个模型，到 2026 年 4 月发布 V4 之间约两年半的技术进化史。全文以 21 篇论文为骨干（标题称 25 篇），并纳入 V2.5、V3.1、V4 等无独立论文的版本迭代，沿着三条技术主线展开：

1. **架构效率**——如何用更少的计算做更多的事；
2. **推理能力涌现**——从数学推理到 Agent 推理；
3. **多模态统一**——视觉与语言是否共享同一套计算原语。

作者最后总结出 DeepSeek 的四条方法论：效率至上不堆算力、解耦优于统一、涌现优于监督、系统思维而非单点优化。

\---

## 一、发展时间线总表

|时间|模型|核心贡献|解读|
|-|-|-|-|
|2023.11|DeepSeek-Coder|首个开源代码模型，仓库级预训练 + FIM|[DeepSeek-Coder论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/c078fd54-074f-4c45-bdaf-9099ba71f455)|
|2023.11|DeepSeek LLM|Scaling Law 重校准，67B Dense|[DeepSeekLLM论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/63c7b4cb-0700-47c8-abc5-e26b2fba7c1b)|
|2024.01|DeepSeekMoE|细粒度专家 + 共享专家范式|[DeepSeekMoE论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/40a59180-cca9-4609-b47c-5d96827f61a6)|
|2024.02|DeepSeek-Math|数据工程 + **GRPO**（推理 RL 的种子）|[DeepSeekMath论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/ae5cb8c5-5491-4b93-882b-ef00cb3c9b60)|
|2024.03|DeepSeek-VL|视觉-语言模型第一步|[DeepSeek-VL论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/b8646de8-3a3f-4ba5-9f19-dd921b92ed26)|
|2024.05|**DeepSeek-V2**（分水岭①）|**MLA** + DeepSeekMoE，架构范式转变|[DeepSeek-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/47b7f210-2ebd-481f-8b39-507d1b0602fe)|
|2024.06|DeepSeek-Coder-V2|MoE 代码模型，代码追平 GPT-4|[DeepSeek-Coder-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/22094a12-b5ba-45c6-bae4-d527abd1904a)|
|2024.09|DeepSeek-V2.5|通用 + 代码能力融合（无独立论文）|（无）|
|2024.10|Janus|理解/生成双通路解耦|[Janus系列论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/93c06ca7-2e56-43be-9ccb-16f8fcee5b7e)|
|2024.11|JanusFlow|自回归 + Rectified Flow 统一|[Janus系列论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/93c06ca7-2e56-43be-9ccb-16f8fcee5b7e)|
|2024.12|DeepSeek-VL2|MoE + 动态分块进入视觉|[DeepSeek-VL2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/2d2737f5-8df5-47c0-87af-89bb75d11a31)|
|2024.12|**DeepSeek-V3**（分水岭②）|无辅助损失均衡 + MTP + FP8，557 万美元登顶|[DeepSeek-V3论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/1544af22-72de-4ae0-b132-44d8dfd1b41d)|
|2025.01|**DeepSeek-R1**（分水岭③）|纯 RL 推理涌现 + 蒸馏|[DeepSeek-R1论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/3f61e41b-ee88-4e07-9f02-5aa3564e37aa)|
|2025.01|Janus-Pro|解耦架构规模化验证|[Janus系列论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/93c06ca7-2e56-43be-9ccb-16f8fcee5b7e)|
|2025.04|DeepSeek-Prover-V2|递归证明管线，Lean 4 形式化|[DeepSeek-Prover-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d4e11da7-34f1-494a-b2aa-e2c29d2f33b6)|
|2025.08|DeepSeek-V3.1|混合推理架构（思考/非思考）（无独立论文）|（无）|
|2025.10|DeepSeek-OCR|视觉作为文本压缩介质，3B 开源|[DeepSeek-OCR论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/bd281d77-a892-4ec6-913d-54a53eed1836)|
|2025.11|DeepSeekMath-V2|自验证推理，"知道为什么对"|[DeepSeekMath-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/b8370196-01b6-4944-8607-548e910881ba)|
|2025.12|DeepSeek-V3.2|**DSA** 稀疏注意力 + Agent 能力管线|[DeepSeek-V3.2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/bf9994f4-68f5-444e-a54b-34237f5dffd7)|
|2025.12|mHC|流形约束超连接（并入 V4 解读）|[DeepSeek-V4论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d3ce711f-80cf-45f1-814c-98e037d20a37)|
|2026.01|Engram|条件记忆，稀疏性的新轴（留给 V5）|[Conditional Memory论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/0fc2d2f1-496a-4580-8403-3fd861809e9f)|
|2026.01|DeepSeek-OCR 2|视觉因果流，LLM 当视觉编码器|[DeepSeek-OCR 2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d8d2263e-91bb-4910-abd1-b98bc978cbc7)|
|2026.04|**DeepSeek-V4**（里程碑）|mHC + CSA/HCA 混合注意力 + Muon，百万 token 上下文|[DeepSeek-V4论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d3ce711f-80cf-45f1-814c-98e037d20a37)|

三个分水岭：**V2**（MLA+MoE 定下架构基调）、**V3**（效率与性能的极致平衡）、**R1**（推理能力的涌现）。

\---

## 二、阶段一：奠基——通用语言模型与代码智能（2023.11）

### 1\. DeepSeek-Coder：起点

文章认为这是 DeepSeek 的第一个模型（2023 年 11 月 2 日发布；arXiv 论文 2401.14196 于 2024 年 1 月才提交）。1B、7B、33B 全系列开源、免费商用，在 2 万亿代码 token 上从头训练，覆盖 87 种编程语言，16K 上下文。两个卖点：一是数据按**仓库级别**组织（理解跨文件依赖），二是预训练加入 **Fill-in-the-Middle（FIM）** 训练，服务 IDE 代码补全。开源模型中达到 SOTA，超越 CodeLlama 和 GPT-3.5。

**印证**：[DeepSeek-Coder论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/c078fd54-074f-4c45-bdaf-9099ba71f455) 补充细节——数据按依赖关系做带环容忍的拓扑排序（被依赖文件排在前面）；FIM 比例消融后取 50% 折中；6.7B 就超过了 CodeLlama-34B；Instruct 33B 的 Python HumanEval 79.3% 超 GPT-3.5-Turbo 的 76.2%；LeetCode 竞赛题 Pass@1 27.8%（GPT-3.5 为 23.3%）；v1.5 从 DeepSeek-LLM-7B 续训补自然语言与数学能力。

### 2\. DeepSeek LLM：通用能力的基石

2023 年 11 月 29 日发布 DeepSeek LLM 67B（论文 arXiv:2401.02954，2024 年 1 月提交）。核心贡献是重新审视 **Scaling Law**，确认"大力出奇迹"有效但需理解细节；2 万亿 token，7B/67B 两个规模，67B 在代码、数学、推理上超越 LLaMA-2 70B，Chat 版超过 GPT-3.5。核心理念就此确立：不盲目堆参数，先搞清楚 Scaling Law 再精确投入算力。

**印证**：[DeepSeekLLM论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/63c7b4cb-0700-47c8-abc5-e26b2fba7c1b) 补充——提出新模型规模度量 M=non-embedding FLOPs/token，给出最优分配律 M\_opt ∝ C^0.5243、D\_opt ∝ C^0.4757；67B 对 LLaMA2-70B 全面领先（如 MATH 18.7 vs 13.5、HumanEval 42.7 vs 28.7、C-Eval 66.1 vs 51.4）；Do-Not-Answer 97.8 超 GPT-4 的 96.5。

\---

## 三、阶段二：MoE 原型与数学萌芽（2024.01–2024.02）

### 1\. DeepSeekMoE：MoE 架构第一次试水

2024 年 1 月（论文 arXiv:2401.06066）。提出**细粒度专家 + 共享专家**的设计范式：传统 MoE（如 Mixtral 8x7B）用少量大专家，DeepSeekMoE 用大量细粒度专家加共享专家，路由更灵活、冗余更少。2B/16B/145B 三个规模验证，DeepSeekMoE 2B 匹配 GShard 2.8B（1.5 倍参数量）的性能。

**印证**：[DeepSeekMoE论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/40a59180-cca9-4609-b47c-5d96827f61a6) 补充——2B 用 100B token 追平 GShard 2.9B；16B 用 40% 算力追平 DeepSeek 7B、145B 用 28.5% 算力追平 DeepSeek 67B；去掉共享专家后 Pile loss 从 1.808 恶化到 2.414（消融为隔离 1/2/4 个共享专家，激活比 1:7/1:3/1:1）；16B 推理速度约为稠密 7B 的 2.5 倍。

### 2\. DeepSeek-Math：用数据工程撬动数学能力

2024 年 2 月（论文 arXiv:2402.03300）。靠**数据工程**：从 Common Crawl 提取 1200 亿数学相关 token；并提出 **GRPO（Group Relative Policy Optimization）**——无需价值网络的策略优化方法。DeepSeekMath 7B 在 GSM8K 达 64.2%、MATH 达 36.2%，接近 Gemini Ultra 水平。GRPO 成为后续 R1 推理路线的种子。

**印证**：[DeepSeekMath论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/ae5cb8c5-5491-4b93-882b-ef00cb3c9b60) 补充——语料迭代 4 轮、3550 万网页共 120B token；RL 只用约 14.4 万题、每题采 64 个输出，MATH 从 46.8%→51.7%（开源模型首次在 MATH 上突破 50%）、GSM8K 82.9%→88.2%；Base 7B 的 MATH 超过 Minerva 540B（参数为其 77 倍）。

\---

## 四、阶段三：看见——多模态的初步探索（2024.03–2025.01）

### 1\. DeepSeek-VL：让模型"看懂"真实世界

2024 年 3 月（论文 arXiv:2403.05525）。核心思路：数据多样性、混合视觉编码器（SigLIP+SAM）、渐进式训练策略。

**印证**：[DeepSeek-VL论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/b8646de8-3a3f-4ba5-9f19-dd921b92ed26) 补充——1.3B/7B 两型号，语言:多模态数据约 7:3；1024 分辨率图像压进 576 个视觉 token；7B 版 MMB 73.2、SEED 70.4（GPT-4V 为 71.6）、MathVista 36.1；语言侧 GSM8K 相对 DeepSeek-LLM-7B 掉 8 个点（多模态训练侵蚀语言能力的代价），MMLU 反涨到 52.4。

### 2\. Janus：理解与生成的"解耦"

2024 年 10 月（论文 arXiv:2410.13848）。核心思想：用**两个独立视觉编码器**分别负责理解和生成，共享同一自回归 Transformer 主干——当两个需求存在张力时，解耦而非妥协。

**印证**：[Janus系列论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/93c06ca7-2e56-43be-9ccb-16f8fcee5b7e)——1.3B 模型理解端 VQAv2 77.3、MMMU 30.5、MMBench 69.4；生成端 MSCOCO-30K FID 8.53（DALL-E 2 为 10.39）、GenEval 61%，"一个 1.3B 模型打平 7B 级"。

### 3\. JanusFlow：自回归与整流的统一

2024 年 11 月（论文 arXiv:2411.07975）。引入 **Rectified Flow** 图像生成方法，无需复杂架构修改即可与自回归语言模型共存——把生成引擎从离散 VQ token 换成连续整流流。

**印证**：[Janus系列论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/93c06ca7-2e56-43be-9ccb-16f8fcee5b7e)——1.3B 理解端 MM-Vet 30.9、POPE 88.0、MME-P 1333.1；生成端 GenEval 0.63、MJHQ FID-30k 9.51（优于 Janus 的 10.10）。

### 4\. Janus-Pro：解耦架构的规模化验证

2025 年 1 月（论文 arXiv:2501.17811）。核心结论：解耦架构在规模扩展后依然有效，验证"解耦优于统一"。

**印证**：[Janus系列论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/93c06ca7-2e56-43be-9ccb-16f8fcee5b7e)——7B 模型 + 7200 万合成审美数据（真实:合成=1:1）；生成端 GenEval 0.80（DALL-E 3 为 0.67、SD3-Medium 为 0.74）、DPG-Bench 84.2；理解端 MMBench 79.2、MMMU 41.0、MM-Vet 50.0。

### 5\. DeepSeek-VL2：MoE 架构进入视觉

2024 年 12 月（论文 arXiv:2412.10302）。两个升级：\*\*动态分块视觉编码（Dynamic Tiling）\*\*处理高分辨率图像；语言侧继承 **MLA + MoE** 架构。

**印证**：[DeepSeek-VL2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/2d2737f5-8df5-47c0-87af-89bb75d11a31)——Tiny/Small/VL2 激活参数仅 1.0B/2.8B/4.5B（LLM 总参 3B/16B/27B MoE），小激活参数对标 7B+ 稠密模型；DocVQA 93.3、OCRBench 811；RefCOCO val 95.1/testA 96.7/testB 92.7，超过专用检测器 Grounding DINO-Large（90.6）和 Florence-2-L（93.4）。

\---

## 五、阶段四：革命——MLA 与 MoE 的范式转变（2024.05–2024.09）

### 1\. DeepSeek-V2：第一个分水岭

2024 年 5 月（论文 arXiv:2405.04434）。236B 总参数、21B 激活参数、128K 上下文。两大创新：

* **Multi-head Latent Attention（MLA）**：把 KV Cache 压缩到低维潜在向量，KV Cache 减少 93.3%，生成吞吐量提升 5.76 倍；
* **DeepSeekMoE**：更多细粒度专家 + 共享专家，训练成本比 DeepSeek 67B 节省 42.5% 且性能更强。

结果：236B 参数只用 21B 计算成本，超越 LLaMA-3 70B。深远影响：确立后续所有大模型的架构基调 **MLA + MoE**（沿用至 V3、V3.2、R1）。

**印证**：[DeepSeek-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/47b7f210-2ebd-481f-8b39-507d1b0602fe)——8.1T token、60 层/隐层 5120、2 共享 + 160 路由专家；每 T token 训练成本 300.6K→172.8K GPU 小时（省 42.5%）；单机 8×H800 生成超 5 万 token/秒；MMLU 78.5、MATH 43.6、C-Eval 81.7、CMMLU 84.0；Chat(RL) 版 MT-Bench 8.97。

### 2\. DeepSeek-Coder-V2：代码能力的 MoE 升级

2024 年 6 月（论文 arXiv:2406.11931）。基于 DeepSeek-V2 中间检查点额外训练 6 万亿 token，代码任务达到 GPT-4 Turbo 水平——开源代码模型第一次追平 GPT-4 级别。

**印证**：[DeepSeek-Coder-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/22094a12-b5ba-45c6-bae4-d527abd1904a)——236B 总参/21B 激活（Lite 16B/2.4B），共见 10.2T token、338 种语言、128K 上下文；Python HumanEval 90.2%（GPT-4o 为 91.0%）、多语言平均 75.3%；Aider 73.7% 全场第一；SWE-Bench 12.7%（首个开源破 10%）；MATH 75.7%。

### 3\. DeepSeek-V2.5：通用与代码的第一次融合

2024 年 9 月 5 日版本发布，无独立论文。将 V2-Chat 通用对话能力和 Coder-V2-Instruct 代码能力合并进同一模型。验证了假设：MoE 架构天然适合能力融合——从 V2.5 开始，一个模型就够了。

> ⚠️ 本地无独立解读，此节内容依据腾讯云文章。

\---

## 六、阶段五：登顶——从 V3 到 R1 的跃迁（2024.12–2025.01）

### 1\. DeepSeek-V3：671B 参数、2.788M GPU 小时（第二个分水岭）

2024 年 12 月（技术报告 arXiv:2412.19437）。核心数据：671B 总参数、37B 激活、14.8 万亿 token 预训练、仅 2.788M H800 GPU 小时（约 557 万美元），训练全程无不可恢复的 loss spike、无需回滚。

三大技术突破：

1. **辅助损失无关的负载均衡**——去掉辅助损失，改用动态偏置项，解开负载均衡与模型性能的耦合；
2. **多 token 预测（MTP）**——一次预测后续多个 token，提升训练效率与规划能力；
3. 系统工程：**DualPipe** 双流水线并行、**FP8** 混合精度训练（首次大规模实现，几乎无精度损失）、跨节点 All-to-All 通信优化。

**印证**：[DeepSeek-V3论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/1544af22-72de-4ae0-b132-44d8dfd1b41d)——训练成本 2.788M H800 GPU 小时 ≈ 557.6 万美元；Chat 版 MMLU 88.5、MATH-500 90.2、AIME 2024 39.2、SWE-Verified 42.0、Arena-Hard 85.5（首个开源破 85）；C-SimpleQA 64.8，超过 Qwen2.5-72B 达 16.4 分（GPT-4o 为 59.3）；无辅助损失消融在 3B MoE 模型上验证损失 2.080，低于序列级辅助损失的 2.085；MTP 第二 token 接受率 85%–90%、投机解码加速 1.8 倍。

### 2\. DeepSeek-R1：纯强化学习的推理突破（第三个分水岭）

2025 年 1 月（论文 arXiv:2501.12948）。核心发现：**推理能力可通过纯 RL 涌现，无需人类标注推理轨迹**——R1-Zero 自发涌现自我反思、自我验证、动态策略适应等行为。用 R1 生成的推理轨迹蒸馏小模型，7B 模型也能获得可观推理能力。从 R1-Zero 到 R1 的配方：冷启动（少量高质量思维链 SFT）+ 推理导向 RL + 拒绝采样 + 通用 RL。

**印证**：[DeepSeek-R1论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/3f61e41b-ee88-4e07-9f02-5aa3564e37aa)——R1-Zero 的 AIME 2024 pass@1 从 15.6% 涨到 77.9%，cons@16 达 86.7%（超人类平均）；Dev2（第一阶段 RL 后）AIME 74.0，仍低于 R1-Zero 的 77.9；最终 R1：AIME 79.8、MATH-500 97.3、Codeforces 2029（96.3 百分位）、GPQA-Diamond 71.5、SWE-Verified 49.2；蒸馏的 R1-Distill-Qwen-1.5B 在 AIME 28.9、MATH-500 83.9，超过 GPT-4o（AIME 9.3）；训练成本 R1-Zero 64×8 H800 约 198 小时、R1 约 80 小时。

### 3\. DeepSeek-V3.1：混合推理架构的诞生

2025 年 8 月 21 日版本发布，无独立论文。核心架构：**混合推理架构**——同一模型同时支持"思考模式"和"非思考模式"，解决"什么场景用什么模型"的选择难题，是从"推理模型"到"推理 Agent"的关键转变。

> ⚠️ 本地无独立解读，此节内容依据腾讯云文章。

\---

## 七、阶段六：深耕——形式化证明与数学推理 2.0（2025.04–2025.11）

### 1\. DeepSeek-Prover-V2：让 AI 学会形式化证明

2025 年 4 月（论文 arXiv:2504.21801）。核心创新是**递归证明管线**：V3 把定理分解为子目标 → Prover-V2 独立证明 → 反馈指导下一步分解。

**印证**：[DeepSeek-Prover-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d4e11da7-34f1-494a-b2aa-e2c29d2f33b6)——MiniF2F-test（test 集 244 题）Pass@8192：671B CoT 88.9%（新 SOTA）、7B 82.0%，分项 IMO 10/20、AIME 14/15、MATH 代数 70/70；PutnamBench 解出 47/658（STP 仅 7、Goedel-Prover 仅 6）；以"V3 思维链 + 完整证明"做冷启动数据，GRPO + 一致性奖励强化。

### 2\. DeepSeek-OCR：视觉作为文本压缩介质

2025 年 10 月（论文 arXiv:2510.18234）。3B 开源 OCR 模型。核心观点：**视觉模态可作为文本信息的高效压缩介质**。架构创新：DeepEncoder 专门针对 OCR 场景的视觉压缩管线，支持极端分辨率。

**印证**：[DeepSeek-OCR论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/bd281d77-a892-4ec6-913d-54a53eed1836)——一页 1000 词的文档压进 64/100 个视觉 token 仍可高精度解码；压缩率 10 倍以内精度约 97%、10–12 倍约 90%、20 倍约 60%；OmniDocBench 上 Small（100 token）0.221，超过用 256 token 的 GOT-OCR2.0（0.287）；Large 版（400/285 配置）追平 SOTA；Gundam（795 token）0.127 超 MinerU2.0（6790 token）0.133，token 数仅其约八分之一；数据 70% OCR（3000 万页）+ 20% 通用视觉 + 10% 纯文本。

### 3\. DeepSeekMath-V2：自验证的数学推理

2025 年 11 月（论文 arXiv:2511.22570）。核心突破：**自验证推理**——模型不仅要给出答案，还要能验证自己的推理过程（训练验证器 + 生成器协同循环）。

**印证**：[DeepSeekMath-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/b8370196-01b6-4944-8607-548e910881ba)——高算力搜索下 IMO 2025 解出 5/6（83.3%，金牌水平）、CMO 2024 73.8%（金牌水平）、Putnam 2024 118/120（人类最高分 90）；元验证把验证器分析质量从 0.85 提到 0.96；IMO-ProofBench 基础集 99.0%（DeepMind DeepThink 为 89.0%）；搜索配置 64 证明 × 64 验证、最多 16 轮。

\---

## 八、阶段七：进化——稀疏注意力与架构的未来（2025.12–2026.01）

### 1\. DeepSeek-V3.2：稀疏注意力与 Agent 能力

2025 年 12 月（论文 arXiv:2512.02556）。核心架构创新 **DeepSeek Sparse Attention（DSA）**：闪电索引器快速检索相关 token + 细粒度 token 选择，复杂度接近线性。Agent 能力系统提升：1800+ 不同环境和 85000 个复杂提示的合成数据，在合成数据上做 RL 并泛化到真实场景。成果：推理基准上与 Kimi-k2-thinking 和 GPT-5 持平；V3.2-Speciale 在 IOI 2025、ICPC World Final 2025、IMO 2025 达到金牌水平。

**印证**：[DeepSeek-V3.2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/bf9994f4-68f5-444e-a54b-34237f5dffd7)——DSA 每 query 选 top-2048 KV token，预热阶段 1000 步/2.1B token、稀疏阶段 15000 步/943.7B token；RL 后训练算力超过预训练成本的 10%；Speciale：ICPC WF 2025 解出 10/12 题、金牌、排名第 2；IMO 2025 35/42 金牌、CMO 2025 102/126 金牌、IOI 2025 492/600 金牌（第 10）；其中 IOI/ICPC 无针对性训练，IMO/CMO 金牌系融入 DeepSeekMath-V2 的证明技术；V3.2(Thinking) AIME 2025 93.1、SWE-Verified 73.1、Codeforces 2386。

> 📌 修正说明：腾讯云文章时间线表格把 V3.2 标注在 2024.12，按其 arXiv 编号（2512.02556）应为 \*\*2025 年 12 月\*\*，本文已修正。

### 2\. Engram：条件记忆——稀疏性的新轴

2026 年 1 月（论文 arXiv:2601.07372）。核心概念：**条件记忆**——N-gram 嵌入的现代化版本，实现 O(1) 静态知识查找。关键发现：

* **U 形缩放定律**：MoE 计算和 Engram 记忆之间存在最优分配比例；
* 知识检索任务提升：MMLU +3.4、CMMLU +4.0；推理任务提升更大：BBH +5.0、ARC-Challenge +3.7；
* 解放骨干网络早期层，释放注意力容量。

未来方向：**MoE（动态推理）+ Engram（静态知识）混合体**。

**印证**：[Conditional Memory论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/0fc2d2f1-496a-4580-8403-3fd861809e9f)——Engram-27B vs 同参数同 FLOPs 的 MoE-27B：MMLU 60.4（+3.0）、CMMLU 61.9（+4.0）、BBH 55.9（+5.0）、HumanEval 40.8（+3.0）；Multi-Query NIAH 97.0 vs 84.2；**U 形缩放定律为"中间好、两头差"——纯 MoE 与重记忆都不是最优，最优分配约 ρ≈75%–80%（2e20/6e20 两算力档都成立）**；Engram-40B 把记忆表从 5.7B 扩到 18.5B（总参数 39.5B），性能继续上涨；100B 参数表放宿主内存开销不到 3%。

> 📌 修正说明：腾讯云文章此处有笔误（"两头好、中间差"），正确方向是"中间好、两头差"，本文以解读（对照原文 PAGE 8）为准。

### 3\. DeepSeek-OCR 2：视觉因果流

2026 年 1 月（论文 arXiv:2601.20552）。核心创新：**DeepEncoder V2**——用 LLM 风格架构替代 CLIP，通过因果注意力掩码让视觉 token 根据语义动态重排序。核心问题：2D 图像理解能否通过两级级联的 1D 因果推理实现？

**印证**：[DeepSeek-OCR 2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d8d2263e-91bb-4910-abd1-b98bc978cbc7)——DeepEncoder 里的 CLIP 换成 LLM 结构（Qwen2-0.5B），用可学习的因果流查询 token 重排视觉 token；OmniDocBench v1.5 整体 91.09%（上一代 87.36%），且用全场最小的视觉 token 上限 1120；阅读顺序编辑距离 0.057（上一代 0.085）；整体 ED 0.100 优于同 token 预算的 Gemini-3-Pro 0.115。

\---

## 九、阶段八：里程碑——V4 与百万 token 上下文（2026.04）

### 1\. V4 核心数据

技术报告《DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence》2026 年 4 月 24 日发布（无 arXiv 编号，仅 HuggingFace PDF）。两个型号全面开源：**V4-Pro** 1.6 万亿总参数、49B 激活、61 层；**V4-Flash** 2840 亿总参数、13B 激活、43 层。**100 万 token 上下文**；训练数据从 V3 的 14.8T 翻倍至 32–33T token；KV Cache 仅为 V3.2 的 10%，单 token FLOPs 仅 V3.2 的 27%。

### 2\. 三大架构升级

1. **mHC（Manifold-Constrained Hyper-Connections）**——解决 Hyper-Connections（HC）的数值不稳定和硬件开销问题：把残差映射矩阵约束到双随机矩阵流形（Birkhoff polytope），用 Sinkhorn-Knopp 迭代实现流形投影，wall-time 开销仅 6.7%；
2. **混合注意力架构——CSA + HCA 交替**：CSA（Compressed Sparse Attention）做 token 级精细检索，HCA（Heavily Compressed Attention）每 128 个 token 压成 1 个做 dense attention；配合 Q/KV Normalization、Partial RoPE、Sliding Window Attention；
3. **Muon 优化器替代 AdamW**——基于矩阵正交化的优化器，只优化 2D 参数矩阵，DeepSeek 自研 hybrid Newton-Schulz 迭代版本。

### 3\. Engram 推测

Engram（条件记忆）未进入 V4，推测留给 V5。DeepSeek 选择稳健路线：V4 先验证 mHC 和混合注意力。

**印证**：[DeepSeek-V4论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d3ce711f-80cf-45f1-814c-98e037d20a37)——Pro/Flash 各训 33T/32T token、原生 1M 上下文；1M 场景下 Pro FLOPs 为 V3.2 的 27%、KV cache 为其 10%，Flash 更低（FLOPs 10%、KV cache 7%）；SWE Verified 80.6，与 Gemini-3.1-Pro 并列（Opus-4.6-Max 为 80.8）；SimpleQA-Verified 57.9、MMLU-Pro 87.5、GPQA 90.1、Codeforces 3206（人类榜第 23）、Putnam-2025 120/120、MRCR 1M 83.5（Gemini 76.3）；**Muon 并非"放弃 AdamW"——embedding、预测头、mHC 静态偏置/门控因子、RMSNorm 权重仍保留 AdamW**。

\---

## 十、三条技术主线

### 主线一：架构效率——如何用更少的计算做更多的事

> Dense（DeepSeek LLM 67B）→ MoE 原型（DeepSeekMoE）→ MLA+MoE（V2）→ MLA+MoE+无辅助损失+MTP（V3）→ 稀疏注意力 DSA（V3.2）→ 混合注意力 CSA+HCA + mHC 残差（V4）→ 条件记忆 Engram（V5）

* Dense → MoE = 参数效率（[DeepSeekMoE论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/40a59180-cca9-4609-b47c-5d96827f61a6)）
* MLA = 推理效率（[DeepSeek-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/47b7f210-2ebd-481f-8b39-507d1b0602fe)）
* 无辅助损失 = 训练效率（[DeepSeek-V3论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/1544af22-72de-4ae0-b132-44d8dfd1b41d)）
* DSA / CSA+HCA = 长上下文效率（[DeepSeek-V3.2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/bf9994f4-68f5-444e-a54b-34237f5dffd7)、[DeepSeek-V4论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d3ce711f-80cf-45f1-814c-98e037d20a37)）
* mHC = 深层训练稳定性（[DeepSeek-V4论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d3ce711f-80cf-45f1-814c-98e037d20a37)）
* Engram = 知识存储效率（[Conditional Memory论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/0fc2d2f1-496a-4580-8403-3fd861809e9f)）

### 主线二：推理能力涌现

> GRPO（DeepSeek-Math）→ 纯 RL 推理涌现（R1-Zero）→ 冷启动 + 多阶段 RL（R1）→ 递归证明（Prover-V2）→ 混合推理架构（V3.1）→ 自验证推理（DeepSeekMath-V2）→ Agent 推理（V3.2）

对应解读：[DeepSeekMath论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/ae5cb8c5-5491-4b93-882b-ef00cb3c9b60)、[DeepSeek-R1论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/3f61e41b-ee88-4e07-9f02-5aa3564e37aa)、[DeepSeek-Prover-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d4e11da7-34f1-494a-b2aa-e2c29d2f33b6)、[DeepSeekMath-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/b8370196-01b6-4944-8607-548e910881ba)、[DeepSeek-V3.2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/bf9994f4-68f5-444e-a54b-34237f5dffd7)。（V3.1 无独立解读，依据腾讯云文章）

### 主线三：多模态统一

> 独立视觉编码（DeepSeek-VL）→ 理解/生成解耦（Janus）→ 自回归 + Flow 统一（JanusFlow）→ 解耦架构规模化验证（Janus-Pro）→ MoE 视觉-语言（DeepSeek-VL2）→ 视觉压缩 + DeepEncoder（DeepSeek-OCR）→ 视觉因果流（DeepSeek-OCR 2）

对应解读：[DeepSeek-VL论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/b8646de8-3a3f-4ba5-9f19-dd921b92ed26)、[Janus系列论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/93c06ca7-2e56-43be-9ccb-16f8fcee5b7e)、[DeepSeek-VL2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/2d2737f5-8df5-47c0-87af-89bb75d11a31)、[DeepSeek-OCR论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/bd281d77-a892-4ec6-913d-54a53eed1836)、[DeepSeek-OCR 2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d8d2263e-91bb-4910-abd1-b98bc978cbc7)。

\---

## 十一、DeepSeek 方法论（四条原则）

1. **效率至上，不堆算力**——每一代模型都追求"用更少的计算做更多的事"；
2. **解耦优于统一**——当两个需求存在张力时，解耦通常优于妥协（Janus 系、Engram 双轴稀疏都是例证）；
3. **涌现优于监督**——创造正确的条件让能力自发涌现，而不是硬教（R1-Zero 是最纯粹的一例）；
4. **系统思维，而非单点优化**——模型、系统和硬件是同一个问题的不同面（V3 的 DualPipe/FP8 是典型）。

\---

## 附录 A：本地文件清单与 arXiv 映射

本地工作区共 19 个引用文件：18 篇论文解读 + 本文使用的核对结论（见附录 C 出处）。以下为解读文件与论文/arXiv 的对应关系（arXiv 编号以腾讯云文章为准）：

|解读文件|对应论文/版本|arXiv|
|-|-|-|
|[DeepSeek-Coder论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/c078fd54-074f-4c45-bdaf-9099ba71f455)|DeepSeek-Coder|2401.14196|
|[DeepSeekLLM论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/63c7b4cb-0700-47c8-abc5-e26b2fba7c1b)|DeepSeek LLM|2401.02954|
|[DeepSeekMoE论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/40a59180-cca9-4609-b47c-5d96827f61a6)|DeepSeekMoE|2401.06066|
|[DeepSeekMath论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/ae5cb8c5-5491-4b93-882b-ef00cb3c9b60)|DeepSeek-Math|2402.03300|
|[DeepSeek-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/47b7f210-2ebd-481f-8b39-507d1b0602fe)|DeepSeek-V2|2405.04434|
|[DeepSeek-Coder-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/22094a12-b5ba-45c6-bae4-d527abd1904a)|DeepSeek-Coder-V2|2406.11931|
|[DeepSeek-VL论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/b8646de8-3a3f-4ba5-9f19-dd921b92ed26)|DeepSeek-VL|2403.05525|
|[DeepSeek-VL2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/2d2737f5-8df5-47c0-87af-89bb75d11a31)|DeepSeek-VL2|2412.10302|
|[Janus系列论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/93c06ca7-2e56-43be-9ccb-16f8fcee5b7e)|Janus / JanusFlow / Janus-Pro（三篇合一）|2410.13848 / 2411.07975 / 2501.17811|
|[DeepSeek-V3论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/1544af22-72de-4ae0-b132-44d8dfd1b41d)|DeepSeek-V3|2412.19437|
|[DeepSeek-R1论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/3f61e41b-ee88-4e07-9f02-5aa3564e37aa)|DeepSeek-R1|2501.12948|
|[DeepSeek-Prover-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d4e11da7-34f1-494a-b2aa-e2c29d2f33b6)|DeepSeek-Prover-V2|2504.21801|
|[DeepSeek-OCR论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/bd281d77-a892-4ec6-913d-54a53eed1836)|DeepSeek-OCR|2510.18234|
|[DeepSeekMath-V2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/b8370196-01b6-4944-8607-548e910881ba)|DeepSeekMath-V2|2511.22570|
|[DeepSeek-V3.2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/bf9994f4-68f5-444e-a54b-34237f5dffd7)|DeepSeek-V3.2|2512.02556|
|[Conditional Memory论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/0fc2d2f1-496a-4580-8403-3fd861809e9f)|Engram（条件记忆）|2601.07372|
|[DeepSeek-OCR 2论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d8d2263e-91bb-4910-abd1-b98bc978cbc7)|DeepSeek-OCR 2|2601.20552|
|[DeepSeek-V4论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/d3ce711f-80cf-45f1-814c-98e037d20a37)|DeepSeek-V4（含 mHC）|无 arXiv，HuggingFace PDF（mHC: 2512.24880，并入此解读）|

未纳入解读、本文仅依据腾讯云文章的节点：**V2.5**（2024.09）、**V3.1**（2025.08）——两者均为无独立论文的版本发布。

## 附录 B：完整时间线（按文章）

2023.11 Coder → 2023.11 LLM → 2024.01 MoE → 2024.02 Math → 2024.03 VL → 2024.05 **V2** → 2024.06 Coder-V2 → 2024.09 V2.5 → 2024.10 Janus → 2024.11 JanusFlow → 2024.12 VL2 → 2024.12 **V3** → 2025.01 **R1** → 2025.01 Janus-Pro → 2025.04 Prover-V2 → 2025.08 V3.1 → 2025.10 OCR → 2025.11 Math-V2 → 2025.12 **V3.2** → 2025.12 mHC → 2026.01 Engram → 2026.01 OCR 2 → 2026.04 **V4**

## 附录 C：修正与口径说明

1. **V3.2 时间**：腾讯云文章正文把 V3.2 标注为 2024.12，按其 arXiv 编号 2512.02556 应为 2025 年 12 月，本文修正。
2. **Engram U 形定律**：腾讯云文章写成"两头好、中间差"，对照论文（PAGE 8）应为"中间好、两头差"（最优分配约 ρ≈75%–80%），本文修正。
3. **数字口径**：本文所有引用的数字以解读为准（解读此前已逐条对照 PDF 原文核对修正，涉及绝对化表述与数值归属，如 V3 的 C-SimpleQA 归属、V3.2 Speciale 的 IMO/CMO 金牌归因于 Math-V2 技术、V4 的 Muon 保留 AdamW、R1 的 86.7% 为 cons@16、OCR 追平 SOTA 的是 Large 版等）；腾讯云文章与解读不一致处，以解读为准。
4. **Janus 系列**：本地为合并解读（Janus/JanusFlow/Janus-Pro 三篇合一），引用统一指向 [Janus系列论文解读.md](https://downstream.jbbtoken.cn/community-v2/posts/93c06ca7-2e56-43be-9ccb-16f8fcee5b7e)。

