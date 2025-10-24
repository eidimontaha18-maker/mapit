import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function fixZoneUserLinking() {
  try {
    console.log('🔧 Fixing Zone-User Linking Issue\n');
    
    console.log('Current situation:');
    console.log('- customer table: Has 13 users (active)');
    console.log('- users table: Has 0 users (empty)');
    console.log('- zones table: References users.id (broken link)');
    console.log('- Need to link zones to customers instead\n');
    
    // Check current zones
    const zones = await pool.query('SELECT id, user_id, map_id, name FROM zones');
    console.log('Current zones:');
    zones.rows.forEach(zone => {
      console.log(`  - ${zone.name} (map_id: ${zone.map_id}, user_id: ${zone.user_id})`);
    });
    
    // Check which customer owns map_id 10
    const mapOwner = await pool.query(`
      SELECT c.customer_id, c.first_name, c.last_name, c.email, cm.map_id
      FROM customer c
      JOIN customer_map cm ON c.customer_id = cm.customer_id
      WHERE cm.map_id = 10
    `);
    
    if (mapOwner.rows.length > 0) {
      const owner = mapOwner.rows[0];
      console.log(`\nMap 10 is owned by: ${owner.first_name} ${owner.last_name} (customer_id: ${owner.customer_id})`);
      
      console.log('\nProposed solution:');
      console.log('1. Add customer_id column to zones table');
      console.log('2. Update zones to reference the map owner');
      console.log('3. Remove user_id column (since users table is empty)');
      
      // Show what the commands would be
      console.log('\nSQL commands to fix this:');
      console.log('-- Add customer_id column');
      console.log('ALTER TABLE zones ADD COLUMN customer_id INTEGER REFERENCES customer(customer_id);');
      console.log('');
      console.log('-- Update existing zones to link to map owner');
      console.log(`UPDATE zones SET customer_id = ${owner.customer_id} WHERE map_id = 10;`);
      console.log('');
      console.log('-- Remove the broken user_id column');
      console.log('ALTER TABLE zones DROP COLUMN user_id;');
      
    } else {
      console.log('\n❌ Map 10 has no owner in customer_map table');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixZoneUserLinking();