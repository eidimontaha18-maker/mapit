/**
 * Simple server to serve the MapIt HTML pages
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());

// Serve static files from public directory
app.use(express.static('public'));

// Serve static files from src directory to make the countries JSON accessible
app.use('/src', express.static('src'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`View countries in English at http://localhost:${PORT}/countries-english.html`);
  console.log(`View map interface at http://localhost:${PORT}/english-map.html`);
});