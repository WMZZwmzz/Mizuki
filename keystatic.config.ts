import { collection, config, fields, singleton } from "@keystatic/core";

// ===== 共享选项 =====

const LANG_OPTIONS = [
	{ label: "默认", value: "" },
	{ label: "中文", value: "zh" },
	{ label: "English", value: "en" },
	{ label: "日本語", value: "ja" },
] as const;

const POST_CATEGORIES = [
	{ label: "技术", value: "Technology" },
	{ label: "生活", value: "Life" },
	{ label: "教程", value: "Guides" },
	{ label: "示例", value: "Examples" },
	{ label: "随想", value: "Thoughts" },
] as const;

const PROJECT_CATEGORIES = [
	{ label: "Web", value: "web" },
	{ label: "移动端", value: "mobile" },
	{ label: "桌面端", value: "desktop" },
	{ label: "其他", value: "other" },
] as const;

const PROJECT_STATUS = [
	{ label: "已完成", value: "completed" },
	{ label: "进行中", value: "in-progress" },
	{ label: "计划中", value: "planned" },
] as const;

const SKILL_CATEGORIES = [
	{ label: "前端", value: "frontend" },
	{ label: "后端", value: "backend" },
	{ label: "数据库", value: "database" },
	{ label: "工具", value: "tools" },
	{ label: "其他", value: "other" },
] as const;

const SKILL_LEVELS = [
	{ label: "入门", value: "beginner" },
	{ label: "中级", value: "intermediate" },
	{ label: "高级", value: "advanced" },
	{ label: "专家", value: "expert" },
] as const;

const TIMELINE_TYPES = [
	{ label: "教育", value: "education" },
	{ label: "工作", value: "work" },
	{ label: "项目", value: "project" },
	{ label: "成就", value: "achievement" },
] as const;

// ===== 配置 =====

export default config({
	storage:
		process.env.NODE_ENV === "production"
			? {
					kind: "github",
					repo: {
						owner: process.env.KEYSTATIC_REPO_OWNER || "",
						name: process.env.KEYSTATIC_REPO_NAME || "",
					},
				}
			: { kind: "local" },

	collections: {
		// ===== 文章 =====
		posts: collection({
			label: "文章",
			slugField: "title",
			path: "src/data/keystatic/posts/*",
			format: { data: "json" },
			entryLayout: "content",
			columns: ["title", "published", "draft"],
			schema: {
				title: fields.slug({
					name: { label: "标题", validation: { length: { min: 1 } } },
					slug: { label: "URL 别名", description: "留空自动生成" },
				}),
				description: fields.text({
					label: "摘要",
					multiline: true,
					description: "文章简介，显示在列表和 SEO 中",
				}),
				published: fields.date({ label: "发布日期", validation: { isRequired: true } }),
				updated: fields.date({ label: "更新日期", description: "内容最后修改时间" }),
				draft: fields.checkbox({ label: "草稿", defaultValue: false }),
				pinned: fields.checkbox({ label: "置顶", defaultValue: false }),
				tags: fields.array(fields.text({ label: "标签名", validation: { length: { min: 1 } } }), {
					label: "标签",
					itemLabel: (props) => props.fields.title.value,
				}),
				category: fields.select({ label: "分类", options: POST_CATEGORIES, defaultValue: "Technology" }),
				image: fields.text({ label: "封面图片", description: "封面图片路径或 URL" }),
				comment: fields.checkbox({ label: "允许评论", defaultValue: true }),
				hideHomeContent: fields.checkbox({ label: "首页隐藏内容", defaultValue: false }),
				lang: fields.select({ label: "语言", options: LANG_OPTIONS, defaultValue: "" }),
				author: fields.text({ label: "作者" }),
				sourceLink: fields.url({ label: "原文链接" }),
				licenseName: fields.text({ label: "授权名称" }),
				licenseUrl: fields.url({ label: "授权链接" }),
				encrypted: fields.checkbox({ label: "启用加密", defaultValue: false }),
				password: fields.text({ label: "密码" }),
				passwordHint: fields.text({ label: "密码提示" }),
				alias: fields.text({ label: "别名路径" }),
				content: fields.text({ label: "正文（Markdown）", multiline: true }),
			},
		}),

		// ===== 页面 =====
		pages: collection({
			label: "页面",
			slugField: "title",
			path: "src/data/keystatic/pages/*",
			format: { data: "json" },
			entryLayout: "content",
			schema: {
				title: fields.slug({
					name: { label: "页面标题", validation: { length: { min: 1 } } },
				}),
				content: fields.text({ label: "正文（Markdown）", multiline: true }),
			},
		}),

		// ===== 日记/动态 =====
		diary: collection({
			label: "日记",
			slugField: "title",
			path: "src/data/keystatic/diary/*",
			format: { data: "json" },
			columns: ["title", "date", "mood"],
			schema: {
				title: fields.slug({
					name: { label: "标题", description: "简短标题（用于文件名）", validation: { length: { min: 1 } } },
				}),
				id: fields.integer({ label: "ID", description: "唯一数字编号（如 1, 2, 3...）", validation: { min: 1 } }),
				content: fields.text({ label: "内容", multiline: true, validation: { length: { min: 1 } } }),
				date: fields.datetime({ label: "日期时间", validation: { isRequired: true } }),
				location: fields.text({ label: "地点" }),
				mood: fields.text({ label: "心情", description: "如：开心、平静、兴奋..." }),
				tags: fields.array(fields.text({ label: "标签名" }), {
					label: "标签",
					itemLabel: (props) => props.fields.title.value,
				}),
				images: fields.array(fields.text({ label: "图片 URL" }), {
					label: "图片",
					itemLabel: (props) => props.fields.title.value,
				}),
			},
		}),

		// ===== 友人链接 =====
		friends: collection({
			label: "友人链接",
			slugField: "title",
			path: "src/data/keystatic/friends/*",
			format: { data: "json" },
			columns: ["title", "siteurl"],
			schema: {
				title: fields.slug({
					name: { label: "站点名称", validation: { length: { min: 1 } } },
				}),
				id: fields.integer({ label: "ID", description: "唯一数字编号", validation: { min: 1 } }),
				imgurl: fields.text({ label: "头像 URL", validation: { length: { min: 1 } } }),
				desc: fields.text({ label: "描述", multiline: true }),
				siteurl: fields.url({ label: "网站地址", validation: { isRequired: true } }),
				tags: fields.array(fields.text({ label: "标签名" }), {
					label: "标签",
					itemLabel: (props) => props.fields.title.value,
				}),
			},
		}),

		// ===== 项目 =====
		projects: collection({
			label: "项目",
			slugField: "title",
			path: "src/data/keystatic/projects/*",
			format: { data: "json" },
			columns: ["title", "category", "status"],
			schema: {
				title: fields.slug({
					name: { label: "项目名称", validation: { length: { min: 1 } } },
				}),
				description: fields.text({ label: "描述", multiline: true }),
				image: fields.text({ label: "封面图片 URL" }),
				category: fields.select({ label: "分类", options: PROJECT_CATEGORIES, defaultValue: "web" }),
				techStack: fields.array(fields.text({ label: "技术名称" }), {
					label: "技术栈",
					itemLabel: (props) => props.fields.title.value,
				}),
				status: fields.select({ label: "状态", options: PROJECT_STATUS, defaultValue: "completed" }),
				liveDemo: fields.url({ label: "在线演示" }),
				sourceCode: fields.url({ label: "源代码" }),
				visitUrl: fields.url({ label: "访问链接" }),
				startDate: fields.date({ label: "开始日期", validation: { isRequired: true } }),
				endDate: fields.date({ label: "结束日期" }),
				featured: fields.checkbox({ label: "精选项目", defaultValue: false }),
				tags: fields.array(fields.text({ label: "标签名" }), {
					label: "标签",
					itemLabel: (props) => props.fields.title.value,
				}),
				showImage: fields.checkbox({ label: "显示封面图", defaultValue: true }),
			},
		}),

		// ===== 技能 =====
		skills: collection({
			label: "技能",
			slugField: "name",
			path: "src/data/keystatic/skills/*",
			format: { data: "json" },
			columns: ["name", "category", "level"],
			schema: {
				name: fields.slug({
					name: { label: "技能名称", validation: { length: { min: 1 } } },
					slug: { label: "ID（英文）", description: "用于 URL 和内部引用" },
				}),
				description: fields.text({ label: "描述", multiline: true }),
				icon: fields.text({ label: "图标", description: "Iconify 图标名，如 simple-icons:typescript" }),
				category: fields.select({ label: "分类", options: SKILL_CATEGORIES, defaultValue: "frontend" }),
				level: fields.select({ label: "水平", options: SKILL_LEVELS, defaultValue: "intermediate" }),
				years: fields.integer({ label: "经验年数", defaultValue: 0, validation: { min: 0 } }),
				months: fields.integer({ label: "经验月数", defaultValue: 0, validation: { min: 0, max: 11 } }),
				projects: fields.array(fields.text({ label: "项目 ID" }), {
					label: "关联项目",
					itemLabel: (props) => props.fields.title.value,
				}),
				certifications: fields.array(fields.text({ label: "证书名称" }), {
					label: "证书",
					itemLabel: (props) => props.fields.title.value,
				}),
				color: fields.text({ label: "主题色", description: "卡片主题色，如 #3178C6" }),
			},
		}),

		// ===== 时间线 =====
		timeline: collection({
			label: "时间线",
			slugField: "title",
			path: "src/data/keystatic/timeline/*",
			format: { data: "json" },
			columns: ["title", "type", "startDate"],
			schema: {
				title: fields.slug({
					name: { label: "标题", validation: { length: { min: 1 } } },
					slug: { label: "ID（英文）", description: "唯一标识符" },
				}),
				description: fields.text({ label: "描述", multiline: true }),
				type: fields.select({ label: "类型", options: TIMELINE_TYPES, defaultValue: "education" }),
				startDate: fields.date({ label: "开始日期", validation: { isRequired: true } }),
				endDate: fields.date({ label: "结束日期" }),
				location: fields.text({ label: "地点" }),
				organization: fields.text({ label: "组织/机构" }),
				position: fields.text({ label: "职位/角色" }),
				skills: fields.array(fields.text({ label: "技能名称" }), {
					label: "相关技能",
					itemLabel: (props) => props.fields.title.value,
				}),
				achievements: fields.array(fields.text({ label: "成就描述" }), {
					label: "成就",
					itemLabel: (props) => props.fields.title.value,
				}),
				icon: fields.text({ label: "图标", description: "Iconify 图标名" }),
				color: fields.text({ label: "主题色" }),
				featured: fields.checkbox({ label: "精选事件", defaultValue: false }),
			},
		}),
		// ===== 相册 =====
		albums: collection({
			label: "相册",
			slugField: "title",
			path: "public/images/albums/*",
			format: { data: "json" },
			columns: ["title", "date", "location"],
			schema: {
				title: fields.slug({
					name: { label: "相册名称", validation: { length: { min: 1 } } },
					slug: { label: "文件夹名", description: "英文标识，用作文件夹名" },
				}),
				description: fields.text({ label: "描述", multiline: true }),
				date: fields.date({ label: "日期", validation: { isRequired: true } }),
				location: fields.text({ label: "地点" }),
				tags: fields.array(fields.text({ label: "标签名" }), {
					label: "标签",
					itemLabel: (props) => props.fields.title.value,
				}),
				mode: fields.select({
					label: "图片模式",
					options: [
						{ label: "本地图片", value: "local" },
						{ label: "外链图片", value: "external" },
					],
					defaultValue: "local",
				}),
				cover: fields.text({ label: "封面图 URL", description: "外链模式必填" }),
				hidden: fields.checkbox({ label: "隐藏相册", defaultValue: false }),
				password: fields.text({ label: "访问密码", description: "留空不加密" }),
				passwordHint: fields.text({ label: "密码提示" }),
			},
		}),
		// ===== 设备 =====
		devices: collection({
			label: "设备",
			slugField: "name",
			path: "src/data/keystatic/devices/*",
			format: { data: "json" },
			columns: ["name", "category", "specs"],
			schema: {
				name: fields.slug({
					name: { label: "设备名称", validation: { length: { min: 1 } } },
				}),
				category: fields.text({ label: "品牌/分类", description: "如 OnePlus、Router、Apple", validation: { length: { min: 1 } } }),
				image: fields.text({ label: "图片路径", description: "如 /images/device/xxx.webp" }),
				specs: fields.text({ label: "规格", description: "如 Gray / 16G + 1TB" }),
				description: fields.text({ label: "描述", multiline: true }),
				link: fields.url({ label: "购买链接" }),
			},
		}),
	},

	// ===== 站点设置 =====
	singletons: {
		siteSettings: singleton({
			label: "站点设置",
			path: "src/data/keystatic/site-settings",
			format: { data: "json" },
			schema: {
				title: fields.text({ label: "站点标题", validation: { length: { min: 1 } } }),
				subtitle: fields.text({ label: "副标题" }),
				siteURL: fields.url({ label: "站点 URL" }),
				siteLang: fields.select({
					label: "语言",
					options: [
						{ label: "中文", value: "zh_CN" },
						{ label: "English", value: "en_US" },
						{ label: "日本語", value: "ja_JP" },
					],
					defaultValue: "zh_CN",
				}),
				themeHue: fields.integer({ label: "主题色相", description: "色相值 0-360", defaultValue: 240, validation: { min: 0, max: 360 } }),
				themeFixed: fields.checkbox({ label: "固定主题色", description: "开启后不允许切换", defaultValue: false }),
				pageAnime: fields.checkbox({ label: "追番页面", defaultValue: true }),
				pageDiary: fields.checkbox({ label: "日记页面", defaultValue: true }),
				pageFriends: fields.checkbox({ label: "友链页面", defaultValue: false }),
				pageProjects: fields.checkbox({ label: "项目页面", defaultValue: true }),
				pageSkills: fields.checkbox({ label: "技能页面", defaultValue: true }),
				pageTimeline: fields.checkbox({ label: "时间线页面", defaultValue: true }),
				pageAlbums: fields.checkbox({ label: "相册页面", defaultValue: true }),
				pageDevices: fields.checkbox({ label: "设备页面", defaultValue: false }),
				navbarTitleText: fields.text({ label: "导航栏标题文字" }),
				navbarTitleIcon: fields.text({ label: "导航栏图标路径" }),
				diaryApiUrl: fields.url({ label: "日记 API URL", description: "Memos API 地址，留空使用静态数据" }),
			},
		}),

		// ===== 个人档案 =====
		profile: singleton({
			label: "个人档案",
			path: "src/data/keystatic/profile",
			format: { data: "json" },
			schema: {
				avatar: fields.text({ label: "头像路径", description: "如 assets/images/avatar.webp" }),
				name: fields.text({ label: "显示名称", validation: { length: { min: 1 } } }),
				bio: fields.text({ label: "个人简介", multiline: true }),
				links: fields.array(
					fields.object({
						name: fields.text({ label: "平台名称", validation: { length: { min: 1 } } }),
						url: fields.url({ label: "链接地址", validation: { isRequired: true } }),
						icon: fields.text({ label: "图标", description: "Iconify 图标名，如 simple-icons:github" }),
					}),
					{
						label: "社交链接",
						itemLabel: (props) => props.fields.name.value,
					},
				),
			},
		}),

		// ===== 公告栏 =====
		announcement: singleton({
			label: "公告栏",
			path: "src/data/keystatic/announcement",
			format: { data: "json" },
			schema: {
				content: fields.text({ label: "公告内容", multiline: true, validation: { length: { min: 1 } } }),
				title: fields.text({ label: "标题（可选）", description: "留空使用默认文字" }),
				icon: fields.text({ label: "图标", description: "Iconify 图标名" }),
				type: fields.select({
					label: "类型",
					options: [
						{ label: "信息", value: "info" },
						{ label: "警告", value: "warning" },
						{ label: "成功", value: "success" },
						{ label: "错误", value: "error" },
					],
					defaultValue: "info",
				}),
				closable: fields.checkbox({ label: "允许关闭", defaultValue: true }),
				linkEnable: fields.checkbox({ label: "显示链接", defaultValue: false }),
				linkText: fields.text({ label: "链接文字" }),
				linkUrl: fields.url({ label: "链接地址" }),
				linkExternal: fields.checkbox({ label: "外部链接", defaultValue: false }),
			},
		}),

		// ===== 首页横幅 =====
		homepage: singleton({
			label: "首页设置",
			path: "src/data/keystatic/homepage",
			format: { data: "json" },
			schema: {
				homeTitle: fields.text({ label: "首页大标题", defaultValue: "わたしの部屋" }),
				subtitle1: fields.text({ label: "副标题 1" }),
				subtitle2: fields.text({ label: "副标题 2" }),
				subtitle3: fields.text({ label: "副标题 3" }),
				subtitle4: fields.text({ label: "副标题 4" }),
				subtitle5: fields.text({ label: "副标题 5" }),
				typewriterEnable: fields.checkbox({ label: "打字机效果", defaultValue: true }),
				typewriterSpeed: fields.integer({ label: "打字速度(ms)", defaultValue: 100, validation: { min: 20, max: 500 } }),
				carouselEnable: fields.checkbox({ label: "横幅轮播", defaultValue: true }),
				carouselInterval: fields.integer({ label: "轮播间隔(秒)", defaultValue: 3, validation: { min: 1, max: 30 } }),
				wavesEnable: fields.checkbox({ label: "波浪效果", defaultValue: true }),
			},
		}),

		// ===== 特效设置 =====
		effects: singleton({
			label: "特效设置",
			path: "src/data/keystatic/effects",
			format: { data: "json" },
			schema: {
				sakuraEnable: fields.checkbox({ label: "樱花特效", defaultValue: false }),
				sakuraSwitchable: fields.checkbox({ label: "允许用户切换", defaultValue: true }),
				sakuraNum: fields.integer({ label: "樱花数量", defaultValue: 21, validation: { min: 1, max: 100 } }),
				pioEnable: fields.checkbox({ label: "看板娘", defaultValue: true }),
				pioPosition: fields.select({
					label: "看板娘位置",
					options: [{ label: "左下", value: "left" }, { label: "右下", value: "right" }],
					defaultValue: "left",
				}),
				pioHiddenOnMobile: fields.checkbox({ label: "移动端隐藏", defaultValue: true }),
				pioDraggable: fields.checkbox({ label: "可拖拽", defaultValue: true }),
				pioWelcome: fields.text({ label: "欢迎语", defaultValue: "嗨~ 欢迎来到 Mizuki 博客！" }),
				pioTouchDialog: fields.text({ label: "触摸对话（每行一条）", multiline: true }),
			},
		}),

		// ===== 导航栏 =====
		navLinks: singleton({
			label: "导航栏",
			path: "src/data/keystatic/nav-links",
			format: { data: "json" },
			schema: {
				linksJson: fields.text({
					label: "导航链接 JSON",
					multiline: true,
					description: '格式: [{"name":"首页","url":"/","preset":"home"},{"name":"归档","url":"/archive/","preset":"archive"},{"name":"分组","children":[{"name":"GitHub","url":"https://github.com","icon":"simple-icons:github","external":true}]}]',
				}),
			},
		}),

		// ===== 评论系统 =====
		comments: singleton({
			label: "评论系统",
			path: "src/data/keystatic/comments",
			format: { data: "json" },
			schema: {
				enable: fields.checkbox({ label: "启用评论", defaultValue: false }),
				system: fields.select({
					label: "评论系统",
					options: [{ label: "Twikoo", value: "twikoo" }, { label: "Giscus", value: "giscus" }],
					defaultValue: "twikoo",
				}),
				twikooEnvId: fields.text({ label: "Twikoo 环境 ID", description: "如 https://twikoo.vercel.app" }),
				giscusRepo: fields.text({ label: "Giscus 仓库", description: "如 username/repo-name" }),
				giscusRepoId: fields.text({ label: "Giscus 仓库 ID" }),
				giscusCategory: fields.text({ label: "Giscus 分类", defaultValue: "Announcements" }),
				giscusCategoryId: fields.text({ label: "Giscus 分类 ID" }),
			},
		}),

		// ===== 音乐播放器 =====
		music: singleton({
			label: "音乐播放器",
			path: "src/data/keystatic/music",
			format: { data: "json" },
			schema: {
				enable: fields.checkbox({ label: "启用播放器", defaultValue: true }),
				showFloating: fields.checkbox({ label: "悬浮播放器", defaultValue: true }),
				mode: fields.select({
					label: "模式",
					options: [{ label: "Meting API", value: "meting" }, { label: "本地", value: "local" }],
					defaultValue: "local",
				}),
				metingApi: fields.text({ label: "Meting API 地址" }),
				playlistId: fields.text({ label: "歌单 ID" }),
				server: fields.select({
					label: "音乐源",
					options: [
						{ label: "网易云音乐", value: "netease" },
						{ label: "QQ 音乐", value: "tencent" },
						{ label: "酷狗音乐", value: "kugou" },
					],
					defaultValue: "netease",
				}),
			},
		}),

		// ===== 许可证 =====
		license: singleton({
			label: "文章版权",
			path: "src/data/keystatic/license",
			format: { data: "json" },
			schema: {
				enable: fields.checkbox({ label: "显示版权信息", defaultValue: true }),
				name: fields.text({ label: "许可证名称", defaultValue: "CC BY-NC-SA 4.0" }),
				url: fields.url({ label: "许可证链接" }),
			},
		}),
	},
});
