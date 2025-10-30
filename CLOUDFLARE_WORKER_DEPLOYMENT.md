# 🚀 Deploy MapIt to Cloudflare Workers

## ⚡ QUICK: 5-Minute Web Dashboard Deployment

**No CLI! No local setup! Just use your browser.**

### Before you start:
1. Have your Neon `DATABASE_URL` from `.env` ready
2. Create Cloudflare account at https://dash.cloudflare.com/sign-up
3. **Read the full guide:** `CLOUDFLARE_MANUAL_SETUP_GUIDE.md` for detailed steps

---

## Quick Steps Summary

### 1. Get Your Neon Connection String

From your `.env` file, copy your DATABASE_URL:
```
postgresql://neondb_owner:npg_myJ8NBtrH3xo@ep-muddy-block-addvinpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## 2. Create Cloudflare Account

Go to: https://dash.cloudflare.com/sign-up
- Enter email
- Create password
- Verify email
- Done! ✅

---

## Step 4: Add Your Worker Code

1. Click your `mapit-api` worker to open it
2. Click the **Editor** tab
3. **Delete all default code**
4. **Paste this code:**

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

5. Click **Save and Deploy**

---

## Step 5: Add Environment Variables

1. Click **Settings** tab
2. Scroll to **Variables**
3. Click **Add variable**
4. **Name:** `DATABASE_URL`
5. **Value:** Paste your Neon connection string (from Step 1)
6. Click **Add**
7. Click **Save and Deploy**

---

## Step 6: Get Your Worker URL

1. Go to the **Deployments** tab
2. You should see your recent deployment
3. Click the Worker URL (looks like: `https://mapit-api.your-account.workers.dev`)
4. **Copy this URL**

---

## Step 7: Update Your Frontend

Update `.env` in your mapit folder:

```bash
VITE_API_URL=https://mapit-api.your-account.workers.dev
```

Replace `your-account` with your actual Cloudflare account identifier.

Rebuild and redeploy frontend:

```bash
npm run build
# Then upload dist/ to your server
```

---

## Step 8: Test It!

```bash
# Test health
curl https://mapit-api.your-account.workers.dev/api/health

# Test login (should return 401 since invalid creds, but proves API works)
curl -X POST https://mapit-api.your-account.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

---

## Verify Everything

Visit: https://mapit.optimalservers.online

Try logging in - it should work! ✅

---

## Benefits of Cloudflare Workers

✅ **No server to manage** - Fully serverless  
✅ **Auto-scales globally** - 250+ data centers  
✅ **Free tier:** 100k requests/day  
✅ **Ultra-fast** - Responds in milliseconds  
✅ **Reliable** - 99.99% uptime  
✅ **Cost:** ~$0-5/month after free tier  
✅ **Keep Neon** - Your existing database  

---

## Troubleshooting

### Worker returning 404
- Make sure you **pasted the full code**
- Make sure you **clicked Save and Deploy**
- Clear browser cache: Ctrl+Shift+Delete

### DATABASE_URL error
- Check the variable is set in **Settings > Variables**
- Verify the connection string is correct
- Make sure no typos in the URL

### CORS errors
- The code includes `'Access-Control-Allow-Origin': '*'` on all responses
- Verify frontend is calling the correct Worker URL

### Login failing
- Test the health endpoint first: `/api/health`
- Check if your database has test users
- View browser console for error messages

---

**That's it! Your backend is now serverless on Cloudflare! 🎉**
