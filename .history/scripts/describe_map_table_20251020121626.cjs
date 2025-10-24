const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit' });
  try {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='map' ORDER BY ordinal_position");
    console.log('MAP_COLUMNS:', JSON.stringify(res.rows, null, 2));
    await client.end();
  } catch (e) {
    console.error('ERROR', e.message);
    process.exit(1);
  }
})();
