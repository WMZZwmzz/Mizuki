<!--
  LyricOverlay — 播放时在屏幕上方居中显示当前歌词字幕
  功能：
    - 原文与译文上下两行同时显示（无译文时仅显示原文）
    - 纯音乐（歌词仅含"纯音乐/请欣赏"等占位文案）不显示
    - 仅播放中可见，暂停或无歌词时淡出
    - pointer-events: none，不拦截任何页面交互（仅右下角缩放手柄可交互）
    - 拖拽右下角手柄可按比例缩放（位置不动），双击手柄恢复默认，localStorage "lyricScale" 持久化
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
	applyLyricScale,
	getStoredLyricOverlayEnabled,
	getStoredLyricScale,
	MAX_LYRIC_SCALE,
	MIN_LYRIC_SCALE,
	setLyricScale,
} from "@/utils/setting-utils";

import { isInstrumentalLyricText } from "../parseLrc";

let state = $state<MusicPlayerState>(musicPlayerStore.getState());
let overlayEnabled = $state(true);
let unsubscribe: (() => void) | undefined;

// 拖拽缩放状态：非拖拽时 scale 仅作为 CSS 变量的缓存值
let scale = $state(1);
let lineEl = $state<HTMLElement | null>(null);
let resizeStart: { dist: number; scale: number } | null = null;

function handleToggleEvent(event: Event) {
	const detail = (event as CustomEvent<{ enabled: boolean }>).detail;
	if (detail && typeof detail.enabled === "boolean") {
		overlayEnabled = detail.enabled;
	}
}

// 设置面板等外部入口修改缩放时同步内部状态
function handleScaleChangeEvent(event: Event) {
	const detail = (event as CustomEvent<{ scale: number }>).detail;
	if (detail && typeof detail.scale === "number") {
		scale = detail.scale;
	}
}

// SSR 阶段不执行 onMount，window 访问全部留在客户端生命周期内
onMount(() => {
	// 恢复持久化的开关状态与背景透明度 CSS 变量
	overlayEnabled = getStoredLyricOverlayEnabled();
	applyLyricBgOpacity();
	scale = getStoredLyricScale();
	applyLyricScale();
	window.addEventListener("lyric-overlay-toggle", handleToggleEvent);
	window.addEventListener("lyric-scale-change", handleScaleChangeEvent);
	unsubscribe = musicPlayerStore.subscribe((nextState) => {
		state = nextState;
	});

	return () => {
		window.removeEventListener("lyric-overlay-toggle", handleToggleEvent);
		window.removeEventListener("lyric-scale-change", handleScaleChangeEvent);
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

function distanceToLineCenter(event: PointerEvent): number {
	if (!lineEl) return 0;
	const rect = lineEl.getBoundingClientRect();
	const dx = event.clientX - (rect.left + rect.width / 2);
	const dy = event.clientY - (rect.top + rect.height / 2);
	return Math.hypot(dx, dy);
}

// Windows 式角落缩放：以元素中心为锚点，按指针距离比例缩放，位置不动
function handleResizeStart(event: PointerEvent) {
	if (event.button !== 0) return;
	event.preventDefault();
	resizeStart = { dist: distanceToLineCenter(event), scale };
	if (resizeStart.dist === 0) {
		resizeStart = null;
		return;
	}
	event.currentTarget.setPointerCapture(event.pointerId);
	document.body.style.userSelect = "none";
}

function handleResizeMove(event: PointerEvent) {
	if (!resizeStart) return;
	const ratio = distanceToLineCenter(event) / resizeStart.dist;
	scale = Math.min(
		MAX_LYRIC_SCALE,
		Math.max(MIN_LYRIC_SCALE, resizeStart.scale * ratio),
	);
}

function handleResizeEnd(event: PointerEvent) {
	if (!resizeStart) return;
	resizeStart = null;
	document.body.style.userSelect = "";
	if (lineEl?.hasPointerCapture(event.pointerId)) {
		lineEl.releasePointerCapture(event.pointerId);
	}
	setLyricScale(scale);
}

function handleResizeReset() {
	scale = 1;
	setLyricScale(scale);
}
</script>

{#if visible && currentLine}
	<div class="lyric-overlay" aria-hidden="true" transition:fade={{ duration: 200 }}>
		{#key currentLine.time}
			<div
				class="lyric-overlay__line"
				transition:fade={{ duration: 220 }}
				bind:this={lineEl}
				style:--lyric-scale={scale}
			>
				<p class="lyric-overlay__text">{currentLine.text}</p>
				{#if currentLine.translation}
					<p class="lyric-overlay__translation">{currentLine.translation}</p>
				{/if}
				<span
					class="lyric-overlay__resize"
					role="separator"
					aria-label="拖拽缩放歌词字幕"
					title="拖拽缩放，双击恢复默认大小"
					onpointerdown={handleResizeStart}
					onpointermove={handleResizeMove}
					onpointerup={handleResizeEnd}
					onpointercancel={handleResizeEnd}
					ondblclick={handleResizeReset}
				></span>
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
	position: relative;
	/* 缩放锚点为元素中心：只按比例改变大小，位置不动 */
	transform: scale(var(--lyric-scale, 1));
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

/* Windows 式右下角缩放手柄：外层 pointer-events: none，仅手柄可交互 */
.lyric-overlay__resize {
	pointer-events: auto;
	position: absolute;
	right: 0.25rem;
	bottom: 0.25rem;
	width: 0.625rem;
	height: 0.625rem;
	cursor: nwse-resize;
	touch-action: none;
	opacity: 0.35;
	transition: opacity 0.15s ease;
	/* 两条斜线模拟 Windows 窗口缩放手柄 */
	background:
		linear-gradient(
			135deg,
			transparent 0 55%,
			var(--content-meta) 55% 65%,
			transparent 65% 78%,
			var(--content-meta) 78% 88%,
			transparent 88%
		);
}

.lyric-overlay__resize:hover,
.lyric-overlay__resize:active {
	opacity: 0.9;
}

/* 触屏设备：缩放手柄加大，保证可拖拽命中 */
@media (hover: none) and (pointer: coarse) {
	.lyric-overlay__resize {
		width: 1rem;
		height: 1rem;
	}
}
</style>
