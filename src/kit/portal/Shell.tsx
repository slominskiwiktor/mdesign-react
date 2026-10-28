import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { PortalIcon } from './PortalIcon.js';
import type { PortalIconName } from './PortalIcon.js';
import { PortalMenu } from './Overlays.js';
import type { PortalMenuItem } from './Overlays.js';
import { PortalLogoInformation } from './Parts.js';
import { usePortalState, portalClass } from './state.js';
import googlePlay from './assets/demo-google-play.svg';
import appStore from './assets/demo-app-store.svg';
import deliveryBanner from './assets/demo-banner-e-delivery.svg';
import headerEmblem from './assets/demo-mark.svg';
import affairs from '../official-icons/icon-185.svg';
import payments from '../official-icons/icon-287.svg';
import catalog from '../official-icons/icon-252.svg';
import popular from '../official-icons/icon-292.svg';
import calendar from '../official-icons/icon-274.svg';
export const portalWidgetIconNames = [
  'affairs',
  'payments',
  'catalog',
  'popular',
  'calendar',
] as const;
export function PortalWidgetIcon({
  name,
  size = 32,
}: {
  name: (typeof portalWidgetIconNames)[number];
  size?: number;
}) {
  const source = { affairs, payments, catalog, popular, calendar }[name];
  return (
    <span
      className="mp-widget-icon"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        maskImage: `url("${source}")`,
        WebkitMaskImage: `url("${source}")`,
      }}
    />
  );
}
export interface PortalHeaderProps extends HTMLAttributes<HTMLElement> {
  brand?: ReactNode;
  brandHref?: string;
  onMenuClick?: () => void;
  menuOpen?: boolean;
  menuLabel?: string;
  onBrandClick?: () => void;
  account?: ReactNode;
  actions?: ReactNode;
}
export const PortalHeader = /* @__PURE__ */ forwardRef<HTMLElement, PortalHeaderProps>(
  function PortalHeader(
    {
      brand,
      brandHref = '/',
      onMenuClick,
      menuOpen,
      menuLabel = 'Menu',
      onBrandClick,
      account,
      actions,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <header {...props} ref={ref} className={portalClass('mp-header', className)}>
        <div className="mp-header-left">
          {onMenuClick && (
            <button
              type="button"
              className="mp-menu-button"
              aria-expanded={menuOpen}
              aria-label={menuLabel}
              onClick={onMenuClick}
            >
              <PortalIcon name={menuOpen ? 'AE_x_mark' : 'AE_bars_3'} />
              <span>{menuLabel}</span>
            </button>
          )}
          {onBrandClick ? (
            <button
              type="button"
              className="mp-emblem-link"
              aria-label="Strona główna"
              onClick={onBrandClick}
            >
              {brand ?? (
                <span className="mp-brand">
                  <img src={headerEmblem} alt="" />
                  <span>Aplikacja demo</span>
                </span>
              )}
            </button>
          ) : (
            <a className="mp-emblem-link" aria-label="Strona główna" href={brandHref}>
              {brand ?? (
                <span className="mp-brand">
                  <img src={headerEmblem} alt="" />
                  <span>Aplikacja demo</span>
                </span>
              )}
            </a>
          )}
        </div>
        <div className="mp-header-actions">
          {actions}
          {account}
        </div>
      </header>
    );
  },
);
export interface PortalAccountMenuProps {
  name: string;
  contextLabel?: string;
  items: PortalMenuItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}
export function PortalAccountMenu({
  name,
  contextLabel = 'Profil obywatela',
  open,
  onOpenChange,
  ...props
}: PortalAccountMenuProps) {
  const [shown, setShown] = usePortalState(open, false, onOpenChange);
  return (
    <PortalMenu
      {...props}
      open={shown}
      onOpenChange={setShown}
      label={`Menu konta: ${name}`}
      align="end"
      className="mp-account"
      triggerClassName="mp-account-button"
      listClassName="mp-account-menu"
      trigger={
        <>
          <span className="mp-account-label">
            <strong>{name}</strong>
            <small>{contextLabel}</small>
          </span>
          <span className="mp-account-avatar">
            <PortalIcon name={shown ? 'BJ_user' : 'AJ_user'} size={24} />
          </span>
          <span className="mp-account-chevron">
            <PortalIcon name="AB_chevron_down" size={24} />
          </span>
        </>
      }
    />
  );
}
export interface PortalNavigationItem {
  id: string;
  label: string;
  icon?: PortalIconName | ReactNode;
  href?: string;
  disabled?: boolean;
  children?: PortalNavigationItem[];
  onSelect?: () => void;
  badge?: ReactNode;
}
export interface PortalSidebarProps extends HTMLAttributes<HTMLElement> {
  items: PortalNavigationItem[];
  value?: string;
  onValueChange?: (id: string) => void;
  label?: string;
  mode?: 'static' | 'drawer' | 'persistent';
  onClose?: () => void;
  footer?: ReactNode;
  minimized?: boolean;
}
export const PortalSidebar = /* @__PURE__ */ forwardRef<HTMLElement, PortalSidebarProps>(
  function PortalSidebar(
    {
      items,
      value,
      onValueChange,
      label = 'Nawigacja główna',
      mode = 'static',
      onClose,
      footer,
      minimized,
      className,
      children,
      ...props
    },
    ref,
  ) {
    function entries(list: PortalNavigationItem[]) {
      return list.map((item) => {
        const content = (
          <>
            {item.icon &&
              (typeof item.icon === 'string' ? (
                <PortalIcon name={item.icon as PortalIconName} />
              ) : (
                <span aria-hidden="true">{item.icon}</span>
              ))}
            <span>{item.label}</span>
            {item.badge && <span className="mp-nav-badge">{item.badge}</span>}
          </>
        );
        if (item.children)
          return (
            <details
              className="mp-nav-group"
              key={item.id}
              open={item.children.some((c) => c.id === value) || undefined}
            >
              <summary
                aria-disabled={item.disabled || undefined}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                }}
              >
                {content}
                <PortalIcon name="AB_chevron_down" size={16} />
              </summary>
              <div>{entries(item.children)}</div>
            </details>
          );
        const props = {
          className: value === item.id ? 'mp-nav-selected' : undefined,
          'aria-current': value === item.id ? ('page' as const) : undefined,
          onClick: () => {
            if (!item.disabled) {
              onValueChange?.(item.id);
              item.onSelect?.();
              if (mode === 'drawer') onClose?.();
            }
          },
        };
        return item.href && !item.disabled ? (
          <a key={item.id} href={item.href} {...props}>
            {content}
          </a>
        ) : (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            {...props}
            title={minimized ? item.label : undefined}
          >
            {content}
          </button>
        );
      });
    }
    return (
      <aside
        {...props}
        ref={ref}
        className={portalClass(
          'mp-sidebar',
          `mp-sidebar--${mode}`,
          minimized && 'mp-sidebar--minimized',
          className,
        )}
      >
        {children}
        {onClose && (
          <button
            type="button"
            className="mp-sidebar-close"
            aria-label="Zamknij menu"
            onClick={onClose}
          >
            <PortalIcon name="AE_x_mark" />
            <span>Zamknij</span>
          </button>
        )}
        <nav aria-label={label}>{entries(items)}</nav>
        {footer && <div className="mp-sidebar-footer">{footer}</div>}
      </aside>
    );
  },
);
export interface PortalFooterGroup {
  title: string;
  links: Array<{ label: string; href: string; external?: boolean }>;
}
export interface PortalFooterProps {
  groups?: PortalFooterGroup[];
  appLinks?: Array<{ label: string; href: string; image: string }>;
  appLabel?: string;
  brand?: ReactNode;
  className?: string;
  onBrandClick?: () => void;
}
const footerGroups: PortalFooterGroup[] = [
  {
    title: 'Usługi',
    links: [
      { label: 'Obywatel', href: 'https://www.gov.pl/web/gov/uslugi-dla-obywatela' },
      { label: 'Przedsiębiorca', href: 'https://www.gov.pl/web/gov/uslugi-dla-przedsiebiorcy' },
      { label: 'Urzędnik', href: 'https://www.gov.pl/web/gov/uslugi-dla-urzednika' },
      { label: 'Rolnik', href: 'https://www.gov.pl/web/gov/uslugi-dla-rolnika' },
    ],
  },
  {
    title: 'Prawo',
    links: [
      { label: 'Polityka cookies', href: 'https://www.gov.pl/web/gov/polityka-dotyczaca-cookies' },
      { label: 'Warunki korzystania', href: 'https://www.gov.pl/web/gov/warunki-korzystania' },
      { label: 'Klauzula RODO', href: 'https://www.gov.pl/web/gov/klauzula-rodo' },
      {
        label: 'Deklaracja dostępności',
        href: 'https://www.gov.pl/web/mobywatel-w-aplikacji/deklaracja-dostepnosci-aplikacji-webowej-mobywatel',
      },
    ],
  },
];
export function PortalFooter({
  groups = footerGroups,
  appLinks = [
    {
      label: 'Pobierz aplikację mObywatel z Google Play',
      href: 'https://play.google.com/store/apps/details?id=pl.nask.mobywatel',
      image: googlePlay,
    },
    {
      label: 'Pobierz aplikację mObywatel z App Store',
      href: 'https://apps.apple.com/pl/app/mobywatel/id1339613469',
      image: appStore,
    },
  ],
  appLabel = 'Pobierz aplikację demo',
  brand,
  className = '',
  onBrandClick,
}: PortalFooterProps) {
  return (
    <footer className={`mp-footer ${className}`}>
      <div className="mp-footer-links">
        <div className="mp-footer-links-wrapper">
          {groups.map((group) => (
            <nav className="mp-footer-nav" key={group.title} aria-label={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target={link.external === false ? undefined : '_blank'}
                      rel={link.external === false ? undefined : 'noreferrer'}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        {appLinks.length > 0 && (
          <div className="mp-footer-app">
            <div>
              <p>{appLabel}</p>
              <ul>
                {appLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} aria-label={link.label} target="_blank" rel="noreferrer">
                      <img src={link.image} alt="" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="mp-footer-emblem">
        {onBrandClick ? (
          <button type="button" onClick={onBrandClick} aria-label="Strona główna">
            {brand ?? <PortalLogoInformation />}
          </button>
        ) : (
          (brand ?? <PortalLogoInformation />)
        )}
      </div>
    </footer>
  );
}
export interface PortalShellProps extends HTMLAttributes<HTMLDivElement> {
  navigation: PortalNavigationItem[];
  value?: string;
  onValueChange?: (id: string) => void;
  brand?: ReactNode;
  account?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  sidebarFooter?: ReactNode;
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  onBrandClick?: () => void;
  contentLabel?: string;
}
export function PortalShell({
  navigation,
  value,
  onValueChange,
  brand,
  account,
  headerActions,
  footer,
  sidebarFooter,
  sidebarOpen,
  defaultSidebarOpen,
  onSidebarOpenChange,
  onBrandClick,
  contentLabel = 'Treść strony',
  children,
  className,
  ...props
}: PortalShellProps) {
  const mainId = useId();
  const [open, setOpen] = usePortalState(
    sidebarOpen,
    defaultSidebarOpen ?? false,
    onSidebarOpenChange,
  );
  const [wide, setWide] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const menu = useRef<HTMLElement>(null);
  useEffect(() => {
    setPortalContainer(root.current);
  }, []);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const measure = () => {
      const next = node.getBoundingClientRect().width >= 1536;
      setWide(next);
      if (sidebarOpen === undefined && defaultSidebarOpen === undefined) setOpen(next);
    };
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [sidebarOpen, defaultSidebarOpen, setOpen]);
  const side = (
    <PortalSidebar
      items={navigation}
      value={value}
      onValueChange={onValueChange}
      mode={wide ? 'persistent' : 'drawer'}
      onClose={() => setOpen(false)}
      footer={sidebarFooter}
    />
  );
  return (
    <div
      {...props}
      ref={root}
      className={portalClass('mp-shell', wide && 'mp-wide', open && 'mp-drawer-open', className)}
    >
      <a className="mp-skip-link" href={`#${mainId}`}>
        Przejdź do treści
      </a>
      <PortalHeader
        ref={menu}
        brand={brand}
        account={account}
        actions={headerActions}
        menuOpen={open}
        onMenuClick={() => setOpen(!open)}
        onBrandClick={onBrandClick}
      />
      <div className="mp-layout">
        {wide && open && side}
        <div className="mp-content-body">
          <main id={mainId} className="mp-content" aria-label={contentLabel}>
            {children}
          </main>
          {footer}
        </div>
      </div>
      {!wide && portalContainer && (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal container={portalContainer}>
            <Dialog.Overlay className="mp-shell-overlay" />
            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                menu.current?.querySelector<HTMLButtonElement>('.mp-menu-button')?.focus();
              }}
            >
              <PortalSidebar
                items={navigation}
                value={value}
                onValueChange={onValueChange}
                mode="drawer"
                onClose={() => setOpen(false)}
                footer={sidebarFooter}
              >
                <Dialog.Title className="mp-sr">Nawigacja główna</Dialog.Title>
              </PortalSidebar>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}
export interface PortalPageTitleProps extends HTMLAttributes<HTMLDivElement> {
  heading: ReactNode;
  description?: ReactNode;
  level?: 1 | 2 | 3;
}
export function PortalPageTitle({
  heading,
  description,
  level = 1,
  className,
  ...props
}: PortalPageTitleProps) {
  const Heading = `h${level}` as const;
  return (
    <div {...props} className={portalClass('mp-page-title', className)}>
      <Heading>{heading}</Heading>
      {description && <p>{description}</p>}
    </div>
  );
}
export interface PortalDashboardTileProps extends HTMLAttributes<HTMLElement> {
  heading: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}
export const PortalDashboardTile = /* @__PURE__ */ forwardRef<
  HTMLElement,
  PortalDashboardTileProps
>(function PortalDashboardTile({ heading, icon, action, children, className, ...props }, ref) {
  return (
    <section {...props} ref={ref} className={portalClass('mp-dashboard-tile', className)}>
      <h2>
        {icon}
        {heading}
      </h2>
      {children}
      {action && <div className="mp-tile-action">{action}</div>}
    </section>
  );
});
export interface PortalBannerProps {
  heading?: ReactNode;
  description?: ReactNode;
  image?: string;
  actions?: ReactNode;
  dismissible?: boolean;
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onDismiss?: () => void;
  className?: string;
}
export function PortalBanner({
  heading = 'Ważna informacja',
  description = 'Treść demonstracyjna mDesign. Ten przykład pokazuje kompozycję interfejsu; aplikacja korzystająca z biblioteki dostarcza własne dane i obsługę akcji.',
  image = deliveryBanner,
  actions,
  dismissible = true,
  visible: controlledVisible,
  defaultVisible = true,
  onVisibleChange,
  onDismiss,
  className = '',
}: PortalBannerProps) {
  const [visible, setVisible] = usePortalState(controlledVisible, defaultVisible, onVisibleChange);
  if (!visible) return null;
  return (
    <section className={`mp-delivery-banner ${className}`}>
      {dismissible && (
        <button
          className="mp-banner-close"
          type="button"
          aria-label="Zamknij informację"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
        >
          <PortalIcon name="remove-thin" size={12} />
        </button>
      )}
      <div className="mp-banner-layout">
        <div className="mp-banner-content">
          <h2>{heading}</h2>
          <p>{description}</p>
          {actions && <div className="mp-banner-actions">{actions}</div>}
        </div>
        {image && (
          <div className="mp-banner-image">
            <img src={image} alt="" />
          </div>
        )}
      </div>
    </section>
  );
}
export interface PortalServiceLink {
  id: string;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}
export function PortalServiceLinks({
  items,
  label = 'Usługi',
}: {
  items: PortalServiceLink[];
  label?: string;
}) {
  return (
    <nav className="mp-service-links" aria-label={label}>
      {items.map((item) =>
        item.href ? (
          <a key={item.id} href={item.href}>
            {item.label}
            <PortalIcon name="AB_chevron_right" size={20} />
          </a>
        ) : (
          <button type="button" disabled={item.disabled} key={item.id} onClick={item.onClick}>
            <span>{item.label}</span>
            <PortalIcon name="AB_chevron_right" size={20} />
          </button>
        ),
      )}
    </nav>
  );
}
export interface PortalCatalogItem {
  id: string;
  title: string;
  description: ReactNode;
  action: ReactNode;
  more?: ReactNode;
}
export function PortalServiceCatalog({
  items,
  information,
  heading,
  description,
  className = '',
}: {
  items: PortalCatalogItem[];
  information?: ReactNode;
  heading?: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mp-catalog ${className}`}>
      {heading && <PortalPageTitle heading={heading} description={description} />}
      <div className="mp-catalog-body">
        {information && (
          <div className="mp-info-message">
            <PortalIcon name="AA_information_circle" />
            <div>{information}</div>
          </div>
        )}
        <div className="mp-catalog-list">
          {items.map((item) => (
            <article className="mp-catalog-card" key={item.id}>
              <h2>{item.title}</h2>
              <div>
                <p>
                  {item.description} {item.more}
                </p>
                {item.action}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function PortalDashboard({
  banner,
  cases,
  payments: paymentContent,
  catalog: catalogContent,
  popular: popularContent,
  calendar: calendarContent,
}: {
  banner?: ReactNode;
  cases: ReactNode;
  payments: ReactNode;
  catalog: ReactNode;
  popular: ReactNode;
  calendar: ReactNode;
}) {
  return (
    <div className="mp-home-grid">
      <div className="mp-home-column">
        {banner}
        <div className="mp-home-main">
          {cases}
          {paymentContent}
          <div className="mp-services-columns">
            {catalogContent}
            {popularContent}
          </div>
        </div>
      </div>
      <div className="mp-calendar-column">{calendarContent}</div>
    </div>
  );
}
export function PortalEmptyState({
  variant = 'cases',
  children,
  onInbox,
  onHistory,
}: {
  variant?: 'cases' | 'payments';
  children?: ReactNode;
  onInbox?: () => void;
  onHistory?: () => void;
}) {
  return (
    <div className={variant === 'cases' ? 'mp-empty-cases' : 'mp-empty-payments'}>
      <PortalIcon name="AA_information_circle" size={36} className="mp-empty-state-icon" />
      {children ??
        (variant === 'cases' ? (
          <p>
            Tu zobaczysz szczegóły nowych spraw załatwianych online. Poprzednie sprawy znajdziesz w{' '}
            {onInbox ? (
              <button type="button" onClick={onInbox}>
                Twoich skrzynkach
              </button>
            ) : (
              'Twoich skrzynkach'
            )}{' '}
            lub{' '}
            {onHistory ? (
              <button type="button" onClick={onHistory}>
                Historii spraw
              </button>
            ) : (
              'Historii spraw'
            )}
            .
          </p>
        ) : (
          <>
            <p>Wszystkie zobowiązania zostały opłacone.</p>
            <p>
              Plik z potwierdzeniem przelewu znajdziesz w{' '}
              {onHistory ? (
                <button type="button" onClick={onHistory}>
                  Historii płatności
                </button>
              ) : (
                'Historii płatności'
              )}
              .
            </p>
          </>
        ))}
    </div>
  );
}
