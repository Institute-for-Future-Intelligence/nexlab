/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // Using root path for custom domain (nexlab.bio)
  base: '/',
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/icons-material',
      '@mui/system',
      '@mui/material/styles',
      '@mui/styled-engine'
    ],
    force: true,
    esbuildOptions: {
      target: 'es2020'
    }
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine',
    }
  },
  server: {
    open: true,
    port: 3001,
    host: true,
    // Removed CORS headers that might interfere with Firebase Auth popups
    // headers: {
    //   'Cross-Origin-Embedder-Policy': 'credentialless',
    //   'Cross-Origin-Opener-Policy': 'same-origin',
    // },
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
  publicDir: 'public', // This ensures files from public/ (including 404.html) are copied to dist/
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'public/',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
      ]
    }
  }
}))