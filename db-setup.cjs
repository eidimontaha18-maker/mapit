const fs = require('fs');
const { Client } = require('pg');

// Database configuration
const config = {
  user: 'postgres',
  password: 'NewStrongPass123',
  host: 'localhost',
  port: 5432,
  database: 'mapit'
};

async function createTables() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Read SQL file
    const sqlScript = fs.readFileSync('./create_tables.sql', 'utf8');
    
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
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
createTables();
