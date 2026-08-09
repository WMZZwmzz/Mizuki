/**
 * 音乐波浪特效模块
 * 在页面正下方绘制随音律节奏跳动的多层波浪；播放时显示，停止时隐藏。
 *
 * 频谱接入策略（安全）：
 * 项目音乐源来自 Meting API（网易云等跨域音频），audio 元素未设 crossOrigin。
 * 若用 createMediaElementSource 接管 audio 路由，跨域 tainted 媒体会使整条音频图
 * （含 destination）静音——音乐会听不到。因此本模块改用 audio.captureStream()（Chrome/
 * Edge）/ mozCaptureStream()（Firefox）创建一条**并行** MediaStream，再经
 * createMediaStreamSource 接入 AnalyserNode。此路径不接管原 audio 输出，即使媒体
 * tainted 也只是分析链路读到全零（不影响音乐播放）；检测到持续全零即降级"伪节奏"。
 * Safari 不支持 captureStream，直接使用伪节奏。伪节奏含节拍脉冲，视觉上仍有明显跳动。
 */

import { musicPlayerStore } from "@/stores/musicPlayerStore";

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
/** 连续多少帧频谱全零后判定为 tainted 降级伪节奏 */
const SILENCE_THRESHOLD = 30;

class MusicWaveManager {
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private rafId = 0;
	private width = 0;
	private height = DESKTOP_HEIGHT;
	private layers: WaveLayer[] = [];
	private unsubscribe: (() => void) | null = null;
	private lastIsPlaying = false;
	private visibility = 0;
	private targetVisibility = 0;
	private lastTime = 0;
	private reducedMotion = false;
	private primaryRGB = "128, 128, 128";
	private initialized = false;
	private resizeObserver: MutationObserver | null = null;

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
	 * 读取 var(--primary) 的计算值并用 canvas 归一化为 sRGB rgb。
	 * 项目 --primary 是 oklch 宽色域颜色，getComputedStyle 可能返回 oklch() 而非
	 * rgb()，正则解析会失败；canvas 2D 的 fillStyle 会把任意合法 CSS 颜色（含
	 * oklch/color()）clamp 成 sRGB 的 #rrggbb，确保跨浏览器稳定取到 rgb 通道。
	 */
	private refreshColor(): void {
		if (typeof document === "undefined") {
			return;
		}
		const probe = document.createElement("div");
		probe.style.cssText =
			"background-color: var(--primary); position: absolute; visibility: hidden; left: -9999px;";
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

	/** 解析 canvas 归一化后的颜色字符串（#rrggbb 或 rgb(r,g,b)）为 "r, g, b" */
	private parseColorString(s: string): string | null {
		const rgbM = s.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
		if (rgbM) {
			return `${rgbM[1]}, ${rgbM[2]}, ${rgbM[3]}`;
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
		this.unsubscribe = musicPlayerStore.subscribe((state) => {
			const playing = state.isPlaying;
			if (playing !== this.lastIsPlaying) {
				this.lastIsPlaying = playing;
				this.targetVisibility = playing ? 1 : 0;
				if (playing && !this.rafId) {
					this.trySetupAnalyser();
					this.lastTime = 0;
					this.startLoop();
				}
			}
		});
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
		const stream = el.captureStream?.() ?? el.mozCaptureStream?.();
		if (!stream) {
			return; // 不支持（Safari），保持伪节奏
		}
		try {
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
			this.analyser.fftSize = 256;
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
				const start = Math.floor((b / BAND_COUNT) * n);
				const end = Math.floor(((b + 1) / BAND_COUNT) * n);
				let s = 0;
				for (let i = start; i < end; i++) {
					s += this.freqData[i];
				}
				this.bands[b] = end > start ? s / (end - start) / 255 : 0;
			}
			return;
		}
		this.computeFakeBands(sec);
	}

	/** 伪节奏：节拍脉冲（低频鼓点）+ 各频段不同频率的正弦起伏 */
	private computeFakeBands(sec: number): void {
		const beatInterval = 0.48; // 约 125 BPM
		const beatPhase = (sec % beatInterval) / beatInterval;
		const beatPulse = Math.exp(-beatPhase * 7);
		const accent = 0.6 + 0.4 * Math.sin(sec * 0.15);
		this.bands[0] = 0.22 + beatPulse * 0.78 * accent;
		this.bands[1] = 0.18 + (Math.sin(sec * 1.3 + 1) * 0.5 + 0.5) * 0.6;
		this.bands[2] = 0.14 + (Math.sin(sec * 2.1 + 2) * 0.5 + 0.5) * 0.5;
		this.bands[3] =
			0.1 + (Math.sin(sec * 3.7 + 3) * 0.5 + 0.5) * 0.4 + beatPulse * 0.2;
	}

	private startLoop(): void {
		const loop = (t: number) => {
			const cont = this.step(t);
			if (cont) {
				this.rafId = requestAnimationFrame(loop);
			} else {
				this.rafId = 0;
			}
		};
		this.rafId = requestAnimationFrame(loop);
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
			// 频段能量驱动跳动：能量越大振幅越大（0.15~2.0 倍区间）
			const amp =
				layer.baseAmplitude * ampScale * (0.15 + energy * 1.85) * motionScale;

			layer.phase += layer.speed * dt * motionScale;

			const baseline = this.height * layer.baseline;
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

			const grad = ctx.createLinearGradient(0, baseline - amp, 0, this.height);
			grad.addColorStop(0, `rgba(${this.primaryRGB}, ${layer.opacity * 0.9})`);
			grad.addColorStop(1, `rgba(${this.primaryRGB}, ${layer.opacity * 0.15})`);
			ctx.fillStyle = grad;
			ctx.fill();
		}
	}

	destroy(): void {
		if (this.unsubscribe) {
			this.unsubscribe();
			this.unsubscribe = null;
		}
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
		cancelAnimationFrame(this.rafId);
		this.rafId = 0;
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
