// Test script to insert a map record directly
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function insertTestMap() {
  try {
    console.log('Attempting to insert test map...');
    
    const mapData = {
      title: 'Test Map',
      description: 'This is a test map',
      map_data: { lat: 33.88, lng: 35.49, zoom: 8 },
      map_bounds: { center: [33.88, 35.49], zoom: 8 },
      active: true,
      country: 'Lebanon',
      map_codes: ['TEST-1234-5678']
    };
    
    const columns = Object.keys(mapData);
    const values = Object.values(mapData);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO map (${columns.join(', ')}) 
      VALUES (${placeholders})
      RETURNING *
    `;
    
    console.log('SQL Query:', query);
    console.log('Values:', values);
    
    const result = await pool.query(query, values);
    console.log('Insert successful!');
    console.log('Inserted record:', result.rows[0]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting test map:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

insertTestMap().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});