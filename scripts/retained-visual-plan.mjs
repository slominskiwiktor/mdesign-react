import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

export function retainedVisualPlan(root) {
  const manifest = JSON.parse(
    readFileSync(path.join(root, 'src/browser/visual-baselines.json'), 'utf8'),
  );
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.files) || !manifest.files.length)
    throw new Error('Invalid approved visual baseline manifest.');
  const suffix = '-1-chromium-darwin.png';
  if (
    manifest.files.some(
      (file) => typeof file !== 'string' || path.basename(file) !== file || !file.endsWith(suffix),
    )
  )
    throw new Error('Invalid approved visual baseline filename.');
  if (new Set(manifest.files).size !== manifest.files.length)
    throw new Error('Duplicate approved visual baseline filename.');
  const directory = path.join(root, 'src/browser/__screenshots__/kit.vrt.test.tsx');
  const actual = readdirSync(directory).filter((file) => file.endsWith(suffix));
  const missing = manifest.files.filter((file) => !actual.includes(file));
  const unlisted = actual.filter((file) => !manifest.files.includes(file));
  if (missing.length || unlisted.length)
    throw new Error(
      `Visual baseline manifest differs from PNG files. Missing: ${missing.join(', ') || 'none'}; unlisted: ${unlisted.join(', ') || 'none'}.`,
    );
  const files = [...manifest.files].sort();
  const names = files.map((file) => file.slice(0, -suffix.length).replaceAll('-', ' '));
  if (new Set(names).size !== names.length)
    throw new Error('Ambiguous retained visual test names.');
  names.push('compact comparator rejects removal of a real24px icon');
  return { files, names };
}
