#!/bin/bash

# Backend deployment script for MapIt to new server with Node.js
# Target: mapit@109.123.241.15 -p 2408
# Deploy path: /home/mapit/backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Starting MapIt Backend Deployment (New Server)...${NC}"
echo -e "${YELLOW}Target: mapit@109.123.241.15 -p 2408${NC}"
echo -e "${YELLOW}Deploy Path: /home/mapit/backend${NC}"

# SSH connection details
SSH_HOST="mapit@109.123.241.15"
SSH_PORT="2408"
DEPLOY_PATH="/home/mapit/backend"

# Step 1: Build the app locally
echo -e "\n${YELLOW}📦 Step 1: Building application locally...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Step 2: Prepare backend files
echo -e "\n${YELLOW}📁 Step 2: Preparing backend files...${NC}"

TEMP_BACKEND="/tmp/mapit-backend-new"
rm -rf $TEMP_BACKEND
mkdir -p $TEMP_BACKEND

# Copy necessary files
cp server.js $TEMP_BACKEND/
cp package.json $TEMP_BACKEND/
cp -r config $TEMP_BACKEND/ 2>/dev/null || true
cp -r routes $TEMP_BACKEND/ 2>/dev/null || true
cp -r api $TEMP_BACKEND/ 2>/dev/null || true

echo -e "${GREEN}✅ Backend files prepared${NC}"

# Step 3: Connect and prepare remote server
echo -e "\n${YELLOW}🔧 Step 3: Preparing remote server...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'SSHEOF'
    echo "System Info:"
    echo "Node.js: $(node -v)"
    echo "NPM: $(npm -v)"
    
    # Create backend directory
    mkdir -p /home/mapit/backend
    mkdir -p /home/mapit/logs
    chmod 755 /home/mapit/backend
    
    # Create .env file
    cat > /home/mapit/backend/.env << 'ENVFILE'
# ==========================================
# Neon PostgreSQL Database Configuration
# ==========================================
DATABASE_URL=postgresql://neondb_owner:npg_myJ8NBtrH3xo@ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# ==========================================
# Application Server Configuration
# ==========================================
PORT=3101
SERVER_HOST=0.0.0.0

# ==========================================
# Frontend Configuration
# ==========================================
VITE_API_URL=https://mapit.optimalservers.online

# ==========================================
# CORS Configuration
# ==========================================
CORS_ORIGINS=https://mapit.optimalservers.online,http://localhost:5173,http://127.0.0.1:5173,http://109.123.241.15:3101,http://localhost:3101
CORS_MAX_AGE=86400
ENVFILE
    
    echo "✅ Environment configured"
SSHEOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Server preparation failed!${NC}"
    exit 1
fi

# Step 4: Upload backend files
echo -e "\n${YELLOW}📤 Step 4: Uploading backend files...${NC}"

rsync -avz -e "ssh -p $SSH_PORT" \
    --delete \
    --exclude node_modules \
    --exclude logs \
    $TEMP_BACKEND/ \
    $SSH_HOST:$DEPLOY_PATH/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded successfully!${NC}"
else
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

# Step 5: Install dependencies
echo -e "\n${YELLOW}📦 Step 5: Installing dependencies on server...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'SSHEOF'
    cd /home/mapit/backend
    npm install --production
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed"
    else
        echo "❌ npm install failed"
        exit 1
    fi
SSHEOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Dependency installation failed!${NC}"
    exit 1
fi

# Step 6: Install and configure PM2
echo -e "\n${YELLOW}🔧 Step 6: Setting up PM2 process manager...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'SSHEOF'
    # Install PM2 globally
    npm install -g pm2
    
    cd /home/mapit/backend
    
    # Stop existing processes
    pm2 stop "mapit-api" 2>/dev/null || true
    pm2 delete "mapit-api" 2>/dev/null || true
    
    # Start new process
    pm2 start server.js --name "mapit-api" \
        --error /home/mapit/logs/error.log \
        --output /home/mapit/logs/output.log \
        --env production
    
    # Save PM2 configuration to restart on reboot
    pm2 save
    
    # Enable PM2 startup
    pm2 startup
    
    echo "✅ PM2 configured"
    pm2 list
SSHEOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PM2 setup complete${NC}"
else
    echo -e "${RED}❌ PM2 setup failed!${NC}"
    exit 1
fi

# Step 7: Verify deployment
echo -e "\n${YELLOW}🔍 Step 7: Verifying deployment...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'SSHEOF'
    echo "Backend directory contents:"
    ls -lah /home/mapit/backend/ | head -15
    
    echo ""
    echo "Running processes:"
    pm2 list
    
    echo ""
    echo "Testing health endpoint (localhost):"
    sleep 2
    curl -s http://localhost:3101/api/health | jq . || echo "API not yet responding"
    
    echo ""
    echo "Recent logs:"
    tail -10 /home/mapit/logs/output.log 2>/dev/null || echo "No logs yet"
SSHEOF

# Step 8: Configure firewall
echo -e "\n${YELLOW}⚙️  Step 8: Configuring firewall...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'SSHEOF'
    # Check firewall status
    if command -v ufw &> /dev/null; then
        echo "Checking UFW firewall..."
        sudo ufw status || echo "UFW not active"
    fi
    
    # Check if port 3101 is accessible
    netstat -tlnp 2>/dev/null | grep 3101 || echo "Note: Cannot verify port directly"
SSHEOF

# Final Summary
echo -e "\n${GREEN}✅ ========================================${NC}"
echo -e "${GREEN}   BACKEND DEPLOYMENT SUCCESSFUL! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}📍 Backend Access:${NC}"
echo -e "   Internal: http://localhost:3101 (on server)"
echo -e "   External: http://109.123.241.15:3101"
echo -e "\n${YELLOW}🔗 API Endpoints:${NC}"
echo -e "   Health: http://109.123.241.15:3101/api/health"
echo -e "   Login: POST http://109.123.241.15:3101/api/login"
echo -e "\n${YELLOW}🔧 Useful Commands:${NC}"
echo -e "   View logs:        ssh -p 2408 mapit@109.123.241.15 'tail -f /home/mapit/logs/output.log'"
echo -e "   Stop backend:     ssh -p 2408 mapit@109.123.241.15 'pm2 stop mapit-api'"
echo -e "   Restart backend:  ssh -p 2408 mapit@109.123.241.15 'pm2 restart mapit-api'"
echo -e "   View all procs:   ssh -p 2408 mapit@109.123.241.15 'pm2 list'"
echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Update frontend to call: http://109.123.241.15:3101/api/*"
echo -e "   2. Redeploy frontend with: ./deploy.sh"
echo -e "   3. Test login at: https://mapit.optimalservers.online/login"
echo -e "\n${YELLOW}⚠️  Frontend API Update:${NC}"
echo -e "   Update your frontend to use the new backend URL:"
echo -e "   From: /api/login"
echo -e "   To:   http://109.123.241.15:3101/api/login"
echo -e "\n"

# Cleanup
rm -rf $TEMP_BACKEND
echo -e "${GREEN}✅ Deployment script complete!${NC}"
