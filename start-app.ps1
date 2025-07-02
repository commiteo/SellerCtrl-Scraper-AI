# SellerCtrl Scraper AI - No Docker Setup
Write-Host "🚀 Starting SellerCtrl Scraper AI..." -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install npm dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install concurrently
Write-Host "🔧 Installing concurrently..." -ForegroundColor Yellow
npm install --save-dev concurrently
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install concurrently" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔴 Checking Redis..." -ForegroundColor Yellow

# Check if Redis is running
try {
    $null = redis-cli ping 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Redis is running" -ForegroundColor Green
    } else {
        throw "Redis not responding"
    }
} catch {
    Write-Host "❌ Redis is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Redis first:" -ForegroundColor Yellow
    Write-Host "1. Download Redis from: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Cyan
    Write-Host "2. Install it" -ForegroundColor Cyan
    Write-Host "3. Or run: redis-server.exe" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🎯 Starting all servers..." -ForegroundColor Green
Write-Host "- Frontend (Vite): http://localhost:5173" -ForegroundColor Cyan
Write-Host "- Backend (Node.js): http://localhost:3001" -ForegroundColor Cyan
Write-Host "- Redis: localhost:6379" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start both servers
npm run start 