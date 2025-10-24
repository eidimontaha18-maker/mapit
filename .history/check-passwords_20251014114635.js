import pkg from 'pg';
const { Client } = pkg;

const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'mapit',
    user: 'postgres',
    password: 'NewStrongPass123'
};

async function checkPasswords() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to database');
        
        // Get actual passwords for testing (first 3 users only)
        console.log('\n🔐 Password values for testing:');
        const passwordQuery = `
            SELECT customer_id, first_name, last_name, email, password_hash
            FROM customer 
            ORDER BY customer_id
            LIMIT 5;
        `;
        
        const result = await client.query(passwordQuery);
        result.rows.forEach(row => {
            console.log(`   ${row.email}: "${row.password_hash}"`);
            console.log(`     Name: ${row.first_name} ${row.last_name} (ID: ${row.customer_id})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkPasswords();