import { createElement as h, isValidElement, useEffect, useState } from 'react';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import manifest from '../catalog/component-manifest.json';
import apiProps from './api-props.json';
import * as C from '../kit/index.js';
import * as M from '../kit/mobile/index.js';
import * as P from '../kit/portal/index.js';
import * as L from '../kit/landing/index.js';

export type ExampleCategory = 'core' | 'mobile' | 'portal' | 'landing';
export type ExampleArgs = Record<string, unknown>;
export interface ExampleProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
  options?: Array<string | number | boolean>;
  callable?: boolean;
  defaultValue?: { summary: string; detail?: string };
}
export interface ExampleDefinition {
  name: string;
  category: ExampleCategory;
  component: ComponentType<ExampleArgs>;
  args: ExampleArgs;
  props: ExampleProp[];
  description: string;
  keyboard: string;
  states: Record<string, ExampleArgs>;
  composition: boolean;
}
const namespaces = { core: C, mobile: M, portal: P, landing: L };
const noop = () => {};
const emptyArgs: ExampleArgs = {};
const icon = h(C.NativeIcon, { name: 'services', size: 24 });
const serviceIcon = h(C.ServiceIcon, { name: 'pesel', size: 40 });
const sampleButton = h(C.Button, null, 'Otwórz przykład');
const choices = [
  { value: 'email', label: 'E-mail', description: 'Powiadomienia na adres e-mail' },
  { value: 'phone', label: 'Telefon', description: 'Powiadomienia SMS' },
  { value: 'disabled', label: 'Opcja niedostępna', disabled: true },
];
const optionItems = choices.map(({ value, label, disabled }) => ({ value, label, disabled }));
const links = [
  { id: 'documents', label: 'Dokumenty', href: '#dokumenty' },
  { id: 'services', label: 'Usługi', href: '#uslugi' },
];
const plainLinks = links.map(({ label, href }) => ({ label, href }));
const navigation = [
  {
    value: 'documents',
    label: 'Dokumenty',
    icon: h(C.NativeIcon, { name: 'documents' }),
    activeIcon: h(C.NativeIcon, { name: 'documents-filled' }),
  },
  {
    value: 'services',
    label: 'Usługi',
    icon: h(C.NativeIcon, { name: 'services' }),
    activeIcon: h(C.NativeIcon, { name: 'services-filled' }),
  },
  {
    value: 'qr',
    label: 'Kod QR',
    icon: h(C.NativeIcon, { name: 'qr' }),
    activeIcon: h(C.NativeIcon, { name: 'qr-filled' }),
  },
  {
    value: 'more',
    label: 'Więcej',
    icon: h(C.NativeIcon, { name: 'more' }),
    activeIcon: h(C.NativeIcon, { name: 'more-filled' }),
  },
];
const tabs = [
  { value: 'first', label: 'Dokumenty', content: 'Tutaj znajdziesz swoje dokumenty.' },
  { value: 'second', label: 'Usługi', content: 'Wybierz usługę, z której chcesz skorzystać.' },
  { value: 'disabled', label: 'Niedostępna', content: '', disabled: true },
];
const catalogItems = [
  {
    id: 'pesel',
    title: 'Zastrzeż PESEL',
    href: '#pesel',
    description: 'Chroń swoje dane przed nieuprawnionym wykorzystaniem.',
    category: 'Bezpieczeństwo',
    image: { src: L.landingAssets.servicePesel, alt: '' },
  },
  {
    id: 'points',
    title: 'Punkty karne',
    href: '#punkty',
    description: 'Sprawdź liczbę swoich punktów karnych.',
    category: 'Kierowca',
    image: { src: L.landingAssets.servicePoints, alt: '' },
  },
];
const news = [
  {
    id: 'first',
    title: 'Nowe możliwości w aplikacji',
    href: '#aktualnosc',
    date: '20.10.2026',
    description: 'Poznaj dokumenty i usługi dostępne w telefonie.',
    image: { src: L.landingAssets.news1, alt: '' },
  },
  {
    id: 'second',
    title: 'Bezpieczne korzystanie z usług',
    href: '#bezpieczenstwo',
    date: '19.10.2026',
    description: 'Dowiedz się, jak chronić swoje dane.',
    image: { src: L.landingAssets.news2, alt: '' },
  },
];
const page = {
  title: 'Wszystko w jednym miejscu',
  illustration: serviceIcon,
  description: 'Dokumenty i przydatne usługi masz zawsze przy sobie.',
};
const body = 'Sprawdź status sprawy, najbliższe terminy i wiadomości od zespołu obsługi.';
const overrides: Record<string, ExampleArgs> = {
  Accordion: {
    items: [
      {
        id: 'first',
        title: 'Jak korzystać z aplikacji?',
        content: 'Wybierz dokument lub usługę i postępuj według wskazówek.',
      },
      { id: 'second', title: 'Gdzie znajdę pomoc?', content: 'Pomoc znajdziesz w sekcji Więcej.' },
    ],
    multiple: false,
  },
  Alert: { title: 'Sprawdź informacje', children: 'Dane zostały zaktualizowane.', tone: 'info' },
  AppHeader: {
    brand: 'mObywatel',
    title: 'Dokumenty',
    actions: h(C.IconButton, { label: 'Pomoc' }, h(C.NativeIcon, { name: 'help' })),
  },
  Avatar: { name: 'Jan Kowalski', size: 'md' },
  Badge: { children: 'Gotowe', tone: 'success', variant: 'default' },
  BottomNavigation: {
    items: navigation,
    value: 'documents',
    onValueChange: noop,
    homeIndicator: true,
  },
  Breadcrumbs: { items: [{ label: 'Strona główna', href: '#start' }, { label: 'Twoje sprawy' }] },
  Button: {
    children: 'Zapisz zmiany',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  Card: { title: 'Twoje sprawy', children: body },
  Checkbox: { label: 'Chcę otrzymywać powiadomienia', defaultChecked: false, disabled: false },
  Dialog: {
    title: 'Potwierdź zmianę',
    description: 'Możesz wrócić do edycji lub zapisać zmiany.',
    trigger: sampleButton,
    children: 'Sprawdź wprowadzone informacje przed zatwierdzeniem.',
  },
  Divider: {},
  DocumentArtwork: { variant: 'id' },
  DocumentCard: {
    title: 'mDowód',
    backgroundImage: C.documentBackgrounds.idWide,
    trailing: h(C.NativeIcon, { name: 'chevron-right' }),
  },
  DocumentTile: {
    title: 'mDowód',
    icon: h(C.NativeIcon, { name: 'id-logo', size: 32 }),
    artwork: 'id',
    tone: 'blue',
    style: { width: '100%', maxWidth: 168 },
  },
  EmptyState: {
    icon: serviceIcon,
    title: 'Nie masz jeszcze spraw',
    description: 'Nowe sprawy pojawią się w tym miejscu.',
    action: h(C.Button, null, 'Przejdź do usług'),
  },
  IconButton: {
    label: 'Dodaj dokument',
    size: 'lg',
    variant: 'secondary',
    children: h(C.NativeIcon, { name: 'plus' }),
  },
  ListRow: {
    icon,
    title: 'Historia zmian',
    description: 'Sprawdź wcześniejsze działania',
    onClick: noop,
  },
  NativeIcon: { name: 'documents', size: 32, title: 'Dokumenty' },
  OfficialIcon: {
    name: C.officialIconNames.find((name) => name.includes('/Outline/')) ?? C.officialIconNames[0],
    size: 40,
    title: 'Dokumenty',
  },
  Pagination: { page: 1, total: 12, onPageChange: noop },
  Progress: { value: 40, label: 'Przesyłanie pliku' },
  Radio: { label: 'Powiadomienia e-mail', value: 'email', defaultChecked: true },
  SearchField: { label: 'Szukaj usług', placeholder: 'Szukaj', defaultValue: '', disabled: false },
  Select: {
    label: 'Sposób powiadomienia',
    options: optionItems,
    defaultValue: 'email',
    hint: 'Wybierz jedną opcję.',
  },
  ServiceIcon: { name: 'pesel', size: 48, title: 'Zastrzeż PESEL', theme: 'light' },
  ServiceTile: {
    icon: serviceIcon,
    title: 'Zastrzeż PESEL',
    description: 'Chroń swoje dane',
    onClick: noop,
  },
  Sidebar: {
    title: 'mObywatel',
    items: navigation,
    value: 'documents',
    onValueChange: noop,
    mode: 'static',
  },
  Skeleton: { width: '100%', height: 80, rounded: true },
  Spinner: { label: 'Ładowanie danych', size: 32 },
  Switch: { label: 'Powiadomienia', defaultChecked: false, disabled: false },
  Tabs: { items: tabs, defaultValue: 'first' },
  TextArea: {
    label: 'Dodatkowe informacje',
    placeholder: 'Wpisz wiadomość',
    hint: 'Nie wpisuj danych wrażliwych.',
    maxLength: 250,
  },
  TextField: {
    label: 'Nazwa sprawy',
    placeholder: 'Wpisz nazwę',
    hint: 'Przykładowe pole tekstowe.',
    disabled: false,
    type: 'text',
    clearable: true,
  },
  Tooltip: {
    content: 'Dodatkowe informacje o działaniu.',
    children: h(C.Button, { variant: 'secondary' }, 'Więcej informacji'),
  },
  BarcodeCard: {
    title: 'Przykładowy kod',
    value: '123456789012',
    description: 'Kod demonstracyjny, bez danych osobowych.',
  },
  BarcodeGraphic: { value: '123456789012', format: 'CODE128', displayValue: true },
  BottomSheet: {
    title: 'Wybierz działanie',
    description: 'Dostępne działania dla tej pozycji.',
    trigger: sampleButton,
    children: h(M.NativeSingleCard, {
      title: 'Zobacz szczegóły',
      description: 'Przejdź do informacji',
      icon,
    }),
    allowHalfExpanded: true,
  },
  BulletPoint: { children: 'Przygotuj potrzebne dokumenty przed rozpoczęciem.' },
  CardList: {
    items: [
      { title: 'Powiadomienia', description: 'Zarządzaj sposobem kontaktu', icon },
      { title: 'Bezpieczeństwo', description: 'Chroń swoje dane', icon: serviceIcon },
    ],
  },
  CardStack: {
    children: [
      h(M.NativeSingleCard, {
        key: 'first',
        title: 'Dokumenty',
        description: 'W jednym miejscu',
        icon,
      }),
      h(M.NativeSingleCard, {
        key: 'second',
        title: 'Usługi',
        description: 'Dostępne online',
        icon,
      }),
    ],
  },
  ChatBubble: {
    direction: 'incoming',
    content: [{ type: 'text', value: 'W czym mogę Ci pomóc?' }],
    label: 'Asystent',
    additionalInfo: 'Przykładowa wiadomość',
  },
  CheckboxGroup: { label: 'Sposoby kontaktu', options: choices, defaultValue: ['email'] },
  DocumentRow: {
    title: 'mDowód',
    description: 'Dokument w aplikacji',
    thumbnail: h(C.NativeIcon, { name: 'id-logo', size: 32 }),
    onClick: noop,
  },
  FieldError: { children: 'Uzupełnij wymagane pole.' },
  FieldHelper: { children: 'Wpisz dane w wymaganym formacie.' },
  FileSourceItem: {
    label: 'Wybierz z plików',
    icon: h(C.NativeIcon, { name: 'apply' }),
    onClick: noop,
  },
  FilterControl: { label: 'Filtruj usługi', items: optionItems, defaultValue: 'email' },
  IconPage: {
    icon: serviceIcon,
    title: 'Gotowe',
    description: 'Zmiany zostały zapisane.',
    children: h(C.Button, null, 'Wróć do usług'),
  },
  IconSurface: { children: serviceIcon, size: 72 },
  IllustrationPage: { ...page, children: h(C.Button, null, 'Dalej') },
  InfoRow: { title: 'Status sprawy', description: 'W trakcie realizacji', icon },
  InfoRowList: {
    items: [
      { title: 'Status sprawy', description: 'W trakcie realizacji', icon },
      { title: 'Data złożenia', description: '20.10.2026', icon },
    ],
  },
  InputDateTime: {
    label: 'Termin wizyty',
    type: 'date',
    value: '2026-10-20',
    onClick: noop,
    hint: 'Naciśnij, aby wybrać termin.',
  },
  ListHeader: { title: 'Ochrona danych', description: 'Dostępne usługi' },
  MaskedField: { label: 'Kod pocztowy', mask: '##-###', defaultValue: '', placeholder: '00-000' },
  MobileAnnouncement: { icon: serviceIcon, children: 'Wybierz usługę, aby sprawdzić szczegóły.' },
  MobileBanner: { tone: 'info', children: 'Nowa wersja aplikacji jest dostępna.', onDismiss: noop },
  MobileCalendar: { value: '2026-10-20', today: '2026-10-20', onValueChange: noop },
  MobileContentBox: { children: body, shadow: 'light200', padding: 16 },
  MobileDatePicker: {
    label: 'Data wizyty',
    defaultValue: '2026-10-20',
    hint: 'Wybierz dzień w kalendarzu.',
  },
  MobileDialog: {
    title: 'Potwierdź działanie',
    description: 'Czy chcesz zapisać zmiany?',
    trigger: sampleButton,
    children: 'Możesz wrócić do edycji.',
    variant: 'text',
  },
  MobileDialogActions: {
    confirmLabel: 'Zapisz',
    cancelLabel: 'Anuluj',
    onConfirm: noop,
    onCancel: noop,
  },
  MobileDialogClose: { children: 'Zamknij okno' },
  MobileDropdown: { label: 'Sposób kontaktu', options: optionItems, defaultValue: 'email' },
  MobileEmptyState: {
    title: 'Brak wyników',
    description: 'Zmień wyszukiwane hasło i spróbuj ponownie.',
  },
  MobileFilePicker: {
    label: 'Załączniki',
    requirements: ['Wybierz plik PDF lub obraz.'],
    accept: '.pdf,image/png,image/jpeg',
    maxFiles: 3,
  },
  MobileHeader: {
    title: 'Zastrzeż PESEL',
    description: 'Chroń swoje dane osobowe.',
    icon: serviceIcon,
  },
  MobileLink: { children: 'Dowiedz się więcej', href: '#informacje' },
  MobileMenu: {
    label: 'Działania',
    items: [
      { label: 'Zapisz kopię', onSelect: noop },
      { label: 'Usuń pozycję', onSelect: noop, destructive: true },
    ],
  },
  MobileSnackbar: {
    message: 'Zmiany zostały zapisane.',
    duration: 0,
    onDismiss: noop,
    dismissible: true,
  },
  MobileStatusBadge: { children: 'Aktywny', tone: 'success' },
  MobileSwitch: { label: 'Powiadomienia push', defaultChecked: true },
  MobileTextArea: {
    label: 'Opis sprawy',
    defaultValue: '',
    placeholder: 'Wpisz dodatkowe informacje',
    characterLimit: 250,
  },
  MobileTextButton: { children: 'Zobacz wszystkie', onClick: noop },
  MobileTimePicker: { label: 'Godzina wizyty', defaultValue: '10:30' },
  MobileTopAppBar: { title: 'Twoje usługi', size: 'large', variant: 'default', onBack: noop },
  NativeSingleCard: {
    title: 'Powiadomienia',
    description: 'Zarządzaj informacjami z aplikacji',
    icon,
    variant: 'clickable',
    onClick: noop,
  },
  NotificationBadge: { count: 3 },
  Onboarding: {
    pages: [
      page,
      {
        ...page,
        title: 'Korzystaj bezpiecznie',
        description: 'Wybierz ustawienia dopasowane do swoich potrzeb.',
      },
    ],
    onComplete: noop,
  },
  PageIndicator: { count: 4, page: 1 },
  Pager: {
    label: 'Nowe możliwości',
    pages: [
      {
        content: h(M.NativeSingleCard, {
          title: 'Dokumenty',
          description: 'Zawsze przy Tobie',
          icon,
        }),
      },
      {
        content: h(M.NativeSingleCard, {
          title: 'Usługi',
          description: 'Załatwiaj sprawy online',
          icon,
        }),
      },
    ],
  },
  PhoneField: {
    label: 'Numer telefonu',
    defaultValue: { countryCode: '+48', number: '' },
    placeholder: '123 456 789',
    hint: 'Numer demonstracyjny.',
  },
  PinInput: { label: 'Wpisz kod PIN', length: 6, defaultValue: '', masked: true },
  QRCodeCard: {
    title: 'Przykładowy kod QR',
    value: 'https://example.com/przyklad',
    description: 'Prowadzi do domeny example.com.',
  },
  QRCodeGraphic: { value: 'https://example.com/przyklad', size: 200, label: 'Przykładowy kod QR' },
  RadioGroup: {
    label: 'Preferowany kontakt',
    options: choices,
    defaultValue: 'email',
    variant: 'default',
  },
  ResultModal: {
    title: 'Zapisano zmiany',
    icon: serviceIcon,
    data: [
      { label: 'Status', value: 'Gotowe' },
      { label: 'Data', value: '20.10.2026' },
    ],
    trigger: sampleButton,
  },
  RichText: {
    segments: [
      { type: 'text', value: 'Zapoznaj się z informacjami oraz ' },
      { type: 'link', value: 'zasadami korzystania', url: 'https://example.com' },
    ],
  },
  SectionHeader: { title: 'Popularne usługi', children: 'Wybierz usługę' },
  SegmentedControl: {
    label: 'Widok usług',
    items: [
      { value: 'all', label: 'Wszystkie' },
      { value: 'favorite', label: 'Ulubione' },
    ],
    defaultValue: 'all',
  },
  ServiceWelcomePage: {
    topBarTitle: 'Usługa',
    header: { title: 'Zastrzeż PESEL', description: 'Chroń swoje dane.', icon: serviceIcon },
    children: h(C.Button, null, 'Rozpocznij'),
  },
  ShortcutTile: { title: 'Zastrzeż PESEL', icon: serviceIcon, onClick: noop },
  SmallServiceCard: {
    title: 'Punkty karne',
    icon: h(C.NativeIcon, { name: 'penalty-points', size: 40 }),
    onClick: noop,
  },
  SnackbarProvider: { maxVisible: 3 },
  SupportPage: {
    topBarTitle: 'Potwierdzenie',
    title: 'Wszystko gotowe',
    icon: serviceIcon,
    description: 'Twoje zmiany zostały zapisane.',
    children: h(C.Button, null, 'Wróć do usług'),
  },
  Timeline: {
    items: [
      {
        header: '20.10.2026',
        title: 'Wniosek przyjęty',
        descriptions: ['Dokument został przekazany do realizacji.'],
      },
      {
        header: '19.10.2026',
        title: 'Wniosek wysłany',
        descriptions: ['Zarejestrowano nową sprawę.'],
      },
    ],
  },
  TypingIndicator: {},
  PortalAccountMenu: {
    name: 'Konto demonstracyjne',
    items: [
      { id: 'profile', label: 'Ustawienia konta', onSelect: noop },
      { id: 'logout', label: 'Wyloguj', onSelect: noop },
    ],
  },
  PortalBanner: {
    heading: 'Twoje sprawy w jednym miejscu',
    description: 'Korzystaj z usług i zarządzaj swoimi dokumentami.',
    actions: h(C.Button, { reversed: true, variant: 'secondary' }, 'Sprawdź usługi'),
    dismissible: true,
  },
  PortalBreadcrumbs: {
    items: [
      { id: 'home', label: 'Strona główna', href: '#start' },
      { id: 'current', label: 'Twoje sprawy' },
    ],
    variant: 'path',
  },
  PortalCalendar: { defaultValue: '2026-10-20', defaultMonth: '2026-10-01' },
  PortalCard: {
    heading: 'Twoje sprawy',
    children: body,
    footer: h(C.Button, { variant: 'secondary' }, 'Zobacz wszystkie'),
  },
  PortalCardHeader: { children: 'Twoje sprawy' },
  PortalCardContent: { children: body },
  PortalCardFooter: { children: h(C.Button, { variant: 'secondary' }, 'Zobacz wszystkie') },
  PortalCharacterCounter: {
    value: 'Proszę o kontakt w sprawie złożonego wniosku.',
    maxLength: 250,
    mode: 'used',
  },
  PortalChip: { children: 'Ulubione', selectable: true, selected: false },
  PortalDashboard: {
    cases: h(P.PortalCard, { heading: 'Sprawy' }, 'Brak nowych spraw.'),
    payments: h(P.PortalCard, { heading: 'Płatności' }, 'Brak oczekujących płatności.'),
    catalog: h(P.PortalCard, { heading: 'Katalog usług' }, 'Wybierz usługę.'),
    popular: h(P.PortalCard, { heading: 'Popularne' }, 'Najczęściej wybierane usługi.'),
    calendar: h(
      'div',
      { style: { maxWidth: 360 } },
      h(P.PortalCalendar, { defaultValue: '2026-10-20' }),
    ),
  },
  PortalDashboardTile: { heading: 'Twoje sprawy', children: body },
  PortalDataTable: {
    caption: 'Przykładowe sprawy',
    rows: [
      { id: '1', name: 'Wniosek o informację', status: 'W realizacji' },
      { id: '2', name: 'Zgłoszenie', status: 'Zakończone' },
    ],
    columns: [
      { key: 'name', header: 'Sprawa', sortable: true },
      { key: 'status', header: 'Status' },
    ],
    rowKey: (row: { id: string }) => row.id,
  },
  PortalDatePicker: {
    label: 'Data wizyty',
    defaultValue: '2026-10-20',
    hint: 'Format rrrr-mm-dd.',
  },
  PortalDialog: {
    title: 'Zapisz zmiany',
    description: 'Sprawdź informacje przed zatwierdzeniem.',
    children: body,
    trigger: sampleButton,
    size: 'medium',
    footer: h(C.Button, null, 'Potwierdź'),
  },
  PortalDialogClose: { children: 'Zamknij' },
  PortalDialogContent: { children: body },
  PortalDialogFooter: { children: h(C.Button, null, 'Potwierdź') },
  PortalDialogHeader: {
    title: 'Potwierdź zmianę',
    description: 'Po zapisaniu wrócisz do szczegółów sprawy.',
  },
  PortalDialogProvider: {},
  PortalDialogRoot: {},
  PortalDialogSurface: { size: 'medium' },
  PortalDialogTrigger: { children: 'Otwórz okno' },
  PortalEmptyState: { variant: 'cases' },
  PortalErrorView: {
    code: '404',
    heading: 'Nie znaleziono strony',
    description: 'Sprawdź adres lub wróć na stronę główną.',
    actions: h(C.Button, null, 'Wróć na stronę główną'),
  },
  PortalExternalLink: {
    children: 'Informacje o usłudze',
    href: 'https://example.com',
    showIcon: true,
  },
  PortalFileUpload: {
    label: 'Dodaj załączniki',
    hint: 'PDF lub obraz, maksymalnie 5 MB.',
    accept: '.pdf,image/jpeg,image/png',
    multiple: true,
    maxFileSize: 5 * 1024 * 1024,
  },
  PortalFooter: { groups: [{ title: 'Informacje', links: plainLinks }] },
  PortalFormField: {
    label: 'Nazwa sprawy',
    hint: 'Podaj krótką nazwę.',
    required: true,
    children: h('input', { placeholder: 'Wpisz nazwę' }),
  },
  PortalFormHelperText: { children: 'Wpisz nazwę pozwalającą rozpoznać sprawę.' },
  PortalFormLabel: { children: 'Nazwa sprawy' },
  PortalFormMessage: { children: 'Uzupełnij wymagane pole.' },
  PortalHeader: {
    brand: h(P.PortalLogoInformation, { label: 'mObywatel' }),
    account: h(P.PortalAccountMenu, {
      name: 'Konto demonstracyjne',
      items: [{ id: 'settings', label: 'Ustawienia', onSelect: noop }],
    }),
    menuOpen: false,
    onMenuClick: noop,
  },
  PortalIcon: { name: 'AE_check', size: 32, title: 'Potwierdzenie' },
  PortalInfoTip: {
    label: 'Co oznacza ten status?',
    children: 'Sprawa została przyjęta i oczekuje na rozpatrzenie.',
  },
  PortalLoader: { label: 'Ładowanie danych', size: 32, loading: true },
  PortalLogoInformation: { label: 'mObywatel', height: 40 },
  PortalMenu: {
    label: 'Działania',
    items: [
      { id: 'details', label: 'Zobacz szczegóły', onSelect: noop },
      { id: 'download', label: 'Pobierz plik', onSelect: noop },
    ],
  },
  PortalMessage: { title: 'Informacja', children: 'Zmiany zostały zapisane.', tone: 'info' },
  PortalPageTitle: {
    heading: 'Katalog usług',
    description: 'Wybierz sprawę, którą chcesz załatwić.',
  },
  PortalPagination: { total: 124, pageSize: 10, defaultPage: 0 },
  PortalPanel: {
    heading: 'Dodatkowe informacje',
    children: body,
    collapsible: true,
    defaultOpen: true,
  },
  PortalPanelContent: { children: body },
  PortalPanelFooter: { children: h(C.Button, { variant: 'secondary' }, 'Zobacz więcej') },
  PortalPanelHeader: { children: 'Dodatkowe informacje' },
  PortalProgress: { label: 'Postęp przesyłania', value: 40, max: 100, size: 'large' },
  PortalRadioGroup: { label: 'Preferowany kontakt', options: choices, defaultValue: 'email' },
  PortalSelect: {
    label: 'Wybierz usługę',
    options: choices,
    defaultValue: 'email',
    searchable: true,
    hint: 'Wpisz, aby wyszukać opcję.',
  },
  PortalServiceCatalog: {
    items: [
      {
        id: 'pesel',
        title: 'Zastrzeż PESEL',
        description: 'Chroń swoje dane osobowe.',
        action: h(C.Button, { variant: 'secondary' }, 'Przejdź do usługi'),
      },
      {
        id: 'points',
        title: 'Punkty karne',
        description: 'Sprawdź liczbę punktów.',
        action: h(C.Button, { variant: 'secondary' }, 'Sprawdź'),
      },
    ],
  },
  PortalServiceLinks: { items: links },
  PortalShell: {
    navigation: links,
    value: 'documents',
    children: h(P.PortalPageTitle, { heading: 'Twoje sprawy' }),
    contentLabel: 'Sprawy i usługi',
  },
  PortalSidebar: { items: links, value: 'documents', onValueChange: noop, mode: 'static' },
  PortalSnackbar: { message: 'Zmiany zostały zapisane.', tone: 'success', duration: 0 },
  PortalSnackbarProvider: { maxVisible: 3, position: 'bottom-right' },
  PortalStatusText: { children: 'Wniosek został przyjęty.', tone: 'success' },
  PortalWidgetIcon: { name: 'affairs', size: 64 },
  LandingArticle: {
    title: 'Dokumenty i usługi w telefonie',
    lead: 'Poznaj możliwości aplikacji.',
    date: '20.10.2026',
    children: h('p', null, body),
    image: { src: L.landingAssets.news1, alt: 'Ilustracja artykułu' },
  },
  LandingAwards: {
    title: 'Projekt rozwijany wspólnie',
    image: {
      src: L.landingAssets.awardsDesktop,
      alt: 'Trzy odznaki: dostępność, otwartość i współpraca',
    },
    mobileImage: L.landingAssets.awardsMobile,
  },
  LandingBreadcrumbs: {
    items: [{ label: 'Strona główna', href: '#start' }, { label: 'Dokumenty' }],
  },
  LandingButton: { children: 'Pobierz aplikację', variant: 'primary', disabled: false },
  LandingCatalogCard: { item: catalogItems[0] },
  LandingCatalogListing: {
    title: 'Usługi w aplikacji',
    items: catalogItems,
    description: 'Wyszukaj usługę lub wybierz kategorię.',
  },
  LandingCombobox: {
    label: 'Kategoria',
    options: [
      { value: 'all', label: 'Wszystkie' },
      { value: 'documents', label: 'Dokumenty' },
      { value: 'services', label: 'Usługi' },
    ],
    defaultValue: 'all',
  },
  LandingCookieConsent: {
    open: false,
    storageKey: 'mdesign-storybook-consent',
    title: 'Dbamy o Twoją prywatność',
  },
  LandingDocumentCarousel: {
    title: 'Dokumenty w aplikacji',
    items: [
      { id: 'id', title: 'mDowód', href: '#mdowod', image: L.landingAssets.documentID },
      {
        id: 'family',
        title: 'Karta Dużej Rodziny',
        href: '#rodzina',
        image: L.landingAssets.documentFamily,
      },
    ],
    defaultValue: 0,
  },
  LandingDownloadCTA: {
    title: 'Pobierz aplikację mObywatel',
    description: 'Dokumenty i usługi zawsze przy Tobie.',
    variant: 'card',
  },
  LandingDownloadPanel: {
    title: 'Pobierz aplikację',
    description: 'Zeskanuj kod QR lub wybierz sklep.',
    trigger: h(L.LandingButton, null, 'Pobierz aplikację'),
  },
  LandingFAQ: {
    items: [
      {
        id: 'first',
        question: 'Jak pobrać aplikację?',
        answer: 'Wybierz swój sklep z aplikacjami i zainstaluj mObywatela.',
      },
      {
        id: 'second',
        question: 'Czy korzystanie jest bezpłatne?',
        answer: 'Aplikacja jest dostępna bezpłatnie.',
      },
    ],
  },
  LandingFooter: {
    groups: [
      { title: 'Aplikacja', links: plainLinks },
      {
        title: 'Informacje',
        links: [
          { label: 'Pomoc', href: '#pomoc' },
          { label: 'Kontakt', href: '#kontakt' },
        ],
      },
    ],
  },
  LandingHeader: {
    items: [
      { label: 'Dokumenty', href: '#dokumenty', children: plainLinks },
      { label: 'Usługi', href: '#uslugi' },
    ],
    position: 'flow',
    downloadLabel: 'Pobierz aplikację',
    onDownload: noop,
    onNavigate: noop,
  },
  LandingHero: {
    title: 'Twoje dokumenty i usługi w telefonie',
    lead: 'Korzystaj z aplikacji, gdy potrzebujesz dokumentu lub chcesz załatwić sprawę.',
    variant: 'detail',
    image: { src: L.landingAssets.hero, alt: 'Interfejs aplikacji z kartami i listą usług' },
    actions: h(L.LandingButton, null, 'Pobierz aplikację'),
  },
  LandingIcon: { name: 'check', size: 32, title: 'Potwierdzenie' },
  LandingInfoSection: {
    title: 'Wygodny dostęp do usług',
    children: h('p', null, body),
    tone: 'blue',
  },
  LandingLink: { children: 'Poznaj możliwości', href: '#mozliwosci', variant: 'link' },
  LandingLoader: { label: 'Ładowanie informacji' },
  LandingNewsCard: { item: news[0] },
  LandingNewsList: { items: news, title: 'Aktualności' },
  LandingPressCard: {
    title: 'Materiały prasowe',
    description: 'Informacje o projekcie, jego komponentach i możliwościach wykorzystania.',
    href: 'https://example.com/materialy.pdf',
    format: 'PDF',
    sizeBytes: 2000000,
  },
  LandingProvider: { animationsDisabled: false },
  LandingSearchField: { label: 'Szukaj w serwisie', placeholder: 'Wyszukaj', defaultValue: '' },
  LandingServiceCard: {
    title: 'Zastrzeż PESEL',
    description: 'Chroń swoje dane osobowe.',
    href: '#pesel',
    image: { src: L.landingAssets.servicePesel, alt: '' },
    icon: h('img', { src: L.landingAssets.servicePeselIcon, alt: '' }),
  },
  LandingSitemap: {
    groups: [
      { title: 'Aplikacja', links: plainLinks },
      { title: 'Wsparcie', links: [{ label: 'Pytania i odpowiedzi', href: '#pytania' }] },
    ],
  },
  LandingSocialBanner: {
    title: 'Twórz z nami lepsze interfejsy',
    description:
      'Poznaj nowe komponenty, podziel się pomysłem i sprawdź, nad czym pracuje społeczność mDesign.',
    image: {
      src: L.landingAssets.community,
      alt: 'Połączone karty rozmów, pomysłów i aktualności',
    },
    links: [
      { label: 'Kod projektu', href: 'https://github.com/slominskiwiktor/mdesign-react' },
      { label: 'Zgłoś pomysł', href: 'https://github.com/slominskiwiktor/mdesign-react/issues' },
      {
        label: 'Historia zmian',
        href: 'https://github.com/slominskiwiktor/mdesign-react/blob/main/CHANGELOG.md',
      },
    ],
  },
  LandingStatistics: {
    title: 'Plan warsztatów projektowych',
    items: [
      { value: '3', label: 'bloki tematyczne' },
      { value: '12', label: 'zadań zespołowych' },
    ],
  },
  LandingTabs: { items: tabs, defaultValue: 'first' },
  LandingTooltip: {
    content: 'Dowiedz się więcej o wybranej funkcji.',
    children: h(L.LandingButton, { variant: 'secondary' }, 'Więcej informacji'),
  },
  LandingUtilityBar: { signLanguageHref: '#migowy', onAnimationsDisabledChange: noop },
  LandingVideo: {
    title: 'Kwiaty w ogrodzie',
    src: 'https://developer.mozilla.org/shared-assets/videos/flower.mp4',
    poster: L.landingAssets.community,
    presentation: 'dialog',
    description:
      'Film demonstracyjny MDN, nie materiał mObywatela. Wideo jest pobierane dopiero po świadomym otwarciu odtwarzacza.',
  },
};

const composed = new Set([
  'PortalCardHeader',
  'PortalCardContent',
  'PortalCardFooter',
  'PortalPanelHeader',
  'PortalPanelContent',
  'PortalPanelFooter',
  'PortalDialogRoot',
  'PortalDialogSurface',
  'PortalDialogHeader',
  'PortalDialogContent',
  'PortalDialogFooter',
  'PortalDialogTrigger',
  'PortalDialogClose',
  'PortalFormLabel',
  'PortalFormHelperText',
  'PortalFormMessage',
  'MobileDialogClose',
  'MobileDialogActions',
  'PortalDialogProvider',
  'PortalSnackbarProvider',
  'SnackbarProvider',
  'LandingProvider',
  'InputDateTime',
]);
const descriptions: Record<string, string> = {
  Button:
    'Podstawowa akcja. Wariant, rozmiar, blokada i ładowanie są rzeczywistymi propsami publicznego komponentu.',
  SearchField:
    'Wyszukiwanie: mobilna geometria36px, podpis dostępny dla czytnika ekranu i przycisk czyszczenia.',
  TextField:
    'Pole formularza z etykietą, podpowiedzią, błędem oraz mobilnym czyszczeniem i przełączaniem hasła.',
  PortalBanner:
    'Baner z tytułem, treścią i opcjonalną akcją. Parametry visible oraz onVisibleChange pozwalają sterować jego wyświetlaniem po zamknięciu.',
  PortalShell:
    'Kompletny shell portalu. Historia działa w osobnym iframe Canvas Storybooka, więc stała nawigacja nie wychodzi do strony dokumentacji.',
  MobileDialogClose:
    'Część kompozycyjna Radix Close. Przykład zawiera nadrzędny MobileDialog i rzeczywiście zamyka okno.',
  PortalDialogProvider:
    'Provider kolejki dialogów. Przycisk uruchamia hook usePortalDialog i pokazuje wynik Promise.',
  PortalSnackbarProvider:
    'Provider kolejki komunikatów. Przycisk używa hooka usePortalSnackbar; nie jest to statyczny mock.',
  SnackbarProvider:
    'Mobilna kolejka komunikatów z hookiem useSnackbar. Otwórz kilka komunikatów, aby sprawdzić limit.',
  LandingProvider:
    'Zakres motywu Lato i preferencji animacji. Zmiana preferencji jest widoczna w atrybucie data-motion.',
  LandingCookieConsent:
    'Lokalny adapter zgód. Otwórz panel, zmień kategorie i zapisz decyzję. Opcjonalne zgody są domyślnie wyłączone; przykład nie ładuje analityki.',
  LandingVideo:
    'Odtwarzacz uruchamiany świadomie przez użytkownika. Domyślny film pochodzi z przykładu HTML video w MDN; nie jest reklamą ani materiałem mObywatela. Film nie jest pobierany przy samym renderze miniatury.',
  OfficialIcon:
    'Ikona z katalogu SVG udostępnionego z biblioteką. Parametr name wybiera symbol, size ustala rozmiar, a title nadaje dostępną nazwę.',
  DocumentTile:
    'Kafel dokumentu z ikoną, ilustracją i tytułem. Wariant artwork wybiera neutralną grafikę, a tone ustala kolor powierzchni.',
};
const purposes = Object.fromEntries(
  [
    [
      'Accordion LandingFAQ',
      'Rozwijana lista pytań lub sekcji treści. Otwórz pozycję, aby odsłonić odpowiedź bez opuszczania bieżącego widoku.',
    ],
    [
      'Alert MobileAnnouncement PortalMessage PortalStatusText',
      'Komunikat informacyjny, potwierdzenie lub błąd. Treść i stan są opisane tekstowo, a kolor stanowi dodatkowe oznaczenie.',
    ],
    [
      'AppHeader PortalHeader',
      'Górny pasek z marką, nawigacją i slotami akcji. Przykład pokazuje sam nagłówek; pełny układ z szufladą jest w PortalShell.',
    ],
    [
      'Avatar',
      'Reprezentacja użytkownika przez zdjęcie lub inicjały. Imię w przykładzie służy wyłącznie demonstracji fallbacku.',
    ],
    [
      'Badge MobileStatusBadge NotificationBadge',
      'Krótkie oznaczenie statusu lub liczby nowych pozycji. Zmień treść, ton albo liczbę bez zmiany otaczającego układu.',
    ],
    [
      'BottomNavigation',
      'Dolna nawigacja aplikacji z aktywną ikoną, etykietą i opcjonalnym wskaźnikiem obszaru systemowego. Wybór aktualizuje aria-current.',
    ],
    [
      'Breadcrumbs PortalBreadcrumbs LandingBreadcrumbs',
      'Ścieżka bieżącego widoku z linkami do nadrzędnych stron. Ostatnia pozycja reprezentuje aktualną stronę.',
    ],
    [
      'Card PortalCard PortalPanel MobileContentBox',
      'Kontener treści z własną geometrią powierzchni. Nagłówek, treść i stopkę można przekazać przez publiczne sloty; panel obsługuje także rozwijanie.',
    ],
    [
      'Checkbox',
      'Niezależny wybór tak/nie z widoczną etykietą. Kilka checkboxów można zaznaczyć równocześnie; grupę pokazuje CheckboxGroup.',
    ],
    [
      'Dialog MobileDialog PortalDialog',
      'Modalne okno z nagłówkiem, treścią i akcjami. Wyzwalacz otwiera prawdziwy dialog z obsługą fokusu i Escape.',
    ],
    [
      'Divider',
      'Dekoracyjny separator oddzielający sąsiadujące grupy treści. Nie wymaga interakcji ani dodatkowego fokusu.',
    ],
    [
      'DocumentArtwork',
      'Ilustracja tła kafla dokumentu. Zmień wariant id, pension, family lub vehicles, aby sprawdzić odpowiadającą mu kompozycję.',
    ],
    [
      'DocumentCard',
      'Szeroka karta przeglądu dokumentu z tłem, tytułem i końcowym slotem akcji. Dane osobowe i personalizowany dokument nie są częścią przykładu.',
    ],
    [
      'EmptyState MobileEmptyState PortalEmptyState',
      'Stan pustej listy z wyjaśnieniem i opcjonalnym następnym krokiem. Pokazuje użytkownikowi, co może zrobić po braku wyników lub spraw.',
    ],
    [
      'IconButton',
      'Przycisk z ikoną i obowiązkową dostępną nazwą. Rozmiar określa cel interakcji, a wariant wygląd powierzchni.',
    ],
    [
      'ListRow NativeSingleCard',
      'Wiersz treści z tytułem, opisem i opcjonalną akcją. NativeSingleCard udostępnia także warianty checkbox, radio i usuwania.',
    ],
    [
      'NativeIcon ServiceIcon PortalIcon LandingIcon PortalWidgetIcon',
      'Ikona z właściwego rejestru danej powierzchni. Wybierz nazwę, rozmiar i dostępny tytuł; dekoracyjne ikony pozostaw bez tytułu.',
    ],
    [
      'Pagination PortalPagination',
      'Nawigacja pomiędzy stronami wyników z oznaczeniem aktywnej strony. Zmiana numeru jest obsługiwana przez stan przykładu.',
    ],
    [
      'Progress PortalProgress',
      'Wskaźnik postępu operacji. Ustaw wartość liczbową lub stan nieokreślony, gdy końcowego czasu nie da się przewidzieć.',
    ],
    [
      'Radio',
      'Pojedyncza opcja wyboru w grupie o tej samej nazwie. Do kompletnego wyboru z etykietą i błędem służą RadioGroup lub PortalRadioGroup.',
    ],
    [
      'Select MobileDropdown PortalSelect LandingCombobox',
      'Wybór opcji z listy z etykietą. Poszczególne powierzchnie zachowują swoje natywne zachowanie; PortalSelect obsługuje też wyszukiwanie i wielokrotny wybór.',
    ],
    [
      'ServiceTile ShortcutTile SmallServiceCard LandingServiceCard',
      'Karta prowadząca do konkretnej usługi. Nazwa i ikona opisują cel, a opis lub ilustracja dostarczają kontekstu.',
    ],
    [
      'Sidebar PortalSidebar',
      'Samodzielna nawigacja boczna z aktywną pozycją i opcjonalnymi grupami. To część układu; zachowanie całej szuflady pokazuje PortalShell.',
    ],
    [
      'Skeleton',
      'Placeholder geometrii oczekującej treści. Ustaw szerokość i wysokość zgodne z docelowym fragmentem interfejsu.',
    ],
    [
      'Spinner PortalLoader LandingLoader',
      'Wskaźnik trwającego ładowania z dostępną etykietą. PortalLoader może dodatkowo przykrywać zawartość powierzchnią oczekiwania.',
    ],
    [
      'Switch MobileSwitch',
      'Przełącznik ustawienia działającego natychmiast. Etykieta pozostaje stała, a stan można zmieniać interakcją lub parametrem checked.',
    ],
    [
      'Tabs LandingTabs',
      'Zakładki przełączające powiązane panele bez zmiany strony. Aktywna zakładka steruje widoczną treścią i stanem ARIA.',
    ],
    [
      'TextArea MobileTextArea',
      'Wielowierszowe pole tekstowe z etykietą, podpowiedzią i błędem. Mobilny wariant może pokazywać limit znaków.',
    ],
    [
      'Tooltip LandingTooltip PortalInfoTip',
      'Krótka podpowiedź dostępna po wskazaniu lub fokusie. Wyzwalacz pozostaje elementem klawiaturowym, a podpowiedź nie zastępuje istotnej etykiety.',
    ],
    [
      'BarcodeCard BarcodeGraphic',
      'Rzeczywiście zakodowany kod kreskowy z wartości demonstracyjnej. Zmiana value lub formatu zmienia wygenerowany symbol.',
    ],
    [
      'QRCodeCard QRCodeGraphic',
      'Rzeczywiście zakodowany kod QR. Domyślnie prowadzi do domeny example.com i nie zawiera danych osobowych.',
    ],
    [
      'BottomSheet',
      'Mobilny panel wysuwany od dołu z tytułem i treścią. Otwórz panel i sprawdź zamknięcie lub dostępny stan połowiczny.',
    ],
    [
      'BulletPoint',
      'Pozycja listy wskazówek z własnym znacznikiem. Treść może zawierać bogatsze elementy React bez zastępowania semantyki listy.',
    ],
    [
      'CardList InfoRowList',
      'Lista powtarzalnych wierszy z publicznej tablicy items. Zmień tytuły i opisy, aby sprawdzić zawijanie oraz odstępy.',
    ],
    [
      'CardStack',
      'Wizualny stos kart z kolejnością wynikającą z children. Każda karta zachowuje swoje własne dostępne akcje i treść.',
    ],
    [
      'ChatBubble',
      'Wiadomość konwersacji z kierunkiem, treścią i dodatkowymi informacjami. Obsługuje bogaty tekst oraz stan pisania.',
    ],
    [
      'CheckboxGroup',
      'Powiązana grupa wielokrotnego wyboru. Wartość jest tablicą identyfikatorów zaznaczonych opcji.',
    ],
    [
      'DocumentRow',
      'Kompaktowy wiersz przeglądu dokumentu z miniaturą, nazwą i opisem. Opcjonalna akcja przechodzi do szczegółów pozycji.',
    ],
    [
      'FieldError PortalFormMessage',
      'Tekst błędu walidacji. Przykład części formularza zawiera nadrzędne pole, aby błąd był powiązany z właściwą kontrolką.',
    ],
    [
      'FieldHelper PortalFormHelperText',
      'Tekst pomagający poprawnie wypełnić pole. W kompozycji formularza jest połączony z kontrolką przez aria-describedby.',
    ],
    [
      'FileSourceItem',
      'Akcja wyboru źródła załącznika, np. systemowych plików lub galerii. Przekaż onClick uruchamiające odpowiedni wybór.',
    ],
    [
      'FilterControl',
      'Mobilny wybór filtra zmieniający zakres listy. Wartość identyfikuje aktywny wariant, a etykieta opisuje cel kontrolki.',
    ],
    [
      'IconPage SupportPage',
      'Szablon krótkiego wyniku lub informacji z wyróżnioną ikoną i następnym krokiem. Treść oraz akcje są slotami konsumenta.',
    ],
    [
      'IconSurface',
      'Powierzchnia pod ikoną z ustawianym rozmiarem, kształtem i kolorem. Sama powierzchnia nie dodaje znaczenia dekoracyjnej ikonie.',
    ],
    [
      'IllustrationPage',
      'Szablon objaśnienia z ilustracją, tytułem i treścią. Może zawierać akcję przejścia do kolejnego kroku.',
    ],
    [
      'InfoRow',
      'Prezentacyjny wiersz informacji z nazwą i wartością lub opisem. Nie udaje pola edycyjnego.',
    ],
    [
      'InputDateTime',
      'Pole otwierające wybór daty lub godziny. Przykład składa je z dialogiem i kalendarzem, więc kliknięcie prowadzi do rzeczywistego wyboru.',
    ],
    [
      'ListHeader SectionHeader',
      'Nagłówek grupy treści z opcjonalnym opisem lub akcją. Zachowuje hierarchię sekcji bez tworzenia dodatkowego ekranu.',
    ],
    [
      'MaskedField',
      'Pole formatujące tekst według maski. Wpisuj i kasuj znaki, aby sprawdzić format, kursor i komunikat błędu.',
    ],
    [
      'MobileBanner',
      'Mobilny komunikat o niskim lub wysokim wyróżnieniu. Przykład zamknięcia usuwa komunikat i pozwala pokazać go ponownie.',
    ],
    [
      'MobileCalendar PortalCalendar',
      'Kalendarz z wyborem daty i nawigacją miesięcy. Wartość w przykładzie jest stała początkowo, a interakcja aktualizuje wybór.',
    ],
    [
      'MobileDatePicker PortalDatePicker',
      'Pole daty połączone z wyborem dnia w kalendarzu. Ustaw wartość domyślną, zakres lub błąd i otwórz panel wyboru.',
    ],
    [
      'MobileDialogActions',
      'Zestaw akcji zatwierdzenia i anulowania wewnątrz dialogu. Oba przyciski wywołują callback i zamykają przykładowe okno.',
    ],
    [
      'MobileFilePicker PortalFileUpload',
      'Wybór i walidacja załączników z listą plików. Przykład korzysta z prawdziwego input file; nie wysyła plików na serwer.',
    ],
    [
      'MobileHeader',
      'Mobilny nagłówek usługi z ikoną w powierzchni, tytułem i opisem. Treść nie zawiera nawigacji całej aplikacji.',
    ],
    [
      'MobileLink LandingLink PortalExternalLink',
      'Semantyczny odsyłacz. Href steruje celem, a wariant lub oznaczenie nowego okna wynika z API danej powierzchni.',
    ],
    [
      'MobileMenu PortalMenu PortalAccountMenu',
      'Menu akcji wyzwalane przyciskiem. Każda pozycja ma etykietę oraz callback lub link; wybór zamyka menu.',
    ],
    [
      'MobileSnackbar PortalSnackbar',
      'Krótkotrwałe potwierdzenie z opcjonalną akcją i zamknięciem. Do kolejkowania wielu komunikatów użyj odpowiedniego providera.',
    ],
    [
      'MobileTextButton',
      'Lekka akcja tekstowa używana w mobilnej sekcji lub karcie. Kliknięcie w przykładzie pokazuje informację zwrotną.',
    ],
    [
      'MobileTimePicker',
      'Wybór godziny z etykietą i kontrolą wartości. Otwórz pole, ustaw godzinę i zatwierdź zmianę.',
    ],
    [
      'MobileTopAppBar',
      'Mobilny pasek tytułu z przyciskiem wstecz i slotami akcji. Wariant oraz rozmiar określają geometrię nagłówka.',
    ],
    [
      'Onboarding',
      'Sekwencja stron wprowadzających z kolejnymi krokami i zakończeniem. Przykład ma dwie rzeczywiste strony do przejścia.',
    ],
    [
      'PageIndicator',
      'Oznaczenie aktywnej strony w sekwencji. Page jest indeksem od zera, a count liczbą dostępnych stron.',
    ],
    [
      'Pager',
      'Kontener przełączanych stron z publicznej tablicy pages. Każda strona może zawierać dowolną treść React.',
    ],
    [
      'PhoneField',
      'Pole numeru telefonu z osobnym prefiksem kraju i numerem. Błędy obu części można ustawiać niezależnie.',
    ],
    [
      'PinInput',
      'Segmentowane pole kodu z obsługą wpisywania, kasowania i wklejania. Zmień długość, maskowanie lub błąd bez zmiany etykiety.',
    ],
    [
      'RadioGroup PortalRadioGroup',
      'Wybór jednej opcji z opisanej grupy. Niedostępna opcja pozostaje widoczna i nie przyjmuje wyboru.',
    ],
    [
      'ResultModal',
      'Mobilne okno wyniku z ikoną i listą nazw oraz wartości. Przycisk otwiera prawdziwe okno z obsługą fokusu.',
    ],
    [
      'RichText',
      'Strukturalny tekst z linkami i odwołaniami do źródeł. Nie wykonuje HTML przekazanego jako zwykły tekst segmentu.',
    ],
    [
      'SegmentedControl',
      'Zwarta grupa wzajemnie wykluczających się wariantów widoku. Zmiana wyboru aktualizuje kontrolowany stan.',
    ],
    [
      'ServiceWelcomePage',
      'Szablon wejścia do usługi łączący pasek aplikacji, nagłówek, treść i akcję. Wszystkie elementy pochodzą z publicznych slotów.',
    ],
    [
      'Timeline',
      'Chronologiczna lista zdarzeń z datami i opisami. Kolejność wynika z danych wejściowych, bez ukrytego sortowania.',
    ],
    [
      'TypingIndicator',
      'Dekoracyjna animacja pisania wraz z dostępną informacją o oczekiwaniu. Nie wymaga danych wejściowych.',
    ],
    [
      'PortalCardHeader PortalCardContent PortalCardFooter PortalPanelHeader PortalPanelContent PortalPanelFooter',
      'Część kompozycyjna karty lub panelu. W przykładzie znajduje się w pełnym rodzicu z pozostałymi częściami i właściwymi odstępami.',
    ],
    [
      'PortalCharacterCounter',
      'Licznik użytych lub pozostałych znaków. Value lub count oraz maxLength sterują wynikiem i stanem przekroczenia limitu.',
    ],
    [
      'PortalChip',
      'Kompaktowy chip tekstowy, opcjonalnie wybieralny lub usuwalny. Stan selected można zmieniać interakcją i Controls.',
    ],
    [
      'PortalDashboard',
      'Układ sekcji pulpitu: sprawy, płatności, katalog, popularne usługi i kalendarz. Każdy obszar jest niezależnym slotem.',
    ],
    [
      'PortalDashboardTile',
      'Sekcja pulpitu z nagłówkiem, opcjonalną ikoną i akcją. Treść może przedstawiać listę, pusty stan lub własny komponent.',
    ],
    [
      'PortalDataTable',
      'Tabela danych z podpisem, definicjami kolumn i stabilnym kluczem wiersza. Przykład obsługuje sortowanie wskazanej kolumny.',
    ],
    [
      'PortalDialogRoot PortalDialogSurface PortalDialogHeader PortalDialogContent PortalDialogFooter PortalDialogTrigger PortalDialogClose',
      'Część złożonego dialogu. Przykład zawiera komplet Root, Trigger, Surface, Header, Content i Footer, aby wybrana część działała w poprawnym kontekście.',
    ],
    [
      'PortalErrorView',
      'Widok błędu strony lub operacji z kodem, wyjaśnieniem i akcją odzyskania. Komunikat nie opiera się wyłącznie na ilustracji.',
    ],
    [
      'PortalFooter LandingFooter',
      'Stopka z pogrupowanymi odsyłaczami, marką i odsyłaczami do sklepów. Poszczególne grupy mają czytelne nagłówki nawigacyjne.',
    ],
    [
      'PortalFormField',
      'Kontener pola łączący etykietę, kontrolkę, podpowiedź i błąd. Przypisuje kontrolce identyfikator oraz powiązania dostępności.',
    ],
    [
      'PortalFormLabel',
      'Etykieta pola czerpiąca identyfikator z PortalFormField. Przykład pokazuje pełną kompozycję z powiązanym inputem.',
    ],
    [
      'PortalLogoInformation',
      'Znak projektu z tekstową nazwą serwisu. Parametr height skaluje obraz z zachowaniem proporcji, a label określa podpis.',
    ],
    [
      'PortalPageTitle',
      'Tytuł bieżącego widoku z opcjonalnym opisem. Parametr level pozwala dopasować nagłówek do hierarchii otaczającej strony.',
    ],
    [
      'PortalServiceCatalog',
      'Responsywny katalog usług z tytułem, opisem i akcją każdej pozycji. Nie zastępuje pełnej strony pulpitu.',
    ],
    [
      'PortalServiceLinks',
      'Lista odsyłaczy do usług. Każda pozycja zachowuje własny cel i identyfikator oraz może zawierać ikonę.',
    ],
    [
      'LandingArticle',
      'Szablon artykułu z tytułem, datą, leadem, ilustracją i treścią redakcyjną. Może zawierać powiązane aktualności.',
    ],
    [
      'LandingAwards',
      'Sekcja z ilustracją osiągnięć lub wyróżnień. image i mobileImage pozwalają dobrać osobne grafiki do szerokiego i wąskiego widoku.',
    ],
    [
      'LandingButton',
      'Pigułkowy przycisk landingu z motywem Lato. Wariant primary, secondary lub link zmienia powierzchnię i wyróżnienie akcji.',
    ],
    [
      'LandingCatalogCard',
      'Karta pozycji katalogu z tytułem, opisem, ilustracją i docelowym linkiem. Dane wejściowe są zebrane w item.',
    ],
    [
      'LandingCatalogListing',
      'Lista katalogowa z działającym wyszukiwaniem i wyborem kategorii. Filtrowanie korzysta z jawnie przekazanej tablicy items.',
    ],
    [
      'LandingDocumentCarousel',
      'Karuzela dokumentów z działającymi przyciskami poprzedni i następny. Każdy slajd ma własny obraz, tytuł i odsyłacz.',
    ],
    [
      'LandingDownloadCTA',
      'Sekcja pobrania aplikacji z odsyłaczami do sklepów. Wariant pozwala użyć jej jako sekcji, karty lub zwartej akcji.',
    ],
    [
      'LandingDownloadPanel',
      'Panel pobrania aplikacji z kodem QR i linkami do sklepów. Otwiera się z prawdziwego wyzwalacza i przywraca do niego fokus.',
    ],
    [
      'LandingHeader',
      'Nagłówek marketingowy z menu, rozwijaną nawigacją, językiem i akcją pobrania. Responsywny wariant korzysta z osobnego menu mobilnego.',
    ],
    [
      'LandingHero',
      'Sekcja otwierająca stronę z tytułem, leadem, ilustracją i akcjami. Warianty home, detail i listing zachowują własne układy.',
    ],
    [
      'LandingInfoSection',
      'Pełna sekcja objaśniająca z jasną, niebieską lub ciemną powierzchnią. Treść i akcje pozostają slotami React.',
    ],
    [
      'LandingNewsCard LandingNewsList',
      'Aktualność lub lista aktualności z datą, ilustracją i odsyłaczem do artykułu. Zmień items, aby sprawdzić układ i zawijanie tytułów.',
    ],
    [
      'LandingPressCard',
      'Odsyłacz do materiału prasowego z formatem oraz wielkością pliku. Przykładowy link jest demonstracyjny i nie pobiera pliku automatycznie.',
    ],
    [
      'LandingSearchField',
      'Wyszukiwanie w serwisie z dostępną etykietą i przyciskiem czyszczenia. Wyczyszczenie przywraca fokus do pola.',
    ],
    [
      'LandingSitemap',
      'Hierarchiczna mapa serwisu z grupami odsyłaczy. Nie wymaga skryptu do zwykłej nawigacji po linkach.',
    ],
    [
      'LandingSocialBanner',
      'Sekcja zachęcająca do śledzenia informacji w zewnętrznych kanałach. Linki mają opisane cele.',
    ],
    [
      'LandingStatistics',
      'Zestaw wyróżnionych wartości liczbowych wraz z objaśnieniami. Wartości w przykładzie są demonstracyjne, nie bieżącymi danymi serwisu.',
    ],
    [
      'LandingUtilityBar',
      'Górny pasek pomocniczy z preferencją animacji, odsyłaczem do tłumacza i opcjonalnymi linkami społecznościowymi.',
    ],
  ].flatMap(([names, purpose]) => names.split(' ').map((name) => [name, purpose])),
);
function keyboardFor(name: string) {
  if (name === 'LandingCookieConsent')
    return 'Tab i Shift+Tab poruszają się po oknie. Strzałki zmieniają zakładkę. Escape i kliknięcie poza oknem nie zamykają panelu; wybierz zgodę lub odmowę przyciskiem.';
  if (name === 'MobileTimePicker')
    return 'Enter lub Spacja otwiera okno. Tab przechodzi między polami godzin i minut; wpisz cyfry, następnie wybierz Potwierdź albo Anuluj. Escape zamyka okno.';
  if (name === 'InputDateTime')
    return 'Tab ustawia fokus na przycisku wyboru terminu. Enter lub Spacja otwiera kalendarz albo wybór godziny w tym przykładzie; Escape zamyka okno.';
  if (/Dialog|BottomSheet|DownloadPanel|CookieConsent|ResultModal/.test(name))
    return 'Tab i Shift+Tab poruszają się po oknie; Escape zamyka je i przywraca fokus do elementu otwierającego.';
  if (/Select|Dropdown|Combobox|Menu/.test(name))
    return 'Otwórz Enterem lub Spacją. Strzałki poruszają się po opcjach, Enter wybiera, Escape zamyka. Niedostępne opcje są pomijane.';
  if (/Tabs|Segmented|RadioGroup|Calendar|DatePicker|TimePicker/.test(name))
    return 'Tab przechodzi do kontrolki; strzałki zmieniają aktywną pozycję. Enter lub Spacja zatwierdza wybór. W kalendarzu dostępne są także Home/End.';
  if (/Tooltip/.test(name))
    return 'Tab ustawia fokus na wyzwalaczu. Podpowiedź jest dostępna także bez najeżdżania myszą; Escape ją zamyka.';
  if (/Carousel|Pager|Onboarding/.test(name))
    return 'Użyj przycisków poprzedni/następny klawiaturą. Krok i oznaczenie aktywnej strony zmieniają się w działającym przykładzie.';
  if (/FilePicker|FileUpload/.test(name))
    return 'Tab przechodzi między akcjami dodawania, podglądu i usuwania plików. Enter lub Spacja uruchamia wybraną akcję.';
  if (/Field|Input|Area|Picker/.test(name))
    return 'Tab ustawia fokus na polu. Wpisuj lub wklejaj tekst; opcjonalny przycisk czyszczenia jest osobnym elementem w kolejności Tab.';
  if (
    /Button|Link|Card|Tile|Row|Navigation|Sidebar|Accordion|Switch|Checkbox|Radio|FilterControl/.test(
      name,
    )
  )
    return 'Tab przenosi fokus między interaktywnymi elementami. Enter aktywuje link lub przycisk, Spacja aktywuje przycisk i kontrolkę wyboru.';
  return '';
}
function statesFor(name: string, props: ExampleProp[]): Record<string, ExampleArgs> {
  const names = new Set(props.map((p) => p.name));
  const states: Record<string, ExampleArgs> = {};
  if (names.has('disabled')) states.Disabled = { disabled: true };
  if (names.has('loading')) states.Loading = { loading: true };
  if (names.has('error')) states.Error = { error: 'Sprawdź wpisane dane.' };
  if (names.has('readOnly') && !['Checkbox', 'Radio'].includes(name))
    states.ReadOnly = { readOnly: true };
  if (names.has('checked') && ['Checkbox', 'Radio', 'Switch', 'MobileSwitch'].includes(name))
    states.Checked = { checked: true };
  if (names.has('selected')) states.Selected = { selected: true };
  if (names.has('open')) states.Open = { open: true };
  if (names.has('tone') && props.find((p) => p.name === 'tone')?.type.match(/Tone|"danger"/))
    states.Danger = { tone: 'danger' };
  if (props.some((p) => p.name === 'variant' && p.type.includes('"secondary"')))
    states.Secondary = { variant: 'secondary' };
  if (names.has('passwordToggle'))
    states.Password = { type: 'password', defaultValue: 'PrzykladoweHaslo' };
  if (names.has('multiple') && names.has('options'))
    states.Multiple = { multiple: true, defaultValue: ['email'] };
  return states;
}
export const exampleRegistry: Record<string, ExampleDefinition> = Object.fromEntries(
  manifest.components.map((record) => {
    const category = record.category as ExampleCategory;
    const args = overrides[record.name];
    if (!args) throw new Error('Missing explicit Storybook example: ' + record.name);
    const component = (
      namespaces[category] as unknown as Record<string, ComponentType<ExampleArgs>>
    )[record.name];
    if (!component) throw new Error('Missing public component export: ' + record.name);
    const callable = new Set((apiProps.callableProps as Record<string, string[]>)[record.name]);
    const defaults =
      (apiProps.defaults as Record<string, Record<string, ExampleProp['defaultValue']>>)[
        record.name
      ] ?? {};
    const props = [
      ...record.props,
      ...((apiProps.supplemental as Record<string, ExampleProp[]>)[record.name] ?? []),
    ].map((prop) => ({
      ...prop,
      callable: callable.has(prop.name),
      defaultValue: defaults[prop.name],
    }));
    return [
      record.name,
      {
        name: record.name,
        category,
        component,
        props,
        args,
        states: statesFor(record.name, props),
        composition: composed.has(record.name),
        keyboard: keyboardFor(record.name),
        description:
          descriptions[record.name] ?? purposes[record.name] ?? 'Komponent ' + record.name,
      },
    ];
  }),
);
export function getExample(name: string): ExampleDefinition {
  const found = exampleRegistry[name];
  if (!found) throw new Error('Unknown example: ' + name);
  return found;
}

function controlledPairs(definition: ExampleDefinition): Array<[string, string]> {
  const names = new Set(definition.props.map((prop) => prop.name));
  return definition.props.flatMap((prop) => {
    const match = /^on([A-Z].*)Change$/.exec(prop.name);
    if (!match) return [];
    const value = match[1][0].toLowerCase() + match[1].slice(1);
    return names.has(value) ? [[value, prop.name] as [string, string]] : [];
  });
}
function normalizeArgs(args: ExampleArgs): ExampleArgs {
  const result = { ...args };
  for (const value of ['checked', 'value', 'open', 'expanded', 'animationsDisabled']) {
    if (result[value] !== undefined)
      delete result['default' + value[0].toUpperCase() + value.slice(1)];
  }
  return result;
}
const nativeValueComponents = new Set(['TextField', 'SearchField', 'TextArea', 'Select']);
function MobileNotifications() {
  const api = M.useSnackbar();
  return (
    <C.Button onClick={() => api.show({ message: 'Zmiany zostały zapisane.' })}>
      Pokaż komunikat
    </C.Button>
  );
}
function PortalNotifications() {
  const api = P.usePortalSnackbar();
  return (
    <C.Button onClick={() => api.enqueue({ message: 'Zmiany zostały zapisane.', tone: 'success' })}>
      Pokaż komunikat
    </C.Button>
  );
}
function PortalRequests() {
  const api = P.usePortalDialog();
  const [result, setResult] = useState('');
  return (
    <>
      <C.Button
        onClick={async () =>
          setResult(
            (await api.open({
              title: 'Zapisać zmiany?',
              description: 'Wybierz odpowiedź.',
              content: body,
            }))
              ? 'Potwierdzono'
              : 'Anulowano',
          )
        }
      >
        Otwórz dialog
      </C.Button>
      <p role="status">{result}</p>
    </>
  );
}
function MotionExample({ args }: { args: ExampleArgs }) {
  return (
    <L.LandingProvider {...args}>
      {args.children as ReactNode}
      <L.LandingUtilityBar />
    </L.LandingProvider>
  );
}
function DateTimeExample({ args }: { args: ExampleArgs }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(args.value ?? '2026-10-20'));
  const time = args.type === 'time';
  return (
    <>
      <M.InputDateTime
        {...args}
        label={String(args.label)}
        value={value}
        onClick={() => {
          if (typeof args.onClick === 'function') args.onClick();
          setOpen(true);
        }}
      />
      <M.MobileDialog
        open={open}
        onOpenChange={setOpen}
        title={String(args.label)}
        description="Wybierz termin."
      >
        {time ? (
          <>
            <label>
              Godzina
              <input
                type="time"
                value={/^\d{2}:\d{2}$/.test(value) ? value : '10:30'}
                onChange={(event) => setValue(event.target.value)}
              />
            </label>
            <C.Button onClick={() => setOpen(false)}>Potwierdź</C.Button>
          </>
        ) : (
          <M.MobileCalendar
            value={value}
            onValueChange={(next) => {
              setValue(next);
              setOpen(false);
            }}
          />
        )}
      </M.MobileDialog>
    </>
  );
}
function MobileDialogPartExample({ name, args }: { name: string; args: ExampleArgs }) {
  const [open, setOpen] = useState(false);
  return (
    <M.MobileDialog
      open={open}
      onOpenChange={setOpen}
      title="Potwierdź zmianę"
      description="Możesz zapisać zmiany lub wrócić do edycji."
      trigger={<C.Button>Otwórz dialog</C.Button>}
      actions={
        name === 'MobileDialogActions' ? (
          <M.MobileDialogActions
            {...args}
            onConfirm={() => {
              if (typeof args.onConfirm === 'function') args.onConfirm();
              setOpen(false);
            }}
            onCancel={() => {
              if (typeof args.onCancel === 'function') args.onCancel();
              setOpen(false);
            }}
          />
        ) : undefined
      }
    >
      {name === 'MobileDialogClose' ? h(M.MobileDialogClose, args) : body}
    </M.MobileDialog>
  );
}
function PrimitiveDialog({ name, args }: { name: string; args: ExampleArgs }) {
  const selected = (slot: string, fallback: ReactNode) =>
    name === slot ? h(getExample(name).component, args) : fallback;
  return (
    <P.PortalDialogRoot {...(name === 'PortalDialogRoot' ? args : {})}>
      {selected(
        'PortalDialogTrigger',
        <P.PortalDialogTrigger asChild>
          <C.Button>Otwórz dialog</C.Button>
        </P.PortalDialogTrigger>,
      )}
      <P.PortalDialogSurface {...(name === 'PortalDialogSurface' ? args : {})}>
        {selected(
          'PortalDialogHeader',
          <P.PortalDialogHeader
            title="Potwierdź zmianę"
            description="Sprawdź informacje przed zapisaniem zmian."
          />,
        )}
        {selected('PortalDialogContent', <P.PortalDialogContent>{body}</P.PortalDialogContent>)}
        {selected(
          'PortalDialogFooter',
          <P.PortalDialogFooter>
            {selected(
              'PortalDialogClose',
              <P.PortalDialogClose asChild>
                <C.Button>Zamknij</C.Button>
              </P.PortalDialogClose>,
            )}
          </P.PortalDialogFooter>,
        )}
      </P.PortalDialogSurface>
    </P.PortalDialogRoot>
  );
}
function Composition({ name, args }: { name: string; args: ExampleArgs }) {
  const def = getExample(name);
  const node = h(def.component, args);
  if (/^PortalDialog(Root|Surface|Header|Content|Footer|Trigger|Close)$/.test(name))
    return <PrimitiveDialog name={name} args={args} />;
  if (/^Portal(Card|Panel)(Header|Content|Footer)$/.test(name)) {
    const card = name.startsWith('PortalCard');
    const Root = card ? P.PortalCard : P.PortalPanel;
    const Header = card ? P.PortalCardHeader : P.PortalPanelHeader;
    const Content = card ? P.PortalCardContent : P.PortalPanelContent;
    const Footer = card ? P.PortalCardFooter : P.PortalPanelFooter;
    return (
      <Root composed>
        {name.endsWith('Header') ? node : <Header>Twoje sprawy</Header>}
        {name.endsWith('Content') ? node : <Content>{body}</Content>}
        {name.endsWith('Footer') ? (
          node
        ) : (
          <Footer>
            <C.Button variant="secondary">Zobacz wszystkie</C.Button>
          </Footer>
        )}
      </Root>
    );
  }
  if (/^PortalForm(Label|HelperText|Message)$/.test(name))
    return (
      <P.PortalFormField>
        {(field) => (
          <>
            {name === 'PortalFormLabel' ? (
              node
            ) : (
              <P.PortalFormLabel>Nazwa sprawy</P.PortalFormLabel>
            )}
            <input
              id={field.id}
              aria-describedby={field.id + (name === 'PortalFormMessage' ? '-error' : '-help')}
              aria-invalid={name === 'PortalFormMessage' || undefined}
              placeholder="Wpisz nazwę"
            />
            {name === 'PortalFormLabel' ? (
              <P.PortalFormHelperText>
                Nadaj sprawie krótką, rozpoznawalną nazwę.
              </P.PortalFormHelperText>
            ) : (
              node
            )}
          </>
        )}
      </P.PortalFormField>
    );
  if (name === 'MobileDialogClose' || name === 'MobileDialogActions')
    return <MobileDialogPartExample name={name} args={args} />;
  if (name === 'PortalDialogProvider')
    return (
      <P.PortalDialogProvider {...args}>
        <PortalRequests />
      </P.PortalDialogProvider>
    );
  if (name === 'PortalSnackbarProvider')
    return (
      <P.PortalSnackbarProvider {...args}>
        <PortalNotifications />
      </P.PortalSnackbarProvider>
    );
  if (name === 'SnackbarProvider')
    return (
      <M.SnackbarProvider {...args}>
        <MobileNotifications />
      </M.SnackbarProvider>
    );
  if (name === 'LandingProvider') return <MotionExample args={args} />;
  if (name === 'InputDateTime') return <DateTimeExample args={args} />;
  return node;
}
export function ExampleRenderer({ name, args = emptyArgs }: { name: string; args?: ExampleArgs }) {
  const definition = getExample(name);
  const [local, setLocal] = useState<ExampleArgs>({});
  const [feedback, setFeedback] = useState('');
  const [revision, setRevision] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setLocal({});
    setFeedback('');
    setDismissed(false);
    setRevision((previous) => previous + 1);
  }, [args, name]);
  const props = normalizeArgs({ ...definition.args, ...args, ...local });
  for (const [value, callback] of controlledPairs(definition)) {
    if (props[value] !== undefined && definition.props.some((prop) => prop.name === callback)) {
      const original = props[callback];
      props[callback] = (next: unknown) => {
        setLocal((previous) => ({ ...previous, [value]: next }));
        if (typeof original === 'function') original(next);
      };
    }
  }
  for (const callback of [
    'onClick',
    'onConfirm',
    'onCancel',
    'onComplete',
    'onDownload',
    'onMenuClick',
    'onDismiss',
  ]) {
    if (typeof props[callback] === 'function') {
      const original = props[callback] as (...args: unknown[]) => void;
      props[callback] = (...values: unknown[]) => {
        original(...values);
        if (callback === 'onDismiss' && ['MobileBanner', 'MobileSnackbar'].includes(name))
          setDismissed(true);
        setFeedback(
          callback === 'onCancel' ? 'Anulowano działanie.' : 'Wykonano działanie: ' + callback,
        );
      };
    }
  }
  if (
    props.checked !== undefined &&
    definition.props.some((p) => p.name === 'onChange') &&
    !definition.props.some((p) => p.name === 'onCheckedChange')
  ) {
    const original = props.onChange;
    props.onChange = (event: { target: { checked: boolean } }) => {
      const checked = event.target.checked;
      setLocal((previous) => ({ ...previous, checked }));
      if (typeof original === 'function') original(event);
    };
  }
  if (
    props.value !== undefined &&
    nativeValueComponents.has(name) &&
    !definition.props.some((p) => p.name === 'onValueChange')
  ) {
    const original = props.onChange;
    props.onChange = (event: { target: { value: string } }) => {
      const value = event.target.value;
      setLocal((previous) => ({ ...previous, value }));
      if (typeof original === 'function') original(event);
    };
  }
  if (name === 'LandingCookieConsent') {
    const original = args.onOpenChange ?? definition.args.onOpenChange;
    props.open = local.open ?? args.open ?? false;
    props.onOpenChange = (open: boolean) => {
      setLocal((previous) => ({ ...previous, open }));
      if (typeof original === 'function') original(open);
    };
  }
  const content = (
    <>
      <div data-story-component={name} style={{ minWidth: 0 }}>
        {dismissed ? (
          <C.Button variant="secondary" onClick={() => setDismissed(false)}>
            Pokaż ponownie
          </C.Button>
        ) : (
          <Composition key={revision} name={name} args={props} />
        )}
      </div>
      {name === 'LandingCookieConsent' && (
        <L.LandingButton onClick={() => setLocal((previous) => ({ ...previous, open: true }))}>
          Ustawienia plików cookies
        </L.LandingButton>
      )}
      {feedback && (
        <p role="status" style={{ marginTop: 16 }}>
          {feedback}
        </p>
      )}
    </>
  );
  if (definition.category === 'landing' && name !== 'LandingProvider')
    return <L.LandingProvider>{content}</L.LandingProvider>;
  return content;
}

const elementNames = new Map<unknown, string>();
for (const namespace of Object.values(namespaces))
  for (const [name, value] of Object.entries(namespace))
    if (/^[A-Z]/.test(name)) elementNames.set(value, name);
function serializeValue(value: unknown, imports: Set<string>): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'function') return '() => {}';
  if (typeof value === 'string') {
    const asset = Object.entries(L.landingAssets).find(([, url]) => url === value);
    if (asset) {
      imports.add('landingAssets');
      return 'landingAssets.' + asset[0];
    }
    const documentAsset = Object.entries(C.documentBackgrounds).find(([, url]) => url === value);
    if (documentAsset) {
      imports.add('documentBackgrounds');
      return 'documentBackgrounds.' + documentAsset[0];
    }
    return JSON.stringify(value);
  }
  if (isValidElement(value)) return jsxValue(value, imports);
  if (Array.isArray(value))
    return '[' + value.map((item) => serializeValue(item, imports)).join(', ') + ']';
  if (value && typeof value === 'object')
    return (
      '{ ' +
      Object.entries(value)
        .map(
          ([key, item]) =>
            (/^[a-zA-Z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)) +
            ': ' +
            serializeValue(item, imports),
        )
        .join(', ') +
      ' }'
    );
  return JSON.stringify(value);
}
function jsxValue(element: ReactElement, imports: Set<string>, explicitName?: string): string {
  const props = element.props as Record<string, unknown>;
  const name =
    explicitName ??
    (typeof element.type === 'string' ? element.type : (elementNames.get(element.type) ?? 'span'));
  if (/^[A-Z]/.test(name)) imports.add(name);
  const definition = exampleRegistry[name];
  const controlled = new Set(definition ? controlledPairs(definition).map(([value]) => value) : []);
  if (definition?.props.some((prop) => prop.name === 'onChange')) controlled.add('checked');
  const attributes = Object.entries(props)
    .filter(([key, value]) => key !== 'children' && key !== 'key' && value !== undefined)
    .map(([key, value]) =>
      key === 'rowKey'
        ? 'rowKey={(row) => row.id}'
        : value === true && !controlled.has(key)
          ? key
          : typeof value === 'string' &&
              !serializeValue(value, imports).startsWith('landingAssets.') &&
              !serializeValue(value, imports).startsWith('documentBackgrounds.')
            ? /[&<>"\\\r\n\t]/.test(value)
              ? key + '={' + JSON.stringify(value) + '}'
              : key + '=' + JSON.stringify(value)
            : key + '={' + serializeValue(value, imports) + '}',
    )
    .join(' ');
  const start = '<' + name + (attributes ? ' ' + attributes : '');
  if (props.children === undefined || props.children === null) return start + ' />';
  const child = Array.isArray(props.children) ? props.children : [props.children];
  return (
    start +
    '>' +
    child
      .map((value) =>
        isValidElement(value)
          ? jsxValue(value, imports)
          : typeof value === 'string'
            ? /[{}>\r\n\t]/.test(value)
              ? '{' + JSON.stringify(value) + '}'
              : value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            : '{' + serializeValue(value, imports) + '}',
      )
      .join('') +
    '</' +
    name +
    '>'
  );
}
export function buildExampleSource(
  name: string,
  args: ExampleArgs = {},
  options: { theme?: string; corePlatform?: string } = {},
): string {
  const definition = getExample(name);
  const props = normalizeArgs({ ...definition.args, ...args });
  const names = new Set([name]);
  const include = (...values: string[]) => values.forEach((value) => names.add(value));
  const serialize = (value: unknown) => serializeValue(value, names);
  const jsx = (element: ReactElement, explicitName?: string) =>
    jsxValue(element, names, explicitName);
  let example = jsx(h(definition.component, props), name);
  if (/^PortalDialog(Root|Surface|Header|Content|Footer|Trigger|Close)$/.test(name)) {
    include(
      'PortalDialogRoot',
      'PortalDialogSurface',
      'PortalDialogTrigger',
      'PortalDialogHeader',
      'PortalDialogContent',
      'PortalDialogFooter',
      'Button',
    );
    if (name !== 'PortalDialogFooter') include('PortalDialogClose');
    const selected = (slot: string, fallback: string) => (name === slot ? example : fallback);
    example =
      '<PortalDialogRoot' +
      (name === 'PortalDialogRoot'
        ? Object.entries(props)
            .filter(([key]) => key !== 'children')
            .map(([key, value]) => ' ' + key + '={' + serialize(value) + '}')
            .join('')
        : '') +
      '>\n' +
      selected(
        'PortalDialogTrigger',
        '<PortalDialogTrigger asChild><Button>Otwórz dialog</Button></PortalDialogTrigger>',
      ) +
      '\n' +
      '<PortalDialogSurface' +
      (name === 'PortalDialogSurface'
        ? Object.entries(props)
            .filter(([key]) => key !== 'children')
            .map(([key, value]) => ' ' + key + '={' + serialize(value) + '}')
            .join('')
        : '') +
      '>\n' +
      selected(
        'PortalDialogHeader',
        '<PortalDialogHeader title="Potwierdź zmianę" description="Sprawdź informacje przed zapisaniem zmian." />',
      ) +
      '\n' +
      selected(
        'PortalDialogContent',
        '<PortalDialogContent>Sprawdź wprowadzone informacje przed zapisaniem.</PortalDialogContent>',
      ) +
      '\n' +
      selected(
        'PortalDialogFooter',
        '<PortalDialogFooter>' +
          selected(
            'PortalDialogClose',
            '<PortalDialogClose asChild><Button>Zamknij</Button></PortalDialogClose>',
          ) +
          '</PortalDialogFooter>',
      ) +
      '\n</PortalDialogSurface>\n</PortalDialogRoot>';
  } else if (/^Portal(Card|Panel)(Header|Content|Footer)$/.test(name)) {
    const root = name.startsWith('PortalCard') ? 'PortalCard' : 'PortalPanel';
    include(root, root + 'Header', root + 'Content', root + 'Footer');
    if (!name.endsWith('Footer')) include('Button');
    example =
      '<' +
      root +
      ' composed>\n' +
      (name.endsWith('Header')
        ? example
        : '<' + root + 'Header>Twoje sprawy</' + root + 'Header>') +
      '\n' +
      (name.endsWith('Content')
        ? example
        : '<' + root + 'Content>' + body + '</' + root + 'Content>') +
      '\n' +
      (name.endsWith('Footer')
        ? example
        : '<' +
          root +
          'Footer><Button variant="secondary">Zobacz wszystkie</Button></' +
          root +
          'Footer>') +
      '\n</' +
      root +
      '>';
  } else if (/^PortalForm(Label|HelperText|Message)$/.test(name)) {
    include('PortalFormField', 'PortalFormLabel');
    if (name === 'PortalFormLabel') include('PortalFormHelperText');
    example =
      '<PortalFormField>{field => <>\n' +
      (name === 'PortalFormLabel' ? example : '<PortalFormLabel>Nazwa sprawy</PortalFormLabel>') +
      '\n<input id={field.id} aria-describedby={field.id + "' +
      (name === 'PortalFormMessage' ? '-error' : '-help') +
      '"}' +
      (name === 'PortalFormMessage' ? ' aria-invalid={true}' : '') +
      ' placeholder="Wpisz nazwę" />\n' +
      (name === 'PortalFormLabel'
        ? '<PortalFormHelperText>Nadaj sprawie krótką, rozpoznawalną nazwę.</PortalFormHelperText>'
        : example) +
      '\n</>}</PortalFormField>';
  } else if (name === 'MobileDialogClose' || name === 'MobileDialogActions') {
    include('MobileDialog', 'Button');
    example =
      '<MobileDialog title="Potwierdź zmianę" description="Możesz zapisać zmiany lub wrócić do edycji." trigger={<Button>Otwórz dialog</Button>}' +
      (name === 'MobileDialogActions' ? ' actions={' + example + '}' : '') +
      '>' +
      (name === 'MobileDialogClose' ? example : 'Treść okna') +
      '</MobileDialog>';
  }
  const providerDemo: Record<string, string> = {
    PortalDialogProvider:
      'const dialog = usePortalDialog();\n  return <Button onClick={() => dialog.open({ title: "Zapisać zmiany?", content: "Sprawdź informacje." })}>Otwórz dialog</Button>;',
    PortalSnackbarProvider:
      'const snackbar = usePortalSnackbar();\n  return <Button onClick={() => snackbar.enqueue({ message: "Zmiany zostały zapisane.", tone: "success" })}>Pokaż komunikat</Button>;',
    SnackbarProvider:
      'const snackbar = useSnackbar();\n  return <Button onClick={() => snackbar.show({ message: "Zmiany zostały zapisane." })}>Pokaż komunikat</Button>;',
  };
  let helper = '';
  if (name === 'LandingProvider') {
    example = jsx(
      h(definition.component, {
        ...props,
        children: [
          ...(props.children === undefined ? [] : [props.children]),
          h(L.LandingUtilityBar),
        ],
      }),
      name,
    );
  }
  if (providerDemo[name]) {
    include(
      'Button',
      name === 'PortalDialogProvider'
        ? 'usePortalDialog'
        : name === 'PortalSnackbarProvider'
          ? 'usePortalSnackbar'
          : 'useSnackbar',
    );
    helper = 'function ProviderContent() {\n  ' + providerDemo[name] + '\n}\n\n';
    example =
      '<' +
      name +
      Object.entries(props)
        .filter(([key]) => key !== 'children')
        .map(([key, value]) => ' ' + key + '={' + serialize(value) + '}')
        .join('') +
      '>' +
      '<ProviderContent /></' +
      name +
      '>';
  }
  let stateLines = '';
  let stateTypes = false;
  for (const [value, callback] of controlledPairs(definition))
    if (props[value] !== undefined) {
      const setter = 'set' + value[0].toUpperCase() + value.slice(1);
      const type = definition.props.find((prop) => prop.name === value)?.type;
      const generic = /^(string|number|boolean)( \| undefined)?$/.test(type ?? '')
        ? ''
        : '<ComponentProps<typeof ' + name + '>[' + JSON.stringify(value) + ']>';
      stateTypes ||= Boolean(generic);
      stateLines +=
        '  const [' +
        value +
        ', ' +
        setter +
        '] = useState' +
        generic +
        '(' +
        serialize(props[value]) +
        ');\n';
      example = example
        .replace(value + '={' + serialize(props[value]) + '}', value + '={' + value + '}')
        .replace(value + '=' + JSON.stringify(props[value]), value + '={' + value + '}');
      const expression = callback + '={() => {}}';
      if (example.includes(expression))
        example = example.replace(expression, callback + '={' + setter + '}');
      else if (!example.includes(callback + '='))
        example = example.replace('<' + name, '<' + name + ' ' + callback + '={' + setter + '}');
    }
  for (const value of ['checked', 'value'])
    if (
      props[value] !== undefined &&
      (value === 'checked' || nativeValueComponents.has(name)) &&
      definition.props.some((p) => p.name === 'onChange') &&
      !definition.props.some(
        (p) => p.name === (value === 'checked' ? 'onCheckedChange' : 'onValueChange'),
      )
    ) {
      const setter = value === 'checked' ? 'setChecked' : 'setValue';
      stateLines +=
        '  const [' + value + ', ' + setter + '] = useState(' + serialize(props[value]) + ');\n';
      example = example
        .replace(value + '={' + serialize(props[value]) + '}', value + '={' + value + '}')
        .replace(value + '=' + JSON.stringify(props[value]), value + '={' + value + '}');
      const callback = 'onChange={event => ' + setter + '(event.currentTarget.' + value + ')}';
      if (example.includes('onChange={() => {}}'))
        example = example.replace('onChange={() => {}}', callback);
      else if (!example.includes('onChange='))
        example = example.replace('<' + name, '<' + name + ' ' + callback);
    }
  if (name === 'InputDateTime') {
    const time = props.type === 'time';
    include('MobileDialog', time ? 'Button' : 'MobileCalendar');
    stateLines =
      '  const [open, setOpen] = useState(false);\n  const [value, setValue] = useState(' +
      serialize(time && !/^\d{2}:\d{2}$/.test(String(props.value)) ? '10:30' : props.value) +
      ');\n';
    example = jsx(
      h(definition.component, { ...props, value: undefined, onClick: undefined }),
      name,
    ).replace(' />', ' value={value} onClick={() => setOpen(true)} />');
    example =
      '<>\n' +
      example +
      '\n<MobileDialog open={open} onOpenChange={setOpen} title={' +
      serialize(props.label) +
      '} description="Wybierz termin.">\n' +
      (time
        ? '<label>Godzina<input type="time" value={value} onChange={event => setValue(event.target.value)} /></label><Button onClick={() => setOpen(false)}>Potwierdź</Button>'
        : '<MobileCalendar value={value} onValueChange={next => { setValue(next); setOpen(false); }} />') +
      '\n</MobileDialog>\n</>';
  }
  if (name === 'MobileDialogActions') {
    stateLines = '  const [open, setOpen] = useState(false);\n';
    const actions = jsx(h(definition.component, props), name)
      .replace('onConfirm={() => {}}', 'onConfirm={() => setOpen(false)}')
      .replace('onCancel={() => {}}', 'onCancel={() => setOpen(false)}');
    example =
      '<MobileDialog title="Potwierdź zmianę" description="Możesz zapisać zmiany lub wrócić do edycji." open={open} onOpenChange={setOpen} trigger={<Button>Otwórz dialog</Button>} actions={' +
      actions +
      '}>Sprawdź wprowadzone informacje przed zapisaniem.</MobileDialog>';
  }
  if (['MobileBanner', 'MobileSnackbar'].includes(name) && props.onDismiss) {
    include('Button');
    stateLines += '  const [visible, setVisible] = useState(true);\n';
    example =
      '<>{visible ? ' +
      example.replace('onDismiss={() => {}}', 'onDismiss={() => setVisible(false)}') +
      ' : <Button onClick={() => setVisible(true)}>Pokaż ponownie</Button>}</>';
  }
  if (name === 'LandingCookieConsent') {
    include('LandingButton');
    if (!stateLines.includes('[open,')) {
      stateLines += '  const [open, setOpen] = useState(false);\n';
      example = example.replace('<LandingCookieConsent', '<LandingCookieConsent open={open}');
      if (example.includes('onOpenChange={() => {}}'))
        example = example.replace('onOpenChange={() => {}}', 'onOpenChange={setOpen}');
      else
        example = example.replace(
          '<LandingCookieConsent',
          '<LandingCookieConsent onOpenChange={setOpen}',
        );
    }
    example =
      '<>\n<LandingButton onClick={() => setOpen(true)}>Ustawienia plików cookies</LandingButton>\n' +
      example +
      '\n</>';
  }
  const platform =
    definition.category === 'core'
      ? (options.corePlatform ?? 'mobile')
      : definition.category === 'portal'
        ? 'web'
        : definition.category;
  if (definition.category === 'landing' && name !== 'LandingProvider') {
    include('LandingProvider');
    example = '<LandingProvider>\n' + example + '\n</LandingProvider>';
  }
  example =
    '<div data-platform="' +
    platform +
    '" data-theme="' +
    (options.theme ?? 'light') +
    '">\n' +
    example +
    '\n</div>';
  const source =
    (stateLines ? "import { useState } from 'react';\n" : '') +
    (stateTypes ? "import type { ComponentProps } from 'react';\n" : '') +
    'import { ' +
    [...names].sort().join(', ') +
    " } from '@mdesign/react';\nimport '@mdesign/react/styles.css';\n\n" +
    helper +
    'export default function Example() {\n' +
    stateLines +
    '  return (\n' +
    example
      .split('\n')
      .map((line) => '    ' + line)
      .join('\n') +
    '\n  );\n}\n';
  return source;
}
