<script lang="ts">
interface Props {
	currentTime: number;
	duration: number;
	onSeek: (time: number) => void;
}

const { currentTime, duration, onSeek }: Props = $props();

const progressPercent = $derived(
	duration > 0 ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0,
);

function handleClick(event: MouseEvent) {
	const el = event.currentTarget as HTMLElement | null;
	if (!el || duration <= 0) {
		return;
	}
	seekFromClientX(el, event.clientX);
}

function seekFromClientX(el: HTMLElement, clientX: number) {
	const rect = el.getBoundingClientRect();
	if (rect.width <= 0 || duration <= 0) {
		return;
	}
	const percent = (clientX - rect.left) / rect.width;
	const clamped = Math.max(0, Math.min(1, percent));
	const time = clamped * duration;
	onSeek(time);
}

function handlePointerDown(event: PointerEvent) {
	const el = event.currentTarget as HTMLElement | null;
	if (!el || duration <= 0) {
		return;
	}

	event.preventDefault();
	seekFromClientX(el, event.clientX);

	const pointerId = event.pointerId;
	el.setPointerCapture(pointerId);

	const handleMove = (moveEvent: PointerEvent) => {
		if (moveEvent.pointerId !== pointerId) {
			return;
		}
		seekFromClientX(el, moveEvent.clientX);
	};

	const cleanup = () => {
		el.removeEventListener("pointermove", handleMove);
		el.removeEventListener("pointerup", handleUp);
		el.removeEventListener("pointercancel", handleCancel);
		if (el.hasPointerCapture(pointerId)) {
			el.releasePointerCapture(pointerId);
		}
	};

	const handleUp = (upEvent: PointerEvent) => {
		if (upEvent.pointerId !== pointerId) {
			return;
		}
		seekFromClientX(el, upEvent.clientX);
		cleanup();
	};

	const handleCancel = (cancelEvent: PointerEvent) => {
		if (cancelEvent.pointerId !== pointerId) {
			return;
		}
		cleanup();
	};

	el.addEventListener("pointermove", handleMove);
	el.addEventListener("pointerup", handleUp);
	el.addEventListener("pointercancel", handleCancel);
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		const time = duration * 0.5;
		onSeek(time);
	}
}
</script>

<div class="sidebar-progress-wrapper">
	<div
		class="sidebar-progress-bar"
		onclick={handleClick}
		onkeydown={handleKeyDown}
		onpointerdown={handlePointerDown}
		role="slider"
		tabindex="0"
		aria-label="Music progress"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={progressPercent}
	>
		<div
			class="sidebar-progress-fill"
			style={`width: ${progressPercent}%`}
		></div>
	</div>
</div>

<style>
	.sidebar-progress-wrapper {
		margin-top: 0.15rem;
	}

	.sidebar-progress-bar {
		position: relative;
		width: 100%;
		height: 0.375rem;
		border-radius: 9999px;
		background: color-mix(
			in srgb,
			var(--btn-regular-bg) 80%,
			var(--content-meta) 20%
		);
		overflow: hidden;
		cursor: pointer;
		touch-action: none;
	}

	.sidebar-progress-fill {
		height: 100%;
		border-radius: inherit;
		background: var(--primary);
		transition: width 100ms linear;
		min-width: 0;
	}

	.sidebar-progress-bar:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}
</style>
