import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { DocumentArtwork } from './DocumentArtwork.js';
import type { DocumentArtworkVariant } from './DocumentArtwork.js';
import { NativeIcon } from './NativeIcon.js';

export interface NavigationItem {
  value: string;
  label: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}
export interface BottomNavigationProps {
  items: NavigationItem[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  className?: string;
  homeIndicator?: boolean;
  itemWidth?: number;
}
export function BottomNavigation({
  items,
  value,
  onValueChange,
  label = 'Nawigacja główna',
  className = '',
  homeIndicator = false,
  itemWidth,
}: BottomNavigationProps) {
  const spaced = typeof itemWidth === 'number' && Number.isFinite(itemWidth) && itemWidth > 0;
  return (
    <nav
      className={`m-bottom-navigation ${spaced ? 'm-bottom-navigation--spaced' : ''} ${className}`}
      aria-label={label}
      style={spaced ? ({ '--m-nav-item-width': `${itemWidth}px` } as CSSProperties) : undefined}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          disabled={item.disabled}
          aria-current={item.value === value ? 'page' : undefined}
          onClick={() => onValueChange(item.value)}
        >
          <span className="m-navigation-icon">
            <span aria-hidden="true">
              {item.value === value ? (item.activeIcon ?? item.icon) : item.icon}
            </span>
            {item.badge && <span className="m-navigation-badge">{item.badge}</span>}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
      {homeIndicator && <span className="m-bottom-navigation-home-indicator" aria-hidden="true" />}
    </nav>
  );
}

export interface SidebarProps extends Omit<BottomNavigationProps, 'homeIndicator' | 'itemWidth'> {
  title?: ReactNode;
  footer?: ReactNode;
  mode?: 'static' | 'drawer' | 'persistent';
  onClose?: () => void;
}
export function Sidebar({
  items,
  value,
  onValueChange,
  label = 'Nawigacja boczna',
  title,
  footer,
  className = '',
  mode = 'static',
  onClose,
}: SidebarProps) {
  return (
    <aside className={`m-sidebar ${className}`} data-mode={mode}>
      {mode === 'drawer' && onClose && (
        <button
          className="m-sidebar-close"
          type="button"
          onClick={onClose}
          aria-label="Zamknij nawigację"
        >
          <NativeIcon name="close" size={24} />
        </button>
      )}
      {title && <div className="m-sidebar-title">{title}</div>}
      <nav aria-label={label}>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={item.disabled}
            aria-current={item.value === value ? 'page' : undefined}
            onClick={() => onValueChange(item.value)}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="m-navigation-count">{item.badge}</span>}
          </button>
        ))}
      </nav>
      {footer && <div className="m-sidebar-footer">{footer}</div>}
    </aside>
  );
}

export interface AppHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  brand?: ReactNode;
  title?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
}
export function AppHeader({
  brand,
  title,
  leading,
  actions,
  className = '',
  ...props
}: AppHeaderProps) {
  return (
    <header {...props} className={`m-app-header ${className}`}>
      {leading && <div className="m-app-header-leading">{leading}</div>}
      {brand && <div className="m-app-header-brand">{brand}</div>}
      {title && <div className="m-app-header-title">{title}</div>}
      {actions && <div className="m-app-header-actions">{actions}</div>}
    </header>
  );
}

export interface DocumentTileProps {
  title: string;
  icon: ReactNode;
  tone?: 'blue' | 'teal' | 'purple' | 'orange';
  artwork?: DocumentArtworkVariant;
  backgroundImage?: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}
/** Mirrors SmallDocumentCard: callers supply the document's own background artwork. */
export function DocumentTile({
  title,
  icon,
  tone = 'blue',
  artwork,
  backgroundImage,
  description,
  onClick,
  className = '',
  style,
}: DocumentTileProps) {
  const content = (
    <>
      {artwork ? (
        <DocumentArtwork variant={artwork} />
      ) : (
        backgroundImage && (
          <img className="m-document-tile-background" src={backgroundImage} alt="" />
        )
      )}
      <span className="m-document-tile-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="m-document-tile-copy">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={`m-document-tile m-document-tile--${tone} ${className}`}
      style={style}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <article className={`m-document-tile m-document-tile--${tone} ${className}`} style={style}>
      {content}
    </article>
  );
}

export interface DocumentCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  title: string;
  backgroundImage: string;
  trailing?: ReactNode;
  onClick?: () => void;
}
/** Native DocumentCard: height226, top8/side16, title17 semibold and trailing44. */
export function DocumentCard({
  title,
  backgroundImage,
  trailing,
  onClick,
  className = '',
  ...props
}: DocumentCardProps) {
  const content = (
    <>
      <img className="m-document-card-background" src={backgroundImage} alt="" />
      <span className="m-document-card-header">
        <strong>
          <span>{title}</span>
        </strong>
        {trailing && (
          <span className="m-document-card-trailing" aria-hidden="true">
            {trailing}
          </span>
        )}
      </span>
    </>
  );
  return onClick ? (
    <button {...props} type="button" className={`m-document-card ${className}`} onClick={onClick}>
      {content}
    </button>
  ) : (
    <article {...props} className={`m-document-card ${className}`}>
      {content}
    </article>
  );
}
