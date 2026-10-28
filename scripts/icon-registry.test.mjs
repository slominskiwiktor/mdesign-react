import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const command = fileURLToPath(new URL('./generate-official-icons.mjs', import.meta.url));
test('registry refresh preserves asset bytes and replacement metadata and rejects raw imports', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'mdesign-icon-registry-'));
  try {
    const directory = path.join(root, 'src/kit/official-icons');
    mkdirSync(directory, { recursive: true });
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24"/></svg>';
    const entry = {
      id: 'Demo/Card',
      file: 'icon-001.svg',
      sha256: createHash('sha256').update(svg).digest('hex'),
      distributionChange: 'Neutral card',
      originalSha256: 'retained-source-hash',
    };
    const provenance = JSON.stringify({ icons: [entry] });
    writeFileSync(path.join(directory, entry.file), svg);
    writeFileSync(path.join(directory, 'provenance.json'), provenance);
    const run = (...args) =>
      spawnSync(process.execPath, [command, ...args], { cwd: root, encoding: 'utf8' });
    assert.equal(run('--registry-only').status, 0);
    assert.match(readFileSync(path.join(directory, 'registry.ts'), 'utf8'), /Demo\/Card/);
    assert.notEqual(run(root).status, 0);
    assert.equal(readFileSync(path.join(directory, 'provenance.json'), 'utf8'), provenance);
    assert.equal(readFileSync(path.join(directory, entry.file), 'utf8'), svg);
    const registry = readFileSync(path.join(directory, 'registry.ts'), 'utf8');
    writeFileSync(path.join(directory, entry.file), '<svg/>');
    assert.match(run('--registry-only').stderr, /differs from current provenance/);
    assert.equal(readFileSync(path.join(directory, 'registry.ts'), 'utf8'), registry);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
