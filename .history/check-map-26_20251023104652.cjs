const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function checkMap() {
  try {
    // First check the structure of the map table
    const tableStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'map'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Map table structure:', tableStructure.rows);
    
    // Check all maps
    const allMaps = await pool.query('SELECT * FROM map LIMIT 5');
    console.log('\n📍 All maps:', allMaps.rows);
    
    // Check customer_map structure
    const cmStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customer_map'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 customer_map table structure:', cmStructure.rows);
    
    // Check customer_map relationship for map with map_code containing 26
    const cmCheck = await pool.query('SELECT * FROM customer_map WHERE map_id = 26');
    console.log('\n🔗 customer_map for map_id 26:', cmCheck.rows);
    
    // Check if map 26 exists
    const mapCheck = await pool.query('SELECT * FROM map WHERE map_id = 26');
    console.log('\n📍 Map 26:', mapCheck.rows);
    
    if (cmCheck.rows.length === 0 && mapCheck.rows.length === 0) {
      console.log('\n⚠️ PROBLEM: Map 26 does not exist!');
    } else if (mapCheck.rows.length > 0 && cmCheck.rows.length === 0) {
      console.log('\n⚠️ Map 26 exists but has no customer_map entry');
      console.log('✅ BUT: Map table has customer_id directly:', mapCheck.rows[0].customer_id);
    }
    
    // Check if there's a user/customer we can link it to
    const customerCheck = await pool.query('SELECT customer_id FROM customer LIMIT 5');
    console.log('\n👥 Available customers:', customerCheck.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkMap();
