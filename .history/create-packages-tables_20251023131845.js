const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mapit_db',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

async function createPackagesAndOrdersTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating packages and orders tables...');
    
    // Create packages table
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
      )
    `);
    console.log('✅ Packages table created');

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        package_id INTEGER NOT NULL,
        date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE RESTRICT
      )
    `);
    console.log('✅ Orders table created');

    // Insert default packages
    await client.query(`
      INSERT INTO packages (name, price, allowed_maps, priority, active) VALUES
        ('free', 0.00, 1, 1, true),
        ('starter', 5.00, 3, 2, true),
        ('premium', 15.00, 30, 3, true)
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✅ Default packages inserted');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_package_id ON orders(package_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_date_time ON orders(date_time)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(active)
    `);
    console.log('✅ Indexes created');

    // Verify tables
    const packagesResult = await client.query('SELECT * FROM packages ORDER BY priority');
    console.log('\n📦 Available Packages:');
    packagesResult.rows.forEach(pkg => {
      console.log(`  - ${pkg.name}: $${pkg.price} (${pkg.allowed_maps} maps)`);
    });

    console.log('\n✅ All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createPackagesAndOrdersTables()
  .then(() => {
    console.log('\n🎉 Database setup complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to create tables:', err);
    process.exit(1);
  });
