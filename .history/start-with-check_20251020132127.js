/**
 * Quick Database Check and Server Startup
 * 
 * This script checks database connectivity before starting the server
 * Run: node start-with-check.js
 */

import dbConfig from './config/database.js';
import { spawn } from 'child_process';

console.log('🚀 MapIt Server Startup\n');
console.log('=' .repeat(50));

// Test database connection first
console.log('\n📊 Step 1: Testing Database Connection...\n');

try {
  const connected = await dbConfig.testConnection();
  
  if (!connected) {
    console.error('\n❌ Cannot start server: Database connection failed!\n');
    console.log('Please check:');
    console.log('  1. PostgreSQL is running');
    console.log('  2. Database "mapit" exists');
    console.log('  3. Credentials in .env are correct\n');
    process.exit(1);
  }
  
  console.log('\n✅ Database check passed!\n');
  console.log('=' .repeat(50));
  console.log('\n🌐 Step 2: Starting Express Server...\n');
  
  // Close the test connection pool
  await dbConfig.closePool();
  
  // Start the server
  const serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
  });
  
  serverProcess.on('exit', (code) => {
    console.log(`\nServer exited with code ${code}`);
    process.exit(code || 0);
  });
  
} catch (error) {
  console.error('\n❌ Startup error:', error.message);
  process.exit(1);
}
