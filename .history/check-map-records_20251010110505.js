// Check if there are any records in the map table
import pg from 'pg';
const { Pool } = pg;

// Database connection configuration
const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
});

async function checkMapTable() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database!');
    
    // Count records in the map table
    const countResult = await client.query('SELECT COUNT(*) FROM map');
    console.log(`Total maps in database: ${countResult.rows[0].count}`);
    
    // Get the most recent 5 maps
    const recentMapsResult = await client.query(`
      SELECT map_id, title, customer_id, created_at 
      FROM map 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\nMOST RECENT MAPS:');
    if (recentMapsResult.rows.length === 0) {
      console.log('No maps found in the database.');
    } else {
      recentMapsResult.rows.forEach(map => {
        console.log(`ID: ${map.map_id}, Title: ${map.title}, Customer: ${map.customer_id}, Created: ${map.created_at}`);
      });
    }
    
    client.release();
  } catch (error) {
    console.error('Error querying map table:', error);
  } finally {
    await pool.end();
  }
}

checkMapTable();