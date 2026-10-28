// Reusable installed-package SSR fixture. Derived from the independent consumer audit; current APIs come from the supplied package manifest.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
assert.equal(typeof globalThis.window, 'undefined');
assert.equal(typeof globalThis.document, 'undefined');
const entries = {
  core: '@mdesign/react',
  mobile: '@mdesign/react/mobile',
  portal: '@mdesign/react/portal',
  landing: '@mdesign/react/landing',
};
const namespaces = Object.fromEntries(
  await Promise.all(
    Object.entries(entries).map(async ([category, path]) => [category, await import(path)]),
  ),
);
const manifest = JSON.parse(await readFile('component-manifest.json', 'utf8'));
const R = namespaces.core,
  M = namespaces.mobile,
  P = namespaces.portal,
  L = namespaces.landing;
const noop = () => {};
const text = 'Treść demonstracyjna';
const icon = h(
  'svg',
  { viewBox: '0 0 24 24', width: 24, height: 24, 'aria-hidden': true },
  h('circle', { cx: 12, cy: 12, r: 8 }),
);
const child = h('button', { type: 'button' }, 'Przycisk');
const image =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="blue"/%3E%3C/svg%3E';
const link = { id: 'a', label: 'Przykład', href: '/przyklad' };
const nav = { value: 'a', label: 'Przykład', icon };
const option = { value: 'a', label: 'Pierwsza opcja' };
const overrides = {
  Accordion: { items: [{ id: 'a', title: 'Pytanie', content: 'Odpowiedź' }] },
  BottomNavigation: { items: [nav], value: 'a', onValueChange: noop },
  Sidebar: { items: [nav], value: 'a', onValueChange: noop },
  Breadcrumbs: { items: [{ label: 'Strona główna', href: '/' }, { label: 'Bieżąca' }] },
  Tabs: { items: [{ value: 'a', label: 'Zakładka', content: 'Treść' }] },
  Dialog: { title: 'Dialog', trigger: child },
  Tooltip: { content: 'Podpowiedź', children: child },
  DocumentArtwork: { variant: 'id' },
  DocumentCard: { title: 'Dokument', backgroundImage: image },
  DocumentTile: { title: 'Dokument', icon },
  NativeIcon: { name: 'check' },
  ServiceIcon: { name: 'pesel' },
  OfficialIcon: { name: R.officialIconNames[0] },
  Pagination: { page: 1, total: 3, onPageChange: noop },
  Progress: { value: 40 },
  Select: { label: 'Wybór', options: [option] },
  LandingIcon: { name: L.landingIconNames[0] },
  LandingBreadcrumbs: { items: [link] },
  LandingCatalogCard: { item: { id: 'a', title: 'Katalog', href: '/katalog', description: text } },
  LandingCatalogListing: {
    title: 'Katalog',
    items: [{ id: 'a', title: 'Usługa', href: '/usluga', description: text, category: 'Usługi' }],
  },
  LandingCombobox: { label: 'Kategoria', options: [option] },
  LandingDocumentCarousel: {
    title: 'Dokumenty',
    items: [{ id: 'a', title: 'Dokument', href: '/dokument', image }],
  },
  LandingFAQ: { items: [{ id: 'a', question: 'Pytanie?', answer: 'Odpowiedź' }] },
  LandingFooter: { groups: [{ title: 'Informacje', links: [link] }] },
  LandingHeader: { items: [link] },
  LandingNewsCard: {
    item: { id: 'a', title: 'Aktualność', href: '/news', description: text, date: '19.10.2026' },
  },
  LandingNewsList: { items: [{ id: 'a', title: 'Aktualność', href: '/news', description: text }] },
  LandingPressCard: { title: 'Plik', href: '/plik.pdf' },
  LandingServiceCard: { title: 'Usługa', href: '/usluga' },
  LandingSitemap: { groups: [{ title: 'Informacje', links: [link] }] },
  LandingSocialBanner: { links: [link] },
  LandingStatistics: { title: 'Statystyki', items: [{ value: '10 mln', label: 'Użytkowników' }] },
  LandingTabs: { items: [{ value: 'a', label: 'Zakładka', content: 'Treść' }] },
  LandingTooltip: { content: 'Podpowiedź', children: child },
  LandingVideo: { title: 'Film', src: '/film.mp4' },
  LandingInfoSection: { title: 'Informacje', children: text },
  BarcodeCard: { title: 'Kod', value: '123456789012' },
  BarcodeGraphic: { value: '123456789012' },
  QRCodeCard: { title: 'QR', value: 'https://example.com' },
  QRCodeGraphic: { value: 'https://example.com' },
  CardList: { items: [{ title: 'Wiersz', description: text }] },
  CardStack: { children: [h('article', { key: 'a' }, text)] },
  CheckboxGroup: { label: 'Kilka', options: [option] },
  RadioGroup: { label: 'Jedna', options: [option] },
  DocumentRow: { title: 'Dokument', thumbnail: icon },
  FileSourceItem: { label: 'Plik', icon, onClick: noop },
  FilterControl: { label: 'Filtry', items: [option] },
  InfoRowList: { items: [{ title: 'Informacja', description: text, icon }] },
  InputDateTime: { label: 'Termin', onClick: noop },
  MobileAnnouncement: { icon, children: text },
  MobileCalendar: { value: '2026-10-19', today: '2026-10-19' },
  MobileDatePicker: { label: 'Data', defaultValue: '2026-10-19' },
  MobileDialog: { title: 'Dialog', trigger: child },
  MobileDialogActions: { onConfirm: noop, onCancel: noop },
  MobileDropdown: { label: 'Region', options: [option] },
  MobileHeader: { title: 'Nagłówek', icon, description: text },
  MobileMenu: { label: 'Menu', items: [{ label: 'Akcja', onSelect: noop }] },
  MobileSnackbar: { message: text, onDismiss: noop, duration: 0 },
  MobileTextArea: { label: 'Opis', characterLimit: 100 },
  MobileTopAppBar: { title: 'Nagłówek' },
  NativeSingleCard: { title: 'Wiersz', description: text },
  Onboarding: {
    pages: [{ title: 'Witaj', illustration: icon, description: text }],
    onComplete: noop,
  },
  PageIndicator: { count: 3, page: 0 },
  Pager: { label: 'Pager', pages: [{ content: text }] },
  PhoneField: { label: 'Telefon' },
  PinInput: { label: 'PIN' },
  ResultModal: { title: 'Wynik', icon, data: [{ label: 'Status', value: 'Przyjęty' }] },
  RichText: {
    segments: [
      { type: 'text', value: text },
      { type: 'link', value: 'Link', url: 'https://example.com' },
    ],
  },
  SegmentedControl: { label: 'Widok', items: [option] },
  ServiceWelcomePage: {
    topBarTitle: 'Usługa',
    header: { title: 'Nagłówek', icon, description: text },
  },
  ShortcutTile: { title: 'Skrót', icon },
  SmallServiceCard: { title: 'Karta', icon },
  SupportPage: { topBarTitle: 'Wynik', title: 'Gotowe', icon },
  Timeline: { items: [{ header: '19.10.2026', title: 'Przyjęto', descriptions: [text] }] },
  PortalAccountMenu: { name: 'Konto demonstracyjne', items: [{ ...link, onSelect: noop }] },
  PortalBreadcrumbs: { items: [link] },
  PortalCalendar: { defaultValue: '2026-10-19' },
  PortalCharacterCounter: { maxLength: 100, value: 'Tekst' },
  PortalDashboard: { cases: text, payments: text, catalog: text, popular: text, calendar: text },
  PortalDashboardTile: { heading: 'Kafel' },
  PortalDataTable: {
    rows: [{ id: '1', name: 'Pierwszy' }],
    columns: [{ key: 'name', header: 'Nazwa' }],
    rowKey: (r) => r.id,
    caption: 'Tabela',
  },
  PortalDatePicker: { label: 'Data', defaultValue: '2026-10-19' },
  PortalDialog: { title: 'Dialog', children: text },
  PortalDialogHeader: { title: 'Nagłówek' },
  PortalErrorView: { heading: 'Nie znaleziono' },
  PortalFileUpload: { label: 'Załączniki' },
  PortalFormField: { label: 'Pole', children: h('input', { defaultValue: 'Tekst' }) },
  PortalIcon: { name: 'AE_check' },
  PortalInfoTip: { children: text },
  PortalMenu: { label: 'Menu', items: [{ ...link, onSelect: noop }] },
  PortalPageTitle: { heading: 'Nagłówek' },
  PortalPagination: { total: 30 },
  PortalProgress: { label: 'Postęp', value: 50 },
  PortalRadioGroup: { label: 'Wybór', options: [option] },
  PortalSelect: { label: 'Lista', options: [option] },
  PortalServiceCatalog: {
    items: [{ id: 'a', title: 'Katalog', description: text, action: child }],
  },
  PortalServiceLinks: { items: [link] },
  PortalShell: { navigation: [link], children: text },
  PortalSidebar: { items: [link] },
  PortalSnackbar: { message: text, duration: 0 },
  PortalWidgetIcon: { name: 'affairs' },
};
function defaultProp(prop) {
  const t = prop.type;
  if (t.includes('=>') && prop.name !== 'children') return noop;
  if (t === 'number') return ['page'].includes(prop.name) ? 0 : 3;
  if (t === 'boolean') return true;
  if (t.endsWith('[]') || t.startsWith('readonly ')) return [];
  if (prop.name === 'children') return text;
  if (['icon', 'illustration', 'thumbnail'].includes(prop.name)) return icon;
  if (t.includes('ReactElement')) return child;
  if (prop.name === 'backgroundImage' || prop.name === 'src') return image;
  if (prop.name === 'href') return '/przyklad';
  return prop.name === 'value' ? '123456' : text;
}
function wrapper(category, node) {
  if (category === 'landing') return h(L.LandingProvider, { animationsDisabled: true }, node);
  if (category === 'portal')
    return h(P.PortalSnackbarProvider, null, h(P.PortalDialogProvider, null, node));
  if (category === 'mobile') return h(M.SnackbarProvider, null, node);
  return node;
}
const compositionHelpers = new Set([
  'MobileDialogClose',
  'PortalDialogClose',
  'PortalDialogTrigger',
  'PortalDialogHeader',
  'PortalDialogSurface',
  'PortalDialogContent',
  'PortalDialogFooter',
]);
const records = [];
let failures = 0;
for (const c of manifest.components) {
  const namespace = namespaces[c.category];
  const component = namespace?.[c.name];
  const props = Object.fromEntries(
    c.props.filter((p) => p.required).map((p) => [p.name, defaultProp(p)]),
  );
  Object.assign(props, overrides[c.name] ?? {});
  try {
    assert.ok(component, 'Missing export ' + c.name);
    if (
      [
        'PortalDialogProvider',
        'PortalSnackbarProvider',
        'SnackbarProvider',
        'LandingProvider',
      ].includes(c.name)
    )
      props.children = h('span', null, 'Provider child');
    let node = h(component, props);
    if (c.name.startsWith('PortalDialog') && compositionHelpers.has(c.name))
      node = h(P.PortalDialogRoot, null, node);
    if (c.name === 'MobileDialogClose')
      node = h(M.MobileDialog, { title: 'Dialog', trigger: child }, node);
    if (
      c.name === 'PortalDialogProvider' ||
      c.name === 'PortalSnackbarProvider' ||
      c.name === 'SnackbarProvider' ||
      c.name === 'LandingProvider'
    )
      props.children = h('span', null, 'Provider child');
    const html = renderToStaticMarkup(wrapper(c.category, node));
    records.push({
      name: c.name,
      category: c.category,
      status: 'rendered',
      htmlBytes: Buffer.byteLength(html),
    });
  } catch (error) {
    failures++;
    records.push({
      name: c.name,
      category: c.category,
      status: 'failed',
      error: String(error.stack ?? error),
    });
  }
}
function HookProbe() {
  assert.equal(typeof M.useSnackbar().show, 'function');
  assert.equal(typeof P.usePortalSnackbar().enqueue, 'function');
  assert.equal(typeof P.usePortalDialog().open, 'function');
  return h('span', null, 'Hooks ready');
}
try {
  renderToStaticMarkup(
    h(
      L.LandingProvider,
      { animationsDisabled: true },
      h(
        M.SnackbarProvider,
        null,
        h(P.PortalSnackbarProvider, null, h(P.PortalDialogProvider, null, h(HookProbe))),
      ),
    ),
  );
  records.push({ name: 'Provider hook contracts', status: 'rendered' });
} catch (error) {
  failures++;
  records.push({
    name: 'Provider hook contracts',
    status: 'failed',
    error: String(error.stack ?? error),
  });
}
const result = {
  ssrWithoutDom: true,
  manifestVersion: manifest.version,
  totalManifestComponents: manifest.components.length,
  manifestRendered: records.filter((r) => r.category && r.status === 'rendered').length,
  hookProbes: records.filter((r) => !r.category && r.status === 'rendered').length,
  compositionHelpers: records.filter((r) => r.status === 'composition-helper').length,
  failures,
  byCategory: Object.fromEntries(
    Object.keys(entries).map((category) => [
      category,
      records.filter((r) => r.category === category && r.status === 'rendered').length,
    ]),
  ),
  records,
};
await writeFile('ssr-all-result.json', JSON.stringify(result, null, 2) + '\n');
console.log(
  JSON.stringify({ ...result, records: records.filter((r) => r.status === 'failed') }, null, 2),
);
process.exitCode = failures ? 1 : 0;
