import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function checkZonesTable() {
  try {
    // Check if zones table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'zones'
      );
    `);
    
    console.log('Zones table exists:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating zones table...');
      await pool.query(`
        CREATE TABLE zones (
          id UUID PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          color VARCHAR(7) NOT NULL,
          coordinates JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Zones table created successfully!');
    } else {
      // Show table structure
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'zones' 
        ORDER BY ordinal_position;
      `);
      console.log('Zones table structure:');
      console.table(structure.rows);
    }
    
    // Check if any zones exist
    const zoneCount = await pool.query('SELECT COUNT(*) FROM zones');
    console.log('Total zones in database:', zoneCount.rows[0].count);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkZonesTable();