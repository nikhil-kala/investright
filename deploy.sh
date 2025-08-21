#!/bin/bash

# InvestRight Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting InvestRight deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="investright"
BUILD_DIR="dist"
SERVER_FILE="server.js"
ECOSYSTEM_FILE="ecosystem.config.js"

# Check if required files exist
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build directory '$BUILD_DIR' not found!${NC}"
    echo "Please run 'npm run build' first."
    exit 1
fi

if [ ! -f "$SERVER_FILE" ]; then
    echo -e "${RED}❌ Server file '$SERVER_FILE' not found!${NC}"
    exit 1
fi

if [ ! -f "$ECOSYSTEM_FILE" ]; then
    echo -e "${RED}❌ Ecosystem file '$ECOSYSTEM_FILE' not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required files found${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing PM2...${NC}"
    npm install -g pm2
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "${YELLOW}🔄 Stopping existing $APP_NAME process...${NC}"
    pm2 stop "$APP_NAME" || true
    pm2 delete "$APP_NAME" || true
fi

# Install production dependencies
echo -e "${YELLOW}📦 Installing production dependencies...${NC}"
npm install --production

# Start the application with PM2
echo -e "${YELLOW}🚀 Starting $APP_NAME with PM2...${NC}"
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save

# Display status
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📊 Application Status:"
pm2 list
echo ""
echo "📝 Useful commands:"
echo "  View logs: pm2 logs $APP_NAME"
echo "  Monitor: pm2 monit"
echo "  Restart: pm2 restart $APP_NAME"
echo "  Stop: pm2 stop $APP_NAME"
echo ""
echo "🌐 Your app should now be running on port 3000"
echo "🔗 Health check: http://localhost:3000/health"
