/**
 * 歌单 ID 的纯解析/容错逻辑，供设置面板与 musicPlayerStore 复用。
 * 不依赖浏览器环境，可被 node --test 直接加载测试。
 */

// 从分享链接/分享文本中提取歌单 ID（如 https://music.163.com/m/playlist?id=xxx&creatorId=yyy）
export function extractPlaylistId(raw: string): string {
	const trimmed = raw.trim();
	if (/^\d+$/.test(trimmed)) return trimmed;
	const match =
		trimmed.match(/[?&#]id=(\d+)/i) ?? trimmed.match(/playlist[/=](\d+)/i);
	return match ? match[1] : "";
}

// 存储与配置歌单 ID 均为空时加载歌单使用的兜底 ID
export const FALLBACK_METING_PLAYLIST_ID = "14164869977";

// musicPlayerStore 加载歌单时的 ID 容错：存储 ID > 配置默认 ID > 兜底 ID，
// 并标记实际生效的 ID 是否来自存储（供失败回退判断使用）
export function resolveMetingPlaylistId(
	storedPlaylistId: string,
	defaultPlaylistId = "",
): {
	id: string;
	fromStoredId: boolean;
} {
	return {
		id: storedPlaylistId || defaultPlaylistId || FALLBACK_METING_PLAYLIST_ID,
		fromStoredId: Boolean(storedPlaylistId),
	};
}
