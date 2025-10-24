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
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    cors: true
  },
  // For SPA routing to work
  base: './'
})
