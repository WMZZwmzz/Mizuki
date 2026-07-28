import Key from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

import {
	DEFAULT_SONG,
	LOCAL_PLAYLIST,
	SKIP_ERROR_DELAY,
	STORAGE_KEY_VOLUME,
} from "@/components/widgets/music-player/constants";
import type {
	LyricLine,
	RepeatMode,
	Song,
} from "@/components/widgets/music-player/types";
import { musicPlayerConfig } from "@/config";
import { getAssetPath } from "@/utils/url-utils";

export interface MusicPlayerState {
	currentSong: Song;
	playlist: Song[];
	currentIndex: number;
	isPlaying: boolean;
	isLoading: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isShuffled: boolean;
	isRepeating: RepeatMode;
	showPlaylist: boolean;
	errorMessage: string;
	showError: boolean;
	isExpanded: boolean;
	isHidden: boolean;
	autoplayFailed: boolean;
	willAutoPlay: boolean;
	lyrics: LyricLine[];
	currentLyricIndex: number;
	lyricsLoading: boolean;
}

class MusicPlayerStore {
	private audio: HTMLAudioElement | null = null;
	private state: MusicPlayerState;
	private isInitialized = false;
	private lyricRequestId = 0;
	private unregisterInteraction: (() => void) | undefined;
	private listeners = new Set<(state: MusicPlayerState) => void>();

	constructor() {
		this.state = this.createInitialState();
	}

	private createInitialState(): MusicPlayerState {
		return {
			currentSong: { ...DEFAULT_SONG },
			playlist: [],
			currentIndex: 0,
			isPlaying: false,
			isLoading: false,
			currentTime: 0,
			duration: 0,
			volume: 0.7,
			isMuted: false,
			isShuffled: true,
			isRepeating: 0,
			showPlaylist: false,
			errorMessage: "",
			showError: false,
			isExpanded: false,
			isHidden: false,
			autoplayFailed: false,
			willAutoPlay: false,
			lyrics: [],
			currentLyricIndex: -1,
			lyricsLoading: false,
		};
	}

	private createSnapshot(): MusicPlayerState {
		return {
			...this.state,
			currentSong: { ...this.state.currentSong },
			playlist: this.state.playlist.map((song) => ({ ...song })),
		};
	}

	getState(): MusicPlayerState {
		return this.createSnapshot();
	}

	getAudio(): HTMLAudioElement | null {
		return this.audio;
	}

	subscribe(listener: (state: MusicPlayerState) => void): () => void {
		this.listeners.add(listener);
		listener(this.createSnapshot());
		return () => {
			this.listeners.delete(listener);
		};
	}

	async initialize(): Promise<void> {
		if (typeof window === "undefined" || this.isInitialized) {
			return;
		}
		this.isInitialized = true;

		if (!musicPlayerConfig.enable) {
			return;
		}

		this.audio = new Audio();
		this.setupAudioListeners();
		this.loadVolumeFromStorage();
		this.registerInteractionHandler();
		await this.loadPlaylist();
	}

	private setupAudioListeners(): void {
		if (!this.audio) {
			return;
		}

		this.audio.volume = this.state.volume;
		this.audio.muted = this.state.isMuted;

		this.audio.addEventListener("play", () => {
			this.state.isPlaying = true;
			this.broadcastState();
		});

		this.audio.addEventListener("pause", () => {
			this.state.isPlaying = false;
			this.broadcastState();
		});

		this.audio.addEventListener("timeupdate", () => {
			if (this.audio) {
				this.state.currentTime = this.audio.currentTime;
				this.updateCurrentLyricIndex(this.audio.currentTime);
				this.broadcastState();
			}
		});

		this.audio.addEventListener("ended", () => {
			this.handleAudioEnded();
		});

		this.audio.addEventListener("error", () => {
			this.handleAudioError();
		});

		this.audio.addEventListener("loadeddata", () => {
			this.handleAudioLoaded();
		});

		this.audio.addEventListener("loadstart", () => {
			this.state.isLoading = true;
			this.broadcastState();
		});
	}

	private handleAudioEnded(): void {
		if (this.state.isRepeating === 1) {
			if (this.audio) {
				this.audio.currentTime = 0;
				this.audio.play().catch(() => {});
			}
		} else {
			this.next(true);
		}
	}

	private handleAudioError(): void {
		this.state.isLoading = false;
		this.showError(i18n(Key.musicPlayerErrorSong));

		if (this.state.playlist.length > 1) {
			setTimeout(() => this.next(true), SKIP_ERROR_DELAY);
		} else if (this.state.playlist.length <= 1) {
			this.showError(i18n(Key.musicPlayerErrorEmpty));
		}
		this.broadcastState();
	}

	private handleAudioLoaded(): void {
		this.state.isLoading = false;
		if (this.audio?.duration && this.audio.duration > 1) {
			this.state.duration = Math.floor(this.audio.duration);
			this.state.currentSong = {
				...this.state.currentSong,
				duration: this.state.duration,
			};
		}

		if (this.state.willAutoPlay || this.state.isPlaying) {
			const playPromise = this.audio?.play();
			if (playPromise !== undefined) {
				playPromise.catch(() => {
					this.state.autoplayFailed = true;
					this.state.isPlaying = false;
				});
			}
		}
		this.broadcastState();
	}

	private loadVolumeFromStorage(): void {
		if (typeof localStorage !== "undefined") {
			const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
			if (savedVolume) {
				const volume = Number.parseFloat(savedVolume);
				if (!Number.isNaN(volume) && volume >= 0 && volume <= 1) {
					this.state.volume = volume;
					this.state.isMuted = volume === 0;
					if (this.audio) {
						this.audio.volume = volume;
						this.audio.muted = this.state.isMuted;
					}
				}
			}
		}
	}

	private registerInteractionHandler(): void {
		const handler = () => {
			if (this.state.autoplayFailed && this.audio) {
				const playPromise = this.audio.play();
				if (playPromise !== undefined) {
					playPromise
						.then(() => {
							this.state.autoplayFailed = false;
						})
						.catch(() => {});
				}
			}
		};
		document.addEventListener("click", handler, { once: true });
		document.addEventListener("keydown", handler, { once: true });
		this.unregisterInteraction = () => {
			document.removeEventListener("click", handler);
			document.removeEventListener("keydown", handler);
		};
	}

	private async loadPlaylist(): Promise<void> {
		const mode = musicPlayerConfig.mode ?? "meting";
		const meting_api =
			musicPlayerConfig.meting_api ??
			"https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r";
		const meting_id = musicPlayerConfig.id ?? "14164869977";
		const meting_server = musicPlayerConfig.server ?? "netease";
		const meting_type = musicPlayerConfig.type ?? "playlist";

		if (mode === "meting") {
			await this.fetchMetingPlaylist(
				meting_api,
				meting_server,
				meting_type,
				meting_id,
			);
		} else {
			this.loadLocalPlaylist();
		}
	}

	private async fetchMetingPlaylist(
		api: string,
		server: string,
		type: string,
		id: string,
	): Promise<void> {
		if (!api || !id) {
			return;
		}

		this.state.isLoading = true;
		this.broadcastState();

		const apiUrl = api
			.replace(":server", server)
			.replace(":type", type)
			.replace(":id", id)
			.replace(":auth", "")
			.replace(":r", Date.now().toString());

		try {
			const res = await fetch(apiUrl);
			if (!res.ok) {
				throw new Error("meting api error");
			}
			const list: Record<string, unknown>[] = await res.json();
			this.state.playlist = list.map((song) => this.convertMetingSong(song));
			this.state.isLoading = false;

			if (this.state.playlist.length > 0) {
				this.loadInitialRandomSong();
			}
		} catch (_e) {
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			this.state.isLoading = false;
		}
		this.broadcastState();
	}

	private extractIdFromUrl(url: string | undefined): number {
		if (!url) return 0;
		try {
			const u = new URL(url, "https://placeholder");
			const idParam = u.searchParams.get("id");
			if (idParam) {
				const parsed = Number.parseInt(idParam, 10);
				if (Number.isFinite(parsed) && parsed > 0) return parsed;
			}
		} catch {
			// ignore parse errors
		}
		return 0;
	}

	private convertMetingSong(song: Record<string, unknown>): Song {
		const name = typeof song.name === "string" ? song.name : undefined;
		const songTitle = typeof song.title === "string" ? song.title : undefined;
		const title = name ?? songTitle ?? i18n(Key.unknownSong);
		const artistField =
			typeof song.artist === "string" ? song.artist : undefined;
		const author = typeof song.author === "string" ? song.author : undefined;
		const artist = artistField ?? author ?? i18n(Key.unknownArtist);
		let dur = (song.duration as number | undefined) ?? 0;
		if (typeof dur === "string") {
			dur = Number.parseInt(dur, 10);
		}
		if (dur > 10000) {
			dur = Math.floor(dur / 1000);
		}
		if (!Number.isFinite(dur) || dur <= 0) {
			dur = 0;
		}

		// Meting API playlist response does NOT include a top-level `id` field.
		// The song ID is embedded in the `url` / `lrc` query params (e.g. ?id=460628799).
		const songId =
			typeof song.id === "number"
				? song.id
				: typeof song.id === "string"
					? Number.parseInt(song.id, 10)
					: this.extractIdFromUrl(song.url as string | undefined) ||
						this.extractIdFromUrl(song.lrc as string | undefined);

		const lid = songId > 0 ? String(songId) : undefined;

		return {
			id: songId,
			title,
			artist,
			cover: (song.pic as string | undefined) ?? "",
			url: (song.url as string | undefined) ?? "",
			duration: dur,
			...(lid ? { lid } : {}),
			...((song.lrc as string | undefined) ? { lrc: song.lrc as string } : {}),
		};
	}

	private loadLocalPlaylist(): void {
		this.state.playlist = [...LOCAL_PLAYLIST];
		if (this.state.playlist.length === 0) {
			this.showError("本地播放列表为空");
		} else {
			this.loadInitialRandomSong();
		}
	}

	private loadInitialRandomSong(): void {
		const initialIndex = Math.floor(Math.random() * this.state.playlist.length);
		this.state.currentIndex = initialIndex;
		this.loadSong(this.state.playlist[initialIndex], false);
	}

	private loadSong(song: Song, autoPlay = true): void {
		if (!song) {
			return;
		}
		if (song.url !== this.state.currentSong.url) {
			this.state.currentSong = { ...song };
			if (song.url) {
				this.state.isLoading = true;
			} else {
				this.state.isLoading = false;
			}
		}
		this.state.willAutoPlay = autoPlay;
		if (this.audio) {
			if (this.audio.src && song.url) {
				this.audio.src = "";
			}
			this.audio.src = getAssetPath(song.url);
			this.audio.load();
		}
		this.state.lyrics = [];
		this.state.currentLyricIndex = -1;
		this.broadcastState();
		this.fetchLyrics(song);
	}

	private showError(message: string): void {
		this.state.errorMessage = message;
		this.state.showError = true;
		setTimeout(() => {
			this.state.showError = false;
			this.broadcastState();
		}, 3000);
		this.broadcastState();
	}

	hideError(): void {
		this.state.showError = false;
		this.broadcastState();
	}

	toggle(): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		if (this.state.isPlaying) {
			this.audio.pause();
		} else {
			this.audio.play().catch(() => {});
		}
	}

	play(): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		this.audio.play().catch(() => {});
	}

	pause(): void {
		if (!this.audio) {
			return;
		}
		this.audio.pause();
	}

	next(autoPlay = true): void {
		if (this.state.playlist.length <= 1) {
			return;
		}

		let newIndex: number;
		if (this.state.isShuffled) {
			do {
				newIndex = Math.floor(Math.random() * this.state.playlist.length);
			} while (
				newIndex === this.state.currentIndex &&
				this.state.playlist.length > 1
			);
		} else {
			newIndex =
				this.state.currentIndex < this.state.playlist.length - 1
					? this.state.currentIndex + 1
					: 0;
		}

		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], autoPlay);
	}

	prev(): void {
		if (this.state.playlist.length <= 1) {
			return;
		}
		const newIndex =
			this.state.currentIndex > 0
				? this.state.currentIndex - 1
				: this.state.playlist.length - 1;
		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], true);
	}

	playIndex(index: number): void {
		if (index < 0 || index >= this.state.playlist.length) {
			return;
		}
		this.state.currentIndex = index;
		this.loadSong(this.state.playlist[index], true);
	}

	seek(time: number): void {
		if (!this.audio) {
			return;
		}
		if (time >= 0 && time <= this.state.duration) {
			this.audio.currentTime = time;
			this.state.currentTime = time;
			this.broadcastState();
		}
	}

	setVolume(volume: number): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		this.state.volume = clampedVolume;
		this.state.isMuted = clampedVolume === 0;
		if (this.audio) {
			this.audio.volume = clampedVolume;
			this.audio.muted = this.state.isMuted;
		}
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(STORAGE_KEY_VOLUME, String(clampedVolume));
		}
		this.broadcastState();
	}

	toggleMute(): void {
		this.state.isMuted = !this.state.isMuted;
		if (this.audio) {
			this.audio.muted = this.state.isMuted;
		}
		this.broadcastState();
	}

	toggleShuffle(): void {
		this.state.isShuffled = !this.state.isShuffled;
		if (this.state.isShuffled) {
			this.state.isRepeating = 0;
		}
		this.broadcastState();
	}

	toggleRepeat(): void {
		this.state.isRepeating = ((this.state.isRepeating + 1) % 3) as RepeatMode;
		if (this.state.isRepeating !== 0) {
			this.state.isShuffled = false;
		}
		this.broadcastState();
	}

	toggleMode(): void {
		if (this.state.isShuffled) {
			this.toggleShuffle();
			return;
		}
		if (this.state.isRepeating === 2) {
			this.toggleRepeat();
			this.toggleShuffle();
			return;
		}
		this.toggleRepeat();
	}

	togglePlaylist(): void {
		this.state.showPlaylist = !this.state.showPlaylist;
		this.broadcastState();
	}

	toggleExpanded(): void {
		this.state.isExpanded = !this.state.isExpanded;
		// 保持与原先 usePlayerState.toggleExpandedUI 一致的联动行为：
		// 展开时强制取消隐藏，并关闭播放列表，避免状态组合异常
		if (this.state.isExpanded) {
			this.state.showPlaylist = false;
			this.state.isHidden = false;
		}
		this.broadcastState();
	}

	toggleHidden(): void {
		this.state.isHidden = !this.state.isHidden;
		// 保持与原先 usePlayerState.toggleHiddenUI 一致的联动行为：
		// 隐藏时收起播放器并关闭播放列表，防止展开 UI 悬挂在小球旁边
		if (this.state.isHidden) {
			this.state.isExpanded = false;
			this.state.showPlaylist = false;
		}
		this.broadcastState();
	}

	canSkip(): boolean {
		return this.state.playlist.length > 1;
	}

	setProgress(percent: number): void {
		if (!this.audio) {
			return;
		}
		const clampedPercent = Math.max(0, Math.min(1, percent));
		const newTime = clampedPercent * this.state.duration;
		this.audio.currentTime = newTime;
		this.state.currentTime = newTime;
		this.broadcastState();
	}

	parseLRC(lrcString: string): LyricLine[] {
		const lines = lrcString.split("\n");
		const result: LyricLine[] = [];
		const timeRegex = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

		for (const line of lines) {
			const times: number[] = [];
			let lastEnd = 0;
			const matches = [...line.matchAll(timeRegex)];
			for (const match of matches) {
				const minutes = Number.parseInt(match[1], 10);
				const seconds = Number.parseInt(match[2], 10);
				const ms = match[3] ? Number.parseInt(match[3].padEnd(3, "0"), 10) : 0;
				times.push(minutes * 60 + seconds + ms / 1000);
				lastEnd = (match.index ?? 0) + match[0].length;
			}
			const text = line.slice(lastEnd).trim();
			if (!text) {
				continue;
			}
			for (const time of times) {
				result.push({ time, text });
			}
		}

		result.sort((a, b) => a.time - b.time);
		return result;
	}

	private async fetchLyrics(song: Song): Promise<void> {
		if (!musicPlayerConfig.meting_api) {
			return;
		}

		const thisRequestId = ++this.lyricRequestId;
		this.state.lyricsLoading = true;
		this.broadcastState();

		try {
			let lrcText = "";

			// 优先使用 song.lrc URL（Meting API 播放列表响应中的歌词 URL）
			if (song.lrc) {
				try {
					const lrcRes = await fetch(song.lrc);
					if (lrcRes.ok) {
						const ct = lrcRes.headers.get("content-type") ?? "";
						if (ct.includes("application/json")) {
							const json = await lrcRes.json();
							lrcText = typeof json.lyric === "string" ? json.lyric : "";
						} else {
							lrcText = await lrcRes.text();
						}
					}
				} catch {
					// ignore, fall through to Meting API
				}
			}

			// 回退到 Meting API type=lyric 端点
			if (!lrcText) {
				const lyricId = song.lid ?? String(song.id);
				if (lyricId) {
					const meting_server = musicPlayerConfig.server ?? "netease";
					const apiUrl = musicPlayerConfig.meting_api
						.replace(":server", meting_server)
						.replace(":type", "lyric")
						.replace(":id", lyricId)
						.replace(":auth", "")
						.replace(":r", Date.now().toString());

					try {
						const res = await fetch(apiUrl);
						if (res.ok) {
							const ct = res.headers.get("content-type") ?? "";
							if (ct.includes("application/json")) {
								const json = await res.json();
								lrcText = typeof json.lyric === "string" ? json.lyric : "";
							} else {
								const rawText = await res.text();
								try {
									const json = JSON.parse(rawText);
									lrcText = typeof json.lyric === "string" ? json.lyric : "";
								} catch {
									lrcText = rawText;
								}
							}
						}
					} catch {
						// ignore
					}
				}
			}

			if (!lrcText) {
				throw new Error("no lyric content");
			}

			const parsed = this.parseLRC(lrcText);
			if (this.lyricRequestId !== thisRequestId) return;
			this.state.lyrics = parsed;
			this.state.currentLyricIndex = -1;
		} catch (_e) {
			if (this.lyricRequestId !== thisRequestId) return;
			this.state.lyrics = [];
			this.state.currentLyricIndex = -1;
		} finally {
			if (this.lyricRequestId === thisRequestId) {
				this.state.lyricsLoading = false;
				this.broadcastState();
			}
		}
	}

	private updateCurrentLyricIndex(currentTime: number): void {
		const { lyrics } = this.state;
		if (lyrics.length === 0) {
			return;
		}

		let lo = 0;
		let hi = lyrics.length - 1;
		let idx = -1;
		while (lo <= hi) {
			const mid = (lo + hi) >>> 1;
			if (lyrics[mid].time <= currentTime) {
				idx = mid;
				lo = mid + 1;
			} else {
				hi = mid - 1;
			}
		}

		if (idx !== this.state.currentLyricIndex) {
			this.state.currentLyricIndex = idx;
		}
	}

	private broadcastState(): void {
		const snapshot = this.createSnapshot();

		for (const listener of this.listeners) {
			listener(snapshot);
		}

		if (typeof window === "undefined") {
			return;
		}
		window.dispatchEvent(
			new CustomEvent("music-sidebar:state", {
				detail: snapshot,
			}),
		);
	}

	destroy(): void {
		if (this.unregisterInteraction) {
			this.unregisterInteraction();
		}
		if (this.audio) {
			this.audio.pause();
			this.audio.src = "";
			this.audio = null;
		}
		this.isInitialized = false;
	}
}

export const musicPlayerStore = new MusicPlayerStore();
