// CSS !important 门禁检查（docs/rule/04-css-style-guide.md 的机械化检查）
//
// 规则：src/ 下的样式文件禁止新增 !important。
// - Twikoo 相关样式文件（文件名含 twikoo）按规范允许使用，完全豁免。
// - 存量 !important 记录在 check-important.baseline.json 中（棘轮基线），
//   任何文件的 !important 数量超过基线（新文件基线为 0）即失败。
// - 存量清理后请同步调低基线，防止回弹。
//
// 用法：node scripts/check-important.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const baselinePath = path.join(__dirname, "check-important.baseline.json");

const STYLE_EXTS = new Set([".css", ".styl", ".scss", ".sass", ".less"]);

function isTwikooFile(relPath) {
	return path.basename(relPath).toLowerCase().includes("twikoo");
}

function collectStyleFiles(dir, results = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			collectStyleFiles(fullPath, results);
		} else if (STYLE_EXTS.has(path.extname(entry.name).toLowerCase())) {
			results.push(fullPath);
		}
	}
	return results;
}

function countImportant(filePath) {
	const content = fs.readFileSync(filePath, "utf8");
	return (content.match(/!\s*important/gi) || []).length;
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

const violations = [];
const improvements = [];

for (const filePath of collectStyleFiles(srcDir)) {
	const relPath = path.relative(rootDir, filePath).split(path.sep).join("/");
	if (isTwikooFile(relPath)) continue; // Twikoo 例外，见样式规范

	const count = countImportant(filePath);
	const allowed = baseline[relPath] ?? 0;
	if (count > allowed) {
		violations.push({ relPath, count, allowed });
	} else if (count < allowed) {
		improvements.push({ relPath, count, allowed });
	}
}

for (const { relPath, count, allowed } of improvements) {
	console.log(
		`[check-important] 提示：${relPath} 的 !important 已降至 ${count}（基线 ${allowed}），建议同步调低 scripts/check-important.baseline.json`,
	);
}

if (violations.length > 0) {
	console.error(
		"[check-important] 检测到新增 !important（违反 docs/rule/04-css-style-guide.md）：",
	);
	for (const { relPath, count, allowed } of violations) {
		console.error(`  - ${relPath}：当前 ${count} 处，基线允许 ${allowed} 处`);
	}
	console.error(
		"[check-important] 请改用选择器优先级 / CSS 变量 / Tailwind 类；仅 Twikoo 样式或经团队审批的例外允许 !important。",
	);
	process.exit(1);
}

console.log("[check-important] 通过：src/ 样式文件未新增 !important。");
