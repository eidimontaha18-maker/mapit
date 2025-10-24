const { Pool } = require('pg');

// Database connection configuration using the provided URI
const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
});

// Test the database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Successfully connected to PostgreSQL database!');
    console.log('Current time from database:', result.rows[0].now);
    client.release();
    
    // Get database metadata
    const dbInfoResult = await pool.query(`
      SELECT current_database() as database, 
             current_schema() as schema,
             current_user as user
    `);
    console.log('Database info:', dbInfoResult.rows[0]);
    
    await pool.end();
  } catch (err) {
    console.error('Error connecting to PostgreSQL database:', err);
  }
}

// Run the test
console.log('Attempting to connect to PostgreSQL using configuration:');
console.log('URI: postgres://postgres:********@localhost:5432/mapit');
console.log('Schema: public');
console.log('Anonymous role: anon');
console.log('--------------------------------------------------');

testConnection();