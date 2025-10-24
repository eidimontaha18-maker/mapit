// Quick server test
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const PORT = 3101;

app.use(cors({origin: '*'}));
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is working!' });
});

app.get('/api/db/tables/map', async (req, res) => {
  try {
    const customer_id = req.query.customer_id;
    console.log('Fetching maps for customer:', customer_id);
    
    if (!customer_id) {
      return res.json({ success: true, records: [] });
    }
    
    const result = await pool.query(
      'SELECT * FROM map WHERE customer_id = $1 ORDER BY created_at DESC',
      [customer_id]
    );
    
    console.log('Found maps:', result.rows.length);
    res.json({ success: true, records: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    
    const result = await pool.query(
      'SELECT customer_id, email, first_name, last_name FROM customer WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        customer_id: user.customer_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Test server running on http://127.0.0.1:${PORT}`);
  console.log(`📱 Access at http://localhost:${PORT}`);
});
