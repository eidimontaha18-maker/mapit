import http from 'http';

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello World' }));
});

const PORT = 3101;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Keep alive
setInterval(() => {
  console.log('Server still running...');
}, 30000);
