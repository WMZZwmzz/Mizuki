---
title: "小米 MiMo-VL：7B 掀翻 78B"
published: "2026-07-28"
category: "mimo"
lang: "zh"
draft: false
tags: ["多模态", "视觉", "推理", "GRPO"]
---

# 小米 MiMo-VL 论文解读：7B 小身板掀翻 78B 巨兽，视觉推理的"小米打法"成型

> 论文：*MiMo-VL Technical Report*
> 作者：Xiaomi LLM-Core Team（小米大模型 Core 团队）；arXiv:2506.03569，2025 年 6 月 4 日
> MiMo-7B 的"7B 打 32B"神话言犹在耳，小米转头就把同一套打法搬进多模态：MiMo-VL-7B 在 OlympiadBench 打出 59.4，正面掀翻 72B 的 Qwen2.5-VL-72B 和 78B 的 InternVL3-78B，40 项任务中 35 项碾压 Qwen2.5-VL-7B。一句话：给推理特种兵装上一双借来的眼睛，把省下的算力全砸进数据配比和强化学习配方。

---

## 一、架构：一只借来的眼睛，一副攒出来的大脑

MiMo-VL-7B 是标准三件套：**Qwen2.5-ViT 视觉编码器 + 随机初始化的 MLP projector + MiMo-7B-Base 语言主干**。

- 视觉编码器：32 层、16 头、隐藏维度 1280、中间层 3456、patch size 14、2D RoPE，原生分辨率输入，保细粒度细节；
- 语言主干：36 层、32 头、隐藏 4096、中间层 11008、MRoPE——和 Qwen2.5-VL-7B 的主干不是一回事（后者 28 层、隐藏 3584），MiMo 保住了"又深又宽"的推理配置；
- 部署兼容 `Qwen2_5_VLForConditionalGeneration`，换壳即用；推理支持 32K 上下文，图像像素上限 4096×28×28、视频最长 256 帧（token 上限 16,384），模型卡建议 temperature 0.3、top_p 0.95。

复用成熟编码器不是偷懒而是清醒：视觉编码器已是红海，小米把差异化押在推理主干和训练配方这两个主场。

## 二、四阶段预训练：2.4 万亿 token 的"配餐单"

预训练共 **2.4 万亿 tokens**，四道上菜（来源：报告 Table）：

| 阶段 | 名称 | 数据 | tokens | 序列长 | 训练对象 |
|---|---|---|---|---|---|
| 1 | Projector Warmup | 纯文本 + 图像描述对 | 300B | 8K | 仅 projector |
| 2 | 视觉语言对齐 | 纯文本 + 交错数据 | 167B | 8K | ViT + projector |
| 3 | 通用多模态预训练 | OCR、Grounding、QA、视频、GUI、推理数据 | 1.4T | 8K | 全参数 |
| 4 | 长上下文 SFT | 长文档、高分辨率图、长视频、长推理 | 550B | 32K | 全参数 |

数据侧的手艺：图像描述走 phash 去重 + MetaCLIP 构建双语元数据；交错数据优先教材、百科等"知识密集型"内容；OCR 覆盖文档、表格、公式、手写、变形与遮挡文字；视频生成带时间戳的事件级描述；GUI 用合成引擎补足中文数据，统一 click / scroll / input / drag / open / press / longpress / hover / select / wait 等十一种动作空间——为 Agent 场景提前埋管线。

全文最值钱的洞见：**长 CoT 合成推理数据不是微调"补料"，而是大量塞进预训练后期**。Stage 4 后 MMMU +9、OSWorld-G +14、OlympiadBench +16，MMMU 平均响应 token 从 680 涨到 2500——思考深度是配比配出来的，不是参数堆出来的。

## 三、MORL：把四路教练请进同一个训练场

后训练是全文主角——**混合在线强化学习（MORL）**，一套框架同时优化推理、感知、grounding、人类偏好四类目标。

**RLVR（可验证奖励）**：视觉数学推理（80K 道 STEM 题，Math-Verify 自动判分）、文本推理、图像 grounding（边界框用 GIoU、点看是否命中）、视觉计数与时间视频定位（IoU）。清洗讲究：滤掉证明题、选择题改自由作答防 reward hacking、剔除通过率超 90% 的过易题和纯文本即可作答的题。

**RLHF**：Bradley-Terry 训双奖励模型——文本 RM 从 MiMo-7B 初始化，多模态 RM 基于 MiMo-VL-7B；响应由多个顶级 VLM 生成后两两排序。

工程两亮点：一是 **RaaS**，奖励模型独立部署为 HTTP 服务、按任务动态路由、归一化到 [0,1]、无格式奖励；二是**完全 on-policy 的 GRPO 变体**（单步更新、无裁剪、去 KL loss）+ Seamless Rollout 引擎 + verl。对比 vanilla GRPO：on-policy 无饱和持续上升，而 GRPO 约 2 万样本后进平台期——**慢热但天花板更高**。

遗留问题也诚实交代：推理任务拉长输出、grounding/计数缩短输出，响应长度打架，多域同步稳定提升仍难。

## 四、成绩单：35/40 碾压 Qwen2.5-VL-7B

**数学视觉推理（屠杀现场）**：OlympiadBench 59.4，对手是 Qwen2.5-VL-72B 的 37.2、QVQ-72B 的 20.4、InternVL3-78B 的 12.3；MathVision 60.4、MathVerse 71.5、MathVista 81.5 全线超 72B 级。纯文本 AIME24 67.5、MATH-500 95.4，远超 Qwen2.5-72B（19.4）与 GPT-4o（10.9）。图表文档也不弱：DocVQA 95.7、ChartQA 91.7、InfoVQA 88.0（vs 81.4）。

**GUI**：OSWorld-G 56.1，超 Qwen2.5-VL-7B 的 37.5，还压过 GUI 专用模型 UI-TARS；ScreenSpot-Pro 41.9 vs 29.0；VisualWebBench 80.2。演示里能完成十几步操作把 SU7 加进心愿单。

**感知与文档**：MMMU 66.7（vs 58.6）、CharXiv-RQ 56.5（vs 42.5）、VL-RewardBench 62.7 vs 47.3、CountBench 90.4 vs 74.1、VLMs are Blind **79.4 vs 37.4**；视频方面 Video-MME 67.4、时间定位 Charades-STA 50.0（vs 43.6）。翻车点：OCRBench 被 Qwen（89.7）反超（MiMo 86.6），Video-MMMU 出现 SFT（53.1）高于 RL（43.3）的倒挂——多任务 RL 干扰现出原形。

**Elo 与开源**：内部评测集 + GPT-4o 成对比较，开源 VLM（7B–72B）排名第一，逼近 Claude 3.7 Sonnet，MORL 较 SFT +22 点。权重在 Hugging Face / ModelScope 双平台开源（后出 -2508 版本），社区文章口径 RL 版月下载约千次、SFT 版数百次（待核实），评测框架 lmms-eval 同步开源。说明：论文基线是 Qwen2.5-VL、InternVL3、Gemma-3 一票，**未含 DeepSeek-VL2**，横向对比需另找数据。

## 五、MiMo-Audio-7B：语音界的"GPT-3 时刻"？（独立成篇，附记于此）

常与 VL 并列的 **MiMo-Audio-7B** 出自另一篇论文：*MiMo-Audio: Audio Language Models are Few-Shot Learners*（arXiv:2512.23808）。**注意：报告 2025 年 12 月挂网（待核实），背景资料"与 VL 同期发布"的说法存疑。**

架构自研：1.2B Tokenizer（25Hz、8 层 RVQ、每秒 200 token、1000 万小时语料）+ patch encoder/decoder（4 个时间步聚合到 6.25Hz，LLM 处理效率提升约 4 倍）。预训练超 **1 亿小时**，比当时最大开源语音模型高一个数量级；约 0.7T tokens 后 few-shot 能力从近零飙升，论文称之为语音界的"GPT-3 时刻"。Base 版 SpeechMMLU 四向齐发——语音到语音 69.1（比 Kimi-Audio-Base 高 37 分）、语音到文本 69.5、文本到语音 71.5、文本到文本 72.5，模态差距仅 3.4（Kimi 为 58.9），MMAU 66.0 为开源最佳；Instruct 版带 thinking/non-thinking 双模式，媒体口径称 MMAU 89.7 超 Gemini-2.5-Flash、Big Bench Audio 超 GPT-4o-Audio-Preview（数字待核实）。它还是开源界第一个"语音续写"模型，能生成脱口秀、辩论、直播音轨，并泛化到语音转换、风格迁移、语音编辑等训练数据外的任务。

## 收尾：我的一点看法

最值得学的是**把资源花在差异点上**：编码器借 Qwen2.5-ViT、主干用自家 MiMo-7B、部署兼容 Qwen 架构，处处避开红海，把 2.4T token 的配餐和 MORL 奖励工程打磨到极致。它证明：VLM 军备竞赛里，**"怎么喂、怎么炼"的权重正在超过"堆多大"**。

另一处高含金量是"推理数据前置"——长 CoT 数据炼进基座而非后补，换来 MMMU +9、OlympiadBench +16。这套"把好数据炼进基座"的思路，比任何奖励技巧更根本，也是 MiMo 从文本推理一路赢到多模态的底层方法论。它和 MiMo-7B 的呼应也直白：MORL 的文本推理分支直接复用 MiMo 的数学数据，RaaS 与 Seamless Rollout 引擎同样是文本版 RL 基建的延续——这是一次有传承的降维打击。

局限同样清楚：OCRBench 被反超、Video-MMMU 上 RL 倒挂、多任务干扰未解，且只有理解没有生成。放回发展史，MiMo-VL 是 MiMo 从"纯文本推理"到"会看、会操作"的关键一跃，攒下的 GUI 管线、RaaS 奖励工程、双模态 RM 配方，正是 V2-Omni、V2.5 全模态基座的地基。**一只借来的眼睛 + 一副自家炼的大脑，小米没花一分冤枉钱就挤进了第一梯队。**

## 附：核心数据速查

**基本盘**
| 项目 | 数值 |
|---|---|
| 模型 | MiMo-VL-7B-SFT / MiMo-VL-7B-RL |
| 论文 | arXiv:2506.03569（2025.06.04）；开源于 2025.05.30 |
| 架构 | Qwen2.5-ViT（32L / 1280 / 16H）+ MLP projector + MiMo-7B（36L / 4096） |
| 预训练 | 四阶段共 2.4T tokens（300B / 167B / 1.4T / 550B） |
| 上下文 | 末段 32K；图像上限 4096×28×28，视频最长 256 帧 |
| 后训练 | MORL：RLVR（80K 数学视觉题 + GIoU/IoU 规则）+ RLHF（双 RM），on-policy GRPO + RaaS |

**关键成绩**
- 40 项任务中 **35 项超越 Qwen2.5-VL-7B**
- OlympiadBench 59.4，超 Qwen2.5-VL-72B（37.2）、InternVL3-78B（12.3）
- OSWorld-G 56.1，超 GUI 专用模型 UI-TARS（Qwen2.5-VL-7B 仅 37.5）
- Elo 竞技场开源 VLM（7B–72B）第一；MORL 较 SFT +22 点
- Stage 4 推理数据前置：MMMU +9、OSWorld-G +14、OlympiadBench +16
- MiMo-Audio-7B（arXiv:2512.23808）：1.2B Tokenizer + 7B，>1 亿小时预训练；Instruct 版 MMAU 89.7 超 Gemini-2.5-Flash（媒体口径，待核实）
