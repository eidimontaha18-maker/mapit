/**
 * Environment and configuration utility
 */

// Use Vite's import.meta.env for browser-safe environment variables
const viteEnv = import.meta.env;
export const isProduction = viteEnv.MODE === 'production';
export const env = {
  isProduction,
  isDevelopment: !isProduction,
  // In production (Vercel), use relative URLs. In dev, use localhost
  apiUrl: isProduction ? '' : (viteEnv.VITE_API_URL || 'http://127.0.0.1:3101'),
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