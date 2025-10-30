# 📚 COMPLETE MANUAL CLOUDFLARE WORKER GUIDE

## Learn by Doing - Step by Step Through Web Dashboard

This guide shows you EXACTLY what buttons to click, what to paste, and what to expect.

---

## ✅ STEP 1: Create Cloudflare Account

### What to do:
1. Open browser: https://dash.cloudflare.com/sign-up
2. Enter your email address
3. Create a password (make it strong!)
4. Click "Create account"
5. Check your email - click the verification link
6. You're in! ✅

### What you'll see:
- Cloudflare dashboard with "Welcome!" message
- Option to add a domain (skip this for now)

---

## ✅ STEP 2: Navigate to Workers Section

### What to do:
1. In the left sidebar, look for **"Workers & Pages"** (it's around the middle)
2. Click on it
3. You'll see two tabs: **"Overview"** and **"Create application"**

### What you'll see:
- Empty Workers list (if this is your first time)
- A blue **"Create application"** button

---

## ✅ STEP 3: Create Your First Worker

### What to do:
1. Click the blue **"Create application"** button
2. You'll see two options:
   - **"Create Worker"** ← Click this one
   - "Create Pages Application"
3. Click **"Create Worker"**

### What you'll see:
- A dialog asking you to pick a name
- It suggests something like "worker-xyz"

### Name your worker:
- Replace the default name with: **`mapit-api`**
- Click **"Deploy"**

### What happens:
- Cloudflare deploys your worker (takes ~5 seconds)
- You see a "SUCCESS" message
- A default "Hello World" worker code appears

---

## ✅ STEP 4: Replace Worker Code

### What to do:
1. You should see a code editor with some default code
2. Look for the **"Editor"** tab (should already be selected)
3. **Select ALL the code** (Ctrl+A on Windows, Cmd+A on Mac)
4. **Delete it**
5. **Paste this complete code:**

```javascript
import { Pool } from '@neondatabase/serverless';
import { Router } from 'itty-router';

const router = Router();

function getPool(env) {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return new Pool({ connectionString: env.DATABASE_URL });
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'mapit-salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Health check
router.get('/api/health', async (request, env) => {
  try {
    const pool = getPool(env);
    const result = await pool.query('SELECT NOW() as now');
    return new Response(JSON.stringify({
      status: 'ok',
      time: result.rows[0].now,
      worker: 'mapit-cloudflare-worker',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// Login
router.post('/api/login', async (request, env) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email and password required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const pool = getPool(env);
    const userResult = await pool.query(
      'SELECT customer_id, email, first_name, last_name, password_hash FROM customer WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (userResult.rows.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email or password',
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const user = userResult.rows[0];
    const hashPasswordInput = await hashPassword(password);
    const passwordMatch = hashPasswordInput === user.password_hash;

    if (!passwordMatch) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email or password',
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        customer_id: user.customer_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// Register
router.post('/api/register', async (request, env) => {
  try {
    const { first_name, last_name, email, password, package_id } = await request.json();

    if (!first_name || !last_name || !email || !password || !package_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All fields required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const pool = getPool(env);
    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      'INSERT INTO customer (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING customer_id, email, first_name, last_name',
      [first_name.trim(), last_name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    return new Response(JSON.stringify({
      success: true,
      user: result.rows[0],
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// Get maps
router.get('/api/maps/:userId', async (request, env) => {
  try {
    const { userId } = request.params;
    const pool = getPool(env);

    const result = await pool.query(
      'SELECT * FROM map WHERE customer_id = $1',
      [userId]
    );

    return new Response(JSON.stringify({
      success: true,
      maps: result.rows,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// Get specific map
router.get('/api/map/:mapId', async (request, env) => {
  try {
    const { mapId } = request.params;
    const pool = getPool(env);

    const result = await pool.query(
      'SELECT * FROM map WHERE map_id = $1',
      [mapId]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Map not found',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      map: result.rows[0],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// Create map
router.post('/api/map', async (request, env) => {
  try {
    const { customer_id, name, description, zoom, center_lat, center_lon } = await request.json();
    const pool = getPool(env);

    const result = await pool.query(
      'INSERT INTO map (customer_id, name, description, zoom, center_lat, center_lon) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customer_id, name, description, zoom, center_lat, center_lon]
    );

    return new Response(JSON.stringify({
      success: true,
      map: result.rows[0],
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// CORS preflight
router.options('*', () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});

// 404
router.all('*', () => {
  return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});

export default router;
```

### What happens:
- Code appears in the editor
- Cloudflare auto-validates it
- No errors should appear ✅

---

## ✅ STEP 5: Add Environment Variable (DATABASE_URL)

### Why?
Your Worker needs to know how to connect to Neon. The `DATABASE_URL` is like the "key" to your database.

### Where to find your DATABASE_URL:
1. Open your `.env` file locally
2. Find the line: `DATABASE_URL=postgresql://...`
3. **Copy the entire string** (including `postgresql://`)

### How to add it to Cloudflare:
1. In the Worker editor, look for the **"Settings"** tab (next to "Editor")
2. Click **"Settings"**
3. On the left, find **"Variables"**
4. Click **"Add variable"** button
5. Fill in:
   - **Variable name:** `DATABASE_URL`
   - **Value:** Paste your DATABASE_URL from Step above
6. Click **"Encrypt"** (this makes it secure)
7. Click **"Save"** at the bottom

### What you'll see:
- The variable appears in the list
- It shows as `DATABASE_URL` with a checkmark ✅
- The actual value is hidden (for security)

---

## ✅ STEP 6: Deploy & Get Your Worker URL

### What to do:
1. After saving the variable, go back to the **"Editor"** tab
2. Look for the **"Save and Deploy"** button (blue button, top right)
3. Click it
4. Wait ~10 seconds for deployment to complete
5. You'll see: "✓ Deployed successfully"

### Get your Worker URL:
1. Look at the page - you should see your Worker name: **`mapit-api`**
2. Below it, you'll see a URL that looks like:
   ```
   https://mapit-api.YOUR-ACCOUNT.workers.dev
   ```
3. **Copy this entire URL** - you'll need it later

### Example:
If your account is "toufic", your URL would be:
```
https://mapit-api.toufic.workers.dev
```

---

## ✅ STEP 7: Test Your Worker

### Test 1: Health Check (prove it's working)

Open a terminal on your Mac and run:

```bash
curl https://mapit-api.YOUR-ACCOUNT.workers.dev/api/health
```

Replace `YOUR-ACCOUNT` with your actual Cloudflare account ID.

### Expected response:
```json
{
  "status": "ok",
  "time": "2025-10-30T09:15:32.123Z",
  "worker": "mapit-cloudflare-worker"
}
```

If you see this → **Your Worker is working!** ✅

### Test 2: Login Endpoint (test database connection)

```bash
curl -X POST https://mapit-api.YOUR-ACCOUNT.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Expected response:
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

This is GOOD! It means:
- Worker is running ✅
- Connected to Neon database ✅
- Querying customer table ✅
- User doesn't exist (expected) ✅

### Test 3: Create New User (Register)

```bash
curl -X POST https://mapit-api.YOUR-ACCOUNT.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "password123",
    "package_id": 1
  }'
```

### Expected response:
```json
{
  "success": true,
  "user": {
    "customer_id": 123,
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  }
}
```

Now you have a test user! ✅

### Test 4: Login with Test User

```bash
curl -X POST https://mapit-api.YOUR-ACCOUNT.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Expected response:
```json
{
  "success": true,
  "user": {
    "customer_id": 123,
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  }
}
```

**Success!** Your backend is working! 🎉

---

## ✅ STEP 8: Update Frontend to Use Your Worker

### What to do:
1. Open your `.env` file in the mapit folder
2. Find the line: `VITE_API_URL=...`
3. Replace it with your Worker URL:
   ```
   VITE_API_URL=https://mapit-api.YOUR-ACCOUNT.workers.dev
   ```

### Example:
```
VITE_API_URL=https://mapit-api.toufic.workers.dev
```

### Rebuild frontend:
```bash
cd /Users/toufic/mapit
npm run build
```

### Upload to server:
```bash
scp -P 2408 -r dist/* mapit@109.123.241.15:/home/mapit/public_html/
```

---

## ✅ STEP 9: Test Complete Flow

### Visit your app:
1. Open: https://mapit.optimalservers.online
2. Try logging in with your test user:
   - Email: `test@example.com`
   - Password: `password123`
3. You should login successfully! ✅

---

## 📊 What You Learned

### Cloudflare Workers:
- ✅ Created a serverless backend
- ✅ Connected to Neon PostgreSQL
- ✅ Deployed globally (250+ data centers)
- ✅ Auto-scales to handle traffic
- ✅ No server to manage or maintain
- ✅ Free tier: 100k requests/day
- ✅ Cost: $5/month after free tier

### Key Concepts:
- **Workers** = Serverless JavaScript running on Cloudflare edge
- **Environment Variables** = Secrets stored securely
- **Router** = Maps HTTP requests to functions
- **CORS** = Allows frontend to call backend from different domain

---

## 🎯 Summary

Your architecture now looks like this:

```
User Browser
    ↓
https://mapit.optimalservers.online (Frontend)
    ↓ API calls to:
https://mapit-api.YOUR-ACCOUNT.workers.dev (Cloudflare Worker - Backend)
    ↓ Queries:
Neon PostgreSQL Database
```

**Everything is serverless, auto-scaling, and costing you almost nothing!** 🚀

---

## ❓ Questions?

- **Forgot your Worker URL?** Go to Workers & Pages → mapit-api → look at the URL
- **Need to update code?** Go to Settings → Editor → paste new code → Save and Deploy
- **Need to change DATABASE_URL?** Go to Settings → Variables → edit it
- **Worker not working?** Check browser DevTools (F12) → Network tab → see error details

You're ready to deploy! Let me know when you're done with Cloudflare setup. 🎉
