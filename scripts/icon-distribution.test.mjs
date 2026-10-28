import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('portal aliases import only the documented native MIT icon files', () => {
  const provenance = JSON.parse(read('src/kit/official-icons/provenance.json'));
  assert.equal(provenance.license, 'LicenseRef-COI-MIT-PL');
  const entries = new Map(provenance.icons.map((entry) => [entry.file, entry]));
  const imports = [...read('src/kit/portal/PortalIcon.tsx').matchAll(/from '([^']+\.svg)'/g)];
  assert.ok(imports.length > 0, 'The compatibility adapter must contain real icons.');
  for (const [, source] of imports) {
    assert.match(source, /^\.\.\/official-icons\/icon-\d{3}\.svg$/);
    const file = path.basename(source);
    const entry = entries.get(file);
    assert.ok(entry, `Missing native provenance: ${file}`);
    const bytes = readFileSync(path.join(root, 'src/kit/official-icons', file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
  }
});

test('withdrawn portal SVGs cannot reappear in distributed asset directories', () => {
  assert.equal(existsSync(path.join(root, 'src/kit/portal/assets/icons')), false);
  for (const directory of ['src/kit/portal/assets', 'src/examples/desktop-assets']) {
    for (const file of readdirSync(path.join(root, directory))) {
      if (file.endsWith('.svg')) assert.match(file, /^demo-/, `Unexpected web asset: ${file}`);
    }
  }
});

test('the generated native registry references current SVG files rather than stale embedded copies', () => {
  const registry = read('src/kit/official-icons/registry.ts');
  assert.doesNotMatch(registry, /data:image\//);
  const files = [...registry.matchAll(/from '\.\/(icon-\d{3}\.svg)'/g)].map((match) => match[1]);
  const provenance = JSON.parse(read('src/kit/official-icons/provenance.json'));
  assert.deepEqual(
    files,
    provenance.icons.map((entry) => entry.file),
  );
});
