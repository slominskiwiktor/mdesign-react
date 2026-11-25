import type { MobileSwitchProps } from '../kit/mobile/inputs.js';
import type { SwitchProps } from '../kit/components.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type SwitchArgs = Partial<SwitchProps & Omit<MobileSwitchProps, 'label'>>;

export function switchNativeSource(args: SwitchArgs, platform: NativePlatformChoice) {
  const config = {
    label: textOf(args.label) || 'Przełącznik',
    hint: textOf(args.hint),
    error: textOf(args.error),
    extra: textOf(args.extra),
    initialChecked: args.checked ?? args.defaultChecked ?? false,
    disabled: args.disabled ?? false,
    standalone: args.standalone ?? false,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}StyleSheet, Switch, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export default function Example({ checked, onCheckedChange }: Props) {
  const [localChecked, setLocalChecked] = useState(config.initialChecked);
  const selected = checked ?? localChecked;

  function change(next: boolean) {
    if (config.disabled || next === selected) return;
    if (checked === undefined) setLocalChecked(next);
    onCheckedChange?.(next);
  }

  return (
    <View style={styles.field}>
      <View style={[styles.row, config.disabled && styles.disabled]}>
        {!config.standalone ? (
          <View style={styles.copy} accessible={false}>
            <Text style={styles.label}>{config.label}</Text>
            {config.hint ? <Text style={styles.hint}>{config.hint}</Text> : null}
            {config.extra ? <Text style={styles.hint}>{config.extra}</Text> : null}
          </View>
        ) : null}
        <Switch
          accessibilityLabel={config.label}
          accessibilityHint={config.error || config.hint || undefined}
          accessibilityState={{ checked: selected, disabled: config.disabled }}
          disabled={config.disabled}
          value={selected}
          onValueChange={change}
          trackColor={{ false: isIOS ? '#e9e9eb' : '#767c84', true: isIOS ? '#165ef8' : '#0452a8' }}
          ios_backgroundColor="#e9e9eb"
        />
      </View>
      {config.error ? <Text accessibilityRole="alert" style={styles.error}>{config.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { padding: 16, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  copy: { flex: 1, gap: 4 },
  label: { fontSize: isIOS ? 13 : 16, color: isIOS ? '#52575f' : '#161b22' },
  hint: { fontSize: 13, color: '#52575f' },
  error: { fontSize: 13, color: '#b31225' },
  disabled: { opacity: 0.6 },
});
`;
}
