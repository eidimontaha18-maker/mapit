import db from './src/db/dbOperations.js';

async function fixZoneConstraints() {
  try {
    console.log('Fixing zones table foreign key constraints...');
    
    // Drop the existing foreign key constraint that points to maps table
    await db.executeQuery('ALTER TABLE zones DROP CONSTRAINT IF EXISTS fk_map;');
    console.log('✅ Dropped old fk_map constraint');
    
    // Add new foreign key constraint that points to map table
    await db.executeQuery(`
      ALTER TABLE zones 
      ADD CONSTRAINT fk_map 
      FOREIGN KEY (map_id) REFERENCES map(map_id) 
      ON DELETE CASCADE;
    `);
    console.log('✅ Added new fk_map constraint pointing to map table');
    
    // Verify the constraint
    const result = await db.executeQuery(`
      SELECT 
        conname as constraint_name,
        confrelid::regclass as foreign_table,
        a.attname as column,
        af.attname as foreign_column
      FROM pg_constraint c 
      JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid 
      JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid 
      WHERE c.conrelid = 'zones'::regclass AND c.contype = 'f' AND c.conname = 'fk_map';
    `);
    
    console.log('Updated constraint:', result.rows);
    
  } catch (error) {
    console.error('Error fixing constraints:', error);
  }
}

fixZoneConstraints();