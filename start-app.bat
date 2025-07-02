@echo off
echo 🚀 Starting SellerCtrl Scraper AI...
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install npm dependencies
    pause
    exit /b 1
)

echo 🔧 Installing concurrently...
call npm install --save-dev concurrently
if %errorlevel% neq 0 (
    echo ❌ Failed to install concurrently
    pause
    exit /b 1
)

echo.
echo 🔴 Checking Redis...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Redis is not running!
    echo.
    echo Please start Redis first:
    echo 1. Download Redis from: https://github.com/microsoftarchive/redis/releases
    echo 2. Install it
    echo 3. Or run: redis-server.exe
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Redis is running
)

echo.
echo 🎯 Starting all servers...
echo - Frontend (Vite): http://localhost:5173
echo - Backend (Node.js): http://localhost:3001  
echo - Redis: localhost:6379
echo.
echo Press Ctrl+C to stop all servers
echo.

call npm run start

pause 