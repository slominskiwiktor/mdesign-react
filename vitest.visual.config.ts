import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { visualPixelmatchOptions } from './src/browser/visual-comparison';

export default defineConfig({
  cacheDir: 'node_modules/.vite/kit-visual',
  optimizeDeps: { include: ['react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client'] },
  plugins: [react()],
  test: {
    name: 'visual',
    update: 'none',
    include: ['src/browser/**/*.vrt.test.tsx'],
    browser: {
      enabled: true,
      headless: true,
      // Fit both the initial900px iframe and taller body captures at native
      // scale. The Playwright default720px height would shrink them to80%.
      provider: playwright({
        contextOptions: {
          viewport: { width: 1440, height: 2400 },
          reducedMotion: 'reduce',
          colorScheme: 'light',
          locale: 'pl-PL',
          timezoneId: 'Europe/Warsaw',
          deviceScaleFactor: 1,
        },
      }),
      instances: [{ browser: 'chromium' }],
      viewport: { width: 1280, height: 900 },
      expect: {
        toMatchScreenshot: {
          screenshotOptions: { animations: 'disabled', caret: 'hide', scale: 'css' },
          comparatorName: 'pixelmatch',
          comparatorOptions: visualPixelmatchOptions,
        },
      },
    },
    testTimeout: 15000,
    maxWorkers: 1,
  },
});
