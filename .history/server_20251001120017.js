import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
});

app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const password_hash = Buffer.from(password).toString('base64'); // For demo only
    await pool.query(
      'INSERT INTO customer (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4)',
      [first_name, last_name, email, password_hash]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test database connection first
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('PostgreSQL connection successful');
  }
});

// Add error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Start server - try different approaches to binding
try {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log('Server details:', server.address());
  });

  server.on('error', (err) => {
    console.error('Error starting server:', err);
    // If port is in use, try another one
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port 3001...`);
      const altServer = app.listen(3001, () => {
        console.log(`Server running on alternative port: http://localhost:3001`);
        console.log('Alternative server details:', altServer.address());
      });
    }
  });
} catch (err) {
  console.error('Fatal error starting server:', err);
}
