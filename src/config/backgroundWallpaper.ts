import type { FullscreenWallpaperConfig } from "../types/config";

export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = {
	enable: true,
	src: {
		desktop: [
			"/assets/wallpaper/aoishizukudark-1920x1080.webp",
			"/assets/wallpaper/aoishizukulight-1920x1080.webp",
			"/assets/wallpaper/shizukuaoidark-tenmushinryuusai-1920x1080.webp",
			"/assets/wallpaper/shizukuaoilight-tenmushinryuusai-1920x1080.webp",
			"/assets/wallpaper/shizukuaoilightanimalears-tenmushinryuusai-1920x1080.webp",
			"/assets/wallpaper/shizukuwp21-2560x1600.webp",
			"/assets/wallpaper/shizukuwp23-1920x1200.webp",
		],
		mobile: [
			"/assets/wallpaper/aoishizukudark-1920x1080.webp",
			"/assets/wallpaper/aoishizukulight-1920x1080.webp",
			"/assets/wallpaper/shizukuaoidark-tenmushinryuusai-1920x1080.webp",
			"/assets/wallpaper/shizukuaoilight-tenmushinryuusai-1920x1080.webp",
			"/assets/wallpaper/shizukuaoilightanimalears-tenmushinryuusai-1920x1080.webp",
			"/assets/wallpaper/shizukuwp21-2560x1600.webp",
			"/assets/wallpaper/shizukuwp23-1920x1200.webp",
		],
	},
	position: "center",
	carousel: {
		enable: true,
		interval: 5,
	},
	zIndex: -1,
	opacity: 0.8,
	blur: 1,
	switchable: true,
	overlay: {
		opacity: 0.8, // 壁纸不透明度，0-1
		blur: 1.5, // 背景模糊半径（px）
		cardOpacity: 0.8, // 卡片不透明度，0-1
		switchable: {
			opacity: true,
			blur: true,
			cardOpacity: true,
		},
	},
	fullscreen: {
		switchable: {
			opacity: true,
			blur: true,
		},
	},
};
