/**
 * Environment and configuration utility
 */

// Check if we're in production mode
export const isProduction = process.env.NODE_ENV === 'production';

// Get database connection string based on environment
export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || 'postgres://postgres:NewStrongPass123@localhost:5432/mapit';
}

// Utilities for working with the environment
export const env = {
  isProduction,
  isDevelopment: !isProduction,
  // Default API base for local dev; prefer 127.0.0.1 to avoid name resolution issues
  apiUrl: process.env.API_URL || 'http://127.0.0.1:3101',
};

// Convenience: return a list of candidate API bases to try in dev
export function getApiCandidates(): string[] {
  const base = env.apiUrl.replace(/\/$/, '');
  const ports = [3101, 3000, 3002, 8080];
  const hosts = ['127.0.0.1', 'localhost'];
  const candidates = new Set<string>();
  // Include the configured base first
  candidates.add(base);
  // Add host/port combos
  for (const h of hosts) {
    for (const p of ports) {
      candidates.add(`http://${h}:${p}`);
    }
  }
  return Array.from(candidates);
}