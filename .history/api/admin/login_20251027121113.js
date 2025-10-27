// API endpoint for admin login
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

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    // Test database connection
    console.log('Admin login - Testing database connection...');
    await pool.query('SELECT 1');
    console.log('Admin login - Database connected');

    console.log('Attempting admin login for:', email);
    
    const result = await pool.query(
      'SELECT admin_id, email, first_name, last_name, password_hash FROM admin WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('No admin found with provided credentials');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    
    // Check password (comparing with password_hash field)
    if (admin.password_hash !== password) {
      console.log('Invalid password');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    console.log('Admin found:', admin.id);
    
    return res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
