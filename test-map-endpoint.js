import fetch from 'node-fetch';

async function testMapAPI() {
  try {
    console.log('Testing map API endpoint...');
    const response = await fetch('http://localhost:3101/api/db/tables/map/10');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testMapAPI();