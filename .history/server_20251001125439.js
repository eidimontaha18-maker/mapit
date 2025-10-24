import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
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

// Handle invalid JSON bodies explicitly so frontend gets JSON instead of HTML
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && 'status' in err) {
    console.error('[BodyParser] Invalid JSON:', err.message);
    return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
  }
  next(err);
});

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
  res.setHeader('Content-Type', 'application/json');
  const { first_name, last_name, email, password } = req.body ?? {};
  console.log('[POST /api/register] incoming body:', req.body);
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields (first_name, last_name, email, password) are required.' });
  }
  try {
    // Use synchronous bcrypt hash to avoid callback/promise mismatch
    const password_hash = bcrypt.hashSync(password, 10);
    const insertSql = `INSERT INTO customer (first_name, last_name, email, password_hash) VALUES ($1,$2,$3,$4)`;
    await pool.query(insertSql, [
      first_name.trim(),
      last_name.trim(),
      email.toLowerCase().trim(),
      password_hash
    ]);
    console.log('[POST /api/register] inserted customer:', email.toLowerCase().trim());
    return res.status(201).json({ success: true, error: null });
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
