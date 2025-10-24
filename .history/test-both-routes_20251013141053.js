// Test zone creation via zone-routes vs db-routes
async function testBothRoutes() {
  console.log('🧪 Testing Zone Creation Routes\n');
  
  const baseURL = 'http://127.0.0.1:3101/api';
  const mapId = 10;
  
  try {
    console.log('1️⃣  Testing via zone-routes (/api/zones)...');
    const zoneRouteData = {
      id: crypto.randomUUID(),
      map_id: mapId,
      name: 'Zone Routes Test',
      color: '#ff9900',
      coordinates: [
        [30.1, -90.1],
        [30.2, -90.0],
        [30.2, -89.9],
        [30.1, -89.9],
        [30.1, -90.1]
      ]
    };
    
    const zoneResponse = await fetch(`${baseURL}/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zoneRouteData)
    });
    
    const zoneResult = await zoneResponse.json();
    console.log('Zone routes result:', zoneResult.success ? '✅ Success' : '❌ Failed');
    
    if (zoneResult.success) {
      console.log('   Zone ID:', zoneResult.zone.id);
      console.log('   Customer ID:', zoneResult.zone.customer_id);
      console.log('   Map ID:', zoneResult.zone.map_id);
    } else {
      console.log('   Error:', zoneResult.error);
    }
    
    console.log('\n2️⃣  Testing via db-routes (/api/db/tables/zones)...');
    const dbRouteData = {
      id: crypto.randomUUID(),
      map_id: mapId,
      name: 'DB Routes Test',
      color: '#0099ff',
      coordinates: JSON.stringify([
        [31.1, -91.1],
        [31.2, -91.0],
        [31.2, -90.9],
        [31.1, -90.9],
        [31.1, -91.1]
      ])
    };
    
    const dbResponse = await fetch(`${baseURL}/db/tables/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbRouteData)
    });
    
    const dbResult = await dbResponse.json();
    console.log('DB routes result:', dbResult.success ? '✅ Success' : '❌ Failed');
    
    if (dbResult.success) {
      console.log('   Zone ID:', dbResult.record.id);
      console.log('   Customer ID:', dbResult.record.customer_id);
      console.log('   Map ID:', dbResult.record.map_id);
    } else {
      console.log('   Error:', dbResult.error);
    }
    
    console.log('\n3️⃣  Checking all zones for map', mapId);
    const allZonesResponse = await fetch(`${baseURL}/db/tables/zones?map_id=${mapId}`);
    const allZonesResult = await allZonesResponse.json();
    
    if (allZonesResult.success) {
      console.log(`   Total zones: ${allZonesResult.records.length}`);
      allZonesResult.records.forEach((zone, i) => {
        console.log(`   ${i+1}. ${zone.name} - Customer ${zone.customer_id} (${zone.color})`);
      });
    }
    
    console.log('\n🎯 Comparison:');
    console.log('   Zone Routes: Automatically sets customer_id from map ownership');
    console.log('   DB Routes: Generic insert, no automatic customer_id');
    console.log('   Recommendation: Use Zone Routes for proper customer linking');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBothRoutes();