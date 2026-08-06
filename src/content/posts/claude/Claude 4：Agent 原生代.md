---
title: "Claude 4：Agent 原生代"
published: "2026-07-21"
category: "claude"
lang: "zh"
draft: false
tags: ["Agent", "工具使用", "编程", "MCP"]
---

# Claude 4 模型解读：Agent 原生的一代，工具成了生活方式

> 模型：Claude Opus 4 / Claude Sonnet 4（Claude 4 家族）
> 厂商：Anthropic
> 发布日期：2025-05-22（首届开发者大会 "Code with Claude"）
> 定价：Opus 4 $15/$75、Sonnet 4 $3/$15（每百万 token，输入/输出）
> 总览：3.7 Sonnet 在 2025 年 2 月开了混合推理和 Claude Code 的头，三个月后 Claude 4 把这股势头拧成一套系统：扩展思考里能调工具、多个工具并行干活、靠本地文件存长期记忆、Claude Code 正式 GA。Agent 从"一个功能"长成了"一套基础设施"——这是理解 Claude 4 最该抓住的那根线。

---

## 一、引言：Agent 从功能到系统

Claude 4 的发布日期需要先钉死：**2025 年 5 月 22 日，首届开发者大会 "Code with Claude" 官宣**，不是此前流传的 5 月 19 或 21 日。这一天 Anthropic 没发一个模型，而是同时端出两款——旗舰 Opus 4 和均衡款 Sonnet 4，外加一整套 Agent 基础设施。对这家公司来说，这是它第一次把自己的开发者生态完整摊在台面上。

承上启下看：2025 年 2 月的 3.7 Sonnet 定义了混合推理（hybrid reasoning），Claude Code 还是研究预览；三个月后，Claude 4 把两件事同时兑现——推理模式全系标配，Claude Code 转正 GA。官方给这一代的定语是 "setting new standards for coding, advanced reasoning, and AI agents"。前两个词是延续，最后一个词才是重点：**Agent 在 Claude 4 这一代，从"模型顺带有的一个功能"，变成了"为 Agent 而生的系统"。**

## 二、能力与数据拆解：Opus 4 领跑，Sonnet 4 越级

先看旗舰 Opus 4，官方称它"全球最好的编程模型"：

- SWE-bench Verified **72.5%**（真实 GitHub issue 修复）
- Terminal-bench **43.2%**（终端命令行任务）
- GPQA Diamond **82.3%**（扩展思考下），标准模式 **74.9%**
- MMMU **73.7%**（多模态推理）

Sonnet 4 更有意思：SWE-bench Verified 拿下 **72.7%**——**反而压过自家旗舰 Opus 4 的 72.5%**。这不是笔误，官方注释写得很清楚：72.5% 属于 Opus 4，72.7% 属于 Sonnet 4。3.5 Sonnet 越级 Opus 3 的戏码，在 4 代又演了一遍，而且这次是同一代内中档反超旗舰。区别在定位：Opus 4 强在**长程任务**——复杂 agent 工作流里能连续工作好几个小时、执行数千步，Rakuten 拿它跑了 7 小时独立重构；Sonnet 4 强在**性价比**——$3/$15 的价格把 72.7% 的编码能力白送给了生产环境。

两代模型还有个共同改进：**走捷径（shortcut）的行为比 Sonnet 3.7 少了 65%**。所谓走捷径，就是模型为了"完成任务"抄近路、钻漏洞——这在 agent 场景里是大忌，因为没人盯着它干活。少了这个毛病，Claude 4 才能被放心丢进长时间无人值守的工作流。

## 三、关键技术创新：把"干活"做进系统里

这一节的五个点，全是"让 Agent 真正干得动活"的基建。

**扩展思考中调用工具（extended thinking with tool use，beta）。** 以前"思考"和"用工具"是两段式：先想、再干。Claude 4 让两者交错——一边推理一边查网页、跑命令，想清楚了再动手，质量明显更高。

**并行工具调用（parallel tool use）。** 之前工具一次只能调一个，现在可以同时发多个请求。多路并行省的是实打实的 wall-clock time（墙钟时间），对 agent 工作流的延迟改善是直接可见的。

**本地文件记忆（memory files）。** 给 Claude 本地文件访问权后，它可以自己把重要事实写进文件、长期维护——官方演示是它边玩 Pokémon 边记"导航笔记"。跨会话的连续性，第一次靠模型自己动手实现，而不是靠开发者外挂数据库。

**Claude Code 正式 GA。** 研究预览收了半年反馈后转正，新增 VS Code / JetBrains 原生集成（编辑直接显示在文件里）、可扩展 SDK、GitHub 集成（PR 上 @ 它就能响应评审意见）。Claude 从"对话模型"到"生产力工具"的转型，在这一天盖章。

**四个新 API 能力。** 代码执行工具（code execution）、MCP connector（连上任何 MCP 工具生态）、Files API、以及**最长 1 小时的 prompt 缓存**——长对话、长 agent 任务的成本，被这个缓存直接打下来一截。

## 四、意义与影响：Opus 和 Sonnet 的分工

Claude 4 把"档位"从价格标签升级成了**分工逻辑**：Opus 4 是给"几小时无人值守的复杂 agent 任务"准备的，贵得有理；Sonnet 4 是给"日常生产负载"准备的，便宜得也合理。这套分工在后来的 4.1、4.5 系列里被反复沿用，成了 Claude 产品线的底层节奏。

安全上，Claude 4 是 Anthropic 在 **ASL-3 安全分级**下发布的第一代模型——能力越强，部署限制越多，这个信号本身就说明了它的位置。

## 收尾：我的一点看法

Claude 4 真正的分水岭不在 72.5% 或 72.7%，而在"工具"这个词的待遇。3.7 Sonnet 的工具使用还是对话的附属品，Claude 4 把工具使用做进了模型的思考过程本身——扩展思考能调工具、工具能并行、记忆靠文件、生态靠 MCP。**Agent 能力的竞争，从比谁调用得准，变成了比谁的"系统"厚**。Anthropic 在这一代证明自己押注的不是某个模型，而是整套 agent 基建。

Sonnet 4 反超 Opus 4 这个细节，我认为比旗舰成绩更值得琢磨。它意味着 Claude 系列的"档位"从来不是单纯的能力排序，而是"能力/成本/时长"的三维分工：Opus 卖长程可靠性，Sonnet 卖"90% 的能力做到 1/5 的价格"。**"中档越级"不再是偶然，而是 Anthropic 刻意维持的产品节奏**——这个节奏一直延续到 4.5 系列。

当然，72.5% 的 SWE-bench 放到 2026 年回看已不算惊人（Opus 4.5 都破 80 了）。但 Claude 4 打下的那套东西——并行工具、memory files、Claude Code GA、1 小时缓存——至今还是 Claude 系的底层。**模型会过时，系统不会。**

---

## 附：核心数据速查

**Claude 4 家族基本盘**
| 项目 | 数值 |
|---|---|
| 发布日期 | 2025-05-22（首届开发者大会 "Code with Claude"） |
| 定价 | Opus 4：$15 / $75；Sonnet 4：$3 / $15 |
| 上下文长度 | 200K |
| 形态 | 混合推理（标准 + 扩展思考双模式） |
| 安全分级 | ASL-3 |

**关键 benchmark（官方）**
- Opus 4：SWE-bench Verified **72.5%**；Terminal-bench **43.2%**；GPQA Diamond **82.3%**（扩展思考）/ **74.9%**（标准）；MMMU **73.7%**
- Sonnet 4：SWE-bench Verified **72.7%**（同代内反超 Opus 4）
- 走捷径行为较 Sonnet 3.7 减少 65%

**Claude 4 新增 Agent 能力**
- 扩展思考中调用工具（beta）、并行工具调用
- 本地文件记忆（memory files）
- Claude Code 正式 GA（VS Code / JetBrains 集成、SDK、GitHub 集成）
- 四个新 API：代码执行工具、MCP connector、Files API、1 小时 prompt 缓存

**关键概念清单**
- extended thinking with tool use = 扩展思考中调用工具（推理与工具调用交错进行）
- parallel tool use = 并行工具调用（同时发起多个工具请求）
- memory files = 记忆文件（模型把关键信息写入本地文件实现长期记忆）
- Claude Code = 跑在终端/IDE 里的 AI 编码 agent（本代转正 GA）
- code execution tool = 代码执行工具（API 内置的沙箱运行环境）
- MCP connector = 模型上下文协议连接器（接入 MCP 工具生态的接口）
- Files API = 文件接口（让模型读写本地文件的 API）
- prompt caching = 提示缓存（缓存重复前缀省成本，最长 1 小时）
- ASL-3 = AI Safety Level 3（Anthropic 严格安全分级，部署限制更多）
- SWE-bench Verified = 用真实 GitHub issue 评测修代码能力的基准
- GPQA Diamond = 研究生级科学问答基准（生物/物理/化学）
- MMMU = 多模态多学科理解基准
- Terminal-bench = 终端/命令行环境中的任务执行基准
- 走捷径（shortcut）= 模型用漏洞或绕路方式"完成"任务的行为
