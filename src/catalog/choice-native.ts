import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type ChoiceExample = {
  label?: ReactNode;
  options?: Array<{ value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }>;
  value?: string | string[];
  defaultValue?: string | string[];
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'content-box';
};

export function choiceNativeSource(
  example: ChoiceExample,
  multiple: boolean,
  platform: NativePlatformChoice,
) {
  const single = !example.options;
  const current = example.value ?? example.defaultValue;
  const id = typeof example.value === 'string' ? example.value : 'option';
  const checked = example.checked ?? example.defaultChecked;
  const options = (
    example.options ?? [
      { value: id, label: example.label, description: undefined, disabled: undefined },
    ]
  ).map((option) => ({
    value: option.value,
    label: textOf(option.label),
    description: textOf(option.description),
    disabled: !!(example.disabled || option.disabled),
  }));
  const config = {
    label: textOf(example.label),
    message: textOf(example.error ?? example.hint),
    error: !!example.error,
    initialValue: single
      ? checked === true
        ? [id]
        : []
      : Array.isArray(current)
        ? current
        : current
          ? [current]
          : [],
    mixed: single && example.indeterminate === true && multiple,
    single,
    multiple,
    horizontal: example.orientation === 'horizontal',
    boxed: example.variant === 'content-box',
  };
  const useIos = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const options: { value: string; label: string; description: string; disabled: boolean }[] = ${JSON.stringify(options, null, 2)};
const ios = ${useIos};

export default function ChoiceExample({ onValueChange, onCheckedChange }: {
  onValueChange?: (value: string | string[]) => void;
  onCheckedChange?: (checked: boolean) => void;
} = {}) {
  const [selected, setSelected] = useState<string[]>(config.initialValue);
  const [mixed, setMixed] = useState(config.mixed);

  function choose(value: string) {
    if (!config.multiple && selected.includes(value)) return;
    const next = config.multiple
      ? selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
      : [value];
    setSelected(next);
    setMixed(false);
    if (config.single) onCheckedChange?.(next.includes(value));
    onValueChange?.(config.multiple ? next : value);
  }

  return (
    <View style={[styles.group, config.boxed && styles.box]}>
      {!config.single && !!config.label && <Text style={styles.heading}>{config.label}</Text>}
      <View accessibilityRole={config.multiple || config.single ? undefined : 'radiogroup'}
        accessibilityLabel={config.single ? undefined : config.label}
        style={[styles.options, config.horizontal && styles.horizontal]}>
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <Pressable key={option.value} accessibilityRole={config.multiple ? 'checkbox' : 'radio'}
              accessibilityLabel={option.label} accessibilityHint={option.description || undefined}
              accessibilityState={{ checked: mixed ? 'mixed' : checked, disabled: option.disabled }}
              disabled={option.disabled} style={[styles.option, option.disabled && styles.disabled]}
              onPress={() => choose(option.value)}>
              <View style={[styles.indicator, !config.multiple && styles.radio,
                (checked || mixed) && styles.selected, config.error && styles.errorBorder,
                config.multiple && (checked || mixed) && (config.error ? styles.errorFill : styles.checkedBox)]}>
                {config.multiple && (checked || mixed) &&
                  <Text accessible={false} importantForAccessibility="no" style={styles.check}>{mixed ? '−' : '✓'}</Text>}
                {!config.multiple && checked && <View style={[styles.dot, config.error && styles.errorFill]} />}
              </View>
              <View style={styles.copy}>
                <Text style={styles.label}>{option.label}</Text>
                {!!option.description && <Text style={styles.hint}>{option.description}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      {!!config.message && <Text style={config.error ? styles.errorText : styles.hint}>{config.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  box: { backgroundColor: '#fff', padding: 16, borderRadius: 16 },
  heading: { fontSize: 16, fontWeight: '600', color: '#101317' },
  options: { gap: ios ? 8 : 4 },
  horizontal: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { flexDirection: 'row', alignItems: 'center', gap: ios ? 16 : 12, minHeight: ios ? 44 : 48 },
  indicator: { width: 20, height: 20, borderRadius: ios ? 4 : 2, borderWidth: 2,
    borderColor: '#808893', alignItems: 'center', justifyContent: 'center' },
  radio: { borderRadius: 10 },
  selected: { borderColor: '#0452a8' },
  checkedBox: { backgroundColor: '#0452a8' },
  check: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0452a8' },
  copy: { flexShrink: 1, gap: 4 },
  label: { color: '#101317', fontSize: 16 },
  hint: { color: '#52575f', fontSize: 13 },
  errorText: { color: '#cd3214', fontSize: 13 },
  errorBorder: { borderColor: '#cd3214' },
  errorFill: { backgroundColor: '#cd3214' },
  disabled: { opacity: 0.5 },
});
`;
}
