import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ── Dev Server ───────────────────────────────────────────────────────────────
  server: {
    port: 3000,
  },

  // ── Path Aliases ────────────────────────────────────────────────────────────
  // Enables: import { X } from '@/features/...' instead of '../../../features/...'
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ── Production Build Optimisations ─────────────────────────────────────────
  build: {
    // Warn when any chunk exceeds 1MB
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Split heavy vendor libs into separate cached chunks
        // Rollup 4.x / Vite 8 requires manualChunks to be a function
        manualChunks: (id: string) => {
          if (id.includes('globe.gl') || id.includes('three')) {
            return 'globe-vendor'; // Three.js + globe.gl — large, cache separately
          }
          if (id.includes('node_modules/react') || id.includes('react-router')) {
            return 'react-vendor'; // React core — stable, cache separately
          }
          return undefined;
        },
      },
    },
  },
});
