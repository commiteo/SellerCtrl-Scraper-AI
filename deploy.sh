#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "تثبيت المتطلبات..."
apt update && apt upgrade -y
apt install -y curl git build-essential python3 python3-pip chromium-browser redis-server

print_status "تثبيت Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

print_status "تثبيت PM2..."
npm install -g pm2

print_status "تثبيت متطلبات المشروع..."
npm install
cd backend && pip3 install -r requirements.txt && cd ..

print_status "بناء الواجهة الأمامية..."
npm run build

print_status "تشغيل التطبيق عبر PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_status "تم النشر بنجاح!"
pm2 status 