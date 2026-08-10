/**
 * 音乐波浪特效模块
 * 在页面正下方绘制随音律节奏跳动的多层波浪；播放时显示，停止时隐藏。
 *
 * 频谱接入策略（安全）：
 * 项目音乐源来自 Meting API（网易云等跨域音频），audio 元素未设 crossOrigin。
 * 若用 createMediaElementSource 接管 audio 路由，跨域 tainted 媒体会使整条音频图
 * （含 destination）静音——音乐会听不到。因此本模块改用 audio.captureStream()（Chrome/
 * Edge）/ mozCaptureStream()（Firefox）创建一条**并行** MediaStream，再经
 * createMediaStreamSource 接入 AnalyserNode。此路径不接管原 audio 输出；跨域媒体
 * 可能在 captureStream() 时抛错或让分析链路持续读到全零，两种情况都降级"伪节奏"。
 * Safari 不支持 captureStream，直接使用伪节奏。伪节奏含节拍脉冲，视觉上仍有明显跳动。
 */

import { musicPlayerStore } from "@/stores/musicPlayerStore";
import {
	EFFECT_PERFORMANCE_MODE_EVENT,
	type EffectPerformanceMode,
	getEffectFrameInterval,
	getEffectPerformanceMode,
	normalizeEffectPerformanceMode,
} from "@/utils/effect-performance";

interface WaveLayer {
	/** 基础振幅（px，桌面基准），随频段能量在约 0.15~2.0 倍区间跳动 */
	baseAmplitude: number;
	/** 波浪空间频率：每屏宽度的周期数 */
	frequency: number;
	/** 相位推进速度（rad/s） */
	speed: number;
	phase: number;
	/** 该层透明度（0~1） */
	opacity: number;
	/** 波浪基线相对高度（0=顶, 1=底） */
	baseline: number;
	/** 该层绑定的频段索引（0=低频, 3=高频） */
	bandIndex: number;
}

type AudioElementWithCapture = HTMLMediaElement & {
	captureStream?: () => MediaStream;
	mozCaptureStream?: () => MediaStream;
};

const DESKTOP_HEIGHT = 120;
const MOBILE_HEIGHT = 90;
const Z_INDEX = 35;
const BAND_COUNT = 4;
const SPECTRUM_BAND_EDGES = [0, 0.04, 0.12, 0.3, 1];
/** 连续多少帧频谱全零后判定为 tainted 降级伪节奏 */
const SILENCE_THRESHOLD = 30;
class MusicWaveManager {
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private rafId = 0;
	private frameTimerId = 0;
	private width = 0;
	private height = DESKTOP_HEIGHT;
	private layers: WaveLayer[] = [];
	private unsubscribe: (() => void) | null = null;
	private stateEventHandler: ((event: Event) => void) | null = null;
	private lastIsPlaying = false;
	private visibility = 0;
	private targetVisibility = 0;
	private lastTime = 0;
	private reducedMotion = false;
	private primaryRGB = "128, 128, 128";
	private initialized = false;
	private resizeObserver: MutationObserver | null = null;
	private visibilityHandler: (() => void) | null = null;
	private performanceHandler: ((event: Event) => void) | null = null;
	private performanceMode: EffectPerformanceMode = getEffectPerformanceMode();

	// 频谱分析相关
	private audioCtx: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private freqData: Uint8Array<ArrayBuffer> | null = null;
	private analysedAudio: HTMLMediaElement | null = null;
	private useRealSpectrum = false;
	private silenceFrames = 0;
	private bands: number[] = [0, 0, 0, 0];

	init(): void {
		if (typeof window === "undefined" || this.initialized) {
			return;
		}
		this.initialized = true;
		this.reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		this.createCanvas();
		this.initLayers();
		this.refreshColor();
		this.bindResize();
		this.bindVisibility();
		this.bindPerformanceMode();
		this.subscribeMusic();
	}

	private createCanvas(): void {
		const canvas = document.createElement("canvas");
		canvas.setAttribute("aria-hidden", "true");
		canvas.setAttribute("data-mizuki-music-wave", "");
		canvas.style.cssText = [
			"position: fixed",
			"left: 0",
			"bottom: 0",
			"width: 100%",
			`height: ${DESKTOP_HEIGHT}px`,
			"pointer-events: none",
			`z-index: ${Z_INDEX}`,
			"display: block",
			"opacity: 0",
			"transition: opacity 0.6s ease",
		].join(";");
		document.body.appendChild(canvas);
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.resize();
	}

	private initLayers(): void {
		// 4 层：从后到前，振幅递减、空间频率递增、相位推进递增、透明度递增；
		// 低频层（鼓）振幅大跳得高，高频层（镲）振幅小抖动快
		this.layers = [
			{
				baseAmplitude: 30,
				frequency: 1.5,
				speed: 0.8,
				phase: 0,
				opacity: 0.12,
				baseline: 0.48,
				bandIndex: 0,
			},
			{
				baseAmplitude: 23,
				frequency: 2.3,
				speed: 1.1,
				phase: 1.2,
				opacity: 0.16,
				baseline: 0.56,
				bandIndex: 1,
			},
			{
				baseAmplitude: 17,
				frequency: 3.3,
				speed: 1.5,
				phase: 2.4,
				opacity: 0.2,
				baseline: 0.64,
				bandIndex: 2,
			},
			{
				baseAmplitude: 12,
				frequency: 4.8,
				speed: 2.0,
				phase: 3.6,
				opacity: 0.26,
				baseline: 0.72,
				bandIndex: 3,
			},
		];
	}

	/**
	 * 读取 var(--primary) 的计算值并显式转换为 sRGB。
	 * Chromium 会在 canvas fillStyle 中保留 oklch() 原值，不会自动转成
	 * rgb()。通过 color-mix(in srgb, ...) 强制使用 sRGB 色彩空间，避免解析
	 * 失败后波浪回退为不明显的灰色。
	 */
	private refreshColor(): void {
		if (typeof document === "undefined") {
			return;
		}
		const probe = document.createElement("div");
		probe.style.cssText =
			"background-color: var(--primary); position: absolute; visibility: hidden; left: -9999px;";
		probe.style.backgroundColor =
			"color-mix(in srgb, var(--primary) 100%, transparent)";
		document.body.appendChild(probe);
		const computed = getComputedStyle(probe).backgroundColor;
		probe.remove();
		const pctx = document.createElement("canvas").getContext("2d");
		if (!pctx) {
			return;
		}
		pctx.fillStyle = "#808080";
		pctx.fillStyle = computed;
		const rgb = this.parseColorString(pctx.fillStyle);
		if (rgb) {
			this.primaryRGB = rgb;
		}
	}

	/** 解析 sRGB 颜色字符串为 "r, g, b" */
	private parseColorString(s: string): string | null {
		const rgbM = s.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
		if (rgbM) {
			return `${rgbM[1]}, ${rgbM[2]}, ${rgbM[3]}`;
		}
		const srgbM = s.match(
			/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+)?\)$/i,
		);
		if (srgbM) {
			const channels = srgbM
				.slice(1, 4)
				.map((channel) =>
					Math.round(
						Math.max(0, Math.min(1, Number.parseFloat(channel))) * 255,
					),
				);
			return channels.join(", ");
		}
		const hexM = s.match(/^#([0-9a-f]{6})$/i);
		if (hexM) {
			const r = Number.parseInt(hexM[1].slice(0, 2), 16);
			const g = Number.parseInt(hexM[1].slice(2, 4), 16);
			const b = Number.parseInt(hexM[1].slice(4, 6), 16);
			return `${r}, ${g}, ${b}`;
		}
		return null;
	}

	private resize(): void {
		if (!this.canvas) {
			return;
		}
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = window.innerWidth;
		this.width = w;
		this.height = w < 640 ? MOBILE_HEIGHT : DESKTOP_HEIGHT;
		this.canvas.width = Math.floor(w * dpr);
		this.canvas.height = Math.floor(this.height * dpr);
		this.canvas.style.width = `${w}px`;
		this.canvas.style.height = `${this.height}px`;
		if (this.ctx) {
			this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
	}

	private bindResize(): void {
		let resizeTimer = 0;
		window.addEventListener("resize", () => {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				this.resize();
				this.refreshColor();
			}, 200);
		});
		let colorTimer = 0;
		this.resizeObserver = new MutationObserver(() => {
			window.clearTimeout(colorTimer);
			colorTimer = window.setTimeout(() => this.refreshColor(), 120);
		});
		this.resizeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme", "style", "class"],
		});
	}

	private subscribeMusic(): void {
		const updatePlaying = (playing: boolean) => {
			if (playing !== this.lastIsPlaying) {
				this.lastIsPlaying = playing;
				this.targetVisibility = playing ? 1 : 0;
				if (playing && !this.rafId && !this.frameTimerId) {
					this.trySetupAnalyser();
					this.lastTime = 0;
					this.startLoop();
				}
			}
		};

		this.unsubscribe = musicPlayerStore.subscribe((state) => {
			updatePlaying(state.isPlaying);
		});
		this.stateEventHandler = (event) => {
			const state = (event as CustomEvent<{ isPlaying?: boolean }>).detail;
			if (typeof state?.isPlaying === "boolean") {
				updatePlaying(state.isPlaying);
			}
		};
		window.addEventListener("music-sidebar:state", this.stateEventHandler);
	}

	private bindVisibility(): void {
		this.visibilityHandler = () => {
			if (document.hidden) {
				this.stopLoop();
				return;
			}

			if (
				(this.lastIsPlaying || this.visibility > 0.001) &&
				!this.rafId &&
				!this.frameTimerId
			) {
				this.startLoop();
			}
		};
		document.addEventListener("visibilitychange", this.visibilityHandler);
	}

	private bindPerformanceMode(): void {
		this.performanceHandler = (event) => {
			const nextMode = normalizeEffectPerformanceMode(
				(event as CustomEvent<{ mode?: unknown }>).detail?.mode,
			);
			if (nextMode === this.performanceMode) return;
			this.performanceMode = nextMode;
			this.stopLoop();
			if (this.lastIsPlaying || this.visibility > 0.001) {
				this.startLoop();
			}
		};
		window.addEventListener(
			EFFECT_PERFORMANCE_MODE_EVENT,
			this.performanceHandler,
		);
	}

	/** 尝试建立并行频谱分析链路（captureStream + MediaStreamSource + AnalyserNode） */
	private trySetupAnalyser(): void {
		const audio = musicPlayerStore.getAudio();
		if (!audio || this.analysedAudio === audio) {
			return;
		}
		// audio 元素变了，清理旧链路重建
		this.disposeAnalyser();
		this.analysedAudio = audio;

		const el = audio as AudioElementWithCapture;
		try {
			const stream = el.captureStream?.() ?? el.mozCaptureStream?.();
			if (!stream) {
				return; // 不支持（Safari），保持伪节奏
			}
			const Ctx =
				window.AudioContext ||
				(
					window as Window & {
						webkitAudioContext?: typeof AudioContext;
					}
				).webkitAudioContext;
			if (!Ctx) {
				return;
			}
			this.audioCtx = new Ctx();
			if (this.audioCtx.state === "suspended") {
				this.audioCtx.resume().catch(() => {});
			}
			const source = this.audioCtx.createMediaStreamSource(stream);
			this.analyser = this.audioCtx.createAnalyser();
			this.analyser.fftSize = 512;
			this.analyser.smoothingTimeConstant = 0.75;
			source.connect(this.analyser);
			// 不连 destination：原 audio 自行播放，分析链路仅读取数据
			this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
			this.useRealSpectrum = true;
			this.silenceFrames = 0;
		} catch {
			this.disposeAnalyser();
		}
	}

	private disposeAnalyser(): void {
		this.analyser = null;
		this.freqData = null;
		this.useRealSpectrum = false;
		this.silenceFrames = 0;
		if (this.audioCtx) {
			this.audioCtx.close().catch(() => {});
			this.audioCtx = null;
		}
	}

	/** 计算各频段能量（0~1），优先真实频谱，tainted/不支持时降级伪节奏 */
	private updateBands(sec: number): void {
		if (this.useRealSpectrum && this.analyser && this.freqData) {
			this.analyser.getByteFrequencyData(this.freqData);
			const n = this.freqData.length;
			let sum = 0;
			for (let i = 0; i < n; i++) {
				sum += this.freqData[i];
			}
			if (sum === 0) {
				this.silenceFrames++;
				if (this.silenceFrames > SILENCE_THRESHOLD) {
					this.useRealSpectrum = false;
				}
			} else {
				this.silenceFrames = 0;
			}
			for (let b = 0; b < BAND_COUNT; b++) {
				const start = Math.max(
					1,
					Math.floor((SPECTRUM_BAND_EDGES[b] ?? 0) * n),
				);
				const end = Math.max(
					start + 1,
					Math.floor((SPECTRUM_BAND_EDGES[b + 1] ?? 1) * n),
				);
				let s = 0;
				for (let i = start; i < end; i++) {
					s += this.freqData[i];
				}
				const average = end > start ? s / (end - start) / 255 : 0;
				this.bands[b] = Math.min(1, average ** 0.72 * 1.35);
			}
			return;
		}
		this.computeFakeBands(sec);
	}

	/** 伪节奏：节拍脉冲（低频鼓点）+ 各频段不同频率的正弦起伏 */
	private computeFakeBands(sec: number): void {
		const beatInterval = 0.48; // 约 125 BPM
		const beatPhase = (sec % beatInterval) / beatInterval;
		const offBeatPhase =
			((sec + beatInterval * 0.5) % beatInterval) / beatInterval;
		const beatPulse = Math.exp(-beatPhase * 11);
		const offBeatPulse = Math.exp(-offBeatPhase * 13);
		const slowSwell = Math.sin(sec * 0.7) * 0.5 + 0.5;
		const midMotion = Math.sin(sec * 2.4 + 1) * 0.5 + 0.5;
		const highMotion = Math.sin(sec * 4.8 + 2.4) * 0.5 + 0.5;

		this.bands[0] = Math.min(1, 0.08 + beatPulse * 0.92);
		this.bands[1] = Math.min(
			1,
			0.1 + beatPulse * 0.5 + offBeatPulse * 0.22 + slowSwell * 0.18,
		);
		this.bands[2] = Math.min(1, 0.08 + offBeatPulse * 0.46 + midMotion * 0.32);
		this.bands[3] = Math.min(
			1,
			0.06 + beatPulse * 0.2 + offBeatPulse * 0.36 + highMotion * 0.3,
		);
	}

	private startLoop(): void {
		if (this.rafId || this.frameTimerId || document.hidden) {
			return;
		}
		const loop = (t: number) => {
			this.rafId = 0;
			if (document.hidden) {
				this.lastTime = 0;
				return;
			}
			const cont = this.step(t);
			if (cont) {
				this.scheduleNextFrame(loop);
			}
		};
		this.rafId = requestAnimationFrame(loop);
	}

	private scheduleNextFrame(callback: FrameRequestCallback): void {
		const frameInterval = getEffectFrameInterval(this.performanceMode);
		if (frameInterval === null) {
			this.rafId = requestAnimationFrame(callback);
			return;
		}
		const elapsed = this.lastTime
			? performance.now() - this.lastTime
			: frameInterval;
		const delay = Math.max(0, frameInterval - elapsed);
		this.frameTimerId = window.setTimeout(() => {
			this.frameTimerId = 0;
			if (!document.hidden) {
				this.rafId = requestAnimationFrame(callback);
			}
		}, delay);
	}

	private stopLoop(): void {
		window.cancelAnimationFrame(this.rafId);
		window.clearTimeout(this.frameTimerId);
		this.rafId = 0;
		this.frameTimerId = 0;
		this.lastTime = 0;
	}

	private step(t: number): boolean {
		const dt = this.lastTime
			? Math.min((t - this.lastTime) / 1000, 0.05)
			: 0.016;
		this.lastTime = t;

		const target = this.targetVisibility;
		const v = this.visibility;
		const next = v + (target - v) * Math.min(1, dt * 5);
		this.visibility = Math.abs(next - target) < 0.005 ? target : next;

		if (this.visibility <= 0.001 && target === 0) {
			this.visibility = 0;
			if (this.canvas) {
				this.canvas.style.opacity = "0";
			}
			return false;
		}

		if (this.canvas) {
			this.canvas.style.opacity = String(this.visibility);
		}
		this.draw(t / 1000, dt);
		return true;
	}

	private draw(sec: number, dt: number): void {
		const ctx = this.ctx;
		if (!ctx) {
			return;
		}
		this.updateBands(sec);
		ctx.clearRect(0, 0, this.width, this.height);

		const motionScale = this.reducedMotion ? 0.3 : 1;
		const ampScale = this.height / DESKTOP_HEIGHT;

		for (const layer of this.layers) {
			const energy = this.bands[layer.bandIndex] ?? 0;
			const reactiveEnergy = Math.min(1, energy ** 0.72 * 1.1);
			const baseLine = this.height * layer.baseline;
			const lift =
				layer.baseAmplitude * ampScale * reactiveEnergy * 0.32 * motionScale;
			const baseline = baseLine - lift;
			const rawAmp =
				layer.baseAmplitude *
				ampScale *
				(0.1 + reactiveEnergy * 2.05) *
				motionScale;
			const amp = Math.min(rawAmp, Math.max(4, baseline - 2));

			layer.phase += layer.speed * dt * motionScale;

			ctx.beginPath();
			ctx.moveTo(0, this.height);
			for (let x = 0; x <= this.width; x += 4) {
				const wave =
					Math.sin(
						(x / this.width) * Math.PI * 2 * layer.frequency + layer.phase,
					) * amp;
				ctx.lineTo(x, baseline + wave);
			}
			ctx.lineTo(this.width, this.height);
			ctx.closePath();

			const alphaBoost = 0.85 + reactiveEnergy * 0.55;
			const grad = ctx.createLinearGradient(0, baseline - amp, 0, this.height);
			grad.addColorStop(
				0,
				`rgba(${this.primaryRGB}, ${layer.opacity * 0.9 * alphaBoost})`,
			);
			grad.addColorStop(
				1,
				`rgba(${this.primaryRGB}, ${layer.opacity * 0.15 * alphaBoost})`,
			);
			ctx.fillStyle = grad;
			ctx.fill();
		}
	}

	destroy(): void {
		if (this.unsubscribe) {
			this.unsubscribe();
			this.unsubscribe = null;
		}
		if (this.stateEventHandler) {
			window.removeEventListener("music-sidebar:state", this.stateEventHandler);
			this.stateEventHandler = null;
		}
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
		if (this.visibilityHandler) {
			document.removeEventListener("visibilitychange", this.visibilityHandler);
			this.visibilityHandler = null;
		}
		if (this.performanceHandler) {
			window.removeEventListener(
				EFFECT_PERFORMANCE_MODE_EVENT,
				this.performanceHandler,
			);
			this.performanceHandler = null;
		}
		this.stopLoop();
		this.disposeAnalyser();
		this.analysedAudio = null;
		if (this.canvas) {
			this.canvas.remove();
			this.canvas = null;
		}
		this.initialized = false;
	}
}

let globalMusicWaveManager: MusicWaveManager | null = null;

export function getMusicWaveManager(): MusicWaveManager {
	if (!globalMusicWaveManager) {
		globalMusicWaveManager = new MusicWaveManager();
	}
	return globalMusicWaveManager;
}

export function setupMusicWaveOnDOMReady(): void {
	const manager = getMusicWaveManager();
	const init = () => {
		manager.init();
	};
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
}
