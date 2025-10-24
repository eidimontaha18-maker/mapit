/**
 * Simple test script to verify database connectivity
 */

import db from './src/db/dbOperations.js';

async function testDatabaseOperations() {
  console.log('🧪 Testing database operations...\n');
  
  try {
    // Test connection
    console.log('1. Testing connection...');
    const connected = await db.testConnection();
    if (!connected) {
      console.log('❌ Connection failed');
      return;
    }
    
    // Get database info
    console.log('\n2. Getting database info...');
    const dbInfo = await db.getDatabaseInfo();
    console.log('📊 Database info:', dbInfo);
    
    // List tables
    console.log('\n3. Listing tables...');
    const tables = await db.listTables();
    console.log('📋 Tables found:', tables);
    
    // If we have tables, get structure of first one
    if (tables.length > 0) {
      console.log(`\n4. Getting structure of table '${tables[0]}'...`);
      const structure = await db.getTableStructure(tables[0]);
      console.log('🏗️ Table structure:', structure);
    }
    
    console.log('\n✅ All database operations completed successfully!');
    
  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
  } finally {
    // Close the pool
    await db.pool.end();
  }
}

testDatabaseOperations();