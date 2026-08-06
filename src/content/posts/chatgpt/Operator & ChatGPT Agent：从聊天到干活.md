---
title: "Operator & ChatGPT Agent：从聊天到干活"
published: "2026-07-11"
category: "chatgpt"
lang: "zh"
draft: false
tags: ["Agent", "工具使用", "安全", "推理"]
---

# 《Operator & ChatGPT Agent》解读：从"会聊天"到"替我干活"，智能体主线上的两座里程碑

> 论文：《Introducing Operator》官方博客 + 《Computer-Using Agent (CUA)》研究论文/系统卡（2025-01-23）；《Introducing ChatGPT Agent》官方博客（2025-07-17）
> 作者：OpenAI
> 发布背景一句话：Operator 是 OpenAI 第一个"替你在浏览器里干活"的智能体（agent），ChatGPT Agent 半年后把它和 deep research（深度研究）揉进同一个入口，2025-12-12 北京发布会正式大规模发布。这条线把 2025 年钉成"智能体元年"，也为 2026 年 GPT-5.6 的 computer use 与多智能体推理埋下了伏笔。

---

## 一、引言：背景与核心问题

ChatGPT 的第一阶段是"会聊天"，第二阶段是"会推理"（o1、deep research），第三阶段就是"会干活"。2025 年这条主线非常清晰——让模型不再只是吐文字，而是接管一段完整的任务：订餐、填表、网购、写研报。业内管 2025 年叫"智能体元年"，我觉得名副其实。

Operator 发布于 2025-01-23，博客和论文双发。它是 OpenAI 第一个浏览器智能体，背后的模型叫 CUA（Computer-Using Agent，计算机使用智能体）。它的姿势跟人一致：截图看屏幕，用虚拟鼠标键盘去点、去拖、去打字。这跟过去"调 API 的机器人"是完全不同的物种——不需要网站给接口，什么网页都能上。

但单点浏览器 agent 很难用，于是 2025-07-17 的 ChatGPT Agent 把 Operator 和 deep research、ChatGPT 的对话能力缝在了一起，跑在自己专用的"虚拟电脑"上，还配了文本浏览器、可视化浏览器、终端、API 和连接器。2025-12-12 北京发布会大规模发布，说明 OpenAI 把它当成全球化产品在推，而不是实验室玩具。为什么要缝合？因为拆开用都不好用：Operator 分析和总结弱，deep research 又不能真的操作网页。

## 二、方法：架构/数据/训练细节

**CUA 的训练方法**（Operator 系统卡里写得很清楚）：监督学习 + 强化学习两段式。监督学习先教会模型基础的"看图 + 点按"能力——读屏幕、定位按钮、准确点击；强化学习再教更高层的本领：多步推理、纠错、适应意外情况。数据包括公开数据集、网络爬虫，以及人工标注的"人类如何用电脑完成任务"的轨迹。核心循环是感知 → 推理 → 行动：截图进上下文 → 用 chain-of-thought（思维链）想下一步 → 执行点击、滚动、输入，直到任务完成或需要用户介入。

安全分级是 Operator 系统卡里最有价值的设计之一：任务按风险分档。低风险放手让 agent 干；涉及金融交易、发邮件、删日历这类关键动作，必须等用户确认；像买卖股票这种风险太高的，直接禁止。系统卡还专门讨论了 prompt injection（提示注入）——网页里藏恶意指令诱导模型干坏事，这是 agent 类产品独有的攻击面。

产品上的限制当初很实：只有美区 **Pro** 用户能试，速度慢，全程需要人盯着。这些限制不是缺陷，是安全选择——一个全自动替你付款的 agent，出一次错就是灾难。

基准上，CUA 用同一套"屏幕 + 鼠标 + 键盘"通用界面跑通了三类任务：OSWorld（操作系统任务）**38.1%**（前 SOTA 22.0%，人类 72.4%），WebArena（网页任务）**58.1%**（前 SOTA 36.2%），WebVoyager **87.0%**（前 SOTA 56.0%，人类 87.0%）。网页任务追平或接近人类，完整操作系统任务还差得远。

**ChatGPT Agent（2025-07-17）**：统一智能体，跑在自有的虚拟电脑上，工具全家桶包括可视化浏览器、文本浏览器、终端、直接 API 调用、ChatGPT Connectors（连接 Gmail/GitHub 等）。发布形态还包括 agent API（把 agent 能力开放给开发者）。配额很关键：Pro 用户每月 **400** 次 agent 提示，其他付费用户 **40** 次——**10 倍**差距直接暴露了 agent 的算力成本：一次 agent 调用可能顶几十上百次普通对话。OpenAI 还透露，为了做它，把 Operator 和 Deep Research 两个团队合并成了一个 20-35 人的统一团队——组织层面的动作比产品本身更能说明战略权重。

成绩：HLE（Humanity's Last Exam，"人类最后的考试"）pass@1 **41.6%**，是 o3 和 o4-mini 的近两倍，创下 SOTA；用"并行 rollout"策略（最多 8 次试跑，选自我报告置信度最高的结果）还能推到 **44.4%**。FrontierMath（目前最难的数学基准）在能调用终端跑代码的情况下 **27.4%**，吊打此前所有模型。SpreadsheetBench **45.5%**（Excel Copilot 只有 20.0%），BrowseComp **68.9%**（比 deep research 高 17.4 个百分点），DSBench 超过人类平均，WebArena 也优于 o3 驱动的 CUA。

横向比一下：Google 的 Project Mariner、Anthropic 的 computer use 都在同一时间窗口发布。2025 年整个行业不约而同往"操作电脑"方向挤，这本身就说明 agent 是共识，不是 OpenAI 一家的赌注。

## 三、成绩：关键实验数字

- Operator：**2025-01-23** 发布，CUA 模型，美区 Pro 研究预览
- CUA 基准：OSWorld **38.1%** / WebArena **58.1%** / WebVoyager **87.0%**
- ChatGPT Agent：**2025-07-17** 首发，**2025-12-12** 北京大规模发布
- HLE：pass@1 **41.6%**，并行策略 **44.4%**（是 o3/o4-mini 的近两倍）
- FrontierMath：**27.4%**（含终端代码执行）
- SpreadsheetBench：**45.5%**（Excel Copilot 20.0%）
- BrowseComp：**68.9%**（比 deep research 高 17.4 个百分点）
- 配额：Pro **400 次/月**，其他付费 **40 次/月**
- 形态：agent API、自有虚拟电脑、computer use、连接器

## 收尾：我的一点看法

2025 年叫"智能体元年"当之无愧，但元年不等于成熟年。Operator 的体验——慢、要盯、偶尔翻车——说明"能干活"和"可靠地干活"之间隔着一条很长的路。我的判断是：2025 年真正的产品化胜利不是准确率，而是把"用户预期"教育出来了——大家开始习惯"让 AI 替我办事，我来抽查"，这在两年前是不可想象的。

400/40 的配额设计是我最想吐槽的。这数字明明白白告诉你：agent 的成本到现在都没压下来，OpenAI 宁可限次数也不放开算力。反过来想，这也解释了为什么 2026 年的 GPT-5.6 要推 max/ultra 多智能体并行——把多次 agent 调用打包成一次"深度推理"，成本结构就变了。技术演进是被成本逼着走的，这是技术史上最朴素也最常被忽略的规律。

对 CUA 的"截图 + 虚拟操作"路线，我认可但保留。它的鲁棒性太差：网页一改版、弹窗一变，agent 就懵；截图里藏着 prompt injection 也没法根除。未来要么靠更多强化学习堆出来，要么靠浏览器厂商开放原生接口——后者更可靠，但 OpenAI 手里没有浏览器，命门在别人那儿。

最后从发展史的角度说：Operator 和 ChatGPT Agent 的价值不在分数，而在范式。它们证明了"模型 + 工具 + 循环"可以封装成产品，逼着所有同行跟牌。2026 年 GPT-5.6 的 computer use、多智能体并行、甚至 ChatGPT Work，全都能在这两篇里找到源头。所谓元年，指的不是当年有多成熟，而是从那一年开始，路线定了。

## 附：核心数据速查

**关键数字表格**

| 产品 | 日期 | 关键数字 | 备注 |
|---|---|---|---|
| Operator | **2025-01-23** | CUA / 美区 Pro 预览 | 首个浏览器智能体 |
| CUA 基准 | — | OSWorld **38.1%** / WebArena **58.1%** / WebVoyager **87.0%** | 人类：72.4% / 78.2% / 87.0% |
| ChatGPT Agent | **2025-07-17** | HLE **41.6%**（并行 44.4%） | 首发，Pro/Plus/Team 逐步开放 |
| ChatGPT Agent | **2025-12-12** | — | 北京发布会大规模发布 |
| 其他基准 | — | FrontierMath **27.4%**；SpreadsheetBench **45.5%**；BrowseComp **68.9%** | 均显著超此前模型 |
| 配额 | — | Pro **400 次/月**，其他 **40 次/月** | 暴露 agent 算力成本 |

**关键概念清单**
- agent = 智能体（能自主完成多步任务、调用工具的模型应用）
- CUA = Computer-Using Agent（计算机使用智能体）
- computer use = 计算机操作（截图感知 + 虚拟鼠标键盘）
- deep research = 深度研究（多步搜索、阅读、综合成报告）
- chain-of-thought = 思维链（让模型逐步推理的内部过程）
- imitation learning = 模仿学习（监督学习的一种，学人类操作轨迹）
- RL = 强化学习（Reinforcement Learning）
- HLE = Humanity's Last Exam（"人类最后的考试"，跨学科专家级基准）
- prompt injection = 提示注入（网页/输入里藏恶意指令操纵模型）
- OSWorld / WebArena / WebVoyager = 操作系统与网页任务基准
- agent API = 把 agent 能力开放给开发者的接口
- Connectors = 连接器（接入 Gmail、GitHub 等第三方应用）
