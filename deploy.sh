#!/bin/bash

# Deployment script for MapIt to custom hosting
# Target: mapit@38.242.201.28 -p 1387
# Deploy path: /home/mapit/public_html

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting MapIt Deployment...${NC}"
echo -e "${YELLOW}Target: mapit@38.242.201.28 -p 1387${NC}"
echo -e "${YELLOW}Deploy Path: /home/mapit/public_html${NC}"

# SSH connection details
SSH_HOST="mapit@109.123.241.15"
SSH_PORT="2408"
DEPLOY_PATH="/home/mapit/public_html"
APP_NAME="mapit"

# Step 1: Build the app locally
echo -e "\n${YELLOW}📦 Step 1: Building application locally...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Step 2: Create temporary deployment directory
echo -e "\n${YELLOW}📁 Step 2: Preparing files for deployment...${NC}"
DEPLOY_DIR="./dist"
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${RED}❌ Dist directory not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dist directory ready: $DEPLOY_DIR${NC}"

# Step 3: Connect and prepare remote server
echo -e "\n${YELLOW}🔧 Step 3: Preparing remote server...${NC}"
ssh -p $SSH_PORT $SSH_HOST << 'EOF'
    # Create backup of existing deployment
    if [ -d /home/mapit/public_html ]; then
        echo "Creating backup of existing deployment..."
        mkdir -p /home/mapit/backups
        BACKUP_DIR="/home/mapit/backups/backup-$(date +%Y%m%d-%H%M%S)"
        cp -r /home/mapit/public_html $BACKUP_DIR
        echo "✅ Backup created at: $BACKUP_DIR"
    fi
    
    # Create deploy directory if it doesn't exist
    mkdir -p /home/mapit/public_html
    chmod 755 /home/mapit/public_html
    echo "✅ Deploy directory ready"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to prepare remote server!${NC}"
    exit 1
fi

# Step 4: Upload files using rsync
echo -e "\n${YELLOW}📤 Step 4: Uploading files to server...${NC}"
rsync -avz -e "ssh -p $SSH_PORT" \
    --delete \
    ./dist/ \
    $SSH_HOST:$DEPLOY_PATH/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded successfully!${NC}"
else
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

# Step 5: Configure server after deployment
echo -e "\n${YELLOW}⚙️  Step 5: Configuring server...${NC}"
ssh -p $SSH_PORT $SSH_HOST << 'EOF'
    # Set proper permissions
    chmod -R 755 /home/mapit/public_html
    
    # Create .htaccess for SPA routing (if Apache)
    cat > /home/mapit/public_html/.htaccess << 'HTACCESS'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories that exist
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite all other requests to index.html
  RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>
HTACCESS
    
    echo "✅ Created .htaccess for SPA routing"
    
    # List deployed files
    echo "✅ Deployed files:"
    ls -lah /home/mapit/public_html/ | head -20
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Server configuration complete!${NC}"
else
    echo -e "${RED}❌ Server configuration failed!${NC}"
    exit 1
fi

# Step 6: Verify deployment
echo -e "\n${YELLOW}🔍 Step 6: Verifying deployment...${NC}"
ssh -p $SSH_PORT $SSH_HOST << 'EOF'
    echo "Checking deployed files:"
    if [ -f /home/mapit/public_html/index.html ]; then
        echo "✅ index.html found"
    else
        echo "❌ index.html NOT found"
        exit 1
    fi
    
    if [ -d /home/mapit/public_html/assets ]; then
        echo "✅ assets directory found"
        ls /home/mapit/public_html/assets/
    else
        echo "❌ assets directory NOT found"
        exit 1
    fi
    
    echo "✅ All checks passed!"
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment verification successful!${NC}"
else
    echo -e "${RED}❌ Deployment verification failed!${NC}"
    exit 1
fi

# Final Summary
echo -e "\n${GREEN}✅ ========================================${NC}"
echo -e "${GREEN}   DEPLOYMENT SUCCESSFUL! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}📍 Access your app at:${NC}"
echo -e "${GREEN}   https://mapit.optimalservers.online${NC}"
echo -e "${GREEN}   https://mapit.optimalservers.online/view-map/13${NC}"
echo -e "\n${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Clear browser cache (Ctrl+Shift+Delete)"
echo -e "   2. Hard refresh the page (Ctrl+Shift+R)"
echo -e "   3. Check DevTools Network tab"
echo -e "\n${YELLOW}🔧 If you need to rollback, backups are at:${NC}"
echo -e "   /home/mapit/backups/backup-*"
echo -e "\n${YELLOW}📚 Deployment notes:${NC}"
echo -e "   - .htaccess created for SPA routing"
echo -e "   - All static assets are versioned (safe to cache)"
echo -e "   - Database connection uses NEON (already configured)"
echo -e "\n"
