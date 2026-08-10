import type { SakuraConfig } from "../types/config";
import {
	EFFECT_PERFORMANCE_MODE_EVENT,
	type EffectPerformanceMode,
	getEffectFrameInterval,
	getEffectPerformanceMode,
	normalizeEffectPerformanceMode,
} from "./effect-performance";
import { publicUrl } from "./url-utils";

// 樱花对象类
class Sakura {
	x: number;
	y: number;
	s: number;
	r: number;
	a: number;
	fn: {
		x: (x: number, y: number, frameScale: number) => number;
		y: (x: number, y: number, frameScale: number) => number;
		r: (r: number, frameScale: number) => number;
		a: (a: number, frameScale: number) => number;
	};
	idx: number;
	img: HTMLImageElement;
	limitArray: number[];
	config: SakuraConfig;

	constructor(
		x: number,
		y: number,
		s: number,
		r: number,
		a: number,
		fn: {
			x: (x: number, y: number, frameScale: number) => number;
			y: (x: number, y: number, frameScale: number) => number;
			r: (r: number, frameScale: number) => number;
			a: (a: number, frameScale: number) => number;
		},
		idx: number,
		img: HTMLImageElement,
		limitArray: number[],
		config: SakuraConfig,
	) {
		this.x = x;
		this.y = y;
		this.s = s;
		this.r = r;
		this.a = a;
		this.fn = fn;
		this.idx = idx;
		this.img = img;
		this.limitArray = limitArray;
		this.config = config;
	}

	draw(cxt: CanvasRenderingContext2D) {
		cxt.save();
		cxt.translate(this.x, this.y);
		cxt.rotate(this.r);
		cxt.globalAlpha = this.a;
		// 使用 transform 替代直接 drawImage 以支持 GPU 加速
		cxt.drawImage(this.img, 0, 0, 40 * this.s, 40 * this.s);
		cxt.restore();
	}

	update(deltaSeconds: number) {
		const frameScale = deltaSeconds * 60;
		this.x = this.fn.x(this.x, this.y, frameScale);
		this.y = this.fn.y(this.x, this.y, frameScale);
		this.r = this.fn.r(this.r, frameScale);
		this.a = this.fn.a(this.a, frameScale);

		// 如果樱花越界或完全透明，重新调整位置
		if (
			this.x > window.innerWidth ||
			this.x < 0 ||
			this.y > window.innerHeight ||
			this.y < 0 ||
			this.a <= 0
		) {
			// 如果樱花不做限制
			if (this.limitArray[this.idx] === -1) {
				this.resetPosition();
			}
			// 否则樱花有限制
			else {
				if (this.limitArray[this.idx] > 0) {
					this.resetPosition();
					this.limitArray[this.idx]--;
				}
			}
		}
	}

	private resetPosition() {
		this.r = getRandom("fnr", this.config);
		if (Math.random() > 0.4) {
			this.x = getRandom("x", this.config);
			this.y = 0;
			this.s = getRandom("s", this.config);
			this.r = getRandom("r", this.config);
			this.a = getRandom("a", this.config);
		} else {
			this.x = window.innerWidth;
			this.y = getRandom("y", this.config);
			this.s = getRandom("s", this.config);
			this.r = getRandom("r", this.config);
			this.a = getRandom("a", this.config);
		}
	}
}

// 樱花列表类
class SakuraList {
	list: Sakura[];

	constructor() {
		this.list = [];
	}

	push(sakura: Sakura) {
		this.list.push(sakura);
	}

	update(deltaSeconds: number) {
		for (let i = 0, len = this.list.length; i < len; i++) {
			this.list[i].update(deltaSeconds);
		}
	}

	draw(cxt: CanvasRenderingContext2D) {
		for (let i = 0, len = this.list.length; i < len; i++) {
			this.list[i].draw(cxt);
		}
	}

	get(i: number) {
		return this.list[i];
	}

	size() {
		return this.list.length;
	}
}

// 获取随机值的函数
// biome-ignore lint/suspicious/noExplicitAny: polymorphic return based on option string
function getRandom(option: string, config: SakuraConfig): any {
	// biome-ignore lint/suspicious/noExplicitAny: polymorphic return
	let ret: any;
	let random: number;

	switch (option) {
		case "x":
			ret = Math.random() * window.innerWidth;
			break;
		case "y":
			ret = Math.random() * window.innerHeight;
			break;
		case "s":
			ret =
				config.size.min + Math.random() * (config.size.max - config.size.min);
			break;
		case "r":
			ret = Math.random() * 6;
			break;
		case "a":
			ret =
				config.opacity.min +
				Math.random() * (config.opacity.max - config.opacity.min);
			break;
		case "fnx":
			random =
				config.speed.horizontal.min +
				Math.random() *
					(config.speed.horizontal.max - config.speed.horizontal.min);
			ret = (x: number, _y: number, frameScale: number) =>
				x + random * frameScale;
			break;
		case "fny":
			random =
				config.speed.vertical.min +
				Math.random() * (config.speed.vertical.max - config.speed.vertical.min);
			ret = (_x: number, y: number, frameScale: number) =>
				y + random * frameScale;
			break;
		case "fnr":
			ret = (r: number, frameScale: number) =>
				r + config.speed.rotation * frameScale;
			break;
		case "fna":
			ret = (alpha: number, frameScale: number) =>
				alpha - config.speed.fadeSpeed * 0.01 * frameScale;
			break;
	}
	return ret;
}

// 樱花管理器类
export class SakuraManager {
	private config: SakuraConfig;
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private sakuraList: SakuraList | null = null;
	private animationId: number | null = null;
	private frameTimerId: number | null = null;
	private img: HTMLImageElement | null = null;
	private isRunning = false;
	private resizeTimeout: number | null = null;
	private boundResizeHandler: () => void;
	private boundVisibilityHandler: () => void;
	private boundMotionHandler: (event: MediaQueryListEvent) => void;
	private boundPerformanceHandler: (event: Event) => void;
	private motionQuery: MediaQueryList | null = null;
	private performanceMode: EffectPerformanceMode = getEffectPerformanceMode();
	private lastFrameTime = 0;
	private initToken = 0;

	constructor(config: SakuraConfig) {
		this.config = config;
		this.boundResizeHandler = this.handleResize.bind(this);
		this.boundVisibilityHandler = this.handleVisibilityChange.bind(this);
		this.boundMotionHandler = this.handleMotionChange.bind(this);
		this.boundPerformanceHandler = this.handlePerformanceChange.bind(this);
	}

	// 初始化樱花特效
	async init(): Promise<void> {
		if (!this.config.enable || this.isRunning) {
			return;
		}

		const initToken = ++this.initToken;
		// 创建图片对象
		this.img = new Image();
		// 经 publicUrl 加 base 前缀，兼容子路径部署（GitHub Pages 的 base 为 /Mizuki/）；
		// 硬编码 "/sakura.webp" 会在子路径下 404 导致 onerror、init() reject。
		this.img.src = publicUrl("/sakura.webp");

		// 等待图片加载完成
		await new Promise<void>((resolve, reject) => {
			if (this.img) {
				this.img.onload = () => resolve();
				this.img.onerror = () =>
					reject(new Error("Failed to load sakura image"));
			}
		});
		if (initToken !== this.initToken || !this.config.enable) {
			return;
		}

		this.createCanvas();
		this.createSakuraList();
		this.isRunning = true;
		this.bindLifecycle();
		this.startAnimation();
	}

	// 创建画布
	private createCanvas(): void {
		this.canvas = document.createElement("canvas");
		this.canvas.height = window.innerHeight;
		this.canvas.width = window.innerWidth;
		this.canvas.setAttribute(
			"style",
			`position: fixed; left: 0; top: 0; pointer-events: none; z-index: ${this.config.zIndex};`,
		);
		this.canvas.setAttribute("id", "canvas_sakura");
		this.canvas.classList.add("sakura-canvas");
		document.body.appendChild(this.canvas);
		this.ctx = this.canvas.getContext("2d");

		// 使用被动事件监听器提升滚动性能
		window.addEventListener("resize", this.boundResizeHandler, {
			passive: true,
		});
	}

	// 创建樱花列表
	private createSakuraList(): void {
		if (!this.img || !this.ctx) {
			return;
		}

		this.sakuraList = new SakuraList();
		const limitArray = new Array(this.config.sakuraNum).fill(
			this.config.limitTimes,
		);

		for (let i = 0; i < this.config.sakuraNum; i++) {
			const randomX = getRandom("x", this.config);
			const randomY = getRandom("y", this.config);
			const randomS = getRandom("s", this.config);
			const randomR = getRandom("r", this.config);
			const randomA = getRandom("a", this.config);
			const randomFnx = getRandom("fnx", this.config);
			const randomFny = getRandom("fny", this.config);
			const randomFnR = getRandom("fnr", this.config);
			const randomFnA = getRandom("fna", this.config);

			const sakura = new Sakura(
				randomX,
				randomY,
				randomS,
				randomR,
				randomA,
				{
					x: randomFnx,
					y: randomFny,
					r: randomFnR,
					a: randomFnA,
				},
				i,
				this.img,
				limitArray,
				this.config,
			);

			sakura.draw(this.ctx);
			this.sakuraList.push(sakura);
		}
	}

	// 开始动画
	private startAnimation(): void {
		if (
			this.animationId !== null ||
			this.frameTimerId !== null ||
			!this.canAnimate() ||
			!this.ctx ||
			!this.canvas ||
			!this.sakuraList
		) {
			return;
		}
		this.lastFrameTime = 0;

		const animate = (timestamp: number) => {
			this.animationId = null;
			if (!this.ctx || !this.canvas || !this.sakuraList) {
				return;
			}
			if (!this.canAnimate()) {
				this.lastFrameTime = 0;
				return;
			}

			const elapsed = timestamp - this.lastFrameTime;
			const frameInterval = getEffectFrameInterval(this.performanceMode);
			if (
				this.lastFrameTime === 0 ||
				frameInterval === null ||
				elapsed >= frameInterval
			) {
				const deltaSeconds = this.lastFrameTime
					? Math.min(elapsed / 1000, 0.1)
					: frameInterval === null
						? 1 / 60
						: 1 / 30;
				this.lastFrameTime = frameInterval
					? timestamp - (elapsed % frameInterval)
					: timestamp;
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.sakuraList.update(deltaSeconds);
				this.sakuraList.draw(this.ctx);
			}
			this.scheduleNextFrame(animate);
		};

		this.animationId = window.requestAnimationFrame(animate);
	}

	private scheduleNextFrame(callback: FrameRequestCallback): void {
		const frameInterval = getEffectFrameInterval(this.performanceMode);
		if (frameInterval === null) {
			this.animationId = window.requestAnimationFrame(callback);
			return;
		}
		const elapsed = this.lastFrameTime
			? performance.now() - this.lastFrameTime
			: frameInterval;
		const delay = Math.max(0, frameInterval - elapsed);
		if (delay > 1) {
			this.frameTimerId = window.setTimeout(() => {
				this.frameTimerId = null;
				if (this.canAnimate()) {
					this.animationId = window.requestAnimationFrame(callback);
				}
			}, delay);
			return;
		}
		this.animationId = window.requestAnimationFrame(callback);
	}

	private canAnimate(): boolean {
		return (
			this.isRunning &&
			this.config.enable &&
			!document.hidden &&
			!this.motionQuery?.matches
		);
	}

	private stopAnimation(): void {
		if (this.animationId !== null) {
			window.cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
		if (this.frameTimerId !== null) {
			window.clearTimeout(this.frameTimerId);
			this.frameTimerId = null;
		}
		this.lastFrameTime = 0;
	}

	private bindLifecycle(): void {
		this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		document.addEventListener("visibilitychange", this.boundVisibilityHandler);
		this.motionQuery.addEventListener("change", this.boundMotionHandler);
		window.addEventListener(
			EFFECT_PERFORMANCE_MODE_EVENT,
			this.boundPerformanceHandler,
		);
	}

	private handleVisibilityChange(): void {
		if (document.hidden) {
			this.stopAnimation();
		} else {
			this.startAnimation();
		}
	}

	private handleMotionChange(event: MediaQueryListEvent): void {
		if (event.matches) {
			this.stopAnimation();
		} else {
			this.startAnimation();
		}
	}

	private handlePerformanceChange(event: Event): void {
		const nextMode = normalizeEffectPerformanceMode(
			(event as CustomEvent<{ mode?: unknown }>).detail?.mode,
		);
		if (nextMode === this.performanceMode) return;
		this.performanceMode = nextMode;
		this.stopAnimation();
		this.startAnimation();
	}

	// 处理窗口大小变化 - 带防抖
	private handleResize(): void {
		if (this.resizeTimeout) {
			cancelAnimationFrame(this.resizeTimeout);
		}
		this.resizeTimeout = requestAnimationFrame(() => {
			if (this.canvas) {
				this.canvas.width = window.innerWidth;
				this.canvas.height = window.innerHeight;
			}
		});
	}

	// 停止樱花特效
	stop(): void {
		this.initToken++;
		this.stopAnimation();

		if (this.resizeTimeout) {
			cancelAnimationFrame(this.resizeTimeout);
			this.resizeTimeout = null;
		}

		if (this.canvas) {
			this.canvas.remove();
			this.canvas = null;
		}

		window.removeEventListener("resize", this.boundResizeHandler);
		document.removeEventListener(
			"visibilitychange",
			this.boundVisibilityHandler,
		);
		this.motionQuery?.removeEventListener("change", this.boundMotionHandler);
		window.removeEventListener(
			EFFECT_PERFORMANCE_MODE_EVENT,
			this.boundPerformanceHandler,
		);
		this.motionQuery = null;
		this.ctx = null;
		this.sakuraList = null;
		this.img = null;
		this.isRunning = false;
	}

	// 切换樱花特效
	toggle(): void {
		if (this.isRunning) {
			this.stop();
		} else {
			this.init();
		}
	}

	// 更新配置
	updateConfig(newConfig: SakuraConfig): void {
		const wasRunning = this.isRunning;
		if (wasRunning) {
			this.stop();
		}
		this.config = newConfig;
		if (wasRunning && newConfig.enable) {
			this.init();
		}
	}

	// 获取运行状态
	getIsRunning(): boolean {
		return this.isRunning;
	}
}

// 创建全局樱花管理器实例
let globalSakuraManager: SakuraManager | null = null;

// 初始化樱花特效
export function initSakura(config: SakuraConfig): void {
	if (globalSakuraManager) {
		globalSakuraManager.updateConfig(config);
	} else {
		globalSakuraManager = new SakuraManager(config);
		if (config.enable) {
			globalSakuraManager.init();
		}
	}
}

// 切换樱花特效
export function toggleSakura(): void {
	if (globalSakuraManager) {
		globalSakuraManager.toggle();
	}
}

// 停止樱花特效
export function stopSakura(): void {
	if (globalSakuraManager) {
		globalSakuraManager.stop();
		globalSakuraManager = null;
	}
}

// 获取樱花特效运行状态
export function getSakuraStatus(): boolean {
	return globalSakuraManager ? globalSakuraManager.getIsRunning() : false;
}
