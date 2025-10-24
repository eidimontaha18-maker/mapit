/**
 * Minimal test server
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3101;
const HOST = '127.0.0.1';

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  console.log('[GET /api/test] Request received');
  res.json({ success: true, message: 'Test endpoint works!' });
});

// Health route
app.get('/api/health', (req, res) => {
  console.log('[GET /api/health] Request received');
  res.json({ status: 'ok', time: new Date() });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Test server running on http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
  console.error(`❌ Server error:`, err);
});

// Keep process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

console.log('Server script loaded');
