// Check maps for specific customer
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mapit',
  password: 'NewStrongPass123',
  port: 5432,
});

async function checkCustomerMaps() {
  try {
    // Find customer by email
    console.log('\n=== CHECKING CUSTOMER ===');
    const customer = await pool.query(`
      SELECT customer_id, email, first_name, last_name
      FROM customer
      WHERE email = 'eidimontaha20@gmail.com';
    `);
    
    if (customer.rows.length === 0) {
      console.log('❌ Customer not found');
      return;
    }
    
    console.log('Customer found:', customer.rows[0]);
    const customerId = customer.rows[0].customer_id;
    
    // Check maps directly owned by this customer
    console.log('\n=== MAPS OWNED BY CUSTOMER (from map table) ===');
    const ownedMaps = await pool.query(`
      SELECT map_id, title, description, created_at, customer_id
      FROM map
      WHERE customer_id = $1
      ORDER BY created_at DESC;
    `, [customerId]);
    
    console.log(`Found ${ownedMaps.rows.length} maps owned by customer:`);
    ownedMaps.rows.forEach(map => {
      console.log(`  - Map ${map.map_id}: ${map.title} (customer_id: ${map.customer_id})`);
    });
    
    // Check maps via customer_map relationship
    console.log('\n=== MAPS VIA CUSTOMER_MAP RELATIONSHIP ===');
    const relatedMaps = await pool.query(`
      SELECT cm.customer_id, cm.map_id, m.title, cm.access_level
      FROM customer_map cm
      JOIN map m ON cm.map_id = m.map_id
      WHERE cm.customer_id = $1;
    `, [customerId]);
    
    console.log(`Found ${relatedMaps.rows.length} maps via customer_map:`);
    relatedMaps.rows.forEach(map => {
      console.log(`  - Map ${map.map_id}: ${map.title} (access: ${map.access_level})`);
    });
    
    // Check with zone counts (same query as API)
    console.log('\n=== MAPS WITH ZONE COUNTS (API Query) ===');
    const mapsWithZones = await pool.query(`
      SELECT 
        m.map_id,
        m.title,
        m.description,
        m.created_at,
        m.active,
        m.country,
        COUNT(z.id) as zone_count
      FROM map m
      LEFT JOIN zones z ON m.map_id = z.map_id
      WHERE m.customer_id = $1
      GROUP BY m.map_id, m.title, m.description, m.created_at, m.active, m.country
      ORDER BY m.created_at DESC;
    `, [customerId]);
    
    console.log(`\nAPI would return ${mapsWithZones.rows.length} maps:`);
    mapsWithZones.rows.forEach(map => {
      console.log(`  - Map ${map.map_id}: ${map.title} | Zones: ${map.zone_count} | Created: ${map.created_at}`);
    });
    
    // Check ALL maps in database
    console.log('\n=== ALL MAPS IN DATABASE ===');
    const allMaps = await pool.query(`
      SELECT map_id, title, customer_id, 
             (SELECT email FROM customer WHERE customer_id = map.customer_id) as owner_email
      FROM map
      ORDER BY map_id;
    `);
    
    console.log(`\nTotal maps in database: ${allMaps.rows.length}`);
    allMaps.rows.forEach(map => {
      console.log(`  - Map ${map.map_id}: ${map.title} | Owner: ${map.owner_email} (ID: ${map.customer_id})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCustomerMaps();
