import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  X,
} from 'lucide-react';
import { NativeIcon } from './NativeIcon.js';

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  destructive?: boolean;
  /** White outlined secondary button, intended for a dark/brand surface. */
  reversed?: boolean;
  /** Native PrimaryButtonStyle.black. */
  black?: boolean;
}
export const Button = /* @__PURE__ */ forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    destructive = false,
    reversed = false,
    black = false,
    children,
    className,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={cx(
        'm-button',
        `m-button--${variant}`,
        `m-button--${size}`,
        destructive && 'm-button--destructive',
        reversed && 'm-button--reversed',
        black && !destructive && variant === 'primary' && 'm-button--black',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <Spinner label="Ładowanie" size={18} />
      ) : (
        icon && (
          <span className="m-button-icon" aria-hidden="true">
            {icon}
          </span>
        )
      )}
      {children}
    </button>
  );
});

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> {
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'danger';
  /** Native icon button: glyph24, small32 or large48. */
  size?: 'glyph' | 'sm' | 'lg';
  destructive?: boolean;
  reversed?: boolean;
  black?: boolean;
}
export const IconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      variant = 'default',
      size,
      destructive = false,
      reversed = false,
      black = false,
      className,
      type = 'button',
      children,
      ...props
    },
    ref,
  ) {
    const resolvedSize = size ?? (variant === 'default' ? 'glyph' : 'lg');
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        aria-label={label}
        className={cx(
          'm-icon-button',
          `m-icon-button--${variant}`,
          `m-icon-button--${resolvedSize}`,
          destructive && 'm-icon-button--destructive',
          reversed && 'm-icon-button--reversed',
          black && !destructive && variant === 'primary' && 'm-icon-button--black',
          className,
        )}
      >
        {children}
      </button>
    );
  },
);

type FieldBase = { label: ReactNode; hint?: ReactNode; error?: ReactNode };
function FieldErrorIcon() {
  return (
    <>
      <AlertCircle size={15} className="m-field-error-icon--web" aria-hidden="true" />
      <span className="m-field-error-icon--native" aria-hidden="true">
        <NativeIcon name="field-error" size={16} />
      </span>
    </>
  );
}
export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, FieldBase {
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Show the native mobile field's clear action while it has text and focus. */
  clearable?: boolean;
  /** Show the native mobile secure-field visibility control. */
  passwordToggle?: boolean;
  clearLabel?: string;
}
export const TextField = /* @__PURE__ */ forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      hint,
      error,
      id,
      className,
      leading,
      trailing,
      clearable = true,
      clearLabel = 'Wyczyść pole',
      passwordToggle = true,
      type = 'text',
      onChange,
      'aria-describedby': describedBy,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const descriptionId = `${fieldId}-description`;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(props.defaultValue ?? '');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      },
      [ref],
    );
    useEffect(() => {
      if (!passwordToggle) setPasswordVisible(false);
    }, [passwordToggle]);
    const currentText = String(props.value ?? uncontrolledValue);
    const isSecure = type === 'password';
    const hasPasswordControl = isSecure && passwordToggle && !trailing;
    const hasClearControl =
      !isSecure && clearable && !props.disabled && !props.readOnly && !!currentText && !trailing;
    function clearInput() {
      const input = inputRef.current;
      if (!input) return;
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      valueSetter?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      setUncontrolledValue('');
      input.focus();
    }
    return (
      <div
        className={cx(
          'm-field',
          !!error && 'm-field--error',
          props.disabled && 'm-field--disabled',
          className,
        )}
      >
        <label htmlFor={fieldId} className="m-field-label">
          {label}
          {props.required && (
            <span aria-hidden="true" className="m-required">
              {' '}
              *
            </span>
          )}
        </label>
        <div className="m-input-wrap">
          {leading && (
            <span className="m-input-leading" aria-hidden="true">
              {leading}
            </span>
          )}
          <input
            {...props}
            ref={setInputRef}
            type={isSecure && passwordVisible && passwordToggle ? 'text' : type}
            id={fieldId}
            className={cx(
              'm-input',
              !!leading && 'm-input--leading',
              !!trailing && 'm-input--trailing',
            )}
            onChange={(event) => {
              setUncontrolledValue(event.target.value);
              onChange?.(event);
            }}
            aria-invalid={error ? true : props['aria-invalid']}
            aria-describedby={
              cx(describedBy, error || hint ? descriptionId : undefined) || undefined
            }
          />
          {trailing && <span className="m-input-trailing">{trailing}</span>}
          {hasClearControl && (
            <button
              type="button"
              className="m-native-input-control m-native-input-control--clear"
              aria-label={clearLabel}
              onClick={clearInput}
            >
              <NativeIcon name="field-clear" size={24} />
            </button>
          )}
          {hasPasswordControl && (
            <button
              type="button"
              className="m-native-input-control"
              disabled={props.disabled}
              aria-label={passwordVisible ? 'Ukryj hasło' : 'Pokaż hasło'}
              aria-pressed={passwordVisible}
              onClick={() => {
                setPasswordVisible(!passwordVisible);
                inputRef.current?.focus();
              }}
            >
              {passwordVisible ? (
                <NativeIcon name="hide-password" size={24} />
              ) : (
                <NativeIcon name="show-password" size={24} />
              )}
            </button>
          )}
        </div>
        {(error || hint) && (
          <p
            id={descriptionId}
            className={cx('m-field-hint', !!error && 'm-field-error')}
            role={error ? 'alert' : undefined}
          >
            {error && <FieldErrorIcon />}
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldBase {}
export const TextArea = /* @__PURE__ */ forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    { label, hint, error, id, className, 'aria-describedby': describedBy, ...props },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <div
        className={cx(
          'm-field',
          !!error && 'm-field--error',
          props.disabled && 'm-field--disabled',
          className,
        )}
      >
        <label htmlFor={fieldId} className="m-field-label">
          {label}
          {props.required && (
            <span aria-hidden="true" className="m-required">
              {' '}
              *
            </span>
          )}
        </label>
        <textarea
          {...props}
          ref={ref}
          id={fieldId}
          className="m-input m-textarea"
          rows={props.rows ?? 4}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={
            cx(describedBy, error || hint ? `${fieldId}-description` : undefined) || undefined
          }
        />
        {(error || hint) && (
          <p
            id={`${fieldId}-description`}
            className={cx('m-field-hint', !!error && 'm-field-error')}
            role={error ? 'alert' : undefined}
          >
            {error && <FieldErrorIcon />}
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldBase {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}
export const Select = /* @__PURE__ */ forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, hint, error, id, className, 'aria-describedby': describedBy, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div
      className={cx(
        'm-field',
        !!error && 'm-field--error',
        props.disabled && 'm-field--disabled',
        className,
      )}
    >
      <label htmlFor={fieldId} className="m-field-label">
        {label}
        {props.required && (
          <span aria-hidden="true" className="m-required">
            {' '}
            *
          </span>
        )}
      </label>
      <div className="m-input-wrap">
        <select
          {...props}
          ref={ref}
          id={fieldId}
          className="m-input m-select"
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={
            cx(describedBy, error || hint ? `${fieldId}-description` : undefined) || undefined
          }
        >
          {options.map((option) => (
            <option key={option.value} {...option}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="m-select-chevron" aria-hidden="true">
          <ChevronDown className="m-symbol--web" size={18} />
          <span className="m-symbol--native">
            <NativeIcon name="chevron-down" size={24} />
          </span>
        </span>
      </div>
      {(error || hint) && (
        <p
          id={`${fieldId}-description`}
          className={cx('m-field-hint', !!error && 'm-field-error')}
          role={error ? 'alert' : undefined}
        >
          {error && <FieldErrorIcon />}
          {error || hint}
        </p>
      )}
    </div>
  );
});

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  indeterminate?: boolean;
  onIndeterminateChange?: (indeterminate: boolean) => void;
  align?: 'center' | 'start';
}
export const Checkbox = /* @__PURE__ */ forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      hint,
      error,
      indeterminate = false,
      onIndeterminateChange,
      align = 'center',
      id,
      className,
      onChange,
      'aria-describedby': describedBy,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      },
      [ref],
    );
    useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);
    return (
      <label
        htmlFor={fieldId}
        className={cx(
          'm-choice',
          'm-choice--checkbox',
          `m-choice--align-${align}`,
          indeterminate && 'm-choice--mixed',
          props.disabled && 'm-choice--disabled',
          !!error && 'm-choice--error',
          className,
        )}
      >
        <span className="m-choice-indicator">
          <input
            {...props}
            ref={setRef}
            id={fieldId}
            type="checkbox"
            className="m-checkbox"
            aria-checked={indeterminate ? 'mixed' : props['aria-checked']}
            onChange={(event) => {
              if (indeterminate) onIndeterminateChange?.(false);
              onChange?.(event);
            }}
            aria-labelledby={
              props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${fieldId}-label`)
            }
            aria-invalid={error ? true : props['aria-invalid']}
            aria-describedby={
              cx(describedBy, error || hint ? `${fieldId}-hint` : undefined) || undefined
            }
          />
          <Check
            size={14}
            strokeWidth={3}
            className="m-checkbox-check m-checkbox-check--web"
            aria-hidden="true"
          />
          <NativeIcon
            name="checkbox-mark"
            size={12}
            monochrome
            className="m-checkbox-check m-checkbox-check--native"
          />
          <span className="m-checkbox-mixed" aria-hidden="true" />
        </span>
        <span className="m-choice-copy">
          <span id={`${fieldId}-label`}>{label}</span>
          {(error || hint) && (
            <span
              id={`${fieldId}-hint`}
              className={cx('m-choice-hint', !!error && 'm-choice-error')}
              role={error ? 'alert' : undefined}
            >
              {error || hint}
            </span>
          )}
        </span>
      </label>
    );
  },
);

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}
export const Radio = /* @__PURE__ */ forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, hint, error, id, className, 'aria-describedby': describedBy, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <label
      htmlFor={fieldId}
      className={cx(
        'm-choice',
        'm-choice--radio',
        props.disabled && 'm-choice--disabled',
        !!error && 'm-choice--error',
        className,
      )}
    >
      <input
        {...props}
        ref={ref}
        id={fieldId}
        type="radio"
        className="m-radio"
        aria-labelledby={
          props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${fieldId}-label`)
        }
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={
          cx(describedBy, error || hint ? `${fieldId}-hint` : undefined) || undefined
        }
      />
      <span className="m-choice-copy">
        <span id={`${fieldId}-label`}>{label}</span>
        {(error || hint) && (
          <span
            id={`${fieldId}-hint`}
            className={cx('m-choice-hint', !!error && 'm-choice-error')}
            role={error ? 'alert' : undefined}
          >
            {error || hint}
          </span>
        )}
      </span>
    </label>
  );
});

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  label: ReactNode;
  hint?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
export const Switch = /* @__PURE__ */ forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    label,
    hint,
    checked,
    defaultChecked = false,
    onCheckedChange,
    id,
    className,
    disabled,
    onClick,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const currentChecked = checked ?? internalChecked;
  return (
    <div className={cx('m-switch-field', disabled && 'm-choice--disabled', className)}>
      <div className="m-choice-copy">
        <label htmlFor={fieldId} id={`${fieldId}-label`}>
          {label}
        </label>
        {hint && (
          <span className="m-choice-hint" id={`${fieldId}-hint`}>
            {hint}
          </span>
        )}
      </div>
      <button
        {...props}
        type="button"
        ref={ref}
        id={fieldId}
        role="switch"
        className="m-switch"
        disabled={disabled}
        aria-checked={currentChecked}
        aria-labelledby={`${fieldId}-label`}
        aria-describedby={hint ? `${fieldId}-hint` : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (checked === undefined) setInternalChecked(!currentChecked);
          onCheckedChange?.(!currentChecked);
        }}
      >
        <span className="m-switch-thumb" />
      </button>
    </div>
  );
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
  icon?: ReactNode;
  variant?: 'default' | 'status' | 'bordered' | 'chip';
}
export function Badge({
  tone = 'neutral',
  dot = false,
  icon,
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  const symbol =
    tone === 'success'
      ? 'status-success'
      : tone === 'danger'
        ? 'status-error'
        : tone === 'warning'
          ? 'status-notice'
          : tone === 'info'
            ? 'status-info'
            : 'status-minus';
  return (
    <span {...props} className={cx('m-badge', `m-badge--${variant}`, `m-tone--${tone}`, className)}>
      <span
        className={cx('m-badge-symbol', !dot && !icon && 'm-badge-symbol--automatic')}
        aria-hidden="true"
      >
        {dot ? (
          <span className="m-badge-dot" />
        ) : (
          (icon ?? <NativeIcon name={symbol} size={16} monochrome />)
        )}
      </span>
      {children}
    </span>
  );
}

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  trailing?: ReactNode;
  action?: ReactNode;
}
export function Alert({
  tone = 'info',
  title,
  children,
  trailing,
  action,
  className,
  role,
  ...props
}: AlertProps) {
  const AlertIcon =
    tone === 'success'
      ? CheckCircle2
      : tone === 'warning' || tone === 'danger'
        ? AlertCircle
        : Info;
  const nativeSymbol =
    tone === 'success'
      ? 'support-success'
      : tone === 'danger'
        ? 'support-error'
        : tone === 'warning'
          ? 'support-warning'
          : 'support-info';
  return (
    <div
      {...props}
      className={cx('m-alert', `m-tone--${tone}`, className)}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
    >
      <AlertIcon size={22} className="m-alert-icon m-alert-icon--web" aria-hidden="true" />
      <NativeIcon
        name={nativeSymbol}
        size={24}
        monochrome
        className="m-alert-icon m-alert-icon--native"
      />
      <div className="m-alert-copy">
        {title && <div className="m-alert-title">{title}</div>}
        {children && <div className="m-alert-body">{children}</div>}
        {action && <div className="m-alert-action">{action}</div>}
      </div>
      <span className={cx('m-alert-trailing', !trailing && 'm-alert-trailing--empty')}>
        {trailing}
      </span>
    </div>
  );
}

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}
export function Card({ title, action, children, className, ...props }: CardProps) {
  return (
    <div {...props} className={cx('m-card', className)}>
      {(title || action) && (
        <div className="m-card-header">
          {title && <h3 className="m-card-title">{title}</h3>}
          {action && <div className="m-card-action">{action}</div>}
        </div>
      )}
      <div className="m-card-content">{children}</div>
    </div>
  );
}

export interface ServiceTileProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  icon: ReactNode;
  title: string;
  description?: string;
  color?: string;
  onClick?: () => void;
}
function RowChevron({ className }: { className: string }) {
  return (
    <span className={cx('m-row-chevron', className)} aria-hidden="true">
      <ChevronRight className="m-symbol--web" size={20} />
      <span className="m-symbol--native">
        <NativeIcon name="chevron-right" size={24} />
      </span>
    </span>
  );
}
export const ServiceTile = /* @__PURE__ */ forwardRef<HTMLElement, ServiceTileProps>(
  function ServiceTile(
    { icon, title, description, color, onClick, className, style, ...props },
    ref,
  ) {
    const content = (
      <>
        <span className="m-service-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="m-service-copy">
          <span className="m-service-title">{title}</span>
          {description && <span className="m-service-description">{description}</span>}
        </span>
        {onClick && <RowChevron className="m-service-chevron" />}
      </>
    );
    const shared = {
      ...props,
      className: cx('m-service-tile', onClick && 'm-service-tile--interactive', className),
      style: { ...style, '--m-service-color': color ?? 'var(--m-brand)' } as CSSProperties,
    };
    return onClick ? (
      <button {...shared} ref={ref as Ref<HTMLButtonElement>} type="button" onClick={onClick}>
        {content}
      </button>
    ) : (
      <article {...shared} ref={ref}>
        {content}
      </article>
    );
  },
);

export interface ListRowProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}
export const ListRow = /* @__PURE__ */ forwardRef<HTMLElement, ListRowProps>(function ListRow(
  { icon, title, description, trailing, onClick, className, ...props },
  ref,
) {
  const content = (
    <>
      {icon && (
        <span className="m-list-row-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="m-list-row-copy">
        <span className="m-list-row-title">{title}</span>
        {description && <span className="m-list-row-description">{description}</span>}
      </span>
      {trailing ? (
        <span className="m-list-row-trailing">{trailing}</span>
      ) : onClick ? (
        <RowChevron className="m-list-row-chevron" />
      ) : null}
    </>
  );
  return onClick ? (
    <button
      {...props}
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      className={cx('m-list-row', 'm-list-row--interactive', className)}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <div {...props} ref={ref as Ref<HTMLDivElement>} className={cx('m-list-row', className)}>
      {content}
    </div>
  );
});

export interface TabsProps {
  items: Array<{ value: string; label: ReactNode; content: ReactNode; disabled?: boolean }>;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  className?: string;
}
export function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  label = 'Widoki',
  className,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      className={cx('m-tabs', className)}
      defaultValue={defaultValue ?? items[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      <TabsPrimitive.List className="m-tabs-list" aria-label={label}>
        {items.map((item) => (
          <TabsPrimitive.Trigger
            className="m-tabs-trigger"
            key={item.value}
            value={item.value}
            disabled={item.disabled}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content className="m-tabs-content" value={item.value} key={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

export interface DialogProps {
  trigger: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
export const DialogClose = DialogPrimitive.Close;
export function Dialog({
  trigger,
  title,
  description,
  children,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: DialogProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const descriptionId = useId();
  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <div className="m-dialog-scope" ref={setContainer}>
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
        {container && (
          <DialogPrimitive.Portal container={container}>
            <DialogPrimitive.Overlay className="m-dialog-overlay" />
            <DialogPrimitive.Content
              className={cx('m-dialog', className)}
              aria-describedby={description ? descriptionId : undefined}
            >
              <div className="m-dialog-header">
                <DialogPrimitive.Title className="m-dialog-title">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Close asChild>
                  <IconButton label="Zamknij okno">
                    <X className="m-symbol--web" size={21} />
                    <span className="m-symbol--native">
                      <NativeIcon name="close" size={24} />
                    </span>
                  </IconButton>
                </DialogPrimitive.Close>
              </div>
              {description && (
                <DialogPrimitive.Description id={descriptionId} className="m-dialog-description">
                  {description}
                </DialogPrimitive.Description>
              )}
              <div className="m-dialog-body">{children}</div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </div>
    </DialogPrimitive.Root>
  );
}

export interface AccordionEntry {
  id?: string;
  title: ReactNode;
  content: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  contentPadding?: CSSProperties['padding'];
}
export interface AccordionProps {
  items: AccordionEntry[];
  className?: string;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  multiple?: boolean;
}
export function Accordion({
  items,
  className,
  expanded,
  defaultExpanded,
  onExpandedChange,
  multiple = true,
}: AccordionProps) {
  const generatedId = useId();
  const itemKey = (item: AccordionEntry, index: number) => item.id ?? String(index);
  const [internalExpanded, setInternalExpanded] = useState<string[]>(
    () =>
      defaultExpanded ??
      items.flatMap((item, index) =>
        (item.defaultOpen ?? item.open) ? [itemKey(item, index)] : [],
      ),
  );
  const active = expanded ?? internalExpanded;
  function change(item: AccordionEntry, index: number, open: boolean) {
    const key = itemKey(item, index);
    const current = items.flatMap((entry, i) =>
      (entry.open ?? active.includes(itemKey(entry, i))) ? [itemKey(entry, i)] : [],
    );
    const next = open
      ? multiple
        ? Array.from(new Set([...current, key]))
        : [key]
      : current.filter((value) => value !== key);
    if (expanded === undefined) setInternalExpanded(next);
    item.onExpandedChange?.(open);
    onExpandedChange?.(next);
  }
  return (
    <div className={cx('m-accordion', className)}>
      {items.map((item, index) => {
        const key = itemKey(item, index),
          open = item.open ?? active.includes(key),
          contentId = `${generatedId}-${index}-content`,
          triggerId = `${generatedId}-${index}-trigger`;
        return (
          <details className="m-accordion-item" key={key} open={open}>
            <summary
              id={triggerId}
              className="m-accordion-trigger"
              aria-expanded={open}
              aria-controls={contentId}
              aria-disabled={item.disabled || undefined}
              onClick={(event) => {
                event.preventDefault();
                if (!item.disabled) change(item, index, !open);
              }}
            >
              <span>{item.title}</span>
              <span className="m-accordion-chevron" aria-hidden="true">
                <ChevronDown className="m-symbol--web" size={20} />
                <span className="m-symbol--native">
                  <NativeIcon name="chevron-down" size={24} />
                </span>
              </span>
            </summary>
            <div
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              className="m-accordion-content"
              hidden={!open}
              style={
                item.contentPadding === undefined ? undefined : { padding: item.contentPadding }
              }
            >
              {item.content}
            </div>
          </details>
        );
      })}
    </div>
  );
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: 'sm' | 'md' | 'lg' | number;
}
export function Avatar({ name, size = 'md', className, style, ...props }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toLocaleUpperCase('pl-PL');
  return (
    <span
      {...props}
      className={cx('m-avatar', typeof size === 'string' && `m-avatar--${size}`, className)}
      role="img"
      aria-label={name}
      style={typeof size === 'number' ? { ...style, width: size, height: size } : style}
    >
      {initials || '?'}
    </span>
  );
}

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  label?: string;
}
export function Progress({ value, label, className, ...props }: ProgressProps) {
  const id = useId();
  const boundedValue = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div className={cx('m-progress-field', className)}>
      {label && (
        <div className="m-progress-label">
          <span id={id}>{label}</span>
          <span>{Math.round(boundedValue)}%</span>
        </div>
      )}
      <div
        {...props}
        className="m-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={boundedValue}
        aria-labelledby={label ? id : undefined}
        aria-label={label ? undefined : (props['aria-label'] ?? 'Postęp')}
      >
        <span style={{ width: `${boundedValue}%` }} />
      </div>
    </div>
  );
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
}
export function Skeleton({
  width,
  height,
  rounded = false,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      {...props}
      className={cx('m-skeleton', rounded && 'm-skeleton--rounded', className)}
      style={{ ...style, width: width ?? style?.width, height: height ?? style?.height ?? 16 }}
      aria-hidden="true"
    />
  );
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cx('m-empty', className)}>
      <span className="m-empty-icon" aria-hidden="true">
        {icon ?? <Search size={28} />}
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="m-empty-action">{action}</div>}
    </div>
  );
}

export interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Ścieżka nawigacji" className={cx('m-breadcrumbs', className)}>
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
            {item.href && index !== items.length - 1 ? (
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

export interface PaginationProps {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}
export function Pagination({ page, total, onPageChange, className }: PaginationProps) {
  const max = Number.isFinite(total) ? Math.max(1, Math.floor(total)) : 1;
  const current = Math.min(max, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1));
  const pages = Array.from(
    new Set([
      1,
      ...Array.from({ length: 5 }, (_, index) => current - 2 + index).filter(
        (value) => value > 0 && value <= max,
      ),
      max,
    ]),
  ).sort((a, b) => a - b);
  return (
    <nav className={cx('m-pagination', className)} aria-label="Strony wyników">
      <IconButton
        label="Poprzednia strona"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        <ChevronLeft size={18} />
      </IconButton>
      {pages.map((number, index) => (
        <span className="m-pagination-item" key={number}>
          {index > 0 && number - pages[index - 1] > 1 && (
            <span className="m-pagination-gap" aria-hidden="true">
              …
            </span>
          )}
          <button
            type="button"
            className="m-pagination-page"
            aria-label={`Strona ${number}`}
            aria-current={number === current ? 'page' : undefined}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        </span>
      ))}
      <IconButton
        label="Następna strona"
        disabled={current === max}
        onClick={() => onPageChange(current + 1)}
      >
        <ChevronRight size={18} />
      </IconButton>
    </nav>
  );
}

export interface SpinnerProps {
  label?: string;
  size?: number;
  className?: string;
}
export function Spinner({ label = 'Ładowanie', size = 20, className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cx('m-spinner', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity=".22" />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
}
export function Tooltip({ content, children }: TooltipProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <div className="m-tooltip-scope" ref={setContainer}>
          <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
          {container && (
            <TooltipPrimitive.Portal container={container}>
              <TooltipPrimitive.Content className="m-tooltip" sideOffset={7}>
                {content}
                <TooltipPrimitive.Arrow className="m-tooltip-arrow" />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          )}
        </div>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr {...props} className={cx('m-divider', className)} />;
}
