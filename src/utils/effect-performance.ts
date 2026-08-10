export type EffectPerformanceMode = "efficiency" | "quality";

export const DEFAULT_EFFECT_PERFORMANCE_MODE: EffectPerformanceMode =
	"efficiency";
export const EFFECT_PERFORMANCE_MODE_STORAGE_KEY = "effectPerformanceMode";
export const EFFECT_PERFORMANCE_MODE_EVENT = "effect-performance-mode-change";
export const EFFICIENCY_FRAME_INTERVAL = 1000 / 30;

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
	return value === "quality" ? "quality" : DEFAULT_EFFECT_PERFORMANCE_MODE;
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
	return mode === "efficiency" ? EFFICIENCY_FRAME_INTERVAL : null;
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
