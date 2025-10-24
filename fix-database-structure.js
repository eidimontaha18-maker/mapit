import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function fixDatabaseStructure() {
  try {
    console.log('🔧 Fixing Database Structure and Relationships\n');
    
    console.log('Step 1: Creating missing customer_map entries...');
    
    // Fix orphan maps by creating customer_map entries
    const orphanMaps = [
      { map_id: 1, customer_id: 1 }, // Assign to Alice Anderson
      { map_id: 2, customer_id: 6 }, // Montaha Eidi (has direct_customer_id 6)
      { map_id: 8, customer_id: 9 }, // Test User (has direct_customer_id 9)
      { map_id: 9, customer_id: 17 }, // Montaha Eidi (has direct_customer_id 17)
      { map_id: 10, customer_id: 18 } // Dima el-chal (has direct_customer_id 18)
    ];
    
    for (const mapping of orphanMaps) {
      try {
        await pool.query(`
          INSERT INTO customer_map (customer_id, map_id, access_level) 
          VALUES ($1, $2, 'owner')
          ON CONFLICT DO NOTHING
        `, [mapping.customer_id, mapping.map_id]);
        console.log(`  ✅ Map ${mapping.map_id} → Customer ${mapping.customer_id}`);
      } catch (err) {
        console.log(`  ❌ Map ${mapping.map_id}: ${err.message}`);
      }
    }
    
    console.log('\nStep 2: Fixing zones table structure...');
    
    // Check if customer_id column exists in zones
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'zones' AND column_name = 'customer_id'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('  Adding customer_id column to zones table...');
      await pool.query('ALTER TABLE zones ADD COLUMN customer_id INTEGER REFERENCES customer(customer_id)');
      console.log('  ✅ Added customer_id column');
    } else {
      console.log('  ✅ customer_id column already exists');
    }
    
    console.log('\nStep 3: Linking existing zones to map owners...');
    
    // Update zones to link to the correct customer
    const zoneUpdate = await pool.query(`
      UPDATE zones 
      SET customer_id = cm.customer_id 
      FROM customer_map cm 
      WHERE zones.map_id = cm.map_id AND zones.customer_id IS NULL
      RETURNING zones.id, zones.name, zones.customer_id, zones.map_id
    `);
    
    if (zoneUpdate.rows.length > 0) {
      console.log('  Updated zones:');
      zoneUpdate.rows.forEach(zone => {
        console.log(`    "${zone.name}" → Customer ${zone.customer_id} (Map ${zone.map_id})`);
      });
    } else {
      console.log('  ✅ All zones already have customer links');
    }
    
    console.log('\nStep 4: Verification...');
    
    // Verify the fixes
    const verifyMaps = await pool.query(`
      SELECT m.map_id, m.title, cm.customer_id, c.first_name, c.last_name
      FROM map m
      LEFT JOIN customer_map cm ON m.map_id = cm.map_id
      LEFT JOIN customer c ON cm.customer_id = c.customer_id
      WHERE m.map_id IN (1,2,8,9,10)
      ORDER BY m.map_id
    `);
    
    console.log('  Map ownership after fixes:');
    console.table(verifyMaps.rows.map(row => ({
      map_id: row.map_id,
      title: row.title,
      owner: row.first_name ? `${row.first_name} ${row.last_name} (${row.customer_id})` : 'No owner'
    })));
    
    const verifyZones = await pool.query(`
      SELECT z.name, z.map_id, z.customer_id, c.first_name, c.last_name
      FROM zones z
      LEFT JOIN customer c ON z.customer_id = c.customer_id
      ORDER BY z.map_id
    `);
    
    console.log('  Zone ownership after fixes:');
    console.table(verifyZones.rows.map(row => ({
      zone_name: row.name,
      map_id: row.map_id,
      owner: row.first_name ? `${row.first_name} ${row.last_name} (${row.customer_id})` : 'No owner'
    })));
    
    console.log('\n🎉 Database structure fixed!');
    console.log('\nRecommendations:');
    console.log('1. ✅ Keep using customer/map tables (they work well)');
    console.log('2. ✅ Zones now properly linked to customers');
    console.log('3. 🗑️  Consider dropping unused users/maps tables');
    console.log('4. 🔄  Update zone API to use customer_id instead of user_id');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixDatabaseStructure();