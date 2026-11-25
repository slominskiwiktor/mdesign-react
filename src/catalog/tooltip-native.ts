import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = { children?: ReactNode; content?: ReactNode; label?: string; open?: boolean };

export function tooltipNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const infoTip = name === 'PortalInfoTip';
  const trigger = isValidElement<{ 'aria-label'?: string; label?: string; disabled?: boolean }>(
    args.children,
  )
    ? args.children.props
    : undefined;
  const text = infoTip ? '' : textOf(args.children);
  const config = {
    label: args.label ?? trigger?.['aria-label'] ?? trigger?.label ?? (text || 'Więcej informacji'),
    text,
    message: textOf(infoTip ? args.children : args.content),
    disabled: !!trigger?.disabled,
    initialOpen: !!args.open,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  content?: ReactNode;
};

export default function Example({ open, onOpenChange, children, content }: Props) {
  const [localOpen, setLocalOpen] = useState(config.initialOpen);
  const expanded = open ?? localOpen;

  function toggle() {
    if (config.disabled) return;
    if (open === undefined) setLocalOpen(!expanded);
    onOpenChange?.(!expanded);
  }

  return (
    <View style={styles.group}>
      <Pressable accessibilityRole="button" accessibilityLabel={config.label}
        accessibilityState={{ expanded, disabled: config.disabled }} disabled={config.disabled}
        style={[styles.trigger, config.disabled && styles.disabled]} onPress={toggle}>
        {children ?? <Text style={config.text ? styles.label : styles.icon}>{config.text || 'ⓘ'}</Text>}
      </Pressable>
      {expanded ? (
        <View style={styles.tip}>
          {content ?? (
            <Text accessibilityLiveRegion="polite" style={styles.copy}>{config.message}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { padding: 16, alignItems: 'flex-start', gap: isIOS ? 2 : 8 },
  trigger: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  label: { color: isIOS ? '#165ef8' : '#0452a8', fontWeight: '600' },
  icon: { color: isIOS ? '#165ef8' : '#0452a8', fontSize: 24 },
  disabled: { opacity: 0.55 },
  tip: { alignSelf: 'stretch', padding: isIOS ? 0 : 12, borderRadius: isIOS ? 0 : 8,
    backgroundColor: isIOS ? 'transparent' : '#323232' },
  copy: { color: isIOS ? '#52575f' : '#fff', fontSize: isIOS ? 12 : 14 },
});
`;
}
