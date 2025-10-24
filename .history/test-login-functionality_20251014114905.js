import fetch from 'node-fetch';

const SERVER_URL = 'http://127.0.0.1:3101';

async function testLogin() {
    console.log('🔐 Testing login functionality...\n');
    
    // Test with actual credentials from your database
    const testCredentials = [
        { email: 'alice@example.com', password: 'Password123!' }, // Base64 encoded
        { email: 'bob@example.com', password: 'Password123!' }, // Base64 encoded
        { email: 'charlie@example.com', password: 'Password123!' }, // Base64 encoded
        { email: 'eidimontaha188@gmail.com', password: '123456' }, // Bcrypt hashed (guessing common password)
        { email: 'eidimontaha@gmail.com', password: 'Password123!' } // Wrong email format (should fail)
    ];
    
    for (const credentials of testCredentials) {
        console.log(`Testing login for: ${credentials.email}`);
        
        try {
            const response = await fetch(`${SERVER_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log(`✅ Login successful!`);
                console.log(`   User: ${result.user.first_name} ${result.user.last_name}`);
                console.log(`   Customer ID: ${result.user.customer_id}`);
            } else {
                console.log(`❌ Login failed: ${result.error}`);
            }
            
        } catch (error) {
            console.log(`❌ Connection error: ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }
    
    // Also test the server health
    console.log('🏥 Testing server health...');
    try {
        const healthResponse = await fetch(`${SERVER_URL}/api/health`);
        const healthData = await healthResponse.json();
        
        if (healthResponse.ok) {
            console.log('✅ Server is healthy');
            console.log(`   Database time: ${healthData.time}`);
        } else {
            console.log('❌ Server health check failed');
        }
    } catch (error) {
        console.log(`❌ Cannot reach server: ${error.message}`);
        console.log('💡 Make sure your server is running on port 3101');
        console.log('   Run: npm run server or node server.js');
    }
}

testLogin();