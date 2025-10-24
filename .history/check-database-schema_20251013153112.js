const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mapit',
  password: 'NewStrongPass123',
  port: 5432,
});

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking current database schema...\n');

    // Get all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📋 Current Tables:');
    tables.rows.forEach(t => console.log(`- ${t.table_name}`));
    console.log('');

    // Check each table structure
    for (const table of tables.rows) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [table.table_name]);

      console.log(`🏗️  ${table.table_name.toUpperCase()} TABLE:`);
      columns.rows.forEach(c => {
        const nullable = c.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
        const defaultVal = c.column_default ? `DEFAULT ${c.column_default}` : '';
        console.log(`   ${c.column_name} (${c.data_type}) ${nullable} ${defaultVal}`);
      });
      console.log('');
    }

    // Check foreign key constraints
    const constraints = await pool.query(`
      SELECT 
        tc.table_name, 
        tc.constraint_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      ORDER BY tc.table_name;
    `);

    console.log('🔗 Current Foreign Key Relationships:');
    constraints.rows.forEach(c => {
      console.log(`   ${c.table_name}.${c.column_name} -> ${c.foreign_table_name}.${c.foreign_column_name}`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    pool.end();
  }
}

checkDatabaseSchema();