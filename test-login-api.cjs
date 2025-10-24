// Test login endpoint directly
const fetch = require('node-fetch');

async function testLogin() {
  console.log('Testing login endpoint at http://localhost:3101/api/login');
  
  try {
    const response = await fetch('http://localhost:3101/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'Password123!'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response text:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed JSON:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Could not parse JSON');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
