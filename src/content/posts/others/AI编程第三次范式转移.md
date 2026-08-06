---
title: "AI编程第三次范式转移"
published: "2026-07-06"
category: "others"
lang: "zh"
draft: false
tags: ["编程", "Agent", "成本"]
---

# 别再跟AI"聊天"写代码了：编程Agent的第三次革命已经来了

2026年7月底，PSPDFKit创始人Peter Steinberger在X上发了一条帖子："我们还在谈Loop，还是已经转向Graph了？"截至7月28日，这条帖子收获了约307万次浏览。六周前，他刚用"不要亲自提示Agent，要设计能提示它的循环"把Loop Engineering送上热搜。六周后，他自己亲手宣告了Loop的过时。这个速度，连他自己都调侃"根本来不及学"。

这不是又一个技术黑话的轮回。它背后是AI编程工具正在经历的第三次范式转移。

## 发生了什么

AI编程的三次范式转移，用大白话说就是：第一次，AI帮你"接下半句"（2021年Copilot的代码补全）；第二次，AI变成你的"聊天搭子"（2023年Cursor的对话式IDE）；第三次，AI直接"自己干活"（2025-2026年Claude Code、Codex等终端Agent）。

而Peter说的"Loop到Graph"，是第三次革命内部的又一次架构升级。Loop是单个Agent反复"写代码→跑测试→改bug→再跑"的循环；Graph则是多个Agent像流水线一样分工协作——有的负责规划，有的负责写码，有的负责审查，节点之间可以并行、回退、交接。7月24日发表在Nature Machine Intelligence上的一项研究（覆盖260种配置、六类基准）证实：多Agent协作在金融任务上最高提升80.8%，但在某些场景反而下降70%。换句话说，Graph不是万能药，但方向已经不可逆。

## 为什么是现在

三个变量同时成熟了。

第一，模型够强了。Claude Code搭载Opus 4.8在SWE-bench Verified上跑出88.6%，Codex用GPT-5.5拿到约82.6%。两年前这个数字还在50%附近徘徊。第二，成本打下来了。SemiAnalysis估计Claude Code已占公开GitHub提交的4%，预计2026年底超过20%。第三，产品形态跑通了。7月27日，OpenAI发布GPT-5.6，直接把Codex并入ChatGPT桌面端，编码Agent不再是独立产品，而是"超级应用"的一个能力层。与此同时，Google在6月18日关停了免费的Gemini CLI，用闭源的Antigravity CLI替代——免费午餐结束了，但Agent入口之争反而更激烈。

## 横向看对比

说人话版选型指南：

- **Cursor**（Pro $20/月）：适合大多数人。它本质是一个"变聪明了的VS Code"，Tab补全丝滑，日常编码体验最好。但超过20个文件的自主任务容易翻车。
- **Claude Code**（$20-200/月）：适合"大工程"。终端里跑，200K上下文，跨文件重构能力目前最强。你当项目经理，它当程序员。
- **Codex**（$20-200/月）：适合"甩手掌柜"。任务丢到云沙箱并行跑，最后审PR就行。你当产品经理，它当整个开发团队。
- **Copilot**：适合不想折腾、已在GitHub生态里的团队，低侵入接入。
- **OpenCode**（MIT开源免费）：适合预算敏感、在意隐私、想接本地模型的开发者，"开源界的Claude Code"。

我的判断：如果只选一个，Cursor；如果选两个，Cursor加Claude Code或Codex。纯终端党直接Claude Code。

## 谁该关心

**开发者**：不会用Agent的程序员，和不会用搜索引擎的程序员，差距会越拉越大。但别迷信基准分数——Anthropic自己的数据显示，Agent模式Token消耗是聊天模式的4倍，多Agent系统是15倍。烧钱是真实的。

**普通用户**：短期内跟你关系不大，但软件产出速度在加快，你用的App更新会越来越频繁。

**企业**：该认真评估了。GitHub Actions工作日执行已超4000万次任务。但注意，Cursor曾曝出CVE-2025-54135漏洞，第三方MCP插件的安全审计不能省。

**谁不适合**：写五行脚本就交差的场景，杀鸡用牛刀；对代码安全性要求极高、不允许任何外部API调用的环境，目前所有云端Agent都不合适。

## 一句话总结

从"AI帮你补全一行代码"到"AI替你交付一个PR"，只用了四年。Loop已死、Graph当立不是口号，是Agent从"单兵作战"走向"团队协作"的必然。下一个问题不是"要不要用Agent"，而是"你准备让几个Agent同时替你干活"。

## 参考资料

- [Loop才火了六周，AI Coding为什么又开始谈Graph？](https://m.tmtpost.com/8088190.html)
- [2025-2026 AI编程Agent横评：Cursor、Claude Code、Copilot、Codex、Gemini CLI到底选谁](https://baijiahao.baidu.com/s?id=1872302664774242524)
- [Claude Code vs Cursor vs Codex vs OpenCode：AI编程工具怎么选](https://juejin.cn/post/7666289945598754831)
- [GPT-5.6正式发布：Codex并入ChatGPT](https://baijiahao.baidu.com/s?id=1871828036478070727)
- [谷歌官宣：Gemini CLI彻底倒下了](https://cloud.tencent.com.cn/developer/article/2686497)
- [2026年AI编码CLI工具终极对比](https://www.oschina.net/comment/news/430624)
