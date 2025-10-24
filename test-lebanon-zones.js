// Quick test to verify zone functionality with the current setup
async function testZoneFunctionality() {
  console.log('🧪 Testing Zone Functionality for Lebanon Map\n');
  
  try {
    // Check Lebanon map (map ID 2 based on earlier data)
    console.log('1️⃣ Testing Lebanon Map (ID: 2)');
    const lebanonZones = await fetch('http://127.0.0.1:3101/api/db/tables/zones?map_id=2');
    const lebanonData = await lebanonZones.json();
    
    console.log('Lebanon map zones:', lebanonData);
    
    if (!lebanonData.success || lebanonData.records.length === 0) {
      console.log('No zones found for Lebanon map, creating a test zone...');
      
      // Create a test zone for Lebanon
      const testZone = {
        id: crypto.randomUUID(),
        map_id: 2,
        customer_id: 6, // Based on earlier data showing customer_id: 6 for lebanon map
        name: 'Beirut Test Zone',
        color: '#00ff88',
        coordinates: JSON.stringify([
          [33.8886, 35.4955], // Beirut area
          [33.9200, 35.5200],
          [33.9200, 35.5800],
          [33.8886, 35.5800],
          [33.8886, 35.4955]
        ])
      };
      
      const createResponse = await fetch('http://127.0.0.1:3101/api/db/tables/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testZone)
      });
      
      const createResult = await createResponse.json();
      console.log('Zone creation result:', createResult);
      
      if (createResult.success) {
        console.log('✅ Test zone created for Lebanon map!');
        console.log('📍 Zone details:');
        console.log(`   Name: ${testZone.name}`);
        console.log(`   Color: ${testZone.color}`);
        console.log(`   Map ID: ${testZone.map_id}`);
        console.log(`   Customer ID: ${testZone.customer_id}`);
        
        console.log('\n🚀 Now test in browser:');
        console.log('1. Go to http://localhost:5174');
        console.log('2. Login with your credentials');
        console.log('3. Go to Dashboard');
        console.log('4. Edit the Lebanon map');
        console.log('5. You should see the "Beirut Test Zone" displayed on the map');
        console.log('6. Try drawing a new zone using Zone Controls');
        console.log('7. Check browser console for debugging logs');
      }
    } else {
      console.log(`✅ Found ${lebanonData.records.length} existing zones for Lebanon map`);
      lebanonData.records.forEach((zone, i) => {
        console.log(`   ${i+1}. ${zone.name} (${zone.color})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testZoneFunctionality();