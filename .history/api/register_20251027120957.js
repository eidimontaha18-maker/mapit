// API endpoint for customer registration
import pkg from 'pg';
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

  const { name, email, password, package_id } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password required' });
  }

  try {
    // Split name into first_name and last_name
    const nameParts = name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ') || '';

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT customer_id FROM customer WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    // Insert new customer (using password_hash column with plain password for now)
    const result = await pool.query(
      'INSERT INTO customer (first_name, last_name, email, password_hash, registration_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING customer_id, first_name, last_name, email',
      [first_name, last_name, email, password]
    );

    const user = result.rows[0];
    return res.status(201).json({
      success: true,
      user: {
        customer_id: user.id,
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
