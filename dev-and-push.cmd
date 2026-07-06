@echo off
chcp 65001 >nul
cd /d "%~dp0"
bash scripts/dev-and-push.sh %*
echo.
pause
