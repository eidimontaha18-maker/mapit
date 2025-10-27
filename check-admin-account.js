// Check admin account password
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminAccount() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const email = process.argv[2] || 'admin@mapit.com';
    
    const result = await client.query(
      'SELECT admin_id, email, first_name, last_name, password_hash FROM admin WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('✅ Found admin account:', {
        admin_id: admin.admin_id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name
      });
      console.log('\n🔐 Password hash:', admin.password_hash);
      console.log('🔐 Hash format:', admin.password_hash.startsWith('$2b$') ? 'bcrypt' : 'unknown');
      
    } else {
      console.log('❌ No admin account found with email:', email);
      console.log('\n💡 All admin accounts:');
      const all = await client.query('SELECT admin_id, email, first_name, last_name FROM admin');
      console.table(all.rows);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdminAccount();
