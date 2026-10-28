#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : args[at + 1];
};
if (args.includes('--help') || !option('--consumer')) {
  console.log(
    'Usage: node scripts/check-bundle-size.mjs --consumer /tmp/installed-consumer [--report path/bundle-size.json]',
  );
  process.exit(args.includes('--help') ? 0 : 2);
}
const consumer = await fs.realpath(path.resolve(option('--consumer')));
const require = createRequire(path.join(consumer, 'package.json'));
const vitePackage = require.resolve('vite/package.json');
const { build } = await import(
  pathToFileURL(path.join(path.dirname(vitePackage), 'dist/node/index.js'))
);
const packageRoot = await fs.realpath(path.join(consumer, 'node_modules/@mdesign/react'));
const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8'));
const reportPath = path.resolve(
  option('--report', `artifacts/verification-${packageJson.version}/bundle-size.json`),
);
const cases = [
  {
    id: 'coreButton',
    specifier: '@mdesign/react',
    component: 'Button',
    budgetGzipBytes: 40 * 1024,
  },
  {
    id: 'portalCard',
    specifier: '@mdesign/react/portal',
    component: 'PortalCard',
    budgetGzipBytes: 70 * 1024,
  },
  {
    id: 'portalCardRoot',
    specifier: '@mdesign/react',
    component: 'PortalCard',
    budgetGzipBytes: 70 * 1024,
  },
  { id: 'landingButton', specifier: '@mdesign/react/landing', component: 'LandingButton' },
];
const records = [];
for (const item of cases) {
  const directory = path.join(consumer, 'bundle-budget', item.id);
  await fs.mkdir(directory, { recursive: true });
  const entry = path.join(directory, 'entry.js');
  await fs.writeFile(
    entry,
    `import { ${item.component} } from ${JSON.stringify(item.specifier)}; globalThis.__mdesign_budget_component = ${item.component};\n`,
  );
  const modules = [];
  const result = await build({
    configFile: false,
    root: consumer,
    publicDir: false,
    logLevel: 'error',
    plugins: [
      {
        name: 'record-size-gate-modules',
        generateBundle(_options, bundle) {
          for (const output of Object.values(bundle))
            if (output.type === 'chunk') {
              for (const [id, module] of Object.entries(output.modules))
                if (module.renderedLength > 0)
                  modules.push({ id, renderedLength: module.renderedLength });
            }
        },
      },
    ],
    build: {
      outDir: path.join(directory, 'dist'),
      emptyOutDir: true,
      target: 'es2022',
      minify: 'esbuild',
      reportCompressedSize: false,
      rollupOptions: { input: entry, external: (id) => /^(react|react-dom)(\/|$)/.test(id) },
    },
  });
  const files = [];
  for (const output of Array.isArray(result) ? result : [result])
    for (const file of output.output) {
      const bytes = Buffer.from(file.type === 'chunk' ? file.code : file.source);
      files.push({
        file: file.fileName,
        kind:
          file.type === 'chunk'
            ? 'javascript'
            : path.extname(file.fileName) === '.css'
              ? 'css'
              : 'asset',
        bytes: bytes.length,
        gzipBytes: gzipSync(bytes).length,
      });
    }
  const javascript = files.filter((file) => file.kind === 'javascript');
  const gzipBytes = javascript.reduce((sum, file) => sum + file.gzipBytes, 0);
  const bytes = javascript.reduce((sum, file) => sum + file.bytes, 0);
  records.push({
    ...item,
    bytes,
    gzipBytes,
    passed: item.budgetGzipBytes === undefined || gzipBytes <= item.budgetGzipBytes,
    files,
    largestModules: modules.sort((a, b) => b.renderedLength - a.renderedLength).slice(0, 12),
  });
}
const stylesheetExport = packageJson.exports['./styles.css'];
const cssTarget =
  typeof stylesheetExport === 'string'
    ? stylesheetExport
    : (stylesheetExport?.import ?? stylesheetExport?.default);
if (typeof cssTarget !== 'string') throw new Error('Package has no concrete styles.css export');
const css = await fs.readFile(path.join(packageRoot, cssTarget));
const cssResult = {
  bytes: css.length,
  gzipBytes: gzipSync(css).length,
  budgetGzipBytes: 72 * 1024,
  scope:
    'Complete shared stylesheet for core/mobile, portal and landing; separately emitted font files are excluded.',
  budgetCalibration:
    '72 KiB approved against the external-font baseline of 65,933 gzip bytes (approximately 12% headroom); the earlier 60 KiB estimate was below this measured three-system baseline.',
};
cssResult.passed = cssResult.gzipBytes <= cssResult.budgetGzipBytes;
const fontFiles = new Set();
for (const match of css
  .toString('utf8')
  .matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g)) {
  const url = (match[1] ?? match[2] ?? match[3]).trim();
  if (/\.(?:ttf|otf|woff2?)(?:[?#]|$)/i.test(url) && !/^(?:data:|https?:|\/\/)/.test(url))
    fontFiles.add(
      path.resolve(packageRoot, path.dirname(cssTarget), decodeURIComponent(url.split(/[?#]/)[0])),
    );
}
const fonts = [];
for (const file of fontFiles) {
  const bytes = await fs.readFile(file);
  fonts.push({
    file: path.relative(packageRoot, file),
    bytes: bytes.length,
    gzipBytes: gzipSync(bytes).length,
  });
}
const fontResult = {
  fontFaceDeclarations: (css.toString('utf8').match(/@font-face/g) ?? []).length,
  files: fonts,
  totalBytes: fonts.reduce((sum, font) => sum + font.bytes, 0),
  gzipBytes: fonts.reduce((sum, font) => sum + font.gzipBytes, 0),
  inlineFontDataUris: (
    css.toString('utf8').match(/data:(?:font\/|application\/(?:x-font|font|octet-stream))/g) ?? []
  ).length,
  scope:
    'Separately cacheable font resources declared by the complete stylesheet. Browsers fetch the faces required for rendered text; these byte counts are not an assertion that all fonts load on every page.',
};
const report = {
  schemaVersion: 1,
  version: packageJson.version,
  checkedAt: new Date().toISOString(),
  consumer,
  packageRoot,
  method:
    'Production Vite/esbuild ES2022 bundles from the installed package. JS figures include reachable kit and non-peer dependencies, with React/ReactDOM peer imports external. Gzip bytes sum independently compressed emitted JS chunks. Full shared CSS is measured separately; fonts/images are assets, not stylesheet bytes. This is incremental library cost, not the full React application runtime.',
  passed:
    records.every((record) => record.passed) &&
    cssResult.passed &&
    fontResult.inlineFontDataUris === 0,
  records,
  css: cssResult,
  fonts: fontResult,
};
await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(
  JSON.stringify(
    { ...report, records: records.map((record) => ({ ...record, largestModules: undefined })) },
    null,
    2,
  ),
);
if (!report.passed) process.exitCode = 1;
