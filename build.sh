#!/bin/bash

set -e

echo "🚀 Starting build process for ASIN Amazon Oracle..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Copy backend files to dist
echo "📁 Copying backend files..."
mkdir -p dist/backend
cp -r backend/* dist/backend/

# Copy .htaccess if exists
echo "📄 Copying .htaccess..."
if [ -f public/.htaccess ]; then
  cp public/.htaccess dist/
fi

echo "✅ Build completed successfully!"
echo "📁 Build output: ./dist/"
echo "🚀 To deploy: Upload the contents of ./dist/ to your hosting server" 