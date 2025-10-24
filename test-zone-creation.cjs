const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mapit',
  password: 'NewStrongPass123',
  port: 5432,
});

async function testZoneCreation() {
  console.log('\n🔍 Testing Zone Creation Flow...\n');
  
  try {
    // 1. Check customer 18's maps
    const mapsResult = await pool.query(
      'SELECT map_id, title, map_code, created_at FROM map WHERE customer_id = 18 ORDER BY created_at DESC LIMIT 5'
    );
    
    console.log('📍 Customer 18 Maps:');
    mapsResult.rows.forEach(map => {
      console.log(`  - Map ${map.map_id}: "${map.title}" (${map.map_code}) - Created: ${map.created_at}`);
    });
    
    // 2. Check zones for each map
    console.log('\n📦 Zones per Map:');
    for (const map of mapsResult.rows) {
      const zonesResult = await pool.query(
        'SELECT id, name, color, map_id, customer_id, created_at FROM zones WHERE map_id = $1 ORDER BY created_at DESC',
        [map.map_id]
      );
      console.log(`  - Map ${map.map_id} (${map.title}): ${zonesResult.rows.length} zones`);
      zonesResult.rows.forEach(zone => {
        console.log(`    • Zone "${zone.name}" (${zone.color}) - customer_id: ${zone.customer_id} - Created: ${zone.created_at}`);
      });
    }
    
    // 3. Check for zones without customer_id
    const orphanZones = await pool.query(
      'SELECT id, name, map_id, customer_id FROM zones WHERE customer_id IS NULL'
    );
    
    if (orphanZones.rows.length > 0) {
      console.log('\n⚠️  Zones without customer_id:');
      orphanZones.rows.forEach(zone => {
        console.log(`  - Zone "${zone.name}" in map ${zone.map_id}`);
      });
    } else {
      console.log('\n✅ All zones have customer_id assigned');
    }
    
    // 4. Check zones table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'zones'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Zones Table Structure:');
    tableInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testZoneCreation();
