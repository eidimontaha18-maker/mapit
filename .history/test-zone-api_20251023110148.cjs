// Test if the zone API endpoint is working
async function testZoneAPI() {
  try {
    console.log('🧪 Testing Zone API endpoint...\n');
    
    // Test 1: Try to fetch zones for map 26
    console.log('Test 1: GET /api/map/26/zones');
    const getResponse = await fetch('http://localhost:5173/api/map/26/zones');
    console.log('Status:', getResponse.status);
    const getData = await getResponse.json();
    console.log('Response:', getData);
    console.log('');
    
    // Test 2: Try to create a zone
    console.log('Test 2: POST /api/zones');
    const { v4: uuidv4 } = require('uuid');
    const testZone = {
      id: uuidv4(),
      map_id: 26,
      name: 'API Test Zone',
      color: '#FF5733',
      coordinates: [[33.8547, 35.8623], [33.8548, 35.8624], [33.8549, 35.8625]]
    };
    
    const postResponse = await fetch('http://localhost:5173/api/zones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testZone)
    });
    
    console.log('Status:', postResponse.status);
    const postData = await postResponse.json();
    console.log('Response:', postData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testZoneAPI();
