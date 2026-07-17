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
