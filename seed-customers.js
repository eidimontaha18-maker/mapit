import pg from 'pg';

// Reuse same connection string as server (consider moving to env later)
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';
const pool = new pg.Pool({ connectionString });

const seedCustomers = [
  { first_name: 'Alice', last_name: 'Anderson', email: 'alice@example.com', password: 'Password123!' },
  { first_name: 'Bob', last_name: 'Brown', email: 'bob@example.com', password: 'Password123!' },
  { first_name: 'Charlie', last_name: 'Clark', email: 'charlie@example.com', password: 'Password123!' }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Seeding customer table...');
    // Ensure table exists
    await client.query(`CREATE TABLE IF NOT EXISTS customer (
      customer_id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`);

    for (const c of seedCustomers) {
      const password_hash = Buffer.from(c.password).toString('base64');
      await client.query(
        `INSERT INTO customer (first_name, last_name, email, password_hash)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (email) DO NOTHING`,
        [c.first_name, c.last_name, c.email.toLowerCase(), password_hash]
      );
      console.log(`Inserted (or skipped existing) customer: ${c.email}`);
    }

    const countRes = await client.query('SELECT COUNT(*)::int AS count FROM customer');
    console.log(`Customer rows now: ${countRes.rows[0].count}`);
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
