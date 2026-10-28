import { docsPath } from '../docs-path';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  LandingArticle,
  LandingAwards,
  LandingBreadcrumbs,
  LandingButton,
  LandingCatalogCard,
  LandingCatalogListing,
  LandingCombobox,
  LandingCookieConsent,
  LandingDocumentCarousel,
  LandingDownloadCTA,
  LandingDownloadPanel,
  LandingFAQ,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingIcon,
  landingIconNames,
  LandingInfoSection,
  LandingLink,
  LandingLoader,
  LandingNewsCard,
  LandingNewsList,
  LandingPressCard,
  LandingProvider,
  LandingSearchField,
  LandingServiceCard,
  LandingSitemap,
  LandingSocialBanner,
  LandingStatistics,
  LandingTabs,
  LandingTooltip,
  LandingUtilityBar,
  LandingVideo,
  landingAssets,
} from '../kit/landing/index.js';
import type {
  LandingCatalogItem,
  LandingConsentPreferences,
  LandingConsentTab,
  LandingDocumentSlide,
  LandingFAQItem,
  LandingNavItem,
  LandingNewsItem,
  LandingSitemapGroup,
} from '../kit/landing/index.js';
import { CatalogExample, CatalogFilters, CatalogPage } from './CatalogLayout.js';

interface LandingCatalogData {
  official: string;
  social: Array<{ label: string; href: string }>;
  groups: LandingSitemapGroup[];
  navigation: LandingNavItem[];
  documents: LandingDocumentSlide[];
  catalogItems: LandingCatalogItem[];
  news: LandingNewsItem[];
  questions: LandingFAQItem[];
}

export const landingCatalogGroups = [
  {
    value: 'controls',
    label: 'Przyciski i pola',
    components: [
      'LandingProvider',
      'LandingButton',
      'LandingLink',
      'LandingSearchField',
      'LandingCombobox',
      'LandingTabs',
      'LandingTooltip',
      'LandingLoader',
      'LandingIcon',
    ],
  },
  {
    value: 'navigation',
    label: 'Nawigacja',
    components: [
      'LandingUtilityBar',
      'LandingHeader',
      'LandingBreadcrumbs',
      'LandingFooter',
      'LandingSitemap',
    ],
  },
  {
    value: 'cards',
    label: 'Karty i listy',
    components: [
      'LandingServiceCard',
      'LandingCatalogCard',
      'LandingNewsCard',
      'LandingPressCard',
      'LandingCatalogListing',
      'LandingNewsList',
      'LandingFAQ',
    ],
  },
  {
    value: 'sections',
    label: 'Sekcje strony',
    components: [
      'LandingHero',
      'LandingStatistics',
      'LandingAwards',
      'LandingDocumentCarousel',
      'LandingInfoSection',
      'LandingSocialBanner',
      'LandingArticle',
    ],
  },
  {
    value: 'overlays',
    label: 'Okna i cookies',
    components: [
      'LandingDownloadCTA',
      'LandingDownloadPanel',
      'LandingVideo',
      'LandingCookieConsent',
    ],
  },
] as const;

function Example({
  name,
  note,
  wide,
  children,
}: {
  name: string;
  note?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <CatalogExample name={name} note={note} wide={wide} previewClassName="kit-landing-preview">
      <LandingProvider defaultAnimationsDisabled>{children}</LandingProvider>
    </CatalogExample>
  );
}

function restoredExampleConsent(): LandingConsentPreferences | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const value = JSON.parse(localStorage.getItem('mdesign-landing-catalog-consent') ?? 'null');
    return value?.necessary === true &&
      typeof value.updatedAt === 'string' &&
      ['preferences', 'statistics', 'marketing'].every((key) => typeof value[key] === 'boolean')
      ? value
      : null;
  } catch {
    return null;
  }
}

export function LandingComponentCatalog({ data }: { data: LandingCatalogData }) {
  const [group, setGroup] = useState('controls');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [message, setMessage] = useState('');
  const [download, setDownload] = useState(false);
  const [cookies, setCookies] = useState({
    open: false,
    tab: 'consent' as LandingConsentTab,
    revision: 0,
  });
  const [consent, setConsent] = useState<LandingConsentPreferences | null>(restoredExampleConsent);
  function showCookies(tab: LandingConsentTab = 'consent') {
    setCookies((current) => ({ open: true, tab, revision: current.revision + 1 }));
  }
  const choices = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'documents', label: 'Dokumenty' },
    { value: 'services', label: 'Usługi' },
    { value: 'disabled', label: 'Niedostępna', disabled: true },
  ];
  const { official, social, groups, documents, catalogItems, news, questions } = data;

  return (
    <CatalogPage
      title="Komponenty landingu"
      platform="Landing"
      count={32}
      description="Treść demonstracyjna mDesign. Ten przykład pokazuje kompozycję interfejsu; aplikacja korzystająca z biblioteki dostarcza własne dane i obsługę akcji."
      actions={
        <>
          <button type="button" className="kit-catalog-action" onClick={() => showCookies()}>
            Otwórz banner cookies
          </button>
          <a
            className="kit-catalog-action"
            href={docsPath('/preview/landing')}
            target="_blank"
            rel="noreferrer"
          >
            Podgląd całej strony ↗
          </a>
        </>
      }
    >
      <CatalogFilters
        label="Grupy komponentów landingu"
        items={[...landingCatalogGroups, { value: 'page', label: 'Cała strona' }]}
        value={group}
        onValueChange={setGroup}
      />
      <div className="kit-catalog-grid">
        {group === 'controls' && (
          <>
            <Example name="LandingButton" note="Wariant główny, obrys, link i stan nieaktywny.">
              <div className="kit-landing-row">
                <LandingButton onClick={() => setMessage('Wybrano główną akcję.')}>
                  Pobierz aplikację
                </LandingButton>
                <LandingButton
                  variant="secondary"
                  onClick={() => setMessage('Wybrano akcję dodatkową.')}
                >
                  Dowiedz się więcej
                </LandingButton>
                <LandingButton variant="link" onClick={() => setMessage('Wybrano link.')}>
                  Zobacz szczegóły
                </LandingButton>
                <LandingButton disabled>Niedostępny</LandingButton>
              </div>
              {message && (
                <p className="kit-landing-message" role="status">
                  {message}
                </p>
              )}
            </Example>
            <Example name="LandingLink" note="Link tekstowy i linki wyglądające jak przyciski.">
              <div className="kit-landing-row">
                <LandingLink href={`${official}/aplikacja`}>O aplikacji</LandingLink>
                <LandingLink variant="primary" href={`${official}/dokumenty`}>
                  Dokumenty
                </LandingLink>
                <LandingLink variant="secondary" href={`${official}/uslugi`}>
                  Usługi
                </LandingLink>
              </div>
            </Example>
            <Example name="LandingSearchField" note="Wpisywanie, czyszczenie i stan nieaktywny.">
              <div className="kit-landing-stack">
                <LandingSearchField
                  label="Szukaj w przykładach"
                  value={query}
                  onValueChange={setQuery}
                />
                <p role="status">Wyszukiwanie: {query || '—'}</p>
                <LandingSearchField
                  label="Wyszukiwanie nieaktywne"
                  placeholder="Pole nieaktywne"
                  disabled
                />
              </div>
            </Example>
            <Example name="LandingCombobox" note="Wybór myszą i klawiaturą; opcja nieaktywna.">
              <div className="kit-landing-stack">
                <LandingCombobox
                  label="Kategoria"
                  options={choices}
                  value={category}
                  onValueChange={setCategory}
                />
                <LandingCombobox label="Kategoria nieaktywna" options={choices} disabled />
              </div>
            </Example>
            <Example name="LandingTabs" note="Zakładki i powiązana treść.">
              <LandingTabs
                label="Rodzaj informacji"
                items={[
                  { value: 'app', label: 'Aplikacja', content: 'Dokumenty i usługi w telefonie.' },
                  { value: 'web', label: 'Portal', content: 'Sprawy urzędowe w przeglądarce.' },
                ]}
              />
            </Example>
            <Example name="LandingTooltip" note="Podpowiedź po najechaniu, fokusie i dotknięciu.">
              <LandingTooltip content="Informacja uzupełniająca o tej akcji.">
                <LandingButton variant="secondary">Pokaż podpowiedź</LandingButton>
              </LandingTooltip>
            </Example>
            <Example name="LandingLoader" note="Stan ładowania z dostępną etykietą.">
              <LandingLoader label="Wczytywanie danych" />
            </Example>
            <Example
              name="LandingProvider"
              note="Lato, jasna paleta oraz ustawienie animacji ograniczone do podglądu."
            >
              <p className="ml-lead">Dokumenty i usługi mObywatela</p>
            </Example>
            <Example name="LandingIcon" note="Oryginalne symbole z nazwami publicznego API." wide>
              <div className="kit-landing-row">
                {landingIconNames.map((name) => (
                  <span className="kit-landing-icon" key={name}>
                    <LandingIcon name={name} size={24} />
                    <code>{name}</code>
                  </span>
                ))}
              </div>
            </Example>
          </>
        )}
        {group === 'navigation' && (
          <>
            <Example
              name="LandingUtilityBar"
              note="Przełącznik animacji i pomoc w języku migowym."
              wide
            >
              <LandingUtilityBar links={social} />
            </Example>
            <CatalogExample
              name="LandingHeader"
              note="Nagłówek, języki i rozwijane menu we własnym obszarze podglądu."
              wide
              previewClassName="kit-landing-preview"
            >
              <iframe
                className="kit-landing-frame kit-landing-frame--header"
                src={docsPath('/preview/landing-header')}
                title="Interaktywny podgląd nagłówka landingu"
              />
            </CatalogExample>
            <Example
              name="LandingBreadcrumbs"
              note="Ścieżka nawigacji z oznaczeniem bieżącej strony."
            >
              <LandingBreadcrumbs
                items={[
                  { label: 'Strona główna', href: official },
                  { label: 'Aplikacja', href: `${official}/aplikacja` },
                  { label: 'Dokumenty' },
                ]}
              />
            </Example>
            <Example name="LandingSitemap" note="Grupy odnośników z mapy strony." wide>
              <LandingSitemap groups={groups} />
            </Example>
            <Example
              name="LandingFooter"
              note="Grupy linków, organizacje i ponowne otwarcie ustawień cookies."
              wide
            >
              <LandingFooter
                groups={groups}
                onCookieSettings={() => showCookies()}
                legalLinks={[
                  {
                    label: 'Polityka cookies',
                    href: `${official}/assets/download/polityka-cookies.pdf`,
                  },
                ]}
                logos={[
                  {
                    label: 'Organizacja demonstracyjna',
                    href: 'https://www.coi.gov.pl/',
                    image: landingAssets.logoCOI,
                  },
                ]}
              />
            </Example>
          </>
        )}
        {group === 'cards' && (
          <>
            <Example name="LandingServiceCard" note="Karta usługi z ilustracją i odnośnikiem." wide>
              <LandingServiceCard
                title="Bezpiecznie w sieci"
                description="Zgłaszaj podejrzane wiadomości i strony internetowe."
                href={`${official}/uslugi/bezpiecznie-w-sieci`}
                image={{ src: landingAssets.service2, alt: '' }}
              />
            </Example>
            <Example name="LandingCatalogCard" note="Pojedyncza karta dokumentu.">
              <LandingCatalogCard item={catalogItems[0]} />
            </Example>
            <Example name="LandingNewsCard" note="Pojedyncza karta aktualności.">
              <LandingNewsCard item={news[0]} />
            </Example>
            <Example
              name="LandingPressCard"
              note="Format pliku i działający odnośnik do materiałów."
            >
              <LandingPressCard
                title="Ekrany aplikacji"
                description="Oficjalne materiały prasowe."
                format="ZIP"
                href={`${official}/media/2025/11/Materialy-prasowe-ekrany.zip`}
                buttonLabel="Pobierz ekrany"
              />
            </Example>
            <Example
              name="LandingCatalogListing"
              note="Wyszukiwanie, filtrowanie, grupowanie oraz pusty wynik."
              wide
            >
              <LandingCatalogListing title="Dokumenty" items={catalogItems} groupByCategory />
            </Example>
            <Example
              name="LandingNewsList"
              note="Filtrowanie aktualności i wariant wyróżniony."
              wide
            >
              <LandingNewsList title="Aktualności" items={news} featured />
            </Example>
            <Example name="LandingFAQ" note="Wyszukiwanie pytań oraz rozwijanie odpowiedzi." wide>
              <LandingFAQ items={questions} searchable />
            </Example>
          </>
        )}
        {group === 'sections' && (
          <>
            <Example
              name="LandingHero"
              note="Wariant wprowadzający z ilustracją i dwiema akcjami."
              wide
            >
              <LandingHero
                variant="detail"
                title="Twoje dokumenty i usługi w telefonie"
                lead="Korzystaj z cyfrowych dokumentów i usług online."
                image={{ src: landingAssets.hero, alt: '' }}
                actions={
                  <>
                    <LandingButton onClick={() => setDownload(true)}>
                      Pobierz aplikację
                    </LandingButton>
                    <LandingLink href={`${official}/aplikacja`} variant="secondary">
                      Dowiedz się więcej
                    </LandingLink>
                  </>
                }
              />
            </Example>
            <Example name="LandingStatistics" note="Sekcja liczb i opisów." wide>
              <LandingStatistics
                title="mObywatel w liczbach"
                items={[
                  { value: '4.8', label: 'ocena w Google Play' },
                  { value: '24', label: 'pozycji w demonstracji' },
                ]}
              />
            </Example>
            <Example name="LandingAwards" note="Grafika z wersją mobilną." wide>
              <LandingAwards
                title="Nagrody dla aplikacji"
                image={{ src: landingAssets.awardsDesktop, alt: 'Nagrody i wyróżnienia' }}
                mobileImage={landingAssets.awardsMobile}
              />
            </Example>
            <Example
              name="LandingDocumentCarousel"
              note="Przeciąganie, przyciski, klawiatura i aktywny slajd."
              wide
            >
              <LandingDocumentCarousel title="Dokumenty w aplikacji" items={documents} />
            </Example>
            <Example
              name="LandingInfoSection"
              note="Sekcja z tekstem, ilustracją i kolorem tła."
              wide
            >
              <LandingInfoSection
                title="Poznaj mDowód"
                tone="blue"
                image={{ src: landingAssets.documentID, alt: 'mDowód' }}
                actions={
                  <LandingLink href={`${official}/dokumenty/mdowod`} variant="secondary">
                    Dowiedz się więcej
                  </LandingLink>
                }
              >
                Cyfrowy dokument tożsamości dostępny w aplikacji.
              </LandingInfoSection>
            </Example>
            <Example
              name="LandingSocialBanner"
              note="Sekcja z odnośnikami do mediów społecznościowych."
              wide
            >
              <LandingSocialBanner
                links={social}
                description="Bądź na bieżąco z nowościami w mObywatelu."
              />
            </Example>
            <Example name="LandingArticle" note="Nagłówek, data, lead i treść artykułu." wide>
              <LandingArticle
                title="Nowość w usłudze Sprawdź OC"
                date="16.10.2026"
                dateTime="2026-10-16"
                lead="Sprawdź ubezpieczenie i pobierz potwierdzenie."
              >
                <h2>Sprawdź OC</h2>
                <p>W aplikacji możesz sprawdzić informacje o ubezpieczeniu pojazdu.</p>
                <p>
                  <a href={news[0].href}>Przeczytaj aktualność na oficjalnej stronie.</a>
                </p>
              </LandingArticle>
            </Example>
          </>
        )}
        {group === 'overlays' && (
          <>
            <Example name="LandingDownloadCTA" note="Kompaktowe wezwanie do pobrania aplikacji.">
              <LandingDownloadCTA variant="compact" onDownload={() => setDownload(true)} />
            </Example>
            <Example
              name="LandingDownloadPanel"
              note="Okno pobierania z kodem QR i linkami do sklepów."
            >
              <LandingDownloadPanel
                trigger={<LandingButton>Pokaż panel pobierania</LandingButton>}
              />
            </Example>
            <Example
              name="LandingVideo"
              note="Osadzony odtwarzacz ładuje się po zgodzie i uruchomieniu."
              wide
            >
              <LandingVideo
                title="Poznaj mDowód"
                kind="embed"
                src="https://www.youtube-nocookie.com/embed/8zk3c1f_gP0"
                poster={landingAssets.documentID}
                requireConsent
                onConsentRequest={() => showCookies('details')}
                consentGranted={!!consent?.marketing}
              />
            </Example>
            <Example
              name="LandingCookieConsent"
              note="Banner, szczegóły kategorii i ponowne otwarcie zapisanych ustawień."
              wide
            >
              <div className="kit-landing-row">
                <LandingButton onClick={() => showCookies()}>Banner cookies</LandingButton>
                <LandingButton variant="secondary" onClick={() => showCookies('details')}>
                  Ustawienia zgód
                </LandingButton>
                <LandingButton variant="secondary" onClick={() => showCookies('about')}>
                  O plikach cookies
                </LandingButton>
              </div>
            </Example>
          </>
        )}
        {group === 'page' && (
          <CatalogExample
            name="LandingHome"
            note="Kompozycja wszystkich sekcji. Pełna strona działa we własnym obszarze przewijania."
            wide
          >
            <iframe
              className="kit-landing-frame"
              src={docsPath('/preview/landing')}
              title="Interaktywny podgląd całego landingu"
            />
          </CatalogExample>
        )}
      </div>
      <LandingDownloadPanel open={download} onOpenChange={setDownload} />
      <LandingCookieConsent
        key={cookies.revision}
        defaultTab={cookies.tab}
        open={cookies.open}
        onOpenChange={(open) => setCookies((current) => ({ ...current, open }))}
        onConsentChange={setConsent}
        storageKey="mdesign-landing-catalog-consent"
      />
    </CatalogPage>
  );
}

export function LandingHeaderExample({ data }: { data: LandingCatalogData }) {
  const [language, setLanguage] = useState('pl');
  const [download, setDownload] = useState(false);
  return (
    <LandingProvider>
      <LandingHeader
        items={data.navigation}
        homeHref={data.official}
        utility={<LandingUtilityBar />}
        language={language}
        onLanguageChange={setLanguage}
        onDownload={() => setDownload(true)}
        mobileSocialLinks={data.social}
      />
      <main className="ml-container" style={{ paddingBlock: 32 }}>
        <p className="ml-lead">Sprawdź rozwijane menu, wybór języka i panel pobierania.</p>
      </main>
      <LandingDownloadPanel open={download} onOpenChange={setDownload} />
    </LandingProvider>
  );
}
