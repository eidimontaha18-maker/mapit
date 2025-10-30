/**
 * MapIt Cloudflare Worker Backend
 * Replaces Node.js server - connects to Neon PostgreSQL
 * 
 * Deploy to Cloudflare Workers via:
 * 1. Go to https://dash.cloudflare.com/
 * 2. Create new Worker
 * 3. Paste this code
 * 4. Add DATABASE_URL to Environment Variables
 * 5. Deploy
 */

import { Router } from 'itty-router';

// Create router
const router = Router();

/**
 * Helper: Connect to Neon PostgreSQL
 */
async function queryDatabase(query, params = []) {
  const DATABASE_URL = env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable not set');
  }

  const url = new URL(DATABASE_URL);
  
  try {
    const response = await fetch('https://' + url.host, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        params: params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Database error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.rows || [];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Alternative: Use Neon's HTTP API directly
 */
async function queryNeon(query, params = []) {
  const DATABASE_URL = env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable not set');
  }

  // Extract connection string parts
  const url = new URL(DATABASE_URL);
  const [user, password] = url.username + ':' + url.password;
  const host = url.hostname;
  const port = url.port || 5432;
  const database = url.pathname.slice(1);

  // Use Neon's API
  const apiUrl = `https://${host}/sql`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`,
      },
      body: JSON.stringify({
        statement: query,
        params: params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Database error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Neon API error:', error);
    throw error;
  }
}

/**
 * Health check endpoint
 */
router.get('/api/health', async (request, env) => {
  try {
    // Test database connection
    const result = await fetch(`https://api.neon.tech/api/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'SELECT NOW() as now',
      }),
    });

    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        worker: 'mapit-cloudflare-worker',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Login endpoint
 * POST /api/login
 * Body: { email: string, password: string }
 */
router.post('/api/login', async (request, env) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and password are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Query Neon database via HTTP
    const DATABASE_URL = env.DATABASE_URL;
    const url = new URL(DATABASE_URL);
    
    // Use psql wire protocol through serverless driver
    // For now, return placeholder - actual implementation depends on Neon client support
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Login endpoint under construction - using direct HTTP approach',
      }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Register endpoint
 * POST /api/register
 */
router.post('/api/register', async (request, env) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      package_id,
    } = await request.json();

    if (!first_name || !last_name || !email || !password || !package_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'All fields required: first_name, last_name, email, password, package_id',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Register endpoint under construction',
      }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Get user maps
 * GET /api/maps/:userId
 */
router.get('/api/maps/:userId', async (request, env) => {
  try {
    const { userId } = request.params;

    return new Response(
      JSON.stringify({
        success: true,
        maps: [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * 404 handler
 */
router.all('*', () => {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Not found',
    }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
});

/**
 * Export handler for Cloudflare
 */
export default {
  fetch: router.handle,
};
