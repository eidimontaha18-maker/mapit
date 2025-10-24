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
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'All fields (first_name, last_name, email, password) are required.' });
  }
  try {
    // NOTE: For production use a real password hash like bcrypt. Base64 is placeholder.
    const password_hash = Buffer.from(password).toString('base64');
    await pool.query(
      `INSERT INTO customer (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [first_name, last_name, email.toLowerCase(), password_hash]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    // Unique violation (duplicate email)
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Central error handler (must have 4 args)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
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
