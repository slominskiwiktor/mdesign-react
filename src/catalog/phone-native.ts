import type { PhoneFieldProps, PhoneValue } from '../kit/mobile/inputs.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

export function phoneNativeSource(args: Partial<PhoneFieldProps>, platform: NativePlatformChoice) {
  const config = {
    label: args.label ?? 'Numer telefonu',
    countryLabel: args.countryCodeLabel ?? 'Kod kraju',
    numberLabel: args.numberLabel ?? 'Numer telefonu',
    initial:
      args.value ?? args.defaultValue ?? ({ countryCode: '+48', number: '' } satisfies PhoneValue),
    countryError: textOf(args.countryCodeError),
    numberError: textOf(args.numberError),
    hint: textOf(args.hint),
    placeholder: args.placeholder ?? '000 000 000',
    disabled: !!args.disabled,
    required: !!args.required,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Phone = { countryCode: string; number: string };
const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({ value, onValueChange }: {
  value?: Phone; onValueChange?: (value: Phone) => void;
}) {
  const [localValue, setLocalValue] = useState(config.initial);
  const numberInput = useRef<ComponentRef<typeof TextInput>>(null);
  const current = value ?? localValue;

  function change(next: Phone) {
    if (config.disabled || (next.countryCode === current.countryCode && next.number === current.number)) return;
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{config.label}{config.required ? ' *' : ''}</Text>
      <View style={styles.row}>
        <TextInput style={[styles.box, styles.country, !!config.countryError && styles.invalid]}
          keyboardType="phone-pad" autoComplete="tel-country-code"
          accessibilityLabel={config.label + ', ' + config.countryLabel}
          accessibilityHint={config.countryError || config.hint || undefined}
          editable={!config.disabled} value={current.countryCode}
          onSubmitEditing={() => numberInput.current?.focus()}
          onChangeText={(text) => change({ ...current, countryCode: '+' + text.replace(/\\D/g, '').slice(0, 4) })}
        />
        <View style={[styles.box, styles.number, !!config.numberError && styles.invalid]}>
          <TextInput ref={numberInput} style={styles.input} keyboardType="phone-pad"
            autoComplete="tel-national" accessibilityLabel={config.label + ', ' + config.numberLabel}
            accessibilityHint={config.numberError || config.hint || undefined}
            editable={!config.disabled} value={current.number} placeholder={config.placeholder}
            onChangeText={(text) => change({ ...current, number: text.replace(/[^\\d\\s()-]/g, '').slice(0, 24) })}
          />
          {!config.disabled && current.number ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Wyczyść numer telefonu"
              style={styles.clear} onPress={() => {
                change({ ...current, number: '' });
                numberInput.current?.focus();
              }}>
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {[config.countryError, config.numberError].filter(Boolean).map((error, index) => (
        <Text key={index} accessibilityRole="alert" style={styles.error}>{error}</Text>
      ))}
      {!config.countryError && !config.numberError && config.hint ? <Text style={styles.hint}>{config.hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { padding: 16, gap: 4 },
  label: { fontSize: 13, color: '#161b22' },
  row: { flexDirection: 'row', gap: 4 },
  box: { minHeight: isIOS ? 56 : 48, borderRadius: isIOS ? 8 : 4, borderWidth: 1,
    borderColor: '#767c84', backgroundColor: '#fff' },
  country: { width: isIOS ? 110 : 76, paddingHorizontal: 8, color: '#161b22', fontSize: 16 },
  number: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, paddingHorizontal: 8, color: '#161b22', fontSize: 16 },
  invalid: { borderColor: '#b31225' },
  clear: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 22, color: '#52575f' },
  hint: { fontSize: 13, color: '#52575f' },
  error: { fontSize: 13, color: '#b31225' },
});
`;
}
