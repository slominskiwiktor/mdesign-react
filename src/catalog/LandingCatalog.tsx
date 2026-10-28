import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LandingComponentCatalog, LandingHeaderExample } from './LandingCatalogExamples.js';
import {
  LandingAwards,
  LandingButton,
  LandingCookieConsent,
  LandingDocumentCarousel,
  LandingDownloadCTA,
  LandingDownloadPanel,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingInfoSection,
  LandingLink,
  LandingNewsList,
  LandingProvider,
  LandingServiceCard,
  LandingSocialBanner,
  LandingStatistics,
  LandingUtilityBar,
  landingAssets,
} from '../kit/landing/index.js';
import type {
  LandingCatalogItem,
  LandingFAQItem,
  LandingNavItem,
  LandingNewsItem,
  LandingSitemapGroup,
  LandingConsentTab,
} from '../kit/landing/index.js';

const official = 'https://info.mobywatel.gov.pl';
const social = [
  { label: 'X', href: 'https://x.com/CYFRA_GOV_PL' },
  { label: 'Facebook', href: 'https://www.facebook.com/MinisterstwoCyfryzacji' },
  { label: 'LinkedIn', href: 'https://pl.linkedin.com/company/ministerstwo-cyfryzacji' },
];
const groups: LandingSitemapGroup[] = [
  {
    title: 'Aplikacja',
    href: `${official}/aplikacja`,
    links: [
      { label: 'Dokumenty', href: `${official}/dokumenty` },
      { label: 'Dokumenty lokalne', href: `${official}/dokumenty-lokalne` },
      { label: 'Usługi', href: `${official}/uslugi` },
      { label: 'O aplikacji', href: `${official}/o-aplikacji` },
      { label: 'Rozwój aplikacji', href: `${official}/rozwoj-aplikacji` },
    ],
  },
  {
    title: 'Warto wiedzieć',
    href: `${official}/warto-wiedziec`,
    links: [
      { label: 'Aktualności', href: `${official}/aktualnosci` },
      { label: 'Bezpieczeństwo', href: `${official}/bezpieczenstwo` },
      { label: 'Pytania i odpowiedzi', href: `${official}/pytania-odpowiedzi` },
      { label: 'Materiały prasowe', href: `${official}/prasa` },
      { label: 'Kontakt', href: `${official}/kontakt` },
    ],
  },
  {
    title: 'eIDAS 2.0',
    href: `${official}/eidas-2`,
    links: [
      { label: 'Dołącz do Sandboxa', href: `${official}/eidas-2/dolacz-do-sandboxa` },
      { label: 'Czym jest eIDAS 2.0', href: `${official}/eidas-2/czym-jest-eidas-2` },
      { label: 'APTITUDE', href: `${official}/eidas-2/aptitude` },
      { label: 'POTENTIAL', href: `${official}/eidas-2/potential` },
    ],
  },
];
const navigation: LandingNavItem[] = [
  ...groups.map((group) => ({ label: group.title, href: group.href, children: group.links })),
  { label: 'Dla instytucji', href: `${official}/dla-instytucji` },
];
const documents = [
  {
    id: 'id',
    title: 'mDowód',
    href: `${official}/dokumenty/mdowod`,
    image: landingAssets.documentID,
  },
  {
    id: 'pension',
    title: 'Legitymacja emeryta-rencisty',
    href: `${official}/dokumenty/legitymacja-emeryta-rencisty`,
    image: landingAssets.documentPension,
  },
  {
    id: 'family',
    title: 'Karta Dużej Rodziny',
    href: `${official}/dokumenty/karta-duzej-rodziny`,
    image: landingAssets.documentFamily,
  },
  {
    id: 'vehicles',
    title: 'Moje pojazdy',
    href: `${official}/dokumenty/moje-pojazdy`,
    image: landingAssets.documentVehicles,
  },
];
const catalogItems: LandingCatalogItem[] = documents.map((item) => ({
  ...item,
  image: {
    src: (
      {
        id: landingAssets.catalogID,
        pension: landingAssets.catalogPension,
        family: landingAssets.catalogFamily,
        vehicles: landingAssets.catalogVehicles,
      } as Record<string, string>
    )[item.id],
    alt: '',
  },
  category: item.id === 'vehicles' ? 'Kierowca i pojazdy' : 'Dokumenty',
  description: (
    {
      id: 'Pełnoprawny, cyfrowy dokument tożsamości.',
      pension: 'Potwierdź swoje uprawnienia i korzystaj ze zniżek.',
      family: 'Karta Twojej rodziny zawsze pod ręką.',
      vehicles: 'Informacje o pojazdach w aplikacji.',
    } as Record<string, string>
  )[item.id],
}));
const news: LandingNewsItem[] = [
  {
    id: 'oc',
    title: 'Nowość w usłudze Sprawdź OC',
    href: `${official}/aktualnosci/nowosc-w-usludze-sprawdz-OC`,
    image: { src: landingAssets.news1, alt: '' },
    date: '16.10.2026',
    dateTime: '2026-10-16',
    category: 'Usługi',
  },
  {
    id: 'sandbox',
    title:
      'Sandbox Europejskiego Portfela Tożsamości Cyfrowej dla firm i instytucji — dlaczego warto dołączyć do testów?',
    href: `${official}/aktualnosci/sandbox-europejskiego-portfela-tozsamosci-cyfrowej-dla-firm-i-instytucji-dlaczego-warto-dolaczyc-do-testow`,
    image: { src: landingAssets.news2, alt: '' },
    date: '13.10.2026',
    dateTime: '2026-10-13',
    category: 'eIDAS',
  },
  {
    id: 'availability',
    title: 'Niedostępność usług Dane w KRS i Księgi wieczyste',
    href: `${official}/aktualnosci/niedost%C4%99pnosc-uslug-Dane-w-KRS-i-Ksiegi-Wieczyste`,
    image: { src: landingAssets.news3, alt: '' },
    category: 'Komunikaty',
  },
];
const questions: LandingFAQItem[] = [
  {
    id: 'what',
    category: 'O aplikacji',
    question: 'Co to jest mObywatel?',
    answer:
      'mObywatel to aplikacja, która pozwala korzystać z cyfrowych dokumentów i usług publicznych.',
  },
  {
    id: 'download',
    category: 'O aplikacji',
    question: 'Jak zainstalować aplikację mObywatel?',
    answer:
      'Pobierz aplikację z Google Play lub App Store i postępuj zgodnie z instrukcjami aktywacji.',
  },
  {
    id: 'pesel',
    category: 'Bezpieczeństwo',
    question: 'Czy mogę cofnąć zastrzeżenie numeru PESEL w aplikacji?',
    answer: (
      <p>
        Tak. Szczegółowe zasady opisuje{' '}
        <a href={`${official}/uslugi/zastrzez-pesel`}>oficjalna strona usługi</a>.
      </p>
    ),
    searchText: 'PESEL cofnąć zastrzeżenie zasady',
  },
];
function HomeStatistics() {
  return (
    <LandingStatistics
      title="Przykładowe statystyki aplikacji"
      items={[
        { value: '4.8', label: 'ocena w sklepie Google Play' },
        { value: '4.8', label: 'ocena w sklepie App Store' },
        { value: '120', label: 'przykładowych aktywności' },
        { value: '24', label: 'pozycji w demonstracji' },
      ]}
      image={{ src: landingAssets.community, alt: '' }}
    />
  );
}
function HomeAwards() {
  return (
    <LandingAwards
      title="Miejsce na wyróżnienia Twojego produktu"
      image={{ src: landingAssets.awardsDesktop, alt: 'Przykładowa ilustracja nagród' }}
      mobileImage={landingAssets.awardsMobile}
    />
  );
}
function HomeServices() {
  return (
    <section className="ml-home-services">
      <div className="ml-container ml-section">
        <div className="ml-home-services-intro">
          <h2 className="ml-h2">Usługi</h2>
          <p>
            Przykład komunikatu z obszaru bezpieczeństwa. Zastąp go treścią odpowiednią dla swojej
            aplikacji i użytkowników.
          </p>
        </div>
        <div className="ml-service-grid">
          <LandingServiceCard
            title="Alert powodziowy"
            icon={<img src={landingAssets.serviceFloodIcon} alt="" />}
            description="Przykładowe powiadomienie o zdarzeniu. W aplikacji produkcyjnej podłącz tutaj aktualne dane i własny opis."
            href={`${official}/uslugi/alert-powodziowy`}
            image={{ src: landingAssets.service1, alt: '' }}
          />
          <LandingServiceCard
            title="Bezpiecznie w sieci"
            icon={<img src={landingAssets.serviceCybersecurityIcon} alt="" />}
            description="Przykładowe powiadomienie o zdarzeniu. W aplikacji produkcyjnej podłącz tutaj aktualne dane i własny opis."
            href={`${official}/uslugi/bezpiecznie-w-sieci`}
            image={{ src: landingAssets.service2, alt: '' }}
          />
          <LandingServiceCard
            title="Punkty karne"
            wide
            icon={<img src={landingAssets.servicePointsIcon} alt="" />}
            description="Przykładowy widok danych o pojeździe. Własną treść, dane i nawigację przekaż przez właściwości komponentu."
            href={`${official}/uslugi/punkty-karne`}
            image={{ src: landingAssets.servicePoints, alt: '' }}
          />
          <LandingServiceCard
            title="Zastrzeż PESEL"
            icon={<img src={landingAssets.servicePeselIcon} alt="" />}
            description="Przykład usługi z opisem i przyciskiem akcji. Dane oraz sposób obsługi określa aplikacja korzystająca z biblioteki."
            href={`${official}/uslugi/zastrzez-pesel`}
            image={{ src: landingAssets.servicePesel, alt: '' }}
          />
          <LandingServiceCard
            title="Poznaj wszystkie usługi"
            href={`${official}/uslugi`}
            image={{ src: landingAssets.serviceAll, alt: '' }}
          />
        </div>
      </div>
    </section>
  );
}

/** Responsive composition; paired visual cases explicitly identify the reviewed section and state. */
export function LandingHome({
  showCookieConsent = false,
  cookieInitialTab = 'consent',
}: {
  showCookieConsent?: boolean;
  cookieInitialTab?: LandingConsentTab;
}) {
  const [download, setDownload] = useState(false);
  const [cookies, setCookies] = useState(false);
  const [language, setLanguage] = useState('pl');
  return (
    <LandingProvider className="ml-home">
      <a className="ml-sr-only" href="#landing-main">
        Przejdź do treści
      </a>
      <LandingHeader
        position="overlay"
        items={navigation}
        homeHref={official}
        mobileSocialLinks={social}
        showMobileDownload={false}
        utility={<LandingUtilityBar />}
        language={language}
        onLanguageChange={setLanguage}
      />
      <main id="landing-main">
        <LandingHero
          title="Twoje dokumenty i usługi w telefonie"
          lead="Przykładowa karta dokumentu pokazuje układ informacji i dostępne akcje. Wyświetlane dane służą demonstracji komponentu."
          image={{ src: landingAssets.hero, alt: '' }}
          actions={
            <>
              <LandingButton onClick={() => setDownload(true)}>Pobierz aplikację</LandingButton>
              <LandingLink href={`${official}/o-aplikacji`} variant="secondary">
                Dowiedz się więcej
              </LandingLink>
            </>
          }
        />
        <HomeStatistics />
        <HomeAwards />
        <LandingInfoSection
          title="mObywatel to także portal internetowy"
          tone="blue"
          image={{
            src: landingAssets.portalPromotion,
            alt: 'Demonstracyjna ilustracja portalu',
          }}
          actions={
            <LandingLink
              href="https://www.mobywatel.gov.pl/"
              variant="primary"
              icon={<ArrowRight size={20} />}
            >
              Wejdź na mObywatel.gov.pl
            </LandingLink>
          }
        >
          Załatwisz w nim szybko i łatwo sprawy urzędowe i formalności z dowolnego miejsca, bez
          wychodzenia z domu.
        </LandingInfoSection>
        <LandingInfoSection
          title="Poznaj mDowód"
          image={{ src: landingAssets.documentID, alt: 'mDowód w aplikacji' }}
          actions={
            <LandingLink href={`${official}/dokumenty/mdowod`} variant="primary">
              Poznaj szczegóły mDowodu
            </LandingLink>
          }
        >
          Pełnoprawny cyfrowy dokument tożsamości, który możesz mieć zawsze pod ręką w swoim
          telefonie.
        </LandingInfoSection>
        <LandingDocumentCarousel
          title="Dokumenty zawsze pod ręką"
          description="Cyfrowe dokumenty dla Twojego komfortu i wygody"
          items={documents}
        />
        <HomeServices />
        <LandingNewsList items={news} showFilters={false} showDates={false} />
        <LandingSocialBanner
          links={social}
          description="Bądź na bieżąco z nowościami w mObywatelu."
        />
        <LandingInfoSection
          title="Czuj się bezpiecznie"
          tone="dark"
          actions={
            <LandingLink href={`${official}/bezpieczenstwo`} variant="secondary">
              Więcej o bezpieczeństwie
            </LandingLink>
          }
        >
          Przykładowa karta dokumentu pokazuje układ informacji i dostępne akcje. Wyświetlane dane
          służą demonstracji komponentu.
        </LandingInfoSection>
      </main>
      <LandingFooter
        groups={groups}
        logos={[
          {
            label: 'Organizacja demonstracyjna',
            href: 'https://www.coi.gov.pl/',
            image: landingAssets.logoCOI,
          },
          {
            label: 'Partner demonstracyjny',
            href: 'https://www.gov.pl/web/cyfryzacja',
            image: landingAssets.logoMC,
          },
        ]}
        organizationLinks={[
          { label: 'O nas', href: 'https://www.coi.gov.pl/o-nas' },
          { label: 'Projekty', href: 'https://www.coi.gov.pl/realizacje' },
          { label: 'Oferty pracy', href: 'https://www.coi.gov.pl/oferty-pracy' },
        ]}
        download={<LandingDownloadCTA variant="card" onDownload={() => setDownload(true)} />}
        legalLinks={[
          { label: 'Mapa strony', href: `${official}/mapa-strony` },
          { label: 'Polityka cookies', href: `${official}/media/2025/11/polityka-cookies.pdf` },
          { label: 'Prawa autorskie', href: `${official}/prawa-autorskie` },
          { label: 'Deklaracja dostępności', href: `${official}/deklaracja-dostepnosci` },
        ]}
        onCookieSettings={() => setCookies(true)}
        copyright="©2026 mDesign demo"
      />
      <LandingDownloadPanel open={download} onOpenChange={setDownload} />
      <LandingCookieConsent
        defaultTab={cookieInitialTab}
        open={cookies ? true : showCookieConsent ? undefined : false}
        onOpenChange={setCookies}
        storageKey="mdesign-landing-home-consent"
      />
    </LandingProvider>
  );
}

const exampleData = {
  official,
  social,
  groups,
  navigation,
  documents,
  catalogItems,
  news,
  questions,
};

export function LandingCatalog() {
  return <LandingComponentCatalog data={exampleData} />;
}
export function LandingHeaderPreview() {
  return <LandingHeaderExample data={exampleData} />;
}
export default LandingCatalog;
