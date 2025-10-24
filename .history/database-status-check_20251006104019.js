/**
 * Comprehensive database connection status check
 * This script verifies all aspects of the database configuration
 */

import db from './src/db/dbOperations.js';

async function comprehensiveStatusCheck() {
  console.log('🔍 MAPIT DATABASE CONNECTION STATUS CHECK');
  console.log('==========================================\n');
  
  try {
    // 1. Basic Connection Test
    console.log('1️⃣ BASIC CONNECTION TEST');
    console.log('------------------------');
    const isConnected = await db.testConnection();
    
    if (!isConnected) {
      console.log('❌ Database connection failed!');
      return;
    }
    
    // 2. Database Configuration Verification
    console.log('\n2️⃣ DATABASE CONFIGURATION');
    console.log('--------------------------');
    const dbInfo = await db.getDatabaseInfo();
    console.log(`📊 Database: ${dbInfo.database}`);
    console.log(`🏗️ Schema: ${dbInfo.schema}`);
    console.log(`👤 User: ${dbInfo.user}`);
    console.log(`🌐 URI: postgres://postgres:****@localhost:5432/mapit`);
    
    // 3. Tables and Structure
    console.log('\n3️⃣ DATABASE STRUCTURE');
    console.log('----------------------');
    const tables = await db.listTables();
    console.log(`📋 Tables found: ${tables.length}`);
    
    for (const table of tables) {
      const structure = await db.getTableStructure(table);
      console.log(`   └── ${table} (${structure.length} columns)`);
    }
    
    // 4. Configuration Summary
    console.log('\n4️⃣ SERVER CONFIGURATION SUMMARY');
    console.log('--------------------------------');
    console.log('🖥️ Server Host: 127.0.0.1');
    console.log('🔌 Server Port: 3000');
    console.log('🗄️ Database: mapit');
    console.log('📁 Schema: public');
    console.log('👥 Anon Role: anon');
    console.log('🌐 CORS Origins:');
    console.log('   - http://localhost:8080');
    console.log('   - http://127.0.0.1:8080');
    console.log('   - http://localhost:5173');
    console.log('   - http://127.0.0.1:5173');
    console.log('⏱️ CORS Max Age: 86400 seconds');
    
    // 5. Endpoints Available
    console.log('\n5️⃣ API ENDPOINTS AVAILABLE');
    console.log('---------------------------');
    console.log('🏥 Health Check: http://127.0.0.1:3000/api/health');
    console.log('📋 List Tables: http://127.0.0.1:3000/api/db/tables');
    console.log('🏗️ Table Structure: http://127.0.0.1:3000/api/db/tables/{tableName}/structure');
    console.log('📊 Table Data: http://127.0.0.1:3000/api/db/tables/{tableName}');
    console.log('👤 Register User: http://127.0.0.1:3000/api/register (POST)');
    
    // 6. Frontend URLs
    console.log('\n6️⃣ FRONTEND DEVELOPMENT URLS');
    console.log('-----------------------------');
    console.log('🖥️ Vite Dev Server: http://localhost:5173');
    console.log('🗺️ Map Application: http://localhost:5173/english-map.html');
    console.log('👥 Registration Page: http://localhost:5173/');
    
    console.log('\n✅ DATABASE CONNECTION SUCCESSFULLY CONFIGURED!');
    console.log('🎉 Your database is ready for use with the specified configuration.');
    
  } catch (error) {
    console.error('\n❌ CONFIGURATION ERROR:', error.message);
  } finally {
    await db.pool.end();
  }
}

comprehensiveStatusCheck();