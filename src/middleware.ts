import { makeHandler } from "@keystatic/astro/api";
import config from "../keystatic.config.ts";
import { defineMiddleware } from "astro:middleware";

const keystaticHandler = makeHandler({ config });

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.url.pathname.startsWith("/api/keystatic/")) {
		try {
			return await keystaticHandler(context);
		} catch (error) {
			console.error("[Keystatic]", error);
			return new Response("Keystatic API Error", { status: 500 });
		}
	}
	return next();
});
