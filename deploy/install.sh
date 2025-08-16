#!/bin/bash

# SellerCtrl Scraper - Ubuntu Server Installation Script
# Run as root: sudo bash install.sh

echo "🚀 Installing SellerCtrl Scraper on Ubuntu Server..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install Chrome dependencies for Puppeteer
echo "🌐 Installing Chrome dependencies..."
apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    libgbm1 \
    libxshmfence1

# Install Google Chrome
echo "🌐 Installing Google Chrome..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt update
apt install -y google-chrome-stable

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx

# Install PM2 globally
echo "⚡ Installing PM2..."
npm install -g pm2

# Create project directory
echo "📁 Creating project directory..."
mkdir -p /var/www/sellerctrl
cd /var/www/sellerctrl

# Create sellerctrl user
echo "👤 Creating sellerctrl user..."
useradd -r -s /bin/false sellerctrl || true
chown -R sellerctrl:sellerctrl /var/www/sellerctrl

echo "✅ System dependencies installed successfully!"
echo "📋 Next steps:"
echo "1. Clone your project to /var/www/sellerctrl"
echo "2. Run setup.sh to configure the application"
echo "3. Configure Nginx and SSL"
