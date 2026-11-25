import type { ReactNode } from 'react';
import type { Tone } from '../kit/components.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = {
  children?: ReactNode;
  label?: string;
  tone?: Tone;
  dot?: boolean;
  variant?: 'default' | 'status' | 'bordered' | 'chip';
  bordered?: boolean;
  count?: number;
  selected?: boolean;
  defaultSelected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
  onSelectedChange?: (selected: boolean) => void;
  onClick?: () => void;
};

const symbols: Record<Tone, [string, string]> = {
  neutral: ['−', '#52575f'],
  success: ['✓', '#167648'],
  warning: ['!', '#874100'],
  danger: ['×', '#b31225'],
  info: ['i', '#0452a8'],
};

export function badgeNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  const platformImport = platform === 'auto' ? 'Platform, ' : '';
  if (name === 'NotificationBadge') {
    const count = Number.isFinite(args.count) ? args.count : null;
    return `import { Text, View, StyleSheet } from 'react-native';

const label = ${JSON.stringify(args.label ?? 'Nowe powiadomienie')};

export default function Example({ count = ${JSON.stringify(count)} }: { count?: number | null }) {
  const total = count !== null && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : null;
  return (
    <View accessible accessibilityLiveRegion="polite"
      accessibilityLabel={total === null ? label : label + ': ' + total}
      style={[styles.badge, total !== null && styles.counter]}>
      {total === null ? null : <Text style={styles.text}>{total > 99 ? '99+' : total}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#b31225', alignSelf: 'flex-start' },
  counter: { width: 'auto', minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
`;
  }

  if (name === 'PortalChip') {
    const config = {
      text: textOf(args.children) || 'Etykieta',
      selected: args.selected ?? args.defaultSelected ?? false,
      selectable: !!(args.selectable || args.onSelectedChange),
      clickable: !!args.onClick,
      dismissible: !!args.onDismiss,
      disabled: !!args.disabled,
      dismissLabel: args.dismissLabel ?? 'Usuń',
    };
    return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platformImport}Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  icon?: ReactNode;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  onPress?: () => void;
  onDismiss?: () => void;
};

export default function Example({ icon, selected, onSelectedChange, onPress, onDismiss }: Props) {
  const [localSelected, setLocalSelected] = useState(config.selected);
  const [visible, setVisible] = useState(true);
  const active = selected ?? localSelected;
  const selectable = config.selectable || !!onSelectedChange;
  const content = <>{icon}<Text style={styles.text}>{config.text}</Text></>;

  if (!visible) return null;
  return (
    <View style={[styles.chip, active && styles.selected, config.disabled && styles.disabled]}>
      {selectable || config.clickable || onPress ? (
        <Pressable accessibilityRole={selectable ? 'togglebutton' : 'button'}
          accessibilityState={{ checked: selectable ? active : undefined, disabled: config.disabled }}
          accessibilityLabel={config.text}
          disabled={config.disabled} style={styles.content} onPress={() => {
            if (config.disabled) return;
            if (selectable) {
              if (selected === undefined) setLocalSelected(!active);
              onSelectedChange?.(!active);
            }
            onPress?.();
          }}>
          {content}
        </Pressable>
      ) : <View style={styles.content}>{content}</View>}
      {config.dismissible || onDismiss ? (
        <Pressable accessibilityRole="button" accessibilityLabel={config.dismissLabel + ': ' + config.text}
          accessibilityState={{ disabled: config.disabled }} disabled={config.disabled}
          style={styles.dismiss} onPress={() => {
            if (config.disabled) return;
            if (onDismiss) onDismiss();
            else setVisible(false);
          }}>
          <Text style={styles.text}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#b9c0ca', borderRadius: 999, backgroundColor: '#fff' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, minHeight: 44 },
  dismiss: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: '#edf3fc', borderColor: isIOS ? '#165ef8' : '#0452a8' },
  disabled: { opacity: 0.55 },
  text: { color: '#161b22', fontSize: isIOS ? 13 : 14, fontWeight: '600' },
});
`;
  }

  const [glyph, tint] = symbols[args.tone ?? 'neutral'];
  const config = {
    text: textOf(args.children),
    dot: !!args.dot,
    bordered: args.variant === 'bordered' || !!args.bordered,
    chip: args.variant === 'chip',
    glyph,
    tint,
  };
  return `import type { ReactNode } from 'react';
import { ${platformImport}StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({ icon }: { icon?: ReactNode }) {
  return (
    <View style={[styles.badge, config.bordered && styles.bordered, config.chip && styles.chip]}>
      <View style={styles.symbol} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {config.dot ? <View style={styles.dot} /> : icon ?? <Text style={styles.glyph}>{config.glyph}</Text>}
      </View>
      <Text style={[styles.text, config.bordered && styles.caption]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 22 },
  symbol: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: config.tint },
  glyph: { color: config.tint, fontWeight: '700', fontSize: 14 },
  text: { color: '#161b22', fontSize: isIOS ? 17 : 14, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '400' },
  bordered: { minHeight: 32, borderWidth: 1, borderColor: '#b9c0ca', borderRadius: 999, paddingHorizontal: 8 },
  chip: { borderRadius: 999, backgroundColor: '#edf3fc', paddingHorizontal: 8 },
});
`;
}
