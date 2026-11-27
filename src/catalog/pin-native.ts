import type { PinInputProps } from '../kit/mobile/inputs.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

export function pinNativeSource(args: Partial<PinInputProps>, platform: NativePlatformChoice) {
  const length = Math.max(1, Math.min(12, Math.floor(args.length ?? 4) || 4));
  const config = {
    label: args.label ?? 'Wpisz kod PIN',
    length,
    initialValue: (args.value ?? args.defaultValue ?? '').replace(/\D/g, '').slice(0, length),
    masked: args.masked ?? true,
    disabled: args.disabled ?? false,
    readOnly: args.readOnly ?? false,
    error: textOf(args.error),
    hint: textOf(args.hint),
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  value?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
};

export default function Example({ value, onValueChange, onComplete }: Props) {
  const [localValue, setLocalValue] = useState(config.initialValue);
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(0);
  const clean = (text: string) => text.replace(/\\D/g, '').slice(0, config.length);
  const digits = clean(value ?? localValue);

  function update(text: string) {
    const next = clean(text);
    if (next === digits) return;
    if (value === undefined) setLocalValue(next);
    setCursor(next.length);
    onValueChange?.(next);
    if (next.length === config.length) onComplete?.(next);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{config.label}</Text>
      <ScrollView horizontal keyboardShouldPersistTaps="handled">
        <View style={styles.row}>
          {Array.from({ length: config.length }, (_, index) => {
            const active = focused && index === Math.min(cursor, config.length - 1);
            return (
              <View key={index} accessible={false} accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.cell, active && styles.focused, !!config.error && styles.invalid]}>
                {digits[index]
                  ? config.masked ? <View style={styles.dot} /> : <Text style={styles.label}>{digits[index]}</Text>
                  : null}
              </View>
            );
          })}
          <TextInput
            accessibilityLabel={config.label}
            accessibilityHint={config.error || config.hint || undefined}
            accessibilityState={{ disabled: config.disabled }}
            value={digits}
            onChangeText={update}
            onFocus={() => { setFocused(true); setCursor(digits.length); }}
            onBlur={() => setFocused(false)}
            onSelectionChange={(event) => setCursor(event.nativeEvent.selection.start)}
            editable={!config.disabled && !config.readOnly}
            keyboardType="number-pad"
            autoComplete={isIOS ? 'one-time-code' : 'sms-otp'}
            secureTextEntry={config.masked}
            caretHidden
            style={styles.input}
          />
        </View>
      </ScrollView>
      {config.error ? <Text accessibilityRole="alert" style={styles.error}>{config.error}</Text>
        : config.hint ? <Text style={styles.hint}>{config.hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { padding: 16, gap: 8 },
  label: { color: '#161b22', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', gap: isIOS ? 12 : 8, padding: 2 },
  cell: {
    width: 40, height: 48, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#767c84', borderRadius: isIOS ? 4 : 8,
  },
  focused: { borderWidth: 2, borderColor: '#0052a5' },
  invalid: { borderColor: '#b31225' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#161b22' },
  input: { ...StyleSheet.absoluteFill, color: 'transparent', backgroundColor: 'transparent', padding: 0 },
  hint: { color: '#52575f' },
  error: { color: '#b31225' },
});
`;
}
