// Test map saving API endpoint
import fetch from 'node-fetch';

async function testMapSaving() {
  const mapData = {
    title: "Test Map from API Test",
    description: "This is a test map created via direct API call",
    map_data: { 
      lat: 35.123, 
      lng: 33.456, 
      zoom: 8 
    },
    map_bounds: { 
      center: [35.123, 33.456], 
      zoom: 8 
    },
    active: true,
    country: "Cyprus",
    map_codes: ["TEST-1234-5678"],
    customer_id: 6  // Using an existing customer ID from our check
  };

  try {
    console.log('Sending test request to save map...');
    const response = await fetch('http://localhost:8080/api/db/map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapData)
    });
    
    const status = response.status;
    const contentType = response.headers.get('content-type');
    console.log(`Response status: ${status}`);
    console.log(`Content type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      console.log('Response JSON:', JSON.stringify(responseData, null, 2));
    } else {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.error('Error testing map API:', error);
  }
}

testMapSaving();