import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mapit_db',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

async function checkPackages() {
  try {
    console.log('Checking packages table...');
    const result = await pool.query('SELECT * FROM packages ORDER BY priority');
    console.log('✅ Packages table exists with', result.rows.length, 'rows:');
    result.rows.forEach(pkg => {
      console.log(`  - ${pkg.name}: $${pkg.price} (${pkg.allowed_maps} maps, priority: ${pkg.priority})`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkPackages();
