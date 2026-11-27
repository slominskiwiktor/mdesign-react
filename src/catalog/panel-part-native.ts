import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { Button, IconButton } from '../kit/components.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

export function panelPartNativeSource(
  name: string,
  children: ReactNode,
  platform: NativePlatformChoice,
) {
  const header = name.endsWith('Header');
  const footer = name.endsWith('Footer');
  const entries = Children.toArray(children).map((node) => {
    const element = isValidElement<{
      'aria-label'?: string;
      label?: string;
      disabled?: boolean;
      loading?: boolean;
    }>(node)
      ? node
      : undefined;
    const actionable =
      element?.type === 'button' || element?.type === Button || element?.type === IconButton;
    return {
      label: element?.props['aria-label'] ?? element?.props.label ?? textOf(node),
      actionable,
      disabled: !!(element?.props.disabled || element?.props.loading),
    };
  });
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const entries: { label: string; actionable: boolean; disabled: boolean }[] = ${JSON.stringify(entries, null, 2)};
const isIOS = ${ios};
const header = ${header};
const footer = ${footer};

export default function Example({ children, onAction }: {
  children?: ReactNode; onAction?: (index: number, label: string) => void;
} = {}) {
  const [feedback, setFeedback] = useState('');
  const custom = typeof children === 'string' || typeof children === 'number'
    ? <Text accessibilityRole={header ? 'header' : undefined} style={header ? styles.title : styles.copy}>{children}</Text>
    : children;

  return (
    <View style={[styles.part, header && styles.header, footer && styles.footer]}>
      {custom ?? entries.map(({ label, actionable, disabled }, index) => actionable ? (
        <Pressable key={index} accessibilityRole="button" accessibilityLabel={label}
          accessibilityState={{ disabled }} disabled={disabled}
          style={[styles.action, disabled && styles.disabled]} onPress={() => {
            if (disabled) return;
            if (onAction) onAction(index, label);
            else setFeedback(label);
          }}>
          <Text style={styles.actionText}>{label}</Text>
        </Pressable>
      ) : (
        <Text key={index} accessibilityRole={header ? 'header' : undefined}
          style={header ? styles.title : styles.copy}>{label}</Text>
      ))}
      {feedback ? <Text accessibilityLiveRegion="polite" style={styles.copy}>{feedback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  part: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  header: { paddingTop: 16 },
  footer: { alignItems: 'flex-end', paddingBottom: 16 },
  title: { fontSize: isIOS ? 17 : 18, fontWeight: '600', color: '#161b22' },
  copy: { fontSize: isIOS ? 15 : 16, color: '#161b22' },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1,
    borderColor: isIOS ? '#165ef8' : '#0452a8', borderRadius: isIOS ? 22 : 8 },
  actionText: { color: isIOS ? '#165ef8' : '#0452a8', fontWeight: '600' },
  disabled: { opacity: 0.55 },
});
`;
}
