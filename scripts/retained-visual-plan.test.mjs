import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, unlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { retainedVisualPlan } from './retained-visual-plan.mjs';

test('approved visual cases cannot silently disappear or grow from files alone', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'mdesign-visual-plan-'));
  try {
    const directory = path.join(root, 'src/browser/__screenshots__/kit.vrt.test.tsx');
    mkdirSync(directory, { recursive: true });
    const filename = 'Button-light-1-chromium-darwin.png';
    writeFileSync(
      path.join(root, 'src/browser/visual-baselines.json'),
      JSON.stringify({ schemaVersion: 1, files: [filename] }),
    );
    writeFileSync(path.join(directory, filename), 'fixture');
    assert.deepEqual(retainedVisualPlan(root).names, [
      'Button light',
      'compact comparator rejects removal of a real24px icon',
    ]);
    unlinkSync(path.join(directory, filename));
    assert.throws(() => retainedVisualPlan(root), /Missing: Button/);
    writeFileSync(path.join(directory, filename), 'fixture');
    writeFileSync(path.join(directory, 'Other-1-chromium-darwin.png'), 'unapproved');
    assert.throws(() => retainedVisualPlan(root), /unlisted: Other/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
