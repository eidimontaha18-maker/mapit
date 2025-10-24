import fetch from 'node-fetch';

async function testLoginAPI() {
    console.log('🚀 Testing Login API...\n');
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const testUsers = [
        { email: 'alice@example.com', password: 'Password123!', expected: true },
        { email: 'bob@example.com', password: 'Password123!', expected: true },
        { email: 'eidimontaha188@gmail.com', password: 'wrongpassword', expected: false },
        { email: 'nonexistent@example.com', password: 'anything', expected: false }
    ];
    
    for (const user of testUsers) {
        console.log(`Testing: ${user.email}`);
        
        try {
            const response = await fetch('http://127.0.0.1:3101/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password
                })
            });
            
            const result = await response.json();
            
            if (user.expected && result.success) {
                console.log(`✅ SUCCESS: ${user.email} logged in successfully`);
                console.log(`   Welcome: ${result.user.first_name} ${result.user.last_name}`);
            } else if (!user.expected && !result.success) {
                console.log(`✅ EXPECTED FAILURE: ${user.email} correctly rejected`);
            } else if (user.expected && !result.success) {
                console.log(`❌ UNEXPECTED FAILURE: ${user.email} should have worked`);
                console.log(`   Error: ${result.error}`);
            } else {
                console.log(`❌ UNEXPECTED SUCCESS: ${user.email} should have failed`);
            }
            
        } catch (error) {
            console.log(`❌ CONNECTION ERROR: ${error.message}`);
            break;
        }
        
        console.log(''); // Empty line
    }
}

testLoginAPI();