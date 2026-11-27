import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = {
  children?: ReactNode;
  required?: boolean;
  value?: string;
  count?: number;
  maxLength?: number;
  mode?: 'used' | 'remaining';
  tone?: 'info' | 'success' | 'warning' | 'danger';
  icon?: boolean;
  live?: 'off' | 'polite' | 'assertive';
};

const palette = {
  info: ['#0452a8', 'i'],
  success: ['#167648', '✓'],
  warning: ['#874100', '!'],
  danger: ['#b31225', '!'],
};

export function fieldCopyNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const counter = name === 'PortalCharacterCounter';
  const error = name === 'FieldError' || name === 'PortalFormMessage';
  const status = name === 'PortalStatusText';
  const [ink, mark] = palette[error ? 'danger' : (args.tone ?? 'info')];
  const config = {
    text: textOf(args.children),
    required: !!args.required,
    counter,
    error,
    label: name === 'PortalFormLabel',
    value: args.value ?? '',
    count: typeof args.count === 'number' && Number.isFinite(args.count) ? args.count : null,
    maxLength:
      typeof args.maxLength === 'number' && Number.isFinite(args.maxLength) ? args.maxLength : 100,
    remaining: args.mode === 'remaining',
    mark: error || (status && args.icon !== false) ? mark : '',
    live: error ? 'assertive' : status ? (args.live ?? 'assertive') : counter ? 'polite' : 'off',
    ink: error || status ? ink : name === 'PortalFormLabel' ? '#161b22' : '#52575f',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { ${platform === 'auto' ? 'Platform, ' : ''}StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};
type Props = { value?: string; count?: number; maxLength?: number; text?: string; nativeID?: string };

export default function Example({ value, count, maxLength = config.maxLength, text = config.text, nativeID }: Props = {}) {
  const used = count ?? (value === undefined ? config.count : null) ?? Array.from(value ?? config.value).length;
  const remaining = maxLength - used;
  const copy = config.counter
    ? config.remaining ? remaining + ' znaków do wykorzystania' : used + ' / ' + maxLength
    : text + (config.label && config.required ? ' *' : '');

  return (
    <View style={styles.row}>
      {config.mark ? <Text accessible={false} accessibilityElementsHidden
        importantForAccessibility="no" style={styles.symbol}>{config.mark}</Text> : null}
      <Text nativeID={nativeID}
        accessibilityRole={config.error ? 'alert' : undefined}
        accessibilityLiveRegion={${JSON.stringify(config.live === 'off' ? 'none' : config.live)}}
        style={[styles.copy, config.label && styles.label, config.counter && remaining < 0 && styles.over]}>
        {copy}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  symbol: { color: config.ink, fontSize: 13, fontWeight: '700' },
  copy: { color: config.ink, fontSize: isIOS ? 13 : 14, flexShrink: 1 },
  label: { color: '#161b22', fontWeight: '600' },
  over: { color: '#b31225' },
});
`;
}
