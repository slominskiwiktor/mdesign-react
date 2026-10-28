import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type {
  FocusEventHandler,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { Checkbox, Radio, TextField } from '../components.js';
import { OfficialIcon } from '../OfficialIcon.js';
import { NativeIcon } from '../NativeIcon.js';
import { countCharacters, splitCharacters, mobileClass, useMobileValue } from './shared.js';

export function FieldHelper({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} className={mobileClass('field-helper')}>
      {children}
    </p>
  );
}
export function FieldError({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} role="alert" className={mobileClass('field-error')}>
      <NativeIcon name="field-error" size={16} />
      {children}
    </p>
  );
}
export interface PinInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'maxLength'
> {
  label: string;
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  masked?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
}
/** Source: iOS PinInputTextField: one secure input,40×48 cells, default4; browser owns text selection/OTP integration. */
export const PinInput = /* @__PURE__ */ forwardRef<HTMLInputElement, PinInputProps>(
  function PinInput(
    {
      label,
      length = 4,
      value,
      defaultValue = '',
      onValueChange,
      onComplete,
      masked = true,
      error,
      hint,
      id,
      className,
      onFocus,
      onBlur,
      onPaste,
      onKeyUp,
      ...props
    },
    ref,
  ) {
    const size = Math.max(1, Math.min(12, Math.floor(length) || 4));
    const own = useRef<HTMLInputElement | null>(null);
    const [text, setText] = useMobileValue(value, defaultValue, onValueChange, own);
    const [focus, setFocus] = useState(false);
    const [cursor, setCursor] = useState(0);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        own.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      },
      [ref],
    );
    const uid = useId();
    const fieldId = id ?? uid;
    const clean = (s: string) => s.replace(/\D/g, '').slice(0, size);
    const update = (next: string) => {
      const normalized = clean(next);
      if (normalized !== text) {
        setText(normalized);
        if (normalized.length === size) onComplete?.(normalized);
      }
      setCursor(Math.min(normalized.length, size - 1));
    };
    return (
      <div className={mobileClass('pin-field', className)}>
        <label htmlFor={fieldId}>{label}</label>
        <div className="m-mobile-pin-cells" data-error={!!error}>
          <input
            {...props}
            ref={setInputRef}
            id={fieldId}
            type={masked ? 'password' : 'text'}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={clean(text)}
            maxLength={size}
            aria-invalid={!!error}
            aria-describedby={error || hint ? fieldId + '-description' : undefined}
            onChange={(e) => update(e.target.value)}
            onFocus={(e) => {
              setFocus(true);
              setCursor(e.currentTarget.selectionStart ?? text.length);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocus(false);
              onBlur?.(e);
            }}
            onSelect={(e) => setCursor(e.currentTarget.selectionStart ?? text.length)}
            onKeyUp={(e) => {
              setCursor(e.currentTarget.selectionStart ?? text.length);
              onKeyUp?.(e);
            }}
            onPaste={(e) => {
              onPaste?.(e);
              if (e.defaultPrevented) return;
              e.preventDefault();
              const input = e.currentTarget;
              const start = input.selectionStart ?? text.length,
                end = input.selectionEnd ?? start;
              update(
                text.slice(0, start) +
                  e.clipboardData.getData('text').replace(/\D/g, '') +
                  text.slice(end),
              );
            }}
          />
          {Array.from({ length: size }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="m-mobile-pin-cell"
              data-active={focus && Math.min(cursor, size - 1) === i}
              data-filled={i < text.length}
            >
              {i < text.length ? masked ? <i /> : text[i] : ''}
            </span>
          ))}
        </div>
        {error ? (
          <FieldError id={fieldId + '-description'}>{error}</FieldError>
        ) : hint ? (
          <FieldHelper id={fieldId + '-description'}>{hint}</FieldHelper>
        ) : null}
      </div>
    );
  },
);
export interface PhoneValue {
  countryCode: string;
  number: string;
}
export interface PhoneFieldProps {
  label: string;
  value?: PhoneValue;
  defaultValue?: PhoneValue;
  onValueChange?: (value: PhoneValue) => void;
  /** Native form name for the separate country-code input. */
  countryCodeName?: string;
  /** Native form name for the separate local-number input. */
  numberName?: string;
  /** Runs once focus leaves the entire field, not between its inputs or clear action. */
  onBlur?: FocusEventHandler<HTMLFieldSetElement>;
  countryCodeError?: ReactNode;
  numberError?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  countryCodeLabel?: string;
  numberLabel?: string;
  placeholder?: string;
}
export const PhoneField = /* @__PURE__ */ forwardRef<HTMLInputElement, PhoneFieldProps>(
  function PhoneField(
    {
      label,
      value,
      defaultValue = { countryCode: '+48', number: '' },
      onValueChange,
      countryCodeName,
      numberName,
      onBlur,
      countryCodeError,
      numberError,
      hint,
      disabled,
      required,
      id,
      className,
      countryCodeLabel = 'Kod kraju',
      numberLabel = 'Numer telefonu',
      placeholder = '000 000 000',
    },
    ref,
  ) {
    const numberRef = useRef<HTMLInputElement>(null);
    const [phone, setPhone] = useMobileValue(value, defaultValue, onValueChange, numberRef);
    const uid = useId(),
      fieldId = id ?? uid;
    const setNumberRef = useCallback(
      (node: HTMLInputElement | null) => {
        numberRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      },
      [ref],
    );
    const [focused, setFocused] = useState(false);
    const error = countryCodeError || numberError;
    return (
      <fieldset
        id={fieldId}
        className={mobileClass('phone-field', className)}
        disabled={disabled}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.(event);
        }}
      >
        <legend>
          {label}
          {required ? ' *' : ''}
        </legend>
        <div className="m-mobile-phone-inputs">
          <input
            id={fieldId + '-country-code'}
            name={countryCodeName}
            aria-label={label + ', ' + countryCodeLabel}
            type="tel"
            autoComplete="tel-country-code"
            required={required}
            value={phone.countryCode}
            onChange={(e) =>
              setPhone({
                ...phone,
                countryCode: '+' + e.target.value.replace(/\D/g, '').slice(0, 4),
              })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                numberRef.current?.focus();
              }
            }}
            aria-invalid={!!countryCodeError}
            aria-describedby={error || hint ? fieldId + '-description' : undefined}
          />
          <div
            className="m-mobile-phone-local"
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
            }}
          >
            <input
              ref={setNumberRef}
              id={fieldId + '-number'}
              name={numberName}
              aria-label={label + ', ' + numberLabel}
              type="tel"
              autoComplete="tel-national"
              required={required}
              placeholder={placeholder}
              value={phone.number}
              onChange={(e) =>
                setPhone({
                  ...phone,
                  number: e.target.value.replace(/[^\d\s()-]/g, '').slice(0, 24),
                })
              }
              aria-invalid={!!numberError}
              aria-describedby={error || hint ? fieldId + '-description' : undefined}
            />
            {focused && phone.number && (
              <button
                type="button"
                onClick={() => {
                  setPhone({ ...phone, number: '' });
                  numberRef.current?.focus();
                }}
                aria-label="Wyczyść numer telefonu"
              >
                <NativeIcon name="field-clear" size={24} />
              </button>
            )}
          </div>
        </div>
        {error ? (
          <FieldError id={fieldId + '-description'}>
            {countryCodeError}
            {countryCodeError && numberError ? ' ' : ''}
            {numberError}
          </FieldError>
        ) : hint ? (
          <FieldHelper id={fieldId + '-description'}>{hint}</FieldHelper>
        ) : null}
      </fieldset>
    );
  },
);
export type MobileMaskType = 'BLIK' | 'POST_CODE' | 'PHONE_COUNTRY_CODE';
export const mobileMasks: Record<MobileMaskType, string> = {
  BLIK: '### ###',
  POST_CODE: '##-###',
  PHONE_COUNTRY_CODE: '+48 #########',
};
export function formatMaskedValue(value: string, mask: string) {
  const firstSlot = mask.search(/[#A*]/);
  const prefix = firstSlot > 0 ? mask.slice(0, firstSlot) : '';
  const unprefixed = prefix && value.startsWith(prefix) ? value.slice(prefix.length) : value;
  const chars = Array.from(unprefixed).filter((c) => /[\p{L}\p{N}]/u.test(c));
  let i = 0,
    formatted = '',
    raw = '';
  for (const token of mask) {
    if (token === '#' || token === 'A' || token === '*') {
      const pattern = token === '#' ? /\d/ : token === 'A' ? /\p{L}/u : /[\p{L}\p{N}]/u;
      while (i < chars.length && !pattern.test(chars[i])) i++;
      if (i >= chars.length) break;
      formatted += chars[i];
      raw += chars[i++];
    } else if (chars.length) formatted += token;
  }
  return { formatted, raw };
}
export interface MaskedFieldProps extends Omit<PinInputProps, 'length' | 'masked' | 'onComplete'> {
  mask?: string;
  maskType?: MobileMaskType;
  onRawValueChange?: (raw: string) => void;
}
export const MaskedField = /* @__PURE__ */ forwardRef<HTMLInputElement, MaskedFieldProps>(
  function MaskedField(
    {
      mask,
      maskType,
      value,
      defaultValue = '',
      onValueChange,
      onRawValueChange,
      onKeyDown,
      placeholder,
      ...props
    },
    ref,
  ) {
    const resolvedMask = mask ?? (maskType ? mobileMasks[maskType] : '###########');
    const own = useRef<HTMLInputElement | null>(null);
    const [text, setText] = useMobileValue(value, defaultValue, onValueChange, own);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        own.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      },
      [ref],
    );
    const update = (next: string) => {
      const result = formatMaskedValue(next, resolvedMask);
      setText(result.formatted);
      onRawValueChange?.(result.raw);
    };
    return (
      <TextField
        {...props}
        ref={setInputRef}
        value={formatMaskedValue(text, resolvedMask).formatted}
        placeholder={placeholder ?? (maskType === 'POST_CODE' ? '__-___' : undefined)}
        inputMode={/^[#\s().+0-9/-]+$/.test(resolvedMask) ? 'numeric' : undefined}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          const caret = e.currentTarget.selectionStart ?? 0;
          if (
            e.key === 'Backspace' &&
            caret > 0 &&
            caret === e.currentTarget.selectionEnd &&
            !/[#A*]/.test(resolvedMask[caret - 1] ?? '')
          ) {
            e.preventDefault();
            let previous = caret - 2;
            while (previous >= 0 && !/[#A*]/.test(resolvedMask[previous])) previous--;
            if (previous >= 0) {
              update(
                e.currentTarget.value.slice(0, previous) +
                  e.currentTarget.value.slice(previous + 1),
              );
              const el = e.currentTarget;
              requestAnimationFrame(() => el.setSelectionRange(previous, previous));
            }
          }
        }}
        onChange={(e) => update(e.target.value)}
      />
    );
  },
);
export interface MobileTextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'value' | 'defaultValue'
> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  mode?: 'fixed' | 'flexible';
  minHeight?: number;
  maxHeight?: number;
  characterLimit?: number;
  hardLimit?: boolean;
  onLimitReached?: (over: boolean) => void;
  error?: ReactNode;
  hint?: ReactNode;
}
export const MobileTextArea = /* @__PURE__ */ forwardRef<HTMLTextAreaElement, MobileTextAreaProps>(
  function MobileTextArea(
    {
      label,
      value,
      defaultValue = '',
      onValueChange,
      mode = 'fixed',
      minHeight = 48,
      maxHeight = 128,
      characterLimit,
      hardLimit = false,
      onLimitReached,
      error,
      hint,
      id,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const own = useRef<HTMLTextAreaElement | null>(null);
    const [text, setText] = useMobileValue(value, defaultValue, onValueChange, own);
    const uid = useId(),
      fieldId = id ?? uid;
    const setTextareaRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        own.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      },
      [ref],
    );
    const count = countCharacters(text),
      over = characterLimit !== undefined && count > characterLimit;
    useEffect(() => {
      onLimitReached?.(over);
    }, [over, onLimitReached]);
    useEffect(() => {
      const el = own.current;
      if (el && mode === 'flexible') {
        el.style.height = 'auto';
        el.style.height = Math.min(maxHeight, Math.max(minHeight, el.scrollHeight)) + 'px';
      }
    }, [text, mode, minHeight, maxHeight]);
    return (
      <div className={mobileClass('textarea-field', className)}>
        <label htmlFor={fieldId}>{label}</label>
        <div className="m-mobile-textarea-wrap" data-error={!!error || over}>
          <textarea
            {...props}
            ref={setTextareaRef}
            id={fieldId}
            value={text}
            style={{
              ...style,
              height: mode === 'fixed' ? maxHeight : undefined,
              minHeight: mode === 'flexible' ? minHeight : undefined,
              maxHeight,
            }}
            onChange={(e) =>
              setText(
                hardLimit && characterLimit !== undefined
                  ? splitCharacters(e.target.value).slice(0, characterLimit).join('')
                  : e.target.value,
              )
            }
            aria-invalid={!!error || over}
            aria-describedby={error || hint ? fieldId + '-description' : undefined}
          />
          {characterLimit !== undefined && (
            <span
              className="m-mobile-character-count"
              data-over={over}
              aria-live="polite"
              aria-label={count + ' z ' + characterLimit + ' znaków'}
            >
              {count}/{characterLimit}
            </span>
          )}
        </div>
        {error ? (
          <FieldError id={fieldId + '-description'}>{error}</FieldError>
        ) : hint ? (
          <FieldHelper id={fieldId + '-description'}>{hint}</FieldHelper>
        ) : null}
      </div>
    );
  },
);
export interface ChoiceOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}
export interface CheckboxGroupProps {
  label: ReactNode;
  options: ChoiceOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  helperAction?: ReactNode;
  className?: string;
}
export function CheckboxGroup({
  label,
  options,
  value,
  defaultValue = [],
  onValueChange,
  hint,
  error,
  disabled,
  helperAction,
  className,
}: CheckboxGroupProps) {
  const [selected, setSelected] = useMobileValue(value, defaultValue, onValueChange);
  const id = useId();
  return (
    <fieldset
      className={mobileClass('choice-group', className)}
      disabled={disabled}
      aria-describedby={error || hint ? id : undefined}
    >
      <legend>
        {label}
        {helperAction}
      </legend>
      {options.map((o) => (
        <Checkbox
          key={o.value}
          label={o.label}
          hint={o.description}
          disabled={o.disabled || disabled}
          checked={selected.includes(o.value)}
          onChange={(e) =>
            setSelected(
              e.target.checked ? [...selected, o.value] : selected.filter((v) => v !== o.value),
            )
          }
          aria-invalid={!!error}
        />
      ))}
      {error ? (
        <FieldError id={id}>{error}</FieldError>
      ) : hint ? (
        <FieldHelper id={id}>{hint}</FieldHelper>
      ) : null}
    </fieldset>
  );
}
export interface RadioGroupProps extends Omit<
  CheckboxGroupProps,
  'value' | 'defaultValue' | 'onValueChange'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  variant?: 'default' | 'content-box';
}
export function RadioGroup({
  label,
  options,
  value,
  defaultValue = '',
  onValueChange,
  hint,
  error,
  disabled,
  helperAction,
  className,
  name,
  variant = 'default',
}: RadioGroupProps) {
  const [selected, setSelected] = useMobileValue(value, defaultValue, onValueChange);
  const uid = useId();
  return (
    <fieldset
      className={mobileClass('choice-group', className)}
      disabled={disabled}
      data-variant={variant}
      aria-describedby={error || hint ? uid : undefined}
    >
      <legend>
        {label}
        {helperAction}
      </legend>
      {options.map((o) => (
        <Radio
          key={o.value}
          name={name ?? uid}
          value={o.value}
          label={o.label}
          hint={o.description}
          disabled={o.disabled || disabled}
          checked={selected === o.value}
          onChange={() => setSelected(o.value)}
          aria-invalid={!!error}
        />
      ))}
      {error ? (
        <FieldError id={uid}>{error}</FieldError>
      ) : hint ? (
        <FieldHelper id={uid}>{hint}</FieldHelper>
      ) : null}
    </fieldset>
  );
}
export interface MobileSwitchProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  extra?: ReactNode;
  standalone?: boolean;
  className?: string;
}
export function MobileSwitch({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  hint,
  error,
  extra,
  standalone,
  className,
}: MobileSwitchProps) {
  const [on, setOn] = useMobileValue(checked, defaultChecked, onCheckedChange);
  const id = useId();
  return (
    <div className={mobileClass('switch-field', className)}>
      {!standalone && (
        <div className="m-mobile-switch-copy">
          <label htmlFor={id}>{label}</label>
          {hint && <FieldHelper>{hint}</FieldHelper>}
          {extra}
        </div>
      )}
      <button
        id={id}
        type="button"
        className="m-mobile-switch"
        role="switch"
        aria-checked={on}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? id + '-error' : undefined}
        disabled={disabled}
        onClick={() => setOn(!on)}
      >
        <span />
      </button>
      {error && <FieldError id={id + '-error'}>{error}</FieldError>}
    </div>
  );
}
export interface InputDateTimeProps {
  label: string;
  type?: 'date' | 'time';
  value?: string;
  onClick: () => void;
  disabled?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
  className?: string;
}
export function InputDateTime({
  label,
  type = 'date',
  value,
  onClick,
  disabled,
  error,
  hint,
  className,
}: InputDateTimeProps) {
  const id = useId();
  return (
    <div className={mobileClass('date-trigger-field', className)}>
      <span id={id}>{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-labelledby={id}
        aria-describedby={error || hint ? id + '-description' : undefined}
        aria-invalid={!!error}
      >
        <span data-placeholder={!value}>{value || (type === 'date' ? 'DD.MM.RRRR' : 'GG:MM')}</span>
        <OfficialIcon
          name={
            type === 'date'
              ? 'Icons/Outline/Symbols/AA007_Date_picker/AA007_Date_picker'
              : 'Icons/Outline/Symbols/AA016_History/AA016_History'
          }
          size={24}
        />
      </button>
      {error ? (
        <FieldError id={id + '-description'}>{error}</FieldError>
      ) : hint ? (
        <FieldHelper id={id + '-description'}>{hint}</FieldHelper>
      ) : null}
    </div>
  );
}
