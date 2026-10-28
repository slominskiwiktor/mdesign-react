import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = process.env.MDESIGN_PACK_DESTINATION || 'artifacts/current';
await mkdir(path.resolve(root, destination), { recursive: true });
// Bun invokes prepack before archiving the current library.
const child = spawnSync('bun', ['pm', 'pack', '--destination', destination], {
  cwd: root,
  stdio: 'inherit',
});
if (child.error) throw child.error;
process.exitCode = child.status ?? 1;
