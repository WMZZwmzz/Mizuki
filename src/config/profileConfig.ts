import type { ProfileConfig } from "../types/config";
import { keystaticProfile } from "../data/keystatic-profile";

// 个人资料配置（Keystatic 后台可编辑，默认值作为兜）
export const profileConfig: ProfileConfig = {
	avatar: keystaticProfile.avatar || "assets/images/avatar.webp",
	name: keystaticProfile.name || "无名之子",
	bio: keystaticProfile.bio || "你好，我是无名之子。",
	typewriter: {
		enable: true,
		speed: 80,
	},
	links: keystaticProfile.links.length > 0
		? keystaticProfile.links
		: [
				{ name: "Bilibili", icon: "simple-icons:bilibili", url: "https://space.bilibili.com/1986470618" },
				{ name: "Gitee", icon: "mdi:git", url: "https://gitee.com/WuMingZhiZi" },
				{ name: "GitHub", icon: "simple-icons:github", url: "https://github.com/WMZZwmzz" },
			],
};
