import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronDown } from 'lucide-react';
import { LandingButton, LandingCombobox, LandingProvider, useLandingMotion } from './core.js';
import type { LandingOption } from './core.js';
import { landingAssets } from './assets.js';
import { LandingIcon } from './LandingIcon.js';

export interface LandingNavLink {
  label: string;
  href: string;
  current?: boolean;
}
export interface LandingNavItem {
  label: string;
  href?: string;
  children?: LandingNavLink[];
}
export interface LandingUtilityBarProps {
  animationsDisabled?: boolean;
  onAnimationsDisabledChange?: (disabled: boolean) => void;
  signLanguageHref?: string;
  links?: LandingNavLink[];
}
export function LandingUtilityBar({
  animationsDisabled,
  onAnimationsDisabledChange,
  signLanguageHref = 'https://tlumacz.migam.org/mobywatel_govpl',
  links = [],
}: LandingUtilityBarProps) {
  const motion = useLandingMotion();
  const disabled = animationsDisabled ?? motion.disabled;
  return (
    <div className="ml-utility">
      <div className="ml-container ml-utility-inner">
        <label className="ml-animation-toggle">
          <input
            type="checkbox"
            checked={disabled}
            onChange={(event) => {
              motion.setDisabled(event.target.checked);
              onAnimationsDisabledChange?.(event.target.checked);
            }}
          />
          <span className="ml-animation-switch" aria-hidden="true" />
          <span>{disabled ? 'Włącz animacje' : 'Wyłącz animacje'}</span>
        </label>
        <a className="ml-sign-language" href={signLanguageHref} target="_blank" rel="noreferrer">
          <img src={landingAssets.signLanguage} alt="" />
          <span className="ml-sign-language-label">Migowy</span>
          <span className="ml-sr-only"> — pomoc tłumacza polskiego języka migowego, nowe okno</span>
        </a>
        {links.length > 0 && (
          <nav aria-label="Media społecznościowe" className="ml-social-links">
            {links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <span className="ml-sr-only"> — nowe okno</span>
              </a>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
export interface LandingHeaderProps {
  items: LandingNavItem[];
  logo?: ReactNode;
  homeHref?: string;
  utility?: ReactNode;
  languages?: LandingOption[];
  language?: string;
  onLanguageChange?: (language: string) => void;
  onDownload?: () => void;
  downloadLabel?: string;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  onNavigate?: (href: string) => void;
  position?: 'flow' | 'overlay';
  mobileSocialLinks?: LandingNavLink[];
  showMobileDownload?: boolean;
}
export function LandingHeader({
  items,
  logo,
  homeHref = '/',
  utility,
  languages = [
    { value: 'pl', label: 'Polski' },
    { value: 'en', label: 'English' },
  ],
  language = 'pl',
  onLanguageChange,
  onDownload,
  downloadLabel = 'Pobierz aplikację',
  menuOpen,
  onMenuOpenChange,
  onNavigate,
  position = 'flow',
  mobileSocialLinks = [],
  showMobileDownload = true,
}: LandingHeaderProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null);
  const id = useId();
  const open = menuOpen ?? localOpen;
  function setOpen(next: boolean) {
    setLocalOpen(next);
    onMenuOpenChange?.(next);
  }
  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setExpanded(null);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);
  const logoContent = logo ?? (
    <>
      <img
        className="ml-logo-desktop"
        src={landingAssets.logo}
        alt="Aplikacja demo — strona główna"
      />
      <img
        className="ml-logo-mobile"
        src={landingAssets.emblem}
        alt="Aplikacja demo — strona główna"
      />
    </>
  );
  return (
    <>
      <header
        className={`ml-header ml-header--${position}`}
        ref={root}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && expanded !== null) {
            root.current
              ?.querySelector<HTMLButtonElement>(`[data-menu-trigger="${expanded}"]`)
              ?.focus();
            setExpanded(null);
          }
        }}
      >
        {utility}
        <div className="ml-container ml-header-inner">
          <a className="ml-logo" href={homeHref}>
            {logoContent}
          </a>
          <nav className="ml-desktop-nav" aria-label="Nawigacja główna">
            {items.map((item, index) => (
              <div className="ml-nav-entry" key={`${item.label}-${index}`}>
                {item.href && (
                  <a
                    className="ml-nav-link"
                    href={item.href}
                    onClick={() => {
                      setExpanded(null);
                      onNavigate?.(item.href!);
                    }}
                  >
                    {item.label}
                  </a>
                )}
                {!!item.children?.length && (
                  <button
                    className="ml-nav-trigger"
                    type="button"
                    data-menu-trigger={index}
                    aria-label={`${expanded === index ? 'Zwiń' : 'Rozwiń'} submenu ${item.label}`}
                    aria-expanded={expanded === index}
                    aria-controls={`${id}-submenu-${index}`}
                    onClick={() => setExpanded(expanded === index ? null : index)}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setExpanded(index);
                        requestAnimationFrame(() =>
                          document
                            .getElementById(`${id}-submenu-${index}`)
                            ?.querySelector<HTMLAnchorElement>('a')
                            ?.focus(),
                        );
                      }
                    }}
                  >
                    {!item.href && item.label}
                    <LandingIcon name="arrow-down" size={10} style={{ height: 6.25 }} />
                  </button>
                )}
                {expanded === index && (
                  <div className="ml-mega-menu" id={`${id}-submenu-${index}`}>
                    <ul className="ml-container">
                      {item.children?.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            aria-current={link.current ? 'page' : undefined}
                            onClick={() => {
                              setExpanded(null);
                              onNavigate?.(link.href);
                            }}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="ml-header-tools">
            {onLanguageChange && (
              <LandingCombobox
                className="ml-language-select"
                label="Język"
                options={languages}
                value={language}
                onValueChange={onLanguageChange}
              />
            )}
            {onDownload && <LandingButton onClick={onDownload}>{downloadLabel}</LandingButton>}
          </div>
          <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
              <button
                className="ml-menu-button"
                type="button"
                aria-label="Pokaż nawigację menu głównego"
              >
                <LandingIcon name="hamburger" size={64} style={{ height: 52 }} />
              </button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <LandingProvider className="ml-dialog-scope">
                <DialogPrimitive.Overlay className="ml-overlay" />
                <DialogPrimitive.Content className="ml-mobile-menu" aria-describedby={undefined}>
                  <DialogPrimitive.Title className="ml-sr-only">Menu główne</DialogPrimitive.Title>
                  <div className="ml-mobile-menu-top">
                    {utility}
                    <div className="ml-mobile-menu-heading">
                      <a className="ml-logo" href={homeHref}>
                        {logoContent}
                      </a>
                      <DialogPrimitive.Close asChild>
                        <button type="button" className="ml-menu-button" aria-label="Zamknij menu">
                          <LandingIcon name="close-black" size={14} />
                        </button>
                      </DialogPrimitive.Close>
                    </div>
                  </div>
                  <nav aria-label="Mobilna nawigacja główna">
                    {items.map((item, index) =>
                      item.children?.length ? (
                        <details key={`${item.label}-${index}`}>
                          <summary>
                            {item.label}
                            <ChevronDown size={20} aria-hidden="true" />
                          </summary>
                          <ul>
                            {item.href && (
                              <li>
                                <DialogPrimitive.Close asChild>
                                  <a href={item.href} onClick={() => onNavigate?.(item.href!)}>
                                    Pokaż wszystko
                                  </a>
                                </DialogPrimitive.Close>
                              </li>
                            )}
                            {item.children.map((link) => (
                              <li key={link.href}>
                                <DialogPrimitive.Close asChild>
                                  <a
                                    href={link.href}
                                    aria-current={link.current ? 'page' : undefined}
                                    onClick={() => onNavigate?.(link.href)}
                                  >
                                    {link.label}
                                  </a>
                                </DialogPrimitive.Close>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <DialogPrimitive.Close asChild key={`${item.label}-${index}`}>
                          <a
                            className="ml-mobile-menu-link"
                            href={item.href}
                            onClick={() => {
                              if (item.href) onNavigate?.(item.href);
                            }}
                          >
                            {item.label}
                          </a>
                        </DialogPrimitive.Close>
                      ),
                    )}
                  </nav>
                  {(mobileSocialLinks.length > 0 ||
                    onLanguageChange ||
                    (showMobileDownload && onDownload)) && (
                    <div className="ml-mobile-menu-footer">
                      {mobileSocialLinks.length > 0 && (
                        <nav aria-label="Media społecznościowe">
                          <ul>
                            {mobileSocialLinks.map((link) => (
                              <li key={link.href}>
                                <a href={link.href} target="_blank" rel="noreferrer">
                                  {link.label}
                                  <span className="ml-sr-only"> — nowe okno</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </nav>
                      )}
                      {onLanguageChange && (
                        <LandingCombobox
                          label="Język strony"
                          options={languages}
                          value={language}
                          onValueChange={onLanguageChange}
                        />
                      )}
                      {showMobileDownload && onDownload && (
                        <LandingButton
                          onClick={() => {
                            setOpen(false);
                            onDownload();
                          }}
                        >
                          {downloadLabel}
                        </LandingButton>
                      )}
                    </div>
                  )}
                </DialogPrimitive.Content>
              </LandingProvider>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </div>
      </header>
      {position === 'overlay' && <div className="ml-header-spacer" aria-hidden="true" />}
    </>
  );
}

export interface LandingSitemapGroup {
  title: string;
  href?: string;
  links: LandingNavLink[];
}
export function LandingSitemap({
  groups,
  title = 'Mapa strony',
}: {
  groups: LandingSitemapGroup[];
  title?: string;
}) {
  return (
    <section className="ml-section ml-container ml-sitemap">
      <h1 className="ml-h1">{title}</h1>
      <nav aria-label={title}>
        {groups.map((group) => (
          <details key={group.title} open>
            <summary className="ml-h3">
              {group.title}
              <ChevronDown size={24} aria-hidden="true" />
            </summary>
            {group.href && <a href={group.href}>Pokaż wszystko</a>}
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </nav>
    </section>
  );
}
export interface LandingFooterProps {
  groups: LandingSitemapGroup[];
  download?: ReactNode;
  legalLinks?: LandingNavLink[];
  organizationLinks?: LandingNavLink[];
  onCookieSettings?: () => void;
  copyright?: ReactNode;
  logos?: Array<{ label: string; href: string; image: string }>;
}
export function LandingFooter({
  groups,
  download,
  legalLinks = [],
  organizationLinks = [],
  logos = [],
  onCookieSettings,
  copyright = '© mDesign demo',
}: LandingFooterProps) {
  return (
    <footer className="ml-footer">
      <div className="ml-container">
        <div className="ml-footer-main">
          {download && <div className="ml-footer-download">{download}</div>}
          <nav className="ml-footer-groups" aria-label="Nawigacja stopki">
            {groups.map((group) => (
              <div key={group.title}>
                <h2>{group.href ? <a href={group.href}>{group.title}</a> : group.title}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="ml-footer-legal">
          <span>{copyright}</span>
          {legalLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          {onCookieSettings && (
            <button type="button" onClick={onCookieSettings}>
              Ustawienia cookies
            </button>
          )}
        </div>
        {(organizationLinks.length > 0 || logos.length > 0) && (
          <nav className="ml-footer-organizations" aria-label="Organizacje">
            {logos.map((logo) => (
              <a href={logo.href} key={logo.href}>
                <img src={logo.image} alt={logo.label} />
              </a>
            ))}
            {organizationLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}
