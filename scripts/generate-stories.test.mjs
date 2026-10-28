import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const button = {
  name: 'Button',
  category: 'core',
  props: [
    { name: 'disabled', type: 'boolean' },
    { name: '__proto__', type: 'string' },
  ],
};

function fixture(t, components = [button]) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'mdesign-story-generator-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of [
    'scripts',
    'src/catalog',
    'src/kit',
    'src/stories/core',
    'src/stories/mobile',
    'src/stories/portal',
    'src/stories/landing',
  ])
    mkdirSync(path.join(root, directory), { recursive: true });
  for (const file of ['generate-stories.mjs', 'api-descriptions.mjs'])
    copyFileSync(path.join(project, 'scripts', file), path.join(root, 'scripts', file));
  symlinkSync(path.join(project, 'node_modules'), path.join(root, 'node_modules'), 'junction');
  writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', types: [] } }),
  );
  writeFileSync(
    path.join(root, 'src/kit/index.ts'),
    `export function Button(
      { disabled = false, '__proto__': metadata = 'demo' }:
      { disabled?: boolean; '__proto__'?: string }
    ) { return disabled ? '' : metadata; }
    export { Button as __proto__, Button as constructor };
    `,
  );
  writeFileSync(
    path.join(root, 'src/catalog/component-manifest.json'),
    JSON.stringify({ version: 'fixture', components }),
  );
  const run = () =>
    spawnSync(process.execPath, [path.join(root, 'scripts/generate-stories.mjs')], {
      cwd: root,
      encoding: 'utf8',
    });
  return { root, run };
}

test('story generation retains prototype-named prop metadata as ordinary JSON data', (t) => {
  const { root, run } = fixture(t);
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  const metadata = JSON.parse(readFileSync(path.join(root, 'src/stories/api-props.json'), 'utf8'));
  assert.equal(Object.hasOwn(metadata.defaults.Button, '__proto__'), true);
  assert.equal(metadata.defaults.Button.__proto__.expression, "'demo'");
  assert.equal(metadata.defaults.Button.disabled.expression, 'false');
  assert.equal(existsSync(path.join(root, 'src/stories/core/Button.stories.tsx')), true);
});

test('invalid component namespaces fail before generating output', async (t) => {
  for (const [components, message] of [
    [[{ ...button, name: '__proto__' }], /Invalid public component name/],
    [[{ ...button, name: 'constructor' }], /Invalid public component name/],
    [[{ ...button, name: '../Outside' }], /Invalid public component name/],
    [[{ ...button, category: 'constructor' }], /Invalid component category/],
    [[{ ...button, category: '../outside' }], /Invalid component category/],
    [[button, button], /Duplicate component/],
    [[{ ...button, name: 'UnknownComponent' }], /Unknown public component/],
  ])
    await t.test(String(message), (context) => {
      const { root, run } = fixture(context, components);
      const result = run();
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, message);
      assert.equal(existsSync(path.join(root, 'src/stories/api-props.json')), false);
      assert.equal(existsSync(path.join(root, 'src/stories/core/Button.stories.tsx')), false);
      assert.equal(existsSync(path.join(root, 'src/stories/coverage.json')), false);
    });
});
