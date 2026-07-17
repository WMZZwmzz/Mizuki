@echo off
if "%~1"=="__openbrowser__" goto :openbrowser

chcp 936 >nul 2>&1
setlocal enabledelayedexpansion
title Mizuki Dev ^& Push
cd /d "%~dp0"

rem ============ 解析参数 ============
set "COMMIT_MSG="
set "VERIFY=0"
for %%a in (%*) do (
	if /i "%%~a"=="--verify" ( set "VERIFY=1"
	) else if /i "%%~a"=="-v" ( set "VERIFY=1"
	) else ( set "COMMIT_MSG=%%~a"
	)
)
if not defined COMMIT_MSG set "COMMIT_MSG=chore(content): 通过 keystatic 后台更新内容"

echo ==================================================
echo   Mizuki Dev ^& Push
echo   后台地址: http://localhost:4321/keystatic
echo   改完所有内容后，关闭 "Mizuki Dev Server" 窗口
echo   （或在该窗口按 Ctrl+C），本窗口会自动 sync+commit+push
echo ==================================================
echo.

rem ============ 端口 4321 预检 ============
curl -s -o nul -m 1 http://localhost:4321/ >nul 2>&1
if not errorlevel 1 (
	echo [WARN] 4321 端口已有服务在跑（可能是之前没关干净的 dev server）
	echo        astro 会改用其他端口，浏览器自动打开可能开到旧后台
	echo        如遇异常，先关掉旧 node 进程再重试
	echo.
)

rem ============ 后台浏览器探测：服务起来后自动打开 /keystatic ============
start "mz-browser" /b "%~f0" __openbrowser__

rem ============ 前台阻塞启动 dev server（新窗口；关闭/Ctrl+C 即返回）============
echo 正在启动 Dev Server（新窗口）...
start "Mizuki Dev Server" /wait node scripts/start-dev.mjs

rem ============ Dev Server 已退出，开始清理流程 ============
echo.
echo ==================================================
echo   Dev Server 已停止 - 开始同步并准备推送
echo ==================================================

echo [1/4] 同步 keystatic 数据 ...
node scripts/sync-keystatic.mjs >nul 2>&1
if not errorlevel 1 (
	echo        [OK] 同步完成
) else (
	echo        [WARN] 同步有警告（通常无影响）
)

rem ============ [2/4] 检查 src/ 改动 ============
set "CHANGES_FILE=%temp%\mz_changes.txt"
git status --short -- src/ > "%CHANGES_FILE%" 2>&1
set "CHANGES_SIZE=0"
for %%F in ("%CHANGES_FILE%") do set "CHANGES_SIZE=%%~zF"
if "%CHANGES_SIZE%"=="0" (
	echo [2/4] 没有检测到内容改动，无需提交。再见
	goto :end
)

echo [2/4] 检测到改动:
for /f "usebackq delims=" %%L in ("%CHANGES_FILE%") do echo        %%L

echo [3/4] 即将 commit + push 到 origin/master（会触发 GitHub Pages 部署）
echo        提交信息: !COMMIT_MSG!
set "ANS="
set /p "ANS=       确认推送? [Y/n] "
if /i "!ANS!"=="n" (
	echo        已取消。改动保留在工作区（未提交）。
	goto :end
)

git add src/
git commit -m "!COMMIT_MSG!" >nul 2>&1
if errorlevel 1 (
	echo        [X] commit 失败（可能没有可提交的改动）
	goto :end
)
echo        [OK] 已提交

rem ============ 推送前记 pages 分支 SHA（供 verify 用）============
set "BEFORE_SHA="
for /f "tokens=1" %%i in ('git ls-remote origin pages 2^>nul') do set "BEFORE_SHA=%%i"

echo [4/4] 推送到 origin/master ...
git push origin master
if errorlevel 1 (
	echo        [X] push 失败。改动已提交到本地，稍后可手动 git push。
	goto :end
)
echo        [OK] 已推送至 GitHub

if not "%VERIFY%"=="1" (
	echo.
	echo        提示: 加 --verify 可自动确认部署
	goto :end
)

echo.
echo -------- 验证部署: 轮询 pages 分支 SHA（最多约 7min）--------
if "!BEFORE_SHA!"=="" (
	echo    [WARN] 未能获取推送前 SHA，跳过验证
	goto :end
)
echo    before: !BEFORE_SHA!
set "VC=0"
:verifyloop
set /a VC+=1
if !VC! gtr 14 (
	echo    [WARN] pages SHA 超时未变化 - 可能是假绿勾
	echo           重触发: git commit --allow-empty -m "ci: re-trigger" ^&^& git push origin master
	goto :end
)
ping -n 31 127.0.0.1 >nul
set "NOW_SHA="
for /f "tokens=1" %%s in ('git ls-remote origin pages 2^>nul') do set "NOW_SHA=%%s"
echo    [!VC!] pages=!NOW_SHA!
if "!NOW_SHA!"=="" goto :verifyloop
if "!NOW_SHA!"=="!BEFORE_SHA!" goto :verifyloop
echo    [OK] pages 已更新 -^> !NOW_SHA!  部署成功
goto :end

:end
if exist "%CHANGES_FILE%" del "%CHANGES_FILE%" >nul 2>&1
echo.
pause
endlocal
exit /b

rem ============ 浏览器探测子例程（后台重入）=============
:openbrowser
for /l %%i in (1,1,20) do (
	curl -s -o nul -m 1 http://localhost:4321/ >nul 2>&1
	if not errorlevel 1 (
		start "" http://localhost:4321/keystatic
		exit /b
	)
	ping -n 2 127.0.0.1 >nul
)
exit /b
