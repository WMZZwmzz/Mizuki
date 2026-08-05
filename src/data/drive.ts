export type DriveFileType =
	| "pdf"
	| "image"
	| "video"
	| "audio"
	| "archive"
	| "document"
	| "code"
	| "link"
	| "other";

export interface DriveFile {
	name: string;
	type: "file";
	fileType?: DriveFileType;
	url?: string;
	external?: boolean;
	size?: string;
	description?: string;
}

export interface DriveFolder {
	name: string;
	type: "folder";
	description?: string;
	children: DriveItem[];
}

export type DriveItem = DriveFile | DriveFolder;

export const driveData: DriveItem[] = [
	{
		name: "Software",
		type: "folder",
		description: "Software and tools",
		children: [
			{
				name: "Apps",
				type: "folder",
				children: [
					{
						name: "Mizuki Theme",
						type: "file",
						fileType: "archive",
						url: "https://github.com/WMZZwmzz/Mizuki/releases",
						external: true,
						size: "12.4 MB",
						description: "Mizuki blog theme latest release",
					},
					{
						name: "MAA Watchdog",
						type: "file",
						fileType: "code",
						url: "https://github.com/WMZZwmzz/maa-watchdog",
						external: true,
						size: "1.2 MB",
						description: "MAA log monitor and auto-recovery tool",
					},
				],
			},
			{
				name: "Tools",
				type: "folder",
				children: [
					{
						name: "Font Compression Guide",
						type: "file",
						fileType: "document",
						url: "#",
						size: "320 KB",
						description: "How to use the font subsetting tool",
					},
					{
						name: "Content Sync Script",
						type: "file",
						fileType: "code",
						url: "#",
						size: "48 KB",
						description: "External content repository sync script",
					},
				],
			},
		],
	},
	{
		name: "Documents",
		type: "folder",
		description: "Guides and documentation",
		children: [
			{
				name: "Development Guide",
				type: "file",
				fileType: "pdf",
				url: "#",
				size: "2.1 MB",
				description: "Mizuki development conventions and rules",
			},
			{
				name: "Deployment Manual",
				type: "file",
				fileType: "pdf",
				url: "#",
				size: "880 KB",
				description: "Step-by-step deployment guide",
			},
			{
				name: "Changelog",
				type: "file",
				fileType: "document",
				url: "#",
				size: "64 KB",
				description: "Version history and changes",
			},
		],
	},
	{
		name: "Media",
		type: "folder",
		description: "Images and media files",
		children: [
			{
				name: "Wallpapers",
				type: "folder",
				children: [
					{
						name: "Shizuku Dark",
						type: "file",
						fileType: "image",
						url: "/assets/wallpaper/aoishizukudark-1920x1080.webp",
						size: "420 KB",
						description: "1920x1080 wallpaper",
					},
					{
						name: "Shizuku Light",
						type: "file",
						fileType: "image",
						url: "/assets/wallpaper/aoishizukulight-1920x1080.webp",
						size: "398 KB",
						description: "1920x1080 wallpaper",
					},
				],
			},
			{
				name: "Logo Pack",
				type: "file",
				fileType: "archive",
				url: "#",
				size: "5.6 MB",
				description: "Mizuki logo assets in various formats",
			},
		],
	},
	{
		name: "Links",
		type: "folder",
		description: "External resources and references",
		children: [
			{
				name: "GitHub Repository",
				type: "file",
				fileType: "link",
				url: "https://github.com/WMZZwmzz/Mizuki",
				external: true,
				description: "Source code repository",
			},
			{
				name: "Bilibili Channel",
				type: "file",
				fileType: "link",
				url: "https://space.bilibili.com/1986470618",
				external: true,
				description: "Video content channel",
			},
			{
				name: "Astro Documentation",
				type: "file",
				fileType: "link",
				url: "https://docs.astro.build/",
				external: true,
				description: "Official Astro framework docs",
			},
		],
	},
];

export function getFileIcon(fileType?: DriveFileType): string {
	switch (fileType) {
		case "pdf":
			return "material-symbols:picture-as-pdf-outline";
		case "image":
			return "material-symbols:image-outline";
		case "video":
			return "material-symbols:video-file-outline";
		case "audio":
			return "material-symbols:audio-file-outline";
		case "archive":
			return "material-symbols:folder-zip-outline";
		case "document":
			return "material-symbols:description-outline";
		case "code":
			return "material-symbols:code-outline";
		case "link":
			return "material-symbols:link";
		default:
			return "material-symbols:draft-outline";
	}
}
