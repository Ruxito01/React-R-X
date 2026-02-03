import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-legacy': {
        target: 'https://backend-rux-626914317382.us-central1.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-legacy/, '/api'),
      },
    },
  },
})
