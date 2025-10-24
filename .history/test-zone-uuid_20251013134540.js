import { v4 as uuidv4 } from 'uuid';

// Test zone creation with proper UUID
async function testZoneAPIWithUUID() {
  console.log('Testing zone functionality with proper UUID...');
  
  const baseURL = 'http://127.0.0.1:3101/api';
  const mapId = 10; // Using existing map
  
  try {
    // Test: Create a new zone with proper UUID
    console.log('\nCreating new zone with UUID...');
    const newZone = {
      id: uuidv4(), // Proper UUID
      map_id: mapId,
      name: 'Test Zone from API with UUID',
      color: '#00ff00',
      coordinates: JSON.stringify([
        [51.505, -0.09],
        [51.51, -0.1], 
        [51.51, -0.08],
        [51.505, -0.09]
      ])
    };
    
    console.log('Sending zone data:', newZone);
    
    const createResponse = await fetch(`${baseURL}/db/tables/zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newZone)
    });
    
    const createResult = await createResponse.json();
    console.log('Create zone result:', createResult);
    
    if (createResult.success) {
      console.log('✅ Zone created successfully!');
      
      // Get zones to verify it was saved
      console.log('\nGetting all zones for map', mapId);
      const getResponse = await fetch(`${baseURL}/db/tables/zones?map_id=${mapId}`);
      const getResult = await getResponse.json();
      console.log('Total zones found:', getResult.records?.length);
      
      getResult.records?.forEach((zone, index) => {
        console.log(`Zone ${index + 1}:`, {
          id: zone.id,
          name: zone.name,
          color: zone.color,
          coordinates: Array.isArray(zone.coordinates) ? `Array(${zone.coordinates.length})` : zone.coordinates
        });
      });
    } else {
      console.log('❌ Failed to create zone:', createResult.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testZoneAPIWithUUID();