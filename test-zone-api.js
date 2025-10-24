// Test zone creation and retrieval
async function testZoneAPI() {
  console.log('Testing zone functionality...');
  
  const baseURL = 'http://127.0.0.1:3101/api';
  const mapId = 10; // Using existing map
  
  try {
    // Test 1: Get zones for a specific map
    console.log('\n1. Getting zones for map', mapId);
    const getResponse = await fetch(`${baseURL}/db/tables/zones?map_id=${mapId}`);
    const getResult = await getResponse.json();
    console.log('Get zones result:', getResult);
    
    // Test 2: Create a new zone
    console.log('\n2. Creating new zone...');
    const newZone = {
      id: 'test-zone-' + Date.now(),
      map_id: mapId,
      name: 'Test Zone from API',
      color: '#00ff00',
      coordinates: JSON.stringify([
        [51.505, -0.09],
        [51.51, -0.1],
        [51.51, -0.08],
        [51.505, -0.09]
      ])
    };
    
    const createResponse = await fetch(`${baseURL}/db/tables/zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newZone)
    });
    
    const createResult = await createResponse.json();
    console.log('Create zone result:', createResult);
    
    // Test 3: Get zones again to see the new one
    console.log('\n3. Getting zones again...');
    const getResponse2 = await fetch(`${baseURL}/db/tables/zones?map_id=${mapId}`);
    const getResult2 = await getResponse2.json();
    console.log('Get zones after creation:', getResult2);
    
    if (createResult.success && createResult.record) {
      // Test 4: Delete the test zone
      console.log('\n4. Deleting test zone...');
      const deleteResponse = await fetch(`${baseURL}/db/tables/zones/${createResult.record.id}`, {
        method: 'DELETE'
      });
      const deleteResult = await deleteResponse.json();
      console.log('Delete zone result:', deleteResult);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testZoneAPI();