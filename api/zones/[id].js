// API endpoint for individual zone operations (GET, PUT, DELETE)
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
      error: 'Zone ID is required' 
    });
  }

  try {
    if (req.method === 'GET') {
      // Get specific zone
      const result = await pool.query(
        'SELECT * FROM zones WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Zone not found' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        zone: result.rows[0] 
      });
    }

    if (req.method === 'PUT') {
      // Update zone
      const { name, color, coordinates } = req.body;

      const result = await pool.query(
        `UPDATE zones 
         SET name = COALESCE($1, name),
             color = COALESCE($2, color),
             coordinates = COALESCE($3, coordinates),
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [
          name || null,
          color || null,
          coordinates ? JSON.stringify(coordinates) : null,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Zone not found' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        zone: result.rows[0] 
      });
    }

    if (req.method === 'DELETE') {
      // Delete zone
      const result = await pool.query(
        'DELETE FROM zones WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Zone not found' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Zone deleted successfully' 
      });
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Zone API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
