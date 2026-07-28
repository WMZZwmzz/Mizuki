import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONFIG_PATH = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../src/config/siteConfig.ts",
);

// 跳过开关：
// - ENABLE_ANIME_SYNC=false 单独关闭番剧数据抓取；
// - ENABLE_CONTENT_SYNC=false（CI / 离线构建）时同样跳过所有外部数据源。
// 默认启用，仅当显式设置为 "false" 时跳过，保留现有数据文件。
const ENABLE_ANIME_SYNC =
	process.env.ENABLE_ANIME_SYNC !== "false" &&
	process.env.ENABLE_CONTENT_SYNC !== "false";

async function getAnimeModeFromConfig() {
	try {
		const configContent = await fs.readFile(CONFIG_PATH, "utf-8");
		const match = configContent.match(
			/anime:\s*\{[\s\S]*?mode:\s*["']([^"']+)["']/,
		);

		if (match?.[1]) {
			return match[1];
		}
		return "bangumi";
	} catch (_error) {
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
			"Anime data sync disabled (ENABLE_ANIME_SYNC/ENABLE_CONTENT_SYNC=false); skipping and keeping existing data.",
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
