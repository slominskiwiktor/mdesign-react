import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const manifest = await read('../src/catalog/component-manifest.json');
const mobile = await read('../src/kit/mobile/coverage.json');

// These references cover the shared interaction or presentation pattern only.
const equivalents = {
  Accordion: ['LandingFAQ'],
  Alert: ['MobileBanner', 'PortalBanner', 'PortalMessage', 'PortalFormMessage'],
  Button: ['LandingButton'],
  MobileContentBox: ['Card', 'PortalCard', 'PortalPanel'],
  MobileDropdown: ['Select', 'PortalSelect', 'LandingCombobox', 'FilterControl'],
  MobileEmptyState: ['PortalEmptyState', 'PortalErrorView'],
  MobileHeader: ['ServiceWelcomePage', 'LandingHero', 'PortalPageTitle'],
  InfoRow: ['PortalServiceLinks'],
  NativeSingleCard: ['CardList', 'DocumentRow'],
  Radio: ['RadioGroup', 'PortalRadioGroup'],
  Checkbox: ['CheckboxGroup'],
  SmallServiceCard: [
    'ServiceTile',
    'LandingServiceCard',
    'LandingCatalogCard',
    'PortalDashboardTile',
  ],
  MobileLink: ['LandingLink', 'PortalExternalLink'],
  MobileSnackbar: ['PortalSnackbar'],
  SnackbarProvider: ['PortalSnackbarProvider'],
  MobileStatusBadge: ['PortalStatusText'],
  MobileTextArea: ['TextArea'],
  TextField: ['SearchField', 'LandingSearchField', 'MaskedField', 'FieldError', 'FieldHelper'],
};

const names = new Set(manifest.components.map(({ name }) => name));
const iosPaths = new Map();
for (const item of mobile.items) {
  for (const name of item.reactExports) {
    if (!item.sourcePaths.ios.length) continue;
    const paths = iosPaths.get(name) ?? [];
    iosPaths.set(name, [
      ...new Set([...paths, ...item.sourcePaths.ios.map((path) => 'Components/' + path)]),
    ]);
  }
}

// Source references outside the Components directory, checked in the same revision.
iosPaths.set('BottomNavigation', ['Helpers/AppTheme.swift']);
iosPaths.set('MobileContentBox', ['Extensions/View+ContentBox.swift']);

const mapped = new Map();
for (const [source, aliases] of Object.entries(equivalents)) {
  assert(iosPaths.has(source), `Missing SwiftUI reference for ${source}`);
  for (const alias of aliases) {
    assert(names.has(alias), `Unknown component: ${alias}`);
    assert(!mapped.has(alias), `Duplicate equivalent: ${alias}`);
    assert(!iosPaths.has(alias), `Already has a source-family reference: ${alias}`);
    mapped.set(alias, source);
  }
}

const components = manifest.components.map(({ name, category }) => {
  const counterpart = mapped.get(name);
  return {
    name,
    category,
    relation: iosPaths.has(name)
      ? 'source-family'
      : counterpart
        ? 'pattern-equivalent'
        : 'adaptation',
    ...(counterpart ? { counterpart } : {}),
    iosPaths: iosPaths.get(counterpart ?? name) ?? [],
  };
});
assert.equal(components.length, manifest.componentCount);
assert.equal(names.size, components.length);

const counts = {};
for (const { relation } of components) counts[relation] = (counts[relation] ?? 0) + 1;
process.stdout.write(JSON.stringify({ counts, components }, null, 2) + '\n');
