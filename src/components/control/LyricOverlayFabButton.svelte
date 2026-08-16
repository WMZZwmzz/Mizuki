<!--
  LyricOverlayFabButton — 切换播放时屏幕上方的歌词字幕显示
  状态持久化在 localStorage "lyricOverlayEnabled"，与 LyricOverlay 通过
  "lyric-overlay-toggle" 事件同步
-->
<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import {
	getStoredLyricOverlayEnabled,
	setLyricOverlayEnabled,
} from "@/utils/setting-utils";

let enabled = $state(true);

function toggle() {
	enabled = !enabled;
	setLyricOverlayEnabled(enabled);
}

function handleToggleEvent(event: Event) {
	const detail = (event as CustomEvent<{ enabled: boolean }>).detail;
	if (detail && typeof detail.enabled === "boolean") {
		enabled = detail.enabled;
	}
}

// SSR 阶段不执行 onMount，window 访问全部留在客户端生命周期内
onMount(() => {
	enabled = getStoredLyricOverlayEnabled();
	window.addEventListener("lyric-overlay-toggle", handleToggleEvent);

	return () => {
		window.removeEventListener("lyric-overlay-toggle", handleToggleEvent);
	};
});
</script>

<button
	type="button"
	class="lyric-fab btn-card"
	class:active={enabled}
	aria-pressed={enabled}
	aria-label={i18n(I18nKey.lyricSubtitle)}
	title={i18n(I18nKey.lyricSubtitle)}
	onclick={toggle}
>
	<span class="lyric-fab__icon" aria-hidden="true">
		<Icon icon="material-symbols:lyrics-outline-rounded" />
	</span>
</button>

<style>
	.lyric-fab {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--fab-button-size, 3rem);
		height: var(--fab-button-size, 3rem);
		min-width: 0;
		min-height: 0;
		padding: 0.25rem;
		border: 1px solid rgba(148, 163, 184, 0.45);
		border-radius: 1rem;
		cursor: pointer;
		color: var(--primary);
		pointer-events: auto;
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.3s ease,
			background 0.3s ease,
			opacity 0.3s ease;
	}

	.lyric-fab:hover {
		box-shadow: var(--shadow-button);
	}

	.lyric-fab:active {
		transform: scale(0.94);
	}

	/* 关闭时整体弱化，开启时保持主题色 */
	.lyric-fab:not(.active) {
		opacity: 0.55;
	}

	.lyric-fab.active {
		background: var(--btn-card-bg-active);
	}

	.lyric-fab__icon {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		line-height: 1;
	}

	:global(.dark) .lyric-fab {
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	:global(.dark) .lyric-fab:hover {
		box-shadow: var(--shadow-button-dark);
	}

	@media (max-width: 768px) {
		.lyric-fab {
			border-radius: 0.75rem;
		}

		.lyric-fab__icon {
			font-size: 1.4rem;
		}
	}

	@media (max-width: 480px) {
		.lyric-fab {
			border-radius: 0.5rem;
		}
	}
</style>
