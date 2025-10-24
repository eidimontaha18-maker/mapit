import fetch from 'node-fetch';

async function testOrdersAPI() {
  try {
    console.log('Testing Orders API...\n');
    
    const response = await fetch('http://localhost:3101/api/admin/orders');
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`\n✅ Found ${data.orders.length} orders`);
      
      if (data.orders.length > 0) {
        console.log('\n📋 Sample Order:');
        console.log(JSON.stringify(data.orders[0], null, 2));
      } else {
        console.log('\n⚠️ No orders in database yet');
      }
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrdersAPI();
