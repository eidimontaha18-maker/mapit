import db from './src/db/dbOperations.js';

async function checkZoneConstraints() {
  try {
    console.log('Checking zones table foreign key constraints...');
    
    const result = await db.executeQuery(`
      SELECT 
        conname as constraint_name,
        confrelid::regclass as foreign_table,
        a.attname as column,
        af.attname as foreign_column
      FROM pg_constraint c 
      JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid 
      JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid 
      WHERE c.conrelid = 'zones'::regclass AND c.contype = 'f';
    `);
    
    console.log('Foreign key constraints:', result.rows);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkZoneConstraints();