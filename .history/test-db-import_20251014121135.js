/**
 * Test if db module can be imported
 */

console.log('Testing db module import...');

try {
  const db = await import('./src/db/dbOperations.js');
  console.log('✅ Successfully imported db module');
  console.log('   Exports:', Object.keys(db));
  console.log('   Default export:', db.default ? 'Yes' : 'No');
  
  if (db.default) {
    console.log('   Default keys:', Object.keys(db.default));
  }
  
  // Test connection
  if (db.default && db.default.testConnection) {
    console.log('\nTesting connection...');
    const connected = await db.default.testConnection();
    console.log('   Connection result:', connected);
  }
  
  // Test listTables
  if (db.default && db.default.listTables) {
    console.log('\nListing tables...');
    const tables = await db.default.listTables();
    console.log('   Tables:', tables);
  }
  
} catch (err) {
  console.error('❌ Error importing db module:', err);
  console.error('Stack:', err.stack);
}
