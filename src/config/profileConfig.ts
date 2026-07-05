import type { ProfileConfig } from "../types/config";
import { keystaticProfile } from "../data/keystatic-profile";

// 个人资料配置（Keystatic 后台可编辑，默认值作为兜）
export const profileConfig: ProfileConfig = {
	avatar: keystaticProfile.avatar || "assets/images/avatar.webp",
	name: keystaticProfile.name || "まつざか ゆき",
	bio: keystaticProfile.bio || "世界は大きい、君は行かなければならない",
	typewriter: {
		enable: true,
		speed: 80,
	},
	links: keystaticProfile.links.length > 0
		? keystaticProfile.links
		: [
				{ name: "Bilibili", icon: "fa7-brands:bilibili", url: "https://space.bilibili.com/701864046" },
				{ name: "Gitee", icon: "mdi:git", url: "https://gitee.com/matsuzakayuki" },
				{ name: "GitHub", icon: "fa7-brands:github", url: "https://github.com/matsuzaka-yuki" },
				{ name: "Codeberg", icon: "simple-icons:codeberg", url: "https://codeberg.org" },
				{ name: "Discord", icon: "fa7-brands:discord", url: "https://discord.gg/MqW6TcQtVM" },
			],
};
