import pkg from 'pg';
const { Client } = pkg;

// Database configuration from your postgrest.conf
const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'mapit',
    user: 'postgres',
    password: 'NewStrongPass123'
};

async function connectAndListTables() {
    const client = new Client(dbConfig);
    
    try {
        console.log('Connecting to PostgreSQL database...');
        await client.connect();
        console.log('✅ Successfully connected to the database!');
        
        // Query to get all table names from the public schema
        const query = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;
        
        console.log('\n📋 Listing all tables in the public schema:');
        const result = await client.query(query);
        
        if (result.rows.length === 0) {
            console.log('No tables found in the public schema.');
        } else {
            console.log(`Found ${result.rows.length} table(s):`);
            result.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.table_name}`);
            });
        }
        
        // Also get some basic info about each table
        console.log('\n📊 Table information:');
        for (const row of result.rows) {
            const tableName = row.table_name;
            const countQuery = `SELECT COUNT(*) as row_count FROM "${tableName}"`;
            
            try {
                const countResult = await client.query(countQuery);
                const rowCount = countResult.rows[0].row_count;
                console.log(`   ${tableName}: ${rowCount} rows`);
            } catch (error) {
                console.log(`   ${tableName}: Error counting rows - ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error connecting to the database:', error.message);
        console.error('Connection details used:');
        console.error(`   Host: ${dbConfig.host}`);
        console.error(`   Port: ${dbConfig.port}`);
        console.error(`   Database: ${dbConfig.database}`);
        console.error(`   User: ${dbConfig.user}`);
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed.');
    }
}

// Run the function
connectAndListTables();