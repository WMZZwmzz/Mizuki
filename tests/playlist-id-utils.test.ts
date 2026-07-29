/**
 * 歌单 ID 纯解析/容错逻辑（playlist-id-utils.ts）单元测试
 *
 * 模块无浏览器与路径别名依赖，可被 node --test 直接加载。
 * 覆盖有效 ID、分享链接提取、无效格式与解析失败分支，
 * 以及 musicPlayerStore 加载歌单时的 ID 兜底逻辑。
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { extractPlaylistId, FALLBACK_METING_PLAYLIST_ID, resolveMetingPlaylistId } =
	await import("../src/utils/playlist-id-utils.ts");

describe("extractPlaylistId", () => {
	it("纯数字 ID 原样返回", () => {
		assert.equal(extractPlaylistId("5214665147"), "5214665147");
	});

	it("纯数字 ID 两端空白会被去除", () => {
		assert.equal(extractPlaylistId("  5214665147\n"), "5214665147");
	});

	it("从分享链接的 id 参数提取，不误取 creatorId", () => {
		assert.equal(
			extractPlaylistId(
				"https://music.163.com/m/playlist?id=5214665147&creatorId=3875704956",
			),
			"5214665147",
		);
	});

	it("支持 & 与 # 前缀的 id 参数", () => {
		assert.equal(
			extractPlaylistId("https://music.163.com/?foo=1&id=123456"),
			"123456",
		);
		assert.equal(extractPlaylistId("https://music.163.com/#id=654321"), "654321");
	});

	it("id 参数名大小写不敏感", () => {
		assert.equal(
			extractPlaylistId("https://music.163.com/m/playlist?ID=112233"),
			"112233",
		);
	});

	it("支持 playlist/ 路径与 playlist= 形式", () => {
		assert.equal(
			extractPlaylistId("https://music.163.com/playlist/778899"),
			"778899",
		);
		assert.equal(extractPlaylistId("playlist=445566"), "445566");
	});

	it("链接前后混有分享文案时仍能提取", () => {
		assert.equal(
			extractPlaylistId(
				"分享一个歌单 https://music.163.com/m/playlist?id=5214665147&creatorId=1 快来听",
			),
			"5214665147",
		);
	});

	it("空串与纯空白（无效格式）返回空串", () => {
		assert.equal(extractPlaylistId(""), "");
		assert.equal(extractPlaylistId("   \t\n"), "");
	});

	it("非数字文本（无效格式）返回空串", () => {
		assert.equal(extractPlaylistId("abc"), "");
		assert.equal(extractPlaylistId("12a34"), "");
	});

	it("链接中无可提取 id（解析失败）返回空串", () => {
		assert.equal(extractPlaylistId("https://music.163.com/"), "");
		// 仅有 creatorId 时不得误取
		assert.equal(
			extractPlaylistId("https://music.163.com/m/playlist?creatorId=3875704956"),
			"",
		);
	});
});

describe("resolveMetingPlaylistId", () => {
	it("存储 ID 有效时优先使用存储 ID 并标记来源", () => {
		assert.deepEqual(resolveMetingPlaylistId("5214665147", "111"), {
			id: "5214665147",
			fromStoredId: true,
		});
	});

	it("存储 ID 为空时回退到配置默认 ID", () => {
		assert.deepEqual(resolveMetingPlaylistId("", "111"), {
			id: "111",
			fromStoredId: false,
		});
	});

	it("存储与配置 ID 均为空时回退到兜底 ID", () => {
		assert.deepEqual(resolveMetingPlaylistId(""), {
			id: FALLBACK_METING_PLAYLIST_ID,
			fromStoredId: false,
		});
		assert.deepEqual(resolveMetingPlaylistId("", ""), {
			id: FALLBACK_METING_PLAYLIST_ID,
			fromStoredId: false,
		});
	});

	it("兜底 ID 为非空纯数字", () => {
		assert.match(FALLBACK_METING_PLAYLIST_ID, /^\d+$/);
	});
});
