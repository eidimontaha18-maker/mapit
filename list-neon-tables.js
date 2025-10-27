// List all tables in Neon database
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function listAllTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database\n');

    // Get all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📊 Tables in your Neon database:');
    console.log('=================================\n');
    
    if (tables.rows.length === 0) {
      console.log('❌ No tables found!');
      return;
    }

    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`\n📋 Table: ${tableName.toUpperCase()}`);
      console.log('-'.repeat(50));

      // Get table structure
      const structure = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.table(structure.rows);

      // Get row count
      const count = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`📊 Total rows: ${count.rows[0].count}`);

      // Get sample data (first 3 rows)
      const sample = await client.query(`SELECT * FROM ${tableName} LIMIT 3`);
      if (sample.rows.length > 0) {
        console.log(`\n🔍 Sample data (first ${sample.rows.length} rows):`);
        console.table(sample.rows);
      }
    }

    console.log('\n\n📊 Summary:');
    console.log('=================================');
    console.log(`Total tables: ${tables.rows.length}`);
    console.log('Tables:', tables.rows.map(t => t.table_name).join(', '));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

listAllTables();
