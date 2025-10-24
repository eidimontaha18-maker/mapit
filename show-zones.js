import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function showZoneData() {
  try {
    // Show existing zones
    const zones = await pool.query('SELECT * FROM zones ORDER BY created_at DESC');
    console.log('Existing zones:');
    console.table(zones.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

showZoneData();