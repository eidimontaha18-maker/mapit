import pg from 'pg';
const { Pool } = pg;

// Database connection configuration using the provided URI
const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
});

// Test the database connection and check table structure
async function checkMapTable() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database!');
    
    // Check map table structure
    const tableResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'map' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nMAP TABLE STRUCTURE:');
    tableResult.rows.forEach(col => {
      console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

// Run the check
checkMapTable();