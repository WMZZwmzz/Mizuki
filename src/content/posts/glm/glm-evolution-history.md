---
title: "glm-evolution-history"
published: "2026-07-26"
category: "glm"
lang: "zh"
draft: false
tags: ["发展史", "开源", "MoE"]
---

# 从清华实验室到万亿市值：GLM 进化史里的 16 篇论文与 7 年技术蜕变

2026 年 6 月 17 日，智谱 AI 开源了 GLM-5.2。

753B 参数，1M 上下文，FrontierSWE 74.4%——超过 GPT-5.5 的 72.6%。编码成本只有对方的六分之一。LMArena 盲测全球第二，Design Arena 全球第一。

这是中国开源大模型第一次在多项核心指标上站上世界之巅。

消息传出那天，距离唐杰在清华知识工程实验室（KEG）写下 GLM 第一行代码，已经过去了整整七年。

我花了两周时间，把智谱从 2021 年到 2026 年发表的 16 篇核心论文、7 代模型、8 轮融资、1 次 IPO 全部串了一遍。试图回答一个问题：**一个从知识图谱实验室走出来的学术团队，是怎么在七年内从 BERT 的追随者变成 GPT-5.5 的超越者的？**

答案藏在三条技术主线里。但先让我们从头说起。

---

## 一、奠基：一个"不合时宜"的预训练框架（2019-2021）

### 清华 KEG——知识图谱老兵的新战场

故事要从一个"老派"实验室说起。

清华大学计算机系知识工程组（KEG），负责人唐杰。2006 年，他创建了学术搜索系统 AMiner——一个比 Google Scholar 更懂"学术社交网络"的系统。在知识图谱和数据挖掘领域深耕十余年后，2019 年，唐杰做了一个决定：**把 KEG 的研究重心转向大规模预训练语言模型。**

这个时间点很微妙。2019 年的 NLP 圈，BERT 如日中天，GPT-2 刚刚发布，没人知道 GPT-3 会在一年后炸场。唐杰的团队里，有杜正晓、刘潇、丁铭、董宇晓、郑勤锴——后来 GLM 系列论文的核心作者，全部出自这个实验室。

2019 年，北京智谱华章科技有限公司注册成立。唐杰任首席科学家，刘德兵任董事长，张鹏任 CEO。一家"清华系"AI 公司，正式从学术象牙塔走向产业战场。

### GLM 论文：用"填空"统一 BERT 和 GPT

2021 年 3 月，arXiv 上出现了一篇论文：

> **GLM: General Language Model Pretraining with Autoregressive Blank Infilling**
> Zhengxiao Du, Yujie Qian, Xiao Liu, Ming Ding, Jiezhong Qiu, Zhilin Yang, Jie Tang

这篇论文的核心想法，用一句话说就是：**能不能用一个预训练目标，同时搞定 BERT 擅长的理解和 GPT 擅长的生成？**

当时的格局是这样的：

- **BERT**（自编码）：双向注意力，完形填空式预测单个 token。理解能力强，但生成能力约等于零。
- **GPT**（自回归）：单向从左到右逐词生成。生成流畅，但理解任务偏弱。
- **T5**（span corruption）：编码器-解码器结构，把一段文字损坏再修复。折中方案，但架构复杂。

GLM 的回答是**自回归填空（Autoregressive Blank Infilling）**：随机遮蔽文本中的若干"空（span）"，然后以自回归方式逐个生成被遮蔽的内容。关键设计有两个：

**第一，二维位置编码。** Position ID 1 标记 token 在原文中的位置，Position ID 2 标记 token 在 span 内部的偏移。模型无法预知 blank 的长度，被迫学会真正的泛化。

**第二，Prefix LM 注意力掩码。** 未损坏部分（Part A）用双向注意力，被 mask 的部分（Part B）用单向自回归注意力，Part B 可以关注 Part A，反之不行。

妙处在于：**通过调节空的数量和长度，同一个模型可以退化为类 BERT（单 token 掩码）、类 GPT（整句作为空）、或类 T5（span 条件生成）。** 一个框架，三种范式，全部统一。

实验结论：在相同规模下，GLM 在理解与生成任务上均优于 BERT、T5、GPT。

这篇论文 2022 年正式发表于 ACL——NLP 领域最顶级的会议。但它的真正价值，要到一年后才被完全释放。

---

## 二、破土：千亿参数，完全开源（2022）

### GLM-130B——"别人家的千亿模型"

2022 年 8 月 4 日，清华 KEG 官网上线了一个页面：GLM-130B。

> **GLM-130B: An Open Bilingual Pre-trained Model**
> Aohan Zeng, Xiao Liu, Zhengxiao Du, et al.（共 19 位作者）

1300 亿参数。中英双语。4000 亿 tokens 训练数据（中英文各 2000 亿）。70 层 Transformer，隐藏维度 12288，15 万词表的 icetk 分词器。96 台 DGX-A100 服务器训练。

这些数字在 2022 年意味着什么？GPT-3 是 175B 参数但完全闭源；ERNIE TITAN 3.0 是 260B 但只发论文不放权重。**GLM-130B 是当时全球少数"权重+代码+训练日志+工具包"完全开放的千亿级双语模型。**

更关键的是硬件适配：NVIDIA GPU、海光 DCU、华为昇腾 910、神威超算——全部支持。在"卡脖子"焦虑弥漫的 2022 年，这个选择本身就是一种态度。

性能上，GLM-130B 在英文基准上显著优于 GPT-3 175B（davinci），在中文基准上优于 ERNIE TITAN 3.0。论文后来被 ICLR 2023 接收。

技术上，GLM-130B 确立了后续所有模型的工程基因：RoPE 位置编码、DeepNorm 归一化、GeGLU 激活函数、FP16 混合精度训练、INT4 训练后量化。这些选择后来被 ChatGLM 系列完整继承。

### CodeGeeX——代码赛道的先手棋

2022 年 9 月，几乎与 GLM-130B 同步，KEG 发布了 CodeGeeX：

> **CodeGeeX: A Pre-Trained Model for Code Generation with Multilingual Benchmarking on HumanEval-X**
> Qinkai Zheng, Xiao Xia, Xu Zou, Yuxiao Dong, ... Zhilin Yang, Jie Tang

130 亿参数，8500 亿 tokens 代码语料，覆盖 23 种编程语言。配套提出了 HumanEval-X 多语言评测基准（Python、C++、Java、JavaScript、Go）。

这是国内最早开源的多语言代码生成大模型之一。论文发表于 KDD 2023。更重要的是，它证明了 GLM 架构不仅能做自然语言，还能做代码——这条线后来演化为 GLM-4 时代的核心竞争力。

---

## 三、燎原：6B 参数引爆中国开源社区（2023 上半年）

### ChatGLM-6B——"消费级显卡上的大模型"

2023 年 3 月 14 日。ChatGPT 发布刚过 100 天。

智谱开源了一个只有 62 亿参数的对话模型：ChatGLM-6B。28 层 Transformer，隐藏维度 4096，32 个注意力头，约 1T tokens 中英双语预训练数据。从 GLM-130B 知识蒸馏而来。

参数不大，但意义炸裂。

**INT4 量化后，6GB 显存就能跑。** 一张 RTX 3060，一台普通游戏本，就能本地运行一个中英双语对话大模型。在 2023 年 3 月，这意味着什么？意味着每一个中国开发者、每一个学生、每一个创业者，都可以零成本拥有自己的"ChatGPT"。

HuggingFace 下载量迅速突破 **1000 万次**。清华 KEG 成为 HuggingFace"最受欢迎 AI 机构"中**国内唯一入选者**。围绕 ChatGLM-6B，社区长出了 LangChain-ChatGLM、本地知识库问答、RAG 应用、Agent 框架——一整个生态。

开源协议也精心设计过：代码 Apache-2.0，模型权重对学术研究完全开放，企业填写问卷登记后允许免费商业使用。这个"学术免费+登记商用"的模式，后来成为国产开源模型的标配。

### VisualGLM-6B——第一次"看见"

2023 年 5 月 17 日，VisualGLM-6B 发布。语言部分 62 亿参数 + 视觉部分，总计 78 亿。视觉端用 BLIP2-Qformer 做图像-语言桥接。Apache 2.0 协议，免费商用。

这是 ChatGLM 系列第一次拥有"眼睛"。虽然以今天的标准看还很初级，但它验证了一件重要的事：GLM 架构可以做多模态。

---

## 四、进化：从"能用"到"好用"的三级跳（2023 下半年）

### ChatGLM2-6B——架构三连跳

2023 年 6 月 25 日，ChatGLM2-6B 发布。参数还是 6B，但内部发生了质变：

**第一跳：Multi-Query Attention（MQA）。** 32 个 Query 头共享 1 套 Key/Value。KV Cache 显存占用断崖式下降。这个设计后来成为国产开源模型的标配。

**第二跳：FlashAttention。** 注意力计算加速，显存读写大幅减少。

**第三跳：纯 RoPE 位置编码。** 从 GLM 原始的 2D 旋转位置编码简化为标准 RoPE，为后续长上下文扩展铺平道路。

预训练数据从 1T 升级到 1.4T tokens。上下文从 2K 扩展到 32K（7 月 31 日另发 32K 专版）。推理速度提升 42%。

性能跃升是惊人的：MMLU 从 40% 到 47%（+23%），C-Eval 从 36% 到 51%（+33%），GSM8K 从 7% 到 55%（**+571%**）。

6B 参数，做到这个程度，在 2023 年中是炸裂的。

### CogVLM-17B——"视觉专家"的诞生

2023 年 10 月 11 日，CogVLM-17B 发布。这是智谱多模态路线的真正起点。

170 亿参数：视觉侧约 11B（5B 图像编码器 EVA2-CLIP-E + 6B 视觉专家部件），语言侧约 7B（基于 Vicuna-7B-v1.5）。

核心创新是**视觉专家模块（Visual Expert）**：在 Transformer 每一层的注意力和 FFN 中，插入独立的 QKV 矩阵和 MLP，专门处理视觉特征。不是简单的"拼接"或"投影"，而是让视觉信息在每一层都拥有自己的"专家通道"。

15 亿图文对预训练。14 项权威评测中 10 项 SOTA、4 项次席。综合成绩超越或持平 PaLI-X 55B——用 17B 参数打赢 55B。单台 3090 就能跑微调。可免费商用。

这个"Visual Expert"架构，后来被 CogVLM2 完整继承，成为智谱多模态技术栈的基石。

### ChatGLM3-6B——Agent 元年

2023 年 10 月 27 日，ChatGLM3-6B 发布。

这一次，重点不在参数和 benchmark，而在**能力边界的扩展**：

**原生函数调用（Function Call）。** 全新设计的 Prompt 格式，支持 YAML 工具注册和结构化工具调用声明。模型不再是"聊天机器人"，而是可以调用外部工具的"智能体"。

**代码解释器（Code Interpreter）。** 模型可以在 Jupyter 环境中执行代码、获取结果、自动连续执行多个代码块直到任务完成。

**Agent 任务。** 通过 tool_registry.py 注册工具，模型自主规划、调用、纠错。

架构上，词表从 130K 精简到 65K，归一化从 LayerNorm 换成 RMSNorm。官方称"10B 以下基础模型中最强性能"。32K 版本 LongBench 平均得分 50.2。

**ChatGLM3 是国产开源模型中第一个原生支持完整工具调用+代码执行+Agent 链路的。** 这个设计直接影响了国内开源社区的 Agent 开发范式，也为 GLM-4 的"All Tools"能力埋下伏笔。

---

## 五、登顶：逼近 GPT-4 的那一年（2024）

### GLM-4——"国产第一梯队"的入场券

2024 年 1 月 16 日，智谱 AI 技术开放日（Zhipu DevDay）。

GLM-4 发布。参数规模未公开。但性能数据是实打实的：

| 基准 | 达到 GPT-4 水平 |
|------|----------------|
| MMLU | 94% |
| GSM8K | 95% |
| MATH | 91% |
| BBH | 99% |
| HumanEval | **100%** |

中文对齐整体超过 GPT-4。128K 上下文 LongBench 超越 Claude 2.1，128K 以内 100% 召回。

更重要的是"All Tools"能力：浏览器、代码解释器、文生图（CogView3），模型自主决定调用哪个工具。网页浏览准确率达到 GPT-4 All Tools 的 116%。

同一天，智谱清言 APP 上线"智能体"创建和分享功能——对标 GPTs。

**GLM-4 标志着智谱从"开源小模型"向"闭源旗舰大模型"的双轨战略转型。** 从这一天起，智谱不再只是"那个做 ChatGLM-6B 的团队"，而是 GPT-4 的直接竞争者。

### GLM-4-9B——开源反击战

2024 年 6 月 5 日，GLM-4-9B 开源。

90 亿参数。128K 上下文。26 种语言。MMLU 74.7%（较 Llama-3-8B 高 8.1 个百分点）。HumanEval 70.1%。MATH 30.4%——**首次在代码和数学上全面超越 Llama-3-8B-Instruct。**

同步发布 GLM-4V-9B（视觉版，支持 1120×1120 高分辨率图像）和 GLM-4-9B-Chat-1M（100 万 token 上下文实验版）。可免费商用。

架构上，GLM-4-9B 完成了从"GLM 填空"到"标准因果语言模型（Causal LM）"的彻底转型：40 层（从 28 层增加），GQA 注意力，SwiGLU 激活，RMSNorm，151K 词表（从 65K 扩展），约 10T tokens 预训练数据。

**这是一个分水岭。** 从 GLM-4-9B 开始，GLM 系列在预训练目标上不再是 2021 年那篇论文的"自回归填空"，而是与 Llama、GPT 同一路线的标准 Causal LM。GLM 的原始创新——那个统一 BERT 和 GPT 的优雅框架——完成了它的历史使命，把接力棒交给了更主流的工程路线。

---

## 六、智能体觉醒：从"对话"到"行动"（2024-2025）

### CogVideoX 与 GLM-PC——多模态全面铺开

2024 年，智谱的多模态版图迅速扩张：

**CogVideoX**：开源视频生成模型。从 2B 基础版到 CogVideoX1.5-5B-SAT，最终实现 10 秒 4K 超清视频生成。

**CogVLM2**（2024 年 5 月）：190 亿参数，8K 上下文，超高清图像解析，中文场景准确率突破 85%。基座换成 Llama-3-8B-Instruct，视觉专家架构升级继承。

**GLM-4-Voice**（2024 年 12 月）：端到端语音交互模型。

**GLM-PC**（2024 年 11 月 29 日）：基于 CogAgent 视觉语言大模型的电脑操作智能体。可以像人类一样操作桌面应用——打开浏览器、填写表单、整理文件、执行多步流程。具备视觉理解、任务规划、自我纠错能力。

### AutoGLM——"边想边干"的免费 Agent

2025 年 3 月 31 日，中关村论坛。智谱发布 AutoGLM 沉思版。

基于 GLM-Z1-Rumination 沉思模型，集深度研究和操作执行于一体。可以打开浏览器、查找资料、分析内容、输出报告。AutoGLM-Phone 在安卓测试中成功率提升超 20%。

**关键决策：免费。** PC 客户端普通用户免费体验，沉思功能在智谱清言多端免费、不限量开放。

这是第一个免费可用的智能 Agent 产品全量上线。在 OpenAI Operator 还在收费、Anthropic Computer Use 还是 API 的时候，智谱选择了"先让所有人用起来"。

### GLM-Z1——推理模型的速度战

2025 年 4 月中旬，智谱一口气发布了 GLM-4-0414 系列和 GLM-Z1 推理模型系列：

**GLM-Z1-Rumination-32B-0414**（沉思版）：32B 参数，深度推理。
**GLM-Z1-AirX**：速度快 8 倍，实测 145 tokens/s。
**GLM-Z1-Flash**：111 tokens/s。

复杂任务准确率较上一代提升 47%。代码评测 89.3 分，函数调用 92.7%。性能逼近 GPT-4o 和 DeepSeek-V3-0324。**推理速度超 DeepSeek-R1 八倍。**

同月，智谱启用全新全球域名 **Z.ai**。MIT 协议全面开源。

32B 参数挑战千亿级性能，速度碾压竞品——这是智谱对"推理模型"的理解：不是更大，而是更快、更聪明、更便宜。

---

## 七、MoE 革命：355B 参数的开源豪赌（2025）

### GLM-4.5——"全球首个原生 Agent 开源模型"

2025 年 7 月 28 日，GLM-4.5 开源。

| 项目 | 数据 |
|------|------|
| 总参数 | **355B（3550 亿）** |
| 激活参数 | ~32B（MoE 架构） |
| 上下文 | 128K token |
| 训练数据 | 15 万亿 token 预训练 + 8 万亿 token 微调 |
| 轻量版 | GLM-4.5-Air：106B 总参 / 12B 激活 |
| 开源协议 | MIT License |

这是智谱第一次做 MoE（混合专家）架构。技术细节值得展开：

**无损平衡路由（Lossless Balanced Routing）**：解决 MoE 经典的负载不均问题。
**QK-Norm**：稳定注意力 logits，防止深层网络训练发散。
**MTP（Multi-Token Prediction）**：一次预测多个 token，配合 EAGLE 推测解码实现 2-3 倍生成加速。
**Slime RL**：异步 Agent 强化学习系统，专门训练模型的"思考-行动"链路。
**Thinking / Non-thinking 双模式**：深度思考和快速响应，一个模型两种人格。

Benchmark 表现：覆盖 MMLU Pro、MATH500、LiveCodeBench、TAU-Bench 等 12 项测试，综合进入全球前三，平均约全球第二。编码和智能体任务接近 Claude-4 Sonnet。Air 版部分推理测试超过 Gemini 2.5 Flash、Qwen-3 235B、Claude 4 Opus。

API 定价：输入 ¥0.8/百万 token，输出 ¥2/百万 token。高吞吐超 100 token/s。

**3550 亿参数 MoE 模型，MIT 协议完全开源。** 这在 2025 年中是一枚重磅炸弹。

### GLM-4.6——200K 上下文的编码利器

2025 年 9 月，GLM-4.6 发布。总参 355B，激活 32B，MoE。上下文从 128K 升级到 **200K**。

核心突破在编码：面向代码生成、调试和智能体工作流深度优化。混合推理机制，可切换快速与深思模式。真实开发任务中接近 Sonnet 4。开源模型中达到 SOTA。

200K 上下文意味着什么？一次读入一个中型代码库，或者一本 500 页的技术文档，然后回答关于其中任何细节的问题。

---

## 八、世界之巅：万亿市值与超越 GPT-5.5（2026）

### 港股上市——"全球大模型第一股"

2026 年 1 月 8 日，港交所。

智谱 AI（02513.HK）正式挂牌。发行价 116.2 港元/股，募资约 43 亿港元。11 家基石投资者合计认购约 29.8 亿港元。保荐人：中金公司。

**全球首家以 AGI 基座模型为核心业务的上市公司。**

上市首日收 130 港元，涨 12%。然后股价开始了一轮令人瞠目的上涨：四个月内从 550 亿港元市值涨至 5700 亿，暴涨 878%。2026 年 6 月 22 日盘中，市值突破**万亿港元**——约 1270 亿美元。

从 2019 年成立到万亿市值，用了七年。从 A 轮 1.52 亿元到万亿港元，8 轮融资累计超 83.6 亿元人民币。投资方名单读起来像一份中国互联网和国资的"名人堂"：美团、蚂蚁集团、腾讯、小米、顺为资本（雷军）、今日资本（徐新）、中关村科学城、珠海华发、杭州城投、成都国资、沙特阿美……

同步推进 A 股科创板 IPO，拟募资 150 亿元。"A+H"双上市平台。

### GLM-5——745B 的新一代旗舰

2026 年 2 月，GLM-5 发布。

| 项目 | 数据 |
|------|------|
| 总参数 | ~745B（7450 亿） |
| 激活参数 | ~44B（MoE） |
| 上下文 | 200K token |
| 开源协议 | MIT |

主打智能体、编程、创意写作与多模态改进。性能对标乃至超越 GPT-5 与 Claude Opus。支持 7 大国产芯片平台（华为、寒武纪、摩尔线程等）。登顶全球开源榜首。

新增 DSA（Dynamic Sparse Attention）动态稀疏注意力，进一步降低长序列推理成本。

### GLM-5.1——"8 小时工作制"

2026 年 4 月 16 日，GLM-5.1 开源。744B 总参，40B 激活。

核心突破：**稳定支撑约 8 小时自主编程。**

SWE-Bench Pro 全球第一。代码综合测评全球第三、国产第一、开源第一。全球综合排名第五、中国第一。

"8 小时工作制"不是一个营销口号。它意味着你可以早上给 Agent 一个复杂的工程任务——比如"重构这个模块并修复所有相关 bug"——然后去开会、吃午饭、做 code review，下午回来时任务已经完成。工程智能体从"写代码"进化到了"修 Bug"。

### GLM-5.2——站上世界之巅

2026 年 6 月 17 日。GLM-5.2 开源。

| 项目 | 数据 |
|------|------|
| 总参数 | **753B**（MoE） |
| 激活参数 | 40B/token |
| 上下文 | **100 万 token（1M）** |
| 单次生成上限 | 12.8 万 token |
| 开源协议 | MIT |
| 配套产品 | ZCode 3.0 编程代理 |

Benchmark 对决 GPT-5.5：

| 基准 | GLM-5.2 | GPT-5.5 |
|------|---------|---------|
| FrontierSWE | **74.4%** | 72.6% |
| PostTrainBench | **34.3%** | 28.4% |
| MCP-Atlas | **76.8** | 75.3 |
| AIME 2026 | **99.2** | — |

LMArena 编码盲测全球第二。Design Arena 全球第一。

**成本：每百万 token $1.4/$4.4（输入/输出）。GPT-5.5 是 $8/$24。六分之一。**

1M 上下文不是噱头。12.8 万 token 的单次生成上限意味着模型可以一口气写完一个完整的中型项目。ZCode 3.0 编程代理配合 1M 上下文，可以吞下整个代码仓库，理解全局架构，然后精准修改。

**这是开源模型第一次在多项核心指标上超越顶尖闭源模型。** 从 2021 年那篇"用填空统一 BERT 和 GPT"的论文算起，到 2026 年超越 GPT-5.5，GLM 走了五年。

---

## 九、路线图总览

把七年时间线压缩成一张表：

| 时间 | 模型/事件 | 参数 | 关键突破 |
|------|----------|------|---------|
| 2021.03 | GLM 论文（ACL 2022） | — | 自回归填空，统一 NLU+NLG |
| 2022.08 | GLM-130B（ICLR 2023） | 130B | 千亿开源双语模型 |
| 2022.09 | CodeGeeX（KDD 2023） | 13B | 23 种编程语言 |
| 2023.03 | ChatGLM-6B | 6.2B | 6GB 显存跑大模型，1000 万下载 |
| 2023.05 | VisualGLM-6B | 7.8B | 首次多模态 |
| 2023.06 | ChatGLM2-6B | 6B | MQA + FlashAttention，推理+42% |
| 2023.10 | CogVLM-17B | 17B | Visual Expert，10 项 SOTA |
| 2023.10 | ChatGLM3-6B | 6B | 原生 Function Call + Code Interpreter |
| 2024.01 | GLM-4（闭源） | 未公开 | 逼近 GPT-4，128K 上下文 |
| 2024.06 | GLM-4-9B（开源） | 9B | 超越 Llama-3-8B，转向 Causal LM |
| 2024.11 | GLM-PC | — | 电脑操作智能体 |
| 2025.03 | AutoGLM 沉思版 | — | 免费 Agent 产品 |
| 2025.04 | GLM-Z1 系列 | 9B-32B | 推理速度超 DeepSeek-R1 八倍 |
| 2025.07 | GLM-4.5（开源） | 355B MoE | 全球前三，MIT 协议 |
| 2025.09 | GLM-4.6（开源） | 355B MoE | 200K 上下文，编码 SOTA |
| 2026.01 | 港股上市（02513.HK） | — | 全球大模型第一股 |
| 2026.02 | GLM-5（开源） | 745B MoE | 对标 GPT-5，国产芯片适配 |
| 2026.04 | GLM-5.1（开源） | 744B MoE | SWE-Bench Pro 全球第一，8 小时自主编程 |
| 2026.06 | GLM-5.2（开源） | 753B MoE | 1M 上下文，超越 GPT-5.5，成本 1/6 |

---

## 十、方法论：三条技术主线

串完 16 篇论文和 7 代模型，我看到三条清晰的技术主线。

### 主线一：从"统一框架"到"工程实用主义"

GLM 的起点是一个优雅的学术想法：用自回归填空统一 BERT 和 GPT。这个想法支撑了 GLM-130B 和 ChatGLM 系列。但到 GLM-4-9B，智谱做了一个务实的决定：**放弃自回归填空，转向标准 Causal LM。**

这不是背叛，而是进化。当模型规模从 6B 扩展到 9B、32B、355B、753B 时，工程生态的兼容性比架构的学术优雅性更重要。vLLM、SGLang、llama.cpp、TensorRT-LLM——所有主流推理框架都为 Causal LM 优化。智谱选择了"融入生态"而非"坚持独特"。

**教训：学术创新的价值在于启动飞轮，而非永远当引擎。**

### 主线二：开源是战略，不是情怀

从 GLM-130B 到 GLM-5.2，智谱的开源从未中断。但开源的内容在变：

- 2022-2023：开源小模型（6B-17B），建立社区和生态
- 2024：开源中模型（9B），闭源旗舰（GLM-4），双轨并行
- 2025-2026：开源旗舰（355B-753B MoE），MIT 协议，无限制商用

为什么 2025 年之后连旗舰都开源了？因为**开源本身就是商业模式**。API 收入来自推理服务，不来自模型权重。开源越大，生态越大，API 调用越多。2025 年 MaaS API 平台 ARR 达 17 亿元，服务超 8000 家机构客户。

ChatGLM-6B 的 1000 万下载量不是情怀，是漏斗顶部。

### 主线三：Agent 是终局

回看时间线，智谱对"智能体"的布局早得惊人：

- 2023.10：ChatGLM3 原生 Function Call + Code Interpreter
- 2024.01：GLM-4 All Tools（浏览器+代码+文生图）
- 2024.11：GLM-PC 电脑操作智能体
- 2025.03：AutoGLM 免费 Agent
- 2025.07：GLM-4.5 "全球首个原生 Agent 开源模型"
- 2026.04：GLM-5.1 "8 小时自主编程"
- 2026.06：GLM-5.2 + ZCode 3.0 编程代理

从"能调用工具"到"能操作电脑"到"能自主工作 8 小时"，每一步都在回答同一个问题：**AI 什么时候不用人盯着也能干活？**

GLM-4.5 的技术报告标题说得很直白：*Agentic, Reasoning, and Coding (ARC) Foundation Models*。推理、编码、智能体——不是三个独立能力，而是一个闭环：推理决定做什么，编码实现怎么做，智能体负责做完。

---

## 尾声：从 KEG 到 Z.ai

2026 年 7 月，智谱港股配售募资 314 亿港元，创年内港股单笔配售新高。科创板辅导验收完成。市值在万亿港元附近波动。

唐杰还是清华教授。KEG 实验室还在。杜正晓、刘潇、董宇晓的名字还挂在论文作者栏里。GLM-5.2 的技术报告（arXiv: 2602.15763）通讯作者一栏，还是那个熟悉的 Jie Tang。

从 AMiner 到 GLM，从知识图谱到万亿参数 MoE，从 6GB 显存的 ChatGLM-6B 到 1M 上下文的 GLM-5.2——这条路走了七年。

七年前那篇论文里有一句话，今天读来依然准确：

> *"We show that GLM achieves superior performance on NLU, conditional generation, and unconditional generation tasks."*

他们确实做到了。不只是"superior performance"，而是站到了世界之巅。

---

## 参考资料

- [GLM: General Language Model Pretraining with Autoregressive Blank Infilling (ACL 2022)](https://arxiv.org/abs/2103.10360)
- [GLM-130B: An Open Bilingual Pre-trained Model (ICLR 2023)](https://arxiv.org/abs/2210.02414)
- [CodeGeeX: A Pre-Trained Model for Code Generation (KDD 2023)](https://arxiv.org/abs/2303.17568)
- [ChatGLM: A Family of Large Language Models from GLM-130B to GLM-4](https://arxiv.org/abs/2406.12793)
- [CogVLM: Visual Expert for Pretrained Language Models (NeurIPS 2024)](https://arxiv.org/abs/2311.03079)
- [CogVLM2: Visual Language Models for Image and Video Understanding](https://arxiv.org/abs/2408.16500)
- [CogVideoX: Text-to-Video Diffusion Models with An Expert Transformer](https://arxiv.org/abs/2408.06072)
- [CogAgent: A Visual Language Model for GUI Agents](https://arxiv.org/abs/2312.08914)
- [AutoGLM: Autonomous Foundation Agents for GUIs](https://arxiv.org/abs/2411.00820)
- [GLM-4-Voice: Towards Intelligent and Human-Like End-to-End Spoken Chatbot](https://arxiv.org/abs/2412.02612)
- [GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models](https://arxiv.org/abs/2508.06471)
- [GLM-4.5V / GLM-4.1V-Thinking: Scalable RL for Multimodal Reasoning](https://arxiv.org/abs/2507.01006)
- [GLM-5 Technical Report](https://arxiv.org/abs/2602.15763)
- [GLM-130B 官方页面（清华 KEG）](https://keg.cs.tsinghua.edu.cn/glm-130b/)
- [智谱 AI 港股上市报道（China Daily）](http://www.chinadaily.com.cn/a/202606/23/WS6a3a26dea310986e2b4616dc.html)
- [GLM-5.2 开源发布：753B 参数打赢 GPT-5.5](https://stable-learn.com/zh/glm-5-2-open-source-release/)
- [智谱 GLM-5.1 登顶全球基准](https://www.sohu.com/a/1009916636_122459916)
- [Zhipu AI Launches GLM-4.5 (Pandaily)](https://pandaily.com/zhipu-ai-launches-glm-4-5-an-open-source-355-b-ai-model-aimed-at-ai-agents)
- [GLM-4.6: An Open-Source AI for Coding (Intuition Labs)](https://intuitionlabs.ai/articles/glm-4-6-open-source-coding-model)
- [智谱 AI 融资与估值（Caixin）](https://www.caixinglobal.com/2025-03-13/chinese-start-up-zhipu-ai-raises-207-million-funding-in-less-than-a-month-102297925.html)
