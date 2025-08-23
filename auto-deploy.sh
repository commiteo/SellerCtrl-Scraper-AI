#!/bin/bash

# SellerCtrl Auto Deployment Script
# Run this script on your server (91.108.112.75)

set -e  # Exit on any error

echo "🚀 Starting SellerCtrl Auto Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Some commands will be adjusted."
    SUDO=""
else
    SUDO="sudo"
fi

# Step 1: Update system
print_status "Updating system packages..."
$SUDO apt update && $SUDO apt upgrade -y

# Step 2: Install basic requirements
print_status "Installing Git and curl..."
$SUDO apt install -y git curl wget gnupg

# Step 3: Install Node.js 18.x
print_status "Installing Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | $SUDO -E bash -
    $SUDO apt-get install -y nodejs
else
    print_status "Node.js already installed: $(node --version)"
fi

# Step 4: Install Google Chrome
print_status "Installing Google Chrome..."
if ! command -v google-chrome &> /dev/null; then
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | $SUDO apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | $SUDO tee /etc/apt/sources.list.d/google-chrome.list
    $SUDO apt update
    $SUDO apt install -y google-chrome-stable
    
    # Install additional dependencies for headless Chrome
    $SUDO apt install -y libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
else
    print_status "Google Chrome already installed: $(google-chrome --version)"
fi

# Step 5: Create project directory
print_status "Setting up project directory..."
PROJECT_DIR="/var/www/sellerctrl"
$SUDO mkdir -p /var/www

# Step 6: Clone or update project
if [ -d "$PROJECT_DIR" ]; then
    print_status "Updating existing project..."
    cd $PROJECT_DIR
    $SUDO git pull origin main
else
    print_status "Cloning project from GitHub..."
    $SUDO git clone https://github.com/commiteo/SellerCtrl-Scraper-AI.git $PROJECT_DIR
fi

# Change ownership
$SUDO chown -R $USER:$USER $PROJECT_DIR
cd $PROJECT_DIR

# Step 7: Install PM2 globally
print_status "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    $SUDO npm install -g pm2
else
    print_status "PM2 already installed: $(pm2 --version)"
fi

# Step 8: Setup Backend
print_status "Setting up Backend..."
cd backend

# Install backend dependencies
npm install

# Create backend .env file
if [ ! -f ".env" ]; then
    print_status "Creating backend .env file..."
    cat > .env << EOF
NODE_ENV=production
API_PORT=3002
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
SCRAPER_TIMEOUT=30000
MAX_CONCURRENT_SCRAPERS=3
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://91.108.112.75
API_RATE_LIMIT=100
LOG_LEVEL=info
EOF
    print_warning "Please edit backend/.env file with your actual Supabase credentials!"
else
    print_status "Backend .env file already exists"
fi

# Step 9: Setup Frontend
print_status "Setting up Frontend..."
cd ..

# Install frontend dependencies
npm install

# Create frontend .env file
if [ ! -f ".env" ]; then
    print_status "Creating frontend .env file..."
    cat > .env << EOF
VITE_API_URL=http://91.108.112.75:3002
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF
    print_warning "Please edit .env file with your actual Supabase credentials!"
else
    print_status "Frontend .env file already exists"
fi

# Step 10: Build Frontend
print_status "Building Frontend for production..."
npm run build

# Step 11: Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# Step 12: Start Backend with PM2
print_status "Starting Backend API..."
cd backend
pm2 start server.cjs --name "sellerctrl-api" --env production

# Step 13: Start Frontend with PM2
print_status "Starting Frontend..."
cd ..
$SUDO npm install -g serve || true
pm2 serve dist 80 --spa --name "sellerctrl-frontend"

# Step 14: Setup firewall
print_status "Configuring firewall..."
$SUDO ufw --force enable
$SUDO ufw allow 22    # SSH
$SUDO ufw allow 80    # HTTP
$SUDO ufw allow 443   # HTTPS
$SUDO ufw allow 3002  # Backend API

# Step 15: Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save
pm2 startup | tail -1 | $SUDO bash || true

# Step 16: Test the application
print_status "Testing the application..."
sleep 5

echo ""
print_status "Testing Backend API..."
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    print_status "✅ Backend API is running successfully!"
else
    print_error "❌ Backend API test failed"
fi

print_status "Testing Frontend..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    print_status "✅ Frontend is running successfully!"
else
    print_error "❌ Frontend test failed"
fi

# Display PM2 status
echo ""
print_status "PM2 Process Status:"
pm2 status

echo ""
print_status "🎉 Deployment completed!"
print_status "📱 Frontend: http://91.108.112.75"
print_status "🔧 Backend API: http://91.108.112.75:3002"
echo ""
print_warning "⚠️  IMPORTANT: Don't forget to update your .env files with actual Supabase credentials!"
print_warning "📝 Edit: $PROJECT_DIR/.env and $PROJECT_DIR/backend/.env"
echo ""
print_status "📊 Monitor logs with: pm2 logs"
print_status "🔄 Restart services with: pm2 restart all"
echo ""
print_status "🚀 Your SellerCtrl application is now running on the server!"