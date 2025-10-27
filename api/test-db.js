// Test endpoint to check database connection
import pkg from 'pg';
const { Pool } = pkg;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL environment variable is not set',
        hasDbUrl: false
      });
    }

    // Try to connect
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const result = await pool.query('SELECT NOW() as current_time');
    
    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      hasDbUrl: true,
      currentTime: result.rows[0].current_time
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      hasDbUrl: !!process.env.DATABASE_URL
    });
  }
}
