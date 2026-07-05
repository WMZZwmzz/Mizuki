// Auto-generated from Keystatic CMS — DO NOT EDIT MANUALLY
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
	{ id: 1, content: "这是一条通过 Keystatic 后台创建的测试日记！", date: "2026-07-03T10:00:00.000Z", images: undefined, location: "北京", mood: "开心", tags: ["测试", "Keystatic"] }
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
