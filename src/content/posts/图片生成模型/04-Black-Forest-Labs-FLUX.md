---
title: "FLUX：想看懂整个世界"
published: "2026-07-05"
category: "图片生成模型"
lang: "zh"
draft: false
tags: ["多模态", "开源", "Flow", "图像生成"]
---

# 04 | Stable Diffusion 之父的终极赌注:FLUX 3 想"看懂"整个世界

> 更新至 2026 年 7 月 23 日(FLUX 3 发布)
> 文体:深度行业特稿
> 一句话点题:这家德国公司把 Stable Diffusion 的遗产押在了一个更疯狂的赌注上——让一个模型同时学会画图、拍片、录音,甚至操控机器人。

## 引子:黑森林里的第二次创业

2022 年 8 月,Stable Diffusion 开源,"人人可 AI 绘画"一夜成真。那篇被引用 27000 次的潜在扩散论文,出自一个德国博士生:Robin Rombach。两年后,他带着团队离开陷入内乱的 Stability AI,在弗赖堡——黑森林边上——创立了 Black Forest Labs。

2024 年种子轮 3100 万美元(General Catalyst、a16z),2025 年 12 月 B 轮 3 亿美元(估值 32.5 亿美元),客户名单写着 xAI、Meta、Adobe、Canva。而 2026 年 7 月 23 日,它丢出了自己的宣言:**FLUX 3——一个同时理解图像、视频、音频,甚至能预测机器人动作的多模态基础模型。**

用 Rombach 的话说:"你不能欺骗现实。只学了图片的模型只能生成图片。但世界不是由静止画面组成的。"

## 一、两条产品线,一个野心

**成熟的 FLUX.2 图像家族**(2025-11 起,2026 持续迭代):

| 变体 | 定位 | 许可 | 规格 |
|---|---|---|---|
| pro | 旗舰 | 闭源 API | 4MP、8-10 参考、32K 上下文、2026-03 提速 2 倍 |
| flex | 设计师控制 | 闭源 API | 2026-01 提速 3 倍 |
| dev | 研究/自托管 | 开放权重 | 32B,非商用 |
| klein | 端侧 | 4B Apache 2.0 | 亚秒级,13GB 显存,2026-01-15 发布 |

**技术内核**:24B Mistral-3 视觉语言模型 + 32B rectified flow transformer——理解与生成的分工,是 FLUX.2 的照片级真实与多参考一致性的来源。

**FLUX Tools 工具链**(2026 年补齐):

| 日期 | 工具 |
|---|---|
| 05-14 | Outpainting(免提示词扩图,4MP) |
| 05-21 | Erase(物体移除,198 张基准平价超越) |
| 05-28 | Virtual Try-On(试穿,保脸保姿) |
| 06-09 | Outpainting Fast Mode(速度/成本可调) |
| 07-17 | Virtual Try-On v2(人脸保真增强,4MP) |

## 二、FLUX 3:一场"看懂世界"的豪赌

**设计哲学**:图像捕捉空间、视频揭示物理、音频暴露因果、语言连接指令——每种模态都是同一现实的不同投影,分开训练只能得到单点专家,联合训练才能相互增强。视频训练消耗了 FLUX 3 超过 95% 的计算量。

**Self-Flow 架构**:同一架构内联合训练 + 专用图像/视频/音频/动作编解码器,统一理解物理世界。

**四条产品线**:

| 产品线 | 能力 | 状态 |
|---|---|---|
| Video | 20 秒 + 原生同步音频;文/图/视频转视频、关键帧、多角色、链式拼接 | 已上线 |
| Image | 图像合成编辑、多语言文字、复杂提示词 | "未来几周" |
| Action | 机器人动作预测 | 奥迪工厂生产测试 |
| Dev | 开源权重(图/视频/音频/动作) | 2026 晚些时候,未定 |

## 三、FLUX-mimic:从生成视频到控制机器人

- 在视频预测骨干上叠加轻量动作解码器。
- 奥迪生产实验室:零件托盘放置、ECU 插装、组件组装、柔性件操控。
- 骨干延迟 <80ms(RTX 5090),端到端反应 101ms。
- **新任务微调仅需约 30 分钟数据(此前 30+ 小时)**——若被独立复现,这是行业级信号。

## 四、自评数据:亮眼,但请冷静

| 对比 | 偏好率 |
|---|---|
| Luma Ray 3.2 | 93% |
| Runway Gen-4.5 | 77% |
| Grok Imagine Video | 69% |
| Kling v3 Pro | 60% |
| Seedance 2.0 | 52% |
| Gemini Omni Flash | 52% |

⚠️ 全部为 BFL 自评(10 秒/720p/带音频),未经独立 Arena 复现;与 Seedance 2.0、Gemini Omni Flash 打平(52%)说明真实差距待验证。

## 五、商业版图

- 分销:xAI(Grok)、Meta(1.4 亿美元)、Adobe Photoshop、Canva、Picsart、Freepik/Magnific、Krea。
- FLUX 3 测试方:Canva、Burda、Magnific、Krea、Picsart。
- 硬件:NVIDIA + ComfyUI 三方合作 FP8 量化(显存 -40%、吞吐 +40%)。
- 云:AWS Bedrock 法兰克福(欧盟数据驻留)、fal、Replicate、Cloudflare Workers AI、Microsoft Foundry。

## 六、值得赞赏与需要警惕

**值得赞赏**
- FLUX.2 pro 照片级真实与多参考一致性第一梯队;32K 上下文罕见。
- 开源梯度完整(klein 4B Apache 2.0),端侧/自托管可行,欧盟数据主权友好。
- FLUX Tools 免提示词、生产级,工具链完整度领先。
- FLUX 3 是唯一同时覆盖图/视频/音频/动作的公开多模态模型;FLUX-mimic 有真工业落地。

**需要警惕**
- 视频基准为厂商自评;FLUX 3 Image 未上线、Dev 未开源、定价未公布——宣传跑在落地前面。
- FLUX.2 pro 体积巨大(24B+32B),自托管成本高;dev 非商用。
- 相比 GPT-Image-2 的思考模式、Qwen-Image 的超长指令,缺"推理型"交互。

## 七、怎么用、往哪用

**场景**:企业私有化/数据主权(dev/klein);多参考一致性(产品/角色/品牌);视频+音频同步(FLUX 3 Video);机器人/具身智能前瞻(FLUX-mimic)。

**建议**:
1. 图像:Pro API 或 klein 4B 自托管;个人/研究用 dev。
2. 扩图/擦除/试穿:直接 FLUX Tools,免提示词;vto-v2 输入 4MP 直通。
3. 视频:可尝鲜 FLUX 3 Video,但以独立榜单为准。
4. 盯紧 2026 晚些时候 FLUX 3 Dev——本地多模态的质变点。

## 八、FAQ

**Q1:FLUX.1 和 FLUX.2 选哪个?** 新项目优先 FLUX.2;显存/预算有限选 FLUX.1 schnell 或 klein。
**Q2:pro 和 flex?** pro 旗舰多参考;flex 细粒度设计控制。
**Q3:开源版能商用吗?** schnell/klein 4B 可;dev 非商用(需授权/API)。
**Q4:klein 4B 显存?** 约 13GB,亚秒级。
**Q5:Tools 怎么调?** BFL API 端点,免提示词,传图传参。
**Q6:FLUX 3 现在能用什么?** 仅 Video;Image 待上线;Action 在奥迪;Dev 未发布。
**Q7:视频数据可信吗?** ⚠️ 厂商自评,待独立复现。
**Q8:欧盟合规?** AWS Bedrock 法兰克福或自托管 klein 4B。

## 九、实战工作流

**A:电商多参考一致性** — 8-10 张参考图 → 32K 上下文描述约束 → 跨图一致产品图集。
**B:扩图** — 原图 + 目标尺寸 → 免提示词扩展 → high/fast 模式按需。
**C:虚拟试穿** — 模特图 + 服装图 → v2 保脸保姿 → 试衣间/社媒滤镜。
**D:本地端侧** — klein 4B 下载 → ComfyUI 加载 → 亚秒级批量/边缘部署。

## 十、接入要点

| 端点 | 用途 |
|---|---|
| flux-2-pro / flex | 文生图/图生图 |
| flux-2-pro-preview | 新能力预览 |
| flux-tools/outpainting-v1 | 扩图(fast/high) |
| flux-tools/erase | 移除 |
| flux-tools/virtual-try-on | 试穿 |

⚠️ Webhook 状态 2026-02 起从 SUCCESS 改为 Ready,存量代码需更新;pro 按输出像素计费。

## 十一、风险清单

- 基准自评;发布节奏慢于宣传。
- dev 非商用红线;pro 4MP 费用高。
- FLUX 3 定价未公布,规划前评估。
- 机器人方向为早期生产测试,非全面部署。

---

*写在最后:FLUX 3 的价值不在于今天能用多少,而在于它划出了一条路——生成式 AI 的下一站,不是画得更好,而是理解世界怎么运转。这条路能不能走通,未来几个月见分晓。*
