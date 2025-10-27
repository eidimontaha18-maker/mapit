// API endpoint for customer login
import pkg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    // Test database connection first
    console.log('Testing database connection...');
    await pool.query('SELECT 1');
    console.log('Database connected successfully');

    console.log('Attempting login for:', email);
    
    const result = await pool.query(
      'SELECT customer_id, email, first_name, last_name, password_hash FROM customer WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('No user found with provided credentials');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    // Check password (password_hash field contains base64 encoded password)
    // Decode the stored password and compare with provided password
    const storedPassword = Buffer.from(user.password_hash, 'base64').toString('utf-8');
    
    if (storedPassword !== password) {
      console.log('Invalid password');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    console.log('User found:', user.customer_id);
    
    return res.status(200).json({
      success: true,
      user: {
        customer_id: user.customer_id,
        id: user.customer_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
