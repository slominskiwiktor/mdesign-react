import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visualCommand } from './visual-command.mjs';
import { retainedVisualPlan } from './retained-visual-plan.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { files, names } = retainedVisualPlan(root);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pattern = `^(?:${names.map(escape).join('|')})$`;
const report = {
  selectedBaselineFiles: files.length,
  selectedTestNames: names,
  scope:
    'Only committed baselines and comparator sensitivity. Other full-suite cases are not executed; no full visual regression pass is claimed.',
};
mkdirSync(path.join(root, 'artifacts/ci'), { recursive: true });
writeFileSync(
  path.join(root, 'artifacts/ci/retained-visual-scope.json'),
  JSON.stringify(report, null, 2) + '\n',
);
console.log(
  `Checking ${files.length} retained baseline files plus comparator sensitivity; full VRT remains incomplete.`,
);
if (process.argv.includes('--plan')) process.exit(0);
const parameters = visualCommand(root, pattern, process.argv.slice(2));
const result = spawnSync(process.execPath, parameters, { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status === 0) {
  const actual = JSON.parse(
    readFileSync(path.join(root, 'artifacts/ci/visual-tests.json'), 'utf8'),
  );
  if (actual.numPassedTests !== names.length || actual.numFailedTests !== 0)
    throw new Error(
      `Retained gate executed ${actual.numPassedTests} passing tests; expected exactly ${names.length}.`,
    );
}
process.exit(result.status ?? 1);
