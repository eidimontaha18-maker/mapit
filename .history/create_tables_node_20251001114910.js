// Create tables using Node.js and pg
import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;

// Use the configuration you provided
const dbUri = 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';
const pool = new Pool({
  connectionString: dbUri
});

async function createTables() {
  console.log('Creating database tables...');
  
  try {
    // Get SQL from file
    const sql = fs.readFileSync('./create_tables.sql', 'utf8');
    
    // Connect to database
    const client = await pool.connect();
    
    // Execute the SQL statements
    await client.query(sql);
    
    console.log('✅ Tables created successfully!');
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    client.release();
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await pool.end();
  }
}

createTables();