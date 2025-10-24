const { Client } = require('pg');
const emailArg = process.argv[2] || null;
(async () => {
  const client = new Client({ connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit' });
  try {
    await client.connect();
    const params = [];
    let where = '';
    if (emailArg) {
      where = 'WHERE cu.email = $1';
      params.push(emailArg);
    }
  const q = `SELECT cu.customer_id, cu.email, m.map_id, m.title as name, m.description, COALESCE(z.zone_count,0) as zone_count, m.created_at, m.active, m.country, m.map_codes
FROM customer cu
LEFT JOIN customer_map cm ON cu.customer_id = cm.customer_id
LEFT JOIN map m ON cm.map_id = m.map_id
LEFT JOIN (SELECT map_id, COUNT(*) as zone_count FROM zones GROUP BY map_id) z ON m.map_id = z.map_id
${where}
ORDER BY cu.customer_id, m.map_id`;
    const res = await client.query(q, params);
    if (res.rows.length === 0) {
      console.log('NO_ROWS');
    } else {
      console.log(JSON.stringify(res.rows, null, 2));
    }
    await client.end();
  } catch (e) {
    console.error('ERROR', e.message);
    process.exit(1);
  }
})();
