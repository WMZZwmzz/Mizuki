#!/usr/bin/env node
/**
 * 加密内容预加密脚本 — 把明文正文与密码转为密文存入仓库，消除明文存储。
 *
 * 设计动机：原方案在 Keystatic JSON / Markdown frontmatter 中明文保存正文与密码，
 * 仅在 Astro 构建渲染阶段加密。仓库一旦公开即全部泄露。本脚本把加密提前到作者本地，
 * 仓库中只保留密文（含 salt/iv/authTag），构建时直接输出密文，无需明文密码。
 *
 * 用法：
 *   加密文章： node scripts/encrypt-content.mjs post <slug> [--password <pwd>]
 *   加密相册： node scripts/encrypt-content.mjs album <id>  [--password <pwd>]
 *   解密文章（本地编辑用）： node scripts/encrypt-content.mjs decrypt post <slug> --password <pwd>
 *   解密相册（本地编辑用）： node scripts/encrypt-content.mjs decrypt album <id>  --password <pwd>
 *   批量加密所有标记 encrypted 但未加密的文章： node scripts/encrypt-content.mjs post --all
 *
 * 说明：
 * - 加密后明文 content 被清空、明文 password 被删除，仓库只剩 encryptedContent 密文。
 * - 密文格式与 src/utils/crypto-utils.ts 的 encryptContent 完全一致（协议 v3），
 *   浏览器端解密逻辑无需改动即可解密。
 * - 解密模式仅在本地工作区还原明文以便编辑，编辑后须重新加密再提交，切勿提交明文。
 *
 * 注意：加密算法须与 src/utils/crypto-utils.ts 保持同步；如修改协议，请同步更新。
 */

import { execSync } from "node:child_process";
import { createDecipheriv, pbkdf2Sync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

// 复用 src/utils/crypto-utils.ts 的 encryptContent，确保密文格式与浏览器端解密逻辑严格一致
import { encryptContent } from "../src/utils/crypto-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ===== 加密常量（须与 src/utils/crypto-utils.ts 的 CRYPTO_CONSTANTS 一致） =====
const CRYPTO_CONSTANTS = {
	PBKDF2_ITERATIONS: 600000,
	SALT_LENGTH: 16,
	IV_LENGTH: 12,
	AUTH_TAG_LENGTH: 16,
	KEY_LENGTH: 32,
	VERIFY_PREFIX: "MIZUKI-VERIFY:",
};

// ===== 解密（仅本地编辑用，复刻浏览器端逻辑；加密已复用 crypto-utils.ts） =====

function decryptContent(encData, password) {
	const {
		PBKDF2_ITERATIONS,
		SALT_LENGTH,
		IV_LENGTH,
		AUTH_TAG_LENGTH,
		KEY_LENGTH,
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
	const key = pbkdf2Sync(
		password,
		salt,
		PBKDF2_ITERATIONS,
		KEY_LENGTH,
		"sha256",
	);
	const decipher = createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(authTag);
	const decrypted = Buffer.concat([
		decipher.update(ciphertext),
		decipher.final(),
	]);
	const decoded = decrypted.toString("utf8");
	if (!decoded.startsWith(VERIFY_PREFIX)) {
		throw new Error("验证前缀不匹配，密码错误或密文损坏");
	}
	return decoded.substring(VERIFY_PREFIX.length);
}

// ===== 工具函数 =====

function readJson(filePath) {
	if (!fs.existsSync(filePath)) return null;
	return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJson(filePath, data) {
	fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

async function askPassword(opts) {
	if (opts.password) return opts.password;
	const rl = readline.createInterface({ input, output });
	const pwd = await rl.question("请输入密码（输入不可见，回车确认）: ");
	rl.close();
	if (!pwd) {
		console.error("✗ 密码不能为空");
		process.exit(1);
	}
	return pwd;
}

// 相册照片扫描（复刻 album-scanner.ts 的本地/外链两种模式，生成展示 HTML）
function buildAlbumPhotoHtml(albumId, info) {
	const photos = collectAlbumPhotos(albumId, info);
	const photoHtml = photos
		.map(
			(p) =>
				`<div class="gallery-masonry-item"><a data-fancybox="album-${albumId}" href="${p.src}" data-caption="${p.alt || p.title || ""}"><img src="${p.src}" alt="${p.alt || p.title || ""}" loading="lazy" decoding="async" class="w-full rounded-lg" /></a></div>`,
		)
		.join("");
	return `<div class="gallery-masonry">${photoHtml}</div>`;
}

function collectAlbumPhotos(albumId, info) {
	const isExternal = info.mode === "external";
	if (isExternal) {
		return (info.photos || [])
			.filter((p) => p.src)
			.map((p, i) => ({
				src: p.src,
				alt: p.alt || p.title || `Photo ${i + 1}`,
				title: p.title || p.alt || "",
			}));
	}
	// 本地模式：扫描相册目录下的图片
	const albumDir = path.join(ROOT, "public/images/albums", albumId);
	const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"];
	if (!fs.existsSync(albumDir)) return [];
	const fileWebpMap = new Map();
	const imageFiles = fs.readdirSync(albumDir).filter((f) => {
		const ext = path.extname(f).toLowerCase();
		return imageExts.includes(ext) && f !== "cover.jpg" && f !== "cover.webp";
	});
	for (const f of imageFiles) {
		const base = path.basename(f, path.extname(f));
		const ext = path.extname(f).toLowerCase();
		if (
			(ext === ".jpg" || ext === ".jpeg" || ext === ".png") &&
			imageFiles.includes(`${base}.webp`)
		) {
			fileWebpMap.set(f, `${base}.webp`);
		}
	}
	return imageFiles.map((f) => {
		const src = fileWebpMap.has(f)
			? `/images/albums/${albumId}/${fileWebpMap.get(f)}`
			: `/images/albums/${albumId}/${f}`;
		const baseName = path.basename(f, path.extname(f));
		return { src, alt: baseName, title: baseName };
	});
}

function runSyncKeystatic() {
	try {
		execSync("node scripts/sync-keystatic.mjs", {
			cwd: ROOT,
			stdio: "inherit",
		});
	} catch {
		console.warn("  ⚠ sync-keystatic 执行失败，请手动运行 pnpm sync-keystatic");
	}
}

// ===== 文章加密/解密 =====

function encryptPost(slug, opts) {
	const jsonPath = path.join(ROOT, "src/data/keystatic/posts", `${slug}.json`);
	const p = readJson(jsonPath);
	if (!p) {
		console.error(`✗ 未找到文章: ${jsonPath}`);
		process.exit(1);
	}
	if (p.encryptedContent) {
		console.error(`✗ 文章 ${slug} 已是密文形态，如需重新加密请先 decrypt`);
		process.exit(1);
	}
	const content = p.content || "";
	if (!content.trim()) {
		console.error(`✗ 文章 ${slug} 正文为空，无需加密`);
		process.exit(1);
	}
	// 优先使用 JSON 中已有的明文密码（迁移场景），否则交互输入
	const usePwd = p.password || null;
	return (async () => {
		const password = usePwd || (await askPassword(opts));
		const encrypted = encryptContent(content, password);
		p.encrypted = true;
		p.encryptedContent = encrypted;
		p.content = ""; // 清空明文正文
		delete p.password; // 删除明文密码
		writeJson(jsonPath, p);
		console.log(`✓ 文章 ${slug} 已加密，明文正文与密码已从仓库移除`);
		if (!opts.noSync) runSyncKeystatic();
	})();
}

function encryptAllPosts(opts) {
	const dir = path.join(ROOT, "src/data/keystatic/posts");
	if (!fs.existsSync(dir)) return;
	const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
	let count = 0;
	for (const f of files) {
		const slug = f.replace(/\.json$/, "");
		const p = readJson(path.join(dir, f));
		if (!p) continue;
		// 仅处理：标记 encrypted 但还没密文，且有明文 content + password
		if (
			p.encrypted &&
			!p.encryptedContent &&
			(p.content || "").trim() &&
			p.password
		) {
			const encrypted = encryptContent(p.content, p.password);
			p.encryptedContent = encrypted;
			p.content = "";
			delete p.password;
			writeJson(path.join(dir, f), p);
			console.log(`  ✓ ${slug}`);
			count++;
		}
	}
	console.log(`✓ 共加密 ${count} 篇文章`);
	if (count > 0 && !opts.noSync) runSyncKeystatic();
}

function decryptPost(slug, opts) {
	const jsonPath = path.join(ROOT, "src/data/keystatic/posts", `${slug}.json`);
	const p = readJson(jsonPath);
	if (!p) {
		console.error(`✗ 未找到文章: ${jsonPath}`);
		process.exit(1);
	}
	if (!p.encryptedContent) {
		console.error(`✗ 文章 ${slug} 非密文形态，无需解密`);
		process.exit(1);
	}
	return (async () => {
		const password = await askPassword(opts);
		let markdown;
		try {
			markdown = decryptContent(p.encryptedContent, password);
		} catch {
			console.error("✗ 解密失败，密码错误或密文损坏");
			process.exit(1);
		}
		p.content = markdown;
		p.encrypted = false;
		p.password = password; // 临时还原明文密码以便编辑后重新加密；编辑后务必重新加密再提交
		delete p.encryptedContent;
		writeJson(jsonPath, p);
		console.log(
			`✓ 文章 ${slug} 已在本地还原明文。⚠ 编辑后请重新运行加密，切勿提交明文！`,
		);
		if (!opts.noSync) runSyncKeystatic();
	})();
}

// ===== 相册加密/解密 =====

function encryptAlbum(albumId, opts) {
	const jsonPath = path.join(
		ROOT,
		"public/images/albums",
		albumId,
		"info.json",
	);
	const info = readJson(jsonPath);
	if (!info) {
		console.error(`✗ 未找到相册: ${jsonPath}`);
		process.exit(1);
	}
	if (info.encryptedContent) {
		console.error(`✗ 相册 ${albumId} 已是密文形态，如需重新加密请先 decrypt`);
		process.exit(1);
	}
	const usePwd = info.password || null;
	return (async () => {
		const password = usePwd || (await askPassword(opts));
		const photoHtml = buildAlbumPhotoHtml(albumId, info);
		const encrypted = encryptContent(photoHtml, password);
		info.encrypted = true;
		info.encryptedContent = encrypted;
		delete info.password; // 删除明文密码
		writeJson(jsonPath, info);
		console.log(`✓ 相册 ${albumId} 已加密，明文密码已从 info.json 移除`);
	})();
}

function decryptAlbum(albumId, opts) {
	const jsonPath = path.join(
		ROOT,
		"public/images/albums",
		albumId,
		"info.json",
	);
	const info = readJson(jsonPath);
	if (!info) {
		console.error(`✗ 未找到相册: ${jsonPath}`);
		process.exit(1);
	}
	if (!info.encryptedContent) {
		console.error(`✗ 相册 ${albumId} 非密文形态，无需解密`);
		process.exit(1);
	}
	return (async () => {
		const password = await askPassword(opts);
		try {
			// 仅验证密码正确性（解密成功即密码正确），照片 HTML 不写回 info.json
			decryptContent(info.encryptedContent, password);
		} catch {
			console.error("✗ 解密失败，密码错误或密文损坏");
			process.exit(1);
		}
		info.password = password; // 临时还原以便编辑后重新加密
		info.encrypted = false;
		delete info.encryptedContent;
		writeJson(jsonPath, info);
		console.log(
			`✓ 相册 ${albumId} 已在本地还原明文密码。⚠ 编辑后请重新运行加密，切勿提交明文密码！`,
		);
	})();
}

// ===== CLI =====

function parseArgs(argv) {
	const opts = { password: null, noSync: false, all: false };
	const positional = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--password") {
			opts.password = argv[++i];
		} else if (a === "--no-sync") {
			opts.noSync = true;
		} else if (a === "--all") {
			opts.all = true;
		} else {
			positional.push(a);
		}
	}
	return { opts, positional };
}

function printUsage() {
	console.log(`用法:
  加密文章： node scripts/encrypt-content.mjs post <slug> [--password <pwd>]
  批量加密： node scripts/encrypt-content.mjs post --all
  加密相册： node scripts/encrypt-content.mjs album <id> [--password <pwd>]
  解密文章： node scripts/encrypt-content.mjs decrypt post <slug> --password <pwd>
  解密相册： node scripts/encrypt-content.mjs decrypt album <id> --password <pwd>`);
}

const { opts, positional } = parseArgs(process.argv.slice(2));
const [cmd, type, id] = positional;

if (!cmd) {
	printUsage();
	process.exit(0);
}

try {
	if (cmd === "post") {
		if (type === "--all" || opts.all) {
			encryptAllPosts(opts);
		} else if (type) {
			encryptPost(type, opts);
		} else {
			printUsage();
			process.exit(1);
		}
	} else if (cmd === "album") {
		if (!type) {
			printUsage();
			process.exit(1);
		}
		encryptAlbum(type, opts);
	} else if (cmd === "decrypt") {
		if (!type || !id) {
			printUsage();
			process.exit(1);
		}
		if (type === "post") decryptPost(id, opts);
		else if (type === "album") decryptAlbum(id, opts);
		else {
			printUsage();
			process.exit(1);
		}
	} else {
		printUsage();
		process.exit(1);
	}
} catch (err) {
	console.error("✗", err.message);
	process.exit(1);
}
