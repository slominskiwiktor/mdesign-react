import { createHash } from 'node:crypto';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

// Keep font files cacheable and load only the faces a consuming app uses.
function externalFonts(): Plugin {
  return {
    name: 'mdesign-external-fonts',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const emitted = new Set<string>();
        for (const asset of Object.values(bundle)) {
          if (asset.type !== 'asset' || !asset.fileName.endsWith('.css')) continue;
          asset.source = String(asset.source).replace(
            /url\((["']?)data:font\/ttf;base64,([A-Za-z0-9+/=]+)\1\)/g,
            (_match, _quote: string, encoded: string) => {
              const bytes = Buffer.from(encoded, 'base64');
              const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
              const fileName = `assets/font-${hash}.ttf`;
              if (!emitted.has(fileName)) {
                this.emitFile({ type: 'asset', fileName, source: bytes });
                emitted.add(fileName);
              }
              return `url(./${fileName})`;
            },
          );
        }
      },
    },
  };
}
const externalPackages = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)];
export default defineConfig({
  plugins: [react(), externalFonts()],
  publicDir: false,
  build: {
    outDir: 'dist/lib',
    emptyOutDir: true,
    lib: {
      entry: {
        index: 'src/kit/index.ts',
        portal: 'src/kit/portal/index.ts',
        mobile: 'src/kit/mobile/index.ts',
        landing: 'src/kit/landing/index.ts',
        icons: 'src/kit/OfficialIcon.tsx',
      },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
      cssFileName: 'mdesign',
    },
    rollupOptions: {
      external: (id) => externalPackages.some((name) => id === name || id.startsWith(`${name}/`)),
      output: { chunkFileNames: 'chunks/[name]-[hash].js' },
    },
  },
});
