// Script to fix database relationships - drop users table and ensure zones table uses customer_id
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mapit',
  password: 'NewStrongPass123',
  port: 5432,
});

async function fixDatabaseRelationships() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing database relationships...\n');

    // 1. First, check current zones table structure
    console.log('📋 Current zones table structure:');
    const zonesStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'zones' 
      ORDER BY ordinal_position;
    `);
    console.table(zonesStructure.rows);

    // 2. Drop user_id column from zones table if it exists
    try {
      await client.query('ALTER TABLE zones DROP COLUMN IF EXISTS user_id CASCADE;');
      console.log('✅ Dropped user_id column from zones table');
    } catch (err) {
      console.log('ℹ️ user_id column already doesn\'t exist in zones table');
    }

    // 3. Ensure customer_id column exists in zones table
    try {
      await client.query('ALTER TABLE zones ADD COLUMN IF NOT EXISTS customer_id INTEGER;');
      console.log('✅ Ensured customer_id column exists in zones table');
    } catch (err) {
      console.log('ℹ️ customer_id column already exists in zones table');
    }

    // 4. Add foreign key constraint for customer_id in zones table
    try {
      await client.query(`
        ALTER TABLE zones 
        ADD CONSTRAINT fk_zones_customer 
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id) 
        ON DELETE CASCADE;
      `);
      console.log('✅ Added foreign key constraint for zones.customer_id');
    } catch (err) {
      console.log('ℹ️ Foreign key constraint already exists or failed:', err.message);
    }

    // 5. Check if users table exists and drop it
    const usersTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (usersTableExists.rows[0].exists) {
      // Drop all foreign key constraints that reference users table first
      try {
        const constraints = await client.query(`
          SELECT conname, conrelid::regclass as table_name
          FROM pg_constraint 
          WHERE confrelid = 'users'::regclass;
        `);
        
        for (const constraint of constraints.rows) {
          await client.query(`ALTER TABLE ${constraint.table_name} DROP CONSTRAINT IF EXISTS ${constraint.conname} CASCADE;`);
          console.log(`✅ Dropped constraint ${constraint.conname} from ${constraint.table_name}`);
        }
      } catch (err) {
        console.log('ℹ️ No constraints to drop or error:', err.message);
      }

      // Now drop the users table
      await client.query('DROP TABLE IF EXISTS users CASCADE;');
      console.log('✅ Dropped users table');
    } else {
      console.log('ℹ️ Users table does not exist');
    }

    // 6. Update any existing zones to have proper customer_id
    console.log('\n🔄 Updating existing zones with customer_id...');
    
    // Get zones without customer_id and try to link them to existing customers
    const zonesWithoutCustomer = await client.query(`
      SELECT z.id, z.map_id, m.customer_id 
      FROM zones z 
      LEFT JOIN map m ON z.map_id = m.map_id 
      WHERE z.customer_id IS NULL AND m.customer_id IS NOT NULL;
    `);
    
    if (zonesWithoutCustomer.rows.length > 0) {
      for (const zone of zonesWithoutCustomer.rows) {
        await client.query(
          'UPDATE zones SET customer_id = $1 WHERE id = $2',
          [zone.customer_id, zone.id]
        );
      }
      console.log(`✅ Updated ${zonesWithoutCustomer.rows.length} zones with customer_id`);
    } else {
      console.log('ℹ️ All zones already have proper customer_id');
    }

    // 7. Display final table structures
    console.log('\n📋 Final zones table structure:');
    const finalZonesStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'zones' 
      ORDER BY ordinal_position;
    `);
    console.table(finalZonesStructure.rows);

    console.log('\n📋 Current tables in database:');
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    console.table(tables.rows);

    console.log('\n✅ Database relationships fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing database relationships:', error);
  } finally {
    client.release();
    pool.end();
  }
}

fixDatabaseRelationships();