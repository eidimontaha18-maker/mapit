/**
 * Test API endpoints directly
 */

async function testEndpoints() {
  console.log('Testing API endpoints...\n');
  
  // Test 1: Health check
  try {
    console.log('1. Testing /api/health...');
    const healthRes = await fetch('http://localhost:3101/api/health');
    const healthData = await healthRes.json();
    console.log('   ✅ Health check:', healthData);
  } catch (err) {
    console.error('   ❌ Health check failed:', err.message);
  }
  
  // Test 2: Login endpoint
  try {
    console.log('\n2. Testing /api/login...');
    const loginRes = await fetch('http://localhost:3101/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        password: 'test123' 
      })
    });
    console.log('   Status:', loginRes.status);
    const loginText = await loginRes.text();
    console.log('   Response body:', loginText);
    try {
      const loginData = JSON.parse(loginText);
      console.log('   Parsed:', loginData);
    } catch (e) {
      console.log('   Could not parse as JSON');
    }
  } catch (err) {
    console.error('   ❌ Login test failed:', err.message);
  }
  
  // Test 3: List tables
  try {
    console.log('\n3. Testing /api/db/tables...');
    const tablesRes = await fetch('http://localhost:3101/api/db/tables');
    const tablesData = await tablesRes.json();
    console.log('   ✅ Tables:', tablesData);
  } catch (err) {
    console.error('   ❌ Tables test failed:', err.message);
  }
  
  // Test 4: Get maps with customer_id
  try {
    console.log('\n4. Testing /api/db/tables/map?customer_id=17...');
    const mapsRes = await fetch('http://localhost:3101/api/db/tables/map?customer_id=17');
    console.log('   Status:', mapsRes.status);
    const mapsText = await mapsRes.text();
    console.log('   Response body:', mapsText);
    try {
      const mapsData = JSON.parse(mapsText);
      console.log('   Parsed:', mapsData);
    } catch (e) {
      console.log('   Could not parse as JSON');
    }
  } catch (err) {
    console.error('   ❌ Maps test failed:', err.message);
  }
}

testEndpoints();
