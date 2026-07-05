/**
 * Mizuki 一键启动脚本
 *
 * 同时启动：
 *   1. Keystatic 数据同步监听 (watch)
 *   2. Astro 开发服务器 (dev)
 *
 * 用法: node scripts/start-dev.mjs
 */

import { spawn } from "node:child_process";

const children = [];

function start(name, command, args) {
	const child = spawn(command, args, {
		stdio: "inherit",
		shell: process.platform === "win32",
	});

	child.on("error", (err) => console.error(`[${name}]`, err.message));
	child.on("exit", (code) => {
		console.log(`\n[${name}] exited (${code})`);
		shutdown();
	});

	children.push(child);
	return child;
}

function shutdown() {
	for (const c of children) {
		if (!c.killed) c.kill();
	}
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("🚀 Mizuki — watch + dev server\n   Ctrl+C to stop\n");

// 启动 watch（后台运行）
const watch = start("watch", "node", ["scripts/sync-keystatic.mjs", "--watch"]);

// 等 watch 初始化后再启动 astro
setTimeout(() => {
	start("astro", "npx", ["astro", "dev", "--port", "4321"]);
}, 2000);
