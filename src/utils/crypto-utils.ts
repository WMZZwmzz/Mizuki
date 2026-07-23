import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";

// 共享加密常量 — 客户端 PasswordProtection.astro 中的内联脚本必须保持同步
export const CRYPTO_CONSTANTS = {
	PBKDF2_ITERATIONS: 600000,
	SALT_LENGTH: 16,
	IV_LENGTH: 12,
	AUTH_TAG_LENGTH: 16,
	KEY_LENGTH: 32,
	VERIFY_PREFIX: "MIZUKI-VERIFY:", // 验证前缀：正确解密后内容以此开头
} as const;

/**
 * 加密 HTML 内容
 *
 * 协议 v3：使用随机 salt 和 IV（每次加密唯一），修复 v2 中确定性派生导致的
 * GCM IV 复用问题。PBKDF2 迭代次数提升至 600,000（OWASP 2024 建议）。
 *
 * 输出格式：base64(salt[16] + iv[12] + authTag[16] + ciphertext)
 * 其中 ciphertext = AES-256-GCM-encrypt("MIZUKI-VERIFY:" + html)
 */
export function encryptContent(
	html: string,
	password: string,
	_slug: string,
): string {
	const {
		PBKDF2_ITERATIONS,
		SALT_LENGTH,
		IV_LENGTH,
		KEY_LENGTH,
		VERIFY_PREFIX,
	} = CRYPTO_CONSTANTS;

	const plaintext = VERIFY_PREFIX + html;

	const salt = randomBytes(SALT_LENGTH);
	const iv = randomBytes(IV_LENGTH);
	const key = pbkdf2Sync(
		password,
		salt,
		PBKDF2_ITERATIONS,
		KEY_LENGTH,
		"sha256",
	);

	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();

	return Buffer.concat([salt, iv, authTag, encrypted]).toString("base64");
}
