import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { PortalSelectProps } from '../kit/portal/Forms.js';
import type { NativePlatformChoice } from './native-export.js';

type SelectExample = Pick<
  PortalSelectProps,
  | 'label'
  | 'options'
  | 'value'
  | 'defaultValue'
  | 'multiple'
  | 'disabled'
  | 'readOnly'
  | 'searchable'
  | 'placeholder'
  | 'loading'
  | 'emptyMessage'
  | 'open'
  | 'defaultOpen'
> & { hint?: ReactNode; error?: ReactNode };

export function selectNativeSource(example: SelectExample, platform: NativePlatformChoice) {
  const selection = example.value ?? example.defaultValue;
  const initialValue = Array.isArray(selection) ? selection : selection ? [selection] : [];
  const config = {
    options: example.options.map(({ value, label, description, disabled }) => ({
      value,
      label,
      description: description ?? '',
      disabled: disabled ?? false,
    })),
    initialValue,
    label: example.label,
    multiple: example.multiple ?? false,
    disabled: !!(example.disabled || example.readOnly || example.loading),
    searchable: example.searchable ?? false,
    placeholder: example.placeholder ?? 'Wybierz',
    message: textOf(example.error ?? example.hint),
    error: !!example.error,
    initialOpen: !!(example.open ?? example.defaultOpen),
    emptyMessage: example.emptyMessage ?? 'Brak wyników',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const ios = ${ios};

export default function SelectExample({ onValueChange }: {
  onValueChange?: (value: string | string[]) => void;
} = {}) {
  const [selected, setSelected] = useState<string[]>(config.initialValue);
  const [open, setOpen] = useState(config.initialOpen && !config.disabled);
  const [query, setQuery] = useState('');
  const result = config.options.filter((option) =>
    option.label.toLocaleLowerCase('pl-PL').includes(query.trim().toLocaleLowerCase('pl-PL')));
  const selectedLabels = config.options.filter((option) => selected.includes(option.value))
    .map((option) => option.label).join(', ');

  function close() {
    setOpen(false);
    setQuery('');
  }

  function choose(value: string) {
    const next = config.multiple
      ? selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
      : [value];
    setSelected(next);
    onValueChange?.(config.multiple ? next : value);
    if (!config.multiple) close();
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{config.label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[config.label, selectedLabels || config.placeholder].join(', ')}
        accessibilityState={{ expanded: open, disabled: config.disabled }}
        disabled={config.disabled}
        onPress={() => setOpen(true)}
        style={[styles.trigger, config.error && styles.errorBorder, config.disabled && styles.disabled]}
      >
        <Text style={styles.text}>{selectedLabels || config.placeholder}</Text>
        <Text accessible={false} style={styles.text}>⌄</Text>
      </Pressable>
      {!!config.message && <Text style={config.error && styles.error}>{config.message}</Text>}
      <Modal visible={open} onRequestClose={close} animationType={ios ? 'slide' : 'fade'}
        presentationStyle={ios ? 'pageSheet' : 'fullScreen'}>
        <View style={styles.sheet}>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>{config.label}</Text>
            <Pressable accessibilityRole="button" onPress={close} style={styles.close}>
              <Text style={styles.action}>{config.multiple ? 'Gotowe' : 'Zamknij'}</Text>
            </Pressable>
          </View>
          {config.searchable && <TextInput accessibilityLabel="Filtruj opcje" placeholder="Szukaj"
            value={query} onChangeText={setQuery} style={styles.input} />}
          <ScrollView keyboardShouldPersistTaps="handled">
            {result.length === 0 && <Text style={styles.text}>{config.emptyMessage}</Text>}
            {result.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <Pressable key={option.value} accessibilityRole={config.multiple ? 'checkbox' : 'radio'}
                  accessibilityState={{ checked, disabled: option.disabled }}
                  disabled={option.disabled} onPress={() => choose(option.value)}
                  style={[styles.option, checked && styles.active, option.disabled && styles.disabled]}>
                  <View style={styles.optionCopy}>
                    <Text style={styles.text}>{option.label}</Text>
                    {!!option.description && <Text style={styles.description}>{option.description}</Text>}
                  </View>
                  {checked && <Text accessible={false} style={styles.action}>✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: ios ? 13 : 14, fontWeight: ios ? '400' : '600', color: ios ? '#52575f' : '#101317' },
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    minHeight: 56, paddingHorizontal: 16, borderRadius: ios ? 12 : 4,
    borderWidth: 1, borderColor: '#808893', backgroundColor: '#fff' },
  sheet: { flex: 1, padding: 16, gap: 16, backgroundColor: ios ? '#f4f6fb' : '#fff' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 20, fontWeight: '600', color: '#101317' },
  close: { minHeight: 44, justifyContent: 'center' },
  action: { color: '#0452a8', fontWeight: '600' },
  input: { minHeight: 44, borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#e7eaed', color: '#101317' },
  option: { minHeight: 56, paddingHorizontal: 16, paddingVertical: ios ? 16 : 8, flexDirection: 'row',
    alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#d0d4db' },
  optionCopy: { flex: 1, gap: 4 },
  active: { backgroundColor: '#ddebfb' },
  text: { flexShrink: 1, fontSize: 16, color: '#101317' },
  description: { fontSize: 13, color: '#52575f' },
  disabled: { opacity: 0.5 },
  error: { color: '#cd3214' },
  errorBorder: { borderColor: '#cd3214' },
});
`;
}
