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
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import { landingAssets } from './assets.js';

const MotionContext = createContext({ disabled: false, setDisabled: (_value: boolean) => {} });
export function useLandingMotion() {
  return useContext(MotionContext);
}
export interface LandingProviderProps extends HTMLAttributes<HTMLDivElement> {
  animationsDisabled?: boolean;
  defaultAnimationsDisabled?: boolean;
  onAnimationsDisabledChange?: (disabled: boolean) => void;
}
/** An isolated public-site theme. It deliberately keeps the live site's light palette. */
export const LandingProvider = /* @__PURE__ */ forwardRef<HTMLDivElement, LandingProviderProps>(
  function LandingProvider(
    {
      animationsDisabled,
      defaultAnimationsDisabled,
      onAnimationsDisabledChange,
      className = '',
      children,
      ...props
    },
    ref,
  ) {
    const inherited = useContext(MotionContext);
    const [local, setLocal] = useState<boolean | undefined>(defaultAnimationsDisabled);
    const disabled = animationsDisabled ?? local ?? inherited.disabled;
    function setDisabled(value: boolean) {
      setLocal(value);
      onAnimationsDisabledChange?.(value);
    }
    return (
      <MotionContext.Provider value={{ disabled, setDisabled }}>
        <div
          {...props}
          ref={ref}
          data-platform="landing"
          data-theme="light"
          data-motion={disabled ? 'reduced' : 'full'}
          className={`m-landing ${className}`}
        >
          {children}
        </div>
      </MotionContext.Provider>
    );
  },
);

export interface LandingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'link';
  icon?: ReactNode;
}
export const LandingButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, LandingButtonProps>(
  function LandingButton(
    { variant = 'primary', icon, children, className = '', type = 'button', ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={`ml-button ml-button--${variant} ${className}`}
      >
        {children}
        {icon && <span aria-hidden="true">{icon}</span>}
      </button>
    );
  },
);
export interface LandingLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'link';
  icon?: ReactNode;
}
export const LandingLink = /* @__PURE__ */ forwardRef<HTMLAnchorElement, LandingLinkProps>(
  function LandingLink({ variant = 'link', icon, children, className = '', ...props }, ref) {
    return (
      <a {...props} ref={ref} className={`ml-button ml-button--${variant} ${className}`}>
        {children}
        {icon && <span aria-hidden="true">{icon}</span>}
      </a>
    );
  },
);

export interface LandingSearchFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'type'
> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  clearLabel?: string;
}
export const LandingSearchField = /* @__PURE__ */ forwardRef<
  HTMLInputElement,
  LandingSearchFieldProps
>(function LandingSearchField(
  {
    label,
    value,
    defaultValue = '',
    onValueChange,
    clearLabel = 'Wyczyść wyszukiwanie',
    id,
    className = '',
    disabled,
    readOnly,
    ...props
  },
  forwardedRef,
) {
  const generated = useId();
  const inputId = id ?? generated;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const attachRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === 'function') return forwardedRef(node);
      if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );
  const [local, setLocal] = useState(defaultValue);
  const current = value ?? local;
  function update(next: string) {
    setLocal(next);
    onValueChange?.(next);
  }
  return (
    <div className={`ml-search ${className}`}>
      <label className="ml-sr-only" htmlFor={inputId}>
        {label}
      </label>
      <img className="ml-search-icon" src={landingAssets.searchIcon} alt="" aria-hidden="true" />
      <input
        {...props}
        id={inputId}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        placeholder={props.placeholder ?? 'Wyszukaj'}
        value={current}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(event) => update(event.target.value)}
        ref={attachRef}
      />
      {!!current && !disabled && !readOnly && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => {
            update('');
            inputRef.current?.focus();
          }}
        >
          <X size={22} aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

export interface LandingOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface LandingComboboxProps {
  label: string;
  options: LandingOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
/** Select-only ARIA combobox: arrows, Home/End, typeahead, Enter and Escape. */
export function LandingCombobox({
  label,
  options,
  value,
  defaultValue = '',
  onValueChange,
  placeholder = 'Wszystkie',
  disabled = false,
  className = '',
}: LandingComboboxProps) {
  const [local, setLocal] = useState(defaultValue);
  const selected = value ?? local;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const typeahead = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();
  const enabled = options
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index >= 0);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (open)
      document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, active, id]);
  function choose(index: number) {
    const item = options[index];
    if (!item || item.disabled) return;
    setLocal(item.value);
    onValueChange?.(item.value);
    setOpen(false);
  }
  function show() {
    setActive(
      Math.max(
        enabled[0] ?? 0,
        options.findIndex((option) => option.value === selected && !option.disabled),
      ),
    );
    setOpen(true);
  }
  return (
    <div
      ref={root}
      className={`ml-combobox ${className}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <span id={`${id}-label`} className="ml-field-label">
        {label}
      </span>
      <button
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-activedescendant={open && options[active] ? `${id}-option-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(event) => {
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            if (!open) {
              show();
              if (event.key === 'ArrowUp' || event.key === 'End') setActive(enabled.at(-1) ?? 0);
              return;
            }
            const position = enabled.indexOf(active);
            setActive(
              event.key === 'Home'
                ? (enabled[0] ?? 0)
                : event.key === 'End'
                  ? (enabled.at(-1) ?? 0)
                  : (enabled[
                      (position + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) %
                        enabled.length
                    ] ?? 0),
            );
          } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (open) choose(active);
            else show();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            clearTimeout(timer.current);
            typeahead.current += event.key.toLocaleLowerCase('pl');
            const index = options.findIndex(
              (option) =>
                !option.disabled &&
                option.label.toLocaleLowerCase('pl').startsWith(typeahead.current),
            );
            if (index >= 0) {
              setActive(index);
              setOpen(true);
            }
            timer.current = setTimeout(() => {
              typeahead.current = '';
            }, 700);
          }
        }}
      >
        <span id={`${id}-value`}>
          {options.find((option) => option.value === selected)?.label ?? placeholder}
        </span>
        <ChevronDown size={20} aria-hidden="true" />
      </button>
      {open && (
        <ul id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`}>
          {options.map((option, index) => (
            <li
              id={`${id}-option-${index}`}
              key={option.value}
              role="option"
              aria-selected={selected === option.value}
              aria-disabled={option.disabled || undefined}
              data-active={active === index || undefined}
              onPointerMove={() => {
                if (!option.disabled) setActive(index);
              }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {selected === option.value && <Check size={18} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface LandingBreadcrumbItem {
  label: string;
  href?: string;
}
export function LandingBreadcrumbs({
  items,
  label = 'Ścieżka nawigacji',
}: {
  items: LandingBreadcrumbItem[];
  label?: string;
}) {
  return (
    <nav className="ml-breadcrumbs" aria-label={label}>
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {index > 0 && <ChevronRight size={16} aria-hidden="true" />}
            {item.href && index < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export interface LandingTab {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}
export function LandingTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label = 'Kategorie',
}: {
  items: LandingTab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
}) {
  return (
    <TabsPrimitive.Root
      className="ml-tabs"
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
    >
      <TabsPrimitive.List className="ml-tab-list" aria-label={label}>
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            className="ml-tab"
            value={item.value}
            disabled={item.disabled}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content key={item.value} className="ml-tab-panel" value={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
export function LandingTooltip({
  children,
  content,
  open,
  onOpenChange,
}: {
  children: ReactElement;
  content: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [local, setLocal] = useState(false);
  const visible = open ?? local;
  function update(next: boolean) {
    setLocal(next);
    onOpenChange?.(next);
  }
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root open={visible} onOpenChange={update}>
        <TooltipPrimitive.Trigger asChild onClick={() => update(!visible)}>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <LandingProvider className="ml-tooltip-scope">
            <TooltipPrimitive.Content className="ml-tooltip" sideOffset={8}>
              {content}
              <TooltipPrimitive.Arrow />
            </TooltipPrimitive.Content>
          </LandingProvider>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
export function LandingLoader({
  label = 'Wczytywanie',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`ml-loader ${className}`} role="status">
      <span aria-hidden="true" />
      <span className="ml-sr-only">{label}</span>
    </div>
  );
}
