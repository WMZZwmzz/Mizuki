// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
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
	archived?: boolean;
}

export const projectsData: Project[] = [
	{
		id: "Android-Pi",
		title: "Android-Pi",
		description: "适用于Android的一键式Pi Coding Agent",
		image: "",
		category: "mobile",
		techStack: ["Flutter", "Dart", "Android"],
		status: "in-progress",
		liveDemo: undefined,
		sourceCode: "https://github.com/WMZZwmzz/Android-Pi",
		visitUrl: undefined,
		startDate: "2026-08-09",
		endDate: undefined,
		featured: undefined,
		tags: ["Flutter", "Dart", "Android", "移动端"],
		showImage: false,
		archived: true,
	},
	{
		id: "MAA Watchdog",
		title: "MAA Watchdog",
		description:
			"MAA (MaaAssistantArknights) 右侧日志实时监控器：截图失败自动恢复看门狗 + 一键挂机，使用系统自带 csc.exe 零 SDK 编译",
		image: "",
		category: "desktop",
		techStack: ["C#", ".NET Framework", "UI Automation"],
		status: "in-progress",
		liveDemo: undefined,
		sourceCode: "https://github.com/WMZZwmzz/maa-watchdog",
		visitUrl: undefined,
		startDate: "2026-07-24",
		endDate: undefined,
		featured: undefined,
		tags: ["MAA", "明日方舟", "自动化"],
		showImage: false,
		archived: undefined,
	},
	{
		id: "Mizuki",
		title: "Mizuki",
		description:
			"基于 Astro 构建的個人博客主题，集成 Keystatic 内容管理、追番、日记、项目展示、相册等模块，支持明暗主题与丰富特效",
		image: "",
		category: "web",
		techStack: ["Astro", "TypeScript", "Tailwind CSS", "Keystatic"],
		status: "in-progress",
		liveDemo: undefined,
		sourceCode: "https://github.com/WMZZwmzz/Mizuki",
		visitUrl: "https://wmzzwmzz.github.io/Mizuki/",
		startDate: "2026-07-05",
		endDate: undefined,
		featured: true,
		tags: ["博客", "Astro"],
		showImage: false,
		archived: undefined,
	},
	{
		id: "无回楼",
		title: "无回楼",
		description:
			"《无回楼》中式心理恐怖游戏：设计文档与 Godot 4.7 垂直切片 Demo",
		image: "",
		category: "desktop",
		techStack: ["Godot 4", "GDScript"],
		status: "in-progress",
		liveDemo: undefined,
		sourceCode: "https://github.com/WMZZwmzz/wuhuilou",
		visitUrl: undefined,
		startDate: "2026-08-23",
		endDate: undefined,
		featured: true,
		tags: ["Godot", "GDScript", "独立游戏", "心理恐怖"],
		showImage: false,
		archived: undefined,
	},
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
	return category
		? projectsData.filter((p) => p.category === category)
		: projectsData;
}

export function getFeaturedProjects(): Project[] {
	return projectsData.filter((p) => p.featured);
}

export function getAllTechStack(): string[] {
	const set = new Set<string>();
	projectsData.forEach((p) => {
		p.techStack.forEach((t) => {
			set.add(t);
		});
	});
	return [...set].sort();
}
