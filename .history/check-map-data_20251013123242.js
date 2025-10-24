import db from './src/db/dbOperations.js';

async function checkMapData() {
  try {
    console.log('Checking map table data...');
    
    // Get all maps
    const maps = await db.read('map');
    console.log(`Found ${maps.length} maps in database:`);
    
    maps.forEach((map, index) => {
      console.log(`\n--- Map ${index + 1} ---`);
      console.log('Map ID:', map.map_id);
      console.log('Title:', map.title);
      console.log('Description:', map.description);
      console.log('Customer ID:', map.customer_id);
      console.log('Country:', map.country);
      console.log('Created at:', map.created_at);
      console.log('Map data type:', typeof map.map_data);
      console.log('Map codes type:', typeof map.map_codes);
      
      if (map.map_data) {
        console.log('Map data:', JSON.stringify(map.map_data, null, 2));
      }
      
      if (map.map_codes) {
        console.log('Map codes:', JSON.stringify(map.map_codes, null, 2));
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMapData();