// Test script to verify zone creation and display functionality
import { v4 as uuidv4 } from 'uuid';

async function testZoneCreationAndDisplay() {
    try {
        console.log('🧪 Testing Zone Creation and Display...\n');
        
        // 1. Get map information
        console.log('📍 Fetching map information...');
        const mapResponse = await fetch('http://localhost:3101/api/db/tables/map/10');
        const mapData = await mapResponse.json();
        
        if (mapData.success) {
            console.log('✅ Map found:', mapData.record.title);
            console.log('📍 Map code:', mapData.record.map_codes[0]);
            console.log('👤 Customer ID:', mapData.record.customer_id);
        }
        
        // 2. Create a new test zone
        console.log('\n🎨 Creating new test zone...');
        const newZone = {
            id: uuidv4(),
            map_id: 10,
            customer_id: mapData.record.customer_id,
            name: `Interactive Test Zone ${new Date().getHours()}:${new Date().getMinutes()}`,
            color: '#00ff88', // Green color
            coordinates: JSON.stringify([
                [33.8938, 35.5018], // Lebanon coordinates
                [33.8958, 35.5038],
                [33.8978, 35.5018], 
                [33.8958, 35.4998],
                [33.8938, 35.5018]  // Close the polygon
            ])
        };
        
        const createResponse = await fetch('http://localhost:3101/api/db/tables/zones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newZone)
        });
        
        const createResult = await createResponse.json();
        if (createResult.success) {
            console.log('✅ Zone created successfully!');
            console.log('🆔 Zone ID:', newZone.id);
            console.log('🎯 Zone Name:', newZone.name);
            console.log('🎨 Zone Color:', newZone.color);
        } else {
            console.error('❌ Failed to create zone:', createResult.error);
            return;
        }
        
        // 3. Verify zone was saved
        console.log('\n🔍 Verifying zone was saved...');
        const zonesResponse = await fetch('http://localhost:3101/api/db/tables/zones?map_id=10');
        const zonesData = await zonesResponse.json();
        
        if (zonesData.success) {
            const totalZones = zonesData.records.length;
            const newlyCreatedZone = zonesData.records.find(z => z.id === newZone.id);
            
            console.log(`✅ Total zones for map 10: ${totalZones}`);
            if (newlyCreatedZone) {
                console.log('✅ Newly created zone found in database');
                console.log('📊 Zone details:', {
                    name: newlyCreatedZone.name,
                    color: newlyCreatedZone.color,
                    coordinates: typeof newlyCreatedZone.coordinates === 'string' ? 
                        JSON.parse(newlyCreatedZone.coordinates).length + ' points' : 
                        newlyCreatedZone.coordinates.length + ' points'
                });
            } else {
                console.error('❌ Newly created zone not found in database');
            }
        }
        
        // 4. Instructions for manual testing
        console.log('\n📋 Manual Testing Instructions:');
        console.log('1. Open http://localhost:5173 in your browser');
        console.log('2. Login and go to dashboard');
        console.log('3. Click "View" on map ID 10 (map1)');
        console.log('4. You should see:');
        console.log('   - Map code: MAP-1LBN-H1FH');
        console.log(`   - ${zonesData.records.length} zones in the "Created Zones" list`);
        console.log('   - Zone polygons displayed on the Lebanon map');
        console.log('5. Try creating a new zone:');
        console.log('   - Enter a zone name');
        console.log('   - Pick a color');
        console.log('   - Click "Draw Zone"');
        console.log('   - Draw a polygon on the map');
        console.log('   - Double-click to complete');
        console.log('   - Zone should appear immediately and be saved to database');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testZoneCreationAndDisplay();