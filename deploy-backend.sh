#!/bin/bash

# Backend deployment script for MapIt
# Deploys Node.js API server to custom hosting

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Starting MapIt Backend Deployment...${NC}"
echo -e "${YELLOW}Target: mapit@38.242.201.28 -p 1387${NC}"

SSH_HOST="mapit@38.242.201.28"
SSH_PORT="1387"
BACKEND_PATH="/home/mapit/backend"
APP_NAME="mapit"

# Step 1: Prepare backend files
echo -e "\n${YELLOW}📦 Step 1: Preparing backend files...${NC}"

# Create temporary backend directory
TEMP_BACKEND="/tmp/mapit-backend"
rm -rf $TEMP_BACKEND
mkdir -p $TEMP_BACKEND

# Copy necessary files
cp server.js $TEMP_BACKEND/
cp package.json $TEMP_BACKEND/
cp .env $TEMP_BACKEND/ 2>/dev/null || echo "Note: .env not copied (will use on server)"

# Copy api routes if they exist
if [ -d "api" ]; then
    cp -r api $TEMP_BACKEND/
fi

# Copy config if it exists
if [ -d "config" ]; then
    cp -r config $TEMP_BACKEND/
fi

# Copy routes if they exist
if [ -d "routes" ]; then
    cp -r routes $TEMP_BACKEND/
fi

echo -e "${GREEN}✅ Backend files prepared${NC}"

# Step 2: Create/Update backend on server
echo -e "\n${YELLOW}🔧 Step 2: Setting up backend on server...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'EOF'
    # Create backend directory
    mkdir -p /home/mapit/backend
    mkdir -p /home/mapit/logs
    chmod 755 /home/mapit/backend
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "⚠️  Node.js not found. You need to install it first:"
        echo "    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "    sudo apt-get install -y nodejs"
        exit 1
    fi
    
    echo "✅ Node.js version: $(node -v)"
    echo "✅ NPM version: $(npm -v)"
    
    # Create .env file if it doesn't exist
    if [ ! -f /home/mapit/backend/.env ]; then
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
CORS_ORIGINS=https://mapit.optimalservers.online,http://localhost:5173,http://127.0.0.1:5173
CORS_MAX_AGE=86400
ENVFILE
        echo "✅ Created .env file"
    else
        echo "✅ .env file already exists"
    fi
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Server setup failed!${NC}"
    exit 1
fi

# Step 3: Upload backend files
echo -e "\n${YELLOW}📤 Step 3: Uploading backend files...${NC}"

rsync -avz -e "ssh -p $SSH_PORT" \
    --exclude node_modules \
    --exclude logs \
    --exclude .env \
    $TEMP_BACKEND/ \
    $SSH_HOST:$BACKEND_PATH/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend files uploaded${NC}"
else
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

# Step 4: Install dependencies on server
echo -e "\n${YELLOW}📦 Step 4: Installing dependencies on server...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'EOF'
    cd /home/mapit/backend
    npm install --production
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed"
    else
        echo "❌ npm install failed"
        exit 1
    fi
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Dependency installation failed!${NC}"
    exit 1
fi

# Step 5: Set up PM2 (process manager) for auto-restart
echo -e "\n${YELLOW}🔧 Step 5: Setting up process manager...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'EOF'
    # Install PM2 globally if not exists
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
        pm2 startup
        pm2 save
    fi
    
    # Stop existing process
    cd /home/mapit/backend
    pm2 stop "mapit-api" 2>/dev/null || true
    pm2 delete "mapit-api" 2>/dev/null || true
    
    # Start new process
    pm2 start server.js --name "mapit-api" --error /home/mapit/logs/error.log --output /home/mapit/logs/output.log
    pm2 save
    
    echo "✅ Process manager configured"
    pm2 list
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Process manager setup complete${NC}"
else
    echo -e "${RED}❌ Process manager setup failed!${NC}"
    exit 1
fi

# Step 6: Configure Apache reverse proxy
echo -e "\n${YELLOW}⚙️  Step 6: Configuring reverse proxy...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'EOF'
    # Check if Apache mod_proxy is available
    if ! apache2ctl -M 2>/dev/null | grep -q proxy_http; then
        echo "⚠️  mod_proxy_http not enabled in Apache"
        echo "   You may need to enable it: sudo a2enmod proxy proxy_http"
    fi
    
    # Create Apache configuration for reverse proxy
    cat > /home/mapit/mapit-api.conf << 'APACHECONF'
<VirtualHost *:80>
    ServerName mapit.optimalservers.online
    
    # API reverse proxy
    <Location /api>
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:3101/api
        ProxyPassReverse http://127.0.0.1:3101/api
    </Location>
    
    # Frontend
    DocumentRoot /home/mapit/public_html
    <Directory /home/mapit/public_html>
        Allow from all
    </Directory>
</VirtualHost>
APACHECONF
    
    echo "✅ Apache configuration created"
    echo "   Note: Ask your hosting provider to activate this configuration"
    echo "   File: /home/mapit/mapit-api.conf"
EOF

# Step 7: Verify deployment
echo -e "\n${YELLOW}🔍 Step 7: Verifying backend...${NC}"

ssh -p $SSH_PORT $SSH_HOST << 'EOF'
    echo "Backend directory contents:"
    ls -lah /home/mapit/backend/
    
    echo ""
    echo "PM2 processes:"
    pm2 list || echo "PM2 not available"
    
    echo ""
    echo "Recent logs:"
    tail -20 /home/mapit/logs/output.log 2>/dev/null || echo "No logs yet"
EOF

# Step 8: Update frontend API endpoint
echo -e "\n${YELLOW}🔄 Step 8: Updating frontend for API communication...${NC}"

# We need to update the frontend to use the new API endpoint
# For now, we'll note that it should be updated

echo -e "${YELLOW}⚠️  Frontend note:${NC}"
echo -e "The frontend expects API at /api/* which will be reverse proxied"
echo -e "If you need a different API endpoint, update it in your code"

# Final Summary
echo -e "\n${GREEN}✅ ========================================${NC}"
echo -e "${GREEN}   BACKEND DEPLOYMENT COMPLETE! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}📍 Backend Status:${NC}"
echo -e "   API Server: Running on 127.0.0.1:3101 (internal)"
echo -e "   Reverse Proxy: https://mapit.optimalservers.online/api/*"
echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Ask hosting provider to enable Apache mod_proxy (if not already)"
echo -e "   2. Verify logs: tail -f /home/mapit/logs/output.log"
echo -e "   3. Test API: curl https://mapit.optimalservers.online/api/health"
echo -e "   4. Test login: curl -X POST https://mapit.optimalservers.online/api/login"
echo -e "\n${YELLOW}🔧 Useful Commands:${NC}"
echo -e "   View logs:        ssh -p 1387 mapit@38.242.201.28 'tail -f /home/mapit/logs/output.log'"
echo -e "   Stop backend:     ssh -p 1387 mapit@38.242.201.28 'pm2 stop mapit-api'"
echo -e "   Restart backend:  ssh -p 1387 mapit@38.242.201.28 'pm2 restart mapit-api'"
echo -e "   View processes:   ssh -p 1387 mapit@38.242.201.28 'pm2 list'"
echo -e "\n"

# Cleanup
rm -rf $TEMP_BACKEND
echo -e "${GREEN}✅ Deployment script complete!${NC}"
