/**
 * Quick API Test
 * Tests the API endpoints to verify everything works
 */

import fetch from 'node-fetch';

const API_BASE = 'http://127.0.0.1:3101';

console.log('🧪 Testing MapIt API...\n');

async function testEndpoint(name, url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`✅ ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    console.log('');
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runTests() {
  console.log('=' .repeat(60));
  console.log('Testing API Endpoints');
  console.log('=' .repeat(60));
  console.log('');
  
  const tests = [
    ['Health Check', `${API_BASE}/api/health`],
    ['Test Endpoint', `${API_BASE}/api/test`],
    ['List Tables', `${API_BASE}/api/db/tables`],
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [name, url] of tests) {
    const result = await testEndpoint(name, url);
    if (result) passed++;
    else failed++;
  }
  
  console.log('=' .repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('=' .repeat(60));
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your API is working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Make sure the server is running:');
    console.log('   npm run server');
  }
}

runTests().catch(console.error);
