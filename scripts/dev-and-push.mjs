/**
 * Mizuki Dev & Push
 *
 * 一体化内容工作流：
 *   1. 启动开发服务器（scripts/start-dev.mjs），并在就绪后自动打开 Keystatic 后台
 *   2. 服务器停止后：同步 Keystatic 数据 -> 检测内容改动 -> 提交并推送到 origin/master
 *   3. 可选：轮询远端 pages 分支 SHA，确认 GitHub Pages 已重新部署
 *
 * 用法:
 *   node scripts/dev-and-push.mjs [commit message] [-v|--verify] [-y|--yes] [--dry-run]
 */

import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

// ===== 配置 =====
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PORT = 4321;
const KEYSTATIC_URL = `http://localhost:${PORT}/keystatic`;
const MASTER_BRANCH = "master";
const PAGES_BRANCH = "pages";
const WATCH_PATHS = ["src/", "public/images/albums/"];
const DEFAULT_MSG = "chore(content): 通过 keystatic 后台批量更新内容";

const BROWSER_POLL_TIMES = 40; // 每次间隔 1s
const BROWSER_POLL_INTERVAL = 1000;
const VERIFY_POLL_TIMES = 14; // 每次间隔 30s ≈ 7min
const VERIFY_POLL_INTERVAL = 30_000;

const IS_WIN = process.platform === "win32";

// ===== 小工具 =====
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg = "") {
	console.log(msg);
}

/** 探测端口是否可连接（astro 是否在监听） */
function isPortOpen(port, timeout = 1000) {
	return new Promise((resolve) => {
		const socket = new net.Socket();
		let done = false;
		const finish = (result) => {
			if (done) return;
			done = true;
			socket.destroy();
			resolve(result);
		};
		socket.setTimeout(timeout);
		socket.once("connect", () => finish(true));
		socket.once("timeout", () => finish(false));
		socket.once("error", () => finish(false));
		socket.connect(port, "127.0.0.1");
	});
}

/** 跨平台打开浏览器 */
function openUrl(url) {
	const [cmd, args] = IS_WIN
		? ["cmd", ["/c", "start", "", url]]
		: process.platform === "darwin"
			? ["open", [url]]
			: ["xdg-open", [url]];
	spawn(cmd, args, { cwd: ROOT, stdio: "ignore", detached: true }).unref();
}

/** 端口就绪后自动打开 Keystatic 后台；可通过 state.cancelled 取消 */
async function openBrowserWhenReady(state) {
	for (let i = 0; i < BROWSER_POLL_TIMES; i++) {
		if (state.cancelled) return;
		if (await isPortOpen(PORT)) {
			if (state.cancelled) return;
			log(`[browser] 检测到服务器已就绪，正在打开 ${KEYSTATIC_URL}`);
			openUrl(KEYSTATIC_URL);
			return;
		}
		await sleep(BROWSER_POLL_INTERVAL);
	}
}

/** 运行 git 命令（同步） */
function git(args, { inherit = false } = {}) {
	return spawnSync("git", args, {
		cwd: ROOT,
		encoding: "utf-8",
		stdio: inherit ? "inherit" : "pipe",
	});
}

/** 读取远端分支 SHA */
function getRemoteSha(branch) {
	const r = git(["ls-remote", "origin", branch]);
	if (r.status !== 0 || !r.stdout) return "";
	return r.stdout.trim().split(/\s+/)[0] || "";
}

/** 命令行询问（readline） */
function ask(question) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
}

// ===== 参数解析 =====
function parseCliArgs() {
	const { values, positionals } = parseArgs({
		args: process.argv.slice(2),
		allowPositionals: true,
		options: {
			verify: { type: "boolean", short: "v", default: false },
			yes: { type: "boolean", short: "y", default: false },
			"dry-run": { type: "boolean", default: false },
			help: { type: "boolean", short: "h", default: false },
		},
	});
	return {
		commitMsg: positionals[0] || DEFAULT_MSG,
		verify: values.verify,
		assumeYes: values.yes,
		dryRun: values["dry-run"],
		help: values.help,
	};
}

function printHelp() {
	log(`Mizuki Dev & Push

用法:
  node scripts/dev-and-push.mjs [commit message] [选项]

选项:
  -v, --verify   推送后轮询 pages 分支，确认部署已触发（并自动确认提交）
  -y, --yes      跳过确认，直接提交并推送
      --dry-run  演练模式：执行除 git add/commit/push 之外的所有步骤
  -h, --help     显示本帮助

说明:
  启动开发服务器并在就绪后自动打开 ${KEYSTATIC_URL}。
  关闭服务器后，自动同步 Keystatic 数据并把 ${WATCH_PATHS.join(" 与 ")} 的
  改动提交并推送到 origin/${MASTER_BRANCH}。`);
}

/** 启动开发服务器并等待其退出 */
function runDevServer() {
	return new Promise((resolve) => {
		let child;
		let cleanup = () => {};
		if (IS_WIN) {
			// 独立窗口运行：关闭窗口 / Ctrl+C 即停止，主窗口不会出现
			// “Terminate batch job (Y/N)?” 提示，终止也更干净
			const cmd = `start "Mizuki Dev Server" /wait cmd /c "node scripts/start-dev.mjs"`;
			child = spawn(cmd, { cwd: ROOT, shell: true, stdio: "ignore" });
		} else {
			// 同终端运行：父进程忽略 SIGINT，Ctrl+C 只停止子进程，随后继续推送流程
			const onSigint = () => {};
			process.on("SIGINT", onSigint);
			cleanup = () => process.removeListener("SIGINT", onSigint);
			child = spawn(process.execPath, ["scripts/start-dev.mjs"], {
				cwd: ROOT,
				stdio: "inherit",
			});
		}
		child.on("exit", () => {
			cleanup();
			resolve();
		});
		child.on("error", (err) => {
			cleanup();
			log(`[X] 启动开发服务器失败: ${err.message}`);
			resolve();
		});
	});
}

// ===== 主流程 =====
async function main() {
	const opts = parseCliArgs();
	if (opts.help) {
		printHelp();
		return;
	}

	const modeLabel = opts.verify
		? "--verify（推送后自动确认并校验部署）"
		: "普通（加 --verify 可自动确认并校验部署）";

	log("==================================================");
	log("  Mizuki Dev & Push");
	log(`  后台地址: ${KEYSTATIC_URL}`);
	log("  编辑完内容后，关闭 “Mizuki Dev Server” 窗口（或按 Ctrl+C）");
	log("  即会自动执行 sync + commit + push");
	log(`  模式: ${modeLabel}`);
	if (opts.dryRun) log("  [dry-run] 演练模式：不会执行 git add/commit/push");
	log("==================================================");
	log("");

	// 端口预检
	if (await isPortOpen(PORT)) {
		log(`[WARN] 端口 ${PORT} 已被占用（可能是之前未关闭的 dev server）`);
		log("       astro 可能会改用其它端口，自动打开后台可能失效");
		log("       如遇异常，请先关闭相关 node 进程后重试");
		log("");
	}

	// 并发：自动打开浏览器 + 启动开发服务器
	const browserState = { cancelled: false };
	const browserTask = openBrowserWhenReady(browserState);

	log("正在启动 Dev Server ...");
	await runDevServer();

	// 服务器已停止，取消浏览器轮询
	browserState.cancelled = true;
	await browserTask;

	log("");
	log("==================================================");
	log("  Dev Server 已停止 - 开始同步并准备推送");
	log("==================================================");

	// [1/4] 同步 Keystatic 数据
	log("[1/4] 同步 Keystatic 数据 ...");
	const sync = spawnSync(process.execPath, ["scripts/sync-keystatic.mjs"], {
		cwd: ROOT,
		stdio: "ignore",
	});
	log(sync.status === 0 ? "        [OK] 同步完成" : "        [WARN] 同步过程中出现警告（通常不影响）");

	// [2/4] 检测内容改动
	log(`[2/4] 检测内容改动（${WATCH_PATHS.join(" + ")}）...`);
	const status = git(["status", "--short", "--", ...WATCH_PATHS]);
	const changes = (status.stdout || "")
		.split(/\r?\n/)
		.map((l) => l.trimEnd())
		.filter((l) => l.length > 0);
	if (changes.length === 0) {
		log("        未检测到内容改动，跳过提交与推送");
		return;
	}
	for (const line of changes) log(`        ${line}`);
	log(`        共 ${changes.length} 项改动`);

	// [3/4] commit
	log(`[3/4] 准备 commit + push 到 origin/${MASTER_BRANCH}（会触发 GitHub Pages 构建）`);
	log(`        提交信息: ${opts.commitMsg}`);

	if (opts.dryRun) {
		log("        [dry-run] 跳过 git add/commit/push，仅展示将执行的命令：");
		log(`        [dry-run] git add ${WATCH_PATHS.join(" ")}`);
		log(`        [dry-run] git commit -m "${opts.commitMsg}"`);
		log(`        [dry-run] git push origin ${MASTER_BRANCH}`);
		return;
	}

	if (opts.assumeYes) {
		log("        -y 已指定，跳过确认");
	} else {
		const ans = (await ask("        确认推送? [Y/n] ")).trim().toLowerCase();
		if (ans === "n") {
			log("        已取消。改动保留在工作区（未提交）");
			return;
		}
	}

	if (git(["add", ...WATCH_PATHS]).status !== 0) {
		log("        [X] git add 失败");
		return;
	}
	if (git(["commit", "-m", opts.commitMsg]).status !== 0) {
		log("        [X] commit 失败（可能没有可提交的改动）");
		return;
	}
	log("        [OK] 已提交");

	// verify 前记录 pages 分支当前 SHA
	const beforeSha = opts.verify ? getRemoteSha(PAGES_BRANCH) : "";

	// [4/4] push
	log(`[4/4] 推送到 origin/${MASTER_BRANCH} ...`);
	if (git(["push", "origin", MASTER_BRANCH], { inherit: true }).status !== 0) {
		log("        [X] push 失败。改动已提交到本地，请稍后手动 git push");
		return;
	}
	log("        [OK] 已推送到 GitHub");

	if (!opts.verify) {
		log("");
		log("        提示: 加 --verify 可自动校验部署");
		return;
	}

	// 校验部署
	log("");
	log("-------- 校验部署: 轮询 pages 分支 SHA（最长约 7min）--------");
	if (!beforeSha) {
		log("    [WARN] 未能获取推送前的 SHA，跳过校验");
		return;
	}
	log(`    before: ${beforeSha}`);
	for (let i = 1; i <= VERIFY_POLL_TIMES; i++) {
		await sleep(VERIFY_POLL_INTERVAL);
		const nowSha = getRemoteSha(PAGES_BRANCH);
		log(`    [${i}] pages=${nowSha}`);
		if (nowSha && nowSha !== beforeSha) {
			log(`    [OK] pages 已更新 -> ${nowSha}  部署成功`);
			return;
		}
	}
	log("    [WARN] pages SHA 长时间未变化 - 可能是构建慢或流水线故障");
	log('           可重试: git commit --allow-empty -m "ci: re-trigger" && git push origin master');
}

main().catch((err) => {
	log(`\n[X] 发生错误: ${err?.stack || err}`);
	process.exit(1);
});
