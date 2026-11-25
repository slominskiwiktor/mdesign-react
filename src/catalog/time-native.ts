import type { MobileTimePickerProps } from '../kit/mobile/date-picker.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

export function timeNativeSource(
  args: Partial<MobileTimePickerProps>,
  platform: NativePlatformChoice,
) {
  const config = {
    label: args.label ?? 'Wybierz godzinę',
    initialValue: args.value ?? args.defaultValue ?? '',
    hint: textOf(args.hint),
    error: textOf(args.error),
    disabled: args.disabled ?? false,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};
const partIsValid = (text: string, max: number) => /^\\d{1,2}$/.test(text) && Number(text) <= max;

type Props = {
  value?: string;
  onValueChange?: (time: string) => void;
};

export default function Example({ value, onValueChange }: Props) {
  const [localValue, setLocalValue] = useState(config.initialValue);
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const selected = value ?? localValue;
  const valid = partIsValid(hours, 23) && partIsValid(minutes, 59);

  function start() {
    const [h, m] = selected.split(':');
    setHours(partIsValid(h, 23) ? h : '12');
    setMinutes(partIsValid(m ?? '', 59) ? m : '00');
    setOpen(true);
  }

  function confirm() {
    if (!valid || config.disabled) return;
    const next = hours.padStart(2, '0') + ':' + minutes.padStart(2, '0');
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
    setOpen(false);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{config.label}</Text>
      <Pressable accessibilityRole="button"
        accessibilityLabel={config.label + ', ' + (selected || 'nie wybrano godziny')}
        accessibilityState={{ disabled: config.disabled, expanded: open }}
        disabled={config.disabled} onPress={start}
        style={[styles.trigger, !!config.error && styles.invalid, config.disabled && styles.disabled]}>
        <Text style={styles.label}>{selected || 'Wybierz godzinę'}</Text>
      </Pressable>
      {config.error ? <Text accessibilityRole="alert" style={styles.error}>{config.error}</Text>
        : config.hint ? <Text style={styles.hint}>{config.hint}</Text> : null}
      {open ? (
        <Modal transparent animationType={isIOS ? 'slide' : 'fade'}
          onRequestClose={() => setOpen(false)}>
          <KeyboardAvoidingView behavior={isIOS ? "padding" : undefined} style={styles.backdrop}>
            <View accessibilityViewIsModal style={styles.dialog}>
              <Text accessibilityRole="header" style={styles.heading}>Wybierz godzinę</Text>
              <View style={styles.row}>
                <View style={styles.part}>
                  <Text style={styles.label}>Godziny</Text>
                  <TextInput accessibilityLabel="Godziny" keyboardType="number-pad"
                    value={hours} maxLength={2} selectTextOnFocus
                    onChangeText={(text) => setHours(text.replace(/\\D/g, ''))} style={styles.trigger} />
                </View>
                <View style={styles.part}>
                  <Text style={styles.label}>Minuty</Text>
                  <TextInput accessibilityLabel="Minuty" keyboardType="number-pad"
                    value={minutes} maxLength={2} selectTextOnFocus
                    onChangeText={(text) => setMinutes(text.replace(/\\D/g, ''))} style={styles.trigger} />
                </View>
              </View>
              <View style={styles.row}>
                <Pressable accessibilityRole="button" style={styles.action} onPress={() => setOpen(false)}>
                  <Text style={styles.actionLabel}>Anuluj</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityState={{ disabled: !valid }}
                  disabled={!valid} style={[styles.action, !valid && styles.disabled]} onPress={confirm}>
                  <Text style={styles.actionLabel}>Zatwierdź</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { padding: 16, gap: 8 },
  label: { color: '#161b22', fontSize: 16 },
  trigger: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1,
    borderColor: '#767c84', borderRadius: isIOS ? 8 : 4, backgroundColor: '#fff', color: '#161b22' },
  invalid: { borderColor: '#b31225' },
  hint: { color: '#52575f' },
  error: { color: '#b31225' },
  disabled: { opacity: 0.55 },
  backdrop: { flex: 1, backgroundColor: '#0006', justifyContent: isIOS ? 'flex-end' : 'center', padding: 16 },
  dialog: { borderRadius: isIOS ? 16 : 12, padding: 16, backgroundColor: '#fff', gap: 16 },
  heading: { color: '#161b22', fontSize: 20, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  part: { flex: 1, gap: 4 },
  action: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  actionLabel: { color: '#0052a5', fontWeight: '600' },
});
`;
}
