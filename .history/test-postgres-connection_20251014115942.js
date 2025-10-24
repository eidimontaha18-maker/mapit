/**
 * Test PostgreSQL connection and list tables
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function testConnection() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Test connection
    const result = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log('✅ Connected successfully!');
    console.log('📅 Database time:', result.rows[0].now);
    console.log('🗄️  Database name:', result.rows[0].db);
    
    // List all tables
    console.log('\n📋 Tables in database:');
    const tables = await pool.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length === 0) {
      console.log('   No tables found in public schema');
    } else {
      tables.rows.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.table_name} (${row.table_type})`);
      });
    }
    
    // Get column info for each table
    console.log('\n📊 Table structures:');
    for (const table of tables.rows) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);
      
      console.log(`\n   ${table.table_name}:`);
      columns.rows.forEach(col => {
        console.log(`      - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
      });
    }
    
    await pool.end();
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
