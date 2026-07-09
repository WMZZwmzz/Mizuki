import path from "node:path";

export async function processPosterImage(
	imagePath: string | undefined,
	filePath: string | undefined,
): Promise<string> {
	if (!imagePath) {
		return "";
	}

	const isLocal = !(
		imagePath.startsWith("/") ||
		imagePath.startsWith("http") ||
		imagePath.startsWith("https") ||
		imagePath.startsWith("data:")
	);

	if (isLocal && filePath) {
		const basePath = filePath.replace(/\/[^/]+$/, "").replace(/\\/g, "/");
		const files = import.meta.glob<ImageMetadata>(
			[
				"../../**/*.{jpg,jpeg,png,gif,webp,avif,svg}",
				// 排除 public/ 与 dist/：public/pio/models/** 是 Git-LFS 跟踪的
				// Live2D 纹理，在未启用 lfs 的 CI 检出里是 LFS 指针文本而非真图，
				// Astro 读取其元数据会抛 NoImageMetadata 导致构建失败。
				// 文章图片位于 src/content 下，不依赖 public/。
				"!../../public/**",
				"!../../dist/**",
			],
			{
				import: "default",
			},
		);
		const normalizedPath = path
			.normalize(path.join("../../", basePath, imagePath))
			.replace(/\\/g, "/");
		const file = files[`./${normalizedPath}`] || files[normalizedPath];
		if (file) {
			const img = await file();
			return img.src;
		}
	}

	if (imagePath.startsWith("http")) {
		try {
			const response = await fetch(imagePath);
			const arrayBuffer = await response.arrayBuffer();
			const base64 = Buffer.from(arrayBuffer).toString("base64");
			const contentType = response.headers.get("content-type") || "image/jpeg";
			return `data:${contentType};base64,${base64}`;
		} catch {
			return imagePath;
		}
	}

	return imagePath;
}
