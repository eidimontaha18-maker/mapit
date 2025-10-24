import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dbRoutes from './routes/db-routes.js';
const { Pool } = pg;

// Configuration (could move to .env later)
// Primary server configuration per user request
const PORT = 3100;
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
    // Allow Vite dev server at 5174 as per current app URL
    'http://localhost:5174',
    'http://127.0.0.1:5174'
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
  const { title, description, map_data, map_bounds, active, country, map_codes, customer_id } = req.body ?? {};
  
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
      INSERT INTO map (title, description, map_data, map_bounds, active, country, map_codes, customer_id)
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
      map_codes || [],
      customer_id
    ]);
    
    const map_id = result.rows[0]?.map_id;
    
    console.log('[POST /api/map] created map with ID:', map_id);
    
    return res.status(201).json({
      success: true,
      record: {
        map_id,
        title,
        description,
        map_codes: map_codes || []
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
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
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
  // Try to listen on all interfaces with fallbacks
  const tryPorts = [PORT, 3000, 3002, 8080];
  let currentPortIndex = 0;
  
  function attemptListen() {
    const currentPort = tryPorts[currentPortIndex];
    console.log(`Attempting to start server on port ${currentPort}...`);
    
    const server = app.listen(currentPort, '127.0.0.1', () => {
      console.log(`✅ SUCCESS: API server running on http://127.0.0.1:${currentPort}`);
      console.log(`📱 For client access use: http://localhost:${currentPort}`);
      
      // Update the port in the RegisterPage if it's different
      if (currentPort !== PORT) {
        console.log(`⚠️ WARNING: Using fallback port ${currentPort} instead of configured port ${PORT}`);
        console.log(`⚠️ You will need to update your client to use http://localhost:${currentPort}`);
      }
    });
    
    server.on('error', (err) => {
      console.error(`❌ Error starting server on port ${currentPort}:`, err.message);
      
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${currentPort} is already in use.`);
        
        // Try next port
        currentPortIndex++;
        if (currentPortIndex < tryPorts.length) {
          console.log(`🔄 Trying next port ${tryPorts[currentPortIndex]}...`);
          attemptListen();
        } else {
          console.error('❌ Failed to bind to any available ports. Please manually specify an open port.');
          process.exit(1);
        }
      }
    });
  }
  
  // Start the attempt chain
  attemptListen();
}

// Test DB connection first then start server
pool.query('SELECT 1').then(() => {
  console.log('PostgreSQL connection successful');
  start();
}).catch(err => {
  console.error('Failed to connect to PostgreSQL:', err.message);
  start(); // still start to expose health endpoint with error state
});

export default app;
