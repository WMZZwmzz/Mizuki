<!--
  DrivePage — 网盘文件管理器主组件
  功能：文件夹导航、面包屑路径、搜索过滤、文件打开/下载
  数据源：通过 props 接收 DriveItem[] 树结构
-->
<script lang="ts">
import Icon from "@iconify/svelte";
import { fade, fly } from "svelte/transition";

import type { DriveItem } from "../../../data/drive";
import { getFileIcon } from "../../../data/drive";

interface Props {
	items: DriveItem[];
	i18n: {
		searchPlaceholder: string;
		empty: string;
		back: string;
		root: string;
		items: string;
		open: string;
		download: string;
		folders: string;
		files: string;
	};
}

let { items, i18n }: Props = $props();

let currentPath = $state<string[]>([]);
let searchQuery = $state("");
let navigateDirection = $state<"forward" | "back">("forward");

function navigateToFolder(name: string) {
	currentPath = [...currentPath, name];
	searchQuery = "";
	navigateDirection = "forward";
}

function navigateToBreadcrumb(index: number) {
	currentPath = currentPath.slice(0, index + 1);
	searchQuery = "";
	navigateDirection = "back";
}

function goBack() {
	if (currentPath.length === 0) return;
	currentPath = currentPath.slice(0, -1);
	searchQuery = "";
	navigateDirection = "back";
}

let currentItems = $derived.by(() => {
	let result = items;
	for (const folderName of currentPath) {
		const folder = result.find(
			(item) => item.type === "folder" && item.name === folderName,
		);
		if (folder && folder.type === "folder") {
			result = folder.children;
		} else {
			return [];
		}
	}
	return result;
});

let filteredItems = $derived.by(() => {
	if (!searchQuery.trim()) return currentItems;
	const query = searchQuery.toLowerCase();
	return currentItems.filter((item) => item.name.toLowerCase().includes(query));
});

let folders = $derived(filteredItems.filter((item) => item.type === "folder"));
let files = $derived(filteredItems.filter((item) => item.type === "file"));

function handleFileClick(file: DriveItem) {
	if (file.type !== "file" || !file.url || file.url === "#") return;
	if (file.external) {
		window.open(file.url, "_blank", "noopener,noreferrer");
	} else {
		window.open(file.url, "_blank");
	}
}

function handleKeydown(event: KeyboardEvent, file: DriveItem) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		handleFileClick(file);
	}
}

let transitionX = $derived(navigateDirection === "forward" ? 24 : -24);
</script>

<div class="drive-page">
	<!-- 工具栏：返回按钮 + 面包屑 + 搜索 -->
	<div class="drive-toolbar">
		<div class="drive-breadcrumb-row">
			{#if currentPath.length > 0}
				<button
					class="drive-back-btn"
					onclick={goBack}
					aria-label={i18n.back}
				>
					<Icon icon="material-symbols:arrow-back-rounded" class="text-xl" />
					<span>{i18n.back}</span>
				</button>
			{/if}

			<nav class="drive-breadcrumb" aria-label="breadcrumb">
				<button
					class="drive-crumb"
					onclick={() => navigateToBreadcrumb(-1)}
				>
					<Icon icon="material-symbols:home-outline" class="text-lg" />
					<span>{i18n.root}</span>
				</button>
				{#each currentPath as folder, i}
					<Icon
						icon="material-symbols:chevron-right-rounded"
						class="drive-separator text-lg"
					/>
					<button
						class="drive-crumb"
						class:drive-crumb-active={i === currentPath.length - 1}
						onclick={() => navigateToBreadcrumb(i)}
					>
						<span>{folder}</span>
					</button>
				{/each}
			</nav>
		</div>

		<div class="drive-search-wrapper">
			<Icon
				icon="material-symbols:search-rounded"
				class="drive-search-icon text-lg"
			/>
			<input
				type="text"
				class="drive-search-input"
				placeholder={i18n.searchPlaceholder}
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button
					class="drive-search-clear"
					onclick={() => (searchQuery = "")}
					aria-label="Clear"
				>
					<Icon icon="material-symbols:close-rounded" class="text-base" />
				</button>
			{/if}
		</div>
	</div>

	<!-- 内容区域 -->
	{#if filteredItems.length === 0}
		<div class="drive-empty" in:fade={{ duration: 300 }}>
			<Icon
				icon="material-symbols:folder-open-outline"
				class="text-6xl drive-empty-icon"
			/>
			<p class="drive-empty-text">{i18n.empty}</p>
		</div>
	{:else}
		<div class="drive-content">
			{#if folders.length > 0}
				{#if !searchQuery}
					<div class="drive-section-label">
						<Icon icon="material-symbols:folder-outline" class="text-lg" />
						<span>{i18n.folders}</span>
						<span class="drive-section-count">{folders.length}</span>
					</div>
				{/if}

				<div class="drive-grid">
					{#each folders as folder, i (folder.name)}
						<button
							class="drive-card drive-card-folder"
							in:fly={{ y: transitionX, duration: 300, delay: i * 30 }}
							onclick={() => navigateToFolder(folder.name)}
						>
							<div class="drive-card-icon drive-card-icon-folder">
								<Icon icon="material-symbols:folder-outline" class="text-4xl" />
							</div>
							<div class="drive-card-info">
								<span class="drive-card-name">{folder.name}</span>
								{#if folder.description}
									<span class="drive-card-desc">{folder.description}</span>
								{/if}
								{#if folder.type === "folder"}
									<span class="drive-card-meta">
										{folder.children.length} {i18n.items}
									</span>
								{/if}
							</div>
							<Icon
								icon="material-symbols:chevron-right-rounded"
								class="drive-card-arrow text-xl"
							/>
						</button>
					{/each}
				</div>
			{/if}

			{#if files.length > 0}
				{#if !searchQuery}
					<div class="drive-section-label drive-section-label-files">
						<Icon icon="material-symbols:description-outline" class="text-lg" />
						<span>{i18n.files}</span>
						<span class="drive-section-count">{files.length}</span>
					</div>
				{/if}

				<div class="drive-grid">
					{#each files as file, i (file.name)}
						<button
							class="drive-card drive-card-file"
							in:fly={{ y: transitionX, duration: 300, delay: (folders.length + i) * 30 }}
							onclick={() => handleFileClick(file)}
							onkeydown={(e) => handleKeydown(e, file)}
							role="link"
							tabindex="0"
						>
							<div
								class="drive-card-icon"
								class:drive-card-icon-link={file.type === "file" && file.fileType === "link"}
							>
								<Icon
									icon={file.type === "file"
										? getFileIcon(file.fileType)
										: "material-symbols:draft-outline"}
									class="text-4xl"
								/>
							</div>
							<div class="drive-card-info">
								<span class="drive-card-name">{file.name}</span>
								{#if file.type === "file" && file.description}
									<span class="drive-card-desc">{file.description}</span>
								{/if}
								<div class="drive-card-tags">
									{#if file.type === "file" && file.size}
										<span class="drive-card-tag">{file.size}</span>
									{/if}
									{#if file.type === "file" && file.external}
										<span class="drive-card-tag drive-card-tag-external">
											<Icon icon="material-symbols:open-in-new-rounded" class="text-xs" />
										</span>
									{/if}
								</div>
							</div>
							<Icon
								icon="material-symbols:chevron-right-rounded"
								class="drive-card-arrow text-xl"
							/>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
.drive-page {
	width: 100%;
	min-height: 400px;
}

/* ── Toolbar ── */
.drive-toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	margin-bottom: 1.5rem;
}

.drive-breadcrumb-row {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	min-width: 0;
	flex: 1;
}

.drive-back-btn {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.5rem 0.875rem;
	border: 1px solid var(--line-divider);
	border-radius: var(--radius-large);
	background: var(--btn-regular-bg);
	color: var(--btn-content);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	white-space: nowrap;
}

.drive-back-btn:hover {
	background: var(--btn-regular-bg-hover);
	border-color: var(--primary);
	color: var(--primary);
	transform: translateX(-2px);
}

.drive-breadcrumb {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	overflow-x: auto;
	scrollbar-width: none;
	min-width: 0;
}

.drive-breadcrumb::-webkit-scrollbar {
	display: none;
}

.drive-crumb {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.375rem 0.625rem;
	border: none;
	border-radius: 0.5rem;
	background: transparent;
	color: var(--btn-content);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
	opacity: 0.65;
}

.drive-crumb:hover {
	opacity: 1;
	color: var(--primary);
}

.drive-crumb-active {
	opacity: 1;
	color: var(--primary);
	font-weight: 600;
}

.drive-separator {
	opacity: 0.4;
	flex-shrink: 0;
}

/* ── Search ── */
.drive-search-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	flex-shrink: 0;
}

.drive-search-icon {
	position: absolute;
	left: 0.75rem;
	opacity: 0.4;
	pointer-events: none;
}

.drive-search-input {
	padding: 0.5rem 2rem 0.5rem 2.25rem;
	border: 1px solid var(--line-divider);
	border-radius: var(--radius-large);
	background: var(--btn-regular-bg);
	color: var(--btn-content);
	font-size: 0.875rem;
	width: 200px;
	transition: all 0.25s ease;
}

.drive-search-input:focus {
	outline: none;
	border-color: var(--primary);
	width: 240px;
}

.drive-search-input::placeholder {
	color: var(--btn-content);
	opacity: 0.4;
}

.drive-search-clear {
	position: absolute;
	right: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.5rem;
	height: 1.5rem;
	border: none;
	border-radius: 50%;
	background: transparent;
	color: var(--btn-content);
	opacity: 0.5;
	cursor: pointer;
	transition: all 0.2s ease;
}

.drive-search-clear:hover {
	opacity: 1;
	background: var(--btn-plain-bg-hover);
}

/* ── Section label ── */
.drive-section-label {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	margin-bottom: 0.75rem;
	margin-top: 0.5rem;
	font-size: 0.8rem;
	font-weight: 600;
	opacity: 0.5;
}

.drive-section-label-files {
	margin-top: 1.5rem;
}

.drive-section-count {
	padding: 0.0625rem 0.375rem;
	border-radius: 0.375rem;
	background: var(--btn-plain-bg-hover);
	font-size: 0.7rem;
}

/* ── Grid ── */
.drive-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 0.75rem;
}

/* ── Card ── */
.drive-card {
	display: flex;
	align-items: center;
	gap: 0.875rem;
	padding: 0.875rem 1rem;
	border: 1px solid var(--line-divider);
	border-radius: var(--radius-large);
	background: var(--card-bg);
	text-align: left;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
}

.drive-card::before {
	content: "";
	position: absolute;
	inset: 0;
	background: linear-gradient(
		135deg,
		oklch(from var(--primary) l c h / 0.06),
		transparent 60%
	);
	opacity: 0;
	transition: opacity 0.3s ease;
	pointer-events: none;
}

.drive-card:hover {
	border-color: oklch(from var(--primary) l c h / 0.4);
	transform: translateY(-3px);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.drive-card:hover::before {
	opacity: 1;
}

.drive-card:active {
	transform: translateY(-1px);
}

.drive-card-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	border-radius: 0.75rem;
	background: var(--btn-plain-bg-hover);
	color: var(--btn-content);
	flex-shrink: 0;
	transition: all 0.3s ease;
}

.drive-card-icon-folder {
	color: oklch(from var(--primary) l c h);
}

.drive-card-icon-link {
	color: oklch(0.6 0.15 250);
}

.drive-card:hover .drive-card-icon {
	transform: scale(1.08);
}

.drive-card-info {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	min-width: 0;
	flex: 1;
}

.drive-card-name {
	font-size: 0.9375rem;
	font-weight: 600;
	color: var(--btn-content);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.drive-card-desc {
	font-size: 0.75rem;
	opacity: 0.55;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.drive-card-meta {
	font-size: 0.7rem;
	opacity: 0.4;
}

.drive-card-tags {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	margin-top: 0.125rem;
}

.drive-card-tag {
	padding: 0.0625rem 0.375rem;
	border-radius: 0.375rem;
	background: var(--btn-plain-bg-hover);
	font-size: 0.7rem;
	opacity: 0.6;
}

.drive-card-tag-external {
	display: flex;
	align-items: center;
	padding: 0.1875rem;
}

.drive-card-arrow {
	opacity: 0.3;
	transition: all 0.25s ease;
	flex-shrink: 0;
}

.drive-card:hover .drive-card-arrow {
	opacity: 0.7;
	transform: translateX(3px);
	color: var(--primary);
}

/* ── Empty ── */
.drive-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 4rem 1rem;
	gap: 1rem;
}

.drive-empty-icon {
	opacity: 0.15;
}

.drive-empty-text {
	font-size: 1rem;
	opacity: 0.4;
}

/* ── Responsive ── */
@media (max-width: 640px) {
	.drive-toolbar {
		flex-direction: column;
		align-items: stretch;
	}

	.drive-search-input {
		width: 100%;
	}

	.drive-search-input:focus {
		width: 100%;
	}

	.drive-grid {
		grid-template-columns: 1fr;
	}

	.drive-card {
		padding: 0.75rem;
	}
}
</style>
