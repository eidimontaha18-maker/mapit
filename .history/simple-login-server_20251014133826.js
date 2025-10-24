import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const PORT = 3101;
const HOST = '127.0.0.1';
const CONNECTION_STRING = 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';

const app = express();

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Create database pool
const pool = new Pool({ connectionString: CONNECTION_STRING });

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT NOW() as now');
    res.json({ status: 'ok', time: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { first_name, last_name, email, password } = req.body ?? {};
  console.log('[POST /api/register] incoming body:', req.body);
  
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'All fields (first_name, last_name, email, password) are required.' 
    });
  }
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new customer
    const result = await pool.query(
      `INSERT INTO customer (first_name, last_name, email, password_hash, registration_date) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING customer_id, first_name, last_name, email`,
      [first_name, last_name, email.toLowerCase().trim(), hashedPassword]
    );
    
    const newCustomer = result.rows[0];
    console.log('[POST /api/register] successfully registered:', newCustomer.email);
    
    return res.status(201).json({
      success: true,
      user: {
        customer_id: newCustomer.customer_id,
        email: newCustomer.email,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name
      }
    });
  } catch (err) {
    console.error('[POST /api/register] error:', err);
    
    // Check for unique constraint violation (email already exists)
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Email already registered.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: err.message || 'Registration failed.'
    });
  }
});

// Get maps for a specific customer with zone counts
app.get('/api/customer/:customer_id/maps', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { customer_id } = req.params;
  
  if (!customer_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Customer ID is required.' 
    });
  }
  
  try {
    // Get all maps for this customer with zone counts
    const result = await pool.query(`
      SELECT 
        m.map_id,
        m.title,
        m.description,
        m.created_at,
        m.active,
        m.country,
        COUNT(z.id) as zone_count
      FROM map m
      LEFT JOIN zones z ON m.map_id = z.map_id
      WHERE m.customer_id = $1
      GROUP BY m.map_id, m.title, m.description, m.created_at, m.active, m.country
      ORDER BY m.created_at DESC;
    `, [customer_id]);
    
    console.log(`[GET /api/customer/${customer_id}/maps] Found ${result.rows.length} maps`);
    
    return res.json({
      success: true,
      maps: result.rows
    });
  } catch (err) {
    console.error(`[GET /api/customer/${customer_id}/maps] error:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch maps.'
    });
  }
});

// Get zones for a specific map
app.get('/api/map/:map_id/zones', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { map_id } = req.params;
  
  if (!map_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Map ID is required.' 
    });
  }
  
  try {
    // Get all zones for this map
    const result = await pool.query(`
      SELECT 
        id,
        map_id,
        name,
        color,
        coordinates,
        created_at,
        updated_at,
        customer_id
      FROM zones
      WHERE map_id = $1
      ORDER BY created_at DESC;
    `, [map_id]);
    
    console.log(`[GET /api/map/${map_id}/zones] Found ${result.rows.length} zones`);
    
    return res.json({
      success: true,
      zones: result.rows
    });
  } catch (err) {
    console.error(`[GET /api/map/${map_id}/zones] error:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch zones.'
    });
  }
});

// Create a new map
app.post('/api/map', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { title, description, map_code, customer_id, country, map_data, map_bounds, active } = req.body ?? {};
  
  console.log('[POST /api/map] Creating new map:', { title, customer_id, map_code });
  
  if (!title || !customer_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Title and customer_id are required.' 
    });
  }
  
  try {
    // Generate map code if not provided
    const finalMapCode = map_code || `MAP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Insert new map
    const result = await pool.query(`
      INSERT INTO map (title, description, map_code, customer_id, country, map_data, map_bounds, active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING map_id, title, description, map_code, customer_id, created_at;
    `, [
      title,
      description || null,
      finalMapCode,
      customer_id,
      country || null,
      map_data ? JSON.stringify(map_data) : null,
      map_bounds ? JSON.stringify(map_bounds) : null,
      active !== undefined ? active : true
    ]);
    
    const newMap = result.rows[0];
    console.log(`[POST /api/map] Map created successfully: ${newMap.map_id} - Code: ${newMap.map_code}`);
    
    // Also create entry in customer_map table for relationship
    await pool.query(`
      INSERT INTO customer_map (customer_id, map_id, access_level, created_at)
      VALUES ($1, $2, 'owner', NOW())
      ON CONFLICT DO NOTHING;
    `, [customer_id, newMap.map_id]);
    
    return res.status(201).json({
      success: true,
      map: newMap
    });
  } catch (err) {
    console.error('[POST /api/map] error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to create map.'
    });
  }
});

// Update an existing map
app.put('/api/map/:map_id', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { map_id } = req.params;
  const { title, description, country, map_data, map_bounds, active } = req.body ?? {};
  
  console.log(`[PUT /api/map/${map_id}] Updating map`);
  
  if (!title) {
    return res.status(400).json({ 
      success: false, 
      error: 'Title is required.' 
    });
  }
  
  try {
    const result = await pool.query(`
      UPDATE map
      SET title = $1,
          description = $2,
          country = $3,
          map_data = $4,
          map_bounds = $5,
          active = $6
      WHERE map_id = $7
      RETURNING map_id, title, description, map_code, customer_id, created_at;
    `, [
      title,
      description || null,
      country || null,
      map_data ? JSON.stringify(map_data) : null,
      map_bounds ? JSON.stringify(map_bounds) : null,
      active !== undefined ? active : true,
      map_id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Map not found.'
      });
    }
    
    console.log(`[PUT /api/map/${map_id}] Map updated successfully`);
    
    return res.json({
      success: true,
      map: result.rows[0]
    });
  } catch (err) {
    console.error(`[PUT /api/map/${map_id}] error:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to update map.'
    });
  }
});

// Get a specific map by ID
app.get('/api/map/:map_id', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { map_id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT map_id, title, description, map_code, customer_id, country, 
             map_data, map_bounds, active, created_at
      FROM map
      WHERE map_id = $1;
    `, [map_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Map not found.'
      });
    }
    
    return res.json({
      success: true,
      map: result.rows[0]
    });
  } catch (err) {
    console.error(`[GET /api/map/${map_id}] error:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch map.'
    });
  }
});

// Create a new zone
app.post('/api/zone', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { map_id, name, color, coordinates, customer_id } = req.body ?? {};
  
  console.log('[POST /api/zone] Creating zone:', { map_id, name, customer_id });
  
  if (!map_id || !name || !color || !coordinates) {
    return res.status(400).json({ 
      success: false, 
      error: 'map_id, name, color, and coordinates are required.' 
    });
  }
  
  try {
    // Use uuid_generate_v4() if available, otherwise generate on server
    const result = await pool.query(`
      INSERT INTO zones (id, map_id, name, color, coordinates, customer_id, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, map_id, name, color, coordinates, customer_id, created_at, updated_at;
    `, [
      map_id,
      name,
      color,
      JSON.stringify(coordinates),
      customer_id || null
    ]);
    
    const newZone = result.rows[0];
    console.log(`[POST /api/zone] Zone created: ${newZone.id} for map ${map_id}`);
    
    return res.status(201).json({
      success: true,
      zone: newZone
    });
  } catch (err) {
    console.error('[POST /api/zone] error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to create zone.'
    });
  }
});

// Update an existing zone
app.put('/api/zone/:zone_id', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { zone_id } = req.params;
  const { name, color, coordinates } = req.body ?? {};
  
  console.log(`[PUT /api/zone/${zone_id}] Updating zone`);
  
  try {
    const result = await pool.query(`
      UPDATE zones
      SET name = COALESCE($1, name),
          color = COALESCE($2, color),
          coordinates = COALESCE($3, coordinates),
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, map_id, name, color, coordinates, customer_id, created_at, updated_at;
    `, [
      name || null,
      color || null,
      coordinates ? JSON.stringify(coordinates) : null,
      zone_id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found.'
      });
    }
    
    console.log(`[PUT /api/zone/${zone_id}] Zone updated successfully`);
    
    return res.json({
      success: true,
      zone: result.rows[0]
    });
  } catch (err) {
    console.error(`[PUT /api/zone/${zone_id}] error:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to update zone.'
    });
  }
});

// Delete a zone
app.delete('/api/zone/:zone_id', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { zone_id } = req.params;
  
  console.log(`[DELETE /api/zone/${zone_id}] Deleting zone`);
  
  try {
    const result = await pool.query(`
      DELETE FROM zones
      WHERE id = $1
      RETURNING id;
    `, [zone_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found.'
      });
    }
    
    console.log(`[DELETE /api/zone/${zone_id}] Zone deleted successfully`);
    
    return res.json({
      success: true,
      message: 'Zone deleted successfully.'
    });
  } catch (err) {
    console.error(`[DELETE /api/zone/${zone_id}] error:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to delete zone.'
    });
  }
});

// Delete a map (and all its zones)
app.delete('/api/map/:map_id', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { map_id } = req.params;
  
  console.log(`[DELETE /api/map/${map_id}] Deleting map and its zones`);
  
  try {
    // First delete all zones for this map
    await pool.query(`
      DELETE FROM zones
      WHERE map_id = $1;
    `, [map_id]);
    
    // Delete from customer_map table
    await pool.query(`
      DELETE FROM customer_map
      WHERE map_id = $1;
    `, [map_id]);
    
    // Then delete the map
    const result = await pool.query(`
      DELETE FROM map
      WHERE map_id = $1
      RETURNING map_id;
    `, [map_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Map not found.'
      });
    }
    
    console.log(`[DELETE /api/map/${map_id}] Map and zones deleted successfully`);
    
    return res.json({
      success: true,
      message: 'Map deleted successfully.'
    });
  } catch (err) {
    console.error(`[DELETE /api/map/${map_id}] error:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to delete map.'
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { email, password } = req.body ?? {};
  console.log('[POST /api/login] attempting login for:', email);
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required.' 
    });
  }
  
  try {
    // Find user by email
    const result = await pool.query(
      'SELECT customer_id, email, first_name, last_name, password_hash FROM customer WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      console.warn('[POST /api/login] no user found with email:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password.' 
      });
    }
    
    const user = result.rows[0];
    
    // Verify password
    let isPasswordValid = false;
    
    // First try bcrypt comparison (for hashed passwords starting with $2b$)
    if (user.password_hash.startsWith('$2b$')) {
      try {
        isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log('[POST /api/login] using bcrypt verification');
      } catch (bcryptError) {
        console.log('[POST /api/login] bcrypt error:', bcryptError.message);
        isPasswordValid = false;
      }
    } else {
      // Try base64 decoding first (for legacy base64 encoded passwords)
      try {
        const decodedPassword = Buffer.from(user.password_hash, 'base64').toString();
        isPasswordValid = (password === decodedPassword);
        console.log('[POST /api/login] using base64 decoding verification');
      } catch (base64Error) {
        // If base64 fails, try plain text comparison
        console.log('[POST /api/login] base64 failed, trying plain text comparison');
        isPasswordValid = (password === user.password_hash);
      }
    }
    
    if (!isPasswordValid) {
      console.warn('[POST /api/login] invalid password for:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password.' 
      });
    }
    
    // Return user data (excluding password_hash)
    console.log('[POST /api/login] successful login for:', email);
    return res.json({
      success: true,
      user: {
        customer_id: user.customer_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    console.error('[POST /api/login] error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Login failed.';
    return res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connection successful');
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ API server running on http://${HOST}:${PORT}`);
    });
    
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
    });
    
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

start();
