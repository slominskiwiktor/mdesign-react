#!/usr/bin/env node
/** Verify a frozen TGZ; this script never builds or packs the workspace library. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { brokenDocumentationLinks } from './documentation-links.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspacePackage = JSON.parse(await fs.readFile(path.join(project, 'package.json'), 'utf8'));
const defaultArchive = path.join(
  project,
  'artifacts/current',
  `${workspacePackage.name.replace(/^@/, '').replaceAll('/', '-')}-${workspacePackage.version}.tgz`,
);
const defaultReport = path.join(
  project,
  `artifacts/current/verification-${workspacePackage.version}/package.json`,
);
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(
    'Usage: node scripts/verify-package.mjs [path/package.tgz] [--offline] [--report path/report.json] [--workdir /tmp/parent-directory] [--react18 18.3.1] [--react19 19.3.1]',
  );
  console.log(`Default archive: ${defaultArchive}\nDefault report: ${defaultReport}`);
  process.exit(0);
}
const valuedOptions = new Set(['--report', '--workdir', '--react18', '--react19']);
const options = new Map();
let archiveArgument;
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--offline') continue;
  if (valuedOptions.has(args[index])) {
    if (!args[index + 1] || args[index + 1].startsWith('--'))
      throw new Error(`Incomplete option: ${args[index]}`);
    if (options.has(args[index])) throw new Error(`Duplicate option: ${args[index]}`);
    options.set(args[index], args[index + 1]);
    index++;
  } else {
    if (args[index].startsWith('--')) throw new Error(`Unknown option: ${args[index]}`);
    if (archiveArgument) throw new Error('Only one frozen TGZ path may be supplied');
    archiveArgument = args[index];
  }
}
const option = (name, fallback) => options.get(name) ?? fallback;
const tgz = await fs.realpath(path.resolve(archiveArgument ?? defaultArchive));
const reportPath = path.resolve(option('--report', defaultReport));
const temporaryParent = path.resolve(option('--workdir', os.tmpdir()));
if (temporaryParent === project || temporaryParent.startsWith(project + path.sep))
  throw new Error(
    'Consumer workdir must be outside the project; node_modules are never created in the repository.',
  );
await fs.mkdir(temporaryParent, { recursive: true });
const workdir = await fs.mkdtemp(path.join(temporaryParent, 'mdesign-release-'));
const logs = path.join(workdir, 'logs');
await fs.mkdir(logs);
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const checks = [];
const record = (name, passed, details = {}) => {
  const entry = { name, passed, ...details };
  checks.push(entry);
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  return entry;
};
const artifactBytes = await fs.readFile(tgz);
const artifactSha = sha256(artifactBytes);
const forbiddenNames = ['PortalIdentityCard', 'PortalIdentityCardPreview'];
const forbiddenTemplateHashes = new Set([
  '8f7747645bbeb35d703627783fba94b827aac5c2e2e3058425fee9ad3695da89',
  '783f3d5f062060474ac0ceec03cc1a5c8bb39768fd2e5985538a79408f38e394',
]);
const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  artifact: { path: tgz, bytes: artifactBytes.length, sha256: artifactSha },
  workdir,
  offline: args.includes('--offline'),
  checks,
  consumers: [],
  environment: {
    node: process.version,
    npm: spawnSync('npm', ['--version'], { encoding: 'utf8' }).stdout?.trim(),
    platform: process.platform,
    arch: process.arch,
  },
  completed: false,
  status: 'running',
  passed: false,
};
async function save() {
  report.passed = report.completed && checks.length > 0 && checks.every((check) => check.passed);
  report.status = report.completed ? (report.passed ? 'passed' : 'failed') : 'running';
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath + '.tmp', JSON.stringify(report, null, 2) + '\n');
  await fs.rename(reportPath + '.tmp', reportPath);
}
function run(name, executable, parameters, cwd = workdir) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(executable, parameters, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: '1' },
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const log = path.join(logs, `${name}.log`);
  // Logs remain in the temporary consumer tree, never in the library sources.
  return fs.writeFile(log, output).then(() =>
    record(name, result.status === 0, {
      command: [executable, ...parameters],
      exitCode: result.status,
      startedAt,
      log,
      ...(result.status === 0 ? {} : { error: String(result.error ?? output.slice(-12000)) }),
    }),
  );
}
async function files(directory, prefix = '') {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory())
      result.push(...(await files(path.join(directory, entry.name), `${relative}/`)));
    else if (entry.isFile()) result.push(relative);
    else throw new Error(`Unexpected nonregular package entry: ${relative}`);
  }
  return result;
}
function inside(root, relative) {
  const destination = path.resolve(root, relative);
  if (destination !== root && !destination.startsWith(root + path.sep))
    throw new Error(`Package path escapes its root: ${relative}`);
  return destination;
}
const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const toolVersion = async (name) =>
  (await readJson(path.join(project, 'node_modules', name, 'package.json'))).version;
await save();
try {
  const listed = spawnSync('tar', ['-tzf', tgz], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (listed.status !== 0) throw new Error(`Cannot list package archive: ${listed.stderr}`);
  const archiveEntries = listed.stdout.trim().split('\n');
  if (
    archiveEntries.some((entry) => !entry.startsWith('package/') || entry.split('/').includes('..'))
  )
    throw new Error('Archive has entries outside package/');
  const extraction = path.join(workdir, 'archive');
  await fs.mkdir(extraction);
  if (!(await run('extract-frozen-tgz', 'tar', ['-xzf', tgz, '-C', extraction])).passed)
    throw new Error('TGZ extraction failed');
  const packageRoot = path.join(extraction, 'package');
  const pkg = await readJson(path.join(packageRoot, 'package.json'));
  report.version = pkg.version;
  const packageFiles = await files(packageRoot);
  const documentation = packageFiles.filter((file) => /\.mdx?$/.test(file));
  const brokenLinks = await brokenDocumentationLinks(packageRoot, documentation);
  record('packaged-documentation-links', brokenLinks.length === 0, {
    checkedDocuments: documentation.length,
    failures: brokenLinks,
  });
  const hashes = new Map();
  const removedFailures = [],
    assetFailures = [],
    importFailures = [],
    peerEmbedding = [];
  let embeddedDataUris = 0,
    relativeImports = 0,
    assetUrls = 0;
  for (const file of packageFiles) {
    const bytes = await fs.readFile(path.join(packageRoot, file));
    const hash = sha256(bytes);
    hashes.set(file, hash);
    if (
      forbiddenTemplateHashes.has(hash) ||
      /(?:^|\/)(?:identity-(?:front|back)\.(?:jpe?g)|IdentityCard\.(?:d\.ts|[cm]?jsx?|tsx?))$/i.test(
        file,
      )
    )
      removedFailures.push({ file, reason: 'Removed identity implementation/template file' });
    if (!/\.(?:[cm]?js|d\.ts|css|svg|json|md|html)$/.test(file)) continue;
    const text = bytes.toString('utf8');
    for (const match of text.matchAll(/data:[^,\s"'<>]+;base64,([A-Za-z0-9+/=\r\n]+)/g)) {
      embeddedDataUris++;
      if (forbiddenTemplateHashes.has(sha256(Buffer.from(match[1], 'base64'))))
        removedFailures.push({
          file,
          reason: 'Removed JPEG is still embedded as a complete data URI',
        });
    }
    if (
      /\.(?:[cm]?js|d\.ts|css)$/.test(file) &&
      (forbiddenNames.some((name) => text.includes(name)) || text.includes('mp-identity-card'))
    )
      removedFailures.push({
        file,
        reason: 'Removed component remains in runtime, declarations or stylesheet',
      });
    if (/\.[cm]?js$/.test(file)) {
      const syntax = ts.createSourceFile(
        file,
        text,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.JS,
      );
      function inspect(node) {
        let specifier;
        if (
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
        )
          specifier = node.moduleSpecifier.text;
        if (
          ts.isCallExpression(node) &&
          node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          ts.isStringLiteral(node.arguments[0])
        )
          specifier = node.arguments[0].text;
        if (specifier) {
          if (specifier.startsWith('.')) {
            relativeImports++;
            if (
              !hashes.has(
                path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier)),
              ) &&
              !packageFiles.includes(
                path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier)),
              )
            )
              importFailures.push({ file, specifier, reason: 'Missing relative runtime module' });
          } else if (!specifier.startsWith('node:')) {
            const name = specifier.startsWith('@')
              ? specifier.split('/').slice(0, 2).join('/')
              : specifier.split('/')[0];
            if (!pkg.dependencies?.[name] && !pkg.peerDependencies?.[name])
              importFailures.push({
                file,
                specifier,
                reason: 'Undeclared external runtime dependency',
              });
          }
        }
        ts.forEachChild(node, inspect);
      }
      inspect(syntax);
      if (
        /__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE|__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED/.test(
          text,
        )
      )
        peerEmbedding.push({
          file,
          reason: 'Compiled React runtime internals embedded in the library',
        });
    }
    if (file.endsWith('.css')) {
      for (const match of text.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g)) {
        const url = (match[1] ?? match[2] ?? match[3]).trim();
        if (!url || url.startsWith('data:') || url.startsWith('#')) continue;
        assetUrls++;
        if (/^(?:https?:)?\/\//.test(url)) {
          assetFailures.push({
            file,
            url,
            reason:
              'CSS asset requires an external network request; cannot be verified as a shipped asset',
          });
          continue;
        }
        const relative = path.posix.normalize(
          path.posix.join(path.posix.dirname(file), decodeURIComponent(url.split(/[?#]/)[0])),
        );
        if (url.startsWith('/') || !packageFiles.includes(relative))
          assetFailures.push({ file, url, reason: 'Missing or nonportable CSS asset URL' });
      }
    }
  }
  record('removed-identity-implementation-and-template-bytes', removedFailures.length === 0, {
    scannedFiles: packageFiles.length,
    decodedDataUris: embeddedDataUris,
    forbiddenSha256: [...forbiddenTemplateHashes],
    failures: removedFailures,
  });
  record('compiled-runtime-imports', importFailures.length === 0, {
    relativeImports,
    failures: importFailures,
  });
  record('css-assets-exist-in-package', assetFailures.length === 0, {
    assetUrls,
    failures: assetFailures,
  });
  record(
    'react-peers-not-embedded',
    peerEmbedding.length === 0 &&
      !!pkg.peerDependencies?.react &&
      !!pkg.peerDependencies?.['react-dom'] &&
      !pkg.dependencies?.react &&
      !pkg.dependencies?.['react-dom'],
    {
      peerDependencies: pkg.peerDependencies,
      findings: peerEmbedding,
      method:
        'React/ReactDOM must be peers, not regular dependencies. Compiled-runtime internals check plus independent consumer production module-graph deduplication below; no source-name-only assertion.',
    },
  );

  const sourceManifest = await readJson(path.join(project, 'src/catalog/component-manifest.json'));
  const manifest = await readJson(path.join(packageRoot, 'src/catalog/component-manifest.json'));
  const apiErrors = [];
  if (sourceManifest.componentCount !== 186 || sourceManifest.counts.portal !== 56)
    apiErrors.push('Workspace public API must contain 186 components, including portal 56');
  if (
    manifest.componentCount !== 186 ||
    manifest.components.length !== 186 ||
    manifest.counts.portal !== 56
  )
    apiErrors.push('Packed public API count is not 186 / portal 56');
  if (JSON.stringify(sourceManifest) !== JSON.stringify(manifest))
    apiErrors.push('Packed public API manifest differs from the current workspace manifest');
  if (manifest.version !== pkg.version)
    apiErrors.push('Packed API manifest version differs from package version');
  if (manifest.components.some((component) => forbiddenNames.includes(component.name)))
    apiErrors.push('Removed identity API remains in the component manifest');
  const exportTargets = [];
  function visitExport(target, subpath) {
    if (typeof target === 'string') {
      if (target.includes('*')) {
        const prefix = target.slice(0, target.indexOf('*')).replace(/^\.\//, '');
        const matches = packageFiles.filter((file) => file.startsWith(prefix));
        if (!matches.length) apiErrors.push(`Empty wildcard export ${subpath}`);
        exportTargets.push(
          ...matches.map((file) => ({
            subpath: subpath.replaceAll('*', () => file.slice(prefix.length)),
            file,
          })),
        );
      } else {
        const file = target.replace(/^\.\//, '');
        if (!packageFiles.includes(file))
          apiErrors.push(`Missing export target ${subpath}: ${target}`);
        exportTargets.push({ subpath, file });
      }
    } else if (target && typeof target === 'object')
      for (const nested of Object.values(target)) visitExport(nested, subpath);
  }
  for (const [subpath, target] of Object.entries(pkg.exports ?? {})) visitExport(target, subpath);
  record('public-api-and-declaration-export-targets', apiErrors.length === 0, {
    componentCount: manifest.componentCount,
    componentCounts: manifest.counts,
    exportPatterns: Object.keys(pkg.exports ?? {}).length,
    checkedTargets: exportTargets.length,
    failures: apiErrors,
  });

  const versions = {
    typescript: await toolVersion('typescript'),
    vite: await toolVersion('vite'),
    jsdom: await toolVersion('jsdom'),
  };
  const matrix = [
    {
      id: 'react18',
      react: option('--react18', '18.3.1'),
      typesReact: '18.3.28',
      typesReactDom: '18.3.7',
    },
    {
      id: 'react19',
      react: option('--react19', '19.3.1'),
      typesReact: '19.3.0',
      typesReactDom: '19.3.0',
    },
  ];
  const ssrFixtureFile = path.join(project, 'scripts/fixtures/release-ssr-all.mjs');
  const ssrFixture = await fs.readFile(ssrFixtureFile, 'utf8');
  for (const matrixItem of matrix) {
    const directory = path.join(workdir, matrixItem.id);
    await fs.mkdir(directory);
    const consumer = { ...matrixItem, directory, tools: versions };
    report.consumers.push(consumer);
    await fs.writeFile(
      path.join(directory, 'package.json'),
      JSON.stringify(
        {
          name: `mdesign-release-${matrixItem.id}`,
          private: true,
          type: 'module',
          version: pkg.version,
          dependencies: {
            '@mdesign/react': `file:${tgz}`,
            react: matrixItem.react,
            'react-dom': matrixItem.react,
          },
          devDependencies: {
            '@types/react': matrixItem.typesReact,
            '@types/react-dom': matrixItem.typesReactDom,
            ...versions,
          },
        },
        null,
        2,
      ),
    );
    const install = await run(
      `${matrixItem.id}-fresh-install`,
      'npm',
      ['install', '--no-audit', '--no-fund', ...(args.includes('--offline') ? ['--offline'] : [])],
      directory,
    );
    if (!install.passed) continue;
    const evidenceDirectory = path.join(
      path.dirname(reportPath),
      'consumer-fixtures',
      matrixItem.id,
    );
    await fs.mkdir(evidenceDirectory, { recursive: true });
    consumer.reproducibility = {
      resolution:
        'Fresh npm install exercises current compatible dependency resolution. Saved manifest and lockfile record the exact resolved tree for npm ci replay; no node_modules are copied.',
      files: [],
    };
    for (const filename of ['package.json', 'package-lock.json']) {
      const bytes = await fs.readFile(path.join(directory, filename));
      const destination = path.join(evidenceDirectory, filename);
      await fs.writeFile(destination, bytes);
      consumer.reproducibility.files.push({
        file: destination,
        bytes: bytes.length,
        sha256: sha256(bytes),
      });
    }
    const installed = await fs.realpath(path.join(directory, 'node_modules/@mdesign/react'));
    const integrityFailures = [];
    if (
      installed === (await fs.realpath(project)) ||
      installed !== path.join(await fs.realpath(directory), 'node_modules/@mdesign/react')
    )
      integrityFailures.push(
        'Consumer resolves a linked workspace rather than an independent installed package',
      );
    const installedFiles = await files(installed);
    for (const [file, hash] of hashes)
      if (
        !installedFiles.includes(file) ||
        sha256(await fs.readFile(inside(installed, file))) !== hash
      )
        integrityFailures.push(file);
    for (const file of installedFiles)
      if (!hashes.has(file)) integrityFailures.push(`Unexpected installed file: ${file}`);
    record(`${matrixItem.id}-installed-byte-integrity`, integrityFailures.length === 0, {
      files: hashes.size,
      failures: integrityFailures,
    });
    await fs.writeFile(
      path.join(directory, 'component-manifest.json'),
      JSON.stringify(manifest, null, 2),
    );
    const namespaces = { core: 'Root', mobile: 'Mobile', portal: 'Portal', landing: 'Landing' };
    const props = manifest.components
      .map(
        (component) =>
          `  ${JSON.stringify(`${component.category}.${component.name}`)}: ComponentProps<typeof ${namespaces[component.category]}.${component.name}>;`,
      )
      .join('\n');
    await fs.writeFile(
      path.join(directory, 'api-probe.tsx'),
      `import {createRef} from 'react';\nimport type {ComponentProps} from 'react';\nimport * as Root from '@mdesign/react';\nimport * as Mobile from '@mdesign/react/mobile';\nimport * as Portal from '@mdesign/react/portal';\nimport * as Landing from '@mdesign/react/landing';\nimport '@mdesign/react/styles.css';\nexport interface AllPublicProps {\n${props}\n}\nexport const probe = <><Root.Button ref={createRef<HTMLButtonElement>()}>Zapisz</Root.Button><Portal.PortalCard title="Karta">Treść</Portal.PortalCard><Landing.LandingButton ref={createRef<HTMLButtonElement>()}>Akcja</Landing.LandingButton><Landing.LandingLink ref={createRef<HTMLAnchorElement>()} href="/">Link</Landing.LandingLink><Portal.PortalDatePicker ref={createRef<HTMLInputElement>()} label="Data"/><Portal.PortalSelect ref={createRef<HTMLButtonElement>()} label="Wybór" options={[]}/></>;\n// @ts-expect-error deliberately removed public component\nimport {PortalIdentityCard} from '@mdesign/react';\n// @ts-expect-error deliberately removed subpath component\nimport {PortalIdentityCardPreview} from '@mdesign/react/portal';\n// @ts-expect-error deliberately removed declaration\nimport type {PortalIdentityCardProps} from '@mdesign/react/portal';\n`,
    );
    await fs.writeFile(
      path.join(directory, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            skipLibCheck: false,
            noUncheckedSideEffectImports: true,
            noEmit: true,
            jsx: 'react-jsx',
            lib: ['ES2022', 'DOM', 'DOM.Iterable'],
            types: ['react', 'react-dom'],
          },
          include: ['api-probe.tsx'],
        },
        null,
        2,
      ),
    );
    await run(
      `${matrixItem.id}-strict-nodenext-all-props`,
      process.execPath,
      ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'],
      directory,
    );
    await fs.writeFile(path.join(directory, 'ssr-all.mjs'), ssrFixture);
    const ssrRun = await run(
      `${matrixItem.id}-ssr-all-components`,
      process.execPath,
      ['ssr-all.mjs'],
      directory,
    );
    if (ssrRun.passed) {
      consumer.ssr = await readJson(path.join(directory, 'ssr-all-result.json'));
      record(
        `${matrixItem.id}-ssr-count-and-dom-independence`,
        consumer.ssr.totalManifestComponents === 186 &&
          consumer.ssr.manifestRendered === 186 &&
          consumer.ssr.failures === 0 &&
          consumer.ssr.ssrWithoutDom === true,
        {
          total: consumer.ssr.totalManifestComponents,
          rendered: consumer.ssr.manifestRendered,
          failures: consumer.ssr.failures,
        },
      );
    }
    await fs.writeFile(path.join(directory, 'export-checks.mjs'), exportCheckProgram());
    const exportsRun = await run(
      `${matrixItem.id}-runtime-export-resolution`,
      process.execPath,
      ['export-checks.mjs'],
      directory,
    );
    if (exportsRun.passed)
      consumer.exports = await readJson(path.join(directory, 'export-result.json'));
    await fs.writeFile(path.join(directory, 'client-refs.mjs'), clientRefProgram());
    const refsRun = await run(
      `${matrixItem.id}-client-refs-and-radix-composition`,
      process.execPath,
      ['client-refs.mjs'],
      directory,
    );
    if (refsRun.passed)
      consumer.clientRefs = await readJson(path.join(directory, 'client-ref-result.json'));
    await fs.writeFile(
      path.join(directory, 'index.html'),
      '<!doctype html><html lang="pl"><head><title>Package consumer</title></head><body><div id="root"></div><script type="module" src="/main.jsx"></script></body></html>',
    );
    await fs.writeFile(
      path.join(directory, 'main.jsx'),
      `import React from 'react';import {createRoot} from 'react-dom/client';import {Button} from '@mdesign/react';import {PortalCard} from '@mdesign/react/portal';import {LandingButton,LandingProvider} from '@mdesign/react/landing';import '@mdesign/react/styles.css';createRoot(document.getElementById('root')).render(<><Button>Przycisk</Button><PortalCard title="Karta">Treść</PortalCard><LandingProvider><LandingButton>Akcja</LandingButton></LandingProvider></>);`,
    );
    await fs.writeFile(path.join(directory, 'production-build.mjs'), productionBuildProgram());
    const production = await run(
      `${matrixItem.id}-production-consumer-build`,
      process.execPath,
      ['production-build.mjs'],
      directory,
    );
    if (production.passed) {
      consumer.production = await readJson(path.join(directory, 'production-result.json'));
      record(
        `${matrixItem.id}-production-react-deduplicated`,
        consumer.production.reactRoots.length === 1 &&
          consumer.production.reactDomRoots.length === 1,
        consumer.production,
      );
    }
    if (matrixItem.id === 'react19') {
      const reportStem = path.basename(reportPath, '.json');
      const budgetReport = path.join(
        path.dirname(reportPath),
        reportStem === 'package' ? 'bundle-size.json' : `${reportStem}.bundle-size.json`,
      );
      await fs.rm(budgetReport, { force: true });
      await run(
        'production-bundle-budgets',
        process.execPath,
        [
          path.join(project, 'scripts/check-bundle-size.mjs'),
          '--consumer',
          directory,
          '--report',
          budgetReport,
        ],
        directory,
      );
      try {
        report.bundle = await readJson(budgetReport);
      } catch {
        // The command check above already records a missing or failed budget report.
      }
    }
    await save();
  }
  record('frozen-tgz-unchanged', sha256(await fs.readFile(tgz)) === artifactSha, {
    sha256: sha256(await fs.readFile(tgz)),
  });
} catch (error) {
  record('release-gate-execution', false, { error: String(error.stack ?? error) });
}
report.completed = true;
await save();
console.log(
  JSON.stringify(
    {
      version: report.version,
      passed: report.passed,
      checks: checks.length,
      failures: checks.filter((check) => !check.passed).map((check) => check.name),
      report: reportPath,
      workdir,
    },
    null,
    2,
  ),
);
if (!report.passed) process.exitCode = 1;

function exportCheckProgram() {
  return String.raw`
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await fs.realpath('node_modules/@mdesign/react');
const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
const records=[];
async function files(directory,prefix=''){const result=[];for(const item of await fs.readdir(directory,{withFileTypes:true})){const relative=prefix+item.name;if(item.isDirectory())result.push(...await files(path.join(directory,item.name),relative+'/'));else if(item.isFile())result.push(relative);}return result;}
async function check(spec,target){const actual=await fs.realpath(fileURLToPath(import.meta.resolve(spec)));assert.equal(actual,await fs.realpath(path.join(root,target)));assert.ok((await fs.stat(actual)).size);if(target.endsWith('.js')){const namespace=await import(spec);assert.ok(Object.keys(namespace).length);assert.ok(!('PortalIdentityCard' in namespace));assert.ok(!('PortalIdentityCardPreview' in namespace));}records.push({specifier:spec,file:target});}
for(const [subpath,target] of Object.entries(pkg.exports)){
 const spec=subpath==='.'?'@mdesign/react':'@mdesign/react/'+subpath.slice(2);
 if(typeof target==='string'&&subpath.includes('*')){const prefix=target.slice(0,target.indexOf('*'));for(const file of await files(path.join(root,prefix)))await check(spec.replaceAll('*',()=>file),prefix+file);}
 else if(typeof target==='string')await check(spec,target);
 else{if(target.types){assert.ok((await fs.stat(path.join(root,target.types))).size);records.push({specifier:spec,kind:'declaration',file:target.types});}await check(spec,target.import??target.default);}
}
const manifest=JSON.parse(await fs.readFile('component-manifest.json','utf8'));
const namespaces={core:await import('@mdesign/react'),portal:await import('@mdesign/react/portal'),mobile:await import('@mdesign/react/mobile'),landing:await import('@mdesign/react/landing')};
for(const component of manifest.components){assert.ok(namespaces[component.category][component.name],'Missing actual runtime component: '+component.name);}
const result={passed:true,version:pkg.version,exportPatterns:Object.keys(pkg.exports).length,resolvedTargets:records.length,actualComponents:manifest.components.length,records};
await fs.writeFile('export-result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,records:undefined}));
`;
}

function clientRefProgram() {
  return String.raw`
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'http://localhost/',pretendToBeVisual:true});
for(const name of ['window','document','navigator','HTMLElement','HTMLInputElement','HTMLButtonElement','HTMLAnchorElement','Element','Node','NodeFilter','DocumentFragment','MutationObserver','Event','CustomEvent','KeyboardEvent','SVGElement','getComputedStyle'])Object.defineProperty(globalThis,name,{value:dom.window[name],configurable:true,writable:true});
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);globalThis.IS_REACT_ACT_ENVIRONMENT=true;globalThis.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
const React=await import('react');const {createRoot}=await import('react-dom/client');const act=React.act??(await import('react-dom/test-utils')).act;
const R=await import('@mdesign/react');const P=await import('@mdesign/react/portal');const L=await import('@mdesign/react/landing');const h=React.createElement;
const refs=Object.fromEntries(['button','date','select','phoneField','landingButton','landingLink','serviceTile','listRow'].map(name=>[name,React.createRef()]));
const errors=[];const originalError=console.error;console.error=(...args)=>{errors.push(args.map(String).join(' '));originalError(...args);};
let clicked=0;const root=createRoot(document.getElementById('root'));
try{
 await act(async()=>root.render(h('div',null,
 h(R.Button,{ref:refs.button,onClick:()=>clicked++},'Akcja'),
 h(P.PortalDatePicker,{ref:refs.date,label:'Data',defaultValue:'2026-10-19'}),
 h(P.PortalSelect,{ref:refs.select,label:'Wybór',options:[]}),
 h(R.PhoneField,{ref:refs.phoneField,label:'Telefon'}),
 h(L.LandingProvider,null,h(L.LandingButton,{ref:refs.landingButton},'Landing'),h(L.LandingTooltip,{content:'Pomoc'},h(L.LandingLink,{ref:refs.landingLink,href:'/'},'Link'))),
 h(R.ServiceTile,{ref:refs.serviceTile,title:'Usługa',icon:h('span'),onClick:()=>{}}),
 h(R.ListRow,{ref:refs.listRow,title:'Wiersz',onClick:()=>{}}))));
 const expected={button:HTMLButtonElement,date:HTMLInputElement,select:HTMLButtonElement,phoneField:HTMLInputElement,landingButton:HTMLButtonElement,landingLink:HTMLAnchorElement,serviceTile:HTMLButtonElement,listRow:HTMLButtonElement};
 const records=[];for(const [name,constructor] of Object.entries(expected)){assert.ok(refs[name].current instanceof constructor,'Missing DOM ref: '+name);records.push({name,node:refs[name].current.tagName});}
 await act(async()=>{refs.button.current.click();refs.landingLink.current.focus();});
 assert.equal(clicked,1);assert.equal(document.activeElement,refs.landingLink.current);
 await act(async()=>root.unmount());for(const ref of Object.values(refs))assert.equal(ref.current,null);
 const invalidRefWarnings=errors.filter(error=>/Function components cannot be given refs|Invalid hook call|Cannot read properties.*useRef/.test(error));assert.deepEqual(invalidRefWarnings,[]);
 const result={passed:true,reactVersion:React.version,records,radixAsChildRef:true,clickHandled:true,focusHandled:true,refsClearedOnUnmount:true,consoleErrors:errors};
 await fs.writeFile('client-ref-result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{console.error=originalError;dom.window.close();}
`;
}

function productionBuildProgram() {
  return String.raw`
import {build} from 'vite';
import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
const modules=[];
const result=await build({configFile:false,root:process.cwd(),publicDir:false,logLevel:'error',plugins:[{name:'consumer-runtime-module-graph',generateBundle(_options,bundle){for(const output of Object.values(bundle))if(output.type==='chunk')for(const [id,module] of Object.entries(output.modules))if(module.renderedLength>0)modules.push({id,renderedLength:module.renderedLength});}}],build:{outDir:'dist',emptyOutDir:true,target:'es2022',minify:'esbuild',reportCompressedSize:false}});
const roots=name=>[...new Set(modules.map(module=>module.id.replace(/\u0000/g,'').replaceAll('\\','/').match(new RegExp('^(.*?/node_modules/'+name+')(?:/|$)'))?.[1]).filter(Boolean))];
const files=[];for(const bundle of(Array.isArray(result)?result:[result]))for(const file of bundle.output){const bytes=Buffer.from(file.type==='chunk'?file.code:file.source);files.push({file:file.fileName,kind:file.type,bytes:bytes.length,gzipBytes:gzipSync(bytes).length});}
const report={method:'Full production React application, no forced resolve.dedupe and no external peer configuration; consumes Button/PortalCard/LandingButton and shared styles from the independently installed TGZ.',reactRoots:roots('react'),reactDomRoots:roots('react-dom'),files,largestModules:modules.sort((a,b)=>b.renderedLength-a.renderedLength).slice(0,15)};
await fs.writeFile('production-result.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
`;
}
