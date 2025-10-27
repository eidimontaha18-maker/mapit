// API endpoint for zones management
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
    const { map_id } = req.query;

    if (req.method === 'GET') {
      // Get all zones for a specific map
      if (!map_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'map_id is required' 
        });
      }

      const result = await pool.query(
        'SELECT * FROM zones WHERE map_id = $1 ORDER BY created_at DESC',
        [map_id]
      );

      return res.status(200).json({ 
        success: true, 
        zones: result.rows 
      });
    }

    if (req.method === 'POST') {
      // Create new zone
      const { map_id: zoneMapId, name, type, coordinates, properties } = req.body;
      
      if (!zoneMapId || !name || !type || !coordinates) {
        return res.status(400).json({ 
          success: false, 
          error: 'map_id, name, type, and coordinates are required' 
        });
      }

      const result = await pool.query(
        `INSERT INTO zones (map_id, name, type, coordinates, properties, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING *`,
        [zoneMapId, name, type, JSON.stringify(coordinates), JSON.stringify(properties || {})]
      );

      return res.status(201).json({ 
        success: true, 
        zone: result.rows[0] 
      });
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Zones API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
