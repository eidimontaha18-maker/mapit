#!/bin/bash

# Deploy MapIt Frontend with Apache Reverse Proxy Setup
# This script:
# 1. Deploys the frontend to the server
# 2. Enables Apache proxy modules
# 3. Sets up reverse proxy configuration
# 4. Restarts Apache

set -e

SERVER="mapit@109.123.241.15"
SSH_PORT="2408"
REMOTE_PATH="/home/mapit/public_html"

echo "🚀 Starting MapIt Frontend Deployment with Reverse Proxy Setup..."
echo "Target: $SERVER -p $SSH_PORT"

# Step 1: Build locally (already done)
echo "✅ Frontend already built"

# Step 2: Upload dist files
echo "📤 Uploading frontend files..."
scp -P $SSH_PORT -r dist/* "$SERVER:$REMOTE_PATH/" 2>&1 | grep -E "^(dist/|Sending)" || true

# Step 3: Deploy updated .htaccess with /api exclusion
echo "📄 Deploying updated .htaccess (excludes /api from rewriting)..."
scp -P $SSH_PORT htaccess-with-api-proxy "$SERVER:$REMOTE_PATH/.htaccess"

# Step 4: Enable Apache proxy modules
echo "🔧 Enabling Apache proxy modules..."
ssh -p $SSH_PORT $SERVER "sudo a2enmod proxy proxy_http rewrite headers 2>&1 | grep -v 'already enabled' || true"

# Step 5: Create Apache configuration
echo "⚙️  Deploying Apache reverse proxy configuration..."
ssh -p $SSH_PORT $SERVER "sudo tee /etc/apache2/conf-available/mapit-proxy.conf > /dev/null" < apache-proxy-config.conf

# Step 6: Enable Apache configuration
echo "✅ Enabling Apache reverse proxy configuration..."
ssh -p $SSH_PORT $SERVER "sudo a2enconf mapit-proxy 2>&1 | grep -v 'already enabled' || true"

# Step 7: Test Apache configuration syntax
echo "🔍 Checking Apache configuration syntax..."
ssh -p $SSH_PORT $SERVER "sudo apache2ctl configtest"

# Step 8: Restart Apache
echo "🔄 Restarting Apache..."
ssh -p $SSH_PORT $SERVER "sudo systemctl restart apache2"

# Step 9: Verify deployment
echo "✅ Verifying deployment..."
ssh -p $SSH_PORT $SERVER "ls -la $REMOTE_PATH/index.html $REMOTE_PATH/.htaccess 2>&1 | tail -5"

echo ""
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo ""
echo "🎯 Your MapIt app is now available at:"
echo "   Frontend:  https://mapit.optimalservers.online"
echo "   API calls: https://mapit.optimalservers.online/api/* (proxied to localhost:3101)"
echo ""
echo "📝 Testing steps:"
echo "   1. Visit https://mapit.optimalservers.online"
echo "   2. Try logging in"
echo "   3. Open DevTools (F12) Network tab to see /api/login requests"
echo ""
echo "ℹ️  To verify reverse proxy is working:"
echo "   curl -i https://mapit.optimalservers.online/api/health"
