# SellerCtrl Scraper AI Setup Script
Write-Host "🚀 Setting up SellerCtrl Scraper AI..." -ForegroundColor Green

# Check if Docker is installed
$dockerInstalled = $false
try {
    docker --version | Out-Null
    $dockerInstalled = $true
    Write-Host "✅ Docker found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found" -ForegroundColor Red
}

# Check if Redis is running
$redisRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:6379" -TimeoutSec 2 -ErrorAction SilentlyContinue
    $redisRunning = $true
    Write-Host "✅ Redis is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Redis not running" -ForegroundColor Yellow
}

# Install npm dependencies
Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
npm install

# Install concurrently for running both servers
Write-Host "🔧 Installing concurrently..." -ForegroundColor Yellow
npm install --save-dev concurrently

if ($dockerInstalled -and -not $redisRunning) {
    Write-Host "🐳 Starting Redis with Docker..." -ForegroundColor Yellow
    docker run -d --name redis-server -p 6379:6379 redis:alpine
    Start-Sleep -Seconds 3
    Write-Host "✅ Redis started with Docker" -ForegroundColor Green
} elseif (-not $dockerInstalled) {
    Write-Host "⚠️  Docker not found. Please install Docker or Redis manually:" -ForegroundColor Yellow
    Write-Host "   - Docker: https://docs.docker.com/get-docker/" -ForegroundColor Cyan
    Write-Host "   - Redis Windows: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Cyan
    Write-Host "   - Or use Redis Cloud: https://redis.com/try-free/" -ForegroundColor Cyan
}

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host "📝 To start the application, run: npm run start" -ForegroundColor Cyan
Write-Host "🌐 Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend will be available at: http://localhost:3001" -ForegroundColor Cyan 