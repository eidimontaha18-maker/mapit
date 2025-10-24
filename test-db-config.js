/**
 * Test Database Connection
 * 
 * This script tests the database connection using the centralized config
 * Run: node test-db-config.js
 */

import dbConfig from './config/database.js';

console.log('🔍 Testing Database Connection...\n');

console.log('📋 Configuration:');
console.log('   Host:', dbConfig.db.host);
console.log('   Port:', dbConfig.db.port);
console.log('   Database:', dbConfig.db.database);
console.log('   User:', dbConfig.db.user);
console.log('   PostgREST:', `http://${dbConfig.postgrest.host}:${dbConfig.postgrest.port}`);
console.log('');

// Test the connection
try {
  const result = await dbConfig.testConnection();
  
  if (result) {
    console.log('\n✅ All connections working!');
    console.log('\n📚 Next steps:');
    console.log('   1. Start your server: npm run server');
    console.log('   2. Start PostgREST: postgrest postgrest.conf');
    console.log('   3. Start frontend: npm run dev');
  } else {
    console.log('\n❌ Connection failed. Please check:');
    console.log('   1. PostgreSQL is running');
    console.log('   2. Database "mapit" exists');
    console.log('   3. Credentials in .env are correct');
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
} finally {
  await dbConfig.closePool();
  process.exit(0);
}
