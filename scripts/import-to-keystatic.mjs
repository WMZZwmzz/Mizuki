/**
 * 批量导入脚本：将现有 TypeScript 数据文件转换为 Keystatic JSON
 *
 * 用法: node scripts/import-to-keystatic.mjs
 *
 * 从 src/data/*.ts 读取现有数据，生成 Keystatic 可管理的 JSON 文件到 src/data/keystatic/
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const KEYSTATIC_DIR = path.join(ROOT, "src/data/keystatic");

function ensureDir(sub) {
	const dir = path.join(KEYSTATIC_DIR, sub);
	if (fs.existsSync(dir)) {
		for (const f of fs.readdirSync(dir)) {
			if (f.endsWith(".json")) fs.unlinkSync(path.join(dir, f));
		}
	} else {
		fs.mkdirSync(dir, { recursive: true });
	}
	return dir;
}

function writeJson(dir, filename, data) {
	fs.writeFileSync(path.join(dir, `${filename}.json`), JSON.stringify(data, null, 2), "utf-8");
}

// ===== 导入函数 =====

async function importFriends() {
	try {
		const { friendsData } = await import(pathToFileURL(path.join(ROOT, "src/data/friends.ts")).href);
		const dir = ensureDir("friends");
		for (const f of friendsData) {
			writeJson(dir, `friend-${f.id}`, {
				title: f.title,
				id: f.id,
				imgurl: f.imgurl,
				desc: f.desc,
				siteurl: f.siteurl,
				tags: f.tags || [],
			});
		}
		console.log(`  ✓ friends: ${friendsData.length} entries`);
	} catch (e) {
		console.log(`  ⊘ friends: skipped (${e.message})`);
	}
}

async function importSkills() {
	try {
		const { skillsData } = await import(pathToFileURL(path.join(ROOT, "src/data/skills.ts")).href);
		const dir = ensureDir("skills");
		for (const s of skillsData) {
			const slug = s.id || s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
			writeJson(dir, slug, {
				name: s.name,
				description: s.description || "",
				icon: s.icon || "",
				category: s.category || "frontend",
				level: s.level || "intermediate",
				years: s.experience?.years || 0,
				months: s.experience?.months || 0,
				projects: s.projects || [],
				certifications: s.certifications || [],
				color: s.color || "",
			});
		}
		console.log(`  ✓ skills: ${skillsData.length} entries`);
	} catch (e) {
		console.log(`  ⊘ skills: skipped (${e.message})`);
	}
}

async function importTimeline() {
	try {
		const { timelineData } = await import(pathToFileURL(path.join(ROOT, "src/data/timeline.ts")).href);
		const dir = ensureDir("timeline");
		for (const t of timelineData) {
			const slug = t.id || t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
			writeJson(dir, slug, {
				title: t.title,
				description: t.description || "",
				type: t.type || "education",
				startDate: t.startDate || "",
				endDate: t.endDate || "",
				location: t.location || "",
				organization: t.organization || "",
				position: t.position || "",
				skills: t.skills || [],
				achievements: t.achievements || [],
				icon: t.icon || "",
				color: t.color || "",
				featured: !!t.featured,
			});
		}
		console.log(`  ✓ timeline: ${timelineData.length} entries`);
	} catch (e) {
		console.log(`  ⊘ timeline: skipped (${e.message})`);
	}
}

async function importProjects() {
	try {
		const { projectsData } = await import(pathToFileURL(path.join(ROOT, "src/data/projects.ts")).href);
		const dir = ensureDir("projects");
		for (const p of projectsData) {
			const slug = p.id || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
			writeJson(dir, slug, {
				title: p.title,
				description: p.description || "",
				image: p.image || "",
				category: p.category || "web",
				techStack: p.techStack || [],
				status: p.status || "completed",
				liveDemo: p.liveDemo || "",
				sourceCode: p.sourceCode || "",
				visitUrl: p.visitUrl || "",
				startDate: p.startDate || "",
				endDate: p.endDate || "",
				featured: !!p.featured,
				tags: p.tags || [],
				showImage: p.showImage !== false,
			});
		}
		console.log(`  ✓ projects: ${projectsData.length} entries`);
	} catch (e) {
		console.log(`  ⊘ projects: skipped (${e.message})`);
	}
}

async function importDevices() {
	try {
		const { devicesData } = await import(pathToFileURL(path.join(ROOT, "src/data/devices.ts")).href);
		const dir = ensureDir("devices");
		let count = 0;
		for (const [category, devices] of Object.entries(devicesData)) {
			for (const d of devices) {
				const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
				writeJson(dir, slug, {
					name: d.name,
					category: category,
					image: d.image || "",
					specs: d.specs || "",
					description: d.description || "",
					link: d.link || "",
				});
				count++;
			}
		}
		console.log(`  ✓ devices: ${count} entries`);
	} catch (e) {
		console.log(`  ⊘ devices: skipped (${e.message})`);
	}
}

async function importDiary() {
	try {
		const { diaryData } = await import(pathToFileURL(path.join(ROOT, "src/data/diary.ts")).href);
		const dir = ensureDir("diary");
		for (const d of diaryData) {
			const slug = `diary-${d.id}`;
			writeJson(dir, slug, {
				title: slug,
				id: d.id,
				content: d.content,
				date: d.date,
				location: d.location || "",
				mood: d.mood || "",
				tags: d.tags || [],
				images: d.images || [],
			});
		}
		console.log(`  ✓ diary: ${diaryData.length} entries`);
	} catch (e) {
		console.log(`  ⊘ diary: skipped (${e.message})`);
	}
}

function parseFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) return { fm: {}, body: content };
	const fmStr = match[1];
	const body = match[2];
	const fm = {};
	for (const line of fmStr.split("\n")) {
		const colonIdx = line.indexOf(":");
		if (colonIdx === -1) continue;
		const key = line.slice(0, colonIdx).trim();
		let value = line.slice(colonIdx + 1).trim();
		// Parse arrays like [a, b, c]
		if (value.startsWith("[") && value.endsWith("]")) {
			try { value = JSON.parse(value); } catch { /* keep as string */ }
		}
		// Parse booleans
		else if (value === "true") value = true;
		else if (value === "false") value = false;
		// Strip quotes
		else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}
		fm[key] = value;
	}
	return { fm, body };
}

function importPosts() {
	const postsDir = path.join(ROOT, "src/content/posts");
	if (!fs.existsSync(postsDir)) return;
	const dir = ensureDir("posts");
	const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
	let count = 0;
	for (const file of files) {
		const content = fs.readFileSync(path.join(postsDir, file), "utf-8");
		const { fm, body } = parseFrontmatter(content);
		const slug = file.replace(/\.md$/, "");
		writeJson(dir, slug, {
			title: fm.title || slug,
			description: fm.description || "",
			published: fm.published || "",
			updated: fm.updated || "",
			draft: !!fm.draft,
			pinned: !!fm.pinned,
			tags: Array.isArray(fm.tags) ? fm.tags : [],
			category: fm.category || "",
			image: fm.image || "",
			comment: fm.comment !== false,
			hideHomeContent: !!fm.hideHomeContent,
			lang: fm.lang || "",
			author: fm.author || "",
			sourceLink: fm.sourceLink || "",
			licenseName: fm.licenseName || "",
			licenseUrl: fm.licenseUrl || "",
			encrypted: !!fm.encrypted,
			password: fm.password || "",
			passwordHint: fm.passwordHint || "",
			alias: fm.alias || "",
			content: body,
		});
		count++;
	}
	console.log(`  ✓ posts: ${count} entries`);
}

function importPages() {
	const specDir = path.join(ROOT, "src/content/spec");
	if (!fs.existsSync(specDir)) return;
	const dir = ensureDir("pages");
	const files = fs.readdirSync(specDir).filter((f) => f.endsWith(".md"));
	for (const file of files) {
		const content = fs.readFileSync(path.join(specDir, file), "utf-8");
		const { fm, body } = parseFrontmatter(content);
		const slug = file.replace(/\.md$/, "");
		writeJson(dir, slug, {
			title: fm.title || slug,
			content: body,
		});
	}
	console.log(`  ✓ pages: ${files.length} entries`);
}

// ===== 主流程 =====

async function main() {
	console.log("\n📦 Importing existing data → Keystatic...\n");
	console.log("  (Existing JSON files will be overwritten)\n");

	importPosts();
	importPages();
	await importDiary();
	await importFriends();
	await importProjects();
	await importSkills();
	await importTimeline();
	await importDevices();

	console.log("\n✅ Import complete!\n");
	console.log("  现在可以通过 http://localhost:4321/keystatic/ 编辑这些数据了。");
	console.log("  注意：导入后需要重新运行 pnpm dev 让 watch 检测到变化。\n");
}

main();
