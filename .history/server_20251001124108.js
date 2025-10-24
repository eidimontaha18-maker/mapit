import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

// Configuration (could move to .env later)
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const HOST = process.env.HOST || 'localhost';
const CONNECTION_STRING = process.env.DATABASE_URL || 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';

const app = express();

app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/],
  credentials: false
}));
app.use(express.json());

const pool = new Pool({ connectionString: CONNECTION_STRING });

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

// Registration route
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body ?? {};
  console.log('POST /api/register body:', req.body); // debug logging
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields (first_name, last_name, email, password) are required.' });
  }
  try {
    // NOTE: For production use a real password hash like bcrypt. Base64 is placeholder.
    const password_hash = Buffer.from(password).toString('base64');
    await pool.query(
      `INSERT INTO customer (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [first_name.trim(), last_name.trim(), email.toLowerCase().trim(), password_hash]
    );
    res.status(201).json({ success: true, error: null });
  } catch (err) {
    // Unique violation (duplicate email)
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }
    console.error('Registration error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to register user.';
    res.status(500).json({ success: false, error: message });
  }
});

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
  const server = app.listen(PORT, HOST, () => {
    console.log(`API server running on http://${HOST}:${PORT}`);
  });
  server.on('error', (err) => {
    console.error('Error starting server:', err);
    if (err && typeof err === 'object' && 'code' in err && err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} in use. Try: set PORT=3002 (Windows: $env:PORT=3002) and restart.`);
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

export default app;
