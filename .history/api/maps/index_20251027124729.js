// API endpoint for maps management
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
      // Get all maps
      const result = await pool.query(`
        SELECT 
          m.map_id,
          m.title,
          m.description,
          m.country,
          m.active,
          m.created_at,
          m.customer_id,
          c.first_name || ' ' || c.last_name as customer_name,
          COUNT(z.zone_id) as zone_count
        FROM map m
        LEFT JOIN customer c ON m.customer_id = c.customer_id
        LEFT JOIN zones z ON m.map_id = z.map_id
        GROUP BY m.map_id, c.first_name, c.last_name
        ORDER BY m.created_at DESC
      `);

      return res.status(200).json({ 
        success: true, 
        maps: result.rows 
      });
    }

    if (req.method === 'POST') {
      // Create new map
      const { title, description, country, customer_id, active } = req.body;

      if (!title || !customer_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Title and customer_id are required' 
        });
      }

      const result = await pool.query(
        `INSERT INTO map (title, description, country, customer_id, active, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW()) 
         RETURNING *`,
        [title, description || '', country || '', customer_id, active !== false]
      );

      return res.status(201).json({ 
        success: true, 
        map: result.rows[0] 
      });
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Maps API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
