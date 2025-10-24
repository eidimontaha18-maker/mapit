const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function checkZonesTable() {
  try {
    // Check zones table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'zones'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Zones table structure:');
    tableStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check if there are any existing zones
    const existingZones = await pool.query('SELECT * FROM zones LIMIT 5');
    console.log('\n📍 Existing zones:', existingZones.rows);
    
    // Try to insert a test zone to see what error we get
    console.log('\n🧪 Testing zone insertion...');
    try {
      const testInsert = await pool.query(`
        INSERT INTO zones (id, customer_id, map_id, name, color, coordinates) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `, ['test-zone-123', 18, 26, 'Test Zone', '#FF0000', JSON.stringify([[33.8547, 35.8623], [33.8548, 35.8624]])]);
      console.log('✅ Test insert successful:', testInsert.rows[0]);
      
      // Clean up test zone
      await pool.query('DELETE FROM zones WHERE id = $1', ['test-zone-123']);
      console.log('🧹 Test zone cleaned up');
    } catch (insertError) {
      console.error('❌ Test insert failed:', insertError.message);
      console.error('Error details:', insertError);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkZonesTable();
