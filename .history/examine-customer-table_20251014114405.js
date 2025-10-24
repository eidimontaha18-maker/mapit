import pkg from 'pg';
const { Client } = pkg;

const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'mapit',
    user: 'postgres',
    password: 'NewStrongPass123'
};

async function examineCustomerTable() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to database');
        
        // Get customer table structure
        console.log('\n📋 Customer table structure:');
        const structureQuery = `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'customer' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `;
        
        const structure = await client.query(structureQuery);
        structure.rows.forEach(row => {
            console.log(`   ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
        });
        
        // Get sample customer data (without showing passwords)
        console.log('\n👥 Sample customer data:');
        const sampleQuery = `
            SELECT customer_id, first_name, last_name, email, registration_date
            FROM customer 
            LIMIT 5;
        `;
        
        const samples = await client.query(sampleQuery);
        samples.rows.forEach(row => {
            console.log(`   ID: ${row.customer_id}, Name: ${row.name}, Email: ${row.email}`);
        });
        
        // Check if passwords are hashed
        console.log('\n🔐 Password format check:');
        const passwordQuery = `
            SELECT customer_id, email, 
                   CASE 
                       WHEN LENGTH(password) > 50 THEN 'Likely hashed (length: ' || LENGTH(password) || ')'
                       ELSE 'Plain text (length: ' || LENGTH(password) || ')'
                   END as password_format
            FROM customer 
            LIMIT 3;
        `;
        
        const passwordCheck = await client.query(passwordQuery);
        passwordCheck.rows.forEach(row => {
            console.log(`   ${row.email}: ${row.password_format}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

examineCustomerTable();