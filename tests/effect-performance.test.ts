import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
	DEFAULT_EFFECT_PERFORMANCE_MODE,
	EFFECT_PERFORMANCE_MODE_STORAGE_KEY,
	EFFICIENCY_FRAME_INTERVAL,
	getEffectFrameInterval,
	getEffectPerformanceMode,
	normalizeEffectPerformanceMode,
	setEffectPerformanceMode,
} from "../src/utils/effect-performance.ts";

const values = new Map<string, string>();
const storage = {
	getItem(key: string) {
		return values.get(key) ?? null;
	},
	setItem(key: string, value: string) {
		values.set(key, value);
	},
};

beforeEach(() => {
	values.clear();
});

describe("effect performance mode", () => {
	it("defaults missing and invalid values to efficiency", () => {
		assert.equal(getEffectPerformanceMode(storage), "efficiency");
		assert.equal(normalizeEffectPerformanceMode("invalid"), "efficiency");
		assert.equal(normalizeEffectPerformanceMode(null), "efficiency");
		assert.equal(DEFAULT_EFFECT_PERFORMANCE_MODE, "efficiency");
	});

	it("stores and restores both supported modes", () => {
		setEffectPerformanceMode("quality", storage);
		assert.equal(values.get(EFFECT_PERFORMANCE_MODE_STORAGE_KEY), "quality");
		assert.equal(getEffectPerformanceMode(storage), "quality");

		setEffectPerformanceMode("efficiency", storage);
		assert.equal(getEffectPerformanceMode(storage), "efficiency");
	});

	it("uses 30 FPS only in efficiency mode", () => {
		assert.equal(
			getEffectFrameInterval("efficiency"),
			EFFICIENCY_FRAME_INTERVAL,
		);
		assert.equal(getEffectFrameInterval("quality"), null);
	});
});
