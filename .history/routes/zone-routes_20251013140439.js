/**
 * API Routes for zone management
 */

import express from 'express';
import db from '../src/db/dbOperations.js';
import { authenticateToken } from '../auth-middleware.js'; // You'll need to implement this

const router = express.Router();

// Get all zones for a specific map (no auth required for now since we use DB routes)
router.get('/', async (req, res) => {
  try {
    const { map_id } = req.query;
    
    if (!map_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'map_id is required' 
      });
    }
    
    const query = `SELECT * FROM zones WHERE map_id = $1 ORDER BY created_at DESC`;
    const result = await db.query(query, [map_id]);
    
    res.json({ success: true, zones: result.rows });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get a specific zone by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const query = `SELECT * FROM zones WHERE id = $1 AND user_id = $2`;
    const result = await db.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Zone not found' });
    }
    
    res.json({ success: true, zone: result.rows[0] });
  } catch (error) {
    console.error('Error fetching zone:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create a new zone
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id, name, color, coordinates } = req.body;
    const userId = req.user.id;
    
    if (!id || !name || !color || !coordinates) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const query = `
      INSERT INTO zones (id, user_id, name, color, coordinates) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    
    const result = await db.query(query, [id, userId, name, color, JSON.stringify(coordinates)]);
    
    res.status(201).json({ success: true, zone: result.rows[0] });
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update an existing zone
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, color, coordinates } = req.body;
    
    // Check if zone exists and belongs to user
    const checkQuery = `SELECT * FROM zones WHERE id = $1 AND user_id = $2`;
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Zone not found' });
    }
    
    // Update the zone
    const updateQuery = `
      UPDATE zones 
      SET name = $1, color = $2, coordinates = $3, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4 AND user_id = $5 
      RETURNING *
    `;
    
    const updateResult = await db.query(updateQuery, [name, color, JSON.stringify(coordinates), id, userId]);
    
    res.json({ success: true, zone: updateResult.rows[0] });
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete a zone
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if zone exists and belongs to user
    const checkQuery = `SELECT * FROM zones WHERE id = $1 AND user_id = $2`;
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Zone not found' });
    }
    
    // Delete the zone
    const deleteQuery = `DELETE FROM zones WHERE id = $1 AND user_id = $2`;
    await db.query(deleteQuery, [id, userId]);
    
    res.json({ success: true, message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Save multiple zones at once (bulk operation)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { zones } = req.body;
    const userId = req.user.id;
    
    if (!Array.isArray(zones) || zones.length === 0) {
      return res.status(400).json({ success: false, error: 'No zones provided' });
    }
    
    // Use a transaction for bulk operations
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete all existing zones for this user first
      await client.query('DELETE FROM zones WHERE user_id = $1', [userId]);
      
      // Insert all new zones
      const insertPromises = zones.map(zone => {
        const { id, name, color, coordinates } = zone;
        return client.query(
          'INSERT INTO zones (id, user_id, name, color, coordinates) VALUES ($1, $2, $3, $4, $5)',
          [id, userId, name, color, JSON.stringify(coordinates)]
        );
      });
      
      await Promise.all(insertPromises);
      await client.query('COMMIT');
      
      res.json({ success: true, message: `Saved ${zones.length} zones` });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in bulk zone save:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;