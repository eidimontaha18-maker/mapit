// Simple test script to register and login user
import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:3101';

async function registerUser() {
    try {
        const response = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name: 'Test',
                last_name: 'User', 
                email: 'eldmontaha18888@gmail.com',
                password: '12345'
            })
        });
        
        const result = await response.json();
        console.log('Registration result:', result);
        return result;
    } catch (error) {
        console.error('Registration error:', error.message);
        return null;
    }
}

async function loginUser() {
    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'eldmontaha18888@gmail.com',
                password: '12345'
            })
        });
        
        const result = await response.json();
        console.log('Login result:', result);
        return result;
    } catch (error) {
        console.error('Login error:', error.message);
        return null;
    }
}

async function main() {
    console.log('Testing API endpoints...');
    
    // Register user
    console.log('\n1. Registering user...');
    await registerUser();
    
    // Login user
    console.log('\n2. Testing login...');
    await loginUser();
}

main();