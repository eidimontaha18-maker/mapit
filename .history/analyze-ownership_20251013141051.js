import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function analyzeMapOwnership() {
  try {
    console.log('🔍 Analyzing Map Ownership Issues\n');
    
    // Check all maps and their ownership
    const mapsWithOwners = await pool.query(`
      SELECT 
        m.map_id, 
        m.title, 
        m.customer_id as direct_customer_id,
        cm.customer_id as linked_customer_id,
        c.first_name,
        c.last_name
      FROM map m
      LEFT JOIN customer_map cm ON m.map_id = cm.map_id
      LEFT JOIN customer c ON cm.customer_id = c.customer_id
      ORDER BY m.map_id
    `);
    
    console.log('📊 Map Ownership Analysis:');
    console.table(mapsWithOwners.rows.map(row => ({
      map_id: row.map_id,
      title: row.title,
      direct_customer: row.direct_customer_id,
      linked_customer: row.linked_customer_id,
      owner_name: row.first_name ? `${row.first_name} ${row.last_name}` : 'No owner'
    })));
    
    // Check which maps have no owners
    const orphanMaps = mapsWithOwners.rows.filter(row => !row.linked_customer_id);
    
    if (orphanMaps.length > 0) {
      console.log('\n🚨 Orphan Maps (no owner in customer_map):');
      orphanMaps.forEach(map => {
        console.log(`   Map ${map.map_id}: "${map.title}" (direct_customer_id: ${map.direct_customer_id})`);
      });
      
      // Check if we can use direct customer_id
      console.log('\n💡 Potential Solutions:');
      for (const map of orphanMaps) {
        if (map.direct_customer_id) {
          // Check if this customer exists
          const customerExists = await pool.query('SELECT * FROM customer WHERE customer_id = $1', [map.direct_customer_id]);
          if (customerExists.rows.length > 0) {
            const customer = customerExists.rows[0];
            console.log(`   Map ${map.map_id}: Can link to customer ${customer.customer_id} (${customer.first_name} ${customer.last_name})`);
          } else {
            console.log(`   Map ${map.map_id}: direct_customer_id ${map.direct_customer_id} does not exist in customer table`);
          }
        } else {
          // Assign to first available customer
          const firstCustomer = await pool.query('SELECT * FROM customer LIMIT 1');
          if (firstCustomer.rows.length > 0) {
            const customer = firstCustomer.rows[0];
            console.log(`   Map ${map.map_id}: Could assign to first customer ${customer.customer_id} (${customer.first_name} ${customer.last_name})`);
          }
        }
      }
      
      console.log('\n🔧 Recommended Actions:');
      console.log('1. Create customer_map entries for orphan maps');
      console.log('2. Link zones to customers instead of users');
      console.log('3. Clean up the duplicate user/customer system');
    }
    
    // Show current authentication system
    console.log('\n🔐 Current Authentication:');
    const customerCount = await pool.query('SELECT COUNT(*) FROM customer');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`   customer table: ${customerCount.rows[0].count} records (active)`);
    console.log(`   users table: ${userCount.rows[0].count} records (unused)`);
    console.log('   → Your app is using customer-based authentication');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeMapOwnership();