#!/bin/bash
# MapIt Apache Reverse Proxy Setup - Execute as ROOT

echo "🔧 Configuring Apache Reverse Proxy..."

# Step 1: Enable Apache modules
echo "✅ Step 1: Enabling Apache modules..."
a2enmod proxy
a2enmod proxy_http
a2enmod rewrite
a2enmod headers

# Step 2: Create reverse proxy configuration
echo "✅ Step 2: Creating reverse proxy config..."
cat > /etc/apache2/conf-available/mapit-proxy.conf << 'EOF'
# MapIt API Reverse Proxy Configuration
ProxyPreserveHost On
ProxyPass /api http://127.0.0.1:3101/api
ProxyPassReverse /api http://127.0.0.1:3101/api

<Location /api>
  Order allow,deny
  Allow from all
</Location>
EOF

# Step 3: Enable Apache configuration
echo "✅ Step 3: Enabling reverse proxy configuration..."
a2enconf mapit-proxy

# Step 4: Test Apache configuration
echo "✅ Step 4: Testing Apache configuration..."
apache2ctl configtest

# Step 5: Restart Apache
echo "✅ Step 5: Restarting Apache..."
systemctl restart apache2

# Step 6: Verify setup
echo ""
echo "✅ Setup Complete! Verifying..."
echo ""
echo "Apache Status:"
systemctl is-active apache2
echo ""
echo "Proxy Modules:"
apache2ctl -M | grep -E "proxy|rewrite"
echo ""
echo "Configuration:"
cat /etc/apache2/conf-available/mapit-proxy.conf
echo ""
echo "🎉 Apache Reverse Proxy is now configured!"
echo "API requests to /api/* will be forwarded to http://127.0.0.1:3101/api"
