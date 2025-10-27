// Verify packages table in Neon database
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function verifyPackagesTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database');

    // Check if packages table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'packages'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Packages table does not exist!');
      console.log('Creating packages table...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS packages (
          package_id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          price DECIMAL(10, 2) NOT NULL,
          allowed_maps INTEGER NOT NULL,
          priority INTEGER DEFAULT 0,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Packages table created');
      
      // Insert default packages
      await client.query(`
        INSERT INTO packages (name, price, allowed_maps, priority, active) VALUES
          ('free', 0.00, 1, 1, true),
          ('starter', 5.00, 3, 2, true),
          ('business', 15.00, 10, 3, true),
          ('enterprise', 50.00, -1, 4, true)
        ON CONFLICT (name) DO NOTHING;
      `);
      
      console.log('✅ Default packages inserted');
    } else {
      console.log('✅ Packages table exists');
    }

    // Get table structure
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'packages'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Packages table structure:');
    console.table(structure.rows);

    // Get packages data
    const packages = await client.query('SELECT * FROM packages ORDER BY package_id ASC');
    
    console.log('\n📦 Current packages in database:');
    console.table(packages.rows);
    
    console.log(`\n✅ Total packages: ${packages.rows.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

verifyPackagesTable();
