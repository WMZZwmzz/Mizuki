/**
 * 加密系统端到端测试（协议 v3）
 *
 * 服务端加密逻辑直接从源文件 src/utils/crypto-utils.ts 导入，因此测试中的
 * 常量与算法始终与源码保持同步；这里只复刻无法被直接导入的客户端解密逻辑
 * （PasswordProtection.astro 内联脚本），用于验证服务端加密 → 客户端解密的
 * 端到端往返。
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CRYPTO_CONSTANTS, encryptContent } from "../src/utils/crypto-utils.ts";

// === 客户端解密（复刻 PasswordProtection.astro 内联脚本） ===
async function clientDecrypt(encData, password) {
	const {
		SALT_LENGTH,
		IV_LENGTH,
		AUTH_TAG_LENGTH,
		PBKDF2_ITERATIONS,
		VERIFY_PREFIX,
	} = CRYPTO_CONSTANTS;
	const raw = Buffer.from(encData, "base64");
	const salt = raw.subarray(0, SALT_LENGTH);
	const iv = raw.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
	const authTag = raw.subarray(
		SALT_LENGTH + IV_LENGTH,
		SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
	);
	const ciphertext = raw.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

	const combined = Buffer.concat([ciphertext, authTag]);

	const enc = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		enc.encode(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);
	const aesKey = await crypto.subtle.deriveKey(
		{ name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["decrypt"],
	);
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		aesKey,
		combined,
	);
	const decoded = new TextDecoder().decode(decrypted);

	if (!decoded.startsWith(VERIFY_PREFIX)) {
		throw new Error("Verification prefix mismatch");
	}
	return decoded.substring(VERIFY_PREFIX.length);
}

const testHtml = "<h1>Hello World</h1><p>这是一篇加密文章的内容</p>";
const testPassword = "test-password-123";
const testSlug = "encrypted-test-post";

describe("crypto-utils 常量", () => {
	it("与协议 v3 源码一致（PBKDF2 迭代次数 = OWASP 2024 建议）", () => {
		assert.equal(CRYPTO_CONSTANTS.PBKDF2_ITERATIONS, 600000);
		assert.equal(CRYPTO_CONSTANTS.SALT_LENGTH, 16);
		assert.equal(CRYPTO_CONSTANTS.IV_LENGTH, 12);
		assert.equal(CRYPTO_CONSTANTS.AUTH_TAG_LENGTH, 16);
		assert.equal(CRYPTO_CONSTANTS.KEY_LENGTH, 32);
		assert.equal(CRYPTO_CONSTANTS.VERIFY_PREFIX, "MIZUKI-VERIFY:");
	});
});

describe("加密端到端往返（服务端加密 → 客户端解密）", () => {
	it("正确密码可解密并还原原文", async () => {
		const encrypted = encryptContent(testHtml, testPassword, testSlug);
		assert.ok(encrypted.length > 0, "密文不应为空");
		assert.equal(await clientDecrypt(encrypted, testPassword), testHtml);
	});

	it("协议 v3 使用随机 salt/IV：相同输入产出不同密文", () => {
		const a = encryptContent(testHtml, testPassword, testSlug);
		const b = encryptContent(testHtml, testPassword, testSlug);
		assert.notEqual(a, b, "随机 salt/IV 下相同输入不应产生相同密文");
	});

	it("错误密码解密失败", async () => {
		const encrypted = encryptContent(testHtml, testPassword, testSlug);
		await assert.rejects(() => clientDecrypt(encrypted, "wrong-password"));
	});

	it("slug 变化不影响可解密性（v3 不再依赖 slug 派生 salt/IV）", async () => {
		const encrypted = encryptContent(testHtml, testPassword, "some-other-slug");
		assert.equal(await clientDecrypt(encrypted, testPassword), testHtml);
	});

	it("CJK 内容往返", async () => {
		const cjk = "<p>日本語テスト 中文测试 한국어 테스트</p>";
		const encrypted = encryptContent(cjk, testPassword, testSlug);
		assert.equal(await clientDecrypt(encrypted, testPassword), cjk);
	});

	it("空内容往返", async () => {
		const encrypted = encryptContent("", testPassword, testSlug);
		assert.equal(await clientDecrypt(encrypted, testPassword), "");
	});

	it("特殊 HTML 字符往返", async () => {
		const special =
			'<div class="test">&amp; &lt; &gt; "quotes" \'single\'</div>';
		const encrypted = encryptContent(special, testPassword, testSlug);
		assert.equal(await clientDecrypt(encrypted, testPassword), special);
	});

	it("密文字节布局为 salt | iv | authTag | ciphertext", () => {
		const { SALT_LENGTH, IV_LENGTH, AUTH_TAG_LENGTH, VERIFY_PREFIX } =
			CRYPTO_CONSTANTS;
		const encrypted = encryptContent(testHtml, testPassword, testSlug);
		const raw = Buffer.from(encrypted, "base64");
		const overhead = SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH;
		// AES-GCM 密文长度等于明文（VERIFY_PREFIX + html）的 UTF-8 字节数
		const plaintextBytes = Buffer.byteLength(VERIFY_PREFIX + testHtml, "utf8");
		assert.equal(raw.length, overhead + plaintextBytes);
	});
});
