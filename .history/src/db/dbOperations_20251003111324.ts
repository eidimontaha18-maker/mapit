/**
 * PostgreSQL Database Operations
 * 
 * This file provides functions to connect to PostgreSQL and perform
 * CRUD operations (Create, Read, Update, Delete) on tables.
 */

import pg from 'pg';
import type { DbConfig, DbInfo, ColumnInfo, DbEntity, QueryParams } from './dbTypes';
const { Pool } = pg;
type QueryResultRow = pg.QueryResultRow;

// Configuration based on provided values
const config: DbConfig = {
  server: {
    host: '127.0.0.1',
    port: 3000
  },
  db: {
    uri: 'postgres://postgres:NewStrongPass123@localhost:5432/montaha',
    schemas: ['public'],
    anonRole: 'anon'
  },
  cors: {
    origins: [
      'http://localhost:8080', 
      'http://127.0.0.1:8080', 
      'http://localhost:5173', 
      'http://127.0.0.1:5173'
    ],
    maxAge: 86400
  }
};

// Create and export the connection pool
export const pool = new Pool({
  connectionString: config.db.uri
});

/**
 * Tests the database connection
 * @returns {Promise<boolean>} Whether the connection was successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    console.log('✅ Connected to PostgreSQL database!');
    console.log('🕒 Database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Get information about the database
 * @returns {Promise<DbInfo>} Database metadata
 */
export async function getDatabaseInfo(): Promise<DbInfo> {
  try {
    const result = await pool.query(`
      SELECT current_database() as database, 
             current_schema() as schema,
             current_user as user
    `);
    return result.rows[0];
  } catch (error) {
    console.error('Error retrieving database info:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Lists all tables in the current schema
 * @returns {Promise<Array<string>>} List of table names
 */
export async function listTables(): Promise<string[]> {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = $1
      ORDER BY table_name
    `, [config.db.schemas[0]]);
    
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error('Error listing tables:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Gets the structure of a specific table
 * @param {string} tableName - The name of the table
 * @returns {Promise<Array<ColumnInfo>>} List of columns and their properties
 */
export async function getTableStructure(tableName: string): Promise<ColumnInfo[]> {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `, [config.db.schemas[0], tableName]);
    
    return result.rows;
  } catch (error) {
    console.error(`Error getting structure for table ${tableName}:`, 
      error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Generic query execution function
 * @param {string} queryText - SQL query text with parameterized values ($1, $2, etc.)
 * @param {Array<QueryParams>} params - Parameter values for the query
 * @returns {Promise<pg.QueryResult>} Query result
 */
export async function executeQuery<T = Record<string, unknown>>(
  queryText: string, 
  params: QueryParams = []
): Promise<pg.QueryResult<T>> {
  try {
    return await pool.query(queryText, params);
  } catch (error) {
    console.error('Error executing query:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Get all rows from a table
 * @param {string} tableName - Name of the table
 * @param {string} orderBy - Optional column to order by
 * @returns {Promise<Array<DbEntity>>} Array of rows
 */
export async function getAll(tableName: string, orderBy?: string): Promise<DbEntity[]> {
  try {
    const orderClause = orderBy ? `ORDER BY ${orderBy}` : '';
    const result = await pool.query(`SELECT * FROM ${tableName} ${orderClause}`);
    return result.rows;
  } catch (error) {
    console.error(`Error retrieving data from ${tableName}:`, 
      error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Get a single row by ID
 * @param {string} tableName - Name of the table
 * @param {string|number} id - Primary key value
 * @param {string} idColumn - Name of the ID column (defaults to 'id')
 * @returns {Promise<DbEntity|null>} The row object or null if not found
 */
export async function getById(
  tableName: string, 
  id: string | number,
  idColumn: string = 'id'
): Promise<DbEntity | null> {
  try {
    const result = await pool.query(
      `SELECT * FROM ${tableName} WHERE ${idColumn} = $1`, 
      [id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error retrieving ${tableName} with ${idColumn}=${id}:`, 
      error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Insert a new row into a table
 * @param {string} tableName - Name of the table
 * @param {Record<string, unknown>} data - Object containing column-value pairs to insert
 * @returns {Promise<DbEntity>} The inserted row
 */
export async function insert(
  tableName: string, 
  data: Record<string, unknown>
): Promise<DbEntity> {
  // Extract column names and values from the data object
  const columns = Object.keys(data);
  const values = Object.values(data);
  
  // Create parameterized query with $1, $2, etc.
  const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
  
  try {
    const result = await pool.query(
      `INSERT INTO ${tableName} (${columns.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error inserting into ${tableName}:`, 
      error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Update a row in the table
 * @param {string} tableName - Name of the table
 * @param {string|number} id - Primary key value
 * @param {Record<string, unknown>} data - Object containing column-value pairs to update
 * @param {string} idColumn - Name of the ID column (defaults to 'id')
 * @returns {Promise<DbEntity>} The updated row
 */
export async function update(
  tableName: string, 
  id: string | number, 
  data: Record<string, unknown>,
  idColumn: string = 'id'
): Promise<DbEntity> {
  // Extract column names and values from the data object
  const columns = Object.keys(data);
  const values = Object.values(data);
  
  // Create SET clause with $1, $2, etc.
  const setClause = columns
    .map((col, idx) => `${col} = $${idx + 1}`)
    .join(', ');
  
  try {
    const result = await pool.query(
      `UPDATE ${tableName} 
       SET ${setClause} 
       WHERE ${idColumn} = $${columns.length + 1} 
       RETURNING *`,
      [...values, id]
    );
    
    if (result.rowCount === 0) {
      throw new Error(`No ${tableName} found with ${idColumn}=${id}`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating ${tableName} with ${idColumn}=${id}:`, 
      error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Delete a row from the table
 * @param {string} tableName - Name of the table
 * @param {string|number} id - Primary key value
 * @param {string} idColumn - Name of the ID column (defaults to 'id')
 * @returns {Promise<boolean>} True if the row was deleted
 */
export async function remove(
  tableName: string, 
  id: string | number,
  idColumn: string = 'id'
): Promise<boolean> {
  try {
    const result = await pool.query(
      `DELETE FROM ${tableName} WHERE ${idColumn} = $1`,
      [id]
    );
    
    if (result.rowCount === 0) {
      throw new Error(`No ${tableName} found with ${idColumn}=${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting from ${tableName} with ${idColumn}=${id}:`, 
      error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export default {
  pool,
  testConnection,
  getDatabaseInfo,
  listTables,
  getTableStructure,
  executeQuery,
  getAll,
  getById,
  insert,
  update,
  remove
};