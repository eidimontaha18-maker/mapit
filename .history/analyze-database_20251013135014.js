import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function analyzeDatabaseStructure() {
  try {
    console.log('🗄️  Database Structure Analysis\n');
    
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in database:');
    tables.rows.forEach(row => console.log('   -', row.table_name));
    
    // Analyze each table structure
    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`\n📊 Table: ${tableName}`);
      
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'NO' ? ' NOT NULL' : '';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`   ${col.column_name}: ${col.data_type}${nullable}${defaultVal}`);
      });
      
      // Show row count
      const count = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
      console.log(`   📊 Records: ${count.rows[0].count}`);
    }
    
    // Show relationships
    console.log('\n🔗 Foreign Key Relationships:');
    const fks = await pool.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name
    `);
    
    if (fks.rows.length > 0) {
      fks.rows.forEach(fk => {
        console.log(`   ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('   No foreign key relationships found');
    }
    
    // Show sample data from key tables
    console.log('\n📄 Sample Data:');
    
    const keyTables = ['users', 'customer', 'map', 'zones'];
    for (const tableName of keyTables) {
      const tableExists = tables.rows.find(t => t.table_name === tableName);
      if (tableExists) {
        console.log(`\n   ${tableName} (sample):`);
        const sample = await pool.query(`SELECT * FROM ${tableName} LIMIT 3`);
        if (sample.rows.length > 0) {
          console.table(sample.rows.map(row => {
            const simplified = {};
            Object.keys(row).slice(0, 5).forEach(key => {
              simplified[key] = row[key];
            });
            return simplified;
          }));
        } else {
          console.log('     (empty table)');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeDatabaseStructure();