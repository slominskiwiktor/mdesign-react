import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
if (process.argv.length !== 3 || process.argv[2] !== '--registry-only')
  throw new Error('Usage: node scripts/generate-official-icons.mjs --registry-only');
const destination = path.resolve('src/kit/official-icons');
function writeRegistry(entries) {
  const output = [
    '// Generated from the current SVG files and provenance.json. Do not embed historical artwork.',
    ...entries.map((entry, index) => `import icon${index} from './${entry.file}';`),
    `export const officialIconNames=${JSON.stringify(entries.map((entry) => entry.id))} as const;`,
    'export type OfficialIconName=typeof officialIconNames[number];',
    'export const officialIconSources:Record<OfficialIconName,string>={',
    ...entries.map((entry, index) => `  ${JSON.stringify(entry.id)}:icon${index},`),
    '};',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(destination, 'registry.ts'), output);
}
const provenance = JSON.parse(fs.readFileSync(path.join(destination, 'provenance.json'), 'utf8'));
const ids = new Set(),
  files = new Set();
if (!provenance.icons?.length) throw new Error('The icon catalogue is empty.');
for (const entry of provenance.icons) {
  if (
    !entry.id ||
    ids.has(entry.id) ||
    files.has(entry.file) ||
    !/^icon-\d{3}\.svg$/.test(entry.file)
  )
    throw new Error(`Invalid or duplicate icon entry: ${entry.id}`);
  ids.add(entry.id);
  files.add(entry.file);
  const bytes = fs.readFileSync(path.join(destination, entry.file));
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== entry.sha256)
    throw new Error(`Icon differs from current provenance: ${entry.file}`);
}
writeRegistry(provenance.icons);
console.log(`Refreshed ${provenance.icons.length} current icon references; no SVGs overwritten.`);
