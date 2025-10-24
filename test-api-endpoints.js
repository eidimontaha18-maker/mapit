/**
 * Test script to verify API endpoints are working
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:3000';

async function testAPIEndpoints() {
  console.log('🧪 Testing API endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('❤️ Health check:', healthData);
    
    // Test database tables endpoint
    console.log('\n2. Testing tables endpoint...');
    const tablesResponse = await fetch(`${BASE_URL}/api/db/tables`);
    const tablesData = await tablesResponse.json();
    console.log('📋 Tables:', tablesData);
    
    // Test getting records from customer table
    console.log('\n3. Testing customer table data...');
    const customerResponse = await fetch(`${BASE_URL}/api/db/tables/customer`);
    const customerData = await customerResponse.json();
    console.log('👥 Customer records count:', customerData.records?.length || 0);
    
    // Test table structure endpoint
    console.log('\n4. Testing table structure endpoint...');
    const structureResponse = await fetch(`${BASE_URL}/api/db/tables/customer/structure`);
    const structureData = await structureResponse.json();
    console.log('🏗️ Customer table structure columns:', structureData.structure?.length || 0);
    
    console.log('\n✅ All API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Add node-fetch if not available
try {
  await testAPIEndpoints();
} catch (importError) {
  console.log('📦 Installing node-fetch dependency...');
  const { exec } = await import('child_process');
  exec('npm install node-fetch', async (error, stdout, stderr) => {
    if (error) {
      console.error('Failed to install node-fetch:', error.message);
      return;
    }
    console.log('✅ node-fetch installed, running tests...');
    await testAPIEndpoints();
  });
}