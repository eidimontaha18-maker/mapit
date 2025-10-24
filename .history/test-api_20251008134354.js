// Test API endpoints directly
import fetch from 'node-fetch';

async function testEndpoints() {
  try {
    // Test 1: Get all maps
    console.log('Testing GET /api/db/tables/map');
    const getMapsResponse = await fetch('http://localhost:3100/api/db/tables/map');
    const getMapsStatus = getMapsResponse.status;
    const getMapsData = await getMapsResponse.json();
    console.log('Status:', getMapsStatus);
    console.log('Response:', getMapsData);
    
    // Test 2: Create a map
    console.log('\nTesting POST /api/db/tables/map');
    const testMap = {
      title: 'API Test Map',
      description: 'Created via API test',
      map_data: { lat: 34.5, lng: 36.3, zoom: 7 },
      map_bounds: { center: [34.5, 36.3], zoom: 7 },
      active: true,
      country: 'Syria',
      map_codes: ['API-TEST-1234']
    };
    
    const createMapResponse = await fetch('http://localhost:3100/api/db/tables/map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMap)
    });
    
    const createMapStatus = createMapResponse.status;
    const createMapData = await createMapResponse.json();
    console.log('Status:', createMapStatus);
    console.log('Response:', createMapData);
    
    // Test 3: Verify map was created
    if (createMapData.success) {
      console.log('\nVerifying map was created...');
      const verifyResponse = await fetch('http://localhost:3100/api/db/tables/map');
      const verifyData = await verifyResponse.json();
      console.log('Maps in database:', verifyData.records?.length || 0);
      console.log('Maps:', verifyData.records);
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testEndpoints();