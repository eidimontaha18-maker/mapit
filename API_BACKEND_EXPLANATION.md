# Understanding /api Endpoints & Neon Database

## 🎯 What Do the /api Endpoints Do?

The `/api` endpoints are a **Node.js backend server** that acts as the middleman between your frontend and Neon database. They handle:

### Key /api Endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/register` | POST | Create new user account |
| `/api/login` | POST | Authenticate user (customer or admin) |
| `/api/admin/login` | POST | Admin authentication |
| `/api/map` | POST | Create new map |
| `/api/map/:id` | GET | Fetch a specific map |
| `/api/map/:id` | PUT | Update map details |
| `/api/map/:id` | DELETE | Delete a map |
| `/api/map/:id/zones` | GET | Get all zones for a map |
| `/api/zone` | POST | Create a new zone |
| `/api/zone/:id` | PUT | Update zone |
| `/api/zone/:id` | DELETE | Delete zone |
| `/api/customer/:id/maps` | GET | Get all maps for a customer |
| `/api/packages` | GET | Get all packages |
| `/api/orders` | GET | Get all orders |
| `/api/admin/stats` | GET | Admin dashboard statistics |

## 🗄️ Why You Need It (Even With Neon)

### ❌ Why You CAN'T Connect Frontend Directly to Neon:

```typescript
// ❌ BAD - Frontend direct connection (SECURITY RISK!)
const client = new Client({
  connectionString: 'postgresql://user:password@neon.tech/db'
});
// This exposes your DATABASE PASSWORD in browser JavaScript!
```

**Security Issues:**
1. Database credentials visible in client-side code
2. Anyone can read the password from browser
3. Malicious users can directly modify database
4. No validation of requests

### ✅ Why /api Endpoints Are Needed:

```typescript
// ✅ GOOD - Frontend → API Server → Neon Database
// Frontend:
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Backend API (Node.js server):
// 1. Validates input
// 2. Hashes password with bcrypt
// 3. Queries Neon database safely
// 4. Returns only necessary data
// 5. Never exposes database credentials
```

## 🏗️ Your Architecture

```
┌─────────────────────────────────────────────┐
│           Browser (Frontend)                 │
│  https://mapit.optimalservers.online        │
│  - React app (HTML/CSS/JS)                  │
│  - User login form                          │
│  - Map display                              │
└────────────────────┬────────────────────────┘
                     │ HTTP/HTTPS Request
                     │ POST /api/login
                     ↓
┌─────────────────────────────────────────────┐
│      Node.js API Server (/api)              │
│      Port 3101 (Internal)                   │
│  - Validates credentials                    │
│  - Hashes passwords (bcrypt)                │
│  - Business logic                           │
│  - Request authentication                   │
└────────────────────┬────────────────────────┘
                     │ Database Query
                     │ SELECT * FROM customer
                     ↓
┌─────────────────────────────────────────────┐
│      Neon PostgreSQL Database               │
│  ep-muddy-block-addvinpc.neon.tech         │
│  - Stores users, maps, zones, orders        │
│  - All data persisted securely              │
└─────────────────────────────────────────────┘
```

## 📍 Current Deployment Status

### ✅ Frontend Deployed:
- **URL:** https://mapit.optimalservers.online
- **Location:** `/home/mapit/public_html/`
- **Files:** HTML, CSS, JavaScript (built by Vite)
- **Status:** ✅ Working (landing page shows)

### ❌ Backend NOT Deployed:
- **API Server:** Not running on your hosting
- **Status:** ❌ Missing (login fails)
- **Result:** `/api/login` requests fail with "Invalid response from server"

### ✅ Database Ready:
- **Neon:** Already running in cloud
- **Status:** ✅ Ready to use
- **Connection:** Configured in `.env`

## 🚀 Two Options to Fix the Login Error

### Option 1: Deploy Backend on Your Custom Hosting (Recommended)
**Pros:**
- Full control over your server
- Fast response times
- No vendor lock-in
- Cheaper than Vercel

**Cons:**
- Need Node.js installed on your hosting
- Need to manage server updates
- Need PM2 for auto-restart

**Steps:**
1. Ask your hosting provider if Node.js is available
2. Run the deployment script I created: `./deploy-backend.sh`
3. Backend runs on port 3101 (internal)
4. Apache reverse proxy forwards `/api/*` requests to it

### Option 2: Use Vercel Serverless Functions (Alternative)
**Pros:**
- Automatic scaling
- No server management
- Always available

**Cons:**
- Cold start delays (first request is slow)
- More expensive than self-hosting
- Vendor lock-in to Vercel

**Steps:**
1. Deploy API routes to Vercel `/api/` folder
2. Update frontend to call Vercel API endpoints
3. Works but requires Vercel rewrite

### Option 3: Keep Both Local & Cloud (Current)
**For Local Development:**
- Run `npm run server` locally (port 3101)
- Run `npm run dev` locally (port 5173)
- Frontend calls `http://localhost:3101/api/*`
- ✅ Works perfectly for testing

**For Production (Custom Hosting):**
- Frontend is deployed ✅
- Backend is NOT deployed ❌
- This is why login fails!

## 🔧 What Happens During Login

### Frontend Code (React):
```typescript
const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'pass123' })
});
```

### Backend API (Node.js) - `/api/login`:
```javascript
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Query Neon database
  const result = await pool.query(
    'SELECT * FROM customer WHERE email = $1',
    [email]
  );
  
  if (result.rows.length === 0) {
    return res.json({ success: false, error: 'Invalid credentials' });
  }
  
  // 2. Verify password with bcrypt
  const user = result.rows[0];
  const isValid = bcrypt.compareSync(password, user.password_hash);
  
  if (!isValid) {
    return res.json({ success: false, error: 'Invalid credentials' });
  }
  
  // 3. Return user data
  return res.json({ 
    success: true, 
    user: { customer_id: user.customer_id, email: user.email } 
  });
});
```

### Why It Fails Now:
1. Frontend sends POST to `/api/login`
2. Custom hosting doesn't have Node.js server running
3. Apache returns 404 HTML page
4. Frontend tries to parse HTML as JSON
5. Error: "Invalid response from server"

## 💡 Recommendation

**Option 1 is best for you:** Deploy the backend on your custom hosting.

**Why:**
- You already have the hosting
- Node.js is typically available on shared hosting
- One-command deployment: `./deploy-backend.sh`
- No additional costs
- Full control

## What You Need to Do

**Step 1:** Check if Node.js is available on your hosting
```bash
ssh -p 1387 mapit@38.242.201.28 "node -v"
```

**Step 2:** If Node.js is available, run the backend deployment script
```bash
./deploy-backend.sh
```

**Step 3:** Verify backend is running
```bash
curl https://mapit.optimalservers.online/api/health
# Should return: {"status":"ok","time":"..."}
```

**Step 4:** Test login
- Go to https://mapit.optimalservers.online/login
- Enter test credentials
- Should work now! ✅

## Database Security

Your Neon connection is **secure** because:
1. ✅ Connection string in backend `.env` (not in browser)
2. ✅ SSL required (`sslmode=require`)
3. ✅ Password-protected database
4. ✅ Backend validates all requests
5. ✅ No direct database access from browser

## Summary

| Component | Status | Location |
|-----------|--------|----------|
| Frontend | ✅ Deployed | https://mapit.optimalservers.online |
| Backend API | ❌ NOT Deployed | Needed on your hosting |
| Database | ✅ Ready | Neon (cloud) |

**Next step:** Deploy the backend using `./deploy-backend.sh` to enable login functionality!
