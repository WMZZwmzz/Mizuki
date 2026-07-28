/**
 * Sakura 特效模块
 * 管理樱花飘落特效的初始化
 */

import type { SakuraConfig } from "../../types/config";
import { initSakura, stopSakura } from "../../utils/sakura-manager";

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
