// Setup database tables for MapIt application
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to database...\n');

    // Create customers table
    console.log('📋 Creating customers table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Customers table created\n');

    // Create admins table
    console.log('📋 Creating admins table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log('✅ Admins table created\n');

    // Create maps table
    console.log('📋 Creating maps table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS maps (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        map_data JSONB,
        map_bounds JSONB,
        active BOOLEAN DEFAULT true,
        country VARCHAR(100)
      );
    `);
    console.log('✅ Maps table created\n');

    // Create zones table
    console.log('📋 Creating zones table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS zones (
        id SERIAL PRIMARY KEY,
        map_id INTEGER REFERENCES maps(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50),
        coordinates JSONB,
        properties JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Zones table created\n');

    // Create indexes
    console.log('📊 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
      CREATE INDEX IF NOT EXISTS idx_maps_customer ON maps(customer_id);
      CREATE INDEX IF NOT EXISTS idx_maps_active ON maps(active);
      CREATE INDEX IF NOT EXISTS idx_zones_map ON zones(map_id);
    `);
    console.log('✅ Indexes created\n');

    // Insert test customer
    console.log('👤 Creating test customer...');
    await client.query(`
      INSERT INTO customers (email, password, first_name, last_name)
      VALUES ('test@mapit.com', 'test123', 'Test', 'User')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✅ Test customer created (email: test@mapit.com, password: test123)\n');

    // Insert test admin
    console.log('👤 Creating test admin...');
    await client.query(`
      INSERT INTO admins (email, password, first_name, last_name)
      VALUES ('admin@mapit.com', 'admin123', 'Admin', 'User')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✅ Test admin created (email: admin@mapit.com, password: admin123)\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Available tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Count records
    const customerCount = await client.query('SELECT COUNT(*) FROM customers');
    const adminCount = await client.query('SELECT COUNT(*) FROM admins');
    
    console.log('\n📈 Table Statistics:');
    console.log(`   - Customers: ${customerCount.rows[0].count}`);
    console.log(`   - Admins: ${adminCount.rows[0].count}`);

    console.log('\n✨ Database setup complete!\n');
    console.log('You can now login with:');
    console.log('   Customer: test@mapit.com / test123');
    console.log('   Admin: admin@mapit.com / admin123\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupTables().catch(console.error);
