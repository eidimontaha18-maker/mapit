# 🔧 Debugging: Failed to Load Module Script Error

## Problem
When accessing `/view-map/13`, you see:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.
```

## What This Error Means
The browser tried to load a JavaScript file (like `/assets/index-BkcmZvVh.js`) but received HTML content instead. This typically happens when:

1. ✗ A rewrite rule is too aggressive and catches static file requests
2. ✗ The server returns 404 and the rewrite returns `index.html`
3. ✗ The browser tries to execute HTML as JavaScript

## Root Cause (Most Likely)
Your Vercel deployment's rewrite rules are catching requests for static assets and rewriting them to `index.html`.

## Solutions Attempted

### ✅ Solution 1: Improved vercel.json (CURRENT)
```json
{
  "rewrites": [
    {
      "source": "/api(/|$)",
      "destination": "/api"
    },
    {
      "source": "/assets(/|$)",
      "destination": "/assets"
    },
    {
      "source": "/((?!api|assets).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key improvements:**
- Explicitly excludes `/api` from rewrite
- Explicitly excludes `/assets` from rewrite
- Uses negative lookahead to catch everything else

### ✅ Solution 2: vite.config.ts
```typescript
appType: 'spa'  // Tells Vite this is a single-page app
```

## Manual Testing Steps

### Step 1: Check if Assets Load
Open browser DevTools (F12) and go to **Network** tab, then visit:
```
https://mapit-....vercel.app/view-map/13
```

Look for these files:
- `index.html` - Should return 200 with HTML ✅
- `assets/index-BkcmZvVh.js` - Should return 200 with JavaScript ✅
- `assets/index-DZw3wKZn.css` - Should return 200 with CSS ✅

If any show 304 (cached), right-click and select **"Clear browser cache"** or use `Ctrl+Shift+Delete`.

### Step 2: Check Network Response Types
In DevTools Network tab:
- `index.html` → Type: `document` ✅
- `assets/index-*.js` → Type: `script` ✅
- `assets/index-*.css` → Type: `stylesheet` ✅

If JavaScript files show Type: `document`, this is the problem!

### Step 3: Check Response Headers
Click on the `.js` file in Network tab, go to **Response Headers**:
```
content-type: application/javascript
```

Should NOT be:
```
content-type: text/html
```

### Step 4: Test Static Asset Directly
In a new tab, try accessing the JavaScript file directly:
```
https://mapit-....vercel.app/assets/index-BkcmZvVh.js
```

Should show the JavaScript code, not HTML!

## If Still Not Working

### Option A: Try a Different Vercel Configuration

**Alternative 1 - Using framework detection:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```
(Let Vercel auto-detect React/SPA)

**Alternative 2 - Explicit static routing:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "public": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option B: Check for API Route Conflicts
Make sure no `/api/` files in src folder conflict with backend.

Run:
```bash
find src -path "*api*" -type f
```

### Option C: Clear Vercel Cache
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Deployments
4. Find the problematic deployment
5. Click ... (menu)
6. Select **"Redeploy"**

Wait 5-10 minutes for rebuild.

### Option D: Force a Fresh Deploy
```bash
# Trigger a new deployment
git add -A
git commit --allow-empty -m "Force Vercel redeploy"
git push origin main
```

## Vercel Logs Check

1. Go to https://vercel.com
2. Select your **mapit** project
3. Click **"Deployments"** tab
4. Click the latest deployment
5. Click **"Build Logs"** to see build output
6. Click **"Runtime Logs"** to see request logs

Look for:
- ❌ Errors about rewrite rules
- ❌ Files returning 404
- ❌ Incorrect MIME types

## Network Request Flow

### ✅ Correct Flow
```
Browser: GET /view-map/13
  ↓
Vercel: Match /((?!api|assets).*) → rewrite to /index.html
  ↓
Browser receives: /index.html with correct HTML MIME type
  ↓
Browser parses HTML and finds: <script src="/assets/index-BkcmZvVh.js">
  ↓
Browser: GET /assets/index-BkcmZvVh.js
  ↓
Vercel: Matches /assets - DO NOT REWRITE
  ↓
Browser receives: JavaScript file with correct MIME type ✅
```

### ❌ Incorrect Flow (What's Happening)
```
Browser: GET /view-map/13
  ↓
Vercel: Rewrite to /index.html ✅
  ↓
Browser parses and finds: <script src="/assets/index-BkcmZvVh.js">
  ↓
Browser: GET /assets/index-BkcmZvVh.js
  ↓
Vercel: INCORRECTLY REWRITES to /index.html ❌
  ↓
Browser receives: HTML instead of JS
  ↓
Error: "Expected JavaScript but got HTML" ❌
```

## Files to Check/Modify

| File | Status | Action |
|------|--------|--------|
| `vercel.json` | ✅ Updated | Check rewrites exclude `/assets` |
| `vite.config.ts` | ✅ Updated | Has `appType: 'spa'` |
| `dist/index.html` | ✅ Generated | Should have relative asset paths |
| `package.json` | ✅ OK | Build command is correct |

## Expected Behavior After Fix

1. ✅ Visit `/view-map/13` → Page loads
2. ✅ Map component renders
3. ✅ All zones display correctly
4. ✅ No console errors
5. ✅ DevTools Network tab shows all assets with correct types

## Quick Checklist

- [ ] Updated `vercel.json` with proper rewrites (just pushed)
- [ ] Run `npm run build` locally to verify build works
- [ ] Pushed changes to main branch
- [ ] Waited 5+ minutes for Vercel redeploy
- [ ] Opened DevTools Network tab
- [ ] Checked that `/assets/*.js` files return `application/javascript` (not `text/html`)
- [ ] Cleared browser cache with Ctrl+Shift+Delete
- [ ] Hard refresh with Ctrl+Shift+R (or Cmd+Shift+R on Mac)

## Next Steps

1. **Wait 5 minutes** for Vercel to auto-deploy the new config
2. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
3. **Clear DevTools cache**: DevTools → Settings → Network → "Disable cache"
4. **Open DevTools** and check Network tab
5. **Screenshot** the error if it persists
6. Let me know what MIME type the `.js` files are returning

## Still Having Issues?

If the error persists after these changes, the issue might be:
1. Vercel cache not cleared
2. Browser cache persisting old build
3. Incorrect build configuration
4. API server misconfiguration

Please share:
- Screenshot of DevTools Network tab
- Vercel deployment logs (from Vercel dashboard)
- The exact URL where you see the error
