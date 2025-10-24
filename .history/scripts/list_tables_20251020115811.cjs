const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit' });
  try {
    await client.connect();
    const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    console.log('TABLES:\n' + res.rows.map(r => `${r.table_schema}.${r.table_name}`).join('\n'));
    await client.end();
  } catch (e) {
    console.error('ERROR', e.message);
    process.exit(1);
  }
})();
