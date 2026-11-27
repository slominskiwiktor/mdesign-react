import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = {
  children?: ReactNode;
  icon?: ReactNode;
  label?: string;
  'aria-label'?: string;
  variant?: string;
  size?: string;
  loading?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  reversed?: boolean;
  black?: boolean;
};

const glyphs: ReadonlyMap<string, string> = new Map([
  ['plus', '+'],
  ['minus', '−'],
  ['close', '×'],
  ['help', '?'],
  ['chevron-left', '‹'],
  ['chevron-right', '›'],
  ['check', '✓'],
]);

export function buttonNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const iconOnly = name === 'IconButton';
  const icon = iconOnly ? args.children : args.icon;
  const iconName = isValidElement<{ name?: string }>(icon) ? icon.props.name : undefined;
  const variant =
    name === 'MobileTextButton' ? 'text' : (args.variant ?? (iconOnly ? 'default' : 'primary'));
  const config = {
    label: args.label ?? args['aria-label'] ?? (textOf(args.children) || 'Wykonaj akcję'),
    text: iconOnly ? '' : textOf(args.children),
    glyph: (iconName && glyphs.get(iconName)) || textOf(icon) || (iconOnly ? '•' : ''),
    iconOnly,
    variant: variant === 'link' ? 'text' : variant,
    size: args.size ?? (iconOnly ? (variant === 'default' ? 'glyph' : 'lg') : 'md'),
    disabled: args.disabled ?? false,
    loading: args.loading ?? false,
    danger: !!args.destructive || variant === 'danger',
    reversed: !!args.reversed,
    black: !!args.black,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = { loading?: boolean; disabled?: boolean; icon?: ReactNode; onPress?: () => void };

export default function Example({ loading = config.loading, disabled = config.disabled, icon, onPress }: Props) {
  const [activated, setActivated] = useState(false);
  const unavailable = loading || disabled;
  const solid = config.variant === 'primary' || config.variant === 'danger';
  const outlined = config.variant === 'secondary';
  const subtle = config.variant === 'tertiary';
  const tint = config.danger ? '#b31225' : isIOS ? '#165ef8' : '#0452a8';
  const ink = solid || config.reversed ? '#fff' : tint;
  const fill = solid ? config.black && !config.danger ? '#161b22' : tint : subtle ? '#edf3fc' : 'transparent';
  const height = config.size === 'glyph' ? 24 : config.size === 'sm' ? 32 : config.variant === 'text' ? 44 : 48;

  return (
    <View style={[styles.container, config.reversed && styles.reversed]}>
      <Pressable accessibilityRole="button" accessibilityLabel={config.label}
        accessibilityState={{ disabled: unavailable, busy: loading }}
        disabled={unavailable} hitSlop={Math.max(0, (44 - height) / 2)}
        onPress={() => {
          if (unavailable) return;
          if (onPress) onPress();
          else setActivated(true);
        }}
        style={({ pressed }) => [
          styles.button,
          { minHeight: height, backgroundColor: fill, borderColor: ink,
            borderWidth: outlined ? 1 : 0, borderRadius: isIOS ? height / 2 : 8,
            width: config.iconOnly ? height : undefined },
          config.iconOnly && styles.iconButton,
          !config.iconOnly && isIOS && config.size !== 'sm' && solid && styles.fullWidth,
          unavailable && styles.disabled,
          pressed && styles.pressed,
        ]}>
        {loading ? <ActivityIndicator size="small" color={ink} />
          : icon ?? (config.glyph ? <Text accessible={false} style={[styles.glyph, { color: ink }]}>{config.glyph}</Text> : null)}
        {config.text ? <Text style={[styles.label, { color: ink, fontSize: config.size === 'sm' || config.variant === 'text' ? 13 : 16 }]}>{config.text}</Text> : null}
      </Pressable>
      {activated ? <Text accessibilityLiveRegion="polite" style={config.reversed && styles.inverse}>Akcja wykonana</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'flex-start', gap: 8 },
  button: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  fullWidth: { alignSelf: 'stretch' },
  iconButton: { paddingHorizontal: 0, paddingVertical: 0 },
  label: { fontWeight: '600', textAlign: 'center', flexShrink: 1 },
  glyph: { fontSize: 20 },
  pressed: { opacity: 0.76 },
  disabled: { opacity: 0.48 },
  reversed: { backgroundColor: '#162c4c' },
  inverse: { color: '#fff' },
});
`;
}
