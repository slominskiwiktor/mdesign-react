import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import type { Tone } from '../kit/components.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = {
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  bottom?: ReactNode;
  trailing?: ReactNode;
  tone?: Tone;
  closable?: boolean;
  iconColor?: string;
  iconBackground?: string;
};

const tones: Record<Tone, [string, string, string]> = {
  neutral: ['#52575f', '#f0f2f5', 'i'],
  info: ['#0452a8', '#e8f2ff', 'i'],
  success: ['#167648', '#e6f5ed', '✓'],
  warning: ['#874100', '#fff2d9', '!'],
  danger: ['#b31225', '#fbe9ec', '!'],
};

export function messageNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const tone = args.tone ?? 'info';
  const [ink, surface, symbol] = tones[tone];
  const action = isValidElement<{ label?: string; 'aria-label'?: string; disabled?: boolean }>(
    args.action,
  )
    ? args.action.props
    : undefined;
  const config = {
    title: textOf(args.title),
    body: textOf(args.children),
    bottom: textOf(args.bottom),
    trailing: textOf(args.trailing),
    action: action?.['aria-label'] ?? action?.label ?? textOf(args.action),
    disabled: !!action?.disabled,
    closable: name === 'PortalMessage' && !!args.closable,
    urgent: tone === 'danger',
    announcement: name === 'MobileAnnouncement',
    ink: args.iconColor ?? ink,
    iconBackground: args.iconBackground ?? surface,
    surface,
    symbol,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  icon?: ReactNode;
  children?: ReactNode;
  trailing?: ReactNode;
  bottom?: ReactNode;
  onAction?: () => void;
  onClose?: () => void;
};

export default function Example({ icon, children, trailing, bottom, onAction, onClose }: Props = {}) {
  const [visible, setVisible] = useState(true);
  const [activated, setActivated] = useState(false);
  if (!visible) return null;
  function renderCopy(content: ReactNode) {
    return typeof content === 'string' || typeof content === 'number'
      ? content === '' ? null : <Text style={styles.body}>{content}</Text>
      : content;
  }

  return (
    <View style={[styles.message, config.announcement && styles.announcement]}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={[styles.icon, config.announcement && styles.iconSurface]}>
        {icon ?? <Text style={styles.symbol}>{config.symbol}</Text>}
      </View>
      <View style={styles.copy}>
        <View accessibilityRole={config.urgent ? 'alert' : undefined}
          accessibilityLiveRegion={config.urgent ? 'assertive' : 'polite'}>
          {config.title ? <Text style={styles.title}>{config.title}</Text> : null}
          {renderCopy(children ?? config.body)}
        </View>
        {renderCopy(bottom ?? config.bottom)}
        {config.action ? (
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: config.disabled }}
            disabled={config.disabled} style={styles.action} onPress={() => {
              if (config.disabled) return;
              if (onAction) onAction();
              else setActivated(true);
            }}>
            <Text style={[styles.link, config.disabled && styles.disabled]}>{config.action}</Text>
          </Pressable>
        ) : null}
        {activated ? <Text accessibilityLiveRegion="polite">Akcja wykonana</Text> : null}
      </View>
      {renderCopy(trailing ?? config.trailing)}
      {config.closable ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Zamknij komunikat"
          style={styles.close} onPress={() => { setVisible(false); onClose?.(); }}>
          <Text style={styles.symbol}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  message: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 16,
    borderRadius: isIOS ? 16 : 12, backgroundColor: config.surface },
  announcement: { backgroundColor: '#fff' },
  icon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  iconSurface: { width: 48, height: 48, borderRadius: 24, backgroundColor: config.iconBackground },
  symbol: { color: config.ink, fontSize: 20, fontWeight: '700' },
  copy: { flex: 1, gap: 4 },
  title: { color: '#161b22', fontSize: isIOS ? 17 : 16, fontWeight: '600', marginBottom: 2 },
  body: { color: '#161b22', fontSize: isIOS ? 13 : 14, lineHeight: isIOS ? 18 : 20 },
  action: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  link: { color: config.ink, fontWeight: '600' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.55 },
});
`;
}
