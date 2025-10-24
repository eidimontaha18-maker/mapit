import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dbConfig from './config/database.js';
import dbRoutes from './routes/db-routes.js';
import zoneRoutes from './routes/zone-routes.js';

// Use the shared pool from centralized config
const pool = dbConfig.pool;
const corsConfig = dbConfig.cors;

// Configuration from .env file
const PORT = process.env.PORT || 3101;
const HOST = dbConfig.db.host || '127.0.0.1';

const app = express();

// Enable CORS for all routes using config
app.use(cors({
  origin: corsConfig.origins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: corsConfig.maxAge
}));
app.use(express.json());
app.use(express.static('public'));

// Handle invalid JSON bodies explicitly so frontend gets JSON instead of HTML
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && 'status' in err) {
    console.error('[BodyParser] Invalid JSON:', err.message);
    return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
  }
  next(err);
});

// Universal request logger (after body parse / invalid JSON handler)
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[REQ] ${req.method} ${req.path} content-type=${req.headers['content-type'] || ''}`);
    if (req.method !== 'GET') {
      console.log('[REQ BODY]', req.body);
    }
  }
  next();
});

// Pool is already imported from config/database.js - no need to create new one

function hashPassword(plain) {
  try {
    return bcrypt.hashSync(plain, 10);
  } catch (e) {
    console.error('[hashPassword] bcrypt failed, falling back to base64:', e?.message || e);
    return Buffer.from(plain).toString('base64');
  }
}

// Health / info routes
app.get('/api/health', async (_req, res) => {
  try {
    const r = await pool.query('SELECT NOW() as now');
    res.json({ status: 'ok', time: r.rows[0].now });
  } catch (e) {
    const message = e && typeof e === 'object' && 'message' in e ? e.message : 'Unknown error';
    res.status(500).json({ status: 'error', error: message });
  }
});

app.get('/api/test', (_req, res) => {
  res.json({ message: 'Server is working!' });
});

// Diagnostic echo route
app.post('/api/echo', (req, res) => {
  res.json({ success: true, received: req.body });
});

// Registration route
app.post('/api/register', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { first_name, last_name, email, password, package_id } = req.body ?? {};
  console.log('[POST /api/register] incoming body:', req.body);
  if (!first_name || !last_name || !email || !password || !package_id) {
    return res.status(400).json({ success: false, error: 'All fields (first_name, last_name, email, password, package_id) are required.' });
  }
  try {
    // Use synchronous bcrypt hash to avoid callback/promise mismatch
    const password_hash = hashPassword(password);
    
    // Insert customer
    const insertSql = `INSERT INTO customer (first_name, last_name, email, password_hash) VALUES ($1,$2,$3,$4) RETURNING customer_id`;
    const result = await pool.query(insertSql, [
      first_name.trim(),
      last_name.trim(),
      email.toLowerCase().trim(),
      password_hash
    ]);
    
    const customer_id = result.rows[0].customer_id;
    console.log('[POST /api/register] inserted customer:', email.toLowerCase().trim(), 'customer_id:', customer_id);
    
    // Get package details
    const packageResult = await pool.query('SELECT * FROM packages WHERE package_id = $1', [package_id]);
    if (packageResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid package selected.' });
    }
    
    const selectedPackage = packageResult.rows[0];
    
    // Create order for the selected package
    const orderSql = `INSERT INTO orders (customer_id, package_id, total, status) VALUES ($1, $2, $3, $4) RETURNING id`;
    const orderResult = await pool.query(orderSql, [
      customer_id,
      package_id,
      selectedPackage.price,
      'completed'
    ]);
    
    console.log('[POST /api/register] created order:', orderResult.rows[0].id, 'for package:', selectedPackage.name);
    
    const payload = { success: true, error: null, customer_id, order_id: orderResult.rows[0].id };
    console.log('[POST /api/register] response payload:', payload);
    return res.status(201).json(payload);
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      console.warn('[POST /api/register] duplicate email attempt:', email);
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }
    console.error('[POST /api/register] unexpected error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to register user.';
    return res.status(500).json({ success: false, error: message });
  }
});

// Login route
// Map creation endpoint
app.post('/api/map', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { title, description, map_data, map_bounds, active, country, map_code, customer_id } = req.body ?? {};
  
  console.log('[POST /api/map] creating map:', title);
  console.log('[POST /api/map] customer_id:', customer_id);
  
  if (!title || !customer_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Title and customer_id are required.' 
    });
  }
  
  try {
    // First, check if customer_id column exists in the map table
    let columnExists = false;
    try {
      const columnCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'map' AND column_name = 'customer_id'
      `);
      columnExists = columnCheck.rows.length > 0;
    } catch (err) {
      console.error('[POST /api/map] Error checking customer_id column:', err);
    }
    
    // If column doesn't exist, add it
    if (!columnExists) {
      console.log('[POST /api/map] Adding customer_id column to map table');
      try {
        await pool.query(`
          ALTER TABLE map ADD COLUMN customer_id INTEGER REFERENCES customer(customer_id)
        `);
        console.log('[POST /api/map] Successfully added customer_id column');
      } catch (err) {
        console.error('[POST /api/map] Error adding customer_id column:', err);
        // Continue anyway, as the error might just be that another request already added the column
      }
    }
    
    // Insert map into database
    const insertSql = `
      INSERT INTO map (title, description, map_data, map_bounds, active, country, map_code, customer_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING map_id
    `;
    
    const result = await pool.query(insertSql, [
      title,
      description || null,
      map_data || {},
      map_bounds || {},
      active !== undefined ? active : true,
      country || null,
      map_code || null,
      customer_id
    ]);
    
    const map_id = result.rows[0]?.map_id;

    console.log('[POST /api/map] created map with ID:', map_id);

    // Return using `map` key so the frontend (NewMapForm) finds `result.map.map_id`
    return res.status(201).json({
      success: true,
      map: {
        map_id,
        title,
        description,
        map_code: map_code || null
      }
    });
  } catch (err) {
    console.error('[POST /api/map] error:', err);
    const message = err && typeof err === 'object' && 'message' in err 
      ? err.message 
      : 'Failed to create map.';
    return res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// Map update endpoint
app.put('/api/map/:mapId', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { title, description, map_data, map_bounds, active, country, map_code, customer_id } = req.body ?? {};
  const mapId = req.params.mapId;
  
  console.log('[PUT /api/map] updating map:', mapId);
  console.log('[PUT /api/map] customer_id:', customer_id);
  
  if (!title || !customer_id || !mapId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Title, customer_id, and map_id are required.' 
    });
  }
  
  try {
    // Verify the map exists and belongs to this customer
    const checkResult = await pool.query(
      'SELECT map_id FROM map WHERE map_id = $1 AND customer_id = $2',
      [mapId, customer_id]
    );
    
    if (checkResult.rows.length === 0) {
      console.log('[PUT /api/map] map not found or not owned by customer:', customer_id);
      return res.status(404).json({ 
        success: false, 
        error: 'Map not found or you do not have permission to edit it.' 
      });
    }
    
    // Update the map record
    const updateSql = `
      UPDATE map
      SET title = $1, description = $2, map_data = $3, map_bounds = $4,
          active = $5, country = $6, map_code = $7, updated_at = NOW()
      WHERE map_id = $8 AND customer_id = $9
      RETURNING map_id
    `;
    
    const result = await pool.query(updateSql, [
      title,
      description || null,
      map_data || {},
      map_bounds || {},
      active !== undefined ? active : true,
      country || null,
      map_code || null,
      mapId,
      customer_id
    ]);
    
    if (result.rows.length === 0) {
      console.log('[PUT /api/map] update failed, no rows affected');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update map.' 
      });
    }
    
    console.log('[PUT /api/map] updated map with ID:', mapId);
    
    return res.status(200).json({
      success: true,
      record: {
        map_id: mapId,
        title,
        description,
        map_codes: map_codes || []
      }
    });
  } catch (err) {
    console.error('[PUT /api/map] error:', err);
    const message = err && typeof err === 'object' && 'message' in err 
      ? err.message 
      : 'Failed to update map.';
    return res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// Get a single map by ID
app.get('/api/map/:map_id', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const map_id = req.params.map_id;

  if (!map_id) {
    return res.status(400).json({ success: false, error: 'Map ID is required.' });
  }

  try {
    const result = await pool.query(`
      SELECT map_id, title, description, map_code, customer_id, country, map_data, map_bounds, active, created_at
      FROM map
      WHERE map_id = $1
    `, [map_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Map not found.' });
    }

    return res.json({ success: true, map: result.rows[0] });
  } catch (err) {
    console.error(`[GET /api/map/${map_id}] error:`, err);
    return res.status(500).json({ success: false, error: err && err.message ? err.message : 'Failed to fetch map.' });
  }
});

// Get zones for a specific map
app.get('/api/map/:id/zones', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { id } = req.params;

  console.log(`[GET /api/map/${id}/zones] Fetching zones for map`);

  if (!id) {
    return res.status(400).json({ success: false, error: 'Map ID is required.' });
  }

  try {
    const result = await pool.query(`
      SELECT id, map_id, name, color, coordinates, created_at
      FROM zones
      WHERE map_id = $1
      ORDER BY created_at ASC
    `, [id]);

    console.log(`[GET /api/map/${id}/zones] Found ${result.rows.length} zones`);

    return res.json({ 
      success: true, 
      zones: result.rows 
    });
  } catch (err) {
    console.error(`[GET /api/map/${id}/zones] error:`, err);
    return res.status(500).json({ 
      success: false, 
      error: err && err.message ? err.message : 'Failed to fetch zones.' 
    });
  }
});

// Delete a map (and its zones and customer_map relations)
app.delete('/api/map/:map_id', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { map_id } = req.params;

  console.log(`[DELETE /api/map/${map_id}] Deleting map and related records`);

  if (!map_id) {
    return res.status(400).json({ success: false, error: 'Map ID is required.' });
  }

  try {
    // Delete zones that belong to this map
    await pool.query(`DELETE FROM zones WHERE map_id = $1`, [map_id]);

    // Delete customer_map relationships
    await pool.query(`DELETE FROM customer_map WHERE map_id = $1`, [map_id]);

    // Delete the map itself
    const result = await pool.query(`DELETE FROM map WHERE map_id = $1 RETURNING map_id`, [map_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Map not found.' });
    }

    console.log(`[DELETE /api/map/${map_id}] Deleted map successfully`);
    return res.json({ success: true, message: 'Map deleted successfully.' });
  } catch (err) {
    console.error(`[DELETE /api/map/${map_id}] error:`, err);
    return res.status(500).json({ success: false, error: err && err.message ? err.message : 'Failed to delete map.' });
  }
});

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

    // Verify password (handle bcrypt hashed, base64 encoded, and plain text passwords)
    let isPasswordValid = false;

    // Defensively handle missing or non-string password_hash to avoid runtime errors
    const pwdHash = (user && typeof user.password_hash === 'string') ? user.password_hash : '';

    // First try bcrypt comparison (for hashed passwords starting with $2b$)
    if (pwdHash.startsWith('$2b$')) {
      try {
        isPasswordValid = await bcrypt.compare(password, pwdHash);
        console.log('[POST /api/login] using bcrypt verification');
      } catch (bcryptError) {
        console.log('[POST /api/login] bcrypt error:', bcryptError.message);
        isPasswordValid = false;
      }
    } else {
      // Try base64 decoding first (for legacy base64 encoded passwords)
      try {
        const decodedPassword = pwdHash ? Buffer.from(pwdHash, 'base64').toString() : '';
        isPasswordValid = (password === decodedPassword);
        console.log('[POST /api/login] using base64 decoding verification');
      } catch (base64Error) {
        // If base64 fails, try plain text comparison
        console.log('[POST /api/login] base64 failed, trying plain text comparison');
        isPasswordValid = (password === pwdHash);
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

// Admin login route
app.post('/api/admin/login', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { email, password } = req.body ?? {};
  console.log('[POST /api/admin/login] attempting admin login for:', email);
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required.' 
    });
  }
  
  try {
    // Find admin by email
    const result = await pool.query(
      'SELECT admin_id, email, first_name, last_name, password_hash FROM admin WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      console.warn('[POST /api/admin/login] no admin found with email:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid admin credentials.' 
      });
    }
    
    const admin = result.rows[0];

    // Verify password using bcrypt
    let isPasswordValid = false;
    const pwdHash = (admin && typeof admin.password_hash === 'string') ? admin.password_hash : '';

    if (pwdHash.startsWith('$2b$')) {
      try {
        isPasswordValid = await bcrypt.compare(password, pwdHash);
        console.log('[POST /api/admin/login] using bcrypt verification');
      } catch (bcryptError) {
        console.log('[POST /api/admin/login] bcrypt error:', bcryptError.message);
        isPasswordValid = false;
      }
    }
    
    if (!isPasswordValid) {
      console.warn('[POST /api/admin/login] invalid password for:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid admin credentials.' 
      });
    }
    
    // Update last login timestamp
    await pool.query(
      'UPDATE admin SET last_login = NOW() WHERE admin_id = $1',
      [admin.admin_id]
    );
    
    // Return admin data (excluding password_hash)
    console.log('[POST /api/admin/login] successful login for:', email);
    return res.json({
      success: true,
      admin: {
        admin_id: admin.admin_id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name
      }
    });
  } catch (err) {
    console.error('[POST /api/admin/login] error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Admin login failed.';
    return res.status(500).json({ 
      success: false, 
      error: message 
    });
  }
});

// Get all maps with customer information (admin only)
app.get('/api/admin/maps', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Get all maps with customer information and zone counts
    const result = await pool.query(`
      SELECT 
        m.map_id,
        m.title,
        m.description,
        m.map_code,
        m.created_at,
        m.active,
        m.country,
        m.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        c.registration_date,
        COUNT(z.id) as zone_count
      FROM map m
      LEFT JOIN customer c ON m.customer_id = c.customer_id
      LEFT JOIN zones z ON m.map_id = z.map_id
      GROUP BY m.map_id, m.title, m.description, m.map_code, m.created_at, m.active, m.country, 
               m.customer_id, c.first_name, c.last_name, c.email, c.registration_date
      ORDER BY m.created_at DESC;
    `);
    
    console.log(`[GET /api/admin/maps] Found ${result.rows.length} maps`);
    
    return res.json({
      success: true,
      maps: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.error('[GET /api/admin/maps] error:', err);
    return res.status(500).json({
      success: false,
      error: err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to fetch maps.'
    });
  }
});

// Get dashboard statistics (admin only)
app.get('/api/admin/stats', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Get various statistics
    const statsQueries = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM map'),
      pool.query('SELECT COUNT(*) as total FROM customer'),
      pool.query('SELECT COUNT(*) as total FROM zones'),
      pool.query('SELECT COUNT(*) as total FROM map WHERE active = true'),
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM map 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `)
    ]);
    
    const stats = {
      totalMaps: parseInt(statsQueries[0].rows[0].total),
      totalCustomers: parseInt(statsQueries[1].rows[0].total),
      totalZones: parseInt(statsQueries[2].rows[0].total),
      activeMaps: parseInt(statsQueries[3].rows[0].total),
      recentActivity: statsQueries[4].rows
    };
    
    console.log('[GET /api/admin/stats] Statistics retrieved');
    
    return res.json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('[GET /api/admin/stats] error:', err);
    return res.status(500).json({
      success: false,
      error: err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to fetch statistics.'
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
        m.map_code,
        m.created_at,
        m.active,
        m.country,
        COUNT(z.id) as zone_count
      FROM map m
      LEFT JOIN zones z ON m.map_id = z.map_id
      WHERE m.customer_id = $1
      GROUP BY m.map_id, m.title, m.description, m.map_code, m.created_at, m.active, m.country
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
      error: err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to fetch maps.'
    });
  }
});

// Add database routes
app.use('/api/db', dbRoutes);

// Add zone management routes
app.use('/api/zones', zoneRoutes);

// Packages API endpoints
// Get all active packages
app.get('/api/packages', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const result = await pool.query(
      'SELECT * FROM packages WHERE active = true ORDER BY priority ASC'
    );
    console.log('[GET /api/packages] Found', result.rows.length, 'packages');
    res.json({ success: true, packages: result.rows });
  } catch (err) {
    console.error('[GET /api/packages] Error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to fetch packages.';
    res.status(500).json({ success: false, error: message });
  }
});

// Get customer's current package/order
app.get('/api/customer/:customer_id/package', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { customer_id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT o.*, p.name, p.price, p.allowed_maps, p.priority
      FROM orders o
      JOIN packages p ON o.package_id = p.package_id
      WHERE o.customer_id = $1 AND o.status = 'completed'
      ORDER BY o.date_time DESC
      LIMIT 1
    `, [customer_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No active package found.' });
    }
    
    console.log('[GET /api/customer/:customer_id/package] Found package for customer', customer_id);
    res.json({ success: true, package: result.rows[0] });
  } catch (err) {
    console.error('[GET /api/customer/:customer_id/package] Error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to fetch customer package.';
    res.status(500).json({ success: false, error: message });
  }
});

// Get customer's order history
app.get('/api/customer/:customer_id/orders', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { customer_id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT o.*, p.name as package_name, p.allowed_maps
      FROM orders o
      JOIN packages p ON o.package_id = p.package_id
      WHERE o.customer_id = $1
      ORDER BY o.date_time DESC
    `, [customer_id]);
    
    console.log('[GET /api/customer/:customer_id/orders] Found', result.rows.length, 'orders for customer', customer_id);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('[GET /api/customer/:customer_id/orders] Error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to fetch orders.';
    res.status(500).json({ success: false, error: message });
  }
});

// Create a new order (for package upgrades)
app.post('/api/orders', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { customer_id, package_id } = req.body ?? {};
  
  if (!customer_id || !package_id) {
    return res.status(400).json({ success: false, error: 'customer_id and package_id are required.' });
  }
  
  try {
    // Get package details
    const packageResult = await pool.query('SELECT * FROM packages WHERE package_id = $1 AND active = true', [package_id]);
    
    if (packageResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Package not found or inactive.' });
    }
    
    const selectedPackage = packageResult.rows[0];
    
    // Create order
    const orderResult = await pool.query(`
      INSERT INTO orders (customer_id, package_id, total, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [customer_id, package_id, selectedPackage.price, 'completed']);
    
    console.log('[POST /api/orders] Created order', orderResult.rows[0].id, 'for customer', customer_id);
    res.status(201).json({ success: true, order: orderResult.rows[0] });
  } catch (err) {
    console.error('[POST /api/orders] Error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to create order.';
    res.status(500).json({ success: false, error: message });
  }
});

// ============ ADMIN PACKAGE MANAGEMENT ENDPOINTS ============

// Create a new package (admin only)
app.post('/api/admin/packages', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { name, price, allowed_maps, priority, active } = req.body;

  if (!name || price === undefined || !allowed_maps || !priority) {
    return res.status(400).json({ 
      success: false, 
      error: 'Name, price, allowed_maps, and priority are required.' 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO packages (name, price, allowed_maps, priority, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, price, allowed_maps, priority, active !== undefined ? active : true]
    );

    console.log('[POST /api/admin/packages] Created package:', result.rows[0].package_id);
    res.status(201).json({ success: true, package: result.rows[0] });
  } catch (err) {
    console.error('[POST /api/admin/packages] Error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to create package.';
    res.status(500).json({ success: false, error: message });
  }
});

// Update a package (admin only)
app.put('/api/admin/packages/:package_id', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { package_id } = req.params;
  const { name, price, allowed_maps, priority, active } = req.body;

  if (!name || price === undefined || !allowed_maps || !priority) {
    return res.status(400).json({ 
      success: false, 
      error: 'Name, price, allowed_maps, and priority are required.' 
    });
  }

  try {
    const result = await pool.query(
      `UPDATE packages 
       SET name = $1, price = $2, allowed_maps = $3, priority = $4, active = $5, updated_at = NOW()
       WHERE package_id = $6
       RETURNING *`,
      [name, price, allowed_maps, priority, active, package_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Package not found.' });
    }

    console.log('[PUT /api/admin/packages] Updated package:', package_id);
    res.json({ success: true, package: result.rows[0] });
  } catch (err) {
    console.error('[PUT /api/admin/packages] Error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to update package.';
    res.status(500).json({ success: false, error: message });
  }
});

// Delete a package (admin only)
app.delete('/api/admin/packages/:package_id', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { package_id } = req.params;

  try {
    // Check if any customers are using this package
    const ordersCheck = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE package_id = $1',
      [package_id]
    );

    if (parseInt(ordersCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete package with existing orders. Consider deactivating it instead.' 
      });
    }

    const result = await pool.query(
      'DELETE FROM packages WHERE package_id = $1 RETURNING *',
      [package_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Package not found.' });
    }

    console.log('[DELETE /api/admin/packages] Deleted package:', package_id);
    res.json({ success: true, message: 'Package deleted successfully.' });
  } catch (err) {
    console.error('[DELETE /api/admin/packages] Error:', err);
    const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to delete package.';
    res.status(500).json({ success: false, error: message });
  }
});

// ============ END ADMIN PACKAGE MANAGEMENT ============

// 404 handler (after defined routes, before error handler)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  next();
});

// Central error handler (must have 4 args)
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  const message = err && typeof err === 'object' && 'message' in err ? err.message : 'Internal server error';
  res.status(500).json({ success: false, error: message });
});

// Start server
function start() {
  // Use specified port 3100 for consistency with configuration
  console.log(`Starting server on port ${PORT} (127.0.0.1)...`);
  
  const server = app.listen(PORT, HOST, () => {
    console.log(`✅ SUCCESS: API server running on http://${HOST}:${PORT}`);
    console.log(`📱 For client access use: http://localhost:${PORT}`);
  });
  
  server.on('error', (err) => {
    console.error(`❌ Error starting server on port ${PORT}:`, err.message);
    
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please free this port and try again.`);
      console.error(`❌ You can use 'netstat -ano | findstr ${PORT}' to find which process is using the port.`);
      process.exit(1);
    } else {
      console.error('❌ Failed to start server due to error:', err);
      process.exit(1);
    }
  });
}

// Test DB connection first then start server
pool.query('SELECT 1').then(() => {
  console.log('PostgreSQL connection successful');
  start();
}).catch(err => {
  console.error('Failed to connect to PostgreSQL:', err.message);
  start(); // still start to expose health endpoint with error state
});

// Handle uncaught errors to prevent server from crashing
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
