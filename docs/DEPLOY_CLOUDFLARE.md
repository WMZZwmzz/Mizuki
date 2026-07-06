# Cloudflare Pages 部署指南

本指南针对 Mizuki 博客部署到 Cloudflare Pages 的完整步骤。
项目已内置 `DEPLOY_TARGET=pages` 静态构建开关与 `public/_headers` 配置，开箱即用。

---

## 前置条件

- 一个 Cloudflare 账号（免费即可）：https://dash.cloudflare.com
- 代码已托管在 GitHub：`WMZZwmzz/Mizuki`（分支 `master`）
- 本地构建已验证通过（`DEPLOY_TARGET=pages pnpm build`）

---

## 关键约束（必读）

Cloudflare Pages 是**纯静态托管**，不能运行 Node 服务端进程。因此：

| 项 | Vercel（默认） | Cloudflare Pages |
|----|---------------|------------------|
| 构建模式 | SSR（带 node adapter） | **纯静态**（`DEPLOY_TARGET=pages`） |
| Keystatic 管理后台 | ✅ 可用（`/keystatic`） | ❌ 不可用（需 SSR） |
| 评论 / 搜索 / 番剧 | ✅ | ✅（均为前端静态功能） |

> Keystatic 后台（`/keystatic`）在 CF Pages 上不可用，因为它是 SSR 路由。
> 内容编辑请在本地 `pnpm dev` 完成，构建时会通过 `sync-keystatic.mjs` 同步到静态文件。
> 这是项目设计如此，非缺陷。

---

## 部署步骤

### 第 1 步：创建 Pages 项目

1. 登录 Cloudflare Dashboard → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权并选择 GitHub 仓库 `WMZZwmzz/Mizuki`
3. 分支选择 `master`

### 第 2 步：配置构建（关键）

在 "Set up builds and deployments" 页面填入：

| 配置项 | 值 |
|-------|---|
| **Framework preset** | `Astro` |
| **Build command** | `pnpm build` |
| **Build output directory** | `dist` |
| **Root directory** | （留空） |

### 第 3 步：配置环境变量（关键！）

点击 **Environment variables**，添加以下变量：

| 变量名 | 值 | 说明 |
|-------|---|------|
| `DEPLOY_TARGET` | `pages` | **必填**。触发纯静态构建，去掉 SSR adapter 和 keystatic 后台 |
| `NODE_VERSION` | `22` | 必填。项目要求 Node >= 22（已通过 `.node-version` 文件声明，但建议同时设环境变量保险） |

> 如果你使用了内容分离功能（`ENABLE_CONTENT_SYNC=true`），还需要添加 `CONTENT_REPO_URL`，并设置 `USE_SUBMODULE=false`（CF Pages 默认不支持 Git Submodule）。

### 第 4 步：部署

点击 **Save and Deploy**。首次构建约 3-6 分钟。

构建成功后，CF Pages 会分配一个 `*.pages.dev` 域名，例如：
`https://mizuki.pages.dev`

---

## 验证部署

部署完成后检查：

- [ ] 首页 `https://<你的项目>.pages.dev/` 能正常打开
- [ ] 文章页能访问（如 `/posts/xxx`）
- [ ] 搜索功能可用（Pagefind 索引已构建到 `dist/pagefind/`）
- [ ] RSS `/rss.xml` 和 `/atom.xml` 可访问
- [ ] sitemap `/sitemap-index.xml` 可访问

---

## 绑定自定义域名（可选）

1. Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 输入你的域名（如 `blog.example.com`）
3. 按提示添加 CNAME 记录指向 `<项目名>.pages.dev`
4. 等待 DNS 生效（通常几分钟到几小时）

绑定后，**记得更新 `siteURL`**：

编辑 `src/data/keystatic/site-settings.json`（或通过本地 `pnpm dev` → `/keystatic` 后台）：
```json
{
  "siteURL": "https://blog.example.com/"
}
```
然后提交推送，CF Pages 会自动重新构建。

> `siteURL` 影响 sitemap、RSS、OpenGraph、SEO 等所有绝对链接，务必与实际域名一致。

---

## 持续部署

配置完成后，每次推送到 `master` 分支，CF Pages 会自动触发构建部署。
也可以在 Pages 项目页手动点击 **Retry deployment** 触发。

---

## 常见问题

### Q: 构建报错 `Cannot find module '@astrojs/node'` 或 SSR 相关错误？
A: 环境变量 `DEPLOY_TARGET` 没设成 `pages`。确认它在 CF Pages 环境变量里已添加且值为 `pages`。

### Q: 构建成功但页面空白 / 404？
A: 检查 Build output directory 是否为 `dist`；检查 `dist/index.html` 是否存在。

### Q: `/keystatic` 后台打不开？
A: 正常。CF Pages 是静态托管，keystatic 后台需要 SSR，仅在 Vercel 或本地 `pnpm dev` 可用。

### Q: 字体压缩步骤（compress-fonts）很慢或失败？
A: 该步骤使用 `fontmin`（原生模块）。CF Pages 构建环境支持它。若失败，可临时在 package.json 把 `build` 脚本里的 `&& node scripts/compress-fonts/index.js` 去掉，字体子集优化非必需。

### Q: 番剧页面数据不更新？
A: 当前 `anime.mode = "local"`，构建时跳过 API 拉取。如需 bangumi/bilibili 模式，改 `src/config/siteConfig.ts` 的 `anime.mode`，bilibili 模式需配置 `BILI_SESSDATA` 环境变量。

---

## 配置文件说明

本项目为 CF Pages 准备的文件：

| 文件 | 作用 |
|------|------|
| `.node-version` | 声明 Node 22，CF Pages 自动识别 |
| `public/_headers` | CF Pages 自动读取，配置缓存策略与安全响应头 |
| `astro.config.mjs` | 通过 `DEPLOY_TARGET=pages` 切换静态构建（去掉 node adapter / keystatic） |

> `public/_headers` 会被 Astro 复制到 `dist/_headers`，CF Pages 部署时自动应用。
