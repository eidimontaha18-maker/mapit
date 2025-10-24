/**
 * Database types for PostgreSQL operations
 */

// Database connection configuration
export interface DbConfig {
  server: {
    host: string;
    port: number;
  };
  db: {
    uri: string;
    schemas: string[];
    anonRole: string;
  };
  cors: {
    origins: string[];
    maxAge: number;
  };
}

// Database metadata type
export interface DbInfo {
  database: string;
  schema: string;
  user: string;
}

// Table column structure
export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

// Generic database entity type
export interface DbEntity {
  id?: number | string;
  [key: string]: any; // Allow flexible properties
}

// Database query parameters type
export type QueryParams = (string | number | boolean | Date | null | undefined)[];