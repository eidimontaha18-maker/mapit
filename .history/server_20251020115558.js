import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dbRoutes from './routes/db-routes.js';
import zoneRoutes from './routes/zone-routes.js';
const { Pool } = pg;

// Configuration (could move to .env later)
// Primary server configuration per user request - configured for consistent saving
const PORT = process.env.PORT || 3101;
const HOST = '127.0.0.1';
const CONNECTION_STRING = 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // Allow Vite dev server at 5174, 5175, 5176
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5176'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));
app.use(express.json());
app.use(express.static('public'));

// Handle invalid JSON bodies explicitly so frontend gets JSON instead of HTML
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && 'status' in err) {
    console.error('[BodyParser] Invalid JSON:', err.message);
    return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
  }
  next(err);
});

// Universal request logger (after body parse / invalid JSON handler)
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[REQ] ${req.method} ${req.path} content-type=${req.headers['content-type'] || ''}`);
    if (req.method !== 'GET') {
      console.log('[REQ BODY]', req.body);
    }
  }
  next();
});

const pool = new Pool({ connectionString: CONNECTION_STRING });

function hashPassword(plain) {
  try {
    return bcrypt.hashSync(plain, 10);
  } catch (e) {
    console.error('[hashPassword] bcrypt failed, falling back to base64:', e?.message || e);
    return Buffer.from(plain).toString('base64');
  }
}

// Health / info routes
app.get('/api/health', async (_req, res) => {
  try {
    const r = await pool.query('SELECT NOW() as now');
    res.json({ status: 'ok', time: r.rows[0].now });
  } catch (e) {
    const message = e && typeof e === 'object' && 'message' in e ? e.message : 'Unknown error';
    res.status(500).json({ status: 'error', error: message });
  }
});

app.get('/api/test', (_req, res) => {
  res.json({ message: 'Server is working!' });
});

// Diagnostic echo route
app.post('/api/echo', (req, res) => {
  res.json({ success: true, received: req.body });
});

// Registration route
app.post('/api/register', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { first_name, last_name, email, password } = req.body ?? {};
  console.log('[POST /api/register] incoming body:', req.body);
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields (first_name, last_name, email, password) are required.' });
  }
  try {
    // Use synchronous bcrypt hash to avoid callback/promise mismatch
  const password_hash = hashPassword(password);
    const insertSql = `INSERT INTO customer (first_name, last_name, email, password_hash) VALUES ($1,$2,$3,$4)`;
    await pool.query(insertSql, [
      first_name.trim(),
      last_name.trim(),
      email.toLowerCase().trim(),
      password_hash
    ]);
  console.log('[POST /api/register] inserted customer:', email.toLowerCase().trim());
  const payload = { success: true, error: null };
  console.log('[POST /api/register] response payload:', payload);
  return res.status(201).json(payload);
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      console.warn('[POST /api/register] duplicate email attempt:', email);
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }
    console.error('[POST /api/register] unexpected error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to register user.';
    return res.status(500).json({ success: false, error: message });
  }
});

// Login route
// Map creation endpoint
app.post('/api/map', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { title, description, map_data, map_bounds, active, country, map_code, customer_id } = req.body ?? {};
  
  console.log('[POST /api/map] creating map:', title);
  console.log('[POST /api/map] customer_id:', customer_id);
  
  if (!title || !customer_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Title and customer_id are required.' 
    });
  }
  
  try {
    // First, check if customer_id column exists in the map table
    let columnExists = false;
    try {
      const columnCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'map' AND column_name = 'customer_id'
      `);
      columnExists = columnCheck.rows.length > 0;
    } catch (err) {
      console.error('[POST /api/map] Error checking customer_id column:', err);
    }
    
    // If column doesn't exist, add it
    if (!columnExists) {
      console.log('[POST /api/map] Adding customer_id column to map table');
      try {
        await pool.query(`
          ALTER TABLE map ADD COLUMN customer_id INTEGER REFERENCES customer(customer_id)
        `);
        console.log('[POST /api/map] Successfully added customer_id column');
      } catch (err) {
        console.error('[POST /api/map] Error adding customer_id column:', err);
        // Continue anyway, as the error might just be that another request already added the column
      }
    }
    
    // Insert map into database
    const insertSql = `
      INSERT INTO map (title, description, map_data, map_bounds, active, country, map_code, customer_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING map_id
    `;
    
    const result = await pool.query(insertSql, [
      title,
      description || null,
      map_data || {},
      map_bounds || {},
      active !== undefined ? active : true,
      country || null,
      map_code || null,
      customer_id
    ]);
    
    const map_id = result.rows[0]?.map_id;

    console.log('[POST /api/map] created map with ID:', map_id);

    // Return using `map` key so the frontend (NewMapForm) finds `result.map.map_id`
    return res.status(201).json({
      success: true,
      map: {
        map_id,
        title,
        description,
        map_code: map_code || null
      }
    });
  } catch (err) {
    console.error('[POST /api/map] error:', err);
    const message = err && typeof err === 'object' && 'message' in err 
      ? err.message 
      : 'Failed to create map.';
    return res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// Map update endpoint
app.put('/api/map/:mapId', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { title, description, map_data, map_bounds, active, country, map_codes, customer_id } = req.body ?? {};
  const mapId = req.params.mapId;
  
  console.log('[PUT /api/map] updating map:', mapId);
  console.log('[PUT /api/map] customer_id:', customer_id);
  
  if (!title || !customer_id || !mapId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Title, customer_id, and map_id are required.' 
    });
  }
  
  try {
    // Verify the map exists and belongs to this customer
    const checkResult = await pool.query(
      'SELECT map_id FROM map WHERE map_id = $1 AND customer_id = $2',
      [mapId, customer_id]
    );
    
    if (checkResult.rows.length === 0) {
      console.log('[PUT /api/map] map not found or not owned by customer:', customer_id);
      return res.status(404).json({ 
        success: false, 
        error: 'Map not found or you do not have permission to edit it.' 
      });
    }
    
    // Update the map record
    const updateSql = `
      UPDATE map
      SET title = $1, description = $2, map_data = $3, map_bounds = $4,
          active = $5, country = $6, map_codes = $7, updated_at = NOW()
      WHERE map_id = $8 AND customer_id = $9
      RETURNING map_id
    `;
    
    const result = await pool.query(updateSql, [
      title,
      description || null,
      map_data || {},
      map_bounds || {},
      active !== undefined ? active : true,
      country || null,
      map_codes || [],
      mapId,
      customer_id
    ]);
    
    if (result.rows.length === 0) {
      console.log('[PUT /api/map] update failed, no rows affected');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update map.' 
      });
    }
    
    console.log('[PUT /api/map] updated map with ID:', mapId);
    
    return res.status(200).json({
      success: true,
      record: {
        map_id: mapId,
        title,
        description,
        map_codes: map_codes || []
      }
    });
  } catch (err) {
    console.error('[PUT /api/map] error:', err);
    const message = err && typeof err === 'object' && 'message' in err 
      ? err.message 
      : 'Failed to update map.';
    return res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

app.post('/api/login', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { email, password } = req.body ?? {};
  console.log('[POST /api/login] attempting login for:', email);
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required.' 
    });
  }
  
  try {
    // Find user by email
    const result = await pool.query(
      'SELECT customer_id, email, first_name, last_name, password_hash FROM customer WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      console.warn('[POST /api/login] no user found with email:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password.' 
      });
    }
    
    const user = result.rows[0];

    // Verify password (handle bcrypt hashed, base64 encoded, and plain text passwords)
    let isPasswordValid = false;

    // Defensively handle missing or non-string password_hash to avoid runtime errors
    const pwdHash = (user && typeof user.password_hash === 'string') ? user.password_hash : '';

    // First try bcrypt comparison (for hashed passwords starting with $2b$)
    if (pwdHash.startsWith('$2b$')) {
      try {
        isPasswordValid = await bcrypt.compare(password, pwdHash);
        console.log('[POST /api/login] using bcrypt verification');
      } catch (bcryptError) {
        console.log('[POST /api/login] bcrypt error:', bcryptError.message);
        isPasswordValid = false;
      }
    } else {
      // Try base64 decoding first (for legacy base64 encoded passwords)
      try {
        const decodedPassword = pwdHash ? Buffer.from(pwdHash, 'base64').toString() : '';
        isPasswordValid = (password === decodedPassword);
        console.log('[POST /api/login] using base64 decoding verification');
      } catch (base64Error) {
        // If base64 fails, try plain text comparison
        console.log('[POST /api/login] base64 failed, trying plain text comparison');
        isPasswordValid = (password === pwdHash);
      }
    }
    
    if (!isPasswordValid) {
      console.warn('[POST /api/login] invalid password for:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password.' 
      });
    }
    
    // Return user data (excluding password_hash)
    console.log('[POST /api/login] successful login for:', email);
    return res.json({
      success: true,
      user: {
        customer_id: user.customer_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    console.error('[POST /api/login] error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Login failed.';
    return res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// Add database routes
app.use('/api/db', dbRoutes);

// Add zone management routes
app.use('/api/zones', zoneRoutes);

// 404 handler (after defined routes, before error handler)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  next();
});

// Central error handler (must have 4 args)
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Internal server error';
  res.status(500).json({ success: false, error: message });
});

// Start server
function start() {
  // Use specified port 3100 for consistency with configuration
  console.log(`Starting server on port ${PORT} (127.0.0.1)...`);
  
  const server = app.listen(PORT, HOST, () => {
    console.log(`✅ SUCCESS: API server running on http://${HOST}:${PORT}`);
    console.log(`📱 For client access use: http://localhost:${PORT}`);
  });
  
  server.on('error', (err) => {
    console.error(`❌ Error starting server on port ${PORT}:`, err.message);
    
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please free this port and try again.`);
      console.error(`❌ You can use 'netstat -ano | findstr ${PORT}' to find which process is using the port.`);
      process.exit(1);
    } else {
      console.error('❌ Failed to start server due to error:', err);
      process.exit(1);
    }
  });
}

// Test DB connection first then start server
pool.query('SELECT 1').then(() => {
  console.log('PostgreSQL connection successful');
  start();
}).catch(err => {
  console.error('Failed to connect to PostgreSQL:', err.message);
  start(); // still start to expose health endpoint with error state
});

// Handle uncaught errors to prevent server from crashing
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
