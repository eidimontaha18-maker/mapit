import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Allow websockets if later needed
        ws: true,
        // Rewrite not strictly necessary since paths align
        // rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
