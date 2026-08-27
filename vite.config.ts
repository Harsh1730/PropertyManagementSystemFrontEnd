import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/properties': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/leases': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/payments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/maintenance': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
