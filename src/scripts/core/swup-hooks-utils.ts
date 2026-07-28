/**
 * Swup 钩子纯函数工具
 * 与 DOM/window 解耦，便于单元测试
 */

/**
 * 解析链接 href 对应的目标 pathname。
 * 相对/绝对链接均以 baseHref 为基准解析；无法解析时原样返回 href。
 */
export function resolveTargetPathname(href: string, baseHref: string): string {
	try {
		return new URL(href, baseHref).pathname;
	} catch {
		return href;
	}
}
