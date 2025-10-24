import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const PORT = 3101;
const HOST = '127.0.0.1';
const CONNECTION_STRING = 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';

const app = express();

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Create database pool
const pool = new Pool({ connectionString: CONNECTION_STRING });

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT NOW() as now');
    res.json({ status: 'ok', time: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { first_name, last_name, email, password } = req.body ?? {};
  console.log('[POST /api/register] incoming body:', req.body);
  
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'All fields (first_name, last_name, email, password) are required.' 
    });
  }
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new customer
    const result = await pool.query(
      `INSERT INTO customer (first_name, last_name, email, password_hash, registration_date) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING customer_id, first_name, last_name, email`,
      [first_name, last_name, email.toLowerCase().trim(), hashedPassword]
    );
    
    const newCustomer = result.rows[0];
    console.log('[POST /api/register] successfully registered:', newCustomer.email);
    
    return res.status(201).json({
      success: true,
      user: {
        customer_id: newCustomer.customer_id,
        email: newCustomer.email,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name
      }
    });
  } catch (err) {
    console.error('[POST /api/register] error:', err);
    
    // Check for unique constraint violation (email already exists)
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Email already registered.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: err.message || 'Registration failed.'
    });
  }
});

// Get maps for a specific customer with zone counts
app.get('/api/customer/:customer_id/maps', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { customer_id } = req.params;
  
  if (!customer_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Customer ID is required.' 
    });
  }
  
  try {
    // Get all maps for this customer with zone counts
    const result = await pool.query(`
      SELECT 
        m.map_id,
        m.title,
        m.description,
        m.created_at,
        m.active,
        m.country,
        COUNT(z.id) as zone_count
      FROM map m
      LEFT JOIN zones z ON m.map_id = z.map_id
      WHERE m.customer_id = $1
      GROUP BY m.map_id, m.title, m.description, m.created_at, m.active, m.country
      ORDER BY m.created_at DESC;
    `, [customer_id]);
    
    console.log(`[GET /api/customer/${customer_id}/maps] Found ${result.rows.length} maps`);
    
    return res.json({
      success: true,
      maps: result.rows
    });
  } catch (err) {
    console.error(`[GET /api/customer/${customer_id}/maps] error:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch maps.'
    });
  }
});

// Get zones for a specific map
app.get('/api/map/:map_id/zones', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { map_id } = req.params;
  
  if (!map_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Map ID is required.' 
    });
  }
  
  try {
    // Get all zones for this map
    const result = await pool.query(`
      SELECT 
        id,
        map_id,
        name,
        color,
        coordinates,
        created_at,
        updated_at,
        customer_id
      FROM zones
      WHERE map_id = $1
      ORDER BY created_at DESC;
    `, [map_id]);
    
    console.log(`[GET /api/map/${map_id}/zones] Found ${result.rows.length} zones`);
    
    return res.json({
      success: true,
      zones: result.rows
    });
  } catch (err) {
    console.error(`[GET /api/map/${map_id}/zones] error:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch zones.'
    });
  }
});

// Login endpoint
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
    let isPasswordValid = false;
    
    // First try bcrypt comparison (for hashed passwords starting with $2b$)
    if (user.password_hash.startsWith('$2b$')) {
      try {
        isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log('[POST /api/login] using bcrypt verification');
      } catch (bcryptError) {
        console.log('[POST /api/login] bcrypt error:', bcryptError.message);
        isPasswordValid = false;
      }
    } else {
      // Try base64 decoding first (for legacy base64 encoded passwords)
      try {
        const decodedPassword = Buffer.from(user.password_hash, 'base64').toString();
        isPasswordValid = (password === decodedPassword);
        console.log('[POST /api/login] using base64 decoding verification');
      } catch (base64Error) {
        // If base64 fails, try plain text comparison
        console.log('[POST /api/login] base64 failed, trying plain text comparison');
        isPasswordValid = (password === user.password_hash);
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

// Start server
async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connection successful');
    
    app.listen(PORT, HOST, () => {
      console.log(`✅ API server running on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

start();
