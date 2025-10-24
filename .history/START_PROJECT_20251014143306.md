# 🚀 MapIt Project Startup Guide

## ⚡ Quick Start (Tell the AI)

Just say one of these phrases:
- **"Start my servers"**
- **"Run the backend and frontend"**
- **"Start the MapIt project"**
- **"Launch my app"**

---

## 📋 What Happens Behind the Scenes

### Step 1: Start PostgreSQL Database
Your PostgreSQL database should already be running as a Windows service.
- **Port:** 5432
- **Database:** mapit
- **User:** postgres
- **Password:** NewStrongPass123

### Step 2: Start Backend Server (Port 3101)
```bash
node simple-login-server.js
```
This runs in Terminal 1 (keep it open!)

### Step 3: Start Frontend Server (Port 5173)
```bash
npm run dev
```
This runs in Terminal 2 (keep it open!)

---

## 🎯 Simple Phrases for the AI

### Starting
- "Start my servers"
- "Run the project"
- "Launch MapIt"

### Checking Status
- "Are my servers running?"
- "Check if backend is up"
- "Is the database connected?"

### Troubleshooting
- "Port 3101 is busy" → AI will kill old processes
- "Can't connect to database" → AI will verify PostgreSQL
- "Frontend not loading" → AI will restart Vite

---

## 🔍 How to Verify Everything Works

### 1. Backend Check
Open browser: http://localhost:3101/api/health
Should return: `{"status":"ok"}`

### 2. Frontend Check
Open browser: http://localhost:5173
Should show: Login page

### 3. Full Test
1. Login with: `eidimontaha20@gmail.com` / your password
2. See dashboard with your 6 maps
3. Click "Create New Map"
4. Fill form and create map
5. Draw zones and save

---

## 🛠️ Manual Commands (If AI Not Available)

### Windows PowerShell:

**Terminal 1 - Backend:**
```powershell
cd C:\Users\user\mapit
node simple-login-server.js
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\user\mapit
npm run dev
```

### If Ports Are Busy:
```powershell
# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Restart servers
```

---

## 📁 Key Files

| File | Purpose | Port |
|------|---------|------|
| `simple-login-server.js` | Backend API | 3101 |
| `src/App.tsx` | Frontend entry | 5173 |
| PostgreSQL | Database | 5432 |

---

## 🐛 Common Issues & Solutions

### Issue 1: "Port 3101 already in use"
**Say:** "Port 3101 is busy, restart backend"
**Manual Fix:**
```powershell
netstat -ano | findstr "3101"
# Find PID, then:
taskkill /PID <number> /F
```

### Issue 2: "Cannot connect to database"
**Say:** "Check database connection"
**Manual Fix:** 
- Open Services (Win+R → `services.msc`)
- Find "postgresql-x64-15" 
- Click "Start" if stopped

### Issue 3: "Invalid user data" when creating map
**Say:** "I need to log out and log back in"
**Reason:** Old session data, needs refresh

### Issue 4: Zones not saving
**Say:** "Zones aren't saving"
**Check:** Backend terminal for error messages

---

## 🎓 Database Info

**Connection String:**
```
postgresql://postgres:NewStrongPass123@localhost:5432/mapit
```

**Tables:**
- `customer` - User accounts
- `map` - Your maps with map_codes
- `zones` - Polygons drawn on maps
- `customer_map` - Links customers to maps

---

## 🔐 Test Account

**Email:** eidimontaha20@gmail.com  
**Password:** (your password)  
**Customer ID:** 18  
**Current Maps:** 6 maps, 14 zones total

---

## ✅ Success Checklist

- [ ] PostgreSQL running (port 5432)
- [ ] Backend running (port 3101)
- [ ] Frontend running (port 5173)
- [ ] Can access http://localhost:5173
- [ ] Can login successfully
- [ ] Dashboard shows your maps
- [ ] Can create new maps
- [ ] Can draw and save zones
- [ ] Map codes display correctly

---

## 💡 Pro Tips

1. **Keep both terminals open** while using the app
2. **Backend logs** show all API requests - useful for debugging
3. **Hard refresh** browser (Ctrl+F5) after code changes
4. **Check browser console** (F12) for frontend errors
5. **PostgreSQL password** is stored in simple-login-server.js line 14

---

## 🆘 Emergency Reset

If everything is broken:

```powershell
# 1. Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Wait
Start-Sleep -Seconds 3

# 3. Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\user\mapit; node simple-login-server.js"

# 4. Wait
Start-Sleep -Seconds 2

# 5. Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\user\mapit; npm run dev"
```

Or just tell the AI: **"Emergency restart everything"**

---

## 📞 What to Say Tomorrow

### Option 1 (Simplest):
> "Start my servers"

### Option 2 (Detailed):
> "Start the backend on port 3101 and frontend on port 5173"

### Option 3 (If issues):
> "Something is wrong, help me start the project. Check if ports are busy first."

---

## 🎯 Current Project Status

- ✅ Backend API: 14 endpoints working
- ✅ Frontend: React + TypeScript + Vite
- ✅ Database: PostgreSQL with 4 tables
- ✅ Authentication: Working with bcrypt
- ✅ Maps: 6 maps created
- ✅ Zones: 14 zones saved
- ✅ Map Codes: Auto-generating (MAP-XXXX-XXXX)
- ✅ Modern UI: Purple gradients, white background

---

**Last Updated:** October 14, 2025  
**Version:** 1.0  
**Your Email:** eidimontaha20@gmail.com

---

## 🌟 You're All Set!

Just say **"Start my servers"** and you're good to go! 🚀
