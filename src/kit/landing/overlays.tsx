import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ChevronRight, Play, X } from 'lucide-react';
import { LandingButton, LandingProvider } from './core.js';
import { landingAssets, landingStoreLinks } from './assets.js';
import { LandingIcon } from './LandingIcon.js';
import { defaultLandingCookieCategories } from './cookie-data.js';
import type {
  LandingConsentTab,
  LandingCookieCategory,
  LandingCookieProvider,
} from './cookie-data.js';

/** Controlled panels can be opened by a header, hero or footer outside Root. */
function useExternalDialogFocus(hasTrigger = false) {
  const returnTo = useRef<HTMLElement | null>(null);
  function onOpenAutoFocus(event: Event) {
    if (hasTrigger) return;
    const owner = (event.target as HTMLElement | null)?.ownerDocument ?? document;
    const active = owner.activeElement as HTMLElement | null;
    returnTo.current =
      active && active !== owner.body && typeof active.focus === 'function' ? active : null;
  }
  function onCloseAutoFocus(event: Event) {
    if (hasTrigger) return;
    const target = returnTo.current;
    returnTo.current = null;
    if (target?.isConnected) {
      event.preventDefault();
      target.focus({ preventScroll: true });
    }
  }
  return { onOpenAutoFocus, onCloseAutoFocus };
}

export interface LandingStoreLink {
  label: string;
  href: string;
  image: string;
}
const defaultStores: LandingStoreLink[] = [
  {
    label: 'Pobierz z Google Play',
    href: landingStoreLinks.googlePlay,
    image: landingAssets.googlePlay,
  },
  { label: 'Pobierz z App Store', href: landingStoreLinks.appStore, image: landingAssets.appStore },
];
function StoreLinks({ stores }: { stores: LandingStoreLink[] }) {
  return (
    <div className="ml-store-links">
      {stores.map((store) => (
        <a key={store.href} href={store.href} target="_blank" rel="noreferrer">
          <img src={store.image} alt={`${store.label} — nowe okno`} />
        </a>
      ))}
    </div>
  );
}
export interface LandingDownloadCTAProps {
  title?: ReactNode;
  description?: ReactNode;
  stores?: LandingStoreLink[];
  onDownload?: () => void;
  variant?: 'section' | 'card' | 'compact';
}
export function LandingDownloadCTA({
  title = 'Pobierz aplikację demo',
  description,
  stores = defaultStores,
  onDownload,
  variant = 'section',
}: LandingDownloadCTAProps) {
  return (
    <section className={`ml-download-cta ml-download-cta--${variant}`}>
      <img className="ml-download-emblem" src={landingAssets.emblem} alt="" />
      <h2 className={variant === 'section' ? 'ml-h2' : 'ml-h3'}>{title}</h2>
      {description && <p className="ml-lead">{description}</p>}
      <StoreLinks stores={stores} />
      {onDownload && (
        <LandingButton variant="secondary" onClick={onDownload}>
          Pokaż kod QR
        </LandingButton>
      )}
    </section>
  );
}
export interface LandingDownloadPanelProps {
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  qrImage?: string;
  qrAlt?: string;
  stores?: LandingStoreLink[];
  children?: ReactNode;
}
export function LandingDownloadPanel({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  title = 'Zeskanuj kod QR, aby ściągnąć aplikację mobilną',
  description = 'Możesz też wybrać sklep z aplikacjami.',
  qrImage = landingAssets.downloadQR,
  qrAlt = 'Kod QR do strony pobierania',
  stores = defaultStores,
  children,
}: LandingDownloadPanelProps) {
  const focus = useExternalDialogFocus(!!trigger);
  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <LandingProvider className="ml-dialog-scope">
          <DialogPrimitive.Overlay className="ml-overlay" />
          <DialogPrimitive.Content className="ml-download-panel" {...focus}>
            <DialogPrimitive.Close asChild>
              <LandingButton
                variant="secondary"
                className="ml-download-close"
                icon={<X size={20} />}
              >
                Zamknij
              </LandingButton>
            </DialogPrimitive.Close>
            <div className="ml-download-dark-card">
              <DialogPrimitive.Title className="ml-h3">{title}</DialogPrimitive.Title>
              <img className="ml-download-qr" src={qrImage} alt={qrAlt} />
              <DialogPrimitive.Description className="ml-lead">
                {description}
              </DialogPrimitive.Description>
              <StoreLinks stores={stores} />
              {children}
            </div>
          </DialogPrimitive.Content>
        </LandingProvider>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface LandingVideoProps {
  title: string;
  src: string;
  poster?: string;
  kind?: 'video' | 'embed';
  presentation?: 'dialog' | 'inline';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  requireConsent?: boolean;
  consentGranted?: boolean;
  onConsentRequest?: () => void;
  captions?: { src: string; language: string; label: string };
  description?: string;
}
/** External embeds are created after an explicit play action and optional consent. */
export function LandingVideo({
  title,
  src,
  poster,
  kind = 'video',
  presentation = 'dialog',
  open,
  onOpenChange,
  requireConsent = false,
  consentGranted = false,
  onConsentRequest,
  captions,
  description,
}: LandingVideoProps) {
  const [local, setLocal] = useState(false);
  const visible = open ?? local;
  const permitted = !requireConsent || consentGranted;
  function update(next: boolean) {
    if (next && !permitted) {
      onConsentRequest?.();
      return;
    }
    setLocal(next);
    onOpenChange?.(next);
  }
  const media =
    kind === 'embed' ? (
      <iframe
        title={title}
        src={src}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    ) : (
      <video src={src} poster={poster} controls autoPlay playsInline aria-label={title}>
        {captions && (
          <track
            kind="captions"
            src={captions.src}
            srcLang={captions.language}
            label={captions.label}
            default
          />
        )}
      </video>
    );
  const thumbnail = (
    <button
      type="button"
      className="ml-video-poster"
      aria-label={`${permitted ? 'Odtwórz film' : 'Ustaw zgody, aby odtworzyć film'}: ${title}`}
      onClick={presentation === 'inline' ? () => update(true) : undefined}
    >
      {poster && <img src={poster} alt="" loading="lazy" />}
      <span className="ml-video-play" aria-hidden="true">
        <Play size={32} fill="currentColor" />
      </span>
      <span className="ml-video-title">{title}</span>
    </button>
  );
  if (presentation === 'inline')
    return (
      <div className="ml-video">
        {visible && permitted ? (
          <>
            <div className="ml-video-frame">{media}</div>
            <LandingButton variant="link" onClick={() => update(false)}>
              Zamknij odtwarzacz
            </LandingButton>
          </>
        ) : (
          thumbnail
        )}
        {description && <p>{description}</p>}
      </div>
    );
  return (
    <div className="ml-video">
      <DialogPrimitive.Root open={visible && permitted} onOpenChange={update}>
        <DialogPrimitive.Trigger asChild>{thumbnail}</DialogPrimitive.Trigger>
        <DialogPrimitive.Portal>
          <LandingProvider className="ml-dialog-scope">
            <DialogPrimitive.Overlay className="ml-overlay" />
            <DialogPrimitive.Content className="ml-video-dialog" aria-describedby={undefined}>
              <div className="ml-video-dialog-heading">
                <DialogPrimitive.Title className="ml-h4">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Close asChild>
                  <button type="button" className="ml-square-button" aria-label="Zamknij film">
                    <X size={24} />
                  </button>
                </DialogPrimitive.Close>
              </div>
              <div className="ml-video-frame">{media}</div>
            </DialogPrimitive.Content>
          </LandingProvider>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      {description && <p>{description}</p>}
    </div>
  );
}

export interface LandingConsentPreferences {
  necessary: true;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
  updatedAt: string;
}
export interface LandingCookieConsentProps {
  storageKey?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: LandingConsentPreferences;
  onConsentChange?: (consent: LandingConsentPreferences) => void;
  policyHref?: string;
  title?: string;
  description?: ReactNode;
  defaultTab?: LandingConsentTab;
  categories?: LandingCookieCategory[];
}
function validConsent(value: unknown): value is LandingConsentPreferences {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    record.necessary === true &&
    ['preferences', 'statistics', 'marketing'].every((key) => typeof record[key] === 'boolean') &&
    typeof record.updatedAt === 'string'
  );
}
function CookieProviderDisclosure({ provider }: { provider: LandingCookieProvider }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <section className="ml-cookie-provider">
      <button
        className="ml-cookie-provider-trigger"
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="ml-cookie-disclosure-chevron" aria-hidden="true" />
        {provider.name}
        <span className="ml-cookie-count">{provider.cookies.length}</span>
      </button>
      {provider.privacyHref && (
        <a
          className="ml-cookie-provider-privacy"
          href={provider.privacyHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Dowiedz się więcej na temat tego dostawcy<span className="ml-sr-only"> — nowe okno</span>
          <LandingIcon name="external" size={11.25} />
        </a>
      )}
      <div id={id} hidden={!expanded}>
        {provider.note && <p>{provider.note}</p>}
        {provider.cookies.map((cookie) => (
          <article className="ml-cookie-record" key={cookie.name}>
            <h4>{cookie.name}</h4>
            <p>{cookie.description}</p>
            <div>
              <span>
                <b>Maksymalny okres przechowywania</b>: {cookie.retention}
              </span>
              <span>
                <b>Rodzaj</b>: {cookie.type}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
/** Stores only the visitor's explicit choice. It never loads analytics or marketing scripts. */
export function LandingCookieConsent({
  storageKey = 'mdesign-landing-consent-v1',
  open,
  onOpenChange,
  value,
  onConsentChange,
  policyHref = '#privacy',
  title = 'Dbamy o Twoją prywatność',
  description,
  defaultTab = 'consent',
  categories = defaultLandingCookieCategories,
}: LandingCookieConsentProps) {
  const [ready, setReady] = useState(false);
  const [stored, setStored] = useState<LandingConsentPreferences | null>(null);
  const [localOpen, setLocalOpen] = useState<boolean | null>(null);
  const [tab, setTab] = useState<LandingConsentTab>(defaultTab);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [scrollArea, setScrollArea] = useState<HTMLDivElement | null>(null);
  const [faded, setFaded] = useState(false);
  const updateFade = useCallback(() => {
    const element = scrollArea;
    setFaded(!!element && element.scrollHeight - element.scrollTop - element.clientHeight > 1);
  }, [scrollArea]);
  const [choices, setChoices] = useState({
    preferences: false,
    statistics: false,
    marketing: false,
  });
  const focus = useExternalDialogFocus();
  const id = useId();
  const consent = value ?? stored;
  const visible = open ?? localOpen ?? (ready && !consent);
  useEffect(() => {
    setStored(null);
    setLocalOpen(null);
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (validConsent(parsed)) setStored(parsed);
      }
    } catch {
      /* Blocked storage must not preselect optional consent. */
    }
    setReady(true);
  }, [storageKey]);
  useEffect(() => {
    if (visible)
      setChoices({
        preferences: consent?.preferences ?? false,
        statistics: consent?.statistics ?? false,
        marketing: consent?.marketing ?? false,
      });
  }, [visible, consent?.preferences, consent?.statistics, consent?.marketing]);
  useEffect(() => {
    const element = scrollArea;
    if (!element) return;
    let active = true;
    updateFade();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateFade);
    observer?.observe(element);
    const panel = element.querySelector('[data-state="active"]');
    if (panel) observer?.observe(panel);
    void element.ownerDocument.fonts?.ready.then(() => {
      if (active) updateFade();
    });
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [visible, tab, expandedCategories, categories, scrollArea, updateFade]);
  function choose(next: typeof choices) {
    const record: LandingConsentPreferences = {
      necessary: true,
      ...next,
      updatedAt: new Date().toISOString(),
    };
    setStored(record);
    setLocalOpen(false);
    setTab('consent');
    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
    } catch {
      /* The callback still works with storage disabled. */
    }
    onConsentChange?.(record);
    onOpenChange?.(false);
  }
  if (!visible) return null;
  return (
    <DialogPrimitive.Root
      open={visible}
      onOpenChange={(next) => {
        if (!next) return;
        setLocalOpen(true);
        onOpenChange?.(true);
      }}
    >
      <DialogPrimitive.Portal>
        <LandingProvider className="ml-dialog-scope">
          <DialogPrimitive.Overlay className="ml-overlay ml-cookie-overlay" />
          <DialogPrimitive.Content
            className="ml-cookie-consent"
            data-tab={tab}
            {...focus}
            aria-describedby={tab === 'consent' ? `${id}-description` : undefined}
            onEscapeKeyDown={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => event.preventDefault()}
          >
            <div className="ml-cookie-header">
              <img src={landingAssets.cookieLogo} alt="Aplikacja demo" />
            </div>
            <DialogPrimitive.Title className="ml-sr-only">{title}</DialogPrimitive.Title>
            <TabsPrimitive.Root
              value={tab}
              onValueChange={(next) => setTab(next as LandingConsentTab)}
              className="ml-cookie-tabs"
            >
              <TabsPrimitive.List
                aria-label="Informacje o plikach cookies"
                className="ml-cookie-tab-list"
              >
                <TabsPrimitive.Trigger value="consent">Zgoda</TabsPrimitive.Trigger>
                <TabsPrimitive.Trigger value="details">Szczegóły</TabsPrimitive.Trigger>
                <TabsPrimitive.Trigger value="about">O plikach cookies</TabsPrimitive.Trigger>
              </TabsPrimitive.List>
              <div className="ml-cookie-body" ref={setScrollArea} onScroll={updateFade}>
                <TabsPrimitive.Content value="consent" className="ml-cookie-copy">
                  <h2>{title}</h2>
                  <DialogPrimitive.Description id={`${id}-description`}>
                    {description ?? (
                      <>
                        Wybierz, na które kategorie danych wyrażasz zgodę. Ten przykład zapisuje
                        wyłącznie Twój wybór i nie uruchamia analityki ani reklam.
                        <a href={policyHref}>polityce prywatności</a>.
                      </>
                    )}
                  </DialogPrimitive.Description>
                </TabsPrimitive.Content>
                <TabsPrimitive.Content value="details" className="ml-cookie-details">
                  <ul className="ml-cookie-categories">
                    {categories.map((category) => {
                      const expanded = expandedCategories.includes(category.id);
                      const count = category.providers.reduce(
                        (total, provider) => total + provider.cookies.length,
                        0,
                      );
                      const controlledChoice =
                        category.id !== 'necessary' && category.id !== 'unclassified'
                          ? category.id
                          : undefined;
                      return (
                        <li className="ml-cookie-category" key={category.id}>
                          <div className="ml-cookie-category-header">
                            <button
                              className="ml-cookie-category-trigger"
                              type="button"
                              aria-expanded={expanded}
                              aria-controls={`${id}-${category.id}`}
                              aria-label={`${category.label} (${count})`}
                              onClick={() =>
                                setExpandedCategories((current) =>
                                  expanded
                                    ? current.filter((key) => key !== category.id)
                                    : [...current, category.id],
                                )
                              }
                            >
                              <span className="ml-cookie-disclosure-chevron" aria-hidden="true" />
                              <span role="heading" aria-level={3}>
                                {category.label}{' '}
                              </span>
                              <span className="ml-cookie-count">{count}</span>
                            </button>
                            {category.id !== 'unclassified' && (
                              <label className="ml-cookie-switch">
                                <input
                                  type="checkbox"
                                  role="switch"
                                  aria-label={
                                    category.id === 'necessary'
                                      ? 'Niezbędne — zawsze aktywne'
                                      : category.label
                                  }
                                  checked={
                                    category.id === 'necessary' ||
                                    (controlledChoice ? choices[controlledChoice] : false)
                                  }
                                  disabled={category.id === 'necessary'}
                                  onChange={(event) => {
                                    if (controlledChoice)
                                      setChoices((current) => ({
                                        ...current,
                                        [controlledChoice]: event.target.checked,
                                      }));
                                  }}
                                />
                                <span aria-hidden="true" />
                              </label>
                            )}
                          </div>
                          <p className="ml-cookie-category-description">{category.description}</p>
                          <div
                            className="ml-cookie-providers"
                            id={`${id}-${category.id}`}
                            hidden={!expanded}
                          >
                            {category.providers.length ? (
                              category.providers.map((provider) => (
                                <CookieProviderDisclosure key={provider.name} provider={provider} />
                              ))
                            ) : (
                              <p>Nie stosujemy plików cookie tego typu</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </TabsPrimitive.Content>
                <TabsPrimitive.Content value="about" className="ml-cookie-copy ml-cookie-about">
                  <h2 className="ml-sr-only">O plikach cookies</h2>
                  <p>
                    Wybierz, na które kategorie danych wyrażasz zgodę. Ten przykład zapisuje
                    wyłącznie Twój wybór i nie uruchamia analityki ani reklam.
                  </p>
                  <p>
                    Wybierz, na które kategorie danych wyrażasz zgodę. Ten przykład zapisuje
                    wyłącznie Twój wybór i nie uruchamia analityki ani reklam.
                  </p>
                  <p>
                    Wybierz, na które kategorie danych wyrażasz zgodę. Ten przykład zapisuje
                    wyłącznie Twój wybór i nie uruchamia analityki ani reklam.
                  </p>
                  <p>
                    W dowolnej chwili możesz wycofać swoją zgodę w Deklaracji dot. plików cookie na
                    naszej witrynie.
                  </p>
                  <p>
                    Wybierz, na które kategorie danych wyrażasz zgodę. Ten przykład zapisuje
                    wyłącznie Twój wybór i nie uruchamia analityki ani reklam.
                  </p>
                  <p>
                    Prosimy o podanie identyfikatora Pana(Pani) zgody i daty kontaktu z nami w
                    sprawie Pana(Pani) zgody
                  </p>
                </TabsPrimitive.Content>
              </div>
              {faded && tab !== 'details' && <div className="ml-cookie-fade" aria-hidden="true" />}
            </TabsPrimitive.Root>
            <div className="ml-cookie-actions">
              <button
                className="ml-cookie-button"
                type="button"
                onClick={() => choose({ preferences: false, statistics: false, marketing: false })}
              >
                Odmowa
              </button>
              {tab === 'details' ? (
                <button className="ml-cookie-button" type="button" onClick={() => choose(choices)}>
                  Zezwól na wybór
                </button>
              ) : (
                <button
                  className="ml-cookie-button"
                  type="button"
                  onClick={() => {
                    setChoices({
                      preferences: consent?.preferences ?? false,
                      statistics: consent?.statistics ?? false,
                      marketing: consent?.marketing ?? false,
                    });
                    setTab('details');
                  }}
                >
                  Spersonalizuj
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              )}
              <button
                className="ml-cookie-button"
                type="button"
                onClick={() => choose({ preferences: true, statistics: true, marketing: true })}
              >
                Zezwól na wszystkie
              </button>
            </div>
          </DialogPrimitive.Content>
        </LandingProvider>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
