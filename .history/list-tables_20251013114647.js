const { Pool } = require('pg');

// Database connection configuration from your postgrest.conf
const pool = new Pool({
  connectionString: "postgres://postgres:NewStrongPass123@localhost:5432/mapit"
});

async function listTables() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Test the connection
    const client = await pool.connect();
    console.log('✓ Successfully connected to the database!');
    
    // Query to get all table names in the public schema
    const tableQuery = `
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Tables in the "public" schema:');
    console.log('=====================================');
    
    const result = await client.query(tableQuery);
    
    if (result.rows.length === 0) {
      console.log('No tables found in the public schema.');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name} (${row.table_type})`);
      });
    }
    
    console.log(`\n📊 Total tables found: ${result.rows.length}`);
    
    // Also get some additional database information
    const dbInfoQuery = `
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as postgres_version;
    `;
    
    const dbInfo = await client.query(dbInfoQuery);
    console.log('\n🔍 Database Information:');
    console.log('========================');
    console.log(`Database: ${dbInfo.rows[0].database_name}`);
    console.log(`User: ${dbInfo.rows[0].current_user}`);
    console.log(`PostgreSQL Version: ${dbInfo.rows[0].postgres_version.split(',')[0]}`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  } finally {
    await pool.end();
  }
}

listTables();