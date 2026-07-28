// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
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

];
