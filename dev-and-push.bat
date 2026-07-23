@echo off
chcp 65001 >nul 2>&1
title Mizuki Dev ^& Push
cd /d "%~dp0"
node scripts/dev-and-push.mjs %*
echo.
pause
