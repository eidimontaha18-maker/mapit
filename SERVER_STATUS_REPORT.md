# 🚨 Server Resource Issue - Status Report

## Current Problem

Your server at `109.123.241.15` is out of system resources (likely memory or file descriptors). This prevents new SSH sessions and deployments.

**Symptoms:**
- SSH connections fail with `/etc/bashrc: fork: retry: Resource temporarily unavailable`
- Cannot run any new commands or processes
- Existing processes may still be running in the background

## What We've Done Locally (✅ Complete)

✅ Updated `.env` with `VITE_API_URL=/api`  
✅ Updated CORS_ORIGINS to include domain  
✅ Rebuilt frontend with new API URL  
✅ Created Apache reverse proxy configuration  
✅ Created .htaccess to exclude /api from rewriting  
✅ Committed everything to GitHub  

**All changes are in GitHub:** https://github.com/eidimontaha18-maker/mapit

## What Still Needs to Happen (On Server)

1. **Enable Apache modules:** `a2enmod proxy proxy_http rewrite headers`
2. **Create reverse proxy config:** `/etc/apache2/conf-available/mapit-proxy.conf`
3. **Enable Apache config:** `a2enconf mapit-proxy`
4. **Update .htaccess:** `/home/mapit/public_html/.htaccess`
5. **Restart Apache:** `systemctl restart apache2`
6. **Upload new frontend files:** `dist/*` to `/home/mapit/public_html/`

## Solution Options

### Option A: Wait & Retry (If Server Auto-Recovers)
If the server process(es) crash or restart automatically:
1. Wait 10-15 minutes
2. Try deploying again
3. Follow the steps in `QUICK_FIX_INSTRUCTIONS.md`

### Option B: Manual Server Restart (Contact Host)
Contact your hosting provider to:
- Restart the VPS
- Check for runaway processes using excessive memory
- Verify system has sufficient resources

### Option C: Emergency Commands (If Connection Returns)

Once you can SSH again, run these commands **one at a time** to be safe:

```bash
# 1. Kill any runaway processes (optional, if needed)
# sudo pkill -9 npm  # if npm is stuck
# sudo pkill -9 node  # if node is stuck

# 2. Enable Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers

# 3. Create proxy config (single command)
sudo bash -c 'cat > /etc/apache2/conf-available/mapit-proxy.conf << "EOF"
ProxyPreserveHost On
ProxyPass /api http://127.0.0.1:3101/api
ProxyPassReverse /api http://127.0.0.1:3101/api
<Location /api>
  Order allow,deny
  Allow from all
</Location>
EOF'

# 4. Enable it
sudo a2enconf mapit-proxy

# 5. Test syntax
sudo apache2ctl configtest

# 6. Update .htaccess
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

# 7. Restart Apache
sudo systemctl restart apache2
```

### Option D: Use Control Panel (If Available)

If your hosting provider has a control panel (cPanel, Plesk, etc.):
1. Log in to the panel
2. Restart the VPS/server from there
3. Then deploy using the steps above

## Ready-to-Deploy Files

All files are prepared in the repo:

| File | Purpose |
|------|---------|
| `dist/` | Built frontend with new API URL |
| `htaccess-with-api-proxy` | Updated .htaccess (no /api rewriting) |
| `apache-proxy-config.conf` | Apache reverse proxy configuration |
| `setup-reverse-proxy.sh` | Automated setup script |
| `QUICK_FIX_INSTRUCTIONS.md` | Quick manual steps |
| `REVERSE_PROXY_SETUP_GUIDE.md` | Detailed guide |

## Next Steps

1. **Wait for server to recover** (5-15 minutes)
2. **Try SSH again:**
   ```bash
   ssh -p 2408 mapit@109.123.241.15
   ```

3. **If connection works:** Run the setup commands (Option C above)

4. **If connection still fails:** Contact hosting provider for server restart

## What This Fixes

Once deployed, the login error will be resolved because:

- Frontend at `https://mapit.optimalservers.online` will use relative paths `/api/login`
- Apache will reverse-proxy `/api/*` requests to `localhost:3101`
- Backend receives requests as if they came from localhost
- No CORS issues or "Invalid response from server" errors

## Current Frontend Status

**Frontend URL:** https://mapit.optimalservers.online  
**Status:** Last deployed successfully with new `.env`  
**Issue:** Old version is still cached on server (needs dist files updated)

## Backend Status

**Backend URL:** http://localhost:3101 (not externally exposed)  
**Status:** Running via PM2 (should be online)  
**Issue:** Not accessible until Apache proxy is configured

---

## Quick Reference: What to Do When Server Comes Back

```bash
# SSH into server
ssh -p 2408 mapit@109.123.241.15

# Run all setup commands
sudo a2enmod proxy proxy_http rewrite headers
sudo bash -c 'cat > /etc/apache2/conf-available/mapit-proxy.conf << "EOF"
ProxyPreserveHost On
ProxyPass /api http://127.0.0.1:3101/api
ProxyPassReverse /api http://127.0.0.1:3101/api
<Location /api>
  Order allow,deny
  Allow from all
</Location>
EOF'
sudo a2enconf mapit-proxy
sudo apache2ctl configtest
sudo systemctl restart apache2

# Exit and upload from local machine
exit

# From local machine:
cd /Users/toufic/mapit
scp -P 2408 -r dist/* mapit@109.123.241.15:/home/mapit/public_html/
scp -P 2408 htaccess-with-api-proxy mapit@109.123.241.15:/home/mapit/public_html/.htaccess

# Test
curl https://mapit.optimalservers.online/api/health
```

**That's it!** Login should work after this.

---

**Last updated:** October 29, 2025 - 22:45 UTC  
**Status:** Awaiting server resource recovery
