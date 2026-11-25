import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type CalendarExample = {
  value?: string;
  defaultValue?: string;
  month?: string;
  defaultMonth?: string;
  today?: string;
  min?: string;
  max?: string;
  locale?: string;
  firstDayOfWeek?: 0 | 1;
  showAdjacentDates?: boolean;
  label?: string;
  events?: Record<string, string>;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  clearable?: boolean;
  triggerOnly?: boolean;
};

export function calendarNativeSource(
  name: 'MobileCalendar' | 'MobileDatePicker' | 'PortalCalendar' | 'PortalDatePicker',
  args: CalendarExample,
  platform: NativePlatformChoice,
) {
  const config = {
    label: args.label ?? 'Kalendarz',
    value: args.value ?? args.defaultValue ?? '',
    month: args.month ?? args.defaultMonth ?? '',
    today: args.today ?? '',
    min: args.min ?? '',
    max: args.max ?? '',
    locale: args.locale ?? 'pl-PL',
    firstDay: args.firstDayOfWeek ?? 1,
    adjacent: args.showAdjacentDates ?? true,
    sixWeeks: name.startsWith('Mobile'),
    picker: name.endsWith('DatePicker'),
    confirm: name === 'MobileDatePicker',
    typed: name === 'PortalDatePicker',
    triggerOnly: !!args.triggerOnly,
    disabled: !!(args.disabled || args.readOnly),
    placeholder: args.placeholder ?? (name === 'PortalDatePicker' ? 'rrrr-mm-dd' : 'Wybierz datę'),
    clearable: args.clearable ?? true,
    message: textOf(args.error ?? args.hint),
    error: !!args.error,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const events: Record<string, string> = ${JSON.stringify(args.events ?? {}, null, 2)};
const ios = ${ios};

function key(date: Date) { return date.toISOString().slice(0, 10); }
function parse(value: string) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return undefined;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && key(date) === value ? date : undefined;
}
function offsetDays(date: Date, amount: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(date.getUTCDate() + amount);
  return next;
}
function monthOf(date: Date, offset = 0) {
  const next = new Date(date.getTime());
  next.setUTCDate(1);
  next.setUTCMonth(date.getUTCMonth() + offset);
  return next;
}
function localDay() {
  const now = new Date();
  return String(now.getFullYear()).padStart(4, '0') + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}
function label(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(config.locale, { ...options, timeZone: 'UTC' }).format(date);
}

export default function CalendarExample({ isDateDisabled, onValueChange, onMonthChange, value: controlledValue, onPress }: {
  isDateDisabled?: (date: string) => boolean;
  value?: string;
  onPress?: () => void;
  onValueChange?: (date: string) => void;
  onMonthChange?: (month: string) => void;
} = {}) {
  const today = parse(config.today) ? config.today : localDay();
  const [localValue, setValue] = useState(config.value);
  const value = controlledValue ?? localValue;
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [month, setMonth] = useState(() => monthOf(parse(config.month) ?? parse(value) ?? parse(today)!));
  const offset = (month.getUTCDay() - config.firstDay + 7) % 7;
  const daysInMonth = offsetDays(monthOf(month, 1), -1).getUTCDate();
  const weeks = config.sixWeeks ? 6 : Math.ceil((daysInMonth + offset) / 7);
  const dates = Array.from({ length: weeks * 7 }, (_, index) => offsetDays(month, index - offset));
  const previous = monthOf(month, -1);
  const next = monthOf(month, 1);
  const unavailable = (date: string) => !!((config.min && date < config.min) ||
    (config.max && date > config.max) || isDateDisabled?.(date));

  function go(nextMonth: Date) {
    setMonth(nextMonth);
    onMonthChange?.(key(nextMonth));
  }

  function commit(date: string) {
    if (controlledValue === undefined) setValue(date);
    setDraft(date);
    setInvalid(false);
    onValueChange?.(date);
    if (config.picker) setOpen(false);
  }

  function select(date: string) {
    if (unavailable(date)) return;
    if (config.confirm) setDraft(date);
    else commit(date);
    if (date.slice(0, 7) !== key(month).slice(0, 7)) go(monthOf(parse(date)!));
  }

  function openCalendar() {
    if (config.disabled) return;
    if (config.triggerOnly && onPress) { onPress(); return; }
    const selected = parse(value);
    if (controlledValue !== undefined && selected && key(month).slice(0, 7) !== value.slice(0, 7)) setMonth(monthOf(selected));
    setDraft(value);
    setInvalid(false);
    setOpen(true);
  }

  const header = label(month, { month: 'long', year: 'numeric' });
  const dayName = (day: Date) => label(day, { day: 'numeric', month: 'long', year: 'numeric' });
  const calendar = (
    <View style={styles.calendar}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Poprzedni miesiąc"
          disabled={!!config.min && key(offsetDays(month, -1)) < config.min}
          onPress={() => go(previous)} style={styles.arrow}><Text style={styles.link}>‹</Text></Pressable>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>{header}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Następny miesiąc"
          disabled={!!config.max && key(next) > config.max}
          onPress={() => go(next)} style={styles.arrow}><Text style={styles.link}>›</Text></Pressable>
      </View>
      <View style={styles.week}>
        {Array.from({ length: 7 }, (_, index) => (index + config.firstDay) % 7).map((index) => (
          <Text key={index} style={[styles.cell, styles.weekday]}>{config.locale === 'pl-PL' ? ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'][index]
            : label(offsetDays(new Date('2024-01-07T12:00:00Z'), index), { weekday: 'short' })}</Text>
        ))}
      </View>
      {Array.from({ length: weeks }, (_, row) => <View key={row} style={styles.week}>
        {dates.slice(row * 7, row * 7 + 7).map((date) => {
          const iso = key(date);
          const selected = iso === (config.confirm ? draft : value);
          const adjacent = date.getUTCMonth() !== month.getUTCMonth();
          const disabled = unavailable(iso);
          if (adjacent && !config.adjacent) return <View key={iso} style={styles.cell} />;
          return <Pressable key={iso} accessibilityRole="button" accessibilityLabel={dayName(date)}
            accessibilityHint={events[iso]} accessibilityState={{ selected, disabled }}
            disabled={disabled} onPress={() => select(iso)}
            style={[styles.cell, styles.day, selected && styles.selected, disabled && styles.disabled]}>
            <Text style={[styles.dateText, adjacent && styles.muted, iso === today && styles.today,
              selected && styles.selectedText]}>{date.getUTCDate()}</Text>
            {!!events[iso] && <View style={[styles.dot, selected && styles.selectedDot]} />}
          </Pressable>;
        })}
      </View>)}
    </View>
  );

  if (!config.picker) return calendar;
  const selectedDate = parse(value);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{config.label}</Text>
      {config.typed && <TextInput accessibilityLabel={config.label} value={draft} editable={!config.disabled}
        placeholder={config.placeholder} autoCapitalize="none" maxLength={10} style={styles.input}
        onChangeText={(text) => { setDraft(text); setInvalid(false); }}
        onSubmitEditing={() => {
          if (draft && (!parse(draft) || unavailable(draft))) { setInvalid(true); return; }
          if (parse(draft)) go(monthOf(parse(draft)!));
          commit(draft);
        }} />}
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel={config.triggerOnly ? config.label + ', ' + (value || config.placeholder) : 'Wybierz datę'}
          accessibilityState={{ disabled: config.disabled, expanded: open }} disabled={config.disabled}
          onPress={openCalendar} style={[styles.action, config.triggerOnly && styles.trigger, config.triggerOnly && config.error && styles.invalid]}>
          <Text style={styles.link}>{config.typed ? 'Otwórz kalendarz' : config.triggerOnly ? value || config.placeholder : selectedDate ? label(selectedDate, { day: 'numeric', month: 'numeric', year: 'numeric' }) : config.placeholder}</Text>
        </Pressable>
        {!config.confirm && config.clearable && !!value && !config.disabled &&
          <Pressable accessibilityRole="button" accessibilityLabel="Wyczyść datę"
            onPress={() => commit('')} style={styles.action}><Text style={styles.link}>Wyczyść</Text></Pressable>}
      </View>
      {(invalid || !!config.message) && <Text style={invalid || config.error ? styles.error : styles.muted}>
        {invalid ? 'Wpisz dostępną datę w formacie rrrr-mm-dd.' : config.message}
      </Text>}
      <Modal visible={open} transparent animationType={ios ? 'slide' : 'fade'}
        onRequestClose={() => { setOpen(false); setDraft(value); }}>
        <View style={styles.overlay}>
          <ScrollView style={styles.dialog} accessibilityViewIsModal>
            {calendar}
            <View style={styles.header}>
              {config.confirm && config.clearable &&
                <Pressable accessibilityRole="button" style={styles.action}
                  onPress={() => commit('')}><Text style={styles.link}>Wyczyść</Text></Pressable>}
              <Pressable accessibilityRole="button" style={styles.action}
                onPress={() => { setOpen(false); setDraft(value); }}><Text style={styles.link}>Anuluj</Text></Pressable>
              {config.confirm && <Pressable accessibilityRole="button" style={styles.action}
                disabled={!draft || unavailable(draft)} onPress={() => commit(draft)}>
                <Text style={styles.link}>Zatwierdź</Text>
              </Pressable>}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: { gap: 4, backgroundColor: '#fff', padding: 8, borderRadius: ios ? 16 : 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  title: { fontSize: ios ? 17 : 18, fontWeight: '600', color: '#101317', flexShrink: 1 },
  arrow: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  week: { flexDirection: 'row', gap: 2 },
  cell: { flex: 1, minWidth: 0, textAlign: 'center' },
  weekday: { fontSize: 13, color: '#52575f', paddingVertical: 6 },
  day: { height: ios ? 44 : 48, justifyContent: 'center', alignItems: 'center', borderRadius: 24 },
  dateText: { color: '#101317', fontSize: 16 },
  muted: { color: '#52575f' },
  today: { color: '#0452a8', fontWeight: '700' },
  selected: { backgroundColor: '#0452a8' },
  selectedText: { color: '#fff' },
  disabled: { opacity: 0.45 },
  dot: { width: 4, height: 4, marginTop: 2, borderRadius: 2, backgroundColor: '#0452a8' },
  selectedDot: { backgroundColor: '#fff' },
  link: { color: '#0452a8', fontSize: 16, fontWeight: '600' },
  trigger: { flex: 1, borderWidth: 1, borderColor: '#767c84', borderRadius: ios ? 8 : 4 },
  invalid: { borderColor: '#b31225' },
  label: { color: '#101317', fontSize: 14, fontWeight: '600' },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  field: { gap: 6 },
  input: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#808893',
    paddingHorizontal: 12, color: '#101317', backgroundColor: '#fff' },
  error: { color: '#cd3214' },
  overlay: { flex: 1, justifyContent: 'center', padding: 12, backgroundColor: '#0006' },
  dialog: { flexGrow: 0, flexShrink: 1, backgroundColor: '#fff', borderRadius: ios ? 14 : 24, padding: 8 },
});
`;
}
