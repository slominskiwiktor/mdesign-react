import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const withdrawn = new Set([
  'a9c2287d45732e0866645306eb6399041698c1964c6add8f3acaa97e09abb9d9',
  '974cd0cd423cdfdc7b529519b7533aacbc6d03f0148c13526c6209bce8513f25',
  '165c8ac9a8d8ce1d3ddc97966dc36b089ef085b538f22e8f5b68cabf5773efe7',
]);
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await inspect(file);
    else if (file.endsWith('.png')) {
      const hash = createHash('sha256')
        .update(await readFile(file))
        .digest('hex');
      assert(!withdrawn.has(hash), `Withdrawn branded screenshot: ${file}`);
    }
  }
}
test('source and public PNGs exclude withdrawn branded fixtures', async () => {
  await inspect('src');
  await inspect('public');
});
