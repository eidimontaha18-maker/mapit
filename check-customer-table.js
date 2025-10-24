import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function checkCustomerTable() {
  try {
    console.log('🔍 Checking customer table structure...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'customer' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Customer table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})${row.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
    });
    
    console.log('\n👥 Checking existing customers...');
    const customers = await pool.query('SELECT customer_id, first_name, last_name, email FROM customer LIMIT 5');
    console.log(`Found ${customers.rows.length} customers:`);
    customers.rows.forEach(c => {
      console.log(`  - ID: ${c.customer_id}, Name: ${c.first_name} ${c.last_name}, Email: ${c.email}`);
    });
    
    // Test inserting a new customer
    console.log('\n🧪 Testing customer insertion...');
    const testEmail = `test_${Date.now()}@example.com`;
    try {
      await pool.query(
        'INSERT INTO customer (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4)',
        ['Test', 'User', testEmail, 'test_hash']
      );
      console.log('✅ Customer insertion test successful');
      
      // Clean up test data
      await pool.query('DELETE FROM customer WHERE email = $1', [testEmail]);
      console.log('🧹 Test data cleaned up');
    } catch (insertError) {
      console.error('❌ Customer insertion test failed:', insertError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCustomerTable();