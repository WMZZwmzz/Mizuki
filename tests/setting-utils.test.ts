/**
 * 歌单 ID 读写函数（getStoredMusicPlaylistId / setMusicPlaylistId）单元测试
 *
 * setting-utils.ts 通过路径别名（@constants/*、@/config）引入依赖，而
 * node --test 不解析 tsconfig 别名；且 @/config 聚合入口会连带加载含
 * enum 的 types/config.ts（Node 类型剥离不支持 enum）。因此这里通过
 * module.registerHooks 将别名解析到真实的单个配置源文件，保证测试中的
 * 默认值与源码实时同步，不复制任何常量。
 */
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { beforeEach, describe, it } from "node:test";

const srcUrl = new URL("../src/", import.meta.url);
const CONFIG_STUB_URL = "mizuki-test:config";
// 只从可被 Node 直接加载的单个配置文件中重导出 setting-utils 需要的名称
const configStubSource = [
	`export { musicPlayerConfig } from ${JSON.stringify(new URL("config/musicConfig.ts", srcUrl).href)};`,
	`export { fullscreenWallpaperConfig } from ${JSON.stringify(new URL("config/backgroundWallpaper.ts", srcUrl).href)};`,
	`export { sakuraConfig } from ${JSON.stringify(new URL("config/effectsConfig.ts", srcUrl).href)};`,
	`export { siteConfig } from ${JSON.stringify(new URL("config/siteConfig.ts", srcUrl).href)};`,
].join("\n");

registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier === "@/config") {
			return { url: CONFIG_STUB_URL, shortCircuit: true };
		}
		if (specifier === "@constants/constants") {
			return nextResolve(
				new URL("constants/constants.ts", srcUrl).href,
				context,
			);
		}
		try {
			return nextResolve(specifier, context);
		} catch (error) {
			// 源码内部的相对导入省略了扩展名（如 ../data/keystatic-music），
			// Node ESM 解析失败时补 .ts 重试
			if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
				return nextResolve(`${specifier}.ts`, context);
			}
			throw error;
		}
	},
	load(url, context, nextLoad) {
		if (url === CONFIG_STUB_URL) {
			return { source: configStubSource, format: "module", shortCircuit: true };
		}
		return nextLoad(url, context);
	},
});

// 被测函数只在调用时访问 localStorage，用内存实现代替浏览器环境
const store = new Map<string, string>();
globalThis.localStorage = {
	getItem: (key: string) => store.get(key) ?? null,
	setItem: (key: string, value: string) => {
		store.set(key, String(value));
	},
	removeItem: (key: string) => {
		store.delete(key);
	},
	clear: () => {
		store.clear();
	},
} as unknown as Storage;

const {
	clearStoredMusicPlaylistId,
	getDefaultMusicPlaylistId,
	getStoredMusicPlaylistId,
	setMusicPlaylistId,
} = await import("../src/utils/setting-utils.ts");

const DEFAULT_ID = getDefaultMusicPlaylistId();
const STORAGE_KEY = "musicPlaylistId";

beforeEach(() => {
	store.clear();
});

describe("getStoredMusicPlaylistId", () => {
	it("默认 ID 来自配置且不含两端空白", () => {
		assert.equal(typeof DEFAULT_ID, "string");
		assert.equal(DEFAULT_ID, DEFAULT_ID.trim());
	});

	it("未存储任何值时回退到默认 ID", () => {
		assert.equal(getStoredMusicPlaylistId(), DEFAULT_ID);
	});

	it("存储空串时回退到默认 ID", () => {
		localStorage.setItem(STORAGE_KEY, "");
		assert.equal(getStoredMusicPlaylistId(), DEFAULT_ID);
	});

	it("存储纯空白（非法输入）时回退到默认 ID", () => {
		localStorage.setItem(STORAGE_KEY, "  \t\n ");
		assert.equal(getStoredMusicPlaylistId(), DEFAULT_ID);
	});

	it("存储值两端空白会被去除后返回", () => {
		localStorage.setItem(STORAGE_KEY, "  123456  ");
		assert.equal(getStoredMusicPlaylistId(), "123456");
	});

	it("存储合法 ID 时原样返回", () => {
		localStorage.setItem(STORAGE_KEY, "987654321");
		assert.equal(getStoredMusicPlaylistId(), "987654321");
	});
});

describe("setMusicPlaylistId", () => {
	it("合法 ID 去除两端空白后写入存储", () => {
		setMusicPlaylistId("  246810  ");
		assert.equal(localStorage.getItem(STORAGE_KEY), "246810");
		assert.equal(getStoredMusicPlaylistId(), "246810");
	});

	it("空串输入清除存储并回退到默认 ID", () => {
		setMusicPlaylistId("246810");
		setMusicPlaylistId("");
		assert.equal(localStorage.getItem(STORAGE_KEY), null);
		assert.equal(getStoredMusicPlaylistId(), DEFAULT_ID);
	});

	it("纯空白（非法输入）清除存储并回退到默认 ID", () => {
		setMusicPlaylistId("246810");
		setMusicPlaylistId("   ");
		assert.equal(localStorage.getItem(STORAGE_KEY), null);
		assert.equal(getStoredMusicPlaylistId(), DEFAULT_ID);
	});

	it("写入与默认 ID 相同的值时不落盘", () => {
		setMusicPlaylistId(DEFAULT_ID);
		assert.equal(localStorage.getItem(STORAGE_KEY), null);
		assert.equal(getStoredMusicPlaylistId(), DEFAULT_ID);
	});

	it("写入带空白的默认 ID 时同样不落盘", () => {
		setMusicPlaylistId(`  ${DEFAULT_ID}  `);
		assert.equal(localStorage.getItem(STORAGE_KEY), null);
		assert.equal(getStoredMusicPlaylistId(), DEFAULT_ID);
	});
});

describe("clearStoredMusicPlaylistId", () => {
	it("清除已存储的歌单 ID 并回退到默认 ID", () => {
		setMusicPlaylistId("246810");
		clearStoredMusicPlaylistId();
		assert.equal(localStorage.getItem(STORAGE_KEY), null);
		assert.equal(getStoredMusicPlaylistId(), DEFAULT_ID);
	});

	it("无存储值时调用不报错且保持默认 ID", () => {
		clearStoredMusicPlaylistId();
		assert.equal(localStorage.getItem(STORAGE_KEY), null);
		assert.equal(getStoredMusicPlaylistId(), DEFAULT_ID);
	});
});
