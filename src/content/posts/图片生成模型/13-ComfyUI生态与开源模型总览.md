---
title: "ComfyUI：零代码生图工作台"
published: "2026-07-26"
category: "图片生成模型"
lang: "zh"
draft: false
tags: ["开源", "图像生成"]
---

# 13 | ComfyUI 从零到一:今晚,你就能跑起第一个生图工作流

> 更新于 2026 年 8 月
> 文体:手把手教程(新手友好、步骤化、亲切)
> 目标读者:第一次接触 ComfyUI 的你。读完这份指南,你就能跑起自己的第一个生图工作流。

## 欢迎来到节点世界

ComfyUI 是什么?一句话:**开源生成式 AI 的画布式工作台**。它不用写代码,而是把"模型加载、提示词、采样、保存"这些环节连成一张节点图。2026 年的 ComfyUI 已经不只是玩具——4 月完成 3000 万美元融资、估值 5 亿美元、400 万用户、6 万+ 社区节点、日下载 15 万+。

**为什么值得学?**
- 完全免费、永远开源。
- 数据不出本机,合规友好。
- 边际成本趋零(硬件折旧后)。
- 全生态自由:LoRA、ControlNet、自定义节点随便装。

## 第一步:安装(5 分钟)

1. 去 comfy.org 下载桌面版(Windows/macOS/Linux 都有)。
2. 解压即用;或用 Git 克隆官方仓库。
3. **强烈建议**装 ComfyUI Manager(节点管理器,后面全靠它)。

## 第二步:认识界面

- **画布**:拖拽节点、连线,搭建流程。
- **节点**:每个框是一个功能(加载模型、写提示词、采样、保存……)。
- **队列**:点 Run,流程从左到右执行。

## 第三步:放置你的第一个模型

模型文件放这里(放错位置 = 灰色输出,最常见的新手坑):

```
ComfyUI/
└── models/
    ├── diffusion_models/   ← 主模型(FLUX/Qwen/SD 等)
    ├── text_encoders/      ← 文本编码器
    ├── vae/                ← VAE
    ├── loras/              ← LoRA
    └── controlnet/         ← ControlNet
```

## 第四步:跑通第一个工作流

1. 下载一个开源模型(新手推荐:SDXL 或 Z-Image Turbo,门槛低)。
2. 打开 ComfyUI,从菜单加载官方示例工作流。
3. 在"正面提示词"框里输入描述,点 Run。
4. 恭喜——第一张本地 AI 图诞生了!

## 第五步:进阶三件事

1. **装自定义节点**:Manager → Install Missing Custom Nodes → 重启。
2. **低显存优化**:GGUF 量化(city96 的 ComfyUI-GGUF 节点)或 --lowvram 启动。
3. **训练 LoRA**:AI-Toolkit 支持 12-16GB 显存训练。

## 模型怎么选:一张图看懂

| 你的需求 | 选它 | 显存 |
|---|---|---|
| 综合质量(非商用) | FLUX.1/2 dev | 12-24GB |
| 商用 + 质量 | FLUX.2 klein 4B、Qwen-Image、SD4 | 8-24GB |
| 图中文字 | Qwen-Image、Z-Image Turbo | 4-24GB |
| 速度/低显存 | Z-Image Turbo、FLUX.2 klein 4B | 6-13GB |
| 动漫/风格 LoRA | SDXL | 6-8GB |
| 超长复杂提示词 | 混元 3.0(企业级) | 40GB+ |
| 中文/国风 | Kolors、Qwen-Image | 19GB+ |
| 程序化控制 | FIBO | — |
| 4K 轻量统一 | SenseNova U1.5 | 低 |

## 常见问题排查(收藏这张表)

| 现象 | 原因 | 解法 |
|---|---|---|
| 灰色/噪点 | 三件套缺失或路径错 | 检查 Loader 节点文件 |
| 节点全红 | 缺自定义节点 | Manager 一键安装 |
| CUDA 显存不足 | 模型精度太高 | 换 FP8/GGUF 或 --lowvram |
| 过饱和/块状 | CFG 过高(蒸馏模型) | 降到 1.5-2.0 |
| 加载慢 | 首次加载大模型 | 预热缓存 |
| 跨平台失败 | 缺依赖声明 | requirements.txt + 模型哈希 |

## 成本账:自托管 vs 云

| 维度 | 自托管 | 云 API |
|---|---|---|
| 单张成本 | 折旧后趋零 | $0.02-0.08 |
| 前期投入 | 显卡 ¥5000+ | 零 |
| 数据安全 | 本机 | 第三方 |
| 维护 | 自己 | 厂商 |
| 适合 | 日 100+ 张/合规 | 低频/快速上线 |

**经验法则**:日生成 <50 张用 API;>100 张长期用自托管;多数团队"草稿本地、终稿云端"混用。

## FAQ

**Q1:ComfyUI 是模型吗?** 不,是工作流工具;模型自己下载。
**Q2:免费吗?** 完全免费且永远开源。
**Q3:和 WebUI 区别?** ComfyUI 更灵活高效,WebUI 更易上手;专业用户多选 ComfyUI。
**Q4:最低配置?** 6GB 跑 SDXL/Z-Image;8GB 跑 FLUX.2 klein;12-16GB 跑 FLUX.1 dev(FP8)。
**Q5:模型放哪?** models/ 下分类目录。
**Q6:怎么分享工作流?** JSON 导出;图片元数据内嵌工作流,拖入即重建。
**Q7:自定义节点怎么装?** Manager 搜索安装。
**Q8:红节点怎么办?** Update ComfyUI → Install Missing Custom Nodes → 重启。

## 学习资源

- 官方:comfy.org、GitHub、Discord。
- 模型:Hugging Face、CivitAI。
- 教程:官方文档 + localaimaster、stable-diffusion-art 等社区站。
- 云:fal.ai、Replicate、Thunder Compute($0.35/时起)。

## 最后的叮嘱

1. **许可先行**:商用前务必读 LICENSE(FLUX dev 非商用、Kolors 需登记、混元需核验模型卡)。
2. **从小的开始**:先跑通 SDXL/Z-Image,再上大模型。
3. **善用社区**:工作流 JSON 到处都是,拿来主义是最高效的学习方式。

---

*写在最后:ComfyUI 的门槛不在技术,在于"第一次跑通"的耐心。跑通之后,你会发现它给你的自由,是任何闭源平台都给不了的。*
