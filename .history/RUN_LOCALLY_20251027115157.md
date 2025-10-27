# Running MapIt Locally with Neon Database

## ✅ Your Setup (No PostgREST Required!)

Your application connects directly to Neon database using the `pg` library. PostgREST is NOT needed!

## 🚀 How to Run Locally

### Option 1: Run Both Frontend and Backend (Recommended)

```powershell
# Terminal 1 - Start Backend Server
npm run server

# Terminal 2 - Start Frontend Dev Server
npm run dev
```

Then open: http://localhost:5173

### Option 2: Run Everything in One Command

```powershell
npm run dev:full
```

### Option 3: Use the PowerShell Script

```powershell
npm run start:app
```

## 📋 What's Happening?

1. **Backend Server** (Port 3101)
   - Runs Express.js server
   - Connects directly to Neon PostgreSQL database
   - Serves API endpoints (`/api/*`)
   - Uses `DATABASE_URL` from `.env`

2. **Frontend Dev Server** (Port 5173)
   - Runs Vite development server
   - Makes API calls to `http://127.0.0.1:3101`
   - Hot-reload enabled for development

## 🔧 Configuration Files

### `.env` - Environment Variables
```env
DATABASE_URL=postgresql://neondb_owner:...@ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3101
SERVER_HOST=127.0.0.1
VITE_API_URL=http://127.0.0.1:3101
```

### `config/database.js` - Database Connection
- Creates PostgreSQL connection pool
- Uses `DATABASE_URL` from environment
- SSL enabled for Neon
- Shared across all API endpoints

### `server.js` - Express Backend
- API routes for customers, maps, zones, packages, etc.
- Direct database queries using `pg` pool
- CORS enabled for local development

## ✅ No PostgREST Needed Because:

- ✅ Direct PostgreSQL connection using `pg` library
- ✅ Custom API endpoints in Express.js
- ✅ Full control over queries and business logic
- ✅ Works with Neon database out of the box

## 🧪 Test the Connection

```powershell
# Test database connection
node verify-neon-packages.js

# List all tables
node list-neon-tables.js

# Test backend API
curl http://127.0.0.1:3101/api/health
curl http://127.0.0.1:3101/api/packages
```

## 📦 Available API Endpoints

- `GET /api/health` - Check server and database status
- `GET /api/packages` - Get all packages
- `POST /api/register` - Register new customer
- `POST /api/login` - Customer login
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Admin dashboard stats
- `GET /api/admin/maps` - List all maps
- `GET /api/admin/orders` - List all orders
- And many more...

## 🎯 Quick Start

1. **Make sure `.env` file exists with `DATABASE_URL`**
2. **Open two terminals**
3. **Terminal 1:** `npm run server`
4. **Terminal 2:** `npm run dev`
5. **Open browser:** http://localhost:5173

That's it! Your app is running locally with Neon database! 🎉
