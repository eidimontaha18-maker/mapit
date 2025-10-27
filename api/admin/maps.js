// API endpoint for admin maps list// API endpoint for admin maps list

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

        m.map_id, m.title, m.description, m.created_at, m.country, m.active,        m.map_id,

        m.customer_id,        m.title,

        c.first_name || ' ' || c.last_name as customer_name,        m.description,

        c.email as customer_email        m.created_at,

      FROM map m        m.country,

      LEFT JOIN customer c ON m.customer_id = c.customer_id        m.active,

      ORDER BY m.created_at DESC        m.customer_id,

    `);        c.first_name || ' ' || c.last_name as customer_name,

        c.email as customer_email

    return res.status(200).json({ success: true, maps: result.rows });      FROM map m

  } catch (error) {      LEFT JOIN customer c ON m.customer_id = c.customer_id

    console.error('Admin maps error:', error);      ORDER BY m.created_at DESC

    return res.status(500).json({ success: false, error: 'Server error', message: error.message });    `);

  }

}    return res.status(200).json({

      success: true,
      maps: result.rows
    });
  } catch (error) {
    console.error('Maps fetch error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
}
