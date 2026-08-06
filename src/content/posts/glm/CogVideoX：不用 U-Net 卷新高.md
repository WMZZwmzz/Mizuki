---
title: "CogVideoX：不用 U-Net 卷新高"
published: "2026-07-20"
category: "glm"
lang: "zh"
draft: false
tags: ["视频生成", "架构", "Transformer"]
---

# CogVideoX 论文解读：不用U-Net，一个Expert Transformer把视频生成卷到新高度

> 论文：*CogVideoX: Text-to-Video Diffusion Models with An Expert Transformer*
> 作者：Zhuoyi Yang, Jiayan Teng, Wendi Zheng, Ming Ding, et al.（智谱AI + 清华大学）
> arXiv: 2408.06072
>
> 2024年视频生成赛道卷成红海，Sora珠玉在前，Kling、Runway虎视眈眈。智谱这帮人偏不信邪，别人用U-Net搞扩散，他们偏要搞个纯Transformer出来。结果呢？开源模型里第一个能打的，5B参数在人类评测里跟Kling掰手腕，7项自动指标拿了5项第一。这篇论文，是智谱在视频生成领域立的一块碑。

---

## 一、先说背景：视频生成为什么难

文本到视频生成（Text-to-Video），说白了就是给模型一句话，让它变出一段连贯的视频。这事难在哪？三个字：**时空一致性**。

图片生成只管一帧好不好看，视频生成得管几十帧连起来动不动、动得对不对。一个人走路的视频，胳膊腿得协调，光影得连续，背景不能闪。这意味着模型必须同时理解时间维度和空间维度，而且这俩维度还得纠缠在一起。

2024年之前的主流方案，基本都是U-Net的变体。Stable Diffusion那套，在图片上跑通了，往视频上搬就是加个时间注意力层。问题是U-Net那套下采样-上采样的结构天然对长序列不友好，视频帧一多，计算量爆炸。

Sora出来之后，大家才意识到：原来用纯Transformer做扩散模型（DiT路线）才是正道。但Sora不开源，技术细节全靠猜。这时候CogVideoX站出来说：我开源，我告诉你怎么做。

## 二、架构核心：Expert Transformer，不是U-Net，不是标准DiT

CogVideoX最核心的贡献，是提出了**Expert Transformer**架构。

先说它不是什么。它不是U-Net——没有encoder-decoder对称结构，没有skip connection。它也不是标准DiT（Diffusion Transformer）——标准DiT用同一套参数处理所有token，CogVideoX说，文本token和视频token性质完全不同，凭什么共享一套归一化参数？

Expert Transformer的核心设计有四个部件：

**第一，3D Full Attention（三维全注意力）。** 把视频的所有patch token和文本token拼成一条序列，直接做全注意力。不搞什么时间注意力和空间注意力分开算的小家子气，一步到位，让每个视频patch都能看到所有其他patch和所有文本token。这样时空建模是"原生"的，不是后补的。

**第二，Expert Adaptive LayerNorm（专家自适应归一化）。** 这是"Expert"这个词的由来。传统DiT用AdaLN（自适应层归一化）来注入时间步信息，所有token共享同一组AdaLN参数。CogVideoX说：不行，文本和视频的特征分布差异太大，得分开处理。于是它给文本token配一套AdaLN专家，给视频token配另一套AdaLN专家。主干Transformer的参数是共享的，只有归一化层是各走各的。

打个比方：一家公司（Transformer主干），所有员工在同一间办公室开会（全注意力），但文本部门和视频部门各有各的"更衣室"（AdaLN专家）。开会前各换各的工装，开会时一起干活。

**第三，Patch Embedding + 序列拼接。** 文本用T5编码器编码成token，视频用VAE压成潜在表示后切成patch。两种token直接拼接成一条长序列，送进Transformer。

**第四，3D-RoPE位置编码。** 这个下面单独说。

## 三、3D-RoPE：给视频token装GPS

位置编码这东西，在NLP里大家都熟了。RoPE（旋转位置编码）是LLaMA时代的事实标准，但那是1D的——只管序列顺序。

视频是三维的：有x（宽度方向）、y（高度方向）、t（时间方向）。怎么给三维数据编位置？

CogVideoX的做法是**3D-RoPE**：把RoPE的维度拆成三份，分别编码x、y、t三个坐标。具体比例是3:3:2——宽度和高度各占3/8的维度，时间占2/8。

为什么时间分得少？因为空间分辨率通常比时间帧数大得多。一个768×1360的视频，空间方向有几千个patch，时间方向才几十帧。维度分配得跟信息量匹配。

关键好处是：3D-RoPE让模型天然知道"这两个patch在空间上挨着"还是"在时间上相邻"。不需要额外的时间嵌入或者帧号标记，位置关系全部编码在旋转矩阵里。而且RoPE天然支持长度外推，训练时看6秒视频，推理时生成10秒也不至于崩。

## 四、3D Causal VAE：把视频压进"冰箱"

视频原始像素量太恐怖了。一段6秒、480p、24fps的视频，原始像素就是几十MB。直接在这上面做扩散？算力再翻十倍也不够。

所以CogVideoX搞了一个**3D Causal VAE**（三维因果变分自编码器），把视频压缩到潜在空间（Latent Space）。

压缩比多狠？**空间方向8倍压缩，时间方向4倍压缩**。也就是说，一个8×8的像素块压成1个latent token，4帧压成1帧。最终latent通道数是16。

"因果"（Causal）这个定语很关键。普通3D卷积在时间方向是双向的，会"偷看"未来帧。CogVideoX的VAE用因果卷积，时间方向只看过去不看未来。好处是什么？可以逐帧编码，支持变长视频，而且跟自回归式扩展兼容——你想生成更长的视频，可以一段一段往后接。

VAE还有一个巧妙设计：第一帧独立编码为一张图片的latent，后续帧才做时间压缩。这样图片生成和视频生成可以共用同一个VAE，训练时也能混入图片数据。

## 五、训练策略：从256到768，一步一步爬

CogVideoX的训练不是一步到位的，而是**渐进式训练**（Progressive Training）。

分辨率从256px起步，升到512px，最后到768px。每个阶段用对应分辨率的数据训练。这就像举重，先练20公斤再加到50公斤，直接上100公斤只会受伤。

训练数据方面，团队从互联网视频里筛出约**3500万条单镜头片段**，平均时长6秒。筛选标准极其严格：去掉有水印的、有文字遮挡的、画质差的、镜头切换的。另外还混入**20亿张图片**（来自LAION-5B和COYO-700M），让模型先学好空间构图。

数据标注用的是**稠密描述**（Dense Caption），不是简单的alt-text。用Panda70M的描述、CogVLM生成的描述、GPT-4重写、LLaMA2扩写，多管齐下搞出高质量的文本-视频对。

训练目标用**v-prediction加zero SNR**。v-prediction比epsilon-prediction在高噪声区域更稳定，zero SNR确保模型能处理纯噪声输入。这两个trick组合起来，生成质量明显上一个台阶。

还有一个**Multi-Resolution Frame Pack**策略：同一个batch里混合不同分辨率和帧数的样本，用padding对齐，让模型学会处理各种尺寸。

## 六、从2B到5B：模型家族与进化路线

CogVideoX不是一个模型，是一个家族：

**CogVideoX-2B**：基础版，2B参数，支持6秒480p视频生成。开源最早的版本，社区生态的基础。

**CogVideoX-5B**：升级版，5B参数，支持6秒768×1360视频，16fps。生成质量大幅提升，是论文的明星模型。

**CogVideoX-5B-SAT**：后续发布的增强版，基于SAT（Swift Adaptive Training）框架微调，支持10秒视频，分辨率进一步提升。

**CogVideoX1.5**：最终形态，支持10秒、更高分辨率输出。配合超分模型，号称能出4K级别的效果。

进化路线很清晰：先小规模验证架构，再逐步放大参数、延长时长、提高分辨率。每一步都是在前一步的基础上做增量改进，不搞推倒重来。

## 七、成绩：开源第一，跟闭源掰手腕

论文给的评测结果相当能打：

**自动评测**：在7项自动指标中，CogVideoX-5B拿了5项第一。包括FVD（Fréchet Video Distance）、CLIP Score等核心指标，全面超越同期的开源模型。

**人类评测**：跟Kling（快手的商业模型）对比，CogVideoX-5B在感官质量（Sensory Quality）、指令遵循（Instruction Following）、物理模拟（Physics Simulation）、封面质量（Cover Quality）四个维度上都更优或持平。

注意，这是2024年中的结果。一个5B参数的开源模型，在人类感知层面跟商业闭源模型打平，这在当时是炸裂的。

**跟Sora的路线对比**也值得说一嘴。Sora走的是"暴力大模型+海量数据"路线，具体架构不公开。CogVideoX走的是"精巧架构+高效训练"路线，Expert Transformer+3D-RoPE+渐进训练，每一步都有明确的技术创新。前者是大力出奇迹，后者是四两拨千斤。

## 八、工程细节：推理效率与部署

论文还提到了一些工程优化：

**推理加速**：用DDIM采样减少步数，配合混合精度推理，5B模型在单张A100上可以在几分钟内生成一段6秒视频。

**显存优化**：VAE解码是最吃显存的环节，CogVideoX用分块解码（tiling）策略，把大分辨率的解码拆成小块串行处理，显存占用可控。

**图生视频**（Image-to-Video）：在第一帧注入条件图片，让模型从给定图片出发"续写"视频。这个能力对创作者来说极其实用。

## 收尾：我的一点看法

CogVideoX这篇论文，我觉得最大的价值不是某个单项技术，而是它证明了"开源视频生成模型能跟闭源掰手腕"这件事。2024年中的时候，大家普遍觉得视频生成是巨头的游戏，开源社区只能捡剩。CogVideoX-5B出来之后，这个认知被彻底改写了。

Expert Transformer这个设计，说实话，思路不算特别新。"给不同模态配独立参数"这个想法，从CogVLM的Visual Expert就开始了，智谱一脉相承。但把它用到扩散模型里，用AdaLN专家而不是FFN专家来做模态区分，这个工程选择很务实——改动小、效果明显、不增加太多计算量。

3D-RoPE是我最欣赏的部分。位置编码这东西，做好了是基础设施，做差了是灾难。CogVideoX用3:3:2的维度分配，简洁优雅地解决了时空位置建模问题。后来很多视频生成模型都跟进了类似的方案，说明这个设计确实击中了痛点。

局限也得说。首先，6秒的时长在商业场景里还是太短了，虽然CogVideoX1.5做到了10秒，但跟Sora宣称的60秒还有代差。其次，物理一致性仍然是软肋，复杂运动场景下经常出现穿模和不自然的加速。最后，5B模型虽然能跟Kling比，但跟后来的Sora正式版、Veo2比，画质和一致性还有明显差距。不过这是开源生态的宿命——永远在追赶，但永远在进步。

从产业角度看，CogVideoX是智谱"多模态全家桶"战略的一环。CogVLM做理解，CogVideoX做生成，CogAgent做交互，三条线互相喂数据、共享基础设施。这种打法跟OpenAI的"一个模型打天下"完全不同，是典型的学术团队产业化路径。

---

## 附：核心数据速查

**基本盘**
| 项目 | 数值 |
|---|---|
| 模型规模 | 2B / 5B / 5B-SAT |
| 架构 | Expert Transformer（3D Full Attention + Expert AdaLN） |
| 位置编码 | 3D-RoPE（x:y:t = 3:3:2） |
| VAE压缩 | 空间8×，时间4×，16 latent通道 |
| 文本编码器 | T5 |
| 最大分辨率 | 768×1360 |
| 帧率 | 16 fps |
| 最大时长 | 6秒（基础版）→ 10秒（SAT版） |

**训练配置**
| 项目 | 数值 |
|---|---|
| 视频数据 | ~3500万条单镜头片段，平均6秒 |
| 图片数据 | ~20亿张（LAION-5B + COYO-700M） |
| 分辨率课程 | 256px → 512px → 768px |
| 训练目标 | v-prediction + zero SNR |
| 标注方式 | Dense Caption（Panda70M + CogVLM + GPT-4 + LLaMA2） |

**核心成绩**
| 指标 | 结果 |
|---|---|
| 自动评测 | 7项中5项第一（超越同期开源模型） |
| 人类评测 vs Kling | 感官质量、指令遵循、物理模拟、封面质量均优或持平 |
| 开源地位 | 2024年中开源视频生成模型第一 |

---

## 关键概念清单

- Expert Transformer = 专家Transformer（文本/视频分设AdaLN专家）
- 3D Full Attention = 三维全注意力（时空token统一建模）
- Expert Adaptive LayerNorm = 专家自适应层归一化
- 3D-RoPE = 三维旋转位置编码（x:y:t = 3:3:2维度分配）
- 3D Causal VAE = 三维因果变分自编码器（空间8×时间4×压缩）
- v-prediction = 速度预测（扩散训练目标）
- zero SNR = 零信噪比（确保纯噪声端可处理）
- Progressive Training = 渐进式训练（分辨率逐步提升）
- Multi-Resolution Frame Pack = 多分辨率帧打包
- Dense Caption = 稠密描述（高质量文本标注）
- FVD = Fréchet Video Distance（视频生成质量指标）
- T5 = Text-to-Text Transfer Transformer（文本编码器）
- Latent Diffusion = 潜在扩散（在压缩空间做去噪）
- Image-to-Video = 图生视频（条件生成）
