// Create house table using Node.js and pg
import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;

// Use the configuration you provided
const dbUri = 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';
const pool = new Pool({
  connectionString: dbUri
});

async function createHouseTable() {
  console.log('Creating house table...');
  
  try {
    // Get SQL from file
    const sql = fs.readFileSync('./create_house_table.sql', 'utf8');
    
    // Connect to database
    const client = await pool.connect();
    
    // Execute the SQL statements
    await client.query(sql);
    
    console.log('✅ House table created successfully!');
    
    // Check if house table was created
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'house'
      ) as exists
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('✅ Confirmed: House table exists in database.');
      
      // Show table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'house'
      `);
      
      console.log('House table columns:');
      columnsResult.rows.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    } else {
      console.error('❌ House table was not created.');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Error creating house table:', error.message);
  } finally {
    await pool.end();
  }
}

createHouseTable();