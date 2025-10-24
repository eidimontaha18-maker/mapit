import pkg from 'pg';
const { Client } = pkg;

const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'mapit',
    user: 'postgres',
    password: 'NewStrongPass123'
};

async function checkAndCreateAnonRole() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to database');
        
        // Check if anon role exists
        console.log('\n🔍 Checking existing roles...');
        const rolesQuery = "SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'postgres');";
        const roles = await client.query(rolesQuery);
        
        console.log('Existing roles:');
        roles.rows.forEach(row => console.log(`   - ${row.rolname}`));
        
        // Check if anon role exists
        const anonExists = roles.rows.some(row => row.rolname === 'anon');
        
        if (!anonExists) {
            console.log('\n🔧 Creating anon role...');
            await client.query('CREATE ROLE anon NOLOGIN;');
            console.log('✅ anon role created');
        } else {
            console.log('\n✅ anon role already exists');
        }
        
        // Grant permissions to anon role for all tables
        console.log('\n🔐 Granting permissions to anon role...');
        
        const tables = ['customer', 'customer_map', 'map', 'zones'];
        
        for (const table of tables) {
            try {
                await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON "${table}" TO anon;`);
                console.log(`   ✅ Granted permissions on ${table}`);
            } catch (error) {
                console.log(`   ❌ Error granting permissions on ${table}: ${error.message}`);
            }
        }
        
        // Grant usage on sequences (for auto-increment fields)
        console.log('\n🔢 Granting sequence permissions...');
        const sequencesQuery = `
            SELECT sequence_name 
            FROM information_schema.sequences 
            WHERE sequence_schema = 'public';
        `;
        
        const sequences = await client.query(sequencesQuery);
        
        for (const seq of sequences.rows) {
            try {
                await client.query(`GRANT USAGE, SELECT ON SEQUENCE "${seq.sequence_name}" TO anon;`);
                console.log(`   ✅ Granted sequence permissions on ${seq.sequence_name}`);
            } catch (error) {
                console.log(`   ❌ Error granting sequence permissions: ${error.message}`);
            }
        }
        
        console.log('\n🎉 Database permissions setup completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkAndCreateAnonRole();