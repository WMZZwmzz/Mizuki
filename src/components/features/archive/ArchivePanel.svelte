<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { onMount } from "svelte";

export let tags: string[];
export let categories: string[];
export let sortedPosts: Post[] = [];
/** 每页文章数，可在传入处自定义 */
export let pageSize = 20;

const params = new URLSearchParams(window.location.search);
tags = params.has("tag") ? params.getAll("tag") : [];
categories = params.has("category") ? params.getAll("category") : [];
const uncategorized = params.get("uncategorized");

interface Post {
	id: string;
	url?: string; // 预计算的文章 URL
	data: {
		title: string;
		tags: string[];
		category?: string;
		published: Date;
		alias?: string;
		permalink?: string; // 自定义固定链接
	};
}

interface Group {
	year: number;
	posts: Post[];
}

let groups: Group[] = [];

// === 分页状态 ===
let currentPage = 1;
let totalPages = 1;
let totalPosts = 0;
let filteredPostsCache: Post[] = [];
let currentPageSize = pageSize;
let dropdownOpen = false;
const HIDDEN = -1;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	return tagList.map((t) => `#${t}`).join(" ");
}

function paginate<T>(arr: T[], page: number, size: number): T[] {
	const start = (page - 1) * size;
	return arr.slice(start, start + size);
}

/** 根据当前过滤条件计算 filteredPosts，并更新分页元数据 */
function applyFilter(): Post[] {
	let result: Post[] = sortedPosts;

	if (tags.length > 0) {
		result = result.filter(
			(post) =>
				Array.isArray(post.data.tags) &&
				post.data.tags.some((tag) => tags.includes(tag)),
		);
	}

	if (categories.length > 0) {
		result = result.filter(
			(post) => post.data.category && categories.includes(post.data.category),
		);
	}

	if (uncategorized) {
		result = result.filter((post) => !post.data.category);
	}

	// 按发布时间倒序排序，确保不受置顶影响
	result = result
		.slice()
		.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());

	return result;
}

/** 把给定文章列表按年份分组并写入 groups */
function renderGroups(posts: Post[]) {
	const grouped = posts.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
		year: Number.parseInt(yearStr, 10),
		posts: grouped[Number.parseInt(yearStr, 10)],
	}));

	groupedPostsArray.sort((a, b) => b.year - a.year);

	groups = groupedPostsArray;
}

/** 重新计算分页元数据并渲染当前页（不重置 currentPage） */
function rerender() {
	totalPosts = filteredPostsCache.length;
	totalPages = Math.max(1, Math.ceil(totalPosts / currentPageSize));
	if (currentPage > totalPages) currentPage = 1;
	const pagedPosts = paginate(filteredPostsCache, currentPage, currentPageSize);
	renderGroups(pagedPosts);
}

/** 切换每页条数，并尽量保持当前阅读位置（按比例换算页码） */
function changePageSize(size: number) {
	if (size === currentPageSize || !PAGE_SIZE_OPTIONS.includes(size)) return;
	// 估算切换后应停留的页码：当前页起始文章索引 / 新页大小
	const firstIndex = (currentPage - 1) * currentPageSize;
	currentPageSize = size;
	currentPage = Math.max(1, Math.floor(firstIndex / size) + 1);
	rerender();
	// 滚动到列表顶部
	if (typeof document !== "undefined") {
		const el = document.getElementById("archive-panel");
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
	}
}

/** 生成分页器要显示的页码（含 HIDDEN 占位以表示省略号） */
function buildPageList(): number[] {
	if (totalPages <= 1) return [];
	const ADJ = 2;
	const VISIBLE = ADJ * 2 + 1;
	let l = currentPage;
	let r = currentPage;
	let count = 1;
	while (l > 1 && r + 1 <= totalPages && count + 2 <= VISIBLE) {
		count += 2;
		l--;
		r++;
	}
	while (l > 1 && count < VISIBLE) {
		count++;
		l--;
	}
	while (r + 1 <= totalPages && count < VISIBLE) {
		count++;
		r++;
	}
	const out: number[] = [];
	if (l > 1) out.push(1);
	if (l === 3) out.push(2);
	if (l > 3) out.push(HIDDEN);
	for (let i = l; i <= r; i++) out.push(i);
	if (r < totalPages - 2) out.push(HIDDEN);
	if (r === totalPages - 2) out.push(totalPages - 1);
	if (r < totalPages) out.push(totalPages);
	return out;
}

function gotoPage(page: number) {
	if (page < 1 || page > totalPages || page === currentPage) return;
	currentPage = page;
	const pagedPosts = paginate(filteredPostsCache, currentPage, currentPageSize);
	renderGroups(pagedPosts);
	// 滚动到归档列表顶部，避免停留在分页器位置
	if (typeof document !== "undefined") {
		const el = document.getElementById("archive-panel");
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
	}
}

onMount(async () => {
	// 首次挂载：应用过滤 + 重置到第 1 页
	filteredPostsCache = applyFilter();
	currentPage = 1;
	rerender();
});
</script>

<!-- 点击组件外部或按 Escape 时关闭每页条数弹出列表 -->
<svelte:window
	on:click={() => {
		if (dropdownOpen) dropdownOpen = false;
	}}
	on:keydown={(e) => {
		if (e.key === "Escape" && dropdownOpen) dropdownOpen = false;
	}}
/>

<div id="archive-panel" class="card-base px-8 py-6">
	{#each groups as group}
		<div>
			<div class="flex flex-row w-full items-center h-[3.75rem]">
				<div
					class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75"
				>
					{group.year}
				</div>
				<div class="w-[15%] md:w-[10%]">
					<div
						class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                  -outline-offset-[2px] z-50 outline-3"
					></div>
				</div>
				<div class="w-[70%] md:w-[80%] transition text-left text-50">
					{group.posts.length}
					{i18n(
						group.posts.length === 1
							? I18nKey.postCount
							: I18nKey.postsCount,
					)}
				</div>
			</div>

			{#each group.posts as post}
				<a
					href={post.url || `/posts/${post.id}/`}
					aria-label={post.data.title}
					class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
				>
					<div
						class="flex flex-row justify-start items-center h-full"
					>
						<!-- date -->
						<div
							class="w-[15%] md:w-[10%] transition text-sm text-right text-50"
						>
							{formatDate(post.data.published)}
						</div>

						<!-- dot and line -->
						<div
							class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center"
						>
							<div
								class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                       outline outline-4 z-50
                       outline-[var(--card-bg)]
                       group-hover:outline-[var(--btn-plain-bg-hover)]
                       group-active:outline-[var(--btn-plain-bg-active)]"
							></div>
						</div>

						<!-- post title -->
						<div
							class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                     group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                     text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
						>
							{post.data.title}
						</div>

						<!-- tag list -->
						<div
							class="hidden md:block md:w-[15%] text-left text-sm transition
                     whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
						>
							{formatTag(post.data.tags)}
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/each}

	{#if totalPages > 1 || totalPosts > 0}
		<div class="flex flex-col items-center gap-2 mt-8">
			{#if totalPages > 1}
				<div class="flex flex-row gap-3 justify-center">
					<!-- 上一页 -->
					<button
						type="button"
						on:click={() => gotoPage(currentPage - 1)}
						disabled={currentPage <= 1}
						aria-label="上一页"
						class="btn-card overflow-hidden rounded-lg text-[var(--primary)] w-11 h-11
                           disabled:opacity-40 disabled:pointer-events-none"
					>
						<span class="text-[1.75rem] leading-none">‹</span>
					</button>

					<div class="bg-[var(--card-bg)] flex flex-row rounded-lg items-center
                          text-neutral-700 dark:text-neutral-300 font-bold">
						{#each buildPageList() as p}
							{#if p === HIDDEN}
								<span class="mx-1 opacity-60">…</span>
							{:else if p === currentPage}
								<div
									class="h-11 w-11 rounded-lg bg-[var(--primary)] flex items-center justify-center
                               font-bold text-white dark:text-black/70"
								>
									{p}
								</div>
							{:else}
								<button
									type="button"
									on:click={() => gotoPage(p)}
									aria-label={`第 ${p} 页`}
									class="btn-card w-11 h-11 rounded-lg overflow-hidden active:scale-[0.85]"
								>
									{p}
								</button>
							{/if}
						{/each}
					</div>

					<!-- 下一页 -->
					<button
						type="button"
						on:click={() => gotoPage(currentPage + 1)}
						disabled={currentPage >= totalPages}
						aria-label="下一页"
						class="btn-card overflow-hidden rounded-lg text-[var(--primary)] w-11 h-11
                           disabled:opacity-40 disabled:pointer-events-none"
					>
						<span class="text-[1.75rem] leading-none">›</span>
					</button>
				</div>
			{/if}

			<!-- 页码信息 + 每页条数切换器 -->
			<div class="flex flex-row items-center gap-3 text-sm text-50">
				{#if totalPages > 1}
					<span>{currentPage} / {totalPages}（共 {totalPosts} 篇）</span>
				{:else}
					<span>共 {totalPosts} 篇</span>
				{/if}

				<span class="opacity-30">·</span>

				<span>每页</span>

			<!-- 弹出式每页条数切换器 -->
			<div class="relative">
				<!-- 触发按钮 -->
				<button
					type="button"
					on:click|stopPropagation={() => (dropdownOpen = !dropdownOpen)}
					aria-label="选择每页条数"
					aria-expanded={dropdownOpen}
					aria-haspopup="menu"
					class="flex flex-row items-center gap-1 px-2 h-7 rounded-md bg-[var(--card-bg)]
                           text-xs font-bold text-50 hover:bg-[var(--btn-plain-bg-hover)] transition"
				>
					<span>{currentPageSize}</span>
					<!-- 倒三角箭头 -->
					<svg
						viewBox="0 0 24 24"
						class="w-3 h-3 fill-current"
						style="transition: transform 0.15s linear; transform: rotate({dropdownOpen ? 180 : 0}deg);"
						aria-hidden="true"
					>
						<path d="M7 10l5 5 5-5z" />
					</svg>
				</button>

				<!-- 弹出列表（向上浮层弹出，不占用布局，线性动画） -->
				{#if dropdownOpen}
					<div
						class="page-size-panel absolute bottom-full left-0 mb-1 z-50 min-w-[5rem] p-1
                               rounded-lg bg-[var(--float-panel-bg)] shadow-xl dark:shadow-none
                               border border-black/5 dark:border-white/10"
						role="menu"
						on:click|stopPropagation={() => {}}
					>
						<div class="flex flex-col gap-1">
							{#each PAGE_SIZE_OPTIONS as size}
								<button
									type="button"
									role="menuitem"
									on:click={() => { changePageSize(size); dropdownOpen = false; }}
									aria-label={`每页 ${size} 篇`}
									class={`flex flex-row items-center justify-between gap-2 px-2 h-7 rounded-md text-xs transition ${
										size === currentPageSize
											? "bg-[var(--primary)] text-white dark:text-black/70 font-bold"
											: "text-50 hover:bg-[var(--btn-plain-bg-hover)]"
									}`}
								>
									<span>{size}</span>
									{#if size === currentPageSize}
										<svg viewBox="0 0 24 24" class="w-3 h-3 fill-current" aria-hidden="true">
											<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
										</svg>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* 每页条数弹出列表：向上展开，线性时序动画 */
	.page-size-panel {
		transform-origin: bottom left;
		animation: page-size-panel-in 0.15s linear;
		/* 提示合成器提升为独立图层，避免动画期间重排重绘 */
		will-change: transform, opacity;
	}
	@keyframes page-size-panel-in {
		from {
			opacity: 0;
			transform: translateY(0.375rem) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
