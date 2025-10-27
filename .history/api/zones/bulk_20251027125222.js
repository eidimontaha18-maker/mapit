// API endpoint for bulk zone operations
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

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { zones } = req.body;

    if (!zones || !Array.isArray(zones)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Zones array is required' 
      });
    }

    // Begin transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const savedZones = [];

      for (const zone of zones) {
        const { id, map_id, name, color, coordinates, customer_id } = zone;

        if (id && id !== 'temp' && !id.startsWith('temp-')) {
          // Update existing zone
          const result = await client.query(
            `UPDATE zones 
             SET name = $1, color = $2, coordinates = $3, updated_at = NOW()
             WHERE id = $4
             RETURNING *`,
            [name, color, JSON.stringify(coordinates), id]
          );
          
          if (result.rows.length > 0) {
            savedZones.push(result.rows[0]);
          }
        } else {
          // Insert new zone
          const result = await client.query(
            `INSERT INTO zones (id, map_id, name, color, coordinates, customer_id, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING *`,
            [map_id, name, color, JSON.stringify(coordinates), customer_id || null]
          );
          
          savedZones.push(result.rows[0]);
        }
      }

      await client.query('COMMIT');

      return res.status(200).json({ 
        success: true, 
        zones: savedZones,
        message: `${savedZones.length} zones saved successfully` 
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Bulk zones API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
