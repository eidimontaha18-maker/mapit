const { Client } = require('pg');
const email = process.argv[2] || 'abedlhayeidi20@gmail.com';
(async () => {
  const c = new Client({ connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit' });
  try {
    await c.connect();
    const userRes = await c.query('SELECT customer_id,email,first_name,last_name FROM customer WHERE email=$1', [email.toLowerCase()]);
    if (userRes.rows.length === 0) {
      console.log('No customer found for', email);
      await c.end();
      process.exit(0);
    }
    const user = userRes.rows[0];
    console.log('Customer:', JSON.stringify(user, null, 2));

    // Maps directly owned by customer (customer_id column)
    const mapsRes = await c.query('SELECT * FROM map WHERE customer_id = $1 ORDER BY created_at DESC', [user.customer_id]);
    console.log('\nMaps with map.customer_id = customer_id:');
    if (mapsRes.rows.length === 0) console.log('  (none)'); else console.log(JSON.stringify(mapsRes.rows, null, 2));

    // Maps via customer_map table
    const cmRes = await c.query('SELECT cm.customer_id, cm.map_id, m.title, m.map_code FROM customer_map cm LEFT JOIN map m ON cm.map_id = m.map_id WHERE cm.customer_id = $1', [user.customer_id]);
    console.log('\nCustomer_map entries:');
    if (cmRes.rows.length === 0) console.log('  (none)'); else console.log(JSON.stringify(cmRes.rows, null, 2));

    // All zones for maps owned or linked via customer_map
    const mapIds = new Set();
    mapsRes.rows.forEach(r => mapIds.add(r.map_id));
    cmRes.rows.forEach(r => { if (r.map_id) mapIds.add(r.map_id); });
    const ids = Array.from(mapIds);
    if (ids.length === 0) {
      console.log('\nNo maps found for this customer, so no zones to show.');
      await c.end();
      process.exit(0);
    }
    const zonesRes = await c.query('SELECT * FROM zones WHERE map_id = ANY($1::int[]) ORDER BY created_at', [ids]);
    console.log('\nZones for maps (map_ids=' + ids.join(',') + '):');
    if (zonesRes.rows.length === 0) console.log('  (none)'); else console.log(JSON.stringify(zonesRes.rows, null, 2));

    await c.end();
  } catch (e) {
    console.error('ERROR', e.message);
    process.exit(1);
  }
})();
