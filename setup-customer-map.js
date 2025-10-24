// Check if customer_map table exists and create it if needed
import pg from 'pg';
const { Pool } = pg;

// Database connection configuration
const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
});

// Create customer_map table if it doesn't exist
async function setupCustomerMapTable() {
  try {
    const client = await pool.connect();
    
    // Check if table exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'customer_map'
      );
    `);
    
    const tableExists = checkResult.rows[0].exists;
    
    if (!tableExists) {
      console.log('Creating customer_map table...');
      
      // Create the table
      await client.query(`
        CREATE TABLE customer_map (
          customer_map_id SERIAL PRIMARY KEY,
          customer_id INT NOT NULL,
          map_id INT NOT NULL,
          access_level VARCHAR(20) NOT NULL DEFAULT 'owner',
          last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
          FOREIGN KEY (map_id) REFERENCES map(map_id) ON DELETE CASCADE,
          UNIQUE(customer_id, map_id)
        );
        
        CREATE INDEX idx_customer_map_customer_id ON customer_map(customer_id);
        CREATE INDEX idx_customer_map_map_id ON customer_map(map_id);
        
        COMMENT ON TABLE customer_map IS 'Stores relationships between customers and maps';
      `);
      
      console.log('✅ customer_map table created successfully!');
    } else {
      console.log('✅ customer_map table already exists');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Error setting up customer_map table:', error);
  } finally {
    await pool.end();
  }
}

setupCustomerMapTable();