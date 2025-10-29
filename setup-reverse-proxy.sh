#!/bin/bash
# MapIt Apache Reverse Proxy Setup Script
# Copy and paste this entire script into your server terminal to set up the reverse proxy

set -e

echo "🔧 Starting Apache Reverse Proxy Setup..."

# Enable Apache modules
echo "1️⃣  Enabling Apache proxy modules..."
sudo a2enmod proxy 2>&1 | grep -v "already enabled" || true
sudo a2enmod proxy_http 2>&1 | grep -v "already enabled" || true
sudo a2enmod rewrite 2>&1 | grep -v "already enabled" || true
sudo a2enmod headers 2>&1 | grep -v "already enabled" || true

# Create reverse proxy configuration
echo "2️⃣  Creating reverse proxy configuration..."
sudo tee /etc/apache2/conf-available/mapit-proxy.conf > /dev/null <<'EOF'
# MapIt API Reverse Proxy Configuration
ProxyPreserveHost On
ProxyPass /api http://127.0.0.1:3101/api
ProxyPassReverse /api http://127.0.0.1:3101/api

<Location /api>
  Order allow,deny
  Allow from all
</Location>
EOF

# Enable the configuration
echo "3️⃣  Enabling reverse proxy configuration..."
sudo a2enconf mapit-proxy 2>&1 | grep -v "already enabled" || true

# Test Apache configuration
echo "4️⃣  Testing Apache configuration..."
sudo apache2ctl configtest

# Update .htaccess to exclude /api from rewriting
echo "5️⃣  Updating .htaccess file..."
sudo tee /home/mapit/public_html/.htaccess > /dev/null <<'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite real files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Don't rewrite /api requests - let them through to the proxy
  RewriteCond %{REQUEST_URI} !^/api/

  # Rewrite everything else to index.html for SPA routing
  RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>
EOF

# Restart Apache
echo "6️⃣  Restarting Apache..."
sudo systemctl restart apache2

# Verify setup
echo "✅ Setup complete!"
echo ""
echo "Verification:"
echo "  - Apache modules: $(apache2ctl -M | grep -c proxy)"
echo "  - Apache status: $(sudo systemctl is-active apache2)"
echo "  - Backend status: $(cd /home/mapit/backend && npx pm2 list 2>/dev/null | grep -c online || echo 'unknown')"
echo ""
echo "Test the API:"
echo "  curl -i https://mapit.optimalservers.online/api/health"
