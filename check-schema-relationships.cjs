// Check database schema relationships
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mapit',
  password: 'NewStrongPass123',
  port: 5432,
});

async function checkSchema() {
  try {
    console.log('\n=== MAP TABLE STRUCTURE ===');
    const mapStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'map'
      ORDER BY ordinal_position;
    `);
    mapStructure.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log('\n=== CUSTOMER_MAP TABLE STRUCTURE ===');
    const customerMapStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customer_map'
      ORDER BY ordinal_position;
    `);
    customerMapStructure.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log('\n=== ZONES TABLE STRUCTURE ===');
    const zonesStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'zones'
      ORDER BY ordinal_position;
    `);
    zonesStructure.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log('\n=== SAMPLE DATA ===');
    
    // Get sample customer_map relationships
    const customerMaps = await pool.query(`
      SELECT cm.customer_id, c.email, cm.map_id, m.title
      FROM customer_map cm
      JOIN customer c ON cm.customer_id = c.customer_id
      JOIN map m ON cm.map_id = m.map_id
      LIMIT 10;
    `);
    console.log('\nCustomer-Map Relationships:');
    customerMaps.rows.forEach(row => {
      console.log(`  Customer ${row.customer_id} (${row.email}) -> Map ${row.map_id} (${row.title})`);
    });
    
    // Count zones per map
    const zonesCounts = await pool.query(`
      SELECT m.map_id, m.title, COUNT(z.zone_id) as zone_count
      FROM map m
      LEFT JOIN zones z ON m.map_id = z.map_id
      GROUP BY m.map_id, m.title
      ORDER BY m.map_id
      LIMIT 10;
    `);
    console.log('\nZones per Map:');
    zonesCounts.rows.forEach(row => {
      console.log(`  Map ${row.map_id} (${row.title}): ${row.zone_count} zones`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
