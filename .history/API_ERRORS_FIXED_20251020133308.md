# 🔧 API 500 ERRORS - FIXED!

## ✅ Problem Solved

Your API was working fine, but the **frontend couldn't reach it** because of a proxy configuration issue.

---

## 🐛 What Was Wrong

### The Error
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
:5173/api/customer/20/maps
:5173/api/map
```

### Root Cause
- Frontend (Vite) runs on port **5173**
- Backend (Express) runs on port **3101**
- Frontend was trying to call `/api/...` which went to port **5173** (Vite)
- Vite proxy was configured but using `localhost` instead of `127.0.0.1`
- This caused connection issues

---

## ✅ What Was Fixed

### 1. Updated Vite Proxy Configuration
**File:** `vite.config.ts`

**Changed:**
```typescript
// Before
target: 'http://localhost:3101',

// After
target: 'http://127.0.0.1:3101',
```

**Also added better logging:**
- Logs proxy requests
- Logs proxy responses
- Logs proxy errors

### 2. Updated .env File
**File:** `.env`

**Added:**
```env
# Vite Frontend Configuration  
VITE_API_URL=http://127.0.0.1:3101
```

### 3. Created Unified Startup Script
**File:** `start-app.ps1`

A PowerShell script that:
1. ✅ Tests database connection first
2. ✅ Starts backend server (port 3101)
3. ✅ Verifies backend is running
4. ✅ Starts frontend (port 5173)
5. ✅ Cleans up both when you stop

### 4. Added npm Script
**File:** `package.json`

**Added:**
```json
"start:app": "powershell -ExecutionPolicy Bypass -File start-app.ps1"
```

---

## 🚀 How to Use

### Option 1: One Command to Start Everything (Recommended)
```powershell
npm run start:app
```

This will:
- Test database connection
- Start backend server
- Start frontend
- Open browser automatically

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```powershell
npm run server
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

---

## 📊 Verification

### Test Backend Directly
```powershell
# Start backend
npm run server

# In another terminal, test it
node test-api-quick.js
```

**Expected output:**
```
✅ Health Check      - Status: 200
✅ Test Endpoint     - Status: 200
✅ List Tables       - Status: 200

🎉 All tests passed!
```

### Test Full Stack
```powershell
# Start everything
npm run start:app
```

**Then open browser:** http://localhost:5173

**Expected:**
- ✅ Dashboard loads
- ✅ Maps are displayed
- ✅ Can create new maps
- ✅ No 500 errors in console

---

## 🔍 How the Proxy Works

### Frontend Request Flow

1. **Frontend makes request:**
   ```javascript
   fetch('/api/customer/20/maps')
   ```

2. **Vite intercepts** (because URL starts with `/api`):
   ```
   http://localhost:5173/api/customer/20/maps
   ```

3. **Vite proxy forwards to backend:**
   ```
   http://127.0.0.1:3101/api/customer/20/maps
   ```

4. **Backend processes and responds**

5. **Vite forwards response back to frontend**

### Console Logs You'll See

**In Vite terminal:**
```
🔄 Proxying: GET /api/customer/20/maps → /api/customer/20/maps
✅ Proxy response: GET /api/customer/20/maps → 200
```

**In Backend terminal:**
```
[REQ] GET /api/customer/20/maps content-type=
[GET /api/customer/20/maps] Found 3 maps
```

---

## 🐛 Troubleshooting

### Still Getting 500 Errors?

#### 1. Make sure backend is running
```powershell
# Check if backend is responding
curl http://127.0.0.1:3101/api/health
```

**Expected:** `{"status":"ok","time":"..."}`

#### 2. Check Vite proxy logs
Look for these in your Vite terminal:
```
🔄 Proxying: GET /api/... → /api/...
✅ Proxy response: GET /api/... → 200
```

If you see:
```
❌ Proxy error: ...
```

The backend isn't running or isn't accessible.

#### 3. Restart everything
```powershell
# Stop all Node processes
Get-Process -Name node | Stop-Process -Force

# Start fresh
npm run start:app
```

### Backend Won't Start?

```powershell
# Test database connection
npm run db:test

# If that fails, check PostgreSQL
Get-Service -Name postgresql*

# Start PostgreSQL if needed
net start postgresql-x64-14
```

### Port Already in Use?

```powershell
# Find what's using port 3101
netstat -ano | findstr :3101

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

## 📝 Configuration Summary

### Ports
- **Frontend (Vite):** 5173
- **Backend (Express):** 3101
- **PostgreSQL:** 5432
- **PostgREST:** 3100 (if using)

### URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:3101/api
- **Database:** postgres://postgres:NewStrongPass123@localhost:5432/mapit

### Files Changed
1. ✅ `vite.config.ts` - Updated proxy target and logging
2. ✅ `.env` - Added VITE_API_URL
3. ✅ `start-app.ps1` - Created unified startup script
4. ✅ `package.json` - Added start:app script

---

## ✨ What You Can Do Now

### Create Maps
```
1. Open http://localhost:5173
2. Login with your credentials
3. Click "New Map"
4. Fill in details
5. Click "Create Map"
```

**Expected:** ✅ Map created successfully!

### View Maps
```
1. Go to Dashboard
2. See all your maps
3. Click on a map to view/edit
```

**Expected:** ✅ Maps load with zone counts!

### Delete Maps
```
1. On Dashboard
2. Click delete icon on a map
3. Confirm deletion
```

**Expected:** ✅ Map deleted successfully!

---

## 🎉 Summary

**Before:** ❌ Frontend couldn't reach backend → 500 errors

**After:** ✅ Vite proxy forwards all `/api` requests to backend → Everything works!

### Quick Commands

```powershell
# Start everything (recommended)
npm run start:app

# Test database
npm run db:test

# Test API
node test-api-quick.js

# Start backend only
npm run server

# Start frontend only
npm run dev
```

---

## 📚 Next Steps

1. ✅ Start your app: `npm run start:app`
2. ✅ Open browser: http://localhost:5173
3. ✅ Login and test all features
4. ✅ Build amazing maps! 🗺️

**Everything is now configured correctly and ready to use!** 🎊
