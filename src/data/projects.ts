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
}

export const projectsData: Project[] = [
	{ id: "MAA Watchdog", title: "MAA Watchdog", description: "MAA (MaaAssistantArknights) 右侧日志实时监控器：截图失败自动恢复看门狗 + 一键挂机，使用系统自带 csc.exe 零 SDK 编译", image: "", category: "desktop", techStack: ["C#", ".NET Framework", "UI Automation"], status: "in-progress", liveDemo: undefined, sourceCode: "https://github.com/WMZZwmzz/maa-watchdog", visitUrl: undefined, startDate: "2026-07-24", endDate: undefined, featured: undefined, tags: ["MAA", "明日方舟", "自动化"], showImage: false },
	{ id: "Mizuki", title: "Mizuki", description: "基于 Astro 构建的個人博客主题，集成 Keystatic 内容管理、追番、日记、项目展示、相册等模块，支持明暗主题与丰富特效", image: "", category: "web", techStack: ["Astro", "TypeScript", "Tailwind CSS", "Keystatic"], status: "in-progress", liveDemo: undefined, sourceCode: "https://github.com/WMZZwmzz/Mizuki", visitUrl: "https://wmzzwmzz.github.io/Mizuki/", startDate: "2026-07-05", endDate: undefined, featured: true, tags: ["博客", "Astro"], showImage: false }
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
  projectsData.forEach((p) => { p.techStack.forEach((t) => { set.add(t); }); });
  return [...set].sort();
}
