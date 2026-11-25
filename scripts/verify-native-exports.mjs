import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
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
  return entry;
});

const browser = await chromium.launch();
const results = [];
let nextStory = 0;
try {
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        reducedMotion: 'reduce',
        permissions: ['clipboard-write'],
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
              await tools.getByRole('button', { name: 'Kopiuj kod React Native' }).click();
              const source = await tools
                .getByRole('textbox', { name: 'Wygenerowany kod React Native' })
                .inputValue();

              assert(source.includes("from 'react-native'"), 'Missing React Native import');
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
              results.push({ id: story.id, platform, status: 'pass' });
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

results.sort((a, b) => a.id.localeCompare(b.id) || a.platform.localeCompare(b.platform));
if (process.argv[3]) await writeFile(process.argv[3], JSON.stringify(results, null, 2) + '\n');
const failures = results.filter(({ status }) => status === 'fail');
for (const failure of failures) {
  console.error(
    `${failure.id} (${failure.platform}): ${failure.error}\n${failure.feedback.join('\n')}`,
  );
}
console.log(
  `React Native TSX exports: ${results.length - failures.length}/${stories.length * 2} passed.`,
);
process.exitCode = failures.length ? 1 : 0;
