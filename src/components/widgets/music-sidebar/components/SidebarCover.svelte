<script lang="ts">
import Key from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { url } from "@/utils/url-utils";
import CoverImage from "../../music-player/atoms/CoverImage.svelte";
import type { Song } from "../../music-player/types";

interface Props {
	currentSong: Song;
	isPlaying: boolean;
	isLoading: boolean;
}

const { currentSong, isPlaying, isLoading }: Props = $props();
</script>

<a
	href={url("/music/")}
	class="block flex-shrink-0 rounded-full"
	aria-label={i18n(Key.musicPage)}
>
	<CoverImage
		cover={currentSong.cover}
		{isPlaying}
		{isLoading}
		size="expanded"
		interactive={false}
	/>
</a>
