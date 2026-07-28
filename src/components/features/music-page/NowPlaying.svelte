<!--
  NowPlaying — Apple Music 风格播放器视图
  布局：左侧（封面 280px + 歌曲信息 + 进度条 + 控制按钮）+ 右侧（歌词大面积展示）
  功能：
    - 专辑封面展示
    - 歌曲名 / 艺术家显示
    - 可拖动进度条 + 时间显示
    - 播放控制：循环 / 上一曲 / 播放暂停 / 下一曲 / 收藏
    - 歌词同步展示（当前行高亮、自动滚动、点击跳转）
    - 用户手动滚动歌词时暂停自动滚动 3 秒
  数据源：通过 Props 接收 playerState，从 musicPlayerStore 获取歌词等扩展字段
-->
<script lang="ts">
import Icon from "@iconify/svelte";
import { tick } from "svelte";

import type { MusicPlayerState } from "@/stores/musicPlayerStore";
import { musicPlayerStore } from "@/stores/musicPlayerStore";

interface LyricLine {
	time: number;
	text: string;
}

interface Props {
	playerState: MusicPlayerState;
}

let { playerState }: Props = $props();

let lyricsPanelRef: HTMLDivElement | undefined = $state();
let userScrollTimer: ReturnType<typeof setTimeout> | undefined;
let isUserScrolling = $state(false);

// Derived values
let currentSong = $derived(playerState.currentSong);
let isPlaying = $derived(playerState.isPlaying);
let currentTime = $derived(playerState.currentTime);
let duration = $derived(playerState.duration);
let repeatMode = $derived(playerState.isRepeating);

let lyrics = $derived.by(() => {
	const state = playerState as MusicPlayerState & { lyrics?: LyricLine[] };
	return state.lyrics ?? [];
});
let currentLyricIndex = $derived.by(() => {
	const state = playerState as MusicPlayerState & {
		currentLyricIndex?: number;
	};
	return state.currentLyricIndex ?? -1;
});
let lyricsLoading = $derived.by(() => {
	const state = playerState as MusicPlayerState & { lyricsLoading?: boolean };
	return state.lyricsLoading ?? false;
});

function formatTime(seconds: number): string {
	if (!seconds || !Number.isFinite(seconds)) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function handleSeek(event: Event) {
	const target = event.target as HTMLInputElement;
	const time = Number.parseFloat(target.value);
	musicPlayerStore.seek(time);
}

function togglePlay() {
	musicPlayerStore.toggle();
}

function prevSong() {
	musicPlayerStore.prev();
}

function nextSong() {
	musicPlayerStore.next();
}

function toggleRepeat() {
	musicPlayerStore.toggleRepeat();
}

function seekToLyricTime(time: number) {
	musicPlayerStore.seek(time);
}

function getRepeatIcon(): string {
	if (repeatMode === 2) return "material-symbols:repeat-one-rounded";
	return "material-symbols:repeat-rounded";
}

// Auto-scroll lyrics to current line (paused while user is scrolling)
$effect(() => {
	if (isUserScrolling) return;
	if (currentLyricIndex >= 0 && lyricsPanelRef) {
		tick().then(() => {
			const activeLine = lyricsPanelRef?.querySelector(
				".lyric-line--active",
			) as HTMLElement | null;
			if (activeLine) {
				activeLine.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}
		});
	}
});

function handleLyricsScroll() {
	isUserScrolling = true;
	if (userScrollTimer) clearTimeout(userScrollTimer);
	userScrollTimer = setTimeout(() => {
		isUserScrolling = false;
	}, 3000);
}

let progressPercent = $derived(
	duration > 0 ? (currentTime / duration) * 100 : 0,
);
</script>

<div class="now-playing">
	<!-- 左侧：封面 + 歌曲信息 + 进度条 + 控制按钮 -->
	<div class="now-playing__left">
		<div class="now-playing__cover">
			{#if currentSong.cover}
				<img
					src={currentSong.cover}
					alt="{currentSong.title} - {currentSong.artist}"
					class="now-playing__cover-img"
				/>
			{:else}
				<div class="now-playing__cover-placeholder">
					<Icon
						icon="material-symbols:music-note-rounded"
						class="text-5xl text-[var(--content-meta)]"
					/>
				</div>
			{/if}
		</div>

		<!-- 歌曲信息 -->
		<div class="now-playing__info">
			<h2 class="now-playing__title">{currentSong.title}</h2>
			<p class="now-playing__artist">{currentSong.artist}</p>
		</div>

		<!-- 进度条 -->
		<div class="now-playing__progress">
			<input
				type="range"
				class="now-playing__slider"
				min="0"
				max={duration || 0}
				step="0.1"
				value={currentTime}
				oninput={handleSeek}
				style={`--progress: ${progressPercent}%`}
			/>
		</div>

		<!-- 时间显示 -->
		<div class="now-playing__time-row">
			<span class="now-playing__time">{formatTime(currentTime)}</span>
			<span class="now-playing__time">{formatTime(duration)}</span>
		</div>

		<!-- 控制按钮 -->
		<div class="now-playing__controls">
			<button
				class="now-playing__btn now-playing__btn--small"
				class:active={repeatMode > 0}
				onclick={toggleRepeat}
				aria-label="循环模式"
			>
				<Icon icon={getRepeatIcon()} class="text-xl" />
			</button>

			<button
				class="now-playing__btn now-playing__btn--small"
				onclick={prevSong}
				aria-label="上一曲"
			>
				<Icon
					icon="material-symbols:skip-previous-rounded"
					class="text-2xl"
				/>
			</button>

			<button
				class="now-playing__btn now-playing__btn--play"
				onclick={togglePlay}
				aria-label={isPlaying ? "暂停" : "播放"}
			>
				<Icon
					icon={isPlaying
						? "material-symbols:pause-rounded"
						: "material-symbols:play-arrow-rounded"}
					class="text-3xl"
				/>
			</button>

			<button
				class="now-playing__btn now-playing__btn--small"
				onclick={nextSong}
				aria-label="下一曲"
			>
				<Icon icon="material-symbols:skip-next-rounded" class="text-2xl" />
			</button>

			<button
				class="now-playing__btn now-playing__btn--small now-playing__btn--favorite"
				aria-label="收藏"
			>
				<Icon icon="material-symbols:favorite-rounded" class="text-xl" />
			</button>
		</div>
	</div>

	<!-- 右侧：歌词展示区域 -->
	<div class="now-playing__lyrics" bind:this={lyricsPanelRef} onscroll={handleLyricsScroll}>
		{#if lyricsLoading}
			<div class="now-playing__lyrics-loading">
				<Icon
					icon="material-symbols:sync-rounded"
					class="text-2xl animate-spin-icon"
				/>
			</div>
		{:else if lyrics.length > 0}
			{#each lyrics as lyric, i}
				<button
					class="lyric-line"
					class:lyric-line--active={i === currentLyricIndex}
					onclick={() => seekToLyricTime(lyric.time)}
				>
					{lyric.text}
				</button>
			{/each}
		{:else}
			<p class="now-playing__lyrics-empty">暂无歌词</p>
		{/if}
	</div>
</div>

<style>
	.now-playing {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 32px;
		width: 100%;
		align-items: start;
	}

	/* ── Left column: cover + info + controls ── */
	.now-playing__left {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Cover Art */
	.now-playing__cover {
		width: 280px;
		height: 280px;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		transition: box-shadow 0.3s ease;
		flex-shrink: 0;
	}

	.now-playing__cover:hover {
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22);
	}

	.now-playing__cover-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.now-playing__cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--card-bg);
	}

	/* Song Info */
	.now-playing__info {
		text-align: center;
		margin-top: 1rem;
		margin-bottom: 1.25rem;
		width: 100%;
	}

	.now-playing__title {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--content-meta);
		margin: 0 0 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.now-playing__artist {
		font-size: 0.875rem;
		color: var(--content-meta);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Progress Bar */
	.now-playing__progress {
		width: 100%;
		margin-bottom: 0.25rem;
	}

	.now-playing__slider {
		width: 100%;
		-webkit-appearance: none;
		appearance: none;
		height: 4px;
		border-radius: 2px;
		background: linear-gradient(
			to right,
			var(--primary, #ff2d55) 0%,
			var(--primary, #ff2d55) var(--progress, 0%),
			var(--line-divider) var(--progress, 0%),
			var(--line-divider) 100%
		);
		outline: none;
		cursor: pointer;
		transition: height 0.15s ease;
	}

	.now-playing__slider:hover {
		height: 6px;
	}

	.now-playing__slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--primary, #ff2d55);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.now-playing__slider:hover::-webkit-slider-thumb {
		opacity: 1;
	}

	.now-playing__slider::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--primary, #ff2d55);
		border: none;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.now-playing__slider:hover::-moz-range-thumb {
		opacity: 1;
	}

	/* Time Row */
	.now-playing__time-row {
		display: flex;
		justify-content: space-between;
		width: 100%;
		margin-bottom: 1rem;
	}

	.now-playing__time {
		font-size: 0.75rem;
		color: var(--content-meta);
		min-width: 2.5rem;
		font-variant-numeric: tabular-nums;
	}

	/* Controls */
	.now-playing__controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
	}

	.now-playing__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		cursor: pointer;
		color: var(--content-meta);
		border-radius: 50%;
		transition:
			transform 0.2s ease,
			background-color 0.2s ease,
			color 0.2s ease;
	}

	.now-playing__btn:hover {
		transform: scale(1.05);
		background-color: var(--btn-plain-bg-hover);
	}

	.now-playing__btn:active {
		transform: scale(0.95);
	}

	.now-playing__btn--small {
		width: 40px;
		height: 40px;
	}

	.now-playing__btn--play {
		width: 48px;
		height: 48px;
		background-color: var(--card-bg);
		color: var(--content-meta);
	}

	.now-playing__btn--play:hover {
		background-color: var(--btn-plain-bg-hover);
		transform: scale(1.05);
	}

	.now-playing__btn.active {
		color: var(--primary, #ff2d55);
	}

	.now-playing__btn--favorite {
		color: var(--primary, #ff2d55);
	}

	/* ── Right column: Lyrics ── */
	.now-playing__lyrics {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		scroll-behavior: smooth;
		padding: 0.5rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 300px;
		max-height: 520px;
		background: transparent;
	}

	.now-playing__lyrics::-webkit-scrollbar {
		width: 4px;
	}

	.now-playing__lyrics::-webkit-scrollbar-track {
		background: transparent;
	}

	.now-playing__lyrics::-webkit-scrollbar-thumb {
		background: var(--line-divider);
		border-radius: 2px;
	}

	.lyric-line {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.5rem 0.75rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 1rem;
		color: var(--content-meta);
		border-radius: 6px;
		transition:
			color 0.3s ease,
			font-size 0.3s ease,
			background-color 0.2s ease;
		line-height: 1.6;
	}

	.lyric-line:hover {
		background-color: var(--btn-plain-bg-hover);
	}

	.lyric-line--active {
		color: #fff;
		font-weight: 700;
		font-size: 1.25rem;
	}

	.now-playing__lyrics-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--content-meta);
	}

	.now-playing__lyrics-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--content-meta);
		font-size: 0.875rem;
		margin: 0;
	}

	@keyframes spin-icon {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	:global(.animate-spin-icon) {
		animation: spin-icon 1s linear infinite;
	}

	/* ── Responsive ─ */
	@media (max-width: 700px) {
		.now-playing {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.now-playing__cover {
			width: 220px;
			height: 220px;
		}

		.now-playing__lyrics {
			max-height: 250px;
		}
	}

	@media (max-width: 480px) {
		.now-playing__cover {
			width: 180px;
			height: 180px;
		}

		.now-playing__controls {
			gap: 0.25rem;
		}

		.now-playing__btn--play {
			width: 44px;
			height: 44px;
		}

		.now-playing__btn--small {
			width: 36px;
			height: 36px;
		}
	}
</style>
