import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { getStaticOutputDir } from "../scripts/compress-fonts/utils.js";

test("getStaticOutputDir prefers dist/client for SSR builds", () => {
	const distDir = fs.mkdtempSync(path.join(os.tmpdir(), "mizuki-font-dist-"));
	const clientDir = path.join(distDir, "client");
	fs.mkdirSync(clientDir);

	try {
		assert.equal(getStaticOutputDir(distDir), clientDir);
	} finally {
		fs.rmSync(distDir, { recursive: true, force: true });
	}
});

test("getStaticOutputDir falls back to dist for static builds", () => {
	const distDir = fs.mkdtempSync(path.join(os.tmpdir(), "mizuki-font-dist-"));

	try {
		assert.equal(getStaticOutputDir(distDir), distDir);
	} finally {
		fs.rmSync(distDir, { recursive: true, force: true });
	}
});
