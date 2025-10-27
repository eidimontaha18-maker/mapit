// Quick test to verify local server can connect to Neon
import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
const PORT = 3101;

app.use(express.json());

// Test endpoints
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now, version() as version');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      time: result.rows[0].now,
      version: result.rows[0].version
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

app.get('/api/packages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages ORDER BY package_id ASC');
    res.json({ 
      success: true, 
      packages: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/test-tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    res.json({ 
      success: true, 
      tables: result.rows.map(r => r.table_name),
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log('✅ Test server started!');
  console.log(`🚀 Server running at: http://127.0.0.1:${PORT}`);
  console.log('\n📋 Test these endpoints:');
  console.log(`   http://127.0.0.1:${PORT}/api/health`);
  console.log(`   http://127.0.0.1:${PORT}/api/packages`);
  console.log(`   http://127.0.0.1:${PORT}/api/test-tables`);
  console.log('\n💡 Press Ctrl+C to stop');
});
