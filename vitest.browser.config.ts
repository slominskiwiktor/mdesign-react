import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  cacheDir: 'node_modules/.vite/kit-browser',
  optimizeDeps: { include: ['react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client'] },
  plugins: [react()],
  test: {
    name: 'browser',
    include: ['src/browser/**/*.browser.test.tsx'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
      instances: [{ browser: 'chromium' }],
      viewport: { width: 1280, height: 900 },
    },
    testTimeout: 15000,
    maxWorkers: 2,
  },
});
