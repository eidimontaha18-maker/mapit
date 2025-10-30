/**
 * MapIt Cloudflare Worker Backend (v2 - Working with Neon Serverless)
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Go to https://dash.cloudflare.com/
 * 2. Navigate to Workers & Pages > Create application > Create Worker
 * 3. Name it: mapit-api
 * 4. Delete default code and paste THIS CODE
 * 5. Click "Deploy"
 * 6. Go to Settings tab > Variables > Add variable:
 *    - Name: DATABASE_URL
 *    - Value: YOUR_NEON_CONNECTION_STRING (from .env)
 * 7. Deploy again
 * 8. Copy Worker URL and use it as VITE_API_URL in frontend
 */

import { Pool } from '@neondatabase/serverless';
import { Router } from 'itty-router';

const router = Router();

/**
 * Helper: Get Neon Pool connection
 */
function getPool(env) {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set in environment variables');
  }
  return new Pool({ connectionString: env.DATABASE_URL });
}

/**
 * Helper: Hash password (simple bcrypt alternative for Workers)
 */
async function hashPassword(password) {
  // For production, use: https://github.com/syuilo/argon2-wasm
  // For now, use simple approach
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'mapit-salt-123');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Helper: Compare password
 */
async function comparePassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}

/**
 * Health check
 */
router.get('/api/health', async (request, env, ctx) => {
  try {
    const pool = getPool(env);
    const result = await pool.query('SELECT NOW() as now');
    
    return new Response(
      JSON.stringify({
        status: 'ok',
        time: result.rows[0].now,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Login endpoint
 */
router.post('/api/login', async (request, env, ctx) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and password are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const pool = getPool(env);
    
    // Find user by email
    const userResult = await pool.query(
      'SELECT customer_id, email, first_name, last_name, password_hash FROM customer WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (userResult.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email or password',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const user = userResult.rows[0];
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email or password',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          customer_id: user.customer_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});

/**
 * Register endpoint
 */
router.post('/api/register', async (request, env, ctx) => {
  try {
    const { first_name, last_name, email, password, package_id } = await request.json();

    if (!first_name || !last_name || !email || !password || !package_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'All fields required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const pool = getPool(env);
    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      'INSERT INTO customer (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING customer_id, email, first_name, last_name',
      [first_name.trim(), last_name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    const newUser = result.rows[0];

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Register error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});

/**
 * Get user maps
 */
router.get('/api/maps/:userId', async (request, env, ctx) => {
  try {
    const { userId } = request.params;
    const pool = getPool(env);

    const result = await pool.query(
      'SELECT * FROM map WHERE customer_id = $1',
      [userId]
    );

    return new Response(
      JSON.stringify({
        success: true,
        maps: result.rows,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Get maps error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});

/**
 * Create map
 */
router.post('/api/map', async (request, env, ctx) => {
  try {
    const { customer_id, name, description, zoom, center_lat, center_lon } = await request.json();
    const pool = getPool(env);

    const result = await pool.query(
      'INSERT INTO map (customer_id, name, description, zoom, center_lat, center_lon) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customer_id, name, description, zoom, center_lat, center_lon]
    );

    return new Response(
      JSON.stringify({
        success: true,
        map: result.rows[0],
      }),
      { status: 201, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Create map error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});

/**
 * Get map by ID
 */
router.get('/api/map/:mapId', async (request, env, ctx) => {
  try {
    const { mapId } = request.params;
    const pool = getPool(env);

    const result = await pool.query(
      'SELECT * FROM map WHERE map_id = $1',
      [mapId]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Map not found',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        map: result.rows[0],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Get map error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});

/**
 * CORS preflight
 */
router.options('*', (request) => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});

/**
 * 404 handler
 */
router.all('*', () => {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Endpoint not found',
    }),
    { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
});

/**
 * Export
 */
export default {
  fetch: router.handle,
};
