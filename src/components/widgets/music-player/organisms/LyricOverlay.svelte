<!--
  LyricOverlay — 播放时在屏幕上方居中显示当前歌词字幕
  功能：
    - 原文与译文上下两行同时显示（无译文时仅显示原文）
    - 纯音乐（歌词仅含"纯音乐/请欣赏"等占位文案）不显示
    - 仅播放中可见，暂停或无歌词时淡出
    - pointer-events: none，不拦截任何页面交互
    - 可通过 localStorage "lyricOverlayEnabled" 开关（右侧悬浮按钮切换）
    - 背景不透明度跟随 :root 上的 --lyric-bg-opacity（设置面板可调）
  数据源：订阅 musicPlayerStore 的 lyrics / currentLyricIndex / isPlaying
-->
<script lang="ts">
import { onMount } from "svelte";
import { fade } from "svelte/transition";

import type { MusicPlayerState } from "@/stores/musicPlayerStore";
import { musicPlayerStore } from "@/stores/musicPlayerStore";
import {
	applyLyricBgOpacity,
	getStoredLyricOverlayEnabled,
} from "@/utils/setting-utils";

import { isInstrumentalLyricText } from "../parseLrc";

let state = $state<MusicPlayerState>(musicPlayerStore.getState());
let overlayEnabled = $state(true);
let unsubscribe: (() => void) | undefined;

function handleToggleEvent(event: Event) {
	const detail = (event as CustomEvent<{ enabled: boolean }>).detail;
	if (detail && typeof detail.enabled === "boolean") {
		overlayEnabled = detail.enabled;
	}
}

// SSR 阶段不执行 onMount，window 访问全部留在客户端生命周期内
onMount(() => {
	// 恢复持久化的开关状态与背景透明度 CSS 变量
	overlayEnabled = getStoredLyricOverlayEnabled();
	applyLyricBgOpacity();
	window.addEventListener("lyric-overlay-toggle", handleToggleEvent);
	unsubscribe = musicPlayerStore.subscribe((nextState) => {
		state = nextState;
	});

	return () => {
		window.removeEventListener("lyric-overlay-toggle", handleToggleEvent);
		unsubscribe?.();
		unsubscribe = undefined;
	};
});

let currentLine = $derived(
	state.currentLyricIndex >= 0
		? state.lyrics[state.currentLyricIndex]
		: undefined,
);
let visible = $derived(
	overlayEnabled &&
		state.isPlaying &&
		!!currentLine &&
		!isInstrumentalLyricText(currentLine.text),
);
</script>

{#if visible && currentLine}
	<div class="lyric-overlay" aria-hidden="true" transition:fade={{ duration: 200 }}>
		{#key currentLine.time}
			<div
				class="lyric-overlay__line"
				transition:fade={{ duration: 220 }}
			>
				<p class="lyric-overlay__text">{currentLine.text}</p>
				{#if currentLine.translation}
					<p class="lyric-overlay__translation">{currentLine.translation}</p>
				{/if}
			</div>
		{/key}
	</div>
{/if}

<style>
.lyric-overlay {
	position: fixed;
	top: 4.75rem;
	left: 50%;
	transform: translateX(-50%);
	z-index: 40;
	max-width: min(90vw, 42rem);
	pointer-events: none;
	/* 歌词行全部堆叠在同一网格单元，切换时新旧行原地重叠淡入淡出 */
	display: grid;
	justify-items: center;
	align-items: center;
}

.lyric-overlay__line {
	grid-area: 1 / 1;
	/* 原文与译文上下两行居中显示 */
	display: grid;
	justify-items: center;
	align-items: center;
	row-gap: 0.125rem;
	padding: 0.5rem 1.25rem;
	border-radius: 1rem;
	/* 默认 25%，与设置面板的 DEFAULT_LYRIC_BG_OPACITY 保持一致；100% 时与 --card-bg-transparent 完全一致 */
	background: color-mix(
		in srgb,
		var(--card-bg-transparent) var(--lyric-bg-opacity, 25%),
		transparent
	);
	border: 1px solid var(--line-divider);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	text-align: center;
}

.lyric-overlay__text {
	margin: 0;
	font-size: 0.9375rem;
	font-weight: 600;
	line-height: 1.5;
	color: var(--primary);
	overflow-wrap: anywhere;
}

.lyric-overlay__translation {
	margin: 0;
	font-size: 0.8125rem;
	font-weight: 400;
	line-height: 1.4;
	color: var(--content-meta);
	overflow-wrap: anywhere;
}
</style>
