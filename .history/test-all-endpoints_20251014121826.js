/**
 * Complete API test to verify all endpoints
 */

console.log('Testing MapIt API endpoints...\n');
console.log('Make sure the server is running on port 3101\n');

// Test using dynamic import to avoid issues
const tests = [
  {
    name: 'Health Check',
    url: 'http://127.0.0.1:3101/api/health',
    method: 'GET'
  },
  {
    name: 'Test Endpoint',
    url: 'http://127.0.0.1:3101/api/test',
    method: 'GET'
  },
  {
    name: 'List Tables',
    url: 'http://127.0.0.1:3101/api/db/tables',
    method: 'GET'
  },
  {
    name: 'Get Maps (no filter)',
    url: 'http://127.0.0.1:3101/api/db/tables/map',
    method: 'GET'
  },
  {
    name: 'Get Maps (with customer filter)',
    url: 'http://127.0.0.1:3101/api/db/tables/map?customer_id=1',
    method: 'GET'
  }
];

// Use dynamic import for node-fetch
import('node-fetch').then(({ default: fetch }) => {
  runTests(fetch);
}).catch(err => {
  console.error('Error importing fetch:', err.message);
  console.log('\nTrying with native http module instead...\n');
  runTestsWithHttp();
});

async function runTests(fetch) {
  for (const test of tests) {
    try {
      console.log(`\n📝 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await fetch(test.url, { method: test.method });
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
      
      if (response.ok) {
        console.log(`   ✅ SUCCESS`);
      } else {
        console.log(`   ❌ FAILED`);
      }
    } catch (err) {
      console.log(`   ❌ ERROR: ${err.message}`);
    }
  }
  
  console.log('\n\n✅ All tests completed!\n');
}

function runTestsWithHttp() {
  import('http').then(({ default: http }) => {
    runTestsWithHttpModule(http);
  });
}

async function runTestsWithHttpModule(http) {
  for (const test of tests) {
    await new Promise((resolve) => {
      console.log(`\n📝 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const url = new URL(test.url);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: test.method
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`   ✅ SUCCESS`);
          } else {
            console.log(`   ❌ FAILED`);
          }
          resolve();
        });
      });
      
      req.on('error', (err) => {
        console.log(`   ❌ ERROR: ${err.message}`);
        resolve();
      });
      
      req.end();
    });
  }
  
  console.log('\n\n✅ All tests completed!\n');
}
