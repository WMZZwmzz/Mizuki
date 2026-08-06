---
title: "MiniMax-Speech：几秒克隆音色"
published: "2026-07-16"
category: "minimax"
lang: "zh"
draft: false
tags: ["TTS", "语音", "端到端", "评估"]
---

# MiniMax-Speech 论文解读：几秒音频克隆音色，一行文字控制情感

> 论文：*MiniMax-Speech: Intrinsic Zero-Shot Text-to-Speech with a Learnable Speaker Encoder*（arXiv:2505.07916，2025 年 5 月）
> 作者：MiniMax（Bowen Zhang、Congchao Guo 等 20 人，按字母序列名）
> 在 MiniMax 的全模态拼图里，语音是最早商业化跑通的一块。这篇就是 Speech-02 的技术报告——以 Speech-02-HD 名义登顶 Artificial Analysis 语音竞技场、把 OpenAI 和 ElevenLabs 都压在身后的那个模型，前代是 API 产品线上的 T2A-01（论文脚注里自认"旧版本"）。三个卖点：不要文字稿的零样本音色克隆、可插拔的情感控制、用自然语言"捏"一个全新音色。

---

## 一、引言：克隆音色，为什么非得给"剧本"

codec 类模型把 TTS 推进了一大步：喂几秒钟的参考音频，就能生成高质量语音。这让对话式 AI、播客有声内容、语音助手、电子书朗读这些场景一下子全活了。

大 TTS 模型主要分两条路线。一条是非自回归（NAR）扩散模型，推理快，但卡在时长建模上：要么做显式的音素-时长对齐，韵律和多样性受束缚；要么做全局时长建模、让模型自己学隐式对齐，复杂度上去、难例上容易翻车。另一条是自回归（AR）语言模型路线，慢一点，但韵律、语调、整体自然度天然占优。MiniMax 选了后者。

这里值得补一句背景：传统 TTS 是四段式流水线——文本 → 音素（G2P）→ 声学模型出 mel 谱 → 声码器出波形，每段独立训练、误差层层累积，克隆音色更是得录几个小时再逐个微调。从 VALL-E 开始的端到端方案把文本 token 和音频 token 放进一个模型联合训练，几秒样本就能克隆，代价是生成稳定性要重新治。MiniMax-Speech 就是在端到端这条路上继续修。

修的是哪个坑？当时的 AR 克隆模型（VALL-E、CosyVoice 2 这一票）克隆音色时要同时给"参考音频 + 音频对应的文字稿"——参考稿和目标文本一旦语义或语言不匹配，再加上解码长度限制，质量就掉。MiniMax 的解法是把一个可学习的 **Speaker Encoder** 塞进 AR 模型：只吃音频、不要文字稿，音色克隆从零样本起步。音质这边再配一个新提出的 **Flow-VAE** 补上。

成绩单：支持 32 种语言，客观克隆指标（WER 和说话人相似度）SOTA，登顶公开的 TTS Arena 排行榜。

## 二、整体架构：三段流水线，各管一摊

整个系统三件（论文图 1）：**tokenizer**、**AR Transformer**、**latent flow matching**（flow matching 模块 + Flow-VAE 模块）。

文本侧用 **BPE** 分词，没什么花样。音频侧的 tokenizer 是 Encoder-VQ-Decoder 结构，对 mel 谱做量化，每秒 25 个 token，用 **CTC** 监督训练——压缩率够高，同时把声学细节和语义信息都留住。

打个比方：**AR Transformer** 是配音演员，拿着文本逐 token 往下"念"，每走一步决定接下来的语调和节奏；**flow matching** 是后期混音师，把 AR 给出的离散草稿还原成连续、高保真的声音。

关键在于三者的分工就是"解耦"：**内容**从文本 token 进来，**音色**从 Speaker Encoder 的条件向量进来，**情感和韵律**主要由 AR Transformer 建模（这一点在扩展章节里被作者明确点出）。各走各的通道，互不绑架——后面所有花式扩展，地基都是这个分工。

## 三、Speaker Encoder：可学习，是这篇的题眼

论文先打了一场定义战。zero-shot、one-shot 这组词是从 GPT-3 借来的：零样本 = 只给指令不给例子，单样本 = 给一个上下文例子。搬到 TTS 里：

- **Zero-shot 克隆**：只给一段参考音频，不给它对应的文字稿，也不做任何针对说话人的微调。参考音频本身就是"指令"。
- **One-shot 克隆**：额外给一对"文本-音频"配对的样例当 prompt。VALL-E、CosyVoice 2、Seed-TTS 在各自论文里都自称零样本，但按这个更严的定义，它们要配对 prompt，统统算 one-shot。

MiniMax 管自己的方案叫 **intrinsic zero-shot**——标题里那个词就是这么来的。

第二个关键词是"可学习"。不少模型直接拿预训练的说话人验证（Speaker Verification）模块当固定 speaker encoder 用，但 SV 任务的训练数据和优化目标跟 TTS 根本不是一回事。MiniMax 的做法是让 speaker encoder 跟 AR Transformer **端到端联合训练**：编码器学到的东西天然服务于合成任务，而且训练集里所有语言都能覆盖到，不像某些预训练编码器连语种都没见全。

机制上很朴素：变长的参考音频进来，编码器输出一个定长的条件向量，里面装着音色和韵律风格，AR 模型照着这个向量生成目标语音。好比一位画师，听几秒钟录音就能画出这个人的"声音长相"，完全不需要知道对方说了什么。

这么设计换来四样东西：不用转写（省掉 ASR，也断掉转写错误的传染）；韵律自由（不被 prompt 的语调绑住，解码空间更大）；跨语言稳（音色是语言无关的，中文参考音频可以直接去说法语）；以及一块扩展的地基（见第六节）。

论文里还埋了个坎：训练时 speaker encoder 的参考音频**必须**跟 AR 要合成的目标音频不是同一句，否则会发生"语义泄漏"，性能直接退化。

## 四、Flow-VAE：把 mel 谱这个瓶颈砸掉

主流做法是 flow matching 先预测 mel 谱，再由声码器转成波形。问题在于 mel 谱是个信息瓶颈，音质天花板被它锁死。**VAE** 的 latent 表征是端到端训出来的，重建误差比 mel 谱小，天花板更高。

**Flow-VAE** 在 VAE 上再叠一层 normalizing flow：传统 VAE 硬把 latent 空间压成标准正态分布，Flow-VAE 让 encoder 先输出一个普通正态分布，再用一串可逆映射把它变换到标准正态，然后才计算 KL 散度约束。输入也直接吃波形 x，跳过 mel。类比一下：传统 VAE 像把行李硬塞进标准登机箱，Flow-VAE 是先给你一个大箱子随便装，过关前再无损压缩成标准尺寸——装箱自由度大了，信息保住了，检查标准还没降。

flow matching 那边（Transformer 架构）的条件也很讲究：除了 AR 输出上采样后的结果，还喂进 speaker encoder 提取的全局音色信息和 prompt 信息（这里借鉴了 CosyVoice 2）。训练时有一定概率拿当前句子的开头当 prompt，所以推理时零样本和单样本两种模式都支持。

数字上，Flow-VAE 对比 VAE：重合成任务 NB PESQ 4.27 → 4.34、WB PESQ 4.20 → 4.30、MS-STFT-LOSS 0.67 → 0.62，全指标占优；接进 TTS 流程后 WER、SIM 也都小幅提升，作者特别补了一句——听感上整体稳定性提升更明显。

## 五、评估：发音比真人还稳，竞技场登顶

训练数据横跨 32 种语言，清洗上有几手：双 **ASR** 交叉校验转写准确性；用 VAD 加 ASR 时间戳修正标点；特意保留原始稳态噪声（让声音别太"录音棚"）；再用多说话人验证模型保证单个音频文件内音色一致。

**克隆保真度（Seed-TTS-eval，约 2000 条中文 + 1000 条英文）。** 最扎眼的一行：MiniMax-Speech 零样本的 WER，中文 0.83、英文 1.65，比真人录音的 1.25 / 2.14 还低——合成语音的发音比真人录音更干净稳定。零样本 SIM 中文 0.783，已经追上真人的 0.750；加上 one-shot prompt 后 SIM 0.799 反超真人，与 Seed-TTS 打平、压过 CosyVoice 2。作者还提到听众反馈：零样本反而更自然——少了 prompt 韵律的带偏。

**竞技场。** 提交到 Artificial Analysis 的公开 TTS Arena（人类盲听、ELO 计分），所有样本全部用零样本克隆生成。2025 年 5 月 12 日的快照上，Speech-02-HD 排第一，压过 OpenAI 和 ElevenLabs，对 Google、Microsoft、Amazon 这些靠几十小时数据给每个说话人单独训模型的老牌选手，优势拉得更开——而 MiniMax 一个专属模型都没训。

**多语言。** 自建 24 语种测试集，每语 100 句，说话人取自 Mozilla Common Voice（一男一女），对手是 ElevenLabs Multilingual v2。WER 总体相当，但在声调复杂或音系刁钻的语种上碾压：中文 2.252 对 16.026、粤语 34.111 对 51.513、越南语 0.880 对 73.415、泰语 2.701 对 73.936。SIM 则 24 个语种全胜。

**跨语言。** 拿中文说话人去说另外 7 种目标语言，零样本 WER 全面低于 one-shot（捷克语 2.823 对 5.096、越南语 0.659 对 1.788），接近母语合成水平。结论很干脆：跨语言场景就该用零样本。

**消融。** 三个方案对打：可学习 Speaker Encoder、预训练说话人验证 embedding（SpkEmbed）、纯 prompt（OnlyPrompt）。SpkEmbed 明显伤 WER（零样本 1.400，one-shot 恶化到 1.704）；OnlyPrompt 的 WER 最低（1.207）但音色相似度垫底（0.726）；Speaker Encoder 的 one-shot 配置 WER 1.243、SIM 0.746，两头都稳，是综合最优解。

## 六、扩展：不动底座，插上去的三件套

speaker encoder 学到的音色表征是解耦的，所以扩展不用动基座模型。论文给了三个例子：

**情感控制（LoRA）。** 情感靠韵律里的音高和时长传达，主要归 AR Transformer 管。做法是定义离散情感类别，每类用高质量情感数据单独训一个 **LoRA** 模块，推理时按需热插拔。训练数据是"参考音频、文本、目标情感音频"三元组，两个经验值得记：参考音频用中性情感，情感对比更清楚、表现力更强；用随机情感，输出更稳、音色相似度更牢。另外特意收集"同一句文本配多种情感"的样本，把情感跟文本语义拆开。作者明说：这套离散类别 + LoRA 的方案比用自然语言描述来控制情感更精准、更稳定。

**T2V（Text to Voice，音色设计）。** 克隆解决的是"复刻已有的人"，T2V 解决的是"凭空造一个人"。先建一个带语速、性别、语言、音高、音量属性标注的高质量语音数据集（灵感来自 Spark-TTS，音高按赫兹值切成 0-5 六个 bin，0 表示未知）；从 AR Transformer 和 flow matching 里抽出音色表征，用 **PCA** 压到 128 维；再训一个小模型，把自然语言描述加结构化标签映射进这个音色空间。训练时随机 mask 描述里的关键词，练抗残缺能力。于是用户可以说"给我一个温暖的中年女声，语速稍快"，音色就有了。

**PVC（Professional Voice Clone，专业克隆）。** 零样本够用，但对强口音、声音特质鲜明的说话人还能更狠：把某个说话人的条件 embedding 本身当成可训练参数，AR Transformer 全部冻结，只优化这一个向量；推理时直接用它替换 speaker encoder 的实时输出。每个说话人只是系统里多一个向量，几千个说话人随便挂，训练和部署成本比 SFT 甚至 LoRA 都低。论文给的应用例子是教育场景：针对老师本人声音微调，批量生成个性化课件音频。

## 七、结论与展望

结论就是三件事：可学习 speaker encoder 让零样本克隆不依赖文字稿，跨语言和表现力都占便宜；Flow-VAE 把音质和音色相似度再抬一层；两者合起来撑起 32 语种、客观主观双 SOTA、竞技场登顶。展望只有一句：接下来继续抠可控性和效率。

## 收尾：我的一点看法

看 MiniMax 这篇报告，得先明白语音在它的版图里是什么位置：这是全模态拼图中商业化最早跑通的一块。招股书口径里，MiniMax 2023 年就推出了国内首个 Transformer 架构的语音大模型 Speech-01，API 产品线 T2A-01 一路迭代到 Speech-02 登顶双榜（Artificial Analysis 和 Hugging Face TTS Arena）。商业数据更能说明问题：商用定价是 ElevenLabs 的四分之一；据报道 2025 年年中累计生成语音已达 1.5 亿小时，到 2025 年 9 月底招股书里这个数字涨到超过 2.2 亿小时；LiveKit、Pipecat、Vapi 这些实时语音框架把它选作底层引擎，阅文、高途是客户，AI 玩具、车载座舱、有声书里都有它的声音。语音是 MiniMax 海外收入占比超七成、2026 年 1 月登陆港交所这个故事里，最早的那块基石。

技术上我最欣赏的是那场"定义战"背后的工程判断。把 VALL-E、Seed-TTS 们自称的零样本重新划成 one-shot，不是抠字眼——不要转写稿这件事，斩断了 ASR 错误的传染链，让跨语言变成免费附送的能力，中文参考音频直接去说捷克语，WER 2.823 比带稿的 5.096 低一大截。数字自己会说话。

第二点是"解耦是扩展之母"。音色被 speaker encoder 干净地剥离出来之后，情感 LoRA、T2V、PVC 全成了即插即用的外挂，基座一个字节不用改——这跟图像生成里 ControlNet、IP-Adapter 的哲学一模一样。一个设计喂出三条产品线，这是划算的架构。

不足也坦率说。这份报告偏薄：参数量、训练数据规模、训练算力一概未披露，跟 DeepSeek 那种把家底全亮出来的风格没法比；另外 mel 谱 + 每秒 25 token 这条技术路线，在后续的 Speech 2.x 上已经换掉——据报道 2025 年 10 月的 Speech 2.6 首包延迟压到 250 毫秒以内、语种扩到 40 多种。Speech-02 更像一个承前启后的快照：它证明了方向，但故事后面还在继续。

还有个评估上的微妙之处值得品：WER 打赢真人录音，证明的是发音准确，不是全部音质；真正有分量的证据是竞技场盲听——在不知道模型是谁的情况下，用户就是用耳朵投了票。

---

## 附：核心数据速查

**模型基本盘**
| 项目 | 数值 |
|---|---|
| 架构 | 自回归 Transformer + Latent Flow Matching（Flow-VAE） |
| 支持语言 | 32 种（多语言测试覆盖 24 种） |
| 音频 tokenizer | Encoder-VQ-Decoder，mel 量化，25 tokens/秒，CTC 监督 |
| 版本 | Speech-02-HD（高音质）/ Speech-02-Turbo（不同架构，主打推理速度与成本，面向实时交互） |
| 榜单快照 | Artificial Analysis TTS Arena 第一（2025-05-12），Hugging Face TTS Arena 同登顶 |

**Seed-TTS-eval 克隆成绩（WER↓ / SIM↑）**
| 模型 | test-zh | test-en |
|---|---|---|
| Ground Truth | 1.25 / 0.750 | 2.14 / 0.730 |
| Seed-TTS（one-shot） | 1.12 / 0.796 | 2.25 / 0.762 |
| CosyVoice 2（one-shot） | 1.45 / 0.748 | 2.57 / 0.652 |
| MiniMax zero-shot | 0.83 / 0.783 | 1.65 / 0.692 |
| MiniMax one-shot | 0.99 / 0.799 | 1.90 / 0.738 |

**多语言亮点（vs ElevenLabs Multilingual v2，WER↓）**
| 语言 | MiniMax | ElevenLabs |
|---|---|---|
| 中文 | 2.252 | 16.026 |
| 越南语 | 0.880 | 73.415 |
| 泰语 | 2.701 | 73.936 |
| 粤语 | 34.111 | 51.513 |
| 日语 | 3.519 | 10.646 |

SIM（音色相似度）24 个语种全胜，如中文 0.780 对 0.677。

**Flow-VAE 重合成提升（Dac-VAE → Dac-Flow-VAE）**
| 指标 | 数值 |
|---|---|
| NB PESQ↑ | 4.27 → 4.34 |
| WB PESQ↑ | 4.20 → 4.30 |
| MS-STFT-LOSS↓ | 0.67 → 0.62 |
| SELF-SIM↑ | 0.98 → 0.986 |

**商业化速记（据公开报道）**
- 商用定价约为 ElevenLabs 的四分之一；客户含阅文集团、高途教育
- 累计生成语音：据报道 2025 年年中约 1.5 亿小时；招股书披露 2025 年 9 月底已超 2.2 亿小时
- 被 LiveKit、Pipecat、Vapi 等实时语音平台选为底层引擎；落地 AI 玩具（Haivivi、BubblePal）、Rokid 眼镜、车载座舱等

**关键概念清单**
- zero-shot voice cloning = 零样本音色克隆（只给参考音频，不给文字稿、不做微调）
- one-shot voice cloning = 单样本克隆（额外提供"文本-音频"配对 prompt）
- Speaker Encoder = 说话人编码器（本文核心：可学习、与 AR 联合训练、输出定长音色向量）
- semantic leakage = 语义泄漏（参考音频与目标音频相同导致的性能退化）
- Flow-VAE = VAE 与 normalizing flow 的混合（flow 把 encoder 输出分布变换到标准正态再算 KL）
- flow matching = 流匹配（本文用作连续 latent 特征的生成解码器）
- mel-spectrogram = 梅尔频谱（传统 TTS 的中间表征，本文视为信息瓶颈）
- vocoder = 声码器（把中间表征还原为波形）
- BPE / VQ / CTC = 字节对编码 / 向量量化 / 连接时序分类（tokenizer 三件套）
- WER / SIM = 词错率 / 说话人相似度（克隆的两大客观指标）
- Seed-TTS-eval = Seed-TTS 配套的克隆评测集（约 2000 中文 + 1000 英文）
- TTS Arena = Artificial Analysis 的公开 TTS 竞技场（人类盲听 ELO 计分）
- LoRA / PEFT = 低秩适配 / 参数高效微调（情感控制的热插拔模块）
- T2V = Text to Voice，自然语言描述 + 结构化标签生成音色（PCA 压到 128 维）
- PVC = Professional Voice Clone，只优化单个说话人的条件 embedding
