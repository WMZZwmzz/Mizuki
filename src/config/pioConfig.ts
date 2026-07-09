import type { PioConfig } from "../types/config";
import { keystaticEffects } from "../data/keystatic-effects";

const kp = keystaticEffects.pio;

export const pioConfig: PioConfig = {
	enable: kp.enable ?? true,
	models: [
		"/pio/models/snow_miku/model.json",
		"/pio/models/bilibili-22/index.json",
		"/pio/models/bilibili-33/index.json",
		"/pio/models/HyperdimensionNeptunia/nepnep/index.json",
		"/pio/models/HyperdimensionNeptunia/blanc_normal/index.json",
	],
	position: (kp.position || "left") as "left" | "right",
	width: 280,
	height: 600,
	mode: kp.draggable ? "draggable" : "static",
	hiddenOnMobile: kp.hiddenOnMobile ?? true,
	hideAboutMenu: false,
	dialog: {
		welcome: kp.welcome || "嗨~ 欢迎来到 Mizuki 博客！",
		touch: kp.touchDialog?.length
			? kp.touchDialog
			: ["诶嘿~盯~", "戳我干嘛啦！", "呼呼，好痒呀！"],
		home: "回首页看看吧！",
		skin: ["要不要换个造型？", "新造型不错吧~"],
		close: "拜拜~ 下次见！",
		link: "https://github.com/LyraVoid/Mizuki",
	},
};
