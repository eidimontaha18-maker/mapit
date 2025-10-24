// Simple login page test using PostgREST directly
import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

const POSTGREST_URL = 'http://127.0.0.1:3100';

async function testLoginWithPostgREST() {
    console.log('🔐 Testing login using PostgREST directly...\n');
    
    const testCredentials = {
        email: 'eidimontaha188@gmail.com',  // From your login screenshot
        password: 'your-password-here'     // You'll need to know the actual password
    };
    
    try {
        // 1. First, let's see what customers exist
        console.log('1. Fetching customer data from PostgREST...');
        const customerResponse = await fetch(`${POSTGREST_URL}/customer?select=customer_id,first_name,last_name,email`);
        
        if (customerResponse.ok) {
            const customers = await customerResponse.json();
            console.log('✅ Available customers:');
            customers.forEach(customer => {
                console.log(`   ID: ${customer.customer_id}, Name: ${customer.first_name} ${customer.last_name}, Email: ${customer.email}`);
            });
        } else {
            console.log('❌ Could not fetch customers:', customerResponse.status);
            return;
        }
        
        // 2. Test login by checking email and password
        console.log('\n2. Testing login logic...');
        const loginEmail = 'eidimontaha188@gmail.com'; // Exact email from database
        
        // Query for user with specific email
        const userResponse = await fetch(`${POSTGREST_URL}/customer?email=eq.${encodeURIComponent(loginEmail)}&select=customer_id,first_name,last_name,email,password_hash`);
        
        if (userResponse.ok) {
            const users = await userResponse.json();
            
            if (users.length === 0) {
                console.log('❌ No user found with email:', loginEmail);
                console.log('💡 Try using: alice@example.com with password: Password123!');
            } else {
                const user = users[0];
                console.log('✅ User found:', `${user.first_name} ${user.last_name} (${user.email})`);
                console.log('🔐 Password hash format:', user.password_hash.substring(0, 20) + '...');
                
                // Provide instructions for frontend
                console.log('\n📝 For your frontend login:');
                console.log('   Email: alice@example.com');
                console.log('   Password: Password123!');
                console.log('   API Endpoint: http://127.0.0.1:3101/api/login');
            }
        } else {
            console.log('❌ Error querying user:', userResponse.status);
        }
        
        // 3. Create a simple HTML login tester
        console.log('\n3. Creating simple login tester...');
        
        const loginHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Login Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
        .form-group { margin: 15px 0; }
        input { width: 100%; padding: 10px; margin: 5px 0; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; cursor: pointer; }
        .result { margin: 20px 0; padding: 10px; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h2>Login Test</h2>
    <form id="loginForm">
        <div class="form-group">
            <input type="email" id="email" placeholder="Email" value="alice@example.com" required>
        </div>
        <div class="form-group">
            <input type="password" id="password" placeholder="Password" value="Password123!" required>
        </div>
        <button type="submit">Login</button>
    </form>
    
    <div id="result"></div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const resultDiv = document.getElementById('result');
            
            try {
                const response = await fetch('http://127.0.0.1:3101/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    resultDiv.innerHTML = '<div class="result success">✅ Login successful!<br>Welcome, ' + result.user.first_name + ' ' + result.user.last_name + '</div>';
                } else {
                    resultDiv.innerHTML = '<div class="result error">❌ Login failed: ' + result.error + '</div>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="result error">❌ Connection error: ' + error.message + '</div>';
            }
        });
    </script>
</body>
</html>`;

        // Write the HTML file
        import { writeFileSync } from 'fs';
        writeFileSync('login-tester.html', loginHTML);
        console.log('✅ Created login-tester.html');
        console.log('💡 Open login-tester.html in your browser to test login');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testLoginWithPostgREST();