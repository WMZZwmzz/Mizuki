import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveTargetPathname } from "../src/scripts/core/swup-hooks-utils.ts";

const BASE = "https://example.com/posts/current/";

describe("resolveTargetPathname", () => {
	it("resolves an absolute path href", () => {
		assert.equal(resolveTargetPathname("/about/", BASE), "/about/");
	});

	it("resolves a relative href against the base url", () => {
		assert.equal(
			resolveTargetPathname("../other/", BASE),
			"/posts/other/",
		);
	});

	it("resolves a full url href to its pathname", () => {
		assert.equal(
			resolveTargetPathname("https://example.com/archive/?tag=a", BASE),
			"/archive/",
		);
	});

	it("returns the raw href when it cannot be resolved", () => {
		assert.equal(resolveTargetPathname("/foo", "not a valid base"), "/foo");
	});
});
