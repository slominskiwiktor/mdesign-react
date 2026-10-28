import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const json = (file) => JSON.parse(readFileSync(file, 'utf8'));
test('published source catalogue points to existing asset and license metadata', () => {
  const catalogue = json('public/provenance.json');
  const files = [
    ...Object.values(catalogue.assetCatalogues),
    ...catalogue.sources.flatMap((source) => source.catalogues ?? []),
    ...catalogue.sources.flatMap((source) =>
      ['dataFile', 'tokensFile', 'presetsFile', 'assetCatalogue'].flatMap((key) =>
        source[key] ? [source[key]] : [],
      ),
    ),
    ...catalogue.fonts.map((font) => font.licenseFile),
  ];
  for (const file of files) assert.ok(existsSync(file), `Missing source catalogue target: ${file}`);
});

test('landing illustrations and service icon hashes describe the distributed bytes', () => {
  const catalogues = [
    ['src/kit/landing/assets', json('src/kit/landing/provenance.json').files],
    ['src/kit/service-icons', json('src/kit/service-icons/provenance.json').icons],
  ];
  for (const [directory, entries] of catalogues)
    for (const entry of entries) {
      const file = path.join(directory, entry.file);
      const bytes = readFileSync(file);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, file);
    }
});
