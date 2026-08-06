---
title: "MCP协议的Kubernetes时刻"
published: "2026-07-12"
category: "others"
lang: "zh"
draft: false
tags: ["MCP", "Agent", "开源"]
---

# MCP协议交出去那天，AI Agent终于有了自己的"Kubernetes时刻"

2026年7月28日，Anthropic发布了MCP协议问世以来最大的一次修订——版本号直接叫"2026-07-28"，核心变化一句话就能说清：把"状态"这个东西彻底干掉了。与此同时，MCP的SDK月下载量刚刚突破4亿次，Claude连接器目录收录了超过950个服务。一个一年半前还只是Anthropic自家后花园的协议，如今已经是Linux基金会旗下Agentic AI Foundation（AAIF）的旗舰项目，8家铂金会员——AWS、Anthropic、Block、Bloomberg、Cloudflare、Google、Microsoft、OpenAI——坐在同一张桌子上。

这事儿的意义，不亚于2014年Google把Kubernetes捐给CNCF。

## 发生了什么

先说移交。2025年12月，Anthropic把MCP协议的治理权正式交给Linux基金会新成立的AAIF。治理模式从"Anthropic说了算"变成了"理事会决策、项目技术自治"的基金会模式。紧接着2026年初，Google也把A2A协议捐给了同一个基金会。两大Agent协议归于同一个中立屋檐下，这在两年前是不可想象的。

再说升级。2026年7月28日发布的第五版MCP规范，做了一件激进的事：取消initialize握手流程，砍掉Mcp-Session-Id头，每个请求必须自描述。过去MCP的工作方式像"打电话"——客户端先拨号、握手、建立会话，双方保持在线，断线就得重连。现在变成了"寄快递"——你把包裹（请求）往门口一放，快递员（任意服务器实例）取走就能送，不需要你在家等着。新增的Tasks扩展支持轮询和订阅模式，Agent可以把任务丢到云端跑几个小时，回头再来取结果。TypeScript、Python、Go、C#四套SDK已同步适配，Rust版进入Beta。

## 为什么是现在

三个字：不得不。

旧版MCP的有状态设计在本地跑跑没问题，但一旦要上云、要做负载均衡、要过企业级网关，"每个连接都得维持会话"就成了噩梦。你没法用普通的HTTP网关做限流，没法把请求随便路由到任意节点，WAF看不懂你的会话状态。无状态化不是技术洁癖，是生产环境的刚需。

另一个推力是生态膨胀的速度。月下载4亿意味着MCP已经不是"Anthropic的协议"了，它是整个AI工具链的事实标准。当微软Dynamics 365一口气开放65万个接口接入MCP，当华为以金牌会员身份加入AAIF，单一公司主导治理就说不过去了。交给基金会，既是姿态，也是让企业客户放心下单的必要条件——没有哪个CIO愿意把基础设施押在一家公司的善意上。

## 横向看对比

目前Agent通信领域有三大协议，各管一摊：

**MCP**（Anthropic发起，AAIF托管）：解决"模型怎么调用外部工具和数据"。它是AI的USB-C接口——你不管什么品牌的U盘、显示器、充电器，插上就能用。定位是数据与工具层。

**A2A**（Google发起，同属AAIF）：解决"Agent和Agent之间怎么对话"。每个Agent用"Agent Card"亮明身份和能力，任务有完整生命周期，支持跨组织、跨厂商的委托协作。如果说MCP是插头和插座，A2A就是两个公司之间的合同流程。

**ACP**（Zed Industries发起，JetBrains共同维护）：解决"编辑器/终端怎么驱动编码Agent"。默认走JSON-RPC over stdio，会话驱动，能流式返回代码差异和权限请求。它管的是开发工具互操作这一亩三分地。

我的判断：MCP和A2A在AAIF屋檐下融合是大概率事件——协议层已经就绪，剩下的信任层和治理层才是硬仗。ACP则更像垂直领域的补充，短期内不会被吞并。三者的关系不是竞争，是分层：MCP管"手"（操作工具），A2A管"嘴"（Agent间沟通），ACP管"工位"（开发环境集成）。

## 谁该关心

**开发者**：如果你还在用Mcp-Session-Id做硬编码，赶紧迁移。新版要求请求头携带Mcp-Method和Mcp-Name，旧的HTTP+SSE传输已被标记弃用（有12个月缓冲期）。好消息是无状态设计让部署简单了一个量级——不用再操心会话粘性和连接池。

**企业决策者**：MCP进入基金会意味着你不会再被单一供应商锁定。950+连接器、65万个企业接口，加上OAuth 2.0/OIDC对齐的鉴权体系，MCP正在变成企业AI基础设施的"安全选择"。

**普通用户**：短期内你感知不到。但中长期，这意味着你用的AI助手能接入的服务会指数级增长，而且不同AI产品之间的工具生态可以互通——你不再需要因为换了个AI就重新配一遍所有集成。

**谁不适合**：如果你只是做个本地小工具、跑个单机Agent，旧版MCP的有状态模式反而更简单。无状态化是为规模化部署设计的，小场景不必急着追新。

## 一句话总结

Kubernetes让"容器怎么跑"变成了全行业的共识，MCP正在让"AI怎么用工具、Agent怎么协作"变成同样的共识。协议层的故事2026年基本讲完了，接下来真正的硬仗是信任、是治理、是那些协议文本写不进去的东西。但至少，大家终于坐在同一张桌子前了。

## 参考资料

- [MCP协议迎来"史上最大更新"：State彻底消失，Claude率先适配](https://tonybai.com/2026/07/30/mcp-2026-07-28-stateless-core-claude/)
- [MCP vs A2A vs ACP：智能体协议详解](https://casys.ai/zh/blog/mcp-a2a-acp-agent-protocols)
- [开源之道日报：AAIF与MCP治理](https://www.opensourceway.blog/posts/daily-briefing/2026/07/2026-07-10/)
- [MCP最大规模升级：月下载破4亿](https://www.toutiao.com/a7668126755911369216/)
- [MCP+A2A融合：协议层已就绪，信任层才是硬仗](https://cloud.tencent.com/developer/article/2713628)
- [Anthropic的HTTP时刻：MCP第五版全面无状态化](https://www.tmtpost.com/agent/ai-article?id=19475)
