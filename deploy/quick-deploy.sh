#!/bin/bash

# SellerCtrl Scraper - Quick Deployment Script
# Usage: bash deploy/quick-deploy.sh your-domain.com your-supabase-key

DOMAIN=$1
SUPABASE_KEY=$2

if [ -z "$DOMAIN" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Usage: bash deploy/quick-deploy.sh your-domain.com your-supabase-key"
    exit 1
fi

echo "🚀 Quick deploying SellerCtrl Scraper..."
echo "🌐 Domain: $DOMAIN"

# 1. Install system dependencies
echo "📦 Installing system dependencies..."
bash deploy/install.sh

# 2. Setup application
echo "🔧 Setting up application..."
bash deploy/setup.sh

# 3. Update environment with real values
echo "🔐 Configuring environment..."
sed -i "s/your-supabase-anon-key-here/$SUPABASE_KEY/g" .env

# 4. Setup Nginx
echo "🌐 Configuring Nginx..."
cp deploy/nginx-config /etc/nginx/sites-available/sellerctrl
sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/sellerctrl
ln -sf /etc/nginx/sites-available/sellerctrl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 5. Start application
echo "⚡ Starting application..."
cd /var/www/sellerctrl
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 6. Setup SSL
echo "🔒 Setting up SSL..."
bash deploy/ssl-setup.sh $DOMAIN

echo "✅ Deployment completed!"
echo "🌐 Your application is now available at: https://$DOMAIN"
echo "📊 Monitor with: pm2 status"
echo "📝 Logs: pm2 logs"
