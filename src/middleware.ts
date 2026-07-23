import { makeHandler } from "@keystatic/astro/api";
import config from "../keystatic.config";
import { defineMiddleware } from "astro:middleware";

const keystaticHandler = makeHandler({ config });

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.url.pathname.startsWith("/api/keystatic/")) {
		// 安全守卫：非 production 环境下仅允许 localhost 访问 Keystatic API，
		// 防止 local 模式（无认证）被公网暴露
		const isProduction = import.meta.env.PROD;
		const hostname = context.url.hostname;
		const isLocal =
			hostname === "localhost" ||
			hostname === "127.0.0.1" ||
			hostname === "::1";

		if (!isProduction && !isLocal) {
			return new Response("Keystatic is disabled in non-production environments", {
				status: 403,
			});
		}

		try {
			return await keystaticHandler(context);
		} catch (error) {
			console.error("[Keystatic]", error);
			return new Response("Keystatic API Error", { status: 500 });
		}
	}
	return next();
});
