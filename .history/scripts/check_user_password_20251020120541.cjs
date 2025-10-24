const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const email = process.argv[2] || 'testuser@example.com';
const plain = process.argv[3] || 'TestPass123!';
(async () => {
  const c = new Client({ connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit' });
  try {
    await c.connect();
    const r = await c.query('SELECT customer_id,email,password_hash FROM customer WHERE email=$1', [email]);
    if (r.rows.length === 0) {
      console.log('NO_USER');
      process.exit(0);
    }
    const user = r.rows[0];
    console.log('USER:', JSON.stringify(user, null, 2));
    const hash = user.password_hash || '';
    if (!hash) {
      console.log('NO_PASSWORD_HASH');
      process.exit(0);
    }
    if (hash.startsWith('$2')) {
      const ok = await bcrypt.compare(plain, hash);
      console.log('BCRYPT_COMPARE:', ok);
    } else {
      // try base64 decode
      try {
        const decoded = Buffer.from(hash, 'base64').toString();
        console.log('BASE64_DECODED:', decoded);
        console.log('PLAINTEXT_MATCH:', decoded === plain);
      } catch (e) {
        console.log('PLAINTEXT_COMPARE:', hash === plain);
      }
    }
    await c.end();
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();
