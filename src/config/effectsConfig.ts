import type { SakuraConfig } from "../types/config";
import { keystaticEffects } from "../data/keystatic-effects";

const ks = keystaticEffects.sakura;

export const sakuraConfig: SakuraConfig = {
	enable: ks.enable ?? false,
	switchable: ks.switchable ?? true,
	sakuraNum: ks.sakuraNum ?? 21,
	limitTimes: -1,
	size: {
		min: 0.5,
		max: 1.1,
	},
	opacity: {
		min: 0.3,
		max: 0.9,
	},
	speed: {
		horizontal: { min: -1.7, max: -1.2 },
		vertical: { min: 1.5, max: 2.2 },
		rotation: 0.03,
		fadeSpeed: 0.03,
	},
	zIndex: 100,
};
