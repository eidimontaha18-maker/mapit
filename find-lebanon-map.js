import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit'
});

async function findLebanonMap() {
  try {
    const result = await pool.query(`SELECT * FROM map WHERE title ILIKE '%lebanon%' OR country ILIKE '%lebanon%' ORDER BY map_id`);
    console.log('Lebanon maps found:');
    console.table(result.rows.map(row => ({
      map_id: row.map_id,
      title: row.title,
      country: row.country,
      customer_id: row.customer_id
    })));
    
    if (result.rows.length > 0) {
      const mapId = result.rows[0].map_id;
      console.log(`\nChecking zones for map ${mapId}:`);
      const zones = await pool.query('SELECT * FROM zones WHERE map_id = $1', [mapId]);
      console.log('Zones found:', zones.rows.length);
      zones.rows.forEach((zone, i) => {
        console.log(`  ${i+1}. ${zone.name} (${zone.color}) - Customer ${zone.customer_id}`);
      });
      
      // Test creating a zone for this map
      console.log(`\nTesting zone creation for map ${mapId}...`);
      const testZone = {
        id: crypto.randomUUID(),
        map_id: mapId,
        customer_id: result.rows[0].customer_id,
        name: 'Lebanon Test Zone',
        color: '#ff0066',
        coordinates: JSON.stringify([
          [33.888, 35.495],
          [33.920, 35.520],
          [33.920, 35.580],
          [33.888, 35.580],
          [33.888, 35.495]
        ])
      };
      
      const createResponse = await fetch('http://127.0.0.1:3101/api/db/tables/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testZone)
      });
      
      const createResult = await createResponse.json();
      console.log('Zone creation result:', createResult.success ? '✅ Success' : '❌ Failed');
      
      if (createResult.success) {
        console.log('Created zone for Lebanon map - refresh the page to see it!');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findLebanonMap();