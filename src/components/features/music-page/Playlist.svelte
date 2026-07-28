<!--
  Playlist — 播放列表组件
  功能：
    - 搜索框：实时按歌名 / 艺术家过滤歌曲
    - 歌曲列表：封面缩略图 + 歌名 + 艺术家 + 时长
    - 当前播放项高亮（粉色竖条指示器）
    - 点击歌曲切换到对应曲目
    - 固定高度容器，超出部分可滚动
  数据源：通过 Props 接收 songs 数组和 currentIndex
-->
<script lang="ts">
import Icon from "@iconify/svelte";

import type { Song } from "@/components/widgets/music-player/types";
import { getAssetPath } from "@/utils/url-utils";

interface Props {
	songs: Song[];
	currentIndex: number;
	onSongClick: (index: number) => void;
}

let { songs, currentIndex, onSongClick }: Props = $props();

let searchQuery = $state("");

let filteredSongs = $derived.by(() => {
	if (!searchQuery.trim()) {
		return songs.map((song, index) => ({ song, originalIndex: index }));
	}
	const query = searchQuery.toLowerCase().trim();
	return songs
		.map((song, index) => ({ song, originalIndex: index }))
		.filter(
			({ song }) =>
				song.title.toLowerCase().includes(query) ||
				song.artist.toLowerCase().includes(query),
		);
});

function handleSongClick(originalIndex: number) {
	onSongClick(originalIndex);
}

function formatDuration(seconds: number): string {
	if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function clearSearch() {
	searchQuery = "";
}
</script>

<div class="playlist">
	<!-- 搜索栏 -->
	<div class="playlist__search">
		<Icon
			icon="material-symbols:search-rounded"
			class="playlist__search-icon text-lg"
		/>
		<input
			type="text"
			class="playlist__search-input"
			placeholder="搜索歌曲..."
			bind:value={searchQuery}
		/>
		{#if searchQuery}
			<button class="playlist__search-clear" onclick={clearSearch}>
				<Icon
					icon="material-symbols:close-rounded"
					class="text-base"
				/>
			</button>
		{/if}
	</div>

	<!-- 列表标题 -->
	<div class="playlist__header">
		<h3 class="playlist__title">播放列表</h3>
		<span class="playlist__count">{filteredSongs.length} 首歌曲</span>
	</div>

	<!-- 歌曲列表（可滚动） -->
	<div class="playlist__list">
		{#each filteredSongs as { song, originalIndex } (originalIndex)}
			<button
				class="playlist__item"
				class:playlist__item--active={originalIndex === currentIndex}
				onclick={() => handleSongClick(originalIndex)}
			>
				<div class="playlist__item-index">
					{#if originalIndex === currentIndex}
						<span class="playlist__item-eq-indicator"></span>
					{:else}
						<span class="playlist__item-number"
							>{originalIndex + 1}</span
						>
					{/if}
				</div>

				<div class="playlist__item-cover">
					<img
						src={getAssetPath(song.cover)}
						alt={song.title}
						loading="lazy"
						decoding="async"
					/>
				</div>

				<div class="playlist__item-info">
					<span class="playlist__item-title">{song.title}</span>
					<span class="playlist__item-artist">{song.artist}</span>
				</div>

				{#if song.duration > 0}
					<span class="playlist__item-duration"
						>{formatDuration(song.duration)}</span
					>
				{/if}
			</button>
		{:else}
			<div class="playlist__empty">
				<Icon
					icon="material-symbols:search-off-rounded"
					class="text-3xl"
				/>
				<p>没有找到匹配的歌曲</p>
			</div>
		{/each}
	</div>
</div>

<style>
	.playlist {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		min-height: 400px;
		background-color: var(--card-bg, #fff);
		border-radius: var(--radius-large, 12px);
		overflow: hidden;
	}

	/* Search Bar */
	.playlist__search {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--line-divider);
	}

	:global(.playlist__search-icon) {
		color: var(--content-meta);
		flex-shrink: 0;
	}

	.playlist__search-input {
		flex: 1;
		border: none;
		background: transparent;
		outline: none;
		font-size: 0.875rem;
		color: var(--content-meta);
	}

	.playlist__search-input::placeholder {
		color: var(--content-meta);
	}

	.playlist__search-clear {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		cursor: pointer;
		color: var(--content-meta);
		padding: 2px;
		border-radius: 50%;
		transition: color 0.2s ease;
	}

	.playlist__search-clear:hover {
		color: var(--content-meta);
	}

	/* Header */
	.playlist__header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding: 0.75rem 1rem 0.5rem;
	}

	.playlist__title {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--content-meta);
		margin: 0;
	}

	.playlist__count {
		font-size: 0.8125rem;
		color: var(--content-meta);
	}

	/* Song List */
	.playlist__list {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		overflow-x: hidden;
		scroll-behavior: smooth;
		padding: 0.25rem 0;
	}

	.playlist__list::-webkit-scrollbar {
		width: 4px;
	}

	.playlist__list::-webkit-scrollbar-track {
		background: transparent;
	}

	.playlist__list::-webkit-scrollbar-thumb {
		background: var(--line-divider);
		border-radius: 2px;
	}

	/* Song Item */
	.playlist__item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		border: none;
		background: transparent;
		cursor: pointer;
		width: 100%;
		text-align: left;
		border-radius: 0;
		transition: background-color 0.2s ease;
		min-height: 56px;
	}

	.playlist__item:hover {
		background-color: var(--btn-plain-bg-hover);
	}

	.playlist__item--active {
		background-color: var(--btn-plain-bg-hover);
	}

	.playlist__item--active:hover {
		background-color: var(--btn-plain-bg-hover);
	}

	/* Index / EQ indicator */
	.playlist__item-index {
		width: 1.5rem;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.playlist__item-number {
		font-size: 0.8125rem;
		color: var(--content-meta);
		font-variant-numeric: tabular-nums;
	}

	.playlist__item--active .playlist__item-number {
		color: var(--primary, #ff2d55);
	}

	.playlist__item-eq-indicator {
		display: block;
		width: 3px;
		height: 20px;
		background-color: var(--primary, #ff2d55);
		border-radius: 2px;
	}

	/* Cover Thumbnail */
	.playlist__item-cover {
		width: 48px;
		height: 48px;
		border-radius: 4px;
		overflow: hidden;
		flex-shrink: 0;
		background-color: var(--card-bg);
	}

	.playlist__item-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Song Info */
	.playlist__item-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.playlist__item-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--content-meta);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.playlist__item--active .playlist__item-title {
		color: var(--primary, #ff2d55);
	}

	.playlist__item-artist {
		font-size: 0.75rem;
		color: var(--content-meta);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Duration */
	.playlist__item-duration {
		font-size: 0.75rem;
		color: var(--content-meta);
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
	}

	/* Empty State */
	.playlist__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem 1rem;
		color: var(--content-meta);
	}

	.playlist__empty p {
		margin: 0;
		font-size: 0.875rem;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.playlist {
			min-height: 300px;
			max-height: 50vh;
		}
	}

	@media (max-width: 480px) {
		.playlist__item {
			padding: 0.5rem 0.75rem;
			gap: 0.5rem;
		}

		.playlist__item-cover {
			width: 40px;
			height: 40px;
		}
	}
</style>
