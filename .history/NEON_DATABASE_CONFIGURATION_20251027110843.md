# Neon Database Configuration Guide

## Overview

This project uses **Neon PostgreSQL** as the database backend. All database operations are performed directly through the Node.js `pg` library using connection pooling.

## ✅ What We Use

- **Database**: Neon PostgreSQL (Serverless Postgres)
- **Connection**: Direct connection using `pg` (node-postgres) library
- **Backend API**: Custom Express.js server (port 3101)
- **Frontend**: React + Vite (port 5173)

## ❌ What We Don't Use

- ~~PostgREST~~ (Removed - not needed)
- ~~Local PostgreSQL~~ (Using cloud Neon instead)

## Configuration Files

### 1. `.env` - Main Configuration

```env
# Neon PostgreSQL Database
DATABASE_URL=postgresql://neondb_owner:npg_myJ8NBtrH3xo@ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Application Server
PORT=3101
SERVER_HOST=127.0.0.1

# Frontend
VITE_API_URL=http://127.0.0.1:3101

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3101
```

### 2. `config/database.js` - Database Connection

This file creates a **single shared connection pool** used by all API endpoints:

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default { pool };
```

### 3. API Endpoints

All API endpoints in `server.js` use the shared pool:

```javascript
import dbConfig from './config/database.js';
const pool = dbConfig.pool;

// Example: Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query(
    'SELECT * FROM customers WHERE email = $1 AND password = $2',
    [email, password]
  );
  // ...
});
```

## How It Works

```
┌─────────────────┐
│  React Frontend │ (Port 5173)
│   (Vite Dev)    │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│  Express Server │ (Port 3101)
│   (server.js)   │
└────────┬────────┘
         │ SQL Queries
         │ via pg Pool
         ▼
┌─────────────────┐
│  Neon Database  │ (Cloud)
│   PostgreSQL    │
└─────────────────┘
```

## Database Tables

The following tables are created in Neon:

1. **customers** - Customer accounts
2. **admins** - Admin accounts
3. **maps** - Map data
4. **zones** - Zone data for maps
5. **packages** - Subscription packages
6. **orders** - Customer orders

## Setup Instructions

### First Time Setup

1. **Get Neon Credentials**
   ```
   - Go to https://console.neon.tech
   - Copy your connection string
   ```

2. **Update .env File**
   ```bash
   # Replace with your actual Neon connection string
   DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST.neon.tech/YOUR_DB?sslmode=require
   ```

3. **Create Database Tables**
   ```bash
   node setup-database-tables.js
   ```

4. **Start the Server**
   ```bash
   npm run server
   ```

5. **Start Frontend**
   ```bash
   npm run dev
   ```

### Verifying Configuration

**Test Database Connection:**
```bash
node -e "import('./config/database.js').then(db => db.default.testConnection())"
```

**Expected Output:**
```
✅ Database connected successfully!
📊 Database: neondb
👤 User: neondb_owner
🕒 Time: 2025-10-27T...
```

## Common Issues & Solutions

### Issue: "relation does not exist"

**Cause**: Tables not created in database

**Solution**:
```bash
node setup-database-tables.js
```

### Issue: "Connection timeout"

**Cause**: Wrong DATABASE_URL or SSL configuration

**Solution**: 
- Verify DATABASE_URL in `.env`
- Ensure `sslmode=require` is in connection string
- Check Neon console for correct credentials

### Issue: "CORS error"

**Cause**: Frontend URL not in CORS_ORIGINS

**Solution**: Add to `.env`:
```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Architecture Benefits

### ✅ Simple & Direct
- No middleware layer (PostgREST)
- Direct SQL queries with full control
- Easy to debug

### ✅ Scalable
- Neon handles connection pooling
- Serverless scaling
- Pay-per-use pricing

### ✅ Secure
- SSL/TLS encryption
- Connection pooling
- Prepared statements (SQL injection prevention)

## File Structure

```
mapit/
├── .env                    # Environment configuration (Neon credentials)
├── .env.example            # Template for .env
├── config/
│   └── database.js         # Database connection setup
├── server.js               # Express API server
├── api/
│   ├── login.js           # Login endpoint
│   ├── register.js        # Registration endpoint
│   └── ...                # Other API endpoints
├── setup-database-tables.js # Database setup script
└── package.json           # Dependencies
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon connection string | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `PORT` | Express server port | `3101` |
| `VITE_API_URL` | Frontend API URL | `http://127.0.0.1:3101` |
| `CORS_ORIGINS` | Allowed frontend URLs | `http://localhost:5173` |

## Testing the Setup

### 1. Test Database Connection
```bash
node setup-database-tables.js
```

### 2. Test API Health
```bash
curl http://127.0.0.1:3101/api/health
```

Expected: `{"status":"ok","time":"2025-10-27T..."}`

### 3. Test Login
Open browser to `http://localhost:5173/login` and use:
- Email: `test@mapit.com`
- Password: `test123`

## Maintenance

### View Database Tables
```javascript
// In Neon SQL Editor or via node
const result = await pool.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
`);
```

### Backup Data
Neon provides automatic backups. To export:
1. Go to Neon Console
2. Select your database
3. Click "Export" or use `pg_dump`

### Update Connection String
If you rotate credentials:
1. Update `DATABASE_URL` in `.env`
2. Restart server: `npm run server`

## Summary

✅ **Database**: Neon PostgreSQL (cloud)  
✅ **Connection**: Direct via `pg` library  
✅ **API**: Express.js on port 3101  
✅ **Frontend**: React + Vite on port 5173  
❌ **PostgREST**: Not used (removed)

Your configuration is now clean, simple, and optimized for Neon!
