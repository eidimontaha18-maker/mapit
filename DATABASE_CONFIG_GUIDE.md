# Database Configuration Guide

This guide explains how the database connection is configured in the MapIt project.

## ✅ Configuration Files

### 1. `.env` File (Environment Variables)
The `.env` file contains all your database credentials and configuration:

```env
# Database Connection
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=mapit
DB_USER=postgres
DB_PASSWORD=NewStrongPass123

# Full Database URI
DATABASE_URL=postgres://postgres:NewStrongPass123@localhost:5432/mapit

# PostgREST Configuration
POSTGREST_HOST=127.0.0.1
POSTGREST_PORT=3100
POSTGREST_DB_URI=postgres://postgres:NewStrongPass123@localhost:5432/mapit
POSTGREST_DB_SCHEMAS=public
POSTGREST_DB_ANON_ROLE=anon

# CORS Settings
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173
CORS_MAX_AGE=86400

# API Base URL
API_URL=http://127.0.0.1:3100
```

### 2. `config/database.js` (Centralized Config)
This file imports the `.env` variables and creates a shared database pool that all other files use.

**Benefits:**
- ✅ Single source of truth
- ✅ No hardcoded credentials
- ✅ Shared connection pool (better performance)
- ✅ Easy to update configuration

## 🚀 Quick Start

### 1. Test Database Connection
```powershell
node test-db-config.js
```

This will verify:
- Database credentials are correct
- PostgreSQL is running
- Connection can be established

### 2. Start Your Application
```powershell
# Start the Node.js server
npm run server

# In another terminal, start the frontend
npm run dev
```

### 3. Start PostgREST (Optional)
```powershell
postgrest postgrest.conf
```

## 📁 File Structure

```
mapit/
├── .env                      # Environment variables (DO NOT commit!)
├── config/
│   └── database.js          # Centralized DB configuration
├── server.js                # Main Express server
├── src/
│   └── db/
│       └── dbOperations.js  # Database operations
├── routes/
│   ├── db-routes.js         # Database API routes
│   └── zone-routes.js       # Zone management routes
└── test-db-config.js        # Connection test script
```

## 🔧 How It Works

### Before (❌ Multiple Hardcoded Connections)
Each file had its own hardcoded connection:
```javascript
// server.js
const pool = new Pool({ 
  connectionString: 'postgres://postgres:pass@localhost:5432/mapit' 
});

// dbOperations.js
const pool = new Pool({ 
  connectionString: 'postgres://postgres:pass@localhost:5432/mapit' 
});
```

**Problems:**
- Had to update credentials in multiple files
- Multiple connection pools (inefficient)
- Easy to make mistakes
- Hard to maintain

### After (✅ Centralized Configuration)
All files import from one place:
```javascript
// config/database.js
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// server.js
import dbConfig from './config/database.js';
const { pool } = dbConfig;

// dbOperations.js
import { pool } from '../../config/database.js';
```

**Benefits:**
- Update `.env` file once, works everywhere
- Single shared connection pool
- Type-safe configuration
- Easy to test and debug

## 🔐 Security Best Practices

1. **Never commit `.env` to git**
   ```bash
   # .gitignore should contain:
   .env
   .env.local
   .env.*.local
   ```

2. **Use strong passwords**
   - Default: `NewStrongPass123`
   - Change in production!

3. **Different environments**
   ```env
   # Development
   DATABASE_URL=postgres://postgres:devpass@localhost:5432/mapit_dev

   # Production
   DATABASE_URL=postgres://postgres:strongpass@prod-server:5432/mapit_prod
   ```

## 🐛 Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** PostgreSQL is not running
```powershell
# Start PostgreSQL service
net start postgresql-x64-14
```

### Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**Solution:** Check credentials in `.env` file

### Database Does Not Exist
```
Error: database "mapit" does not exist
```
**Solution:** Create the database
```sql
CREATE DATABASE mapit;
```

### Pool Exhausted
```
Error: Connection pool exhausted
```
**Solution:** Increase pool size in `config/database.js`
```javascript
export const dbConfig = {
  // ...
  max: 50, // Increase from default 20
};
```

## 📊 Monitoring

### Check Active Connections
```sql
SELECT count(*) 
FROM pg_stat_activity 
WHERE datname = 'mapit';
```

### View Connection Pool Status
```javascript
import dbConfig from './config/database.js';

console.log('Total:', dbConfig.pool.totalCount);
console.log('Idle:', dbConfig.pool.idleCount);
console.log('Waiting:', dbConfig.pool.waitingCount);
```

## 🔄 Migration from Old Setup

If you have old files with hardcoded connections:

1. **Find all database connections:**
   ```powershell
   findstr /s /i "new Pool" *.js
   ```

2. **Replace with centralized config:**
   ```javascript
   // Old
   const pool = new Pool({ 
     connectionString: 'postgres://...' 
   });

   // New
   import { pool } from './config/database.js';
   ```

3. **Test thoroughly:**
   ```powershell
   node test-db-config.js
   npm run server
   ```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [PostgREST Documentation](https://postgrest.org/)
- [dotenv Documentation](https://github.com/motdotla/dotenv)

## ✨ Summary

You now have:
- ✅ `.env` file with all credentials
- ✅ Centralized `config/database.js`
- ✅ All files using shared configuration
- ✅ Test script to verify connections
- ✅ No more hardcoded credentials
- ✅ Easy to maintain and update

**To change database settings:** Just update the `.env` file! 🎉
