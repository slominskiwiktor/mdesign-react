import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { markdownFiles, brokenDocumentationLinks } from './documentation-links.mjs';

test('documentation links are checked within the supplied source or extracted-package root', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mdesign-documentation-'));
  try {
    await mkdir(path.join(root, 'docs'));
    await writeFile(path.join(root, 'README.md'), '# Readme');
    await writeFile(
      path.join(root, 'docs/Usage.mdx'),
      '[Readme](../README.md)\n[Runtime](../.nvmrc)\n[Web](https://example.org)\n[Section](#section)\n```md\n[Example](nonexistent.md)\n```',
    );
    assert.deepEqual(await markdownFiles(root, 'docs'), [path.join('docs', 'Usage.mdx')]);
    assert.deepEqual(await brokenDocumentationLinks(root, ['docs/Usage.mdx']), [
      'docs/Usage.mdx: ../.nvmrc',
    ]);
    await writeFile(path.join(root, '.nvmrc'), '22.23.3');
    assert.deepEqual(await brokenDocumentationLinks(root, ['docs/Usage.mdx']), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
