const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:Tango123@localhost:5432/mapit'
});

async function checkMap() {
  try {
    // Check if map 26 exists
    const mapCheck = await pool.query('SELECT * FROM map WHERE id = $1', [26]);
    console.log('\n📍 Map 26:', mapCheck.rows[0] || 'NOT FOUND');
    
    // Check customer_map relationship
    const cmCheck = await pool.query('SELECT * FROM customer_map WHERE map_id = $1', [26]);
    console.log('\n🔗 customer_map for map 26:', cmCheck.rows);
    
    if (cmCheck.rows.length === 0) {
      console.log('\n⚠️ PROBLEM: Map 26 has no entry in customer_map table!');
      console.log('This is why the zone save is failing with "Map not found or has no owner"');
      
      // Check if there's a user/customer we can link it to
      const customerCheck = await pool.query('SELECT id, username FROM customer LIMIT 5');
      console.log('\n👥 Available customers:', customerCheck.rows);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkMap();
