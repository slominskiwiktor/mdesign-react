import { PortalPopupLayer, usePortalPopup } from './popup.js';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Check, ChevronDown, Info, CheckCircle2, AlertTriangle, AlertCircle, X } from './glyphs.js';
import { usePortalState, portalClass } from './state.js';
export interface PortalMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  type?: 'action' | 'checkbox' | 'radio' | 'separator' | 'group';
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: () => void;
  href?: string;
  closeOnSelect?: boolean;
}
export interface PortalMenuProps {
  label: string;
  items: PortalMenuItem[];
  trigger?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  align?: 'start' | 'end';
  className?: string;
  triggerClassName?: string;
  listClassName?: string;
}
export function PortalMenu({
  label,
  items,
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled,
  align = 'start',
  className,
  triggerClassName,
  listClassName,
}: PortalMenuProps) {
  const [shown, setShown] = usePortalState(open, defaultOpen, onOpenChange);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();
  const search = useRef({ text: '', at: 0 });
  const visible = shown && !disabled;
  const popup = usePortalPopup(visible, align);
  useEffect(() => {
    if (disabled && shown) setShown(false);
  }, [disabled, shown, setShown]);
  const close = useCallback(
    (restore = false) => {
      setShown(false);
      if (restore) button.current?.focus();
    },
    [setShown],
  );
  useEffect(() => {
    if (!visible) return;
    const outside = (event: PointerEvent) => {
      if (
        !root.current?.contains(event.target as Node) &&
        !list.current?.contains(event.target as Node)
      )
        close();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [visible, close]);
  function focus(last = false) {
    requestAnimationFrame(() => {
      const nodes = list.current?.querySelectorAll<HTMLElement>('[data-menu-item]:not(:disabled)');
      (last ? nodes?.[nodes.length - 1] : nodes?.[0])?.focus();
    });
  }
  return (
    <div
      className={portalClass('mp-menu', className)}
      ref={root}
      onBlur={(e) => {
        if (
          visible &&
          e.relatedTarget &&
          !root.current?.contains(e.relatedTarget as Node) &&
          !list.current?.contains(e.relatedTarget as Node)
        )
          close();
      }}
    >
      <button
        ref={(node) => {
          button.current = node;
          popup.refs.setReference(node);
        }}
        type="button"
        className={portalClass('mp-menu-trigger', triggerClassName)}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={visible}
        aria-controls={visible ? id : undefined}
        onClick={() => {
          setShown(!shown);
          if (!shown) focus();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setShown(true);
            focus(e.key === 'ArrowUp');
          }
        }}
      >
        {trigger ?? (
          <>
            {label}
            <ChevronDown size={18} />
          </>
        )}
      </button>
      {visible && (
        <PortalPopupLayer anchor={button.current}>
          <div
            id={id}
            role="menu"
            aria-label={label}
            className={portalClass(`mp-menu-list mp-menu-list--${align}`, listClassName)}
            style={{ ...popup.floatingStyles, right: 'auto' }}
            ref={(node) => {
              list.current = node;
              popup.refs.setFloating(node);
            }}
            onKeyDown={(e) => {
              const nodes = Array.from(
                list.current?.querySelectorAll<HTMLElement>('[data-menu-item]:not(:disabled)') ??
                  [],
              );
              const active = nodes.indexOf(document.activeElement as HTMLElement);
              let next = -1;
              if (e.key === 'Escape') {
                e.preventDefault();
                close(true);
                return;
              }
              if (e.key === 'Tab') {
                close();
                return;
              }
              if (e.key === 'ArrowDown') next = (active + 1) % nodes.length;
              if (e.key === 'ArrowUp') next = (active - 1 + nodes.length) % nodes.length;
              if (e.key === 'Home') next = 0;
              if (e.key === 'End') next = nodes.length - 1;
              if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && e.key !== ' ') {
                const now = Date.now();
                search.current = {
                  text: now - search.current.at < 700 ? search.current.text + e.key : e.key,
                  at: now,
                };
                const match = [...nodes.slice(active + 1), ...nodes.slice(0, active + 1)].find(
                  (n) =>
                    n.textContent
                      ?.trim()
                      .toLocaleLowerCase()
                      .startsWith(search.current.text.toLocaleLowerCase()),
                );
                if (match) {
                  e.preventDefault();
                  match.focus();
                }
              }
              if (next >= 0) {
                e.preventDefault();
                nodes[next]?.focus();
              }
            }}
          >
            {items.map((item) =>
              item.type === 'separator' ? (
                <div key={item.id} role="separator" className="mp-menu-separator" />
              ) : item.type === 'group' ? (
                <div className="mp-menu-group" role="presentation" key={item.id}>
                  {item.label}
                </div>
              ) : (
                <button
                  type="button"
                  key={item.id}
                  role={
                    item.type === 'checkbox'
                      ? 'menuitemcheckbox'
                      : item.type === 'radio'
                        ? 'menuitemradio'
                        : 'menuitem'
                  }
                  aria-checked={
                    item.type === 'checkbox' || item.type === 'radio' ? !!item.checked : undefined
                  }
                  data-menu-item
                  disabled={item.disabled}
                  className="mp-menu-item"
                  onClick={() => {
                    if (disabled || item.disabled) return;
                    item.onCheckedChange?.(!item.checked);
                    item.onSelect?.();
                    if (item.href) window.location.assign(item.href);
                    if (item.closeOnSelect ?? item.type !== 'checkbox') close(true);
                  }}
                >
                  {item.icon && (
                    <span className="mp-menu-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="mp-menu-label">{item.label}</span>
                  {item.checked && <Check className="mp-menu-check" aria-hidden="true" size={18} />}
                </button>
              ),
            )}
          </div>
        </PortalPopupLayer>
      )}
    </div>
  );
}
export interface PortalChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  selectable?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  icon?: ReactNode;
}
export const PortalChip = /* @__PURE__ */ forwardRef<HTMLButtonElement, PortalChipProps>(
  function PortalChip(
    {
      selected,
      defaultSelected = false,
      onSelectedChange,
      selectable,
      onDismiss,
      dismissLabel = 'Usuń',
      icon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    const [active, setActive] = usePortalState(selected, defaultSelected, onSelectedChange);
    const interactive = selectable || onSelectedChange || props.onClick;
    return (
      <span
        className={portalClass(
          'mp-chip',
          active && 'mp-chip--selected',
          disabled && 'mp-chip--disabled',
          className,
        )}
      >
        {interactive ? (
          <button
            {...props}
            ref={ref}
            type="button"
            disabled={disabled}
            aria-pressed={selectable || onSelectedChange ? active : undefined}
            onClick={(e) => {
              if (selectable || onSelectedChange) setActive(!active);
              props.onClick?.(e);
            }}
          >
            {icon && <span aria-hidden="true">{icon}</span>}
            {children}
          </button>
        ) : (
          <span>
            {icon && <span aria-hidden="true">{icon}</span>}
            {children}
          </span>
        )}
        {onDismiss && (
          <button
            type="button"
            aria-label={`${dismissLabel}: ${typeof children === 'string' ? children : 'etykieta'}`}
            disabled={disabled}
            onClick={onDismiss}
          >
            <X size={16} />
          </button>
        )}
      </span>
    );
  },
);
export type PortalMessageTone = 'info' | 'success' | 'warning' | 'danger';
const symbols = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: AlertCircle };
export interface PortalSnackbarProps {
  id?: string;
  message: ReactNode;
  tone?: PortalMessageTone;
  duration?: number;
  onClose?: () => void;
  closable?: boolean;
  action?: { label: string; onClick: () => void };
  className?: string;
}
export function PortalSnackbar({
  message,
  tone = 'info',
  duration = 5000,
  onClose,
  closable = true,
  action,
  className,
}: PortalSnackbarProps) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);
  const started = useRef(0);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    remaining.current = duration;
  }, [duration, message]);
  useEffect(() => {
    if (paused || duration <= 0) return;
    started.current = Date.now();
    const timer = setTimeout(() => close.current?.(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started.current));
    };
  }, [paused, duration, message]);
  const Symbol = symbols[tone];
  return (
    <div
      className={portalClass('mp-snackbar', `mp-snackbar--${tone}`, className)}
      role={tone === 'danger' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <Symbol size={24} aria-hidden="true" />
      <div>{message}</div>
      {action && (
        <button type="button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {closable && (
        <button type="button" aria-label="Zamknij komunikat" onClick={onClose}>
          <X size={20} />
        </button>
      )}
    </div>
  );
}
export interface PortalSnackbarOptions extends Omit<PortalSnackbarProps, 'onClose' | 'className'> {
  onClose?: () => void;
}
export interface PortalSnackbarApi {
  enqueue: (options: PortalSnackbarOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}
const SnackbarContext = createContext<PortalSnackbarApi | null>(null);
export function usePortalSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('usePortalSnackbar requires PortalSnackbarProvider.');
  return context;
}
export interface PortalSnackbarProviderProps {
  children: ReactNode;
  maxVisible?: number;
  position?:
    'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}
export function PortalSnackbarProvider({
  children,
  maxVisible = 3,
  position = 'bottom-center',
}: PortalSnackbarProviderProps) {
  const [queue, setQueue] = useState<Array<PortalSnackbarOptions & { id: string }>>([]);
  const latest = useRef(queue);
  latest.current = queue;
  const sequence = useRef(0);
  const prefix = useId();
  const enqueue = useCallback(
    (options: PortalSnackbarOptions) => {
      const id = options.id ?? `${prefix}-${++sequence.current}`;
      setQueue((q) =>
        q.some((v) => v.id === id)
          ? q.map((v) => (v.id === id ? { ...options, id } : v))
          : [...q, { ...options, id }],
      );
      return id;
    },
    [prefix],
  );
  const dismiss = useCallback((id: string) => {
    const removed = latest.current.find((v) => v.id === id);
    latest.current = latest.current.filter((v) => v.id !== id);
    setQueue(latest.current);
    removed?.onClose?.();
  }, []);
  const clear = useCallback(() => {
    const removed = latest.current;
    latest.current = [];
    setQueue([]);
    removed.forEach((item) => item.onClose?.());
  }, []);
  return (
    <SnackbarContext.Provider value={{ enqueue, dismiss, clear }}>
      {children}
      <div
        className={`mp-snackbar-region mp-snackbar-region--${position}`}
        role="region"
        aria-label="Powiadomienia"
      >
        {queue.slice(0, Math.max(1, maxVisible)).map((item) => (
          <PortalSnackbar key={item.id} {...item} onClose={() => dismiss(item.id)} />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}
