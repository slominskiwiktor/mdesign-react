import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../components.js';
import { NativeIcon } from '../NativeIcon.js';
import {
  addPortalDays,
  addPortalMonths,
  formatPortalDate,
  parsePortalDate,
  portalDateInRange,
} from '../portal/dates.js';
import { InputDateTime } from './inputs.js';
import { MobileDialog } from './overlays.js';
import { MobileTextButton } from './content.js';
import { mobileClass, useMobileValue } from './shared.js';
export interface MobileCalendarProps {
  value?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
  isDateDisabled?: (date: string) => boolean;
  today?: string;
  label?: string;
  className?: string;
}
export function MobileCalendar({
  value,
  onValueChange,
  min,
  max,
  isDateDisabled,
  today = formatPortalDate(new Date()),
  label = 'Kalendarz',
  className,
}: MobileCalendarProps) {
  const initial = parsePortalDate(value ?? '') ?? parsePortalDate(today) ?? new Date();
  const [view, setView] = useState(initial),
    [focused, setFocused] = useState(formatPortalDate(initial));
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const id = useId();
  const start = new Date(view.getFullYear(), view.getMonth(), 1, 12);
  const offset = (start.getDay() + 6) % 7;
  const gridStart = addPortalDays(start, -offset);
  const dates = Array.from({ length: 42 }, (_, i) => addPortalDays(gridStart, i));
  const disabled = (iso: string) => !portalDateInRange(iso, min, max) || !!isDateDisabled?.(iso);
  // Roving focus needs an enabled entry point even when today, a formerly
  // selected date or the previous constraints no longer permit `focused`.
  // Prefer this month without moving the visible month or the user's focus.
  const enabledDates = dates.filter((date) => !disabled(formatPortalDate(date)));
  const tabStop =
    enabledDates.find((date) => formatPortalDate(date) === focused) ??
    enabledDates.find((date) => date.getMonth() === view.getMonth()) ??
    enabledDates[0];
  const tabStopISO = tabStop && formatPortalDate(tabStop);
  useEffect(() => {
    if (value && parsePortalDate(value)) {
      setView(parsePortalDate(value)!);
      setFocused(value);
    }
  }, [value]);
  function focusDate(date: Date) {
    const origin = parsePortalDate(focused);
    const direction = origin && date < origin ? -1 : 1;
    let candidate = formatPortalDate(date);
    let count = 0;
    while (disabled(candidate) && count < 366) {
      date = addPortalDays(date, direction);
      candidate = formatPortalDate(date);
      count++;
    }
    if (disabled(candidate)) return;
    setView(date);
    setFocused(candidate);
    requestAnimationFrame(() => refs.current.get(candidate)?.focus());
  }
  function changeMonth(next: Date) {
    setView(next);
    let date = new Date(next.getFullYear(), next.getMonth(), 1, 12);
    for (let i = 0; i < 31; i++) {
      const iso = formatPortalDate(date);
      if (!disabled(iso)) {
        setFocused(iso);
        return;
      }
      date = addPortalDays(date, 1);
      if (date.getMonth() !== next.getMonth()) break;
    }
  }
  const previous = addPortalMonths(start, -1),
    next = addPortalMonths(start, 1);
  const prevLast = formatPortalDate(
      new Date(previous.getFullYear(), previous.getMonth() + 1, 0, 12),
    ),
    nextFirst = formatPortalDate(new Date(next.getFullYear(), next.getMonth(), 1, 12));
  return (
    <div className={mobileClass('calendar', className)}>
      <div className="m-mobile-calendar-header">
        <button
          type="button"
          disabled={!!min && prevLast < min}
          aria-label="Poprzedni miesiąc"
          onClick={() => changeMonth(previous)}
        >
          <NativeIcon name="chevron-left" size={24} />
        </button>
        <h3 id={id} aria-live="polite">
          {new Intl.DateTimeFormat('pl-PL', {
            month: 'long',
            year: 'numeric',
          }).format(view)}
        </h3>
        <button
          type="button"
          disabled={!!max && nextFirst > max}
          aria-label="Następny miesiąc"
          onClick={() => changeMonth(next)}
        >
          <NativeIcon name="chevron-right" size={24} />
        </button>
      </div>
      <table role="grid" aria-label={label} aria-labelledby={id}>
        <thead>
          <tr>
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d, i) => (
              <th
                key={d}
                scope="col"
                abbr={
                  ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'][
                    i
                  ]
                }
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, row) => (
            <tr key={row}>
              {dates.slice(row * 7, row * 7 + 7).map((date) => {
                const iso = formatPortalDate(date);
                return (
                  <td key={iso} aria-selected={value === iso}>
                    <button
                      type="button"
                      ref={(node) => {
                        if (node) refs.current.set(iso, node);
                        else refs.current.delete(iso);
                      }}
                      disabled={disabled(iso)}
                      aria-label={new Intl.DateTimeFormat('pl-PL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }).format(date)}
                      aria-current={iso === today ? 'date' : undefined}
                      data-selected={value === iso}
                      data-outside={date.getMonth() !== view.getMonth()}
                      tabIndex={iso === tabStopISO ? 0 : -1}
                      onFocus={() => setFocused(iso)}
                      onClick={() => {
                        onValueChange?.(iso);
                        setFocused(iso);
                      }}
                      onKeyDown={(e) => {
                        let target: Date | undefined;
                        if (e.key === 'ArrowRight') target = addPortalDays(date, 1);
                        if (e.key === 'ArrowLeft') target = addPortalDays(date, -1);
                        if (e.key === 'ArrowDown') target = addPortalDays(date, 7);
                        if (e.key === 'ArrowUp') target = addPortalDays(date, -7);
                        if (e.key === 'Home')
                          target = addPortalDays(date, -((date.getDay() + 6) % 7));
                        if (e.key === 'End')
                          target = addPortalDays(date, 6 - ((date.getDay() + 6) % 7));
                        if (e.key === 'PageUp')
                          target = addPortalMonths(date, e.shiftKey ? -12 : -1);
                        if (e.key === 'PageDown')
                          target = addPortalMonths(date, e.shiftKey ? 12 : 1);
                        if (target) {
                          e.preventDefault();
                          focusDate(target);
                        }
                      }}
                    >
                      {date.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export interface MobileDatePickerProps extends Omit<
  MobileCalendarProps,
  'label' | 'onValueChange'
> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (date: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  clearable?: boolean;
}
export function MobileDatePicker({
  label,
  value,
  defaultValue = '',
  onValueChange,
  hint,
  error,
  disabled,
  clearable = true,
  className,
  ...calendar
}: MobileDatePickerProps) {
  const [selected, setSelected] = useMobileValue(value, defaultValue, onValueChange);
  const [draft, setDraft] = useState(selected),
    [open, setOpen] = useState(false);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const parsed = parsePortalDate(selected);
  return (
    <div className={mobileClass('date-picker-field', className)}>
      <InputDateTime
        label={label}
        value={parsed ? new Intl.DateTimeFormat('pl-PL').format(parsed) : undefined}
        onClick={() => {
          if (disabled) return;
          setDraft(selected);
          setOpen(true);
        }}
        hint={hint}
        error={error}
        disabled={disabled}
      />
      <MobileDialog
        title="Wybierz datę"
        open={open && !disabled}
        onOpenChange={(next) => setOpen(!disabled && next)}
        className="m-mobile-date-picker-dialog"
        actions={
          <>
            {clearable && (
              <MobileTextButton
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  setSelected('');
                  setOpen(false);
                }}
              >
                Wyczyść
              </MobileTextButton>
            )}
            <MobileTextButton onClick={() => setOpen(false)}>Anuluj</MobileTextButton>
            <Button
              disabled={
                disabled ||
                !draft ||
                !portalDateInRange(draft, calendar.min, calendar.max) ||
                !!calendar.isDateDisabled?.(draft)
              }
              onClick={() => {
                if (disabled) return;
                setSelected(draft);
                setOpen(false);
              }}
            >
              Zatwierdź
            </Button>
          </>
        }
      >
        <MobileCalendar {...calendar} value={draft} onValueChange={setDraft} />
      </MobileDialog>
    </div>
  );
}
export interface MobileTimePickerProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (time: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
}
export function MobileTimePicker({
  label,
  value,
  defaultValue = '',
  onValueChange,
  hint,
  error,
  disabled,
  className,
}: MobileTimePickerProps) {
  const [selected, setSelected] = useMobileValue(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(false),
    [hours, setHours] = useState('12'),
    [minutes, setMinutes] = useState('00');
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const valid =
    /^\d{1,2}$/.test(hours) &&
    Number(hours) <= 23 &&
    /^\d{1,2}$/.test(minutes) &&
    Number(minutes) <= 59;
  return (
    <div className={mobileClass('time-picker', className)}>
      <InputDateTime
        label={label}
        type="time"
        value={selected}
        hint={hint}
        error={error}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          const [h, m] = (selected || '12:00').split(':');
          setHours(h);
          setMinutes(m);
          setOpen(true);
        }}
      />
      <MobileDialog
        title="Wybierz godzinę"
        open={open && !disabled}
        onOpenChange={(next) => setOpen(!disabled && next)}
        actions={
          <>
            <MobileTextButton onClick={() => setOpen(false)}>Anuluj</MobileTextButton>
            <Button
              disabled={disabled || !valid}
              onClick={() => {
                if (disabled) return;
                setSelected(hours.padStart(2, '0') + ':' + minutes.padStart(2, '0'));
                setOpen(false);
              }}
            >
              Zatwierdź
            </Button>
          </>
        }
      >
        <div className="m-mobile-time-inputs">
          <label>
            Godzina
            <input
              aria-label="Godzina"
              type="text"
              inputMode="numeric"
              maxLength={2}
              disabled={disabled}
              value={hours}
              onChange={(e) => setHours(e.target.value.replace(/\D/g, ''))}
              aria-invalid={!/^\d{1,2}$/.test(hours) || Number(hours) > 23}
            />
          </label>
          <span>:</span>
          <label>
            Minuty
            <input
              aria-label="Minuty"
              type="text"
              inputMode="numeric"
              maxLength={2}
              disabled={disabled}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))}
              aria-invalid={!/^\d{1,2}$/.test(minutes) || Number(minutes) > 59}
            />
          </label>
        </div>
      </MobileDialog>
    </div>
  );
}
