import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3101',
        changeOrigin: true,
        secure: false,
        // Allow websockets if later needed
        ws: true,
        // Configure rewrite to ensure proper path handling
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        // Add error handling
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
          });
        }
      }
    },
    cors: true
  },
  // For SPA routing to work
  base: './'
})
