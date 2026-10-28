import fs from 'node:fs';
import crypto from 'node:crypto';
import ts from 'typescript';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const version = read('package.json').version;
const config = ts.readConfigFile('tsconfig.lib.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, '.');
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const source = program.getSourceFile('src/kit/index.ts');
const exported = checker.getExportsOfModule(checker.getSymbolAtLocation(source));
const names = new Set(exported.map((symbol) => symbol.getName()));
const values = new Set(
  exported
    .filter((symbol) => {
      const resolved =
        symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      return Boolean(resolved.flags & ts.SymbolFlags.Value);
    })
    .map((symbol) => symbol.getName()),
);
const errors = [];
const summaries = {};
const hashes = {};
const sourceInventoryDirectory = 'scripts/fixtures/source-inventory';
const sourceInventoryManifest = read(`${sourceInventoryDirectory}/manifest.json`);
const sourceInventoryHashes = {};
function readSourceInventory(surface) {
  const entry = sourceInventoryManifest.inventories.find((entry) => entry.surface === surface);
  if (!entry || entry.file !== `${surface}-0.4.0.json`)
    throw new Error(`Missing immutable source inventory for ${surface}`);
  const file = `${sourceInventoryDirectory}/${entry.file}`;
  const bytes = fs.readFileSync(file);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  sourceInventoryHashes[file] = hash;
  if (hash !== entry.sha256 || bytes.length !== entry.bytes)
    errors.push(`${surface}: immutable source inventory bytes differ from manifest`);
  return JSON.parse(bytes.toString('utf8'));
}
// Product-scope decisions are explicit and bounded; other unresolved units still fail.
const excludedSourceUnits = new Map([
  [
    'portal/gds',
    new Map([
      ['gov-layout-lib/components/identity-card', 'PortalIdentityCard'],
      ['gov-layout-lib/components/identity-card-preview', 'PortalIdentityCardPreview'],
    ]),
  ],
]);
function checkItems(surface, items, expected, key = (item) => item.id) {
  const actual = items.map(key);
  if (new Set(actual).size !== actual.length) errors.push(`${surface}: duplicate source units`);
  for (const id of expected)
    if (!actual.includes(id)) errors.push(`${surface}: missing source unit ${id}`);
  for (const id of actual)
    if (!expected.includes(id)) errors.push(`${surface}: unrecognized source unit ${id}`);
  for (const item of items) {
    const removedExport = excludedSourceUnits.get(surface)?.get(key(item));
    if (item.status === 'excluded') {
      if (!removedExport)
        errors.push(
          `${surface}/${key(item)}: source unit is not an approved product-scope exclusion`,
        );
      if (item.reactExports?.length)
        errors.push(`${surface}/${key(item)}: excluded source unit must not map to public API`);
      if (
        !item.limitations?.length ||
        item.scopeDecision?.kind !== 'product-scope' ||
        !item.scopeDecision?.reason?.trim()
      )
        errors.push(
          `${surface}/${key(item)}: exclusion needs the explicit product decision and limitation`,
        );
      if (removedExport && !item.removedReactExports?.includes(removedExport))
        errors.push(`${surface}/${key(item)}: exclusion must retain the removed API name`);
      for (const name of item.removedReactExports ?? [])
        if (values.has(name))
          errors.push(`${surface}/${key(item)}: excluded API ${name} is still exported`);
      continue;
    }
    if (removedExport)
      errors.push(
        `${surface}/${key(item)}: intentionally excluded source unit must retain excluded status`,
      );
    if (!['implemented', 'adapter'].includes(item.status))
      errors.push(`${surface}/${key(item)}: unresolved status ${item.status}`);
    if (!item.reactExports?.length) errors.push(`${surface}/${key(item)}: no public API mapping`);
    for (const name of item.reactExports ?? []) {
      if (!values.has(name))
        errors.push(`${surface}/${key(item)}: ${name} is not a public runtime export`);
    }
    if (item.status === 'adapter' && !item.limitations?.length)
      errors.push(`${surface}/${key(item)}: adapter needs a documented limitation`);
  }
  summaries[surface] = {
    sourceUnits: expected.length,
    documented: items.length,
    inScope: expected.filter((id) => !excludedSourceUnits.get(surface)?.has(id)).length,
    mapped: items.filter((item) => ['implemented', 'adapter'].includes(item.status)).length,
    implemented: items.filter((item) => item.status === 'implemented').length,
    adapters: items.filter((item) => item.status === 'adapter').length,
    excluded: items.filter((item) => item.status === 'excluded').length,
  };
}
for (const surface of ['mobile', 'landing']) {
  const file = `src/kit/${surface}/coverage.json`;
  const data = read(file);
  if (data.version !== version) errors.push(`${surface}: stale version ${data.version}`);
  if (data.sourceAudit !== `${sourceInventoryDirectory}/${surface}-0.4.0.json`)
    errors.push(`${surface}: sourceAudit must point to the committed immutable inventory`);
  const previous = readSourceInventory(surface);
  checkItems(
    surface,
    data.items,
    previous.families.map((item) => item.id),
  );
  hashes[file] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
const portalFile = 'src/kit/portal/coverage.json';
const portal = read(portalFile);
if (portal.sourceAudit !== `${sourceInventoryDirectory}/portal-0.4.0.json`)
  errors.push('portal: sourceAudit must point to the committed immutable inventory');
const previous = readSourceInventory('portal');
const portalScopes = {
  md: previous.md.componentTypes.map((item) => item.export),
  'md-directive': previous.md.directives.map((item) => item.export),
  gds: previous.gds.families.map((item) => item.module),
  'portal-widget': previous.portalFeatureWidgets.widgets.map((item) => item.selector),
};
if (portal.version !== version) errors.push(`portal: stale version ${portal.version}`);
for (const [scope, expected] of Object.entries(portalScopes)) {
  checkItems(
    `portal/${scope}`,
    portal.items.filter((item) => item.sourceSystem === scope),
    expected,
    (item) => item.sourceUnit,
  );
}
if (portal.items.some((item) => !(item.sourceSystem in portalScopes)))
  errors.push('portal: unknown source system');
const portalCounts = {
  inventoried: portal.items.length,
  inScope: portal.items.filter((item) => item.status !== 'excluded').length,
  implemented: portal.items.filter((item) => item.status === 'implemented').length,
  adapters: portal.items.filter((item) => item.status === 'adapter').length,
  excluded: portal.items.filter((item) => item.status === 'excluded').length,
};
for (const [name, count] of Object.entries(portalCounts))
  if (portal.coverageCounts?.[name] !== count) errors.push(`portal: stale coverageCounts.${name}`);
hashes[portalFile] = crypto.createHash('sha256').update(fs.readFileSync(portalFile)).digest('hex');
const manifest = read('src/catalog/component-manifest.json');
if (manifest.version !== version) errors.push('Public API catalog has a stale version');
for (const component of manifest.components)
  if (!values.has(component.name)) errors.push(`Catalog contains nonexport ${component.name}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  const report = {
    schemaVersion: 1,
    version,
    checkedAt: new Date().toISOString(),
    status: 'all-in-scope-audited-source-units-mapped-with-explicit-exclusions',
    counting:
      'Source units overlap between systems. Explicit product-scope exclusions remain documented but are not mapped or implemented coverage. Component export count includes composition parts and providers; neither is a percentage of the entire production application.',
    componentCount: manifest.componentCount,
    componentCounts: manifest.counts,
    publicRuntimeExportCount: values.size,
    publicTypeAndValueExportCount: names.size,
    scopes: summaries,
    inventorySha256: hashes,
    sourceInventorySha256: sourceInventoryHashes,
    exclusions: portal.items
      .filter((item) => item.status === 'excluded')
      .map(({ id, sourceUnit, sourceUrl, removedReactExports, scopeDecision, limitations }) => ({
        id,
        sourceUnit,
        sourceUrl,
        removedReactExports,
        scopeDecision,
        limitations,
      })),
    visualScope:
      'Coverage verifies the public API mapping. Visual verification remains limited to the explicitly recorded screen, state and viewport measurements.',
  };
  if (!process.argv.includes('--check-only')) {
    fs.mkdirSync('artifacts/coverage', { recursive: true });
    fs.writeFileSync(
      `artifacts/coverage/summary-${version}.json`,
      JSON.stringify(report, null, 2) + '\n',
    );
    fs.writeFileSync(
      `artifacts/coverage/api-${version}.json`,
      JSON.stringify(
        { ...manifest, runtimeExports: [...values].sort(), allExports: [...names].sort() },
        null,
        2,
      ) + '\n',
    );
  }
  console.log(JSON.stringify(report, null, 2));
}
