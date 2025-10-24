/**
 * Centralized Database Configuration
 * 
 * This file provides a single source of truth for database configuration
 * across the entire application. Import this file wherever you need DB config.
 */

import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

// Load environment variables
dotenv.config();

// Database configuration object
export const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mapit',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'NewStrongPass123',
  
  // Connection string (alternative to individual params)
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
  
  // SSL configuration for cloud databases (e.g., Neon)
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false // Required for Neon and other cloud providers
  } : false,
  
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
};

// PostgREST configuration
export const postgrestConfig = {
  host: process.env.POSTGREST_HOST || '127.0.0.1',
  port: parseInt(process.env.POSTGREST_PORT || '3100'),
  dbUri: process.env.POSTGREST_DB_URI || process.env.DATABASE_URL,
  dbSchemas: process.env.POSTGREST_DB_SCHEMAS || 'public',
  dbAnonRole: process.env.POSTGREST_DB_ANON_ROLE || 'anon',
};

// CORS configuration
export const corsConfig = {
  origins: process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
  ],
  maxAge: parseInt(process.env.CORS_MAX_AGE || '86400'),
};

// Create and export a shared connection pool
export const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Test connection function
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now, current_database() as db, current_user as user');
    console.log('✅ Database connected successfully!');
    console.log(`📊 Database: ${result.rows[0].db}`);
    console.log(`👤 User: ${result.rows[0].user}`);
    console.log(`🕒 Time: ${result.rows[0].now}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown
export async function closePool() {
  try {
    await pool.end();
    console.log('Database pool has ended');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
  }
}

// Export default configuration object
export default {
  db: dbConfig,
  postgrest: postgrestConfig,
  cors: corsConfig,
  pool,
  testConnection,
  closePool
};
