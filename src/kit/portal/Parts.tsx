import { forwardRef, useId } from 'react';
import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ExternalLink, Info } from './glyphs.js';
import { Spinner, Tooltip } from '../components.js';
import { PortalIcon } from './PortalIcon.js';
import { usePortalState, portalClass } from './state.js';
import emblem from './assets/demo-mark.svg';
export interface PortalPanelProps extends HTMLAttributes<HTMLElement> {
  collapsible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  heading?: ReactNode;
  footer?: ReactNode;
  disabled?: boolean;
  composed?: boolean;
}
export const PortalPanel = /* @__PURE__ */ forwardRef<HTMLElement, PortalPanelProps>(
  function PortalPanel(
    {
      collapsible,
      open,
      defaultOpen = true,
      onOpenChange,
      heading,
      footer,
      disabled,
      composed,
      children,
      className,
      ...props
    },
    ref,
  ) {
    const [shown, setShown] = usePortalState(open, defaultOpen, onOpenChange);
    const id = useId();
    return (
      <section {...props} ref={ref} className={portalClass('mp-panel', className)}>
        {heading && (
          <PortalPanelHeader>
            {collapsible ? (
              <button
                type="button"
                disabled={disabled}
                aria-expanded={shown}
                aria-controls={id}
                onClick={() => setShown(!shown)}
              >
                {heading}
                <ChevronDown
                  size={20}
                  style={{ transform: shown ? 'rotate(180deg)' : undefined }}
                />
              </button>
            ) : (
              heading
            )}
          </PortalPanelHeader>
        )}
        <div id={id} hidden={!!collapsible && !shown}>
          {composed ? children : <PortalPanelContent>{children}</PortalPanelContent>}
          {footer && <PortalPanelFooter>{footer}</PortalPanelFooter>}
        </div>
      </section>
    );
  },
);
export const PortalPanelHeader = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function PortalPanelHeader({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={portalClass('mp-panel-header', className)} />;
});
export const PortalPanelContent = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function PortalPanelContent({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={portalClass('mp-panel-content', className)} />;
});
export const PortalPanelFooter = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function PortalPanelFooter({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={portalClass('mp-panel-footer', className)} />;
});
export const PortalCard = /* @__PURE__ */ forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement> & { heading?: ReactNode; footer?: ReactNode; composed?: boolean }
>(function PortalCard({ heading, footer, composed, children, className, ...props }, ref) {
  return (
    <article {...props} ref={ref} className={portalClass('mp-card', className)}>
      {heading && <PortalCardHeader>{heading}</PortalCardHeader>}
      {composed ? children : <PortalCardContent>{children}</PortalCardContent>}
      {footer && <PortalCardFooter>{footer}</PortalCardFooter>}
    </article>
  );
});
export const PortalCardHeader = PortalPanelHeader;
export const PortalCardContent = PortalPanelContent;
export const PortalCardFooter = PortalPanelFooter;
export interface PortalStatusTextProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  icon?: boolean;
  live?: 'off' | 'polite' | 'assertive';
}
export function PortalStatusText({
  tone = 'info',
  icon = true,
  live = 'assertive',
  className,
  children,
  ...props
}: PortalStatusTextProps) {
  const Symbol =
    tone === 'success'
      ? CheckCircle2
      : tone === 'danger' || tone === 'warning'
        ? AlertCircle
        : Info;
  return (
    <div
      {...props}
      className={portalClass('mp-status-text', `mp-status-text--${tone}`, className)}
      aria-live={live}
    >
      {icon && <Symbol size={24} aria-hidden="true" />}
      {children}
    </div>
  );
}
export interface PortalErrorViewProps extends HTMLAttributes<HTMLElement> {
  code?: string;
  heading: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}
export function PortalErrorView({
  code,
  heading,
  description,
  icon,
  actions,
  className,
  ...props
}: PortalErrorViewProps) {
  return (
    <section {...props} className={portalClass('mp-error-view', className)}>
      {icon ?? <AlertCircle className="mp-error-icon" size={64} aria-hidden="true" />}
      {code && <span className="mp-error-code">{code}</span>}
      <h2>{heading}</h2>
      {description && <p>{description}</p>}
      {actions && <div className="mp-error-actions">{actions}</div>}
    </section>
  );
}
export interface PortalProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  label: string;
  size?: 'small' | 'large';
  indeterminate?: boolean;
  buffer?: number;
}
export function PortalProgress({
  value = 0,
  max = 100,
  label,
  size = 'large',
  indeterminate,
  buffer,
  className,
  ...props
}: PortalProgressProps) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const bounded = Math.max(0, Math.min(limit, Number.isFinite(value) ? value : 0));
  const percent = (bounded / limit) * 100;
  return (
    <div
      {...props}
      className={portalClass(
        'mp-progress',
        `mp-progress--${size}`,
        indeterminate && 'mp-progress--indeterminate',
        className,
      )}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={indeterminate ? undefined : bounded}
      aria-valuetext={indeterminate ? 'Ładowanie' : undefined}
    >
      {buffer !== undefined && (
        <i style={{ width: `${Math.max(percent, Math.min(100, buffer))}%` }} />
      )}
      <span style={{ width: indeterminate ? '35%' : `${percent}%` }} />
    </div>
  );
}
export interface PortalLoaderProps extends HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  label?: string;
  overlay?: boolean;
  size?: number;
}
export function PortalLoader({
  loading = true,
  label = 'Ładowanie',
  overlay = false,
  size = 32,
  children,
  className,
  ...props
}: PortalLoaderProps) {
  return (
    <div
      {...props}
      className={portalClass('mp-loader', overlay && 'mp-loader--overlay', className)}
      aria-busy={loading || undefined}
    >
      {children}
      {loading && (
        <div className="mp-loader-indicator">
          <Spinner label={label} size={size} />
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}
export const PortalExternalLink = /* @__PURE__ */ forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { showIcon?: boolean }
>(function PortalExternalLink(
  { children, showIcon = true, target = '_blank', rel, className, ...props },
  ref,
) {
  return (
    <a
      {...props}
      ref={ref}
      className={portalClass('mp-link', className)}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
    >
      {children}
      {showIcon && <ExternalLink size={18} aria-hidden="true" />}
      {target === '_blank' && <span className="mp-sr"> (otwiera się w nowej karcie)</span>}
    </a>
  );
});
export function PortalInfoTip({
  label = 'Więcej informacji',
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <Tooltip content={children}>
      <button type="button" className="mp-plain-button" aria-label={label}>
        <Info size={24} />
      </button>
    </Tooltip>
  );
}
export function PortalLogoInformation({
  label = 'Aplikacja demo',
  src = emblem,
  alt = 'Symbol aplikacji demonstracyjnej',
  height = 48,
  className = '',
  style,
}: {
  label?: ReactNode;
  src?: string;
  alt?: string;
  height?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`mp-logo-information ${className}`} style={style}>
      <img src={src} alt={alt} style={{ height }} />
      <span>{label}</span>
    </span>
  );
}
export interface PortalBreadcrumbItem {
  id: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
  current?: boolean;
  disabled?: boolean;
  composed?: boolean;
}
export interface PortalBreadcrumbsProps {
  items: PortalBreadcrumbItem[];
  label?: string;
  variant?: 'path' | 'back';
  className?: string;
}
export function PortalBreadcrumbs({
  items,
  label = 'Ścieżka nawigacji',
  variant = 'path',
  className = '',
}: PortalBreadcrumbsProps) {
  return (
    <nav
      aria-label={label}
      className={portalClass(
        'mp-breadcrumbs',
        variant === 'back' && 'mp-breadcrumbs--back',
        className,
      )}
    >
      <ol>
        {items.map((item, index) => {
          const current =
            item.current ?? (index === items.length - 1 && !item.href && !item.onClick);
          const content = (
            <>
              {item.icon ??
                (variant === 'back' && index === 0 ? (
                  <PortalIcon name="arrow-go-back" size={16} />
                ) : null)}
              {item.label}
            </>
          );
          return (
            <li key={item.id} aria-current={current ? 'page' : undefined}>
              {index > 0 && <PortalIcon name="AB_chevron_right" size={16} />}
              <span>
                {current || item.disabled ? (
                  <span aria-disabled={item.disabled || undefined}>{content}</span>
                ) : item.href ? (
                  <a href={item.href} onClick={item.onClick}>
                    {content}
                  </a>
                ) : (
                  <button type="button" onClick={item.onClick}>
                    {content}
                  </button>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface PortalMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  icon?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
}
export const PortalMessage = /* @__PURE__ */ forwardRef<HTMLDivElement, PortalMessageProps>(
  function PortalMessage(
    { title, tone = 'info', icon, closable, onClose, className, children, ...props },
    ref,
  ) {
    const [visible, setVisible] = usePortalState<boolean>(undefined, true);
    if (!visible) return null;
    return (
      <div
        {...props}
        ref={ref}
        className={portalClass('mp-message', `mp-message--${tone}`, className)}
        role={props.role ?? (tone === 'danger' ? 'alert' : 'status')}
      >
        {icon ?? (
          <PortalIcon
            name={
              tone === 'success'
                ? 'AA_check_circle'
                : tone === 'warning' || tone === 'danger'
                  ? 'AA_exclamation_triangle'
                  : 'AA_information_circle'
            }
          />
        )}
        <div>
          {title && <strong>{title}</strong>}
          {children}
        </div>
        {closable && (
          <button
            type="button"
            className="mp-plain-button"
            aria-label="Zamknij komunikat"
            onClick={() => {
              setVisible(false);
              onClose?.();
            }}
          >
            <PortalIcon name="AE_x_mark" />
          </button>
        )}
      </div>
    );
  },
);
