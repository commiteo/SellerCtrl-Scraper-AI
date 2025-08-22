#!/bin/bash

# SellerCtrl Scraper - Application Setup Script
# Run after cloning the project: bash deploy/setup.sh

echo "🔧 Setting up SellerCtrl Scraper application..."

# Check if running as sellerctrl user or root
if [[ $EUID -ne 0 && $(whoami) != "sellerctrl" ]]; then
    echo "❌ This script should be run as root or sellerctrl user"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p screenshots
mkdir -p data

# Create environment file
echo "🔐 Creating environment file..."
cat > .env << EOL
# Production Environment
NODE_ENV=production
API_PORT=3002

# Supabase Configuration
VITE_SUPABASE_URL=https://aqkaxcwdcqnwzgvaqtne.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Scraper Configuration
SCRAPER_DELAY_MS=2000
MAX_CONCURRENT_SCRAPERS=3
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Monitoring Configuration
PRICE_MONITOR_INTERVAL=3600000
MAX_MONITORING_PRODUCTS=100

# API Configuration
API_RATE_LIMIT=100
API_WINDOW_MS=900000

# Logging
LOG_LEVEL=info
EOL

echo "⚠️  Please edit .env file with your actual Supabase credentials"

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Set proper permissions
echo "🔒 Setting permissions..."
if [[ $EUID -eq 0 ]]; then
    chown -R sellerctrl:sellerctrl .
    chmod -R 755 .
    chmod 600 .env
fi

# Create PM2 ecosystem file
echo "⚡ Creating PM2 configuration..."
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [
    {
      name: 'sellerctrl-backend',
      script: './backend/server.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      log_file: './logs/app.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'sellerctrl-price-monitor',
      script: './backend/price_monitor_cron.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      log_file: './logs/monitor.log',
      out_file: './logs/monitor-out.log',
      error_file: './logs/monitor-error.log',
      merge_logs: true,
      time: true
    }
  ]
};
EOL

echo "✅ Application setup completed!"
echo "📋 Next steps:"
echo "1. Edit .env file with your actual credentials"
echo "2. Start the application: pm2 start ecosystem.config.js"
echo "3. Save PM2 configuration: pm2 save && pm2 startup"
