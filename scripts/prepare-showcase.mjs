import fs from 'node:fs/promises';
import path from 'node:path';

// The showcase deliberately skips copyPublicDir. Keep its own brand and
// base-prefixed favicon available when served without the Storybook public root.
await fs.mkdir('dist/showcase/brand', { recursive: true });
await fs.copyFile('public/brand/mdesign-symbol.svg', 'dist/showcase/brand/mdesign-symbol.svg');
await fs.copyFile('public/favicon.svg', 'dist/showcase/favicon.svg');

// Keep standalone example screens addressable inside the static Storybook build.
const html = await fs.readFile('dist/showcase/index.html', 'utf8');
const source = await fs.readFile('src/visual/Preview.tsx', 'utf8');
const routes = new Set([
  'mobile',
  ...Array.from(source.matchAll(/['"]\/preview\/([a-z-]+)['"]/g), (match) => match[1]),
]);
for (const route of routes) {
  const destination = path.join('dist/showcase/preview', route);
  await fs.mkdir(destination, { recursive: true });
  await fs.writeFile(path.join(destination, 'index.html'), html);
}
console.log(`Prepared ${routes.size} standalone example previews.`);
