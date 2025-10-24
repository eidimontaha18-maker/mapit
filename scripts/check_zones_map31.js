import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'mapit',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || ''
});

async function run() {
  try {
    const res = await pool.query('SELECT id, map_id, name, created_at FROM zones WHERE map_id = $1 ORDER BY created_at ASC', [31]);
    console.log(`Found ${res.rows.length} zone(s) for map_id=31`);
    if (res.rows.length > 0) console.table(res.rows);
  } catch (err) {
    console.error('DB query error:', err);
  } finally {
    await pool.end();
  }
}

run();
