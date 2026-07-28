// 音乐页面滚动边界限制脚本
// 此脚本作为全局脚本加载，不受 Swup 页面切换影响
// 当页脚版权信息完整出现在视口中时，阻止页面继续向下滚动

(() => {
	if (typeof window.musicScrollLimitState !== "undefined") {
		return;
	}

	const state = {
		active: false,
	};
	window.musicScrollLimitState = state;

	// 获取当前可见的页脚（桌面端与移动端各渲染一份，通过 display 切换）
	function getVisibleFooter() {
		const footers = document.querySelectorAll(".footer");
		for (let i = 0; i < footers.length; i++) {
			if (footers[i].offsetParent !== null) {
				return footers[i];
			}
		}
		return null;
	}

	// 允许的最大滚动位置：页脚底部与视口底部对齐（版权信息刚好完整出现在视口中）
	function getMaxScrollY() {
		const footer = getVisibleFooter();
		if (!footer) {
			return Number.POSITIVE_INFINITY;
		}
		const rect = footer.getBoundingClientRect();
		return Math.max(0, window.scrollY + rect.bottom - window.innerHeight);
	}

	// 判断滚轮事件是否发生在内部可滚动面板（歌词、播放列表等）中，
	// 避免在页面到达边界时误伤面板自身的滚动
	function isInsideScrollablePanel(target) {
		let el = target instanceof Element ? target : null;
		while (el && el !== document.body) {
			if (el.scrollHeight > el.clientHeight + 1) {
				const overflowY = window.getComputedStyle(el).overflowY;
				if (overflowY === "auto" || overflowY === "scroll") {
					return true;
				}
			}
			el = el.parentElement;
		}
		return false;
	}

	// 滚轮：向下滚动即将越过边界时直接拦截并停在边界处
	function onWheel(event) {
		if (!state.active || event.deltaY <= 0) {
			return;
		}
		if (isInsideScrollablePanel(event.target)) {
			return;
		}
		const maxScrollY = getMaxScrollY();
		if (window.scrollY + event.deltaY >= maxScrollY) {
			event.preventDefault();
			window.scrollTo(0, maxScrollY);
		}
	}

	// 兜底：触摸、键盘、拖动滚动条等方式越界后立即回弹到边界
	function onScroll() {
		if (!state.active) {
			return;
		}
		const maxScrollY = getMaxScrollY();
		if (window.scrollY > maxScrollY) {
			window.scrollTo(0, maxScrollY);
		}
	}

	function updateActive() {
		state.active = !!document.querySelector(".music-page");
	}

	window.addEventListener("wheel", onWheel, { passive: false });
	window.addEventListener("scroll", onScroll, { passive: true });

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", updateActive);
	} else {
		updateActive();
	}

	const events = [
		"swup:contentReplaced",
		"swup:pageView",
		"astro:page-load",
		"astro:after-swap",
		"mizuki:page:loaded",
	];

	for (let i = 0; i < events.length; i++) {
		document.addEventListener(events[i], () => {
			setTimeout(updateActive, 100);
		});
	}
})();
