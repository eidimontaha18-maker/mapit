// Fix API files to use customer and admin tables (not customers/admins)
// Also drop the duplicate tables
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function fixTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database\n');

    // Check customer table structure
    console.log('📋 CUSTOMER table structure:');
    const customerCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customer' 
      ORDER BY ordinal_position
    `);
    console.table(customerCols.rows);

    // Check admin table structure
    console.log('\n📋 ADMIN table structure:');
    const adminCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admin' 
      ORDER BY ordinal_position
    `);
    console.table(adminCols.rows);

    // Count records in each table
    const customerCount = await client.query('SELECT COUNT(*) FROM customer');
    const adminCount = await client.query('SELECT COUNT(*) FROM admin');
    const customersCount = await client.query('SELECT COUNT(*) FROM customers');
    const adminsCount = await client.query('SELECT COUNT(*) FROM admins');

    console.log('\n📊 Record counts:');
    console.log(`customer table: ${customerCount.rows[0].count} records`);
    console.log(`admin table: ${adminCount.rows[0].count} records`);
    console.log(`customers table: ${customersCount.rows[0].count} records (DUPLICATE)`);
    console.log(`admins table: ${adminsCount.rows[0].count} records (DUPLICATE)`);

    console.log('\n⚠️  Would you like to drop the duplicate tables?');
    console.log('Run this script with --drop flag to execute:');
    console.log('node fix-duplicate-tables.js --drop');

    if (process.argv.includes('--drop')) {
      console.log('\n🗑️  Dropping duplicate tables...');
      
      await client.query('DROP TABLE IF EXISTS customers CASCADE');
      console.log('✅ Dropped customers table');
      
      await client.query('DROP TABLE IF EXISTS admins CASCADE');
      console.log('✅ Dropped admins table');
      
      console.log('\n✅ Duplicate tables removed successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixTables();
