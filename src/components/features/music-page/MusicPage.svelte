<!--
  MusicPage — 音乐播放器主页面组件
  布局：左侧播放器区域（封面 + 歌词）+ 右侧播放列表
  数据源：复用全局 musicPlayerStore 单例，通过 subscribe 响应状态变化
  子组件：
    - NowPlaying: 封面、歌曲信息、进度条、控制按钮、歌词展示
    - Playlist: 可搜索的播放列表
-->
<script lang="ts">
import { onDestroy, onMount } from "svelte";

import type { MusicPlayerState } from "@/stores/musicPlayerStore";
import { musicPlayerStore } from "@/stores/musicPlayerStore";

import NowPlaying from "./NowPlaying.svelte";
import Playlist from "./Playlist.svelte";

interface Props {
	config?: {
		meting_api?: string;
		server?: string;
		id?: string;
		type?: string;
	};
}

let { config }: Props = $props();

let playerState: MusicPlayerState = $state(musicPlayerStore.getState());
let unsubscribe: (() => void) | undefined;

let playlist = $derived(playerState.playlist);
let currentIndex = $derived(playerState.currentIndex);

onMount(() => {
	unsubscribe = musicPlayerStore.subscribe((nextState) => {
		playerState = nextState;
	});
	musicPlayerStore.initialize();
});

onDestroy(() => {
	if (unsubscribe) {
		unsubscribe();
	}
});

function handlePlaySong(index: number) {
	musicPlayerStore.playIndex(index);
}
</script>

<div class="music-page">
	<div class="music-page__layout">
		<div class="music-page__player">
			<NowPlaying {playerState} />
		</div>
		<div class="music-page__playlist">
			<Playlist
				songs={playlist}
				currentIndex={currentIndex}
				onSongClick={handlePlaySong}
			/>
		</div>
	</div>
</div>

<style>
	.music-page {
		width: 100%;
		min-height: calc(100vh - 200px);
	}

	.music-page__layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 24px;
		height: 100%;
	}

	.music-page__player {
		min-width: 0;
	}

	.music-page__playlist {
		height: 100%;
		min-height: 400px;
		max-height: calc(100vh - 220px);
	}

	@media (max-width: 1100px) {
		.music-page__layout {
			grid-template-columns: 1fr;
		}

		.music-page__playlist {
			max-height: 50vh;
		}
	}
</style>
