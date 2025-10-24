async function testZonesEndpoint() {
  try {
    console.log('Testing zones API endpoint...');
    const response = await fetch('http://localhost:3101/api/db/tables/zones?map_id=10');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testZonesEndpoint();