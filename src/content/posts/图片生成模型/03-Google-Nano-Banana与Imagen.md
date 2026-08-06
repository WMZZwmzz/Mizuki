---
title: "Nano Banana：独挑大梁的豪赌"
published: "2026-07-26"
category: "图片生成模型"
lang: "zh"
draft: false
tags: ["多模态", "闭源", "图像生成"]
---

# 03 | 谷歌的豪赌:亲手埋葬 Imagen,Nano Banana 能否独挑大梁?

> 报告基准日:2026 年 8 月
> 类型:内部评估简报(分析师视角)
> 关键结论:**Google 已完成图像路线的战略收缩——Imagen 退役,Nano Banana(Gemini 原生视觉)成为唯一官方路径。迁移窗口将于 2026-08-17 关闭。**

## 摘要(Executive Summary)

- **战略动作**:Imagen 4 系列三端点 2026-08-17 停服;官方迁移路径为 Nano Banana 三档产品线。
- **产品矩阵**:NB2(平衡)/ NB Pro(旗舰)/ NB2 Lite(轻量),分别对应 gemini-3.1-flash-image / gemini-3-pro-image / gemini-3.1-flash-lite-image。
- **差异化能力**:视频转图像(仅 NB2)为独家卖点。
- **建议**:存量应用立即启动迁移评估;默认映射 gemini-3.1-flash-image,高要求任务升级 Pro。

## 一、产品矩阵与定位

| 模型 ID | 产品名 | 定位 | GA |
|---|---|---|---|
| gemini-3.1-flash-image | Nano Banana 2 | 主力平衡档 | 2026-05-28 |
| gemini-3-pro-image | Nano Banana Pro | 旗舰(文字/版式/4K) | 2026-05-28 |
| gemini-3.1-flash-lite-image | Nano Banana 2 Lite | 超低延迟、极致性价比 | 2026-06-30 |

## 二、时间线(2026)

| 日期 | 事件 |
|---|---|
| 2025 | gemini-2.5-flash-image 时代("Nano Banana 1")确立多模态原生路线 |
| 05-28 | NB2 与 Pro GA;新增视频转图像(仅 Flash 档) |
| 06-15 | Imagen 4 退役公告(8-17 关闭);Veo 2/3 视频模型 6-30 关闭 |
| 06-24 | Gemini 3.5 Flash Computer Use 预览 |
| 06-30 | NB2 Lite GA;Gemini Omni Flash 视频预览 |
| 07-06 | Interactions API 日志支持 |
| 08-17 | **Imagen 4 正式停服(截止)** |

## 三、能力分层评估

| 档位 | 文字/版式 | 参考图 | 适用 |
|---|---|---|---|
| Lite | 基础 | 少 | 高吞吐批处理 |
| NB2 | 良好 | 中 | 常规生产 |
| Pro | 强(密集文字/多语言/4K) | 最多 14 张 | 专业设计 |

**关键能力**:
- 多模态原生:文生图、图生图、对话式迭代编辑。
- 视频转图像(仅 NB2):视频/YouTube URL → 缩略图、电影海报、摘要信息图。
- 思考水平可调(MINIMAL/HIGH):按任务精度调节成本。

## 四、迁移映射(官方 + Firebase)

| 旧 Imagen | 替代 |
|---|---|
| imagen-4.0-fast | gemini-2.5-flash-image / gemini-3.1-flash-image-preview(MINIMAL) |
| imagen-4.0-generate | gemini-2.5-flash-image / gemini-3.1-flash-image-preview(HIGH) |
| imagen-4.0-ultra | gemini-2.5-flash-image / gemini-3-pro-image-preview |
| imagen-3.0-capability | gemini-2.5-flash-image / gemini-3.1-flash-image-preview |

**迁移要点**:
1. GenerativeModel 替代 ImagenModel;responseModalities=[IMAGE]。
2. Vertex 推荐 global 区域。
3. 选型:默认 NB2;高要求升 Pro;Imagen 4 仅过渡。
4. ⚠️ 各入口停服日期不同(Firebase 6-24、Gemini API 8-17),需逐一核验。

## 五、商业与成本

- 计费:按调用/Token;随分辨率、思考水平、档位变化。
- 接入:Interactions API(推荐)/ generateContent / Vertex / Firebase。
- 生态:AI Studio、Gemini App、Workspace 联动;Computer Use 延伸 Agent 场景。

## 六、SWOT 简析

**S 优势**:多档覆盖;视频转图独家;Google 生态集成;Pro 14 张参考。
**W 劣势**:命名体系复杂;迁移窗口紧;闭源不可本地部署。
**O 机会**:Imagen 退场后迭代提速;Omni Flash 融合"图像-视频"一体化。
**T 威胁**:文字渲染极值略逊 GPT-Image-2;高吞吐依赖 Google 配额。

## 七、决策建议

1. 存量 Imagen 用户:立即迁移,勿拖至 8-17。
2. 成本敏感:MINIMAL 思考档 + Lite。
3. 视频转图:直接传 YouTube URL。
4. 本地/私有化需求:转 Qwen-Image 开源版等替代。

## 八、FAQ

**Q1:Nano Banana 和 Imagen 关系?** 不同路线:Imagen 为旧独立扩散模型,Nano Banana 为 Gemini 原生;Imagen 4 将退役。
**Q2:三档怎么选?** 默认 NB2;强文字/版式/4K 用 Pro;超低延迟批处理用 Lite。
**Q3:视频转图怎么用?** 仅 NB2:传视频或 YouTube URL + 文本提示。
**Q4:停服前必须做什么?** 核对各入口日期 → 迁移代码 → responseModalities=[IMAGE] → 回归测试。
**Q5:思考水平是什么?** MINIMAL(快/省)/ HIGH(精)。
**Q6:支持中文吗?** 支持多语言,Pro 最强。
**Q7:参考图上限?** Pro 最多 14 张。
**Q8:中国区可用吗?** 大陆不可直连,需合规区域与渠道;企业评估 Vertex 区域。

## 九、实施工作流

**A:存量迁移** — 映射表 → 改代码 → 逐场景回归 → 高要求场景试点 Pro。
**B:视频批量转图** — 上传视频/URL → 生成缩略图/海报/摘要图 → 投放。
**C:高吞吐降本** — Lite + MINIMAL → 批量出候选 → 关键物料升 Pro。

## 十、接入要点

| 项 | 说明 |
|---|---|
| 推荐 API | Interactions API |
| 图像模态 | responseModalities=[IMAGE] |
| 参考图 | 多模态输入;Pro 14 张 |
| 思考档 | MINIMAL / HIGH |
| 区域 | Vertex global |
| 配额 | 高吞吐提前申请 |

## 十一、风险清单

- 迁移窗口紧(8-17 截止)。
- 命名复杂,需映射表防错端。
- 闭源依赖;离线场景需替代方案。
- Pro + HIGH 成本高;监控用量。
- 数据经 Google 处理,注意行业合规。

---

*分析师注:这次迁移不是"换接口",而是 Google 对图像 AI 战略的重新定调——从"专用模型"走向"多模态一体"。早迁移者早受益。*
