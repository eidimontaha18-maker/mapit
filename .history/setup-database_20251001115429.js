import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function createTables() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL commands
    await pool.query(sql);
    
    console.log('Tables created successfully');
    
    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Close the pool
    await pool.end();
  } catch (err) {
    console.error('Error creating tables:', err);
    await pool.end();
  }
}

createTables();