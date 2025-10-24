const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mapit',
  password: 'NewStrongPass123',
  port: 5432,
});

async function fixDatabaseStructure() {
  try {
    console.log('🔧 Fixing database structure for proper relationships...\n');

    // 1. Fix the map table - change map_codes from array to single code
    console.log('📝 Step 1: Fixing map table structure...');
    
    // Check if map_codes is still an array type
    const mapCodesCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'map' AND column_name = 'map_codes'
    `);

    if (mapCodesCheck.rows.length > 0 && mapCodesCheck.rows[0].data_type === 'ARRAY') {
      console.log('   - Converting map_codes from ARRAY to single VARCHAR...');
      
      // First, add new column
      await pool.query('ALTER TABLE map ADD COLUMN IF NOT EXISTS map_code VARCHAR(50)');
      
      // Update new column with first element from array
      await pool.query(`
        UPDATE map 
        SET map_code = CASE 
          WHEN map_codes IS NOT NULL AND array_length(map_codes, 1) > 0 
          THEN map_codes[1] 
          ELSE NULL 
        END
      `);
      
      // Drop the old column
      await pool.query('ALTER TABLE map DROP COLUMN map_codes');
      
      // Add unique constraint to new column
      await pool.query('ALTER TABLE map ADD CONSTRAINT unique_map_code UNIQUE (map_code)');
      
      console.log('   ✅ Fixed map_codes to single map_code column');
    } else if (mapCodesCheck.rows.length === 0) {
      // Add map_code column if it doesn't exist
      await pool.query('ALTER TABLE map ADD COLUMN IF NOT EXISTS map_code VARCHAR(50) UNIQUE');
      console.log('   ✅ Added map_code column');
    }

    // 2. Generate unique map codes for existing maps without codes
    console.log('📝 Step 2: Generating map codes for existing maps...');
    
    const mapsWithoutCodes = await pool.query(`
      SELECT map_id, title 
      FROM map 
      WHERE map_code IS NULL OR map_code = ''
    `);

    for (const map of mapsWithoutCodes.rows) {
      // Generate unique code: MAP + map_id + random 3 digits
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const mapCode = `MAP${map.map_id}${randomSuffix}`;
      
      try {
        await pool.query(
          'UPDATE map SET map_code = $1 WHERE map_id = $2',
          [mapCode, map.map_id]
        );
        console.log(`   ✅ Generated code ${mapCode} for map: "${map.title}"`);
      } catch (err) {
        if (err.code === '23505') { // Unique constraint violation
          // Try with different random suffix
          const newRandomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          const newMapCode = `MAP${map.map_id}${newRandomSuffix}`;
          await pool.query(
            'UPDATE map SET map_code = $1 WHERE map_id = $2',
            [newMapCode, map.map_id]
          );
          console.log(`   ✅ Generated code ${newMapCode} for map: "${map.title}" (retry)`);
        } else {
          throw err;
        }
      }
    }

    // 3. Ensure all foreign key constraints are properly set
    console.log('📝 Step 3: Verifying foreign key constraints...');
    
    // Make sure customer_id in map table is NOT NULL (every map must have an owner)
    await pool.query(`
      UPDATE map 
      SET customer_id = (
        SELECT customer_id 
        FROM customer_map 
        WHERE customer_map.map_id = map.map_id 
        AND access_level = 'owner' 
        LIMIT 1
      ) 
      WHERE customer_id IS NULL
    `);
    
    await pool.query('ALTER TABLE map ALTER COLUMN customer_id SET NOT NULL');
    console.log('   ✅ Ensured all maps have owner (customer_id NOT NULL)');

    // Make sure zones have proper relationships
    await pool.query(`
      UPDATE zones 
      SET customer_id = (
        SELECT customer_id 
        FROM map 
        WHERE map.map_id = zones.map_id
      ) 
      WHERE customer_id IS NULL
    `);
    console.log('   ✅ Ensured all zones have proper customer relationships');

    // 4. Add indexes for better performance
    console.log('📝 Step 4: Adding performance indexes...');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_map_customer_id ON map(customer_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_map_code ON map(map_code)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_zones_map_id ON zones(map_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_zones_customer_id ON zones(customer_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_customer_map_customer_id ON customer_map(customer_id)');
    
    console.log('   ✅ Added performance indexes');

    // 5. Verify the final structure
    console.log('📝 Step 5: Verifying final database structure...\n');
    
    const mapCount = await pool.query('SELECT COUNT(*) FROM map');
    const zoneCount = await pool.query('SELECT COUNT(*) FROM zones');
    const customerCount = await pool.query('SELECT COUNT(*) FROM customer');
    
    console.log('📊 Database Summary:');
    console.log(`   👥 Customers: ${customerCount.rows[0].count}`);
    console.log(`   🗺️  Maps: ${mapCount.rows[0].count}`);
    console.log(`   🎯 Zones: ${zoneCount.rows[0].count}`);

    // Show sample data
    const sampleMaps = await pool.query(`
      SELECT m.map_id, m.title, m.map_code, m.customer_id, 
             c.first_name, c.last_name,
             (SELECT COUNT(*) FROM zones z WHERE z.map_id = m.map_id) as zone_count
      FROM map m 
      JOIN customer c ON m.customer_id = c.customer_id 
      ORDER BY m.map_id 
      LIMIT 5
    `);

    console.log('\n📋 Sample Maps:');
    sampleMaps.rows.forEach(map => {
      console.log(`   ${map.map_code}: "${map.title}" by ${map.first_name} ${map.last_name} (${map.zone_count} zones)`);
    });

    console.log('\n✅ Database structure fixed successfully!');
    console.log('\n🏗️  Final Relationship Structure:');
    console.log('   👤 Customer -> 📝 Creates Many Maps (1:N)');
    console.log('   🗺️  Map -> 🔍 Has Unique Code (1:1)');
    console.log('   🗺️  Map -> 🎯 Contains Many Zones (1:N)');
    console.log('   🎯 Zone -> 👤 Belongs to Customer (N:1)');
    console.log('   🎯 Zone -> 🗺️  Belongs to Map (N:1)');

  } catch (err) {
    console.error('❌ Error fixing database:', err.message);
    throw err;
  } finally {
    pool.end();
  }
}

fixDatabaseStructure();