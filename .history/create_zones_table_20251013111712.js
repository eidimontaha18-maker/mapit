// Create zones table in PostgreSQL
import pg from 'pg';
const { Pool } = pg;

// Configuration from server.js
const CONNECTION_STRING = 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';
const pool = new Pool({ connectionString: CONNECTION_STRING });

async function createZonesTable() {
  try {
    console.log('Creating zones table if it does not exist...');
    
    // Check if the zones table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'zones'
      );
    `;
    
    const tableExists = await pool.query(checkTableQuery);
    
    if (!tableExists.rows[0].exists) {
      // Create zones table with necessary columns
      const createTableQuery = `
        CREATE TABLE zones (
          id UUID PRIMARY KEY,
          user_id INTEGER,
          name VARCHAR(100) NOT NULL,
          color VARCHAR(20) NOT NULL,
          coordinates JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_user
            FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        );
      `;
      
      await pool.query(createTableQuery);
      console.log('✅ Zones table created successfully!');
    } else {
      console.log('✅ Zones table already exists.');
    }

    // Close the connection
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error creating zones table:', error);
    process.exit(1);
  }
}

// Execute the function
createZonesTable();