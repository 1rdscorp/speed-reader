import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { pageProxy } from './server/vitePlugin.ts';

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths plus hash routing (see src/app/routes.tsx) mean the
  // build runs from any static host and any sub-path without server config.
  base: './',
  plugins: [react(), pageProxy()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
