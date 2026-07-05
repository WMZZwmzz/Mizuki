/**
 * Keystatic → Mizuki 数据桥接脚本
 *
 * 读取 Keystatic CMS 管理的 JSON 数据文件，生成 Mizuki 所需的 TypeScript 数据模块。
 * 在 dev 和 build 前自动运行。
 *
 * 数据流: Keystatic UI → JSON 文件 → 本脚本 → .ts 数据文件 → Mizuki 页面
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const KEYSTATIC_DIR = path.join(ROOT, "src/data/keystatic");
const DATA_DIR = path.join(ROOT, "src/data");

// ===== 工具函数 =====

function readJsonDir(subdir) {
	const dir = path.join(KEYSTATIC_DIR, subdir);
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir)
		.filter((f) => f.endsWith(".json"))
		.map((f) => {
			const raw = fs.readFileSync(path.join(dir, f), "utf-8");
			return JSON.parse(raw);
		});
}

function readJsonFile(filePath) {
	if (!fs.existsSync(filePath)) return null;
	return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function escapeStr(s) {
	if (s == null) return '""';
	return JSON.stringify(String(s));
}

function strArray(arr) {
	if (!arr || arr.length === 0) return "[]";
	return `[${arr.map((v) => escapeStr(v)).join(", ")}]`;
}

function writeDataFile(filename, content) {
	const filePath = path.join(DATA_DIR, filename);
	fs.writeFileSync(filePath, content, "utf-8");
	console.log(`  ✓ ${filename}`);
}

// ===== 生成器 =====

function generatePosts() {
	const dir = path.join(KEYSTATIC_DIR, "posts");
	if (!fs.existsSync(dir)) return;
	const jsonFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
	if (jsonFiles.length === 0) return;

	const postsDir = path.join(ROOT, "src/content/posts");
	if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

	// 清除旧的由 Keystatic 生成的 .md 文件（保留 guide/ 等子目录）
	for (const f of fs.readdirSync(postsDir)) {
		const filePath = path.join(postsDir, f);
		if (f.endsWith(".md") && fs.statSync(filePath).isFile()) {
			fs.unlinkSync(filePath);
		}
	}

	for (const file of jsonFiles) {
		const slug = file.replace(/\.json$/, "");
		const p = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));

		// 构建 YAML frontmatter
		const fm = {};
		fm.title = p.title || slug;
		if (p.published) fm.published = p.published;
		if (p.updated) fm.updated = p.updated;
		if (p.draft) fm.draft = true;
		if (p.pinned) fm.pinned = true;
		if (p.description) fm.description = p.description;
		if (p.image) fm.image = p.image;
		if (p.tags && p.tags.length) fm.tags = p.tags;
		if (p.category) fm.category = p.category;
		if (p.lang) fm.lang = p.lang;
		if (p.comment === false) fm.comment = false;
		if (p.hideHomeContent) fm.hideHomeContent = true;
		if (p.author) fm.author = p.author;
		if (p.sourceLink) fm.sourceLink = p.sourceLink;
		if (p.licenseName) fm.licenseName = p.licenseName;
		if (p.licenseUrl) fm.licenseUrl = p.licenseUrl;
		if (p.encrypted) fm.encrypted = true;
		if (p.password) fm.password = p.password;
		if (p.passwordHint) fm.passwordHint = p.passwordHint;
		if (p.alias) fm.alias = p.alias;

		const yamlLines = Object.entries(fm).map(([k, v]) => {
			if (Array.isArray(v)) return `${k}: [${v.map((x) => JSON.stringify(x)).join(", ")}]`;
			if (typeof v === "string") return `${k}: ${JSON.stringify(v)}`;
			return `${k}: ${v}`;
		});

		const content = p.content || "";
		const mdContent = `---\n${yamlLines.join("\n")}\n---\n\n${content}\n`;

		fs.writeFileSync(path.join(postsDir, `${slug}.md`), mdContent, "utf-8");
	}

	console.log(`  ✓ posts: ${jsonFiles.length} entries → src/content/posts/`);
}

function generatePages() {
	const dir = path.join(KEYSTATIC_DIR, "pages");
	if (!fs.existsSync(dir)) return;
	const jsonFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
	if (jsonFiles.length === 0) return;

	const specDir = path.join(ROOT, "src/content/spec");
	if (!fs.existsSync(specDir)) fs.mkdirSync(specDir, { recursive: true });

	// 清除旧 .md 文件
	for (const f of fs.readdirSync(specDir)) {
		if (f.endsWith(".md")) fs.unlinkSync(path.join(specDir, f));
	}

	for (const file of jsonFiles) {
		const slug = file.replace(/\.json$/, "");
		const p = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
		const content = p.content || "";
		const mdContent = `---\ntitle: ${JSON.stringify(p.title || slug)}\n---\n\n${content}\n`;
		fs.writeFileSync(path.join(specDir, `${slug}.md`), mdContent, "utf-8");
	}

	console.log(`  ✓ pages: ${jsonFiles.length} entries → src/content/spec/`);
}

function generateDiary() {
	const entries = readJsonDir("diary").sort((a, b) => (a.id || 0) - (b.id || 0));

	const items = entries
		.map((e) => {
			const images = e.images && e.images.length > 0 ? strArray(e.images) : "undefined";
			const location = e.location ? escapeStr(e.location) : "undefined";
			const mood = e.mood ? escapeStr(e.mood) : "undefined";
			const tags = e.tags && e.tags.length > 0 ? strArray(e.tags) : "undefined";
			return `\t{ id: ${e.id || 0}, content: ${escapeStr(e.content)}, date: ${escapeStr(e.date)}, images: ${images}, location: ${location}, mood: ${mood}, tags: ${tags} }`;
		})
		.join(",\n");

	writeDataFile(
		"diary.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
// Edit via: http://localhost:4321/keystatic/

export interface DiaryItem {
  id: number;
  content: string;
  date: string;
  images?: string[];
  location?: string;
  mood?: string;
  tags?: string[];
}

export const diaryData: DiaryItem[] = [
${items}
];

export function getDiaryList(limit?: number): DiaryItem[] {
  const sorted = [...diaryData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  diaryData.forEach((entry) => entry.tags?.forEach((t) => tagSet.add(t)));
  return [...tagSet].sort();
}
`,
	);
}

function generateFriends() {
	const entries = readJsonDir("friends").sort((a, b) => (a.id || 0) - (b.id || 0));

	const items = entries
		.map((e) => {
			return `\t{ id: ${e.id || 0}, title: ${escapeStr(e.title)}, imgurl: ${escapeStr(e.imgurl)}, desc: ${escapeStr(e.desc || "")}, siteurl: ${escapeStr(e.siteurl)}, tags: ${strArray(e.tags)} }`;
		})
		.join(",\n");

	writeDataFile(
		"friends.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
// Edit via: http://localhost:4321/keystatic/

export interface FriendItem {
  id: number;
  title: string;
  imgurl: string;
  desc: string;
  siteurl: string;
  tags: string[];
}

export const friendsData: FriendItem[] = [
${items}
];

export function getFriendsList(): FriendItem[] {
  return friendsData;
}

export function getShuffledFriendsList(): FriendItem[] {
  const arr = [...friendsData];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
`,
	);
}

function generateProjects() {
	const entries = readJsonDir("projects");

	const items = entries
		.map((e) => {
			const liveDemo = e.liveDemo ? escapeStr(e.liveDemo) : "undefined";
			const sourceCode = e.sourceCode ? escapeStr(e.sourceCode) : "undefined";
			const visitUrl = e.visitUrl ? escapeStr(e.visitUrl) : "undefined";
			const endDate = e.endDate ? escapeStr(e.endDate) : "undefined";
			const featured = e.featured ? "true" : "undefined";
			const tags = e.tags && e.tags.length > 0 ? strArray(e.tags) : "undefined";
			const showImage = e.showImage === false ? "false" : "undefined";
			return `\t{ id: ${escapeStr(e.title)}, title: ${escapeStr(e.title)}, description: ${escapeStr(e.description || "")}, image: ${escapeStr(e.image || "")}, category: "${e.category || "web"}", techStack: ${strArray(e.techStack)}, status: "${e.status || "completed"}", liveDemo: ${liveDemo}, sourceCode: ${sourceCode}, visitUrl: ${visitUrl}, startDate: ${escapeStr(e.startDate)}, endDate: ${endDate}, featured: ${featured}, tags: ${tags}, showImage: ${showImage} }`;
		})
		.join(",\n");

	writeDataFile(
		"projects.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
// Edit via: http://localhost:4321/keystatic/

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: "web" | "mobile" | "desktop" | "other";
  techStack: string[];
  status: "completed" | "in-progress" | "planned";
  liveDemo?: string;
  sourceCode?: string;
  visitUrl?: string;
  startDate: string;
  endDate?: string;
  featured?: boolean;
  tags?: string[];
  showImage?: boolean;
}

export const projectsData: Project[] = [
${items}
];

export function getProjectStats() {
  return {
    total: projectsData.length,
    byStatus: {
      completed: projectsData.filter((p) => p.status === "completed").length,
      inProgress: projectsData.filter((p) => p.status === "in-progress").length,
      planned: projectsData.filter((p) => p.status === "planned").length,
    },
  };
}

export function getProjectsByCategory(category?: string): Project[] {
  return category ? projectsData.filter((p) => p.category === category) : projectsData;
}

export function getFeaturedProjects(): Project[] {
  return projectsData.filter((p) => p.featured);
}

export function getAllTechStack(): string[] {
  const set = new Set<string>();
  projectsData.forEach((p) => p.techStack.forEach((t) => set.add(t)));
  return [...set].sort();
}
`,
	);
}

function generateSkills() {
	const entries = readJsonDir("skills");

	const items = entries
		.map((e) => {
			const slug = e.name || e["name-slug"] || "";
			const projects = e.projects && e.projects.length > 0 ? strArray(e.projects) : "undefined";
			const certs = e.certifications && e.certifications.length > 0 ? strArray(e.certifications) : "undefined";
			const color = e.color ? escapeStr(e.color) : "undefined";
			return `\t{ id: ${escapeStr(slug)}, name: ${escapeStr(e.name)}, description: ${escapeStr(e.description || "")}, icon: ${escapeStr(e.icon || "")}, category: "${e.category || "frontend"}", level: "${e.level || "intermediate"}", experience: { years: ${e.years || 0}, months: ${e.months || 0} }, projects: ${projects}, certifications: ${certs}, color: ${color} }`;
		})
		.join(",\n");

	writeDataFile(
		"skills.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
// Edit via: http://localhost:4321/keystatic/

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "frontend" | "backend" | "database" | "tools" | "other";
  level: "beginner" | "intermediate" | "advanced" | "expert";
  experience: { years: number; months: number };
  projects?: string[];
  certifications?: string[];
  color?: string;
}

export const skillsData: Skill[] = [
${items}
];
`,
	);
}

function generateTimeline() {
	const entries = readJsonDir("timeline");

	const items = entries
		.map((e) => {
			const slug = e.title || e["title-slug"] || "";
			const endDate = e.endDate ? escapeStr(e.endDate) : "undefined";
			const location = e.location ? escapeStr(e.location) : "undefined";
			const org = e.organization ? escapeStr(e.organization) : "undefined";
			const position = e.position ? escapeStr(e.position) : "undefined";
			const skills = e.skills && e.skills.length > 0 ? strArray(e.skills) : "undefined";
			const achievements = e.achievements && e.achievements.length > 0 ? strArray(e.achievements) : "undefined";
			const icon = e.icon ? escapeStr(e.icon) : "undefined";
			const color = e.color ? escapeStr(e.color) : "undefined";
			const featured = e.featured ? "true" : "undefined";
			return `\t{ id: ${escapeStr(slug)}, title: ${escapeStr(e.title)}, description: ${escapeStr(e.description || "")}, type: "${e.type || "education"}", startDate: ${escapeStr(e.startDate)}, endDate: ${endDate}, location: ${location}, organization: ${org}, position: ${position}, skills: ${skills}, achievements: ${achievements}, links: undefined, icon: ${icon}, color: ${color}, featured: ${featured} }`;
		})
		.join(",\n");

	writeDataFile(
		"timeline.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
// Edit via: http://localhost:4321/keystatic/

import type { TimelineItem } from "../components/features/timeline/types.ts";

export const timelineData: TimelineItem[] = [
${items}
];
`,
	);
}

function generateSiteSettings() {
	const settings = readJsonFile(path.join(KEYSTATIC_DIR, "site-settings.json"));
	if (!settings) {
		console.log("  ⊘ site-settings.json not found, skipping");
		return;
	}

	// Generate a partial config that gets merged into siteConfig.ts
	writeDataFile(
		"keystatic-settings.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
// Edit via: http://localhost:4321/keystatic/

export interface KeystaticSettings {
  title: string;
  subtitle: string;
  siteURL: string;
  siteLang: string;
  themeHue: number;
  themeFixed: boolean;
  pageAnime: boolean;
  pageDiary: boolean;
  pageFriends: boolean;
  pageProjects: boolean;
  pageSkills: boolean;
  pageTimeline: boolean;
  pageAlbums: boolean;
  pageDevices: boolean;
  navbarTitleText: string;
  navbarTitleIcon: string;
  diaryApiUrl: string;
}

export const keystaticSettings: Partial<KeystaticSettings> = ${JSON.stringify(settings, null, 2)};
`,
	);
}

// ===== 个人档案 =====

function generateProfile() {
	const p = readJsonFile(path.join(KEYSTATIC_DIR, "profile.json"));
	if (!p) return;

	const links = (p.links || [])
		.map((l) => `\t\t{ name: ${escapeStr(l.name)}, url: ${escapeStr(l.url)}, icon: ${escapeStr(l.icon || "")} }`)
		.join(",\n");

	writeDataFile(
		"keystatic-profile.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
export const keystaticProfile = {
\tavatar: ${escapeStr(p.avatar || "assets/images/avatar.webp")},
\tname: ${escapeStr(p.name || "")},
\tbio: ${escapeStr(p.bio || "")},
\tlinks: [
${links}
\t],
};
`,
	);
}

// ===== 公告栏 =====

function generateAnnouncement() {
	const a = readJsonFile(path.join(KEYSTATIC_DIR, "announcement.json"));
	if (!a) return;

	writeDataFile(
		"keystatic-announcement.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
export const keystaticAnnouncement = {
\tcontent: ${escapeStr(a.content || "")},
\ttitle: ${escapeStr(a.title || "")},
\ticon: ${escapeStr(a.icon || "")},
\ttype: "${a.type || "info"}" as const,
\tclosable: ${a.closable !== false},
\tlink: {
\t\tenable: ${!!a.linkEnable},
\t\ttext: ${escapeStr(a.linkText || "")},
\t\turl: ${escapeStr(a.linkUrl || "")},
\t\texternal: ${!!a.linkExternal},
\t},
};
`,
	);
}

// ===== 相册 =====

function generateAlbums() {
	const albumsDir = path.join(ROOT, "public/images/albums");
	if (!fs.existsSync(albumsDir)) return;

	const jsonFiles = fs.readdirSync(albumsDir).filter((f) => f.endsWith(".json"));
	if (jsonFiles.length === 0) return;

	for (const file of jsonFiles) {
		const albumName = file.replace(".json", "");
		const albumDir = path.join(albumsDir, albumName);
		const infoPath = path.join(albumDir, "info.json");

		// 读取 Keystatic 生成的 JSON
		const data = JSON.parse(fs.readFileSync(path.join(albumsDir, file), "utf-8"));

		// 确保目录存在
		if (!fs.existsSync(albumDir)) fs.mkdirSync(albumDir, { recursive: true });

		// 写入 info.json（album-scanner.ts 需要的格式）
		const info = {
			title: data.title || albumName,
			description: data.description || "",
			date: data.date || new Date().toISOString().split("T")[0],
			location: data.location || "",
			tags: data.tags || [],
			hidden: data.hidden || false,
		};

		if (data.mode === "external") {
			info.mode = "external";
			if (data.cover) info.cover = data.cover;
			if (data.photos && data.photos.length > 0) info.photos = data.photos;
		}

		if (data.password) {
			info.password = data.password;
			if (data.passwordHint) info.passwordHint = data.passwordHint;
		}

		fs.writeFileSync(infoPath, JSON.stringify(info, null, 2), "utf-8");

		// 删除 Keystatic 的 JSON 文件（已经转换为 info.json）
		fs.unlinkSync(path.join(albumsDir, file));
		console.log(`  ✓ albums/${albumName}/info.json`);
	}
}

// ===== 首页设置 =====

function generateHomepage() {
	const h = readJsonFile(path.join(KEYSTATIC_DIR, "homepage.json"));
	if (!h) return;
	const subtitles = [h.subtitle1, h.subtitle2, h.subtitle3, h.subtitle4, h.subtitle5].filter(Boolean);
	writeDataFile(
		"keystatic-homepage.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
export const keystaticHomepage = {
\thomeTitle: ${escapeStr(h.homeTitle || "わたしの部屋")},
\tsubtitles: ${JSON.stringify(subtitles)},
\ttypewriterEnable: ${h.typewriterEnable !== false},
\ttypewriterSpeed: ${h.typewriterSpeed || 100},
\tcarouselEnable: ${h.carouselEnable !== false},
\tcarouselInterval: ${h.carouselInterval || 3},
\twavesEnable: ${h.wavesEnable !== false},
};
`,
	);
}

// ===== 特效设置 =====

function generateEffects() {
	const e = readJsonFile(path.join(KEYSTATIC_DIR, "effects.json"));
	if (!e) return;
	const touchDialog = (e.pioTouchDialog || "").split("\n").filter(Boolean);
	writeDataFile(
		"keystatic-effects.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
export const keystaticEffects = {
\tsakura: {
\t\tenable: ${!!e.sakuraEnable},
\t\tswitchable: ${e.sakuraSwitchable !== false},
\t\tsakuraNum: ${e.sakuraNum || 21},
\t},
\tpio: {
\t\tenable: ${e.pioEnable !== false},
\t\tposition: "${e.pioPosition || "left"}",
\t\thiddenOnMobile: ${e.pioHiddenOnMobile !== false},
\t\tdraggable: ${e.pioDraggable !== false},
\t\twelcome: ${escapeStr(e.pioWelcome || "嗨~ 欢迎来到 Mizuki 博客！")},
\t\ttouchDialog: ${JSON.stringify(touchDialog)},
\t},
};
`,
	);
}

// ===== 导航栏 =====

function generateNavLinks() {
	const n = readJsonFile(path.join(KEYSTATIC_DIR, "nav-links.json"));
	if (!n) return;
	writeDataFile(
		"keystatic-nav-links.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
export const keystaticNavLinks = ${JSON.stringify(n.linksJson || "[]")};
`,
	);
}

// ===== 评论系统 =====

function generateComments() {
	const c = readJsonFile(path.join(KEYSTATIC_DIR, "comments.json"));
	if (!c) return;
	writeDataFile(
		"keystatic-comments.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
export const keystaticComments = {
\tenable: ${!!c.enable},
\tsystem: "${c.system || "twikoo"}" as const,
\ttwikoo: { envId: ${escapeStr(c.twikooEnvId || "https://twikoo.vercel.app")} },
\tgiscus: {
\t\trepo: ${escapeStr(c.giscusRepo || "")},
\t\trepoId: ${escapeStr(c.giscusRepoId || "")},
\t\tcategory: ${escapeStr(c.giscusCategory || "Announcements")},
\t\tcategoryId: ${escapeStr(c.giscusCategoryId || "")},
\t},
};
`,
	);
}

// ===== 音乐播放器 =====

function generateMusic() {
	const m = readJsonFile(path.join(KEYSTATIC_DIR, "music.json"));
	if (!m) return;
	writeDataFile(
		"keystatic-music.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
export const keystaticMusic = {
\tenable: ${m.enable !== false},
\tshowFloatingPlayer: ${m.showFloating !== false},
\tmode: "${m.mode || "local"}" as const,
\tmeting_api: ${escapeStr(m.metingApi || "")},
\tid: ${escapeStr(m.playlistId || "")},
\tserver: "${m.server || "netease"}" as const,
\ttype: "playlist" as const,
};
`,
	);
}

// ===== 许可证 =====

function generateLicense() {
	const l = readJsonFile(path.join(KEYSTATIC_DIR, "license.json"));
	if (!l) return;
	writeDataFile(
		"keystatic-license.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
export const keystaticLicense = {
\tenable: ${l.enable !== false},
\tname: ${escapeStr(l.name || "CC BY-NC-SA 4.0")},
\turl: ${escapeStr(l.url || "https://creativecommons.org/licenses/by-nc-sa/4.0/")},
};
`,
	);
}

// ===== 设备 =====

function generateDevices() {
	const entries = readJsonDir("devices");
	if (entries.length === 0) return;

	// 按 category 分组
	const groups = {};
	for (const e of entries) {
		const cat = e.category || "其他";
		if (!groups[cat]) groups[cat] = [];
		groups[cat].push(e);
	}

	const groupEntries = Object.entries(groups)
		.map(([cat, devs]) => {
			const items = devs
				.map((d) => `\t\t\t{ name: ${escapeStr(d.name)}, image: ${escapeStr(d.image || "")}, specs: ${escapeStr(d.specs || "")}, description: ${escapeStr(d.description || "")}, link: ${escapeStr(d.link || "")} }`)
				.join(",\n");
			return `\t${escapeStr(cat)}: [\n${items}\n\t\t]`;
		})
		.join(",\n");

	writeDataFile(
		"devices.ts",
		`// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
// Edit via: http://localhost:4321/keystatic/

export interface Device {
  name: string;
  image: string;
  specs: string;
  description: string;
  link: string;
}

export type DeviceCategory = Record<string, Device[]> & { 自定义?: Device[] };

export const devicesData: DeviceCategory = {
${groupEntries}
};
`,
	);
}

// ===== 同步逻辑 =====

function syncAll() {
	if (!fs.existsSync(KEYSTATIC_DIR)) return [];

	const hasData = (sub) => {
		const dir = path.join(KEYSTATIC_DIR, sub);
		return fs.existsSync(dir) && fs.readdirSync(dir).some((f) => f.endsWith(".json"));
	};

	const updated = [];
	const has = (file) => fs.existsSync(path.join(KEYSTATIC_DIR, file));

	if (hasData("posts")) { generatePosts(); updated.push("posts"); }
	if (hasData("pages")) { generatePages(); updated.push("pages"); }
	if (hasData("diary")) { generateDiary(); updated.push("diary"); }
	if (hasData("friends")) { generateFriends(); updated.push("friends"); }
	if (hasData("projects")) { generateProjects(); updated.push("projects"); }
	if (hasData("skills")) { generateSkills(); updated.push("skills"); }
	if (hasData("timeline")) { generateTimeline(); updated.push("timeline"); }
	if (hasData("devices")) { generateDevices(); updated.push("devices"); }

	if (has("site-settings.json")) { generateSiteSettings(); updated.push("site-settings"); }
	if (has("profile.json")) { generateProfile(); updated.push("profile"); }
	if (has("announcement.json")) { generateAnnouncement(); updated.push("announcement"); }
	if (has("homepage.json")) { generateHomepage(); updated.push("homepage"); }
	if (has("effects.json")) { generateEffects(); updated.push("effects"); }
	if (has("nav-links.json")) { generateNavLinks(); updated.push("nav-links"); }
	if (has("comments.json")) { generateComments(); updated.push("comments"); }
	if (has("music.json")) { generateMusic(); updated.push("music"); }
	if (has("license.json")) { generateLicense(); updated.push("license"); }

	// 相册（从 public/images/albums/*.json 转换）
	const albumsDir = path.join(ROOT, "public/images/albums");
	if (fs.existsSync(albumsDir) && fs.readdirSync(albumsDir).some((f) => f.endsWith(".json"))) {
		generateAlbums();
		updated.push("albums");
	}

	return updated;
}

// ===== Watch 模式 =====

function startWatch() {
	console.log("\n👀 Watching Keystatic data for changes...\n");

	// 确保目录存在
	if (!fs.existsSync(KEYSTATIC_DIR)) {
		fs.mkdirSync(KEYSTATIC_DIR, { recursive: true });
	}

	// 为每个子目录创建（如果不存在）
	for (const sub of ["posts", "pages", "diary", "friends", "projects", "skills", "timeline", "devices"]) {
		const dir = path.join(KEYSTATIC_DIR, sub);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	}
	const albumsDir = path.join(ROOT, "public/images/albums");
	if (!fs.existsSync(albumsDir)) fs.mkdirSync(albumsDir, { recursive: true });

	let debounceTimer = null;

	const onChange = (eventType, filename) => {
		if (!filename || !filename.endsWith(".json")) return;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const ts = new Date().toLocaleTimeString("zh-CN", { hour12: false });
			console.log(`  [${ts}] Change detected: ${filename}`);
			try {
				const updated = syncAll();
				if (updated.length > 0) {
					console.log(`  [${ts}] ✅ Synced: ${updated.join(", ")}\n`);
				}
			} catch (err) {
				console.error(`  [${ts}] ❌ Sync error:`, err.message);
			}
		}, 300);
	};

	// 监听主目录（site-settings.json）
	fs.watch(KEYSTATIC_DIR, { persistent: true }, onChange);

	// 监听各子目录
	for (const sub of ["posts", "pages", "diary", "friends", "projects", "skills", "timeline", "devices"]) {
		const dir = path.join(KEYSTATIC_DIR, sub);
		fs.watch(dir, { persistent: true }, onChange);
	}
	// 监听相册目录
	fs.watch(albumsDir, { persistent: true }, onChange);

	// 初始同步一次
	const updated = syncAll();
	if (updated.length > 0) {
		console.log(`  Initial sync: ${updated.join(", ")}`);
	}
	console.log("  Ready. Waiting for Keystatic changes...\n");
}

// ===== 主流程 =====

const isWatch = process.argv.includes("--watch");

if (isWatch) {
	// 初始同步
	console.log("\n🔄 Initial Keystatic sync...\n");
	syncAll();
	console.log("✅ Initial sync complete!\n");
	// 启动 watch
	startWatch();
} else {
	console.log("\n🔄 Syncing Keystatic CMS data → Mizuki...\n");
	if (!fs.existsSync(KEYSTATIC_DIR)) {
		console.log("  ℹ No Keystatic data directory found, skipping sync");
		console.log("  (Data will appear after editing via /keystatic/ admin)\n");
	} else {
		const updated = syncAll();
		if (updated.length === 0) {
			console.log("  ℹ No Keystatic data to sync yet\n");
		}
	}
	console.log("✅ Keystatic sync complete!\n");
}
