/**
 * Test script for PostgreSQL database operations
 * 
 * This script demonstrates how to use the dbOperations module to connect
 * to PostgreSQL and perform CRUD operations on tables.
 */

import db from './src/db/dbOperations.js';

// Test function to demonstrate database operations
async function testDatabaseOperations() {
  console.log('Testing PostgreSQL connection and operations...');
  
  try {
    // Test connection
    const connected = await db.testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database. Check your configuration.');
      process.exit(1);
    }
    
    // Get database information
    const dbInfo = await db.getDatabaseInfo();
    console.log('\n📊 Database Info:');
    console.log(`- Database: ${dbInfo.database}`);
    console.log(`- Schema: ${dbInfo.schema}`);
    console.log(`- User: ${dbInfo.user}`);
    
    // List all tables
    const tables = await db.listTables();
    console.log('\n📋 Available Tables:');
    if (tables.length === 0) {
      console.log('No tables found in the database.');
    } else {
      tables.forEach(table => console.log(`- ${table}`));
    
      // For the first table, show structure and sample data
      const firstTable = tables[0];
      console.log(`\n🔍 Structure of '${firstTable}' table:`);
      const structure = await db.getTableStructure(firstTable);
      structure.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}${col.is_nullable === 'YES' ? ', nullable' : ''})`);
      });
      
      // Get sample data
      console.log(`\n📝 Sample data from '${firstTable}' table:`);
      const rows = await db.getAll(firstTable, undefined);
      if (rows.length === 0) {
        console.log(`No data found in ${firstTable}.`);
      } else {
        console.log(`Found ${rows.length} rows.`);
        console.log('First row:', rows[0]);
        
        // CRUD operations example (commented out for safety)
        console.log('\n✏️ CRUD Operations Examples:');
        console.log(`
  // INSERT example:
  const newRecord = await db.insert('${firstTable}', { 
    // Add appropriate column values here
    // column_name: value
  });
  
  // UPDATE example (if the table has an 'id' column):
  const updatedRecord = await db.update('${firstTable}', 1, { 
    // Add columns and values to update
    // column_name: new_value 
  });
  
  // DELETE example:
  const deleted = await db.remove('${firstTable}', 1);
        `);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during database operations:', error instanceof Error ? error.message : String(error));
  } finally {
    // Close the connection pool
    await db.pool.end();
    console.log('\n👋 Database connection closed.');
  }
}

// Run the test
testDatabaseOperations();