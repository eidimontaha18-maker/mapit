// Test script to create zones via API
const { v4: uuidv4 } = require('uuid');

async function testCreateZone() {
    try {
        // Test zone data
        const testZone = {
            id: uuidv4(),
            map_id: 10, // Using existing map
            customer_id: 18, // Using existing customer
            name: "Test Zone Visual",
            color: "#ff6b35", // Orange color
            coordinates: JSON.stringify([
                [20.1, 0.1],
                [20.2, 0.1],
                [20.2, 0.2],
                [20.1, 0.2],
                [20.1, 0.1]
            ])
        };

        console.log('Creating test zone:', testZone);

        const response = await fetch('http://localhost:3101/api/db/tables/zones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testZone)
        });

        const result = await response.json();
        console.log('Zone creation result:', result);

        if (result.success) {
            console.log('✅ Zone created successfully!');
            console.log('Zone ID:', testZone.id);
            console.log('Now check the map interface to see if it appears.');
        } else {
            console.error('❌ Failed to create zone:', result.error);
        }

    } catch (error) {
        console.error('❌ Error creating zone:', error);
    }
}

testCreateZone();