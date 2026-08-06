---
title: "Janus：看懂还要会画"
published: "2026-07-21"
category: "deepseek"
lang: "zh"
draft: false
tags: ["多模态", "图像生成", "架构"]
---

# Janus 系列论文解读：一个模型想既看懂又画图

> 系列：Janus（2024.10）→ Janus-Pro（2025.01）→ JanusFlow（2024.11，v2 2025.03）
> 作者：DeepSeek-AI（港大、北大、清华联合）
> Janus 是罗马神话里的双面神，一张脸看两个方向，正好比喻这个模型家族的处境，既要理解图像（要高层语义），又要生成图像（要低层细节）。三篇合起来是一条清晰的演进线，Janus 验证"理解生成双通路解耦"，Janus-Pro 做"数据与规模放大"，JanusFlow 换"生成引擎"，从离散 VQ token 升级到连续整流流。这条线是 DeepSeek 统一多模态路线的主干，读完三篇，Janus 家族的来龙去脉就齐了。

---

## 第一篇 Janus：先把两条视觉通路拆开

> 论文：*Janus: Decoupling Visual Encoding for Unified Multimodal Understanding and Generation*
> 作者：Chengyue Wu、Xiaokang Chen 等，DeepSeek-AI（港大、北大联合）
> 2024 年 10 月。之前的一体化模型（比如 Chameleon）用一个视觉编码器硬扛两个任务，结果理解性能被拖累。Janus 的做法是把视觉编码拆成两条独立通路，理解用 SigLIP，生成用 VQ tokenizer，共用一个 Transformer。1.3B 的模型在理解上多项超过 7B 的 LLaVA-v1.5，在生成上 FID 8.53 超过 DALL-E 2。

### 一、问题：理解要抽象，生成要细节，一个编码器扛不住

多模态理解任务里，视觉编码器要提取的是高层语义，物体的类别、视觉属性，因为理解任务本质是"看图 + 语义推理"。而视觉生成任务要的是局部的细节、纹理、全局一致性，需要的是低维、细粒度的编码。把这两种需求不同的表示塞进同一个空间，必然冲突、必然妥协。

所以之前的一体化模型（Chameleon 用 VQ tokenizer 同时管理解和生成）在多模态理解上普遍拉胯，比不过专门的理解模型。Janus 的解法简单粗暴，把视觉编码拆成两条通路，各干各的。

### 二、架构：双通路，单 Transformer

- **文本理解**：LLM 自带 tokenizer。
- **多模态理解**：SigLIP 编码器提取高层语义，展平成一维序列，经过理解适配器映射进 LLM 输入空间。
- **视觉生成**：VQ tokenizer（从 LlamaGen 继承）把图像变成离散 codebook ID，展平后经过生成适配器进 LLM。

三类特征序列拼起来喂给统一的自回归 Transformer。文本预测用 LLM 自带的预测头，图像预测用随机初始化的图像预测头。整个模型是标准自回归，不需要特别设计的注意力掩码。推理时图像生成用 classifier-free guidance（CFG，无分类器引导），scale 默认 5。

### 三、训练：三阶段

1. **Stage I**：只训理解适配器、生成适配器和图像头，视觉编码器和 LLM 全冻结，先建立视觉和语言的连接。
2. **Stage II**：统一预训练，解冻 LLM，纯文本、理解、生成三类数据一起上。学 PixArt 的思路，先用 ImageNet-1k 做简单生成训练，让模型掌握基础像素依赖，再用通用文生图数据提升开放域生成能力。
3. **Stage III**：监督微调，除了生成编码器全参微调，三类数据混合，不单独训任务专用模型。

损失函数就一个交叉熵，理解任务在文本序列上算，生成任务在图像序列上算，连任务权重都懒得调。

### 四、成绩

**理解**（1.3B 参数）：MMBench 69.4、SEED-Bench 63.7、POPE 87.0、GQA 59.1、VQAv2 77.3、MMMU 30.5。在 POPE、MMBench、SEED-Bench、MM-Vet 等多项上超过参数大得多的 LLaVA-v1.5（7B）、Qwen-VL-Chat（7B），并全面超过 InstructBLIP（7B）。

**生成**（384×384）：MSCOCO-30K FID 8.53、GenEval 61%，超过 DALL-E 2 和 SDXL 这些专门的文生图模型。同一个模型，理解和生成双开花。

### 五、可扩展性

解耦设计最大的红利是自由：
- 理解侧可以随便换更强的编码器（EVA-CLIP、InternViT），不用管它能不能干生成的活；可以上动态高分辨率，用 pixel shuffle 压缩 token。
- 生成侧可以换更细粒度的编码器（MoVQGan），可以用 diffusion loss，可以用自回归加双向注意力的混合减少累积误差。
- 还能接新模态，3D 点云、触觉、脑电信号，各配各的编码器，共用同一个 Transformer。

### 收尾：我的一点看法

Janus 的价值在它提出了一个"早就该问"的问题，理解和生成到底需不需要同一个视觉编码器？答案是各自领域最擅长的事情根本不一样。这个解耦直觉，跟 DeepSeek 一直以来的"砍掉多余部件"哲学一脉相承，Chameleon 是"一个编码器两个任务"的强行统一，Janus 是"两个编码器一个架构"的务实分工。

1.3B 打 7B 这个结果很有说服力。说明统一多模态模型理解拉胯的根源就是编码器冲突，拆开之后 1.3B 就能在多数基准上赢 7B 的任务专用模型。这等于给所有做一体化模型的团队指了条明路。

不过也要看清楚它的定位。生成能力跟当时的主流扩散模型（SDXL 那一档）比是"超过"，但那是 2024 年 10 月的水平线，而且只有 384 分辨率、离散 VQ token 生成，跟后来 JanusFlow 的连续整流流生成还有代差。Janus 的意义在于验证"解耦"这个方向，不在于生成质量本身。

另外一个值得注意的点是它的损失设计，全任务一个交叉熵、不调权重。这种极简设计后来被 Janus-Pro 继承，但 Janus-Pro 在更大规模上发现训练策略需要细化，ImageNet 生成步骤的分配、数据配比都要重调，这是 1B 规模论文没暴露的问题。

### 附：核心数据速查

**架构**
| 通路 | 编码器 | 适配器 |
|---|---|---|
| 理解 | SigLIP（语义） | 理解适配器 |
| 生成 | VQ tokenizer（离散 codebook） | 生成适配器 + 图像头 |

- 统一自回归 Transformer，标准因果注意力
- 推理用 CFG（scale=5）

**训练三阶段**
1. 适配器 + 图像头（编码器、LLM 冻结）
2. 统一预训练（解冻 LLM，ImageNet-1k 起步再上通用文生图）
3. SFT（除生成编码器外全训，三类数据混合）

**关键成绩（1.3B）**
| 任务 | 指标 | Janus | 对比 |
|---|---|---|---|
| 理解 | MMBench | 69.4 | LLaVA-v1.5-7B 64.3 |
| 理解 | SEED-Bench | 63.7 | Qwen-VL-Chat-7B 58.2 |
| 理解 | POPE | 87.0 | Emu3-Chat-8B 85.2（LLaVA-v1.5-7B 85.9） |
| 生成 | MSCOCO-30K FID | 8.53 | DALL-E 2 10.39 |
| 生成 | GenEval | 61% | SDXL 55% |

**关键概念清单**
- unified multimodal model = 统一多模态模型（理解 + 生成）
- decouple visual encoding = 解耦视觉编码（双通路）
- SigLIP = 理解侧编码器（高层语义）
- VQ tokenizer = 量化 tokenizer（离散 codebook ID）
- adaptor = 适配器（特征映射进 LLM 空间）
- CFG = Classifier-Free Guidance，无分类器引导
- FID = Fréchet Inception Distance，生成质量指标（越小越好）
- GenEval = 文生图组合能力基准
- VQ token = 量化后的离散视觉 token

---

## 第二篇 Janus-Pro：双面神的 7B 升级，理解生成两开花

> 论文：*Janus-Pro: Unified Multimodal Understanding and Generation with Data and Model Scaling*
> 作者：Xiaokang Chen、Zhiyu Wu 等，DeepSeek-AI
> 2025 年 1 月。Janus 的升级版，架构没变，还是理解生成双通路解耦，变的是三件事，训练策略优化、数据翻倍、模型从 1.5B 涨到 7B。效果立竿见影，MMBench 79.2（Janus 是 69.4），GenEval 0.80，把 DALL-E 3 和 SD3-Medium 都超了。短提示词生成不稳的毛病也治好了。

### 一、Janus 的三个短板

Janus 在 1B 规模上验证了解耦思路，但小模型加数据不够，暴露了几个问题：短提示词生成效果差，文生图质量不稳定，审美不行。Janus-Pro 从训练策略、数据、模型规模三个方向修。

### 二、训练策略：两处关键改动

**Stage I 加长**。原来 PixArt 式的做法，Stage II 里 66.67% 的生成训练步数花在 ImageNet 类别名生成上。Janus-Pro 发现这个分配很浪费，干脆把 ImageNet 的像素依赖建模挪到 Stage I 多训，实验结果证明，就算 LLM 参数冻着，模型也能学会根据类别名生成合理图像。

**Stage II 聚焦**。直接砍掉 ImageNet 数据，用普通文生图数据训练密集描述驱动的生成。这招让 Stage II 的文生图数据利用效率大幅提升。

**Stage III 数据配比调整**。多模态:纯文本:文生图从 7:3:10 改成 5:1:4，稍微降文生图比例，生成能力基本保住，理解性能涨了。

### 三、数据：合成数据补齐审美短板

**理解侧**。Stage II 预训练参照 DeepSeek-VL2 加约 9000 万样本，包括图像描述（YFCC）和表格、图表、文档理解（Docmatix）数据。Stage III 加了 MEME 理解、中文对话等提升对话体验的数据。

**生成侧**。作者发现上一版 Janus 用的真实数据质量差、噪声大，文生图才不稳定。Janus-Pro 加了约 7200 万条合成审美数据，真实:合成拉到 1:1。实验显示，合成数据收敛更快，生成更稳定，审美质量显著提升。这也是 Janus-Pro 生成质量质变的直接原因。

### 四、模型规模：1.5B 到 7B

1.5B 和 7B 两个版本，7B 用 DeepSeek-LLM-7B 底座。观察到大模型的理解和生成损失收敛都明显更快，验证了这套架构的扩展性。Stage II 用早停策略停在 27 万步，训练成本 1.5B/7B 分别在 16/32 节点 × 8 A100 上跑 9/14 天。

### 五、成绩

**理解**（Janus-Pro-7B）：POPE 87.4、MME-Perception 1567.1、MMBench 79.2、SEED-Bench 72.1、GQA 62.0、MMMU 41.0、MM-Vet 50.0。在多模态理解基准上总体最佳，除了 GQA 外全面压过 13B 的 TokenFlow-XL，也超过 MetaMorph（8B）和大部分 7B 理解专用模型。1B 版 MMBench 75.5，也把一堆 7B 模型甩在后面。

**生成**：GenEval 0.80（Janus 0.61、DALL-E 3 0.67、SD3-Medium 0.74、Emu3 0.54），DPG-Bench 84.2（精确值 84.19）。就论文报告的对比方法而言，自回归统一模型在指令跟随生成上全面超过了主流扩散模型。短提示词的稳定性、细节丰富度、甚至简单文字生成都肉眼可见地变好了（论文里给了对比图，同一个 prompt，Janus 糊的、Janus-Pro 清晰的）。

### 收尾：我的一点看法

Janus-Pro 最值得抄的作业是那个"合成审美数据"的决策。真实数据质量差、噪声大，是文生图不稳定的根源，这个判断很准，7200 万条合成数据一比一掺进去，收敛更快、生成更稳、审美更好，三样全占。后来 DeepSeek 系所有涉及生成的模型，这个"合成数据补审美"的做法都成了标配。

训练策略那两处改动看着小，其实是"把钱花在刀刃上"的经典案例。ImageNet 类别名生成占 Stage II 三分之二的步数，这个浪费被识破并修正，说明作者真的在算算力账。把像素依赖建模放回 Stage I（反正 LLM 冻结，不浪费主模型的训练资源），Stage II 全力冲密集描述生成，分工更合理。

7B 版本的理解成绩很能说明问题。MMBench 79.2、MM-Vet 50.0，已经接近同期 7B 理解专用模型的水平，说明解耦架构下，理解和生成不仅不打架，还能互相促进。这在统一模型里是稀缺品质。

当然，384 分辨率的上限还在，跟原生高分辨率的扩散模型比，Janus-Pro 的生成细腻度有限；GenEval 0.80 是组合指令跟随的胜利，不代表艺术性超越 SD3。另外 Stage II 早停在 27 万步、配比调整这些超参，论文说是实验调出来的，原理层面的解释比较薄。Janus-Pro 的意义是证明了"解耦 + 数据 + 规模"三件套有效，它后面 JanusFlow 才是真正换引擎的那一步。

### 附：核心数据速查

**训练改动**
| 改动 | 内容 |
|---|---|
| Stage I 加长 | ImageNet 像素依赖建模挪到这里，LLM 冻结也能学会 |
| Stage II 聚焦 | 砍掉 ImageNet，直接训密集描述文生图 |
| Stage III 配比 | 多模态:文本:文生图 7:3:10 → 5:1:4 |
| 合成数据 | +7200 万合成审美数据，真实:合成 = 1:1 |
| 理解数据 | +9000 万（YFCC、Docmatix 等，参考 VL2） |

**理解成绩（Janus-Pro-7B）**
| 基准 | Janus-Pro-7B | Janus（1.5B） | TokenFlow-XL（13B） |
|---|---|---|---|
| MMBench | 79.2 | 69.4 | 68.9 |
| SEED-Bench | 72.1 | 63.7 | 68.7 |
| GQA | 62.0 | 59.1 | 62.7 |
| MMMU | 41.0 | 30.5 | 38.7 |
| MM-Vet | 50.0 | 34.3 | 40.7 |
| POPE | 87.4 | 87.0 | 86.8 |

> 注：Janus 一列参数按 Janus-Pro 论文 Table 3 记为 1.5B；Janus 原论文记为 1.3B。

**生成成绩**
| 模型 | GenEval | DPG-Bench |
|---|---|---|
| Janus-Pro-7B | 0.80 | 84.2 |
| DALL-E 3 | 0.67 | 83.5 |
| SD3-Medium | 0.74 | 80.6 |
| Janus | 0.61 | 79.7 |
| SDXL | 0.55 | 74.7 |

> 注：Janus-Pro-7B 的 DPG-Bench 论文另一处精确值为 84.19；SD3-Medium 的 80.6 与 Table 5 的 84.08 的出入源于论文自身两处数据源。

**训练成本**：1.5B 16 节点、7B 32 节点（×8 A100-40G），9/14 天

**关键概念清单**
- decoupled visual encoding = 解耦视觉编码（理解 SigLIP / 生成 VQ）
- unified pretraining = 统一预训练
- synthetic aesthetic data = 合成审美数据
- pixel dependence = 像素依赖建模
- dense description = 密集描述（文生图提示词）
- GenEval = 文生图组合指令跟随基准
- DPG-Bench = 密集提示词图文对齐基准
- MMBench / MMMU / MM-Vet / POPE / GQA / MME / SEED = 多模态理解基准
- early stopping = 早停（Stage II 停在 27 万步）

---

## 第三篇 JanusFlow：自回归和整流流，一个模型里和平共处

> 论文：*JanusFlow: Harmonizing Autoregression and Rectified Flow for Unified Multimodal Understanding and Generation*
> 作者：Yiyang Ma、Xingchao Liu、Xiaokang Chen 等，DeepSeek-AI（北大、港大、清华联合）
> 2024 年 11 月（2025 年 3 月更新）。Janus 系的关键一跃，把生成引擎从离散 VQ token 换成连续整流流（rectified flow），在同一个 LLM 里同时跑自回归理解和流式生成。核心发现是，整流流可以直接在 LLM 框架里训练，只需要一个轻量编码器解码器，不用大改架构。1.3B 的参数，理解达到或超过 7B 任务专用模型，生成超过 SDXL。

### 一、动机：VQ token 是自回归生成的瓶颈

统一多模态模型的生成侧有两条路，一条是外挂扩散模型当工具（Emu 那种），不算真正统一；一条是单 LLM 自回归，但自回归生成通常靠 VQ（向量量化）把图像变成离散 token，生成质量被量化损失卡死。

整流流（rectified flow）是扩散模型的简化替代，学一个 ODE 把高斯噪声映射到数据分布，采样更快、性能更好。JanusFlow 想的是，能不能把整流流直接揉进 LLM，让 LLM 一边自回归理解、一边流式生成。

### 二、架构：一个 LLM，两套引擎

**理解侧**。跟标准 VLM 一样，SigLIP-Large-Patch/16 编码器提取连续语义特征，线性层投影进 LLM 空间，|BOI|/|EOI| 特殊 token 标记图像位置，LLM 自回归预测文本。

**生成侧**。在预训练 SDXL-VAE 的潜空间里做流式生成。高斯噪声 z0 经过生成编码器 g_enc（从零初始化的 ConvNeXt 块）变成 embedding 序列，跟时间步 embedding 拼起来进 LLM。LLM 的输出经生成解码器 g_dec 映射回潜空间，得到速度向量，用欧拉求解器迭代更新 z，直到 t=1，最后 VAE 解码成图。g_enc 和 g_dec 之间有一条长跳连接。

两个关键选择：
- **因果注意力就够**。之前的统一模型（如 Transfusion）用各种复杂注意力掩码，JanusFlow 实验发现因果注意力没损失，省事。
- **编码器解耦**。理解用 SigLIP，生成用 ConvNeXt，各干各的。这是 Janus 的直觉在流式生成上的延续，消融实验确认解耦显著提升性能。

还有一个升级，**表示对齐**。统一训练时把生成模块和理解模块的中间表示做对齐正则化，增强生成的语义一致性。这个只有解耦设计才做得到，共享编码器的模型没有这个选项。

### 三、训练：三阶段

1. **Stage 1 适配**：只训随机初始化的部分（线性层、g_enc、g_dec），让新模块先跟预训练的 LLM 和 SigLIP 磨合。
2. **Stage 2 统一预训练**：除视觉编码器外全训，三类数据（理解、生成、纯文本）。先给理解数据高比例建立基础能力（前 1 万步用 30:50:20 的配比），再提高生成数据比例，因为扩散类模型的收敛节奏不一样。
3. **Stage 3 SFT**：指令微调，对话、任务对话、高质量文生图样本混合，顺便解冻 SigLIP。

### 四、成绩（1.3B）

**理解**：MMBench 74.9、SEED-Bench 70.5、GQA 60.3、MM-Vet 30.9、POPE 88.0、MME-P 1333.1。在 POPE、MMBench、SEED-Bench、VQAv2 上超过 LLaVA-v1.5（7B）和 Qwen-VL-Chat（7B）这些理解专用模型，多数基准上也优于 Emu3-Chat（8B）、Show-o（1.3B）这些统一模型（MMMU 一项低于 Emu3-Chat，GQA 与 Emu3-Chat 打平）。

**生成**：GenEval 0.63、DPG-Bench 80.09%、MJHQ FID-30k 9.51。超过 SDv1.5 和 SDXL。跟 Janus 的 VQ 生成比，连续流生成在 FID 上有明显优势。

### 收尾：我的一点看法

JanusFlow 是 Janus 家族的技术转折点。Janus 证明了"解耦"有价值，JanusFlow 证明了"生成引擎可以换"，而且换的时候不用动架构根基。整流流直接在 LLM 里跑，因果注意力就够，这个"极简"结论很漂亮，等于告诉后来者，统一模型的生成侧不用搞花活，标准自回归骨架照单全收。

表示对齐这个设计是容易被忽略的亮点。理解模块和生成模块各自训各自的，中间表示可能漂移，对齐正则化把它们拉回同一个语义空间。消融如果没做，这个设计大概率被当成玄学，但论文专门验证了解耦加对齐的组合价值。后来 V4 的 OPD（多教师蒸馏）里"动态对齐专家"的思路，跟这个有神似之处，都是"多个模块怎么在一个模型里协同"的问题。

1.3B 打 7B 的成绩单再次验证了 DeepSeek 的参数效率哲学，但也要看到代价，384 分辨率、潜空间生成受 SDXL-VAE 制约、CFG 权重得调。生成质量"超过 SDXL"是基准分，不是艺术性超越。

### 附：核心数据速查

**架构**
| 模块 | 理解侧 | 生成侧 |
|---|---|---|
| 编码器 | SigLIP-Large-Patch/16（预训练） | ConvNeXt g_enc（从零初始化） |
| 输出 | 自回归文本预测 | 整流流速度预测（g_dec 解码回潜空间） |
| 潜空间 | - | SDXL-VAE（预训练） |
| 特殊 token | \|BOI\| / \|EOI\| | \|BOI\| + 时间步 embedding |

**关键设计**
- 整流流直接在 LLM 内训练，轻量 enc/dec 即可
- 因果注意力足够，不需要特殊掩码
- 编码器解耦（SigLIP vs ConvNeXt）+ 表示对齐正则化
- 欧拉求解器迭代采样，CFG 增强

**成绩（1.3B）**
| 指标 | JanusFlow | 对比 |
|---|---|---|
| MMBench | 74.9 | LLaVA-v1.5-7B 64.3 |
| SEED-Bench | 70.5 | Qwen-VL-Chat-7B 58.2 |
| GQA | 60.3 | InstructBLIP-7B 49.2 |
| GenEval | 0.63 | SDXL 0.55 |
| DPG-Bench | 80.09% | SDv1.5 63.18%、SDXL 74.65% |
| MJHQ FID-30k | 9.51 | Janus 10.10（1.3B 中最佳） |

**训练**：三阶段（适配 → 统一预训练 → SFT），Stage 2 前 1 万步理解数据配比 30:50:20

**关键概念清单**
- rectified flow = 整流流（学 ODE 把噪声映射到数据分布）
- autoregression = 自回归（理解侧，next token prediction）
- VAE latent space = 变分自编码器潜空间（SDXL-VAE）
- velocity prediction = 速度场预测（流模型的训练目标）
- Euler solver = 欧拉求解器（迭代更新潜变量）
- CFG = Classifier-Free Guidance，无分类器引导
- representation alignment = 表示对齐（生成与理解中间表示对齐）
- decoupled encoder = 解耦编码器（SigLIP 理解 / ConvNeXt 生成）
- |BOI| / |EOI| = 图像开始/结束特殊 token
- MJHQ FID / GenEval / DPG-Bench = 文生图评测基准
- Transfusion / Show-o / Emu3 = 同期统一多模态模型

---

## 系列总评

Janus 三篇放在一起看，是 DeepSeek 在"统一多模态"这个命题上的一整套答卷。第一问，理解和生成能不能共用一个模型，Janus 说能，但前提是视觉编码必须拆开，这个答案直接改写了统一模型的架构范式。第二问，解耦之后怎么变强，Janus-Pro 说靠数据和质量，合成审美数据补上了生成侧的短板，规模从 1.5B 推到 7B。第三问，生成引擎还能不能更好，JanusFlow 说能，离散 VQ token 换成连续整流流，同一个 LLM 里自回归和流式生成各司其职。

这条线的技术遗产也辐射到了 DeepSeek 后续工作，解耦思想在 OCR 系列（DeepEncoder 的视觉因果流）、V4 的 CSA 压缩注意力里都有回响；合成数据补审美的做法成了 DeepSeek 生成类模型的标配；"LLM 内嵌整流流"的范式则是这条线技术含量最高的一环。JanusFlow 之后，DeepSeek 的多模态重心转向了 OCR 和 V4 的多模态规划，但 Janus 家族确立的两条原则——编码解耦、极简统一——一直在延续。
