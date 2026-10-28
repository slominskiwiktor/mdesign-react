import { docsPath } from '../docs-path';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import {
  ArrowRight,
  ChevronRight,
  Folder,
  Monitor,
  Moon,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  UserRound,
  Wallet,
} from 'lucide-react';
import { Badge, BottomNavigation, DocumentArtwork, SearchField } from '../kit';
import { NativeIcon } from '../kit/NativeIcon';
import { ReferenceServiceIcon, ReferencePeselHero } from './ReferenceServiceIcon';
export { DesktopScreen } from './DesktopScreen';
import './screens.css';
import './document-cards.css';
import './mobile-refinements.css';

type Screen = 'documents' | 'services' | 'pesel';
type MobileView = Screen | 'qr' | 'more';
type MobileTheme = 'light' | 'dark';

const documents = [
  {
    title: 'mDowód',
    color: 'blue',
    badge: 'id-logo',
    artwork: 'id-document',
    description: 'Twój cyfrowy dokument tożsamości',
  },
  {
    title: 'Legitymacja emeryta-rencisty',
    color: 'teal',
    badge: 'pension-logo',
    artwork: 'pension-card',
    description: 'Twoja legitymacja w jednym miejscu',
  },
  {
    title: 'Karta Dużej Rodziny',
    color: 'purple',
    badge: 'family-logo',
    artwork: 'family-card',
    description: 'Uprawnienia i zniżki dla rodziny',
  },
  {
    title: 'Moje pojazdy',
    color: 'orange',
    badge: 'id-logo',
    artwork: 'vehicles',
    description: 'Informacje o Twoich pojazdach',
  },
  {
    title: 'mPrawo jazdy',
    color: 'rose',
    badge: 'id-logo',
    artwork: 'driving-license',
    description: 'Twoje uprawnienia do kierowania',
  },
] as const;

const favoriteServices = [
  { title: 'Załatw sprawę', icon: 'apply', description: 'Wnioski i sprawy urzędowe' },
  { title: 'Zastrzeż PESEL', icon: 'pesel', description: 'Chroń swój numer PESEL' },
  { title: 'Twoje sprawy', icon: 'my-cases', description: 'Sprawdź status swoich spraw' },
] as const;

const protectionServices = [
  {
    title: 'Bezpiecznie w sieci',
    icon: 'cybersecurity',
    description: 'Zgłoś niebezpieczną sytuację w internecie',
  },
  { title: 'Sprawdź dowód', icon: 'verify-id', description: 'Sprawdź ważność dokumentu' },
  {
    title: 'Sprawdź PESEL',
    icon: 'verify-pesel',
    description: 'Sprawdź zastrzeżenie numeru PESEL',
  },
] as const;

const driverServices = [
  { title: 'mStłuczka', icon: 'collision', description: 'Oświadczenie o zdarzeniu drogowym' },
  { title: 'Historia pojazdu', icon: 'car-history', description: 'Sprawdź informacje o pojeździe' },
] as const;

function StatusBar() {
  return (
    <div className="sample-status" aria-hidden="true">
      <span>9:41</span>
      <div>
        <svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor">
          <rect y="9" width="3" height="4" rx=".8" />
          <rect x="5" y="6" width="3" height="7" rx=".8" />
          <rect x="10" y="3" width="3" height="10" rx=".8" />
          <rect x="15" width="3" height="13" rx=".8" />
        </svg>
        <svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor">
          <path d="M0 4.2a13 13 0 0 1 18 0l-2.2 2.2a9.8 9.8 0 0 0-13.6 0Zm3.5 3.5a8 8 0 0 1 11 0l-2.2 2.2a4.8 4.8 0 0 0-6.6 0ZM7 11.2a3 3 0 0 1 4 0L9 13Z" />
        </svg>
        <span className="sample-battery">
          <i />
        </span>
      </div>
    </div>
  );
}

function PhoneDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  compact = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Overlay className="sample-phone-overlay" />
      <RadixDialog.Content
        className={`sample-phone-dialog${compact ? ' sample-phone-dialog--compact' : ''}`}
        onOpenAutoFocus={(event) => {
          previousFocus.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
          if (compact) {
            event.preventDefault();
            if (event.target instanceof HTMLElement) event.target.focus({ preventScroll: true });
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (previousFocus.current?.isConnected) previousFocus.current.focus();
        }}
      >
        <RadixDialog.Title>{title}</RadixDialog.Title>
        {description ? (
          <RadixDialog.Description>{description}</RadixDialog.Description>
        ) : (
          <RadixDialog.Description className="sample-sr">
            Przykładowa interakcja w demonstracji interfejsu.
          </RadixDialog.Description>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Root>
  );
}

function PhoneRow({
  title,
  description,
  icon,
  iconName,
  trailing,
  onClick,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconName?: string;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      {icon && (
        <span className="sample-row-icon" data-icon={iconName}>
          {icon}
        </span>
      )}
      <span className="sample-row-text">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      {trailing ?? <NativeIcon name="chevron-right" className="sample-row-arrow" size={24} />}
    </>
  );
  return onClick ? (
    <button type="button" className="sample-phone-row" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="sample-phone-row">{content}</div>
  );
}

export function MobileScreen({
  screen = 'documents',
  theme = 'light',
  initialReserved = false,
  initialDialog = false,
}: {
  screen?: Screen;
  theme?: MobileTheme;
  initialReserved?: boolean;
  initialDialog?: boolean;
}) {
  const [view, setView] = useState<MobileView>(screen);
  const [appearance, setAppearance] = useState<MobileTheme>(theme);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [documentCount, setDocumentCount] = useState(4);
  const [modal, setModal] = useState<string | null>(initialDialog ? 'confirm-pesel' : null);
  const [reserved, setReserved] = useState(initialReserved);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  useEffect(() => {
    setView(screen);
    setQuery('');
  }, [screen]);
  useEffect(() => setAppearance(theme), [theme]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const changeView = (next: MobileView) => {
    setView(next);
    setQuery('');
  };
  const openService = (title: string) =>
    title === 'Zastrzeż PESEL' ? changeView('pesel') : setModal(title);
  const activeTab = view === 'pesel' ? 'services' : view;
  const title = {
    documents: 'Dokumenty',
    services: 'Usługi',
    pesel: 'Zastrzeż PESEL',
    qr: 'Kod QR',
    more: 'Więcej',
  }[view];

  return (
    <div
      className="sample-phone"
      data-platform="mobile"
      data-theme={appearance}
      data-screen={view}
      aria-label={`Przykładowy ekran mobilny: ${title}`}
    >
      <StatusBar />
      <div className="sample-phone-scroll" key={view}>
        {view === 'pesel' ? (
          <header className="sample-phone-subheader">
            <button type="button" onClick={() => changeView('services')}>
              <NativeIcon name="chevron-left" size={24} />
              Wróć
            </button>
            <strong>Zastrzeż PESEL</strong>
            <button
              type="button"
              className="sample-phone-help"
              aria-label="Pomoc dotycząca usługi PESEL"
              onClick={() => setModal('O usłudze Zastrzeż PESEL')}
            >
              <NativeIcon name="help" size={24} />
            </button>
          </header>
        ) : (
          <>
            <div className="sample-phone-brand">
              <img
                src={docsPath('/brand/demo-mark.svg')}
                alt="Aplikacja demonstracyjna"
                width="30"
                height="30"
              />
              {view !== 'services' && (
                <button
                  type="button"
                  aria-label="Powiadomienia"
                  onClick={() => setModal('Powiadomienia')}
                >
                  <NativeIcon name="bell" size={24} />
                </button>
              )}
            </div>
            <h2 className="sample-phone-title">{title}</h2>
          </>
        )}

        {view === 'documents' && (
          <>
            <div className="sample-document-actions">
              <button type="button" onClick={() => setModal('Dostosuj widok dokumentów')}>
                Dostosuj
              </button>
              <button type="button" onClick={() => setModal('Dodaj dokument')}>
                Dodaj
              </button>
            </div>
            <div className={`sample-documents sample-documents--${layout}`}>
              {documents.slice(0, documentCount).map(({ title: documentTitle, color, badge }) => (
                <button
                  type="button"
                  className={`sample-document sample-document--${color}`}
                  key={documentTitle}
                  onClick={() => setModal(documentTitle)}
                >
                  {color !== 'rose' && (
                    <DocumentArtwork
                      variant={
                        (
                          {
                            blue: 'id',
                            teal: 'pension',
                            purple: 'family',
                            orange: 'vehicles',
                          } as const
                        )[color]
                      }
                    />
                  )}
                  <span className="sample-document-symbol">
                    <NativeIcon name={badge} size={32} />
                  </span>
                  <span className="sample-document-name">{documentTitle}</span>
                  {layout === 'list' && <ChevronRight size={21} />}
                </button>
              ))}
            </div>
          </>
        )}

        {view === 'services' && (
          <>
            <SearchField
              className="sample-phone-search-field"
              label="Szukaj usług"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {[
              { title: 'Ulubione', items: favoriteServices },
              { title: 'Ochrona danych', items: protectionServices },
              { title: 'Kierowca i pojazdy', items: driverServices },
            ]
              .filter((group) =>
                group.items.some((service) =>
                  service.title.toLocaleLowerCase('pl').includes(query.toLocaleLowerCase('pl')),
                ),
              )
              .map(({ title: groupTitle, items }) => (
                <section className="sample-service-group" key={groupTitle}>
                  <div className="sample-mobile-section-title">
                    <h3>{groupTitle}</h3>
                    {groupTitle === 'Ulubione' && (
                      <button type="button" onClick={() => setModal('Dostosuj ulubione')}>
                        Dostosuj
                      </button>
                    )}
                  </div>
                  <div className="sample-mobile-card">
                    {items
                      .filter((service) =>
                        service.title
                          .toLocaleLowerCase('pl')
                          .includes(query.toLocaleLowerCase('pl')),
                      )
                      .map(({ title: serviceTitle, icon }) => (
                        <PhoneRow
                          key={serviceTitle}
                          title={serviceTitle}
                          iconName={icon}
                          icon={<ReferenceServiceIcon name={icon} theme={appearance} size={24} />}
                          onClick={() => openService(serviceTitle)}
                        />
                      ))}
                  </div>
                </section>
              ))}
            {![...favoriteServices, ...protectionServices, ...driverServices].some((service) =>
              service.title.toLocaleLowerCase('pl').includes(query.toLocaleLowerCase('pl')),
            ) && (
              <div className="sample-search-empty">
                <NativeIcon name="search" size={30} />
                <h3>Brak wyników</h3>
                <p>Spróbuj wpisać inną nazwę usługi.</p>
              </div>
            )}
          </>
        )}

        {view === 'pesel' && (
          <div className="sample-pesel">
            <div className="sample-pesel-symbol">
              <ReferencePeselHero />
            </div>
            <h2>
              Twój PESEL jest
              <br />
              {reserved ? 'zastrzeżony' : 'niezastrzeżony'}
            </h2>
            <p className="sample-pesel-intro">
              {reserved
                ? 'Teraz nikt nie wykorzysta go bez Twojej wiedzy.'
                : 'Zastrzeż PESEL, żeby nikt nie wykorzystał go bez Twojej wiedzy.'}
            </p>
            <div className="sample-mobile-card sample-pesel-action">
              <strong>Zastrzeż PESEL</strong>
              <button
                type="button"
                className="sample-pill"
                onClick={() => setModal('confirm-pesel')}
              >
                {reserved ? 'Cofnij zastrzeżenie' : 'Zastrzeż'}
              </button>
            </div>
            {reserved && (
              <p className="sample-pesel-note">
                Po każdym cofnięciu zastrzeżenia numeru PESEL nie możesz skorzystać z usługi przez
                30 minut.
              </p>
            )}
            <h3>Historia</h3>
            <div className="sample-mobile-card">
              <PhoneRow
                title="Kto sprawdzał Twój PESEL"
                description="Ostatnia weryfikacja 1.04.2023"
                onClick={() => setModal('Kto sprawdzał Twój PESEL')}
              />
              <PhoneRow
                title="Twoje zmiany"
                description="Ostatnia zmiana 1.04.2023"
                onClick={() => setModal('Twoje zmiany')}
              />
            </div>
          </div>
        )}

        {view === 'qr' && (
          <div className="sample-qr-view">
            <div className="sample-qr-frame">
              <NativeIcon name="qr" size={125} />
            </div>
            <h3>Potwierdzaj dane kodem QR</h3>
            <p>Zeskanuj kod, aby szybko potwierdzić dane lub tożsamość.</p>
            <button
              type="button"
              className="sample-solid-button"
              onClick={() => setModal('Zeskanuj kod QR')}
            >
              <NativeIcon name="qr" size={20} />
              Zeskanuj kod QR
            </button>
            <button type="button" className="sample-pill" onClick={() => setModal('Pokaż kod QR')}>
              Pokaż swój kod QR
            </button>
          </div>
        )}

        {view === 'more' && (
          <div className="sample-more-view">
            <div className="sample-mobile-card sample-profile">
              <span>
                <UserRound size={25} />
              </span>
              <div>
                <strong>Jan Kowalski</strong>
                <small>Konto przykładowe</small>
              </div>
            </div>
            <h3>Ustawienia</h3>
            <div className="sample-mobile-card">
              <PhoneRow
                title="Wygląd"
                description={appearance === 'light' ? 'Tryb jasny' : 'Tryb ciemny'}
                icon={appearance === 'light' ? <Sun size={23} /> : <Moon size={23} />}
                onClick={() => setAppearance(appearance === 'light' ? 'dark' : 'light')}
              />
              <PhoneRow
                title="Powiadomienia"
                icon={<NativeIcon name="bell" size={24} />}
                onClick={() => setModal('Powiadomienia')}
              />
              <PhoneRow
                title="Bezpieczeństwo"
                icon={<ShieldCheck size={23} />}
                onClick={() => setModal('Bezpieczeństwo')}
              />
            </div>
            <h3>Informacje</h3>
            <div className="sample-mobile-card">
              <PhoneRow
                title="Pomoc"
                icon={<NativeIcon name="help" size={24} />}
                onClick={() => setModal('Pomoc')}
              />
              <PhoneRow
                title="O aplikacji"
                icon={<Smartphone size={23} />}
                onClick={() => setModal('O aplikacji')}
              />
            </div>
          </div>
        )}
      </div>

      <BottomNavigation
        className="sample-bottom-nav"
        label="Nawigacja aplikacji mobilnej"
        value={activeTab}
        onValueChange={(value) => changeView(value as MobileView)}
        homeIndicator
        items={[
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
        ]}
      />
      {toast && (
        <div className="sample-mobile-toast" role="status">
          <NativeIcon name="check" size={17} />
          {toast}
        </div>
      )}

      <PhoneDialog
        open={modal === 'confirm-pesel'}
        onOpenChange={(open) => !open && setModal(null)}
        title={reserved ? 'Czy chcesz cofnąć zastrzeżenie?' : 'Czy chcesz zastrzec PESEL?'}
        compact
      >
        <button
          type="button"
          className="sample-dialog-action"
          onClick={() => {
            setReserved(!reserved);
            setModal(null);
            setToast(reserved ? 'Zastrzeżenie zostało cofnięte' : 'PESEL został zastrzeżony');
          }}
        >
          {reserved ? 'Cofnij zastrzeżenie' : 'Zastrzeż PESEL'}
        </button>
        <RadixDialog.Close className="sample-dialog-action sample-dialog-cancel">
          Anuluj
        </RadixDialog.Close>
      </PhoneDialog>
      <PhoneDialog
        open={!!modal && modal !== 'confirm-pesel'}
        onOpenChange={(open) => !open && setModal(null)}
        title={modal ?? ''}
      >
        {modal === 'Dostosuj widok dokumentów' ? (
          <div className="sample-layout-options">
            {(
              [
                { value: 'grid', label: 'Małe karty' },
                { value: 'list', label: 'Lista' },
              ] as const
            ).map(({ value, label }) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setLayout(value);
                  setModal(null);
                }}
              >
                <NativeIcon name={value} size={22} />
                {label}
                {layout === value && (
                  <NativeIcon name="check" size={19} className="sample-layout-selected" />
                )}
              </button>
            ))}
          </div>
        ) : modal === 'Dodaj dokument' ? (
          <>
            <p>Wybierz dokument, który chcesz dodać do swojego zestawu.</p>
            <button
              type="button"
              className="sample-add-document"
              disabled={documentCount === 5}
              onClick={() => {
                setDocumentCount(5);
                setModal(null);
                setToast('Dodano mPrawo jazdy');
              }}
            >
              <NativeIcon name="driving-license" size={35} />
              <span>
                <strong>mPrawo jazdy</strong>
                <small>
                  {documentCount === 5
                    ? 'Dokument jest już dodany'
                    : 'Uprawnienia do kierowania pojazdami'}
                </small>
              </span>
              {documentCount === 5 ? (
                <NativeIcon name="check" size={20} />
              ) : (
                <NativeIcon name="plus" size={20} />
              )}
            </button>
            <RadixDialog.Close className="sample-dialog-action sample-dialog-cancel">
              Zamknij
            </RadixDialog.Close>
          </>
        ) : modal === 'Dostosuj ulubione' ? (
          <>
            <p>Te usługi masz zawsze pod ręką.</p>
            {favoriteServices.map(({ title: serviceTitle, icon }) => (
              <div className="sample-favorite-row" key={serviceTitle}>
                <NativeIcon name={icon} size={28} />
                <span className="sample-favorite-label">{serviceTitle}</span>
                <NativeIcon name="check" size={19} className="sample-favorite-selected" />
              </div>
            ))}
            <RadixDialog.Close className="sample-dialog-action sample-dialog-cancel">
              Gotowe
            </RadixDialog.Close>
          </>
        ) : documents.some((document) => document.title === modal) ? (
          <>
            <div className="sample-document-preview">
              <NativeIcon
                name={
                  documents.find((document) => document.title === modal)?.artwork ?? 'id-document'
                }
                size={72}
              />
              <Badge tone="info">Widok przykładowy</Badge>
            </div>
            <p>
              {documents.find((document) => document.title === modal)?.description}. Karta
              prezentuje wyłącznie wygląd interfejsu; nie zawiera danych ani numeru dokumentu.
            </p>
            <RadixDialog.Close className="sample-dialog-action sample-dialog-cancel">
              Zamknij
            </RadixDialog.Close>
          </>
        ) : modal === 'Powiadomienia' ? (
          <>
            <div className="sample-modal-empty">
              <NativeIcon name="bell" size={38} />
              <strong>Jesteś na bieżąco</strong>
              <p>Nie masz nowych powiadomień.</p>
            </div>
            <RadixDialog.Close className="sample-dialog-action sample-dialog-cancel">
              Zamknij
            </RadixDialog.Close>
          </>
        ) : modal === 'Twoje zmiany' ? (
          <>
            <div className="sample-history-item">
              <NativeIcon name="pesel" size={28} />
              <div>
                <strong>{reserved ? 'Zastrzeżono PESEL' : 'PESEL niezastrzeżony'}</strong>
                <small>Przykładowy status · dzisiaj, 9:41</small>
              </div>
            </div>
            <RadixDialog.Close className="sample-dialog-action sample-dialog-cancel">
              Zamknij
            </RadixDialog.Close>
          </>
        ) : modal === 'Kto sprawdzał Twój PESEL' ? (
          <>
            <div className="sample-modal-empty">
              <ShieldCheck size={38} />
              <strong>Brak weryfikacji</strong>
              <p>Tutaj zobaczysz historię sprawdzeń numeru PESEL.</p>
            </div>
            <RadixDialog.Close className="sample-dialog-action sample-dialog-cancel">
              Zamknij
            </RadixDialog.Close>
          </>
        ) : (
          <>
            <p>
              {modal?.includes('QR')
                ? 'Przykładowy widok kodu QR. W prawdziwej aplikacji możesz tu bezpiecznie potwierdzić swoje dane.'
                : modal === 'O aplikacji'
                  ? 'Przykładowy interfejs React inspirowany mObywatelem. To niezależna biblioteka komponentów.'
                  : modal === 'O usłudze Zastrzeż PESEL'
                    ? 'Zastrzeżenie numeru PESEL pomaga chronić przed wykorzystaniem Twoich danych. W tym interfejsie zmieniasz wyłącznie przykładowy stan.'
                    : 'Przykładowy widok usługi. Wybierz ekran Zastrzeż PESEL, aby sprawdzić pełną interakcję ze zmianą stanu i potwierdzeniem.'}
            </p>
            {modal?.includes('QR') && (
              <ScanLine className="sample-modal-scan" size={90} strokeWidth={1} />
            )}
            <RadixDialog.Close className="sample-dialog-action sample-dialog-cancel">
              Zamknij
            </RadixDialog.Close>
          </>
        )}
      </PhoneDialog>
    </div>
  );
}

export function ScreensPage() {
  const [platform, setPlatform] = useState<'mobile' | 'desktop'>('mobile');
  const [screen, setScreen] = useState<Screen>('documents');
  const [theme, setTheme] = useState<MobileTheme>('light');
  return (
    <section className="sample-showcase">
      <div className="sample-showcase-heading">
        <div>
          <h2>Wybierz platformę</h2>
          <p>Sprawdź układy i interakcje w kontekście.</p>
        </div>
        <div className="sample-platform-control" aria-label="Platforma">
          {(
            [
              { value: 'mobile', label: 'Mobile', icon: Smartphone },
              { value: 'desktop', label: 'Desktop', icon: Monitor },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={platform === value}
              className={platform === value ? 'sample-control-active' : ''}
              onClick={() => setPlatform(value)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
      </div>
      {platform === 'mobile' ? (
        <div className="sample-mobile-showcase">
          <div className="sample-showcase-options">
            <div className="sample-preview-label">
              <span />
              MDESIGN · DEMO
            </div>
            <h2>
              Codzienne sprawy.
              <br />
              Zawsze pod ręką.
            </h2>
            <p>
              Przykładowy portfel dokumentów, katalog usług i lokalne interakcje. Wszystkie dane są
              demonstracyjne.
            </p>
            <div className="sample-screen-select" aria-label="Wybierz ekran">
              {(
                [
                  {
                    value: 'documents',
                    label: 'Dokumenty',
                    description: 'Twój portfel dokumentów',
                    icon: Wallet,
                  },
                  {
                    value: 'services',
                    label: 'Usługi',
                    description: 'Wszystko w jednym miejscu',
                    icon: Folder,
                  },
                  {
                    value: 'pesel',
                    label: 'Zastrzeż PESEL',
                    description: 'Bezpieczeństwo Twoich danych',
                    icon: ShieldCheck,
                  },
                ] as const
              ).map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={screen === value}
                  className={screen === value ? 'sample-screen-option-active' : ''}
                  onClick={() => setScreen(value)}
                >
                  <Icon size={21} />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
            </div>
            <div className="sample-theme-control" aria-label="Motyw podglądu">
              <span>Wygląd</span>
              <div>
                {(
                  [
                    { value: 'light', label: 'Jasny', icon: Sun },
                    { value: 'dark', label: 'Ciemny', icon: Moon },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setTheme(value)}
                    aria-pressed={theme === value}
                    className={theme === value ? 'sample-control-active' : ''}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sample-preview-hint">
              <Sparkles size={16} />
              <span>
                Klikaj karty i nawigację.
                <br />
                To działający interfejs React.
              </span>
            </div>
          </div>
          <div className="sample-phone-stage">
            <div className="sample-phone-device">
              <MobileScreen screen={screen} theme={theme} />
            </div>
            <div className="sample-preview-dimensions">
              375 × 812<span>•</span>
              {theme === 'light' ? 'Tryb jasny' : 'Tryb ciemny'}
            </div>
          </div>
        </div>
      ) : (
        <div className="sample-desktop-showcase">
          <div className="sample-desktop-preview-info">
            <div>
              <Badge tone="info">Portal · 19.10.2026</Badge>
              <p>
                Układ sprawdzony w zalogowanym portalu: nawigacja PrimeNG, treść GDS i aktualny
                katalog usług.
              </p>
            </div>
            <span>
              <Monitor size={15} />
              Responsywny układ
            </span>
          </div>
          <iframe
            className="sample-desktop-frame"
            src={docsPath('/preview/desktop')}
            title="Interaktywny podgląd portalu mObywatel"
          />
        </div>
      )}
      <div className="sample-showcase-note">
        <ShieldCheck size={17} />
        <p>
          Przykładowe ekrany biblioteki komponentów. Dane są fikcyjne, a interakcje działają
          lokalnie. To niezależny projekt.
        </p>
      </div>
    </section>
  );
}
