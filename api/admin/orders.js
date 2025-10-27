// API endpoint for admin orders list// API endpoint for admin orders

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

    const result = await pool.query(`    const result = await pool.query(`

      SELECT       SELECT 

        o.id, o.customer_id, o.package_id, o.date_time, o.total, o.status, o.created_at,        o.id,

        c.first_name || ' ' || c.last_name as customer_name,        o.customer_id,

        c.email as customer_email,        o.package_id,

        p.name as package_name        o.date_time,

      FROM orders o        o.total,

      LEFT JOIN customer c ON o.customer_id = c.customer_id        o.status,

      LEFT JOIN packages p ON o.package_id = p.package_id        o.created_at,

      ORDER BY o.date_time DESC        c.first_name || ' ' || c.last_name as customer_name,

    `);        c.email as customer_email,

        p.name as package_name

    return res.status(200).json({ success: true, orders: result.rows });      FROM orders o

  } catch (error) {      LEFT JOIN customer c ON o.customer_id = c.customer_id

    console.error('Admin orders error:', error);      LEFT JOIN packages p ON o.package_id = p.package_id

    return res.status(500).json({ success: false, error: 'Server error', message: error.message });      ORDER BY o.created_at DESC

  }    `);

}

    return res.status(200).json({
      success: true,
      orders: result.rows
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
