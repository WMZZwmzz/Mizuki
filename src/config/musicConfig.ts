import type { MusicPlayerConfig } from "../types/config";
import { keystaticMusic } from "../data/keystatic-music";

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: keystaticMusic.enable ?? true,
	showFloatingPlayer: keystaticMusic.showFloatingPlayer ?? true,
	floatingEntryMode: "fab",
	mode: keystaticMusic.mode || "local",
	meting_api: keystaticMusic.meting_api || "",
	id: keystaticMusic.id || "",
	server: keystaticMusic.server || "netease",
	type: keystaticMusic.type || "playlist",
};
