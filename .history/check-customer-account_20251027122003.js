// Check customer account password
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function checkAccount() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const email = process.argv[2] || 'eidi@gmail.com';
    
    const result = await client.query(
      'SELECT customer_id, email, first_name, last_name, password_hash FROM customer WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Found account:', {
        customer_id: user.customer_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      });
      console.log('\n🔐 Password hash:', user.password_hash);
      
      try {
        const decoded = Buffer.from(user.password_hash, 'base64').toString('utf-8');
        console.log('📝 Decoded password:', decoded);
      } catch (e) {
        console.log('❌ Could not decode as base64 - might be bcrypt or plain text');
      }
    } else {
      console.log('❌ No account found with email:', email);
      console.log('\n💡 Try one of these emails:');
      const all = await client.query('SELECT email FROM customer LIMIT 5');
      all.rows.forEach(r => console.log('  -', r.email));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAccount();
