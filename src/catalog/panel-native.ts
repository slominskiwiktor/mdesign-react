import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type PanelExample = {
  heading?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  collapsible?: boolean;
  disabled?: boolean;
  padding?: number;
  shadow?: 'none' | 'light200' | 'light600';
};

export function panelNativeSource(example: PanelExample, platform: NativePlatformChoice) {
  const config = {
    title: textOf(example.heading ?? example.title),
    content: textOf(example.children),
    footer: textOf(example.footer),
    action: textOf(example.action),
    collapsible: example.collapsible ?? false,
    open: example.open ?? example.defaultOpen ?? true,
    disabled: example.disabled ?? false,
    padding: example.padding ?? 16,
    shadow: example.shadow ?? 'light200',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const ios = ${ios};

export default function PanelExample({ children, footer, action, onOpenChange, onFooterPress, onActionPress }: {
  children?: ReactNode;
  footer?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  onFooterPress?: () => void;
  onActionPress?: () => void;
  action?: ReactNode;
} = {}) {
  const [open, setOpen] = useState(config.open);
  const showContent = !config.collapsible || open;
  const title = <Text accessibilityRole="header" style={styles.title}>{config.title}</Text>;
  return (
    <View style={[styles.panel, config.shadow !== 'none' && styles.shadow]}>
      {!!config.title && (config.collapsible ? (
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open, disabled: config.disabled }}
          disabled={config.disabled} style={styles.trigger} onPress={() => {
            setOpen(!open);
            onOpenChange?.(!open);
          }}>
          {title}
          <Text accessible={false} importantForAccessibility="no" style={styles.chevron}>{open ? '⌃' : '⌄'}</Text>
        </Pressable>
      ) : <View style={styles.heading}>
        {title}
        {action ?? (!!config.action && (
          <Pressable accessibilityRole="button" disabled={!onActionPress}
            accessibilityState={{ disabled: !onActionPress }} onPress={onActionPress} style={styles.footer}>
            <Text style={styles.action}>{config.action}</Text>
          </Pressable>
        ))}
      </View>)}
      {!config.title && action}
      {showContent && (
        <>
          <View>{children ?? (!!config.content && <Text style={styles.body}>{config.content}</Text>)}</View>
          {footer ?? (!!config.footer && (
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !onFooterPress }}
              disabled={!onFooterPress} onPress={onFooterPress} style={styles.footer}>
              <Text style={styles.action}>{config.footer}</Text>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { minHeight: ios ? 76 : 64, borderRadius: ios ? 16 : 12, padding: config.padding,
    gap: 12, backgroundColor: '#fff' },
  shadow: ios ? {
    shadowColor: '#101317', shadowOffset: { width: 0, height: config.shadow === 'light600' ? 16 : 8 },
    shadowOpacity: 0.04, shadowRadius: config.shadow === 'light600' ? 16 : 8,
  } : { elevation: config.shadow === 'light600' ? 4 : 1 },
  heading: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'space-between' },
  trigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 44 },
  title: { fontSize: ios ? 17 : 18, fontWeight: '600', color: '#101317', flexShrink: 1 },
  chevron: { fontSize: 22, color: '#52575f' },
  body: { fontSize: 16, color: '#101317' },
  footer: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' },
  action: { fontSize: 14, color: '#0452a8', fontWeight: '600' },
});
`;
}
