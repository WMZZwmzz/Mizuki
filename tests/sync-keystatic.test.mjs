import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildPostMarkdown } from "../scripts/sync-keystatic.mjs";

describe("buildPostMarkdown", () => {
	it("converts a full post JSON into markdown with YAML frontmatter", () => {
		const md = buildPostMarkdown("hello-world", {
			title: "Hello World",
			published: "2026-01-01",
			draft: true,
			tags: ["astro", "博客"],
			category: "tech",
			content: "# 正文内容",
		});

		assert.ok(md.startsWith("---\n"));
		assert.ok(md.includes('title: "Hello World"'));
		assert.ok(md.includes('published: "2026-01-01"'));
		assert.ok(md.includes("draft: true"));
		assert.ok(md.includes('tags: ["astro", "博客"]'));
		assert.ok(md.includes('category: "tech"'));
		assert.ok(md.endsWith("---\n\n# 正文内容\n"));
	});

	it("falls back to slug as title and omits unset optional fields", () => {
		const md = buildPostMarkdown("my-post", {});

		assert.ok(md.includes('title: "my-post"'));
		assert.ok(!md.includes("draft:"));
		assert.ok(!md.includes("tags:"));
		assert.ok(!md.includes("password:"));
	});

	it("keeps comment: false only when explicitly disabled", () => {
		const disabled = buildPostMarkdown("a", { comment: false });
		const enabled = buildPostMarkdown("a", { comment: true });

		assert.ok(disabled.includes("comment: false"));
		assert.ok(!enabled.includes("comment:"));
	});
});
