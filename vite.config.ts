import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // Use base path only for production build, not for local development
  base: command === 'build' ? '/nexlab/' : '/',
  plugins: [react()],
  server: {
    open: true,
    port: 3001,
    host: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          ui: ['@mui/material', '@mui/icons-material']
        }
      }
    },
    // Ensure the PDF worker is copied during build
    copyPublicDir: true
  },
  publicDir: 'public' // This ensures files from public/ (including 404.html) are copied to dist/
}))