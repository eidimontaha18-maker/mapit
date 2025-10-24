// Simple server start script to help with launching and accessing the application
import { spawn } from 'child_process';
import open from 'open';

console.log('Starting MapIt simple server...');

// Start the server as a child process
const server = spawn('node', ['simple-server.js'], { 
    stdio: 'inherit',
    shell: true
});

// Handle server exit
server.on('close', (code) => {
    if (code !== 0) {
        console.log(`Server process exited with code ${code}`);
    }
});

// Open the browser after a short delay to ensure server is running
setTimeout(() => {
    console.log('Opening country & city search page in browser...');
    try {
        open('http://localhost:3001/country-city-search.html');
        console.log('\nBrowser should open automatically. If not, visit:');
        console.log('http://localhost:3001/country-city-search.html');
    } catch (err) {
        console.error('Failed to open browser automatically:', err);
        console.log('\nPlease open this URL in your browser:');
        console.log('http://localhost:3001/country-city-search.html');
    }
    
    console.log('\nPress Ctrl+C to stop the server');
}, 2000);