import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '../kit';
import emblem from './desktop-assets/demo-mark.svg';
import deliveryBanner from './desktop-assets/demo-banner-e-delivery.svg';
import googlePlay from './desktop-assets/demo-google-play.svg';
import appStore from './desktop-assets/demo-app-store.svg';
import bars from '../kit/official-icons/icon-307.svg';
import user from '../kit/official-icons/icon-232.svg';
import down from '../kit/official-icons/icon-211.svg';
import right from '../kit/official-icons/icon-209.svg';
import close from '../kit/official-icons/icon-212.svg';
import home from '../kit/official-icons/icon-204.svg';
import inbox from '../kit/official-icons/icon-302.svg';
import folder from '../kit/official-icons/icon-302.svg';
import car from '../kit/official-icons/icon-340.svg';
import credit from '../kit/official-icons/icon-312.svg';
import document from '../kit/official-icons/icon-193.svg';
import documentPen from '../kit/official-icons/icon-220.svg';
import question from '../kit/official-icons/icon-218.svg';
import phone from '../kit/official-icons/icon-291.svg';
import logout from '../kit/official-icons/icon-222.svg';
import check from '../kit/official-icons/icon-279.svg';
import information from '../kit/official-icons/icon-178.svg';
import external from '../kit/official-icons/icon-298.svg';
import left from '../kit/official-icons/icon-208.svg';
import affairs from '../kit/official-icons/icon-185.svg';
import payments from '../kit/official-icons/icon-287.svg';
import catalog from '../kit/official-icons/icon-252.svg';
import popular from '../kit/official-icons/icon-292.svg';
import calendar from '../kit/official-icons/icon-274.svg';
import './desktop-screen.css';

const icons = {
  bars,
  user,
  down,
  right,
  close,
  home,
  inbox,
  folder,
  car,
  credit,
  document,
  documentPen,
  question,
  phone,
  logout,
  check,
  information,
  external,
  left,
  affairs,
  payments,
  catalog,
  popular,
  calendar,
};
type IconName = keyof typeof icons;
function WebIcon({
  name,
  size = 24,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className="od-icon"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        mask: `url("${icons[name]}") center / contain no-repeat`,
        WebkitMask: `url("${icons[name]}") center / contain no-repeat`,
        ...style,
      }}
    />
  );
}

type View =
  'home' | 'catalog' | 'source' | 'cases' | 'payments' | 'inboxes' | 'data' | 'vehicles' | 'help';
export interface DesktopScreenProps {
  initialView?: 'home' | 'catalog' | 'source';
}
const navigation: { view: View; label: string; icon: IconName }[] = [
  { view: 'home', label: 'Strona główna', icon: 'home' },
  { view: 'inboxes', label: 'Twoje skrzynki', icon: 'inbox' },
  { view: 'cases', label: 'Twoje sprawy', icon: 'folder' },
  { view: 'data', label: 'Twoje dane', icon: 'user' },
  { view: 'vehicles', label: 'Kierowca i pojazdy', icon: 'car' },
  { view: 'payments', label: 'ePłatności', icon: 'credit' },
  { view: 'catalog', label: 'Załatw sprawę online', icon: 'documentPen' },
  { view: 'help', label: 'Centrum pomocy', icon: 'question' },
];
const categories = [
  'Dokumenty i dane osobowe',
  'Kierowcy i pojazdy',
  'Rodzina i małżeństwo',
  'Zaświadczenia i odpisy',
  'Wyjazdy i wypoczynek',
  'Zasiłki i pomoc finansowa',
];
const popularServices = [
  'Wyślij pismo ogólne',
  'Zgłoś zbycie lub nabycie pojazdu',
  'Zgłoś urodzenie dziecka',
  'Podpisz dokument elektronicznie',
  'Uzyskaj dowód osobisty dla dziecka',
  'Zastrzeż PESEL',
];
const caseServices = [
  {
    title: 'Wniosek o wydanie dowodu osobistego',
    description:
      'Przykładowa karta dokumentu pokazuje układ informacji i dostępne akcje. Wyświetlane dane służą demonstracji komponentu.',
  },
  {
    title: 'Wniosek o wydanie dowodu osobistego dla dziecka lub podopiecznego',
    description:
      'Chcesz wyjechać z dzieckiem za granicę? Potrzebujesz dla niego dokumentu tożsamości? Złóż wniosek o dowód.',
  },
  {
    title: 'Zgłoszenie utraty lub uszkodzenia dowodu osobistego dziecka lub innej osoby',
    description:
      'Treść demonstracyjna mDesign. Ten przykład pokazuje kompozycję interfejsu; aplikacja korzystająca z biblioteki dostarcza własne dane i obsługę akcji.',
  },
];

function DashboardTile({
  title,
  icon,
  children,
  className = '',
  action,
}: {
  title: string;
  icon: IconName;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`od-dashboard-tile ${className}`}>
      <h2>
        <WebIcon name={icon} size={32} />
        {title}
      </h2>
      {children}
      {action && <div className="od-tile-action">{action}</div>}
    </section>
  );
}
function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="od-page-title">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}

/** Reproduces the currently served authenticated portal shell and public page structures.
 * Reference geometry and public asset provenance are in desktop-assets/provenance.json.
 * All account and interaction state below is local demonstration data.
 */
export function DesktopScreen({ initialView = 'home' }: DesktopScreenProps) {
  const [view, setView] = useState<View>(initialView);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wide, setWide] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState('Spacings.swift');
  const root = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawerClose = useRef<HTMLButtonElement>(null);
  const accountArea = useRef<HTMLDivElement>(null);
  const noticeFocus = useRef<HTMLElement | null>(null);
  const sourceId = useId();
  const previousWide = useRef(false);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);
  useEffect(() => {
    if (!root.current) return;
    const measure = () => {
      const standalone = root.current?.parentElement?.id === 'root';
      const nextWide = (standalone ? window.innerWidth : (root.current?.clientWidth ?? 0)) >= 1536;
      if (nextWide !== previousWide.current) {
        setDrawerOpen(nextWide);
        previousWide.current = nextWide;
      }
      setWide(nextWide);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  useEffect(() => {
    if (!drawerOpen || wide) return;
    const opener = menuButton.current;
    const previous = window.document.activeElement as HTMLElement | null;
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';
    drawerClose.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = [
        ...(drawer.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled),a[href]') ??
          []),
      ];
      const first = controls[0],
        last = controls.at(-1);
      if (event.shiftKey && window.document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && window.document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.document.addEventListener('keydown', keyboard);
    return () => {
      window.document.removeEventListener('keydown', keyboard);
      window.document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus();
      else if (previous?.isConnected) previous.focus();
    };
  }, [drawerOpen, wide]);
  useEffect(() => {
    if (!accountOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountArea.current?.contains(event.target))
        setAccountOpen(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    window.document.addEventListener('pointerdown', closeOutside);
    window.document.addEventListener('keydown', keyboard);
    return () => {
      window.document.removeEventListener('pointerdown', closeOutside);
      window.document.removeEventListener('keydown', keyboard);
    };
  }, [accountOpen]);

  function navigate(next: View) {
    setView(next);
    setAccountOpen(false);
    setNotice(null);
    if (!wide) setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  const currentLabel =
    view === 'source'
      ? 'Kod źródłowy aplikacji mobilnej'
      : (navigation.find((item) => item.view === view)?.label ?? 'Strona główna');
  const selectedMonth = new Date(2026, 9 + monthOffset, 1);
  const daysInMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = (selectedMonth.getDay() + 6) % 7;
  const sourceText =
    sourceFile === 'Spacings.swift'
      ? 'Treść demonstracyjna mDesign. Ten przykład pokazuje kompozycję interfejsu; aplikacja korzystająca z biblioteki dostarcza własne dane i obsługę akcji.'
      : 'Treść demonstracyjna mDesign. Ten przykład pokazuje kompozycję interfejsu; aplikacja korzystająca z biblioteki dostarcza własne dane i obsługę akcji.';
  const emptyCases = (
    <div className="od-empty-cases">
      <WebIcon name="information" size={36} />
      <p>
        Tu zobaczysz szczegóły nowych spraw załatwianych online. Poprzednie sprawy znajdziesz w{' '}
        <button onClick={() => navigate('inboxes')}>Twoich skrzynkach</button> lub{' '}
        <button onClick={() => setNotice('Historia spraw jest pusta w tym przykładzie.')}>
          Historii spraw
        </button>
        .
      </p>
    </div>
  );
  const emptyPayments = (
    <div className="od-empty-payments">
      <WebIcon name="information" size={36} />
      <p>Wszystkie zobowiązania zostały opłacone.</p>
      <p>
        Plik z potwierdzeniem przelewu znajdziesz w{' '}
        <button onClick={() => setNotice('Historia płatności jest pusta w tym przykładzie.')}>
          Historii płatności
        </button>
        .
      </p>
    </div>
  );

  return (
    <div
      ref={root}
      className={`official-desktop ${drawerOpen ? 'od-drawer-open' : ''} ${wide ? 'od-wide' : ''}`}
      data-theme="light"
      data-platform="web"
      data-reference="official-portal-2026-10-19"
    >
      <header className="od-header" inert={drawerOpen && !wide}>
        <div className="od-header-left">
          <button
            type="button"
            ref={menuButton}
            className="od-menu-button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-expanded={drawerOpen}
            aria-controls={`${sourceId}-navigation`}
          >
            <WebIcon name="bars" />
            <span>Menu</span>
          </button>
          <button
            type="button"
            className="od-emblem-link"
            onClick={() => navigate('home')}
            aria-label="Strona główna aplikacji demo"
          >
            <span className="od-brand">
              <img src={emblem} alt="" width={40} height={40} />
              <span>Aplikacja demo</span>
            </span>
          </button>
        </div>
        <div className="od-account" ref={accountArea}>
          <button
            type="button"
            className="od-account-button"
            aria-label="Menu profilu obywatela"
            onClick={() => setAccountOpen(!accountOpen)}
            aria-expanded={accountOpen}
            aria-controls={`${sourceId}-account`}
          >
            <span>
              <strong>Jan Kowalski</strong>
              <small>Profil obywatela</small>
            </span>
            <WebIcon name="down" />
            <WebIcon name="user" />
          </button>
          {accountOpen && (
            <div className="od-account-menu" id={`${sourceId}-account`}>
              <p>Dane przykładowe</p>
              <button type="button" onClick={() => navigate('data')}>
                <WebIcon name="user" />
                Profil obywatela
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  setNotice('Ten podgląd nie ma sesji logowania.');
                }}
              >
                <WebIcon name="logout" />
                Wyloguj się
              </button>
            </div>
          )}
        </div>
      </header>
      {drawerOpen && !wide && (
        <button
          type="button"
          className="od-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
          aria-label="Zamknij menu główne"
          tabIndex={-1}
        />
      )}
      <div className="od-layout">
        {drawerOpen && (
          <aside
            ref={drawer}
            className="od-sidebar"
            id={`${sourceId}-navigation`}
            role={wide ? undefined : 'dialog'}
            aria-modal={wide ? undefined : true}
            aria-label="Menu główne"
          >
            <button
              type="button"
              className="od-sidebar-close"
              ref={drawerClose}
              aria-label={wide ? 'Zwiń menu' : 'Zamknij'}
              onClick={() => setDrawerOpen(false)}
            >
              <WebIcon name="close" />
              <span>{wide ? 'Zwiń menu' : 'Zamknij'}</span>
            </button>
            <nav aria-label="Menu główne">
              {navigation.map((item) => (
                <button
                  type="button"
                  key={item.view}
                  className={view === item.view ? 'od-nav-selected' : ''}
                  aria-current={view === item.view ? 'page' : undefined}
                  onClick={() => navigate(item.view)}
                >
                  <WebIcon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
              <a href="https://info.mobywatel.gov.pl/aplikacja/" target="_blank" rel="noreferrer">
                <WebIcon name="phone" />
                <span>Aplikacja mobilna</span>
              </a>
            </nav>
          </aside>
        )}
        <div className="od-content-body" inert={drawerOpen && !wide}>
          <main className="od-content">
            {view !== 'home' && (
              <nav className="od-breadcrumb" aria-label="Ścieżka nawigacji">
                <button type="button" aria-label="Strona główna" onClick={() => navigate('home')}>
                  <WebIcon name="home" />
                </button>
                <WebIcon name="right" size={16} />
                <span aria-current="page">{currentLabel}</span>
              </nav>
            )}
            {view === 'home' ? (
              <>
                <PageTitle
                  title="Dzień dobry!"
                  description="Załatwiaj swoje urzędowe sprawy bezpiecznie i wygodnie – gdziekolwiek jesteś."
                />
                <div className="od-home-grid">
                  <div className="od-home-column">
                    {bannerVisible && (
                      <section className="od-delivery-banner">
                        <button
                          type="button"
                          className="od-banner-close"
                          aria-label="Zamknij informację"
                          onClick={() => setBannerVisible(false)}
                        >
                          <WebIcon name="close" />
                        </button>
                        <div className="od-banner-layout">
                          <div className="od-banner-content">
                            <h2>Ważna informacja</h2>
                            <p>
                              Treść demonstracyjna mDesign. Ten przykład pokazuje kompozycję
                              interfejsu; aplikacja korzystająca z biblioteki dostarcza własne dane
                              i obsługę akcji.
                            </p>
                            <div className="od-banner-actions">
                              <button
                                type="button"
                                className="od-banner-primary"
                                onClick={() => navigate('inboxes')}
                              >
                                Załóż skrzynkę do e-Doręczeń
                              </button>
                              <button
                                type="button"
                                className="od-banner-secondary"
                                onClick={() => navigate('help')}
                              >
                                Dowiedz się więcej
                                <WebIcon name="external" />
                              </button>
                            </div>
                          </div>
                          <div className="od-banner-image">
                            <img src={deliveryBanner} alt="" />
                          </div>
                        </div>
                      </section>
                    )}
                    <div className="od-home-main">
                      <DashboardTile title="Twoje sprawy" icon="affairs" className="od-cases-tile">
                        {emptyCases}
                      </DashboardTile>
                      <DashboardTile
                        title="ePłatności"
                        icon="payments"
                        className="od-payments-tile"
                      >
                        {emptyPayments}
                      </DashboardTile>
                      <div className="od-services-columns">
                        <DashboardTile
                          title="Katalog usług"
                          icon="catalog"
                          action={
                            <button
                              type="button"
                              className="od-gds-secondary"
                              onClick={() => navigate('catalog')}
                            >
                              Zobacz więcej
                            </button>
                          }
                        >
                          <div className="od-service-links">
                            {categories.map((label) => (
                              <button type="button" key={label} onClick={() => navigate('catalog')}>
                                <span>{label}</span>
                                <WebIcon name="right" size={20} />
                              </button>
                            ))}
                          </div>
                        </DashboardTile>
                        <DashboardTile title="Popularne usługi" icon="popular">
                          <div className="od-service-links">
                            {popularServices.map((label) => (
                              <button
                                type="button"
                                key={label}
                                onClick={() =>
                                  label === 'Zastrzeż PESEL'
                                    ? setNotice(
                                        'Zarządzanie zastrzeżeniem PESEL jest pokazane w wariancie mobilnym biblioteki.',
                                      )
                                    : navigate('catalog')
                                }
                              >
                                <span>{label}</span>
                                <WebIcon name="right" size={20} />
                              </button>
                            ))}
                          </div>
                        </DashboardTile>
                      </div>
                    </div>
                  </div>
                  <div className="od-calendar-column">
                    <DashboardTile title="Kalendarz" icon="calendar">
                      <div className="od-calendar">
                        <div className="od-calendar-heading">
                          <button
                            type="button"
                            aria-label="Poprzedni miesiąc"
                            onClick={() => setMonthOffset((value) => value - 1)}
                          >
                            <WebIcon name="left" size={12} />
                          </button>
                          <strong>
                            {selectedMonth.toLocaleDateString('pl-PL', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </strong>
                          <button
                            type="button"
                            aria-label="Następny miesiąc"
                            onClick={() => setMonthOffset((value) => value + 1)}
                          >
                            <WebIcon name="right" size={12} />
                          </button>
                        </div>
                        <div
                          className="od-calendar-grid"
                          aria-label={selectedMonth.toLocaleDateString('pl-PL', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        >
                          {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((day) => (
                            <span className="od-calendar-day-name" key={day}>
                              {day}
                            </span>
                          ))}
                          {Array.from({ length: firstDay }, (_, index) => (
                            <span key={`empty-${index}`} />
                          ))}
                          {Array.from({ length: daysInMonth }, (_, index) => (
                            <button
                              type="button"
                              key={index}
                              aria-current={monthOffset === 0 && index === 18 ? 'date' : undefined}
                              aria-label={`${index + 1} ${selectedMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`}
                              onClick={() =>
                                setNotice('Brak wydarzeń do wyświetlenia w tym przykładzie.')
                              }
                            >
                              <span
                                className={
                                  monthOffset === 0 && index === 18 ? 'od-calendar-today' : ''
                                }
                              >
                                {index + 1}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </DashboardTile>
                  </div>
                </div>
              </>
            ) : view === 'catalog' ? (
              <>
                <PageTitle
                  title="Załatw sprawę online"
                  description="Tu znajdziesz listę spraw urzędowych, które możesz załatwić w mObywatelu."
                />
                <div className="od-catalog">
                  <div className="od-info-message">
                    <WebIcon name="information" />
                    <div>
                      <strong>
                        Treść demonstracyjna mDesign. Ten przykład pokazuje kompozycję interfejsu;
                        aplikacja korzystająca z biblioteki dostarcza własne dane i obsługę akcji.
                      </strong>
                      <p>
                        Treść demonstracyjna mDesign. Ten przykład pokazuje kompozycję interfejsu;
                        aplikacja korzystająca z biblioteki dostarcza własne dane i obsługę akcji.
                      </p>
                    </div>
                  </div>
                  <div className="od-catalog-list">
                    {caseServices.map((service) => (
                      <section className="od-catalog-card" key={service.title}>
                        <h2>{service.title}</h2>
                        <div>
                          <p>
                            {service.description}{' '}
                            <button
                              type="button"
                              className="od-inline-link"
                              onClick={() => setNotice(service.title)}
                            >
                              Czytaj więcej
                            </button>
                          </p>
                          <Button
                            onClick={() =>
                              setNotice(
                                `Wybrano usługę: ${service.title}. To lokalny przykład — wniosek nie został wysłany.`,
                              )
                            }
                          >
                            Załatw sprawę
                          </Button>
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              </>
            ) : view === 'source' ? (
              <>
                <div className="od-source-card">
                  <div className="od-source-tree" aria-label="Pliki źródłowe">
                    <details open>
                      <summary>Sources</summary>
                      <details open>
                        <summary>Tokens</summary>
                        {['Spacings.swift', 'Radiuses.swift'].map((file) => (
                          <button
                            type="button"
                            aria-pressed={sourceFile === file}
                            onClick={() => setSourceFile(file)}
                            key={file}
                          >
                            {file}
                          </button>
                        ))}
                      </details>
                    </details>
                  </div>
                  <div className="od-source-editor">
                    <div>{sourceFile}</div>
                    <pre>
                      <code>{sourceText}</code>
                    </pre>
                  </div>
                </div>
              </>
            ) : view === 'cases' ? (
              <>
                <PageTitle title="Twoje sprawy" />
                <DashboardTile title="Twoje sprawy" icon="affairs">
                  {emptyCases}
                </DashboardTile>
              </>
            ) : view === 'payments' ? (
              <>
                <PageTitle title="ePłatności" />
                <DashboardTile title="ePłatności" icon="payments">
                  {emptyPayments}
                </DashboardTile>
              </>
            ) : (
              <>
                <PageTitle title={currentLabel} />
                <div className="od-plain-panel">
                  {view === 'inboxes' ? (
                    <>
                      <WebIcon name="inbox" size={40} />
                      <h2>Twoje skrzynki</h2>
                      <p>W tym przykładzie nie ma skrzynek ani rzeczywistych wiadomości.</p>
                      <Button
                        onClick={() =>
                          setNotice(
                            'To lokalny przykład. Nie utworzono skrzynki ani adresu do doręczeń.',
                          )
                        }
                      >
                        Załóż skrzynkę do e-Doręczeń
                      </Button>
                    </>
                  ) : view === 'data' ? (
                    <>
                      <h2>Profil obywatela</h2>
                      <p>Jan Kowalski</p>
                      <p>
                        Dane demonstracyjne. Podgląd nie korzysta z danych zalogowanego użytkownika.
                      </p>
                    </>
                  ) : view === 'vehicles' ? (
                    <>
                      <WebIcon name="car" size={40} />
                      <h2>Kierowca i pojazdy</h2>
                      <p>W tym przykładzie nie ma pojazdów ani dokumentów.</p>
                    </>
                  ) : (
                    <>
                      <h2>Centrum pomocy</h2>
                      <p>Informacje o usługach i komponentach interfejsu.</p>
                      <button
                        type="button"
                        className="od-inline-link"
                        onClick={() => navigate('source')}
                      >
                        Kod źródłowy aplikacji mobilnej
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </main>
          <footer className="od-footer">
            <div className="od-footer-links">
              <div className="od-footer-links-wrapper">
                <nav className="od-footer-nav" aria-label="Usługi">
                  <h2>Usługi</h2>
                  <ul>
                    {[
                      ['Obywatel', 'obywatela'],
                      ['Przedsiębiorca', 'przedsiebiorcy'],
                      ['Urzędnik', 'urzednika'],
                      ['Rolnik', 'rolnika'],
                    ].map(([label, path]) => (
                      <li key={label}>
                        <a
                          href={`https://www.gov.pl/web/gov/uslugi-dla-${path}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                <nav className="od-footer-nav" aria-label="Prawo">
                  <h2>Prawo</h2>
                  <ul>
                    {[
                      ['Polityka cookies', 'https://www.gov.pl/web/gov/polityka-dotyczaca-cookies'],
                      ['Warunki korzystania', 'https://www.gov.pl/web/gov/warunki-korzystania'],
                      ['Klauzula RODO', 'https://www.gov.pl/web/gov/klauzula-rodo'],
                      [
                        'Deklaracja dostępności',
                        'https://www.gov.pl/web/mobywatel-w-aplikacji/deklaracja-dostepnosci-aplikacji-webowej-mobywatel',
                      ],
                    ].map(([label, href]) => (
                      <li key={label}>
                        <a href={href} target="_blank" rel="noreferrer">
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="od-footer-app">
                <div>
                  <p>Pobierz mobilną aplikację mObywatel</p>
                  <ul>
                    <li>
                      <a
                        href="https://play.google.com/store/search?q=mObywatel&c=apps"
                        aria-label="Pobierz aplikację mObywatel z Google Play"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img src={googlePlay} alt="" />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://apps.apple.com/pl/app/mobywatel/id1339613469?l=pl"
                        aria-label="Pobierz aplikację mObywatel w App Store"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img src={appStore} alt="" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="od-footer-emblem">
              <button
                type="button"
                onClick={() => navigate('home')}
                aria-label="Strona główna aplikacji demo"
              >
                <span>
                  <img src={emblem} alt="" />
                  <strong>Aplikacja demo</strong>
                </span>
              </button>
            </div>
          </footer>
        </div>
      </div>
      <DialogPrimitive.Root
        open={notice !== null}
        onOpenChange={(open) => {
          if (!open) setNotice(null);
        }}
      >
        <DialogPrimitive.Portal container={root.current ?? undefined}>
          <DialogPrimitive.Overlay className="m-dialog-overlay" />
          <DialogPrimitive.Content
            className="m-dialog"
            onOpenAutoFocus={() => {
              noticeFocus.current =
                window.document.activeElement instanceof HTMLElement
                  ? window.document.activeElement
                  : null;
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (noticeFocus.current?.isConnected) noticeFocus.current.focus();
            }}
          >
            <DialogPrimitive.Title className="m-dialog-title">Informacja</DialogPrimitive.Title>
            <DialogPrimitive.Description className="m-dialog-description">
              {notice}
            </DialogPrimitive.Description>
            <div className="m-dialog-body">
              <DialogPrimitive.Close asChild>
                <Button>Zamknij</Button>
              </DialogPrimitive.Close>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
