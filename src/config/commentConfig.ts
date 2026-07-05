import type { CommentConfig } from "../types/config";
import { SITE_LANG } from "./siteConfig";
import { keystaticComments } from "../data/keystatic-comments";

const kc = keystaticComments;

export const commentConfig: CommentConfig = {
	enable: kc.enable ?? false,
	system: kc.system || "twikoo",
	twikoo: {
		envId: kc.twikoo?.envId || "https://twikoo.vercel.app",
		lang: SITE_LANG,
	},
	giscus: {
		repo: kc.giscus?.repo || "",
		repoId: kc.giscus?.repoId || "",
		category: kc.giscus?.category || "Announcements",
		categoryId: kc.giscus?.categoryId || "",
		mapping: "pathname",
		strict: "0",
		reactionsEnabled: "1",
		emitMetadata: "0",
		inputPosition: "top",
		theme: "preferred_color_scheme",
		lang: SITE_LANG,
		loading: "lazy",
	},
};
