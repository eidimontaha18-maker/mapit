# 🚀 Quick Start Guide - Database Connection Fixed!

## ✅ What Was Fixed

All database connection errors have been resolved! Here's what changed:

### Before ❌
- Hardcoded database credentials in multiple files
- Multiple connection pools competing for resources
- Difficult to update configuration
- Connection errors when credentials changed

### After ✅
- Centralized configuration in `.env` file
- Single shared connection pool
- Easy to update - just edit `.env`
- Proper error handling and connection management

## 📋 Quick Commands

### Test Database Connection
```powershell
npm run db:test
```
This will verify your database is working before starting anything.

### Start Server (with DB check)
```powershell
npm run server:check
```
Tests database first, then starts the server if OK.

### Start Server (direct)
```powershell
npm run server
```
Starts the server at http://127.0.0.1:3101

### Start Frontend
```powershell
npm run dev
```
Starts Vite dev server at http://localhost:5173

### Start Everything
```powershell
# Terminal 1: Start backend
npm run server:check

# Terminal 2: Start frontend
npm run dev
```

## 🔧 Configuration File

Your `.env` file contains all database settings:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=mapit
DB_USER=postgres
DB_PASSWORD=NewStrongPass123
DATABASE_URL=postgres://postgres:NewStrongPass123@localhost:5432/mapit
```

**To change database settings:** Just edit the `.env` file!

## 📁 Files Updated

### Created
- ✅ `.env` - Environment variables
- ✅ `config/database.js` - Centralized config
- ✅ `test-db-config.js` - Connection tester
- ✅ `start-with-check.js` - Safe startup script
- ✅ `DATABASE_CONFIG_GUIDE.md` - Full documentation

### Updated
- ✅ `server.js` - Now uses centralized config
- ✅ `src/db/dbOperations.js` - Now uses shared pool
- ✅ `db-connection.js` - Now loads from .env
- ✅ `package.json` - Added helper scripts

## 🎯 Common Tasks

### Change Database Password
1. Update `.env` file:
   ```env
   DB_PASSWORD=YourNewPassword
   DATABASE_URL=postgres://postgres:YourNewPassword@localhost:5432/mapit
   ```
2. Test: `npm run db:test`
3. Restart server: `npm run server`

### Use Different Database
1. Update `.env` file:
   ```env
   DB_NAME=mapit_dev
   DATABASE_URL=postgres://postgres:NewStrongPass123@localhost:5432/mapit_dev
   ```
2. Create database if needed:
   ```sql
   CREATE DATABASE mapit_dev;
   ```
3. Test: `npm run db:test`

### Connect to Remote Database
1. Update `.env` file:
   ```env
   DB_HOST=192.168.1.100
   DATABASE_URL=postgres://postgres:pass@192.168.1.100:5432/mapit
   ```
2. Test: `npm run db:test`

## 🐛 Troubleshooting

### "Connection refused"
```powershell
# Check if PostgreSQL is running
net start postgresql-x64-14

# Or check services
Get-Service -Name postgresql*
```

### "Authentication failed"
Check your password in `.env` matches PostgreSQL:
```env
DB_PASSWORD=YourActualPassword
```

### "Database does not exist"
Create it in psql:
```sql
CREATE DATABASE mapit;
```

### Import says "Cannot find module"
Install dependencies:
```powershell
npm install
```

## 📊 Verify Everything Works

Run this sequence to verify complete setup:

```powershell
# 1. Test database
npm run db:test
# Should show: ✅ Database connected successfully!

# 2. Start server
npm run server:check
# Should show: Server running at http://127.0.0.1:3101

# 3. In another terminal, test API
curl http://127.0.0.1:3101/api/health
# Should return: {"status":"ok","time":"..."}
```

## 🎉 Success!

You can now:
- ✅ Start your server without connection errors
- ✅ Easily change database configuration
- ✅ Test connections before starting
- ✅ Have a single source of truth for all DB config

## 📚 More Information

For detailed documentation, see:
- `DATABASE_CONFIG_GUIDE.md` - Full configuration guide
- `README.md` - Project documentation

## 🆘 Need Help?

If you encounter any issues:

1. Run: `npm run db:test`
2. Check the error message
3. Verify `.env` file settings
4. Make sure PostgreSQL is running
5. Check database exists: `psql -U postgres -l`

---

**Remember:** All database configuration is now in the `.env` file. Update once, works everywhere! 🎊
