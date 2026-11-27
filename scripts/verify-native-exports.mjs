import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import ts from 'typescript';

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:4173/');
if (!base.pathname.endsWith('/')) base.pathname += '/';
const manifest = JSON.parse(
  await readFile(new URL('../src/catalog/component-manifest.json', import.meta.url), 'utf8'),
);
const response = await fetch(new URL('index.json', base));
assert(response.ok, `Cannot read Storybook index: ${response.status}`);
const { entries } = await response.json();
const defaults = Object.values(entries).filter(
  (entry) => entry.type === 'story' && entry.name === 'Default',
);
const stories = manifest.components.map(({ name }) => {
  const entry = defaults.find((story) => story.title.split('/').at(-1) === name);
  assert(entry, `Missing default story for ${name}`);
  assert(/^[a-z0-9-]+$/.test(entry.id), `Unexpected story ID for ${name}`);
  return entry;
});

const typecheckRoot = process.argv[4] ? resolve(process.argv[4]) : undefined;
const examples = new Map();
const nativeVersion = typecheckRoot
  ? JSON.parse(
      await readFile(resolve(typecheckRoot, 'node_modules/react-native/package.json'), 'utf8'),
    ).version
  : undefined;

const browser = await chromium.launch();
const results = [];
let nextStory = 0;
let clipboardQueue = Promise.resolve();

function useClipboard(check) {
  const next = clipboardQueue.then(check);
  clipboardQueue = next.catch(() => {});
  return next;
}
try {
  await Promise.all(
    Array.from({ length: 2 }, async () => {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        reducedMotion: 'reduce',
        permissions: ['clipboard-read', 'clipboard-write'],
      });
      page.setDefaultTimeout(15000);
      try {
        while (nextStory < stories.length) {
          const story = stories[nextStory++];
          const iframe = new URL('iframe.html', base);
          iframe.search = new URLSearchParams({ id: story.id, viewMode: 'story' });
          for (const platform of ['ios', 'android']) {
            try {
              iframe.searchParams.set('globals', `nativePlatform:${platform}`);
              await page.goto(iframe.href, { waitUntil: 'domcontentloaded' });
              const tools = page.locator('details.md-native-preview-tools');
              await tools.locator('summary').click();
              const selector = tools.getByLabel('System podglądu');
              if ((await selector.inputValue()) !== platform) await selector.selectOption(platform);
              await page
                .locator(`[data-native-preview-content][data-mobile-os="${platform}"]`)
                .waitFor();
              const source = await useClipboard(async () => {
                await tools.getByRole('button', { name: 'Kopiuj kod React Native' }).click();
                const code = await tools
                  .getByRole('textbox', { name: 'Wygenerowany kod React Native' })
                  .inputValue();
                const copied = await page.evaluate(() => navigator.clipboard.readText());
                assert.equal(copied, code, 'Clipboard content differs from generated code');
                return code;
              });

              assert(source.includes("from 'react-native'"), 'Missing React Native import');
              if (
                [
                  'mobile-icon-surface--default',
                  'landing-landing-download-panel--default',
                ].includes(story.id)
              ) {
                assert.match(source, /data:image\/png;base64,iVBORw0KGgo/, 'Missing embedded PNG');
              }
              assert(source.includes('export default'), 'Missing example component');
              const diagnostics = ts.transpileModule(source, {
                fileName: 'Example.tsx',
                compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
                reportDiagnostics: true,
              }).diagnostics;
              assert.equal(
                diagnostics.length,
                0,
                diagnostics
                  .map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n'))
                  .join('\n'),
              );
              const result = {
                id: story.id,
                platform,
                status: 'pass',
                exportKind: source.includes('export default function ComponentExample(')
                  ? 'dom-conversion'
                  : 'component-example',
              };
              if (typecheckRoot) {
                const file = resolve(typecheckRoot, `${story.id}-${platform}.tsx`);
                await writeFile(file, source);
                examples.set(file, result);
              }
              results.push(result);
            } catch (error) {
              const feedback = await page
                .locator('details.md-native-preview-tools [role=status]')
                .allTextContents()
                .catch(() => []);
              results.push({
                id: story.id,
                platform,
                status: 'fail',
                error: error.message,
                feedback,
              });
            }
          }
        }
      } finally {
        await page.close();
      }
    }),
  );
} finally {
  await browser.close();
}

if (typecheckRoot) {
  const program = ts.createProgram([...examples.keys()], {
    allowSyntheticDefaultImports: true,
    jsx: ts.JsxEmit.ReactJSX,
    lib: ['lib.esnext.d.ts'],
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
    types: ['react'],
    typeRoots: [
      resolve(typecheckRoot, 'node_modules/@types'),
      resolve(typecheckRoot, 'node_modules'),
    ],
  });
  const globalIssues = [];
  for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
    const result = diagnostic.file && examples.get(diagnostic.file.fileName);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    if (result) {
      result.status = 'fail';
      result.error = [result.error, message].filter(Boolean).join('\n');
      result.feedback = [];
    } else {
      globalIssues.push(message);
    }
  }
  assert.equal(globalIssues.length, 0, globalIssues.join('\n'));
}

results.sort((a, b) => a.id.localeCompare(b.id) || a.platform.localeCompare(b.platform));
if (process.argv[3]) await writeFile(process.argv[3], JSON.stringify(results, null, 2) + '\n');
const failures = results.filter(({ status }) => status === 'fail');
for (const failure of failures) {
  console.error(
    `${failure.id} (${failure.platform}): ${failure.error}\n${failure.feedback.join('\n')}`,
  );
}
console.log(
  `React Native ${nativeVersion ? `${nativeVersion} type-checked` : 'TSX'} exports: ${results.length - failures.length}/${stories.length * 2} passed.`,
);
const converted = results.filter(({ exportKind }) => exportKind === 'dom-conversion').length;
const dedicated = results.filter(({ exportKind }) => exportKind === 'component-example').length;
console.log(
  `Verified clipboard exports: ${dedicated} component examples, ${converted} DOM conversions.`,
);
process.exitCode = failures.length ? 1 : 0;
