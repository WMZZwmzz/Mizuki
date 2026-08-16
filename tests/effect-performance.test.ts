import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
	DEFAULT_EFFECT_PERFORMANCE_MODE,
	EFFECT_PERFORMANCE_MODE_LEVELS,
	EFFECT_PERFORMANCE_MODE_STORAGE_KEY,
	EFFICIENCY_FRAME_INTERVAL,
	getEffectFrameInterval,
	getEffectPerformanceLevel,
	getEffectPerformanceMode,
	getEffectPerformanceModeFromLevel,
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

	it("stores and restores all three supported modes", () => {
		setEffectPerformanceMode("quality", storage);
		assert.equal(values.get(EFFECT_PERFORMANCE_MODE_STORAGE_KEY), "quality");
		assert.equal(getEffectPerformanceMode(storage), "quality");

		setEffectPerformanceMode("efficiency", storage);
		assert.equal(getEffectPerformanceMode(storage), "efficiency");

		setEffectPerformanceMode("minimal", storage);
		assert.equal(getEffectPerformanceMode(storage), "minimal");
	});

	it("uses 30 FPS only in efficiency and minimal modes", () => {
		assert.equal(
			getEffectFrameInterval("efficiency"),
			EFFICIENCY_FRAME_INTERVAL,
		);
		assert.equal(
			getEffectFrameInterval("minimal"),
			EFFICIENCY_FRAME_INTERVAL,
		);
		assert.equal(getEffectFrameInterval("quality"), null);
	});

	it("maps modes to slider levels 1-3 and back", () => {
		assert.deepEqual([...EFFECT_PERFORMANCE_MODE_LEVELS], [
			"minimal",
			"efficiency",
			"quality",
		]);
		assert.equal(getEffectPerformanceLevel("minimal"), 1);
		assert.equal(getEffectPerformanceLevel("efficiency"), 2);
		assert.equal(getEffectPerformanceLevel("quality"), 3);

		assert.equal(getEffectPerformanceModeFromLevel(1), "minimal");
		assert.equal(getEffectPerformanceModeFromLevel(2), "efficiency");
		assert.equal(getEffectPerformanceModeFromLevel(3), "quality");
	});

	it("clamps out-of-range slider levels", () => {
		assert.equal(getEffectPerformanceModeFromLevel(0), "minimal");
		assert.equal(getEffectPerformanceModeFromLevel(4), "quality");
		assert.equal(getEffectPerformanceModeFromLevel(Number.NaN), "minimal");
	});
});
