import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compileTokens, generateTokens } from './generate-tokens.mjs';

const source = JSON.parse(
  await readFile(new URL('../src/kit/tokens.json', import.meta.url), 'utf8'),
);

test('generates deterministic context-specific values without merging platform palettes', () => {
  const first = compileTokens(source);
  assert.deepEqual(compileTokens(structuredClone(source)), first);
  assert.match(
    first.outputs['generated/base-tokens.css'],
    /--m-brand:var\(--m-brand-light,#0452a8\)/,
  );
  assert.match(
    first.outputs['generated/base-tokens.css'],
    /--m-brand:light-dark\(#165ef8,#4ba5ff\)/,
  );
  assert.match(
    first.outputs['generated/component-tokens.css'],
    /--m-prime-brand:light-dark\(#0452a8,#5094df\)/,
  );
  assert.match(first.outputs['generated/landing-tokens.css'], /--m-brand:#004a93/);
  assert.match(first.outputs['generated/base-tokens.css'], /--m-radius:16px/);
  assert.match(first.outputs['generated/base-tokens.css'], /--m-button-radius:4px/);
});

test('a canonical token update reaches all of its CSS aliases and keeps landing separate', () => {
  const changed = structuredClone(source);
  changed.color.brand.$value = '#123456';
  const { outputs } = compileTokens(changed);
  assert.match(outputs['generated/base-tokens.css'], /--m-brand-light:#123456/);
  assert.match(outputs['generated/base-tokens.css'], /--m-focus:#123456/);
  assert.match(
    outputs['generated/component-tokens.css'],
    /--m-prime-brand:light-dark\(#123456,#5094df\)/,
  );
  assert.doesNotMatch(outputs['generated/landing-tokens.css'], /123456/);
});

test('selected mobile filter text meets normal-text contrast without changing the wallet brand', () => {
  const css = compileTokens(source).outputs['generated/base-tokens.css'];
  const binding = css.match(/--m-mobile-filter-text:light-dark\((#[a-f0-9]+),(#[a-f0-9]+)\)/);
  assert.ok(binding, 'Expected the dedicated filter text role');
  const luminance = (hex) => {
    const channels = [1, 3, 5]
      .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const contrast = (foreground, background) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  assert.ok(contrast(binding[1], source.mobile.secondary.$value) >= 4.5);
  assert.ok(contrast(binding[2], source.semantic.web.dark.brandSoft.$value) >= 4.5);
  assert.equal(source.mobile.brand.$value, '#165ef8');
});

test('exports typed DTCG groups, sRGB color objects and portable aliases without provenance or CSS recipes', () => {
  const dtcg = JSON.parse(compileTokens(source).outputs['tokens.dtcg.json']);
  assert.equal(dtcg.meta, undefined);
  assert.equal(dtcg.css, undefined);
  assert.equal(dtcg.mobile.source, undefined);
  assert.deepEqual(dtcg.color.brand.$value, {
    colorSpace: 'srgb',
    components: [4 / 255, 82 / 255, 168 / 255],
    alpha: 1,
  });
  assert.equal(dtcg.semantic.web.base.brandLight.$value, '{color.brand}');
  assert.deepEqual(dtcg.semantic.web.base.font.$value, ['Open Sans', 'Arial', 'sans-serif']);
  assert.deepEqual(dtcg.semantic.mobile.base.radius.$value, { value: 16, unit: 'px' });
  assert.equal(dtcg.semantic.mobile.shadows.nativeShadow.$type, 'shadow');
  assert.equal(dtcg.semantic.mobile.shadows.nativeShadow.$value[0].color.alpha, 0.02);
});

test('rejects dangling aliases, circular aliases, mismatched alias types and unresolved CSS references', () => {
  const dangling = structuredClone(source);
  dangling.color.brand.$value = '{does.not.exist}';
  assert.throws(() => compileTokens(dangling), /Unknown token reference/);
  const circular = structuredClone(source);
  circular.color.brand.$value = '{color.brandHover}';
  circular.color.brandHover.$value = '{color.brand}';
  assert.throws(() => compileTokens(circular), /Circular token alias/);
  const mismatch = structuredClone(source);
  mismatch.color.brand.$value = '{mobile.cardRadius}';
  assert.throws(() => compileTokens(mismatch), /Alias type mismatch/);
  const css = structuredClone(source);
  css.css.files['base-tokens.css'][0].declarations[0][1] = '{does.not.exist}';
  assert.throws(() => compileTokens(css), /Unknown token reference/);
});

test('rejects malformed typed values and unsafe or unknown CSS bindings', () => {
  const dimension = structuredClone(source);
  dimension.semantic.web.base.radius.$value.unit = 'pt';
  assert.throws(() => compileTokens(dimension), /Invalid dimension/);
  const color = structuredClone(source);
  color.color.brand.$value = '#oops';
  assert.throws(() => compileTokens(color), /Invalid sRGB color/);
  const declaration = structuredClone(source);
  declaration.css.files['base-tokens.css'][0].declarations[0][1] = 'red;display:none';
  assert.throws(() => compileTokens(declaration), /Invalid CSS binding/);
  const name = structuredClone(source);
  name.semantic['bad.name'] = { $type: 'color', $value: '#fff' };
  assert.throws(() => compileTokens(name), /Invalid token name/);
  const missing = structuredClone(source);
  delete missing.css.files['base-tokens.css'];
  assert.throws(() => compileTokens(missing), /Missing CSS output/);
});

test('check mode detects source/output drift, never mutates files, and generation repairs exactly that drift', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mdesign-tokens-'));
  try {
    const sourcePath = join(directory, 'source.json');
    await writeFile(sourcePath, JSON.stringify(source));
    const options = { sourcePath, outputDirectory: directory };
    const missing = await generateTokens({ ...options, check: true });
    assert.equal(missing.drift.length, 5);
    await assert.rejects(readFile(join(directory, 'tokens.dtcg.json')), { code: 'ENOENT' });
    await generateTokens(options);
    assert.deepEqual((await generateTokens({ ...options, check: true })).drift, []);
    const cssPath = join(directory, 'generated/base-tokens.css');
    const original = await readFile(cssPath, 'utf8');
    await writeFile(cssPath, original + '/* drift */\n');
    assert.deepEqual((await generateTokens({ ...options, check: true })).drift, [
      'generated/base-tokens.css',
    ]);
    assert.equal(await readFile(cssPath, 'utf8'), original + '/* drift */\n');
    assert.throws(
      () =>
        execFileSync(
          process.execPath,
          [
            fileURLToPath(new URL('./generate-tokens.mjs', import.meta.url)),
            '--source',
            sourcePath,
            '--out-dir',
            directory,
            '--check',
          ],
          { stdio: 'pipe' },
        ),
      (error) =>
        error.status === 1 &&
        error.stderr.toString().includes('Token output drift: generated/base-tokens.css'),
    );
    assert.equal(await readFile(cssPath, 'utf8'), original + '/* drift */\n');
    await generateTokens(options);
    assert.equal(await readFile(cssPath, 'utf8'), original);
    const changed = structuredClone(source);
    changed.semantic.web.base.radius.$value.value = 9;
    await writeFile(sourcePath, JSON.stringify(changed));
    assert.ok(
      (await generateTokens({ ...options, check: true })).drift.includes(
        'generated/base-tokens.css',
      ),
    );
    assert.equal(await readFile(cssPath, 'utf8'), original);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
