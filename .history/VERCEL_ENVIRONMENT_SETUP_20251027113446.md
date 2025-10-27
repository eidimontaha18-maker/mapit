# Vercel Environment Configuration Guide

## ✅ Local Changes Completed

The `.env` file has been cleaned up. Only the `DATABASE_URL` is kept, and old DB_* variables have been removed.

## 🚀 Vercel Deployment Configuration

### Step 1: Delete Old Environment Variables in Vercel

Go to your Vercel project dashboard and **delete these variables**:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

### Step 2: Add the DATABASE_URL Environment Variable

Add only this single environment variable:

**Variable Name:** `DATABASE_URL`

**Value:**
```
postgresql://neondb_owner:npg_myJ8NBtrH3xo@ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Environment:** Select all environments (Production, Preview, Development)

### Step 3: Redeploy

After updating the environment variables, trigger a new deployment:

1. Go to the "Deployments" tab in Vercel
2. Click the three dots next to your latest deployment
3. Select "Redeploy"

OR

1. Push a new commit to your repository
2. Vercel will automatically deploy

## 📋 How to Configure Environment Variables in Vercel

### Via Vercel Dashboard:

1. Go to https://vercel.com
2. Select your project
3. Click on "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Delete the old DB_* variables if they exist
6. Add the new `DATABASE_URL` variable
7. Click "Save"

### Via Vercel CLI:

```bash
# Remove old variables
vercel env rm DB_HOST production
vercel env rm DB_PORT production
vercel env rm DB_NAME production
vercel env rm DB_USER production
vercel env rm DB_PASSWORD production

# Add the DATABASE_URL
vercel env add DATABASE_URL production
# When prompted, paste the connection string
```

## ✅ Verification

After deployment, your API endpoints should work correctly:

- `/api/packages` - Get all packages
- `/api/login` - Customer login
- `/api/register` - Customer registration
- `/api/admin/login` - Admin login
- `/api/admin/maps` - Admin maps list
- `/api/admin/orders` - Admin orders
- `/api/admin/stats` - Admin statistics

## 🔍 All API Files Are Already Updated

The following files are already configured correctly with `Pool` and `DATABASE_URL`:

- ✅ `/api/packages.js`
- ✅ `/api/login.js`
- ✅ `/api/register.js`
- ✅ `/api/admin/login.js`
- ✅ `/api/admin/maps.js`
- ✅ `/api/admin/orders.js`
- ✅ `/api/admin/stats.js`

No code changes are needed!

## 📝 Updated .env File

Your local `.env` file now contains only the essential environment variables:

```env
# ==========================================
# Neon PostgreSQL Database Configuration
# ==========================================

# Neon Database Connection String (Primary - used by all API endpoints)
DATABASE_URL=postgresql://neondb_owner:npg_myJ8NBtrH3xo@ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# ==========================================
# Application Server Configuration
# ==========================================

# Server Port (Node.js Express server)
PORT=3101
SERVER_HOST=127.0.0.1

# ==========================================
# Frontend Configuration
# ==========================================

# API URL for frontend to connect to backend
VITE_API_URL=http://127.0.0.1:3101

# ==========================================
# CORS Configuration
# ==========================================

CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3101
CORS_MAX_AGE=86400
```

## 🎯 Summary

**What was changed:**
- ✅ Removed redundant DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD from `.env`
- ✅ All API files already use Pool with DATABASE_URL

**What you need to do:**
1. Delete old DB_* variables from Vercel dashboard
2. Ensure DATABASE_URL is set in Vercel (all environments)
3. Redeploy your application

**The error should be resolved after these steps!**
