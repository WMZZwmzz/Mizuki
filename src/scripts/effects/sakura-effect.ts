/**
 * Sakura 特效模块
 * 管理樱花飘落特效的初始化
 */

import type { SakuraConfig } from "../../types/config";
import {
	EFFECT_PERFORMANCE_MODE_EVENT,
	type EffectPerformanceMode,
	getEffectPerformanceMode,
	normalizeEffectPerformanceMode,
} from "../../utils/effect-performance";
import { initSakura, stopSakura } from "../../utils/sakura-manager";
import { getStoredSakuraEnabled } from "../../utils/setting-utils";

/** 含 sakura 配置的 Widget 配置聚合对象 */
type SakuraWidgetConfigs = { sakura?: SakuraConfig };

/**
 * Sakura 特效处理器类
 * 负责樱花飘落特效的初始化和状态管理
 */
export class SakuraEffectHandler {
	private initialized = false;
	private config: SakuraConfig | null = null;

	/**
	 * 初始化 Sakura 特效
	 */
	init(widgetConfigs: SakuraWidgetConfigs): void {
		const sakuraConfig = widgetConfigs?.sakura;
		if (!sakuraConfig?.enable) {
			return;
		}

		// 避免重复初始化
		if (window.sakuraInitialized) {
			return;
		}

		this.config = sakuraConfig;
		initSakura(sakuraConfig);
		this.initialized = true;
		window.sakuraInitialized = true;
	}

	/**
	 * 检查是否已初始化
	 */
	isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * 获取配置
	 */
	getConfig(): SakuraConfig | null {
		return this.config;
	}
}

// 创建全局实例
let globalSakuraEffectHandler: SakuraEffectHandler | null = null;

/**
 * 获取全局 Sakura 特效处理器实例
 */
export function getSakuraEffectHandler(): SakuraEffectHandler {
	if (!globalSakuraEffectHandler) {
		globalSakuraEffectHandler = new SakuraEffectHandler();
	}
	return globalSakuraEffectHandler;
}

/**
 * 初始化 Sakura 特效（便捷函数）
 */
export function setupSakura(widgetConfigs: SakuraWidgetConfigs): void {
	const handler = getSakuraEffectHandler();
	handler.init(widgetConfigs);
}

/**
 * 设置 Sakura 特效初始化的 DOM 监听
 */
export function setupSakuraOnDOMReady(
	widgetConfigs: SakuraWidgetConfigs,
): void {
	const handler = getSakuraEffectHandler();

	const init = () => {
		// 极简档不启动樱花特效
		if (getEffectPerformanceMode() === "minimal") return;
		handler.init(widgetConfigs);
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}

	if (!window.__sakuraToggleListenerAdded) {
		window.__sakuraToggleListenerAdded = true;
		window.addEventListener("sakura-toggle", (e: Event) => {
			const detail = (e as CustomEvent).detail;
			if (detail.enabled) {
				// 极简档下不启动樱花，仅保留用户的开关偏好，切回其它档位时恢复
				if (getEffectPerformanceMode() === "minimal") {
					window.sakuraInitialized = false;
					return;
				}
				const config = handler.getConfig() || widgetConfigs?.sakura;
				if (config?.enable) {
					initSakura({ ...config, enable: true });
					window.sakuraInitialized = true;
				}
			} else {
				stopSakura();
				window.sakuraInitialized = false;
			}
		});
	}

	if (!window.__sakuraPerformanceListenerAdded) {
		window.__sakuraPerformanceListenerAdded = true;
		let appliedMode: EffectPerformanceMode = getEffectPerformanceMode();
		window.addEventListener(EFFECT_PERFORMANCE_MODE_EVENT, (e: Event) => {
			const nextMode = normalizeEffectPerformanceMode(
				(e as CustomEvent<{ mode?: unknown }>).detail?.mode,
			);
			const wasMinimal = appliedMode === "minimal";
			appliedMode = nextMode;
			if (nextMode === "minimal") {
				stopSakura();
				window.sakuraInitialized = false;
				return;
			}
			// 从极简档切回时按用户先前的樱花开关偏好恢复
			if (!wasMinimal) return;
			if (getStoredSakuraEnabled()) {
				const config = handler.getConfig() || widgetConfigs?.sakura;
				if (config?.enable) {
					initSakura({ ...config, enable: true });
					window.sakuraInitialized = true;
				}
			} else {
				stopSakura();
				window.sakuraInitialized = false;
			}
		});
	}
}
