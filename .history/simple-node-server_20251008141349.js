/**
 * Ultra-Simple Node HTTP Server for testing connectivity
 * This is just a basic server to check if your network is working correctly
 */
const http = require('http');

// Configuration
const PORT = 3101;
const HOST = '0.0.0.0'; // Listen on all interfaces

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Path-based routing
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Simple HTTP server is running!');
  } 
  else if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server is working!' }));
  }
  else if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
  }
  else if (req.url === '/api/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('Received registration data:', body);
      try {
        // Attempt to parse the JSON (but don't actually do anything with it)
        const data = JSON.parse(body);
        console.log('Parsed registration data:', data);
        
        // Send success response
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          error: null, 
          message: 'Registration successful (test server)'
        }));
      } catch (e) {
        console.error('Error parsing JSON:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON payload'
        }));
      }
    });
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Not found' }));
  }
});

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log(`For client access use: http://localhost:${PORT}`);
  
  // Print all addresses where the server is available
  const networkInterfaces = require('os').networkInterfaces();
  console.log('\nAvailable on these addresses:');
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(interface => {
      if (interface.family === 'IPv4') {
        console.log(`http://${interface.address}:${PORT}`);
      }
    });
  });
});

// Handle server errors
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose another port.`);
  } else {
    console.error('Server error:', e);
  }
  process.exit(1);
});