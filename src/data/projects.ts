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
	{ id: "FolkADB", title: "FolkADB", description: "A portable ADB/Fastboot tool written in C, featuring interactive CLI, Tab completion, drag-and-drop module installation, and Shizuku activation.", image: "", category: "desktop", techStack: ["C"], status: "completed", liveDemo: undefined, sourceCode: "https://github.com/LyraVoid/FolkADB", visitUrl: undefined, startDate: "2025-06-01", endDate: "2026-01-01", featured: undefined, tags: ["Android", "ADB", "CLI"], showImage: false },
	{ id: "FolkPatch", title: "FolkPatch", description: "A kernel-level ROOT solution based on KernelPatch, with polished UI, APM module system, and KPM kernel module support.", image: "/assets/projects/folkpatch.webp", category: "mobile", techStack: ["Kotlin", "Rust", "C++", "Java"], status: "in-progress", liveDemo: undefined, sourceCode: "https://github.com/LyraVoid/FolkPatch", visitUrl: "https://fp.mysqil.com", startDate: "2024-03-01", endDate: undefined, featured: true, tags: ["Android", "Root", "Kernel"], showImage: undefined },
	{ id: "FolkSplash", title: "FolkSplash", description: "A web-based splash.img visualizer for OPPO/Realme/OnePlus devices, supporting unpack, preview, replace, and repack.", image: "", category: "web", techStack: ["React", "TypeScript", "Vite", "Material-UI", "Zustand"], status: "completed", liveDemo: undefined, sourceCode: "https://github.com/LyraVoid/FolkSplash", visitUrl: "https://splash.mysqil.com", startDate: "2025-09-01", endDate: "2025-10-01", featured: undefined, tags: ["Android", "Tool", "Frontend"], showImage: false },
	{ id: "FolkTool", title: "FolkTool", description: "A fast ROOT flashing tool for FolkPatch with a graphical interface and automated operations, simplifying the complex flashing process.", image: "", category: "desktop", techStack: ["Flutter", "Dart", "C++", "CMake"], status: "completed", liveDemo: undefined, sourceCode: "https://github.com/LyraVoid/FolkTool", visitUrl: undefined, startDate: "2026-02-01", endDate: "2026-02-28", featured: undefined, tags: ["Android", "Tool", "Desktop"], showImage: false },
	{ id: "Mizuki", title: "Mizuki", description: "A next-gen Material Design 3 blog theme built with Astro, featuring i18n, dark mode, and responsive design.", image: "/assets/projects/mizuki.webp", category: "web", techStack: ["Astro", "TypeScript", "Tailwind CSS", "Svelte"], status: "completed", liveDemo: undefined, sourceCode: "https://github.com/LyraVoid/Mizuki", visitUrl: "https://mizuki.mysqil.com", startDate: "2024-01-01", endDate: "2024-06-01", featured: true, tags: ["Blog", "Theme", "Open Source"], showImage: undefined }
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
