import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCLI } from 'vitest/node';
import { visualCommand } from './visual-command.mjs';

test('retained comparison resolves to none in the installed Vitest parser', () => {
  const args = visualCommand(process.cwd(), '^Button light$', ['--reporter=default']);
  assert.equal(parseCLI(['vitest', ...args.slice(1)]).options.update, 'none');
});
test('callers cannot override the snapshot policy', () => {
  for (const arg of ['-u', '-u=all', '--update=all', '--update=false', '--no-update'])
    assert.throws(() => visualCommand(process.cwd(), 'test', [arg]), /owned by/);
});
