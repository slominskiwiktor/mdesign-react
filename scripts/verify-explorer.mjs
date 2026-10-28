import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, expect } from 'playwright/test';
import ts from 'typescript';

const base = `${(process.argv[2] ?? 'http://127.0.0.1:4173').replace(/\/$/, '')}/`;
const url = (path) => new URL(path.replace(/^\//, ''), base).href;
const packageMetadata = JSON.parse(await readFile('package.json', 'utf8'));
const directory = resolve(
  process.argv[3] ?? `artifacts/verification-${packageMetadata.version}/explorer`,
);
await mkdir(directory, { recursive: true });
const manifest = JSON.parse(await readFile('src/catalog/component-manifest.json', 'utf8'));
const report = {
  version: packageMetadata.version,
  url: base,
  date: new Date().toISOString(),
  checks: [],
  errors: [],
  status: 'running',
};
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ['clipboard-read', 'clipboard-write'],
  reducedMotion: 'reduce',
});
const page = await context.newPage();
page.setDefaultTimeout(30000);
page.on('pageerror', (error) => report.errors.push(error.message));
const pass = (name) => report.checks.push({ name, status: 'pass' });
const frame = () => page.frameLocator('#storybook-preview-iframe');
const preview = () => page.frames().find((candidate) => candidate.url().includes('/iframe.html'));
try {
  const response = await context.request.get(url('/index.json'));
  assert(response.ok());
  const index = await response.json();
  const entries = Object.values(index.entries);
  for (const component of manifest.components) {
    const id = `${component.category}-${component.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
    // Stable IDs are explicitly generated; match the public component by title.
    const matches = entries.filter((entry) => entry.title?.split('/').at(-1) === component.name);
    assert(
      matches.some((entry) => entry.type === 'docs'),
      `${id}: missing docs`,
    );
    assert(
      matches.some((entry) => entry.type === 'story' && entry.name === 'Default'),
      `${id}: missing default`,
    );
  }
  assert(!entries.some((entry) => /PortalIdentity(?:Card|Document)/.test(entry.title)));
  pass(
    `Index: ${manifest.components.length} components have individual docs and runnable defaults`,
  );

  await page.goto(url('/?path=/story/core-button--default'));
  await frame().getByRole('button', { name: 'Zapisz zmiany', exact: true }).waitFor();
  await page.getByRole('tab', { name: /^Actions/ }).click();
  await page.waitForFunction(() =>
    document
      .querySelector('[role="tabpanel"][id$="-tabpanel-storybook/actions/panel"]')
      ?.textContent?.includes('onClick:'),
  );
  pass('The real manager Actions panel receives the native Button click from its play function');
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const editedText = 'Wyślij "wniosek" {A} > 0 & pomoc';
  await page.locator('#control-children').fill(editedText);
  await page.locator('#control-variant').selectOption('secondary');
  await frame().getByRole('button', { name: editedText, exact: true }).waitFor();
  await expect(frame().getByRole('button', { name: editedText })).toHaveClass(
    /m-button--secondary/,
  );
  pass('Actual Controls update the rendered text and variant');

  await page.getByRole('tab', { name: 'Code', exact: true }).click();
  const sourcePanel = page.getByRole('tabpanel').filter({
    has: page.getByRole('button', { name: 'Copy', exact: true }),
  });
  // The manager receives source updates from the preview asynchronously.
  await expect(sourcePanel).toContainText('variant="secondary"', { timeout: 15000 });
  await expect(sourcePanel).toContainText(JSON.stringify(editedText));
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  const code = await page.evaluate(() => navigator.clipboard.readText());
  assert.match(code, /import \{ Button \} from '@mdesign\/react'/);
  assert.match(code, /import '@mdesign\/react\/styles.css'/);
  assert.match(code, /variant="secondary"/);
  assert(code.includes(JSON.stringify(editedText)));
  const parsedCode = ts.createSourceFile(
    'Copied.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  assert.deepEqual(
    parsedCode.parseDiagnostics,
    [],
    'Quoted, braced and angle text must remain valid TSX',
  );
  assert(
    !code.includes('onChange='),
    'Button source must not contain an unrelated change callback',
  );
  pass('Copy returns complete code matching the edited preview');

  await page.getByRole('button', { name: 'Ciemny motyw dokumentacji', exact: true }).click();
  await page.getByRole('button', { name: 'Jasny motyw dokumentacji', exact: true }).waitFor();
  assert.equal(await frame().locator('.md-story-surface').getAttribute('data-theme'), 'light');
  assert.equal(await page.evaluate(() => localStorage.getItem('mdesign-docs-theme')), 'dark');
  pass('Documentation theme changes without changing the component theme');
  await page.getByRole('button', { name: /Motyw podglądu,/ }).click();
  await page.getByText('Ciemny komponent', { exact: true }).click();
  await frame().locator('.md-story-surface[data-theme="dark"]').waitFor();
  pass('Component theme changes independently through the toolbar');

  await page.getByRole('button', { name: 'Viewport size', exact: true }).click();
  await page.getByText('Mobile · 375 × 812', { exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector('#storybook-preview-iframe')?.contentWindow?.innerWidth === 375,
  );
  assert.equal(await preview().evaluate(() => innerWidth), 375);
  pass('Viewport creates a real 375px iframe');
  await page.screenshot({ path: resolve(directory, 'controls-dark-mobile.png') });

  await page.goto(url('/?path=/docs/core-button--docs'));
  await frame().getByRole('heading', { name: 'Button', exact: true }).waitFor();
  assert.match(await frame().locator('body').innerText(), /Klawiatura:/);
  await frame().locator('select[id$="-variant"]').waitFor();
  await frame().getByRole('button', { name: 'Zapisz zmiany', exact: true }).first().waitFor();
  await page.screenshot({ path: resolve(directory, 'autodocs.png') });
  pass('Direct docs link opens API, keyboard guidance and Controls');

  await page.locator('#storybook-explorer-searchfield').fill('PortalDatePicker');
  await page.getByText('PortalDatePicker', { exact: true }).first().waitFor();
  pass('Search finds a desktop component');
  await page.goto(url('/?path=/story/mobile-bottom-sheet--default'));
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('#control-state').selectOption('expanded');
  await frame().getByRole('dialog', { name: 'Wybierz działanie' }).waitFor();
  await page.getByRole('tab', { name: 'Code', exact: true }).click();
  const sheetSource = page.getByRole('tabpanel').filter({
    has: page.getByRole('button', { name: 'Copy', exact: true }),
  });
  await expect(sheetSource).toContainText('ComponentProps<typeof BottomSheet>');
  await expect(sheetSource).toContainText('state={state}');
  pass('BottomSheet Controls open the real sheet and emit its typed controlled state');

  await page.goto(url('/?path=/story/landing-landing-social-banner--default'));
  await frame().getByRole('heading', { name: 'Twórz z nami lepsze interfejsy' }).waitFor();
  await expect(
    frame().getByRole('img', { name: 'Połączone karty rozmów, pomysłów i aktualności' }),
  ).toBeVisible();
  for (const label of ['Kod projektu', 'Zgłoś pomysł', 'Historia zmian'])
    await expect(frame().getByRole('link', { name: new RegExp(label) })).toBeVisible();
  await expect(frame().getByText(/Poznaj nowe komponenty/)).toBeVisible();
  await page.screenshot({ path: resolve(directory, 'social-banner.png') });
  pass('Social banner includes its description, illustration and three working project links');

  await page.goto(
    url('/?path=/story/mobile-page-indicator--default&args=count:10000000;page:5000000'),
  );
  const indicators = frame().locator('.m-mobile-page-indicator');
  await indicators.waitFor();
  assert((await indicators.locator(':scope > *').count()) <= 7);
  pass('A large URL count keeps PageIndicator rendering bounded');

  await page.goto(url('/showcase/#screens'));
  await page
    .getByRole('heading', { name: /Przykładowe ekrany/ })
    .first()
    .waitFor();
  const versions = await page.locator('.version, .sidebar-version').allTextContents();
  assert.equal(versions.length, 2);
  assert(versions.every((version) => version.trim() === `v${packageMetadata.version}`));
  pass('Example screens load and all version labels match package metadata');
  assert.deepEqual(report.errors, [], 'Uncaught browser exceptions');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = error.stack ?? String(error);
  await page.screenshot({ path: resolve(directory, 'failure.png') }).catch(() => {});
  process.exitCode = 1;
} finally {
  await writeFile(resolve(directory, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
