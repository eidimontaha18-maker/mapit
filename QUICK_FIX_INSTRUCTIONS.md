# ⚡ QUICK FIX: Run These Commands on Your Server

Your server is running low on resources. Here's how to fix the login issue manually.

## SSH to Your Server

```bash
ssh -p 2408 mapit@109.123.241.15
```

## Copy & Paste This Entire Block (All at Once)

```bash
# Enable Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http  
sudo a2enmod rewrite
sudo a2enmod headers

# Create reverse proxy config
sudo bash -c 'cat > /etc/apache2/conf-available/mapit-proxy.conf << "EOF"
ProxyPreserveHost On
ProxyPass /api http://127.0.0.1:3101/api
ProxyPassReverse /api http://127.0.0.1:3101/api

<Location /api>
  Order allow,deny
  Allow from all
</Location>
EOF'

# Enable it
sudo a2enconf mapit-proxy

# Test syntax
sudo apache2ctl configtest

# Update .htaccess
sudo bash -c 'cat > /home/mapit/public_html/.htaccess << "EOF"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/

  RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>
EOF'

# Restart Apache
sudo systemctl restart apache2

echo "✅ DONE!"
```

## Back on Your Local Machine

Upload the new frontend (already built):

```bash
cd /Users/toufic/mapit

# Upload frontend files
scp -P 2408 -r dist/* mapit@109.123.241.15:/home/mapit/public_html/

# Upload .htaccess
scp -P 2408 htaccess-with-api-proxy mapit@109.123.241.15:/home/mapit/public_html/.htaccess
```

## Test It Works

```bash
# Test 1: Health check
curl -i https://mapit.optimalservers.online/api/health

# Test 2: Login endpoint
curl -X POST https://mapit.optimalservers.online/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

## Visit Your App

Open: https://mapit.optimalservers.online

Try logging in!

---

## If Something Goes Wrong

**Check Apache:**
```bash
ssh -p 2408 mapit@109.123.241.15 'sudo systemctl status apache2'
```

**Check Backend:**
```bash
ssh -p 2408 mapit@109.123.241.15 'cd /home/mapit/backend && npx pm2 list'
```

**View Errors:**
```bash
ssh -p 2408 mapit@109.123.241.15 'sudo tail -30 /var/log/apache2/error.log'
```

---

That's it! The login should work now. 🎉
