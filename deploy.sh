#!/bin/bash

# SellerCtrl Deployment Script for Hostinger
# Run this script on your Hostinger VPS

set -e

echo "🚀 Starting SellerCtrl deployment on Hostinger..."

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
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
print_status "Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_warning "Node.js is already installed"
fi

# Install Python 3
print_status "Installing Python 3..."
sudo apt install python3 python3-pip -y

# Install Redis
print_status "Installing Redis..."
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Chromium
print_status "Installing Chromium browser..."
sudo apt install chromium-browser -y

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Create project directory
PROJECT_DIR="/var/www/sellerctrl"
print_status "Setting up project directory: $PROJECT_DIR"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Create logs directory
mkdir -p $PROJECT_DIR/logs

# Copy project files (assuming script is run from project root)
print_status "Copying project files..."
cp -r . $PROJECT_DIR/
cd $PROJECT_DIR

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

print_status "Installing Python dependencies..."
pip3 install -r backend/requirements.txt

# Build the project
print_status "Building the project..."
npm run build

# Create environment file
print_status "Creating environment file..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
API_PORT=3002
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=${GEMINI_API_KEY:-your_gemini_api_key_here}
SUPABASE_URL=https://aqkaxcwdcqnwzgvaqtne.supabase.co
SUPABASE_KEY=${SUPABASE_KEY:-your_supabase_key_here}
EOF

print_warning "Please update the .env file with your actual API keys"

# Start applications with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Install and configure Nginx
print_status "Installing and configuring Nginx..."
sudo apt install nginx -y

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/sellerctrl
sudo ln -sf /etc/nginx/sites-available/sellerctrl /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Install SSL certificate (optional)
read -p "Do you want to install SSL certificate? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing SSL certificate..."
    sudo apt install certbot python3-certbot-nginx -y
    
    read -p "Enter your domain name: " DOMAIN_NAME
    if [ ! -z "$DOMAIN_NAME" ]; then
        sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
    fi
fi

# Set up firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== SellerCtrl Status ==="
echo "PM2 Status:"
pm2 status
echo ""
echo "Redis Status:"
redis-cli ping
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l
echo ""
echo "Disk Usage:"
df -h
echo ""
echo "Memory Usage:"
free -h
EOF

chmod +x monitor.sh

# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
cd /var/www/sellerctrl
git pull origin main
npm install
npm run build
pm2 restart all
echo "Update completed!"
EOF

chmod +x update.sh

print_status "Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env file with your API keys"
echo "2. Update the domain name in nginx.conf"
echo "3. Restart the services: pm2 restart all"
echo "4. Check status: ./monitor.sh"
echo ""
echo "🔗 Your application should be available at:"
echo "   http://your-domain.com"
echo ""
echo "📊 Monitor your application:"
echo "   pm2 status"
echo "   pm2 logs"
echo ""
echo "🔄 To update the application:"
echo "   ./update.sh" 