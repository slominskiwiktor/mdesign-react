import { PortalPopupLayer, usePortalPopup } from './popup.js';
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { CalendarDays, X } from './glyphs.js';
import { PortalIcon } from './PortalIcon.js';
import * as Dialog from '@radix-ui/react-dialog';
import { usePortalState } from './state.js';
import {
  addPortalDays,
  addPortalMonths,
  formatPortalDate,
  parsePortalDate,
  portalDateInRange,
} from './dates.js';
export interface PortalCalendarProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (date: string) => void;
  month?: string;
  defaultMonth?: string;
  onMonthChange?: (month: string) => void;
  min?: string;
  max?: string;
  isDateDisabled?: (date: string) => boolean;
  locale?: string;
  firstDayOfWeek?: 0 | 1;
  showAdjacentDates?: boolean;
  label?: string;
  className?: string;
  style?: CSSProperties;
  events?: Record<string, string>;
  onDateFocus?: (date: string) => void;
}
export function PortalCalendar({
  value,
  defaultValue = '',
  onValueChange,
  month,
  defaultMonth,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  locale = 'pl-PL',
  firstDayOfWeek = 1,
  showAdjacentDates = true,
  label = 'Kalendarz',
  className = '',
  style,
  events,
  onDateFocus,
}: PortalCalendarProps) {
  const today = formatPortalDate(new Date());
  const [selected, setSelected] = usePortalState(value, defaultValue, onValueChange);
  const [shown, setShown] = usePortalState(month, defaultMonth ?? selected ?? today, onMonthChange);
  const parsed = parsePortalDate(shown) || parsePortalDate(selected) || new Date();
  const first = new Date(parsed.getFullYear(), parsed.getMonth(), 1, 12);
  const [active, setActive] = useState(selected || formatPortalDate(first));
  const grid = useRef<HTMLTableElement>(null);
  const id = useId();
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7;
  const rows = Math.ceil((count + offset) / 7);
  const available = (date: string) => portalDateInRange(date, min, max) && !isDateDisabled?.(date);
  function focus(date: Date) {
    let next = date;
    const current = parsePortalDate(active) ?? date;
    const direction = date < current ? -1 : 1;
    for (let i = 0; i < 3660 && !available(formatPortalDate(next)); i++) {
      const k = formatPortalDate(next);
      if ((min && k < min) || (max && k > max)) return;
      next = addPortalDays(next, direction);
    }
    const key = formatPortalDate(next);
    if (!available(key)) return;
    setActive(key);
    setShown(key);
    onDateFocus?.(key);
    requestAnimationFrame(() =>
      grid.current?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)?.focus(),
    );
  }
  function key(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    let next: Date | undefined;
    switch (event.key) {
      case 'ArrowLeft':
        next = addPortalDays(date, -1);
        break;
      case 'ArrowRight':
        next = addPortalDays(date, 1);
        break;
      case 'ArrowUp':
        next = addPortalDays(date, -7);
        break;
      case 'ArrowDown':
        next = addPortalDays(date, 7);
        break;
      case 'Home':
        next = addPortalDays(date, -((date.getDay() - firstDayOfWeek + 7) % 7));
        break;
      case 'End':
        next = addPortalDays(date, 6 - ((date.getDay() - firstDayOfWeek + 7) % 7));
        break;
      case 'PageUp':
        next = addPortalMonths(date, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addPortalMonths(date, event.shiftKey ? 12 : 1);
        break;
    }
    if (next) {
      event.preventDefault();
      focus(next);
    }
  }
  const monthText = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const tabbable =
    active.slice(0, 7) === formatPortalDate(first).slice(0, 7) && available(active)
      ? active
      : Array.from({ length: count }, (_, i) => formatPortalDate(addPortalDays(first, i))).find(
          available,
        );
  return (
    <section className={`mp-calendar ${className}`} style={style} aria-label={label}>
      <div className="mp-calendar-heading">
        <button
          type="button"
          aria-label="Poprzedni miesiąc"
          disabled={
            !!min && formatPortalDate(new Date(first.getFullYear(), first.getMonth(), 0, 12)) < min
          }
          onClick={() => setShown(formatPortalDate(addPortalMonths(first, -1)))}
        >
          <PortalIcon name="chevron-right" size={12} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <strong id={id} aria-live="polite">
          {monthText}
        </strong>
        <button
          type="button"
          aria-label="Następny miesiąc"
          disabled={!!max && formatPortalDate(addPortalMonths(first, 1)) > max}
          onClick={() => setShown(formatPortalDate(addPortalMonths(first, 1)))}
        >
          <PortalIcon name="chevron-right" size={12} />
        </button>
      </div>
      <table ref={grid} className="mp-calendar-table" role="grid" aria-labelledby={id}>
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, i) => (
              <th
                scope="col"
                key={i}
                aria-label={new Date(2024, 0, 7 + firstDayOfWeek + i).toLocaleDateString(locale, {
                  weekday: 'long',
                })}
              >
                {/^pl(?:-|$)/i.test(locale)
                  ? ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'][(firstDayOfWeek + i) % 7]
                  : new Date(2024, 0, 7 + firstDayOfWeek + i).toLocaleDateString(locale, {
                      weekday: 'short',
                    })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: 7 }, (_, c) => {
                const day = r * 7 + c - offset + 1;
                const date = new Date(first.getFullYear(), first.getMonth(), day, 12);
                const k = formatPortalDate(date);
                if (day < 1 || day > count)
                  return showAdjacentDates ? (
                    <td
                      key={c}
                      role="gridcell"
                      aria-disabled="true"
                      aria-label={date.toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      className="mp-calendar-adjacent"
                    >
                      <span aria-hidden="true">{date.getDate()}</span>
                    </td>
                  ) : (
                    <td key={c} role="gridcell" aria-disabled="true" />
                  );
                return (
                  <td key={c} role="gridcell" aria-selected={k === selected}>
                    <button
                      type="button"
                      data-date={k}
                      disabled={!available(k)}
                      tabIndex={k === tabbable ? 0 : -1}
                      aria-label={`${date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}${events?.[k] ? `, ${events[k]}` : ''}`}
                      aria-current={k === today ? 'date' : undefined}
                      onFocus={() => setActive(k)}
                      onKeyDown={(e) => key(e, date)}
                      onClick={() => {
                        setSelected(k);
                        setActive(k);
                      }}
                    >
                      <span>{day}</span>
                      {events?.[k] && <i aria-hidden="true" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
export interface PortalDatePickerProps extends Omit<
  PortalCalendarProps,
  'label' | 'style' | 'className' | 'onDateFocus'
> {
  label: string;
  name?: string;
  id?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
  onBlur?: () => void;
}
export const PortalDatePicker = /* @__PURE__ */ forwardRef<HTMLInputElement, PortalDatePickerProps>(
  function PortalDatePicker(
    {
      label,
      name,
      id,
      hint,
      error,
      required,
      disabled,
      readOnly,
      placeholder = 'rrrr-mm-dd',
      clearable = true,
      className = '',
      value,
      defaultValue = '',
      onValueChange,
      onBlur,
      ...calendar
    },
    ref,
  ) {
    const { min, max, isDateDisabled } = calendar;
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const generated = useId();
    const inputId = id ?? generated;
    const [date, setDate] = usePortalState(value, defaultValue, onValueChange);
    const [open, setOpen] = useState(false);
    const popup = usePortalPopup(open);
    const [draft, setDraft] = useState<string | null>(null);
    const text = draft ?? date;
    const [invalid, setInvalid] = useState(false);
    const ownRef = useRef<HTMLInputElement | null>(null);
    const blocked = !!disabled || !!readOnly;
    const available = (candidate: string) =>
      portalDateInRange(candidate, calendar.min, calendar.max) &&
      !calendar.isDateDisabled?.(candidate);
    const issue = error || (invalid ? 'Wpisz poprawną datę w formacie rrrr-mm-dd.' : undefined);

    useEffect(() => {
      setDraft(null);
      setInvalid(false);
    }, [date]);
    useEffect(() => {
      if (blocked) {
        setOpen(false);
        setDraft(null);
        setInvalid(false);
      }
    }, [blocked, date]);
    useEffect(() => {
      const bad = !!text && (!portalDateInRange(text, min, max) || !!isDateDisabled?.(text));
      ownRef.current?.setCustomValidity(
        error ?? (bad ? 'Wpisz poprawną datę w dozwolonym zakresie.' : ''),
      );
    }, [text, error, min, max, isDateDisabled]);

    function commit(next: string) {
      if (blocked) return;
      setDate(next);
      // Invalid/partial typing may be a draft, but a committed value belongs to the parent.
      setDraft(null);
      setInvalid(false);
    }

    return (
      <div className={`mp-date-field ${className}`} ref={setContainer}>
        <label htmlFor={inputId}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <Dialog.Root
          open={open && !blocked}
          onOpenChange={(next) => {
            if (!blocked) setOpen(next);
          }}
          modal={false}
        >
          <div className="mp-date-input">
            <input
              ref={(node) => {
                ownRef.current = node;
                popup.refs.setReference(node?.parentElement ?? null);
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
              }}
              id={inputId}
              name={name}
              value={text}
              required={required}
              disabled={disabled}
              readOnly={readOnly}
              placeholder={placeholder}
              inputMode="numeric"
              aria-invalid={!!issue || undefined}
              aria-describedby={hint || issue ? `${inputId}-hint` : undefined}
              onChange={(event) => {
                if (blocked) return;
                const next = event.target.value;
                if (!next || available(next)) commit(next);
                else setDraft(next);
              }}
              onBlur={() => {
                setInvalid(!!text && !available(text));
                onBlur?.();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setDraft(null);
                  setInvalid(false);
                  setOpen(false);
                }
                if (event.key === 'ArrowDown' && !blocked) {
                  event.preventDefault();
                  setOpen(true);
                }
              }}
            />
            {clearable && date && !blocked && (
              <button
                type="button"
                aria-label="Wyczyść datę"
                onClick={() => {
                  commit('');
                  ownRef.current?.focus();
                }}
              >
                <X size={18} />
              </button>
            )}
            <Dialog.Trigger asChild>
              <button type="button" aria-label="Wybierz datę" disabled={blocked}>
                <CalendarDays size={22} />
              </button>
            </Dialog.Trigger>
          </div>
          <PortalPopupLayer anchor={container}>
            <Dialog.Content
              className="mp-calendar-popover"
              ref={popup.refs.setFloating}
              style={popup.floatingStyles}
              aria-describedby={undefined}
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                requestAnimationFrame(() =>
                  document
                    .querySelector<HTMLButtonElement>(
                      `[data-portal-calendar="${inputId}"] [tabindex="0"]`,
                    )
                    ?.focus(),
                );
              }}
            >
              <Dialog.Title className="mp-sr">{label}</Dialog.Title>
              <div data-portal-calendar={inputId}>
                <PortalCalendar
                  {...calendar}
                  value={date}
                  defaultMonth={date || calendar.defaultMonth}
                  onValueChange={(next) => {
                    commit(next);
                    setOpen(false);
                  }}
                />
              </div>
            </Dialog.Content>
          </PortalPopupLayer>
        </Dialog.Root>
        {(hint || issue) && (
          <p
            id={`${inputId}-hint`}
            className={issue ? 'mp-field-error' : 'mp-helper'}
            role={issue ? 'alert' : undefined}
          >
            {issue || hint}
          </p>
        )}
      </div>
    );
  },
);
