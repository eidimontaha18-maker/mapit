// API endpoint for specific customer's maps
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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Customer ID is required' 
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const result = await pool.query(`
      SELECT 
        m.map_id,
        m.title,
        m.description,
        m.country,
        m.active,
        m.created_at,
        m.customer_id,
        COUNT(z.zone_id) as zone_count
      FROM map m
      LEFT JOIN zones z ON m.map_id = z.map_id
      WHERE m.customer_id = $1
      GROUP BY m.map_id
      ORDER BY m.created_at DESC
    `, [id]);

    return res.status(200).json({ 
      success: true, 
      maps: result.rows 
    });

  } catch (error) {
    console.error('Customer specific maps API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
