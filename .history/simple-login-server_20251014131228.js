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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
