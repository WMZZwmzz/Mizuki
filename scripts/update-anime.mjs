import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const CONFIG_PATH = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../src/config/siteConfig.ts",
);

// 跳过开关（与 ENABLE_CONTENT_SYNC 保持一致的语义）：
// 默认启用，仅当显式设置为 "false" 时跳过番剧数据抓取。
const ENABLE_ANIME_SYNC = process.env.ENABLE_ANIME_SYNC !== "false";

async function getAnimeModeFromConfig() {
	try {
		const configContent = await fs.readFile(CONFIG_PATH, "utf-8");
		const match = configContent.match(
			/anime:\s*\{[\s\S]*?mode:\s*["']([^"']+)["']/,
		);

		if (match && match[1]) {
			return match[1];
		}
		return "bangumi";
	} catch (error) {
		return "bangumi";
	}
}

function runScript(scriptPath) {
	return new Promise((resolve, reject) => {
		const script = spawn("node", [scriptPath], {
			stdio: "inherit",
			shell: true,
		});

		script.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Script exited with code ${code}`));
			}
		});

		script.on("error", (err) => {
			reject(err);
		});
	});
}

async function main() {
	if (!ENABLE_ANIME_SYNC) {
		console.log(
			"Anime data sync disabled (ENABLE_ANIME_SYNC=false); skipping and keeping existing data.",
		);
		return;
	}

	const mode = await getAnimeModeFromConfig();
	const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

	if (mode === "bilibili") {
		console.log("Detected anime mode: bilibili, running update-bilibili.mjs");
		await runScript(path.join(scriptsDir, "update-bilibili.mjs"));
	} else if (mode === "bangumi") {
		console.log("Detected anime mode: bangumi, running update-bangumi.mjs");
		await runScript(path.join(scriptsDir, "update-bangumi.mjs"));
	} else {
		console.log(`Anime mode is "${mode}", skipping data update.`);
	}
}

main().catch((err) => {
	// 隔离外部数据步骤：上游失败不应让整个部署失败。
	// 现有的番剧数据文件将保留，构建继续使用上次可用数据。
	console.warn(
		"\n⚠ Anime data update failed; deployment continues with last available data.",
	);
	console.warn(err?.message || err);
	process.exit(0);
});
