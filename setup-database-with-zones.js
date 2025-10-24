/**
 * Database Setup Script
 * 
 * This script initializes the database tables for the MapIt application.
 * It creates the necessary tables and establishes relationships between them.
 */

import pg from 'pg';
const { Pool } = pg;

// Database connection configuration
const CONNECTION_STRING = 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';
const pool = new Pool({ connectionString: CONNECTION_STRING });

async function createTables() {
  console.log('Setting up MapIt database tables...');
  
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table ready');
    
    // Create maps table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS maps (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user
          FOREIGN KEY(user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);
    console.log('✅ Maps table ready');
    
    // Create zones table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS zones (
        id UUID PRIMARY KEY,
        user_id INTEGER,
        map_id INTEGER,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20) NOT NULL,
        coordinates JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user
          FOREIGN KEY(user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_map
          FOREIGN KEY(map_id)
          REFERENCES maps(id)
          ON DELETE CASCADE
      );
    `);
    console.log('✅ Zones table ready');
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    console.log('✨ Database setup completed successfully!');
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    // Close pool connection
    await pool.end();
  }
}

// Execute the function
createTables()
  .then(() => {
    console.log('✅ Database initialization complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database initialization error:', err);
    process.exit(1);
  });