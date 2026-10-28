import { docsPath } from '../docs-path';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Blocks,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  Code2,
  Copy,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FileText,
  Grid2X2,
  Home,
  Layers,
  LayoutPanelLeft,
  Menu,
  Monitor,
  Moon,
  MoreHorizontal,
  MousePointer2,
  Palette,
  PanelTop,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Square,
  Sun,
  SwatchBook,
  Type,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Accordion,
  Alert,
  AppHeader,
  Avatar,
  Badge,
  BottomNavigation,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Dialog,
  Divider,
  DocumentCard,
  DocumentTile,
  documentBackgrounds,
  EmptyState,
  IconButton,
  ListRow,
  NativeIcon,
  nativeIconNames,
  officialMobileColors,
  Pagination,
  Progress,
  Radio,
  SearchField,
  Select,
  ServiceIcon,
  serviceIconNames,
  ServiceTile,
  Sidebar,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  TextArea,
  TextField,
  Tooltip,
} from '../kit';
import tokens from '../kit/tokens.json';
import type { NativeIconName } from '../kit';
import { MobileScreen, ScreensPage } from '../examples/Screens';
import '../examples/screens.css';
import { OfficialIconsCatalog } from './OfficialIconsCatalog';
import { APIReference } from './APIReference';
import componentManifest from './component-manifest.json';
import { MobileCatalog } from './MobileCatalog';
import { PortalCatalog } from './PortalCatalog';
import { LandingCatalog } from './LandingCatalog';

type Page =
  | 'overview'
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'icons'
  | 'buttons'
  | 'forms'
  | 'navigation'
  | 'cards'
  | 'feedback'
  | 'overlays'
  | 'screens'
  | 'installation'
  | 'sources'
  | 'official-icons'
  | 'api'
  | 'mobile-kit'
  | 'portal-kit'
  | 'landing-kit';
const groups: {
  label: string;
  items: { id: Page; label: string; icon: LucideIcon; count?: string }[];
}[] = [
  { label: 'ZACZNIJ TUTAJ', items: [{ id: 'overview', label: 'Przegląd', icon: Grid2X2 }] },
  {
    label: 'FUNDAMENTY',
    items: [
      { id: 'colors', label: 'Kolory', icon: Palette },
      { id: 'typography', label: 'Typografia', icon: Type },
      { id: 'spacing', label: 'Odstępy i kształty', icon: Square },
      { id: 'icons', label: 'Ikonografia', icon: Sparkles },
    ],
  },
  {
    label: 'KOMPONENTY',
    items: [
      { id: 'buttons', label: 'Przyciski', icon: MousePointer2, count: '2' },
      { id: 'forms', label: 'Formularze', icon: Settings2, count: '7' },
      { id: 'navigation', label: 'Nawigacja', icon: PanelTop, count: '6' },
      { id: 'cards', label: 'Karty i listy', icon: LayoutPanelLeft, count: '6' },
      { id: 'feedback', label: 'Komunikaty i stany', icon: Bell, count: '6' },
      { id: 'overlays', label: 'Okna i rozwijanie', icon: Layers, count: '3' },
    ],
  },
  {
    label: 'PEŁNY KATALOG',
    items: [
      {
        id: 'portal-kit',
        label: 'Komponenty desktopowe',
        icon: Monitor,
        count: String(componentManifest.counts.portal),
      },
      {
        id: 'mobile-kit',
        label: 'Komponenty mobilne',
        icon: Smartphone,
        count: String(componentManifest.counts.mobile),
      },
      {
        id: 'landing-kit',
        label: 'Landing informacyjny',
        icon: Home,
        count: String(componentManifest.counts.landing),
      },
      { id: 'official-icons', label: 'Katalog ikon COI', icon: Sparkles, count: '355' },
      { id: 'api', label: 'Publiczne API', icon: Code2 },
    ],
  },
  {
    label: 'W PRAKTYCE',
    items: [
      { id: 'screens', label: 'Przykładowe ekrany', icon: Smartphone },
      { id: 'installation', label: 'Dla developera', icon: Code2 },
      { id: 'sources', label: 'Źródła i licencje', icon: BookOpen },
    ],
  },
];
const pages = groups.flatMap((g) => g.items);
const descriptions: Record<Page, string> = {
  'landing-kit':
    'Osobny system marketingowy: Lato, nagłówek, hero, karty, artykuły i pobieranie aplikacji.',
  'portal-kit': 'Kontrolki, formularze i kompozycje interfejsu desktopowego.',
  'mobile-kit': 'Pola, karty, nawigacja, arkusze i szablony z mobilnego design systemu.',
  'official-icons': 'Pełny katalog ikon z zachowanymi identyfikatorami źródłowymi.',
  api: 'Rzeczywiste eksporty biblioteki i generowane typy właściwości.',
  overview: 'Biblioteka interfejsu inspirowana interfejsem mObywatela.',
  colors: 'Semantyczne kolory biblioteki, gotowe do użycia i dostosowania w kodzie.',
  typography: 'Czytelna hierarchia, polskie znaki i sprawdzona skala typograficzna.',
  spacing: 'Przewidywalne odstępy i kształty. Jeden rytm dla całego interfejsu.',
  icons: 'Ikony COI, neutralne warianty demo i symbole uzupełniające.',
  buttons: 'Wyraźne akcje. Warianty, rozmiary i wszystkie stany interakcji.',
  forms: 'Dostępne pola, czytelne etykiety i pomocne komunikaty walidacji.',
  navigation: 'Daj użytkownikom pewność, gdzie są i dokąd mogą przejść.',
  cards: 'Łącz dokumenty, usługi i informacje w czytelne struktury.',
  feedback: 'Informuj o wyniku działania i pokazuj, co dzieje się w aplikacji.',
  overlays: 'Dialogi, podpowiedzi i treści dostępne na żądanie.',
  screens: 'Zobacz komponenty w kontekście aplikacji mobilnej i portalu.',
  installation: 'Od pierwszego importu do własnego interfejsu w React.',
  sources: 'Źródła tokenów, ikon i fontów oraz licencje zasobów.',
};

function readPage(): Page {
  const hash = location.hash.slice(1);
  if (hash === 'coverage') return 'api';
  return pages.some((p) => p.id === hash) ? (hash as Page) : 'overview';
}
function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="code-block">
      <pre>
        <code>{children}</code>
      </pre>
      <button onClick={copy} aria-label="Kopiuj kod">
        {copied ? <Check size={16} /> : <Copy size={16} />}
        <span>{copied ? 'Skopiowano' : 'Kopiuj'}</span>
      </button>
    </div>
  );
}
function Showcase({
  title,
  note,
  children,
  code,
}: {
  title: string;
  note?: string;
  children: ReactNode;
  code: string;
}) {
  const [mode, setMode] = useState('preview');
  return (
    <section className="showcase">
      <div className="showcase-heading">
        <div>
          <h2>{title}</h2>
          {note && <p>{note}</p>}
        </div>
        <div className="mini-tabs" role="group" aria-label={`Widok: ${title}`}>
          <button aria-pressed={mode === 'preview'} onClick={() => setMode('preview')}>
            <Grid2X2 size={14} />
            Podgląd
          </button>
          <button aria-pressed={mode === 'code'} onClick={() => setMode('code')}>
            <Code2 size={14} />
            Kod
          </button>
        </div>
      </div>
      {mode === 'preview' ? (
        <div className="showcase-preview">{children}</div>
      ) : (
        <Code>{code}</Code>
      )}
    </section>
  );
}
function downloadTokens() {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify({ ...tokens, officialMobile: officialMobileColors }, null, 2)], {
      type: 'application/json',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mdesign-tokens.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [page, setPage] = useState<Page>(readPage);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('mdesign-theme') === 'dark' ? 'dark' : 'light',
  );
  const [platform, setPlatform] = useState<'web' | 'mobile'>('web');
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const listener = () => setPage(readPage());
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('mdesign-theme', theme);
  }, [theme]);
  useEffect(() => {
    if (!navOpen) return;
    const opener = menuRef.current;
    const aside = document.querySelector<HTMLElement>('.catalog-sidebar');
    const frame = requestAnimationFrame(() =>
      aside?.querySelector<HTMLElement>('[aria-current="page"]')?.focus(),
    );
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const nodes = Array.from(
        aside?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)') ?? [],
      );
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', trap);
      if (opener?.isConnected) opener.focus();
    };
  }, [navOpen]);
  useEffect(() => {
    const media = matchMedia('(min-width:761px)');
    const reset = () => {
      if (media.matches) setNavOpen(false);
    };
    media.addEventListener('change', reset);
    return () => media.removeEventListener('change', reset);
  }, []);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setQuery('');
        setNavOpen(false);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  function go(p: Page) {
    location.hash = p;
    setPage(p);
    setQuery('');
    setNavOpen(false);
    window.scrollTo(0, 0);
  }
  const current = pages.find((p) => p.id === page)!;
  const results = pages.filter((p) =>
    (p.label + ' ' + descriptions[p.id])
      .toLocaleLowerCase('pl')
      .includes(query.toLocaleLowerCase('pl')),
  );
  return (
    <div className="catalog-app">
      <a
        className="skip-link"
        href="#catalog-main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('catalog-main')?.focus();
        }}
      >
        Przejdź do treści
      </a>
      <header className="catalog-header">
        <button
          ref={menuRef}
          className="mobile-menu"
          onClick={() => setNavOpen(!navOpen)}
          aria-label={navOpen ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={navOpen}
        >
          {navOpen ? <X /> : <Menu />}
        </button>
        <button
          className="brand"
          onClick={() => go('overview')}
          aria-label="mDesign — strona główna"
        >
          <img
            className="brand-symbol"
            src={docsPath('/brand/mdesign-symbol.svg?v=tile-fd42efc967c9')}
            alt=""
          />
          <span>
            m<span className="brand-weight">Design</span>
          </span>
          <span className="brand-tag">REACT UI KIT</span>
        </button>
        <div className="header-trail">
          <span>Dokumentacja</span>
          <ChevronRight size={14} />
          <strong>{current.label}</strong>
        </div>
        <div className="search-wrap">
          <Search size={17} />
          <input
            ref={searchRef}
            aria-label="Szukaj w dokumentacji"
            placeholder="Szukaj komponentów…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>⌘ K</kbd>
          {query && (
            <div className="search-results">
              {results.length ? (
                results.map((p) => (
                  <button key={p.id} onClick={() => go(p.id)}>
                    <p.icon size={17} />
                    <span>{p.label}</span>
                    <ChevronRight size={15} />
                  </button>
                ))
              ) : (
                <p>Brak wyników dla „{query}”.</p>
              )}
            </div>
          )}
        </div>
        <div className="header-actions">
          <a
            href="https://github.com/slominskiwiktor/mdesign-react"
            target="_blank"
            rel="noreferrer"
            aria-label="Repozytorium mDesign na GitHubie"
          >
            <Code2 size={20} />
          </a>
          <span className="header-separator" />
          <button
            aria-label={theme === 'light' ? 'Włącz ciemny motyw' : 'Włącz jasny motyw'}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <span className="version">v{componentManifest.version}</span>
        </div>
      </header>
      {navOpen && (
        <button
          className="nav-scrim"
          aria-label="Zamknij nawigację"
          onClick={() => setNavOpen(false)}
        />
      )}
      <aside
        role={navOpen ? 'dialog' : undefined}
        aria-modal={navOpen || undefined}
        aria-label="Nawigacja dokumentacji"
        className={`catalog-sidebar ${navOpen ? 'is-open' : ''}`}
      >
        <div className="sidebar-top">
          <span className="status-dot" />
          React + TypeScript<span className="sidebar-version">v{componentManifest.version}</span>
        </div>
        <nav aria-label="Dokumentacja">
          {groups.map((group) => (
            <div className="nav-group" key={group.label}>
              <h2>{group.label}</h2>
              {group.items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(item.id);
                  }}
                  className={page === item.id ? 'active' : ''}
                  aria-current={page === item.id ? 'page' : undefined}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.count && <small>{item.count}</small>}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-note">
          <ShieldCheck size={20} />
          <strong>Źródła i licencje</strong>
          <p>Tokeny, ikony i fonty biblioteki.</p>
          <button onClick={() => go('sources')}>
            Zobacz referencje <ArrowUpRight />
          </button>
        </div>
        <div className="sidebar-bottom">
          <span className="status-dot" />
          Niezależna biblioteka UI<span>PL</span>
        </div>
      </aside>
      <main id="catalog-main" tabIndex={-1} className="catalog-main">
        <div className="content-top">
          <Breadcrumbs
            items={[{ label: 'mDesign', href: '#overview' }, { label: current.label }]}
          />
          <span className="verified">
            <CheckCheck size={14} />
            Źródła sprawdzone 19.10.2026
          </span>
        </div>
        {page === 'overview' ? (
          <Overview go={go} />
        ) : (
          <>
            <div className="page-heading">
              <div className="eyebrow">
                {groups.find((g) => g.items.some((i) => i.id === page))?.label}
              </div>
              <h1>{current.label}</h1>
              <p>{descriptions[page]}</p>
              {['buttons', 'forms', 'navigation', 'cards', 'feedback', 'overlays'].includes(
                page,
              ) && (
                <div className="page-meta">
                  <Badge tone="success">React + TypeScript</Badge>
                  <span>
                    <Check size={14} />
                    Obsługa klawiatury
                  </span>
                  <span>
                    <Sun size={14} />
                    Jasny i ciemny
                  </span>
                </div>
              )}
            </div>
            {![
              'screens',
              'installation',
              'sources',
              'official-icons',
              'api',
              'mobile-kit',
              'portal-kit',
              'landing-kit',
            ].includes(page) && (
              <div className="platform-toolbar">
                <span>
                  <Settings2 size={15} />
                  Wariant komponentów
                </span>
                <div className="segmented">
                  <button aria-pressed={platform === 'web'} onClick={() => setPlatform('web')}>
                    <Monitor size={15} />
                    Portal
                  </button>
                  <button
                    aria-pressed={platform === 'mobile'}
                    onClick={() => setPlatform('mobile')}
                  >
                    <Smartphone size={15} />
                    Aplikacja
                  </button>
                </div>
              </div>
            )}
            <div className="component-context" data-platform={platform}>
              {page === 'colors' && <Colors platform={platform} />}
              {page === 'typography' && <Typography platform={platform} />}
              {page === 'spacing' && <Spacing />}
              {page === 'icons' && <Icons />}
              {page === 'buttons' && <ButtonsPage />}
              {page === 'forms' && <FormsPage />}
              {page === 'navigation' && <NavigationPage />}
              {page === 'cards' && <CardsPage />}
              {page === 'feedback' && <FeedbackPage />}
              {page === 'overlays' && <OverlaysPage />}
            </div>
            {page === 'screens' && <ScreensPage />}
            {page === 'installation' && <Installation />}
            {page === 'sources' && <Sources />}
            {page === 'official-icons' && <OfficialIconsCatalog />}
            {page === 'api' && <APIReference />}
            {page === 'mobile-kit' && <MobileCatalog />}
            {page === 'landing-kit' && <LandingCatalog />}
            {page === 'portal-kit' && <PortalCatalog />}
          </>
        )}
        <footer className="catalog-footer">
          <span>
            <img
              className="footer-brand-symbol"
              src={docsPath('/brand/mdesign-symbol.svg?v=tile-fd42efc967c9')}
              alt=""
            />
            mDesign <span>·</span> React UI Kit
          </span>
          <span>
            Niezależna implementacja na podstawie mObywatela <span>↗</span>
          </span>
        </footer>
      </main>
    </div>
  );
}
function ArrowUpRight() {
  return <ExternalLink size={13} />;
}

function Overview({ go }: { go: (page: Page) => void }) {
  return (
    <>
      <section className="overview-hero">
        <div className="hero-content">
          <span className="hero-label">
            <span className="status-dot" />
            BAZA: AKTUALNY DESIGN SYSTEM
          </span>
          <h1>
            Znany interfejs.
            <br />
            <span>Twój nowy punkt wyjścia.</span>
          </h1>
          <p>
            Komponenty React w języku mObywatela.
            <br className="desktop-break" /> Od pierwszego przycisku do całego ekranu.
          </p>
          <div className="hero-actions">
            <Button onClick={() => go('buttons')} icon={<ArrowRight size={17} />}>
              Przeglądaj komponenty
            </Button>
            <Button
              variant="secondary"
              onClick={downloadTokens}
              icon={<ArrowDownToLine size={17} />}
            >
              Pobierz tokeny
            </Button>
          </div>
          <div className="hero-tech">
            <span>
              <Check size={14} />
              TypeScript
            </span>
            <span>
              <Check size={14} />
              Mobile i desktop
            </span>
            <span>
              <Check size={14} />
              Dwa motywy
            </span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="floating-token">
            <span style={{ background: '#0452a8' }} />
            <span style={{ background: '#9dc3ee' }} />
            <span style={{ background: '#ddebfb' }} />
            <span style={{ background: '#d4213d' }} />
            <code>color.brand</code>
          </div>
          <div className="hero-service">
            <span className="hero-shield">
              <ShieldCheck size={30} />
            </span>
            <div>
              <strong>Twoje dane są bezpieczne</strong>
              <p>Wszystko pod Twoją kontrolą.</p>
            </div>
            <span className="safe-tag">
              <Check size={12} />
              Aktywne
            </span>
          </div>
          <div className="hero-document">
            <span className="document-icon">
              <FileCheck2 size={30} />
            </span>
            <div>
              <small>TWOJE DOKUMENTY</small>
              <strong>Wszystko, czego potrzebujesz.</strong>
              <p>Zawsze pod ręką.</p>
            </div>
            <ChevronRight size={18} />
          </div>
          <div className="floating-size">
            <span>16</span>
            <code>border-radius</code>
            <span className="radius-corner" />
          </div>
          <div className="hero-cursor">
            <MousePointer2 size={22} fill="currentColor" />
            <span>React component</span>
          </div>
        </div>
      </section>
      <div className="overview-metrics">
        <div>
          <Blocks size={21} />
          <strong>{componentManifest.componentCount}</strong>
          <span>komponentów React</span>
        </div>
        <div>
          <SwatchBook size={21} />
          <strong>291</strong>
          <span>tokenów portalu</span>
        </div>
        <div>
          <Monitor size={21} />
          <strong>3</strong>
          <span>systemy wizualne</span>
        </div>
        <div>
          <Moon size={21} />
          <strong>2</strong>
          <span>motywy kolorystyczne</span>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">OD PODSTAW DO GOTOWEGO INTERFEJSU</span>
          <h2>Małe elementy. Duże możliwości.</h2>
          <p>Spójne, dostępne i gotowe do wykorzystania w Twoim projekcie.</p>
        </div>
        <button className="text-link" onClick={() => go('buttons')}>
          Wszystkie komponenty <ArrowRight size={16} />
        </button>
      </div>
      <div className="overview-cards">
        <button className="overview-card" onClick={() => go('buttons')}>
          <div className="overview-card-canvas buttons-canvas">
            <span className="visual-button solid">
              Przejdź dalej <ArrowRight size={16} />
            </span>
            <div>
              <span className="visual-button outline">Anuluj</span>
              <span className="visual-button ghost">
                Więcej <ChevronRight size={15} />
              </span>
            </div>
          </div>
          <div className="overview-card-caption">
            <div>
              <h3>Przyciski i akcje</h3>
              <p>Jasny cel każdego kliknięcia.</p>
            </div>
            <span>
              <ArrowRight size={19} />
            </span>
          </div>
        </button>
        <button className="overview-card" onClick={() => go('forms')}>
          <div className="overview-card-canvas forms-canvas">
            <label>Adres e-mail</label>
            <div className="visual-input">
              jan.kowalski@example.pl
              <Check size={17} />
            </div>
            <span className="visual-checkbox">
              <Check size={12} />
              Wszystko gotowe do wysłania
            </span>
          </div>
          <div className="overview-card-caption">
            <div>
              <h3>Pola i formularze</h3>
              <p>Od danych do załatwionej sprawy.</p>
            </div>
            <span>
              <ArrowRight size={19} />
            </span>
          </div>
        </button>
        <button className="overview-card" onClick={() => go('cards')}>
          <div className="overview-card-canvas tiles-canvas">
            <span className="mini-service">
              <ShieldCheck size={25} />
              <strong>Zastrzeż PESEL</strong>
              <ChevronRight size={16} />
            </span>
            <span className="mini-service">
              <CreditCard size={25} />
              <strong>ePłatności</strong>
              <ChevronRight size={16} />
            </span>
          </div>
          <div className="overview-card-caption">
            <div>
              <h3>Karty i usługi</h3>
              <p>Informacje w dobrym porządku.</p>
            </div>
            <span>
              <ArrowRight size={19} />
            </span>
          </div>
        </button>
      </div>
      <section className="overview-lower">
        <div className="foundations-panel">
          <span className="eyebrow">WSPÓLNY JĘZYK PROJEKTOWANIA</span>
          <h2>
            Wszystko zaczyna się
            <br />
            od dobrych fundamentów.
          </h2>
          <p>
            Kolory, typografia i odstępy zebrane w jednym miejscu. Z wartościami, które możesz od
            razu wykorzystać w kodzie.
          </p>
          <div className="foundation-links">
            <button onClick={() => go('colors')}>
              <Palette size={18} />
              Kolory
              <ArrowRight size={15} />
            </button>
            <button onClick={() => go('typography')}>
              <Type size={18} />
              Typografia
              <ArrowRight size={15} />
            </button>
            <button onClick={() => go('spacing')}>
              <Square size={18} />
              Odstępy
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="foundation-swatches">
            {['#030b28', '#063477', '#0452a8', '#5094df', '#9dc3ee', '#ddebfb', '#f4f6fb'].map(
              (c) => (
                <span key={c} style={{ background: c }} />
              ),
            )}
          </div>
        </div>
        <div className="screens-teaser">
          <div>
            <span className="eyebrow">ZOBACZ W KONTEKŚCIE</span>
            <h2>
              Komponenty,
              <br />
              które tworzą całość.
            </h2>
            <p>
              Poznaj przykładowe ekrany
              <br />
              mobile i desktop.
            </p>
            <button className="text-link" onClick={() => go('screens')}>
              Otwórz ekrany <ArrowRight size={16} />
            </button>
            <span className="teaser-badge">
              <Smartphone size={13} />
              375 × 812
            </span>
          </div>
          <div className="teaser-phone" inert>
            <MobileScreen screen="services" theme="light" />
          </div>
        </div>
      </section>
      <div className="source-strip">
        <span className="source-strip-icon">
          <BookOpen size={21} />
        </span>
        <div>
          <strong>Komponenty, tokeny i przykłady.</strong>
          <p>Osobne style dla aplikacji mobilnej, portalu i stron informacyjnych.</p>
        </div>
        <button onClick={() => go('sources')}>
          Poznaj źródła <ExternalLink size={14} />
        </button>
      </div>
    </>
  );
}

function Colors({ platform }: { platform: 'web' | 'mobile' }) {
  const [copied, setCopied] = useState('');
  const webColors = [
    ['Cobalt', 'brand', '#0452a8', 'Główne akcje i linki'],
    ['Cobalt light', 'brand-soft', '#ddebfb', 'Aktywne powierzchnie'],
    ['Ruby', 'ruby', '#d4213d', 'Akcent identyfikacji'],
    ['Grey 500', 'text', '#101317', 'Tekst podstawowy'],
    ['Grey 200', 'muted', '#52575f', 'Tekst pomocniczy'],
    ['Cobalt 10', 'bg', '#f4f6fb', 'Tło aplikacji'],
    ['Green', 'success', '#317c26', 'Powodzenie'],
    ['Orange', 'warning', '#924e00', 'Ostrzeżenie'],
    ['Red', 'danger', '#cd3214', 'Błąd'],
    ['White', 'surface', '#ffffff', 'Powierzchnia kart'],
    ['App blue', 'mobile-brand', '#165ef8', 'Akcje aplikacji mobilnej'],
    ['Grey 40', 'border', '#d0d4db', 'Obramowania'],
  ];
  const colors =
    platform === 'web'
      ? webColors
      : Object.entries(officialMobileColors.colors)
          .filter(([name]) => !['primary900', 'secondary900'].includes(name))
          .map(([name, data]) => [name, name, data.resolved[0].hex, 'Oryginalny token iOS']);
  return (
    <>
      {platform === 'mobile' && (
        <div className="mobile-source-note">
          <Badge tone="success">Oryginał COI</Badge>
          <p>
            Wartości odczytane z oficjalnych plików Contents.json. Główna para nowego wariantu:
            walletPrimary900 / walletSecondary900.
          </p>
        </div>
      )}
      <div className="token-grid">
        {colors.map(([name, key, hex, desc]) => (
          <button
            className="color-card"
            key={key}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(hex);
                setCopied(key);
                setTimeout(() => setCopied(''), 1600);
              } catch {
                setCopied('');
              }
            }}
          >
            <span className="color-swatch" style={{ background: hex }}>
              {copied === key ? (
                <span>
                  <Check size={14} />
                  Skopiowano
                </span>
              ) : (
                <Copy
                  size={16}
                  style={{
                    color: ['#ddebfb', '#f4f6fb', '#ffffff', '#d0d4db'].includes(hex)
                      ? '#101317'
                      : '#fff',
                  }}
                />
              )}
            </span>
            <span className="color-info">
              <strong>{name}</strong>
              <code>{hex.toUpperCase()}</code>
              <small>{desc}</small>
            </span>
          </button>
        ))}
      </div>
      <Showcase
        title="Kolory semantyczne"
        note="W komponencie używaj roli koloru, zamiast wpisywać wartość HEX."
        code={
          '/* Portal */\ncolor: var(--m-text);\nbackground: var(--m-surface);\nborder-color: var(--m-border);\n\n/* Akcent biblioteki */\ncolor: var(--m-brand);'
        }
      >
        <div className="stack">
          <Alert tone="info" title="Informacja">
            Wartości portalu pochodzą bezpośrednio z jego aktualnego arkusza CSS.
          </Alert>
          <Alert tone="success" title="Działanie zakończone">
            Zapisano Twoje preferencje.
          </Alert>
          <Alert tone="warning" title="Sprawdź termin">
            Dokument wkrótce straci ważność.
          </Alert>
          <Alert tone="danger" title="Nie udało się zapisać">
            Sprawdź połączenie i spróbuj ponownie.
          </Alert>
        </div>
      </Showcase>
      <div className="download-row">
        <div>
          <strong>Potrzebujesz wszystkich wartości?</strong>
          <p>
            Eksport zawiera kolory semantyczne, odstępy i typografię. Pełny zestaw wartości jest w
            tokens.json, a gotowe zmienne CSS w @mdesign/react/styles.css.
          </p>
        </div>
        <Button variant="secondary" icon={<ArrowDownToLine size={16} />} onClick={downloadTokens}>
          Pobierz JSON
        </Button>
      </div>
    </>
  );
}
function Typography({ platform }: { platform: 'web' | 'mobile' }) {
  const isMobile = platform === 'mobile';
  const scale = isMobile
    ? [
        { name: 'Large title', size: 34, lineHeight: 41 },
        { name: 'Title', size: 28, lineHeight: 34 },
        { name: 'Title 2', size: 22, lineHeight: 28 },
        { name: 'Title 3', size: 20, lineHeight: 25 },
        { name: 'Body', size: 17, lineHeight: 22 },
        { name: 'Callout', size: 16, lineHeight: 21 },
        { name: 'Footnote', size: 13, lineHeight: 18 },
      ]
    : tokens.typography.scale;
  return (
    <>
      <section className="type-intro">
        <div className="type-aa">Aa</div>
        <div>
          <Badge tone="info">{isMobile ? 'FONT APLIKACJI' : 'FONT PORTALU'}</Badge>
          <h2>{isMobile ? 'Font systemowy' : 'Open Sans'}</h2>
          <p>Zażółć gęślą jaźń. Ładne rzeczy są czytelne.</p>
          <div className="type-weights">
            <span>Regular 400</span>
            <strong style={{ fontWeight: 600 }}>Semibold 600</strong>
            <strong>Bold 700</strong>
          </div>
        </div>
      </section>
      <div className="type-specimens">
        {scale.map((t) => (
          <div className="type-row" key={t.name}>
            <div>
              <strong>{t.name}</strong>
              <code>
                {t.size}px / {t.lineHeight}px
              </code>
            </div>
            <p
              style={{
                fontSize: t.size,
                lineHeight: `${t.lineHeight}px`,
                fontWeight: t.size >= 18 ? 700 : 400,
              }}
            >
              {t.size >= 32
                ? 'Twoje sprawy. Po prostu.'
                : 'Wszystko, czego potrzebujesz, w jednym miejscu.'}
            </p>
          </div>
        ))}
      </div>
      <Alert tone="info" title="Typografia mobilna">
        Aplikacja na iOS używa systemowej typografii z Dynamic Type. Wariant mobilny korzysta z
        fontu systemowego przeglądarki; na Windows i Androidzie nie będzie identyczny z San
        Francisco.
      </Alert>
    </>
  );
}
function Spacing() {
  return (
    <>
      <Showcase
        title="Skala odstępów"
        note="Skala odstępów i kształtów biblioteki oparta na module 4 px."
        code={
          'padding: var(--m-space-6); /* 24px */\ngap: var(--m-space-4);          /* 16px */\nborder-radius: var(--m-radius);'
        }
      >
        <div className="spacing-list">
          {tokens.spacing.values
            .filter((n) => n <= 96)
            .map((n) => (
              <div key={n}>
                <code>{n}px</code>
                <span style={{ width: n * 3 }} />
                <small>
                  {n === 16
                    ? 'Odstęp treści mobilnej'
                    : n === 20
                      ? 'Padding karty PrimeNG'
                      : n === 48
                        ? 'Wysokość kontrolki'
                        : ''}
                </small>
              </div>
            ))}
        </div>
      </Showcase>
      <Showcase
        title="Promienie i geometria"
        note="Web i aplikacja zachowują własną geometrię."
        code={'<div data-platform="web">...</div>\n<div data-platform="mobile">...</div>'}
      >
        <div className="radius-grid">
          {[
            [4, 'Przycisk web'],
            [12, 'Karta PrimeNG'],
            [16, 'Karta aplikacji'],
            [24, 'Przycisk aplikacji'],
          ].map(([n, l]) => (
            <div key={l}>
              <span style={{ borderRadius: n as number }}>
                <code>{n}px</code>
              </span>
              <strong>{l}</strong>
            </div>
          ))}
        </div>
      </Showcase>
      <Alert tone="info" title="Siatka responsywna">
        Katalog dopasowuje się do szerokości 320–1920 px. Podgląd mobilny odwzorowuje płótno 375 ×
        812 px. Wybierz platformę, aby sprawdzić jej typografię, odstępy i geometrię kontrolek.
      </Alert>
    </>
  );
}
const iconList: [string, LucideIcon][] = [
  ['Home', Home],
  ['FileText', FileText],
  ['ShieldCheck', ShieldCheck],
  ['CreditCard', CreditCard],
  ['Bell', Bell],
  ['Search', Search],
  ['Settings2', Settings2],
  ['FileCheck2', FileCheck2],
  ['CheckCheck', CheckCheck],
  ['Grid2X2', Grid2X2],
  ['BookOpen', BookOpen],
  ['Smartphone', Smartphone],
  ['Monitor', Monitor],
  ['Palette', Palette],
  ['ArrowRight', ArrowRight],
  ['ChevronRight', ChevronRight],
  ['MoreHorizontal', MoreHorizontal],
  ['CircleHelp', CircleHelp],
  ['Sun', Sun],
  ['Moon', Moon],
];
function ServiceIconShowcase() {
  return (
    <Showcase
      title="Ikony usług w dwóch motywach"
      note="ServiceIcon dobiera grafikę do motywu. NativeIcon zachowuje opublikowane oryginały COI."
      code={
        '<ServiceIcon name="pesel" size={28} />\n<ServiceIcon name="pesel" theme="dark" size={28} />\n// Dla ikony, która samodzielnie niesie znaczenie: title="Zastrzeż PESEL".'
      }
    >
      <div className="demo-grid">
        {(['light', 'dark'] as const).map((theme) => (
          <div
            key={theme}
            data-theme={theme}
            className="stack"
            style={{
              padding: 16,
              borderRadius: 16,
              background: 'var(--m-surface)',
              color: 'var(--m-text)',
            }}
          >
            <strong>{theme === 'light' ? 'Jasny motyw' : 'Ciemny motyw'}</strong>
            <div className="demo-row">
              {serviceIconNames.map((name) => (
                <ServiceIcon key={name} name={name} size={28} title={name} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Showcase>
  );
}
function Icons() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<NativeIconName>('pesel');
  const [source, setSource] = useState<'native' | 'lucide'>('native');
  return (
    <>
      <ServiceIconShowcase />
      <div className="icon-source-bar">
        <div>
          <Badge tone="success">{nativeIconNames.length} aliasy ikon natywnych</Badge>
          <p>Opublikowane zasoby mobilnego design systemu. Licencja MIT, Copyright 2025 COI.</p>
        </div>
        <div className="segmented">
          <button aria-pressed={source === 'native'} onClick={() => setSource('native')}>
            Oryginały COI
          </button>
          <button aria-pressed={source === 'lucide'} onClick={() => setSource('lucide')}>
            Lucide
          </button>
        </div>
      </div>
      <div className="icon-search">
        <TextField
          label="Znajdź ikonę"
          placeholder={
            source === 'native' ? 'np. pesel, documents, payments…' : 'np. Shield, File, Arrow…'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span>24 × 24 px · SVG</span>
      </div>
      {source === 'native' ? (
        <>
          <div className="icon-grid">
            {nativeIconNames
              .filter((n) => n.includes(query.toLowerCase()))
              .map((name) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  aria-pressed={selected === name}
                >
                  <NativeIcon name={name} size={30} />
                  <span>{name}</span>
                </button>
              ))}
          </div>
          <Code>{`import { NativeIcon } from '@mdesign/react';\n\n<NativeIcon name="${selected}" size={24} />\n// Dekoracyjne domyślnie. Dla znaczenia użyj title="…".`}</Code>
          <p className="icon-provenance">
            Ikony jednobarwne przyjmują currentColor przez maskę CSS. Neutralne miniatury dokumentów
            zachowują identyfikatory API. Źródła i sumy plików: native-icons/provenance.json.
          </p>
        </>
      ) : (
        <>
          <Alert tone="info" title="Ikony uzupełniające">
            Lucide służy do ikon katalogu i elementów, dla których nie dołączono oryginału COI.
          </Alert>
          <div className="icon-grid">
            {iconList
              .filter(([n]) => n.toLowerCase().includes(query.toLowerCase()))
              .map(([name, Icon]) => (
                <div className="icon-static" key={name}>
                  <Icon size={26} strokeWidth={1.75} />
                  <span>{name}</span>
                </div>
              ))}
          </div>
          <Code>
            {
              'import { ShieldCheck } from \'lucide-react\';\n\n<ShieldCheck size={24} strokeWidth={1.75} aria-hidden="true" />'
            }
          </Code>
        </>
      )}
    </>
  );
}

function ButtonsPage() {
  const [variant, setVariant] = useState('primary');
  const [size, setSize] = useState('md');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clicks, setClicks] = useState(0);
  return (
    <>
      <Showcase
        title="Plac zabaw"
        note="Zmień właściwości i sprawdź wynik. Przycisk działa."
        code={`<Button variant="${variant}" size="${size}"${disabled ? ' disabled' : ''}${loading ? ' loading' : ''}>\n  Przejdź dalej\n</Button>`}
      >
        <div className="playground">
          <div className="playground-stage">
            <Button
              variant={variant as 'primary'}
              size={size as 'md'}
              disabled={disabled}
              loading={loading}
              icon={<ArrowRight size={18} />}
              onClick={() => setClicks((c) => c + 1)}
            >
              Przejdź dalej
            </Button>
            <span aria-live="polite">
              {clicks ? `Kliknięcia: ${clicks}` : 'Kliknij, aby sprawdzić interakcję'}
            </span>
          </div>
          <div className="playground-controls">
            <Select
              label="Wariant"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              options={['primary', 'secondary', 'tertiary', 'danger'].map((value) => ({
                value,
                label: value,
              }))}
            />
            <Select
              label="Rozmiar"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              options={['sm', 'md', 'lg'].map((value) => ({ value, label: value }))}
            />
            <Switch label="Nieaktywny" checked={disabled} onCheckedChange={setDisabled} />
            <Switch label="Ładowanie" checked={loading} onCheckedChange={setLoading} />
          </div>
        </div>
      </Showcase>
      <Showcase
        title="Hierarchia akcji"
        note="Jedna główna akcja w danym kontekście. Pozostałe mają niższy priorytet."
        code={
          '<Button>Zapisz zmiany</Button>\n<Button variant="secondary">Anuluj</Button>\n<Button variant="tertiary">Dowiedz się więcej</Button>\n<Button variant="danger">Usuń dokument</Button>'
        }
      >
        <div className="demo-row">
          <Button onClick={() => setClicks((c) => c + 1)}>Zapisz zmiany</Button>
          <Button variant="secondary">Anuluj</Button>
          <Button variant="tertiary" icon={<ChevronRight size={17} />}>
            Dowiedz się więcej
          </Button>
          <Button variant="danger">Usuń dokument</Button>
        </div>
      </Showcase>
      <Showcase
        title="Stany i przyciski ikonowe"
        note="W aplikacji rozmiary sm i lg mają 32 i 48 px. Domyślny glyph pozostawia samą ikonę 24 px."
        code={
          '<IconButton label="Dodaj dokument" variant="primary" size="sm">\n <NativeIcon name="plus" size={24} />\n</IconButton>\n<IconButton label="Dodaj dokument" variant="primary" size="lg">\n <NativeIcon name="plus" size={24} />\n</IconButton>\n<IconButton label="Powiadomienia" variant="secondary" size="lg">\n <NativeIcon name="bell" size={24} />\n</IconButton>'
        }
      >
        <div className="stack">
          <div className="demo-row">
            <Button loading>Zapisywanie</Button>
            <Button disabled>Niedostępny</Button>
            <Spinner />
          </div>
          <div className="demo-row">
            <Tooltip content="Dodaj · 32 px">
              <IconButton
                label="Dodaj dokument · 32 px"
                variant="primary"
                size="sm"
                onClick={() => setClicks((c) => c + 1)}
              >
                <NativeIcon name="plus" size={24} />
              </IconButton>
            </Tooltip>
            <Tooltip content="Dodaj · 48 px">
              <IconButton
                label="Dodaj dokument · 48 px"
                variant="primary"
                size="lg"
                onClick={() => setClicks((c) => c + 1)}
              >
                <NativeIcon name="plus" size={24} />
              </IconButton>
            </Tooltip>
            <Tooltip content="Powiadomienia · secondary">
              <IconButton
                label="Powiadomienia · secondary"
                variant="secondary"
                size="lg"
                onClick={() => setClicks((c) => c + 1)}
              >
                <NativeIcon name="bell" size={24} />
              </IconButton>
            </Tooltip>
            <Tooltip content="Powiadomienia · glyph">
              <IconButton
                label="Powiadomienia · glyph"
                size="glyph"
                onClick={() => setClicks((c) => c + 1)}
              >
                <NativeIcon name="bell" size={24} />
              </IconButton>
            </Tooltip>
            <IconButton label="Niedostępna akcja" variant="primary" size="lg" disabled>
              <NativeIcon name="plus" size={24} />
            </IconButton>
          </div>
        </div>
      </Showcase>
      <PropsTable
        rows={[
          ['variant', 'primary | secondary | tertiary | danger', 'primary'],
          ['size', 'sm | md | lg', 'md'],
          ['loading', 'boolean', 'false'],
          ['disabled', 'boolean', 'false'],
          ['icon', 'ReactNode', '—'],
          ['onClick', 'MouseEventHandler', '—'],
        ]}
      />
    </>
  );
}
function FormsPage() {
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('app');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setSaved(valid);
  }
  return (
    <>
      <Showcase
        title="Wyszukiwanie i pole formularza"
        note="W aplikacji SearchField ma wysokość 36 px, a TextField 56 px. Wyszukiwanie ma dostępną, wizualnie ukrytą etykietę."
        code={
          'const [query, setQuery] = useState(\'\');\n<SearchField label="Szukaj usług" value={query}\n onChange={e => setQuery(e.target.value)} />\n<TextField label="Nazwa usługi" />'
        }
      >
        <div className="demo-grid">
          <div className="stack">
            <SearchField
              label="Szukaj usług"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <p className="demo-paragraph" role="status">
              {search
                ? `Szukasz: ${search}`
                : 'Wpisz nazwę usługi. Przycisk czyszczenia przywraca fokus do pola.'}
            </p>
          </div>
          <TextField label="Nazwa usługi" placeholder="Wpisz nazwę" />
        </div>
      </Showcase>
      <Showcase
        title="Pola tekstowe"
        note="Etykiety i komunikaty są programowo powiązane z polem."
        code={
          '<TextField label="Adres e-mail" type="email"\n  hint="Na ten adres wyślemy potwierdzenie." />\n<TextField label="Kod pocztowy" error="Wpisz kod w formacie 00-000." />'
        }
      >
        <div className="demo-grid">
          <TextField
            label="Imię i nazwisko"
            placeholder="Wpisz imię i nazwisko"
            hint="Zgodnie z Twoim dokumentem."
          />
          <TextField label="Adres e-mail" type="email" defaultValue="jan.kowalski@example.pl" />
          <TextField
            label="Kod pocztowy"
            defaultValue="00123"
            error="Wpisz kod w formacie 00-000."
          />
          <TextField
            label="Numer sprawy"
            defaultValue="MOB/2026/001"
            disabled
            hint="Pole niedostępne do edycji."
          />
          <TextArea
            label="Dodatkowe informacje"
            placeholder="Wpisz treść wiadomości…"
            hint="Nie podawaj danych wrażliwych w wersji demonstracyjnej."
          />
          <Select
            label="Wybierz województwo"
            options={[
              { value: '', label: 'Wybierz z listy' },
              { value: 'maz', label: 'Mazowieckie' },
              { value: 'mal', label: 'Małopolskie' },
              { value: 'pom', label: 'Pomorskie' },
              { value: 'wlkp', label: 'Wielkopolskie' },
            ]}
          />
        </div>
      </Showcase>
      <Showcase
        title="Wybór i przełączanie"
        code={
          '<Checkbox label="Chcę otrzymywać powiadomienia" />\n<Radio name="channel" value="app" label="Aplikacja" />\n<Switch label="Powiadomienia push" checked={enabled}\n  onCheckedChange={setEnabled} />'
        }
      >
        <div className="demo-grid">
          <div className="stack">
            <Checkbox
              label="Zapoznałem się z informacją"
              hint="Możesz zmienić wybór w dowolnym momencie."
            />
            <Checkbox label="Zaznaczona opcja" defaultChecked />
            <Checkbox label="Opcja niedostępna" disabled />
          </div>
          <div className="stack">
            <Radio
              label="Powiadomienie w aplikacji"
              name="channel"
              checked={radio === 'app'}
              onChange={() => setRadio('app')}
            />
            <Radio
              label="Wiadomość e-mail"
              name="channel"
              checked={radio === 'email'}
              onChange={() => setRadio('email')}
            />
            <Divider />
            <Switch label="Powiadomienia push" checked={checked} onCheckedChange={setChecked} />
          </div>
        </div>
      </Showcase>
      <Showcase
        title="Przykład z walidacją"
        note="Wpisz poprawny adres i wyślij formularz. Dane pozostają w przeglądarce."
        code={
          "const [email, setEmail] = useState('');\n<TextField label=\"Adres e-mail\" value={email}\n  onChange={e => setEmail(e.target.value)}\n  error={hasError ? 'Podaj poprawny adres e-mail.' : undefined} />"
        }
      >
        <form className="validation-form" onSubmit={submit} noValidate>
          <TextField
            label="Adres e-mail do powiadomień"
            value={email}
            type="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setSaved(false);
            }}
            error={submitted && !valid ? 'Podaj poprawny adres e-mail.' : undefined}
            hint="Przykład: jan@example.pl"
            required
          />
          <Button type="submit" icon={<ArrowRight size={16} />}>
            Zapisz preferencje
          </Button>
          {saved && (
            <Alert tone="success" title="Zapisano preferencje">
              To demonstracja. Żadne dane nie zostały wysłane.
            </Alert>
          )}
        </form>
      </Showcase>
    </>
  );
}
function NavigationPage() {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState('documents');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navItems = [
    {
      value: 'documents',
      label: 'Dokumenty',
      icon: <NativeIcon name="documents" size={24} />,
      activeIcon: <NativeIcon name="documents-filled" size={24} />,
    },
    {
      value: 'services',
      label: 'Usługi',
      icon: <NativeIcon name="services" size={24} />,
      activeIcon: <NativeIcon name="services-filled" size={24} />,
    },
    {
      value: 'qr',
      label: 'Kod QR',
      icon: <NativeIcon name="qr" size={24} />,
      activeIcon: <NativeIcon name="qr-filled" size={24} />,
    },
    {
      value: 'more',
      label: 'Więcej',
      icon: <NativeIcon name="more" size={24} />,
      activeIcon: <NativeIcon name="more-filled" size={24} />,
    },
  ];
  return (
    <>
      <Showcase
        title="Zakładki"
        code={
          '<Tabs defaultValue="documents" items={[\n { value: "documents", label: "Dokumenty", content: <Documents /> },\n { value: "services", label: "Usługi", content: <Services /> }\n]} />'
        }
      >
        <Tabs
          items={[
            {
              value: 'documents',
              label: 'Dokumenty',
              content: (
                <EmptyState
                  icon={<FileText />}
                  title="Twoje dokumenty"
                  description="Wszystkie dokumenty w jednym miejscu."
                />
              ),
            },
            {
              value: 'services',
              label: 'Usługi',
              content: (
                <ServiceTile
                  title="Zastrzeż PESEL"
                  description="Zadbaj o bezpieczeństwo danych."
                  icon={<ShieldCheck />}
                />
              ),
            },
            {
              value: 'settings',
              label: 'Ustawienia',
              content: (
                <p className="demo-paragraph">
                  Tutaj znajdziesz ustawienia profilu i preferencje aplikacji.
                </p>
              ),
            },
          ]}
        />
      </Showcase>
      <Showcase
        title="Ścieżka nawigacji"
        code={
          '<Breadcrumbs items={[\n {label:"Strona główna", href:"/"},\n {label:"Usługi", href:"/uslugi"},\n {label:"Zastrzeż PESEL"}\n]} />'
        }
      >
        <Breadcrumbs
          items={[
            { label: 'Strona główna', href: '#overview' },
            { label: 'Usługi', href: '#cards' },
            { label: 'Zastrzeż PESEL' },
          ]}
        />
      </Showcase>
      <Showcase
        title="Paginacja"
        note="Bieżąca strona jest oznaczona przez aria-current."
        code={'<Pagination page={page} total={8} onPageChange={setPage} />'}
      >
        <div className="stack">
          <p className="demo-paragraph" aria-live="polite">
            Strona {page} z 8 · Przykładowe wyniki {(page - 1) * 10 + 1}–{page * 10}
          </p>
          <Pagination page={page} total={8} onPageChange={setPage} />
        </div>
      </Showcase>
      <Showcase
        title="Nagłówek i nawigacja aplikacji"
        note="Dolna nawigacja przyjmuje osobne ikony aktywne i opcjonalny wskaźnik systemowy. Sidebar jest wewnętrzną nawigacją; pełny układ portalu znajdziesz w przykładowych ekranach."
        code={
          'const items = [{\n value: "documents", label: "Dokumenty",\n icon: <NativeIcon name="documents" />,\n activeIcon: <NativeIcon name="documents-filled" />\n}];\n<Sidebar mode="drawer" onClose={closeNavigation}\n items={items} value={active} onValueChange={setActive} />\n<BottomNavigation items={items} value={active}\n onValueChange={setActive} homeIndicator />'
        }
      >
        <div className="stack">
          <AppHeader brand="Moja aplikacja" actions={<Avatar name="Jan Kowalski" />} />
          <div className="pattern-layout">
            {drawerOpen && (
              <Sidebar
                items={navItems}
                value={active}
                onValueChange={setActive}
                mode="drawer"
                onClose={() => setDrawerOpen(false)}
              />
            )}
            <div className="pattern-layout-content">
              <h3>{navItems.find((i) => i.value === active)?.label}</h3>
              <p>Układ zbudowany z komponentów biblioteki.</p>
              {!drawerOpen && (
                <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                  Otwórz nawigację
                </Button>
              )}
            </div>
          </div>
          <BottomNavigation
            items={navItems}
            value={active}
            onValueChange={setActive}
            homeIndicator
          />
        </div>
      </Showcase>
    </>
  );
}
function CardsPage() {
  const [selected, setSelected] = useState('');
  return (
    <>
      <Showcase
        title="Karty usług"
        note="Cała karta jest przyciskiem. Semantyka pozostaje dostępna dla klawiatury."
        code={
          '<ServiceTile title="Zastrzeż PESEL"\n description="Chroń swoje dane przed wyłudzeniem."\n icon={<ShieldCheck />} onClick={openService} />'
        }
      >
        <div className="demo-grid three">
          <ServiceTile
            icon={<ServiceIcon name="pesel" size={28} />}
            title="Zastrzeż PESEL"
            description="Chroń swoje dane."
            color="#713fba"
            onClick={() => setSelected('Zastrzeż PESEL')}
          />
          <ServiceTile
            icon={<NativeIcon name="payments" size={28} />}
            title="ePłatności"
            description="Wygodnie opłacaj należności."
            color="#008fa8"
            onClick={() => setSelected('ePłatności')}
          />
          <ServiceTile
            icon={<ServiceIcon name="signature" size={28} />}
            title="Podpisz dokument"
            description="Załatw sprawę online."
            onClick={() => setSelected('Podpisz dokument')}
          />
        </div>
        {selected && (
          <p role="status" className="demo-paragraph">
            Wybrana usługa: <strong>{selected}</strong>
          </p>
        )}
      </Showcase>
      <Showcase
        title="Karta treści i lista"
        code={
          '<Card title="Twoje sprawy" action={<Button variant="tertiary">Wszystkie</Button>}>\n <ListRow icon={<FileText />} title="Wniosek o dowód"\n   description="Złożono 19.10.2026" trailing={<Badge>W toku</Badge>} />\n</Card>'
        }
      >
        <div className="demo-grid">
          <Card title="Twoje sprawy" action={<Badge tone="info">2 sprawy</Badge>}>
            <ListRow
              icon={<FileText />}
              title="Wniosek o wydanie dokumentu"
              description="Złożono 19.10.2026"
              trailing={<Badge tone="warning">W toku</Badge>}
            />
            <ListRow
              icon={<CheckCheck />}
              title="Zgłoszenie zmiany adresu"
              description="Złożono 16.10.2026"
              trailing={<Badge tone="success">Gotowe</Badge>}
            />
          </Card>
          <Card title="Twój profil">
            <div className="profile-demo">
              <Avatar name="Jan Kowalski" />
              <div>
                <strong>Jan Kowalski</strong>
                <p>Dane przykładowe</p>
              </div>
              <Badge tone="success">Aktywny</Badge>
            </div>
            <Divider />
            <ListRow
              title="Powiadomienia"
              icon={<Bell />}
              trailing={<Badge tone="info">3</Badge>}
            />
          </Card>
        </div>
      </Showcase>
      <Showcase
        title="Avatar i etykiety"
        code={'<Avatar name="Jan Kowalski" />\n<Badge tone="success">Aktywny</Badge>'}
      >
        <div className="demo-row">
          <Avatar name="Jan Kowalski" />
          <Avatar name="Anna Nowak" />
          <Badge>Informacja</Badge>
          <Badge tone="info">Nowe</Badge>
          <Badge tone="success">Aktywny</Badge>
          <Badge tone="warning">Oczekuje</Badge>
          <Badge tone="danger">Wygasł</Badge>
        </div>
      </Showcase>
      <Showcase
        title="Kafle dokumentów"
        note="DocumentTile łączy ikonę, nazwę i tło dokumentu. Warianty korzystają z neutralnych ilustracji demonstracyjnych."
        code={
          '<DocumentTile title="mDowód" artwork="id"\n icon={<NativeIcon name="id-logo" size={32} />}\n onClick={openDocument} />\n// Dostępne artwork: id | pension | family | vehicles.\n// Własna karta może użyć dekoracyjnego <DocumentArtwork variant="id" />.'
        }
      >
        <div className="demo-grid">
          <DocumentTile
            title="mDowód"
            artwork="id"
            icon={<NativeIcon name="id-logo" size={32} />}
            onClick={() => setSelected('mDowód')}
          />
          <DocumentTile
            title="Legitymacja emeryta-rencisty"
            artwork="pension"
            icon={<NativeIcon name="pension-logo" size={32} />}
            onClick={() => setSelected('Legitymacja emeryta-rencisty')}
          />
          <DocumentTile
            title="Karta Dużej Rodziny"
            artwork="family"
            icon={<NativeIcon name="family-logo" size={32} />}
            onClick={() => setSelected('Karta Dużej Rodziny')}
          />
          <DocumentTile
            title="Moje pojazdy"
            artwork="vehicles"
            icon={<NativeIcon name="id-logo" size={32} />}
            onClick={() => setSelected('Moje pojazdy')}
          />
        </div>
        <p className="demo-paragraph" role="status">
          {selected ? 'Wybrano: ' + selected : 'Wybierz dokument, aby sprawdzić interakcję.'}
        </p>
      </Showcase>
      <Showcase
        title="Duże karty dokumentów"
        note="DocumentCard: wysokość 226 px, promień 16 px, tytuł do dwóch wierszy. Wybierz tło i ikonę dla swojej karty dokumentu."
        code={
          '<DocumentCard title="mDowód"\n backgroundImage={documentBackgrounds.idWide}\n trailing={<NativeIcon name="id-logo" size={32} />} />'
        }
      >
        <div className="demo-grid" data-platform="mobile">
          <DocumentCard
            title="mDowód"
            backgroundImage={documentBackgrounds.idWide}
            trailing={<NativeIcon name="id-logo" size={32} />}
            onClick={() => setSelected('mDowód')}
          />
          <DocumentCard
            title="Legitymacja emeryta-rencisty"
            backgroundImage={documentBackgrounds.pensionWide}
            trailing={<NativeIcon name="pension-logo" size={32} />}
          />
          <DocumentCard
            title="Karta Dużej Rodziny"
            backgroundImage={documentBackgrounds.familyWide}
            trailing={<NativeIcon name="family-logo" size={32} />}
          />
          <DocumentCard title="Moje pojazdy" backgroundImage={documentBackgrounds.vehiclesWide} />
        </div>
      </Showcase>
    </>
  );
}
function FeedbackPage() {
  const [progress, setProgress] = useState(65);
  return (
    <>
      <Showcase
        title="Komunikaty"
        note="Kolor uzupełnia ikonę i tekst. Nie jest jedynym nośnikiem znaczenia."
        code={
          '<Alert tone="success" title="Dokument został dodany">\n Znajdziesz go na liście swoich dokumentów.\n</Alert>'
        }
      >
        <div className="stack">
          <Alert tone="info" title="Warto wiedzieć">
            Twoje dane są aktualizowane automatycznie.
          </Alert>
          <Alert tone="success" title="Dokument został dodany">
            Znajdziesz go na liście swoich dokumentów.
          </Alert>
          <Alert tone="warning" title="Zbliża się termin płatności">
            Opłać należność do 24 października.
          </Alert>
          <Alert tone="danger" title="Nie udało się pobrać danych">
            Spróbuj ponownie za chwilę.
          </Alert>
        </div>
      </Showcase>
      <Showcase
        title="Postęp i ładowanie"
        code={
          '<Progress value={65} label="Pobieranie dokumentu" />\n<Skeleton style={{ height: 24, width: \'60%\' }} />\n<Spinner />'
        }
      >
        <div className="demo-grid">
          <div className="stack">
            <Progress value={progress} label="Pobieranie dokumentu" />
            <label className="range-label">
              Zmień postęp
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="skeleton-demo">
            <Skeleton style={{ width: 48, height: 48, borderRadius: 8 }} />
            <div>
              <Skeleton style={{ width: '70%', height: 16 }} />
              <Skeleton style={{ width: '90%', height: 12, marginTop: 12 }} />
            </div>
            <Spinner />
          </div>
        </div>
      </Showcase>
      <Showcase
        title="Stan pusty"
        code={
          '<EmptyState icon={<FileText />}\n title="Tu pojawią się Twoje dokumenty"\n description="Dodaj pierwszy dokument, by mieć go pod ręką."\n action={<Button>Dodaj dokument</Button>} />'
        }
      >
        <EmptyState
          icon={<FileText size={32} />}
          title="Tu pojawią się Twoje dokumenty"
          description="Dodaj pierwszy dokument, by mieć go zawsze pod ręką."
          action={
            <Dialog
              trigger={<Button>Dodaj dokument</Button>}
              title="Dodawanie dokumentu"
              description="Przykładowy dialog w bibliotece komponentów."
            >
              <Alert tone="info" title="Wersja demonstracyjna">
                W tym miejscu Twoja aplikacja może rozpocząć proces dodawania dokumentu.
              </Alert>
            </Dialog>
          }
        />
      </Showcase>
    </>
  );
}
function OverlaysPage() {
  return (
    <>
      <Showcase
        title="Okno dialogowe"
        note="Zatrzymuje fokus, zamyka się klawiszem Escape i oddaje fokus do przycisku."
        code={
          '<Dialog trigger={<Button>Otwórz dialog</Button>}\n title="Zapisz preferencje" description="Sprawdź wybrane ustawienia.">\n <Checkbox label="Powiadomienia w aplikacji" defaultChecked />\n</Dialog>'
        }
      >
        <div className="dialog-demo">
          <span className="dialog-demo-icon">
            <Layers size={32} />
          </span>
          <h3>Najważniejsza decyzja ma swoją przestrzeń.</h3>
          <p>Sprawdź okno z dostępną obsługą klawiatury.</p>
          <Dialog
            trigger={<Button icon={<ExternalLink size={16} />}>Otwórz dialog</Button>}
            title="Twoje preferencje"
            description="Wybierz sposób otrzymywania informacji."
          >
            <div className="stack">
              <Checkbox label="Powiadomienia w aplikacji" defaultChecked />
              <Checkbox label="Wiadomości e-mail" />
              <Alert tone="info" title="Zmienisz to w każdej chwili">
                To demonstracja komponentu, ustawienia nie są zapisywane na serwerze.
              </Alert>
            </div>
          </Dialog>
        </div>
      </Showcase>
      <Showcase
        title="Rozwijane sekcje"
        code={
          '<Accordion items={[\n {title:"Jak dodać dokument?", content:"Otwórz kartę Dokumenty…"},\n {title:"Czy dane są bezpieczne?", content:"Dowiedz się więcej…"}\n]} />'
        }
      >
        <Accordion
          items={[
            {
              title: 'Jak użyć komponentów w swoim projekcie?',
              content:
                'Utwórz paczkę poleceniem bun run pack:lib, zainstaluj archiwum TGZ i zaimportuj komponenty oraz arkusz stylów. Szczegóły znajdziesz w zakładce Dla developera.',
            },
            {
              title: 'Czy biblioteka ma ciemny motyw?',
              content:
                'Tak. Ustaw data-theme="dark" na elemencie otaczającym interfejs. Wszystkie komponenty korzystają ze wspólnych zmiennych kolorów.',
            },
            {
              title: 'Czy to oficjalna biblioteka mObywatela?',
              content:
                'To niezależna implementacja React na podstawie publicznych źródeł. Pochodzenie zasobów opisuje zakładka Źródła i licencje.',
            },
          ]}
        />
      </Showcase>
      <Showcase
        title="Podpowiedzi"
        code={
          '<Tooltip content="Ustawienia profilu">\n <IconButton label="Ustawienia profilu"><Settings2 /></IconButton>\n</Tooltip>'
        }
      >
        <div className="demo-row">
          <Tooltip content="Ustawienia profilu">
            <IconButton label="Ustawienia profilu">
              <Settings2 size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Pomoc i odpowiedzi">
            <IconButton label="Pomoc i odpowiedzi">
              <CircleHelp size={20} />
            </IconButton>
          </Tooltip>
          <p className="demo-paragraph">Najedź kursorem lub przejdź do przycisku klawiszem Tab.</p>
        </div>
      </Showcase>
    </>
  );
}
function PropsTable({ rows }: { rows: string[][] }) {
  return (
    <section className="props-section">
      <h2>API komponentu</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Właściwość</th>
              <th>Typ</th>
              <th>Domyślnie</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                {r.map((v, i) => (
                  <td key={i}>
                    <code>{v}</code>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Komponent przekazuje natywne atrybuty HTML. Pełne typy są eksportowane w bibliotece.</p>
    </section>
  );
}
function Installation() {
  const archive = `mdesign-react-${componentManifest.version}.tgz`;
  return (
    <div className="docs-content">
      <Alert tone="info" title="Biblioteka lokalna">
        Pakiet nie jest opublikowany w npm. Projekt zawiera działający katalog oraz osobny build
        biblioteki do integracji.
      </Alert>
      <h2>1. Uruchom katalog</h2>
      <Code>{'bun install --frozen-lockfile\nbun run dev\n# http://localhost:5173'}</Code>
      <h2>2. Zbuduj bibliotekę</h2>
      <Code>
        {`bun run pack:lib\n# artifacts/current/${archive}\n\n# W aplikacji konsumenta:\nbun add /ścieżka/do/${archive}`}
      </Code>
      <p>
        Archiwum zawiera komponenty, deklaracje TypeScript, style i zasoby. Zainstaluj je w swojej
        aplikacji; React i React DOM są zależnościami peer.
      </p>
      <Code>
        {`// package.json projektu konsumenta\n"dependencies": {\n  "@mdesign/react": "file:../mdesign-react/artifacts/current/${archive}"\n}`}
      </Code>
      <h2>3. Zbuduj swój interfejs</h2>
      <Code>
        {
          'import { Button, Card, TextField } from \'@mdesign/react\';\nimport \'@mdesign/react/styles.css\';\n\nexport function MyForm() {\n  return (\n    <div data-platform="web" data-theme="light">\n      <Card title="Twoje dane">\n        <TextField label="Imię" autoComplete="given-name" />\n        <Button type="submit">Zapisz</Button>\n      </Card>\n    </div>\n  );\n}'
        }
      </Code>
      <h2>Platforma i motyw</h2>
      <p>
        Portal i aplikacja mają osobną geometrię przycisków, fonty i kolor akcji. Zmiana atrybutu
        przełącza wariant całego drzewa komponentów.
      </p>
      <Code>
        {'<div data-platform="mobile" data-theme="dark">\n  <Button>Przejdź dalej</Button>\n</div>'}
      </Code>
      <h2>Tokeny i własne rozszerzenia</h2>
      <Code>
        {
          '/* CSS — webowe przyciski w Twoim kontekście */\n.my-app {\n  --m-prime-brand: #0f6b5a;\n  --m-prime-brand-hover: #0a5144;\n  --m-prime-brand-active: #073d33;\n  --m-prime-on-brand: #fff;\n  font-family: var(--m-font);\n  color: var(--m-text);\n}\n.my-app .m-button {\n  border-radius: 8px;\n}'
        }
      </Code>
      <h2>Weryfikacja</h2>
      <Code>{'bun run verify\nbun run test:browser\nbun run test:stories\nbun run build'}</Code>
      <p>
        Dialogi, zakładki i podpowiedzi korzystają z Radix. NativeIcon udostępnia ikony natywne, a
        ServiceIcon ich warianty usług; Lucide uzupełnia pozostałe ikony. React i React DOM są
        zależnościami peer. Przykłady używają wyłącznie danych demonstracyjnych.
      </p>
    </div>
  );
}
function Sources() {
  return (
    <div className="docs-content">
      <h2>Źródła i licencje</h2>
      <p>
        Niezależna biblioteka mDesign jest udostępniana na MIT. Fonty, ikony i zależności zachowują
        własne licencje.
      </p>
      <ul>
        <li>
          <a href="https://github.com/slominskiwiktor/mdesign-react/blob/main/LICENSE">
            Licencja projektu
          </a>
        </li>
        <li>
          <a href="https://github.com/slominskiwiktor/mdesign-react/blob/main/THIRD_PARTY_NOTICES.md">
            Autorstwo i licencje zasobów
          </a>
        </li>
        <li>
          <a href="https://github.com/slominskiwiktor/mdesign-react/blob/main/docs/REFERENCES.md">
            Źródła tokenów i ikon
          </a>
        </li>
      </ul>
    </div>
  );
}
