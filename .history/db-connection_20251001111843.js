// Database Connection Utility
// This script provides a comprehensive test and utility for 
// connecting to the PostgreSQL database with the specified configuration.

import pg from 'pg';
const { Pool } = pg;

// Configuration from your provided details
const config = {
  server: {
    host: '127.0.0.1',
    port: 3000
  },
  db: {
    uri: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
    schemas: ['public'],
    anonRole: 'anon'
  },
  cors: {
    origins: [
      'http://localhost:8080', 
      'http://127.0.0.1:8080', 
      'http://localhost:5173', 
      'http://127.0.0.1:5173'
    ],
    maxAge: 86400
  }
};

// Create connection pool
const pool = new Pool({
  connectionString: config.db.uri
});

// Function to test basic connection
async function testConnection() {
  console.log('⏳ Testing PostgreSQL connection...');
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    console.log('✅ Connected to PostgreSQL database!');
    console.log('🕒 Database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Function to get database information
async function getDatabaseInfo() {
  try {
    const client = await pool.connect();
    
    // Basic database info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_schema() as current_schema,
        current_user as connected_user,
        version() as postgres_version
    `);
    
    // Schema info
    const schemaInfo = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      ORDER BY schema_name
    `);
    
    // Table counts per schema
    const tableCount = await client.query(`
      SELECT table_schema, COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      GROUP BY table_schema
      ORDER BY table_schema
    `);
    
    client.release();
    return {
      info: dbInfo.rows[0],
      schemas: schemaInfo.rows.map(row => row.schema_name),
      tableCounts: tableCount.rows
    };
  } catch (error) {
    console.error('❌ Error getting database info:', error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log('📊 Database Configuration:');
  console.log('🔗 URI:', config.db.uri.replace(/:([^:@]+)@/, ':******@'));
  console.log('📂 Schemas:', config.db.schemas.join(', '));
  console.log('👤 Anonymous Role:', config.db.anonRole);
  console.log('🌐 Server Host:', config.server.host);
  console.log('🔢 Server Port:', config.server.port);
  console.log('🌍 CORS Origins:', config.cors.origins.join(', '));
  console.log('⏱️ CORS Max Age:', config.cors.maxAge);
  console.log('--------------------------------------------------');
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('--------------------------------------------------');
    console.log('📋 Fetching database details...');
    const dbInfo = await getDatabaseInfo();
    
    if (dbInfo) {
      console.log('--------------------------------------------------');
      console.log('📝 Database Information:');
      console.log('📦 Database:', dbInfo.info.database_name);
      console.log('📋 Current Schema:', dbInfo.info.current_schema);
      console.log('👤 Connected User:', dbInfo.info.connected_user);
      console.log('🔢 PostgreSQL Version:', dbInfo.info.postgres_version);
      
      console.log('--------------------------------------------------');
      console.log('📚 Available Schemas:');
      dbInfo.schemas.forEach(schema => {
        console.log(` - ${schema}`);
      });
      
      console.log('--------------------------------------------------');
      console.log('📊 Table Counts by Schema:');
      dbInfo.tableCounts.forEach(item => {
        console.log(` - ${item.table_schema}: ${item.table_count} tables`);
      });
    }
  }
  
  await pool.end();
}

main().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});