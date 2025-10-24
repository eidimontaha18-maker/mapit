/**
 * Simple server to serve the countries HTML page
 */

import express from 'express';

const app = express();
const PORT = 3001;

// Serve static files from public directory
app.use(express.static('public'));

// Serve static files from src directory to make the countries JSON accessible
app.use('/src', express.static('src'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`View countries in English at http://localhost:${PORT}/countries-english.html`);
});