@echo off
chcp 65001 >nul 2>&1
title Mizuki Dev Server

echo ========================================
echo   Mizuki Blog - Starting Dev Server
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo First run, installing dependencies...
    pnpm install
    echo.
)

call npx astro preferences disable devToolbar >nul 2>&1

echo Starting dev server, please wait...
echo.

start /b pnpm dev

:wait
timeout /t 3 /nobreak >nul
curl -s -o nul http://localhost:4321/ 2>nul
if not errorlevel 1 goto ready
curl -s -o nul http://localhost:3000/ 2>nul
if not errorlevel 1 goto ready3000
goto wait

:ready
echo Server is ready!
echo Opening browser: http://localhost:4321
echo Press Ctrl+C to stop the server.
echo ========================================
start http://localhost:4321
goto end

:ready3000
echo Server is ready!
echo Opening browser: http://localhost:3000
echo Press Ctrl+C to stop the server.
echo ========================================
start http://localhost:3000

:end
pause
