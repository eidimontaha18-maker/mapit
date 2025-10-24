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

    // Check if customer_id column exists
    const customerIdColumn = tableResult.rows.find(col => col.column_name === 'customer_id');
    if (customerIdColumn) {
      console.log('\n✅ customer_id column exists in map table');
    } else {
      console.log('\n❌ customer_id column is MISSING from map table');
    }

    // Check for foreign key constraint
    const fkResult = await client.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'map'
    `);

    if (fkResult.rows.length > 0) {
      console.log('\nFOREIGN KEY CONSTRAINTS:');
      fkResult.rows.forEach(fk => {
        console.log(`${fk.column_name} references ${fk.foreign_table_name}(${fk.foreign_column_name})`);
      });
    } else {
      console.log('\n❌ No foreign key constraints found on map table');
    }
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

// Run the check
checkMapTable();