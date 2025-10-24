// Database Connection Test Script
import pg from 'pg';
const { Pool } = pg;

// Use your provided connection details
const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function testConnection() {
  console.log('Attempting to connect to your database...');
  
  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database!');
    
    // Check the database information
    const dbInfoResult = await client.query(`
      SELECT current_database() as database, 
             current_schema() as schema,
             current_user as user
    `);
    console.log('Database info:', dbInfoResult.rows[0]);
    
    // Check if customer table exists
    const customerTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customer'
      ) as exists
    `);
    
    if (customerTableResult.rows[0].exists) {
      console.log('✅ Customer table exists!');
      
      // Count the number of customers
      const customerCountResult = await client.query('SELECT COUNT(*) as count FROM customer');
      console.log(`   Found ${customerCountResult.rows[0].count} customer records.`);
      
      // Show customer table structure
      const customerColumnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'customer'
      `);
      console.log('   Customer table columns:');
      customerColumnsResult.rows.forEach(column => {
        console.log(`   - ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    } else {
      console.log('❌ Customer table does not exist!');
    }
    
    // Release the client
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure your PostgreSQL server is running.');
    }
  }
}

// Run the test
testConnection();