/**
 * PostgreSQL Configuration
 * 
 * This file provides connection and PostgREST configuration for the application.
 */

// Server configuration
export const serverConfig = {
  host: '127.0.0.1',
  port: 3100
};

// Database configuration
export const dbConfig = {
  uri: 'postgres://postgres:NewStrongPass123@localhost:5432/mapit',
  schemas: ['public'],
  anonRole: 'anon'
};

// CORS configuration
export const corsConfig = {
  origins: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  maxAge: 86400
};

// Config object for PostgREST
export const postgrestConfig = {
  endpoint: `http://${serverConfig.host}:${serverConfig.port}`,
  schema: dbConfig.schemas[0]
};