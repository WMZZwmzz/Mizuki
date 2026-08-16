import type { LyricLine } from "./types";

/**
 * 双语 LRC 的译文来源有两种：
 * - 原文与译文行共用同一时间戳（或时间差极小），
 *   小于该阈值的相邻行会被合并为 translation。
 * - 行尾半角括号内联译文（如 "原文 (译文)"），由 splitInlineTranslation 拆分。
 */
const TRANSLATION_MERGE_THRESHOLD = 0.05;

const TIME_REGEX = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

/** 译文文本需包含的 CJK 字符（汉字 / 假名 / 全角符号） */
const CJK_PATTERN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/;

/** 行尾半角括号译文（支持一层嵌套），如 "原文 (译文(注))" */
const TRAILING_PAREN_PATTERN = /\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*$/;

/** 纯音乐 LRC 常见的占位文案（如"纯音乐，请欣赏"） */
const INSTRUMENTAL_PATTERN = /纯音乐|请欣赏|instrumental/i;

export function isInstrumentalLyricText(text: string): boolean {
	return INSTRUMENTAL_PATTERN.test(text);
}

/**
 * 拆分行尾的半角括号译文（如 "原文 (译文)"）。
 * 仅当括号内含 CJK 字符、括号外还有原文、且两者文本不同才拆分；
 * 行中全角括号注音与 "(TV Version)" 之类的标注保持原样。
 */
export function splitInlineTranslation(text: string): {
	text: string;
	translation?: string;
} {
	const match = text.match(TRAILING_PAREN_PATTERN);
	if (!match || match.index === undefined) {
		return { text };
	}
	const original = text.slice(0, match.index).trim();
	const translation = match[1].trim();
	if (
		!original ||
		!translation ||
		original === translation ||
		!CJK_PATTERN.test(translation)
	) {
		return { text };
	}
	return { text: original, translation };
}

/**
 * 将 Meting API 返回的 tlyric（译文歌词）追加到原文后，
 * 由 parseLRC 按相同时间戳合并为 translation。
 */
export function appendTranslatedLyric(
	lrcText: string,
	tlyric: unknown,
): string {
	if (!lrcText || typeof tlyric !== "string" || !tlyric.trim()) {
		return lrcText;
	}
	return `${lrcText}\n${tlyric}`;
}

export function parseLRC(lrcString: string): LyricLine[] {
	const lines = lrcString.split("\n");
	const raw: LyricLine[] = [];

	for (const line of lines) {
		const times: number[] = [];
		let lastEnd = 0;
		const matches = [...line.matchAll(TIME_REGEX)];
		for (const match of matches) {
			const minutes = Number.parseInt(match[1], 10);
			const seconds = Number.parseInt(match[2], 10);
			const ms = match[3] ? Number.parseInt(match[3].padEnd(3, "0"), 10) : 0;
			times.push(minutes * 60 + seconds + ms / 1000);
			lastEnd = (match.index ?? 0) + match[0].length;
		}
		const text = line.slice(lastEnd).trim();
		if (!text) {
			continue;
		}
		for (const time of times) {
			raw.push({ time, ...splitInlineTranslation(text) });
		}
	}

	raw.sort((a, b) => a.time - b.time);

	const result: LyricLine[] = [];
	for (const entry of raw) {
		const prev = result[result.length - 1];
		if (
			prev &&
			!prev.translation &&
			prev.text !== entry.text &&
			entry.time - prev.time < TRANSLATION_MERGE_THRESHOLD
		) {
			prev.translation = entry.text;
			continue;
		}
		result.push(entry);
	}
	return result;
}
