import db from './src/db/dbOperations.js';
import { v4 as uuidv4 } from 'uuid';

async function createTestZone() {
  try {
    console.log('Creating a test zone for map 10...');
    
    // Create a simple test zone (a small rectangle)
    const testZone = {
      id: uuidv4(),
      map_id: 10,
      name: 'Test Zone',
      color: '#ff0000',
      coordinates: JSON.stringify([
        [20.1, 0.1],
        [20.1, 0.2],
        [20.2, 0.2],
        [20.2, 0.1],
        [20.1, 0.1]  // Close the polygon
      ])
    };
    
    console.log('Zone data:', JSON.stringify(testZone, null, 2));
    
    const result = await db.insert('zones', testZone);
    console.log('Zone created successfully:', result);
    
    // Now test loading zones for map 10
    const zones = await db.getAll('zones');
    console.log('All zones in database:', zones);
    
  } catch (error) {
    console.error('Error creating test zone:', error);
  }
}

createTestZone();