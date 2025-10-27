// API endpoint for customer registration
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

  const { name, first_name, last_name, email, password, package_id } = req.body;

  // Handle both name formats: single "name" field or separate "first_name"/"last_name"
  let firstName, lastName;
  
  if (first_name && last_name) {
    // Form sends first_name and last_name separately
    firstName = first_name;
    lastName = last_name;
  } else if (name) {
    // Legacy format with single name field
    const nameParts = name.trim().split(' ');
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ') || '';
  } else {
    return res.status(400).json({ success: false, error: 'Name (or first_name/last_name) required' });
  }

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  try {
    const existingUser = await pool.query(
      'SELECT customer_id FROM customer WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    // Hash password using bcrypt (more secure than base64)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new customer
    const result = await pool.query(
      'INSERT INTO customer (first_name, last_name, email, password_hash, registration_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING customer_id, first_name, last_name, email',
      [firstName, lastName, email, hashedPassword]
    );

    const user = result.rows[0];
    return res.status(201).json({
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
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
