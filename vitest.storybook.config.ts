import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import pkg from './package.json';

export default defineConfig({
  cacheDir: 'node_modules/.vite/kit-stories',
  optimizeDeps: {
    include: [
      ...Object.keys(pkg.dependencies),
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
    ],
  },
  plugins: [
    storybookTest({
      configDir: '.storybook',
      storybookScript: 'npm run storybook',
      storybookUrl: 'http://localhost:6006',
    }),
  ],
  test: {
    name: 'storybook',
    // Portable stories mount/unmount their own DOM. Reuse the browser realm
    // rather than retaining a fresh framework/module graph for every CSF file.
    isolate: false,
    browser: {
      enabled: true,
      fileParallelism: false,
      headless: true,
      provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
      instances: [{ browser: 'chromium' }],
      viewport: { width: 1280, height: 900 },
    },
    testTimeout: 15000,
    maxWorkers: 1,
  },
});
