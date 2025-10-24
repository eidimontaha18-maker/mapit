import fetch from 'node-fetch';

async function simpleLoginTest() {
    const serverUrl = 'http://127.0.0.1:3101';
    
    console.log('🔍 Testing server connection...');
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        // Test health endpoint first
        console.log('Testing health endpoint...');
        const healthResponse = await fetch(`${serverUrl}/api/health`);
        
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Server is healthy:', healthData);
        } else {
            console.log('❌ Health check failed:', healthResponse.status);
            return;
        }
        
        // Test login with Alice (base64 encoded password)
        console.log('\n🔐 Testing login with Alice...');
        const loginData = {
            email: 'alice@example.com',
            password: 'Password123!'
        };
        
        console.log('Sending login request:', loginData);
        
        const loginResponse = await fetch(`${serverUrl}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        console.log('Response status:', loginResponse.status);
        
        const loginResult = await loginResponse.json();
        console.log('Login result:', loginResult);
        
        if (loginResult.success) {
            console.log('✅ Login successful!');
            console.log('User info:', loginResult.user);
        } else {
            console.log('❌ Login failed:', loginResult.error);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

simpleLoginTest();