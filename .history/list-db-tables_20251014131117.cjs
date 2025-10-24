// List all tables in the database
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mapit',
  password: 'NewStrongPass123',
  port: 5432,
});

async function listTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n=== DATABASE TABLES ===');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    console.log(`\nTotal tables: ${result.rows.length}`);
    
    // Check customer table structure
    console.log('\n=== CUSTOMER TABLE STRUCTURE ===');
    const customerStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customer'
      ORDER BY ordinal_position;
    `);
    customerStructure.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Check for sample customer
    console.log('\n=== SAMPLE CUSTOMER DATA ===');
    const sampleCustomer = await pool.query(`
      SELECT customer_id, email, username 
      FROM customer 
      LIMIT 5;
    `);
    console.log('Sample customers:', sampleCustomer.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

listTables();
