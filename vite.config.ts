import { defaultExclude, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  test: {
    maxWorkers: 2,
    testTimeout: 15000,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    css: false,
    exclude: [...defaultExclude, 'src/browser/**', 'scripts/**'],
    coverage: {
      provider: 'v8',
      include: ['src/kit/**/*.{ts,tsx}'],
      exclude: ['**/*.test.tsx'],
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'coverage/unit',
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 88 },
    },
  },
});
