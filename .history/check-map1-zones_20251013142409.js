// Check zones for map 1 (Lebanon)
async function checkMap1Zones() {
  try {
    const response = await fetch('http://127.0.0.1:3101/api/db/tables/zones?map_id=1');
    const data = await response.json();
    console.log('Map 1 zones API response:', data);
    
    if (data.success && data.records) {
      console.log('Found', data.records.length, 'zones for map 1:');
      data.records.forEach((zone, i) => {
        console.log(`${i+1}. ${zone.name} (${zone.color})`);
        console.log('   Coordinates type:', Array.isArray(zone.coordinates) ? 'Array' : typeof zone.coordinates);
        if (zone.coordinates) {
          console.log('   Coordinates sample:', JSON.stringify(zone.coordinates).substring(0, 100));
        }
        console.log('   Customer ID:', zone.customer_id);
      });
    }
    
    // Test if the ZonesDisplay component should work with this data
    console.log('\nTesting ZonesDisplay compatibility:');
    if (data.success && data.records && data.records.length > 0) {
      const sampleZone = data.records[0];
      console.log('Sample zone for ZonesDisplay:');
      console.log('- ID:', sampleZone.id);
      console.log('- Name:', sampleZone.name); 
      console.log('- Color:', sampleZone.color);
      console.log('- Coordinates:', sampleZone.coordinates ? 'Present' : 'Missing');
      console.log('- Coordinates length:', Array.isArray(sampleZone.coordinates) ? sampleZone.coordinates.length : 'Not array');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMap1Zones();