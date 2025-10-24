// Check if there are any customers in the database
import pg from 'pg';
const { Pool } = pg;

// Database connection configuration
const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
});

async function checkCustomerTable() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database!');
    
    // Count records in the customer table
    const countResult = await client.query('SELECT COUNT(*) FROM customer');
    console.log(`Total customers in database: ${countResult.rows[0].count}`);
    
    // Get all customers
    const customersResult = await client.query(`
      SELECT customer_id, first_name, last_name, email, registration_date 
      FROM customer 
      ORDER BY customer_id
    `);
    
    console.log('\nCUSTOMERS:');
    if (customersResult.rows.length === 0) {
      console.log('No customers found in the database.');
    } else {
      customersResult.rows.forEach(customer => {
        console.log(`ID: ${customer.customer_id}, Name: ${customer.first_name} ${customer.last_name}, Email: ${customer.email}`);
      });
    }
    
    client.release();
  } catch (error) {
    console.error('Error querying customer table:', error);
  } finally {
    await pool.end();
  }
}

checkCustomerTable();