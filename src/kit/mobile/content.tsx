import { useId, useRef } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { Badge } from '../components.js';
import type { Tone } from '../components.js';
import { OfficialIcon } from '../OfficialIcon.js';
import { NativeIcon } from '../NativeIcon.js';
import { mobileClass, safeHref, useMobileValue } from './shared.js';

export interface MobileTextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}
export function MobileTextButton({
  destructive,
  className,
  children,
  type = 'button',
  ...props
}: MobileTextButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={mobileClass('text-button', className)}
      data-destructive={destructive}
    >
      {children}
    </button>
  );
}
export interface MobileLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  disabled?: boolean;
}
export function MobileLink({
  href = '',
  disabled,
  className,
  onClick,
  children,
  target,
  rel,
  ...props
}: MobileLinkProps) {
  return (
    <a
      {...props}
      href={disabled ? undefined : safeHref(href)}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      className={mobileClass('link', className)}
      onClick={(e) => {
        if (disabled) e.preventDefault();
        else onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
export interface RichTextSegment {
  type: 'text' | 'link' | 'source' | 'unknown';
  value: string;
  url?: string;
}
export function RichText({
  segments,
  onUrlClick,
  className,
}: {
  segments: RichTextSegment[];
  onUrlClick?: (url: string) => void;
  className?: string;
}) {
  return (
    <span className={mobileClass('rich-text', className)}>
      {segments.map((s, i) =>
        (s.type === 'link' || s.type === 'source') && s.url ? (
          <MobileLink
            key={i}
            href={s.url}
            onClick={
              onUrlClick
                ? (e) => {
                    e.preventDefault();
                    onUrlClick(s.url!);
                  }
                : undefined
            }
          >
            {s.value}
          </MobileLink>
        ) : (
          <span key={i}>{s.value}</span>
        ),
      )}
    </span>
  );
}
export function NotificationBadge({
  label = 'Nowe powiadomienie',
  count,
  className,
}: {
  label?: string;
  count?: number;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label={count === undefined ? label : label + ': ' + count}
      className={mobileClass('notification-badge', className)}
    >
      {count === undefined ? null : count > 99 ? '99+' : Math.max(0, count)}
    </span>
  );
}
export interface IconSurfaceProps {
  children: ReactNode;
  size?: 24 | 32 | 48 | 64 | 72 | 80 | 96;
  iconSize?: number;
  shape?: 'circle' | 'square' | 'rounded';
  background?: string;
  color?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}
export function IconSurface({
  children,
  size = 48,
  iconSize = 24,
  shape = 'circle',
  background = 'var(--m-brand-soft)',
  color = 'var(--m-brand)',
  disabled,
  className,
  label,
}: IconSurfaceProps) {
  return (
    <span
      className={mobileClass('icon-surface', className)}
      data-shape={shape}
      data-disabled={disabled}
      style={
        {
          width: size,
          height: size,
          background,
          color,
          '--m-mobile-icon-size': iconSize + 'px',
        } as CSSProperties
      }
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={!label || undefined}
    >
      {children}
    </span>
  );
}
export interface ContentBoxProps extends HTMLAttributes<HTMLDivElement> {
  shadow?: 'none' | 'light200' | 'light600';
  padding?: number;
}
export function MobileContentBox({
  shadow = 'light200',
  padding = 16,
  className,
  style,
  children,
  ...props
}: ContentBoxProps) {
  return (
    <div
      {...props}
      className={mobileClass('content-box', className)}
      data-shadow={shadow}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}
export interface MobileHeaderProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  iconColor?: string;
  iconBackground?: string;
  children?: ReactNode;
  className?: string;
}
export function MobileHeader({
  icon,
  title,
  description,
  iconColor,
  iconBackground,
  children,
  className,
}: MobileHeaderProps) {
  return (
    <header className={mobileClass('hero-header', className)}>
      <IconSurface size={72} iconSize={40} color={iconColor} background={iconBackground}>
        {icon}
      </IconSurface>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children && <div className="m-mobile-header-content">{children}</div>}
    </header>
  );
}
export function ListHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={mobileClass('list-header', className)}>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function SectionHeader({
  title,
  children,
  action,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={mobileClass('section-header', className)}>
      <div>
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
export interface MobileTopAppBarProps {
  title: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'logo' | 'sygnet';
  logo?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  progress?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  alignment?: 'start' | 'center';
  collapsed?: boolean;
  collapseFraction?: number;
  className?: string;
}
export function MobileTopAppBar({
  title,
  size = 'small',
  variant = 'default',
  logo,
  leading,
  actions,
  progress,
  onBack,
  backLabel = 'Wróć',
  alignment = 'center',
  collapsed,
  collapseFraction = 0,
  className,
}: MobileTopAppBarProps) {
  const compact = collapsed ?? collapseFraction > 0.75;
  const resolvedSize = variant === 'default' ? size : 'small';
  const titleHidden = resolvedSize !== 'small' && !compact && collapseFraction >= 0.35;
  return (
    <header
      className={mobileClass('top-app-bar', className)}
      data-size={compact ? 'small' : resolvedSize}
      data-alignment={alignment}
    >
      <div className="m-mobile-top-bar-line">
        <div>
          {variant === 'sygnet' ? (
            (logo ?? leading)
          ) : onBack ? (
            <button type="button" onClick={onBack} aria-label={backLabel}>
              <NativeIcon name="chevron-left" size={24} />
              <span>{backLabel}</span>
            </button>
          ) : (
            leading
          )}
        </div>
        {variant === 'logo' ? (
          <div className="m-mobile-top-bar-logo" aria-label={title}>
            {logo ?? title}
          </div>
        ) : variant === 'sygnet' ? (
          <h1 className="m-mobile-sr">{title}</h1>
        ) : (
          (resolvedSize === 'small' || compact) && <h1>{title}</h1>
        )}
        <div>{actions}</div>
      </div>
      {resolvedSize !== 'small' && !compact && (
        <h1 style={{ opacity: titleHidden ? 0 : 1 }}>{title}</h1>
      )}
      {progress}
    </header>
  );
}
export interface ShortcutTileProps {
  icon: ReactNode;
  title: string;
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}
export function ShortcutTile({
  icon,
  title,
  color,
  onClick,
  disabled,
  className,
}: ShortcutTileProps) {
  const contents = (
    <>
      <IconSurface size={48} iconSize={24} color={color} background="var(--m-surface)">
        {icon}
      </IconSurface>
      <span>{title}</span>
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={mobileClass('shortcut-tile', className)}
      disabled={disabled}
      onClick={onClick}
    >
      {contents}
    </button>
  ) : (
    <div className={mobileClass('shortcut-tile', className)}>{contents}</div>
  );
}
export interface SmallServiceCardProps extends ShortcutTileProps {
  backgroundImage?: string;
}
export function SmallServiceCard({
  icon,
  title,
  color,
  onClick,
  disabled,
  className,
  backgroundImage,
}: SmallServiceCardProps) {
  const contents = (
    <>
      <span className="m-mobile-small-card-art" data-custom-background={!!backgroundImage}>
        {backgroundImage && <img src={backgroundImage} alt="" />}
        <IconSurface
          size={80}
          iconSize={32}
          shape="rounded"
          color={color}
          background={backgroundImage ? 'transparent' : 'var(--m-surface)'}
        >
          {icon}
        </IconSurface>
      </span>
      <span>{title}</span>
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={mobileClass('small-service-card', className)}
      disabled={disabled}
      onClick={onClick}
    >
      {contents}
    </button>
  ) : (
    <div className={mobileClass('small-service-card', className)}>{contents}</div>
  );
}
export function CardStack({
  children,
  spacing = 40,
  cardHeight = 226,
  label = 'Dokumenty',
  className,
}: {
  children: ReactNode[];
  spacing?: number;
  cardHeight?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={mobileClass('card-stack', className)}
      role="group"
      aria-label={label}
      style={{
        height: children.length ? cardHeight + Math.max(0, children.length - 1) * spacing : 0,
      }}
    >
      {children.map((c, i) => (
        <div key={i} style={{ top: i * spacing, zIndex: i }}>
          {c}
        </div>
      ))}
    </div>
  );
}
export interface InfoRowProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  bullet?: boolean;
  className?: string;
}
export function InfoRow({ title, description, icon, bullet, className }: InfoRowProps) {
  return (
    <div className={mobileClass('info-row', className)}>
      {bullet ? (
        <span className="m-mobile-bullet" aria-hidden="true">
          •
        </span>
      ) : (
        icon && (
          <span className="m-mobile-info-icon" aria-hidden="true">
            {icon}
          </span>
        )
      )}
      <div>
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}
export function InfoRowList({ items, className }: { items: InfoRowProps[]; className?: string }) {
  return (
    <ul className={mobileClass('info-row-list', className)}>
      {items.map((item, i) => (
        <li key={i}>
          <InfoRow {...item} />
        </li>
      ))}
    </ul>
  );
}
export function BulletPoint({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={mobileClass('bullet-point', className)}>
      <span aria-hidden="true">•</span>
      <div>{children}</div>
    </div>
  );
}
export interface NativeSingleCardProps {
  title: ReactNode;
  description?: ReactNode;
  descriptions?: ReactNode[];
  info?: ReactNode;
  reversed?: boolean;
  icon?: ReactNode;
  image?: { src: string; alt: string };
  iconAlign?: 'center' | 'title';
  iconSize?: number;
  badge?: ReactNode;
  trailing?: ReactNode;
  leadingAction?: ReactNode;
  onIconClick?: () => void;
  iconLabel?: string;
  onClick?: () => void;
  variant?: 'info' | 'clickable' | 'checkbox' | 'radio' | 'delete';
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  name?: string;
  value?: string;
  disabled?: boolean;
  drawBorder?: boolean;
  leadingStyle?: 'icon' | 'image' | 'placeholder' | 'clickable' | 'destructive' | 'custom';
  imageSize?: number;
  contentOnly?: boolean;
  draggable?: boolean;
  onDragStart?: HTMLAttributes<HTMLDivElement>['onDragStart'];
  titleColor?: string;
  className?: string;
}
export function NativeSingleCard({
  title,
  description,
  descriptions,
  info,
  reversed,
  icon,
  image,
  iconAlign = 'center',
  iconSize = 24,
  badge,
  trailing,
  leadingAction,
  onIconClick,
  iconLabel = 'Więcej informacji',
  onClick,
  variant = onClick ? 'clickable' : 'info',
  selected,
  onSelectedChange,
  name,
  value,
  disabled,
  drawBorder = true,
  leadingStyle = image ? 'image' : 'icon',
  imageSize = 44,
  contentOnly = false,
  draggable,
  onDragStart,
  titleColor,
  className,
}: NativeSingleCardProps) {
  const id = useId();
  const selectable = variant === 'checkbox' || variant === 'radio';
  const media = image ? <img src={image.src} alt={image.alt} /> : icon;
  const copy = (
    <span className="m-mobile-single-copy" data-reversed={reversed}>
      {info && <small>{info}</small>}
      <strong style={{ color: titleColor }}>{title}</strong>
      {description && <span>{description}</span>}
      {descriptions?.map((d, i) => (
        <span key={i}>{d}</span>
      ))}
      {badge && <span className="m-mobile-single-badge">{badge}</span>}
    </span>
  );
  const visual = (
    <>
      {variant === 'delete' && (
        <OfficialIcon
          name="Icons/Outline/Symbols/AA002_Delete/AA002_Delete"
          className="m-mobile-delete-symbol"
          size={24}
        />
      )}{' '}
      {media && !onIconClick && (
        <span
          className="m-mobile-single-media"
          data-align={iconAlign}
          data-leading-style={leadingStyle}
          style={{
            width:
              leadingStyle === 'custom'
                ? undefined
                : image
                  ? imageSize
                  : leadingStyle === 'placeholder'
                    ? 44
                    : iconSize,
            height:
              leadingStyle === 'custom'
                ? undefined
                : image
                  ? imageSize
                  : leadingStyle === 'placeholder'
                    ? 44
                    : iconSize,
          }}
        >
          {media}
        </span>
      )}
      {copy}
      {trailing ?? (variant === 'clickable' ? <NativeIcon name="chevron-right" size={24} /> : null)}
    </>
  );
  return (
    <div
      className={mobileClass('single-card', className)}
      data-variant={variant}
      data-disabled={disabled}
      data-selected={selected}
      data-border={drawBorder}
      data-leading-style={leadingStyle}
      data-content-only={contentOnly}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {draggable && (
        <span className="m-mobile-drag-handle" aria-hidden="true">
          ⠿
        </span>
      )}
      {leadingAction}
      {onIconClick && icon ? (
        <button
          type="button"
          className="m-mobile-single-icon-action"
          disabled={disabled}
          onClick={onIconClick}
          aria-label={iconLabel}
        >
          {icon}
        </button>
      ) : null}
      {selectable ? (
        <label className="m-mobile-single-main" htmlFor={id}>
          {visual}
          <input
            id={id}
            type={variant}
            name={name}
            value={value}
            checked={selected ?? false}
            disabled={disabled}
            onChange={(e) => onSelectedChange?.(e.target.checked)}
          />
        </label>
      ) : onClick ? (
        <button
          type="button"
          className="m-mobile-single-main"
          disabled={disabled}
          onClick={onClick}
        >
          {visual}
        </button>
      ) : (
        <div className="m-mobile-single-main">{visual}</div>
      )}
    </div>
  );
}
export interface CardListProps {
  items: NativeSingleCardProps[];
  label?: string;
  maxHeight?: number;
  className?: string;
}
export function CardList({ items, label = 'Lista', maxHeight, className }: CardListProps) {
  return (
    <div
      className={mobileClass('card-list', className)}
      role="list"
      aria-label={label}
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
    >
      {items.map((item, i) => (
        <div role="listitem" key={item.value ?? i}>
          <NativeSingleCard {...item} />
        </div>
      ))}
    </div>
  );
}
export interface DocumentRowProps {
  title: ReactNode;
  description?: ReactNode;
  thumbnail: ReactNode;
  onClick?: () => void;
  trailing?: ReactNode;
  disabled?: boolean;
  className?: string;
}
export function DocumentRow({ thumbnail, ...props }: DocumentRowProps) {
  return (
    <NativeSingleCard
      {...props}
      icon={<span className="m-mobile-document-thumbnail">{thumbnail}</span>}
      iconSize={48}
    />
  );
}
export interface TimelineItem {
  header: string;
  title: ReactNode;
  descriptions?: ReactNode[];
}
export function Timeline({
  items,
  label = 'Historia',
  className,
}: {
  items: TimelineItem[];
  label?: string;
  className?: string;
}) {
  return (
    <ol className={mobileClass('timeline', className)} aria-label={label}>
      {items.map((item, i) => (
        <li key={i}>
          <div className="m-mobile-timeline-header">
            <span aria-hidden="true" />
            <span>{item.header}</span>
          </div>
          <div className="m-mobile-timeline-body">
            <strong>{item.title}</strong>
            {item.descriptions?.map((d, j) => (
              <p key={j}>{d}</p>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
export interface MobileOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export function SegmentedControl({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  className,
}: {
  label: string;
  items: MobileOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const [selected, setSelected] = useMobileValue(
    value,
    defaultValue ?? items[0]?.value ?? '',
    onValueChange,
  );
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = items.map((o, i) => (!o.disabled ? i : -1)).filter((i) => i >= 0);
  const activeIndex = items.findIndex((o) => o.value === selected && !o.disabled);
  const tabStop = activeIndex >= 0 ? activeIndex : enabled[0];
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={mobileClass('segmented-control', className)}
    >
      {items.map((item, i) => (
        <button
          key={item.value}
          ref={(node) => {
            refs.current[i] = node;
          }}
          role="radio"
          type="button"
          aria-checked={selected === item.value}
          disabled={item.disabled}
          tabIndex={i === tabStop ? 0 : -1}
          onClick={() => setSelected(item.value)}
          onKeyDown={(e) => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
              e.preventDefault();
              const pos = enabled.indexOf(i);
              const index =
                e.key === 'Home'
                  ? enabled[0]
                  : e.key === 'End'
                    ? enabled.at(-1)
                    : enabled[
                        (pos + (e.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length
                      ];
              if (index !== undefined) {
                setSelected(items[index].value);
                refs.current[index]?.focus();
              }
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export function FilterControl({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  className,
}: {
  label: string;
  items: MobileOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const [selected, setSelected] = useMobileValue(
    value,
    defaultValue ?? items[0]?.value ?? '',
    onValueChange,
  );
  return (
    <div className={mobileClass('filter-control', className)} aria-label={label} role="group">
      {items.map((item) => (
        <button
          type="button"
          disabled={item.disabled}
          key={item.value}
          aria-pressed={selected === item.value}
          onClick={() => setSelected(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export interface BannerProps {
  tone?: 'info' | 'danger';
  emphasis?: 'low' | 'high';
  title?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
}
export function MobileBanner({
  tone = 'info',
  emphasis = 'low',
  title,
  children,
  action,
  onDismiss,
  dismissLabel = 'Zamknij komunikat',
  className,
}: BannerProps) {
  return (
    <aside
      className={mobileClass('banner', className)}
      data-tone={tone}
      data-emphasis={emphasis}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <NativeIcon
        name={tone === 'danger' ? 'support-error' : 'support-info'}
        size={24}
        monochrome
        className="m-mobile-banner-icon"
      />
      <div>
        {title && <strong>{title}</strong>}
        <div>{children}</div>
        {action}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label={dismissLabel}>
          <NativeIcon name="close" size={24} />
        </button>
      )}
    </aside>
  );
}
export function MobileStatusBadge({
  tone = 'neutral',
  children,
  bordered = false,
  dot = false,
}: {
  tone?: Tone;
  children: ReactNode;
  bordered?: boolean;
  dot?: boolean;
}) {
  return (
    <Badge tone={tone} variant={bordered ? 'bordered' : 'status'} dot={dot}>
      {children}
    </Badge>
  );
}
