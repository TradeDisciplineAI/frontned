import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate a browser DOM for component testing
    environment: 'jsdom',
    // Automatically import @testing-library/jest-dom matchers
    setupFiles: ['./src/test/setup.ts'],
    // Allow describe/it/expect globally (no need to import)
    globals: true,
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Only collect coverage from source files
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.d.ts',
        'src/**/*.types.ts',
        'src/**/*.constants.ts',
        'src/main.tsx',
      ],
      // Minimum coverage thresholds — CI will fail if these are not met
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
