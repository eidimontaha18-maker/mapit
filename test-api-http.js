/**
 * Test API endpoints using http module
 */

import http from 'http';

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3101,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('Testing API endpoints...\n');
  
  // Test 1: Health check
  try {
    console.log('1. Testing /api/health...');
    const result = await testEndpoint('/api/health');
    console.log('   Status:', result.status);
    console.log('   Body:', result.body);
  } catch (err) {
    console.error('   ❌ Error:', err.message);
  }
  
  // Test 2: Login
  try {
    console.log('\n2. Testing /api/login...');
    const result = await testEndpoint('/api/login', 'POST', {
      email: 'test@example.com',
      password: 'test123'
    });
    console.log('   Status:', result.status);
    console.log('   Body:', result.body);
  } catch (err) {
    console.error('   ❌ Error:', err.message);
  }
  
  // Test 3: Get tables
  try {
    console.log('\n3. Testing /api/db/tables...');
    const result = await testEndpoint('/api/db/tables');
    console.log('   Status:', result.status);
    console.log('   Body:', result.body);
  } catch (err) {
    console.error('   ❌ Error:', err.message);
  }
  
  // Test 4: Get maps
  try {
    console.log('\n4. Testing /api/db/tables/map?customer_id=17...');
    const result = await testEndpoint('/api/db/tables/map?customer_id=17');
    console.log('   Status:', result.status);
    console.log('   Body:', result.body);
  } catch (err) {
    console.error('   ❌ Error:', err.message);
  }
  
  process.exit(0);
}

runTests();
