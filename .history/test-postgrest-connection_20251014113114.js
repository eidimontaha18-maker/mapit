import fetch from 'node-fetch';

// PostgREST configuration
const POSTGREST_URL = 'http://127.0.0.1:3100';

async function testPostgRESTConnection() {
    console.log('🔍 Testing PostgREST connection...\n');
    
    try {
        // Test 1: Check if PostgREST server is running
        console.log('1. Testing PostgREST server availability...');
        const healthResponse = await fetch(`${POSTGREST_URL}/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (healthResponse.ok) {
            console.log('✅ PostgREST server is running on port 3100');
        } else {
            console.log(`❌ PostgREST server responded with status: ${healthResponse.status}`);
            return;
        }
        
        // Test 2: Try to access each table through PostgREST
        const tables = ['customer', 'customer_map', 'map', 'zones'];
        
        console.log('\n2. Testing table access through PostgREST API:');
        
        for (const table of tables) {
            try {
                const response = await fetch(`${POSTGREST_URL}/${table}?limit=1`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`   ✅ ${table}: Accessible (sample record count: ${data.length})`);
                } else {
                    console.log(`   ❌ ${table}: Error ${response.status} - ${response.statusText}`);
                }
            } catch (error) {
                console.log(`   ❌ ${table}: Connection error - ${error.message}`);
            }
        }
        
        // Test 3: Test a simple query
        console.log('\n3. Testing a simple query (GET /zones):');
        try {
            const zonesResponse = await fetch(`${POSTGREST_URL}/zones`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (zonesResponse.ok) {
                const zones = await zonesResponse.json();
                console.log(`   ✅ Retrieved ${zones.length} zones from PostgREST API`);
                if (zones.length > 0) {
                    console.log(`   📋 Sample zone: ${JSON.stringify(zones[0], null, 2)}`);
                }
            } else {
                console.log(`   ❌ Query failed with status: ${zonesResponse.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Query error: ${error.message}`);
        }
        
        console.log('\n🎉 PostgREST connection test completed!');
        
    } catch (error) {
        console.error('❌ Failed to connect to PostgREST:', error.message);
        console.log('\n💡 Possible issues:');
        console.log('   - PostgREST server is not running');
        console.log('   - PostgREST is running on a different port');
        console.log('   - Network connectivity issues');
        console.log('\n🔧 To start PostgREST, run: postgrest postgrest.conf');
    }
}

// Run the test
testPostgRESTConnection();