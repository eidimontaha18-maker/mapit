// Check customer data
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mapit',
  password: 'NewStrongPass123',
  port: 5432,
});

async function checkCustomers() {
  try {
    console.log('\n=== ALL CUSTOMERS ===');
    const result = await pool.query(`
      SELECT customer_id, email, first_name, last_name, 
             LEFT(password_hash, 20) as password_preview
      FROM customer 
      ORDER BY customer_id;
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ NO CUSTOMERS FOUND IN DATABASE!');
      console.log('\nYou need to register a user first.');
    } else {
      result.rows.forEach(row => {
        console.log(`ID: ${row.customer_id}`);
        console.log(`  Email: ${row.email}`);
        console.log(`  Name: ${row.first_name} ${row.last_name}`);
        console.log(`  Password Hash Preview: ${row.password_preview}...`);
        console.log('');
      });
      console.log(`Total customers: ${result.rows.length}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCustomers();
