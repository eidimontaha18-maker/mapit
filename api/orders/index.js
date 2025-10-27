// API endpoint for orders management
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
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all orders or filter by customer_id
      const { customer_id } = req.query;

      let query = `
        SELECT 
          o.id,
          o.customer_id,
          o.package_id,
          o.date_time,
          o.total,
          o.status,
          o.created_at,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email,
          p.name as package_name,
          p.price as package_price
        FROM orders o
        LEFT JOIN customer c ON o.customer_id = c.customer_id
        LEFT JOIN packages p ON o.package_id = p.package_id
      `;

      const params = [];
      
      if (customer_id) {
        query += ' WHERE o.customer_id = $1';
        params.push(customer_id);
      }

      query += ' ORDER BY o.date_time DESC';

      const result = await pool.query(query, params);

      return res.status(200).json({ 
        success: true, 
        orders: result.rows 
      });
    }

    if (req.method === 'POST') {
      // Create new order
      const { customer_id, package_id, total, status } = req.body;

      if (!customer_id || !package_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'customer_id and package_id are required' 
        });
      }

      const result = await pool.query(
        `INSERT INTO orders (customer_id, package_id, date_time, total, status, created_at) 
         VALUES ($1, $2, NOW(), $3, $4, NOW()) 
         RETURNING *`,
        [customer_id, package_id, total || 0, status || 'pending']
      );

      return res.status(201).json({ 
        success: true, 
        order: result.rows[0] 
      });
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
