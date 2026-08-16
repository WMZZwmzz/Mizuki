/**
 * LRC 解析与双语合并逻辑（parseLrc.ts）单元测试
 *
 * 模块无浏览器与路径别名依赖，可被 node --test 直接加载。
 * 覆盖时间标签解析、相同时间戳的译文合并、重复行去重、
 * tlyric 追加以及纯音乐占位文案判断。
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { appendTranslatedLyric, isInstrumentalLyricText, parseLRC } =
	await import("../src/components/widgets/music-player/parseLrc.ts");

describe("parseLRC", () => {
	it("解析基本时间标签为秒", () => {
		const result = parseLRC("[01:02.50]hello");
		assert.deepEqual(result, [{ time: 62.5, text: "hello" }]);
	});

	it("支持无毫秒与两位毫秒写法", () => {
		const result = parseLRC("[00:10]a\n[00:11.20]b");
		assert.deepEqual(result[0], { time: 10, text: "a" });
		assert.equal(result[1].time, 11.2);
	});

	it("同一行多个时间标签展开为多条", () => {
		const result = parseLRC("[00:01][00:05]refrain");
		assert.equal(result.length, 2);
		assert.ok(result.every((line) => line.text === "refrain"));
	});

	it("结果按时间排序", () => {
		const result = parseLRC("[00:30]c\n[00:10]a\n[00:20]b");
		assert.deepEqual(
			result.map((line) => line.text),
			["a", "b", "c"],
		);
	});

	it("空文本行与无时间标签行被忽略", () => {
		assert.deepEqual(parseLRC("[00:01]\n纯文本"), []);
	});

	it("相同时间戳的下一行合并为 translation", () => {
		const result = parseLRC("[00:10]hello\n[00:10]你好");
		assert.equal(result.length, 1);
		assert.equal(result[0].text, "hello");
		assert.equal(result[0].translation, "你好");
	});

	it("时间差小于 50ms 的相邻行合并为 translation", () => {
		const result = parseLRC("[00:10.00]hello\n[00:10.04]你好");
		assert.equal(result.length, 1);
		assert.equal(result[0].translation, "你好");
	});

	it("时间差超过阈值不合并", () => {
		const result = parseLRC("[00:10.00]hello\n[00:10.10]world");
		assert.equal(result.length, 2);
		assert.equal(result[0].translation, undefined);
	});

	it("重复的相同文本行不会被当作译文", () => {
		const result = parseLRC("[00:10][00:10]echo");
		assert.equal(result.length, 2);
		assert.ok(result.every((line) => line.translation === undefined));
	});

	it("每行只保留一条译文，第三行独立成条目", () => {
		const result = parseLRC("[00:10]a\n[00:10]b\n[00:10]c");
		assert.equal(result.length, 2);
		assert.equal(result[0].translation, "b");
		assert.equal(result[1].text, "c");
	});

	it("行尾半角括号内联译文拆分到 translation", () => {
		const result = parseLRC("[00:10]でもそんなんじゃ だめ (但是那样不行哦)");
		assert.deepEqual(result, [
			{ time: 10, text: "でもそんなんじゃ だめ", translation: "但是那样不行哦" },
		]);
	});

	it("括号译文支持一层嵌套", () => {
		const result = parseLRC("[00:10]うまぴょい (うまぴょい(馬兎跳躍))");
		assert.equal(result[0].text, "うまぴょい");
		assert.equal(result[0].translation, "うまぴょい(馬兎跳躍)");
	});

	it("括号内不含 CJK 字符时不拆分", () => {
		const result = parseLRC("[00:10]We Are Number One (Instrumental Version)");
		assert.deepEqual(result, [
			{ time: 10, text: "We Are Number One (Instrumental Version)" },
		]);
	});

	it("括号内容与原文相同时不拆分", () => {
		const result = parseLRC("[00:10]うまぴょい (うまぴょい)");
		assert.equal(result[0].text, "うまぴょい (うまぴょい)");
		assert.equal(result[0].translation, undefined);
	});

	it("整行都是括号时不拆分", () => {
		const result = parseLRC("[00:10] (（各就各位，预备，跑）)");
		assert.equal(result[0].text, "(（各就各位，预备，跑）)");
		assert.equal(result[0].translation, undefined);
	});

	it("行中全角括号注音保持原样，行尾译文仍拆分", () => {
		const result = parseLRC(
			"[00:10]磊々落々（らいらいらくらく）反戦国家 (光明磊落反战国家)",
		);
		assert.equal(result[0].text, "磊々落々（らいらいらくらく）反戦国家");
		assert.equal(result[0].translation, "光明磊落反战国家");
	});
});

describe("appendTranslatedLyric", () => {
	it("原文与译文均为字符串时拼接", () => {
		assert.equal(
			appendTranslatedLyric("[00:10]a", "[00:10]甲"),
			"[00:10]a\n[00:10]甲",
		);
	});

	it("原文为空时不追加", () => {
		assert.equal(appendTranslatedLyric("", "[00:10]甲"), "");
	});

	it("译文缺失 / 非字符串 / 空白时不追加", () => {
		assert.equal(appendTranslatedLyric("[00:10]a", undefined), "[00:10]a");
		assert.equal(appendTranslatedLyric("[00:10]a", 123), "[00:10]a");
		assert.equal(appendTranslatedLyric("[00:10]a", "  \n"), "[00:10]a");
	});

	it("拼接后可被 parseLRC 合并为双语行", () => {
		const merged = appendTranslatedLyric(
			"[00:10]hello",
			"[00:10]你好",
		);
		const result = parseLRC(merged);
		assert.equal(result.length, 1);
		assert.equal(result[0].translation, "你好");
	});
});

describe("isInstrumentalLyricText", () => {
	it("识别常见纯音乐占位文案", () => {
		assert.ok(isInstrumentalLyricText("纯音乐，请欣赏"));
		assert.ok(isInstrumentalLyricText("纯音乐。"));
		assert.ok(isInstrumentalLyricText("请欣赏"));
		assert.ok(isInstrumentalLyricText("Instrumental"));
		assert.ok(isInstrumentalLyricText("this is an INSTRUMENTAL track"));
	});

	it("正常歌词不被误判", () => {
		assert.ok(!isInstrumentalLyricText("风吹过了山岗"));
		assert.ok(!isInstrumentalLyricText("where is my mind"));
		assert.ok(!isInstrumentalLyricText("纯真年代")); // "纯"字不触发
	});
});
