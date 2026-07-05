import type { AnnouncementConfig } from "../types/config";
import { keystaticAnnouncement } from "../data/keystatic-announcement";

// 公告栏配置（Keystatic 后台可编辑，默认值作为兜）
export const announcementConfig: AnnouncementConfig = {
	title: keystaticAnnouncement.title || "",
	content: keystaticAnnouncement.content || "ブログへようこそ！これはサンプルの告知です",
	icon: keystaticAnnouncement.icon || undefined,
	type: keystaticAnnouncement.type || "info",
	closable: keystaticAnnouncement.closable,
	link: {
		enable: keystaticAnnouncement.link.enable,
		text: keystaticAnnouncement.link.text || "Learn More",
		url: keystaticAnnouncement.link.url || "/about/",
		external: keystaticAnnouncement.link.external,
	},
};
