import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

const app = express();
const port = 3001;

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
