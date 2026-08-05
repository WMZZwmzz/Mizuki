// Keystatic 加密功能端到端测试
// 1. 验证 crypto-utils.ts encryptContent 加密的内容能被浏览器端解密逻辑（Web Crypto API）解密
// 2. 验证 sync-keystatic.mjs 的 autoEncryptPosts 逻辑：明文+密码 → 密文，清空 content，删除 password
// 3. 验证错误密码无法解密
// 运行： npx tsx tests/keystatic-encrypt-e2e.test.ts

import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { encryptContent, CRYPTO_CONSTANTS } from "../src/utils/crypto-utils.ts";

const { subtle } = webcrypto;
const VERIFY_PREFIX = CRYPTO_CONSTANTS.VERIFY_PREFIX;

// 精确复刻浏览器端 PasswordProtection.astro 的解密逻辑（Web Crypto API）
// 注意：必须用 Uint8Array.slice 而非 Buffer.subarray，后者传给 subtle.decrypt 会失败
function base64ToUint8Array(b64: string): Uint8Array {
	const bin = Buffer.from(b64, "base64");
	const arr = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) arr[i] = bin[i]!;
	return arr;
}

function parseEncData(encData: string) {
	const raw = base64ToUint8Array(encData);
	const SALT_LENGTH = CRYPTO_CONSTANTS.SALT_LENGTH;
	const IV_LENGTH = CRYPTO_CONSTANTS.IV_LENGTH;
	const AUTH_TAG_LENGTH = CRYPTO_CONSTANTS.AUTH_TAG_LENGTH;
	const salt = raw.slice(0, SALT_LENGTH);
	const iv = raw.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
	const authTag = raw.slice(
		SALT_LENGTH + IV_LENGTH,
		SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
	);
	const ciphertext = raw.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
	const combined = new Uint8Array(ciphertext.length + AUTH_TAG_LENGTH);
	combined.set(ciphertext, 0);
	combined.set(authTag, ciphertext.length);
	return { salt, iv, combined };
}

async function decryptContent(
	encData: string,
	password: string,
): Promise<string> {
	const parsed = parseEncData(encData);
	const enc = new TextEncoder();
	const keyMaterial = await subtle.importKey(
		"raw",
		enc.encode(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);
	const aesKey = await subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: parsed.salt,
			iterations: CRYPTO_CONSTANTS.PBKDF2_ITERATIONS,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		true,
		["decrypt"],
	);
	const decrypted = await subtle.decrypt(
		{ name: "AES-GCM", iv: parsed.iv },
		aesKey,
		parsed.combined,
	);
	const decoded = new TextDecoder().decode(decrypted);
	if (!decoded.startsWith(VERIFY_PREFIX)) {
		throw new Error("Verification prefix mismatch");
	}
	return decoded.substring(VERIFY_PREFIX.length);
}

async function run() {
	const tests: { name: string; fn: () => Promise<void> }[] = [];

	tests.push({
		name: "加解密循环：相同密码能还原原文",
		fn: async () => {
			const html = "<h1>你好世界</h1><p>测试加密内容 test123</p>";
			const password = "MySecretPass123";
			const slug = "test-post";
			const encrypted = encryptContent(html, password, slug);
			assert.ok(encrypted, "加密结果不应为空");
			assert.notEqual(encrypted, html, "密文不应等于明文");
			const decrypted = await decryptContent(encrypted, password);
			assert.equal(decrypted, html, "解密后应与原文一致");
		},
	});

	tests.push({
		name: "每次加密产生不同密文（随机 salt/iv）",
		fn: async () => {
			const html = "<p>same content</p>";
			const password = "pass";
			const e1 = encryptContent(html, password, "s");
			const e2 = encryptContent(html, password, "s");
			assert.notEqual(e1, e2, "相同内容两次加密应产生不同密文");
			assert.equal(await decryptContent(e1, password), html);
			assert.equal(await decryptContent(e2, password), html);
		},
	});

	tests.push({
		name: "错误密码无法解密",
		fn: async () => {
			const html = "<p>secret</p>";
			const encrypted = encryptContent(html, "correct-pass", "s");
			await assert.rejects(
				() => decryptContent(encrypted, "wrong-pass"),
				(error: unknown) => {
					// 错误密码：GCM authTag 校验失败 → OperationError；或前缀不匹配
					const name = (error as Error)?.name ?? "";
					const msg = (error as Error)?.message ?? "";
					return (
						name === "OperationError" ||
						/decrypt|Verification|mismatch|operation/i.test(msg)
					);
				},
				"错误密码应抛出解密错误",
			);
		},
	});

	tests.push({
		name: "密文格式：base64 解码后长度 = salt+iv+authTag+明文",
		fn: async () => {
			const html = "x";
			const encrypted = encryptContent(html, "p", "s");
			const raw = Buffer.from(encrypted, "base64");
			const expectedMin =
				CRYPTO_CONSTANTS.SALT_LENGTH +
				CRYPTO_CONSTANTS.IV_LENGTH +
				CRYPTO_CONSTANTS.AUTH_TAG_LENGTH +
				Buffer.byteLength(VERIFY_PREFIX + html, "utf8");
			assert.ok(
				raw.length >= expectedMin,
				`密文原始长度 ${raw.length} 应 >= ${expectedMin}`,
			);
		},
	});

	tests.push({
		name: "中文/特殊字符/Emoji 加密后正确还原",
		fn: async () => {
			const html = "<p>中文测试 🎉 emoji & special < > \" ' chars</p>";
			const encrypted = encryptContent(html, "密码密码", "测试");
			const decrypted = await decryptContent(encrypted, "密码密码");
			assert.equal(decrypted, html, "中文/emoji 解密应一致");
		},
	});

	// 模拟 sync-keystatic.mjs autoEncryptPosts 的逻辑
	tests.push({
		name: "sync autoEncrypt 逻辑：明文+密码 → 密文，清空 content，删除 password",
		fn: async () => {
			// 模拟 Keystatic 保存后的 post JSON 状态
			const post = {
				encrypted: true,
				encryptedContent: "",
				content: "这是需要加密的正文内容",
				password: "test-password-123",
			};
			// 复刻 autoEncryptPosts 的核心判断与转换
			assert.ok(
				post.encrypted &&
					!post.encryptedContent &&
					(post.content || "").trim() &&
					post.password,
				"应满足待加密条件",
			);
			post.encryptedContent = encryptContent(
				post.content,
				post.password,
				"sync-test",
			);
			post.content = "";
			delete post.password;
			// 验证转换结果
			assert.ok(post.encryptedContent, "加密后应有密文");
			assert.equal(post.content, "", "content 应被清空");
			assert.equal(
				("password" in post),
				false,
				"password 字段应被删除",
			);
			// 验证密文可被原密码解密
			const decrypted = await decryptContent(
				post.encryptedContent,
				"test-password-123",
			);
			assert.equal(
				decrypted,
				"这是需要加密的正文内容",
				"密文应能还原原始正文",
			);
		},
	});

	let pass = 0;
	let fail = 0;
	for (const t of tests) {
		try {
			await t.fn();
			console.log(`  ok - ${t.name}`);
			pass++;
		} catch (err) {
			console.log(`  NOT ok - ${t.name}`);
			console.log(`    ${err instanceof Error ? err.message : String(err)}`);
			fail++;
		}
	}
	console.log(`\n# tests ${tests.length}`);
	console.log(`# pass ${pass}`);
	console.log(`# fail ${fail}`);
	if (fail > 0) process.exit(1);
}

run();
