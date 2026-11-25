import type { ReactNode } from 'react';
import { isValidElement } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = {
  title?: ReactNode;
  heading?: ReactNode;
  level?: 1 | 2 | 3;
  description?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  iconColor?: string;
  iconBackground?: string;
};

export function sectionHeadingNativeSource(
  name: string,
  args: Args,
  platform: NativePlatformChoice,
) {
  const action = isValidElement<{ label?: string; 'aria-label'?: string; disabled?: boolean }>(
    args.action,
  )
    ? args.action.props
    : undefined;
  const config = {
    title: textOf(args.heading ?? args.title),
    description: textOf(args.description),
    body: textOf(args.children),
    action: action?.['aria-label'] ?? action?.label ?? textOf(args.action),
    disabled: !!action?.disabled,
    hero: name === 'MobileHeader',
    section: name === 'SectionHeader',
    portal: name === 'PortalPageTitle',
    level: args.level ?? 1,
    icon: !!args.icon,
    ink: args.iconColor ?? '#165ef8',
    background: args.iconBackground ?? '#edf3fc',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = { children?: ReactNode; icon?: ReactNode; action?: ReactNode; onAction?: () => void };

export default function Example({ children, icon, action, onAction }: Props = {}) {
  const [used, setUsed] = useState(false);
  const content = children ?? config.body;
  return (
    <View style={styles.group}>
      {config.hero && (icon || config.icon) ? (
        <View style={styles.icon} accessible={false} importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden>{icon ?? <Text style={styles.symbol}>◈</Text>}</View>
      ) : null}
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text accessibilityRole="header"
            style={[styles.title, config.section && styles.sectionTitle,
              (config.hero || (config.portal && config.level === 1)) && styles.pageTitle,
              config.portal && config.level === 3 && styles.sectionTitle]}>{config.title}</Text>
          {config.description ? <Text style={[styles.description, config.hero && styles.heroCopy]}>{config.description}</Text> : null}
        </View>
        {action ?? (config.action ? (
          <Pressable accessibilityRole="button" accessibilityLabel={config.action}
            accessibilityState={{ disabled: config.disabled }} disabled={config.disabled}
            style={styles.action} onPress={() => {
              if (config.disabled) return;
              if (onAction) onAction();
              else setUsed(true);
            }}>
            <Text style={styles.actionText}>{config.action}</Text>
          </Pressable>
        ) : null)}
      </View>
      {typeof content === 'string' || typeof content === 'number'
        ? (content === '' ? null : <Text style={styles.description}>{content}</Text>) : content}
      {used ? <Text accessibilityLiveRegion="polite">{config.action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copy: { flex: 1, gap: 4 },
  title: { fontSize: isIOS ? 22 : 20, fontWeight: '700', color: '#161b22' },
  sectionTitle: { fontSize: 17, fontWeight: '600' },
  pageTitle: { fontSize: isIOS ? 34 : 30 },
  description: { fontSize: isIOS ? 13 : 14, color: '#52575f' },
  heroCopy: { fontSize: 17 },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center',
    justifyContent: 'center', backgroundColor: config.background },
  symbol: { fontSize: 40, color: config.ink },
  action: { minHeight: 44, minWidth: 44, justifyContent: 'center' },
  actionText: { color: isIOS ? '#165ef8' : '#0452a8', fontSize: 13, fontWeight: '600' },
});
`;
}
