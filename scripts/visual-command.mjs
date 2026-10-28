import path from 'node:path';
import { parseCLI } from 'vitest/node';

export function visualCommand(root, pattern, forwarded = []) {
  for (const argument of forwarded)
    if (
      argument === '-u' ||
      argument.startsWith('-u=') ||
      argument.startsWith('--update') ||
      argument === '--no-update'
    )
      throw new Error('Snapshot update options are owned by the retained-baseline gate.');
  const parameters = [
    path.join(root, 'node_modules/vitest/vitest.mjs'),
    'run',
    '--config',
    'vitest.visual.config.ts',
    '--update=none',
    '--testNamePattern',
    pattern,
    ...forwarded,
    '--reporter=json',
    '--outputFile=artifacts/ci/visual-tests.json',
  ];
  if (parseCLI(['vitest', ...parameters.slice(1)]).options.update !== 'none')
    throw new Error('The Vitest parser must disable snapshot updates.');
  return parameters;
}
