import { PortalPopupLayer, usePortalPopup } from './popup.js';
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type {
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import { AlertCircle, Check, ChevronDown } from './glyphs.js';
import { usePortalState, portalClass } from './state.js';
import { useNativeFormReset } from '../form-reset.js';
type FieldContext = {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required?: boolean;
  disabled?: boolean;
};
const FormContext = createContext<FieldContext | undefined>(undefined);
export interface PortalFormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  id?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode | ((field: FieldContext) => ReactNode);
}
export const PortalFormField = /* @__PURE__ */ forwardRef<HTMLDivElement, PortalFormFieldProps>(
  function PortalFormField(
    { id, label, hint, error, required, disabled, children, className, ...props },
    ref,
  ) {
    const generated = useId();
    const makeField = (fieldId: string): FieldContext => ({
      id: fieldId,
      describedBy: error ? `${fieldId}-error` : hint ? `${fieldId}-help` : undefined,
      invalid: !!error,
      required,
      disabled,
    });
    let field = makeField(id ?? generated);
    let content = typeof children === 'function' ? children(field) : children;
    if (
      isValidElement(content) &&
      typeof content.type === 'string' &&
      ['input', 'textarea', 'select'].includes(content.type)
    ) {
      const child = content as ReactElement<InputHTMLAttributes<HTMLInputElement>>;
      const previousDescription = field.describedBy;
      field = makeField(child.props.id ?? field.id);
      const descriptions = (child.props['aria-describedby'] ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .filter((description) => description !== previousDescription);
      if (field.describedBy) descriptions.push(field.describedBy);
      content = cloneElement(child, {
        id: field.id,
        required: child.props.required ?? required,
        disabled: child.props.disabled ?? disabled,
        'aria-invalid': field.invalid || child.props['aria-invalid'],
        'aria-describedby': [...new Set(descriptions)].join(' ') || undefined,
      });
    }
    return (
      <FormContext.Provider value={field}>
        <div
          {...props}
          ref={ref}
          className={portalClass('mp-form-field', !!error && 'mp-form-field--invalid', className)}
        >
          {label && <PortalFormLabel>{label}</PortalFormLabel>}
          {content}
          {error ? (
            <PortalFormMessage>{error}</PortalFormMessage>
          ) : hint ? (
            <PortalFormHelperText>{hint}</PortalFormHelperText>
          ) : null}
        </div>
      </FormContext.Provider>
    );
  },
);
export const PortalFormLabel = /* @__PURE__ */ forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(function PortalFormLabel({ children, ...props }, ref) {
  const field = useContext(FormContext);
  return (
    <label
      {...props}
      ref={ref}
      htmlFor={props.htmlFor ?? field?.id}
      className={portalClass('mp-form-label', props.className)}
    >
      {children}
      {field?.required && <span aria-hidden="true"> *</span>}
    </label>
  );
});
export const PortalFormHelperText = /* @__PURE__ */ forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function PortalFormHelperText(props, ref) {
  const field = useContext(FormContext);
  return (
    <p
      {...props}
      ref={ref}
      id={props.id ?? (field ? `${field.id}-help` : undefined)}
      className={portalClass('mp-helper', props.className)}
    />
  );
});
export const PortalFormMessage = /* @__PURE__ */ forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function PortalFormMessage({ children, ...props }, ref) {
  const field = useContext(FormContext);
  return (
    <p
      {...props}
      ref={ref}
      id={props.id ?? (field ? `${field.id}-error` : undefined)}
      role={props.role ?? 'alert'}
      className={portalClass('mp-field-error', props.className)}
    >
      <AlertCircle size={16} aria-hidden="true" />
      {children}
    </p>
  );
});
export interface PortalCharacterCounterProps extends HTMLAttributes<HTMLOutputElement> {
  value?: string;
  count?: number;
  maxLength: number;
  mode?: 'used' | 'remaining';
  forId?: string;
}
export const PortalCharacterCounter = /* @__PURE__ */ forwardRef<
  HTMLOutputElement,
  PortalCharacterCounterProps
>(function PortalCharacterCounter(
  { value = '', count, maxLength, mode = 'used', forId, className, ...props },
  ref,
) {
  const used = count ?? Array.from(value).length;
  const remaining = maxLength - used;
  return (
    <output
      {...props}
      ref={ref}
      htmlFor={forId}
      className={portalClass('mp-character-counter', remaining < 0 && 'mp-field-error', className)}
      aria-live="polite"
    >
      {mode === 'remaining' ? `${remaining} znaków do wykorzystania` : `${used} / ${maxLength}`}
    </output>
  );
});
export interface PortalSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  group?: string;
}
export interface PortalSelectProps {
  label: string;
  id?: string;
  name?: string;
  options: PortalSelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  searchable?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
  loading?: boolean;
  emptyMessage?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  onBlur?: () => void;
}
export const PortalSelect = /* @__PURE__ */ forwardRef<HTMLButtonElement, PortalSelectProps>(
  function PortalSelect(
    {
      label,
      id,
      name,
      options,
      value,
      defaultValue = '',
      onValueChange,
      multiple = false,
      required,
      disabled,
      readOnly,
      searchable,
      placeholder = 'Wybierz',
      hint,
      error,
      loading,
      emptyMessage = 'Brak wyników',
      open,
      defaultOpen = false,
      onOpenChange,
      className,
      style,
      onBlur,
    },
    ref,
  ) {
    const generated = useId();
    const inputId = id ?? generated;
    const [selected, setSelected] = usePortalState(value, defaultValue, onValueChange);
    const chosen = Array.isArray(selected) ? selected : selected ? [selected] : [];
    const [shown, setShown] = usePortalState(open, defaultOpen, onOpenChange);
    const blocked = !!disabled || !!readOnly;
    const visibleOpen = shown && !blocked;
    const [query, setQuery] = useState('');
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement | null>(null);
    const list = useRef<HTMLDivElement>(null);
    const search = useRef<HTMLInputElement>(null);
    const visible = options.filter((o) =>
      o.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    );
    const typeahead = useRef({ text: '', at: 0 });
    const popup = usePortalPopup(visibleOpen, 'start', true);
    const native = useRef<HTMLSelectElement>(null);
    useEffect(() => {
      const resetValues =
        value === undefined
          ? Array.isArray(defaultValue)
            ? defaultValue
            : [defaultValue]
          : chosen;
      // Native reset runs after dispatch; give the browser the same defaults
      // that React will restore, including a controlled parent's current value.
      for (const option of native.current?.options ?? [])
        option.defaultSelected = resetValues.includes(option.value);
    });
    useNativeFormReset(native, () => {
      if (value === undefined) setSelected(defaultValue);
      setQuery('');
      setShown(false);
    });
    useEffect(() => {
      if (blocked && shown) setShown(false);
    }, [blocked, shown, setShown]);
    useEffect(() => {
      if (!visibleOpen) return;
      const outside = (e: PointerEvent) => {
        if (
          !root.current?.contains(e.target as Node) &&
          !popup.refs.floating.current?.contains(e.target as Node)
        )
          setShown(false);
      };
      document.addEventListener('pointerdown', outside);
      return () => document.removeEventListener('pointerdown', outside);
    }, [visibleOpen, setShown, popup.refs.floating]);
    function focus(first = true) {
      if (blocked) return;
      requestAnimationFrame(() => {
        if (searchable && first) {
          search.current?.focus();
          return;
        }
        const buttons = list.current?.querySelectorAll<HTMLButtonElement>(
          '[role=option]:not(:disabled)',
        );
        (first ? buttons?.[0] : buttons?.[buttons.length - 1])?.focus();
      });
    }
    function choose(option: PortalSelectOption) {
      if (blocked || option.disabled) return;
      if (multiple)
        setSelected(
          chosen.includes(option.value)
            ? chosen.filter((v) => v !== option.value)
            : [...chosen, option.value],
        );
      else {
        setSelected(option.value);
        setShown(false);
        trigger.current?.focus();
      }
    }
    return (
      <div
        className={portalClass('mp-select-field', className)}
        style={style}
        ref={root}
        onBlur={(e) => {
          if (
            e.relatedTarget &&
            !root.current?.contains(e.relatedTarget as Node) &&
            !popup.refs.floating.current?.contains(e.relatedTarget as Node)
          ) {
            setShown(false);
            onBlur?.();
          }
        }}
      >
        <label id={`${inputId}-label`} htmlFor={inputId}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <select
          ref={native}
          className="mp-sr"
          name={name}
          multiple={multiple}
          value={multiple ? chosen : (chosen[0] ?? '')}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          onChange={() => {}}
          onInvalid={(e) => {
            e.preventDefault();
            trigger.current?.focus();
            if (!blocked) setShown(true);
          }}
        >
          {!multiple && <option value="" />}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          ref={(node) => {
            trigger.current = node;
            popup.refs.setReference(node);
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          id={inputId}
          className="mp-select-trigger"
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-controls={visibleOpen ? `${inputId}-list` : undefined}
          aria-expanded={visibleOpen}
          aria-labelledby={`${inputId}-label ${inputId}-value`}
          aria-describedby={hint || error ? `${inputId}-help` : undefined}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          disabled={disabled}
          aria-readonly={readOnly || undefined}
          onClick={() => {
            if (!blocked) {
              setShown(!visibleOpen);
              if (!visibleOpen) focus();
            }
          }}
          onKeyDown={(e) => {
            if (!blocked && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
              e.preventDefault();
              setShown(true);
              focus(e.key === 'ArrowDown' || e.key === 'Home');
            }
          }}
        >
          <span id={`${inputId}-value`} className={!chosen.length ? 'mp-placeholder' : undefined}>
            {chosen.length
              ? options
                  .filter((o) => chosen.includes(o.value))
                  .map((o) => o.label)
                  .join(', ')
              : placeholder}
          </span>
          <ChevronDown size={20} />
        </button>
        {visibleOpen && (
          <PortalPopupLayer anchor={trigger.current}>
            <div
              className="mp-select-popup"
              ref={popup.refs.setFloating}
              style={{ ...popup.floatingStyles, right: 'auto' }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setShown(false);
                  trigger.current?.focus();
                }
                if (e.key === 'Tab') setShown(false);
                const nodes = Array.from(
                  list.current?.querySelectorAll<HTMLButtonElement>(
                    '[role=option]:not(:disabled)',
                  ) ?? [],
                );
                const i = nodes.indexOf(document.activeElement as HTMLButtonElement);
                let next = -1;
                if (e.key === 'ArrowDown') next = (i + 1) % nodes.length;
                if (e.key === 'ArrowUp') next = (i - 1 + nodes.length) % nodes.length;
                if (e.key === 'Home') next = 0;
                if (e.key === 'End') next = nodes.length - 1;
                if (next >= 0) {
                  e.preventDefault();
                  nodes[next]?.focus();
                }
                if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                  const now = Date.now();
                  typeahead.current = {
                    text: now - typeahead.current.at < 700 ? typeahead.current.text + e.key : e.key,
                    at: now,
                  };
                  nodes
                    .find((n) =>
                      n.textContent
                        ?.toLocaleLowerCase()
                        .startsWith(typeahead.current.text.toLocaleLowerCase()),
                    )
                    ?.focus();
                }
              }}
            >
              {searchable && (
                <input
                  ref={search}
                  aria-label={`Szukaj: ${label}`}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              )}
              <div
                role="listbox"
                id={`${inputId}-list`}
                ref={list}
                aria-labelledby={`${inputId}-label`}
                aria-multiselectable={multiple || undefined}
              >
                {loading ? (
                  <p role="status">Ładowanie…</p>
                ) : visible.length ? (
                  visible.map((o, i) => (
                    <div key={o.value}>
                      {o.group && o.group !== visible[i - 1]?.group && (
                        <div className="mp-menu-group">{o.group}</div>
                      )}
                      <button
                        type="button"
                        role="option"
                        aria-selected={chosen.includes(o.value)}
                        disabled={o.disabled}
                        tabIndex={-1}
                        onClick={() => choose(o)}
                      >
                        <span>
                          {o.label}
                          {o.description && <small>{o.description}</small>}
                        </span>
                        {chosen.includes(o.value) && <Check size={18} aria-hidden="true" />}
                      </button>
                    </div>
                  ))
                ) : (
                  <p role="status">{emptyMessage}</p>
                )}
              </div>
            </div>
          </PortalPopupLayer>
        )}
        {(hint || error) && (
          <p
            id={`${inputId}-help`}
            role={error ? 'alert' : undefined}
            className={error ? 'mp-field-error' : 'mp-helper'}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);
export interface PortalRadioGroupProps {
  label: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: PortalSelectOption[];
  disabled?: boolean;
  required?: boolean;
  hint?: string;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}
export const PortalRadioGroup = /* @__PURE__ */ forwardRef<
  HTMLFieldSetElement,
  PortalRadioGroupProps
>(function PortalRadioGroup(
  {
    label,
    name,
    value,
    defaultValue = '',
    onValueChange,
    options,
    disabled,
    required,
    hint,
    error,
    orientation = 'vertical',
    className,
  },
  ref,
) {
  const id = useId();
  const [selected, setSelected] = usePortalState(value, defaultValue, onValueChange);
  return (
    <fieldset
      ref={ref}
      className={portalClass('mp-radio-group', className)}
      disabled={disabled}
      aria-describedby={error || hint ? `${id}-help` : undefined}
      aria-invalid={!!error || undefined}
    >
      <legend>
        {label}
        {required && ' *'}
      </legend>
      <div data-orientation={orientation}>
        {options.map((o) => (
          <label key={o.value}>
            <input
              type="radio"
              name={name ?? id}
              value={o.value}
              checked={selected === o.value}
              disabled={o.disabled}
              required={required}
              onChange={() => setSelected(o.value)}
            />
            <span>
              {o.label}
              {o.description && <small>{o.description}</small>}
            </span>
          </label>
        ))}
      </div>
      {(hint || error) && (
        <p id={`${id}-help`} className={error ? 'mp-field-error' : 'mp-helper'}>
          {error || hint}
        </p>
      )}
    </fieldset>
  );
});
