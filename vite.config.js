import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/' so the PWA / TWA can be hosted at a domain root and
// `/` + `/app` route cleanly. Vite serves/tests with SPA history fallback.
export default defineConfig({
  base: '/',
  appType: 'spa',
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase only loads when configured (dynamic import), keep it split.
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
