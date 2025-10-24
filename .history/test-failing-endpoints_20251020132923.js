/**
 * Test the failing endpoints
 */

import fetch from 'node-fetch';

const API_BASE = 'http://127.0.0.1:3101';

async function testCustomerMaps() {
  console.log('Testing GET /api/customer/20/maps...\n');
  
  try {
    const response = await fetch(`${API_BASE}/api/customer/20/maps`);
    const text = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response text:', text);
    
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('Response JSON:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Failed to parse JSON');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testCreateMap() {
  console.log('\n\nTesting POST /api/map...\n');
  
  const mapData = {
    title: 'Test Map',
    description: 'Test description',
    customer_id: 20,
    country: 'Lebanon',
    active: true
  };
  
  console.log('Sending data:', JSON.stringify(mapData, null, 2));
  
  try {
    const response = await fetch(`${API_BASE}/api/map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mapData)
    });
    
    const text = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response text:', text);
    
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('Response JSON:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Failed to parse JSON');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function run() {
  await testCustomerMaps();
  await testCreateMap();
  
  // Wait a bit for server logs to appear
  await new Promise(resolve => setTimeout(resolve, 1000));
  process.exit(0);
}

run();
