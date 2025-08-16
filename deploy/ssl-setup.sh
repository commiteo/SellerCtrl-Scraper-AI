#!/bin/bash

# SSL Setup with Let's Encrypt
# Run as root: sudo bash deploy/ssl-setup.sh your-domain.com

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Usage: sudo bash ssl-setup.sh your-domain.com"
    exit 1
fi

echo "🔒 Setting up SSL for $DOMAIN..."

# Install Certbot
echo "📦 Installing Certbot..."
apt update
apt install -y snapd
snap install core; snap refresh core
snap install --classic certbot

# Create symlink
ln -sf /snap/bin/certbot /usr/bin/certbot

# Install Certbot Nginx plugin
snap set certbot trust-plugin-with-root=ok
snap install certbot-dns-cloudflare

# Get SSL certificate
echo "🔐 Obtaining SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# Test renewal
certbot renew --dry-run

echo "✅ SSL setup completed!"
echo "🌐 Your site should now be accessible at https://$DOMAIN"
