#!/usr/bin/env bash
# ============================================================
# Mizuki dev-and-push
# 一键启动本地 keystatic 后台,改完按 Ctrl+C 自动同步+提交+推送
#
# 用法:
#   bash scripts/dev-and-push.sh                # 默认提交信息
#   bash scripts/dev-and-push.sh "我的更新说明"  # 自定义提交信息
#   bash scripts/dev-and-push.sh --verify       # 推送后轮询 pages 分支确认部署
#   bash scripts/dev-and-push.sh "说明" --verify # 两者结合
#
# 流程:
#   1. 启动 dev server(keystatic watch + astro dev,端口 4321)
#   2. 自动打开浏览器到 /keystatic 后台
#   3. 你在后台改完所有内容后按 Ctrl+C
#   4. 脚本重新 sync keystatic → ts,展示改动,确认后 commit + push
#   5. (可选)轮询 pages 分支 SHA 确认部署成功
# ============================================================
set -u
export MSYS_NO_PATHCONV=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR" || { echo "✗ 无法进入仓库目录 $REPO_DIR"; exit 1; }

# ── 解析参数 ──
COMMIT_MSG=""
VERIFY=0
for arg in "$@"; do
	case "$arg" in
		--verify|-v) VERIFY=1 ;;
		*) COMMIT_MSG="$arg" ;;
	esac
done

DONE=0
BROWSER_PID=""

# ── 退出时(含 Ctrl+C)执行的同步+推送流程 ──
on_exit() {
	[ "$DONE" = "1" ] && return 0
	DONE=1

	# 关掉后台浏览器探测子进程
	[ -n "$BROWSER_PID" ] && kill "$BROWSER_PID" 2>/dev/null || true

	# 等 dev server / watch 完全退出,避免与 sync 抢写
	sleep 1

	echo ""
	echo "══════════════════════════════════════════════"
	echo " 后台已停止 — 开始同步并准备推送"
	echo "══════════════════════════════════════════════"

	echo "[1/4] 同步 keystatic 数据 ..."
	if node scripts/sync-keystatic.mjs >/dev/null 2>&1; then
		echo "      ✓ 同步完成"
	else
		echo "      ⚠ 同步有警告(通常无影响)"
	fi

	# 仅看 src/ 下的改动(排除 AGENTS.md 等根目录文件)
	CHANGES="$(git status --short -- src/)"
	if [ -z "$CHANGES" ]; then
		echo "[2/4] 没有检测到内容改动,无需提交。再见 👋"
		return 0
	fi

	echo "[2/4] 检测到改动:"
	printf '%s\n' "$CHANGES" | sed 's/^/      /'

	# 默认提交信息
	if [ -z "$COMMIT_MSG" ]; then
		COMMIT_MSG="chore(content): 通过 keystatic 后台更新内容"
	fi

	echo "[3/4] 即将 commit + push 到 origin/master(会触发 GitHub Pages 部署)"
	echo "      提交信息: $COMMIT_MSG"
	ans=""
	read -r -p "      确认推送? [Y/n] " ans </dev/tty
	case "$ans" in
		n|N)
			echo "      已取消。改动保留在工作区(未提交)。"
			return 0
			;;
	esac

	# 只暂存 src/ 下的内容改动(keystatic json/ts + content),不碰根目录其他文件
	git add src/
	if ! git commit -m "$COMMIT_MSG" >/dev/null 2>&1; then
		echo "      ✗ commit 失败(可能没有可提交的改动)"
		return 1
	fi
	echo "      ✓ 已提交"

	# 推送前先记下 pages 分支 SHA,供 verify 用
	BEFORE_SHA="$(git ls-remote origin pages 2>/dev/null | awk '{print $1}')"

	echo "[4/4] 推送到 origin/master ..."
	git push origin master
	PUSH_RC=$?
	if [ "$PUSH_RC" != "0" ]; then
		echo "      ✗ push 失败(rc=$PUSH_RC)。改动已提交到本地,稍后可手动 git push。"
		return 1
	fi
	echo "      ✓ 已推送至 GitHub"

	if [ "$VERIFY" = "1" ]; then
		echo ""
		echo "── 验证部署:轮询 pages 分支 SHA(最多 ~7min)──"
		if [ -z "$BEFORE_SHA" ]; then
			echo "   ⚠ 未能获取推送前 SHA,跳过验证"
			return 0
		fi
		echo "   before: $BEFORE_SHA"
		for i in $(seq 1 14); do
			sleep 30
			NOW="$(git ls-remote origin pages 2>/dev/null | awk '{print $1}')"
			echo "   [$i] pages=${NOW:-<none>}"
			if [ -n "$NOW" ] && [ "$NOW" != "$BEFORE_SHA" ]; then
				echo "   ✅ pages 已更新 → $NOW  部署成功!"
				return 0
			fi
		done
		echo "   ⚠ pages SHA 超时未变化 — 可能是假绿勾。"
		echo "     重触发: git commit --allow-empty -m 'ci: re-trigger' && git push origin master"
	else
		echo ""
		echo "   提示:加 --verify 可自动确认部署;或之后对我说「推送验证」"
	fi
}
trap on_exit EXIT

# ── 启动 ──
echo "══════════════════════════════════════════════"
echo " Mizuki 本地后台启动中"
echo " 后台地址: http://localhost:4321/keystatic"
echo " 改完所有内容后按 Ctrl+C — 自动同步+提交+推送"
echo " (若 4321 被占用,astro 会改用 4322 等,看终端输出)"
echo "══════════════════════════════════════════════"
echo ""

# 端口占用预检(非阻塞,仅提示)
if curl -s -o /dev/null --max-time 1 "http://localhost:4321/" 2>/dev/null; then
	echo "⚠ 检测到 4321 已有服务在跑(可能是之前没关干净的 dev server)。"
	echo "  astro 会改用其他端口,浏览器自动打开可能开到旧后台;"
	echo "  如遇异常,先关掉旧 node 进程再重试。"
	echo ""
fi

# 后台:等服务起来后自动打开浏览器到 /keystatic(最多等 20s)
(
	for i in $(seq 1 20); do
		if curl -s -o /dev/null --max-time 1 "http://localhost:4321/" 2>/dev/null; then
			cmd.exe /c start "" "http://localhost:4321/keystatic" 2>/dev/null
			break
		fi
		sleep 1
	done
) &
BROWSER_PID=$!

# 前台启动 dev server(阻塞;Ctrl+C 退出后触发 on_exit)
node scripts/start-dev.mjs
