import { mergeConfig } from 'vite';
import base from './vite.config';
export default mergeConfig(base, {
  base: `${process.env.VITE_DOCS_BASE || '/'}showcase/`,
  build: { outDir: 'dist/showcase', emptyOutDir: true, copyPublicDir: false },
});
