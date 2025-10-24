import { pool } from './src/db/postgres.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to PostgreSQL database');
    
    // Read SQL file
    const sqlFilePath = path.resolve(__dirname, 'create_tables.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute SQL script
    console.log('Creating tables...');
    await client.query(sqlScript);
    
    console.log('Tables created successfully!');
    
    // Verify tables were created
    const res = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Available tables:');
    res.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    client.release();
    // Close the pool to end the script
    await pool.end();
  }
}

// Run the function
createTables();
