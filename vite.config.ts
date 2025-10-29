import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3101',
        changeOrigin: true,
        secure: false,
        // Allow websockets if later needed
        ws: true,
        // Configure rewrite to ensure proper path handling
        rewrite: (path) => path,
        // Add error handling and logging
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('❌ Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('🔄 Proxying:', req.method, req.url, '→', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('✅ Proxy response:', req.method, req.url, '→', proxyRes.statusCode);
          });
        }
      }
    },
    cors: true
  },
  // For SPA routing to work - ensure all routes serve index.html
  appType: 'spa'
})
