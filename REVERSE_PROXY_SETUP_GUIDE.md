# MapIt Login Fix: Reverse Proxy Setup Guide

## Problem
The login returns "Invalid response from server" because the frontend is trying to call `/api/login` but Apache wasn't configured to forward those requests to the Node.js backend on `localhost:3101`.

## Solution: Apache Reverse Proxy

By configuring Apache to reverse-proxy `/api/*` requests to the Node.js backend, you can:
- Keep backend running on `localhost:3101` (secure, not exposed)
- Access it via the domain: `https://mapit.optimalservers.online/api/*`
- Frontend uses relative paths: `/api/login`, `/api/register`, etc.
- SSL termination at Apache (secure end-to-end)

---

## Step-by-Step Setup (Manual)

### Step 1: Enable Apache Modules (on server)

SSH into your server and run:

```bash
ssh -p 2408 mapit@109.123.241.15

# Enable required Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
```

### Step 2: Create Apache Reverse Proxy Configuration (on server)

```bash
# Create the reverse proxy configuration file
sudo nano /etc/apache2/conf-available/mapit-proxy.conf
```

Paste this content:

```apache
# MapIt API Reverse Proxy
ProxyPreserveHost On
ProxyPass /api http://127.0.0.1:3101/api
ProxyPassReverse /api http://127.0.0.1:3101/api

# Allow proxy for /api paths
<Location /api>
  Order allow,deny
  Allow from all
</Location>
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Enable the Configuration (on server)

```bash
# Enable the Apache configuration
sudo a2enconf mapit-proxy

# Check syntax
sudo apache2ctl configtest

# Should output: Syntax OK
```

### Step 4: Update .htaccess (on server)

Edit `/home/mapit/public_html/.htaccess`:

```bash
nano /home/mapit/public_html/.htaccess
```

Replace all content with this (ensures /api requests aren't rewritten to index.html):

```apache
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
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Restart Apache (on server)

```bash
sudo systemctl restart apache2
```

### Step 6: Deploy Updated Frontend (on your local machine)

The `.env` has already been updated to use `VITE_API_URL=/api`. The frontend was rebuilt.

Now upload the new frontend to the server (from your local machine):

```bash
cd /Users/toufic/mapit

# Upload the new built frontend
scp -P 2408 -r dist/* mapit@109.123.241.15:/home/mapit/public_html/

# Upload the updated .htaccess
scp -P 2408 htaccess-with-api-proxy mapit@109.123.241.15:/home/mapit/public_html/.htaccess
```

---

## Verification

### Test 1: Health Check (from your local machine)
```bash
curl -i https://mapit.optimalservers.online/api/health
```

Expected response: `200 OK` with JSON like:
```json
{"status": "ok", "time": "2025-10-29..."}
```

### Test 2: Login Test (from your local machine)
```bash
curl -X POST https://mapit.optimalservers.online/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

Expected response: `200 OK` (or 401 if invalid credentials, but the API is reachable!)

### Test 3: Browser Test
1. Visit https://mapit.optimalservers.online
2. Open DevTools (F12)
3. Go to Network tab
4. Try logging in
5. Click on the `login` request (should be a POST to `/api/login`)
6. Check Status: Should be `200` or `401` (not a CORS error)
7. Check Response: Should see JSON with `success: false` or `success: true`

---

## What Changed

### `.env` Changes
```diff
- VITE_API_URL=http://109.123.241.15:3101
+ VITE_API_URL=/api
```

### Frontend Changes
- Now uses **relative paths** for API calls: `/api/login`, `/api/register`, etc.
- Apache reverse-proxies these to `localhost:3101`

### Backend Changes
- **No changes** to backend code or configuration
- Still running on `localhost:3101`
- Still protected from external direct access (secure)

### Apache Changes
- New reverse proxy rule forwards `/api/*` to Node.js backend
- Updated `.htaccess` to not rewrite `/api/*` requests

---

## Troubleshooting

### Still getting "Invalid response from server"

1. **Check Apache is running:**
   ```bash
   sudo systemctl status apache2
   ```
   Should show: `active (running)`

2. **Check backend is running:**
   ```bash
   npx pm2 list
   ```
   Should show `mapit-api` as `online`

3. **Check Apache syntax:**
   ```bash
   sudo apache2ctl configtest
   ```
   Should show: `Syntax OK`

4. **Check port 3101 is listening (on server):**
   ```bash
   ss -tlnp | grep 3101 | grep -v IPv6
   ```
   Should show: `127.0.0.1:3101`

5. **Check reverse proxy is enabled:**
   ```bash
   apache2ctl -M | grep proxy
   ```
   Should show: `proxy_module`, `proxy_http_module`

6. **View Apache error logs:**
   ```bash
   sudo tail -50 /var/log/apache2/error.log
   ```

### CORS Errors

The backend `.env` CORS_ORIGINS has been updated to include:
- `https://mapit.optimalservers.online`
- `http://109.123.241.15`
- `http://127.0.0.1:3101`
- And others

If you still see CORS errors, the backend may need a restart:
```bash
cd /home/mapit/backend
npx pm2 restart mapit-api --update-env
```

---

## Files Changed/Created

- **`.env`** - Updated `VITE_API_URL=/api` and CORS_ORIGINS
- **`dist/`** - Rebuilt with new API URL
- **`htaccess-with-api-proxy`** - New .htaccess content (no /api rewriting)
- **`apache-proxy-config.conf`** - Apache reverse proxy configuration
- **`deploy-with-proxy.sh`** - Automated deployment script (optional)

---

## Next Steps

1. Follow the manual setup steps above, OR
2. Run the automated deployment script:
   ```bash
   cd /Users/toufic/mapit
   ./deploy-with-proxy.sh
   ```

3. Test login at https://mapit.optimalservers.online

4. Commit changes to GitHub:
   ```bash
   git add -A
   git commit -m "Fix login: configure Apache reverse proxy for /api"
   git push origin main
   ```

---

## How It Works (Diagram)

```
Browser → https://mapit.optimalservers.online
           ↓
        Apache (port 443 - HTTPS)
           ↓
        Frontend (HTML/CSS/JS)
           ↓
        User clicks "Login"
           ↓
        JavaScript fetch('/api/login')
           ↓
        Apache sees /api/* request
           ↓
        Apache Reverse Proxy Rule:
        ProxyPass /api → http://127.0.0.1:3101/api
           ↓
        Node.js Backend (localhost:3101)
           ↓
        Query Database (Neon PostgreSQL)
           ↓
        Return login response
           ↓
        Apache passes response back
           ↓
        Browser receives JSON response
           ↓
        JavaScript processes login success/failure
```

---

## Security Benefits

✅ Backend not exposed to internet (only localhost)
✅ API requests go through Apache SSL termination
✅ Single SSL certificate for domain
✅ CORS properly configured
✅ No credentials in URL or environment variables (Neon connection string protected)
✅ Frontend and backend on same domain (no cross-origin issues)

---

**Questions?** Check the troubleshooting section or view logs with:
```bash
ssh -p 2408 mapit@109.123.241.15 "tail -50 /var/log/apache2/error.log"
ssh -p 2408 mapit@109.123.241.15 "cd /home/mapit/backend && npx pm2 logs mapit-api"
```
