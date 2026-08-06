# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 项目事实与命令

- 包管理器：**pnpm**（`preinstall` 通过 `npx only-allow pnpm` 强制，禁用 npm/yarn）；Node 要求 **22**（`.node-version`，CI 同版本）。
- 验证命令（提交前按需运行）：
  - `pnpm lint` - Biome 检查并自动修复 `src/`、`scripts/`（CI 用只读的 `pnpm lint:ci`）。
  - `pnpm check:important` - 检查 `src/` 样式文件禁止新增 `!important`（存量记录在 `scripts/check-important.baseline.json`，twikoo 文件豁免）；CI 的 biome 作业中同样执行。
  - `pnpm type-check` - `tsc --noEmit` 类型检查。⚠ CI 的 typecheck 作业执行的是 `pnpm astro check`（含 `.astro` 文件的类型检查），检查面比本地 `tsc --noEmit` 更广，本地通过不保证 CI 通过；涉及 `.astro` 文件的类型改动建议本地补跑 `pnpm check`。
  - `pnpm test` - `node --test` 运行 `tests/**/*.test.*`。
  - `pnpm verify` - 聚合入口：依次执行 `pnpm lint:ci` → `pnpm check:important` → `pnpm type-check` → `pnpm test`（不含 build，任一失败即退出非零）。与 `lint.yml` 门禁的差异：CI 用 `astro check` 替代 `tsc --noEmit`，且 CI 另有 build 作业。
  - `pnpm build` - 完整构建（番剧数据 → keystatic 同步 → astro build → pagefind → 字体压缩）；执行前 `prebuild` 钩子会先跑 `sync-content` + `sync-keystatic`（受 `ENABLE_CONTENT_SYNC` 控制，为 `false` 时跳过同步、沿用本地数据）。⚠ 修改 package.json 构建链（`prebuild`/`build` 脚本）时，必须同步核对 `.github/workflows/deploy.yml` 的构建段与 `lint.yml` 的 build 作业（三处均应保持同一条 `pnpm build`，仅 env 不同）。
- 本地启动/预览：
  - `pnpm dev` - 自定义脚本 `scripts/start-dev.mjs`：并行启动 keystatic 同步监听（`sync-keystatic.mjs --watch`）与 Astro dev server（端口 4321）；`predev` 钩子会先跑一次 `sync-content`。
  - `pnpm preview` - `astro preview`，预览 `pnpm build` 产出的 `dist/`。
- 环境开关：
  - `ENABLE_CONTENT_SYNC=false` - 跳过外部内容仓库同步，使用本地内容（CI 中即如此设置）。
  - `DEPLOY_TARGET=pages` - 纯静态构建（去掉 SSR adapter / keystatic 管理后台），用于 GitHub Pages。

## 分支与发布约定

- **每次推送 `master` 都会触发部署**：`deploy.yml` 在 push 到 `master` 时先跑质量门禁（复用 `lint.yml`：biome / typecheck / 单测 / 构建），门禁通过后构建并发布到 `pages` 分支。门禁失败则部署被跳过，但 `master` 上仍会留下失败提交。
- **可直推 `master` 的改动**：内容/数据更新（`src/content/`、`src/data/`）、文档（`docs/`、README、AGENTS.md）、样式微调等低风险改动，前提是本地已按需跑过验证命令。
- **发布失败的回滚步骤**（在 `master` 上执行）：
  1. `git revert <坏提交>`（多个提交用 `git revert <老提交>^..<新提交>`），不要用 force push 重写历史。
  2. `git push origin master` —— 推送 revert 提交会重新触发 `deploy.yml`，用回滚后的代码重新部署。
  3. 若需紧急重发上一版，也可在 GitHub Actions 中对 `deploy.yml` 手动 `workflow_dispatch`（仅重跑当前 `master` 内容）。
- 配置 GitHub 分支保护属外部写操作，需另行授权后再执行，不在本文档约定范围内。

## 1. Think Before Coding

State assumptions explicitly; if multiple interpretations exist, present them instead of picking silently. If something is unclear, stop and ask before implementing.

## 2. Simplicity First

Minimum code that solves the problem — no speculative features, abstractions, or configurability beyond what was asked.

## 3. Surgical Changes

Touch only what the request requires; match existing style and don't refactor or "improve" adjacent code. Remove only orphans created by your own changes.

## 4. Goal-Driven Execution

Define verifiable success criteria before starting (e.g., a failing test that the fix makes pass), then verify with the project commands above — `pnpm verify`, or individually `pnpm lint` / `pnpm type-check` / `pnpm test` — before committing.

## 5. Security Baseline

**Never commit keys or sensitive credentials to the repository.**

- All API keys, tokens, passwords, private keys, database connection strings, and similar secrets **must** be managed via environment variables or `.env` files.
- Ensure `.env` is added to `.gitignore`.
- **If any sensitive information needs to be included in the code to function, you must ask me first before committing. Do not decide on your own.**
- If you discover sensitive data that has already been committed, immediately alert me so I can rotate the key and clean up the Git history.

## 6. Project-Specific Conventions (docs/rule/)

**Before writing or refactoring project code, follow the conventions in [`docs/rule/`](./docs/rule/README.md).** These are Mizuki-specific and take precedence over generic habits.

- [Component architecture](./docs/rule/01-component-architecture.md) - layering (atoms/molecules/organisms), naming, code organization.
- [Component split guide](./docs/rule/02-component-split-guide.md) - when and how to split oversized components.
- [File organization](./docs/rule/03-file-organization-architecture.md) - directory structure, file naming, module boundaries.
- [CSS style guide](./docs/rule/04-css-style-guide.md) - no `!important` (except Twikoo), use CSS variables / Tailwind, dark-theme rules.
- [Atom component usage](./docs/rule/05-atom-component-usage.md) - prefer existing `atoms/` and `misc/` components; extract when UI repeats.
- [Sidebar widget dev](./docs/rule/06-sidebar-widget-dev.md) - the 3 required steps to register a sidebar widget (componentMap is easy to miss).
- [Icon usage](./docs/rule/07-icon-usage-specification.md) - the 3 standard Iconify usages; never use raw `<iconify-icon>` in business code.

See the [code review checklist](./docs/rule/README.md#代码审查检查清单) in the README before submitting changes.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.