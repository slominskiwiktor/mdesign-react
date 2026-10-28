import { useEffect, useRef, useState } from 'react';
import {
  Button,
  LandingProvider,
  PortalAccountMenu,
  PortalBanner,
  PortalBreadcrumbs,
  PortalCalendar,
  PortalDashboard,
  PortalDashboardTile,
  PortalEmptyState,
  PortalFooter,
  PortalIcon,
  PortalPageTitle,
  PortalServiceCatalog,
  PortalServiceLinks,
  PortalShell,
  PortalWidgetIcon,
} from '../kit';
import type { PortalNavigationItem } from '../kit';
import { LandingHome } from '../catalog/LandingCatalog';
import './web-fixtures.css';
import portalServices from './portal-services.json';

const navigation: PortalNavigationItem[] = [
  { id: 'home', label: 'Strona główna', icon: 'AC_home' },
  { id: 'inboxes', label: 'Twoje skrzynki', icon: 'AH_envelope' },
  { id: 'cases', label: 'Twoje sprawy', icon: 'AD_document' },
  { id: 'data', label: 'Twoje dane', icon: 'AJ_user_square' },
  { id: 'vehicles', label: 'Kierowca i pojazdy', icon: 'AI_car' },
  { id: 'payments', label: 'ePłatności', icon: 'AF_wallet' },
  { id: 'catalog', label: 'Załatw sprawę online', icon: 'AI_compass_needle' },
  { id: 'help', label: 'Centrum pomocy', icon: 'AA_question_mark_circle' },
  { id: 'app', label: 'Aplikacja mobilna', icon: 'AH_mobile' },
];
const categories = [
  'Dokumenty i dane osobowe',
  'Kierowcy i pojazdy',
  'Rodzina i małżeństwo',
  'Zaświadczenia i odpisy',
  'Wyjazdy i wypoczynek',
  'Zasiłki i pomoc finansowa',
];
const popular = [
  'Wyślij pismo ogólne',
  'Zgłoś zbycie lub nabycie pojazdu',
  'Zgłoś urodzenie dziecka',
  'Podpisz dokument elektronicznie',
  'Uzyskaj dowód osobisty dla dziecka',
  'Zastrzeż PESEL',
];
const services = portalServices.cards;
const external = <PortalIcon name="AB_arrow_top_right_on_square" size={24} />;

async function waitForVisibleImages(root: HTMLElement | null) {
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
  const visible = [...(root?.querySelectorAll('img') ?? [])].filter((image) => {
    const rect = image.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
  });
  await Promise.all(
    visible.map(async (image) => {
      image.loading = 'eager';
      await image.decode();
      if (!image.naturalWidth) throw new Error('Nie wczytano obrazu widocznego w kadrze.');
    }),
  );
}

/** Exercises the exported kit; no duplicate source-specific rendering or screenshot backgrounds. */
export function PortalReferenceFixture() {
  const params = new URLSearchParams(location.search);
  const [page, setPage] = useState(params.get('page') === 'catalog' ? 'catalog' : 'home');
  const [menu, setMenu] = useState(
    params.get('state') === 'menu' ||
      (window.innerWidth >= 1536 && params.get('state') !== 'closed'),
  );
  const [ready, setReady] = useState(false);
  const [captureError, setCaptureError] = useState('');
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    void document.fonts.ready
      .then(() => waitForVisibleImages(root.current))
      .then(() => setReady(true))
      .catch(() => setCaptureError('Nie wczytano obrazów w kadrze.'));
  }, []);
  const links = (labels: string[]) =>
    labels.map((label, i) => ({ id: String(i), label, onClick: () => setPage('catalog') }));
  return (
    <div
      ref={root}
      className="web-portal-fixture"
      data-fixture="portal-reference"
      data-fixture-ready={ready}
      data-fixture-error={captureError || undefined}
      data-platform="web"
      data-theme="light"
    >
      <PortalShell
        navigation={navigation}
        value={page}
        onValueChange={setPage}
        sidebarOpen={menu}
        onSidebarOpenChange={setMenu}
        onBrandClick={() => setPage('home')}
        account={
          <PortalAccountMenu
            name="Jan Kowalski"
            items={[
              {
                id: 'logout',
                label: 'Wyloguj się',
                icon: <PortalIcon name="AB_arrow_right_start_on_rectangle" />,
              },
            ]}
          />
        }
        footer={<PortalFooter onBrandClick={() => setPage('home')} />}
      >
        {page === 'catalog' ? (
          <>
            <PortalBreadcrumbs
              className="mp-breadcrumb"
              variant="back"
              items={[{ id: 'home', label: 'Strona główna', href: '/' }]}
            />
            <PortalServiceCatalog
              heading="Załatw sprawę online"
              description="Tu znajdziesz listę spraw urzędowych, które możesz załatwić w mObywatelu."
              information={
                <>
                  <strong>
                    Aby skorzystać z tych usług, musisz mieć aktywny adres do doręczeń
                    elektronicznych i skrzynkę osobistą do e-Doręczeń.
                  </strong>
                  <p>
                    Jeśli ich nie masz, przejdź do zakładki{' '}
                    <a className="mp-inline-link" href="#inboxes">
                      Twoje skrzynki
                    </a>{' '}
                    i złóż wniosek. Następnie aktywuj adres. Więcej informacji na temat e-Doręczeń
                    znajdziesz w{' '}
                    <a className="mp-inline-link" href="#help">
                      Centrum pomocy
                    </a>
                    .
                  </p>
                </>
              }
              items={services.map((service, i) => ({
                ...service,
                id: String(i),
                more: (
                  <a className="mp-inline-link" href="#service-info">
                    Czytaj więcej
                    <PortalIcon
                      name="AB_arrow_top_right_on_square"
                      size={17.6}
                      style={{ position: 'relative', top: 2, marginLeft: 4 }}
                    />
                  </a>
                ),
                action: <Button>Załatw sprawę</Button>,
              }))}
            />
          </>
        ) : (
          <>
            <PortalPageTitle
              heading="Dzień dobry!"
              description="Załatwiaj swoje urzędowe sprawy bezpiecznie i wygodnie – gdziekolwiek jesteś."
            />
            <PortalDashboard
              banner={
                <PortalBanner
                  actions={
                    <>
                      <Button>Załóż skrzynkę do e-Doręczeń{external}</Button>
                      <Button variant="tertiary">Dowiedz się więcej{external}</Button>
                    </>
                  }
                />
              }
              cases={
                <PortalDashboardTile
                  heading="Twoje sprawy"
                  icon={<PortalWidgetIcon name="affairs" />}
                >
                  <PortalEmptyState onInbox={() => {}} onHistory={() => {}} />
                </PortalDashboardTile>
              }
              payments={
                <PortalDashboardTile
                  heading="ePłatności"
                  icon={<PortalWidgetIcon name="payments" />}
                >
                  <PortalEmptyState variant="payments" onHistory={() => {}} />
                </PortalDashboardTile>
              }
              catalog={
                <PortalDashboardTile
                  heading="Katalog usług"
                  icon={<PortalWidgetIcon name="catalog" />}
                  action={
                    <Button variant="secondary" onClick={() => setPage('catalog')}>
                      Zobacz więcej
                    </Button>
                  }
                >
                  <PortalServiceLinks items={links(categories)} />
                </PortalDashboardTile>
              }
              popular={
                <PortalDashboardTile
                  heading="Popularne usługi"
                  icon={<PortalWidgetIcon name="popular" />}
                >
                  <PortalServiceLinks label="Popularne usługi" items={links(popular)} />
                </PortalDashboardTile>
              }
              calendar={
                <PortalDashboardTile
                  heading="Kalendarz"
                  icon={<PortalWidgetIcon name="calendar" />}
                >
                  <PortalCalendar defaultMonth="2026-10-01" />
                </PortalDashboardTile>
              }
            />
          </>
        )}
      </PortalShell>
    </div>
  );
}

/** URL-controlled state uses the same public controls as the interactive landing. */
export function LandingReferenceFixture() {
  const params = new URLSearchParams(location.search);
  const state = params.get('state') ?? 'home';
  const section = params.get('section');
  const initialized = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [captureError, setCaptureError] = useState('');
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void document.fonts.ready
      .then(async () => {
        if (state === 'menu')
          root.current
            ?.querySelector<HTMLButtonElement>('.ml-header-inner .ml-menu-button')
            ?.click();
        if (state === 'application')
          root.current?.querySelector<HTMLButtonElement>('[data-menu-trigger="0"]')?.click();
        if (section === 'services')
          root.current
            ?.querySelector('.ml-service-grid')
            ?.scrollIntoView({ block: 'start', behavior: 'instant' });
        await waitForVisibleImages(root.current);
        setReady(true);
      })
      .catch(() => setCaptureError('Nie wczytano obrazów w kadrze.'));
  }, [state, section]);
  return (
    <div
      ref={root}
      data-fixture="landing-reference"
      data-fixture-ready={ready}
      data-fixture-error={captureError || undefined}
    >
      <LandingProvider animationsDisabled>
        <LandingHome
          showCookieConsent={state === 'cookies' || state === 'cookie-details'}
          cookieInitialTab={state === 'cookie-details' ? 'details' : 'consent'}
        />
      </LandingProvider>
    </div>
  );
}
