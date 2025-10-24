/**
 * API Routes for database CRUD operations
 * 
 * This file demonstrates how to create an Express API that uses the database operations
 * module to perform CRUD operations on PostgreSQL tables.
 * 
 * Usage: 
 * - Import this file in your main server.js
 * - Add 'app.use('/api/db', dbRoutes);' to your Express setup
 */

import express from 'express';
import db from '../src/db/dbOperations.js';

const router = express.Router();

// Get all tables
router.get('/tables', async (_req, res) => {
  try {
    const tables = await db.listTables();
    res.json({ success: true, tables });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get table structure
router.get('/tables/:tableName/structure', async (req, res) => {
  try {
    const tableName = req.params.tableName;
    const structure = await db.getTableStructure(tableName);
    res.json({ success: true, structure });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Database connection status check
router.get('/status', async (_req, res) => {
  try {
    const isConnected = await db.testConnection();
    res.json({ 
      success: true, 
      connected: isConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      connected: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get all records from a table
router.get('/tables/:tableName', async (req, res) => {
  try {
    const tableName = req.params.tableName;
    const orderBy = req.query.orderBy ? String(req.query.orderBy) : undefined;
    const records = await db.getAll(tableName, orderBy);
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get a specific record by ID
router.get('/tables/:tableName/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const idColumn = req.query.idColumn ? String(req.query.idColumn) : 'id';
    const record = await db.getById(tableName, id, idColumn);
    
    if (!record) {
      return res.status(404).json({ 
        success: false, 
        error: `Record not found in ${tableName} with ${idColumn}=${id}` 
      });
    }
    
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create a new record
router.post('/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const data = req.body;
    
    console.log(`[POST /tables/${tableName}] Received data:`, data);
    
    if (!data || Object.keys(data).length === 0) {
      console.log(`[POST /tables/${tableName}] Empty data received`);
      return res.status(400).json({ 
        success: false, 
        error: 'Request body is empty or invalid'
      });
    }
    
    console.log(`[POST /tables/${tableName}] Inserting data...`);
    const newRecord = await db.insert(tableName, data);
    console.log(`[POST /tables/${tableName}] Record inserted:`, newRecord);
    res.status(201).json({ success: true, record: newRecord });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update a record
router.put('/tables/:tableName/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const idColumn = req.query.idColumn ? String(req.query.idColumn) : 'id';
    const data = req.body;
    
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Request body is empty or invalid'
      });
    }
    
    const updatedRecord = await db.update(tableName, id, data, idColumn);
    res.json({ success: true, record: updatedRecord });
  } catch (error) {
    // Check if it's a "not found" error
    if (error instanceof Error && error.message.includes('No') && error.message.includes('found')) {
      return res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete a record
router.delete('/tables/:tableName/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const idColumn = req.query.idColumn ? String(req.query.idColumn) : 'id';
    
    await db.remove(tableName, id, idColumn);
    res.json({ success: true, message: `Record with ${idColumn}=${id} deleted from ${tableName}` });
  } catch (error) {
    // Check if it's a "not found" error
    if (error instanceof Error && error.message.includes('No') && error.message.includes('found')) {
      return res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Execute a custom SQL query
router.post('/query', async (req, res) => {
  try {
    const { sql, params } = req.body;
    
    if (!sql) {
      return res.status(400).json({ 
        success: false, 
        error: 'SQL query is required'
      });
    }
    
    const result = await db.executeQuery(sql, params || []);
    res.json({ 
      success: true, 
      rowCount: result.rowCount, 
      rows: result.rows 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create a new map
router.post('/map', async (req, res) => {
  try {
    console.log('🔍 POST /api/db/map - Request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Check for required fields
    const { title, customer_id, map_data, map_bounds } = req.body;
    
    console.log(`Extracted title: "${title}", customer_id: ${customer_id}`);
    console.log('Map data:', JSON.stringify(map_data, null, 2));
    
    if (!title || !customer_id) {
      console.log('❌ Missing required fields: title or customer_id');
      return res.status(400).json({ 
        success: false, 
        error: 'Title and customer_id are required'
      });
    }
    
    // Insert map data
    console.log('Preparing to insert map data into database...');
    
    const mapDataToInsert = {
      title: title,
      description: req.body.description || null,
      map_data: map_data ? JSON.stringify(map_data) : null,
      map_bounds: map_bounds ? JSON.stringify(map_bounds) : null,
      active: req.body.active !== undefined ? req.body.active : true,
      country: req.body.country || null,
      map_codes: req.body.map_codes || null,
      customer_id: customer_id
    };
    
    console.log('Data to insert:', JSON.stringify(mapDataToInsert, null, 2));
    
    const mapRecord = await db.insert('map', mapDataToInsert);
    console.log('✅ Map inserted successfully:', JSON.stringify(mapRecord, null, 2));
    
    // Create a customer-map relationship
    if (mapRecord && mapRecord.map_id) {
      try {
        console.log('Creating customer-map relationship...');
        const relationData = {
          customer_id: customer_id,
          map_id: mapRecord.map_id,
          access_level: 'owner',
          last_accessed: new Date()
        };
        
        console.log('Relation data:', JSON.stringify(relationData, null, 2));
        const relationRecord = await db.insert('customer_map', relationData);
        console.log('✅ Customer-map relation created:', JSON.stringify(relationRecord, null, 2));
      } catch (relError) {
        console.error('❌ Failed to create customer-map relation, but map was created:', relError);
        // Continue even if relation creation fails, as we already created the map
      }
    } else {
      console.warn('⚠️ No map record or map_id returned, cannot create relationship');
    }
    
    res.json({ 
      success: true, 
      message: 'Map created successfully', 
      record: mapRecord 
    });
  } catch (error) {
    console.error('Error creating map:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;