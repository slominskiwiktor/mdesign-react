import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { artifactCopies, buildArtifacts, stripDeclarationCssImports } from './build-artifacts.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mdesign-artifacts-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const output = path.join(root, 'dist/lib');
  await fs.mkdir(output, { recursive: true });
  await fs.writeFile(path.join(output, 'index.js'), 'export {};\n');
  await fs.writeFile(
    path.join(output, 'index.d.ts'),
    'import "./components.css";\nexport { type Props } from "./control.js";\n',
  );
  await fs.writeFile(path.join(output, 'control.d.ts'), 'export interface Props { id?: string }\n');
  for (const [filename] of artifactCopies) {
    const file = path.join(root, filename);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `unaltered:${filename}\n`);
  }
  await fs.mkdir(path.join(root, 'src/kit/licenses'), { recursive: true });
  await fs.writeFile(path.join(root, 'src/kit/licenses/NOTICE.txt'), 'License bytes\r\n');
  await fs.writeFile(path.join(root, 'src/kit/licenses/not-a-license.json'), '{}');
  return { root, output };
}

test('declaration cleanup preserves typed imports, module names and source comments', () => {
  const input = `// Retain source notice.\nimport './plain.css';\nimport type styles from './typed.css';\nimport { css } from './css.js';\nimport 'third-party.css';\nexport type Sample = typeof css;\n`;
  const result = stripDeclarationCssImports(input);
  assert.deepEqual(result.removed, ['./plain.css']);
  assert.equal(result.text, input.replace("import './plain.css';", ''));
});

test('postbuild copies notices byte for byte and publishes a stylesheet type entry', async (t) => {
  const { root, output } = await fixture(t);
  const result = await buildArtifacts({ projectRoot: root });
  for (const [source, target] of artifactCopies)
    assert.deepEqual(
      await fs.readFile(path.join(output, target)),
      await fs.readFile(path.join(root, source)),
    );
  assert.equal(
    await fs.readFile(path.join(output, 'licenses/NOTICE.txt'), 'utf8'),
    'License bytes\r\n',
  );
  assert.deepEqual(await fs.readdir(path.join(output, 'licenses')), ['NOTICE.txt']);
  assert.deepEqual(result.strippedCssImports, [
    { file: 'index.d.ts', specifier: './components.css' },
  ]);
  assert.match(
    await fs.readFile(path.join(output, 'index.d.ts'), 'utf8'),
    /from "\.\/control\.js"/,
  );
  assert.equal(
    (await fs.readFile(path.join(output, 'index.d.ts'), 'utf8')).includes('components.css'),
    false,
  );
  assert.match(await fs.readFile(path.join(output, 'styles.d.ts'), 'utf8'), /export \{\};/);
  assert.deepEqual((await buildArtifacts({ projectRoot: root })).strippedCssImports, []);
});

test('postbuild rejects absent compiled declarations and missing mandatory notices', async (t) => {
  const { root, output } = await fixture(t);
  await fs.unlink(path.join(output, 'index.d.ts'));
  await assert.rejects(buildArtifacts({ projectRoot: root }), /index\.d\.ts/);
  await assert.rejects(fs.stat(path.join(output, 'tokens.json')), { code: 'ENOENT' });
  await fs.writeFile(path.join(output, 'index.d.ts'), 'export {};\n');
  await fs.unlink(path.join(root, 'src/kit/fonts/OFL-OpenSans.txt'));
  await assert.rejects(buildArtifacts({ projectRoot: root }), /OFL-OpenSans\.txt/);
  await assert.rejects(fs.stat(path.join(output, 'tokens.json')), { code: 'ENOENT' });
});

test('postbuild fails on dangling declarations instead of deleting typed imports', async (t) => {
  const { root, output } = await fixture(t);
  const text = 'import type styles from "./typed.css";\nexport type Props = typeof styles;\n';
  await fs.writeFile(path.join(output, 'index.d.ts'), text);
  await assert.rejects(
    buildArtifacts({ projectRoot: root }),
    /unresolved declaration import \.\/typed\.css/,
  );
  assert.equal(await fs.readFile(path.join(output, 'index.d.ts'), 'utf8'), text);
  await fs.writeFile(path.join(output, 'index.d.ts'), 'export { Missing } from "./missing.js";\n');
  await assert.rejects(
    buildArtifacts({ projectRoot: root }),
    /unresolved declaration import \.\/missing\.js/,
  );
});
