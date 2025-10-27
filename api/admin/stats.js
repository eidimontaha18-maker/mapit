// API endpoint for admin stats// API endpoint for admin stats

import pkg from 'pg';import pkg from 'pg';

const { Pool } = pkg;const { Pool } = pkg;



const pool = new Pool({const pool = new Pool({

  connectionString: process.env.DATABASE_URL,  connectionString: process.env.DATABASE_URL,

  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }  ssl: { rejectUnauthorized: false }

});});



export default async function handler(req, res) {export default async function handler(req, res) {

  // Set CORS headers  // Set CORS headers

  res.setHeader('Access-Control-Allow-Credentials', 'true');  res.setHeader('Access-Control-Allow-Credentials', 'true');

  res.setHeader('Access-Control-Allow-Origin', '*');  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');



  if (req.method === 'OPTIONS') {  if (req.method === 'OPTIONS') {

    res.status(200).end();    res.status(200).end();

    return;    return;

  }  }



  if (req.method !== 'GET') {  if (req.method !== 'GET') {

    return res.status(405).json({ success: false, error: 'Method not allowed' });    return res.status(405).json({ success: false, error: 'Method not allowed' });

  }  }



  try {  try {

    const [customers, maps, orders, revenue] = await Promise.all([    // Get various statistics

      pool.query('SELECT COUNT(*) as count FROM customer'),    const [customers, maps, orders, revenue] = await Promise.all([

      pool.query('SELECT COUNT(*) as count FROM map'),      pool.query('SELECT COUNT(*) as count FROM customer'),

      pool.query('SELECT COUNT(*) as count FROM orders'),      pool.query('SELECT COUNT(*) as count FROM map'),

      pool.query('SELECT SUM(total) as total FROM orders WHERE status = $1', ['completed'])      pool.query('SELECT COUNT(*) as count FROM orders'),

    ]);      pool.query('SELECT SUM(total) as total FROM orders WHERE status = $1', ['completed'])

    ]);

    return res.status(200).json({

      success: true,    return res.status(200).json({

      stats: {      success: true,

        totalCustomers: parseInt(customers.rows[0]?.count || 0),      stats: {

        totalMaps: parseInt(maps.rows[0]?.count || 0),        totalCustomers: parseInt(customers.rows[0]?.count || 0),

        totalOrders: parseInt(orders.rows[0]?.count || 0),        totalMaps: parseInt(maps.rows[0]?.count || 0),

        totalRevenue: parseFloat(revenue.rows[0]?.total || 0)        totalOrders: parseInt(orders.rows[0]?.count || 0),

      }        totalRevenue: parseFloat(revenue.rows[0]?.total || 0)

    });      }

  } catch (error) {    });

    console.error('Admin stats error:', error);  } catch (error) {

    return res.status(500).json({ success: false, error: 'Server error', message: error.message });    console.error('Stats fetch error:', error);

  }    return res.status(500).json({ 

}      success: false, 

      error: 'Server error',
      message: error.message 
    });
  }
}
