import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import type { MobileTopAppBarProps } from '../kit/mobile/content.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = Omit<Partial<MobileTopAppBarProps>, 'title'> & { title?: ReactNode; brand?: ReactNode };

export function headerNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const mobile = name === 'MobileTopAppBar';
  const actions = Children.toArray(args.actions)
    .map((node) => {
      const props = isValidElement<{ label?: string; 'aria-label'?: string; disabled?: boolean }>(
        node,
      )
        ? node.props
        : undefined;
      return {
        label: props?.['aria-label'] ?? props?.label ?? textOf(node),
        disabled: !!props?.disabled,
      };
    })
    .filter(({ label }) => label);
  const config = {
    brand: textOf(args.brand),
    title: textOf(args.title),
    leading: textOf(args.leading),
    logo: textOf(args.logo),
    progress: textOf(args.progress),
    variant: args.variant ?? 'default',
    back: mobile && !!args.onBack,
    backLabel: args.backLabel ?? 'Wróć',
    size: args.size ?? 'small',
    alignment: args.alignment ?? (mobile ? 'center' : 'start'),
    fraction: args.collapseFraction ?? 0,
    collapsed: args.collapsed ?? null,
    actions,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  brand?: ReactNode;
  leading?: ReactNode;
  logo?: ReactNode;
  actions?: ReactNode;
  progress?: ReactNode;
  collapsed?: boolean;
  collapseFraction?: number;
  onBack?: () => void;
  onAction?: (label: string) => void;
};

export default function Example({
  brand, leading, logo, actions, progress, collapsed,
  collapseFraction = config.fraction, onBack, onAction,
}: Props = {}) {
  const [feedback, setFeedback] = useState('');
  const compact = collapsed ?? config.collapsed ?? collapseFraction > 0.75;
  const large = config.variant === 'default' && config.size !== 'small' && !compact;
  const heading = (style: 'smallTitle' | 'largeTitle') => (
    <Text accessibilityRole="header" style={[styles[style], style === 'largeTitle' && config.size === 'medium' && styles.mediumTitle]}>
      {config.title}
    </Text>
  );

  return (
    <View style={styles.header}>
      <View style={styles.line}>
        <View style={styles.side}>
          {config.variant === 'sygnet' ? logo ?? leading ?? <Text>{config.logo || config.leading}</Text>
            : config.back || onBack ? (
              <Pressable accessibilityRole="button" accessibilityLabel={config.backLabel}
                style={styles.control} onPress={() => onBack ? onBack() : setFeedback(config.backLabel)}>
                <Text style={styles.link}>‹ {config.backLabel}</Text>
              </Pressable>
            ) : leading ?? (config.leading ? <Text>{config.leading}</Text> : null)}
          {brand ?? (config.brand ? <Text style={styles.brand}>{config.brand}</Text> : null)}
        </View>
        <View style={[styles.center, config.alignment === 'start' && styles.start]}>
          {config.variant === 'logo' ? logo ?? <Text style={styles.brand}>{config.logo || config.title}</Text>
            : config.variant === 'sygnet' ? null : !large && config.title ? heading('smallTitle') : null}
        </View>
        <View style={[styles.side, styles.end]}>
          {actions ?? config.actions.map(({ label, disabled }, index) => (
            <Pressable key={index} accessibilityRole="button" accessibilityLabel={label}
              accessibilityState={{ disabled }} disabled={disabled}
              style={[styles.control, disabled && styles.disabled]}
              onPress={() => onAction ? onAction(label) : setFeedback(label)}>
              <Text style={styles.link}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {large && collapseFraction < 0.35 && config.title ? heading('largeTitle') : null}
      {progress ?? (config.progress ? <Text>{config.progress}</Text> : null)}
      {feedback ? <Text accessibilityLiveRegion="polite">{feedback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, backgroundColor: '#fff' },
  line: { minHeight: isIOS ? 44 : 56, flexDirection: 'row', alignItems: 'center', gap: 8 },
  side: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  center: { flex: 1, alignItems: 'center' },
  start: { alignItems: 'flex-start' },
  end: { justifyContent: 'flex-end' },
  control: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 15, fontWeight: '600', color: '#161b22' },
  smallTitle: { fontSize: isIOS ? 17 : 20, color: '#161b22', fontWeight: '600' },
  largeTitle: { fontSize: isIOS ? 34 : 30, color: '#161b22', fontWeight: '700', paddingTop: 16, paddingBottom: 8 },
  mediumTitle: { fontSize: 28 },
  link: { color: isIOS ? '#165ef8' : '#0452a8', fontWeight: '600' },
  disabled: { opacity: 0.55 },
});
`;
}
