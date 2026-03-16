/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  // Rapier ships a WASM binary loaded at runtime via fetch.
  // Pre-bundling it causes Vite to mangle the WASM import path → physics never inits.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
  optimizeDeps: {
    exclude: ['@react-three/rapier'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          three:  ['three'],
          r3f:    ['@react-three/fiber', '@react-three/drei'],
          rapier: ['@react-three/rapier'],
          post:   ['@react-three/postprocessing', 'postprocessing'],
        },
      },
    },
  },
});
