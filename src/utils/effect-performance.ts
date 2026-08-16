export type EffectPerformanceMode = "minimal" | "efficiency" | "quality";

export const DEFAULT_EFFECT_PERFORMANCE_MODE: EffectPerformanceMode =
	"efficiency";
export const EFFECT_PERFORMANCE_MODE_STORAGE_KEY = "effectPerformanceMode";
export const EFFECT_PERFORMANCE_MODE_EVENT = "effect-performance-mode-change";
export const EFFICIENCY_FRAME_INTERVAL = 1000 / 30;

/** 档位从低到高排列，与设置面板滑块的 1/2/3 档一一对应 */
export const EFFECT_PERFORMANCE_MODE_LEVELS: readonly EffectPerformanceMode[] =
	["minimal", "efficiency", "quality"];

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

function getBrowserStorage(): Storage | null {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

export function normalizeEffectPerformanceMode(
	value: unknown,
): EffectPerformanceMode {
	return EFFECT_PERFORMANCE_MODE_LEVELS.includes(value as EffectPerformanceMode)
		? (value as EffectPerformanceMode)
		: DEFAULT_EFFECT_PERFORMANCE_MODE;
}

export function getEffectPerformanceMode(
	storage: StorageReader | null = getBrowserStorage(),
): EffectPerformanceMode {
	if (!storage) return DEFAULT_EFFECT_PERFORMANCE_MODE;
	try {
		return normalizeEffectPerformanceMode(
			storage.getItem(EFFECT_PERFORMANCE_MODE_STORAGE_KEY),
		);
	} catch {
		return DEFAULT_EFFECT_PERFORMANCE_MODE;
	}
}

export function getEffectFrameInterval(
	mode: EffectPerformanceMode,
): number | null {
	return mode === "quality" ? null : EFFICIENCY_FRAME_INTERVAL;
}

/** 档位名 → 滑块等级（1=极简 2=效率 3=画面） */
export function getEffectPerformanceLevel(mode: EffectPerformanceMode): number {
	const index = EFFECT_PERFORMANCE_MODE_LEVELS.indexOf(mode);
	return (index < 0 ? 1 : index) + 1;
}

/** 滑块等级 → 档位名，越界时钳制到 1~3 档 */
export function getEffectPerformanceModeFromLevel(
	level: number,
): EffectPerformanceMode {
	const clamped = Math.min(
		Math.max(Math.trunc(level) || 1, 1),
		EFFECT_PERFORMANCE_MODE_LEVELS.length,
	);
	return EFFECT_PERFORMANCE_MODE_LEVELS[clamped - 1];
}

export function setEffectPerformanceMode(
	mode: EffectPerformanceMode,
	storage: StorageWriter | null = getBrowserStorage(),
): EffectPerformanceMode {
	const normalizedMode = normalizeEffectPerformanceMode(mode);
	try {
		storage?.setItem(EFFECT_PERFORMANCE_MODE_STORAGE_KEY, normalizedMode);
	} catch {
		// 存储不可用时仍让当前页面立即应用所选模式。
	}

	if (typeof document !== "undefined") {
		document.documentElement.dataset.effectPerformanceMode = normalizedMode;
	}
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent(EFFECT_PERFORMANCE_MODE_EVENT, {
				detail: { mode: normalizedMode },
			}),
		);
	}
	return normalizedMode;
}
